// Regionvyns markörer (#1642, steg 1b av #1627) ovanpå den skarpa kartan i Platt vy (js/ui/flatmap.js). Varje händelse på platsen
// får en numrerad markör, där numret är radens nummer i listan "Händelser på platsen". Händelser som gäller hela platsen samlas i
// brickan "Hela Skåne · 4", och markörer på samma ställe i en hög med ortnamn och årsspann som fälls ut som en solfjäder. Ortnamnen
// (data/ortnamn/<plats>.json) ritas på kartans canvas utan att krocka med markörerna. Reglerna är rena funktioner i
// js/region-markers.js; här finns ritningen och knapparna.
//
// Allt ritas i skärmpixlar ovanpå regionvyns skarpa karta, som medaljerna i Platt vy: kartbilderna (beslut 1) ändras inte. Markörerna,
// högarna, brickan och etiketten är riktiga knappar med aria-label i kartans etikettlager, i listans ordning, så att Tab går i
// samma ordning som listan och piltangenterna går mellan dem. Enter på en markör markerar den (raden i listan får ram), Enter igen
// eller etiketten öppnar faktarutan; Enter på en hög eller brickan fäller ut den, och Escape fäller ihop (controllers/region.js).
import { regionItems, groupMarkers, pileName, yearSpan, fanLayout, rowLayout, nameCandidates, placeNames, crossesEdge, tagSpot, brickSpot,
  MARK_PX, PILE_BADGE, PILE_PX, PILE_PX_TOUCH } from '../region-markers.js';
import { inGeometry } from '../place-geo.js';
import { CAT, t, formatEventTime, pluralUi } from '../model.js';
import { ui } from '../i18n.js';
import { say } from './status.js';

const span = (from, to) => formatEventTime({ start: from, end: to, edtf: '' });
/** Pekskärm eller smal skärm: tryckytan är 44 px, och högarnas radie växer så att tryckytorna inte går in i varandra. */
const touchLike = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse), (max-width: 760px)').matches;
/** Beskeden på statusraden när något fälls ut, fälls ihop eller markeras på kartan (svaret på ett tryck). */
const tell = text => say(text, 'plats', { priority: 2, immediate: true });
/** Orden som kapar en platstext till ett ortnamn (högens namn), på sidans språk. */
const list = key => { const v = ui(key); return Array.isArray(v) ? v : []; };
const placeWords = () => ({ cut: list('regionView.placeCut'), prefix: list('regionView.placePrefix') });
/** Fonterna för ortnamnen på kartan (samma familjer som sidan: Instrument Sans och IM Fell English, CLAUDE.md, Utseende). */
const FONT = {
  place: '600 11.5px "Instrument Sans", system-ui, sans-serif',
  neighbour: '600 11px "Instrument Sans", system-ui, sans-serif',
  sea: 'italic 400 13px "IM Fell English", Georgia, serif',
};

export class RegionMarks {
  /** map: kartan (FlatMap), layer: etikettlagret (#flat-labels), onSelect(id): öppna faktarutan. */
  constructor({ map, layer, onSelect }) {
    Object.assign(this, { map, layer, onSelect });
    this.box = null;        // knapparnas behållare (skapas första gången)
    this.content = null;    // { place, items, cands }
    this.names = null;      // ortnamnsfilen för platsen
    this.mark = null;       // markerad händelse (id)
    this.hover = null;      // händelse under musen eller i fokus i listan (id), utan att något fälls ut
    this.open = null;       // utfälld: 'brick' eller id på en händelse i den utfällda högen
    this._wantOpen = null;  // fäll ut det som innehåller händelsen vid nästa ritning (en markerad rad)
    this._focusAfter = null; // knappen som ska få fokus när solfjädern har ritats
    this._lastSel = null;
    this._pool = new Map();
    this._measure = null;
    this.onMark = null;     // (ids, from) när markeringen ändras: raderna i listan får ram (controllers/region.js)
    this.state = { shown: [], names: [] }; // det som ritades senast (renderingsstatus och prov)
  }

  /** Platsens händelser (listans ordning) och platsen. Nollställer markering och solfjäder. */
  setContent({ place, events }) {
    const items = regionItems(events, place);
    this.content = { place, items, byId: new Map(items.map(it => [it.e.id, it])) };
    this.mark = this.hover = this.open = this._wantOpen = null;
    this._lastSel = null;
    this._refreshCands();
    this.map.draw();
  }

  /** Ortnamnsfilen (data/ortnamn/<plats>.json), när den har laddats. */
  setNames(doc) {
    this.names = doc;
    this._refreshCands();
    this.map.draw();
  }

  _refreshCands() {
    if (!this.content) return;
    this.content.cands = nameCandidates(this.names, this.content.items.filter(it => !it.whole).map(it => it.e), t);
    this.content.pileNames = new Map();
    for (const el of this._pool.values()) if (el.classList.contains('rpile')) el._sig = null; // högarnas namn räknas om med orterna
  }

  /** Regionvyn är slut: knapparna tas bort. */
  clear() {
    this.content = null; this.names = null;
    this.mark = this.hover = this.open = this._wantOpen = null;
    for (const el of this._pool.values()) el.remove();
    this._pool.clear();
    if (this.box) this.box.hidden = true;
    this.state = { shown: [], names: [] };
    delete this.map.root.dataset.regionMarks;
    delete this.map.root.dataset.regionNames;
  }

  get active() { return !!this.content; }
  /** Raderna i brickan (händelser som gäller hela platsen), i listans ordning. */
  get brickIds() { return this.content ? this.content.items.filter(it => it.whole).map(it => it.e.id) : []; }
  /** Numret i listan för en händelse. */
  numberOf(id) { return this.content?.byId.get(id)?.n ?? null; }

  /** Markera en händelse (från listan eller kartan). open: fäll ut högen eller brickan som den ligger i. */
  setMark(id, { open = true, from = 'list' } = {}) {
    if (!this.content) return;
    const known = id && this.content.byId.has(id) ? id : null;
    this.mark = known;
    if (known && open) this._wantOpen = known;
    this.map.draw();
    this.onMark?.(known ? [known] : [], from);
  }

  /** Markera utan att fälla ut något (muspekaren över en rad): en hög som är ihopfälld får ramen i stället. */
  setHover(id) {
    if (!this.content || this.hover === id) return;
    this.hover = id && this.content.byId.has(id) ? id : null;
    this.map.draw();
  }

  /** Fäll ihop solfjädern eller brickan. Ger true när något var utfällt. focus: lägg fokus på högen eller brickan. */
  closeFan({ focus = true } = {}) {
    if (!this.open) return false;
    const key = this.open === 'brick' ? 'brick' : this._pileKeyOf(this.open);
    const inside = this.box?.contains(document.activeElement);
    this.open = null;
    if (focus && inside && key) this._focusAfter = key;
    this.map.draw();
    return true;
  }

  /** Ett tryck på kartan utanför knapparna: solfjädern fälls ihop och markeringen tas bort. */
  background() {
    if (!this.content) return;
    const had = this.open || this.mark;
    this.open = null;
    if (this.mark) this.setMark(null, { from: 'map' });
    else if (had) this.map.draw();
  }

  _pileKeyOf(id) {
    const pile = this._layout?.piles.find(p => p.members.some(m => m.e.id === id));
    return pile ? `pile:${pile.members[0].e.id}` : null;
  }

  // ---- ritning ------------------------------------------------------------------------------------------------------
  /** Ritar markörerna, högarna, brickan, etiketten och ortnamnen. ctx är kartans canvas i CSS-pixlar. */
  render(ctx) {
    const c = this.content, map = this.map;
    if (!c) return;
    const W = map.w, H = map.h;
    this._ensureBox();
    // Den valda händelsen (faktarutan) blir markerad, och dess hög fälls ut
    const sel = map._marks?.selectedId ?? null;
    if (sel !== this._lastSel) {
      this._lastSel = sel;
      if (sel && c.byId.has(sel)) { this.mark = sel; this._wantOpen = sel; }
    }
    const toScreen = (lat, lon) => map._toScreen(lat, lon, W);
    const touch = touchLike();
    const L = this._layout = groupMarkers(c.items, toScreen, touch ? PILE_PX_TOUCH : PILE_PX);
    // Det som ska fällas ut: högen eller brickan med den markerade raden
    if (this._wantOpen) {
      const id = this._wantOpen;
      this._wantOpen = null;
      if (L.brick.some(it => it.e.id === id)) this.open = 'brick';
      else if (L.piles.some(p => p.members.some(m => m.e.id === id))) this.open = id;
      else if (this.open !== 'brick') this.open = null;
    }
    const openPile = this.open && this.open !== 'brick' ? L.piles.find(p => p.members.some(m => m.e.id === this.open)) : null;
    if (this.open && this.open !== 'brick' && !openPile) this.open = null; // högen finns inte längre (zoomat in)
    const want = []; // [key, el, x, y] i listans ordning
    const covers = map.regionCovers?.() ?? [];
    const blocked = [...covers];
    const visible = (x, y, m = 0) => x >= -m && x <= W + m && y >= -m && y <= H + m;
    const hl = id => id && (id === this.mark || id === this.hover);
    const R = MARK_PX / 2;

    // Brickan vid platsens namn: ovanför platsens ruta, inne på kartan, och inte under zoomknapparna, kortet eller rutan (med hela
    // tryckytan, 44 px på pekskärm)
    const b = map._region?.bounds;
    let brickPos = null;
    const brickEl = L.brick.length && b ? this._brick(L.brick, c.place) : null;
    if (brickEl) {
      const top = toScreen(b.north, (b.west + b.east) / 2);
      const size = { w: (brickEl._w ?? 140) + (touch ? 8 : 0), h: touch ? 44 : 34 };
      brickPos = brickSpot({ x: top.x, y: top.y - 8 - (touch ? 7 : 0) }, size, covers, W, H);
      if (touch) brickPos.y -= 7; // nedre kanten på den synliga brickan, tryckytan sticker ut 7 px under
    }
    // Den utfällda solfjäderns yta: markörer och högar under den tonas ned och går inte att trycka på medan den är utfälld
    // Solfjädern ryms i den fria delen av kartan (inte under kortet, arket eller fokusraden, region-frame.js freeArea)
    const fr = map.regionFree?.() ?? { x: 0, y: 0, w: W, h: H };
    const fanAt = openPile && fanLayout(openPile.members.length, { x: openPile.x - fr.x, y: openPile.y - fr.y }, { W: fr.w, H: fr.h, minR: PILE_BADGE / 2 + R + 14 });
    const fan = fanAt ? { ...fanAt, cx: fanAt.cx + fr.x, cy: fanAt.cy + fr.y, points: fanAt.points.map(q => ({ x: q.x + fr.x, y: q.y + fr.y })) } : null;
    const brickRow = this.open === 'brick' && brickPos ? rowLayout(L.brick.length, { x: brickPos.x, y: brickPos.y + (touch ? 12 : 6) }, { W }) : null;
    const under = (x, y, r) => (fan && Math.hypot(x - fan.cx, y - fan.cy) < fan.r + R + r)
      || (brickRow && brickRow.some(q => Math.abs(q.x - x) < R + r && Math.abs(q.y - y) < R + r));

    // Ordningen: brickan först (den gäller hela platsen), sedan markörer och högar efter det lägsta numret
    const top = [
      ...(brickEl ? [{ n: 0, kind: 'brick' }] : []),
      ...L.singles.map(it => ({ n: it.n, kind: 'single', it })),
      ...L.piles.map(p => ({ n: p.members[0].n, kind: 'pile', p })),
    ].sort((a, b2) => a.n - b2.n);
    const spokes = [], tags = [], labels = [];
    for (const entry of top) {
      if (entry.kind === 'brick') {
        want.push(['brick', brickEl, brickPos.x, brickPos.y]);
        const bw = brickEl._w ?? 120;
        blocked.push({ x0: brickPos.x - bw / 2, y0: brickPos.y - 34, x1: brickPos.x + bw / 2, y1: brickPos.y + (touch ? 7 : 0) });
        brickEl.classList.toggle('is-marked', L.brick.some(it => hl(it.e.id)) && this.open !== 'brick');
        if (brickRow) {
          const pts = brickRow;
          L.brick.forEach((it, i) => {
            want.push([`fan:${it.e.id}`, this._marker(it, true), pts[i].x, pts[i].y]);
            blocked.push(box(pts[i].x, pts[i].y, R + 3));
            if (hl(it.e.id)) labels.push({ it, x: pts[i].x, y: pts[i].y });
          });
        }
      } else if (entry.kind === 'single') {
        const { it } = entry;
        if (!visible(it.p.x, it.p.y, R)) continue;
        const el = this._marker(it, false), low = under(it.p.x, it.p.y, R);
        setUnder(el, low);
        want.push([`mark:${it.e.id}`, el, it.p.x, it.p.y]);
        if (low) continue;
        blocked.push(box(it.p.x, it.p.y, R + (it.approx ? 8 : 3))); // den streckade ringen runt en ungefärlig plats är större
        if (hl(it.e.id)) labels.push({ it, x: it.p.x, y: it.p.y });
      } else {
        const { p } = entry;
        const key = `pile:${p.members[0].e.id}`;
        const isOpen = p === openPile;
        if (!visible(p.x, p.y, 40) && !isOpen) continue;
        const el = this._pile(p, key, isOpen), low = !isOpen && under(p.x, p.y, PILE_BADGE / 2);
        el.classList.toggle('is-marked', !isOpen && p.members.some(m => hl(m.e.id)));
        setUnder(el, low);
        want.push([key, el, p.x, p.y]);
        if (low) { el.dataset.tag = 'none'; continue; }
        blocked.push(box(p.x, p.y, PILE_BADGE / 2 + 3));
        tags.push({ el, p });
        if (isOpen) {
          const f = fan;
          p.members.forEach((m, i) => {
            const at = f.points[i];
            spokes.push([p.x, p.y, at.x, at.y]);
            want.push([`fan:${m.e.id}`, this._marker(m, true), at.x, at.y]);
            blocked.push(box(at.x, at.y, R + 3));
            if (hl(m.e.id)) labels.push({ it: m, x: at.x, y: at.y });
          });
          el.style.zIndex = '2';
        } else el.style.zIndex = '';
      }
    }
    // Högarnas namn och årsspann bredvid högen, där det är fritt (höger, vänster, över, under) och helst inte över kantlinjen;
    // annars bara i aria-label
    const geom = c.place?.boundary?.geometry;
    const inside = (x, y) => { const ll = map._lonLat({ x, y }); return !!geom && inGeometry(geom, ll.lon, ll.lat); };
    const crosses = bx => crossesEdge(bx, inside);
    // Ryms inte namnet med årsspannet prövas bara namnet (en kort etikett), så att högen nästan alltid har ett namn
    for (const { el, p } of tags) {
      const tag = el.querySelector('.rpile-tag');
      if (tag._w === undefined) {
        el.classList.remove('tag-short');
        tag._w = tag.offsetWidth || 90; tag._h = tag.offsetHeight || 30;
        el.classList.add('tag-short');
        tag._ws = tag.offsetWidth || 60; tag._hs = tag.offsetHeight || 18;
      }
      let spot = tagSpot(p, { w: tag._w, h: tag._h }, PILE_BADGE / 2 + 4, blocked, W, H, crosses), short = false;
      if (!spot) { spot = tagSpot(p, { w: tag._ws, h: tag._hs }, PILE_BADGE / 2 + 4, blocked, W, H, crosses); short = !!spot; }
      el.classList.toggle('tag-short', short);
      el.dataset.tag = spot?.side ?? 'none';
      if (spot) blocked.push(spot.box);
    }
    // Etiketten vid den markerade markören (eller den under muspekaren, som går före): över, under, till höger eller vänster, där den
    // inte täcker andra markörer
    const label = labels.find(l => l.it.e.id === this.hover) ?? labels.find(l => l.it.e.id === this.mark) ?? null;
    if (label) {
      const el = this._label(label.it);
      const size = { w: el._w ?? 160, h: el._h ?? 24 };
      const own = box(label.x, label.y, R + 3);
      const others = blocked.filter(bx => !(bx.x0 === own.x0 && bx.y0 === own.y0));
      const spot = tagSpot(label, size, R + 5, others, W, H, () => false, ['above', 'below', 'right', 'left']);
      const x0 = spot ? spot.box.x0 : Math.min(Math.max(label.x - size.w / 2, 4), W - size.w - 4);
      const y0 = spot ? spot.box.y0 : Math.max(4, label.y - R - 5 - size.h);
      want.push([`label:${label.it.e.id}`, el, x0, y0, 'tl']);
      blocked.push({ x0, y0, x1: x0 + size.w, y1: y0 + size.h });
    }

    // Solfjäderns ekrar på kartan: från platsen till varje utfälld markör, med mörk kant som kantlinjen
    if (spokes.length) {
      ctx.save();
      ctx.lineCap = 'round';
      for (const [w, col] of [[4, cssVar('--night')], [1.6, cssVar('--parchment')]]) {
        ctx.lineWidth = w; ctx.strokeStyle = col;
        ctx.beginPath();
        for (const [x0, y0, x1, y1] of spokes) { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Ortnamnen: efter markörerna, så att de viker för dem; bara de som inte korsar platsens kantlinje
    const cands = (c.cands ?? []).map(cd => ({ ...cd, p: toScreen(cd.at[1], cd.at[0]) }));
    const names = placeNames(cands, { W, H, blocked, measure: (text, kind) => this._textWidth(ctx, text, kind), crosses });
    this._drawNames(ctx, names);

    this._place(want);
    this.state = { shown: want.map(([k]) => k), names: names.map(n => n.id) };
    map.root.dataset.regionMarks = `${L.singles.length},${L.piles.length},${L.brick.length}`;
    map.root.dataset.regionNames = String(names.length); // renderingsstatus för webbläsartestet: hur många ortnamn som ritades
  }

  _drawNames(ctx, names) {
    if (!names.length) return;
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const nm of names) {
      ctx.font = FONT[nm.kind];
      ctx.textAlign = nm.align;
      const text = nm.kind === 'neighbour' ? nm.text.toLocaleUpperCase() : nm.text;
      if (nm.kind === 'place') {
        ctx.beginPath(); ctx.arc(nm.p.x, nm.p.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = cssVar('--parchment'); ctx.strokeStyle = cssVar('--night'); ctx.lineWidth = 1.5;
        ctx.fill(); ctx.stroke();
      }
      // Mörk kant runt texten, så att den går att läsa både på land och hav
      ctx.strokeStyle = cssVar('--night'); ctx.lineWidth = 3.2;
      ctx.strokeText(text, nm.x, nm.y);
      ctx.fillStyle = cssVar(nm.kind === 'sea' ? '--map-sea-label' : nm.kind === 'neighbour' ? '--map-land-label' : '--parchment');
      ctx.fillText(text, nm.x, nm.y);
    }
    ctx.restore();
  }

  _textWidth(ctx, text, kind) {
    ctx.save();
    ctx.font = FONT[kind];
    const w = ctx.measureText(kind === 'neighbour' ? text.toLocaleUpperCase() : text).width;
    ctx.restore();
    return w;
  }

  // ---- knapparna ----------------------------------------------------------------------------------------------------
  _ensureBox() {
    if (this.box) { this.box.hidden = false; this._groupLabel(); return; }
    const el = this.box = document.createElement('div');
    el.className = 'region-marks';
    el.setAttribute('role', 'group');
    const hint = document.createElement('span');
    hint.className = 'sr-only'; hint.id = 'region-marks-keys';
    el.append(hint);
    el.setAttribute('aria-describedby', hint.id);
    // Piltangenterna går mellan markörerna i listans ordning (Tab gör det också)
    el.addEventListener('keydown', e => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys) && e.key !== 'Home' && e.key !== 'End') return;
      const all = [...el.querySelectorAll('button')].filter(btn => !btn.hidden);
      if (!all.length) return;
      const i = all.indexOf(document.activeElement);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (i < 0 ? 0 : (i + keys[e.key] + all.length) % all.length);
      e.preventDefault(); e.stopPropagation();
      all[next].focus({ preventScroll: true });
    });
    this.layer.append(el);
    this._groupLabel();
  }

  _groupLabel() {
    const name = t(this.content?.place?.name);
    this.box.setAttribute('aria-label', ui('regionView.marks', { place: name }));
    this.box.querySelector('#region-marks-keys').textContent = ui('regionView.keys');
  }

  _get(key, make) {
    let el = this._pool.get(key);
    if (!el) { el = make(); el.dataset.key = key; this._pool.set(key, el); }
    return el;
  }

  /** En numrerad markör. fan: i en utfälld hög eller under brickan. */
  _marker(it, fan) {
    const key = `${fan ? 'fan' : 'mark'}:${it.e.id}`;
    const el = this._get(key, () => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rmark';
      b.addEventListener('click', () => {
        // Första trycket markerar (raden i listan får ram), nästa öppnar faktarutan
        if (this.mark === it.e.id) { this.onSelect?.(it.e.id); return; }
        this.setMark(it.e.id, { open: false, from: 'map' });
        tell(ui('regionView.marked', { n: it.n, title: t(it.e.title) }));
      });
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') this.setHover(it.e.id); });
      b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') this.setHover(null); });
      return b;
    });
    if (el._n !== it.n) {
      el._n = it.n;
      el.textContent = String(it.n);
      el.style.setProperty('--c', CAT[it.e.category]?.color ?? cssVar('--brass'));
      el.classList.toggle('is-approx', it.approx);
      el.dataset.event = it.e.id; el.dataset.n = String(it.n);
      el._label = `${ui('regionView.markLabel', { n: it.n, title: t(it.e.title), time: formatEventTime(it.e) })}${it.approx ? `, ${ui('place.approx')}` : ''}`;
    }
    el.classList.toggle('rfan', fan);
    el.classList.toggle('in-brick', fan && it.whole); // brickan säger redan att platsen är hela platsen
    const on = it.e.id === this.mark;
    el.classList.toggle('is-marked', on || it.e.id === this.hover);
    el.setAttribute('aria-pressed', String(on));
    // Markerad: namnet säger steg två, att Enter eller ett tryck till öppnar faktarutan
    el.setAttribute('aria-label', on ? `${el._label}, ${ui('regionView.markedHint')}` : el._label);
    return el;
  }

  /** Högen: ortnamn och antal, årsspannet under, fälls ut som en solfjäder. */
  _pile(p, key, isOpen) {
    const el = this._get(key, () => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rpile';
      b.innerHTML = '<span class="rpile-count" aria-hidden="true"></span><span class="rpile-tag" aria-hidden="true"><span class="rpile-name"></span><span class="rpile-years"></span></span>';
      b.addEventListener('click', () => {
        const ids = (b._ids ?? []);
        if (this.open && ids.includes(this.open)) { this.closeFan(); tell(ui('regionView.fanClosed', { name: b._name })); return; }
        this.open = ids[0];
        this._focusAfter = `fan:${ids[0]}`;
        this.map.draw();
        tell(pluralUi('regionView.fanOpen', ids.length, { name: b._name }));
      });
      b.addEventListener('mouseenter', () => { b.classList.add('is-hover'); });
      b.addEventListener('mouseleave', () => { b.classList.remove('is-hover'); });
      return b;
    });
    const ids = p.members.map(m => m.e.id), sig = ids.join();
    if (el._sig !== sig) {
      el._sig = sig; el._ids = ids;
      const c = this.content;
      const name = c.pileNames.get(sig) ?? pileName(p.members, this.names, t, placeWords());
      c.pileNames.set(sig, name);
      el._name = name;
      const { from, to } = yearSpan(p.members);
      const years = span(from, to), count = pluralUi('regionView.count', ids.length);
      // Hur många av händelserna i högen som har ungefärlig plats, i namnet för skärmläsare och i ledtexten
      const approx = p.members.filter(m => m.approx).length;
      const label = `${ui('regionView.pileLabel', { name, count, years, numbers: p.members.map(m => m.n).join(', ') })}${approx ? `, ${pluralUi('regionView.pileApprox', approx)}` : ''}`;
      el.querySelector('.rpile-name').textContent = name;
      el.querySelector('.rpile-years').textContent = years;
      el.setAttribute('aria-label', label);
      el.title = label;
      el.querySelector('.rpile-tag')._w = undefined;
    }
    el.setAttribute('aria-expanded', String(isOpen));
    // Antalet skrivs "×10", så att det inte förväxlas med ett nummer i listan; utfälld visar högen ett minus (fäll ihop)
    el.querySelector('.rpile-count').textContent = isOpen ? '−' : `×${ids.length}`;
    return el;
  }

  /** Brickan "Hela Skåne · 4": händelserna som gäller hela platsen; fälls ut som en rad numrerade markörer under sig. */
  _brick(items, place) {
    const el = this._get('brick', () => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rbrick';
      b.addEventListener('click', () => {
        const name = ui('regionView.brick', { place: t(this.content?.place?.name) });
        if (this.open === 'brick') { this.closeFan(); this.onMark?.([], 'brick'); tell(ui('regionView.fanClosed', { name })); return; }
        this.open = 'brick';
        this._focusAfter = `fan:${this.brickIds[0]}`;
        this.map.draw();
        this.onMark?.(this.brickIds, 'brick'); // raderna i listan får ram
        tell(pluralUi('regionView.fanOpen', this.brickIds.length, { name }));
      });
      return b;
    });
    const name = t(place?.name), sig = `${name}|${items.length}`;
    if (el._sig !== sig) {
      el._sig = sig;
      el.textContent = `${ui('regionView.brick', { place: name })} · ${items.length}`;
      el.setAttribute('aria-label', ui('regionView.brickLabel', { place: name, count: pluralUi('regionView.count', items.length), numbers: items.map(it => it.n).join(', ') }));
      el._w = undefined;
    }
    el.setAttribute('aria-expanded', String(this.open === 'brick'));
    return el;
  }

  /** Etiketten vid den markerade markören: numret och rubriken; den öppnar faktarutan. */
  _label(it) {
    const key = `label:${it.e.id}`;
    const el = this._get(key, () => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'glabel region-label';
      b.addEventListener('click', () => this.onSelect?.(it.e.id));
      return b;
    });
    if (el._n !== it.n) {
      el._n = it.n;
      el.textContent = `${it.n} · ${t(it.e.title)}`;
      el.setAttribute('aria-label', ui('regionView.open', { n: it.n, title: t(it.e.title) }));
      el._w = undefined;
    }
    return el;
  }

  /** Lägger knapparna på sina platser, i listans ordning i DOM (Tab), och tar bort dem som inte syns. Fokus behålls. */
  _place(want) {
    const keep = new Set(want.map(([k]) => k));
    for (const [k, el] of this._pool) if (!keep.has(k)) { el.remove(); this._pool.delete(k); }
    const active = document.activeElement;
    const order = want.map(([, el]) => el);
    const kids = [...this.box.children].filter(el => el.tagName === 'BUTTON');
    if (kids.length !== order.length || kids.some((el, i) => el !== order[i])) {
      for (const el of order) this.box.append(el);
      if (active && this.box.contains(active) && document.activeElement !== active) active.focus({ preventScroll: true });
    }
    for (const [, el, x, y, anchor] of want) {
      el.hidden = false;
      const shift = anchor === 'tl' ? '' : el.classList.contains('rmark') || el.classList.contains('rpile') ? ' translate(-50%, -50%)' : ' translate(-50%, -100%)';
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)${shift}`;
      if (el.classList.contains('rpile')) continue; // högen är lika stor som sin bricka; namnet ligger utanför (rpile-tag)
      if (el._w === undefined) { el._w = el.offsetWidth; el._h = el.offsetHeight; }
    }
    if (this._focusAfter) {
      const el = this._pool.get(this._focusAfter);
      this._focusAfter = null;
      el?.focus({ preventScroll: true });
    }
  }
}

const box = (x, y, r) => ({ x0: x - r, y0: y - r, x1: x + r, y1: y + r });
/** Under en utfälld solfjäder: nedtonad och utan tryck eller tangentbordsfokus (inert) tills den fälls ihop. */
function setUnder(el, low) {
  el.classList.toggle('is-under', low);
  el.inert = low;
}

const cssCache = new Map();
function cssVar(name) {
  if (!cssCache.has(name)) cssCache.set(name, getComputedStyle(document.documentElement).getPropertyValue(name).trim());
  return cssCache.get(name);
}
