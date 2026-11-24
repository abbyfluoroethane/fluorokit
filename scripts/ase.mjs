// Adobe Swatch Exchange (.ase): one theme mode as a swatch file for
// Illustrator, InDesign and Photoshop. The swatches are sRGB process
// colors, in groups by role. The printer's profile turns them into CMYK
// when the document is exported, so no CMYK values are given here.
//
// The format: "ASEF", version 1.0, a block count, then blocks. A group
// opens with 0xC001 and closes with 0xC002. A color is 0x0001: its name
// (UTF-16BE), the model "RGB ", three float32 and a type (0 is global).
import { hex } from './color.mjs';

const GROUPS = [
  ['surfaces', ['base', 'mantle', 'deep', 'raised', 'line', 'overlay']],
  ['text', ['text', 'muted', 'on-accent']],
  ['accents', ['accent', 'bar-start', 'control-border']],
  ['status', ['status-error', 'status-warn', 'status-ok', 'status-info']],
  ['charts', ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']],
];

// A theme color as sRGB 0-1, or null for a color with alpha.
function rgbOf(value, colors) {
  const ref = /^var\(--fk-([a-z0-9-]+)\)$/.exec(value);
  if (ref) return rgbOf(colors[ref[1]], colors);
  const ok = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value);
  const h = ok ? hex(+ok[1], +ok[2], +ok[3]) : value;
  if (!/^#[0-9a-f]{6}$/i.test(h)) return null;
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

const name = (text) => {
  const b = Buffer.alloc(2 + (text.length + 1) * 2);
  b.writeUInt16BE(text.length + 1, 0);
  for (let i = 0; i < text.length; i++) b.writeUInt16BE(text.charCodeAt(i), 2 + i * 2);
  return b; // the last two bytes stay 0: the terminator
};
const block = (type, body) => {
  const head = Buffer.alloc(6);
  head.writeUInt16BE(type, 0);
  head.writeUInt32BE(body.length, 2);
  return Buffer.concat([head, body]);
};
const color = (label, [r, g, b]) => {
  const v = Buffer.alloc(4 + 12 + 2);
  v.write('RGB ', 0, 'ascii');
  [r, g, b].forEach((x, i) => v.writeFloatBE(x, 4 + i * 4));
  v.writeUInt16BE(0, 16);
  return block(0x0001, Buffer.concat([name(label), v]));
};

/**
 * The .ase file of one mode of a theme.
 * @param {object} theme a theme file (tokens/themes/*.json)
 * @param {string} key the mode, for example "teflon"
 * @returns {Buffer}
 */
export function aseOf(theme, key) {
  const mode = theme.modes[key];
  const groups = GROUPS.map(([group, tokens]) => [group, tokens.map((t) => [t, mode.colors[t]])]);
  if (mode.syntax) groups.push(['syntax', Object.entries(mode.syntax)]);
  if (theme.tiles) groups.push(['tiles', [...Object.entries(theme.tiles), ['tile-text', theme.tileText]]]);
  const blocks = [];
  for (const [group, entries] of groups) {
    const swatches = entries
      .map(([token, value]) => [token, value && rgbOf(value, mode.colors)])
      .filter(([, rgb]) => rgb);
    if (!swatches.length) continue;
    blocks.push(block(0xc001, name(`${theme.name} ${key} · ${group}`)));
    for (const [token, rgb] of swatches) {
      const h = '#' + rgb.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
      blocks.push(color(`${token} ${h}`, rgb));
    }
    blocks.push(block(0xc002, Buffer.alloc(0)));
  }
  const head = Buffer.alloc(12);
  head.write('ASEF', 0, 'ascii');
  head.writeUInt16BE(1, 4);
  head.writeUInt16BE(0, 6);
  head.writeUInt32BE(blocks.length, 8);
  return Buffer.concat([head, ...blocks]);
}
