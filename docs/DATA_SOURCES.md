# Land Scout - Data Sources & API Integration Guide

## Overview

This document outlines all the data sources, APIs, and scraping strategies needed to build a comprehensive land auction aggregator.

---

## 1. AUCTION PLATFORMS (Primary Data Sources)

### Florida Tax Deed Auctions (RealAuction Platform)

Most Florida counties use RealAuction's platform. The URLs follow a pattern:
- `{county}.realtaxdeed.com` - Tax deed sales
- `{county}.realforeclose.com` - Foreclosure sales

**Counties using RealAuction:**
| County | Tax Deed URL | Foreclosure URL |
|--------|-------------|-----------------|
| Hillsborough | hillsborough.realtaxdeed.com | hillsborough.realforeclose.com |
| Pasco | pasco.realtaxdeed.com | pasco.realforeclose.com |
| Hernando | hernando.realtaxdeed.com | hernando.realforeclose.com |
| Polk | polk.realtaxdeed.com | polk.realforeclose.com |
| Pinellas | pinellas.realtaxdeed.com | pinellas.realforeclose.com |
| Orange | orange.realtaxdeed.com | orange.realforeclose.com |
| Duval | duval.realtaxdeed.com | duval.realforeclose.com |

**Scraping Strategy:**
```javascript
// RealAuction sites have a public API endpoint (undocumented)
// Example: Get upcoming auctions
const response = await fetch('https://hillsborough.realtaxdeed.com/index.cfm?action=api.getAuctions');

// They also have calendar/listing pages that can be scraped
// Example: Tax deed sale list page
// https://hillsborough.realtaxdeed.com/index.cfm?zession=clear&section=auctions
```

### Georgia Tax Sales (County-Specific)

Georgia uses sheriff's sales conducted at county courthouses. Each county maintains their own list.

**Key Georgia Counties:**
| County | Tax Sale URL | Schedule |
|--------|-------------|----------|
| Fulton | fultoncountyga.gov/.../tax-sales | First Tuesday monthly |
| DeKalb | dekalbtax.org/tax-sale-listing | Monthly |
| Cobb | cobbtax.gov/property/tax_sale | Varies |
| Gwinnett | gwinnettcounty.com/... | Varies |

**Georgia Notes:**
- 12-month redemption period
- Must register as bidder before sale
- Payment in cash/certified check same day

### Sheriff Sale Aggregators

**National Platforms:**
1. **Auction.com** - auction.com/residential/{state}/{county}
2. **Foreclosure.com** - foreclosure.com
3. **RealtyTrac** - realtytrac.com
4. **SheriffSales.net** - sheriffsales.net/listings/{county}-{state}

---

## 2. FREE & FREEMIUM DATA APIs

### Property Data APIs

#### Regrid (formerly Loveland Technologies)
**Best for:** Parcel boundaries, ownership, zoning
**URL:** https://regrid.com/api
**Pricing:** Free tier (100 req/day), Paid starts at $50/mo
**Endpoint Example:**
```javascript
// Get parcel by address
GET https://app.regrid.com/api/v1/parcels
?query=123+Main+St+Tampa+FL
&token=YOUR_API_KEY

// Response includes:
// - Parcel boundaries (GeoJSON)
// - Owner name
// - Zoning code
// - Acreage
// - Assessed value
```

#### OpenStreetMap / Nominatim
**Best for:** Geocoding (free, no API key)
**URL:** https://nominatim.openstreetmap.org
**Example:**
```javascript
// Geocode an address
GET https://nominatim.openstreetmap.org/search
?q=123+Main+St,+Tampa,+FL
&format=json

// Reverse geocode
GET https://nominatim.openstreetmap.org/reverse
?lat=27.9506&lon=-82.4572
&format=json
```

#### US Census Bureau API
**Best for:** Demographics, income, population
**URL:** https://api.census.gov/data
**Pricing:** FREE
**Example:**
```javascript
// Get median household income by ZIP
GET https://api.census.gov/data/2021/acs/acs5
?get=B19013_001E,NAME
&for=zip%20code%20tabulation%20area:33619
&key=YOUR_API_KEY
```

#### FEMA Flood Map API
**Best for:** Flood zone determination
**URL:** https://hazards.fema.gov/gis/nfhl/rest/services
**Pricing:** FREE
**Example:**
```javascript
// Query flood zone by coordinates
GET https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query
?geometry=-82.4572,27.9506
&geometryType=esriGeometryPoint
&outFields=FLD_ZONE,ZONE_SUBTY
&f=json
```

### Crime & Safety APIs

#### CrimeMapping.com
**URL:** https://www.crimemapping.com
**Access:** Scrape or embed (no official API)

#### SpotCrime API
**URL:** https://spotcrime.com/api
**Pricing:** Free tier available

### Schools API

#### GreatSchools API
**URL:** https://www.greatschools.org/api
**Pricing:** Free for non-commercial
**Example:**
```javascript
// Get schools near coordinates
GET https://api.greatschools.org/schools/nearby
?lat=27.9506&lon=-82.4572
&limit=10
&key=YOUR_API_KEY
```

### Mapping & Satellite

#### Mapbox
**URL:** https://www.mapbox.com
**Pricing:** Free tier (50k loads/mo)
**Use for:** Interactive maps, satellite imagery

#### Google Maps Platform
**URL:** https://developers.google.com/maps
**Pricing:** $200 free credit/mo
**Use for:** Street View, satellite imagery, geocoding

---

## 3. ZONING DATA SOURCES

Zoning data is the most fragmented. Each county maintains their own GIS system.

### Florida County GIS Portals

| County | GIS Portal | Notes |
|--------|-----------|-------|
| Hillsborough | gis.hillsboroughcounty.org | Has zoning layer |
| Pasco | pascogis.pascocountyfl.net | Good parcel data |
| Hernando | gis.hernandocounty.us | Limited |
| Polk | polkgis.polk-county.net | Detailed |

### Georgia County GIS Portals

| County | GIS Portal |
|--------|-----------|
| Fulton | gis.fultoncountyga.gov |
| DeKalb | dekalbgis.org |
| Cobb | cobbgis.org |

### Zoning Codes to Track

**RV/Mobile Home Friendly Codes (varies by county):**
- `AR` - Agricultural Residential (usually allows mobile/RV)
- `R-MH` - Residential Mobile Home
- `A-1`, `A-2` - Agricultural (often flexible)
- `R-2` - Residential (check restrictions)
- `RSC` - Residential Single Family with Conditions

---

## 4. SCRAPING ARCHITECTURE

### Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    SCRAPING LAYER                        │
├─────────────────────────────────────────────────────────┤
│  Framework: Puppeteer / Playwright                       │
│  Queue: BullMQ (Redis)                                  │
│  Proxy: Bright Data / Oxylabs (for scale)               │
│  Schedule: node-cron                                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   PROCESSING LAYER                       │
├─────────────────────────────────────────────────────────┤
│  Parser: Cheerio (HTML) / JSON extraction               │
│  Geocoder: Nominatim / Mapbox                           │
│  Enrichment: Census API, FEMA API, etc.                 │
│  AI Analysis: OpenAI GPT-4 / Claude API                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                         │
├─────────────────────────────────────────────────────────┤
│  Database: PostgreSQL (Supabase)                        │
│  Cache: Redis                                           │
│  Search: Elasticsearch / Meilisearch (optional)         │
│  Files: S3 / Supabase Storage                           │
└─────────────────────────────────────────────────────────┘
```

### Scraper Example (Node.js)

```javascript
// scraper/realauction.js
const puppeteer = require('puppeteer');

class RealAuctionScraper {
  constructor(county, state) {
    this.county = county;
    this.state = state;
    this.baseUrl = `https://${county.toLowerCase()}.realtaxdeed.com`;
  }

  async scrapeUpcomingAuctions() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`${this.baseUrl}/index.cfm?zession=clear&section=auctions`);
    
    // Wait for auction list to load
    await page.waitForSelector('.auction-list, .sale-list, table');
    
    // Extract auction data
    const auctions = await page.evaluate(() => {
      const items = [];
      // Selector varies by county - need to adapt
      document.querySelectorAll('.auction-item, tr.sale-row').forEach(row => {
        items.push({
          caseNumber: row.querySelector('.case-number, td:nth-child(1)')?.textContent?.trim(),
          address: row.querySelector('.address, td:nth-child(2)')?.textContent?.trim(),
          parcelId: row.querySelector('.parcel, td:nth-child(3)')?.textContent?.trim(),
          openingBid: row.querySelector('.bid, td:nth-child(4)')?.textContent?.trim(),
          auctionDate: row.querySelector('.date, td:nth-child(5)')?.textContent?.trim(),
        });
      });
      return items;
    });
    
    await browser.close();
    return auctions;
  }
}
```

---

## 5. AI ANALYSIS INTEGRATION

### Property Scoring Algorithm

```javascript
// services/aiAnalysis.js

async function analyzeProperty(property, comparables, areaStats) {
  const factors = {
    // Price Analysis (40% weight)
    priceScore: calculatePriceScore(property, comparables),
    
    // Location Analysis (25% weight)
    locationScore: calculateLocationScore(property, areaStats),
    
    // RV/Mobile Friendliness (20% weight)
    rvScore: calculateRvScore(property),
    
    // Risk Assessment (15% weight)
    riskScore: calculateRiskScore(property)
  };
  
  // Weighted total
  const totalScore = Math.round(
    factors.priceScore * 0.40 +
    factors.locationScore * 0.25 +
    factors.rvScore * 0.20 +
    factors.riskScore * 0.15
  );
  
  // Generate verdict
  const verdict = generateVerdict(totalScore, factors, property);
  
  return {
    score: totalScore,
    verdict: verdict.label,
    reasons: verdict.reasons,
    risks: verdict.risks,
    investmentPotential: verdict.potential
  };
}

function calculatePriceScore(property, comparables) {
  const price = property.openingBid || property.listPrice;
  const avgCompPrice = comparables.reduce((sum, c) => sum + c.pricePerAcre, 0) / comparables.length;
  const propertyPricePerAcre = price / property.acres;
  
  // Higher score = better deal
  const discount = (avgCompPrice - propertyPricePerAcre) / avgCompPrice;
  return Math.min(100, Math.max(0, 50 + discount * 100));
}

function calculateRvScore(property) {
  let score = 50; // Base score
  
  if (property.rvAllowed) score += 25;
  if (property.mobileHomeAllowed) score += 15;
  if (!property.hasHoa) score += 10;
  if (property.floodZone === 'X') score += 10;
  if (property.hasElectric) score += 5;
  if (property.hasWater || property.hasWell) score += 5;
  
  return Math.min(100, score);
}
```

### Using Claude/GPT for Analysis

```javascript
// services/llmAnalysis.js
const Anthropic = require('@anthropic-ai/sdk');

async function generateAIInsights(property, context) {
  const anthropic = new Anthropic();
  
  const prompt = `Analyze this auction property for a potential buyer interested in RV/off-grid living:

Property Details:
- Address: ${property.address}, ${property.city}, ${property.state}
- Auction Type: ${property.auctionType}
- Opening Bid: $${property.openingBid}
- Estimated Value: $${property.estimatedValue}
- Acreage: ${property.acres}
- Zoning: ${property.zoning}
- Mobile Home Allowed: ${property.mobileHomeAllowed}
- RV Allowed: ${property.rvAllowed}
- Utilities: Water(${property.hasWater}), Electric(${property.hasElectric}), Sewer(${property.hasSewer})
- Flood Zone: ${property.floodZone}

Area Context:
- Median Income: ${context.medianIncome}
- Crime Index: ${context.crimeIndex}/100
- Nearest Grocery: ${context.nearestGrocery} miles

Provide:
1. A brief verdict (e.g., "Strong Buy", "Proceed with Caution")
2. Top 3 reasons to buy
3. Top 3 risk factors
4. Investment potential rating

Format as JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });
  
  return JSON.parse(response.content[0].text);
}
```

---

## 6. TRULLI.AI INTEGRATION

For the Trulli.ai lender integration:

```javascript
// services/trulliIntegration.js

class TrulliConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.trulli.ai/v1'; // Placeholder
  }
  
  // Get matching lenders for a user's profile
  async getMatchingLenders(userProfile) {
    const response = await fetch(`${this.baseUrl}/lenders/match`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        annualIncome: userProfile.annualIncome,
        creditScore: userProfile.creditScore,
        existingDebts: userProfile.monthlyDebts,
        propertyType: 'land',
        purchasePrice: userProfile.targetPrice,
        downPayment: userProfile.downPayment,
        state: userProfile.state
      })
    });
    
    return response.json();
  }
  
  // Pre-qualify for a specific property
  async preQualify(userId, propertyId, lenderId) {
    // Implementation depends on Trulli.ai's API
  }
}
```

---

## 7. NACA-SPECIFIC CALCULATOR

NACA (Neighborhood Assistance Corporation of America) has unique terms:
- No down payment required
- No closing costs
- No PMI
- Below-market interest rates (often 1-2% below conventional)
- Requires membership and counseling

```javascript
// calculators/nacaCalculator.js

function calculateNACAApproval(financialProfile) {
  const {
    annualIncome,
    monthlyDebts, // Car payments, credit cards, student loans
    creditScore // Less emphasis than traditional lenders
  } = financialProfile;
  
  const monthlyGross = annualIncome / 12;
  
  // NACA uses 31% front-end DTI (housing only)
  // And 43% back-end DTI (all debts)
  const maxHousingPayment = monthlyGross * 0.31;
  const maxTotalDebt = monthlyGross * 0.43;
  const availableForHousing = maxTotalDebt - monthlyDebts;
  
  // Use lower of the two
  const maxPayment = Math.min(maxHousingPayment, availableForHousing);
  
  // NACA rates are typically 1-2% below market
  // Assume 5% for calculation (adjust based on current rates)
  const annualRate = 0.05;
  const monthlyRate = annualRate / 12;
  const termMonths = 360; // 30-year
  
  // Calculate max loan amount (standard mortgage formula)
  const maxLoan = maxPayment * 
    ((Math.pow(1 + monthlyRate, termMonths) - 1) / 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)));
  
  return {
    maxMonthlyPayment: Math.round(maxPayment),
    maxLoanAmount: Math.round(maxLoan),
    estimatedRate: annualRate,
    frontEndDTI: (maxHousingPayment / monthlyGross * 100).toFixed(1),
    backEndDTI: ((maxPayment + monthlyDebts) / monthlyGross * 100).toFixed(1),
    notes: [
      'NACA requires membership and counseling completion',
      'No down payment required',
      'No PMI or closing costs',
      'Must be owner-occupied primary residence'
    ]
  };
}

// Example usage:
// calculateNACAApproval({ annualIncome: 55000, monthlyDebts: 800 })
// Returns: { maxMonthlyPayment: 622, maxLoanAmount: ~116000, ... }
```

---

## 8. DEPLOYMENT RECOMMENDATIONS

### Tech Stack Recommendation

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js + React | SSR, great DX, easy deployment |
| Backend | Next.js API Routes or Express | Keep it simple |
| Database | Supabase (PostgreSQL) | Free tier, realtime, auth built-in |
| Scraping | Railway or Render (cron jobs) | Easy background job hosting |
| Maps | Mapbox | Better free tier than Google |
| Hosting | Vercel | Free, auto-scaling |
| Auth | Supabase Auth or Clerk | Easy to implement |

### MVP Feature Priority

1. **Phase 1 (Week 1-2):** 
   - Static property list from manual data entry
   - Basic filters (state, price, acres, RV-allowed)
   - Property detail view with platform links
   
2. **Phase 2 (Week 3-4):**
   - Automated scraping for FL/GA counties
   - NACA affordability calculator
   - User accounts and saved properties

3. **Phase 3 (Week 5-6):**
   - AI property scoring
   - Email alerts for new listings
   - Trulli.ai lender integration

4. **Phase 4 (Ongoing):**
   - Expand to more states
   - Mobile app
   - Premium features (detailed reports, API access)

---

## 9. ESTIMATED COSTS (MVP)

| Service | Monthly Cost |
|---------|-------------|
| Supabase (database) | $0 (free tier) |
| Vercel (hosting) | $0 (free tier) |
| Mapbox (maps) | $0 (free tier up to 50k loads) |
| Railway (scraping jobs) | $5-20 |
| Proxy service (optional) | $0-50 |
| OpenAI/Anthropic API | $10-50 |
| **Total** | **$15-120/month** |

---

## 10. LEGAL CONSIDERATIONS

1. **Terms of Service:** Some auction sites prohibit scraping. Consider:
   - Manual data entry for initial MVP
   - Reaching out for API partnerships
   - Using only publicly available data

2. **Real Estate Licensing:** In some states, providing property recommendations may require a license. Consult a lawyer.

3. **Data Privacy:** If collecting user financial info, comply with applicable privacy laws.

4. **Disclaimers:** Include disclaimers that this is not legal, financial, or real estate advice.

---

This document provides the foundation to build a comprehensive land auction aggregator. Start with manual data and basic features, then automate and expand as you validate the market.
