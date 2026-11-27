import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampYear } from '../js/year-clamp.js';

test('klampar vid båda gränserna och behåller decimalår inom spannet', () => {
  const bounds = { from: -3000, to: -2999 };
  assert.equal(clampYear(-3001, bounds), -3000);
  assert.equal(clampYear(-3000, bounds), -3000);
  assert.equal(clampYear(-2999.5, bounds), -2999.5);
  assert.equal(clampYear(-2999, bounds), -2999);
  assert.equal(clampYear(-2998, bounds), -2999);
});

test('en ensam gräns klampar bara åt ett håll', () => {
  assert.equal(clampYear(-11, { from: -10 }), -10);
  assert.equal(clampYear(12, { from: -10 }), 12);
  assert.equal(clampYear(-11, { to: 10 }), -11);
  assert.equal(clampYear(12, { to: 10 }), 10);
});
