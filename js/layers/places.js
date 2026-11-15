// Lagertyp "område" (beslut 2): konturen av platsen man följer i Fokus (#579). Ritas som dagens gräns, prickad,
// på den ekvirektangulära lagerbilden som de andra lagren (beslut 1). Inget eget val i Lager: konturen syns medan
// platsens kort är öppet i Fokus, och gränsen är dagens, inte den som gällde då (kortet säger det).
// Utanför Fokus (#1161) visas en tunnare, prickad kontur runt varje plats som har ett kort, men bara inzoomat och i vanligt
// läge (state.labels.placeHints, som controllers/render.js räknar ut); den visar att ett tryck på platsen öppnar kortet.
// Vilka platser det gäller ger controllers/places.js i `cards`. I en turs steg med en plats (#1163) ritas den platsens kontur
// på samma sätt som i Fokus (`step`), eftersom kortet säger att linjen på kartan är dagens gräns.
// Alla mått räknas i skärmpixlar (#1641): `px` är bildpunkter på 4096-bilden per skärmpixel (controllers/render.js), så att
// linjen är lika bred hur stor kartan än visas. I regionvyns skarpa karta (Platt vy, #1641) ger registret måttet direkt
// (`view.unit`), och där tonas omgivningen utanför platsen ned.
import { Z } from './registry.js';
import { traceRing, hasSeam } from './area-style.js';

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
    // Ritas också i regionvyns skarpa karta (#1641): måtten är skärmpixlar, så linjen blir rätt vid regionzoom
    region: true,
    drawOverlay: (ctx, W, H, view) => layer.drawOverlay(ctx, W, H, view),
  };
}

export class PlacesLayer {
  constructor() { this.place = null; this.step = null; this.cards = []; this.hints = false; this.px = 1; this.enabled = false; this._paths = new Map(); }

  /**
   * Konturen som banor på lagerbilden W × H: `fill` för fyllningen och `edge` för strokningen. Ringarna läggs med traceRing
   * (#1227), så att en gräns som korsar datumlinjen (180°) går den korta vägen och läggs vid båda kanterna i stället för tvärs
   * över kartan. Datan delas redan vid ±180° (tools/platser_gransar.py, #1268); sömmen mellan delarna är ingen gräns, så `edge`
   * hoppar över den och bara fyllningen går ända fram. En plats utan söm har samma bana till båda. Banorna sparas per plats
   * och storlek, så att en omritning inte bygger om dem.
   */
  path(place, W, H) {
    const key = `${place.id}:${W}x${H}`;
    let paths = this._paths.get(key);
    if (paths) return paths;
    if (this._paths.size > 16) this._paths.clear(); // det skarpa utsnittet ritar i många storlekar
    const x = lon => (lon + 180) / 360 * W, y = lat => (90 - lat) / 180 * H;
    const geometry = place.boundary.geometry;
    const lay = (path, skipSeams) => {
      for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
        for (const ring of poly) traceRing(path, ring, x, y, skipSeams);
      }
      return path;
    };
    const fill = lay(new Path2D(), false);
    paths = { fill, edge: hasSeam(geometry) ? lay(new Path2D(), true) : fill };
    this._paths.set(key, paths);
    return paths;
  }

  /**
   * Bildpunkter per skärmpixel på bilden W × H: ur registrets vy när den anger det (regionvyn), annars ur `px`, som gäller
   * 4096-bilden; bilden kan ritas i annan storlek (det skarpa utsnittet), därför gånger W / 4096.
   */
  unit(W, view) { return view?.unit ?? this.px * W / 4096; }

  /**
   * Platsen man följer, eller turens steg (#1163): en sluten linje med ljus kärna och mörk kant åt båda håll (som markeringarna
   * runt platser med kort, men hel), och en svag fyllning. Bredden räknas i skärmpixlar (#1627, #1641): förr i bildpunkter
   * (bredd W / 1400, streck W / 300), och i Platt vy vid max zoom blev strecken så långa att Skåne fick fyra fläckar.
   * I regionvyn (view.region) tonas omgivningen utanför platsen ned i stället för att platsen fylls.
   */
  drawOverlay(ctx, W, H, view = null) {
    if (this.hints && this.cards.length && !view?.region) return this.drawHints(ctx, W, H, view);
    // Platsen som ett turssteg öppnar (#1163) ritas som i Fokus, utan att något Fokus pågår (controllers/places.js sätter step)
    const place = this.enabled && this.place?.boundary?.geometry ? this.place : this.step;
    if (!place?.boundary?.geometry) return;
    const { fill, edge } = this.path(place, W, H);
    const unit = this.unit(W, view), core = Math.max(1, 2.5 * unit);
    ctx.save();
    ctx.lineJoin = 'round';
    if (view?.region) {
      // Omgivningen nedtonad cirka 25 %: allt utom platsen (jämn-udda, så att öar i platsen inte tonas)
      const outside = new Path2D();
      outside.rect(-W, -H, 3 * W, 3 * H);
      outside.addPath(fill);
      ctx.fillStyle = 'rgba(6,12,20,0.25)';
      ctx.fill(outside, 'evenodd');
    } else {
      ctx.fillStyle = 'rgba(214,168,79,0.16)';
      ctx.fill(fill, 'evenodd');
    }
    // Mörk kant under, så att den ljusa kärnan syns både mot det ljusa landet och mot havet
    for (const [color, w] of [['rgba(12,24,44,0.6)', core + 3 * unit], ['rgba(246,230,190,0.95)', core]]) {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.stroke(edge);
    }
    ctx.restore();
  }

  /** Tunna, prickade konturer runt platserna som har ett kort (#1161): ingen fyllning, så att kartan under syns. */
  drawHints(ctx, W, H, view = null) {
    ctx.save();
    ctx.lineJoin = 'round';
    // Mått i skärmpixlar (unit): en kärna på 2 px med en kant på 1 px åt varje håll, och streck på 7 px med 5 px mellanrum,
    // hur stor kartan än visas
    const unit = this.unit(W, view), width = Math.max(1, 2 * unit);
    ctx.setLineDash([7 * unit, 5 * unit]);
    // Först en mörk kant under, så att de ljusa strecken syns både mot pergamentfärgat land och mot havet
    for (const [color, w] of [['rgba(12,24,44,0.55)', width + 2 * unit], ['rgba(246,230,190,0.95)', width]]) {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      for (const place of this.cards) ctx.stroke(this.path(place, W, H).edge);
    }
    ctx.restore();
  }
}
