// En tillfällig väg tillbaka efter ett uttryckligt hopp i tid och kamera (#997).
import { formatYear } from '../model.js';
import { ui } from '../i18n.js';

export function createJumpBack(app, { schedule = setTimeout, cancel = clearTimeout } = {}) {
  const { $, timeline, globe } = app;
  const row = $('jump-back'), text = $('jump-back-text'), button = $('jump-back-button');
  let previous = null, trigger = null, timer = null, changing = false;

  function clear() {
    if (timer != null) cancel(timer);
    timer = null;
    if (row.contains(document.activeElement)) {
      $('year-jump').focus({ preventScroll: true });
    }
    row.hidden = true;
    text.textContent = '';
    previous = null;
  }

  /** Spara utgångsläget och utför hoppet. Adressen får båda lägena även före nästa 700 ms-tick. */
  function run(action, source = $('year-jump')) {
    clear();
    const before = { year: timeline.year, camera: { ...globe.view } };
    app.address?.flush();
    changing = true;
    try { action(); app.address?.flush(); } finally { changing = false; }
    previous = before;
    trigger = source;
    text.textContent = ui('jumpBack.from', { year: formatYear(before.year) });
    row.hidden = false;
    timer = schedule(clear, 8000);
  }

  button.addEventListener('click', () => {
    if (!previous) return;
    const saved = previous;
    clear();
    changing = true;
    try {
      timeline.pause();
      timeline.year = saved.year;
      app.refresh();
      globe.flyTo(saved.camera.lat, saved.camera.lon, 300); // Globe respekterar Lugn rörelse
      globe.setZoom(saved.camera.zoom);
      app.address?.flush();
    } finally { changing = false; }
  });

  const dismiss = event => {
    if (previous && !row.contains(event.target) && !trigger?.contains(event.target)) clear();
  };
  document.addEventListener('pointerdown', dismiss, true);
  document.addEventListener('wheel', dismiss, { capture: true, passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') clear();
    else if (!['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) dismiss(event);
  }, true);
  timeline.addEventListener('change', () => { if (!changing) clear(); });
  timeline.addEventListener('playstate', () => { if (timeline.playing) clear(); });
  window.addEventListener('popstate', clear);
  return { run, clear };
}
