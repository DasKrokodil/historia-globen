// Fokus när faktarutan öppnas och stängs (#1323, #1436, del av #389).
//
// Faktarutan (#detail) ersätter Samtidigt-kortet och döljs med `hidden` när den stängs. Fokus ska då inte hamna på body (WCAG 2.4.3):
//  - öppnades rutan från en kortknapp, ett kort eller en rad i Samtidigt-listan går fokus först till Stäng och sedan tillbaka dit;
//  - valdes den i menyn Sök och följ (ett tema, en plats, ett krig, ett rike) går fokus tillbaka till den knappen (#1696), eller till
//    knappen Meny i smal skärm där Sök och följ ligger i en stängd meny;
//  - öppnades den från en numrerad markör i regionvyn (#1713) går fokus först till Stäng och sedan tillbaka till markören;
//  - öppnades den på annat sätt (markör, etikett, turens steg, datumresultat) går fokus till knappen Samtidigt, men bara om
//    fokus låg kvar inne i rutan eller på body: ett fokus som besökaren redan har flyttat, eller som ligger kvar på turens Nästa, rörs aldrig.
//
// Fokus flyttas i en mikrotask, inte i nästa bildruta (#1436). select() stänger rutan och ritar sedan om listan (app.refresh) i samma
// synkrona anrop; mikrotasken går efter det, så raden hittas i den nya listan. En webbläsare som drar ut på bildrutan (Firefox lät det
// dolda Stäng-elementet vara aktivt i cirka 1,7 s) lämnade fokus på ett dolt element. Ett andra försök i nästa bildruta är kvar som
// säkerhetsnät om fokus fortfarande ligger i rutan eller på body. Schemaläggarna kan bytas, så att modulen går att pröva utan webbläsare.

export function createDetailFocus({ $, doc, esc, defer = queueMicrotask, later = cb => requestAnimationFrame(cb) }) {
  const document_ = () => doc ?? globalThis.document;
  const escape = esc ?? (s => globalThis.CSS?.escape?.(s) ?? s);
  let cardFocus = null, listFocus = null, markFocus = null, menuPick = false, menuFocus = false;
  // Sök och följ ligger i menyn Meny i smal skärm och syns inte där: fokus går då till menyknappen i stället för att tappas
  const MENU_BUTTONS = ['btn-focus', 'more-toggle', 'btn-more'];

  const visible = el => !!el && !el.hidden && el.getClientRects().length > 0;

  /** Har besökaren redan flyttat fokus till något utanför rutan? Då rörs det inte. */
  function moved(detail) {
    const now = document_().activeElement;
    return !!now && now !== document_().body && !detail.contains(now);
  }

  function restore(back, id, fallback, viaMenu, mark) {
    const detail = $('detail');
    if (!detail.hidden) return false; // rutan har öppnats igen under tiden (till exempel ett byte mellan två steg)
    if (moved(detail)) return true;
    let targets;
    if (back) {
      const own = back.chip ? $('ff-events').querySelector(`.ff-chip[data-id="${escape(back.chip)}"]`) : back.id && $(back.id);
      targets = [own, $('ff-next'), $('ff-handle')];
    } else if (id) {
      targets = [$('event-list').querySelector(`.event-btn[data-id="${escape(id)}"]`), $('btn-panel')];
    } else if (mark) {
      // Markören kan ha ritats om (samma händelse som markör eller i en utfälld hög): hitta den på händelsens id
      const marks = [...document_().querySelectorAll?.(`.region-marks .rmark[data-event="${escape(mark)}"]`) ?? []];
      targets = [...marks, $('btn-panel')];
    } else if (viaMenu) {
      targets = MENU_BUTTONS.map($);
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
      // En numrerad markör i regionvyn (#1713): fokus går till Stäng, och tillbaka till markören när rutan stängs
      if (!cardFocus && !listFocus && !markFocus && active?.dataset?.event && active.closest?.('.region-marks')) markFocus = active.dataset.event;
      if (menuPick && !cardFocus && !listFocus && !markFocus) menuFocus = true; // valt i Sök och följ (#1696); fokus flyttas inte dit, det gör kortet själv
      return !!(cardFocus || listFocus || markFocus);
    },

    /**
     * Ett val i menyn Sök och följ pågår (#1696): ett kort som öppnas medan det pågår hör till menyknappen. Anropas med `true` före
     * valet och `false` när startFocus har svarat, så att ett kort som öppnas på annat sätt senare inte får samma öppnare.
     */
    pickFromMenu(on) { menuPick = !!on; },

    /** Rutan har stängts (hidden är redan satt). `active` är elementet som hade fokus när stängningen började. */
    close(active) {
      const detail = $('detail'), doc = document_();
      const back = cardFocus, id = listFocus, mark = markFocus, viaMenu = menuFocus;
      cardFocus = null; listFocus = null; markFocus = null; menuFocus = false;
      const inDetail = !!active && active !== doc.body && detail.contains(active);
      const wasInDetail = !active || active === doc.body || inDetail;
      // Utan öppnare: bara när fokus låg på ett element i rutan (till exempel Stäng), aldrig på body eller utanför
      const fallback = !back && !id && !mark && inDetail;
      if (!wasInDetail || (!back && !id && !mark && !fallback)) return;
      const run = () => {
        if (restore(back, id, fallback, viaMenu, mark)) return;
        later(() => restore(back, id, fallback, viaMenu, mark)); // säkerhetsnät: omritningen eller webbläsaren var sen
      };
      defer(run);
    },
  };
}
