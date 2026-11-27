// Språkfilerna (#63): varje nyckel som sidan använder finns i språkens filer.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const json = p => JSON.parse(read(p));
const meta = json('data/ui/sprak.json');
const sv = json('data/ui/sv.json');
const html = read('index.html');
const htmlKeys = new Set([...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(m => m[1]));

// Svenskan i index.html används direkt (applyStatic byter bara andra språk). Därför måste varje data-i18n-text
// börja som exakt samma text som sv.json, annars kan svenska besökare se ett gammalt knappnamn (#1708).
function staticTexts(source) {
  const found = new Map(), stack = [], voids = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  for (const token of source.match(/<[^>]+>|[^<]+/g) ?? []) {
    if (token.startsWith('</')) {
      const current = stack.pop();
      if (current?.key) found.set(current.key, current.text.replace(/\s+/g, ' ').trim());
    } else if (token.startsWith('<')) {
      if (/^<!|^<\?/.test(token)) continue;
      if (/^<\//.test(token)) continue;
      const key = /\sdata-i18n="([^"]+)"/.exec(token)?.[1] ?? null;
      const node = { key, text: '' };
      if (!voids.has(/^<\s*([\w-]+)/.exec(token)?.[1]?.toLowerCase()) && !/\/>$/.test(token)) stack.push(node);
    } else {
      for (const node of stack) node.text += token;
    }
  }
  return found;
}

test('sprak.json har svenska som grundspråk och unika språk', () => {
  assert.equal(meta.default, 'sv');
  const ids = meta.languages.map(l => l.id);
  assert.deepEqual(ids, [...new Set(ids)]);
  assert.ok(ids.includes('sv'));
  for (const l of meta.languages) {
    assert.ok(l.name, `${l.id} saknar name`);
    if (l.auto) assert.ok(l.complete, `${l.id} väljs automatiskt men är inte färdigt`);
    if (l.id !== 'sv') assert.ok(['unreviewed', 'reviewed'].includes(l.review), `${l.id} saknar review`);
  }
});

// Översätt samtidigt (beslut 2026-11-06, #669): varje språk ska ha varje nyckel, också ett ofärdigt språk (beta).
// En ny gränssnittstext läggs alltså i alla språkfiler i samma pull request, och en saknad nyckel stoppar den.
const ph = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
for (const l of meta.languages.filter(l => l.id !== 'sv')) {
  const dict = json(`data/ui/${l.id}.json`);
  test(`${l.id}.json har alla nycklar som JavaScript hämtar (sv.json) och samma {platshållare}`, () => {
    const missing = Object.keys(sv).filter(k => !k.startsWith('_') && !(k in dict));
    assert.deepEqual(missing, [], `${l.id}.json saknar ${missing.join(', ')} (översätt samtidigt, beslut 2026-11-06)`);
    for (const [k, v] of Object.entries(sv)) {
      if (k.startsWith('_')) continue;
      if (Array.isArray(v)) { assert.equal(dict[k].length, v.length, k); continue; }
      assert.deepEqual(ph(dict[k]), ph(v), `${l.id}.json ${k}: platshållarna skiljer sig`);
    }
  });
  test(`${l.id}.json har alla nycklar i index.html`, () => {
    const missing = [...htmlKeys].filter(k => !(k in dict));
    assert.deepEqual(missing, [], `${l.id}.json saknar ${missing.join(', ')} (översätt samtidigt, beslut 2026-11-06)`);
  });
  test(`${l.id}.json har samma {platshållare} som engelskan för texterna i index.html`, () => {
    const en = json('data/ui/en.json');
    for (const k of htmlKeys) if (k in en && typeof en[k] === 'string') assert.deepEqual(ph(dict[k]), ph(en[k]), `${l.id}.json ${k}`);
  });
}

test('nycklarna i index.html finns i något språk', () => {
  const all = new Set(meta.languages.flatMap(l => Object.keys(json(`data/ui/${l.id}.json`))));
  for (const k of htmlKeys) assert.ok(all.has(k), `${k} finns inte i någon språkfil`);
});

test('data-i18n i index.html har samma svenska standardtext som sv.json', () => {
  for (const [key, text] of staticTexts(html)) assert.equal(text, sv[key], `${key} i index.html`);
});

// #1303: svenska är grundspråket och reserven sist (ui() i js/i18n.js: valt språk, engelska, svenska). En nyckel som
// JavaScript hämtar med ui('…') men som saknas i sv.json gav därför engelska på svenska sidan: skärmläsaren hörde
// "About the event" (detail.label). Sidans fasta texter står i index.html och behöver ingen svensk nyckel; det är
// bara det JavaScript hämtar som måste finnas.
const jsFiles = readdirSync(new URL('../js/', import.meta.url), { recursive: true }).filter(f => f.endsWith('.js')).sort();
// Kommentarer räknas bort (en exempelrad som ui('nyckel') är ingen anrop); // efter ett kolon eller citattecken är en adress
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\w\\])\/\/.*$/gm, '$1');
// Används bara för andra språk än svenska, bakom hasUi(): svenskan är redan title och description i index.html
const ONLY_NON_SV = new Set(['meta.title', 'meta.description']);

// Nycklar som byggs (ui(`cat.${id}`)) går inte att kontrollera här: några står bakom hasUi() och har svenskan i
// koden (kategorierna i model.js), så en regel om dem ger falsklarm.
function uiLiterals() {
  const found = new Map();
  for (const f of jsFiles) {
    const src = stripComments(read(`js/${f}`));
    for (const m of src.matchAll(/\bui\(\s*(['"`])([^'"`$]+)\1/g)) found.set(m[2], [...(found.get(m[2]) ?? []), f]);
  }
  return found;
}

test('varje ui("nyckel") i js/ finns i sv.json (annars hör svenska besökare engelska)', () => {
  const literal = uiLiterals();
  assert.ok(literal.size > 300, `hittade bara ${literal.size} nycklar; har anropen ändrat form?`);
  const missing = [...literal].filter(([k]) => !(k in sv) && !ONLY_NON_SV.has(k)).map(([k, f]) => `${k} (${[...new Set(f)].join(', ')})`);
  assert.deepEqual(missing, [], `sv.json saknar ${missing.join('; ')}: lägg nyckeln i alla fem språkfilerna (översätt samtidigt)`);
});

test('panelen och globen använder samma tidsord, och romben heter som kortet på fem språk (#1306)', () => {
  for (const { id } of meta.languages) {
    const d = json(`data/ui/${id}.json`);
    for (const [panel, globe] of [['panel.earlier', 'time.beforeLabel'], ['panel.later', 'time.afterLabel']]) {
      assert.deepEqual(d[panel], d[globe].map(s => s.replace(' ({year})', '')), `${id}: ${panel}`);
    }
    assert.equal(d['ff.kind.funfact'], d['ff.title'], `${id}: kortets rubrik`);
    assert.equal(d['tlegend.funfact'], d['ff.title'], `${id}: teckenförklaringen`);
    assert.ok(d['layer.funfacts'].includes(d['ff.title']), `${id}: Lager`);
  }
});

// #1948: samma knapp oavsett kartväg, och samma vynamn i ruta, status och hjälp.
for (const lang of ['sv', 'en', 'de', 'es', 'fr']) test(`${lang}: platsens kartnamn är konsekventa (#1948)`, () => {
  const copy = json(`data/ui/${lang}.json`);
  assert.equal(copy['place.flatMap'], copy['place.regionMap'], 'kartvägen får inte byta knappens namn');
  const name = copy['regionView.title'].replace(/:\s*\{place\}$/, '').trim();
  for (const key of ['regionView.shown', 'regionView.shownGlobe']) assert.ok(copy[key].startsWith(name), `${key} säger samma vynamn som rutan`);
  for (const key of ['regionView.leave', 'regionView.left', 'regionView.leftGlobe', 'regionView.leftDiscovery', 'regionView.reset', 'help.s4t']) assert.ok(copy[key].toLocaleLowerCase().includes(name.toLocaleLowerCase()), `${key} säger samma vynamn som rutan`);
  assert.ok(copy['help.s4t'].includes(copy['place.flatMap']), 'hjälpen använder knappens synliga namn');
  if (lang === 'sv') {
    assert.equal(copy['place.flatMap'], 'Visa på kartan');
    assert.equal(name, 'Platsens karta');
  }
});

// #1956: listraden, platskortet och Platsens karta säger att det som visas är händelser inom dagens gräns och dagens kust och ortnamn.
for (const lang of ['sv', 'en', 'de', 'es', 'fr']) test(`${lang}: dagens gräns sägs i listraden, kortet och kartan (#1956)`, () => {
  const copy = json(`data/ui/${lang}.json`);
  assert.ok(copy['place.mapContext']?.trim(), 'kort kartrad saknas');
  assert.ok(copy['regionView.note'].startsWith(copy['place.mapContext']), 'kartans långa rad börjar med samma korta rad som kortet');
  const rows = copy['place.eventsWithin'];
  assert.ok(Array.isArray(rows) && rows.length === 2 && rows.every(r => r.includes('{count}')), 'listraden har en form för en och en för flera händelser, med antalet');
  assert.notEqual(rows[0], rows[1], 'entals- och flertalsformen skiljer sig');
});

// #2149: endast dessa nycklar får avsiktligt vara lika svenska, på angivna språk.
// Listan omfattar även gemensamma ord; att de råkar stavas lika är inget översättningsfel.
const identicalUiExceptions = {
  'review.line': ['en', 'de', 'es'], // Bara platshållare och skiljetecken.
  'top.style': ['de'], // Stil är också det tyska ordet.
  'top.quiz': ['en', 'de', 'es', 'fr'], // Quiz är samma etablerade lånord.
  'focus.activeFilter': ['en', 'de'], // Filter stavas lika på dessa språk.
  'theme.label': ['es'], // Tema är också det spanska ordet.
  'place.type.country': ['de'], // Land är också det tyska ordet.
  'place.typeOf': ['en', 'de', 'es', 'fr'], // Bara platshållare; prepositionen finns i datan.
  'regionView.markLabel': ['en', 'es', 'fr'], // Bara platshållare och skiljetecken.
  'time.groupSep': ['es', 'fr'], // Hårt mellanrum som tusentalsavgränsare.
  'time.ordSuffix': ['de', 'es', 'fr'], // Tomma ändelser; språken använder inte svenska ordningssuffix.
  'region.Europa': ['de', 'es'], // Världsdelsnamnet stavas lika.
  'region.Asien': ['de'], // Världsdelsnamnet stavas lika.
  'region.Afrika': ['de'], // Världsdelsnamnet stavas lika.
  'region.Amerika': ['de'], // Världsdelsnamnet stavas lika.
  'status.year': ['en', 'de', 'es'], // Bara platshållare och skiljetecken.
  'detail.imageCredit': ['de'], // Bild är också det tyska ordet.
  'detail.evidence.date': ['de'], // Datum är också det tyska ordet.
  'detail.evidence.text': ['en', 'de'], // Text stavas lika.
  'detail.evidence.image': ['de'], // Bild är också det tyska ordet.
  'facts.kind.religion': ['en', 'de', 'fr'], // Religion stavas lika.
  'ff.illustration': ['en', 'de', 'fr'], // Illustration stavas lika.
  'print.exit': ['en', 'es'], // Exit ticket är den etablerade pedagogiska termen här.
  'time.rateDays': ['en', 'de', 'es', 'fr'], // Platshållare och SI-symbolen s för sekunder.
  'time.dayShort': ['en', 'es'], // Samma förkortning d för dagar.
  'time.step': ['en', 'de', 'es', 'fr'], // Bara platshållare; orden översätts separat.
  'sources.group.images': ['de'], // Bilder är också det tyska pluralordet.
  'sources.kind.illustration.label': ['en', 'de', 'fr'], // Illustration stavas lika.
  'sources.image': ['de'], // Bild är också det tyska ordet.
  'sources.imageUse': ['de'], // Bild är också det tyska ordet; resten är en platshållare.
  'sources.funfact': ['en'], // Fun fact är ett engelskt lån i svenskan.
  'sources.prompt': ['en', 'de'], // Prompt är samma etablerade term.
  'poster.title': ['en', 'de', 'es', 'fr'], // Produktnamnet Historia-globen översätts inte.
  'poster.website': ['en', 'de', 'es', 'fr'], // Webbplatsens domän översätts inte.
  'poster.license': ['en'], // Data stavas lika; CC BY 4.0 är licensbeteckningen.
  'poster.filename': ['en', 'de', 'es', 'fr'], // Filnamnet använder produktnamnet.
  'sourceVersion.version': ['en', 'de', 'fr'], // Version stavas lika.
  'sourcesSummary.filter': ['en', 'de'], // Status stavas lika.
  'space.placeSaid': ['en', 'de', 'es'], // Bara platshållare och skiljetecken (#1527); franskan har mellanrum före kolon.
  'space.coord': ['en', 'de', 'es', 'fr'], // Bara platshållare och gradtecken (#1527).
  'space.north': ['en', 'de', 'es', 'fr'], // N för nord på alla fem språken (#1527).
  'space.south': ['en', 'de', 'es', 'fr'], // S för syd på alla fem språken (#1527).
};

const properNameExceptions = [
  'Skåne', // Originalstavningen får behållas när ortnamnet används.
  'Åland', // Originalstavningen får behållas när ortnamnet används.
];
const uiStrings = value => Array.isArray(value) ? value.flatMap(uiStrings) : [String(value)];
for (const lang of ['en', 'de', 'es', 'fr']) {
  const dict = json(`data/ui/${lang}.json`);
  test(`${lang}.json har inga oöversatta svenska UI-värden (#2149)`, () => {
    const identical = Object.entries(sv).filter(([key, value]) =>
      !key.startsWith('_') && JSON.stringify(dict[key]) === JSON.stringify(value)
      && !identicalUiExceptions[key]?.includes(lang)
    ).map(([key]) => key);
    assert.deepEqual(identical, [], `${lang}.json: identiska med sv.json: ${identical.join(', ')}`);
  });
  test(`${lang}.json har inga svenska tecken utanför tillåtna egennamn (#2149)`, () => {
    const forbidden = lang === 'de' ? /å/i : /[åäö]/i;
    const untranslated = Object.entries(dict).filter(([key, value]) => !key.startsWith('_')
      && uiStrings(value).some(text => {
        // Bara hela egennamn undantas, inte hela nyckelns värde eller delar av andra ord.
        for (const name of properNameExceptions) text = text.replaceAll(new RegExp(`(?<!\\p{L})${name}(?!\\p{L})`, 'gu'), '');
        return forbidden.test(text.normalize('NFC'));
      })
    ).map(([key]) => key);
    assert.deepEqual(untranslated, [], `${lang}.json: svenska tecken: ${untranslated.join(', ')}`);
  });
}
