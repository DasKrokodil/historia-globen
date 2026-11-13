// Lagertyp "område" (beslut 2): konturen av platsen man följer i Fokus (#579). Ritas som dagens gräns, prickad,
// på den ekvirektangulära lagerbilden som de andra lagren (beslut 1). Inget eget val i Lager: konturen syns medan
// platsens kort är öppet i Fokus, och gränsen är dagens, inte den som gällde då (kortet säger det).
// Utanför Fokus (#1161) visas en tunnare, prickad kontur runt varje plats som har ett kort, men bara inzoomat och i vanligt
// läge (state.labels.placeHints, som controllers/render.js räknar ut); den visar att ett tryck på platsen öppnar kortet.
// Vilka platser det gäller ger controllers/places.js i `cards`.
import { Z } from './registry.js';

export function entry() {
  const layer = new PlacesLayer();
  return {
    id: 'places', layer, z: Z.places,
    enabled: s => s.focus?.type === 'place' || (!s.focus && !!s.labels?.placeHints && layer.cards.length > 0),
    update: s => {
      layer.place = s.focus?.type === 'place' ? s.focus.place : null;
      layer.hints = !s.focus && !!s.labels?.placeHints;
      return layer.place;
    },
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

export class PlacesLayer {
  constructor() { this.place = null; this.cards = []; this.hints = false; this.enabled = false; this._paths = new Map(); }

  /** Konturen som en bana på lagerbilden W × H. Banorna sparas per plats och storlek, så att en omritning inte bygger om dem. */
  path(place, W, H) {
    const key = `${place.id}:${W}x${H}`;
    let path = this._paths.get(key);
    if (path) return path;
    if (this._paths.size > 16) this._paths.clear(); // det skarpa utsnittet ritar i många storlekar
    const x = lon => (lon + 180) / 360 * W, y = lat => (90 - lat) / 180 * H;
    const geometry = place.boundary.geometry;
    path = new Path2D();
    for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
      for (const ring of poly) {
        ring.forEach(([lon, lat], i) => (i ? path.lineTo(x(lon), y(lat)) : path.moveTo(x(lon), y(lat))));
        path.closePath();
      }
    }
    this._paths.set(key, path);
    return path;
  }

  drawOverlay(ctx, W, H) {
    if (this.enabled && this.hints) return this.drawHints(ctx, W, H);
    const geometry = this.enabled && this.place?.boundary?.geometry;
    if (!geometry) return;
    const path = this.path(this.place, W, H);
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(214,168,79,0.16)';
    ctx.fill(path, 'evenodd');
    ctx.strokeStyle = 'rgba(241,223,180,0.95)';
    ctx.lineWidth = Math.max(2, W / 1400);
    ctx.setLineDash([W / 300, W / 450]);
    ctx.stroke(path);
    ctx.restore();
  }

  /** Tunna, prickade konturer runt platserna som har ett kort (#1161): ingen fyllning, så att kartan under syns. */
  drawHints(ctx, W, H) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(241,223,180,0.7)';
    ctx.lineWidth = Math.max(1.5, W / 2200);
    ctx.setLineDash([W / 420, W / 520]);
    for (const place of this.cards) ctx.stroke(this.path(place, W, H));
    ctx.restore();
  }
}
