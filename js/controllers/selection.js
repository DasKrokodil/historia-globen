// Val av händelse (#402, del av #389): faktarutan, globen och Platt vy följer den valda händelsen, och
// efter ett årshopp vänder sig globen mot Samtidigt-listans första händelse (#515).

// Efter "Hoppa till år" och när Samtidigt öppnas (#515): globen vänder sig bara mot årets första
// panelrelevanta händelse om dess markör är på baksidan. Panelens nuvarande ordning används tills #508
// låser den gemensamma rangordningen. Fokus, Platt vy, uppspelning och reducerad rörelse berörs inte.
const RECENT_TURN_MS = 3000;

export function createSelection(app) {
  const { state, data, globe, flatMap, timeline, panel } = app;

  function orientToPanelHighlight() {
    if (state.focus || timeline.playing || !flatMap.hidden || performance.now() - globe.lastUserInput < RECENT_TURN_MS) return;
    // `visible` är panelens nuvarande relevansordning. #508 ska ersätta den med den gemensamma
    // ordningen top, major, pågår och närmast i tid; håll urvalet på ett ställe tills dess.
    const e = app.render.visible[0]?.e;
    if (!e) return;
    const pointVisible = globe.isPointVisible(e._lat, e._lon);
    // En liten canvas-händelse beskriver vilket panelurval som orienteringen bedömde. Den gör
    // integrationer och regressioner stabila utan att exponera Globe-instansen globalt (#515).
    globe.canvas.dispatchEvent(new CustomEvent('hg:globe-orientation-request', {
      detail: { id: e.id, lat: e._lat, lon: e._lon, visible: pointVisible },
    }));
    // Reducerad rörelse får fortfarande veta vilket urval som bedömdes, men flyttar aldrig kameran.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!pointVisible) globe.flyTo(e._lat, e._lon);
  }

  function select(id, jump = true) {
    app.store.setSelected(id);
    const e = id ? data.byId[id] : null;
    panel.showDetail(e);
    // I smal skärm stängs listan när en händelse väljs, så att faktarutan syns
    if (e && app.narrow.matches) panel.setOpen(false);
    if (e) {
      globe.flyTo(e._lat, e._lon);
      flatMap.reveal(e._lat, e._lon); // i Platt vy flyttas kartan dit om platsen inte syns
      // Hoppa i tiden om händelsen ligger långt bort
      if (jump && (timeline.year < e.start - 400 || timeline.year > e.end + 400)) timeline.year = e.start;
    }
    app.refresh();
  }

  return { select, orientToPanelHighlight };
}
