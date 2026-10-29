// Lagertyp "område" (beslut 2): religioner. Varje rike i Cliopatria har fått
// sin officiella religion eller huvudreligion ur Wikipedia, och rikena är
// sammanslagna per religion i ögonblicksbilder över tiden (data/religions.json).
// Varje religion har en egen färg. Enskilda religioner kan döljas i undermenyn.
// Religioner med faktaruta (facts.origin, #90) får en stjärna där de uppstod, på
// platsen för händelsen som origin pekar på.
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
   * med om något av områdena är osäkra. [{ religion, sure, unsure }]
   */
  legendItems() {
    const items = new Map();
    for (const { religion, snapshot } of this.active) {
      const it = items.get(religion.id) ?? { religion, sure: false, unsure: false };
      snapshot.sure !== false ? (it.sure = true) : (it.unsure = true);
      items.set(religion.id, it);
    }
    return [...items.values()];
  }

  /**
   * Vilket område ligger punkten (lon, lat) i? Säkra områden prövas före osäkra.
   * Returnerar { religion, snapshot, polities } eller null. Rikena är bara kända per
   * område (ögonblicksbilden), inte per punkt, eftersom områdena är sammanslagna.
   */
  hitTest(lon, lat) {
    const sorted = [...this.active].sort((a, b) => (b.snapshot.sure !== false) - (a.snapshot.sure !== false));
    for (const { religion, snapshot } of sorted) {
      const g = snapshot.geometry;
      let inside = false; // evenodd, som ritningen
      for (const rings of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
        for (const ring of rings) {
          for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const [xi, yi] = ring[i], [xj, yj] = ring[j];
            if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
          }
        }
      }
      if (inside) return { religion, snapshot, polities: snapshot.polities.map(n => this.polities.get(n) ?? { name: n }) };
    }
    return null;
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
      // Osäkra områden ritas ljusare och med streckad kant (visa osäkerhet öppet)
      const sure = snapshot.sure !== false;
      ctx.globalAlpha = sure ? 0.5 : 0.25;
      ctx.fillStyle = religion.color;
      ctx.fill('evenodd');
      ctx.globalAlpha = sure ? 1 : 0.8;
      ctx.strokeStyle = religion.color;
      ctx.lineWidth = 1.4 * k;
      ctx.setLineDash(sure ? [] : [6 * k, 4 * k]);
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
