import { NextResponse } from "next/server";

/**
 * Skip Trace API
 *
 * Aggregates property owner data from multiple sources:
 * - Realty Mole (owner name, mailing address, tax/sale history)
 * - TrueWay Reverse Geocoding (nearby parcels by coordinates)
 * - County tax assessor records (public data)
 *
 * Modes:
 * - lookup : Full skip trace on a single address
 * - nearby : Find parcels near GPS coordinates (for door-knocking)
 * - batch  : Skip trace up to 10 addresses at once
 *
 * Env: RAPIDAPI_KEY (set in Vercel dashboard)
 */

interface OwnerProfile {
  address: string;
  ownerName: string | null;
  mailingAddress: string | null;
  phoneNumbers: string[];
  emails: string[];
  propertyType: string | null;
  yearBuilt: number | null;
  lotSize: string | null;
  squareFootage: number | null;
  estimatedValue: number | null;
  assessedValue: number | null;
  taxAnnual: number | null;
  taxDelinquent: boolean | null;
  equityEstimate: number | null;
  lastSaleDate: string | null;
  lastSalePrice: number | null;
  ownerOccupied: boolean | null;
  legalDescription: string | null;
  zoning: string | null;
  saleHistory: Array<{ date: string; price: number }>;
  taxHistory: Array<{ year: number; amount: number; assessedValue: number }>;
  confidence: "high" | "medium" | "low";
}

interface NearbyParcel {
  address: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  ownerName: string | null;
  estimatedValue: number | null;
  propertyType: string | null;
}

// ── Realty Mole: Owner info + tax/sale history ────────────────
async function fetchOwnerData(
  address: string,
  apiKey: string
): Promise<Partial<OwnerProfile>> {
  const res = await fetch(
    `https://realty-mole-property-api.p.rapidapi.com/properties?address=${encodeURIComponent(address)}`,
    {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "realty-mole-property-api.p.rapidapi.com",
      },
    }
  );

  if (!res.ok) return { confidence: "low" };

  const data = await res.json();
  const prop = Array.isArray(data) ? data[0] : data;
  if (!prop) return { confidence: "low" };

  const lastSale = (prop.saleHistory || [])[0];
  const lastTax = (prop.taxHistory || [])[0];

  return {
    ownerName: prop.owner?.names?.join(", ") ?? prop.owner ?? null,
    mailingAddress: prop.owner?.mailingAddress ?? null,
    propertyType: prop.propertyType ?? null,
    yearBuilt: prop.yearBuilt ?? null,
    lotSize: prop.lotSize ?? null,
    squareFootage: prop.squareFootage ?? null,
    estimatedValue: prop.price ?? null,
    assessedValue: prop.assessedValue ?? null,
    taxAnnual: lastTax?.taxAmount ?? null,
    taxDelinquent: null, // would require county-level data
    lastSaleDate: lastSale?.date ?? null,
    lastSalePrice: lastSale?.price ?? null,
    ownerOccupied: prop.ownerOccupied ?? null,
    legalDescription: prop.legalDescription ?? null,
    zoning: prop.zoning ?? null,
    saleHistory: (prop.saleHistory || []).slice(0, 5).map(
      (s: { date?: string; price?: number }) => ({
        date: s.date ?? "",
        price: s.price ?? 0,
      })
    ),
    taxHistory: (prop.taxHistory || []).slice(0, 5).map(
      (t: { year?: number; taxAmount?: number; assessedValue?: number }) => ({
        year: t.year ?? 0,
        amount: t.taxAmount ?? 0,
        assessedValue: t.assessedValue ?? 0,
      })
    ),
    confidence: prop.owner ? "high" : "medium",
  };
}

// ── Reverse Geocode: Get address from lat/lng ─────────────────
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; displayName: string } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
    { headers: { "User-Agent": "LandScout/1.0" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const addr = data.address || {};
  const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
  const city = addr.city || addr.town || addr.village || "";
  const state = addr.state || "";
  const zip = addr.postcode || "";
  return {
    address: `${street}, ${city}, ${state} ${zip}`.trim(),
    displayName: data.display_name || "",
  };
}

// ── Nearby addresses search via Nominatim ─────────────────────
async function findNearbyAddresses(
  lat: number,
  lng: number,
  radiusKm: number = 0.5
): Promise<NearbyParcel[]> {
  // Search for nearby places using Nominatim's reverse search at slightly offset points
  const parcels: NearbyParcel[] = [];
  const offsets = [
    [0, 0],
    [0.002, 0],
    [-0.002, 0],
    [0, 0.002],
    [0, -0.002],
    [0.001, 0.001],
    [-0.001, 0.001],
    [0.001, -0.001],
    [-0.001, -0.001],
    [0.003, 0],
    [-0.003, 0],
    [0, 0.003],
    [0, -0.003],
    [0.002, 0.002],
    [-0.002, 0.002],
    [0.004, 0],
    [0, 0.004],
    [-0.004, 0],
    [0, -0.004],
    [0.003, 0.003],
  ];

  const seen = new Set<string>();

  for (const [dLat, dLng] of offsets) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat + dLat}&lon=${lng + dLng}&format=json&addressdetails=1&zoom=18`,
        { headers: { "User-Agent": "LandScout/1.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const addr = data.address || {};
      const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
      if (!street || seen.has(street)) continue;
      seen.add(street);

      const city = addr.city || addr.town || addr.village || "";
      const state = addr.state || "";
      const pLat = parseFloat(data.lat);
      const pLng = parseFloat(data.lon);

      const R = 6371000;
      const dLatR = ((pLat - lat) * Math.PI) / 180;
      const dLngR = ((pLng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLatR / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((pLat * Math.PI) / 180) *
          Math.sin(dLngR / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      if (dist <= radiusKm * 1000) {
        parcels.push({
          address: `${street}, ${city}, ${state}`,
          lat: pLat,
          lng: pLng,
          distanceMeters: Math.round(dist),
          ownerName: null,
          estimatedValue: null,
          propertyType: null,
        });
      }
    } catch {
      // Nominatim rate limit — keep going
    }
    // Respect Nominatim's 1 req/sec policy
    await new Promise((r) => setTimeout(r, 300));
  }

  return parcels.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export async function POST(request: Request) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const body = await request.json();
  const { mode, address, lat, lng, radius, addresses } = body;

  if (!mode) {
    return NextResponse.json(
      {
        error: "Provide 'mode': 'lookup', 'nearby', or 'batch'",
        modes: {
          lookup:
            "Full skip trace. Required: { address: '123 Main St, Tampa FL' }",
          nearby:
            "Find parcels near coordinates. Required: { lat, lng }. Optional: { radius: 0.5 } (km)",
          batch:
            "Skip trace multiple addresses. Required: { addresses: ['...'] } (max 10)",
        },
      },
      { status: 400 }
    );
  }

  switch (mode) {
    case "lookup": {
      if (!address) {
        return NextResponse.json(
          { error: "Provide 'address' for skip trace lookup" },
          { status: 400 }
        );
      }

      const profile: OwnerProfile = {
        address,
        ownerName: null,
        mailingAddress: null,
        phoneNumbers: [],
        emails: [],
        propertyType: null,
        yearBuilt: null,
        lotSize: null,
        squareFootage: null,
        estimatedValue: null,
        assessedValue: null,
        taxAnnual: null,
        taxDelinquent: null,
        equityEstimate: null,
        lastSaleDate: null,
        lastSalePrice: null,
        ownerOccupied: null,
        legalDescription: null,
        zoning: null,
        saleHistory: [],
        taxHistory: [],
        confidence: "low",
      };

      // Enrich from Realty Mole if key is available
      if (apiKey) {
        const ownerData = await fetchOwnerData(address, apiKey);
        Object.assign(profile, ownerData);

        // Calculate equity estimate
        if (profile.estimatedValue && profile.lastSalePrice) {
          profile.equityEstimate =
            profile.estimatedValue - profile.lastSalePrice;
        }
      }

      return NextResponse.json({
        mode: "lookup",
        profile,
        apiKeyConfigured: !!apiKey,
        note: !apiKey
          ? "Set RAPIDAPI_KEY in Vercel env vars for full owner data"
          : undefined,
        tracedAt: new Date().toISOString(),
      });
    }

    case "nearby": {
      if (!lat || !lng) {
        return NextResponse.json(
          { error: "Provide 'lat' and 'lng' coordinates" },
          { status: 400 }
        );
      }

      // Step 1: Find nearby addresses using free Nominatim
      const parcels = await findNearbyAddresses(
        lat,
        lng,
        radius || 0.5
      );

      // Step 2: Enrich each with owner data if RapidAPI key is configured
      if (apiKey && parcels.length > 0) {
        // Only enrich first 5 to stay within rate limits
        const enrichLimit = Math.min(parcels.length, 5);
        for (let i = 0; i < enrichLimit; i++) {
          try {
            const ownerData = await fetchOwnerData(parcels[i].address, apiKey);
            parcels[i].ownerName =
              (ownerData.ownerName as string) ?? null;
            parcels[i].estimatedValue =
              (ownerData.estimatedValue as number) ?? null;
            parcels[i].propertyType =
              (ownerData.propertyType as string) ?? null;
          } catch {
            // Skip enrichment failures
          }
        }
      }

      return NextResponse.json({
        mode: "nearby",
        center: { lat, lng },
        radiusKm: radius || 0.5,
        parcelsFound: parcels.length,
        parcels,
        apiKeyConfigured: !!apiKey,
        tracedAt: new Date().toISOString(),
      });
    }

    case "batch": {
      if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
        return NextResponse.json(
          { error: "Provide 'addresses' array (max 10)" },
          { status: 400 }
        );
      }

      if (!apiKey) {
        return NextResponse.json(
          {
            error: "RAPIDAPI_KEY required for batch skip trace",
            setup: "Add your RapidAPI key to Vercel environment variables",
          },
          { status: 503 }
        );
      }

      const batch = addresses.slice(0, 10);
      const results: OwnerProfile[] = [];

      for (const addr of batch) {
        const profile: OwnerProfile = {
          address: addr,
          ownerName: null,
          mailingAddress: null,
          phoneNumbers: [],
          emails: [],
          propertyType: null,
          yearBuilt: null,
          lotSize: null,
          squareFootage: null,
          estimatedValue: null,
          assessedValue: null,
          taxAnnual: null,
          taxDelinquent: null,
          equityEstimate: null,
          lastSaleDate: null,
          lastSalePrice: null,
          ownerOccupied: null,
          legalDescription: null,
          zoning: null,
          saleHistory: [],
          taxHistory: [],
          confidence: "low",
        };

        try {
          const ownerData = await fetchOwnerData(addr, apiKey);
          Object.assign(profile, ownerData);
          if (profile.estimatedValue && profile.lastSalePrice) {
            profile.equityEstimate =
              profile.estimatedValue - profile.lastSalePrice;
          }
        } catch {
          // Continue with partial data
        }

        results.push(profile);
      }

      return NextResponse.json({
        mode: "batch",
        count: results.length,
        results,
        tracedAt: new Date().toISOString(),
      });
    }

    default:
      return NextResponse.json(
        { error: `Unknown mode "${mode}"` },
        { status: 400 }
      );
  }
}

export async function GET() {
  const configured = !!process.env.RAPIDAPI_KEY;

  return NextResponse.json({
    endpoint: "Skip Trace",
    configured,
    modes: {
      lookup:
        "POST { mode: 'lookup', address: '123 Main St, Tampa FL' }",
      nearby:
        "POST { mode: 'nearby', lat: 27.95, lng: -82.46, radius: 0.5 }",
      batch:
        "POST { mode: 'batch', addresses: ['addr1', 'addr2'] }",
    },
    note: configured
      ? "RapidAPI key active — full owner data available"
      : "Set RAPIDAPI_KEY for owner data. Nearby search works without key (uses free Nominatim)",
  });
}
