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

// Ikoner (#95): enkla linjeteckningar i img/icons/, på mörk botten med en ring i
// kategorins färg. Händelser utan ikon får en prick som tidigare.
const iconCache = new Map();
function iconTexture(name, color) {
  const key = name + color;
  if (iconCache.has(key)) return iconCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(14,20,28,0.92)';
  g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.fill();
  g.lineWidth = 9; g.strokeStyle = color;
  g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => { g.drawImage(img, 26, 26, 76, 76); t.needsUpdate = true; };
  img.src = `img/icons/${name}.svg`;
  iconCache.set(key, t);
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
      const color = CAT[e.category]?.color ?? '#ffffff';
      const s = new THREE.Sprite(new THREE.SpriteMaterial(e.icon
        ? { map: iconTexture(e.icon, color), transparent: true, depthWrite: false }
        : { map: tex, color: new THREE.Color(color), transparent: true, depthWrite: false }));
      s.userData.iconScale = e.icon ? 1.5 : 1; // ikoner behöver lite mer plats än prickar
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
   * span (valfritt): händelsens tid som [början, slut]. I fokusläget för korta krig är det datum ur edtf (#204).
   * Returnerar händelserna som syns, de pågående först.
   */
  update({ year, window, filters, selectedId, highlight, focusId = null, span = e => [e.start, e.end] }) {
    const visible = [];
    for (const s of this.sprites) {
      const e = s.userData.event;
      // Händelser i ett krig: utzoomat syns bara den viktigaste (top). I fokusläge
      // syns krigets alla händelser. Valda händelser syns alltid.
      const onMap = !e.partOf || e.top || e.partOf === focusId || e.id === selectedId;
      const okFilter = onMap && filters.has(e.category) && isVisibleReview(e.review);
      const [s0, s1] = span(e);
      const inside = year >= s0 && year <= s1;
      const dist = inside ? 0 : Math.min(Math.abs(year - s0), Math.abs(year - s1));
      const near = dist <= window;
      // I fokusläge ligger krigets redan utkämpade slag kvar, lite svagare
      const fought = e.partOf === focusId && s1 < year;
      const activity = !okFilter ? 0 : inside ? 1 : near ? 1 - 0.6 * dist / Math.max(1, window) : fought ? 0.45 : 0;
      this.state.set(e.id, { activity, inside, dist });
      s.visible = activity > 0;
      s.userData.active = activity > 0; // klustringen döljer markörer som ingår i ett kluster
      const big = e.id === selectedId || highlight.has(e.id);
      s.material.opacity = 0.45 + 0.55 * activity;
      s.userData.baseScale = (big ? 0.052 : 0.03 + 0.012 * activity) * s.userData.iconScale;
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
