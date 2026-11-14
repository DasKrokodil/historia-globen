// Prov för hjälpfunktionen som räknar bort avbrutna hämtningar i webbläsartestet (#1393). Ingen webbläsare: sidan är ett
// objekt som bara har on(), goto() och reload(). Proven visar både det som ska räknas bort och det som fortfarande ska fälla
// en kontroll (404, fel utanför ett sidbyte, fel från en annan webbplats, fel utan avbruten begäran).
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { skapaAbortWatch, urlKey, WEBKIT_ABORT } from './avbrutna-hamtningar.mjs';

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
  assert.match(kvar[0], /ingen avbruten begäran för adressen/);
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
