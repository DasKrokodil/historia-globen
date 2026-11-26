// Religionslagret (#2140): handplockat val av religion per rike (religionOverride i registret i data/religions.json).
// Valet gäller bara när en öppnad källa uttryckligen säger vilken religion faktarutans allmännare ord betyder, och
// varje val har sin källa i sources.json. Zapotekerna visas med mesoamerikansk religion. Hwicce hade germansk religion till
// 2026-11-26 (#2271): källan beskriver ett kristet kungarike, så valet togs bort och riket följer faktarutan (osäkert).
// Visigoterna fick i stället kristendomen från 390 (conversion, tidigare christianSince, #2162) efter källgranskningen (Gothic Christianity: 376–390). Chimor och
// Kanem-Bornu har inget val (beslut 2026-11-22). Läser data/religions.json som tools/religioner.py har byggt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data/religions.json', import.meta.url), 'utf8'));
const sources = JSON.parse(readFileSync(new URL('../data/sources.json', import.meta.url), 'utf8')).sources;
const sourceIds = new Set(sources.map(s => s.id));
const religionIds = new Set(data.religions.map(r => r.id));
const register = new Map(data.polities.map(p => [p.name, p]));

/** Religionerna vars ögonblicksbild det året räknar upp riket (utan ärvda områden). */
function religionsAt(polity, year) {
  const out = [];
  for (const r of data.religions) {
    for (const s of r.snapshots) {
      if (!s.inherited && s.start <= year && year <= s.end && (s.polities || []).includes(polity)) out.push({ id: r.id, sure: s.sure });
    }
  }
  return out;
}

test('varje handplockat val har en religion i lagret och minst en källa i sources.json', () => {
  const val = data.polities.filter(p => p.religionOverride);
  assert.ok(val.length >= 1, 'för få riken med religionOverride');
  for (const p of val) {
    const o = p.religionOverride;
    assert.ok(religionIds.has(o.religion), `${p.name}: religionen ${o.religion} finns inte i lagret`);
    assert.ok(Array.isArray(o.sources) && o.sources.length, `${p.name}: religionOverride saknar källor`);
    for (const id of o.sources) assert.ok(sourceIds.has(id), `${p.name}: källan ${id} finns inte i sources.json`);
    assert.equal(p.religion, o.religion, `${p.name}: registrets religion följer inte valet`);
  }
});

test('valen i #2140: Zapotekerna mesoamerikansk', () => {
  assert.equal(register.get('Zapotec Civilization')?.religionOverride?.religion, 'mesoamerikansk', 'Zapotec Civilization: religionOverride');
  for (const year of [-400, 0, 500, 850]) {
    assert.deepEqual(religionsAt('Zapotec Civilization', year), [{ id: 'mesoamerikansk', sure: true }], `Zapotekerna ${year}`);
  }
});

test('Hwicce: inget handplockat val, följer faktarutan och visas osäkert (#2271)', () => {
  const p = register.get('Hwicce');
  assert.ok(p, 'Hwicce saknas i registret');
  assert.equal(p.religionOverride, undefined, 'Hwicce har religionOverride');
  assert.equal(p.rule, 'först nämnd');
  for (const year of [600, 620]) {
    const got = religionsAt('Hwicce', year);
    assert.ok(got.length && got.every(r => r.sure === false), `Hwicce ${year} ska visas osäkert: ${JSON.stringify(got)}`);
    assert.ok(got.every(r => r.id !== 'germansk'), `Hwicce ${year} visas fortfarande som germansk`);
  }
});

test('Visigoterna: kristna från 390 (conversion med källa), inget handplockat val', () => {
  const p = register.get('Visigoths');
  assert.equal(p?.religionOverride, undefined, 'Visigoths har religionOverride');
  const { note, ...conv } = p?.conversion ?? {};
  assert.deepEqual(conv, { religion: 'kristendom', since: 390, sources: ['wp-gothic-christianity', 'wp-visigoths'] });
  for (const id of conv.sources) assert.ok(sourceIds.has(id), `källan ${id} finns inte i sources.json`);
  // Källorna skiljer sig (376–390 eller före 376), och det står i klickrutan (#2271)
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) assert.ok(note?.[lang], `Visigoths: conversion.note saknar ${lang}`);
  assert.deepEqual(religionsAt('Visigoths', 420), [{ id: 'kristendom', sure: true }]);
});

test('Chimor och Kanem-Bornu har inget handplockat val (beslut 2026-11-22)', () => {
  for (const name of ['Chimor', 'Chimu Empire', 'Bornu Empire', 'Empire of Kanem']) {
    const p = register.get(name);
    assert.ok(p, `${name} saknas i registret`);
    assert.equal(p.religionOverride, undefined, `${name} har fått religionOverride`);
  }
});
