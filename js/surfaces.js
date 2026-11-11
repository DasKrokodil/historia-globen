// Stängregistret för ytor (#894): varje yta anmäler sig i en grupp, och en öppnad yta stänger sin grupp.
// Ersätter de handskrivna `layers.close(); focusMenu.close(); panel.setOpen(false)` som förut stod på flera ställen
// (main.js, controllers/facts.js, controllers/focus.js). En ny yta anmäler sig här och får ett lagernamn i
// css/style.css (--z-…); den ska inte få egna close()-anrop mot de andra ytorna.
//
// Grupper (lägg till fler här när arken och dialogerna flyttas över, en grupp i taget):
//   meny      knapparna överst med sina menyer (Lager, Fokus)
//   sidopanel Samtidigt-panelen
//   popover   årshoppet och intervallformuläret (#1141): de ligger i lagret --z-poppa ovanför menyerna och stänger varandra
// CLOSES säger vilka grupper en öppnad yta i gruppen stänger. En meny stänger de andra menyerna och sidopanelen,
// en sidopanel stänger menyerna (men inte sig själv: det finns en).
export const CLOSES = {
  meny: ['meny', 'sidopanel'],
  sidopanel: ['meny'],
  popover: ['popover'],
};

export function createSurfaces(closes = CLOSES) {
  const members = new Map(); // id -> { group, close }
  return {
    /** Anmäl en yta: `close` stänger den och måste tåla att anropas när ytan redan är stängd. */
    register(id, group, close) {
      if (!closes[group]) throw new Error(`Okänd ytgrupp: ${group}`);
      members.set(id, { group, close });
    },
    /** Ytan `id` har öppnats: stäng alla andra ytor i de grupper som dess grupp stänger. */
    opened(id) {
      const self = members.get(id);
      if (!self) throw new Error(`Okänd yta: ${id}`);
      for (const [other, m] of members) if (other !== id && closes[self.group].includes(m.group)) m.close();
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
}
