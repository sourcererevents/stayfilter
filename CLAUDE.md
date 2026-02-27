# CLAUDE.md — StayFilter Project Bible

## What This Is
A personal-use deep filter tool for Airbnb and VRBO. Surfaces all 400+ filters (including hidden amenities) in a polished UI, with plans to show inline results and cross-platform comparison.

## Repository
- **GitHub:** https://github.com/sourcererevents/stayfilter
- **Location:** `/Users/Brett/Desktop/stayfilter/`

## Stack
- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand + nuqs (URL state sync)
- **Icons:** Lucide React
- **Maps:** Mapbox GL JS via react-map-gl (Phase 2)
- **Database:** SQLite via Drizzle ORM (Phase 2 — for favorites, saved searches, price tracking)
- **Port:** 3000 (default Next.js)

## Architecture Overview

### Phase 1 — URL Builder (Current)
- Beautiful filter UI with all Airbnb/VRBO filters organized by category
- Progressive disclosure: primary filter pills → "All Filters" slide-out panel
- Constructs Airbnb/VRBO search URLs with correct parameters
- "Search on Airbnb" / "Search on VRBO" buttons open results in new tabs
- Filter state synced to URL via nuqs (bookmarkable, shareable)

### Phase 2 — Inline Results
- Query Airbnb's internal GraphQL API (`/api/v3/StaysSearch`) for inline results
- Query VRBO's internal GraphQL for side-by-side comparison
- Split-pane layout: card list (left) + Mapbox map with price pins (right)
- Fallback to URL builder if API gets blocked
- Image carousels on result cards

### Phase 3 — Power Features
- Saved searches with "new since last visit" diffing
- Price tracking and alerts (SQLite + cron)
- Favorites with private notes and tags
- Comparison table (pin 2-4 listings side-by-side)
- Travel time isochrones (Mapbox Isochrone API)
- Deal scoring (price vs. area average)

## How Airbnb Filters Work

### URL Parameter System
Airbnb accepts filters as URL query parameters:
```
https://www.airbnb.com/s/{location}/homes?amenities[]=25&amenities[]=27&property_type_id[]=2&price_min=100&price_max=500&superhost=true
```

### Key Parameter Types
| Parameter | Type | Example |
|-----------|------|---------|
| `amenities[]` | int[] | `amenities[]=25` (hot tub) |
| `property_type_id[]` | int[] | `property_type_id[]=2` (house) |
| `l2_property_type_ids[]` | int[] | Subcategory types |
| `category_tag` | string | `Tag:8536` (category filter) |
| `price_min` / `price_max` | int | Nightly price range |
| `min_bedrooms` / `min_beds` / `min_bathrooms` | int | Room counts |
| `room_type` | string | `Entire home/apt`, `Private room`, `Shared room` |
| `superhost` | boolean | Superhost only |
| `instant_book` | boolean | Instant book |
| `self_checkin` | boolean | Self check-in |
| `checkin` / `checkout` | string | YYYY-MM-DD |
| `adults` / `children` / `infants` / `pets` | int | Guest counts |
| `ne_lat,ne_lng,sw_lat,sw_lng` | float | Map bounding box |

### Internal API (Phase 2)
- **Endpoint:** `https://www.airbnb.com/api/v3/StaysSearch`
- **Auth:** Public API key `d306zoyjsyarp7ifhu67rjxn52tv0t20` (ships with every page load)
- **Format:** GraphQL with Apollo persisted queries (sha256 hashes rotate)
- **Libraries:** `pyairbnb` (Python), `ScrapeBnB` (Node.js)

## Filter Data Structure

Filters are stored in `/src/data/filters.ts` organized by category:
- **Popular:** Pool, Hot Tub, Sauna, Fireplace, Beachfront, etc.
- **Property Type:** House, Apartment, Cabin, Treehouse, Yurt, Castle, etc.
- **Amenities — Bathroom:** Bathtub, Bidet, Hair Dryer, etc.
- **Amenities — Bedroom/Laundry:** Washer, Dryer, Iron, etc.
- **Amenities — Kitchen:** Full Kitchen, Dishwasher, Coffee Maker, etc.
- **Amenities — Entertainment:** TV, Game Console, Pool Table, etc.
- **Amenities — Outdoor:** BBQ Grill, Fire Pit, Patio, Garden, etc.
- **Amenities — Safety:** Smoke Alarm, CO Alarm, Fire Extinguisher, etc.
- **Amenities — Heating/Cooling:** AC, Heating, Fireplace, etc.
- **Amenities — Family:** Crib, High Chair, Baby Monitor, etc.
- **Amenities — Parking:** Free Parking, EV Charger, etc.
- **Accessibility:** Step-free, Wide Doorway, etc.
- **Booking:** Superhost, Instant Book, Self Check-in, Flexible Cancel
- **Categories:** Amazing Views, Cabins, Treehouses, Beachfront, National Parks, OMG!, etc.

## Project Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── filters/          # Filter UI components
│   │   ├── FilterBar.tsx           # Top-level filter pills
│   │   ├── FilterSheet.tsx         # "All Filters" slide-out panel
│   │   ├── FilterSection.tsx       # Accordion section for a category
│   │   ├── LocationSearch.tsx      # Location input
│   │   ├── DatePicker.tsx          # Check-in/out dates
│   │   ├── GuestSelector.tsx       # Adults/children/infants/pets
│   │   ├── PriceRange.tsx          # Min/max price slider
│   │   └── FilterChips.tsx         # Active filter summary chips
│   ├── results/          # Phase 2 result display
│   │   ├── ResultCard.tsx
│   │   ├── ResultList.tsx
│   │   └── ResultMap.tsx
│   ├── layout/           # App layout
│   │   └── Header.tsx
│   └── ui/               # shadcn/ui components
├── data/
│   └── filters.ts        # Complete filter taxonomy with IDs
├── stores/
│   └── filterStore.ts    # Zustand store for filter state
├── hooks/
│   └── useUrlBuilder.ts  # Hook to construct Airbnb/VRBO URLs
├── types/
│   └── filters.ts        # TypeScript types for filters
└── lib/
    └── utils.ts          # shadcn utils
```

## Running Locally
```bash
cd /Users/Brett/Desktop/stayfilter
npm run dev    # http://localhost:3000
```

## Conventions
- TypeScript strict mode, no `any`
- Tailwind for styling, shadcn/ui for components
- Zustand for client state, nuqs for URL state
- ESLint + Next.js defaults
- Conventional commits

## Design Decisions

### Why URL Builder First (Phase 1)
- Zero API risk — no rate limiting, no anti-bot, no breaking changes
- Works immediately and reliably
- Still surfaces all hidden filters that Airbnb's UI doesn't show
- Natural upgrade path to inline results later

### UI Pattern: Progressive Disclosure
- Primary filter pills always visible (location, dates, guests, price, property type)
- "All Filters" button opens a Sheet/drawer with the full 400+ filter set
- Active filters shown as removable chips below the filter bar
- Result count updates as filters change (Phase 2)

### Filter State Management
- Zustand store holds all filter values
- nuqs syncs key filters to URL query params (bookmarkable)
- When user clicks "Search on Airbnb," the store constructs the correct URL

## Build History

### 2026-02-26 — Project Initialized
- Created GitHub repo: sourcererevents/stayfilter
- Scaffolded Next.js 14 + TypeScript + Tailwind v4 + shadcn/ui
- Installed: zustand, nuqs, lucide-react
- Installed shadcn components: button, dialog, accordion, checkbox, slider, badge, popover, separator, scroll-area, input, toggle-group, sheet, tabs
- Phase 1 approach: URL builder with full filter taxonomy
- Design inspired by Airbnbase Superfilter but with better UX, VRBO support, and upgrade path to inline results
