// Statusraden för skärmläsare (#1419): en enda väg in i #screen-reader-status. Raden skrevs förut från flera håll (faktarutans rubrik,
// Samtidigt-kortet, tidslinjens paus- och årsrader), och den som skrev sist eller tömde raden tog bort det som precis hade sagts:
// en faktarutas rubrik kunde bli tom när pausraden ritades om i samma stund. Nu gäller två regler.
//  1. Något som sägs med högre prioritet (faktarutans rubrik) skrivs inte över av något med lägre prioritet under HOLD_MS.
//  2. Bara den som skrev sist får tömma raden (clearStatus).
const HOLD_MS = 1500;
let el = null, request = 0, last = { source: '', priority: 0, at: 0 };

/** Kopplar modulen till raden. Anropas en gång av main.js. */
export function bindStatus(node) { el = node; }

/**
 * Säger text på raden. source namnger den som skriver, priority säger hur viktigt det är (faktarutans rubrik: 2, övrigt: 0).
 * immediate: skriv direkt (för text som skiljer sig från den förra); annars töms raden först och texten skrivs i nästa bildruta,
 * så att samma text kan läsas upp igen. Ger false när något viktigare nyss har sagts och texten därför inte skrevs.
 */
export function say(text, source = 'annat', { priority = 0, immediate = false } = {}) {
  if (!el) return false;
  const now = performance.now();
  if (priority < last.priority && now - last.at < HOLD_MS) return false;
  const mine = ++request;
  last = { source, priority, at: now };
  if (immediate) { el.textContent = text; return true; }
  el.textContent = '';
  requestAnimationFrame(() => { if (request === mine) el.textContent = text; });
  return true;
}

/** Tömmer raden, men bara om source skrev det som står där nu (en annan yta ska inte tömma någon annans text). */
export function clearStatus(source) {
  if (!el || last.source !== source) return;
  request++;
  el.textContent = '';
  last = { source: '', priority: 0, at: 0 };
}

/** Bara för tester: nollställer modulen. */
export function resetStatus() { el = null; request = 0; last = { source: '', priority: 0, at: 0 }; }
