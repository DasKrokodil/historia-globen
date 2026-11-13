// Tidsfönstret i vardagsspråk (#994) och riktning i tid (#995): århundrade, "N år före (år)" och "N år senare".
// Körs på svenska (språket är fast vid import). Astronomiska år: 0 = 1 f.Kr., så avståndet räknas rakt av.
import test from 'node:test';
import assert from 'node:assert/strict';
import { centuryOf, formatCentury, formatDirection, formatOffset, pluralUi, roundWindow } from '../js/model.js';

test('århundradet följer svenskt bruk: 1300-talet är 1300–1399', () => {
  assert.equal(formatCentury(1325), '1300-talet');
  assert.equal(formatCentury(1300), '1300-talet');
  assert.equal(formatCentury(1399), '1300-talet');
  assert.equal(formatCentury(1400), '1400-talet');
  assert.equal(formatCentury(2026), '2000-talet');
});

test('före vår tideräkning räknas från 1 f.Kr. (år 0) och ingen text säger år 0', () => {
  assert.equal(formatCentury(-500), '500-talet f.Kr.');       // 501 f.Kr.
  assert.equal(formatCentury(-2900), '2900-talet f.Kr.');     // 2901 f.Kr.
  assert.equal(formatCentury(-2999), '3000-talet f.Kr.');     // 3000 f.Kr.
  assert.equal(formatCentury(-99), '100-talet f.Kr.');        // 100 f.Kr.
  assert.equal(formatCentury(0), 'första århundradet f.Kr.'); // 1 f.Kr.
  assert.equal(formatCentury(-98), 'första århundradet f.Kr.'); // 99 f.Kr.
});

test('första århundradet e.Kr. är år 1–99, och 100-talet börjar år 100', () => {
  assert.equal(formatCentury(1), 'första århundradet');
  assert.equal(formatCentury(99), 'första århundradet');
  assert.equal(formatCentury(100), '100-talet');
  assert.deepEqual(centuryOf(1325), { bce: false, c: 14, hundred: 1300 });
  assert.deepEqual(centuryOf(-500), { bce: true, c: 6, hundred: 500 });
});

test('etiketten säger riktning och avstånd med årtalet i parentes', () => {
  assert.equal(formatDirection('past', 1916, 1912), '4 år före (1912)');
  assert.equal(formatDirection('future', 1939, 1942), 'om 3 år (1942)');
  assert.equal(formatDirection('past', 1916, 1915), '1 år före (1915)');
});

test('avståndet över år 0 räknas rätt: 1 e.Kr. ligger ett år efter 1 f.Kr.', () => {
  // Astronomiskt år 1 minus år 0 (1 f.Kr.) är 1, inte 2
  assert.equal(formatDirection('past', 1, 0), '1 år före (1 f.Kr.)');
  // 2 f.Kr. (år -1) sett från 1 e.Kr. (år 1) är 2 år bort
  assert.equal(formatDirection('past', 1, -1), '2 år före (2 f.Kr.)');
  assert.equal(formatDirection('future', -2, 0), 'om 2 år (1 f.Kr.)');
});

test('årsbråkdelar räknas bort: kriget som slutade augusti 2021 är 5 år före 2026 enligt årtalen', () => {
  assert.equal(formatDirection('past', 2026, 2021), '5 år före (2021)');
  assert.equal(formatDirection('past', 2026.4, 2021), '5 år före (2021)');
});

test('panelen skriver "N år tidigare" och "N år senare", och dagar i fokusläget för korta krig', () => {
  assert.equal(formatOffset('future', 1346 - 1325), '21 år senare');
  assert.equal(formatOffset('past', 34), '34 år tidigare');
  assert.equal(formatOffset('past', 0.4), '1 år tidigare'); // aldrig 0 år
  assert.equal(formatOffset('future', 1 / 365.25, true), '1 dag senare');
  assert.equal(formatOffset('past', 10 / 365.25, true), '10 dagar tidigare');
});

test('listtexter med ental och flertal byter form', () => {
  assert.equal(pluralUi('time.windowYears', 40, { where: '1300-talet' }), '1300-talet · ±40 år');
  assert.equal(pluralUi('time.windowYearsWords', 40, { where: '1300-talet' }), '1300-talet · även 40 år före och efter');
  assert.equal(pluralUi('time.followDays', 1, { name: 'kriget' }), 'Följer kriget · visar 1 dag före och efter');
  assert.equal(pluralUi('time.followDays', 3, { name: 'kriget' }), 'Följer kriget · visar 3 dagar före och efter');
});

test('tidsfönstret avrundas för visning: till 5 under 30 år, annars till 10 (#1191)', () => {
  assert.equal(roundWindow(11.2), 10);
  assert.equal(roundWindow(12.6), 15);
  assert.equal(roundWindow(38.4), 40);
  assert.equal(roundWindow(72), 70);
  assert.equal(roundWindow(120), 120);
  assert.equal(roundWindow(2), 5); // aldrig 0 när det finns ett fönster
  assert.equal(roundWindow(0), 0);
});

test('förhistoriens år avrundas till tusental före 10 000 f.Kr. (inför v6.3.0)', async () => {
  const { roundPrehistoric, formatYear } = await import('../js/model.js');
  assert.equal(roundPrehistoric(-99000), -98999);           // 99 001 f.Kr. blir 99 000 f.Kr.
  assert.match(formatYear(roundPrehistoric(-99000)), /^99.000 f\.Kr\.$/);
  assert.equal(roundPrehistoric(-99999), -99999);           // 100 000 f.Kr. är redan runt
  assert.equal(roundPrehistoric(-49620), -49999);           // 49 621 f.Kr. blir 50 000 f.Kr.
  assert.equal(roundPrehistoric(-9999), -9999);             // 10 000 f.Kr. och senare lämnas orörda
  assert.equal(roundPrehistoric(-4321), -4321);
  assert.equal(roundPrehistoric(1916), 1916);
});

test('stora avstånd avrundas: hundratal från 1000 år, tusental från 10 000 år (inför v6.3.0)', () => {
  assert.equal(formatOffset('future', 1001), '1000 år senare');
  assert.equal(formatOffset('past', 2115), '2100 år tidigare');
  assert.equal(formatOffset('past', 999), '999 år tidigare');
  assert.match(formatOffset('past', 11640), /^12.000 år tidigare$/);
});
