# Informado — Payments dashboard

This package replaces the WSJ-only version with a multi-source Payments dashboard.

## Sources connected

### Direct RSS / Atom
- Finextra — Payments
- Finextra — Wholesale
- Finextra — Risk & Regulation
- Payments Dive
- BIS / CPMI (BIS media releases)
- Bank of Canada press releases
- Wise Newsroom / Wise Platform
- The Paypers headline feed

### Headline discovery links
For sources without a public feed used by this project, Informado uses a Google News RSS index restricted to the source/domain. The dashboard does not scrape those sites.

- Reuters — headline + link only; no Reuters summary/content is reproduced
- SWIFT
- J.P. Morgan Payments
- Mastercard / Mastercard Move
- Payments Canada
- ISO 20022

For indexed sources, the displayed link can pass through Google News before opening the source article.

## Files

- `index.html` — dashboard markup
- `styles.css` — dashboard styles
- `app.js` — filters, scoring, sections and rendering
- `netlify/functions/news.mjs` — source aggregation function
- `netlify.toml` — Netlify build/functions configuration
- `package.json` — minimal build signal for Netlify
- `README.md` — this file

## Deploy to the existing Netlify site

1. Unzip the package.
2. Open your existing **Informado** project in Netlify.
3. Go to **Deploys / Production deploys**.
4. Drag the entire `informado-netlify` folder into the deploy dropzone while logged in.
5. Wait for the build to finish.
6. Open:
   - `/` for the dashboard
   - `/.netlify/functions/news` to confirm the backend returns JSON

You do not need API keys for this version.

## Important

Do not upload only `index.html`, `app.js` and `styles.css`. The live sources depend on `netlify/functions/news.mjs`, so deploy the whole folder.
