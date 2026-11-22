# AO Spatial Console — GitHub Pages deployment

This branch adds a GitHub Actions workflow that deploys the existing browser console
as a static site using the repository's geography files.

## Required one-time repository setting

After merging this pull request, open **Settings → Pages** for the repository and
set **Build and deployment → Source** to **GitHub Actions**. This is a repository
setting and cannot be changed with the available GitHub connector permissions.

## Deploy

- The workflow runs after pushes to `main` that touch `geography/**` or the deployment workflow.
- It can also be run manually from **Actions → Deploy AO Spatial Console to GitHub Pages → Run workflow**.
- The deployed page is `geography/ao-city-console.html` (the HTML is copied to the site root as `index.html`).

## Scope and caveats

- The deployment publishes the browser UI, not imported Houston GIS datasets.
- Imported GIS data and AO street aliases remain local to each browser unless separately exported/imported.
- The UI uses OpenStreetMap tiles and Leaflet from a CDN.
- GPS requires the browser's location permission and HTTPS.
- No AO Kernel, WorldHeart, Supabase or authoritative movement connection is added by this deployment.
