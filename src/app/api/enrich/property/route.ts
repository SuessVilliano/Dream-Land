import { NextResponse } from "next/server";

/**
 * RapidAPI Property Enrichment
 *
 * Fetches property valuations and details from multiple RapidAPI sources:
 * - Zillow (Zestimate, comparable sales)
 * - Realty Mole (property records, tax history)
 * - Rentcast (rental estimates)
 * - US Real Estate (active listings)
 *
 * Env: RAPIDAPI_KEY (set in Vercel dashboard)
 */

const RAPIDAPI_HOST_MAP: Record<string, string> = {
  zillow: "zillow-com1.p.rapidapi.com",
  realty_mole: "realty-mole-property-api.p.rapidapi.com",
  rentcast: "rentcast.p.rapidapi.com",
  us_real_estate: "us-real-estate-listings.p.rapidapi.com",
};

async function fetchZillow(
  address: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch(
    `https://zillow-com1.p.rapidapi.com/property?address=${encodeURIComponent(address)}`,
    {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST_MAP.zillow,
      },
    }
  );
  const data = await res.json();
  return {
    source: "zillow",
    zestimate: data.zestimate ?? null,
    rentZestimate: data.rentZestimate ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    livingArea: data.livingArea ?? null,
    lotSize: data.resoFacts?.lotSize ?? null,
    yearBuilt: data.yearBuilt ?? null,
    propertyType: data.homeType ?? null,
    taxAssessedValue: data.taxAssessedValue ?? null,
    lastSoldPrice: data.lastSoldPrice ?? null,
    lastSoldDate: data.dateSold ?? null,
    comparables: (data.comps || []).slice(0, 5).map(
      (c: Record<string, unknown>) => ({
        address: c.address,
        price: c.price,
        livingArea: c.livingArea,
      })
    ),
  };
}

async function fetchRealtyMole(
  address: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch(
    `https://realty-mole-property-api.p.rapidapi.com/properties?address=${encodeURIComponent(address)}`,
    {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST_MAP.realty_mole,
      },
    }
  );
  const data = await res.json();
  const prop = Array.isArray(data) ? data[0] : data;
  return {
    source: "realty_mole",
    owner: prop?.owner ?? null,
    legalDescription: prop?.legalDescription ?? null,
    taxHistory: (prop?.taxHistory || []).slice(0, 3),
    saleHistory: (prop?.saleHistory || []).slice(0, 3),
    propertyType: prop?.propertyType ?? null,
    squareFootage: prop?.squareFootage ?? null,
    yearBuilt: prop?.yearBuilt ?? null,
    assessedValue: prop?.assessedValue ?? null,
  };
}

async function fetchRentcast(
  address: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch(
    `https://rentcast.p.rapidapi.com/avm/value?address=${encodeURIComponent(address)}`,
    {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST_MAP.rentcast,
      },
    }
  );
  const data = await res.json();
  return {
    source: "rentcast",
    estimatedValue: data.price ?? null,
    priceRangeLow: data.priceRangeLow ?? null,
    priceRangeHigh: data.priceRangeHigh ?? null,
    rentalEstimate: data.rent ?? null,
    rentRangeLow: data.rentRangeLow ?? null,
    rentRangeHigh: data.rentRangeHigh ?? null,
    confidence: data.confidence ?? null,
  };
}

async function fetchListings(
  city: string,
  state: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch(
    `https://us-real-estate-listings.p.rapidapi.com/for-sale?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&limit=10&sort=price_low`,
    {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST_MAP.us_real_estate,
      },
    }
  );
  const data = await res.json();
  return {
    source: "us_real_estate",
    totalResults: data.totalResultCount ?? 0,
    listings: (data.listings || data.results || [])
      .slice(0, 10)
      .map((l: Record<string, unknown>) => ({
        address: l.address,
        price: l.price ?? l.listPrice,
        acres: l.lotSize ?? l.acres,
        propertyType: l.propertyType,
        daysOnMarket: l.daysOnMarket,
      })),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "RAPIDAPI_KEY not configured",
        setup:
          "Add your RapidAPI key to Vercel environment variables. Get one at https://rapidapi.com",
      },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { address, city, state, sources } = body;

  if (!address && !city) {
    return NextResponse.json(
      { error: "Provide 'address' for valuation or 'city'+'state' for listings" },
      { status: 400 }
    );
  }

  // Default: query all sources. Can filter via sources array.
  const requestedSources: string[] = sources || [
    "zillow",
    "realty_mole",
    "rentcast",
    ...(city ? ["us_real_estate"] : []),
  ];

  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  const tasks = requestedSources.map(async (src) => {
    try {
      switch (src) {
        case "zillow":
          if (address) results.zillow = await fetchZillow(address, apiKey);
          break;
        case "realty_mole":
          if (address)
            results.realty_mole = await fetchRealtyMole(address, apiKey);
          break;
        case "rentcast":
          if (address) results.rentcast = await fetchRentcast(address, apiKey);
          break;
        case "us_real_estate":
          if (city && state)
            results.us_real_estate = await fetchListings(city, state, apiKey);
          break;
        default:
          errors[src] = `Unknown source "${src}"`;
      }
    } catch (err) {
      errors[src] = err instanceof Error ? err.message : "Request failed";
    }
  });

  await Promise.all(tasks);

  // Build a merged valuation summary from available sources
  const zData = results.zillow as Record<string, unknown> | undefined;
  const rcData = results.rentcast as Record<string, unknown> | undefined;
  const rmData = results.realty_mole as Record<string, unknown> | undefined;

  const valuationSummary = {
    estimatedValue:
      (zData?.zestimate as number) ??
      (rcData?.estimatedValue as number) ??
      (rmData?.assessedValue as number) ??
      null,
    rentalEstimate:
      (zData?.rentZestimate as number) ??
      (rcData?.rentalEstimate as number) ??
      null,
    confidence: (rcData?.confidence as string) ?? null,
    sourcesUsed: Object.keys(results).length,
  };

  return NextResponse.json({
    provider: "rapidapi",
    query: { address, city, state },
    results,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    valuationSummary,
    enrichedAt: new Date().toISOString(),
  });
}

export async function GET() {
  const configured = !!process.env.RAPIDAPI_KEY;

  return NextResponse.json({
    provider: "rapidapi",
    configured,
    availableSources: Object.keys(RAPIDAPI_HOST_MAP),
    usage: configured
      ? "POST with { address: '123 Main St, Tampa FL' } or { city: 'Tampa', state: 'FL' }"
      : "Set RAPIDAPI_KEY in Vercel env vars. Get a key at https://rapidapi.com",
  });
}
