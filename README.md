# Halifax Then Map

A map of Halifax, Nova Scotia with pins for historical photos of the area.

## Stack

- React + Vite
- Leaflet (via react-leaflet) with OpenStreetMap tiles
- Static site, no backend for V1 (deployable to GitHub Pages or Netlify)

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Structure

```
src/
  config.js              site name, contact email, map center/bounds
  App.jsx                routes
  components/Layout.jsx  header, nav, footer
  components/HistoryMap.jsx  Leaflet map of Halifax
  pages/HomePage.jsx     landing page
  pages/MapPage.jsx      full-screen map
  pages/ContributePage.jsx  photo submission (placeholder)
```

Routes use hash URLs (`/#/map`) so refreshes work on static hosting.
