// Urvalet av kontroller i webbläsartestet (#864): ENDAST, UTAN och BREDD. Delas av tests/webblasare.mjs och
// scripts/kontrolltackning.mjs, så att beviset för att varje kontroll ligger i exakt ett CI-jobb bygger på samma
// regler som testet själv. Ingen annan kod här: filen öppnar ingen webbläsare.

/** "a|b" → ['a', 'b'] i gemener, utan tomma led. */
export const list = v => (v || '').split('|').map(t => t.trim().toLowerCase()).filter(Boolean);

/** Kontroller som öppnar sidan och väntar in globen: alla andra bygger på dem, så de körs alltid. */
export const ALLTID = ['sidan svarar', 'globen laddas'];

/** Avsnitt med egna fönsterstorlekar. De hör till datorjobbet (BREDD saknas eller innehåller dator). */
export const AVSNITT = ['zoom och omflödning', 'reducerad rörelse', 'presentationsläge'];

export const BREDDER = ['dator', 'mobil'];

/**
 * Bygger urvalsfunktionen. ENDAST väljer in först och UTAN tar bort sedan; ALLTID tas aldrig bort.
 * @param {{endast?: string, utan?: string}} v
 */
export function urval({ endast = '', utan = '' } = {}) {
  const inn = list(endast);
  const ut = list(utan);
  return name => ALLTID.includes(name)
    || ((!inn.length || inn.some(t => name.toLowerCase().includes(t))) && !ut.some(t => name.toLowerCase().includes(t)));
}

/** Vilka bredder ett jobb kör, och om det kör avsnitten. Okänd bredd ger fel. */
export function bredder(bredd = '') {
  const valda = list(bredd);
  const okanda = valda.filter(b => !BREDDER.includes(b));
  if (okanda.length) throw new Error(`Okänd BREDD: ${okanda.join(', ')} (giltiga: ${BREDDER.join(', ')})`);
  const kor = valda.length ? BREDDER.filter(b => valda.includes(b)) : BREDDER;
  return { kor, medAvsnitt: kor.includes('dator') };
}
