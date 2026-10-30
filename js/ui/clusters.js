// Klustring (#26): händelser som hamnar nära varandra på skärmen slås ihop till en
// bricka med antalet, så att globen går att läsa även med hundratals händelser.
// Vald händelse och händelser i en fun fact slås aldrig ihop.
const RADIUS = 30; // px på skärmen

/**
 * items: [{ e, p, keep }] där p = skärmposition och keep = får inte klustras.
 * Returnerar { singles: [item], clusters: [{ x, y, members: [item] }] }.
 */
export function cluster(items) {
  const singles = [], groups = [];
  const cell = RADIUS, grid = new Map();
  const keyOf = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  for (const it of items) {
    if (it.keep) { singles.push(it); continue; }
    const cx = Math.floor(it.p.x / cell), cy = Math.floor(it.p.y / cell);
    let target = null;
    for (let dx = -1; dx <= 1 && !target; dx++) {
      for (let dy = -1; dy <= 1 && !target; dy++) {
        for (const gr of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
          if (Math.hypot(gr.x - it.p.x, gr.y - it.p.y) < RADIUS) { target = gr; break; }
        }
      }
    }
    if (target) { target.members.push(it); continue; }
    const gr = { x: it.p.x, y: it.p.y, members: [it] };
    groups.push(gr);
    const k = keyOf(it.p.x, it.p.y);
    grid.set(k, [...(grid.get(k) ?? []), gr]);
  }
  const clusters = [];
  for (const gr of groups) (gr.members.length > 1 ? clusters : singles).push(gr.members.length > 1 ? gr : gr.members[0]);
  return { singles, clusters };
}

/**
 * Vad klungan innehåller (#243): antal per kategori, flest först. Returnerar texten ("3 krigshändelser,
 * 2 riken och civilisationer, 1 religiös händelse") och en conic-gradient för ringen, med ett färgsegment per
 * kategori i proportion till antalet och en smal mörk springa mellan segmenten.
 */
export function clusterContents(members, CAT, t) {
  const counts = new Map();
  for (const m of members) counts.set(m.e.category, (counts.get(m.e.category) ?? 0) + 1);
  const rows = [...counts].sort((a, b) => b[1] - a[1]);
  const text = rows.map(([c, n]) => {
    const [one, many] = t(CAT[c]?.count) || ['händelse', 'händelser'];
    return `${n} ${n === 1 ? one : many}`;
  }).join(', ');
  const gap = rows.length > 1 ? 4 : 0; // grader
  let at = 0;
  const stops = rows.map(([c, n]) => {
    const deg = n / members.length * 360, col = CAT[c]?.color ?? '#d6b06a';
    const s = `${col} ${at.toFixed(1)}deg ${(at + deg - gap).toFixed(1)}deg${gap ? `, var(--night) ${(at + deg - gap).toFixed(1)}deg ${(at + deg).toFixed(1)}deg` : ''}`;
    at += deg;
    return s;
  });
  return { text, ring: `conic-gradient(${stops.join(', ')})` };
}

/** Ruta runt en markör eller klunga på skärmen. */
export const dotBox = (x, y, r) => ({ x0: x - r, x1: x + r, y0: y - r, y1: y + r });
const overlaps = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/**
 * Etiketter utan överlapp (#142), samma regel på globen och i Platt vy (#313): högst 14 av de viktigaste
 * markörerna (singles i ordning, viktigast först) får etikett ovanför markören. En etikett får inte hamna
 * utanför ytan eller ovanpå andra etiketter, markörer (markers: [{ id, box }]) eller klungor (badges: [box]).
 * Markören under muspekaren (hoverId) får alltid sin etikett. pxOf(e) är markörens storlek på skärmen.
 * Returnerar [{ e, p, text, x, y }] där (x, y) är etikettens nedre mittpunkt.
 */
export function placeLabels(singles, { W, H, hoverId, markers, badges, blocked = [], text, pxOf }) {
  // blocked: rutor där etiketter inte får hamna, till exempel knappar över globen i smal skärm (#289)
  const placed = [...blocked], out = [];
  for (const { e, p } of singles.slice(0, 14)) {
    if ((p.facing ?? 1) < 0.2) continue;
    const label = text(e);
    const w = label.length * 6.6 + 30, h = 22;
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue; // markören syns inte, då visas ingen etikett
    // Skjut etiketten inåt så att hela rutan syns
    const cx = Math.min(Math.max(p.x, w / 2 + 4), Math.max(w / 2 + 4, W - w / 2 - 4));
    const off = Math.max(14, (pxOf(e) ?? 0) / 2 + 3); // ovanför markören, som växer med zoomen (#242)
    const box = { x0: cx - w / 2, x1: cx + w / 2, y0: p.y - off - h, y1: p.y - off };
    if (box.y0 < 4) continue;
    if (e.id !== hoverId && (placed.some(b => overlaps(box, b)) || badges.some(b => overlaps(box, b)) ||
        markers.some(m => m.id !== e.id && overlaps(box, m.box)))) continue;
    placed.push(box);
    out.push({ e, p, text: label, x: cx, y: p.y - off + 2 });
  }
  return out;
}
