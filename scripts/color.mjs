// OKLCH color math for the theme recipes.

// ---- color math: OKLCH to sRGB hex, with the chroma reduced to fit sRGB ----
const toLinear = (L, C, h) => {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};
const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);
export const hex = (L, C, h) => {
  let c = C;
  while (c > 0 && !inGamut(toLinear(L, c, h))) c -= 0.002;
  return (
    '#' +
    toLinear(L, Math.max(c, 0), h)
      .map((v) => {
        const x = Math.min(1, Math.max(0, v));
        const g = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
        return Math.round(g * 255).toString(16).padStart(2, '0');
      })
      .join('')
  );
};
const luminance = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// The lightest color of a hue, at or below `from`, that has `min` contrast
// with `against`. Equal OKLCH lightness is not equal contrast (a yellow is
// brighter than a blue), so the fills are solved, not set.
export const fit = (from, C, h, against, min) => {
  let L = from;
  while (L > 0.3 && contrast(hex(L, C, h), against) < min) L -= 0.002;
  return hex(L, C, h);
};

