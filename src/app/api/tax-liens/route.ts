import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaxLienRecord {
  parcelId: string;
  ownerName: string;
  taxOwed: number;
  yearDelinquent: number;
  estimatedValue: number | null;
  auctionDate: string | null;
  county: string;
  state: string;
  sourceUrl: string;
}

interface SearchRequest {
  mode: "search" | "lookup" | "upcoming";
  state?: string;
  county?: string;
  address?: string;
}

interface CountySourceEntry {
  county: string;
  url: string;
  notes?: string;
}

interface AuctionScheduleEntry {
  state: string;
  county: string;
  auctionDate: string;
  registrationDeadline: string | null;
  auctionType: "online" | "in-person" | "hybrid";
  url: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Public County Tax Lien URL Registry
// Organized by state abbreviation. Each entry points to the county tax
// collector / tax deed sale page so users can go straight to the source.
// ---------------------------------------------------------------------------

const PUBLIC_TAX_LIEN_URLS: Record<string, CountySourceEntry[]> = {
  FL: [
    { county: "Miami-Dade", url: "https://www.miamidade.gov/taxcollector/tax-certificate-sale.asp", notes: "Annual online tax certificate sale, usually June" },
    { county: "Broward", url: "https://www.broward.org/RecordsTaxesTreasury/TaxCertificateSale/Pages/Default.aspx" },
    { county: "Hillsborough", url: "https://www.hillstax.org/taxcertificates/" },
    { county: "Orange", url: "https://www.octaxcol.com/tax-certificates/" },
    { county: "Duval", url: "https://www.coj.net/departments/finance/tax-collector/tax-certificates" },
    { county: "Palm Beach", url: "https://www.pbctax.com/tax-certificate-sales" },
  ],
  GA: [
    { county: "Fulton", url: "https://www.fultoncountytaxes.org/property-taxes/tax-sales", notes: "First Tuesday of month" },
    { county: "DeKalb", url: "https://www.dekalbcountyga.gov/tax-commissioner/tax-sales" },
    { county: "Gwinnett", url: "https://www.gwinnettcounty.com/web/gwinnett/departments/taxcommissioner/propertytaxes/taxsales" },
    { county: "Cobb", url: "https://www.cobbtax.org/tax-sales" },
  ],
  TX: [
    { county: "Harris", url: "https://www.hctax.net/Property/TaxSales", notes: "First Tuesday of month at courthouse" },
    { county: "Dallas", url: "https://www.dallascounty.org/departments/tax/tax-sales.php" },
    { county: "Bexar", url: "https://www.bexar.org/3654/Tax-Sales" },
    { county: "Travis", url: "https://tax-office.traviscountytx.gov/properties/tax-sales" },
    { county: "Tarrant", url: "https://www.tarrantcounty.com/en/tax/property-tax/tax-sales.html" },
  ],
  AZ: [
    { county: "Maricopa", url: "https://treasurer.maricopa.gov/tax-lien-sales", notes: "February online tax lien sale" },
    { county: "Pima", url: "https://www.pima.gov/960/Tax-Lien-Sale" },
    { county: "Pinal", url: "https://www.pinalcountyaz.gov/Treasurer/Pages/TaxLienSale.aspx" },
  ],
  NV: [
    { county: "Clark", url: "https://www.clarkcountynv.gov/government/elected_officials/treasurer/tax_sales.php", notes: "Annual sale, usually June" },
    { county: "Washoe", url: "https://www.washoecounty.gov/treasurer/tax_sale/" },
  ],
  OH: [
    { county: "Cuyahoga", url: "https://fiscalofficer.cuyahogacounty.us/en-US/Tax-Lien-Sale.aspx" },
    { county: "Franklin", url: "https://treasurer.franklincountyohio.gov/liens" },
    { county: "Hamilton", url: "https://www.hamiltoncountyohio.gov/government/open_government/property_tax_information/delinquent_tax_list" },
    { county: "Summit", url: "https://fiscaloffice.summitoh.net/index.php/tax-lien-sales" },
  ],
  IN: [
    { county: "Marion", url: "https://www.indy.gov/activity/tax-sale-information", notes: "Annual tax sale, SRI managed" },
    { county: "Lake", url: "https://www.lakecountyauditor.com/tax-sale-information" },
    { county: "Allen", url: "https://www.allencounty.us/auditor/tax-sale" },
  ],
  NJ: [
    { county: "Essex", url: "https://www.essexcountynj.org/tax-lien-sale" },
    { county: "Hudson", url: "https://www.hudsoncountynj.org/tax-sales" },
    { county: "Bergen", url: "https://www.co.bergen.nj.us/finance-tax-liens" },
    { county: "Camden", url: "https://www.camdencounty.com/service/tax-liens/" },
  ],
  IL: [
    { county: "Cook", url: "https://www.cookcountytreasurer.com/taxsale.aspx", notes: "Annual tax sale and scavenger sale" },
    { county: "DuPage", url: "https://www.dupagecounty.gov/treasurer/tax-sale/" },
    { county: "Will", url: "https://www.willcountytreasurer.com/tax-sale" },
  ],
  PA: [
    { county: "Philadelphia", url: "https://www.phila.gov/services/payments-assistance-taxes/property-taxes/buy-a-property-at-the-sheriffs-sale/" },
    { county: "Allegheny", url: "https://www.alleghenycounty.us/real-estate/tax-lien-sale.aspx" },
    { county: "Delaware", url: "https://www.delcopa.gov/treasurer/taxclaim.html" },
  ],
  SC: [
    { county: "Charleston", url: "https://www.charlestoncounty.org/departments/delinquent-tax/tax-sale.php", notes: "Annual defaulted tax sale" },
    { county: "Greenville", url: "https://www.greenvillecounty.org/tax_collector/delinquent_tax_sale.asp" },
    { county: "Richland", url: "https://www.richlandcountysc.gov/Government/Departments/Taxes/Delinquent-Tax-Sales" },
  ],
  AL: [
    { county: "Jefferson", url: "https://www.jccal.org/Default.asp?ID=604&pg=Tax+Lien+Sales" },
    { county: "Mobile", url: "https://www.mobilecountyal.gov/government/tax-lien-sales/" },
    { county: "Madison", url: "https://www.madisoncountyal.gov/departments/revenue-commissioner/tax-lien-auction" },
  ],
  MD: [
    { county: "Baltimore City", url: "https://tax-sale.baltimorecity.gov/", notes: "Annual May tax sale" },
    { county: "Anne Arundel", url: "https://www.aacounty.org/finance/tax-sale/" },
    { county: "Prince George's", url: "https://www.princegeorgescountymd.gov/1191/Tax-Sale" },
  ],
  MS: [
    { county: "Hinds", url: "https://www.co.hinds.ms.us/pgs/apps/taxsale/taxsale.asp" },
    { county: "Harrison", url: "https://www.co.harrison.ms.us/departments/tax-collector/tax-sales" },
  ],
  CO: [
    { county: "Denver", url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Finance/Treasury/Tax-Lien-Sale" },
    { county: "El Paso", url: "https://treasurer.elpasoco.com/tax-lien-sales/" },
    { county: "Arapahoe", url: "https://www.arapahoegov.com/1280/Tax-Lien-Sale" },
  ],
  IA: [
    { county: "Polk", url: "https://www.polkcountyiowa.gov/treasurer/tax-sale/" },
    { county: "Linn", url: "https://www.linncountyiowa.gov/353/Tax-Sale" },
    { county: "Scott", url: "https://www.scottcountyiowa.gov/treasurer/tax-sale" },
  ],
};

// ---------------------------------------------------------------------------
// Upcoming Tax Lien Auction Calendar (2025 schedule)
// ---------------------------------------------------------------------------

const TAX_LIEN_CALENDAR: AuctionScheduleEntry[] = [
  // Florida
  { state: "FL", county: "Miami-Dade", auctionDate: "2025-06-01", registrationDeadline: "2025-05-15", auctionType: "online", url: "https://www.miamidade.gov/taxcollector/tax-certificate-sale.asp", notes: "Continuous bidding over several days" },
  { state: "FL", county: "Broward", auctionDate: "2025-06-02", registrationDeadline: "2025-05-20", auctionType: "online", url: "https://www.broward.org/RecordsTaxesTreasury/TaxCertificateSale/Pages/Default.aspx" },
  { state: "FL", county: "Hillsborough", auctionDate: "2025-06-01", registrationDeadline: "2025-05-18", auctionType: "online", url: "https://www.hillstax.org/taxcertificates/" },
  { state: "FL", county: "Orange", auctionDate: "2025-06-01", registrationDeadline: "2025-05-15", auctionType: "online", url: "https://www.octaxcol.com/tax-certificates/" },
  { state: "FL", county: "Palm Beach", auctionDate: "2025-06-01", registrationDeadline: "2025-05-10", auctionType: "online", url: "https://www.pbctax.com/tax-certificate-sales" },

  // Arizona
  { state: "AZ", county: "Maricopa", auctionDate: "2025-02-06", registrationDeadline: "2025-01-31", auctionType: "online", url: "https://treasurer.maricopa.gov/tax-lien-sales", notes: "Largest tax lien sale in the country by volume" },
  { state: "AZ", county: "Pima", auctionDate: "2025-02-13", registrationDeadline: "2025-02-05", auctionType: "online", url: "https://www.pima.gov/960/Tax-Lien-Sale" },
  { state: "AZ", county: "Pinal", auctionDate: "2025-02-20", registrationDeadline: "2025-02-10", auctionType: "online", url: "https://www.pinalcountyaz.gov/Treasurer/Pages/TaxLienSale.aspx" },

  // Nevada
  { state: "NV", county: "Clark", auctionDate: "2025-06-09", registrationDeadline: "2025-05-30", auctionType: "online", url: "https://www.clarkcountynv.gov/government/elected_officials/treasurer/tax_sales.php" },

  // Texas (first-Tuesday-of-month recurring)
  { state: "TX", county: "Harris", auctionDate: "2025-03-04", registrationDeadline: null, auctionType: "in-person", url: "https://www.hctax.net/Property/TaxSales", notes: "Recurring first Tuesday" },
  { state: "TX", county: "Harris", auctionDate: "2025-04-01", registrationDeadline: null, auctionType: "in-person", url: "https://www.hctax.net/Property/TaxSales", notes: "Recurring first Tuesday" },
  { state: "TX", county: "Harris", auctionDate: "2025-05-06", registrationDeadline: null, auctionType: "in-person", url: "https://www.hctax.net/Property/TaxSales", notes: "Recurring first Tuesday" },
  { state: "TX", county: "Dallas", auctionDate: "2025-03-04", registrationDeadline: null, auctionType: "in-person", url: "https://www.dallascounty.org/departments/tax/tax-sales.php" },

  // Georgia (first-Tuesday-of-month)
  { state: "GA", county: "Fulton", auctionDate: "2025-03-04", registrationDeadline: null, auctionType: "in-person", url: "https://www.fultoncountytaxes.org/property-taxes/tax-sales", notes: "Steps of Fulton County Courthouse" },
  { state: "GA", county: "Fulton", auctionDate: "2025-04-01", registrationDeadline: null, auctionType: "in-person", url: "https://www.fultoncountytaxes.org/property-taxes/tax-sales" },
  { state: "GA", county: "DeKalb", auctionDate: "2025-04-01", registrationDeadline: null, auctionType: "in-person", url: "https://www.dekalbcountyga.gov/tax-commissioner/tax-sales" },

  // Indiana
  { state: "IN", county: "Marion", auctionDate: "2025-09-10", registrationDeadline: "2025-08-27", auctionType: "online", url: "https://www.indy.gov/activity/tax-sale-information", notes: "Managed by SRI Inc." },
  { state: "IN", county: "Lake", auctionDate: "2025-10-15", registrationDeadline: "2025-10-01", auctionType: "online", url: "https://www.lakecountyauditor.com/tax-sale-information" },

  // New Jersey
  { state: "NJ", county: "Essex", auctionDate: "2025-10-22", registrationDeadline: "2025-10-08", auctionType: "online", url: "https://www.essexcountynj.org/tax-lien-sale" },
  { state: "NJ", county: "Hudson", auctionDate: "2025-11-05", registrationDeadline: "2025-10-22", auctionType: "online", url: "https://www.hudsoncountynj.org/tax-sales" },
  { state: "NJ", county: "Camden", auctionDate: "2025-10-29", registrationDeadline: "2025-10-15", auctionType: "online", url: "https://www.camdencounty.com/service/tax-liens/" },

  // Ohio
  { state: "OH", county: "Cuyahoga", auctionDate: "2025-07-14", registrationDeadline: "2025-06-30", auctionType: "online", url: "https://fiscalofficer.cuyahogacounty.us/en-US/Tax-Lien-Sale.aspx" },
  { state: "OH", county: "Franklin", auctionDate: "2025-08-18", registrationDeadline: "2025-08-04", auctionType: "online", url: "https://treasurer.franklincountyohio.gov/liens" },

  // Illinois
  { state: "IL", county: "Cook", auctionDate: "2025-11-03", registrationDeadline: "2025-10-20", auctionType: "hybrid", url: "https://www.cookcountytreasurer.com/taxsale.aspx", notes: "Largest county tax sale in Illinois" },

  // Maryland
  { state: "MD", county: "Baltimore City", auctionDate: "2025-05-19", registrationDeadline: "2025-05-05", auctionType: "online", url: "https://tax-sale.baltimorecity.gov/" },

  // Colorado
  { state: "CO", county: "Denver", auctionDate: "2025-11-12", registrationDeadline: "2025-10-29", auctionType: "online", url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Finance/Treasury/Tax-Lien-Sale" },
  { state: "CO", county: "El Paso", auctionDate: "2025-11-05", registrationDeadline: "2025-10-22", auctionType: "online", url: "https://treasurer.elpasoco.com/tax-lien-sales/" },

  // South Carolina
  { state: "SC", county: "Charleston", auctionDate: "2025-12-01", registrationDeadline: "2025-11-17", auctionType: "in-person", url: "https://www.charlestoncounty.org/departments/delinquent-tax/tax-sale.php" },

  // Iowa
  { state: "IA", county: "Polk", auctionDate: "2025-06-16", registrationDeadline: "2025-06-02", auctionType: "online", url: "https://www.polkcountyiowa.gov/treasurer/tax-sale/" },

  // Pennsylvania
  { state: "PA", county: "Philadelphia", auctionDate: "2025-09-17", registrationDeadline: null, auctionType: "in-person", url: "https://www.phila.gov/services/payments-assistance-taxes/property-taxes/buy-a-property-at-the-sheriffs-sale/" },

  // Alabama
  { state: "AL", county: "Jefferson", auctionDate: "2025-05-20", registrationDeadline: "2025-05-06", auctionType: "online", url: "https://www.jccal.org/Default.asp?ID=604&pg=Tax+Lien+Sales" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RAPIDAPI_HOST = "realty-mole-property-api.p.rapidapi.com";

function getRapidApiKey(): string | null {
  return process.env.RAPIDAPI_KEY ?? null;
}

function buildSetupInstructions(): object {
  return {
    message:
      "RAPIDAPI_KEY is not configured. Tax lien search will still return public county source URLs, but enriched property / tax-history data from Realty Mole will be unavailable.",
    steps: [
      "1. Create a free account at https://rapidapi.com",
      "2. Subscribe to the 'Realty Mole Property API' (free tier available)",
      "3. Copy your X-RapidAPI-Key from the API dashboard",
      "4. Add RAPIDAPI_KEY=<your-key> to your .env.local file",
      "5. Restart the dev server",
    ],
  };
}

/**
 * Fetch tax / assessment history from Realty Mole for a given address.
 * Returns an array of TaxLienRecord-shaped objects when successful,
 * or an empty array when the key is missing or the request fails.
 */
async function fetchRealtyMoleTaxHistory(
  address: string,
): Promise<TaxLienRecord[]> {
  const apiKey = getRapidApiKey();
  if (!apiKey) return [];

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://${RAPIDAPI_HOST}/properties?address=${encodedAddress}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    if (!res.ok) {
      console.error(
        `Realty Mole request failed (${res.status}): ${res.statusText}`,
      );
      return [];
    }

    const data = await res.json();

    // Realty Mole returns a single property object or an array.
    const properties = Array.isArray(data) ? data : [data];

    return properties.map((prop: Record<string, unknown>) => {
      const taxHistory = Array.isArray(prop.taxAssessment)
        ? prop.taxAssessment
        : [];
      const latestTax =
        taxHistory.length > 0
          ? (taxHistory[taxHistory.length - 1] as Record<string, unknown>)
          : null;

      return {
        parcelId: (prop.id as string) ?? (prop.parcelId as string) ?? "N/A",
        ownerName: (prop.ownerName as string) ?? (prop.owner as string) ?? "Unknown",
        taxOwed: latestTax
          ? Number(latestTax.tax ?? latestTax.amount ?? 0)
          : 0,
        yearDelinquent: latestTax ? Number(latestTax.year ?? 0) : 0,
        estimatedValue: prop.estimatedValue
          ? Number(prop.estimatedValue)
          : prop.assessedValue
            ? Number(prop.assessedValue)
            : null,
        auctionDate: null,
        county: (prop.county as string) ?? "Unknown",
        state: (prop.state as string) ?? "Unknown",
        sourceUrl: `https://${RAPIDAPI_HOST}`,
      } satisfies TaxLienRecord;
    });
  } catch (err) {
    console.error("Error fetching Realty Mole tax history:", err);
    return [];
  }
}

/**
 * Normalise a state input to its two-letter uppercase abbreviation so users
 * can pass either "FL" or "Florida".
 */
const STATE_NAME_MAP: Record<string, string> = {
  florida: "FL",
  georgia: "GA",
  texas: "TX",
  arizona: "AZ",
  nevada: "NV",
  ohio: "OH",
  indiana: "IN",
  "new jersey": "NJ",
  illinois: "IL",
  pennsylvania: "PA",
  "south carolina": "SC",
  alabama: "AL",
  maryland: "MD",
  mississippi: "MS",
  colorado: "CO",
  iowa: "IA",
};

function normalizeState(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  const mapped = STATE_NAME_MAP[trimmed.toLowerCase()];
  return mapped ?? trimmed.toUpperCase();
}

// ---------------------------------------------------------------------------
// Route Handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/tax-liens
 * Returns service status, available states, and usage information.
 */
export async function GET() {
  const apiKey = getRapidApiKey();
  const availableStates = Object.keys(PUBLIC_TAX_LIEN_URLS).sort();
  const upcomingCount = TAX_LIEN_CALENDAR.length;
  const totalCountySources = Object.values(PUBLIC_TAX_LIEN_URLS).reduce(
    (sum, entries) => sum + entries.length,
    0,
  );

  return NextResponse.json({
    service: "LandScout Tax Lien Aggregator",
    version: "1.0.0",
    status: "operational",
    rapidApiConfigured: !!apiKey,
    ...(apiKey ? {} : { setup: buildSetupInstructions() }),
    coverage: {
      states: availableStates,
      stateCount: availableStates.length,
      totalCountySources,
      upcomingAuctions: upcomingCount,
    },
    usage: {
      endpoints: {
        "GET /api/tax-liens": "This status endpoint",
        "POST /api/tax-liens": "Search / lookup / upcoming tax lien data",
      },
      modes: {
        search:
          'Search by state (required) and optional county. Returns public source URLs and enriched data if available. Body: { "mode": "search", "state": "FL", "county": "Miami-Dade" }',
        lookup:
          'Look up tax history for a specific address via Realty Mole. Requires RAPIDAPI_KEY. Body: { "mode": "lookup", "address": "123 Main St, Miami, FL 33101" }',
        upcoming:
          'Get upcoming tax lien auction calendar. Optionally filter by state. Body: { "mode": "upcoming", "state": "TX" }',
      },
    },
  });
}

/**
 * POST /api/tax-liens
 * Modes: search | lookup | upcoming
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRequest;
    const { mode } = body;

    if (!mode || !["search", "lookup", "upcoming"].includes(mode)) {
      return NextResponse.json(
        {
          error: "Invalid or missing mode",
          validModes: ["search", "lookup", "upcoming"],
          example: { mode: "search", state: "FL" },
        },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // MODE: search
    // -----------------------------------------------------------------------
    if (mode === "search") {
      const rawState = body.state;
      if (!rawState) {
        return NextResponse.json(
          {
            error: "State is required for search mode",
            example: { mode: "search", state: "FL", county: "Miami-Dade" },
          },
          { status: 400 },
        );
      }

      const state = normalizeState(rawState);
      const countySources = PUBLIC_TAX_LIEN_URLS[state] ?? [];

      // Optionally filter by county
      const filteredSources = body.county
        ? countySources.filter(
            (s) =>
              s.county.toLowerCase() === body.county!.toLowerCase(),
          )
        : countySources;

      // Try to fetch enriched data when an API key is present. We build
      // a representative address query from the county + state so Realty
      // Mole can return area-level data. This is best-effort.
      let enrichedRecords: TaxLienRecord[] = [];
      const apiKey = getRapidApiKey();

      if (apiKey && filteredSources.length > 0) {
        const targetCounty = filteredSources[0].county;
        const searchAddress = `${targetCounty} County, ${state}`;
        enrichedRecords = await fetchRealtyMoleTaxHistory(searchAddress);
      }

      // Merge upcoming auctions for the requested state/county
      const upcomingForState = TAX_LIEN_CALENDAR.filter((entry) => {
        if (entry.state !== state) return false;
        if (body.county) {
          return entry.county.toLowerCase() === body.county.toLowerCase();
        }
        return true;
      });

      return NextResponse.json({
        mode: "search",
        state,
        county: body.county ?? null,
        publicSources: filteredSources,
        enrichedTaxData: enrichedRecords,
        upcomingAuctions: upcomingForState,
        meta: {
          publicSourceCount: filteredSources.length,
          enrichedRecordCount: enrichedRecords.length,
          upcomingAuctionCount: upcomingForState.length,
          rapidApiConfigured: !!apiKey,
          ...(apiKey ? {} : { setup: buildSetupInstructions() }),
        },
      });
    }

    // -----------------------------------------------------------------------
    // MODE: lookup
    // -----------------------------------------------------------------------
    if (mode === "lookup") {
      const address = (body as unknown as { address?: string }).address;

      if (!address) {
        return NextResponse.json(
          {
            error: "Address is required for lookup mode",
            example: {
              mode: "lookup",
              address: "123 Main St, Miami, FL 33101",
            },
          },
          { status: 400 },
        );
      }

      const apiKey = getRapidApiKey();
      if (!apiKey) {
        return NextResponse.json(
          {
            error: "RAPIDAPI_KEY is required for address lookup",
            setup: buildSetupInstructions(),
          },
          { status: 503 },
        );
      }

      const records = await fetchRealtyMoleTaxHistory(address);

      return NextResponse.json({
        mode: "lookup",
        address,
        results: records,
        meta: {
          resultCount: records.length,
          source: "Realty Mole Property API via RapidAPI",
        },
      });
    }

    // -----------------------------------------------------------------------
    // MODE: upcoming
    // -----------------------------------------------------------------------
    if (mode === "upcoming") {
      let calendar = [...TAX_LIEN_CALENDAR];

      // Optionally filter by state
      if (body.state) {
        const state = normalizeState(body.state);
        calendar = calendar.filter((e) => e.state === state);
      }

      // Sort ascending by auction date
      calendar.sort(
        (a, b) =>
          new Date(a.auctionDate).getTime() -
          new Date(b.auctionDate).getTime(),
      );

      // Group by state for easier consumption
      const byState: Record<string, AuctionScheduleEntry[]> = {};
      for (const entry of calendar) {
        if (!byState[entry.state]) byState[entry.state] = [];
        byState[entry.state].push(entry);
      }

      return NextResponse.json({
        mode: "upcoming",
        filterState: body.state ? normalizeState(body.state) : null,
        auctionCount: calendar.length,
        calendar,
        calendarByState: byState,
        meta: {
          year: 2025,
          disclaimer:
            "Dates are based on publicly posted schedules and are subject to change. Always verify with the county tax office before making plans.",
        },
      });
    }

    // Should never reach here due to the mode guard above
    return NextResponse.json({ error: "Unhandled mode" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/tax-liens error:", err);
    return NextResponse.json(
      {
        error: "Failed to process tax lien request",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
