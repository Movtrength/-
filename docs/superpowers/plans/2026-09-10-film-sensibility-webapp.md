# Film Sensibility Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a browser-only web app that applies the iPhone “필름감성” preset to an uploaded photo, with data-driven presets for later screenshot-based additions.

**Architecture:** Static `film-app/` SPA: preset data → Canvas 2D engine → UI (upload, compare, download). No server, no build step.

**Tech Stack:** HTML, CSS, vanilla JS, Canvas 2D API

## Global Constraints

- Client-side only; never upload image bytes to a server
- Presets live in `film-app/presets.js` as a data array
- Korean-first UI copy
- Max processing edge 2048px for performance
- Visual direction: warm darkroom / film lab (not purple-on-white, not cream+terracotta cliché, not broadsheet)
- Brand name must dominate the first viewport

---

### Task 1: Scaffold `film-app` shell and preset data

**Files:**
- Create: `film-app/index.html`
- Create: `film-app/styles.css`
- Create: `film-app/presets.js`
- Create: `film-app/engine.js` (stub export)
- Create: `film-app/app.js` (stub)

**Interfaces:**
- Produces: `export const PRESETS` array; first preset `id: "film-sensibility"`
- Produces: HTML structure with `#brand`, `#uploadInput`, `#presetSelect`, `#compare`, `#downloadBtn`

- [ ] **Step 1: Create `film-app/presets.js` with the approved recipe**

```js
/** @typedef {{ type: 'dramatic', amount: number }} FilmFilter */
/** @typedef {{
 *  brilliance: number, highlights: number, shadows: number,
 *  contrast: number, brightness: number, blackPoint: number,
 *  warmth: number, definition: number, noiseReduction: number
 * }} Adjustments */
/** @typedef {{ id: string, name: string, sourceNote?: string, filter: FilmFilter, adjustments: Adjustments }} Preset */

/** @type {Preset[]} */
export const PRESETS = [
  {
    id: "film-sensibility",
    name: "필름감성",
    sourceNote: "ica_j_kim iPhone film recipe",
    filter: { type: "dramatic", amount: 38 },
    adjustments: {
      brilliance: 20,
      highlights: 33,
      shadows: 20,
      contrast: -20,
      brightness: -6,
      blackPoint: -20,
      warmth: 9,
      definition: 14,
      noiseReduction: 47,
    },
  },
];

export function getPresetById(id) {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
```

- [ ] **Step 2: Create `film-app/index.html` shell**

Include Google Fonts (distinctive pair, e.g. "Syne" + "IBM Plex Sans KR"), link `styles.css`, modules for `app.js`. Structure:

- Header/hero: brand `필름감성`, one sentence, file input + label CTA
- Main (hidden until image): preset `<select id="presetSelect">`, compare stage, download / replace buttons
- Footer note: “사진은 기기 안에서만 처리됩니다”

- [ ] **Step 3: Create `styles.css` atmosphere**

CSS variables for warm charcoal base, amber accent, grain overlay via SVG/CSS noise, responsive layout. Hero is one composition; workspace appears after upload. Include 2–3 motions (fade-up on load, CTA hover, compare handle).

- [ ] **Step 4: Stub `engine.js` and `app.js`**

```js
// engine.js
export async function applyPreset(sourceBitmap, preset, maxEdge = 2048) {
  throw new Error("not implemented");
}
```

```js
// app.js
import { PRESETS, getPresetById } from "./presets.js";
import { applyPreset } from "./engine.js";

// wire DOM: populate presetSelect from PRESETS; defer processing to Task 3
```

- [ ] **Step 5: Smoke-open the page**

Run: `cd /workspace/film-app && python3 -m http.server 8765`  
Open `http://127.0.0.1:8765/` — hero and empty select populate without console errors (engine unused yet).

- [ ] **Step 6: Commit**

```bash
git add film-app docs/superpowers/specs/2026-09-10-film-sensibility-webapp-design.md
git commit -m "feat(film-app): scaffold shell and film-sensibility preset data"
```

---

### Task 2: Canvas engine approximating iPhone adjustments

**Files:**
- Modify: `film-app/engine.js`
- Create: `film-app/engine.test.html` (manual harness) OR keep verification manual via UI in Task 3

**Interfaces:**
- Consumes: `Preset` from `presets.js`
- Produces: `applyPreset(ImageBitmap|HTMLImageElement, Preset, maxEdge?: number): Promise<HTMLCanvasElement>`

- [ ] **Step 1: Implement size fit helper**

```js
function fitSize(w, h, maxEdge) {
  const edge = Math.max(w, h);
  if (edge <= maxEdge) return { w, h };
  const s = maxEdge / edge;
  return { w: Math.round(w * s), h: Math.round(h * s) };
}
```

- [ ] **Step 2: Implement pixel pipeline**

In `applyPreset`:

1. Create canvas at fitted size; `drawImage` source
2. `getImageData`
3. For each pixel (RGBA), convert to approx luma; apply in order:
   - `dramaticFilter(amount)` — contrast up, saturation down, scaled by `amount/100`
   - `brilliance`, `highlights`, `shadows` — luma-weighted curves; map slider `/100` to strength
   - `contrast`, `brightness`, `blackPoint`
   - `warmth` — shift R/B
   - Write back RGB clamped 0–255
4. Second pass or convolution for `definition` (unsharp mask) and `noiseReduction` (box/stack blur mix)
5. `putImageData`; return canvas

Normalize all sliders with `t = value / 100` so future presets share the same functions.

- [ ] **Step 3: Export `canvasToBlob(canvas): Promise<Blob>` for PNG download**

```js
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}
```

- [ ] **Step 4: Manual sanity check**

Serve `film-app`, call `applyPreset` from console on a test image (or temporary button). Expect warmer, slightly lifted blacks, softened contrast vs original — not a no-op and not clipped white.

- [ ] **Step 5: Commit**

```bash
git add film-app/engine.js
git commit -m "feat(film-app): add Canvas preset engine for iPhone-like adjustments"
```

---

### Task 3: App wiring — upload, compare, download, preset switch

**Files:**
- Modify: `film-app/app.js`
- Modify: `film-app/index.html` (compare markup if needed)
- Modify: `film-app/styles.css`

**Interfaces:**
- Consumes: `PRESETS`, `getPresetById`, `applyPreset`, `canvasToBlob`
- Produces: working UX end-to-end

- [ ] **Step 1: State and upload handler**

Keep `originalBitmap`, `processedCanvas`, `activePresetId`. On file change: revoke old object URLs, `createImageBitmap(file)`, run `applyPreset`, show workspace.

- [ ] **Step 2: Before/after compare UI**

Implement a range-input clip reveal (original under, processed over with `clip-path` or width %) so dragging shows original vs film look.

- [ ] **Step 3: Preset change + download + replace**

Changing `#presetSelect` re-runs engine on `originalBitmap`. Download uses `canvasToBlob` + temporary `<a download="film-sensibility.png">`. Replace clears state and returns focus to upload.

- [ ] **Step 4: Loading / error UX**

Disable controls while processing; on failure show Korean error (“이 이미지를 처리할 수 없습니다”) without throwing uncaught.

- [ ] **Step 5: Manual test checklist**

1. Upload JPEG → preview updates  
2. Drag compare → both sides visible  
3. Download PNG opens/saves  
4. Only one preset listed; select still works  
5. Mobile viewport (~390px) usable  

- [ ] **Step 6: Commit**

```bash
git add film-app
git commit -m "feat(film-app): wire upload, compare slider, download, and preset select"
```

---

### Task 4: Polish, root link, and preset-extension note

**Files:**
- Modify: `film-app/styles.css`, `film-app/index.html` as needed
- Create: `film-app/README.md`
- Modify: optional small link from repo root only if a natural entry exists without disturbing ontology pages — prefer documenting path in README only to avoid breaking existing `index.html`

**Interfaces:**
- Produces: README explaining how to add a preset from a screenshot

- [ ] **Step 1: Write `film-app/README.md`**

Include: how to run (`python3 -m http.server`), privacy note, and “새 프리셋 추가” — paste screenshot values into `presets.js` following the existing object shape.

- [ ] **Step 2: Visual polish pass**

Ensure brand dominates hero, grain/atmosphere present, motions work, no card clutter in hero.

- [ ] **Step 3: Final browser pass on desktop + narrow width**

- [ ] **Step 4: Commit**

```bash
git add film-app/README.md film-app
git commit -m "docs(film-app): README for local run and screenshot-based presets"
```

---

## Spec coverage

| Spec requirement | Task |
|---|---|
| Upload + auto recipe | 2, 3 |
| Before/after | 3 |
| PNG download | 2, 3 |
| Data-driven presets / screenshot workflow | 1, 4 |
| Korean UI + privacy copy | 1, 3 |
| Canvas-only, no server | 1–3 |
| Visual brand/atmosphere rules | 1, 4 |
