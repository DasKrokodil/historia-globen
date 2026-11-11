// Lagertyp "område" (beslut 2): konturen av platsen man följer i Fokus (#579). Ritas som dagens gräns, prickad,
// på den ekvirektangulära lagerbilden som de andra lagren (beslut 1). Inget eget val i Lager: konturen syns bara
// medan platsens kort är öppet i Fokus, och gränsen är dagens, inte den som gällde då (kortet säger det).
import { Z } from './registry.js';

export function entry() {
  const layer = new PlacesLayer();
  return {
    id: 'places', layer, z: Z.places,
    enabled: s => s.focus?.type === 'place',
    update: s => { layer.place = s.focus?.type === 'place' ? s.focus.place : null; return layer.place; },
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

export class PlacesLayer {
  constructor() { this.place = null; this.enabled = false; }

  drawOverlay(ctx, W, H) {
    const geometry = this.enabled && this.place?.boundary?.geometry;
    if (!geometry) return;
    const x = lon => (lon + 180) / 360 * W, y = lat => (90 - lat) / 180 * H;
    const path = new Path2D();
    for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
      for (const ring of poly) {
        ring.forEach(([lon, lat], i) => (i ? path.lineTo(x(lon), y(lat)) : path.moveTo(x(lon), y(lat))));
        path.closePath();
      }
    }
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
}
