// Presets: a theme of the fluoro family from six named choices, and a short
// code for the set of choices. The create page of the site and the
// fluorokit command both use this. It reads no files.
import { hex } from './color.mjs';
import { DEFAULTS, MEMBERS, makeTheme } from './fluoro.mjs';

const HUES = [
  ['pink', 'Pink', 350], ['rose', 'Rose', 10], ['red', 'Red', 25], ['orange', 'Orange', 50],
  ['amber', 'Amber', 80], ['lime', 'Lime', 125], ['green', 'Green', 150], ['mint', 'Mint', 170],
  ['teal', 'Teal', 195], ['sky', 'Sky', 232], ['blue', 'Blue', 258], ['indigo', 'Indigo', 278],
  ['violet', 'Violet', 300], ['fuchsia', 'Fuchsia', 325],
].map(([id, name, h]) => ({ id, name, h, swatch: hex(0.74, 0.14, h) }));

const base = (id, name, recipe) => ({ id, name, recipe, swatch: hex(recipe.dark.L + 0.08, recipe.dark.c * 1.13, recipe.dark.h) });

// The choices, in the order of the code. Add new options at the end of a
// list, so that old codes keep their meaning.
export const OPTIONS = {
  base: [
    base('ink', 'Ink', MEMBERS.ink),
    base('blueberry', 'Blueberry', MEMBERS.blueberry),
    base('twilight', 'Twilight', MEMBERS.twilight),
    base('cobalt', 'Cobalt', MEMBERS.cobalt),
    base('graphite', 'Graphite', { dark: { h: 270, c: 0.004, L: 0.2, textH: 270, textC: 0.004 }, light: { c: 0.001, textL: 0.25, textC: 0.005 } }),
    base('moss', 'Moss', { dark: { h: 155, c: 0.035, L: 0.22, textH: 120, textC: 0.015 }, light: { c: 0.008, textL: 0.3, textC: 0.05 } }),
    base('cocoa', 'Cocoa', { dark: { h: 50, c: 0.03, L: 0.22, textH: 70, textC: 0.02 }, light: { c: 0.01, textL: 0.3, textC: 0.04 } }),
    base('plum', 'Plum', { dark: { h: 335, c: 0.035, L: 0.23, textH: 340, textC: 0.02 }, light: { c: 0.008, textL: 0.33, textC: 0.06 } }),
  ],
  accent: HUES,
  second: HUES,
  text: [
    { id: 'base', name: 'From the base', tint: null },
    { id: 'pink', name: 'Pink white', tint: { textH: 340, textC: 0.02 } },
    { id: 'warm', name: 'Warm white', tint: { textH: 75, textC: 0.02 } },
    { id: 'cool', name: 'Cool white', tint: { textH: 240, textC: 0.02 } },
    { id: 'plain', name: 'Plain white', tint: { textH: 0, textC: 0 } },
  ],
  tiles: [
    { id: 'bright', name: 'Bright', min: 3.5 },
    { id: 'balanced', name: 'Balanced', min: 4.5 },
    { id: 'deep', name: 'Deep', min: 7 },
  ],
  font: [
    { id: 'plex', name: 'IBM Plex Sans', sans: 'IBM Plex Sans' },
    { id: 'selawik', name: 'Selawik', sans: 'Selawik' },
    { id: 'system', name: 'System', sans: 'system' },
  ],
};
export const KEYS = ['base', 'accent', 'second', 'text', 'tiles', 'font'];
export const DEFAULT = { base: 'ink', accent: 'pink', second: 'sky', text: 'base', tiles: 'bright', font: 'plex' };

const find = (key, id) => OPTIONS[key].find((o) => o.id === id) ?? OPTIONS[key][0];

/** The recipe (for makeTheme) of a set of choices. */
export function recipeOf(choice) {
  const b = find('base', choice.base).recipe;
  const tint = find('text', choice.text).tint;
  return {
    about: `preset ${encodePreset(choice)}`,
    dark: { ...b.dark, ...(tint ?? {}) },
    light: { ...b.light },
    accentH: find('accent', choice.accent).h,
    secondH: find('second', choice.second).h,
    tileMin: find('tiles', choice.tiles).min,
    sans: find('font', choice.font).sans ?? DEFAULTS.sans,
  };
}

/** The theme of a set of choices. */
export const themeOf = (choice, name = 'custom') => makeTheme(name, recipeOf(choice));

// The code: "f", then one base-36 digit for each choice, in the order of KEYS.
export function encodePreset(choice) {
  return 'f' + KEYS.map((key) => Math.max(0, OPTIONS[key].findIndex((o) => o.id === choice[key])).toString(36)).join('');
}
/** The choices of a code, or null if the code is not a preset. */
export function decodePreset(code) {
  const text = String(code ?? '').trim().replace(/^--preset\s+/, '').toLowerCase();
  if (!/^f[0-9a-z]+$/.test(text) || text.length !== KEYS.length + 1) return null;
  const choice = {};
  for (const [i, key] of KEYS.entries()) {
    const option = OPTIONS[key][parseInt(text[i + 1], 36)];
    if (!option) return null;
    choice[key] = option.id;
  }
  return choice;
}
