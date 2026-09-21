# Decisions

- The pre-supplied `entities/` directory is treated as the vendored source rather than cloning a duplicate. It is read-only; generated JSON lives in `public/data/`.
- Pakistani beverages are below `minPool` after cleaning, so the engine omits that group for Pakistani games and redistributes its two rounds across eligible groups, capped at three rounds each.
- Data files are fetched only when a culture is selected. The game loads all seven compact pools then because every difficulty can require multiple Asian distractor cultures.
- The default Pages base is `/Test-Your-CK/`; deployments under another path set `BASE_PATH`.
- Sound remains off by default. Relaxed mode, language, and difficulty persist locally.
- Challenge scores and names are deliberately trust-based and stored only in the URL hash.
- The service worker caches the shell and each same-origin data response as it is used. Therefore a culture played once is playable offline afterward.
