# 📊 HPD Violations by Building

A live dashboard analyzing 2.9M+ NYC HPD housing violation records, pulled directly from the Socrata Open Data API on every page load — not a static snapshot.

## 📊 Overview

The dashboard surfaces three views into NYC's Housing Preservation & Development (HPD) violation data:

- **Top violators citywide** — the 10 buildings with the most recorded violations
- **Severity by borough** — the share of Class A (minor), B, and C (hazardous) violations in each borough
- **Building search** — look up any building by ID to see its own violation class breakdown

All charts and the search feature query the live dataset directly, so the numbers reflect the current state of NYC's public violation records, not a cached or pre-computed copy.

## 🏆 Key Finding

Across the full historical dataset, **Building 808705 in Brooklyn** is the single worst violator citywide — **2,482 recorded violations**, 38% more than the next-highest building.

> Note: the top-violators and borough-severity charts on the live dashboard are scoped to the most recent 5 years of data by default (to keep queries fast), so the live numbers you see today will differ from this all-time figure. Use the building search below to pull a specific building's own history.

## 🔍 Building Search

Enter a Building ID to fetch that building's individual violation class breakdown (A/B/C) for the last 5 years, rendered as its own chart. Handles loading, empty-result, and error states independently of the rest of the page — a failed or empty search never disturbs the two auto-loaded charts above it.

## 👥 Who It's For

- **Tenant organizers** tracking which landlords/buildings have the worst violation records
- **Inspectors** cross-referencing a building's history before a site visit
- **Anyone evaluating a building** — renters, buyers, or neighbors — who wants a track record before making a decision about it

## 🏗️ Tech Stack

- **JavaScript** — vanilla, no framework or build step
- **Chart.js** — chart rendering (loaded via CDN)
- **Socrata Open Data API** — live queries against NYC's HPD violations dataset, no backend or database

The entire app is a single static `index.html` file.

## 🚀 Setup & Deployment

**Run locally:**

```bash
git clone https://github.com/dominicarlequin-design/hpd-violations-chart.git
cd hpd-violations-chart
open index.html
```

No install step, no server required — the page fetches live data directly from Socrata's public API in the browser. (If your browser restricts `fetch` from `file://` URLs, serve it instead with `python3 -m http.server` and open `localhost:8000`.)

**Live deployment:** [hpd-violations-chart-dominicarlequi.vercel.app](https://hpd-violations-chart-dominicarlequi.vercel.app/)
