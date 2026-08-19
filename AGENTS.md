# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **dependency-free static site** (plain HTML5 + CSS + vanilla JavaScript). There is no package manager, no build step, no backend, and no database. All state is client-side (`localStorage`). Production is GitHub Pages at `https://movtrength.github.io/-/`.

### Running locally
The only "service" is a static HTTP file server. Serve the repo root over HTTP (do not open via `file://`, because `ontology-plan.html` uses `fetch('ontology.json')` which requires same-origin HTTP):

```bash
python3 -m http.server 8000   # from repo root
```

Pages:
- `index.html` — Force Line Explorer (biomechanics tool)
- `today.html` — daily coaching sheet (open → today → close loop)
- `dashboard.html` — OS lab board
- `ontology-plan.html` — ontology plan + JSON download (fetches `ontology.json`)
- `ontology.html` — parked philosophy workshop
- `ontology.json` — machine-readable ontology data

### Lint / test / build
There are **no** lint, test, or build commands in this repo (no config for any). Do not invent them. "Building" is just serving the static files.

### Gotchas
- `ontology.json` and the JSON embedded in `ontology-plan.html` are intended to stay in sync when edited.
- `index.html` comments reference a `build-standalone.py` that is **not committed**; the committed `index.html` is the standalone explorer (Tab 1) and is self-contained.
