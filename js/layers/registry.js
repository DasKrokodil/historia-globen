// Lagerregistret (#338): varje lager anmäler sig här i stället för att kopplas in för hand i main.js.
// Registret sköter det som är lika för alla lager: raden i Lager och dess standardläge, när lagret är på,
// uppdatering med det gemensamma tillståndet (state.js), ritordningen på lagerbilden (beslut 1), dämpning
// i fokusläget (#235), teckenförklaringen och 3D-markörer som följer lagret.
//
// Ett lager anmäler sig med ett objekt (en "post"). Bara id krävs; resten är valfritt:
//   id          unikt namn, samma som data-layer i Lager och nyckeln i state.layers och state.on
//   name        namnet på raden i Lager
//   group       gruppen i Lager (#357), ett id ur groups i data/vyer.json: people, power, movement, perspective
//               eller settings. Gruppernas namn och ordning och de förinställda vyerna står i data/vyer.json
//   menu        { on, note, aria, sub: { id, label } }: raden i Lager, on = standardläget, note = förklaringen
//               efter namnet, aria = egen aria-label, sub = en tom undermeny under raden (religionerna)
//   layer       lagret självt (klassen i layers/), för det main.js gör med det utöver ritningen (klick, fokus)
//   enabled(s)  om lagret syns i tillståndet s; registret sätter layer.enabled och s.on[id]
//   apply(s)    körs när valen ändras (Lager, fokus, Lugn rörelse), efter att alla lager fått enabled
//   update(s)   väljer vad som syns (beslut 2) och returnerar det; körs vid varje omritning
//   z           platsen i ritordningen (se Z nedan); drawOverlay(ctx, W, H) ritar lagret på lagerbilden.
//               passes = [{ z, draw(ctx, W, H) }] i stället, för ett lager som ritar på flera ställen i ordningen
//   fade        { name, own(focus) }: lagret dämpas i fokusläget när det inte hör till det man följer (#235)
//   legend(s)   del av teckenförklaringen, till exempel { items } eller { war }; delarna slås ihop
//   markers(s)  uppdaterar lagrets 3D-markörer när det är känt vilka lager som är dämpade
//   frame(now, s) varje bildruta (3D-markörernas storlek och plats)
//   covers()    id för händelser vars medalj lagrets egen 3D-markör täcker; händelsens medalj döljs då
//   animating() sant så länge lagerbilden behöver ritas om varje bildruta (rikenas övergångar, #78)
// En post utan layer och update är bara en rad i Lager (till exempel Samtidigt-kortet och "Behåll mina lager").

/** Ritordningen nedifrån och upp. Luckorna gör att ett nytt lager kan läggas in mellan två andra. */
export const Z = {
  paper: 0,       // upptäcktsvyns papperskarta (#101)
  images: 5,      // tidsstyrda rasterbilder, till exempel nattljus (#54)
  areas: 10,      // riken
  religions: 20,  // religioner
  borders: 30,    // dagens gränser
  discovery: 40,  // upptäcktsvyns dimma, portolanlinjer och havsmonster (#101)
  routes: 50,     // vägar och resor (#38)
  wars: 60,       // krigsområden (#27)
  events: 70,     // händelsernas sken
};

/** Hur starkt ett dämpat lager ritas (#235): religionernas fyllning blir då cirka 18 procent, rikenas cirka 11. */
export const FADE = 0.35;

export class LayerRegistry {
  constructor() {
    this.entries = [];
  }

  /** Anmäler ett lager. Ordningen är radernas ordning i Lager och ordningen lagren uppdateras i. */
  add(entry) {
    if (!entry?.id || this.entries.some(e => e.id === entry.id)) throw new Error(`Lagret ${entry?.id} finns redan eller saknar id`);
    this.entries.push(entry);
    return entry.layer;
  }

  /** Lagret (klassen) med ett visst id. */
  get(id) { return this.entries.find(e => e.id === id)?.layer ?? null; }

  /**
   * Bygger raderna i Lager, före det som redan står i menyn (kategorier, rörelse, pauser i index.html).
   * Görs innan LayerMenu skapas, som läser raderna och deras startläge.
   * groups (#357): [{ id, name }] ur data/vyer.json, i menyns ordning. Varje grupp får en rubrik och raderna för
   * lagren med samma group. Finns ett element med data-group="<id>" i menyn (Inställningar i index.html) läggs
   * rubriken och raderna först i det; annars skapas gruppen före det som redan står i menyn. Lager utan känd
   * grupp läggs utan rubrik, som förut.
   */
  buildMenu(menu, groups = []) {
    const first = menu.firstElementChild;
    const places = new Map();
    for (const g of groups) {
      let box = menu.querySelector(`[data-group="${g.id}"]`);
      const own = !box;
      if (own) { box = document.createElement('div'); box.dataset.group = g.id; }
      box.classList.add('layer-group');
      box.setAttribute('role', 'group');
      const head = document.createElement('div');
      head.className = 'layer-heading'; head.id = `layer-group-${g.id}`; head.textContent = g.name;
      box.setAttribute('aria-labelledby', head.id);
      const at = box.firstChild;
      box.insertBefore(head, at);
      places.set(g.id, { box, at });
      if (own) menu.insertBefore(box, first);
    }
    const put = (e, node) => {
      const p = places.get(e.group);
      if (p) p.box.insertBefore(node, p.at);
      else menu.insertBefore(node, first);
    };
    for (const e of this.entries) {
      if (!e.menu) continue;
      const label = document.createElement('label');
      label.className = 'layer-row';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.layer = e.id;
      input.checked = input.defaultChecked = !!e.menu.on;
      if (e.menu.aria) input.setAttribute('aria-label', e.menu.aria);
      label.append(input, ` ${e.name}${e.menu.note ? ' ' : ''}`);
      if (e.menu.note) {
        const note = document.createElement('span');
        note.className = 'layer-note';
        note.textContent = e.menu.note;
        label.append(note);
      }
      put(e, label);
      if (e.menu.sub) {
        const sub = document.createElement('div');
        sub.id = e.menu.sub.id; sub.className = 'layer-sub';
        sub.setAttribute('role', 'group'); sub.setAttribute('aria-label', e.menu.sub.label);
        sub.hidden = true;
        put(e, sub);
      }
    }
  }

  /** Lagren som de förinställda vyerna styr (#357): rader i Lager vars grupp inte är en inställning. */
  viewLayers(groups = []) {
    const settings = new Set(groups.filter(g => g.settings).map(g => g.id));
    return this.entries.filter(e => e.menu && !settings.has(e.group)).map(e => e.id);
  }

  /** Valen har ändrats: vilka lager som syns, och det som hör till valen (fokus, Lugn rörelse). */
  apply(state) {
    for (const e of this.entries) {
      if (!e.enabled) continue;
      const on = !!e.enabled(state);
      state.on[e.id] = on;
      if (e.layer && 'enabled' in e.layer) e.layer.enabled = on;
    }
    for (const e of this.entries) e.apply?.(state);
  }

  /**
   * Uppdaterar alla lager med tillståndet och räknar ut vilka som dämpas i fokusläget.
   * Returnerar det varje lager valde, per id (till exempel de synliga händelserna).
   */
  update(state) {
    const out = {};
    for (const e of this.entries) if (e.update) out[e.id] = e.update(state);
    state.faded = new Set(state.layers.keep ? [] : this.fadable(state).map(e => e.id));
    return out;
  }

  /** Lager som dämpas (eller skulle dämpas, med "Behåll mina lager") medan man följer något (#235). */
  fadable(state) {
    if (!state.focus) return [];
    return this.entries.filter(e => e.fade && state.on[e.id] && !e.fade.own(state.focus));
  }

  /** Teckenförklaringens delar från lagren, ihopslagna till ett objekt. */
  legend(state) {
    return Object.assign({}, ...this.entries.map(e => e.legend?.(state) ?? {}));
  }

  /** 3D-markörerna, när det är känt vilka lager som är dämpade. */
  markers(state) { for (const e of this.entries) e.markers?.(state); }

  /** Varje bildruta. */
  frame(now, state) { for (const e of this.entries) e.frame?.(now, state); }

  /** Händelser vars medalj täcks av ett lagers egen 3D-markör (religionens symbol där den uppstod, #271). */
  coveredEvents() {
    const ids = new Set();
    for (const e of this.entries) for (const id of e.covers?.() ?? []) ids.add(id);
    return ids;
  }

  /** Behöver lagerbilden ritas om nästa bildruta? */
  animating() { return this.entries.some(e => e.animating?.()); }

  /**
   * Ritar alla lager på lagerbilden i ordning efter z, nedifrån och upp. Dämpade lager ritas via
   * drawFaded(draw, alpha), som lägger dem genomskinligt på bilden (Globe.drawFaded).
   */
  draw(ctx, W, H, state, drawFaded) {
    const passes = this.entries.flatMap(e => (e.passes ?? (e.drawOverlay ? [{ z: e.z, draw: e.drawOverlay }] : []))
      .map(p => ({ ...p, id: e.id })));
    passes.sort((a, b) => a.z - b.z);
    for (const p of passes) {
      if (state.faded.has(p.id)) drawFaded((c, w, h) => p.draw(c, w, h), FADE);
      else p.draw(ctx, W, H);
    }
  }
}
