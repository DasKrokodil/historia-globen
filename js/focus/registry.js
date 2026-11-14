// Fokustypernas register (#1327): varje sak man kan följa i Fokus (krig, rike, religion, resa, tema, plats) är en
// post i sin egen fil i js/focus/, på samma sätt som lagren i js/layers/ (#338). Styrningen i
// js/controllers/focus.js läser posterna i stället för att ha en gren per typ. Kontraktet står i
// docs/arkitektur.md ("Fokustyper som poster") och beslutet i docs/beslut/2026-11-13-fokustyper-som-poster.md.
//
// Filen har ingen DOM och laddar ingen data, så node-testerna kan läsa den (tests/focus-types.test.mjs).
//
// En post anger:
//   type        adressens namn: f=<type>:<id>. Måste stå i FOCUS_TYPES i js/state.js, som är adressens vitlista
//   selectsBy   'events', 'geometry' eller null. Ett namngivet urval väljer med en händelselista (tema) eller en
//               geometri (plats); ett tidsspann blir läget intervall och aldrig ett fokus (beslut 2026-11-13).
//               null = man följer något som redan finns i datan (krig, rike, religion, resa). Fältet är en
//               deklaration: styrningen kontrollerar att en urvalstyp ger themeEvents och eventIds och att de
//               andra inte gör det, och resten av koden frågar fokuset (state.focus.eventIds), inte typnamnet
//   load(id)    laddar det som behövs och ger fokusets fält: title, short, from, to, center ([lat, lon]), zoom,
//               valfritt fine (dag för dag) och typens egna fält. Här räknas spannet. Ger null när id:t inte finns
//               (inget fokus börjar), eller { unavailable: '<ui-nyckel>' } när urvalet saknas eller inget av det
//               syns (raden visas i Fokus-menyn). En urvalstyp ger alltid themeEvents (händelserna i tidsordning)
//               och eventIds (deras id som Set). load() körs innan läget Fokus har börjat och kan bli utan fokus
//               (biljetten, #865): den får lägga till data (rikets gränser, religionerna) men inte ändra vyn
//   menu()      gruppen eller grupperna i Sök och följ: [{ title, note, items, loading, all }]. title är flikens
//               id i js/ui/focusmenu.js (TABS), all = hela gruppen listas i tidsordning. Anropas redan när
//               sidan startar och får då bara läsa data och texter
//   menuLoad()  valfritt: hämtar det menu() behöver första gången menyn öppnas. Menyn ritas om en gång, när
//               alla poster har hämtat sitt
//   exists(id)  valfritt: synkron kontroll för gamla länkar. Utan den avgör load()
//   follows(f)  valfritt: { war } eller { route }, det som ska stå i state.focusWar eller state.focusRoute
//   prepare(f)  valfritt: körs när läget Fokus har börjat, före store.setFocus (temats vy i Lager)
//   start(f)    valfritt: vad kortet säger när man börjar följa (krigets inledning, faktarutan, urvalets kort).
//               Körs sist, efter omritningen
//   facts       valfritt: { has(f), show(f) }, knappen Fakta i fokusraden
//   startsAtRangeEnd  valfritt: true när typen börjar vid slutåret om ett tidsintervall pågick (platsen, #1163). Styrningen
//               avslutar intervallet (lägeskontraktet), sätter året till slutåret och lägger intervallet i f.closedRange
//               (och året fokuset börjar på i f.startYear) så att kortet kan säga det. Utan fältet börjar typen som förut
//   movedKey    valfritt: ui-nyckeln för orsaken i "Tiden flyttades till …"; annars focus.movedStart med namnet
//   empty       krävs för urvalstyper: { year, next }, ui-nycklarna för ett år utan händelser i urvalet
//
// Posterna importerar bara model.js, i18n.js, state.js, place-geo.js, uppdrag-rules.js, controllers/facts.js
// (formatYearSpan) och util.js här, aldrig controllers/focus.js (cirkel) eller något som drar in globen och three.js.
import { FOCUS_TYPES } from '../state.js';

/** Grunderna ett urval får välja med i Fokus. Tidsspannet saknas med flit: det är läget intervall. */
export const SELECTS_BY = ['events', 'geometry'];

const OPTIONAL_FUNCTIONS = ['menuLoad', 'exists', 'follows', 'prepare', 'start'];

/** Det som är fel med en post, som en lista med meningar. Tom lista = posten följer kontraktet. */
export function focusTypeProblems(post) {
  const problems = [];
  const name = post?.type ?? '(utan type)';
  if (!post || typeof post !== 'object') return ['Posten är inte ett objekt.'];
  if (typeof post.type !== 'string' || !/^[a-z]+$/.test(post.type)) problems.push(`${name}: type ska vara gemener a–z (adressens namn).`);
  else if (!FOCUS_TYPES.includes(post.type)) problems.push(`${name}: type saknas i FOCUS_TYPES i js/state.js.`);
  if (post.selectsBy !== null && !SELECTS_BY.includes(post.selectsBy)) problems.push(`${name}: selectsBy ska vara ${SELECTS_BY.join(', ')} eller null.`);
  for (const fn of ['load', 'menu']) if (typeof post[fn] !== 'function') problems.push(`${name}: ${fn}() saknas.`);
  for (const fn of OPTIONAL_FUNCTIONS) if (post[fn] != null && typeof post[fn] !== 'function') problems.push(`${name}: ${fn} ska vara en funktion.`);
  if (post.facts != null && (typeof post.facts.has !== 'function' || typeof post.facts.show !== 'function')) problems.push(`${name}: facts ska ha has() och show().`);
  if (post.startsAtRangeEnd != null && typeof post.startsAtRangeEnd !== 'boolean') problems.push(`${name}: startsAtRangeEnd ska vara true eller false.`);
  if (post.movedKey != null && typeof post.movedKey !== 'string') problems.push(`${name}: movedKey ska vara en ui-nyckel.`);
  if (post.selectsBy && (typeof post.empty?.year !== 'string' || typeof post.empty?.next !== 'string')) problems.push(`${name}: en urvalstyp ska ha empty.year och empty.next.`);
  return problems;
}

/**
 * Registret över fokustyperna, i den ordning grupperna står i Sök och följ. Kastar ett fel om en post bryter
 * mot kontraktet eller om en typ anmäls två gånger, så att felet syns när sidan startar och inte först i ett fokus.
 */
export function createFocusTypes(posts) {
  const byType = new Map();
  for (const post of posts) {
    const problems = focusTypeProblems(post);
    if (problems.length) throw new Error(`Fokustyp: ${problems.join(' ')}`);
    if (byType.has(post.type)) throw new Error(`Fokustyp: ${post.type} är anmäld två gånger.`);
    byType.set(post.type, post);
  }
  return {
    /** Posten för en typ, eller null. */
    get: type => byType.get(type) ?? null,
    /** Posten för det man följer (state.focus), eller null. */
    of: focus => (focus ? byType.get(focus.type) ?? null : null),
    /** Alla poster i menyns ordning. */
    all: () => [...byType.values()],
    /**
     * Fokuset som en post har laddat stämmer med postens deklaration: en urvalstyp ger händelserna, de andra inte.
     * Resten av koden frågar fokuset (eventIds, themeEvents), så en post som ljuger skulle bete sig som fel typ.
     */
    checkLoaded(post, f) {
      const selection = !!(f.themeEvents && f.eventIds);
      if (!!post.selectsBy !== selection || (!selection && (f.themeEvents || f.eventIds))) throw new Error(`Fokustyp: ${post.type} har selectsBy ${post.selectsBy} men ${selection ? 'ger' : 'ger inte'} themeEvents och eventIds.`);
      for (const k of ['title', 'short']) if (typeof f[k] !== 'string') throw new Error(`Fokustyp: ${post.type} gav ingen ${k}.`);
      if (![f.from, f.to, f.zoom, f.center?.[0], f.center?.[1]].every(Number.isFinite) || f.from > f.to) throw new Error(`Fokustyp: ${post.type} gav inget giltigt spann eller ingen plats.`);
    },
    /** Grupperna i Sök och följ, i posternas ordning. */
    menu: () => [...byType.values()].flatMap(post => post.menu()),
  };
}
