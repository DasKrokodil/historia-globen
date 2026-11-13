// Fokustypen rike (#113, #170), med försvunna länder (#72): bara rikets områden syns och faktarutan visas först.
import { loadEmpire, loadEmpireFacts, t, symbolUrl } from '../model.js';
import { ui } from '../i18n.js';
import { formatYearSpan } from '../controllers/facts.js';
import { langs, geoCenter } from './util.js';

/** Fokusets spann för ett rike: kartdatan, och för ett försvunnet land också källornas årtal (#72). */
const empireSpan = g => g.vanished ? [Math.min(g.from, g.vanished.founded), Math.max(g.to, g.vanished.dissolved)] : [g.from, g.to];
/** Årtalen i Fokus: kartdatans spann, och för ett försvunnet land först källornas årtal (#72). */
const mapData = g => ui('search.mapData', { span: formatYearSpan(g.from, g.to) });
const empireYears = g => !g.vanished ? mapData(g)
  : `${formatYearSpan(g.vanished.founded, g.vanished.dissolved)} · ${g.file ? mapData(g) : ui('focus.mapPoint')}`;
// Sökningen (#311) letar även i namnen på rikets delar (polities), till exempel "Bysantinska riket" i Rom och "Sverige"
const empireTerms = g => [...langs(g.name), ...g.polities.flatMap(p => langs(p.name))];

export function entry(app) {
  const { data } = app;
  const areas = app.registry.get('areas');
  const group = id => data.empireGroups.find(x => x.id === id);
  return {
    type: 'empire',
    selectsBy: null,
    exists: id => data.empireGroups.some(g => g.id === id),
    async load(id) {
      const g = group(id);
      if (!g) return null;
      // Rikets berättelse (#171) står i faktarutan, som laddas med gränserna (#337)
      const [ps] = await Promise.all([loadEmpire(g), g.hasFacts ? loadEmpireFacts() : null]);
      areas.add(ps);
      // Globen riktas mot riket när det var som störst, och zoomar mindre för vidsträckta riken
      const periods = ps.flatMap(p => p.periods);
      const biggest = periods.reduce((a, b) => (b.areaKm2 > a.areaKm2 ? b : a), periods[0]);
      // Ett försvunnet land utan gräns (#72) har bara en punkt
      const pt = g.vanished?.point?.coordinates;
      const [lat, lon, span] = biggest ? geoCenter([biggest.geometry]) : [pt[1], pt[0], 0];
      // Årtalen är kartdatans spann i Cliopatria, inte nödvändigtvis rikets historiska årtal (#138).
      // Ett försvunnet land följs från bildandet till upplösningen enligt källorna, och kartdatan står efter (#72).
      const [from, to] = empireSpan(g);
      return { title: `${t(g.name)} · ${empireYears(g)}`, short: t(g.name), from, to,
        center: [lat, lon], zoom: !biggest ? 2.4 : span > 150 ? 1 : span > 60 ? 1.3 : 1.8 };
    },
    // Rikets faktaruta visas när man börjar följa det (#170)
    start: f => { app.showEmpireFacts(f.id); },
    facts: { has: f => !!group(f.id)?.hasFacts, show: f => app.showEmpireFacts(f.id) },
    menu: () => [
      { title: 'Riken', note: ui('focus.note.empires'), items: data.empireGroups.filter(g => !g.vanished).map(g =>
        ({ key: `empire:${g.id}`, label: t(g.name), terms: empireTerms(g), sub: mapData(g), color: g.color, symbol: symbolUrl(g), from: g.from, to: g.to })) },
      // Försvunna länder (#72): listas alla, i tidsordning, med när de bildades och upplöstes och vad de blev
      { title: 'Försvunna länder', all: true, note: ui('focus.note.vanished'), items: data.empireGroups.filter(g => g.vanished).map(g => {
        const [from, to] = empireSpan(g);
        const names = g.vanished.successors.map(s => t(s.name).split(' (')[0]);
        const blev = names.length > 4 ? ui('focus.andMore', { names: names.slice(0, 3).join(', '), count: names.length - 3 }) : names.join(', ');
        return { key: `empire:${g.id}`, label: t(g.name), terms: empireTerms(g), sub: `${empireYears(g)} · ${ui('focus.became', { names: blev })}`, color: g.color, symbol: symbolUrl(g), from, to };
      }) },
    ],
  };
}
