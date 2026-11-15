// Regionvyns markörer (#1642, steg 1b av #1627): numrerade markörer, regionbricka, högar som fälls ut som en solfjäder och ortnamn
// för orientering. Rena funktioner utan DOM, så att testerna kan dela dem (tests/regionvy-markorer.test.mjs); ritningen och knapparna
// ligger i js/ui/region-marks.js.
//
// Numret är radens nummer i listan "Händelser på platsen" (platsens händelser i tidsordning, js/focus/place.js), så att kartan och
// listan säger samma sak. En händelse som gäller hela platsen (`scope: "place"` i datan, #1674) ritas inte som en prick på en
// påhittad punkt utan står i brickan "Hela Skåne". Alla andra händelser med ungefärlig plats (Barum, Trundholms mosse, "Skåne,
// Bohuslän, Östersjön och Nordtyskland") står kvar på sin punkt och märks som ungefärliga. Händelser som hamnar på samma ställe på skärmen läggs i en
// hög med ortnamn och årsspann, med samma klustring som globen (js/ui/clusters.js).
import { cluster } from './ui/clusters.js';
import { placeAt } from './place-geo.js';

/** Högens radie i skärmpixlar: markörer närmare än så läggs i en hög (markören är 24 px bred och högens bricka 30 px). */
export const PILE_PX = 28;
/**
 * Högens radie på pekskärm och smal skärm. Tryckytan är 44 px; med 36 px går två tryckytor in högst 8 px i varandra medan de synliga
 * markörerna (24 och 30 px) ligger isär. 44 px gjorde Danmark i 400 px till två högar, så 36 är kompromissen (36–44 i granskningen).
 */
export const PILE_PX_TOUCH = 36;
/** Markörens storlek och luften mellan markörerna i en solfjäder (skärmpixlar). */
export const MARK_PX = 26, FAN_GAP = 8;
/** Högens runda bricka med antalet (skärmpixlar). */
export const PILE_BADGE = 30;
/** Hur nära (km) en ort ska ligga en händelse för att räknas som en ort med händelser, och för att ge en hög sitt namn. */
export const NAME_KM = 5;

const DEG_KM = 111.2;
const overlaps = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** Avståndet i km mellan två punkter [lon, lat] (platt närmevärde, duger inom en region). */
export function km([lon1, lat1], [lon2, lat2]) {
  const k = Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
  return Math.hypot((lon2 - lon1) * k, lat2 - lat1) * DEG_KM;
}

/**
 * Gäller händelsen hela platsen? Det säger datan (#1674): händelsen har `scope: "place"` (den gäller hela den minsta platsen i
 * data/platser.json som den ligger i, och punkten står bara för platsen) och en ungefärlig plats (`locationPrecision`), som
 * scripts/validate-site.py kräver. places är alla platser: ligger händelsen också i en mindre plats inom den här (Skåne i Sverige)
 * gäller den den mindre platsen och står som ungefärlig markör här. Utan places görs ingen sådan prövning. Inga platstexter läses,
 * så svaret är detsamma på alla språk (textregeln från steg 1b är borta, docs/beslut/2026-11-15-scope-place-1674.md).
 */
export function wholePlace(e, place, places = []) {
  if (e?.scope !== 'place' || !e.locationPrecision || !place) return false;
  if (e._lon == null || !places.length) return true;
  const at = placeAt(places, e._lon, e._lat);
  return !at || at.id === place.id;
}

/**
 * Platsens händelser som rader: { e, n, whole, approx }. n är radens nummer i listan (1, 2, …), i samma ordning som listan
 * (händelserna kommer i tidsordning från visibleEvents i js/focus/place.js). approx: platsen är ungefärlig.
 */
export function regionItems(events, place, places = []) {
  return (events ?? []).map((e, i) => ({ e, n: i + 1, whole: wholePlace(e, place, places), approx: !!e.locationPrecision }));
}

/**
 * Markörerna på skärmen. toScreen(lat, lon) ger { x, y } i kartans pixlar. Ger { brick, singles, piles }: brick är raderna som gäller
 * hela platsen, singles markörer { ...item, p } och piles högar { x, y, members } (medlemmarna i listans ordning, högen i deras mitt).
 */
export function groupMarkers(items, toScreen, radius = PILE_PX) {
  const brick = items.filter(it => it.whole);
  const pts = items.filter(it => !it.whole && it.e._lat != null && it.e._lon != null).map(it => ({ ...it, p: toScreen(it.e._lat, it.e._lon) }));
  const { singles, clusters } = cluster(pts, radius);
  const mid = members => ({ x: members.reduce((s, m) => s + m.p.x, 0) / members.length, y: members.reduce((s, m) => s + m.p.y, 0) / members.length });
  // Klustringen utgår från högens första markör. Högen ritas i medlemmarnas mitt, så en markör eller hög som hamnar närmare den
  // mitten än radien läggs i samma hög, annars ligger de ovanpå varandra. En hög får dock inte bli bredare än radien åt något håll
  // från sin mitt än 1,5 gånger radien (spread), så att den inte växer kedjevis över hela platsen
  const spread = g => { const c = mid(g); return Math.max(...g.map(m => Math.hypot(m.p.x - c.x, m.p.y - c.y))); };
  let groups = clusters.map(c => [...c.members]), rest = [...singles];
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 0; i < groups.length && !changed; i++) {
      const c = mid(groups[i]);
      const s = rest.find(it => Math.hypot(it.p.x - c.x, it.p.y - c.y) < radius && spread([...groups[i], it]) <= radius * 1.5);
      if (s) { groups[i].push(s); rest = rest.filter(it => it !== s); changed = true; continue; }
      const j = groups.findIndex((g, k) => k !== i && Math.hypot(mid(g).x - c.x, mid(g).y - c.y) < radius && spread([...groups[i], ...g]) <= radius * 1.5);
      if (j >= 0) { groups[i].push(...groups[j]); groups = groups.filter((_, k) => k !== j); changed = true; }
    }
  }
  const piles = groups.map(g => {
    const members = g.sort((a, b) => a.n - b.n);
    return { ...mid(members), members };
  });
  return { brick, singles: rest.sort((a, b) => a.n - b.n), piles: piles.sort((a, b) => a.members[0].n - b.members[0].n) };
}

/** Årsspannet för några händelser: första start och sista slut (för högens rad "1000–1679"). */
export function yearSpan(members) {
  const evs = members.map(m => m.e ?? m);
  return { from: Math.min(...evs.map(e => e.start)), to: Math.max(...evs.map(e => e.end ?? e.start)) };
}

/**
 * Ortnamnet i en platstext: första ledet (före komma, parentes eller semikolon), utan ett inledande "norr om" och kapat vid "vid",
 * "nära", "utanför", "och" och liknande, så att det blir ett ortnamn och inte en fras ("Gallehus nära Møgeltønder" ger Gallehus,
 * "Norr om Lund" ger Lund, "Lund och Malmö" ger Lund). words = { cut, prefix }: orden på sidans språk ur data/ui
 * (`regionView.placeCut`, `regionView.placePrefix`), med mellanslag runt; utan dem bara första ledet.
 */
export function placeWord(text, words = {}) {
  let s = String(text ?? '').split(/[,(;]/)[0].trim();
  const low = () => s.toLocaleLowerCase();
  for (const p of words.prefix ?? []) if (low().startsWith(p.toLocaleLowerCase())) { s = s.slice(p.length).trim(); break; }
  let at = s.length;
  for (const c of words.cut ?? []) { const i = low().indexOf(c.toLocaleLowerCase()); if (i > 0 && i < at) at = i; }
  return s.slice(0, at).trim();
}

/**
 * Högens namn. Varje händelse får ett namn: den närmaste orten ur ortnamnsfilen inom NAME_KM, annars ortnamnet i händelsens egen
 * platstext (placeWord). Har fler än hälften av händelserna samma namn blir det högens namn; annars de två vanligaste, med "…" om
 * det finns fler ("Egtved, Jelling …"). tx plockar text på sidans språk (t()), words är orden som placeWord kapar vid. Inga namn
 * står i koden: allt kommer ur datan.
 */
export function pileName(members, names, tx, words = {}) {
  const counts = new Map();
  for (const m of members) {
    let best = null, bestKm = NAME_KM;
    for (const pl of names?.places ?? []) {
      const d = km(pl.coordinates, [m.e._lon, m.e._lat]);
      if (d <= bestKm) { best = pl; bestKm = d; }
    }
    const name = best ? tx(best.name) : placeWord(tx(m.e.place), words);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const sorted = [...counts].sort((a, b) => b[1] - a[1]); // stabil: vid lika många den som kom först i listan
  if (!sorted.length) return '';
  if (sorted.length === 1 || sorted[0][1] * 2 > members.length) return sorted[0][0];
  return `${sorted.slice(0, 2).map(([n]) => n).join(', ')}${sorted.length > 2 ? ' …' : ''}`;
}

/**
 * Solfjädern: n markörer på en ring runt (x, y), den första högst upp och sedan medurs i listans ordning. Ringen är så stor att
 * markörerna inte går ihop (minst minR, som rymmer högens knapp i mitten) och flyttas in på ytan { W, H } om den sticker ut.
 * Ger { cx, cy, r, points: [{ x, y }] }.
 */
export function fanLayout(n, { x, y }, { W = Infinity, H = Infinity, minR = 58, pad = 6, size = MARK_PX, gap = FAN_GAP } = {}) {
  const r = Math.max(minR, n * (size + gap) / (2 * Math.PI));
  const reach = r + size / 2 + pad;
  const fit = (v, max) => (2 * reach > max ? max / 2 : Math.min(Math.max(v, reach), max - reach));
  const cx = fit(x, W), cy = fit(y, H);
  const points = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return { cx, cy, r, points };
}

/**
 * Brickans rad: n markörer i rader under brickan (x = brickans mitt, y = under den), så många per rad som ryms på ytan W.
 * Ger [{ x, y }].
 */
export function rowLayout(n, { x, y }, { W = Infinity, pad = 6, size = MARK_PX, gap = FAN_GAP } = {}) {
  const step = size + gap, per = Math.max(1, Math.min(n, Math.floor((Math.min(W, 1e6) - 2 * pad + gap) / step)));
  const out = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / per), inRow = Math.min(per, n - row * per), col = i % per;
    const width = inRow * step - gap;
    const left = Math.min(Math.max(x - width / 2, pad), Math.max(pad, W - pad - width));
    out.push({ x: left + col * step + size / 2, y: y + size / 2 + row * step });
  }
  return out;
}

/**
 * Var högens namn och årsspann (eller den markerade markörens etikett) ska stå: till höger, vänster, över eller under (i ordningen
 * order) högen eller markören (centrum c, avstånd off), den första som ryms på
 * ytan W × H utan att ligga på något i blocked. Ett ställe som inte korsar platsens kantlinje (crosses) går före. Ger { side, box }
 * eller null (då står namnet bara i knappens aria-label).
 */
export function tagSpot(c, { w, h }, off, blocked, W, H, crosses = () => false, order = ['right', 'left', 'above', 'below']) {
  const at = {
    right: { x0: c.x + off, y0: c.y - h / 2 }, left: { x0: c.x - off - w, y0: c.y - h / 2 },
    above: { x0: c.x - w / 2, y0: c.y - off - h }, below: { x0: c.x - w / 2, y0: c.y + off },
  };
  const opts = order.map(side => ({ side, ...at[side] }));
  const free = opts.map(o => ({ side: o.side, box: { x0: o.x0, y0: o.y0, x1: o.x0 + w, y1: o.y0 + h } }))
    .filter(({ box }) => box.x0 >= 2 && box.y0 >= 2 && box.x1 <= W - 2 && box.y1 <= H - 2 && !blocked.some(b => overlaps(box, b)));
  return free.find(o => !crosses(o.box)) ?? free[0] ?? null;
}

/**
 * Var brickan ska stå: helst vid nominal ({ x, y } = nedre mitten), men inte på något i covers (zoomknapparna, kortet, rutan).
 * size = { w, h } är tryckytan. Brickan flyttas i sidled förbi det som täcker, annars ned under det. Ger { x, y }.
 */
export function brickSpot(nominal, { w, h }, covers, W, H, pad = 6) {
  const boxAt = (x, y) => ({ x0: x - w / 2, y0: y - h, x1: x + w / 2, y1: y });
  const fits = (x, y) => { const b = boxAt(x, y); return b.x0 >= pad && b.x1 <= W - pad && b.y0 >= pad && b.y1 <= H - pad && !covers.some(c => overlaps(b, c)); };
  const clampX = x => Math.min(Math.max(x, w / 2 + pad), W - w / 2 - pad);
  const x0 = clampX(nominal.x), y0 = Math.min(Math.max(nominal.y, h + pad), H - pad);
  if (fits(x0, y0)) return { x: x0, y: y0 };
  const tries = [];
  for (const c of covers) tries.push({ x: clampX(c.x0 - w / 2 - pad), y: y0 }, { x: clampX(c.x1 + w / 2 + pad), y: y0 });
  tries.sort((a, b) => Math.abs(a.x - x0) - Math.abs(b.x - x0));
  for (const c of covers) tries.push({ x: x0, y: c.y1 + h + pad });
  return tries.find(t => fits(t.x, t.y)) ?? { x: x0, y: y0 };
}

/** Ordningen som namnen prövas i: orter med händelser, sedan grannländer, sedan hav och övriga orter efter storlek (rank). */
export function namePriority(c) {
  if (c.kind === 'place') return (c.hasEvents ? 0 : 2) + (c.rank ?? 10) / 100;
  if (c.kind === 'neighbour') return 1;
  return 2 + (c.rank ?? 10) / 100;
}

/**
 * Kandidaterna ur ortnamnsfilen (data/ortnamn/<plats>.json): orter, grannländer och hav, med text på sidans språk (tx), punkt och
 * om en ort har händelser (någon händelse inom NAME_KM). Ger [{ id, kind, rank, at: [lon, lat], text, hasEvents }].
 */
export function nameCandidates(doc, events, tx) {
  if (!doc) return [];
  const pts = (events ?? []).filter(e => e._lon != null).map(e => [e._lon, e._lat]);
  const out = [];
  for (const p of doc.places ?? []) out.push({ id: p.id, kind: 'place', rank: p.rank, at: p.coordinates, text: tx(p.name), hasEvents: pts.some(q => km(q, p.coordinates) <= NAME_KM) });
  for (const nb of doc.neighbours ?? []) out.push({ id: `nb-${nb.ne}`, kind: 'neighbour', at: nb.label, text: tx(nb.name) });
  for (const s of doc.seas ?? []) out.push({ id: s.id, kind: 'sea', rank: s.rank, at: s.label, text: tx(s.name) });
  return out.filter(c => c.text && Array.isArray(c.at)).sort((a, b) => namePriority(a) - namePriority(b));
}

/**
 * Namnen utan krockar (enkel girig placering i prioritetsordning). cands: nameCandidates med skärmpunkt p ({ x, y }). measure(text,
 * kind) ger textens bredd i px. blocked: rutor där inget namn får ligga (markörer, högar, brickan, etiketter, kortet). crosses(box)
 * ger true när rutan skulle ligga över platsens kantlinje (en del inne i platsen och en del utanför). En ort ritas med en prick och
 * namnet till höger, vänster, över eller under; grannländer och hav centreras på sin punkt. Ger [{ ...cand, box, x, y, align }] där
 * (x, y) är textens ankare (mitt i höjd).
 */
export function placeNames(cands, { W, H, blocked = [], measure, crosses = () => false, max = 18 }) {
  const placed = [], out = [];
  for (const c of cands) {
    if (out.length >= max || !c.p) continue;
    const { x, y } = c.p;
    const h = c.kind === 'place' ? 14 : 15, w = measure(c.text, c.kind) + 2;
    const opts = c.kind === 'place'
      ? [{ x0: x + 6, y0: y - h / 2, align: 'left', tx: x + 7 }, { x0: x - 6 - w, y0: y - h / 2, align: 'right', tx: x - 7 },
        { x0: x - w / 2, y0: y - 5 - h, align: 'center', tx: x }, { x0: x - w / 2, y0: y + 5, align: 'center', tx: x }]
      : [{ x0: x - w / 2, y0: y - h / 2, align: 'center', tx: x }];
    for (const o of opts) {
      const box = { x0: o.x0, y0: o.y0, x1: o.x0 + w, y1: o.y0 + h };
      // Ortens prick hör till namnet: den får inte heller ligga på något
      const dot = c.kind === 'place' ? { x0: x - 3, y0: y - 3, x1: x + 3, y1: y + 3 } : null;
      if (box.x0 < 2 || box.y0 < 2 || box.x1 > W - 2 || box.y1 > H - 2) continue;
      // Lite luft mellan två namn, så att de inte läses ihop ("Göteborg SVERIGE")
      const airy = { x0: box.x0 - 4, y0: box.y0 - 1, x1: box.x1 + 4, y1: box.y1 + 1 };
      if (blocked.some(b => overlaps(box, b) || (dot && overlaps(dot, b))) || placed.some(b => overlaps(airy, b) || (dot && overlaps(dot, b)))) continue;
      if (crosses(box)) continue;
      placed.push(box);
      if (dot) placed.push(dot);
      out.push({ ...c, box, x: o.tx, y: box.y0 + h / 2, align: o.align });
      break;
    }
  }
  return out;
}

/**
 * Korsar rutan platsens kantlinje? inside(x, y) säger om en skärmpunkt ligger inne i platsen. Rutans hörn, kanternas mittpunkter och
 * mitten prövas: ligger några inne och några ute, korsar namnet linjen och skulle dölja den.
 */
export function crossesEdge(box, inside) {
  const xs = [box.x0, (box.x0 + box.x1) / 2, box.x1], ys = [box.y0, (box.y0 + box.y1) / 2, box.y1];
  let inn = 0, out = 0;
  for (const x of xs) for (const y of ys) (inside(x, y) ? inn++ : out++);
  return inn > 0 && out > 0;
}
