// Förhistorien efter expertgranskningen (#2137, rest av #1704): lägsta åldrar i texten, Ranis som spann ur källan,
// linjerna för de tidiga utvandringarna som exempel och istidskustens äldsta skiva vid modellens äldsta steg.
// Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const events = Object.fromEntries(read('data/handelser/fkr.json').events.map(e => [e.id, e]));
const BP = bp => 1950 - bp; // kalibrerade år före 1950 (cal BP) till astronomiskt år

test('lägsta åldrar: texten säger "minst" (eller "över", "eller äldre") på alla fem språk', () => {
  const minst = {
    sv: /minst|över \d|mer än \d|eller äldre/, en: /at least|more than \d|or older/, de: /mindestens|über \d|mehr als \d|oder älter/,
    es: /al menos|como mínimo|más de \d|o más/, fr: /au moins|plus de \d|ou plus/,
  };
  for (const id of ['florisbad', 'apidima', 'omo-kibish', 'leang-karampuang', 'gabarnmung']) {
    const e = events[id];
    assert.ok(e, `${id} finns`);
    for (const l of LANGS) {
      const text = `${e.summary[l]} ${e.note?.text?.[l] ?? ''}`.replace(/ /g, ' ');
      assert.match(text, minst[l], `${id} (${l}) säger att åldern är en lägsta ålder`);
    }
  }
});

test('Ranis och Zlatý kůň: spannet 49 540–42 200 cal BP (Sümer m.fl. 2025) räknat från 1950', () => {
  const e = events['ranis-zlaty-kun'];
  assert.equal(e.start, BP(49540));
  assert.equal(e.end, BP(42200));
  assert.equal(e.edtf, `Y${BP(49540)}~/Y${BP(42200)}~`);
  assert.ok(e.sources.includes('sumer-2025-ranis-genomes'));
  const tal = { sv: /49 540.42 200/, en: /49,540.42,200/, de: /49\.540.42\.200/, es: /49 540( y |.)42 200/, fr: /49 540 à 42 200/ };
  for (const l of LANGS) {
    assert.match(e.summary[l].replace(/ /g, ' '), tal[l], `sammanfattningen (${l}) har källans spann`);
    assert.match(e.note.text[l].replace(/ /g, ' '), tal[l], `noten (${l}) har källans spann`);
    assert.match(e.note.text[l], /1950/, `noten (${l}) säger att kol-14-åldrar räknas från 1950`);
  }
});

test('tidiga utvandringar: texten säger att linjerna bara är exempel, och noten har källan för den södra vägen', () => {
  const item = read('data/spridning.json').items.find(x => x.id === 'tidiga-utvandringar');
  const exempel = { sv: /bara exempel/, en: /only examples/, de: /nur Beispiele/, es: /solo ejemplos/, fr: /que des exemples/ };
  for (const l of LANGS) {
    assert.match(item.summary[l], exempel[l], `sammanfattningen (${l})`);
    assert.match(item.note[l], /Bab/, `noten (${l}) nämner den södra vägen`);
  }
  assert.ok(item.sources.includes('beyer-2021-climatic-windows'), 'klimatmodellen står bland källorna');
});

test('istidens kust: den äldsta skivan börjar vid PaleoMIST:s äldsta steg, 80 000 år före 1950', () => {
  const row = read('data/bildlager.json').layers.find(r => r.id === 'istidens-kust');
  const oldest = row.slices.reduce((a, b) => (b.from < a.from ? b : a));
  assert.equal(oldest.id, 'istidens-kust-80ka');
  assert.equal(oldest.from, BP(80000), 'ingen modellerad kust före modellens äldsta steg');
});
