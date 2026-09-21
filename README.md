# Test-Your-CK

A fast, bilingual cultural-knowledge quiz built from the Camellia benchmark. It is a static Preact/Vite site with deterministic challenges, offline caching, and no analytics or third-party runtime requests.

## Local development

```sh
npm install
npm run data:build
npm run dev
```

Run all checks with:

```sh
npm run data:validate
npm test
npm run build
```

## Data updates

Replace or update the Excel files in `entities/`, preserving their culture/type layout, then run `npm run data:build`, `npm run data:report`, and review `docs/DATA_REPORT.md`. Add unwanted values to `data-src/blocklist.txt` using normalized keys (lowercase, diacritics and non-alphanumerics removed).

## Configuration

Edit `public/site.config.json`. Poster voting and report-label links stay hidden until their URLs/numbers are configured. `rounds`, `timerSeconds`, and `minPool` are also configurable.

## GitHub Pages

In repository Settings → Pages, set Source to **GitHub Actions**. Push `main`; the workflow validates data, tests, builds, and deploys. For a custom path, set `BASE_PATH` for the Vite build.

**Dataset credit:** 
*Camellia: Benchmarking Cultural Biases in LLMs for Asian Languages*, arXiv:2510.05291. Data is provided under the MIT License at https://github.com/tareknaous/camellia.