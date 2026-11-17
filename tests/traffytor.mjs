// Prov av träffytor som tar tryck av varandra (#1932). Delas av tests/webblasare.mjs och mätningar för hand.
//
// Provet körs i sidan (Playwright: page.evaluate(provaTraffytor, { undantag: [valfria väljare], forklaring: true })) och är ett fristående funktionsuttryck: det får
// inte använda något utanför sin egen kropp. Det går igenom varje synlig knapp, länk och sammanfattning och provtrycker med
// document.elementFromPoint: mitten, mitten av varje kant (10 px innanför, bara för knappar som är minst 30 px höga och breda) och fyra
// hörn (30 procent av den kortaste sidan innanför, så att hörnen ligger inom en rundad eller piller-formad knapp). Träffen ska vara
// knappen själv eller något i den. En knapp i en rullande ruta som täcks av ett fast fält i vila (handtag, knapprad) provas också
// rullad till mitten, överkanten och nederkanten av rutan, som en besökare som rullar, och räknas som felfri om något läge ger fria
// tryck; rullningen återställs efteråt.
//
// Provet mäter alltså vad ett tryck faktiskt träffar, inte storleken på pseudoelementen (som tidigare prov mätte, #1309, #1667,
// #1713): en osynlig ::after på 44 px som sticker upp över grannen, ett kort som ligger över en knapp eller en rad som täcker
// årtalet syns bara när man provtrycker.
//
// Tre saker räknas inte som fel, eftersom de är avsiktliga skikt och inte tryck som tas:
//   - Samtidigt-listan (#panel) är en ruta som medvetet ligger över det som finns under den (tidsreglaget, fokusraden): en
//     knapp utanför listan vars punkt ligger under listan är täckt av den, och trycket går då till listan.
//   - En knapp vars ruta ligger helt inuti den provade knappens ruta (krysset i ett arks handtag) har sin utökade yta över dess kant med flit.
//   - De yttersta 10 px av en kant: handtaget i Samtidigt-arket har med flit 8 px utökad yta över bildernas överkant, och bilderna behåller
//     då 44 px (#1309). En knapps mitt och hörn får aldrig tas.
// Teckenförklaringarna (religioner, riken, "Tecken" under tidsskalan) hör till #1307 och provas inte här, utom knapparna för religioner och riken i
// liggande telefon i fokus (forklaring: true); kartans markörer och
// etiketter på globen är egna spel (klustren ligger under menyer och kort med flit).
export function provaTraffytor({ undantag = [], forklaring = false } = {}) {
  const KONTROLL = 'button, a[href], summary, [role="button"]';
  // Teckenförklaringarna provas bara när anroparen ber om det (forklaring: true), i liggande telefon i fokus, där deras knapp låg under
  // fokusraden efter att årtalet flyttats upp (#1932). I övriga lägen är de #1307:s, och "Tecken" under tidsskalan har med flit en utökad yta över skalan.
  const SKIPPA = [...(forklaring ? [] : ['.religion-legend', '#religion-legend', '.empire-legend', '#empire-legend', '.empire-legend-button']), '.timeline-legend',
    '#labels', '#globe-canvas', '#flat-canvas', '.tspan', '.tdot', '.tff', ...undantag].join(', ');
  const namn = e => {
    if (!e) return 'ingenting';
    const text = (e.textContent || e.getAttribute?.('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 20);
    const klass = typeof e.className === 'string' && e.className ? `.${e.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    return `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}${klass}${text ? ` "${text}"` : ''}`;
  };
  const synlig = e => {
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0 || r.width < 4 || r.height < 4) return false;
    if (e.closest('[hidden], [inert]')) return false;
    return r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
  };
  // En punkt som ligger utanför en rullande eller klippande förälder syns inte och går inte att trycka på
  const klippt = (e, x, y) => {
    for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const r = a.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return true;
    }
    return false;
  };
  // Närmaste rullande förälder (med mer innehåll än plats), annars ingen
  const rullande = e => {
    for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(auto|scroll)/.test(cs.overflowY) && a.scrollHeight > a.clientHeight + 1) return a;
    }
    return null;
  };
  const fel = [];
  let prov = 0;
  let knappar = 0;
  // Provar en knapp som den ligger nu och ger tillbaka vad som tar trycket
  const provaKnapp = b => {
    const r = b.getBoundingClientRect();
    const hor = Math.max(2, Math.min(r.width, r.height) * 0.3);
    const kant = Math.min(r.width, r.height) >= 30 ? 10 : 0;
    const punkter = [
      ['mitten', r.left + r.width / 2, r.top + r.height / 2],
      ['övre vänstra hörnet', r.left + hor, r.top + hor], ['övre högra hörnet', r.right - hor, r.top + hor],
      ['nedre vänstra hörnet', r.left + hor, r.bottom - hor], ['nedre högra hörnet', r.right - hor, r.bottom - hor],
      ...(kant ? [['överkant', r.left + r.width / 2, r.top + kant], ['nederkant', r.left + r.width / 2, r.bottom - kant],
        ['vänsterkant', r.left + kant, r.top + r.height / 2], ['högerkant', r.right - kant, r.top + r.height / 2]] : []),
    ];
    const tas = [];
    let provade = 0;
    for (const [plats, x, y] of punkter) {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight || klippt(b, x, y)) continue; // utanför skärmen eller klippt: ingen träff att prova
      provade++;
      const t = document.elementFromPoint(x, y);
      if (!t || t === b || b.contains(t)) continue;
      // Listan Samtidigt täcker medvetet det som ligger under den
      if (t.closest('#panel') && !b.closest('#panel')) continue;
      // Den som träffades är en knapp som ligger helt inuti denna (krysset i handtaget): avsiktligt skikt
      const k = t.closest(KONTROLL);
      if (k) {
        const kr = k.getBoundingClientRect();
        if (kr.left >= r.left - 1 && kr.right <= r.right + 1 && kr.top >= r.top - 1 && kr.bottom <= r.bottom + 1) continue;
      }
      const tr = (k ?? t).getBoundingClientRect();
      const inne = x >= tr.left && x <= tr.right && y >= tr.top && y <= tr.bottom;
      tas.push(`${plats} → ${namn(k ?? t)}${inne ? '' : ' (utökad yta utanför dess ruta)'}`);
    }
    return { r, tas, provade };
  };
  for (const b of document.querySelectorAll(KONTROLL)) {
    if (b.matches(SKIPPA) || b.closest(SKIPPA) || !synlig(b)) continue;
    knappar++;
    // Står knappen i en rullande ruta kan ett fast fält (handtag, knapprad) täcka den i vila. Då provas den vid ett par rullningslägen,
    // som en besökare som rullar: knappen räknas som felfri om något läge ger fria tryck. Alla rullningar återställs efteråt.
    const sparat = [];
    for (let a = b.parentElement; a; a = a.parentElement) if (a.scrollTop || a.scrollHeight > a.clientHeight + 1) sparat.push([a, a.scrollTop]);
    let res = provaKnapp(b);
    if (res.tas.length && rullande(b)) {
      for (const block of ['center', 'start', 'end']) {
        b.scrollIntoView({ block, inline: 'nearest' });
        const nu = provaKnapp(b);
        if (!nu.tas.length) { res = nu; break; }
      }
    }
    prov += res.provade;
    if (res.tas.length) fel.push(`${namn(b)} [${Math.round(res.r.width)} × ${Math.round(res.r.height)} vid ${Math.round(res.r.left)},${Math.round(res.r.top)}]: ${res.tas.join('; ')}`);
    for (const [a, top] of sparat) a.scrollTop = top;
  }
  return { fel, knappar, prov };
}
