// Rikets kurva (#77): hur stor ytan på kartan var över tid, ritad som inline-SVG i faktarutan (UI, inte på klotet).
// Ytan är areaKm2 i rikets perioder (data/empires/<rike>.json). Består riket av flera polities (Rom: republik,
// kejsardöme, Väst och Öst) läggs ytorna ihop per år, så att kurvan visar hela riket. År utan någon period
// (uppehåll, till exempel mellan Egyptens riken) ritas som glapp, inte som noll.
import { formatYear } from '../model.js';

const W = 320, H = 88, PAD_L = 4, PAD_R = 4, TOP = 16, BASE = 72; // viewBox; kurvan ligger mellan TOP och BASE, årtalen under
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Ytan i läsbar form: "5,3 milj. km²" eller "694 000 km²". */
export function formatArea(km2) {
  if (km2 >= 1e6) return `${(km2 / 1e6).toLocaleString('sv-SE', { maximumFractionDigits: 1 })} milj. km²`;
  if (km2 < 10000) return `${Math.round(km2).toLocaleString('sv-SE')} km²`;
  return `${(Math.round(km2 / 1000) * 1000).toLocaleString('sv-SE')} km²`;
}

/**
 * Rikets yta som steg: [{ a, b, area }] där ytan gäller åren a till b-1. Perioderna är inklusive (start..end),
 * så en period täcker [start, end+1). Delarna av riket läggs ihop; intervall utan period finns inte med (glapp).
 */
export function areaSegments(polities) {
  const periods = polities.flatMap(p => p.periods ?? []).filter(p => p.areaKm2 > 0);
  const cuts = [...new Set(periods.flatMap(p => [p.start, p.end + 1]))].sort((x, y) => x - y);
  const segs = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i], b = cuts[i + 1];
    const area = periods.filter(p => p.start <= a && p.end + 1 >= b).reduce((s, p) => s + p.areaKm2, 0);
    if (!area) continue;
    const last = segs.at(-1);
    if (last && last.b === a && last.area === area) last.b = b; else segs.push({ a, b, area });
  }
  return segs;
}

/** Runda årtal på axeln, i vanlig årsräkning (500 f.Kr., 1000), omräknat till astronomiska år. */
function ticks(from, to) {
  const raw = (to - from) / 6, pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map(m => m * pow).find(s => s >= raw);
  const out = [];
  for (let n = step; 1 - n >= from - step; n += step) if (1 - n >= from && 1 - n <= to) out.push(1 - n); // f.Kr.
  for (let n = step; n <= to; n += step) if (n >= from) out.push(n); // e.Kr.
  return out.sort((x, y) => x - y);
}

/** Bygger kurvan för ett rike. Returnerar null om det inte finns någon yta. */
export function buildAreaCurve(polities, { from, to, color, multi = polities.length > 1 }) {
  const segs = areaSegments(polities);
  if (!segs.length) return null;
  const x0 = Math.min(from, segs[0].a), x1 = Math.max(to + 1, segs.at(-1).b);
  const peak = segs.reduce((m, s) => (s.area > m.area ? s : m));
  const X = y => PAD_L + (y - x0) / (x1 - x0) * (W - PAD_L - PAD_R);
  const Y = v => BASE - v / (peak.area * 1.04) * (BASE - TOP);
  // Sammanhängande körningar blir egna figurer; ett glapp bryter figuren
  const runs = [];
  for (const s of segs) { const r = runs.at(-1); if (r && r.at(-1).b === s.a) r.push(s); else runs.push([s]); }
  const fmt = n => n.toFixed(1);
  const paths = runs.map(r => {
    let top = `M${fmt(X(r[0].a))},${fmt(Y(r[0].area))}`;
    r.forEach((s, i) => { top += `H${fmt(X(s.b))}${r[i + 1] ? `V${fmt(Y(r[i + 1].area))}` : ''}`; });
    return `<path class="ac-fill" d="${top}V${BASE}H${fmt(X(r[0].a))}Z"/><path class="ac-line" d="${top}"/>`;
  }).join('');
  const tk = ticks(x0, x1 - 1).map(y => {
    const x = X(y), anchor = x < 28 ? 'start' : x > W - 28 ? 'end' : 'middle';
    return `<line class="ac-tick" x1="${fmt(x)}" x2="${fmt(x)}" y1="${BASE}" y2="${BASE + 3}"/><text class="ac-t" x="${fmt(x)}" y="${H - 4}" text-anchor="${anchor}">${esc(formatYear(y))}</text>`;
  }).join('');
  const px = X(peak.a + (peak.b - peak.a) / 2), peakAnchor = px < 100 ? 'start' : px > W - 100 ? 'end' : 'middle';
  const peakX = peakAnchor === 'start' ? Math.max(px - 2, PAD_L) : peakAnchor === 'end' ? Math.min(px + 2, W - PAD_R) : px;
  const peakText = `Störst ${formatArea(peak.area)}, ${peak.b - peak.a > 1 ? 'från ' : ''}år ${formatYear(peak.a)}`;
  const label = `Rikets yta över tid${multi ? ' (summa av rikets delar)' : ''}, störst ${formatArea(peak.area)} år ${formatYear(peak.a)}`;
  const svg = `<svg class="ac-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}" style="--ac:${esc(color)}">
    <line class="ac-base" x1="${PAD_L}" x2="${W - PAD_R}" y1="${BASE}" y2="${BASE}"/>${paths}${tk}
    <circle class="ac-peak" cx="${fmt(px)}" cy="${fmt(Y(peak.area))}" r="2.5"/>
    <text class="ac-peak-t" x="${fmt(peakX)}" y="9" text-anchor="${peakAnchor}">${esc(peakText)}</text>
    <line class="ac-now" y1="${TOP - 2}" y2="${BASE}" hidden/><circle class="ac-dot" r="3.5" hidden/></svg>`;
  return {
    html: `<div class="ac-head"><span${multi ? ' title="Ytan för alla delar av riket på kartan, ihoplagd per år"' : ''}>${multi ? 'Total yta över tid' : 'Yta över tid'}</span><b class="ac-read"></b></div>${svg}<figcaption class="ac-note">Ytan enligt kartdatan (Cliopatria). Källornas siffror kan skilja sig, se faktarutan.</figcaption>`,
    /** Flyttar markören till året (decimaltal går bra) och skriver ytan det året. */
    setYear(root, year) {
      const y = Math.floor(year), now = root.querySelector('.ac-now'), dot = root.querySelector('.ac-dot'), read = root.querySelector('.ac-read');
      const seg = segs.find(s => s.a <= y && y < s.b);
      const inside = y >= x0 && y < x1;
      const show = (el, on) => (on ? el.removeAttribute('hidden') : el.setAttribute('hidden', '')); // SVG-element saknar .hidden
      show(now, inside); show(dot, !!seg);
      if (inside) { const x = X(y + 0.5).toFixed(1); now.setAttribute('x1', x); now.setAttribute('x2', x); }
      if (seg) { dot.setAttribute('cx', X(y + 0.5).toFixed(1)); dot.setAttribute('cy', Y(seg.area).toFixed(1)); }
      read.textContent = seg ? `${formatYear(y)}: ${formatArea(seg.area)}` : `${formatYear(y)}: ingen kartdata`;
    },
  };
}
