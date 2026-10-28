// Lagertyp "område" (beslut 2): religioner. Varje rike i Cliopatria har fått
// sin officiella religion eller huvudreligion ur Wikipedia, och rikena är
// sammanslagna per religion i ögonblicksbilder över tiden (data/religions.json).
// Varje religion har en egen färg. Enskilda religioner kan döljas i undermenyn.
export class ReligionsLayer {
  constructor() {
    this.religions = []; // fylls när datan har laddats, första gången lagret slås på
    this.enabled = false;
    this.hidden = new Set(); // religioner som är avbockade i undermenyn
    this.active = []; // [{ religion, snapshot }]
  }

  setData(religions) { this.religions = religions; }

  update({ year }) {
    this.active = [];
    if (!this.enabled) return this.active;
    for (const religion of this.religions) {
      if (this.hidden.has(religion.id)) continue;
      const snapshot = religion.snapshots.find(s => year >= s.start && year <= s.end);
      if (snapshot) this.active.push({ religion, snapshot });
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    if (!this.active.length) return;
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
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = religion.color;
      ctx.fill('evenodd');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = religion.color;
      ctx.lineWidth = 1.4 * k;
      ctx.stroke();
    }
    ctx.restore();
  }
}
