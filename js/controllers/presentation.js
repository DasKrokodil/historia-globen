// Presentationsläget (#488): större text och knappar för projektor och storskärm. Läget sparas aldrig; det är en
// delbar adressparameter (?presentation=1, äldre länkar fortsätter fungera) som också kan slås på med knappen
// Presentationsläge i För lärare (#1315). Knappen skriver parametern i adressen utan att ladda om sidan, så att
// Dela och en omladdning behåller läget, och Avsluta tar bort den igen.
// Läget gäller bara från 761 px (#1457): det är till för projektor och storskärm, och i smal skärm ändrar det bara toppraden,
// där Avsluta täckte årtalet. Adressparametern är läget, bredden avgör om det visas: i smal skärm ritas inget (ingen klass,
// ingen Avsluta) men parametern står kvar, så att en länk, en rotation eller en ändrad fönsterstorlek åter ger läget på bred
// skärm. Gränsen är samma som mobilbrytpunkten i CSS (max-width: 760px).
const PARAM = 'presentation';

/** $: getElementById; flush: skriver adressen nu (app.address.flush, finns först när adressen har startat). */
export function createPresentation({ $, flush = () => {}, narrow = matchMedia('(max-width: 760px)') }) {
  const root = $('app'), exit = $('presentation-exit');

  const isOn = () => new URLSearchParams(location.search).get(PARAM) === '1';
  /** Sidans adress utan parametern, med nuvarande hash så att Avsluta behåller året och vyn. */
  const plainUrl = () => {
    const url = new URL(location.href);
    url.searchParams.delete(PARAM);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  /** Ritar läget efter adressen och bredden. Samma väg vid start och när fönstret passerar 761 px, så inget halvt tillstånd uppstår. */
  function render() {
    const on = isOn() && !narrow.matches;
    root.classList.toggle('presentation-mode', on);
    exit.hidden = !on;
    if (on) exit.href = plainUrl();
  }

  /** Slår läget på eller av och skriver adressen. Ger true när läget är på. I smal skärm slås det aldrig på (ger false, adressen rörs inte). */
  function set(on) {
    if (on && narrow.matches) return false;
    const url = new URL(location.href);
    if (on) url.searchParams.set(PARAM, '1'); else url.searchParams.delete(PARAM);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    render();
    return on;
  }

  // Avsluta stänger läget på stället, utan omladdning: året, vyn och en lektion med lärarens knapp för utskrift (#885, rollen
  // skrivs aldrig i adressen och försvinner annars vid en omladdning) står kvar, och fokus går till Mer. Länken finns kvar som
  // reserv: en klick med Ctrl, Cmd eller Shift och ett mittenklick öppnar sidan utan parametern, med vyn som den ser ut nu.
  exit.addEventListener('click', e => {
    flush();
    exit.href = plainUrl();
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    set(false);
    const next = [$('btn-more'), $('more-toggle')].find(el => el && el.offsetParent !== null);
    next?.focus({ preventScroll: true });
  });

  narrow.addEventListener('change', render);
  render();
  return { set, get active() { return root.classList.contains('presentation-mode'); } };
}
