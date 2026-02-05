/**
 * Data Source Registry
 *
 * Central config for all external data sources. Each source defines
 * how to fetch, parse, and normalize property data into LandScout's
 * unified schema.
 */

export interface DataSource {
  id: string;
  name: string;
  provider: "firecrawl" | "rapidapi" | "apify" | "direct";
  type: "auction" | "listing" | "valuation" | "enrichment" | "skip_trace";
  states: string[];
  description: string;
  envKey: string; // env var name for API key
  rateLimit: number; // req/min
}

export const DATA_SOURCES: DataSource[] = [
  // ── Firecrawl: Scrape auction sites ────────────────────────
  {
    id: "firecrawl-realtaxdeed",
    name: "FL RealTaxDeed Counties",
    provider: "firecrawl",
    type: "auction",
    states: ["FL"],
    description:
      "Scrapes tax deed auction calendars from RealAuction platform used by Hillsborough, Pasco, Hernando, Polk, Volusia, Marion, and other FL counties",
    envKey: "FIRECRAWL_API_KEY",
    rateLimit: 20,
  },
  {
    id: "firecrawl-realforeclose",
    name: "FL RealForeclose Counties",
    provider: "firecrawl",
    type: "auction",
    states: ["FL"],
    description:
      "Scrapes foreclosure auction calendars from RealAuction platform for FL counties",
    envKey: "FIRECRAWL_API_KEY",
    rateLimit: 20,
  },
  {
    id: "firecrawl-ga-tax",
    name: "GA County Tax Sales",
    provider: "firecrawl",
    type: "auction",
    states: ["GA"],
    description:
      "Scrapes tax sale listings from Fulton, DeKalb, Cobb, Cherokee, and other GA county sites",
    envKey: "FIRECRAWL_API_KEY",
    rateLimit: 15,
  },
  {
    id: "firecrawl-tx-tax",
    name: "TX County Tax Sales",
    provider: "firecrawl",
    type: "auction",
    states: ["TX"],
    description:
      "Scrapes tax sale listings from Harris, Bexar, and other TX county tax office sites",
    envKey: "FIRECRAWL_API_KEY",
    rateLimit: 15,
  },

  // ── RapidAPI: Property data & valuations ───────────────────
  {
    id: "rapidapi-zillow",
    name: "Zillow Property Data",
    provider: "rapidapi",
    type: "valuation",
    states: ["*"],
    description:
      "Property value estimates (Zestimates), comparable sales, and property details via Zillow's data on RapidAPI",
    envKey: "RAPIDAPI_KEY",
    rateLimit: 50,
  },
  {
    id: "rapidapi-realty-mole",
    name: "Realty Mole Property",
    provider: "rapidapi",
    type: "valuation",
    states: ["*"],
    description:
      "Property records, owner info, tax history, and sale history. Good for verifying auction property details.",
    envKey: "RAPIDAPI_KEY",
    rateLimit: 30,
  },
  {
    id: "rapidapi-rentcast",
    name: "Rentcast Valuations",
    provider: "rapidapi",
    type: "valuation",
    states: ["*"],
    description:
      "Rental estimates and property valuations to compare auction prices against market value",
    envKey: "RAPIDAPI_KEY",
    rateLimit: 30,
  },
  {
    id: "rapidapi-us-real-estate",
    name: "US Real Estate Listings",
    provider: "rapidapi",
    type: "listing",
    states: ["*"],
    description:
      "Active real estate listings from Realtor.com data. Search by location, price, and property type.",
    envKey: "RAPIDAPI_KEY",
    rateLimit: 50,
  },

  // ── Apify: Scheduled scraping actors ───────────────────────
  {
    id: "apify-landwatch",
    name: "LandWatch Listings",
    provider: "apify",
    type: "listing",
    states: ["*"],
    description:
      "Scheduled scraper for LandWatch.com land listings. Runs daily, pulls new listings by state/county.",
    envKey: "APIFY_API_TOKEN",
    rateLimit: 100,
  },
  {
    id: "apify-landsearch",
    name: "LandSearch Listings",
    provider: "apify",
    type: "listing",
    states: ["*"],
    description:
      "Scheduled scraper for LandSearch.com land listings. Runs daily.",
    envKey: "APIFY_API_TOKEN",
    rateLimit: 100,
  },
  {
    id: "apify-auction-com",
    name: "Auction.com Properties",
    provider: "apify",
    type: "auction",
    states: ["*"],
    description:
      "Scrapes Auction.com for bank-owned and foreclosure properties across all states.",
    envKey: "APIFY_API_TOKEN",
    rateLimit: 50,
  },
  {
    id: "apify-county-gis",
    name: "County GIS Parcel Data",
    provider: "apify",
    type: "enrichment",
    states: ["FL", "GA", "TX"],
    description:
      "Scrapes county GIS portals for zoning, parcel boundaries, and ownership data.",
    envKey: "APIFY_API_TOKEN",
    rateLimit: 30,
  },

  // ── Skip Trace: Owner lookup & door-knocking ───────────────
  {
    id: "rapidapi-skip-trace",
    name: "Skip Trace (Owner Lookup)",
    provider: "rapidapi",
    type: "skip_trace",
    states: ["*"],
    description:
      "Property owner name, mailing address, tax history, sale history, equity estimates, and occupancy status via Realty Mole + reverse geocoding.",
    envKey: "RAPIDAPI_KEY",
    rateLimit: 30,
  },
  {
    id: "nominatim-nearby",
    name: "Nearby Parcel Discovery",
    provider: "direct",
    type: "skip_trace",
    states: ["*"],
    description:
      "Free Nominatim-based reverse geocoding to discover nearby addresses from GPS coordinates. No API key needed.",
    envKey: "",
    rateLimit: 60,
  },

  // ── Direct APIs (free, no key or free key) ─────────────────
  {
    id: "fema-flood",
    name: "FEMA Flood Zones",
    provider: "direct",
    type: "enrichment",
    states: ["*"],
    description:
      "Free FEMA API for flood zone determination by coordinates. No API key needed.",
    envKey: "",
    rateLimit: 60,
  },
  {
    id: "census-demographics",
    name: "US Census Demographics",
    provider: "direct",
    type: "enrichment",
    states: ["*"],
    description:
      "Free Census API for median income, population, and demographics by ZIP/tract.",
    envKey: "CENSUS_API_KEY",
    rateLimit: 120,
  },
  {
    id: "nominatim-geocoder",
    name: "Nominatim Geocoding",
    provider: "direct",
    type: "enrichment",
    states: ["*"],
    description:
      "Free OpenStreetMap geocoding. Convert addresses to coordinates and vice versa.",
    envKey: "",
    rateLimit: 60,
  },
];

export function getSourcesByProvider(
  provider: DataSource["provider"]
): DataSource[] {
  return DATA_SOURCES.filter((s) => s.provider === provider);
}

export function getSourcesByType(type: DataSource["type"]): DataSource[] {
  return DATA_SOURCES.filter((s) => s.type === type);
}

export function isSourceConfigured(source: DataSource): boolean {
  if (!source.envKey) return true; // No key needed
  return !!process.env[source.envKey];
}
