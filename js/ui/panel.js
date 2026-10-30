// "Samtidigt i världen": lista över synliga händelser per världsdel, kategorifilter
// (som ligger i lagermenyn, #120) och faktarutan.
import { CATEGORIES, CAT, REVIEW, REGIONS, region, styleFor, t, formatEventTime, formatYear, formatDate, reviewLabel, REVIEW_SUBJECT_HELP, symbolImg } from '../model.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

export class Panel {
  constructor({ root, list, filters, detail, sub, count, toggle, close }, { events, srcById, styles }) {
    Object.assign(this, { root, list, filtersEl: filters, detail, sub, count, toggle, srcById, styles });
    this.onSelect = () => {};
    this.onFilter = () => {};
    this.onSources = () => {};
    this.onFocus = () => {};
    this.onOpen = () => {};
    this.onYear = () => {};
    this.onReport = null; // (händelse, knapp) => öppnar formuläret "Rapportera faktafel" (js/ui/feedback.js)
    this.selectedId = null;

    // Visa bara kategorier som har händelser, i den fasta ordningen.
    const used = new Set(events.map(e => e.category));
    this.filters = new Set(used);
    for (const c of CATEGORIES.filter(c => used.has(c.id))) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'filter'; b.setAttribute('aria-pressed', 'true');
      b.innerHTML = `<span class="dot" style="background:${c.color}"></span>${esc(t(c.name))}`;
      b.addEventListener('click', () => {
        const on = this.filters.has(c.id);
        on ? this.filters.delete(c.id) : this.filters.add(c.id);
        b.setAttribute('aria-pressed', String(!on));
        this.onFilter(this.filters);
      });
      filters.append(b);
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
      // I dator går lådan ner till tidslinjen, i mobil täcker den högst 60 procent
      this.root.style.maxHeight = innerWidth > 760 ? `calc(100dvh - ${r.bottom + 150}px)` : `min(60vh, calc(100dvh - ${r.bottom + 150}px))`;
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
   * Krigets berättelse i fokusläget (#122): före start orsak och parter, i slutet
   * hur kriget slutade och hur många som dog. Uppgifterna finns i krigets story.
   * Ett pågående krig (#223) visar i stället läget i dag, kontrollerat story.asOf.
   */
  showStory(war, mode) {
    const s = war.story;
    this.selectedId = war.id;
    // Samma ram efter tidsålder som faktarutan (#129)
    this.detail.className = `detail detail-card frame-${styleFor(war, this.styles).frame}`;
    const srcs = (s.sources ?? []).map(id => this.srcById[id]).filter(Boolean);
    const body = mode === 'intro' ? `
      <h4>Varför kriget började</h4><p>${esc(t(s.intro))}</p>
      <h4>Parterna</h4>
      <div class="parties">${s.parties.map(p => `<div><strong>${esc(t(p.name))}</strong><p>${esc(t(p.members))}</p></div>`).join('')}</div>
      <p class="story-hint">Tryck på ▶ för att följa kriget.</p>` : war.ongoing ? `
      <h4>Läget i dag</h4><p>${esc(t(s.outcome))}</p>
      <h4>Döda hittills, enligt uppskattningar</h4><p>${esc(t(s.casualties))}</p>` : `
      <h4>Hur kriget slutade</h4><p>${esc(t(s.outcome))}</p>
      <h4>Döda</h4><p>${esc(t(s.casualties))}</p>`;
    const label = mode === 'intro' ? 'Innan kriget börjar' : war.ongoing ? `Läget i dag (kontrollerat ${formatDate(s.asOf)})` : 'När kriget är slut';
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="story-label">${esc(label)}</div>
      <h3>${esc(t(war.title))}</h3>
      <div class="meta">${esc(formatEventTime(war))} · ${esc(t(war.place))}</div>
      <div class="story">${body}</div>
      <div class="src">Källa: ${srcs.map(x => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>`).join(', ') || 'saknas'}</div>
      ${this.onReport ? `<div class="detail-actions">${reportBtn(war)}</div>` : ''}`;
    this.detail.scrollTop = 0;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    this.bindReport(war);
  }

  /** Knappen "Rapportera faktafel" öppnar formuläret med händelsen förvald. */
  bindReport(e) {
    this.detail.querySelector('[data-report]')?.addEventListener('click', ev => this.onReport?.(e, ev.currentTarget));
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
   */
  showFacts({ kind, name, color, symbol = '', facts: f, origin = null, place = origin, milestonesTitle = 'Nyckelår', mapNote = '' }) {
    const rv = REVIEW[f.review] ?? REVIEW.draft;
    const subj = kind === 'Rike' ? 'Riket' : 'Religionen';
    const srcs = [...new Set([...(f.sources ?? []), ...(f.milestones ?? []).flatMap(m => m.sources ?? [])])]
      .map(id => this.srcById[id]).filter(Boolean);
    this.selectedId = origin?.id ?? null;
    this.detail.className = `detail detail-card${place ? ` frame-${styleFor(place, this.styles).frame}` : ''}`;
    delete this.detail.dataset.style;
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="story-label"><span class="swatch" style="background:${esc(color)}"></span>${esc(kind)}</div>
      <h3>${symbol}${esc(name)}</h3>
      <p>${esc(t(f.summary))}</p>
      <dl class="religion-facts">${(f.items ?? []).map(it => `<dt>${esc(t(it.label))}</dt><dd>${esc(t(it.text))}</dd>`).join('')}</dl>
      ${origin ? `<p class="war-link">${symbol ? `Symbolen ${symbol.replace('rel-sym-h', 'rel-sym-in')} på globen visar var religionen uppstod:` : 'Där religionen uppstod:'} <button type="button" class="link-btn" data-goto="${esc(origin.id)}">${esc(t(origin.title))}</button> <span class="meta">${esc(formatEventTime(origin))} · ${esc(t(origin.place))}</span></p>` : ''}
      ${f.milestones?.length ? `<div class="war-list"><h4>${esc(milestonesTitle)}</h4><ol>${f.milestones.map(m =>
        `<li><button type="button" class="link-btn" data-year="${Number(m.year)}">${esc(t(m.label) || formatYear(m.year))}</button> ${m.title ? `<b>${esc(t(m.title))}.</b> ` : ''}${esc(t(m.text))}${m.mapNote ? ` <span class="ms-map">Om kartan: ${esc(t(m.mapNote))}</span>` : ''}</li>`).join('')}</ol></div>` : ''}
      ${mapNote ? `<aside class="detail-note"><h4>Om kartan</h4><p>${esc(mapNote)}</p></aside>` : ''}
      <div class="src">Källa: ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || 'saknas'}</div>
      <div class="detail-actions">
        <span class="review-badge ${rv.cls}" title="${esc(REVIEW_SUBJECT_HELP[subj])}">${esc(reviewLabel(f.review, subj))}</span>
      </div>`;
    this.detail.hidden = false;
    this.detail.scrollTop = 0; // efter hidden, annars behåller kortet förra läget
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-goto]')) b.addEventListener('click', () => this.onSelect(b.dataset.goto));
    for (const b of this.detail.querySelectorAll('[data-year]')) b.addEventListener('click', () => this.onYear(Number(b.dataset.year)));
  }

  /** Faktarutan är ett eget kort (#112). show = false markerar händelsen utan att visa kortet. */
  showDetail(e, show = true) {
    this.selectedId = e?.id ?? null;
    if (!e || !show) { this.detail.hidden = true; return; }
    const rv = REVIEW[e.review] ?? REVIEW.draft;
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
      ${figure(e, this.srcById)}
      <h3>${esc(t(e.title))}</h3>
      <div class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))} · ${esc(t(CAT[e.category]?.name))}</div>
      <p>${esc(t(e.summary))}</p>
      ${e.note ? `<aside class="detail-note"><h4>${esc(t(e.note.title))}</h4><p>${esc(t(e.note.text))}</p></aside>` : ''}
      ${e._war ? `<p class="war-link">Del av: <button type="button" class="link-btn" data-goto="${esc(e._war.id)}">${esc(t(e._war.title))}</button></p>` : ''}
      ${e.kind === 'war' ? `<button type="button" class="chip-btn focus-btn" data-focus="${esc(e.id)}">▶ Följ kriget långsamt</button>` : ''}
      ${e._battles?.length ? `<div class="war-list"><h4>Slag och händelser i kriget</h4><ol>${e._battles.map(b =>
        `<li><button type="button" class="link-btn" data-goto="${esc(b.id)}">${esc(t(b.title))}</button> <span class="meta">${esc(formatEventTime(b))}</span></li>`).join('')}</ol></div>` : ''}
      <div class="src">Källa: ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || 'saknas'}</div>
      <div class="detail-actions">
        <span class="review-badge ${rv.cls}" title="${esc(REVIEW_SUBJECT_HELP['Händelsen'])}">${esc(reviewLabel(e.review, 'Händelsen'))}</span>
        ${this.onReport ? reportBtn(e) : ''}
      </div>`;
    this.detail.scrollTop = 0;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-goto]')) b.addEventListener('click', () => this.onSelect(b.dataset.goto));
    this.detail.querySelector('[data-focus]')?.addEventListener('click', ev => this.onFocus(ev.currentTarget.dataset.focus));
    this.bindReport(e);
  }
}
