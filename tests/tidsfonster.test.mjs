// Tidsfönstret i vardagsspråk (#994) och riktning i tid (#995): århundrade, "N år före (år)" och "N år senare".
// Körs på svenska (språket är fast vid import). Astronomiska år: 0 = 1 f.Kr., så avståndet räknas rakt av.
import test from 'node:test';
import assert from 'node:assert/strict';
import { centuryOf, formatCentury, formatDirection, formatOffset, pluralUi } from '../js/model.js';

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
  assert.equal(pluralUi('time.windowYears', 1, { where: '1300-talet' }), '1300-talet · visar också det som hände 1 år före och efter');
  assert.equal(pluralUi('time.followDays', 1, { name: 'kriget' }), 'Följer kriget · visar 1 dag före och efter');
  assert.equal(pluralUi('time.followDays', 3, { name: 'kriget' }), 'Följer kriget · visar 3 dagar före och efter');
});
