// Faktarutorna om religioner (#90, #308) och riken (#170, #72, #301), och religionslagrets laddning
// (#402, del av #389). Uppgifterna står i religions.json och empires/index.json; här väljs bara vad som visas.
import { loadReligions, loadEmpire, loadEmpireFacts, t, symbolUrl, symbolImg, flagImg, formatEventTime } from '../model.js';
import { ui } from '../i18n.js';

export const formatYearSpan = (a, b) => formatEventTime({ start: a, end: b, edtf: '' });

export function createFacts(app) {
  const { $, state, data, globe, timeline, panel, layers } = app;
  const religions = app.registry.get('religions');

  // Religionerna laddas första gången lagret slås på, och då byggs undermenyn
  let religionsLoading = false;
  async function ensureReligions() {
    if (religionsLoading || !layers.on.religions) return;
    religionsLoading = true;
    $('religion-list').textContent = ui('facts.religionsLoading');
    try {
      const doc = await loadReligions();
      setReligions(doc);
      $('religion-list').textContent = '';
      // Knappen "Läs om religionerna" överst i undermenyn öppnar faktarutan på begäran (#308)
      if (doc.religions.some(r => r.facts)) {
        const about = document.createElement('button');
        about.type = 'button'; about.className = 'info-btn rel-about';
        about.textContent = ui('facts.aboutReligions');
        about.addEventListener('click', () => showAboutReligions());
        $('religion-list').append(about);
      }
      // Att bocka i eller ur en religion ändrar bara lagret; menyn står kvar öppen (#308)
      layers.sublist($('religion-list'), doc.religions.map(r => ({ id: r.id, name: t(r.name), color: r.color, symbol: symbolUrl(r), info: !!r.facts })), (id, on) => {
        on ? religions.hidden.delete(id) : religions.hidden.add(id);
        app.refresh();
      }, id => showReligionFacts(id));
      data.religionsDoc = doc;
      app.refresh();
    } catch (err) {
      console.error(err);
      $('religion-list').textContent = ui('facts.religionsFailed');
      religionsLoading = false;
    }
  }

  // Faktarutan om en religion och punkten där den uppstod (#90). Uppgifterna står i
  // religionens facts i religions.json, och punkten är händelsen som facts.origin pekar på.
  function setReligions(doc) {
    if (!religions.religions.length) religions.setData(doc.religions);
    religions.setPolities(doc.polities);
    religions.setOrigins(new Map(doc.religions.filter(r => data.byId[r.facts?.origin]).map(r => [r.id, data.byId[r.facts.origin]])));
  }
  function showReligionFacts(id, fly = true) {
    const r = data.religionsDoc?.religions.find(x => x.id === id);
    if (!r?.facts) return false;
    const origin = data.byId[r.facts.origin];
    app.store.setSelected(origin?.id ?? null);
    panel.showReligion(r, origin, { type: 'religion', id: r.id, label: t(r.name), year: Math.round(timeline.year) });
    // Menyerna stängs så att faktarutan och punkten syns
    app.surfaces.closeAll({ narrow: app.narrow.matches });
    if (origin && fly) globe.flyTo(origin._lat, origin._lon);
    app.refresh();
    return true;
  }
  // Faktarutan om ett rike (#170): samma ruta som för religioner, med rikets facts i
  // empires/index.json. Kartans gränser kommer från Cliopatria och kan ha andra årtal
  // än rutans källor (#138), så rutan säger det.
  // polity = ett rike i gruppen med egen faktaruta (polityFacts, #301), till exempel Bysantinska riket; då visas
  // rikets egen ruta med dess symbol och kartdata för just det riket.
  function showEmpireFacts(id, polity = null) {
    const focus = state.focus;
    const g = data.empireGroups.find(x => x.id === id);
    const own = polity && g?.polityFacts?.[polity.id];
    // Rikenas faktarutor laddas vid första klicket (#337); hasFacts säger att riket har en
    if (!own?.facts && g?.hasFacts && !g.facts) {
      loadEmpireFacts().then(() => showEmpireFacts(id, polity)).catch(err => console.error(err));
      return true;
    }
    const facts = own?.facts ?? g?.facts;
    if (!facts) return false;
    app.store.setSelected(null);
    // Ramen följer rikets tidsålder och platsen globen riktas mot i fokus
    const place = focus?.type === 'empire' && focus.id === id ? { start: g.from, _lat: focus.center[0], _lon: focus.center[1] } : null;
    const from = own ? Math.min(...polity.periods.map(p => p.start)) : g.from;
    const to = own ? Math.max(...polity.periods.map(p => p.end)) : g.to;
    // Osäker gräns (#73) gäller gruppen; inflytandet (#75) står per rike, så ett rike med egen ruta (#301) visar bara sitt
    const note = [t(facts.mapNote), own ? '' : t(g.uncertainBorder?.note),
      influenceNote(own ? { influence: g.influence?.filter(a => a.polity === polity.id) } : g)].filter(Boolean).join(' ');
    const flag = (own?.flags ?? g.flags ?? []).find(f => timeline.year >= f.from && timeline.year <= f.to);
    const sym = flag ? flagImg(flag, 'rel-sym rel-sym-h') : symbolImg(own?.symbol ? { symbol: own.symbol } : g, 'rel-sym rel-sym-h');
    const curveId = own ? `${g.id}:${polity.id}` : g.file ? g.id : '';
    // Rikets krig (#76); ett rike med egen ruta visar krigen under sin egen tid
    const wars = own ? (g._wars ?? []).filter(w => w.end >= from && w.start <= to) : g._wars;
    // Ett försvunnet land (#72) har årtal, föregångare och efterträdare; ett land utan gräns visas som en punkt
    const lineage = g.vanished && !own ? { ...g.vanished, groups: data.empireGroups } : null;
    panel.showFacts({ kind: lineage ? 'vanished' : 'empire', name: t(own ? polity.name : g.name), color: g.color, facts, place, curveId, empireId: own ? null : g.id,
      symbol: sym, wars, lineage,
      empireMap: !!g.file,
      report: { type: lineage ? 'vanished-country' : 'empire', id: own ? polity.id : g.id, label: t(own ? polity.name : g.name), year: Math.round(timeline.year) },
      mapNote: g.file ? `${ui('facts.mapNote', { source: g.borderSource ?? 'Cliopatria', span: formatYearSpan(from, to) })}${note ? ` ${note}` : ''}` : note });
    // Ytkurvan (#77) ritas när rikets fil har laddats (den laddas ändå för kartan); för ett rike med egen
    // faktaruta (#301) visar kurvan bara det riket
    if (own) panel.setCurve(curveId, [polity], { from, to, color: g.color }, timeline.year);
    else if (g.file) loadEmpire(g).then(ps => panel.setCurve(g.id, ps, g, timeline.year)).catch(err => console.error(err));
    app.surfaces.closeAll({ narrow: app.narrow.matches });
    app.refresh();
    return true;
  }
  /** Inflytandet runt riket (#75) i rutan Om kartan: lydriken och vasaller enligt Cliopatrias relationer. */
  function influenceNote(g) {
    if (!g.influence?.length) return '';
    const kind = r => (['allegiance', 'vassalage'].includes(r) ? ui(`facts.influence.${r}`) : r);
    const list = g.influence.map(a => `${t(a.name)} (${kind(a.relation)}, ${formatYearSpan(a.from, a.to)})`);
    return ui('facts.influenceNote', { list: list.join(', ') });
  }
  /** Knappen "Läs om religionerna" (#308): faktarutan för religionen man följer i Fokus, annars för den
   *  första synliga religionen som har en (tidigare visades den automatiskt när lagret slogs på, #90). */
  function showAboutReligions() {
    const focus = state.focus;
    if (focus?.type === 'religion' && showReligionFacts(focus.id, false)) return;
    const r = data.religionsDoc?.religions.find(x => x.facts && !religions.hidden.has(x.id))
      ?? data.religionsDoc?.religions.find(x => x.facts);
    if (r) showReligionFacts(r.id);
  }

  return { ensureReligions, setReligions, showReligionFacts, showEmpireFacts, showAboutReligions };
}
