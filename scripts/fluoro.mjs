// The recipe of the fluoro family: a theme from a few numbers. It reads no
// files, so that a page can use it in the browser. scripts/make-fluoro.mjs
// writes the members of the family with it.
import { contrast, fit, hex } from './color.mjs';

// ---- the recipe ----
// The defaults of a member. A recipe can change them.
export const DEFAULTS = { accentH: 350, secondH: 232, tileMin: 3.5, sans: 'IBM Plex Sans' };
const HUES = { error: 20, warn: 90, ok: 160, blue: 262, mauve: 320 };

// Each member: the hue, chroma and lightness of the dark base, the hue and
// chroma of the dark text, then the chroma of the light base and the
// lightness and chroma of the light text.
export const MEMBERS = {
  ink: {
    about: 'almost black with a hint of blue',
    dark: { h: 270, c: 0.02, L: 0.19, textH: 340, textC: 0.015 },
    light: { c: 0.004, textL: 0.27, textC: 0.03 },
  },
  blueberry: {
    about: 'a saturated blue',
    dark: { h: 268, c: 0.075, L: 0.25, textH: 340, textC: 0.02 },
    light: { c: 0.01, textL: 0.38, textC: 0.1 },
  },
  twilight: {
    about: 'a rich violet, the nearest to Catppuccin Mocha',
    dark: { h: 288, c: 0.07, L: 0.25, textH: 320, textC: 0.025 },
    light: { c: 0.01, textL: 0.38, textC: 0.09 },
  },
  cobalt: {
    about: 'a brighter blue, the nearest to a Windows 8 Start screen',
    dark: { h: 262, c: 0.11, L: 0.3, textH: 340, textC: 0.02 },
    light: { c: 0.016, textL: 0.36, textC: 0.13 },
  },
};

// Tile fills: strong and flat, the same in each mode, with white text. Each
// is the lightest color of its hue that gives the text `min` contrast. The
// names are the Catppuccin accent names; pink and sky follow the accents.
const TILE_TEXT = '#ffffff';
const tileFills = (PINK, SKY, min) => {
  const hues = {
    rosewater: [15, 0.1], flamingo: [5, 0.14], pink: [PINK, 0.19], mauve: [310, 0.19],
    red: [20, 0.21], maroon: [0, 0.18], peach: [45, 0.17], yellow: [80, 0.14],
    green: [150, 0.16], teal: [200, 0.11], sky: [SKY, 0.14], sapphire: [245, 0.16],
    blue: [258, 0.2], lavender: [280, 0.17],
  };
  return Object.fromEntries(Object.entries(hues).map(([name, [h, c]]) => [name, fit(0.75, c, h, TILE_TEXT, min)]));
};

/**
 * Make a theme of the family from a recipe.
 * @param {string} name
 * @param {object} recipe { about, dark: { h, c, L, textH, textC }, light: { c, textL, textC }, accentH?, secondH?, tileMin?, sans? }
 */
export function makeTheme(name, recipe) {
  const { about = 'a member of the fluoro family', dark: d, light: l } = recipe;
  const { accentH: PINK, secondH: SKY, tileMin, sans } = { ...DEFAULTS, ...recipe };
  const tiles = tileFills(PINK, SKY, tileMin);
  // Freon: the dark mode and the default. The surfaces are steps of
  // lightness from the base.
  const freon = {
    base: hex(d.L, d.c, d.h),
    mantle: hex(d.L - 0.03, d.c * 0.93, d.h),
    deep: hex(d.L - 0.06, d.c * 0.85, d.h),
    raised: hex(d.L + 0.08, d.c * 1.13, d.h),
    line: hex(d.L + 0.16, d.c * 1.13, d.h),
    overlay: hex(d.L + 0.32, d.c, d.h),
    text: hex(0.94, d.textC, d.textH),
    muted: hex(0.8, Math.min(d.c * 0.7, 0.05), d.h + 7),
    accent: hex(0.86, 0.08, PINK),
    'bar-start': hex(0.84, 0.08, SKY),
    'control-border': hex(Math.max(d.L + 0.39, 0.64), Math.min(d.c, 0.07), d.h),
    'status-error': hex(0.76, 0.13, HUES.error),
    'status-warn': hex(0.9, 0.1, HUES.warn),
    'status-ok': hex(0.87, 0.1, HUES.ok),
    'status-info': hex(0.84, 0.08, SKY),
    'chart-1': hex(0.78, 0.1, HUES.blue),
    'chart-2': hex(0.78, 0.11, HUES.mauve),
    'chart-3': hex(0.7, Math.min(d.c, 0.04), d.h),
  };
  // Teflon: the light mode.
  const base = hex(0.972, l.c, d.h);
  // A fill on the light base must have 3:1 with it (the status square, the
  // underline).
  const onLight = (L, C, h) => fit(L, C, h, base, 3.05);
  const teflon = {
    base,
    mantle: hex(0.945, l.c * 1.2, d.h),
    deep: hex(0.92, l.c * 1.6, d.h),
    raised: hex(0.875, l.c * 2, d.h),
    line: hex(0.825, l.c * 2.4, d.h),
    overlay: hex(0.71, l.c * 3, d.h),
    text: hex(l.textL, l.textC, d.h),
    muted: hex(l.textL + 0.09, l.textC * 0.8, d.h),
    accent: onLight(0.72, 0.15, PINK),
    'bar-start': hex(0.74, 0.12, SKY),
    'control-border': hex(0.58, Math.min(l.c * 4.5, 0.045), d.h),
    'status-error': hex(0.56, 0.2, HUES.error),
    'status-warn': onLight(0.74, 0.14, 80),
    'status-ok': onLight(0.66, 0.13, HUES.ok),
    'status-info': onLight(0.66, 0.13, SKY),
    'chart-1': hex(0.56, 0.19, HUES.blue),
    'chart-2': hex(0.56, 0.19, HUES.mauve),
    'chart-3': hex(0.58, Math.min(l.c * 4.5, 0.045), d.h),
  };
  // Syntax colors for code, which sits on mantle. Pink keywords, mint
  // strings, light blue functions: the accents of the family.
  const freonSyntax = {
    comment: hex(0.7, Math.min(d.c, 0.03), d.h),
    punctuation: freon.muted,
    keyword: hex(0.82, 0.11, PINK),
    string: hex(0.86, 0.1, HUES.ok),
    number: hex(0.84, 0.1, 60),
    constant: hex(0.8, 0.11, 310),
    function: hex(0.82, 0.09, SKY),
    type: hex(0.89, 0.09, HUES.warn),
    tag: hex(0.82, 0.11, PINK),
    attribute: hex(0.82, 0.09, SKY),
  };
  const onMantle = (L, C, h) => fit(L, C, h, teflon.mantle, 4.6);
  const teflonSyntax = {
    comment: onMantle(0.56, Math.min(l.c * 4.5, 0.03), d.h),
    punctuation: teflon.muted,
    keyword: onMantle(0.58, 0.19, PINK),
    string: onMantle(0.58, 0.14, 155),
    number: onMantle(0.6, 0.16, 50),
    constant: onMantle(0.56, 0.2, 310),
    function: onMantle(0.56, 0.16, 245),
    type: onMantle(0.62, 0.13, 80),
    tag: onMantle(0.58, 0.19, PINK),
    attribute: onMantle(0.56, 0.16, 245),
  };
  const INK = hex(0.16, Math.min(d.c, 0.03), d.h); // text on a pastel or a bright fill
  const mode = (colorScheme, c, extra, syntax) => ({
    colorScheme,
    ...(syntax && { syntax }),
    colors: {
      base: c.base, mantle: c.mantle, deep: c.deep, raised: c.raised, line: c.line, overlay: c.overlay,
      text: c.text, muted: c.muted,
      accent: c.accent, 'on-accent': INK,
      'link-underline': 'var(--fk-accent)',
      'bar-start': c['bar-start'], 'bar-end': 'var(--fk-accent)',
      focus: c.text, 'control-border': c['control-border'],
      hover: c.deep, selection: c.deep, disabled: c['control-border'],
      'status-error': c['status-error'], 'on-error': INK,
      'status-warn': c['status-warn'], 'on-warn': INK,
      'status-ok': c['status-ok'], 'on-ok': INK,
      'status-info': c['status-info'], 'on-info': INK,
      'chart-1': c['chart-1'], 'chart-2': c['chart-2'], 'chart-3': c['chart-3'],
      ...extra,
    },
  });
  return {
    name,
    description: `The fluoro family, ${name}: ${about}. Light pink and light blue accents, strong tiles with white text. Generated by scripts/make-fluoro.mjs.`,
    default: 'freon',
    followSystem: true,
    print: 'paper',
    fonts: {
      'font-sans': sans === 'system' ? 'system-ui, sans-serif' : `"${sans}", system-ui, sans-serif`,
      'font-serif': '"IBM Plex Serif", Georgia, serif',
      'font-mono': '"IBM Plex Mono", ui-monospace, monospace',
    },
    tiles,
    tileText: TILE_TEXT,
    tileMin,
    modes: {
      freon: mode('dark', freon, { focus: freon['bar-start'], hover: freon.line, selection: freon.line }, freonSyntax),
      teflon: mode('light', teflon, { 'on-error': teflon.base }, teflonSyntax),
      paper: mode('light', teflon, { text: INK, muted: hex(0.4, Math.min(d.c, 0.03), d.h), focus: INK, 'on-error': teflon.base }),
    },
  };
}

/**
 * The contrast of each text and fill pair of a theme.
 * @returns {{ mode: string, label: string, ratio: number, min: number, ok: boolean }[]}
 */
export function contrastReport(theme) {
  const rows = [];
  for (const [mode, m] of Object.entries(theme.modes)) {
    const c = m.colors;
    const row = (label, fg, bg, min) => {
      const ratio = contrast(fg, bg);
      rows.push({ mode, label, ratio, min, ok: ratio >= min });
    };
    for (const bg of ['base', 'mantle', 'deep']) {
      row(`text on ${bg}`, c.text, c[bg], 4.5);
      row(`muted on ${bg}`, c.muted, c[bg], 4.5);
    }
    row('text on raised', c.text, c.raised, 4.5);
    row('text on hover', c.text, c.hover, 4.5);
    row('control-border on base', c['control-border'], c.base, 3);
    row('accent (underline) on base', c.accent, c.base, 3);
    row('focus on base', c.focus, c.base, 3);
    for (const [token, color] of Object.entries(m.syntax ?? {})) row(`code ${token} on mantle`, color, c.mantle, 4.5);
    for (const s of ['error', 'warn', 'ok', 'info']) {
      row(`on-${s} on status-${s}`, c[`on-${s}`], c[`status-${s}`], 4.5);
      row(`status-${s} (square) on base`, c[`status-${s}`], c.base, 3);
    }
  }
  for (const [name, fill] of Object.entries(theme.tiles ?? {})) {
    rows.push({ mode: 'tiles', label: `white text on ${name}`, ratio: contrast(theme.tileText, fill), min: theme.tileMin ?? 3.5, ok: contrast(theme.tileText, fill) >= (theme.tileMin ?? 3.5) - 0.005 });
  }
  return rows;
}
