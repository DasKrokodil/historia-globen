// Stängregistret för ytor (#894): varje yta anmäler sig i en grupp, och en öppnad yta stänger sin grupp.
// Ersätter de handskrivna `layers.close(); focusMenu.close(); panel.setOpen(false)` som förut stod på flera ställen
// (main.js, controllers/facts.js, controllers/focus.js). En ny yta anmäler sig här och får ett lagernamn i
// css/style.css (--z-…); den ska inte få egna close()-anrop mot de andra ytorna.
//
// Grupper (lägg till fler här när arken och dialogerna flyttas över, en grupp i taget):
//   meny      knapparna överst med sina menyer (Lager, Fokus)
//   sidopanel Samtidigt-panelen
//   popover   årshoppet och intervallformuläret (#1141): de ligger i lagret --z-poppa ovanför menyerna och stänger varandra
//   dialog    Källor, Hjälp, Kom igång, Quiz och förslagsformuläret (#1323): bara en åt gången. En öppen dialog pausar
//             uppspelningen och nedräkningen, och de fortsätter inte av sig själva (onDialogOpen)
//   uppdrag   Samtidighetsjakten (#1323): ett kort som inte stänger något annat, men som Escape stänger centralt
// CLOSES säger vilka grupper en öppnad yta i gruppen stänger. En meny stänger de andra menyerna och sidopanelen,
// en sidopanel stänger menyerna (men inte sig själv: det finns en).
export const CLOSES = {
  meny: ['meny', 'sidopanel'],
  sidopanel: ['meny'],
  popover: ['popover'],
  dialog: ['dialog'],
  uppdrag: [],
};

// Escape stänger det översta öppna i den första gruppen som har något öppet (#1323). Menyerna och sidopanelen har egna
// Escape-lyssnare och tas bara med när de är anmälda med `central: true` (Turer-menyn, vars lyssnare kräver fokus i menyn).
const ESCAPE_ORDER = ['dialog', 'popover', 'uppdrag', 'meny'];

export function createSurfaces(closes = CLOSES) {
  const members = new Map(); // id -> { group, close, isOpen, opener, central, openedAt }
  let counter = 0;
  const surfaces = {
    /** Fylls i av main.js: anropas när en dialog öppnas (pausar uppspelningen och nedräkningen, #1323). */
    onDialogOpen: null,
    /**
     * Anmäl en yta: `close(refocus)` stänger den och måste tåla att anropas när ytan redan är stängd. En ny dialog som
     * öppnas anropar close(false) på de andra, Escape close(true). Valfritt (#1323): `isOpen()` säger om ytan är öppen, `opener` är knappen som fokus går tillbaka till vid Escape (element eller
     * funktion), och `central` (standard sant för dialog, popover och uppdrag) tar med ytan i det centrala Escape.
     */
    register(id, group, close, { isOpen = null, opener = null, central = group !== 'meny' && group !== 'sidopanel' } = {}) {
      if (!closes[group]) throw new Error(`Okänd ytgrupp: ${group}`);
      members.set(id, { group, close, isOpen, opener, central, openedAt: 0 });
    },
    /** Ytan `id` har öppnats: stäng alla andra ytor i de grupper som dess grupp stänger. */
    opened(id) {
      const self = members.get(id);
      if (!self) throw new Error(`Okänd yta: ${id}`);
      self.openedAt = ++counter;
      for (const [other, m] of members) if (other !== id && closes[self.group].includes(m.group) && m.isOpen?.() !== false) m.close(false);
      if (self.group === 'dialog') this.onDialogOpen?.(id);
    },
    /**
     * Anmäl en yta som visas och döljs med attributet `hidden` på `el`, och låt registret märka att den öppnas utan att ytans egen
     * kod ändras (#1323). Ytan stänger sin grupp och pausar vid öppnandet som om den själv hade anropat opened().
     */
    watch(id, el, group, close, opts = {}) {
      this.register(id, group, close, { ...opts, isOpen: () => !el.hidden });
      if (typeof MutationObserver === 'undefined') return;
      new MutationObserver(() => { if (!el.hidden) this.opened(id); }).observe(el, { attributes: true, attributeFilter: ['hidden'] });
    },
    /** Är någon yta i gruppen öppen (bara ytor som är anmälda med isOpen)? */
    anyOpen(group) {
      for (const m of members.values()) if (m.group === group && m.isOpen?.()) return true;
      return false;
    },
    /**
     * Escape (#1323): stänger det senast öppnade av de centrala ytorna i den första gruppen i ESCAPE_ORDER som har något öppet,
     * och flyttar fokus till ytans knapp. Ger true om något stängdes, så att anroparen kan stoppa tangenten.
     */
    escape() {
      for (const group of ESCAPE_ORDER) {
        let top = null;
        for (const m of members.values()) if (m.group === group && m.central && m.isOpen?.() && (!top || m.openedAt >= top.openedAt)) top = m;
        if (!top) continue;
        top.close(true); // true: ytan lägger själv tillbaka fokus (de flesta ignorerar det); sedan knappen nedan
        const opener = typeof top.opener === 'function' ? top.opener() : top.opener;
        if (opener?.isConnected && opener.offsetParent !== null) opener.focus({ preventScroll: true });
        return true;
      }
      return false;
    },
    /** Stäng en hel grupp, utom möjligen `except`. */
    closeGroup(group, except = null) {
      for (const [id, m] of members) if (m.group === group && id !== except) m.close();
    },
    /**
     * Stäng menyerna och, när `narrow` är sann (standard), sidopanelen. I bred skärm får Samtidigt-panelen stå kvar bredvid
     * en faktaruta, så där skickas `narrow: app.narrow.matches`. Ersätter paret closeGroup('meny') + closeGroup('sidopanel') (#1141).
     * Popoverna (årshopp, intervall) rörs inte: de stängs av sin egen yttre-klick-regel och av varandra.
     */
    closeAll({ narrow = true } = {}) {
      this.closeGroup('meny');
      if (narrow) this.closeGroup('sidopanel');
    },
  };
  return surfaces;
}
