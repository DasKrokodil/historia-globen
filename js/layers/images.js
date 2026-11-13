// Bildlager (#54, format 2 i #1325): färdiga, ekvirektangulära rasterbilder som väljs efter år och ritas på
// lagerbilden. Varje rad i data/bildlager.json med kind "lager" blir en egen rad i Lager, med radens id som lager-id.
// Samma overlayCanvas används av Platt vy, affischen och det skarpa utsnittet (registry.draw), så ingen särskild
// kartkod behövs där: ritningen följer bara W och H.
//
// Byggt: raster över hela världen eller ett utsnitt (bounds), flera rader samtidigt, och rensning av bilder som
// inte visas. Inte byggt: format "vektor" (ritstilen bestäms i #1096) och kind "grund" (version 8); de hoppas över.
import { Z } from './registry.js';
import { t } from '../model.js';

/** Raderna som sidan visar: kind "lager" med minst en rasterskiva som inte är utkast. */
export function imageRows(doc) {
  return (doc?.layers ?? [])
    .filter(row => row.kind === 'lager')
    .map(row => ({ ...row, slices: (row.slices ?? []).filter(x => x.format === 'raster' && x.review !== 'draft') }))
    .filter(row => row.slices.length);
}

/** Äldre lager-id → radens id (aliases), för delade länkar som skrevs före formatet (l=images). */
export function imageAliases(doc) {
  const out = {};
  for (const row of imageRows(doc)) for (const old of row.aliases ?? []) out[old] = row.id;
  return out;
}

/** Skivan som gäller året; to saknas när skivan gäller tills vidare. */
export function sliceAt(slices, year) {
  return slices.find(x => year >= x.from && (x.to == null || year <= x.to)) ?? null;
}

/** Rutan på en ekvirektangulär bild W × H för bounds = [väst, syd, öst, nord]; utan bounds hela bilden. */
export function boundsRect(bounds, W, H) {
  if (!bounds) return { x: 0, y: 0, w: W, h: H };
  const [west, south, east, north] = bounds;
  return { x: (west + 180) / 360 * W, y: (90 - north) / 180 * H, w: (east - west) / 360 * W, h: (north - south) / 180 * H };
}

/** En post i lagerregistret per rad. Raderna ritas i filens ordning, alla på bildlagrens plats (Z.images). */
export function entries({ data, refreshSoon }) {
  return imageRows(data.imageLayers).map(row => {
    const layer = new ImageLayer(row.slices);
    layer.onLoad = refreshSoon;
    return {
      id: row.id, name: t(row.name), group: row.group ?? 'perspective', layer,
      menu: { on: false, note: row.note ? t(row.note) : '' }, z: Z.images,
      enabled: s => s.layers[row.id],
      // En bild är ett tillstånd, som rikena: i ett tidsintervall visas slutåret (#756)
      update: s => layer.update(s.areaYear),
      drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
    };
  });
}

export class ImageLayer {
  /** makeImage skapar bildobjektet; byts ut i testerna, där Image inte finns. */
  constructor(slices = [], makeImage = () => new Image()) {
    this.slices = slices; this.enabled = false; this.active = null; this.images = new Map();
    this.onLoad = () => {}; this.makeImage = makeImage;
  }
  update(year) {
    this.active = this.enabled ? sliceAt(this.slices, year) : null;
    this._purge(this.active?.file);
    if (this.active) this._load(this.active.file);
    return this.active;
  }
  /** Släpper bilder som inte visas: ett avstängt lager och en skiva vars period är över håller inget minne. */
  _purge(keep) {
    for (const [file, image] of this.images) {
      if (file === keep) continue;
      image.onload = image.onerror = null;
      image.src = '';
      this.images.delete(file);
    }
  }
  _load(file) {
    if (this.images.has(file)) return;
    const image = this.makeImage();
    image.onload = () => this.onLoad();
    image.onerror = () => console.warn(`Bildlagret kunde inte läsa ${file}`);
    image.src = file;
    this.images.set(file, image);
  }
  drawOverlay(ctx, W, H) {
    const item = this.active, image = item && this.images.get(item.file);
    if (!image?.complete || !image.naturalWidth) return;
    const r = boundsRect(item.bounds, W, H);
    ctx.save(); ctx.globalAlpha = item.opacity ?? 1; ctx.drawImage(image, r.x, r.y, r.w, r.h); ctx.restore();
  }
}
