// "Samtidigt i världen": lista över synliga händelser per världsdel, kategorifilter
// (i lagermenyn, #120, och som chips ovanför listan, #311) och faktarutan.
import { buildAreaCurve } from './areacurve.js';
import { CATEGORIES, CAT, REVIEW, REGIONS, region, styleFor, t, formatEventTime, formatYear, formatDate, reviewLabel, REVIEW_SUBJECT_HELP, REVIEW_HELP, symbolImg, isVisibleReview, needDetails } from '../model.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LOADING = '<p class="detail-loading" role="status">Laddar…</p>';
/** Källraden. pending = källregistret eller händelsens källor laddas fortfarande (#337): då står ingen rad alls. */
const srcLine = (srcs, pending) => pending ? '' : `<div class="src">Källa: ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || 'saknas'}</div>`;

/**
 * Bild överst i faktarutan (#129): en riktig historisk bild med källa och licens, eller
 * en illustration i tidens bildtradition som alltid märks med en synlig bildtext.
 * Bilden finns bara i kortet, så den laddas först när kortet öppnas.
 */
export function figure(e, srcById) {
  const img = e.image;
  if (!img) return '';
  // Historiska bilder länkar licensen till filsidan i källregistret
  const src = img.source && srcById[img.source];
  const license = src ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(img.license ?? src.license)}</a>` : esc(img.license ?? '');
  const credit = [img.credit && esc(img.credit), license].filter(Boolean).join(' · ');
  return `<figure class="detail-fig${img.placeholder ? ' is-placeholder' : ''}">
    ${img.placeholder ? '<span class="fig-badge">Platshållare</span>' : ''}
    <img src="${esc(img.file)}" alt="${esc(t(img.caption))}" loading="lazy" width="800" height="600">
    <figcaption><span class="fig-caption">${esc(t(img.caption))}</span>
      <span class="fig-credit">${credit}</span></figcaption>
  </figure>`;
}

/** Diskret knapp "Rapportera faktafel" nedtill i faktarutan, bredvid granskningsstatusen. */
const reportBtn = e => `<button type="button" class="link-btn report-btn" data-report="${esc(e.id)}" aria-haspopup="dialog" aria-controls="feedback">Rapportera faktafel</button>`;

/**
 * Granskningsstatusen nedtill i faktarutan, med en liten (i)-knapp (#310) som fäller ut vad statusarna betyder
 * och en knapp till Om källorna. Förklaringen ligger sist i raden och tar en egen rad.
 */
const reviewRow = (status, subj) => {
  const rv = REVIEW[status] ?? REVIEW.draft;
  return `<span class="review-badge ${rv.cls}" title="${esc(REVIEW_SUBJECT_HELP[subj])}">${esc(reviewLabel(status, subj))}</span>
    <button type="button" class="review-info" data-review-info aria-expanded="false" aria-controls="review-help" aria-label="Vad betyder granskningsstatusen?" title="Vad betyder granskningsstatusen?">i</button>
    <div id="review-help" class="review-help" hidden>
      <ul>${REVIEW_HELP.map(h => `<li><b>${esc(REVIEW[h.status].sv)}:</b> ${esc(h.text)}</li>`).join('')}</ul>
      <button type="button" class="link-btn" data-review-sources>Om källorna</button>
    </div>`;
};

/**
 * Riken i kriget (#76): rikena i krigets empires, som knappar med rikets färg. Ett klick öppnar rikets faktaruta.
 * Slag och händelser i kriget visar sitt krigs riken (de ärver kopplingen via partOf).
 */
const empireList = groups => groups?.length ? `<div class="war-list empire-list"><h4>Riken i kriget</h4><ul>${groups.map(g =>
  `<li><button type="button" class="link-btn" data-empire="${esc(g.id)}"><span class="swatch" style="background:${esc(g.color)}"></span>${esc(t(g.name))}</button></li>`).join('')}</ul></div>` : '';

/**
 * Ett försvunnet lands årtal, föregångare och efterträdare (#72, vanished i empires/index.json). Ett land som finns
 * som rike blir en knapp (data-empire) som börjar följa det riket. Källornas oenighet står öppet under listan.
 */
function lineageHtml(v) {
  const names = list => list.map(x => {
    const g = x.group && v.groups.find(y => y.id === x.group);
    return g ? `<button type="button" class="link-btn" data-empire="${esc(g.id)}" data-follow>${esc(t(x.name))}</button>` : esc(t(x.name));
  }).join(', ');
  const rv = REVIEW[v.review] ?? REVIEW.draft;
  return `<dl class="religion-facts lineage">
      <dt>Bildades och upplöstes</dt><dd>${esc(formatEventTime({ start: v.founded, end: v.dissolved, edtf: '' }))}</dd>
      ${v.predecessors?.length ? `<dt>Föregångare</dt><dd>${names(v.predecessors)}</dd>` : ''}
      ${v.successors?.length ? `<dt>Blev</dt><dd>${names(v.successors)}</dd>` : ''}
    </dl>
    ${v.note ? `<p class="lineage-note">${esc(t(v.note))}</p>` : ''}
    <p class="lineage-note"><span class="review-badge ${rv.cls}">${esc(reviewLabel(v.review, 'Årtal och efterträdare'))}</span></p>`;
}

export class Panel {
  constructor({ root, list, filters, chips, detail, sub, count, toggle, close }, { events, srcById, styles }) {
    Object.assign(this, { root, list, filtersEl: filters, detail, sub, count, toggle, srcById, styles });
    this.onSelect = () => {};
    this.onFilter = () => {};
    this.onSources = () => {};
    this.onFocus = () => {};
    this.onEmpire = () => {}; // (rikets id) => rikets faktaruta (#76)
    this.onOpen = () => {};
    this.onYear = () => {};
    this.onReport = null; // (händelse, knapp) => öppnar formuläret "Rapportera faktafel" (js/ui/feedback.js)
    this.onShowPlace = null; // (händelse) => platsraden i mobil (#312): fäller ihop rutan och visar markören på globen
    this.selectedId = null;
    this.shown = null; // det faktarutan visar just nu; en rad som laddas klart ritar bara om samma ruta (#337)

    // Visa bara kategorier som har händelser, i den fasta ordningen. Samma chips finns på två ställen:
    // under Lager (#120) och ovanför listan i panelen (#311). Båda styr samma filter, så de följs åt.
    const used = new Set(events.map(e => e.category));
    this.filters = new Set(used);
    const boxes = [filters, chips].filter(Boolean);
    for (const c of CATEGORIES.filter(c => used.has(c.id))) {
      for (const box of boxes) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'filter'; b.dataset.cat = c.id; b.setAttribute('aria-pressed', 'true');
        b.innerHTML = `<span class="dot" style="background:${c.color}"></span>${esc(t(c.name))}`;
        b.addEventListener('click', () => {
          const on = this.filters.has(c.id);
          on ? this.filters.delete(c.id) : this.filters.add(c.id);
          for (const x of boxes) x.querySelector(`[data-cat="${c.id}"]`)?.setAttribute('aria-pressed', String(!on));
          this.onFilter(this.filters);
        });
        box.append(b);
      }
    }

    toggle.addEventListener('click', () => {
      this.setOpen(!root.classList.contains('open'));
      if (root.classList.contains('open')) close?.focus({ preventScroll: true }); // fokus in i panelen (#246)
    });
    close?.addEventListener('click', () => this.setOpen(false));
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { this.setOpen(false); if (!detail.hidden) this.onSelect(null); } });
  }

  /** Öppna eller stäng listan "Samtidigt i världen". */
  setOpen(open) {
    if (open) {
      // Under knappgruppen uppe till höger, som i smal skärm kan ligga på flera rader
      const r = (this.toggle.closest('.top-actions') ?? this.toggle).getBoundingClientRect();
      this.root.style.top = `${r.bottom + 8}px`;
      // Vid stor textzoom blir den effektiva höjden liten. Låt då listan använda nästan hela höjden och
      // rulla ovanpå tidslinjen, i stället för att dess innehåll försvinner bakom det reserverade utrymmet.
      if (innerWidth <= 760 && innerHeight < 500) {
        this.root.style.maxHeight = `calc(100dvh - ${r.bottom + 16}px)`;
      } else {
        // I dator går lådan ner till tidslinjen, i mobil täcker den högst 60 procent.
        this.root.style.maxHeight = innerWidth > 760 ? `calc(100dvh - ${r.bottom + 150}px)` : `min(60vh, calc(100dvh - ${r.bottom + 150}px))`;
      }
    }
    if (!open && this.root.contains(document.activeElement)) this.toggle.focus({ preventScroll: true }); // tillbaka till knappen (#246)
    this.root.classList.toggle('open', open);
    this.root.parentElement.classList.toggle('panel-open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
    if (open) this.onOpen();
  }

  /** labels (valfritt): { at, within } i stället för "år 1879" och "±10 år", till exempel i fokusläget för korta krig (#204). */
  render(visible, year, window, eventsOn = true, labels = null) {
    if (!eventsOn) {
      this.count.textContent = '0';
      this.sub.textContent = 'Händelselagret är avstängt.';
      this.list.innerHTML = `<p class="empty-note">Slå på Händelser under Lager för att se vad som hände.</p>`;
      return;
    }
    const inside = visible.filter(v => v.inside).length;
    this.count.textContent = String(visible.length);
    const near = visible.length - inside;
    const at = labels?.at ?? `år ${formatYear(year)}`, within = labels?.within ?? `±${Math.round(window)} år`;
    const parts = [];
    parts.push(inside ? `${inside} ${inside === 1 ? 'händelse pågår' : 'händelser pågår'} ${at}` : `Inget pågår exakt ${at}`);
    if (near) parts.push(`${near} till inom ${within}`);
    this.sub.textContent = visible.length ? parts.join(', ') + '.' : `Inget i datan inom ${within} från ${at.replace(/^(år|den) /, '')}.`;
    if (!visible.length) {
      this.list.innerHTML = `<p class="empty-note">Dra i tidslinjen eller tryck på uppspelning för att hitta nästa händelse. Prickarna under tidslinjen visar var det finns data.</p>`;
      return;
    }
    // Grupperat per världsdel, i fast ordning, så att man ser vad som händer på olika håll
    const groups = new Map(REGIONS.map(r => [r, []]));
    for (const v of visible) groups.get(v.e._region ??= region(v.e._lat, v.e._lon)).push(v);
    this.list.innerHTML = [...groups].filter(([, vs]) => vs.length).map(([name, vs]) => `
      <section class="region-group">
        <h3 class="region-head">${esc(name)} <span class="region-count">${vs.length}</span></h3>
        <ol>${vs.map(({ e, inside }) => `
          <li class="event-item${inside ? '' : ' is-near'}${e.id === this.selectedId ? ' is-selected' : ''}">
            <button type="button" class="event-btn" data-id="${esc(e.id)}" aria-label="${esc(`${formatEventTime(e)}, ${t(e.title)}, ${name}, ${reviewLabel(e.review, 'Händelsen')}`)}"${e.id === this.selectedId ? ' aria-current="true"' : ''}>
              <span class="dot" style="background:${CAT[e.category]?.color}"></span>
              <span class="ttl">${esc(t(e.title))}</span>
              <span class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))}</span>
            </button>
          </li>`).join('')}</ol>
      </section>`).join('');
    // Riktiga knappar: Enter och mellanslag fungerar av sig själva
    for (const b of this.list.querySelectorAll('.event-btn')) b.addEventListener('click', () => this.onSelect(b.dataset.id));
  }

  /**
   * Rutan ritas direkt med det som finns, och en gång till när det som saknades har laddats (#337): händelsernas
   * långa fält och källregistret laddas först när de behövs. Ritas något annat i rutan under tiden händer ingenting.
   */
  _whenLoaded(pending, redraw) {
    const token = this.shown = {};
    pending?.then(() => { if (this.shown === token && !this.detail.hidden) redraw(); }).catch(err => console.error(err));
    return !!pending;
  }

  /** En tom ruta med händelsens namn medan det som ska stå i den laddas. */
  _loading(e) {
    this.selectedId = e.id;
    this.detail.className = `detail detail-card frame-${styleFor(e, this.styles).frame}`;
    this.detail.innerHTML = `<button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <h3>${esc(t(e.title))}</h3><div class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))}</div>${LOADING}`;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
  }

  /**
   * Krigets berättelse i fokusläget (#122): före start orsak och parter, i slutet
   * hur kriget slutade och hur många som dog. Uppgifterna finns i krigets story.
   * Ett pågående krig (#223) visar i stället läget i dag, kontrollerat story.asOf.
   */
  showStory(war, mode) {
    const pending = this._whenLoaded(needDetails([war]), () => this.showStory(war, mode));
    if (!war.story) return this._loading(war); // berättelsen kommer med händelsens långa fält
    const s = war.story;
    this.selectedId = war.id;
    // Samma ram efter tidsålder som faktarutan (#129)
    this.detail.className = `detail detail-card frame-${styleFor(war, this.styles).frame}`;
    const srcs = (s.sources ?? []).map(id => this.srcById[id]).filter(Boolean);
    const body = mode === 'intro' ? `
      <h4>Varför kriget började</h4><p>${esc(t(s.intro))}</p>
      <h4>Parterna</h4>
      <div class="parties">${s.parties.map(p => `<div><strong>${esc(t(p.name))}</strong><p>${esc(t(p.members))}</p></div>`).join('')}</div>
      ${empireList(war._empires)}
      <p class="story-hint">Tryck på ▶ för att följa kriget.</p>` : war.ongoing ? `
      <h4>Läget i dag</h4><p>${esc(t(s.outcome))}</p>
      <h4>Döda hittills, enligt uppskattningar</h4><p>${esc(t(s.casualties))}</p>` : `
      <h4>Hur kriget slutade</h4><p>${esc(t(s.outcome))}</p>
      <h4>Döda</h4><p>${esc(t(s.casualties))}</p>
      ${empireList(war._empires)}`;
    const label = mode === 'intro' ? 'Innan kriget börjar' : war.ongoing ? `Läget i dag (kontrollerat ${formatDate(s.asOf)})` : 'När kriget är slut';
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="story-label">${esc(label)}</div>
      <h3>${esc(t(war.title))}</h3>
      <div class="meta">${esc(formatEventTime(war))} · ${esc(t(war.place))}</div>
      <div class="story">${body}</div>
      ${srcLine(srcs, pending)}
      ${this.onReport ? `<div class="detail-actions">${reportBtn(war)}</div>` : ''}`;
    this.detail.scrollTop = 0;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    this.bindReport(war);
    this.bindLinks();
  }

  /** Knappen "Rapportera faktafel" öppnar formuläret med händelsen förvald. */
  bindReport(e) {
    this.detail.querySelector('[data-report]')?.addEventListener('click', ev => this.onReport?.(e, ev.currentTarget));
  }

  /** Länkarna mellan krig och riken (#76): ett rike öppnar rikets faktaruta (med data-follow, #72: börjar följa riket), ett krig följs i fokusläget. */
  bindLinks() {
    for (const b of this.detail.querySelectorAll('[data-empire]')) b.addEventListener('click', () => this.onEmpire(b.dataset.empire, 'follow' in b.dataset));
    for (const b of this.detail.querySelectorAll('[data-follow-war]')) b.addEventListener('click', () => this.onFocus(b.dataset.followWar));
  }

  /**
   * Faktaruta om en religion (#90): vad det är, när och var den uppstod, grundare,
   * helig skrift och antal troende, med nyckelår som hoppar i tiden. Allt står i
   * religionens facts i religions.json. origin är händelsen där religionen uppstod,
   * som också är punkten på globen.
   */
  showReligion(r, origin) {
    this.showFacts({ kind: 'Religion', name: t(r.name), color: r.color, symbol: symbolImg(r, 'rel-sym rel-sym-h'), facts: r.facts, origin,
      milestonesTitle: t(r.facts.milestonesTitle) || 'Statsreligion i riken' });
  }

  /**
   * Faktaruta med samma format för religioner (#90) och riken (#170): sammanfattning,
   * rader med rubrik och text, nyckelår som hoppar i tiden, källor och granskningsstatus.
   * origin = händelsen där religionen uppstod (länkas i rutan). place = { start, _lat, _lon }
   * som bestämmer rutans ram efter tidsålder, om det inte finns någon origin.
   * mapNote = förklaring om var kartans gränser kommer ifrån (riken: Cliopatria).
   * lineage = ett försvunnet lands vanished (#72) och groups (alla riken): när det bildades och upplöstes,
   * föregångare och vad det blev. Efterträdare som finns som riken är knappar som börjar följa det riket.
   */
  showFacts(opts) {
    const { kind, name, color, symbol = '', facts: f, origin = null, place = origin, milestonesTitle = 'Nyckelår', mapNote = '', curveId = '', wars = [], lineage = null } = opts;
    // Rikets krig (#76): krig som anger riket i empires, i tidsordning; bara de som syns enligt granskningsstatusen
    const shownWars = wars.filter(w => isVisibleReview(w.review));
    // Ritas rutan om när källorna har kommit, ritas ytkurvan (#77) in igen om den hann komma före
    const pending = this._whenLoaded(needDetails([]), () => {
      const c = this.curveArgs;
      this.showFacts(opts);
      if (c && c[0] === curveId) this.setCurve(...c);
    });
    this.curveArgs = null;
    const subj = kind === 'Rike' ? 'Riket' : kind === 'Försvunnet land' ? 'Landet' : 'Religionen';
    const srcs = [...new Set([...(f.sources ?? []), ...(f.milestones ?? []).flatMap(m => m.sources ?? []), ...(lineage?.sources ?? [])])]
      .map(id => this.srcById[id]).filter(Boolean);
    this.selectedId = origin?.id ?? null;
    this.curve = null;
    this.detail.className = `detail detail-card${place ? ` frame-${styleFor(place, this.styles).frame}` : ''}`;
    delete this.detail.dataset.style;
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="story-label"><span class="swatch" style="background:${esc(color)}"></span>${esc(kind)}</div>
      <h3>${symbol}${esc(name)}</h3>
      <p>${esc(t(f.summary))}</p>
      ${lineage ? lineageHtml(lineage) : ''}
      ${curveId ? `<figure class="area-curve" data-curve="${esc(curveId)}" hidden></figure>` : ''}
      <dl class="religion-facts">${(f.items ?? []).map(it => `<dt>${esc(t(it.label))}</dt><dd>${esc(t(it.text))}</dd>`).join('')}</dl>
      ${origin ? `<p class="war-link">${symbol ? `Symbolen ${symbol.replace('rel-sym-h', 'rel-sym-in')} på globen visar var religionen uppstod:` : 'Där religionen uppstod:'} <button type="button" class="link-btn" data-goto="${esc(origin.id)}">${esc(t(origin.title))}</button> <span class="meta">${esc(formatEventTime(origin))} · ${esc(t(origin.place))}</span></p>` : ''}
      ${f.milestones?.length ? `<div class="war-list"><h4>${esc(milestonesTitle)}</h4><ol>${f.milestones.map(m =>
        `<li><button type="button" class="link-btn" data-year="${Number(m.year)}">${esc(t(m.label) || formatYear(m.year))}</button> ${m.title ? `<b>${esc(t(m.title))}.</b> ` : ''}${esc(t(m.text))}${m.mapNote ? ` <span class="ms-map">Om kartan: ${esc(t(m.mapNote))}</span>` : ''}</li>`).join('')}</ol></div>` : ''}
      ${shownWars.length ? `<div class="war-list empire-wars"><h4>Krig</h4><ol>${shownWars.map(w =>
        `<li><span class="meta">${esc(formatEventTime(w))}</span> <button type="button" class="link-btn" data-follow-war="${esc(w.id)}" title="Följ kriget">▶ ${esc(t(w.title))}</button></li>`).join('')}</ol></div>` : ''}
      ${mapNote ? `<aside class="detail-note"><h4>Om kartan</h4><p>${esc(mapNote)}</p></aside>` : ''}
      ${srcLine(srcs, pending)}
      <div class="detail-actions">
        ${reviewRow(f.review, subj)}
      </div>`;
    this.detail.hidden = false;
    this.detail.scrollTop = 0; // efter hidden, annars behåller kortet förra läget
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-goto]')) b.addEventListener('click', () => this.onSelect(b.dataset.goto));
    for (const b of this.detail.querySelectorAll('[data-year]')) b.addEventListener('click', () => this.onYear(Number(b.dataset.year)));
    this.bindLinks();
    this.bindReviewInfo();
  }

  /**
   * Rikets yta över tid (#77), när rikets fil har laddats. Fylls i rutan om den fortfarande visar samma rike.
   * Markören följer året via setCurveYear().
   */
  setCurve(id, polities, { from, to, color }, year) {
    this.curveArgs = [id, polities, { from, to, color }, year];
    const fig = this.detail.querySelector(`.area-curve[data-curve="${CSS.escape(id)}"]`);
    const curve = fig && buildAreaCurve(polities, { from, to, color });
    if (!curve) return;
    fig.innerHTML = curve.html; fig.hidden = false;
    this.curve = { fig, curve };
    this.setCurveYear(year);
  }
  setCurveYear(year) {
    if (this.curve?.fig.isConnected) this.curve.curve.setYear(this.curve.fig, year);
  }

  /**
   * (i)-knappen vid granskningsstatusen (#310): fäller ut och in förklaringen. Escape stänger först förklaringen
   * och lämnar fokus på knappen; faktarutan stängs först vid nästa Escape.
   */
  bindReviewInfo() {
    const btn = this.detail.querySelector('[data-review-info]'), box = this.detail.querySelector('#review-help');
    if (!btn || !box) return;
    const set = open => { box.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', () => set(box.hidden));
    box.querySelector('[data-review-sources]').addEventListener('click', () => { set(false); this.onSources(); });
    this.detail.querySelector('.detail-actions').addEventListener('keydown', ev => {
      if (ev.key !== 'Escape' || box.hidden) return;
      ev.preventDefault(); ev.stopPropagation();
      set(false); btn.focus({ preventScroll: true });
    });
  }

  /** Faktarutan är ett eget kort (#112). show = false markerar händelsen utan att visa kortet. */
  showDetail(e, show = true) {
    this.selectedId = e?.id ?? null;
    if (!e || !show) { this.shown = null; this.detail.hidden = true; return; }
    const pending = this._whenLoaded(needDetails([e]), () => this.showDetail(e, show)), loading = pending && !e._full;
    // Wikidata länkas till händelsens egen post
    const srcs = (e.sources ?? []).map(id => id === 'wikidata' && e.wikidata
      ? { title: `Wikidata ${e.wikidata}`, url: `https://www.wikidata.org/wiki/${e.wikidata}` }
      : this.srcById[id]).filter(Boolean);
    // Kortets ram följer händelsens tidsålder, med eller utan bild (#129)
    const st = styleFor(e, this.styles);
    this.detail.className = `detail detail-card frame-${st.frame}`;
    this.detail.dataset.style = st.variant?.id ?? st.style.id;
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      ${this.onShowPlace ? `<button type="button" class="place-row" data-show-place aria-label="${esc(t(e.place))}: visa på globen"><span class="place-pin" aria-hidden="true"></span><span class="place-name">${esc(t(e.place))}</span><span class="place-go" aria-hidden="true">· visa på globen</span></button>` : ''}
      ${figure(e, this.srcById)}
      <h3>${esc(t(e.title))}</h3>
      <div class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))} · ${esc(t(CAT[e.category]?.name))}</div>
      ${loading ? LOADING : `<p>${esc(t(e.summary))}</p>`}
      ${e.note ? `<aside class="detail-note"><h4>${esc(t(e.note.title))}</h4><p>${esc(t(e.note.text))}</p></aside>` : ''}
      ${e._war ? `<p class="war-link">Del av: <button type="button" class="link-btn" data-goto="${esc(e._war.id)}">${esc(t(e._war.title))}</button></p>` : ''}
      ${e.kind === 'war' ? `<button type="button" class="chip-btn focus-btn" data-focus="${esc(e.id)}">▶ Följ kriget långsamt</button>` : ''}
      ${e._battles?.length ? `<div class="war-list"><h4>Slag och händelser i kriget</h4><ol>${e._battles.map(b =>
        `<li><button type="button" class="link-btn" data-goto="${esc(b.id)}">${esc(t(b.title))}</button> <span class="meta">${esc(formatEventTime(b))}</span></li>`).join('')}</ol></div>` : ''}
      ${empireList(e._empires ?? e._war?._empires)}
      ${srcLine(srcs, pending)}
      <div class="detail-actions">
        ${reviewRow(e.review, 'Händelsen')}
        ${this.onReport ? reportBtn(e) : ''}
      </div>`;
    this.detail.scrollTop = 0;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-goto]')) b.addEventListener('click', () => this.onSelect(b.dataset.goto));
    this.detail.querySelector('[data-focus]')?.addEventListener('click', ev => this.onFocus(ev.currentTarget.dataset.focus));
    this.detail.querySelector('[data-show-place]')?.addEventListener('click', () => this.onShowPlace(e));
    this.bindReport(e);
    this.bindLinks();
    this.bindReviewInfo();
  }
}
