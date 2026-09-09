# Informado v3

Informado is an executive daily briefing with global context and a Payments specialization.

## What changed in v3

- Default view is now **All topics**, not Payments only.
- Adds global headline discovery from Reuters, The Wall Street Journal, Financial Times, Bloomberg and CNBC.
- Keeps Payments specialist and primary sources.
- Adds a dropdown showing every source and whether it is active, partial or unavailable.
- Adds content classification:
  - News
  - Official
  - Report
  - Insight
  - Update
- Removes common noise such as job postings, careers pages and generic documentation.
- Backend only returns items from the last 30 days.
- Adds a basic multi-source corroboration signal.
- The Paypers now uses indexed headline discovery rather than the broken legacy feed.

## Copyright / access approach

For indexed publishers such as Reuters, WSJ, Financial Times and Bloomberg, Informado stores and displays the headline plus an index link. It does not reproduce article bodies or subscriber-only content.

## Files to replace

- `index.html`
- `app.js`
- `styles.css`
- `netlify/functions/news.mjs`

`netlify.toml` and `package.json` can remain unchanged if your current versions already match the project.

## Test after deploy

Dashboard:
`https://informado.netlify.app/`

Backend:
`https://informado.netlify.app/.netlify/functions/news`

The JSON response should include:
- `meta.activeSources`
- `meta.totalSources`
- `meta.sources`
- `meta.candidateItems`
- `meta.returnedItems`
Cloudflare migration
