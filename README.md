# DC Site Screener

First-pass siting assessment for US data center sites, with an AI-written investment memo.

**Live:** https://dc-screener.vercel.app
**Related tools:** [DC Lease Comparator](https://dc-lease.vercel.app) · [DC Risk Register](https://dc-risk.vercel.app)

## What it does

Enter any US address. The engine geocodes it, finds the nearest data center market, scores eleven siting axes against curated data layers, maps the site against nearby substations and fiber, and writes an institutional investment memo.

## How scoring works

- Geocoding via OpenStreetMap Nominatim (no API key).
- Eleven axes, each scored 0 to 100 by deterministic rules: substation proximity, power cost, climate and hazard exposure, fiber access, hyperscaler presence, labor and operations depth, land economics, regulatory risk, sustainability signals, tax incentives, market maturity.
- Fixed weights combine the axes into a composite. Weights live in `lib/scoring.js`.
- The AI does not score. It reads the axis results and writes the memo, including what would change the view.

## Data and limitations

All layers in `data/` are static JSON curated by the author from public sources for a prototype. Substation and fiber positions are approximate; power costs and incentives are state or market level. This does not replace a utility interconnection study, environmental assessment, or title review.

## Roadmap

- Parcel-level power data where utilities publish hosting capacity maps
- County-level hazard scores from the FEMA National Risk Index
- Handoff into DC Risk Register as a lifecycle risk profile
- PDF export of memo and axis chart

## Stack

Next.js (App Router, JavaScript) · static JSON data layer · deterministic scoring in plain JS · Leaflet · Anthropic API behind a server route · Vercel

## Run locally