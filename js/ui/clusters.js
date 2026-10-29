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
