// Lagertyp "område" (beslut 2): religioner. Varje rike i Cliopatria har fått
// sin officiella religion eller huvudreligion ur Wikipedia, och rikena är
// sammanslagna per religion i ögonblicksbilder över tiden (data/religions.json).
// Varje religion har en egen färg. Enskilda religioner kan döljas i undermenyn.
// Religioner med faktaruta (facts.origin, #90) får en stjärna där de uppstod, på
// platsen för händelsen som origin pekar på. Ärvda områden (snapshot.inherited, #269) ligger
// under riken vars faktaruta saknar religion och visar religionen området hade tidigare; de
// ritas ljusare med prickad kant.
export class ReligionsLayer {
  constructor() {
    this.religions = []; // fylls när datan har laddats, första gången lagret slås på
    this.enabled = false;
    this.hidden = new Set(); // religioner som är avbockade i undermenyn
    this.active = []; // [{ religion, snapshot }]
    this.origins = new Map(); // religionens id → händelsen där den uppstod
    this.stars = []; // [{ religion, event }] som syns det här året
    this.polities = new Map(); // rikets namn → uppgifter ur religions.json
  }

  /** Händelserna där religionerna uppstod, som Map från religionens id. */
  setOrigins(origins) { this.origins = origins; }

  setData(religions) { this.religions = religions; }

  /** Rikena med religion (polities i religions.json), som Map från rikets namn. */
  setPolities(list) { this.polities = new Map((list ?? []).map(p => [p.name, p])); }

  /**
   * Teckenförklaringen (#166): religionerna som syns just det här året, i datans ordning,
   * med om något av områdena är osäkra eller ärvda (#269). [{ religion, sure, unsure, inherited }]
   */
  legendItems() {
    const items = new Map();
    for (const { religion, snapshot } of this.active) {
      const it = items.get(religion.id) ?? { religion, sure: false, unsure: false, inherited: false };
      if (snapshot.inherited) it.inherited = true;
      else snapshot.sure !== false ? (it.sure = true) : (it.unsure = true);
      items.set(religion.id, it);
    }
    return [...items.values()];
  }

  /**
   * Vilket område ligger punkten (lon, lat) i? Säkra områden prövas före osäkra och osäkra före ärvda.
   * Returnerar { religion, snapshot, polities } eller null. Områdena är sammanslagna, så
   * vilket rike som ligger just där tas fram med polityAt() när rikenas gränser har laddats.
   */
  hitTest(lon, lat) {
    const rank = s => s.inherited ? 2 : s.sure !== false ? 0 : 1;
    const sorted = [...this.active].sort((a, b) => rank(a.snapshot) - rank(b.snapshot));
    for (const { religion, snapshot } of sorted) {
      if (contains(snapshot.geometry, lon, lat)) {
        return { religion, snapshot, polities: snapshot.polities.map(n => this.polities.get(n) ?? { name: n }) };
      }
    }
    return null;
  }

  /**
   * Vilket rike i området ligger på punkten (#194)? shapes = polities ur
   * data/religions-polities.json (rikets namn → perioder). Bara rikena i ögonblicksbilden
   * prövas, med den period som gällde när ögonblicksbilden börjar (samma urval som ritas).
   * Ligger flera riken över varandra kommer enskilda skeden före sammanslagningar och
   * sedan det minsta riket först. Hamnar klicket precis utanför
   * alla (förenklade kanter) tas det närmaste riket inom en halv grad. Returnerar en lista
   * med uppgifter om rikena, tom om inget hittas.
   */
  polityAt(hit, lon, lat, shapes) {
    const y = hit.snapshot.start;
    const cands = [];
    for (const p of hit.polities) {
      const period = (shapes?.[p.name] ?? []).find(q => q.start <= y && y <= q.end);
      if (period) cands.push({ p, g: period.geometry });
    }
    // Namn inom parentes, till exempel (Kingdom of France), är Cliopatrias sammanslagning av ett
    // rikes alla skeden. De kommer efter det enskilda skedet, till exempel Kingdom of France.
    const agg = c => /^\(.*\)$/.test(c.p.name);
    const inside = cands.filter(c => contains(c.g, lon, lat)).map(c => ({ ...c, area: bboxArea(c.g) }));
    if (inside.length) return inside.sort((a, b) => agg(a) - agg(b) || a.area - b.area).map(c => c.p);
    let best = null, bestD = 0.5;
    for (const c of cands) {
      const d = distance(c.g, lon, lat);
      if (d < bestD) { best = c.p; bestD = d; }
    }
    return best ? [best] : [];
  }

  update({ year }) {
    this.active = [];
    this.stars = [];
    if (!this.enabled) return this.active;
    for (const religion of this.religions) {
      if (this.hidden.has(religion.id) && religion.id !== this.onlyId) continue;
      if (this.onlyId && religion.id !== this.onlyId) continue; // fokusläge för en religion
      // Stjärnan syns från det år religionen uppstod
      const origin = this.origins.get(religion.id);
      if (origin && year >= origin.start) this.stars.push({ religion, event: origin });
      // Upp till två områden per år: säkra uppgifter och osäkra (först nämnda)
      for (const snapshot of religion.snapshots) {
        if (year >= snapshot.start && year <= snapshot.end) this.active.push({ religion, snapshot });
      }
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    if (!this.active.length && !this.stars.length) return;
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    const k = W / 2048;
    ctx.save();
    ctx.lineJoin = 'round';
    for (const { religion, snapshot } of this.active) {
      const g = snapshot.geometry;
      ctx.beginPath();
      for (const rings of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
          ctx.closePath();
        }
      }
      // Osäkra områden ritas ljusare och med streckad kant, ärvda (#269) ännu ljusare med prickad kant
      // (visa osäkerhet öppet)
      const inherited = !!snapshot.inherited, sure = !inherited && snapshot.sure !== false;
      ctx.globalAlpha = sure ? 0.5 : inherited ? 0.2 : 0.25;
      ctx.fillStyle = religion.color;
      ctx.fill('evenodd');
      ctx.globalAlpha = sure ? 1 : 0.8;
      ctx.strokeStyle = religion.color;
      ctx.lineWidth = 1.4 * k;
      ctx.setLineDash(sure ? [] : inherited ? [1.5 * k, 3.5 * k] : [6 * k, 4 * k]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    // Punkten där religionen uppstod: en femuddig stjärna i religionens färg med ljus kant
    for (const { religion, event } of this.stars) {
      const cx = X(event._lon), cy = Y(event._lat), R = 15 * k, r = R * 0.45;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R;
        i ? ctx.lineTo(cx + d * Math.cos(a), cy + d * Math.sin(a)) : ctx.moveTo(cx + d * Math.cos(a), cy + d * Math.sin(a));
      }
      ctx.closePath();
      ctx.fillStyle = religion.color;
      ctx.fill();
      ctx.lineWidth = 1.6 * k;
      ctx.strokeStyle = '#f4e9d0';
      ctx.stroke();
    }
    ctx.restore();
  }
}

const ringsOf = g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).flat();

/** Punkt i polygon (evenodd, som ritningen), i lon/lat. */
function contains(g, lon, lat) {
  let inside = false;
  for (const ring of ringsOf(g)) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** Ytan av områdets omskrivna rektangel (kvadratgrader), för att välja det minsta riket. */
function bboxArea(g) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const ring of ringsOf(g)) for (const [x, y] of ring) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return (x1 - x0) * (y1 - y0);
}

/** Kortaste avståndet (grader) från punkten till områdets kant. */
function distance(g, lon, lat) {
  let best = Infinity;
  for (const ring of ringsOf(g)) {
    for (let i = 1; i < ring.length; i++) {
      const [ax, ay] = ring[i - 1], [bx, by] = ring[i];
      const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
      const t = l ? Math.max(0, Math.min(1, ((lon - ax) * dx + (lat - ay) * dy) / l)) : 0;
      best = Math.min(best, Math.hypot(lon - ax - t * dx, lat - ay - t * dy));
    }
  }
  return best;
}
