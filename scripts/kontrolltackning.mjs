// Kontrolltäckning för webbläsartestets jobb (#864): bevisar att varje kontroll i tests/webblasare.mjs körs i exakt ett
// av jobben i tests/jobb.json, per bredd, och att avsnitten (zoom och omflödning, reducerad rörelse, presentationsläge)
// hamnar i exakt ett jobb. Kontrollerna "sidan svarar" och "globen laddas" körs med flit i alla jobb (de öppnar sidan),
// och "inga fel i konsolen" skrivs alltid.
// Namnen läses ur källkoden (`await check('…'`), och urvalet räknas med samma funktion som testet (tests/urval.mjs).
// Körs utan webbläsare:  node scripts/kontrolltackning.mjs   (avslutas med kod 1 vid fel)
import fs from 'node:fs';
import { urval, bredder, ALLTID, AVSNITT, BREDDER } from '../tests/urval.mjs';

const kalla = fs.readFileSync(new URL('../tests/webblasare.mjs', import.meta.url), 'utf8');
const jobb = JSON.parse(fs.readFileSync(new URL('../tests/jobb.json', import.meta.url), 'utf8'));
const namn = [...kalla.matchAll(/await check\('((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
const fel = [];

if (new Set(namn).size !== namn.length) fel.push(`dubbletter av kontrollnamn: ${namn.filter((n, i) => namn.indexOf(n) !== i).join(' | ')}`);
const ids = jobb.map(j => j.id);
if (new Set(ids).size !== ids.length) fel.push(`jobb-id är inte unika: ${ids.join(', ')}`);

const urvalPerJobb = jobb.map(j => ({ ...j, wanted: urval(j), ...bredder(j.bredd) }));
const rader = [];
for (const b of BREDDER) {
  for (const n of namn.filter(n => !ALLTID.includes(n))) {
    const kor = urvalPerJobb.filter(j => j.kor.includes(b) && j.wanted(n)).map(j => j.id);
    if (kor.length !== 1) fel.push(`kontrollen "${n}" (${b}) körs i ${kor.length ? kor.join(' och ') : 'inget jobb'}`);
  }
  rader.push(`${b}: ${namn.length - ALLTID.length} kontroller + ${ALLTID.length} som öppnar sidan (körs i alla jobb som kör ${b})`);
}
for (const a of AVSNITT) {
  const kor = urvalPerJobb.filter(j => j.medAvsnitt && j.wanted(a)).map(j => j.id);
  if (kor.length !== 1) fel.push(`avsnittet "${a}" körs i ${kor.length ? kor.join(' och ') : 'inget jobb'}`);
}
for (const b of BREDDER) {
  const utanJobb = !urvalPerJobb.some(j => j.kor.includes(b));
  if (utanJobb) fel.push(`inget jobb kör bredden ${b}`);
}
for (const j of urvalPerJobb) {
  const antal = namn.filter(n => !ALLTID.includes(n) && j.wanted(n)).length;
  rader.push(`jobb ${j.id}: ${j.kor.join('+')}, ${antal} av ${namn.length - ALLTID.length} namngivna kontroller${j.medAvsnitt && AVSNITT.some(a => j.wanted(a)) ? ' och avsnitten' : ''}`);
}

console.log(rader.join('\n'));
if (fel.length) {
  console.log(`\nFEL i uppdelningen:\n${fel.map(f => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`\nOK: ${namn.length} kontrollnamn och ${AVSNITT.length} avsnitt, varje i exakt ett jobb per bredd.`);
