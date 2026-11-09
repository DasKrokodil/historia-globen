// Etiketter och klungor på globen (#26, #142, #242, #243, #313; #402, del av #389): texten för en händelses
// etikett (samma på globen och i Platt vy), hovring, religionernas lilla ruta före klick (#271) och
// placeringen i varje bildruta utan överlapp.
import { CAT, t, formatYear, formatEventTime, formatDirection, edtfSpan, dayParts } from '../model.js';
import { markerInfo, describeMarker } from '../layers/events.js';
import { cluster, clusterContents, placeLabels, dotBox } from '../ui/clusters.js';
import { globeEmpireBlocks } from '../ui/zoomlevels.js';

const narrowView = matchMedia('(max-width: 760px)');
const UI_OVER_GLOBE = '.brand, #year-jump, #year-segment, .top-actions > .chip-btn, .action-group, #religion-legend';
const UI_BOTTOM = '.timebar .controls > *, #war-play, #pause-note, #focus-bar';

export function createLabels(app) {
  const { $, state, registry, globe, ff, relLegend } = app;
  const layer = registry.get('events'), areas = registry.get('areas'), religions = registry.get('religions');

  // Etikettens text och beskrivning, samma på globen och i Platt vy (#313).
  // Händelser i ett krig får årtalet framför namnet, i ett kort krig datumet (#204)
  function labelText(e) {
    const focus = state.focus;
    let text = !e.partOf ? t(e.title) : `${focus?.fine ? dayParts(edtfSpan(e)[0])[0] : formatYear(e.start)} · ${t(e.title)}`;
    // Utanför Fokus säger tidsfönstrets händelser hur långt före eller efter året de ligger: "4 år före (1912)" eller
    // "om 2 år (1918)" (#995). Orden står i språkfilen, och model.js räknar avståndet och formaterar året så att även f.Kr. blir rätt (#434).
    const st = layer.state.get(e.id);
    if (!focus && !state.range && (st?.when === 'past' || st?.when === 'future')) text += ` · ${formatDirection(st.when, state.wholeYear, st.when === 'past' ? e.end : e.start)}`;
    return text;
  }
  /** Ett krig som pågår det här året (inte ett som bara ligger i tidsfönstret): dess etikett går före rikesnamnen (#1022). */
  const isWarNow = e => e.kind === 'war' && layer.state.get(e.id)?.when === 'now';
  function fillLabel(el, e, text) {
    if (el._text !== text) { // texten byts när fokusläget för ett kort krig börjar eller slutar
      el._text = text;
      el.innerHTML = `<span class="dot" style="background:${CAT[e.category]?.color}"></span>${text.replace(/</g, '&lt;')}`;
    }
    // Samma betydelse som medaljen, i ord (#242): tidsläge, betydelse och osäkerhet
    const desc = `${t(e.title)}, ${formatEventTime(e)}: ${describeMarker(markerInfo(e, layer.state.get(e.id)?.when))}`;
    if (el._desc !== desc) { el._desc = desc; el.setAttribute('aria-label', desc); el.title = desc; }
  }

  /** Startar etiketterna: hovring, religionernas ruta och placeringen i varje bildruta (efter att allt är kopplat). */
  function start() {
    // Etiketter för synliga händelser, utan överlapp
    const labelsEl = $('labels');
    const pool = new Map();
    const clusterPool = [];
    // Hovring (#242): markören under musen får alltid sin etikett, även när den annars skulle krocka med en annan
    let hoverId = null;
    {
      const canvas = $('globe-canvas');
      // Pekar man på ett religionsområde visas religionens symbol och namn i en liten ruta före klick (#271)
      const tip = $('religion-tip');
      let tipRaf = 0;
      const religionTip = (x, y) => {
        cancelAnimationFrame(tipRaf);
        tipRaf = requestAnimationFrame(() => {
          const on = religions.enabled && !state.faded.has('religions') && religions.active.length && relLegend.pop.hidden;
          const ll = on && globe.pickLatLon(x, y);
          relLegend.showTip(tip, ll ? religions.hitTest(ll.lon, ll.lat) : null, x, y);
        });
      };
      const hideTip = () => { cancelAnimationFrame(tipRaf); tip.hidden = true; };
      canvas.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse' || e.buttons) { hoverId = null; canvas.classList.remove('on-marker'); hideTip(); return; }
        const hit = globe.pick(e.clientX, e.clientY, layer.sprites.filter(s => s.visible));
        hoverId = hit ? hit.userData.event.id : null;
        canvas.classList.toggle('on-marker', !!hit);
        globe.invalidate(); // hovringsetiketten placeras i globe.onFrame även när kameran står still (#390)
        if (hit) hideTip(); else religionTip(e.clientX, e.clientY);
      });
      canvas.addEventListener('pointerleave', () => { hoverId = null; canvas.classList.remove('on-marker'); hideTip(); });
      canvas.addEventListener('pointerdown', hideTip);
    }
    globe.onFrame(now => {
      // Lagrens 3D-markörer: storlek på skärmen och plats (händelsernas medaljer, religionernas och rikenas symboler)
      registry.frame(now, state);
      const hl = ff.highlightIds();
      const order = [...app.render.visible].sort((a, b) =>
        ((b.e.id === state.selectedId) - (a.e.id === state.selectedId)) || ((b.e.id === hoverId) - (a.e.id === hoverId)) ||
        (hl.has(b.e.id) - hl.has(a.e.id)) || (b.activity - a.activity));
      // Klustra händelser som ligger nära varandra på skärmen (#26)
      const items = order.map(v => ({ e: v.e, p: globe.project(v.e._pos), keep: v.e.id === state.selectedId || hl.has(v.e.id) }));
      const { singles, clusters } = cluster(items.filter(it => it.p.facing > 0.05));
      const clustered = new Set(clusters.flatMap(c => c.members.map(m => m.e.id)));
      // Händelsen där en religion uppstod ligger under religionens symbol (#271): bara symbolen och etiketten syns
      const underOrigin = registry.coveredEvents();
      for (const s of layer.sprites) s.visible = s.userData.active && !clustered.has(s.userData.event.id) && !underOrigin.has(s.userData.event.id);
      clusters.forEach((c, i) => {
        let el = clusterPool[i];
        if (!el) {
          el = document.createElement('button');
          el.type = 'button'; el.className = 'gcluster';
          el.addEventListener('click', () => {
            // Zooma in mot klustret så att det delas upp
            const ms = el._members;
            globe.flyTo(ms.reduce((s, m) => s + m.e._lat, 0) / ms.length, ms.reduce((s, m) => s + m.e._lon, 0) / ms.length, 700);
            globe.setZoom(globe.zoom * 1.8);
          });
          labelsEl.append(el); clusterPool[i] = el;
        }
        // Ringen visar kategorierna i klungan, och texten säger vad den innehåller (#243). Siffran står kvar i mitten.
        const key = c.members.map(m => m.e.id).join();
        if (el._key !== key) {
          el._key = key;
          el._members = c.members;
          const { text, ring } = clusterContents(c.members, CAT, t);
          el.textContent = String(c.members.length);
          el.style.setProperty('--ring', ring);
          el.setAttribute('aria-label', `${c.members.length} händelser nära varandra: ${text}. Zooma in.`);
          el.dataset.contents = text; // syns under klungan vid hovring och fokus (CSS)
          el.title = `${c.members.slice(0, 8).map(m => t(m.e.title)).join(', ')}${c.members.length > 8 ? ' …' : ''}`;
        }
        el.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
        el.hidden = false;
      });
      for (let i = clusters.length; i < clusterPool.length; i++) clusterPool[i].hidden = true;
      // Etiketterna får inte hamna utanför skärmen eller ovanpå andra markörer och klusterbrickor (#142).
      // Samma regel i Platt vy (placeLabels i ui/clusters.js, #313).
      const W = globe.canvas.clientWidth, H = globe.canvas.clientHeight;
      const pxOf = e => layer.byId.get(e.id)?.userData.px;
      const markers = items.filter(it => it.p.facing > 0.05 && !clustered.has(it.e.id)).map(it => ({ id: it.e.id, box: dotBox(it.p.x, it.p.y, Math.max(9, (pxOf(it.e) ?? 18) / 2)) }));
      const badges = clusters.map(c => dotBox(c.x, c.y, 16));
      // Knapparna och raderna längst ner ligger alltid över globen (#318), och i smal skärm också rubriken, årtalet,
      // knappgrupperna och teckenförklaringen (#289): etiketter som skulle hamna under dem visas inte.
      // Rutorna räknas om i canvasens koordinater.
      const blocked = [];
      {
        const c = globe.canvas.getBoundingClientRect();
        for (const el of document.querySelectorAll(narrowView.matches ? `${UI_OVER_GLOBE}, ${UI_BOTTOM}` : UI_BOTTOM)) {
          if (el.hidden || !el.offsetParent) continue;
          const r = el.getBoundingClientRect();
          if (r.width) blocked.push({ x0: r.left - c.left - 4, x1: r.right - c.left + 4, y0: r.top - c.top - 4, y1: r.bottom - c.top + 4 });
        }
      }
      const soft = globeEmpireBlocks(areas, globe); // rikesnamn och medaljer (#358): etiketterna viker, de pågående krigen i nödfall inte (#1022)
      const seen = new Set();
      for (const { e, p, text, x, y } of placeLabels(singles, { W, H, hoverId, markers, badges, blocked, soft, priority: ({ e }) => isWarNow(e), text: labelText, pxOf })) {
        let el = pool.get(e.id);
        if (!el) {
          el = document.createElement('button');
          el.type = 'button'; el.className = 'glabel';
          el.addEventListener('click', () => app.select(e.id));
          labelsEl.append(el); pool.set(e.id, el);
        }
        fillLabel(el, e, text);
        el.classList.toggle('glabel-hover', e.id === hoverId);
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        el.style.opacity = String(Math.min(1, (p.facing - 0.2) * 4));
        el.hidden = false;
        seen.add(e.id);
      }
      for (const [id, el] of pool) if (!seen.has(id)) el.hidden = true;
    }, () => registry.frameAnimating(state));
  }

  return { labelText, fillLabel, start };
}
