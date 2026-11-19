// Var ett lagers data finns i tiden (#1960). Ren logik utan webbläsare, delas med testerna.
//
// Ett lager med begränsad täckning (Människans spridning före 3000 f.Kr., riken och krigsområden efter) står kvar påslaget
// när reglaget byts, och då är det tomt utan att man ser varför. Täckningen räknas ur lagrets egen data, på samma sätt som
// sliceAt i layers/images.js läser `from` och `to` ur skivorna: aldrig inskriven per reglage eller per lager.
// Ett lager anmäler den i sin registerpost med `coverage(state)` (layers/registry.js); registret frågar bara de lager
// som är påslagna i Lager och ger en rad till dem som saknar data i året.

/**
 * Täckningen för en lista poster: tidigaste `from` och senaste `to`.
 * Poster: [{ from, to, approxFrom?, approxTo? }], astronomiska år. `to` utan värde (null, undefined eller Infinity) betyder att
 * posten gäller tills vidare. approxFrom och approxTo säger att gränsen är ungefärlig; gränsen är ungefärlig bara när alla
 * poster som sätter den är det. Poster utan ett giltigt `from` hoppas över. Utan poster blir det null (ingen täckning känd).
 * @returns {{ from: number, to: number, approxFrom: boolean, approxTo: boolean } | null}
 */
export function spanOf(items = []) {
  let from = Infinity, to = -Infinity, approxFrom = false, approxTo = false;
  for (const it of items) {
    if (!Number.isFinite(it?.from)) continue;
    const end = Number.isFinite(it.to) ? it.to : Infinity;
    if (it.from < from) { from = it.from; approxFrom = !!it.approxFrom; } else if (it.from === from) approxFrom &&= !!it.approxFrom;
    if (end > to) { to = end; approxTo = end !== Infinity && !!it.approxTo; } else if (end === to) approxTo &&= !!it.approxTo;
  }
  return from === Infinity ? null : { from, to, approxFrom, approxTo };
}

/** Är en sida av en EDTF-sträng ungefärlig (~) eller osäker (?)? "Y-297999~/Y-9999~" → { from: true, to: true }. */
export function edtfApprox(edtf) {
  const [a = '', b = ''] = String(edtf ?? '').split('/');
  const un = s => /[~?%]$/.test(s.trim());
  return { from: un(a), to: un(b || a) };
}

/**
 * Ligger året utanför täckningen? Då säger svaret vilken sida (before: datan börjar senare, after: den slutar tidigare),
 * gränsens år och om gränsen är ungefärlig. Inom täckningen, och utan känd täckning, är svaret null: raden visas bara när den hjälper.
 * @returns {{ side: 'before' | 'after', limit: number, approx: boolean } | null}
 */
export function outsideCoverage(cov, year) {
  if (!cov || !Number.isFinite(year)) return null;
  if (year < cov.from) return { side: 'before', limit: cov.from, approx: !!cov.approxFrom };
  if (year > cov.to) return { side: 'after', limit: cov.to, approx: !!cov.approxTo };
  return null;
}
