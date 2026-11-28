// Rikena i landskortet (#1448): platsens periods pekar på riken i data/empires/ och åren är rikets egna, luckorna blir egna rader,
// kortet visar rikena som knappar med hela namnet för skärmläsare, och de nya texterna finns på alla fem språken.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeEmpireRows, placeTodayLine, placeStateLine } from '../js/focus/place.js';
import { Panel } from '../js/ui/panel.js';
import { ui } from '../js/i18n.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const places = json('data/platser.json').places;
const groups = json('data/empires/index.json').groups;
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
/** Inledningen och kartanteckningarna (introNotes, #2353) i ett språk: rikesperioderna ligger i anteckningarna, inte i den korta inledningen. */
const introAll = (place, lang) => `${place.intro[lang]} ${place.introNotes?.[lang] ?? ''}`;

/** Delens perioder i rikets fil, som [start, end] i tidsordning. */
const spansOf = (empire, polity) => {
  const g = groups.find(x => x.id === empire);
  const pol = json(g.file).polities.find(p => p.id === polity);
  return pol.periods.map(q => [q.start, q.end]).sort((a, b) => a[0] - b[0]);
};

test('varje period pekar på ett rike och en del som finns, och åren är början och slut på delens egna perioder utan lucka', () => {
  const withPeriods = places.filter(p => p.periods);
  assert.ok(withPeriods.some(p => p.id === 'sverige') && withPeriods.some(p => p.id === 'danmark'), 'Sverige och Danmark ska ha perioder');
  for (const pl of withPeriods) {
    let prev = -Infinity;
    for (const per of pl.periods) {
      const where = `${pl.id}: ${per.empire}/${per.polity} ${per.from}–${per.to}`;
      assert.deepEqual(Object.keys(per).filter(k => k !== 'status').sort(), ['empire', 'from', 'polity', 'to'], `${where}: bara id och år (och valfri status), inga egna texter`);
      assert.ok(per.status === undefined || ['belagt', 'tolkat'].includes(per.status), `${where}: status är belagt eller tolkat`);
      const g = groups.find(x => x.id === per.empire);
      assert.ok(g, `${where}: riket finns inte i data/empires/index.json`);
      assert.ok(g.polities.some(p => p.id === per.polity), `${where}: delen finns inte i gruppen`);
      const spans = spansOf(per.empire, per.polity);
      const i = spans.findIndex(s => s[0] === per.from);
      assert.ok(i >= 0, `${where}: from är inte början på en period i rikets data`);
      let end = spans[i][1];
      for (const [a, b] of spans.slice(i + 1)) { if (end >= per.to || a !== end + 1) break; end = b; }
      assert.equal(end, per.to, `${where}: to är inte slutet på en sammanhängande följd av rikets perioder`);
      assert.ok(per.from >= prev, `${where}: perioderna står inte i tidsordning`);
      prev = per.from;
    }
  }
});

test('en plats med perioder har källan cliopatria (rikenas gränser och år)', () => {
  for (const pl of places.filter(p => p.periods)) assert.ok(pl.sources.includes('cliopatria'), `${pl.id} saknar cliopatria i sources`);
});

test('rikets egen rad Om kartan står vid raden bara när gruppen har en enda del, och bara vid gruppens första rad', () => {
  const note = { sv: 'Källorna anger x.' };
  const gs = [{ id: 'u', facts: { mapNote: note }, polities: [{ id: 'u', name: { sv: 'Unionen' } }] },
    { id: 'm', facts: { mapNote: { sv: 'gäller hela gruppen' } }, polities: [{ id: 'm1', name: { sv: 'M1' } }, { id: 'm2', name: { sv: 'M2' } }] }];
  const rows = placeEmpireRows({ periods: [{ empire: 'm', polity: 'm1', from: 1, to: 5 }, { empire: 'u', polity: 'u', from: 6, to: 9 },
    { empire: 'm', polity: 'm2', from: 10, to: 12 }, { empire: 'u', polity: 'u', from: 13, to: 14 }] }, gs);
  assert.deepEqual(rows.map(r => r.mapNote), [null, note, null, null]);
  // Utan laddade faktarutor: ingen rad, inget fel
  assert.deepEqual(placeEmpireRows({ periods: [{ empire: 'u', polity: 'u', from: 6, to: 9 }] }, [{ ...gs[0], facts: undefined }]).map(r => r.mapNote), [null]);
});

test('Skåne (landskap) och platser utan beslut har inga perioder', () => {
  for (const pl of places.filter(p => !['sverige', 'danmark', 'norge', 'finland', 'estland', 'island', 'lettland', 'litauen', 'storbritannien', 'irland', 'frankrike', 'belgien', 'nederlanderna', 'luxemburg', 'tyskland', 'osterrike', 'schweiz', 'polen', 'tjeckien', 'slovakien', 'ungern', 'italien'].includes(p.id))) assert.equal(pl.periods, undefined, pl.id);
});

test('raderna får rikets eget namn ur indexet och en lucka för år som ingen period täcker', () => {
  const fake = { periods: [{ empire: 'a', polity: 'a1', from: 900, to: 1000 }, { empire: 'b', polity: 'b1', from: 1001, to: 1100 },
    { empire: 'a', polity: 'a2', from: 1200, to: 1300 }, { empire: 'saknas', polity: 'x', from: 1300, to: 1400 }] };
  const gs = [{ id: 'a', polities: [{ id: 'a1', name: { sv: 'A ett' } }, { id: 'a2', name: { sv: 'A två' } }] }, { id: 'b', polities: [{ id: 'b1', name: { sv: 'B' } }] }];
  const rows = placeEmpireRows(fake, gs);
  assert.deepEqual(rows.map(r => [r.kind, r.name?.sv ?? null, r.from, r.to]), [
    ['empire', 'A ett', 900, 1000], ['empire', 'B', 1001, 1100], ['gap', null, 1101, 1199], ['empire', 'A två', 1200, 1300]]);
  assert.equal(rows[3].empire, 'a', 'Följ riket startar Fokus på gruppen, inte på delen');
  assert.deepEqual(placeEmpireRows({}, gs), [], 'en plats utan perioder har ingen lista');
  // Överlappande perioder (en union bredvid landet) ger ingen lucka
  assert.deepEqual(placeEmpireRows({ periods: [{ empire: 'a', polity: 'a1', from: 900, to: 1100 }, { empire: 'b', polity: 'b1', from: 1000, to: 1050 }] }, gs)
    .filter(r => r.kind === 'gap'), []);
});

test('luckorna i Sverige, Danmark, Finland, Estland, Island, Lettland, Litauen, Storbritannien, Irland, Frankrike, Belgien, Nederländerna, Luxemburg, Tyskland, Österrike, Schweiz, Polen, Tjeckien, Slovakien, Ungern och Italien räknas ur datan: inga av de listade delarna täcker luckans år', () => {
  for (const id of ['sverige', 'danmark', 'finland', 'estland', 'island', 'lettland', 'litauen', 'storbritannien', 'irland', 'frankrike', 'belgien', 'nederlanderna', 'luxemburg', 'tyskland', 'osterrike', 'schweiz', 'polen', 'tjeckien', 'slovakien', 'ungern', 'italien']) {
    const pl = places.find(p => p.id === id);
    const rows = placeEmpireRows(pl, groups);
    assert.equal(rows.filter(r => r.kind === 'empire').length, pl.periods.length, `${id}: alla perioder blir rader`);
    for (const gap of rows.filter(r => r.kind === 'gap')) {
      for (const per of pl.periods) assert.ok(per.to < gap.from || per.from > gap.to, `${id}: luckan ${gap.from}–${gap.to} överlappar ${per.polity}`);
    }
    // Varje år mellan första och sista perioden är antingen en period eller en lucka
    const first = Math.min(...rows.map(r => r.from)), last = Math.max(...rows.map(r => r.to));
    for (let y = first; y <= last; y++) assert.ok(rows.some(r => r.from <= y && y <= r.to), `${id}: år ${y} saknas i listan`);
  }
});

test('Belgiens luckor är de som kortets inledning nämner (#1817): Bryssel i inget rike på kartan', () => {
  const rows = placeEmpireRows(places.find(p => p.id === 'belgien'), groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]),
    [[261, 282], [439, 489], [661, 673], [860, 869], [1431, 1481], [1579, 1581], [1588, 1594], [1794, 1814]]);
  const belgien = places.find(p => p.id === 'belgien');
  const intro = Object.fromEntries(LANGS.map(l => [l, introAll(belgien, l)]));
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    for (const years of ['261–282', '439–489', '661–673', '860–869', '1431–1481', '1579–1581', '1588–1594', '1794–1814', '1915–1918', '1940–1944']) {
      assert.ok(intro[lang].includes(years), `belgien: inledningen (${lang}) nämner inte ${years}`);
    }
  }
});

test('Nederländernas luckor är de som kortets inledning nämner (#1818): Amsterdam i inget rike på kartan', () => {
  const pl = places.find(p => p.id === 'nederlanderna');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]),
    [[9, 509], [661, 665], [860, 869], [1450, 1481], [1579, 1581], [1673, 1676], [1811, 1814]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    for (const years of ['1–8', '9–509', '661–665', '860–869', '1450–1481', '1579–1581', '1673–1676', '1811–1814', '1940–1944']) {
      assert.ok(introAll(pl, lang).includes(years), `nederlanderna: inledningen (${lang}) nämner inte ${years}`);
    }
    for (const island of ['Bonaire', 'Saba', 'Aruba']) {
      assert.ok(introAll(pl, lang).includes(island) && pl.boundary.note[lang].includes(island), `nederlanderna: inledningen eller konturens not (${lang}) nämner inte ${island}`);
    }
  }
  assert.ok(pl.boundary.geometry.coordinates.every(poly => poly[0].every(([lon]) => lon > 0)), 'nederlanderna: en del av konturen ligger i Karibien');
});

test('Luxemburgs luckor och kartavvikelser är de som kortets inledning nämner (#1819): staden Luxemburg i inget rike på kartan', () => {
  const pl = places.find(p => p.id === 'luxemburg');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]),
    [[261, 282], [407, 409], [451, 451], [661, 665], [860, 869], [1450, 1481], [1700, 1701], [1794, 1814]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, kartans avvikande år (Frankrike, Belgien, Tyska riket, Nazityskland, raderna som inte står i kortet) och delningarna
    for (const years of ['261–282', '407–409', '451', '661–665', '860–869', '1450–1481', '1700–1701', '1794–1814', '1687–1699', '1834–1839',
      '1815–1889', '1915–1918', '1940–1944', '1757–1761', '1956–1957', '1658', '1839']) {
      assert.ok(introAll(pl, lang).includes(years), `luxemburg: inledningen (${lang}) nämner inte ${years}`);
    }
    for (const town of ['Echternach', 'Schengen']) assert.ok(introAll(pl, lang).includes(town), `luxemburg: inledningen (${lang}) nämner inte ${town}`);
  }
  // Raderna som kortet inte visar: Frankrike 1757–1761 och 1956–1957 överlappar andra rader i rikenas data
  assert.ok(!pl.periods.some(p => (p.from <= 1761 && p.to >= 1757 && p.empire === 'kungariket-frankrike') || p.empire === 'franska-kolonialvaldet'));
});

test('Tysklands luckor och kartavvikelser är de som kortets inledning nämner (#1820): Köln till 1806, Berlin därefter', () => {
  const pl = places.find(p => p.id === 'tyskland');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]), [[261, 282], [661, 665], [860, 869], [1807, 1870]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, Berlin i Tysk-romerska riket och Svenska stormaktsväldet (raderna som inte står i kortet), Preussen,
    // Weimarrepubliken, ockupationszonerna, Västtyskland och Saarområdet
    for (const years of ['261–282', '661–665', '860–869', '1807–1870', '936–989', '1169–1806', '1632–1635', '1640–1647', '1701', '1918',
      '1702–1806', '1815–1866', '1866–1871', '1919', '1920', '1945–1948', '1945–1946', '1945–1949', '1947', '1950', '1920–1934', '1947–1956']) {
      assert.ok(introAll(pl, lang).includes(years), `tyskland: inledningen (${lang}) nämner inte ${years}`);
    }
    // Orterna utanför Tyskland som den grova gränsen eller kustmarginalen lägger i Tyskland; grannländernas includeEvents (#2333)
    // räknar dem till sina länder, och inledningen säger det
    for (const town of ['Echternach', 'Schengen', 'Kelmis', 'Dybbøl']) assert.ok(introAll(pl, lang).includes(town), `tyskland: inledningen (${lang}) nämner inte ${town}`);
    assert.ok(!/syns därför i kortet|therefore appear on the card|erscheinen deshalb|por eso figuran|figurent donc/.test(introAll(pl, lang)), `tyskland: inledningen (${lang}) säger fortfarande att gränsorterna står i kortet`);
  }
  // Svenska stormaktsväldet i Berlin står inte i kortet; Preussen och Tysk-romerska riket överlappar
  assert.ok(!pl.periods.some(p => p.empire === 'svenska-stormaktsvaldet'));
  // Delningen: Östtyskland och Västtyskland båda till 1990, Tyskland från 1991
  const end = id => pl.periods.filter(p => p.empire === id).map(p => [p.from, p.to]);
  assert.deepEqual(end('osttyskland'), [[1949, 1990]]);
  assert.deepEqual(end('vasttyskland'), [[1950, 1990]]);
  assert.deepEqual(end('tyskland'), [[1991, 2024]]);
});

test('Österrikes luckor och kartavvikelser är de som kortets inledning nämner (#1821): rikena följer Wien', () => {
  const pl = places.find(p => p.id === 'osterrike');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]), [[455, 499], [546, 787], [911, 959], [1683, 1686], [1805, 1805], [1807, 1867]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, Romarriket (Noricum 16 f.Kr., kartan 14 f.Kr. och Wien från 43), Matthias Corvinus, belägringen 1683,
    // Spanska imperiet och Habsburgska riket (raderna som inte står i kortet), Kejsardömet Österrike, Österrike-Ungern,
    // republiken, gränserna 1919–1921, Nazityskland och ockupationen
    for (const years of ['455–499', '546–787', '911–959', '1683–1686', '1805', '1807–1867', '16 ', '14 ', '43', '1485–1490', '1487–1491',
      '1534–1555', '1529–1555', '1521', '1804–1867', '1806', '1867', '1868–1918', '12', '1918', '1919', '1920', '1921', '1938', '1938–1944', '1945–1955']) {
      assert.ok(introAll(pl, lang).includes(years), `osterrike: inledningen (${lang}) nämner inte ${years}`);
    }
    // Ötzi ligger i Italien men innanför kartans grova gräns
    assert.ok(introAll(pl, lang).includes('Ötzi'), `osterrike: inledningen (${lang}) nämner inte Ötzi`);
  }
  // Spanska imperiet i Wien 1534–1555 står inte i kortet; Kungariket Ungern (Matthias Corvinus) gör det
  assert.ok(!pl.periods.some(p => p.empire === 'spanska-imperiet'));
  const span = id => pl.periods.filter(p => p.empire === id).map(p => [p.from, p.to]);
  assert.deepEqual(span('kungariket-ungern'), [[1487, 1491]]);
  assert.deepEqual(span('nazityskland'), [[1938, 1944]]);
  assert.deepEqual(span('osterrike'), [[1919, 1937], [1945, 2024]]);
});

test('Schweiz luckor och kartavvikelser är de som kortets inledning nämner (#1822): rikena följer Bern', () => {
  const pl = places.find(p => p.id === 'schweiz');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]), [[451, 533], [661, 673], [922, 925], [936, 1009], [1799, 1814]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, Romarriket (Genève och Basel från 50 f.Kr., Bern från 14 f.Kr.), förbundsbrevet, Tysk-romerska riket,
    // Schwabiska kriget och Westfaliska freden, Basel som kanton, Helvetiska republiken, Genève (allierat, franskt, kanton,
    // och på kartan i inget rike, i Frankrike och i Schweiz först från 1919)
    for (const years of ['451–533', '661–673', '922–925', '936–1009', '1799–1814', '50 ', '14 ', '1291', '1010–1647', '1499', '1648',
      '1501', '1648–1814', '1798–1803', '1803', '1798–1813', '1815', '1794–1859', '1860–1918', '1919']) {
      assert.ok(introAll(pl, lang).includes(years), `schweiz: inledningen (${lang}) nämner inte ${years}`);
    }
    assert.ok(introAll(pl, lang).includes('Liechtenstein'), `schweiz: inledningen (${lang}) nämner inte Liechtenstein`);
  }
  // Kungariket Frankrike (Genève 1540-talet) står inte i kortet, eftersom raderna följer Bern
  assert.ok(!pl.periods.some(p => ['kungariket-frankrike', 'franska-kolonialvaldet'].includes(p.empire)));
  const span = id => pl.periods.filter(p => p.empire === id).map(p => [p.from, p.to]);
  assert.deepEqual(span('romarriket'), [[-13, 394], [395, 450]]);
  assert.deepEqual(span('tysk-romerska-riket'), [[1010, 1647]]);
  assert.deepEqual(span('schweiz'), [[1648, 1798], [1815, 2024]]);
});

test('Polens luckor och kartavvikelser är de som kortets kartanteckningar nämner (#1823): rikena följer Warszawa', () => {
  const pl = places.find(p => p.id === 'polen');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]), [[1139, 1351], [1450, 1793], [1807, 1813], [1830, 1833], [1940, 1944]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, Kungariket Polen (962–1449, delningen 1138 och 1320), samväldet, delningarna, Preussen, Hertigdömet Warszawa,
    // Ryska imperiet, Tyska riket, Andra polska republiken, Generalguvernementet, Kraków (fri stad, kartans Ryska imperiet),
    // Poznań, Gdańsk (Kungliga Preussen och Fria staden Danzig) och Oder–Neisse-gränsen
    for (const years of ['1139–1351', '1450–1793', '1807–1813', '1830–1833', '1940–1944', '962–1449', '1138', '1320', '1569–1795', '1772–1795',
      '1794–1806', '1807–1815', '1814–1829', '1834–1915', '1916–1918', '1919–1939', '1945', '1815–1846', '1828–1829', '1814–1827', '1466',
      '1459–1791', '1920–1939']) {
      assert.ok(introAll(pl, lang).includes(years), `polen: kartanteckningarna (${lang}) nämner inte ${years}`);
    }
    // Kaliningrad ligger utanför kortet, och inledningen är kort (beslut 2026-11-27, #2353)
    assert.ok(introAll(pl, lang).includes('Kaliningrad'), `polen: kartanteckningarna (${lang}) nämner inte Kaliningrad`);
    assert.ok(pl.intro[lang].length <= 400, `polen: inledningen (${lang}) är längre än cirka 400 tecken`);
  }
  // Nazityskland (Generalguvernementet) står som lucka, inte som rad, som för Litauen
  assert.ok(!pl.periods.some(p => p.empire === 'nazityskland'));
  const span = id => pl.periods.filter(p => p.empire === id).map(p => [p.from, p.to]);
  assert.deepEqual(span('kungariket-polen'), [[962, 1138], [1352, 1449]]);
  assert.deepEqual(span('ryska-imperiet'), [[1814, 1829], [1834, 1915]]);
  assert.deepEqual(span('polen'), [[1919, 1939], [1945, 2024]]);
});

test('Tjeckiens luckor och kartavvikelser är de som kortets kartanteckningar nämner (#1824): rikena följer Prag', () => {
  const pl = places.find(p => p.id === 'tjeckien');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]), [[1807, 1867], [1939, 1944]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, Stormähren (870), Bolesław I (1003, 1004) och kartans Kungariket Polen, Tysk-romerska riket (1002, 1010–1806),
    // kungariket (1198), Habsburgarna (1526) och kartans Spanska imperiet och Preussen, Österrike-Ungern, Tjeckoslovakien,
    // Sudetlandet och protektoratet, upplösningen, och Mährens och Ostravas avvikelser
    for (const years of ['1807–1867', '1939–1944', '870', '1003', '1004', '1003–1009', '1002', '1010–1806', '1198', '1526', '1529–1555',
      '1556', '1744–1747', '1804', '1868–1918', '1919–1938', '1938', '1939', '1945–1991', '1992', '1993', '999', '1019', '1029',
      '1003–1027', '1468–1478', '1475–1491', '1873–1918']) {
      assert.ok(introAll(pl, lang).includes(years), `tjeckien: kartanteckningarna (${lang}) nämner inte ${years}`);
    }
    for (const name of ['Brno', 'Ostrava', 'Liberec']) {
      assert.ok(introAll(pl, lang).includes(name), `tjeckien: kartanteckningarna (${lang}) nämner inte ${name}`);
    }
    assert.ok(pl.intro[lang].length <= 400, `tjeckien: inledningen (${lang}) är längre än cirka 400 tecken`);
  }
  // Kungariket Polen, Spanska imperiet, Preussen och Nazityskland står inte som rader (kartavvikelser och protektoratet)
  assert.ok(!pl.periods.some(p => ['kungariket-polen', 'spanska-imperiet', 'preussen', 'nazityskland'].includes(p.empire)));
  const span = id => pl.periods.filter(p => p.empire === id).map(p => [p.from, p.to]);
  assert.deepEqual(span('tysk-romerska-riket'), [[1010, 1806]]);
  assert.deepEqual(span('habsburgska-riket'), [[1556, 1618], [1622, 1743], [1748, 1805]]);
  assert.deepEqual(span('tjeckoslovakien'), [[1919, 1938], [1945, 1991]]);
  assert.deepEqual(span('tjeckien'), [[1992, 2024]]);
});

test('Slovakiens luckor och kartavvikelser är de som kortets kartanteckningar nämner (#1825): rikena följer Bratislava', () => {
  const pl = places.find(p => p.id === 'slovakien');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]), [[1450, 1458], [1547, 1555], [1806, 1867], [1939, 1944]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, Stora Mähren, kartans Östgoter och Frankerrike, Kungariket Ungern med kartans Polen och Tysk-romerska riket,
    // Pressburg som huvudstad och kröningsstad, kartans Osmanska och Spanska imperiet, Habsburgska riket, Österrike-Ungern,
    // Tjeckoslovakien, Wienskiljedomen, Slovakiska staten, upplösningen och avvikelserna i öst och mitt
    for (const years of ['1450–1458', '1547–1555', '1806–1867', '1939–1944', '833–907', '540–545', '793–824', '1000–1449', '1459–1546',
      '1003–1017', '1305–1313', '1536–1783', '1830', '1529–1533', '1540–1555', '1556–1805', '1804', '1868–1918', '1919–1938', '1938',
      '1939–1945', '1945–1991', '1992', '1993', '1919', '1683–1686', '1945']) {
      assert.ok(introAll(pl, lang).includes(years), `slovakien: kartanteckningarna (${lang}) nämner inte ${years}`);
    }
    const pressburg = { es: 'Presburgo', fr: 'Presbourg' }[lang] ?? 'Pressburg';
    for (const name of [pressburg, 'Košice', 'Prešov', 'Nitra', 'Banská Bystrica', 'Petržalka', 'Devín']) {
      assert.ok(introAll(pl, lang).includes(name), `slovakien: kartanteckningarna (${lang}) nämner inte ${name}`);
    }
    assert.ok(pl.intro[lang].length <= 400, `slovakien: inledningen (${lang}) är längre än cirka 400 tecken`);
  }
  // Kartans Kungariket Polen, Tysk-romerska riket, Osmanska riket, Spanska imperiet, Nazityskland och Ungern står inte som rader
  assert.ok(!pl.periods.some(p => ['kungariket-polen', 'tysk-romerska-riket', 'osmanska-riket', 'spanska-imperiet', 'nazityskland', 'ungern'].includes(p.empire)));
  const span = id => pl.periods.filter(p => p.empire === id).map(p => [p.from, p.to]);
  assert.deepEqual(span('kungariket-ungern'), [[1000, 1449], [1459, 1546]]);
  assert.deepEqual(span('habsburgska-riket'), [[1556, 1805]]);
  assert.deepEqual(span('tjeckoslovakien'), [[1919, 1938], [1945, 1991]]);
  assert.deepEqual(span('slovakien'), [[1992, 2024]]);
  // Devín ligger 0,9 km utanför Natural Earths gräns (i Österrikes polygon), men källan placerar borgen i Bratislava
  assert.deepEqual(pl.includeEvents, ['devin-i-stora-mahren']);
});

test('Ungerns luckor och kartavvikelser är de som kortets kartanteckningar nämner (#1826): rikena följer Budapest', () => {
  const pl = places.find(p => p.id === 'ungern');
  const rows = placeEmpireRows(pl, groups);
  assert.deepEqual(rows.filter(r => r.kind === 'gap').map(r => [r.from, r.to]), [[451, 499], [546, 792], [900, 999], [1450, 1458], [1806, 1867], [1944, 1944]]);
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    // Luckorna, Romarriket, Hunnerriket, Östgoterna, Frankerriket, magyarernas ankomst, Kungariket Ungern med kartans Tysk-romerska riket,
    // Mohács och Buda, Osmanska riket, Habsburgska riket, Kejsardömet Österrike, Österrike-Ungern, Trianon, Wienskiljedomarna,
    // ockupationen och kapitulationen, folkrepubliken och avvikelserna i Szeged, Győr, Esztergom och Debrecen
    for (const years of ['451–499', '546–792', '900–999', '1450–1458', '1806–1867', '1944', '43–394', '395–450', '370–469', '500–545', '793–899',
      '862–895', '1000–1449', '1459–1546', '1305–1313', '1526', '1541', '1547–1686', '1687–1805', '1804', '1868–1918', '1919', '1920', '1938',
      '1940', '1947', '1945', '1949', '1989', '806–899', '1552–1695', '1540–1555', '1547–1608', '1673–1686', '1547–1594', '1619–1695']) {
      assert.ok(introAll(pl, lang).includes(years), `ungern: kartanteckningarna (${lang}) nämner inte ${years}`);
    }
    const trianon = lang === 'es' ? 'Trianón' : 'Trianon';
    for (const name of ['Aquincum', 'Mohács', 'Buda', trianon, 'Szeged', 'Győr', 'Esztergom', 'Debrecen']) {
      assert.ok(introAll(pl, lang).includes(name), `ungern: kartanteckningarna (${lang}) nämner inte ${name}`);
    }
    assert.ok(pl.intro[lang].length <= 400, `ungern: inledningen (${lang}) är längre än cirka 400 tecken`);
  }
  // Kartans Tysk-romerska riket, Nazityskland, Första bulgariska riket och Spanska imperiet står inte som rader
  assert.ok(!pl.periods.some(p => ['tysk-romerska-riket', 'nazityskland', 'forsta-bulgariska-riket', 'spanska-imperiet'].includes(p.empire)));
  const span = id => pl.periods.filter(p => p.empire === id).map(p => [p.from, p.to]);
  assert.deepEqual(span('romarriket'), [[43, 394], [395, 450]]);
  assert.deepEqual(span('kungariket-ungern'), [[1000, 1449], [1459, 1546]]);
  assert.deepEqual(span('osmanska-riket'), [[1547, 1686]]);
  assert.deepEqual(span('habsburgska-riket'), [[1687, 1805]]);
  assert.deepEqual(span('ungern'), [[1919, 1943], [1945, 2024]]);
  // Paneuropeiska picknicken ligger 1,3 km utanför Natural Earths gräns (i Österrikes polygon), men källan placerar den vid gränsen nära Sopron i Ungern
  assert.deepEqual(pl.includeEvents, ['paneuropeiska-picknicken']);
});

test('kortet visar rikena som knappar med hela namnet, luckan som en rad och i en tur bara text', () => {
  globalThis.matchMedia ??= () => ({ matches: false });
  const html = [];
  const el = { addEventListener() {}, focus() {} };
  const make = () => ({ detail: { set innerHTML(v) { html.push(v); }, querySelector: () => el, querySelectorAll: () => [] }, styles: json('data/styles.json'),
    srcById: {}, setDetailOpen() {}, onSelect() {} });
  const rows = [{ years: '1612–1721', name: { sv: 'Svenska stormaktsväldet' }, label: ui('place.followEmpire', { name: 'Svenska stormaktsväldet', years: '1612–1721' }), run: () => {} },
    { gap: ui('place.empireGap', { years: '1018–1055' }) },
    { years: '1402–1501', name: { sv: 'Kalmarunionen' }, label: 'x', mapNote: { sv: 'Källorna anger y.' }, run: () => {} }];
  const opts = { label: 'Plats', name: { sv: 'Sverige' }, intro: { sv: 'x' }, summary: 's', events: [{ start: 1700, _lat: 60, _lon: 15 }],
    empires: { title: ui('place.empires', { count: 1 }), note: ui('place.empiresNote'), follow: ui('place.followEmpireShort'), rows } };
  Panel.prototype.showSelection.call(make(), opts);
  const out = html.at(-1);
  // Namnet har samma ordning som den synliga texten (år, namn, Följ riket; WCAG 2.5.3)
  assert.match(out, /<button type="button" class="theme-event" data-place-empire="0" aria-label="1612–1721 Svenska stormaktsväldet, Följ riket">/);
  assert.match(out, /<li class="place-empire-gap">1018–1055: kartan visar inget av rikena i listan här\.<\/li>/);
  assert.match(out, /Riken på kartan \(1\)/);
  // Rikets rad Om kartan står under knappen och beskriver den
  assert.match(out, /aria-describedby="place-empire-note-2"><span[^]*?<\/button><p class="place-empire-note" id="place-empire-note-2">Källorna anger y\.<\/p><\/li>/);
  // Förklaringen står efter listan, så att raderna syns först
  assert.ok(out.indexOf('place-empires-note') > out.indexOf('class="theme-events place-empires"'), 'förklaringen står före listan');
  // I en tur (ingen run) är raden text: ingen knapp som kan avsluta turen
  Panel.prototype.showSelection.call(make(), { ...opts, empires: { ...opts.empires, rows: [{ ...rows[0], run: null }] } });
  assert.ok(!html.at(-1).includes('data-place-empire'), 'en rad utan run får ingen knapp');
  // Utan perioder: ingen lista alls
  Panel.prototype.showSelection.call(make(), { ...opts, empires: null });
  assert.ok(!html.at(-1).includes('place-empire'), 'ett kort utan perioder har ingen rikeslista');
});

test('de nya texterna finns på alla fem språken med samma platshållare', () => {
  const sv = json('data/ui/sv.json');
  const holders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  for (const key of ['place.empires', 'place.empiresNote', 'place.followEmpire', 'place.followEmpireShort', 'place.empireGap', 'place.followLeaves', 'focus.movedPeriod', 'focus.chosenPeriod']) {
    for (const lang of LANGS) {
      const file = json(`data/ui/${lang}.json`);
      assert.ok(file[key], `${key} saknas på ${lang}`);
      assert.equal(holders(file[key]), holders(sv[key]), `${key} på ${lang} har andra platshållare än svenskan`);
    }
  }
});

test('franska har hårt mellanrum före kolon i de nya texterna', () => {
  const fr = json('data/ui/fr.json');
  for (const key of ['place.empireGap', 'focus.chosenPeriod']) assert.ok(!/ :/.test(fr[key]) && /\u00a0:/.test(fr[key]), `${key}: ${fr[key]}`);
});

// Landkortet (#1260): fast rad, tillståndsrad och märkning av perioder.
const sverige = places.find(p => p.id === 'sverige'), aotearoa = places.find(p => p.id === 'aotearoa'), skane = places.find(p => p.id === 'skane');
const firstFrom = Math.min(...sverige.periods.map(p => p.from));

test('den fasta raden finns bara på ett land, och säger bara något om rikena när kortet har några', () => {
  assert.equal(placeTodayLine(sverige, true), 'Det här är dagens Sverige. Rikena visar var området hörde hemma då.');
  assert.equal(placeTodayLine(aotearoa, false), 'Det här är dagens Nya Zeeland (Aotearoa).', 'utan riken pekar raden inte på en lista som saknas');
  assert.equal(placeTodayLine(skane, false), '', 'ett landskap har ingen rad om dagens land');
  assert.equal(placeTodayLine(places.find(p => p.id === 'gronland'), false), '');
});

test('tillståndsraden: före första rikesperioden och för år utan händelser, annars tom', () => {
  assert.equal(placeStateLine(sverige, firstFrom - 1, null, groups), 'Landet fanns inte i dagens form det här året.');
  assert.equal(placeStateLine(sverige, firstFrom, null, groups), '', 'första periodens år är inte före landets form');
  assert.equal(placeStateLine(sverige, 1700, null, groups), '');
  // Utan händelser står den färdiga texten från render.js efter (med nästa händelse), också tillsammans med det första fallet
  assert.equal(placeStateLine(sverige, 1700, 'Inga händelser på platsen det här året.', groups), 'Inga händelser på platsen det här året.');
  assert.equal(placeStateLine(sverige, firstFrom - 1, 'Inga händelser på platsen det här året.', groups), 'Landet fanns inte i dagens form det här året. Inga händelser på platsen det här året.');
  // Ett land utan perioder (Aotearoa) och ett landskap påstår aldrig att landet saknades: ingen uppgift om när landet fick sin form
  assert.equal(placeStateLine(aotearoa, -1000, null, groups), '');
  assert.equal(placeStateLine({ ...skane, periods: sverige.periods }, firstFrom - 1, null, groups), '', 'bara typen land');
});

test('en period med status visar märkningen som text, i knappens namn och i samma ordning', () => {
  const g = groups.find(x => x.id === sverige.periods[0].empire), pol = sverige.periods[0].polity;
  const rows = placeEmpireRows({ periods: [{ ...sverige.periods[0], status: 'tolkat' }, { ...sverige.periods[0], from: sverige.periods[0].from + 1, status: undefined }] }, [g]);
  assert.equal(rows[0].status, 'tolkat');
  assert.equal(rows[1].status, null, 'utan status är raden som förut');
  globalThis.matchMedia ??= () => ({ matches: false });
  const html = [];
  const el = { addEventListener() {}, focus() {} };
  const panel = { detail: { set innerHTML(v) { html.push(v); }, querySelector: () => el, querySelectorAll: () => [] }, styles: json('data/styles.json'), srcById: {}, setDetailOpen() {}, onSelect() {} };
  const row = { years: '1–2', name: { sv: 'Riket' }, status: ui('place.status.tolkat'), label: 'x', run: () => {} };
  Panel.prototype.showSelection.call(panel, { label: 'Plats', name: { sv: 'Sverige' }, intro: { sv: 'x' }, summary: 's', events: [], aboutLabel: 'Om', today: 'Det här är dagens Sverige.', state: 'Landet fanns inte i dagens form det här året.',
    empires: { title: 't', note: 'n', follow: 'Följ riket', rows: [row] } });
  const out = html.at(-1);
  assert.match(out, /<span class="place-empire-status">\(tolkat\)<\/span>/);
  assert.match(out, /<p class="place-today">Det här är dagens Sverige\.<\/p>/);
  assert.match(out, /<p class="place-state" data-place-state>Landet fanns inte i dagens form det här året\.<\/p>/);
  assert.match(out, /<h3 tabindex="-1">Sverige<\/h3>/, 'rubriken kan ta fokus');
  assert.ok(out.indexOf('place-today') < out.indexOf('<details'), 'raden står före listorna, på första skärmen');
  // Tom tillståndsrad är dold men finns kvar, så att den kan fyllas när året byts
  Panel.prototype.showSelection.call(panel, { label: 'Plats', name: { sv: 'Sverige' }, intro: { sv: 'x' }, summary: 's', events: [], aboutLabel: 'Om' });
  assert.match(html.at(-1), /<p class="place-state" data-place-state hidden><\/p>/);
  assert.ok(!html.at(-1).includes('place-today'));
});

test('fokus går till rubriken i platskortet och till Stäng i övriga kort', () => {
  globalThis.matchMedia ??= () => ({ matches: false });
  const focused = [];
  const make = tag => ({ addEventListener() {}, focus() { focused.push(tag); } });
  const els = { 'h3': make('h3'), '[data-close]': make('close') };
  const panel = { detail: { set innerHTML(v) {}, querySelector: sel => els[sel] ?? make(sel), querySelectorAll: () => [] }, styles: json('data/styles.json'), srcById: {}, setDetailOpen() {}, onSelect() {} };
  const base = { label: 'Plats', name: { sv: 'Sverige' }, intro: { sv: 'x' }, summary: 's', events: [] };
  Panel.prototype.showSelection.call(panel, { ...base, aboutLabel: 'Om' });
  Panel.prototype.showSelection.call(panel, base);
  Panel.prototype.showSelection.call(panel, { ...base, aboutLabel: 'Om', focus: false });
  assert.deepEqual(focused, ['h3', 'close']);
});

test('de nya texterna för landkortet finns på alla fem språken med samma platshållare', () => {
  const sv = json('data/ui/sv.json');
  const holders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  for (const key of ['place.today', 'place.todayEmpires', 'place.stateBefore', 'place.status.belagt', 'place.status.tolkat']) {
    for (const lang of LANGS) {
      const file = json(`data/ui/${lang}.json`);
      assert.ok(file[key], `${key} saknas på ${lang}`);
      assert.equal(holders(file[key]), holders(sv[key]), `${key} på ${lang} har andra platshållare än svenskan`);
    }
  }
});

test('landkortets inledning är kort och rikesstyckena ligger i introNotes (#2353)', () => {
  for (const pl of places) {
    for (const lang of LANGS) {
      assert.ok(pl.intro[lang].length <= 400, `${pl.id}: inledningen (${lang}) är ${pl.intro[lang].length} tecken, högst 400`);
      if (pl.introNotes) assert.ok(pl.introNotes[lang]?.trim(), `${pl.id}: introNotes saknar ${lang}`);
    }
    if (pl.introNotes) assert.deepEqual(Object.keys(pl.introNotes).sort(), [...LANGS].sort(), `${pl.id}: introNotes ska ha alla fem språk`);
  }
  assert.ok(places.filter(p => p.introNotes).length >= 15, 'länderna med anteckningar har fått introNotes');
});

test('platskortet visar introNotes först i den hopfällda raden Om kartan och källor, inte i inledningen (#2353)', () => {
  const html = [];
  const detail = { set innerHTML(v) { html.push(v); }, get innerHTML() { return html.at(-1) ?? ''; }, className: '', scrollTop: 0,
    querySelector: () => ({ addEventListener() {}, focus() {} }), querySelectorAll: () => [] };
  const fake = Object.create(Panel.prototype);
  Object.assign(fake, { detail, srcById: {}, setDetailOpen() {} });
  const lux = places.find(p => p.id === 'luxemburg');
  fake.showSelection({ label: 'Plats', name: lux.name, intro: lux.intro, introNotes: lux.introNotes, notes: ['Dagens gräns.'], exit: 'Sluta', summary: 'Händelser', events: [], aboutLabel: 'Om kartan och källor', focus: false });
  const card = html.at(-1);
  const about = card.slice(card.indexOf('place-about'));
  assert.ok(about.includes('place-intro-notes'), 'anteckningarna ligger i Om kartan och källor');
  assert.ok(about.indexOf('place-intro-notes') < about.indexOf('Dagens gräns.'), 'anteckningarna står före kartanteckningen');
  assert.ok(!card.slice(0, card.indexOf('place-about')).includes('Romarna'), 'rikesstycket står inte i inledningen');
  assert.ok(card.includes('Loschbourmannen'), 'inledningen finns kvar');
});
