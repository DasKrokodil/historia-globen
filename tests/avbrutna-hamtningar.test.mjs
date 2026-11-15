// Prov för hjälpfunktionen som räknar bort avbrutna hämtningar i webbläsartestet (#1393). Ingen webbläsare: sidan är ett
// objekt som bara har on(), goto() och reload(). Proven visar både det som ska räknas bort och det som fortfarande ska fälla
// en kontroll (404, fel utanför ett sidbyte, fel från en annan webbplats, fel utan avbruten begäran).
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { skapaAbortWatch, urlKey, WEBKIT_ABORT, ABORTED_FETCH, textifyConsoleErrors } from './avbrutna-hamtningar.mjs';

const HOST = 'localhost:8000';
// WebKits rad som Playwright ger den som sidfel: första kolonet delar namn och text, så "http:" försvinner och en snedstreck med det
const rad = (path, host = HOST) => `/${host}${path} due to access control checks.`;
const begaran = (path, errorText, host = HOST) => ({ url: () => `http://${host}${path}`, failure: () => (errorText == null ? null : { errorText }) });

function uppsattning() {
  const sidan = new EventEmitter();
  sidan.goto = async () => {};
  sidan.reload = async () => {};
  sidan.goBack = async () => {};
  sidan.goForward = async () => {};
  let filtrerade = 0;
  const registrerade = [];
  const abortWatch = skapaAbortWatch({ siteHost: HOST, filtered: n => { filtrerade += n; }, register: w => registrerade.push(w) });
  const aw = abortWatch(sidan);
  return { sidan, aw, filtrerade: () => filtrerade, registrerade };
}

test('urlKey ger samma nyckel för alla former av adressen', () => {
  const nyckel = 'localhost:8000/data/a.json';
  assert.equal(urlKey('http://localhost:8000/data/a.json').key, nyckel);
  assert.equal(urlKey('//localhost:8000/data/a.json').key, nyckel);
  assert.equal(urlKey('/localhost:8000/data/a.json').key, nyckel);
  assert.equal(urlKey('http://localhost:8000/data/a.json?v=2#x').key, nyckel);
  assert.equal(urlKey('http://localhost:8000').key, 'localhost:8000/');
  assert.equal(urlKey('/localhost:8000/data/a.json').host, HOST);
});

test('WEBKIT_ABORT känner igen WebKits rad i båda formerna och inget annat', () => {
  assert.equal('/localhost:8000/a.json due to access control checks.'.match(WEBKIT_ABORT)?.[1], '/localhost:8000/a.json');
  assert.equal('Fetch API cannot load http://localhost:8000/a.json due to access control checks.'.match(WEBKIT_ABORT)?.[1], 'http://localhost:8000/a.json');
  assert.equal('TypeError: Load failed'.match(WEBKIT_ABORT), null);
  assert.equal('/localhost:8000/a.json due to access control checks. Och mer text'.match(WEBKIT_ABORT), null);
});

test('räknas bort: sidfel under goto med samma adress som avbruten begäran', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  const fel = [];
  sidan.goto = async () => {
    // WebKit skriver sidfelet och begäran faller medan sidan byts
    for (const p of ['/data/genererat/handelser.json', '/data/funfacts.json']) {
      if (!aw.defer(rad(p))) fel.push(rad(p));
      sidan.emit('requestfailed', begaran(p, 'cancelled'));
    }
  };
  await aw.goto('http://localhost:8000/?ny=1');
  assert.deepEqual(fel, []);
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 2);
});

test('räknas bort: ordningen mellan sidfel och avbruten begäran spelar ingen roll', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.reload = async () => {
    sidan.emit('requestfailed', begaran('/data/land.json', 'net::ERR_ABORTED'));
    assert.equal(aw.defer(rad('/data/land.json')), true);
  };
  await aw.reload();
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 1);
});

test('räknas bort: goBack, goForward och nav (appens egen omladdning) är sidbyten', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  const avbrott = path => { aw.defer(rad(path)); sidan.emit('requestfailed', begaran(path, 'cancelled')); };
  sidan.goBack = async () => avbrott('/data/0.json');
  sidan.goForward = async () => avbrott('/data/1.json');
  await aw.goBack();
  await aw.goForward();
  await aw.nav(async () => avbrott('/data/2.json'));
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 3);
});

test('räknas bort: WebKit klassar avbrottet som åtkomstkontroll även för begäran, men bara för begärans egen adress', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.goto = async () => {
    aw.defer(rad('/data/a.json'));
    sidan.emit('requestfailed', begaran('/data/a.json', 'Fetch API cannot load http://localhost:8000/data/a.json due to access control checks.'));
  };
  await aw.goto('x');
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 1);
});

test('fäller: begärans text nämner en annan adress än sidfelets', async () => {
  const { sidan, aw } = uppsattning();
  sidan.goto = async () => {
    aw.defer(rad('/data/a.json'));
    sidan.emit('requestfailed', begaran('/data/a.json', rad('/data/b.json').replace(/^\//, 'http://')));
  };
  await aw.goto('x');
  const kvar = aw.settle();
  assert.equal(kvar.length, 1);
  assert.match(kvar[0], /ingen avbruten eller ofullbordad begäran för adressen/);
});

test('fäller: fel utanför ett sidbyte', async () => {
  const { sidan, aw } = uppsattning();
  assert.equal(aw.defer(rad('/data/a.json')), false); // ingen goto pågår: kontrollen ska själv räkna felet
  sidan.emit('requestfailed', begaran('/data/a.json', 'cancelled'));
  assert.deepEqual(aw.settle(), []); // inget väntade, och ingenting räknades bort
});

test('fäller: fel efter att sidbytet är klart', async () => {
  const { aw } = uppsattning();
  await aw.goto('x');
  assert.equal(aw.defer(rad('/data/a.json')), false);
});

test('fäller: fel från en annan webbplats under sidbyte', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  const fel = [];
  sidan.goto = async () => {
    const m = rad('/data/a.json', 'annan.example');
    if (!aw.defer(m)) fel.push(m);
    sidan.emit('requestfailed', begaran('/data/a.json', 'cancelled', 'annan.example'));
  };
  await aw.goto('x');
  assert.equal(fel.length, 1);
  assert.equal(filtrerade(), 0);
});

test('fäller: ett 404 och andra fel under sidbyte som inte är WebKits rad', async () => {
  const { sidan, aw } = uppsattning();
  const fel = [];
  sidan.goto = async () => {
    for (const m of ['TypeError: Load failed', 'Unexpected token < in JSON at position 0', 'Failed to load resource: the server responded with a status of 404 (File not found)']) {
      if (!aw.defer(m)) fel.push(m);
    }
    sidan.emit('requestfailed', begaran('/data/a.json', 'cancelled'));
  };
  await aw.goto('x');
  assert.equal(fel.length, 3);
  assert.deepEqual(aw.settle(), []);
});

test('fäller: sidfel under sidbyte utan någon avbruten begäran, och texten säger vad som syntes', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.goto = async () => {
    aw.defer(rad('/data/a.json'));
    sidan.emit('requestfailed', begaran('/data/a.json', 'net::ERR_CONNECTION_REFUSED')); // inget avbrott: ett riktigt nätfel
  };
  await aw.goto('x');
  const kvar = aw.settle();
  assert.equal(kvar.length, 1);
  assert.match(kvar[0], /due to access control checks/);
  assert.match(kvar[0], /misslyckade begäranden: net::ERR_CONNECTION_REFUSED/);
  assert.equal(filtrerade(), 0);
});

test('fäller: sidfel under sidbyte där ingen begäran alls misslyckades', async () => {
  const { sidan, aw } = uppsattning();
  sidan.goto = async () => { aw.defer(rad('/data/a.json')); };
  await aw.goto('x');
  const kvar = aw.settle();
  assert.equal(kvar.length, 1);
  assert.match(kvar[0], /misslyckade begäranden: inga/);
});

test('fäller: en avbruten begäran för en annan adress räknar inte bort sidfelet', async () => {
  const { sidan, aw } = uppsattning();
  sidan.goto = async () => {
    aw.defer(rad('/data/a.json'));
    sidan.emit('requestfailed', begaran('/data/b.json', 'cancelled'));
  };
  await aw.goto('x');
  assert.equal(aw.settle().length, 1);
});

test('en bevakning som kontrollen glömde att avgöra kan avgöras av den som kör kontrollen (register)', async () => {
  const { sidan, aw, registrerade } = uppsattning();
  assert.deepEqual(registrerade, [aw]);
  sidan.goto = async () => { aw.defer(rad('/data/a.json')); };
  await aw.goto('x');
  assert.equal(registrerade.flatMap(w => w.settle()).length, 1);
  assert.deepEqual(registrerade.flatMap(w => w.settle()), []); // avgjort en gång, inte två
});

// Steg 3 (DasKrokodil 2026-11-15): WebKit skickar ingen requestfailed när ett sidbyte avbryter en hämtning, men begäran syns (request)
// och blir aldrig klar. En sådan ofullbordad egen begäran uppfyller villkor 4; de andra villkoren gäller som förut.
test('räknas bort: WebKit, sidfel under sidbyte för en egen begäran som aldrig blev klar och inte fick requestfailed', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.emit('request', begaran('/data/a.json'));
  sidan.goto = async () => { assert.equal(aw.defer(rad('/data/a.json')), true); };
  await aw.goto('x');
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 1);
});

test('fäller: sidfel för en egen begäran som redan var klar när felet kom', async () => {
  const { sidan, aw } = uppsattning();
  const a = begaran('/data/a.json');
  sidan.emit('request', a);
  sidan.emit('requestfinished', a);
  sidan.goto = async () => { aw.defer(rad('/data/a.json')); };
  await aw.goto('x');
  const kvar = aw.settle();
  assert.equal(kvar.length, 1);
  assert.match(kvar[0], /ingen avbruten eller ofullbordad begäran/);
  // Spåret visar vad webbläsaren rapporterade för just den filen, och när sidfelet kom
  assert.match(kvar[0], /spår: request \+\d+ ms, requestfinished \+\d+ ms, sidfel \+\d+ ms under sidbyte 1\)/);
});

test('spåret säger när ingen request alls syntes för adressen', async () => {
  const { sidan, aw } = uppsattning();
  sidan.goto = async () => { aw.defer(rad('/data/a.json')); };
  await aw.goto('x');
  assert.match(aw.settle()[0], /spår: ingen request för adressen, sidfel \+\d+ ms under sidbyte 1\)/);
});

test('fäller: sidfel för en egen begäran som misslyckades på riktigt (nekad anslutning)', async () => {
  const { sidan, aw } = uppsattning();
  const a = begaran('/data/a.json', 'net::ERR_CONNECTION_REFUSED');
  sidan.emit('request', a);
  sidan.emit('requestfailed', a);
  sidan.goto = async () => { aw.defer(rad('/data/a.json')); };
  await aw.goto('x');
  assert.equal(aw.settle().length, 1);
});

test('fäller: en ofullbordad begäran för en annan adress, eller utanför sidbyte, räknar inte bort sidfelet', async () => {
  const { sidan, aw } = uppsattning();
  sidan.emit('request', begaran('/data/b.json'));
  sidan.goto = async () => { aw.defer(rad('/data/a.json')); };
  await aw.goto('x');
  assert.equal(aw.settle().length, 1);
  sidan.emit('request', begaran('/data/c.json'));
  assert.equal(aw.defer(rad('/data/c.json')), false); // utanför sidbyte: räknas som fel direkt
});

test('fäller: en ofullbordad begäran till en annan webbplats räknar inte bort sidfelet för den webbplatsen', async () => {
  const { sidan, aw } = uppsattning();
  sidan.emit('request', begaran('/x.json', undefined, 'annan.example'));
  sidan.goto = async () => { assert.equal(aw.defer(rad('/x.json', 'annan.example')), false); };
  await aw.goto('x');
  assert.deepEqual(aw.settle(), []);
});

// Konsolfel (#1561): Firefox skriver den avbrutna hämtningen som ett konsolfel utan adress när sidans egen .catch loggar den.
const FIREFOX = 'TypeError: NetworkError when attempting to fetch resource.';

test('ABORTED_FETCH känner igen exakt Firefox, WebKit och AbortError och inget som bara liknar dem', () => {
  assert.match(FIREFOX, ABORTED_FETCH);
  assert.match('TypeError: Load failed', ABORTED_FETCH);
  assert.match('AbortError: The operation was aborted.', ABORTED_FETCH);
  assert.doesNotMatch('TypeError: NetworkError when attempting to fetch resource. Och mer', ABORTED_FETCH);
  assert.doesNotMatch('Error: NetworkError when attempting to fetch resource.', ABORTED_FETCH);
  assert.doesNotMatch('TypeError: Failed to fetch', ABORTED_FETCH);
  assert.doesNotMatch('Unexpected token < in JSON at position 0', ABORTED_FETCH);
});

test('räknas bort: Firefox konsolfel under goto när en begäran till den egna webbplatsen avbröts (#1561)', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  const fel = [];
  sidan.goto = async () => {
    sidan.emit('requestfailed', begaran('/data/empires/frankerriket.json', 'NS_BINDING_ABORTED'));
    if (!aw.deferConsole(FIREFOX)) fel.push(FIREFOX);
    if (!aw.deferConsole(FIREFOX)) fel.push(FIREFOX); // flera hämtningar avbryts i samma sidbyte
  };
  await aw.goto('http://localhost:8000/?ny=1');
  assert.deepEqual(fel, []);
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 2);
});

test('räknas bort: ordningen mellan konsolfel och avbruten begäran spelar ingen roll, och goBack räknas som sidbyte', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.goBack = async () => {
    assert.equal(aw.deferConsole(FIREFOX), true);
    sidan.emit('requestfailed', begaran('/data/land.json', 'NS_ERROR_ABORT'));
  };
  await aw.goBack();
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 1);
});

test('fäller: samma text utan sidbyte (ett riktigt fel i sidan eller nätet)', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.emit('requestfailed', begaran('/data/a.json', 'NS_BINDING_ABORTED'));
  assert.equal(aw.deferConsole(FIREFOX), false); // ingen goto pågår: kontrollen ska själv räkna felet
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 0);
});

test('fäller: samma text efter att sidbytet är klart', async () => {
  const { aw } = uppsattning();
  await aw.goto('x');
  assert.equal(aw.deferConsole(FIREFOX), false);
});

test('fäller: andra konsolfel under sidbyte, även med avbruten begäran', async () => {
  const { sidan, aw } = uppsattning();
  const fel = [];
  sidan.goto = async () => {
    sidan.emit('requestfailed', begaran('/data/a.json', 'NS_BINDING_ABORTED'));
    for (const m of ['TypeError: Failed to fetch', 'SyntaxError: JSON.parse: unexpected character', 'TypeError: x is undefined', 'Failed to load resource: the server responded with a status of 404 (File not found)']) {
      if (!aw.deferConsole(m)) fel.push(m);
    }
  };
  await aw.goto('x');
  assert.equal(fel.length, 4);
  assert.deepEqual(aw.settle(), []);
});

test('fäller: texten under sidbyte utan någon avbruten begäran, och texten säger vad som syntes', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.goto = async () => {
    assert.equal(aw.deferConsole(FIREFOX), true);
    sidan.emit('requestfailed', begaran('/data/a.json', 'NS_ERROR_CONNECTION_REFUSED')); // ett riktigt nätfel, inget avbrott
  };
  await aw.goto('x');
  const kvar = aw.settle();
  assert.equal(kvar.length, 1);
  assert.match(kvar[0], /NetworkError when attempting to fetch resource/);
  assert.match(kvar[0], /localhost:8000\/data\/a\.json: NS_ERROR_CONNECTION_REFUSED/);
  assert.equal(filtrerade(), 0);
});

test('fäller: texten under sidbyte där bara en annan webbplats avbröts', async () => {
  const { sidan, aw } = uppsattning();
  sidan.goto = async () => {
    aw.deferConsole(FIREFOX);
    sidan.emit('requestfailed', begaran('/x.json', 'NS_BINDING_ABORTED', 'annan.example'));
  };
  await aw.goto('x');
  assert.equal(aw.settle().length, 1);
});

test('fäller: texten under ett sidbyte när avbrottet hörde till ett tidigare sidbyte', async () => {
  const { sidan, aw } = uppsattning();
  sidan.goto = async () => { sidan.emit('requestfailed', begaran('/data/a.json', 'NS_BINDING_ABORTED')); };
  await aw.goto('första');
  sidan.goto = async () => { aw.deferConsole(FIREFOX); }; // det andra sidbytet avbröt ingenting
  await aw.goto('andra');
  assert.equal(aw.settle().length, 1);
});

test('en konsolrad som kontrollen glömde att avgöra kan avgöras av den som kör kontrollen (register)', async () => {
  const { sidan, aw, registrerade } = uppsattning();
  sidan.goto = async () => { aw.deferConsole(FIREFOX); };
  await aw.goto('x');
  assert.equal(registrerade.flatMap(w => w.settle()).length, 1);
  assert.deepEqual(registrerade.flatMap(w => w.settle()), []);
});

// Tidslinjen (#1561): ändrar inte vad som fäller, bara vad felraden säger.
const svar = (path, status) => ({ ...begaran(path), response: async () => ({ status: () => status }) });
const tick = () => new Promise(r => setImmediate(r));

test('tidslinjen: ett konsolfel utanför sidbyte fäller som förut och får tidslinjen på samma rad', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.url = () => 'http://localhost:8000/?ny=pbesked2#y=1000';
  await aw.goto('http://localhost:8000/?ny=pbesked1#y=1000&f=place:finns-inte');
  sidan.emit('requestfailed', begaran('/data/empires/x.json', 'NS_BINDING_ABORTED'));
  sidan.emit('requestfailed', begaran('/s.woff2', 'NS_ERROR_ABORT', 'fonts.gstatic.com')); // typsnitt tas inte med
  sidan.emit('requestfinished', svar('/data/platser.json', 404));
  await tick();
  assert.equal(aw.deferConsole(FIREFOX), false); // utanför sidbyte: räknas som fel, som förut
  const diag = aw.consoleDiag(FIREFOX);
  assert.match(diag, /^ \(tidslinje, tid sedan kontrollens start: /);
  assert.match(diag, /sidbyte 1 börjar: goto \/\?ny=pbesked1#y=1000&f=place:finns-inte/);
  assert.match(diag, /sidbyte 1 slut/);
  assert.match(diag, /requestfailed: \/data\/empires\/x\.json \(NS_BINDING_ABORTED\)/);
  assert.match(diag, /svar 404: \/data\/platser\.json/);
  assert.match(diag, /UTANFÖR sidbyte/);
  assert.match(diag, /sidan \/\?ny=pbesked2/);
  assert.doesNotMatch(diag, /fonts\.gstatic/);
  assert.doesNotMatch(diag, /\n/); // en rad, eftersom failNote bara visar första raden
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 0);
});

test('tidslinjen: bara ABORTED_FETCH-raderna får en tidslinje, och något annat fäller eller räknas av som förut', async () => {
  const { aw } = uppsattning();
  assert.equal(aw.consoleDiag('TypeError: x is undefined'), '');
  assert.equal(aw.consoleDiag('/localhost:8000/a.json due to access control checks.'), '');
  assert.equal(aw.deferConsole('TypeError: x is undefined'), false);
});

test('tidslinjen: ofullbordade egna begäranden räknas, andra webbplatser och avslutade inte; filtret ändras inte av dem', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  const a = begaran('/data/a.json'), b = begaran('/data/b.json'), c = begaran('/x.json', undefined, 'annan.example');
  for (const r of [a, b, c]) sidan.emit('request', r);
  sidan.emit('requestfinished', a);
  sidan.goto = async () => { assert.equal(aw.deferConsole(FIREFOX), true); };
  await aw.goto('x');
  const diag = aw.consoleDiag(FIREFOX);
  assert.match(diag, /sidbyte 1 börjar: goto [^;]*; 1 ofullbordade egna begäranden \(\/data\/b\.json\)/);
  assert.match(diag, /under sidbyte 1/);
  // En ofullbordad begäran räknas INTE som avbruten (villkor 3 är oförändrat): konsolfelet fäller fortfarande
  const kvar = aw.settle();
  assert.equal(kvar.length, 1);
  assert.match(kvar[0], /ingen begäran till den egna webbplatsen avbröts/);
  assert.match(kvar[0], /tidslinje/);
  assert.equal(filtrerade(), 0);
});

test('tidslinjen: ett konsolfel som räknas bort får ingen tidslinje i felen', async () => {
  const { sidan, aw, filtrerade } = uppsattning();
  sidan.goto = async () => {
    sidan.emit('requestfailed', begaran('/data/a.json', 'NS_BINDING_ABORTED'));
    assert.equal(aw.deferConsole(FIREFOX), true);
  };
  await aw.goto('x');
  assert.deepEqual(aw.settle(), []);
  assert.equal(filtrerade(), 1);
});

test('tidslinjen: main-frame-navigering och load syns, och listan är begränsad', async () => {
  const { sidan, aw } = uppsattning();
  const huvud = { url: () => 'http://localhost:8000/?ny=1' };
  sidan.mainFrame = () => huvud;
  sidan.emit('framenavigated', huvud);
  sidan.emit('framenavigated', { url: () => 'http://localhost:8000/iframe' }); // en annan ram räknas inte
  sidan.emit('load');
  for (let i = 0; i < 200; i++) sidan.emit('requestfailed', begaran(`/data/${i}.json`, 'NS_BINDING_ABORTED'));
  aw.deferConsole(FIREFOX);
  const diag = aw.consoleDiag(FIREFOX);
  assert.doesNotMatch(diag, /\/iframe/);
  assert.ok(diag.split(' ; ').length <= 80);
  assert.match(diag, /data\/199\.json/);
  assert.doesNotMatch(diag, /data\/0\.json/);
});

// Initskriptet som gör Error-argument till text innan de når konsolen (#888, #1561): Firefox ger annars "JSHandle@object" i m.text().
const fakeKonsol = () => {
  const anrop = [];
  const k = {
    error(...a) { anrop.push({ nivå: 'error', denna: this, a }); },
    warn(...a) { anrop.push({ nivå: 'warn', denna: this, a }); },
  };
  return { k, anrop };
};

test('initskriptet: ett TypeError från en avbruten hämtning blir exakt Firefox-raden som ABORTED_FETCH känner igen', () => {
  const { k, anrop } = fakeKonsol();
  textifyConsoleErrors(k);
  k.error(new TypeError('NetworkError when attempting to fetch resource.'));
  assert.equal(anrop.length, 1);
  assert.deepEqual(anrop[0].a, ['TypeError: NetworkError when attempting to fetch resource.']);
  assert.equal(anrop[0].a[0], 'TypeError: NetworkError when attempting to fetch resource.');
  assert.ok(ABORTED_FETCH.test(anrop[0].a[0]));
  assert.equal(anrop[0].denna, k, 'originalanropet görs på konsolen själv');
});

test('initskriptet: DOMException och andra Error-typer görs om, och warn får samma behandling', () => {
  const { k, anrop } = fakeKonsol();
  textifyConsoleErrors(k);
  k.error(new DOMException('The operation was aborted.', 'AbortError'));
  k.warn(new RangeError('för stort'));
  assert.deepEqual(anrop.map(x => x.a), [['AbortError: The operation was aborted.'], ['RangeError: för stort']]);
  assert.ok(ABORTED_FETCH.test(anrop[0].a[0]));
});

test('initskriptet: andra argument lämnas orörda och i samma ordning, och originalet anropas alltid', () => {
  const { k, anrop } = fakeKonsol();
  textifyConsoleErrors(k);
  const obj = { fel: 1 }, lista = [1, 2], fn = () => {};
  k.error('text', 42, obj, lista, null, undefined, fn, new Error('x'));
  assert.equal(anrop.length, 1);
  const a = anrop[0].a;
  assert.equal(a[0], 'text');
  assert.equal(a[1], 42);
  assert.equal(a[2], obj, 'objektet är samma objekt, inte en kopia');
  assert.equal(a[3], lista);
  assert.equal(a[4], null);
  assert.equal(a[5], undefined);
  assert.equal(a[6], fn);
  assert.equal(a[7], 'Error: x');
  assert.equal(a.length, 8);
  k.error();
  assert.equal(anrop.length, 2);
  assert.deepEqual(anrop[1].a, []);
});

test('initskriptet: en vanlig sträng som liknar felet räknas inte om, och en Error-lik utan arv lämnas orörd', () => {
  const { k, anrop } = fakeKonsol();
  textifyConsoleErrors(k);
  const lik = { name: 'TypeError', message: 'Load failed' };
  k.error('TypeError: Load failed', lik);
  assert.equal(anrop[0].a[0], 'TypeError: Load failed');
  assert.equal(anrop[0].a[1], lik);
});

test('initskriptet är fristående: det fungerar efter att ha skickats som text, som Playwright gör', () => {
  const { k, anrop } = fakeKonsol();
  const fran = new Function(`return (${textifyConsoleErrors.toString()})`)();
  fran(k);
  k.error(new TypeError('NetworkError when attempting to fetch resource.'));
  assert.equal(anrop[0].a[0], 'TypeError: NetworkError when attempting to fetch resource.');
});

test('initskriptet utan argument omsluter den riktiga console i sidan', () => {
  const orig = { error: console.error, warn: console.warn };
  const sett = [];
  console.error = (...a) => sett.push(a);
  try {
    textifyConsoleErrors();
    console.error(new TypeError('Load failed'), 'extra');
    assert.deepEqual(sett, [['TypeError: Load failed', 'extra']]);
  } finally { console.error = orig.error; console.warn = orig.warn; }
});
