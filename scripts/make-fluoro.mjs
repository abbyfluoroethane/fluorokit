// Writes the fluoro family of themes (tokens/themes/<name>.json) from an
// OKLCH recipe, and prints the contrast of each text and fill pair. Edit the
// recipe below, then run `node scripts/make-fluoro.mjs && npm run build`.
//
// The family shares its accents and tiles. The members differ in the base:
// - ink: almost black with a hint of blue. The pastels do the work.
// - blueberry: a saturated blue.
// - twilight: more violet, the nearest to Catppuccin Mocha but richer.
// - cobalt: a brighter blue, the nearest to a Windows 8 Start screen.
//
// What the family shares, next to Catppuccin:
// - The text is a pink-tinted white, not a blue one.
// - Two pastels do the decoration: light pink (the accent, the underline)
//   and light blue (focus, info). The energy bar runs light blue to pink.
// - Tiles are strong flat fills with white text, as on a Windows 8 Start
//   screen. Each is the lightest color of its hue that gives white text
//   TILE_MIN contrast.
import { writeFileSync } from 'node:fs';
import { MEMBERS, contrastReport, makeTheme } from './fluoro.mjs';

const themes = Object.entries(MEMBERS).map(([name, recipe]) => makeTheme(name, recipe));
let ok = true;
for (const theme of themes) {
  // tileMin is for the report only: it is not a part of a theme file.
  const { tileMin, ...file } = theme;
  writeFileSync(new URL(`../tokens/themes/${theme.name}.json`, import.meta.url), JSON.stringify(file, null, 2) + '\n');
  let mode = '';
  for (const row of contrastReport(theme)) {
    if (row.mode !== mode) console.log(`\n${theme.name} ${(mode = row.mode)}`);
    console.log(`${row.ok ? '    ' : 'LOW '}${row.label.padEnd(34)} ${row.ratio.toFixed(2)}  (min ${row.min})`);
    ok &&= row.ok;
  }
}
console.log(ok ? '\nAll pairs pass.' : '\nSome pairs are LOW.');
