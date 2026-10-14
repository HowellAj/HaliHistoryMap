# HaliHistoryMap

A map of Halifax, Nova Scotia with pins for historical photos and videos of the area.

V1 covers Barrington Street, Water Street, Spring Garden Road, Gottingen Street and Citadel Hill.

## Stack

- React + Vite
- Leaflet (via react-leaflet) with OpenStreetMap tiles
- Static site, no backend for V1, hosted on GitHub Pages

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Adding photos and videos

Add entries to `src/data/items.json`. See [docs/DATA.md](docs/DATA.md) for the fields.

## Deploying

Pushes to `main` build and deploy to GitHub Pages via `.github/workflows/deploy.yml`.
One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

## Structure

```
src/
  config.js                  site name, contact email, map center/bounds
  App.jsx                    routes
  data/items.json            map pins (photos and videos)
  data/places.json           places (jump-to buttons, future place filter)
  data/items.js              loads and validates items and places
  components/Layout.jsx      header, nav, footer
  components/HistoryMap.jsx  Leaflet map and markers
  components/ItemPopup.jsx   photo/video popup
  pages/                     Home, Map, Contribute, Not found
```

Routes use hash URLs (`/#/map`) so refreshes work on GitHub Pages.
