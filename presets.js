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
