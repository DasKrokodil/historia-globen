// Lagertyp "punkt" (beslut 2): händelser som punkter på globen.
// Varje lager har samma gränssnitt: update(state) och drawOverlay(ctx, W, H).
import { THREE, latLonToVec3, R } from '../globe.js';
import { CAT, isVisibleReview } from '../model.js';

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(32, 32, 20, 0, Math.PI * 2); g.fill();
  g.lineWidth = 6; g.strokeStyle = 'rgba(15,20,26,0.9)';
  g.beginPath(); g.arc(32, 32, 23, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class EventsLayer {
  constructor(globe, events) {
    this.globe = globe;
    this.events = events;
    this.state = new Map(); // id -> { activity, inside }
    const tex = dotTexture();
    this.sprites = [];
    for (const e of events) {
      const [lon, lat] = e.location.coordinates;
      e._lat = lat; e._lon = lon;
      e._pos = latLonToVec3(lat, lon, R * 1.012);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, color: new THREE.Color(CAT[e.category]?.color ?? '#ffffff'),
        transparent: true, depthWrite: false,
      }));
      s.position.copy(e._pos);
      s.scale.setScalar(0.034);
      s.userData.event = e;
      s.visible = false;
      this.globe.markerGroup.add(s);
      this.sprites.push(s);
    }
  }

  /**
   * year: nuvarande år. window: hur många år före/efter som räknas som "samtidigt".
   * Returnerar händelserna som syns, de pågående först.
   */
  update({ year, window, filters, selectedId, highlight }) {
    const visible = [];
    for (const s of this.sprites) {
      const e = s.userData.event;
      // Mindre händelser i ett krig syns bara i krigets lista, eller när de är valda
      const onMap = !e.partOf || e.major || e.id === selectedId;
      const okFilter = onMap && filters.has(e.category) && isVisibleReview(e.review);
      const inside = year >= e.start && year <= e.end;
      const dist = inside ? 0 : Math.min(Math.abs(year - e.start), Math.abs(year - e.end));
      const near = dist <= window;
      const activity = !okFilter ? 0 : inside ? 1 : near ? 1 - 0.6 * dist / Math.max(1, window) : 0;
      this.state.set(e.id, { activity, inside, dist });
      s.visible = activity > 0;
      const big = e.id === selectedId || highlight.has(e.id);
      s.material.opacity = 0.45 + 0.55 * activity;
      s.userData.baseScale = big ? 0.052 : 0.03 + 0.012 * activity;
      s.scale.setScalar(s.userData.baseScale);
      if (activity > 0) visible.push({ e, activity, inside, dist });
    }
    visible.sort((a, b) => (b.inside - a.inside) || (a.dist - b.dist) || (a.e.start - b.e.start));
    return visible;
  }

  /** Ritar ett mjukt sken per synlig händelse på den platta lagerbilden. */
  drawOverlay(ctx, W, H) {
    const k = W / 2048; // skenet blir lika stort oavsett bildens upplösning
    for (const e of this.events) {
      const st = this.state.get(e.id);
      if (!st || st.activity <= 0) continue;
      const x = (e._lon + 180) / 360 * W, y = (90 - e._lat) / 180 * H;
      const r = (26 + 18 * st.activity) * k;
      const col = CAT[e.category]?.color ?? '#ffffff';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(col, 0.55 * st.activity));
      g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  pulse(t, selectedId) {
    for (const s of this.sprites) {
      if (!s.visible) continue;
      if (s.userData.event.id === selectedId) s.scale.setScalar(s.userData.baseScale * (1 + 0.12 * Math.sin(t / 240)));
    }
  }
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
