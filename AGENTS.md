# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **fully static site** (no build step, no package manager, no
backend, no tests, no lint config). It is a set of self-contained HTML files with
inline CSS and vanilla JavaScript, published via GitHub Pages at
`https://movtrength.github.io/-/`.

Files:
- `index.html` — 힘선 탐색기 (muscle force-line / moment-arm explorer). Interactive
  calculator with preset selector, a `φ` joint-angle slider, live SVG visualization,
  and a prediction quiz. This is the main app.
- `today.html`, `dashboard.html` — "MOVT OS" ontology dashboards.
- `ontology.html`, `ontology-plan.html` — ontology reference/plan pages.
- `ontology.json` — data backing the ontology pages.
- `지금.md` — Korean feedback/notes doc.

### Running (development)
There are no dependencies to install. Serve the files with any static file server
from the repo root, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. Editing any HTML file and reloading
the browser is the full dev loop — there is no hot-reload/watcher and none is needed.

### Lint / test / build
None exist. There is no linter, no test suite, and no build/bundling step. Do not
add one unless explicitly requested. "Building" this project just means the raw HTML
files are served as-is (GitHub Pages does the same).
