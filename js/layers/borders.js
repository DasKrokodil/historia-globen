// Lagertyp "linje" (beslut 2): dagens landsgränser som ett filter.
// Av som standard, eftersom dagens gränser inte stämmer historiskt. Filen laddas först när lagret slås på (#337).
import { Z } from './registry.js';
import { loadBorders } from '../model.js';

/** Lagrets post i registret (#338): raden i Lager (av som standard), ritordningen och uppdateringen. */
export function entry({ refresh }) {
  const layer = new BordersLayer();
  return {
    id: 'borders', name: 'Dagens gränser', group: 'power', menu: { on: false, note: 'stämmer inte historiskt' }, layer, z: Z.borders,
    enabled: s => s.layers.borders,
    // Första gången lagret syns laddas gränserna, och kartan ritas om när de har kommit
    apply: s => {
      if (!s.on.borders || layer.path) return;
      loadBorders().then(doc => { layer.setData(doc); refresh(); }).catch(err => console.error(err));
    },
    update: s => layer.update({ year: s.wholeYear }),
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

export class BordersLayer {
  constructor(borders = null) {
    this.data = null; this.path = null;
    this.enabled = false;
    if (borders) this.setData(borders);
  }

  /** borders = data/borders.json: färdigprojicerad path, samma format som land.json. */
  setData(borders) {
    this.data = borders;
    this.path ??= new Path2D(borders.path);
  }

  update() { return this.enabled; }

  drawOverlay(ctx, W, H) {
    if (!this.enabled || !this.path) return;
    ctx.save();
    ctx.scale(W / this.data.width, H / this.data.height);
    ctx.strokeStyle = 'rgba(241,223,180,0.75)';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.setLineDash([7, 5]);
    ctx.stroke(this.path);
    ctx.restore();
  }
}
