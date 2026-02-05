# LandScout - Sheriff Sale & Tax Auction Aggregator

**The "Zillow for Off-Gridders"** - A comprehensive platform to find affordable land through sheriff sales, tax deed auctions, foreclosures, and surplus property sales.

## Vision

Help digital nomads, RV dwellers, and alternative lifestyle seekers find affordable land by aggregating fragmented auction data from hundreds of county sources into one searchable platform with AI-powered analysis.

## Project Structure

```
landscout/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main property listing page
│   │   ├── globals.css             # Global styles + Tailwind
│   │   └── calculator/
│   │       └── page.tsx            # NACA affordability calculator
│   ├── components/
│   │   ├── ScoreGauge.tsx          # AI score gauge visualization
│   │   ├── PropertyCard.tsx        # Property grid card
│   │   ├── PropertyDetail.tsx      # Property detail side panel
│   │   ├── PlatformDirectory.tsx   # Auction platform links by state
│   │   └── FiltersPanel.tsx        # Multi-criteria filter panel
│   ├── data/
│   │   └── properties.ts          # Property data + types + auction platforms
│   └── lib/                        # Utilities (future)
├── database/
│   └── schema.sql                  # PostgreSQL / Supabase schema
├── docs/
│   └── DATA_SOURCES.md            # API & data source guide
└── public/                         # Static assets
```

## Features (MVP)

- Property grid with filtering (state, auction type, price, acres)
- RV/Mobile Home friendly filters
- Flood zone filtering
- AI scoring system (0-100) with verdicts
- Property detail view with analysis
- Direct links to auction platforms
- Platform directory by state
- NACA affordability calculator
- Full-text search by address, county, or state

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + React 19 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Database | PostgreSQL / Supabase (schema ready) |
| Language | TypeScript |

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Pages

- **`/`** - Main property listing with filters, search, AI scores, and platform directory
- **`/calculator`** - NACA affordability calculator with DTI analysis

## Data Points Tracked

- Address, coordinates, parcel ID
- Auction type (tax deed, sheriff sale, foreclosure, listing)
- Auction date/time and platform links
- Opening bid vs estimated value (discount %)
- Acreage and zoning
- RV/Mobile home allowance
- Utilities (water, electric, sewer)
- Flood zone
- AI analysis with reasons to buy & risk factors

## Roadmap

### Phase 1 - MVP (Current)
- [x] Deploy with sample property data
- [x] Filters and search
- [x] NACA calculator

### Phase 2
- [ ] Supabase backend integration
- [ ] Automated scraping for FL/GA counties
- [ ] User accounts and saved properties

### Phase 3
- [ ] Live AI property scoring
- [ ] Email alerts for new listings
- [ ] Trulli.ai lender integration

### Phase 4
- [ ] Expand to more states
- [ ] Mobile app
- [ ] Premium features

## License

MIT
