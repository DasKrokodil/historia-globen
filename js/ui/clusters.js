// Klustring (#26): händelser som hamnar nära varandra på skärmen slås ihop till en
// bricka med antalet, så att globen går att läsa även med hundratals händelser.
// Vald händelse och händelser i en fun fact slås aldrig ihop.
const RADIUS = 30; // px på skärmen

/**
 * items: [{ e, p, keep }] där p = skärmposition och keep = får inte klustras.
 * radius: hur nära (skärmpixlar) två händelser ska ligga för att slås ihop; regionvyns högar (#1642) använder en mindre radie.
 * Returnerar { singles: [item], clusters: [{ x, y, members: [item] }] }.
 */
export function cluster(items, radius = RADIUS) {
  const singles = [], groups = [];
  const cell = radius, grid = new Map();
  const keyOf = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  for (const it of items) {
    if (it.keep) { singles.push(it); continue; }
    const cx = Math.floor(it.p.x / cell), cy = Math.floor(it.p.y / cell);
    let target = null;
    for (let dx = -1; dx <= 1 && !target; dx++) {
      for (let dy = -1; dy <= 1 && !target; dy++) {
        for (const gr of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
          if (Math.hypot(gr.x - it.p.x, gr.y - it.p.y) < radius) { target = gr; break; }
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

/** Hur många pågående krig som får lägga sin etikett över rikesnamn när det inte finns plats annars (#1022). */
export const WAR_LABELS = 3;

/**
 * Etiketterna vid klotets kant (#1318). Förut tonades en etikett ut jämnt när markören vände sig bort (ned till 5 procents
 * styrka), och då läste ingen texten: mätt på skärmbilder låg kontrasten mellan 1,2:1 och 4:1 över land. Nu är en etikett antingen
 * läsbar eller dold. Från LABEL_FADE_FROM (cosinus för vinkeln mot kamerans riktning) och uppåt har den full styrka, ner till
 * LABEL_MIN_FACING tonar den bara till LABEL_MIN_OPACITY, och under det ritas ingen etikett (markören syns kvar).
 * Vid 85 procents styrka är kontrasten mellan etikettens text och bakgrund minst 4,5:1 även över det ljusaste underlaget
 * (inlandsisen i istidens kust, #f1f4f6); tests/etiketter.test.mjs räknar efter.
 */
export const LABEL_FADE_FROM = 0.45, LABEL_MIN_FACING = 0.3, LABEL_MIN_OPACITY = 0.85;
/** Etikettens styrka (0–1) för en markör som vetter facing (0–1) mot kameran; 0 betyder att etiketten inte ritas. */
export function labelOpacity(facing) {
  if (facing < LABEL_MIN_FACING) return 0;
  if (facing >= LABEL_FADE_FROM) return 1;
  return LABEL_MIN_OPACITY + (1 - LABEL_MIN_OPACITY) * (facing - LABEL_MIN_FACING) / (LABEL_FADE_FROM - LABEL_MIN_FACING);
}

/** Ruta runt en markör eller klunga på skärmen. */
export const dotBox = (x, y, r) => ({ x0: x - r, x1: x + r, y0: y - r, y1: y + r });
const overlaps = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/**
 * Etiketter utan överlapp (#142), samma regel på globen och i Platt vy (#313): högst 14 av de viktigaste
 * markörerna (singles i ordning, viktigast först) får etikett ovanför markören, eller under den om det är upptaget ovanför. En etikett får inte hamna
 * utanför ytan eller ovanpå andra etiketter, markörer (markers: [{ id, box }]) eller klungor (badges: [box]).
 * Markören under muspekaren (hoverId) får alltid sin etikett. pxOf(e) är markörens storlek på skärmen.
 * Returnerar [{ e, p, text, x, y }] där (x, y) är etikettens nedre mittpunkt.
 */
export function placeLabels(singles, { W, H, hoverId, markers, badges, blocked = [], soft = [], priority = () => false, text, pxOf }) {
  // blocked: rutor där etiketter inte får hamna, till exempel knappar över globen i smal skärm (#289)
  // soft: rutor som etiketter viker för (rikesnamn och medaljer, #358), men som de pågående krigen får lägga sin etikett över om
  // ingen annan plats finns (priority(singel), högst WAR_LABELS). Annars täckte rikesnamnen all plats över Europa 1914–1918 och
  // 1939–1945, och det som pågick fick ingen etikett (#1022). De pågående krigen placeras först, de räknas i taket på 14.
  const placed = [...blocked], out = [];
  // Vid klotets kant ritas ingen etikett (#1318, labelOpacity), och den tar då heller ingen av de 14 platserna; markören under
  // musen får ändå sin etikett en bit längre ut
  const inView = singles.filter(it => (it.p.facing ?? 1) >= (it.e.id === hoverId ? 0.2 : LABEL_MIN_FACING));
  const urgent = new Set(inView.filter(priority).slice(0, WAR_LABELS));
  for (const it of [...urgent, ...inView.filter(s => !urgent.has(s))].slice(0, 14)) {
    const { e, p } = it;
    const label = text(e);
    const w = label.length * 6.6 + 30, h = 22;
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue; // markören syns inte, då visas ingen etikett
    // Skjut etiketten inåt så att hela rutan syns
    const cx = Math.min(Math.max(p.x, w / 2 + 4), Math.max(w / 2 + 4, W - w / 2 - 4));
    const off = Math.max(14, (pxOf(e) ?? 0) / 2 + 3); // ovanför markören, som växer med zoomen (#242)
    const free = (box, strict = true, mark = true) => box.y0 >= 4 && box.y1 <= H - 4 && (e.id === hoverId || !(placed.some(b => overlaps(box, b)) ||
      badges.some(b => overlaps(box, b)) || (mark && markers.some(m => m.id !== e.id && overlaps(box, m.box))) ||
      (strict && soft.some(b => overlaps(box, b)))));
    // Ovanför markören, eller under den om platsen ovanför är upptagen (#358, till exempel av ett rikes namn)
    const above = { x0: cx - w / 2, x1: cx + w / 2, y0: p.y - off - h, y1: p.y - off };
    const below = { x0: cx - w / 2, x1: cx + w / 2, y0: p.y + off, y1: p.y + off + h };
    let box = [above, below].find(b => free(b));
    if (!box && urgent.has(it)) {
      // Ett pågående krig får lägga etiketten över rikesnamn, och sist bredvid markören eller en rad längre bort (#1022)
      const side = dx => ({ x0: p.x + dx - (dx < 0 ? w : 0), x1: p.x + dx + (dx < 0 ? 0 : w), y0: p.y - h / 2, y1: p.y + h / 2 });
      const inside = b => b.x0 >= 4 && b.x1 <= W - 4;
      // Är klungorna tätt runt markören (en klunga ovanför, en under och en bredvid) ryms ingen av platserna ovan. Då söks platsen
      // vidare åt sidan, steg för steg bort från markören, på markörens egen rad (#1538: Första världskriget 1916 i mobil, när
      // Verdun och Versaillesfreden bildar en klunga alldeles intill). Klungor, knappar, markörer och andra etiketter är fortfarande
      // fasta hinder; bara rikesnamnen (soft) får etiketten ligga över.
      const farSides = [];
      for (let dx = off + 12; dx <= W; dx += 12) farSides.push(side(-dx), side(dx));
      box = [above, below, side(-off), side(off), { ...above, y0: above.y0 - h - 2, y1: above.y1 - h - 2 }, { ...below, y0: below.y0 + h + 2, y1: below.y1 + h + 2 }, ...farSides]
        .find(b => inside(b) && free(b, false));
      // Sist av allt: ovanför eller under markören, över grannmarkörer (inte över klungor, knappar eller andra etiketter),
      // så att det som pågår och är viktigast alltid får en etikett (#1022, mobilbredd 1916)
      if (!box) box = [above, below].find(b => inside(b) && free(b, false, false));
    }
    if (!box) continue;
    placed.push(box);
    out.push({ e, p, text: label, x: (box.x0 + box.x1) / 2, y: box.y1 + 2 });
  }
  return out;
}
