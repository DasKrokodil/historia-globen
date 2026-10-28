// Lagertyp "linje" (beslut 2): dagens landsgränser som ett filter.
// Av som standard, eftersom dagens gränser inte stämmer historiskt.
export class BordersLayer {
  constructor(borders) {
    this.data = borders; // färdigprojicerad path, samma format som land.json
    this.path = new Path2D(borders.path);
    this.enabled = false;
  }

  update() { return this.enabled; }

  drawOverlay(ctx, W, H) {
    if (!this.enabled) return;
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
