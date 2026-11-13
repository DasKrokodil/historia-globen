// Lagertyp "område" (beslut 2): konturen av platsen man följer i Fokus (#579). Ritas som dagens gräns, prickad,
// på den ekvirektangulära lagerbilden som de andra lagren (beslut 1). Inget eget val i Lager: konturen syns medan
// platsens kort är öppet i Fokus, och gränsen är dagens, inte den som gällde då (kortet säger det).
// Utanför Fokus (#1161) visas en tunnare, prickad kontur runt varje plats som har ett kort, men bara inzoomat och i vanligt
// läge (state.labels.placeHints, som controllers/render.js räknar ut); den visar att ett tryck på platsen öppnar kortet.
// Vilka platser det gäller ger controllers/places.js i `cards`. I en turs steg med en plats (#1163) ritas den platsens kontur
// på samma sätt som i Fokus (`step`), eftersom kortet säger att linjen på kartan är dagens gräns.
import { Z } from './registry.js';

export function entry() {
  const layer = new PlacesLayer();
  return {
    id: 'places', layer, z: Z.places,
    enabled: s => s.focus?.type === 'place',
    // Konturerna runt platserna med kort (#1161) beror på zoomen, som ändras utan att valen i Lager gör det (och apply() körs då
    // inte), så de styrs av hints här i stället för av enabled
    update: s => {
      if (layer.step && !s.modes?.some(m => m.mode === 'tur')) layer.step = null; // turens steg lånar ut platsen: utan tur ritas den inte, vilken väg turen än slutade på (#1163)
      layer.place = s.focus?.type === 'place' ? s.focus.place : null;
      layer.hints = !s.focus && !!s.labels?.placeHints;
      layer.px = s.labels?.placePx ?? 1; // bildpunkter per skärmpixel
      return layer.place;
    },
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

export class PlacesLayer {
  constructor() { this.place = null; this.step = null; this.cards = []; this.hints = false; this.px = 1; this.enabled = false; this._paths = new Map(); }

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
    if (this.hints && this.cards.length) return this.drawHints(ctx, W, H);
    // Platsen som ett turssteg öppnar (#1163) ritas som i Fokus, utan att något Fokus pågår (controllers/places.js sätter step)
    const place = this.enabled && this.place?.boundary?.geometry ? this.place : this.step;
    if (!place?.boundary?.geometry) return;
    const path = this.path(place, W, H);
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
    // Mått i skärmpixlar (px bildpunkter per skärmpixel, på 4096-bilden): en kärna på 2 px med en kant på 1 px åt varje håll,
    // och streck på 7 px med 5 px mellanrum, hur stor kartan än visas. Bilden kan ritas i annan storlek (skarpa utsnittet): k
    const k = W / 4096, unit = this.px * k, width = Math.max(1, 2 * unit);
    ctx.setLineDash([7 * unit, 5 * unit]);
    // Först en mörk kant under, så att de ljusa strecken syns både mot pergamentfärgat land och mot havet
    for (const [color, w] of [['rgba(12,24,44,0.55)', width + 2 * unit], ['rgba(246,230,190,0.95)', width]]) {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      for (const place of this.cards) ctx.stroke(this.path(place, W, H));
    }
    ctx.restore();
  }
}
