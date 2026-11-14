// Regionvyn (#1641, steg 1a av #1627): "Visa i Platt karta" i kortet för en liten plats (upp till cirka 5 grader på marken,
// i dag Skåne och Danmark; js/region-frame.js) ger en skarp, inzoomad karta över platsen och den närmaste omgivningen, med en
// sluten kantlinje i skärmpixlar och omgivningen nedtonad. Större platser ramas in som förut (controllers/places.js).
//
// Vyn hör till platsen man följer: den lämnas när man slutar följa platsen, när Platt vy stängs, med Återställ, med knappen
// "Lämna regionvyn" och med Escape (när inget ligger ovanpå: menyer, dialoger, kortet). Statusraden säger vilken plats som
// visas och att riken och religioner inte ritas här (ritningen och skälen: js/ui/flatmap.js, docs/beslut/2026-11-14-regionvy-
// steg-1a-1641.md). Ramen räknas ur platsens gräns (placeBounds), inte ur ett fält i datan, och lägger platsen i den del av
// kartan som kortet, arket, fokusraden och vyns egen ruta inte täcker.
import { placeBounds } from '../place-geo.js';
import { regionEligible, regionSize, freeArea } from '../region-frame.js';
import { t } from '../model.js';
import { ui } from '../i18n.js';
import { say } from '../ui/status.js';

/** Arket i mobil fälls ihop med en övergång: ramen räknas om när den är klar, om man inte har flyttat kartan under tiden. */
const REFIT_MS = 450;
/** Luft mellan platsens ram och det som täcker kartan (skärmpixlar). */
const GAP = 8;
/** Det som ligger ovanpå och tar Escape först (samma lista som Fokus och Platt vy i main.js och controllers/focus.js). */
const OVERLAYS = ['detail', 'focus-menu', 'layer-menu', 'help', 'teacher', 'settings', 'feedback', 'sources-dialog', 'jump-pop', 'religion-pop', 'route-pop'];

export function createRegion(app) {
  const { $, state, flatMap, globe, store, surfaces } = app;
  const chip = $('flat-region'), title = $('flat-region-name'), note = $('flat-region-note'), back = $('flat-region-back');
  let place = null, refit = 0, moved = false;

  /** Rutan för ett element i kartans pixlar, med luft runt, eller null när det inte syns. */
  function rect(el, box) {
    if (!el || el.hidden || !el.getClientRects().length) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return { x0: r.left - box.left - GAP, y0: r.top - box.top - GAP, x1: r.right - box.left + GAP, y1: r.bottom - box.top + GAP };
  }
  /**
   * Den fria delen av kartan: utan kortet (dator) eller arket (mobil), fokusraden, pausraden och regionvyns ruta. Kortet och arket
   * går först, eftersom de är störst; varje remsa väljs så att platsen får så stor skala som möjligt (region-frame.js).
   */
  function free() {
    const box = flatMap.canvas.getBoundingClientRect();
    const shape = place?.boundary?.geometry ? regionSize(placeBounds(place)) : null;
    return freeArea({ w: box.width, h: box.height }, [$('detail'), $('focus-bar'), $('pause-note'), chip].map(el => rect(el, box)), shape);
  }

  /** Får platsen regionvyn? Bara när den är liten nog (region-frame.js). */
  const eligible = p => !!p?.boundary?.geometry && regionEligible(placeBounds(p));

  /** Byt till regionvyn för platsen (Platt vy är redan vald). */
  function enter(p) {
    place = p;
    const name = t(p.name);
    title.textContent = ui('regionView.title', { place: name });
    note.textContent = ui('regionView.note');
    back.textContent = ui('regionView.leave');
    chip.hidden = false; // först: rutan tar plats, och ramen räknas utan den
    $('app').classList.add('region-view');
    moved = false;
    flatMap.enterRegion(p.id, placeBounds(p), free);
    // Den finare kusten (1:10m, samma som globens utsnitt) laddas en gång; kartan ritas om med den när den kommer
    globe.detail.loadFineLand?.()?.then(land => { if (land) flatMap.regionLayersChanged(); });
    clearTimeout(refit);
    refit = setTimeout(() => { if (!moved && flatMap.region === p.id) flatMap.fitRegion(); }, REFIT_MS);
    say(ui('regionView.shown', { place: name }), 'plats', { priority: 2, immediate: true }); // som faktarutans rubrik: svaret på knappen
  }

  /** Lämna regionvyn med knappen eller Escape: Platt vy som förut, med platsen inramad, och fokus på kartan. */
  function leave() {
    const p = place;
    if (!p || !flatMap.region) return;
    flatMap.leaveRegion({ quiet: false });
    const card = $('detail');
    const covered = !app.narrow.matches && !card.hidden ? Math.max(0, flatMap.canvas.getBoundingClientRect().right - card.getBoundingClientRect().left) : 0;
    flatMap.frame(placeBounds(p), 0.78, covered);
    flatMap.canvas.focus({ preventScroll: true });
  }

  // Kartan säger till när vyn slutar, vad som än avslutade den (knappen, Återställ, en tur, Platt vy som stängs)
  flatMap.onRegion = (id, prev, { quiet = true } = {}) => {
    if (id) return;
    const was = place;
    place = null;
    clearTimeout(refit);
    chip.hidden = true;
    $('app').classList.remove('region-view');
    if (!quiet && was) say(ui('regionView.left', { place: t(was.name) }), 'plats', { priority: 2, immediate: true });
  };
  back.addEventListener('click', leave);
  // Man flyttar själv kartan: ramen räknas inte om efter arket
  for (const type of ['pointerdown', 'wheel', 'keydown']) flatMap.canvas.addEventListener(type, () => { moved = true; }, { passive: true });

  // Vyn hör till platsen man följer: slutar man följa den (eller följer något annat) lämnas den
  store.subscribe(({ type }) => {
    if (type !== 'focus' || !flatMap.region) return;
    if (state.focus?.type !== 'place' || state.focus.place?.id !== flatMap.region) flatMap.leaveRegion();
  });

  // Escape lämnar regionvyn, men först det som ligger ovanpå. Lyssnaren ligger på window i fångstfasen, så den går före
  // dokumentets lyssnare som annars skulle avsluta Fokus och stänga Platt vy i samma tryck
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented || !flatMap.region || flatMap.hidden) return;
    const open = OVERLAYS.some(id => { const el = $(id); return el && !el.hidden; })
      || ['dialog', 'popover', 'uppdrag', 'besked', 'meny'].some(g => surfaces.anyOpen(g))
      || $('app').classList.contains('panel-open') || $('tour-card')?.contains(document.activeElement);
    if (open) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    leave();
  }, true);

  return { eligible, enter, leave, get place() { return place; } };
}
