import { NextResponse } from "next/server";

/**
 * Apify Scheduled Scraping Actors
 *
 * Triggers and retrieves results from Apify actors that scrape:
 * - LandWatch.com (land listings)
 * - LandSearch.com (land listings)
 * - Auction.com (bank-owned / foreclosure)
 * - County GIS portals (parcel + zoning data)
 *
 * Env: APIFY_API_TOKEN (set in Vercel dashboard)
 */

// Actor IDs on the Apify platform (these would be your custom or community actors)
const APIFY_ACTORS: Record<
  string,
  { actorId: string; name: string; description: string }
> = {
  landwatch: {
    actorId: "landscout/landwatch-scraper",
    name: "LandWatch Listings",
    description: "Scrapes land listings from LandWatch.com by state and county",
  },
  landsearch: {
    actorId: "landscout/landsearch-scraper",
    name: "LandSearch Listings",
    description: "Scrapes land listings from LandSearch.com",
  },
  auction_com: {
    actorId: "landscout/auction-com-scraper",
    name: "Auction.com Properties",
    description:
      "Scrapes bank-owned and foreclosure properties from Auction.com",
  },
  county_gis: {
    actorId: "landscout/county-gis-scraper",
    name: "County GIS Data",
    description:
      "Scrapes county GIS portals for zoning and parcel boundary data",
  },
};

const APIFY_BASE = "https://api.apify.com/v2";

async function triggerActor(
  actorId: string,
  input: Record<string, unknown>,
  token: string
): Promise<{ runId: string; status: string }> {
  const res = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Apify returned ${res.status}`);
  }
  return {
    runId: data.data?.id || "unknown",
    status: data.data?.status || "RUNNING",
  };
}

async function getRunResults(
  runId: string,
  token: string
): Promise<{ status: string; items: unknown[] }> {
  // Check run status
  const statusRes = await fetch(
    `${APIFY_BASE}/actor-runs/${runId}?token=${token}`
  );
  const statusData = await statusRes.json();
  const status = statusData.data?.status || "UNKNOWN";

  if (status !== "SUCCEEDED") {
    return { status, items: [] };
  }

  // Fetch dataset items
  const datasetId = statusData.data?.defaultDatasetId;
  if (!datasetId) {
    return { status, items: [] };
  }

  const itemsRes = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&limit=100`
  );
  const items = await itemsRes.json();
  return { status, items: Array.isArray(items) ? items : [] };
}

async function getLastRunResults(
  actorId: string,
  token: string
): Promise<{ status: string; items: unknown[]; finishedAt: string | null }> {
  const res = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs/last?token=${token}&status=SUCCEEDED`
  );
  const data = await res.json();

  if (!data.data?.defaultDatasetId) {
    return { status: "NO_RUNS", items: [], finishedAt: null };
  }

  const datasetId = data.data.defaultDatasetId;
  const itemsRes = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&limit=100`
  );
  const items = await itemsRes.json();

  return {
    status: "SUCCEEDED",
    items: Array.isArray(items) ? items : [],
    finishedAt: data.data.finishedAt || null,
  };
}

export async function POST(request: Request) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error: "APIFY_API_TOKEN not configured",
        setup:
          "Add your Apify API token to Vercel environment variables. Get one at https://apify.com",
      },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { action, actor, runId, input } = body;

  // action: "trigger" | "status" | "results" | "last_results"
  if (!action) {
    return NextResponse.json(
      {
        error:
          "Provide 'action': 'trigger', 'status', 'results', or 'last_results'",
      },
      { status: 400 }
    );
  }

  try {
    switch (action) {
      case "trigger": {
        const actorConfig = APIFY_ACTORS[actor];
        if (!actorConfig) {
          return NextResponse.json(
            {
              error: `Unknown actor "${actor}". Available: ${Object.keys(APIFY_ACTORS).join(", ")}`,
            },
            { status: 400 }
          );
        }

        const defaultInput = buildDefaultInput(actor, input);
        const result = await triggerActor(
          actorConfig.actorId,
          defaultInput,
          token
        );

        return NextResponse.json({
          provider: "apify",
          action: "trigger",
          actor: actorConfig.name,
          ...result,
          message: `Actor started. Use action: "status" with runId: "${result.runId}" to check progress.`,
        });
      }

      case "status": {
        if (!runId) {
          return NextResponse.json(
            { error: "Provide 'runId' to check status" },
            { status: 400 }
          );
        }
        const statusRes = await fetch(
          `${APIFY_BASE}/actor-runs/${runId}?token=${token}`
        );
        const statusData = await statusRes.json();
        return NextResponse.json({
          provider: "apify",
          action: "status",
          runId,
          status: statusData.data?.status,
          startedAt: statusData.data?.startedAt,
          finishedAt: statusData.data?.finishedAt,
          itemCount: statusData.data?.stats?.outputItemCount ?? 0,
        });
      }

      case "results": {
        if (!runId) {
          return NextResponse.json(
            { error: "Provide 'runId' to get results" },
            { status: 400 }
          );
        }
        const resultData = await getRunResults(runId, token);
        return NextResponse.json({
          provider: "apify",
          action: "results",
          runId,
          ...resultData,
          itemCount: resultData.items.length,
        });
      }

      case "last_results": {
        const actorConfig = APIFY_ACTORS[actor];
        if (!actorConfig) {
          return NextResponse.json(
            {
              error: `Unknown actor "${actor}". Available: ${Object.keys(APIFY_ACTORS).join(", ")}`,
            },
            { status: 400 }
          );
        }
        const lastData = await getLastRunResults(
          actorConfig.actorId,
          token
        );
        return NextResponse.json({
          provider: "apify",
          action: "last_results",
          actor: actorConfig.name,
          ...lastData,
          itemCount: lastData.items.length,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action "${action}"` },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        provider: "apify",
        error: error instanceof Error ? error.message : "Request failed",
      },
      { status: 500 }
    );
  }
}

function buildDefaultInput(
  actor: string,
  userInput?: Record<string, unknown>
): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    landwatch: {
      states: ["FL", "GA", "TX", "NC", "TN"],
      maxPrice: 50000,
      propertyTypes: ["land", "farms"],
      maxPages: 5,
    },
    landsearch: {
      states: ["FL", "GA", "TX", "NC", "TN"],
      maxPrice: 50000,
      maxPages: 5,
    },
    auction_com: {
      propertyTypes: ["land", "residential"],
      states: ["FL", "GA", "TX"],
      maxResults: 50,
    },
    county_gis: {
      counties: [
        { state: "FL", county: "Hillsborough" },
        { state: "FL", county: "Pasco" },
        { state: "GA", county: "Fulton" },
      ],
    },
  };

  return { ...defaults[actor], ...userInput };
}

export async function GET() {
  const configured = !!process.env.APIFY_API_TOKEN;

  return NextResponse.json({
    provider: "apify",
    configured,
    actors: Object.entries(APIFY_ACTORS).map(([key, config]) => ({
      id: key,
      name: config.name,
      description: config.description,
    })),
    usage: configured
      ? 'POST with { action: "trigger", actor: "landwatch" } to start a scrape, or { action: "last_results", actor: "landwatch" } to get cached data'
      : "Set APIFY_API_TOKEN in Vercel env vars. Get a token at https://apify.com",
  });
}
