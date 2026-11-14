// Fokus när faktarutan öppnas och stängs (#1323, #1436, del av #389).
//
// Faktarutan (#detail) ersätter Samtidigt-kortet och döljs med `hidden` när den stängs. Fokus ska då inte hamna på body (WCAG 2.4.3):
//  - öppnades rutan från en kortknapp, ett kort eller en rad i Samtidigt-listan går fokus först till Stäng och sedan tillbaka dit;
//  - öppnades den på annat sätt (markör, etikett, turens steg, menyhändelse, datumresultat) går fokus till knappen Samtidigt, men bara om
//    fokus låg kvar inne i rutan eller på body: ett fokus som besökaren redan har flyttat, eller som ligger kvar på turens Nästa, rörs aldrig.
//
// Fokus flyttas i en mikrotask, inte i nästa bildruta (#1436). select() stänger rutan och ritar sedan om listan (app.refresh) i samma
// synkrona anrop; mikrotasken går efter det, så raden hittas i den nya listan. En webbläsare som drar ut på bildrutan (Firefox lät det
// dolda Stäng-elementet vara aktivt i cirka 1,7 s) lämnade fokus på ett dolt element. Ett andra försök i nästa bildruta är kvar som
// säkerhetsnät om fokus fortfarande ligger i rutan eller på body. Schemaläggarna kan bytas, så att modulen går att pröva utan webbläsare.

export function createDetailFocus({ $, doc, esc, defer = queueMicrotask, later = cb => requestAnimationFrame(cb) }) {
  const document_ = () => doc ?? globalThis.document;
  const escape = esc ?? (s => globalThis.CSS?.escape?.(s) ?? s);
  let cardFocus = null, listFocus = null;

  const visible = el => !!el && !el.hidden && el.getClientRects().length > 0;

  /** Har besökaren redan flyttat fokus till något utanför rutan? Då rörs det inte. */
  function moved(detail) {
    const now = document_().activeElement;
    return !!now && now !== document_().body && !detail.contains(now);
  }

  function restore(back, id, fallback) {
    const detail = $('detail');
    if (!detail.hidden) return false; // rutan har öppnats igen under tiden (till exempel ett byte mellan två steg)
    if (moved(detail)) return true;
    let targets;
    if (back) {
      const own = back.chip ? $('ff-events').querySelector(`.ff-chip[data-id="${escape(back.chip)}"]`) : back.id && $(back.id);
      targets = [own, $('ff-next'), $('ff-handle')];
    } else if (id) {
      targets = [$('event-list').querySelector(`.event-btn[data-id="${escape(id)}"]`), $('btn-panel')];
    } else if (fallback) {
      targets = [$('btn-panel')];
    } else return true;
    targets.find(visible)?.focus({ preventScroll: true });
    return moved(detail);
  }

  return {
    /**
     * Rutan öppnas eller byts. Kommer fokus från Samtidigt-kortet eller en rad i listan kommer öppnaren ihåg (den första vinner),
     * och svaret är sant: då ska fokus flyttas till Stäng.
     */
    open(active) {
      if (!cardFocus && $('funfact').contains(active)) cardFocus = active.dataset?.id ? { chip: active.dataset.id } : { id: active.id };
      if (!cardFocus && !listFocus && $('panel').contains(active) && active.dataset?.id) listFocus = active.dataset.id;
      return !!(cardFocus || listFocus);
    },

    /** Rutan har stängts (hidden är redan satt). `active` är elementet som hade fokus när stängningen började. */
    close(active) {
      const detail = $('detail'), doc = document_();
      const back = cardFocus, id = listFocus;
      cardFocus = null; listFocus = null;
      const inDetail = !!active && active !== doc.body && detail.contains(active);
      const wasInDetail = !active || active === doc.body || inDetail;
      // Utan öppnare: bara när fokus låg på ett element i rutan (till exempel Stäng), aldrig på body eller utanför
      const fallback = !back && !id && inDetail;
      if (!wasInDetail || (!back && !id && !fallback)) return;
      const run = () => {
        if (restore(back, id, fallback)) return;
        later(() => restore(back, id, fallback)); // säkerhetsnät: omritningen eller webbläsaren var sen
      };
      defer(run);
    },
  };
}
