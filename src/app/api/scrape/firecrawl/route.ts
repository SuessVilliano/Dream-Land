import { NextResponse } from "next/server";

/**
 * Firecrawl Auction Site Scraper
 *
 * Uses Firecrawl to extract structured property data from county
 * auction sites that don't have APIs. Firecrawl handles JavaScript
 * rendering, anti-bot bypass, and returns clean markdown/structured data.
 *
 * Supported targets:
 * - FL RealAuction tax deed sites ({county}.realtaxdeed.com)
 * - FL RealAuction foreclosure sites ({county}.realforeclose.com)
 * - GA county tax sale pages
 * - TX county tax office sale pages
 *
 * Env: FIRECRAWL_API_KEY (set in Vercel dashboard)
 */

const FIRECRAWL_TARGETS: Record<
  string,
  { url: string; state: string; type: string }[]
> = {
  fl_tax_deed: [
    { url: "https://hillsborough.realtaxdeed.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "tax_deed" },
    { url: "https://pasco.realtaxdeed.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "tax_deed" },
    { url: "https://hernando.realtaxdeed.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "tax_deed" },
    { url: "https://polk.realtaxdeed.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "tax_deed" },
    { url: "https://volusia.realtaxdeed.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "tax_deed" },
    { url: "https://marion.realtaxdeed.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "tax_deed" },
  ],
  fl_foreclosure: [
    { url: "https://hillsborough.realforeclose.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "foreclosure" },
    { url: "https://pasco.realforeclose.com/index.cfm?zession=clear&section=auctions", state: "FL", type: "foreclosure" },
  ],
  ga_tax_sales: [
    { url: "https://dekalbtax.org/tax-sale-listing", state: "GA", type: "tax_deed" },
    { url: "https://www.cobbtax.gov/property/tax_sale/", state: "GA", type: "tax_deed" },
  ],
  tx_tax_sales: [
    { url: "https://www.hctax.net/Property/PropertyTaxSale", state: "TX", type: "tax_deed" },
  ],
};

export async function POST(request: Request) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "FIRECRAWL_API_KEY not configured",
        setup:
          "Add your Firecrawl API key to Vercel environment variables. Get one at https://firecrawl.dev",
      },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { target, url: customUrl } = body;

  // Either use a predefined target group or a custom URL
  const urls = customUrl
    ? [{ url: customUrl, state: body.state || "XX", type: body.type || "listing" }]
    : FIRECRAWL_TARGETS[target] || [];

  if (urls.length === 0) {
    return NextResponse.json(
      {
        error: `Unknown target "${target}". Available: ${Object.keys(FIRECRAWL_TARGETS).join(", ")}`,
      },
      { status: 400 }
    );
  }

  const results = [];

  for (const { url, state, type } of urls) {
    try {
      // Firecrawl scrape endpoint
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown", "extract"],
          extract: {
            schema: {
              type: "object",
              properties: {
                auctions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      caseNumber: { type: "string" },
                      address: { type: "string" },
                      parcelId: { type: "string" },
                      openingBid: { type: "string" },
                      auctionDate: { type: "string" },
                      auctionTime: { type: "string" },
                      propertyType: { type: "string" },
                      assessedValue: { type: "string" },
                    },
                  },
                },
              },
            },
            prompt:
              "Extract all auction/sale listings from this page. For each property, get the case number, address, parcel ID, opening bid amount, auction date, auction time, property type, and assessed value.",
          },
          waitFor: 3000, // Wait for JS-rendered content
        }),
      });

      const data = await response.json();

      if (data.success) {
        results.push({
          url,
          state,
          auctionType: type,
          status: "success",
          propertyCount: data.data?.extract?.auctions?.length || 0,
          properties: data.data?.extract?.auctions || [],
          scrapedAt: new Date().toISOString(),
        });
      } else {
        results.push({
          url,
          state,
          auctionType: type,
          status: "error",
          error: data.error || "Unknown error",
        });
      }
    } catch (error) {
      results.push({
        url,
        state,
        auctionType: type,
        status: "error",
        error: error instanceof Error ? error.message : "Fetch failed",
      });
    }
  }

  const totalProperties = results.reduce(
    (sum, r) => sum + (r.propertyCount || 0),
    0
  );

  return NextResponse.json({
    provider: "firecrawl",
    target: target || "custom",
    results,
    summary: {
      totalUrls: urls.length,
      successful: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "error").length,
      totalProperties,
    },
  });
}

export async function GET() {
  const configured = !!process.env.FIRECRAWL_API_KEY;

  return NextResponse.json({
    provider: "firecrawl",
    configured,
    targets: Object.entries(FIRECRAWL_TARGETS).map(([key, urls]) => ({
      id: key,
      urlCount: urls.length,
      states: [...new Set(urls.map((u) => u.state))],
      types: [...new Set(urls.map((u) => u.type))],
    })),
    usage: configured
      ? "POST with { target: 'fl_tax_deed' } or { url: 'https://...', state: 'FL', type: 'tax_deed' }"
      : "Set FIRECRAWL_API_KEY in Vercel env vars. Get a key at https://firecrawl.dev",
  });
}
