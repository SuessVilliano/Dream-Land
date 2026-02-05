import { NextResponse } from "next/server";
import { DATA_SOURCES, isSourceConfigured } from "@/lib/sources";

/**
 * Unified Data Pipeline Orchestration
 *
 * Coordinates scraping, enrichment, and valuation across all providers.
 * Think of it as "run the whole data engine" in one call.
 *
 * Modes:
 * - status  : Show which sources are configured and their health
 * - scrape  : Trigger Firecrawl + Apify scrapers for new auction/listing data
 * - enrich  : Run RapidAPI valuations on a batch of properties
 * - full    : Scrape → enrich pipeline for a given state/region
 */

interface PipelineStep {
  source: string;
  status: "success" | "error" | "skipped";
  itemCount?: number;
  error?: string;
  durationMs?: number;
}

async function callInternalApi(
  path: string,
  body: Record<string, unknown>,
  baseUrl: string
): Promise<{ ok: boolean; data: Record<string, unknown>; durationMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: res.ok, data, durationMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      data: { error: err instanceof Error ? err.message : "Request failed" },
      durationMs: Date.now() - start,
    };
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { mode, state, addresses } = body;
  const baseUrl = new URL(request.url).origin;

  if (!mode) {
    return NextResponse.json(
      {
        error:
          "Provide 'mode': 'status', 'scrape', 'enrich', or 'full'",
        modes: {
          status: "Check which data sources are configured",
          scrape: "Trigger Firecrawl + Apify scrapers. Optional: { state: 'FL' }",
          enrich:
            "Enrich properties via RapidAPI. Required: { addresses: ['123 Main St, Tampa FL'] }",
          full: "Full pipeline: scrape + enrich. Optional: { state: 'FL' }",
        },
      },
      { status: 400 }
    );
  }

  const steps: PipelineStep[] = [];
  const startTime = Date.now();

  switch (mode) {
    case "status": {
      const sourceStatus = DATA_SOURCES.map((s) => ({
        id: s.id,
        name: s.name,
        provider: s.provider,
        type: s.type,
        configured: isSourceConfigured(s),
        states: s.states,
      }));

      const configured = sourceStatus.filter((s) => s.configured).length;
      const total = sourceStatus.length;

      return NextResponse.json({
        mode: "status",
        sources: sourceStatus,
        summary: {
          total,
          configured,
          unconfigured: total - configured,
          providers: {
            firecrawl: !!process.env.FIRECRAWL_API_KEY,
            rapidapi: !!process.env.RAPIDAPI_KEY,
            apify: !!process.env.APIFY_API_TOKEN,
          },
        },
      });
    }

    case "scrape": {
      // Firecrawl targets based on state filter
      const firecrawlTargets: string[] = [];
      if (!state || state === "FL") {
        firecrawlTargets.push("fl_tax_deed", "fl_foreclosure");
      }
      if (!state || state === "GA") {
        firecrawlTargets.push("ga_tax_sales");
      }
      if (!state || state === "TX") {
        firecrawlTargets.push("tx_tax_sales");
      }

      // Run Firecrawl scrapes
      for (const target of firecrawlTargets) {
        const { ok, data, durationMs } = await callInternalApi(
          "/api/scrape/firecrawl",
          { target },
          baseUrl
        );
        steps.push({
          source: `firecrawl:${target}`,
          status: ok ? "success" : "error",
          itemCount: (data.summary as Record<string, number>)
            ?.totalProperties ?? 0,
          error: ok ? undefined : (data.error as string),
          durationMs,
        });
      }

      // Trigger Apify actors
      const apifyActors = ["landwatch", "landsearch", "auction_com"];
      for (const actor of apifyActors) {
        const input = state ? { states: [state] } : undefined;
        const { ok, data, durationMs } = await callInternalApi(
          "/api/scrape/apify",
          { action: "trigger", actor, input },
          baseUrl
        );
        steps.push({
          source: `apify:${actor}`,
          status: ok ? "success" : "error",
          error: ok ? undefined : (data.error as string),
          durationMs,
        });
      }

      break;
    }

    case "enrich": {
      if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
        return NextResponse.json(
          {
            error:
              "Provide 'addresses' array for enrichment, e.g. ['123 Main St, Tampa FL']",
          },
          { status: 400 }
        );
      }

      // Enrich each address via RapidAPI
      for (const address of addresses.slice(0, 10)) {
        const { ok, data, durationMs } = await callInternalApi(
          "/api/enrich/property",
          { address },
          baseUrl
        );
        steps.push({
          source: `rapidapi:${address}`,
          status: ok ? "success" : "error",
          itemCount: (data.valuationSummary as Record<string, unknown>)
            ?.sourcesUsed as number ?? 0,
          error: ok ? undefined : (data.error as string),
          durationMs,
        });
      }
      break;
    }

    case "full": {
      // Phase 1: Scrape
      const scrapeRes = await callInternalApi(
        "/api/pipeline",
        { mode: "scrape", state },
        baseUrl
      );
      const scrapeSteps = (scrapeRes.data.steps as PipelineStep[]) || [];
      steps.push(...scrapeSteps.map((s) => ({ ...s, source: `[scrape] ${s.source}` })));

      // Phase 2: Enrich provided addresses (or skip if none)
      if (addresses && addresses.length > 0) {
        const enrichRes = await callInternalApi(
          "/api/pipeline",
          { mode: "enrich", addresses },
          baseUrl
        );
        const enrichSteps = (enrichRes.data.steps as PipelineStep[]) || [];
        steps.push(
          ...enrichSteps.map((s) => ({ ...s, source: `[enrich] ${s.source}` }))
        );
      }
      break;
    }

    default:
      return NextResponse.json(
        { error: `Unknown mode "${mode}"` },
        { status: 400 }
      );
  }

  const totalDuration = Date.now() - startTime;

  return NextResponse.json({
    mode,
    steps,
    summary: {
      totalSteps: steps.length,
      successful: steps.filter((s) => s.status === "success").length,
      failed: steps.filter((s) => s.status === "error").length,
      skipped: steps.filter((s) => s.status === "skipped").length,
      totalDurationMs: totalDuration,
    },
    completedAt: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;

  // Quick status check of all providers
  const providers = {
    firecrawl: !!process.env.FIRECRAWL_API_KEY,
    rapidapi: !!process.env.RAPIDAPI_KEY,
    apify: !!process.env.APIFY_API_TOKEN,
  };

  const configuredCount = Object.values(providers).filter(Boolean).length;

  return NextResponse.json({
    pipeline: "LandScout Data Engine",
    baseUrl,
    providers,
    readiness: `${configuredCount}/3 providers configured`,
    sourcesRegistered: DATA_SOURCES.length,
    modes: {
      status: "GET /api/pipeline or POST { mode: 'status' }",
      scrape: "POST { mode: 'scrape', state?: 'FL' }",
      enrich: "POST { mode: 'enrich', addresses: ['...'] }",
      full: "POST { mode: 'full', state?: 'FL', addresses?: ['...'] }",
    },
  });
}
