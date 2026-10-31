// Bildlager (#54): färdiga, ekvirektangulära rasterbilder som väljs efter år och ritas på lagerbilden.
// Samma overlayCanvas används av Platt vy, så ingen särskild kartkod behövs där.
import { Z } from './registry.js';

export function entry({ data, refreshSoon }) {
  const layer = new ImageLayer(data.imageLayers?.layers ?? []);
  layer.onLoad = refreshSoon;
  return {
    id: 'images', name: 'Nattljus', group: 'perspective', layer,
    menu: { on: false, note: 'NASA Black Marble från 2016' }, z: Z.images,
    enabled: s => s.layers.images,
    update: s => layer.update(s.wholeYear),
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

export class ImageLayer {
  constructor(layers = []) { this.layers = layers; this.enabled = false; this.active = null; this.images = new Map(); this.onLoad = () => {}; }
  update(year) {
    if (!this.enabled) { this.active = null; return; }
    this.active = this.layers.find(x => year >= x.from && (x.to == null || year <= x.to)) ?? null;
    if (this.active) this._load(this.active.file);
  }
  _load(file) {
    if (this.images.has(file)) return;
    const image = new Image();
    image.onload = () => this.onLoad();
    image.onerror = () => console.warn(`Bildlagret kunde inte läsa ${file}`);
    image.src = file;
    this.images.set(file, image);
  }
  drawOverlay(ctx, W, H) {
    const item = this.active, image = item && this.images.get(item.file);
    if (!image?.complete || !image.naturalWidth) return;
    ctx.save(); ctx.globalAlpha = item.opacity ?? 1; ctx.drawImage(image, 0, 0, W, H); ctx.restore();
  }
}
