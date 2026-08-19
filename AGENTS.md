# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
A **static, client-only** site (no build system, no package manager, no backend, no database). Every page is a self-contained HTML file with inline CSS and vanilla JavaScript; state persists in the browser's `localStorage`. All files live at the repository root.

Pages:
- `index.html` — 힘선 탐색기 (Force-Line Explorer), the primary biomechanics calculator. Flagged **do-not-edit** in `ontology.json`.
- `today.html` — daily coaching-loop app (열기 → 오늘 → 닫기); persists to `localStorage` keys `ontoOpen`, `ontoClose`, `ontoClose_<date>`.
- `dashboard.html` — ontology dashboard/board.
- `ontology-plan.html` — download page that calls `fetch('ontology.json')`.
- `ontology.html` — parked 12-tab workshop. Flagged **do-not-overwrite**.
- `ontology.json`, `지금.md` — data/spec.

### Running it (the only "service")
There is no install step and nothing to build. Serve the repo root over HTTP and open pages in a browser:

```bash
python3 -m http.server 8000   # from /workspace
# http://localhost:8000/index.html, /today.html, /dashboard.html, /ontology-plan.html
```

Start the static server as a long-running process (e.g. a `terminals`/`start` entry or a tmux session), not in `install`.

### Non-obvious gotchas
- `ontology-plan.html` uses `fetch('ontology.json')`, which fails under `file://` (same-origin/CORS). It **must** be served over `http://`. All other pages work from `file://`, but always use the HTTP server for consistency.
- App state lives entirely in browser `localStorage`. To reset a page's state, clear site data / `localStorage` in the browser, not the filesystem.
- In production (GitHub Pages, repo name `-`) links resolve under `/-/...`; locally just serve the repo root so relative links work.
- No linters, tests, or CI are configured. "Lint/test/build" have no repo commands — the only verification is serving the files and exercising them in a browser.
