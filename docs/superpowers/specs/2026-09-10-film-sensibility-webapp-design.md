# Film Sensibility Web App — Design Spec

**Date:** 2026-09-10  
**Status:** Approved (product conversation)  
**Platform:** Browser-only web app (Canvas 2D)

## Problem

Users want to apply a known iPhone Photos “필름감성” recipe to their own photos without manually dialing each slider in the Photos app.

## Solution

A single-page web app where the user uploads a photo, picks a preset (starting with one film recipe), and downloads a corrected image. All processing runs in the browser via Canvas 2D; photos never leave the device.

## Goals

- Upload an image and apply the film-sensibility recipe automatically
- Show before/after comparison
- Download the result as PNG
- Support adding more presets later from screenshots the owner provides
- Korean-first UI

## Non-goals (MVP)

- Exact pixel match to Apple Photos
- Account / cloud storage / server processing
- In-app preset editor for end users
- EXIF / Live Photo preservation
- Native iOS / Android apps

## Preset model

Presets are data, not hard-coded UI branches. Each preset is one object in a `presets` array.

```js
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
    noiseReduction: 47
  }
}
```

**Extension workflow:** Owner sends a screenshot of Photos settings → values are transcribed into a new preset object → UI lists the new choice. No admin UI in MVP.

### Initial preset values

| Control | Value |
|---|---|
| Filter: Dramatic (드라마틱) | 38 |
| Brilliance (휘도) | 20 |
| Highlights (하이라이트) | 33 |
| Shadows (그림자) | 20 |
| Contrast (대비) | -20 |
| Brightness (밝기) | -6 |
| Black Point (블랙 포인트) | -20 |
| Warmth (따뜻함) | 9 |
| Definition (명료도) | 14 |
| Noise Reduction (노이즈 감소) | 47 |

## Image pipeline

1. Load file via `<input type="file" accept="image/*">` and `createImageBitmap` / `Image`
2. Draw to a working canvas (max edge capped, e.g. 2048px, to keep mobile performance acceptable; download uses the processed canvas resolution)
3. Apply adjustments in a fixed order approximating iPhone Photos intent (not Apple’s private algorithms):
   - Dramatic filter (strength-scaled contrast + desaturation + mild tone curve)
   - Brilliance (midtone local contrast)
   - Highlights / Shadows (luma-weighted lifts/compressions)
   - Contrast / Brightness / Black Point
   - Warmth (RB channel bias)
   - Definition (unsharp / midtone contrast)
   - Noise Reduction (light blur with detail mix)
4. Present result; allow download of `image/png`

All iPhone slider values in `[-100, 100]` (filter amount `0–100`) are normalized to engine strengths in code so future presets reuse the same mapping.

## UI structure

One composition, mobile-first, Korean copy.

1. **Hero:** Brand name as primary signal (“필름감성” / Film Lab), one short supporting line, one upload CTA. Full-bleed atmospheric background (film grain / warm darkroom feel — not flat white, not purple gradient cliché).
2. **Workspace (after upload):** Before/after compare (slider or toggle), preset selector (one item now, list-ready), primary Download + secondary Replace photo.
3. **No cards in hero.** No stats strips, no marketing clutter.

Motion: page load reveal, compare-slider feedback, subtle grain/atmosphere — at least 2–3 intentional motions.

## Technical stack

- Static files under `film-app/`: `index.html`, `styles.css`, `presets.js`, `engine.js`, `app.js`
- No build step required; open via any static server
- Canvas 2D only; no WebGL, no backend

## Privacy

Processing is 100% client-side. Copy should state that photos are not uploaded to a server.

## Success criteria

- User can upload a JPEG/PNG/WebP, see a visibly corrected preview matching the film recipe direction, switch presets when more exist, and download PNG
- Adding a second preset requires only editing `presets.js` (plus optional label) without engine rewrites for known adjustment keys
- Works on current mobile and desktop browsers (Chrome, Safari, Firefox)
