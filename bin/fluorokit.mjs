#!/usr/bin/env node
// fluorokit theme --preset <code> [--name <name>] [--format shadcn|css|json] [--out <file>]
// Writes the theme of a preset from the create page. With no --out, it
// prints the theme.
import { writeFileSync } from 'node:fs';
import { decodePreset, themeOf } from '../dist/tools/presets.mjs';
import { themeCss } from '../dist/tools/theme-css.mjs';

const USAGE = `Usage: fluorokit theme --preset <code> [--name <name>] [--format shadcn|css|json] [--out <file>]

  --preset   the code from the create page, for example f090000
  --name     the name of the theme (default: custom)
  --format   shadcn: CSS with the shadcn variable names (default)
             css:    CSS with the fluorokit variables only
             json:   a theme file for tokens/themes/ of the kit
  --out      the file to write. With no --out, the theme is printed.`;

const [command, ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i += 2) {
  if (!rest[i].startsWith('--') || rest[i + 1] === undefined) {
    console.error(USAGE);
    process.exit(1);
  }
  flags[rest[i].slice(2)] = rest[i + 1];
}
if (command !== 'theme' || !flags.preset) {
  console.error(USAGE);
  process.exit(command === undefined || command === 'help' ? 0 : 1);
}
const choice = decodePreset(flags.preset);
if (!choice) {
  console.error(`"${flags.preset}" is not a preset code. Copy the code from the create page.`);
  process.exit(1);
}
const format = flags.format ?? 'shadcn';
if (!['shadcn', 'css', 'json'].includes(format)) {
  console.error(`--format must be shadcn, css or json, not "${format}".`);
  process.exit(1);
}
const name = (flags.name ?? 'custom').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom';
const theme = themeOf(choice, name);
const { tileMin, ...file } = theme;
const text = format === 'json' ? JSON.stringify(file, null, 2) + '\n' : themeCss(theme, format === 'shadcn');
if (flags.out) {
  writeFileSync(flags.out, text);
  console.error(`Wrote the ${name} theme (${flags.preset}) to ${flags.out}`);
} else {
  process.stdout.write(text);
}
