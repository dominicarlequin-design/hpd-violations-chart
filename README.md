# 📊 HPD Violations by Building

A live dashboard on NYC HPD housing violation records, pulled directly from the Socrata Open Data API on every page load — not a static snapshot.

## 📊 Overview

The site is five static pages:

- **Home** (`index.html`) — address search, plus a spotlight on the single most-cited building citywide
- **Severity Key** (`severity-key.html`) — what Class A/B/C/I violations mean, with each class's live citywide share
- **Top Buildings** (`top-buildings.html`) — the 10 most-cited buildings citywide, ranked, with per-building class breakdowns and 12-month trends
- **By Borough** (`by-borough.html`) — violation totals and severity mix for each of the five boroughs, with monthly trends
- **Building Spotlight** (`building-spotlight.html`) — full profile of the current #1 building: totals, class breakdown, and a 12-month trend

All five query the live dataset directly and independently — each page fetches its own data on load; nothing is cached or shared between pages.

## 🔍 Building Search

On the home page, search by street address (e.g. "170 West End Avenue"). Results are grouped by building and ordered by violation count. Selecting a result loads its class breakdown and 12-month trend. Loading, empty, and error states are handled independently of the rest of the page.

## 🎨 Severity Classes

- **Class A** — non-hazardous (paint, leaks, faulty fixtures)
- **Class B** — hazardous (no heat/hot water, pests, broken locks)
- **Class C** — immediately hazardous (no gas, fire hazards, structural danger)
- **Class I** — administrative order; not tied to an inspection and not counted in the class breakdown

## 📝 Changelog

**Redesigned as five static pages.** Previously a single page with tabs
(Search / Top Buildings / By Borough). Each view is now its own HTML file
with its own independent data load, plus new Severity Key and Building
Spotlight pages. Same Socrata endpoint and query patterns throughout.

**Data window is a rolling 12 months.** All pages query the last 12 months
by default, so the picture reflects current conditions rather than a
building's full history. This also means the top-cited building can shift
as the window rolls forward.

**Ranking is raw violation count only, not severity-weighted.** A building
near the top of the list could be dominated by minor Class A violations,
while a building further down could have fewer total violations but a worse
mix of hazardous Class C ones. This is a known limitation, not something the
ranking corrects for.

## 👥 Who It's For

- **Tenant organizers** tracking which landlords/buildings have the worst violation records
- **Inspectors** cross-referencing a building's history before a site visit
- **Anyone evaluating a building** — renters, buyers, or neighbors — who wants a track record before making a decision about it

## 🏗️ Tech Stack

- **JavaScript** — vanilla, no framework or build step
- **Socrata Open Data API** — live queries against NYC's HPD violations dataset (`csn4-vhvf`), no backend or database

`app.js` holds the shared query/rendering helpers used by all five pages; `styles.css` holds the shared design tokens and components. No bundler — every page just links to both directly.

## 🚀 Setup & Deployment

**Run locally:**

```bash
git clone https://github.com/dominicarlequin-design/hpd-violations-chart.git
cd hpd-violations-chart
open index.html
```

No install step, no server required — each page fetches live data directly from Socrata's public API in the browser. (If your browser restricts `fetch` from `file://` URLs, serve it instead with `python3 -m http.server` and open `localhost:8000`.)

**Live deployment:** [hpd-violations-chart-dominicarlequi.vercel.app](https://hpd-violations-chart-dominicarlequi.vercel.app/)
