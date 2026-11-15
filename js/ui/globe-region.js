// Regionvyn på globen (#1644, steg 2 av #1627): markörerna, högarna, brickan och ortnamnen från steg 1b (js/ui/region-marks.js)
// ovanpå globen, när den har flugit in till en stor plats (Aotearoa, Grönland). RegionMarks är skriven för Platt vy; här finns
// samma gränssnitt för globen: _toScreen och _lonLat går genom klotets projektion (Globe.project och pickLatLon), och ekrarna och
// ortnamnen ritas på en egen genomskinlig canvas i skärmpixlar ovanpå klotet. Kartbilderna (beslut 1) ändras inte.
//
// Markörerna ritas om när kameran har rört sig (globe.onFrame, en gång per bildruta med ändrad vy) eller när RegionMarks ber om det
// (draw), aldrig annars, så att en pulserande markör eller en stilla glob inte kostar något.
import { RegionMarks } from './region-marks.js';
import { latLonToVec3 } from '../globe.js';
import { outerPoints } from '../region-frame.js';

export class GlobeRegion {
  /** globe: Globe. root: behållaren över klotet (#globe-region). canvas: ekrarnas och namnens canvas. labels: knapparnas lager. */
  constructor({ globe, root, canvas, labels, onSelect, selectedId = () => null }) {
    Object.assign(this, { globe, root, canvas, labels, selectedId });
    this.w = 0; this.h = 0;
    this._region = null;    // { id, bounds } när vyn är öppen (samma fält som FlatMap har)
    this.regionFree = null; // () => { x, y, w, h }: den fria ytan (controllers/region.js)
    this.regionCovers = null; // () => [rutor]: det som ligger ovanpå klotet
    this._dirty = false;
    this._sig = '';
    this.regionMarks = new RegionMarks({ map: this, layer: labels, onSelect: id => onSelect?.(id) });
    globe.onFrame(() => this._frame());
  }

  get region() { return this._region?.id ?? null; }
  get _marks() { return { selectedId: this.selectedId() }; }

  /** Punkten på skärmen (CSS-pixlar i klotets canvas). Baksidan av klotet hamnar långt utanför, så att den aldrig ritas. */
  _toScreen(lat, lon) {
    const p = this.globe.project(latLonToVec3(lat, lon));
    return p.facing > 0.02 ? { x: p.x, y: p.y } : { x: -1e5, y: -1e5 };
  }

  /** Platsen { lon, lat } under en punkt på skärmen, eller NaN utanför klotet. */
  _lonLat({ x, y }) {
    const r = this.globe.canvas.getBoundingClientRect();
    return this.globe.pickLatLon(r.left + x, r.top + y) ?? { lon: NaN, lat: NaN };
  }

  /** geometry: platsens gräns; dess yttre ringar (högst cirka 400 punkter) ger platsens ruta på skärmen. */
  open(id, bounds, geometry = null) {
    const all = geometry ? outerPoints(geometry) : [];
    const step = Math.max(1, Math.ceil(all.length / 400));
    this._region = { id, bounds, outline: all.filter((_, i) => i % step === 0) };
    this.root.hidden = false;
    this.root.dataset.region = id;
    this.draw();
  }

  close() {
    if (!this._region) return;
    this._region = null;
    this.regionMarks.clear();
    this.root.hidden = true;
    delete this.root.dataset.region;
    delete this.root.dataset.regionBox;
    this.canvas.width = this.canvas.height = 0; // frigör bilden (cirka 20 MB vid 1400 × 900 med dpr 2) tills vyn öppnas igen
  }

  /** RegionMarks ber om en ny ritning (markering, utfällning, ortnamn). */
  draw() {
    if (!this._region) return;
    this._dirty = true;
    this.globe.invalidate();
  }

  _frame() {
    if (!this._region) return;
    const c = this.globe.camera, g = this.globe.group;
    const sig = `${g.rotation.x}|${g.rotation.y}|${c.position.z}|${c.fov}|${c.view?.offsetX}|${c.view?.offsetY}|${this.globe.canvas.clientWidth}x${this.globe.canvas.clientHeight}`;
    if (sig === this._sig && !this._dirty) return;
    this._sig = sig; this._dirty = false;
    this.render();
  }

  render() {
    const gc = this.globe.canvas, w = gc.clientWidth, h = gc.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w; this.h = h;
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    }
    const ctx = this.canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.globe.camera.updateMatrixWorld();
    this.globe.group.updateMatrixWorld();
    // Platsens ruta på skärmen (renderingsstatus för proven, som data-region-box i Platt vy)
    const pts = this._region.outline.map(([lo, la]) => this._toScreen(la, lo)).filter(p => p.x > -1e4);
    if (pts.length) this.root.dataset.regionBox = [Math.min(...pts.map(p => p.x)), Math.min(...pts.map(p => p.y)), Math.max(...pts.map(p => p.x)), Math.max(...pts.map(p => p.y))].map(Math.round).join(',');
    this.regionMarks.render(ctx);
  }
}
