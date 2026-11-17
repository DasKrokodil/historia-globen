// Färgberäkning för proven (#1318): kontrast enligt WCAG, simulerad färgblindhet och färgskillnad. Ingen kod i sidan använder den;
// filen delas av tests/farger.test.mjs och webbläsartestet (tests/webblasare.mjs). Heter inte *.test.mjs, så node --test hoppar över den.
//
// - Kontrast: relativ luminans enligt WCAG 2.x, (ljusare + 0,05) / (mörkare + 0,05).
// - Färgblindhet: Machado, Oliveira och Fernandes (2009), fullt bortfall (severity 1.0), räknat i linjärt RGB.
// - Färgskillnad: CIEDE2000 (ΔE00) i CIELAB med D65. ΔE00 under cirka 3 ses knappt, 5–6 ses tydligt sida vid sida, och 10 eller mer
//   är ett säkert avstånd också för små markörer. Därför är provens gränser skrivna i ΔE00 och inte i CIE76.

/** '#rrggbb' → [r, g, b] (0–255). */
export const hexToRgb = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const toLinear = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const fromLinear = v => { v = Math.min(1, Math.max(0, v)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055); };

export const SYNER = ['deuteranopi', 'protanopi', 'tritanopi'];
const MATRISER = {
  protanopi: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopi: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritanopi: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
/** Hur en färg ser ut utan en sorts tappar (null = normalt färgseende). */
export function simulera(rgb, typ) {
  if (!typ) return rgb;
  const l = rgb.map(toLinear);
  return MATRISER[typ].map(r => fromLinear(r[0] * l[0] + r[1] * l[1] + r[2] * l[2]));
}

export const luminans = rgb => { const [r, g, b] = rgb.map(toLinear); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const kontrast = (a, b) => { const x = luminans(a), y = luminans(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/** Blandar a över b med täckningen t (0–1). */
export const blanda = (a, b, t) => a.map((v, i) => v * t + b[i] * (1 - t));

export function lab(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047, Y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b, Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883;
  const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIEDE2000 mellan två Lab-färger. */
export function deltaE00(l1, l2) {
  const rad = d => d * Math.PI / 180, grader = r => r * 180 / Math.PI;
  const [L1, a1, b1] = l1, [L2, a2, b2] = l2;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1, ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const hp = (b, a) => (b === 0 && a === 0) ? 0 : (grader(Math.atan2(b, a)) + 360) % 360;
  const hp1 = hp(b1, ap1), hp2 = hp(b2, ap2);
  const dLp = L2 - L1, dCp = Cp2 - Cp1;
  let dhp = 0;
  if (Cp1 * Cp2 !== 0) { dhp = hp2 - hp1; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(rad(dhp / 2));
  const Lpm = (L1 + L2) / 2, Cpm = (Cp1 + Cp2) / 2;
  let hpm = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) hpm = Math.abs(hp1 - hp2) <= 180 ? (hp1 + hp2) / 2 : (hp1 + hp2 < 360 ? (hp1 + hp2 + 360) / 2 : (hp1 + hp2 - 360) / 2);
  const T = 1 - 0.17 * Math.cos(rad(hpm - 30)) + 0.24 * Math.cos(rad(2 * hpm)) + 0.32 * Math.cos(rad(3 * hpm + 6)) - 0.20 * Math.cos(rad(4 * hpm - 63));
  const dTheta = 30 * Math.exp(-(((hpm - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
  const Sl = 1 + 0.015 * (Lpm - 50) ** 2 / Math.sqrt(20 + (Lpm - 50) ** 2), Sc = 1 + 0.045 * Cpm, Sh = 1 + 0.015 * Cpm * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

/** Färgskillnaden (ΔE00) mellan två '#rrggbb' så som de ser ut med typ (null = normalt färgseende). */
export const skillnad = (hexA, hexB, typ = null) => deltaE00(lab(simulera(hexToRgb(hexA), typ)), lab(simulera(hexToRgb(hexB), typ)));
/** Den lägsta skillnaden över de tre sorternas färgblindhet. */
export const skillnadFargblind = (hexA, hexB) => Math.min(...SYNER.map(t => skillnad(hexA, hexB, t)));
