// Platsernas gräns (#579): vilka händelser som ligger inom dagens gräns för en plats. Ren funktion utan DOM,
// så att testerna kan dela den. Gränsen är en GeoJSON-MultiPolygon i WGS 84, [longitud, latitud] (data/platser.json).

const ringCache = new WeakMap();
/**
 * Ringen uppvikt som traceRing i layers/area-style.js (#1268): varje punkt ligger på den längdgrad som är närmast den förra, så
 * att en ring som korsar datumlinjen (180°) går den korta vägen över den och inte tvärs över kartan. Datan delas redan vid
 * 180° av tools/platser_gransar.py, så ringarna är oftast oförändrade; det här är körningsskyddet för en ring som ändå hoppar.
 * Ger { pts, min, max }: punkterna och deras längdgradsspann. Sparas per ring.
 */
function unwrapped(ring) {
  let info = ringCache.get(ring);
  if (info) return info;
  let prev = null, min = Infinity, max = -Infinity, changed = false;
  const pts = ring.map(([lon, lat]) => {
    const x = prev === null ? lon : lon - 360 * Math.round((lon - prev) / 360);
    if (x !== lon) changed = true;
    prev = x; min = Math.min(min, x); max = Math.max(max, x);
    return [x, lat];
  });
  info = { pts: changed ? pts : ring, min, max };
  ringCache.set(ring, info);
  return info;
}

/** Ligger punkten i ringen? Jämn-udda-regeln, med punkten som längdgrad lon och lon ± 360 (en ring över datumlinjen). */
function inRing(ring, lon, lat) {
  const { pts, min, max } = unwrapped(ring);
  for (const shift of [0, 360, -360]) {
    const x = lon + shift;
    if (x < min || x > max) continue;
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > lat) !== (yj > lat) && x < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

/** Ligger punkten inom geometrin (Polygon eller MultiPolygon)? Hål i polygonen räknas som utanför. */
export function inGeometry(geometry, lon, lat) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys.some(([outer, ...holes]) => inRing(outer, lon, lat) && !holes.some(h => inRing(h, lon, lat)));
}

/**
 * Kortaste avståndet i km från punkten till geometrins kant (platt närmevärde, duger för några tiotal km). Ringen viks upp
 * och punkten prövas som lon och lon ± 360, så att 179,5° och −179,5° är en grad från varandra. Segment där båda ändpunkterna
 * ligger på ±180 är sömmen där datan delats vid datumlinjen (#1268) och räknas inte som kust.
 * `within` (valfri, #1524): sökningen ger upp bortom det avståndet och svarar då `within`; ringar vars ruta ligger längre bort
 * hoppas över, så att ett uppslag med liten marginal över stora geometrier (riken, religioner) går fort.
 */
export function edgeKm(geometry, lon, lat, within = Infinity) {
  const k = Math.cos(lat * Math.PI / 180);
  let best = within;
  for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
    for (const ring of poly) {
      const { pts, min, max } = unwrapped(ring);
      for (const shift of [0, 360, -360]) {
        const px = lon + shift;
        if (Math.max(min - px, px - max, 0) * k * 111.2 >= best) continue; // ringens ruta ligger längre bort än bästa hittills
        for (let i = 1; i < pts.length; i++) {
          if (Math.abs(ring[i - 1][0]) === 180 && Math.abs(ring[i][0]) === 180) continue;
          const ax = (pts[i - 1][0] - px) * k, ay = pts[i - 1][1] - lat, bx = (pts[i][0] - px) * k, by = pts[i][1] - lat;
          const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
          const u = len ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len)) : 0;
          best = Math.min(best, Math.hypot(ax + u * dx, ay + u * dy) * 111.2);
        }
      }
    }
  }
  return best;
}

/**
 * Kustmarginal: 1:50m-kusten är grov, så en plats vid kusten (Nuuk, Auckland, Golden Bay, Stockholm, Kalmar) kan hamna några
 * kilometer utanför linjen. Händelser inom så här många km från gränsen räknas som inom den, men bara om de inte ligger inne i
 * ett annat lands polygon (#1449): marginalen är till för det som hamnar i havet av kustens skull, inte för grannlandets land
 * (Fredriksten i Norge, Helsingborg i Sverige). Grannländernas polygoner ligger i platsens `boundary.neighbours`, skrivna av
 * tools/platser_gransar.py för minst så här många km från gränsen (`boundary.neighbourKm`), också för grannländer som inte själva
 * är platser (Åland). validate-site.py och testerna räknar med samma marginal och samma regel.
 */
export const COAST_MARGIN_KM = 20;

/** Gränsrutan { west, east, south, north } för alla ringar i geometrin, med longituderna uppvikta kring centerLon. */
function boundsOf(geometry, centerLon = 0) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
    for (const [lon, lat] of poly[0]) {
      const x = centerLon + (((lon - centerLon + 180) % 360) + 360) % 360 - 180; // närmast centerLon, så att datumgränsen inte spränger rutan
      west = Math.min(west, x); east = Math.max(east, x); south = Math.min(south, lat); north = Math.max(north, lat);
    }
  }
  return { west, east, south, north };
}

/**
 * Rutan runt platsens yttre gräns, för att rama in den i Platt vy (#1161). Longituderna viks upp kring centerLon
 * (platsens `view.center`), så att Aotearoa med Chathamöarna (över datumgränsen) blir 18 grader bred och inte 340.
 */
export function placeBounds(place, centerLon = place.view?.center?.[1] ?? 0) {
  return boundsOf(place.boundary.geometry, centerLon);
}

const boxCache = new WeakMap();
/** Rutan i längdgrader (uppvikt per ring, så den kan gå förbi ±180) och dess yta, till för att sålla bort platser snabbt vid uppslag. */
function rawBox(geometry) {
  let box = boxCache.get(geometry);
  if (!box) {
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
      const { pts } = unwrapped(poly[0]); // uppvikt, så att en ring som hoppar över datumlinjen får rätt ruta (#1268)
      for (const [lon, lat] of pts) { west = Math.min(west, lon); east = Math.max(east, lon); south = Math.min(south, lat); north = Math.max(north, lat); }
    }
    box = { west, east, south, north, area: (east - west) * (north - south) };
    boxCache.set(geometry, box);
  }
  return box;
}

/**
 * Platsen under en punkt (#1161): den vars gräns innehåller punkten, annars null. Bara dagens gräns räknas, utan
 * kustmarginalen (ett tryck i havet utanför kusten är inte ett tryck på platsen). Ligger punkten inom flera platser
 * (ett landskap inom ett land) väljs den minsta, det vill säga den mest precisa. places är platserna som har ett kort.
 */
export function placeAt(places, lon, lat) {
  let best = null, bestArea = Infinity;
  for (const place of places) {
    const g = place.boundary?.geometry;
    if (!g) continue;
    const box = rawBox(g);
    if (![0, 360, -360].some(shift => lon + shift >= box.west && lon + shift <= box.east) || lat < box.south || lat > box.north || box.area >= bestArea) continue;
    if (inGeometry(g, lon, lat)) { best = place; bestArea = box.area; }
  }
  return best;
}

/**
 * Ligger punkten inne i ett annat lands polygon (Natural Earth admin 0), enligt platsens grannlista (#1449)? Platsens eget land
 * ingår inte i listan, så för ett landskap (Skåne) räknas resten av landet inte som granne. Saknas listan räknas ingen granne.
 */
export function inNeighbour(place, lon, lat) {
  return (place.boundary.neighbours ?? []).some(n => inGeometry(n.geometry, lon, lat));
}

/**
 * Hör punkten till platsen (#1449)? Ja om den ligger inom gränsen. Annars bara om den ligger inom kustmarginalen och inte inne i
 * ett annat lands polygon: en punkt på land räknas till landet den ligger i, och marginalen hjälper bara punkter som hamnat i havet
 * på grund av den grova kusten. Grannlistan prövas sist, eftersom bara de få punkterna inom marginalen når dit.
 */
export function inPlace(place, lon, lat) {
  const g = place.boundary.geometry;
  return inGeometry(g, lon, lat) || (edgeKm(g, lon, lat) <= COAST_MARGIN_KM && !inNeighbour(place, lon, lat) && !inSibling(place, lon, lat));
}

/**
 * Ligger punkten inne i ett syskonlandskap (#1847), ett annat landskap med samma `partOf`? Då hör den till det landskapet och inte
 * till det här via kustmarginalen: marginalen är till för punkter som hamnat i havet av kustens skull, inte för land i nästa landskap
 * (Gustav Vasa i Strängnäs, Södermanland, ligger 14 km från Upplands gräns). Listan `_siblings` sätts av linkIncludeEvents; saknas
 * den (platserna är inte länkade) finns inga syskon, som förut.
 */
export function inSibling(place, lon, lat) {
  return (place._siblings ?? []).some(s => inGeometry(s.boundary.geometry, lon, lat));
}

/**
 * Den minsta platsen som punkten hör till enligt inPlace (gränsen med kustmarginalen, samma som platsens händelser), eller null.
 * Till för händelser som gäller hela sin plats (`scope: "place"`, #1674): Skåne går före Sverige, och Köpenhamns punkt, som ligger
 * utanför den grova kusten, hör ändå till Danmark. Ytan är rutans, som i placeAt.
 */
export function smallestPlace(places, lon, lat) {
  let best = null, bestArea = Infinity;
  for (const place of places) {
    if (!place.boundary?.geometry) continue;
    const area = rawBox(place.boundary.geometry).area;
    if (area < bestArea && inPlace(place, lon, lat)) { best = place; bestArea = area; }
  }
  return best;
}

/**
 * Händelserna (med _lon och _lat, som model.js sätter) som ligger inom platsens gräns, i tidsordning. En händelse med
 * `scope: "wide"` (#1806) gäller ett större område än platsen (ett halvklot, en kultur över flera länder, en följd i ett annat
 * land) och markören visar bara var området finns, så den räknas inte som platsens händelse: platskortet, platsens händelser i
 * Fokus och regionvyns lista läser alla den här funktionen. På globen visas den som vanligt.
 * Platsens `includeEvents` (#2333, beslut 2026-11-27) är händelser vid gränsen som hör till platsen trots den grova gränsen,
 * också när punkten ligger i ett grannlands polygon (Echternach vid Sauer, Kelmis vid trelandspunkten). Listan används bara när
 * händelsens egen källa placerar den i landet; scripts/validate-site.py kräver att punkten ligger högst INCLUDE_MAX_KM från gränsen.
 * En händelse som ett land listar räknas inte till något annat land (Echternach inte till Tyskland), men landskap räknas som förut:
 * det sköter `_claimedElsewhere`, som linkIncludeEvents() sätter på varje land när platserna laddas.
 */
export function placeEvents(place, events) {
  const listed = new Set(place.includeEvents ?? []);
  const elsewhere = place._claimedElsewhere;
  return events.filter(e => e._lon != null && e.scope !== 'wide'
    && (listed.has(e.id) || (!elsewhere?.has(e.id) && inPlace(place, e._lon, e._lat)))).sort((a, b) => a.start - b.start);
}

/**
 * Knyter ihop platsernas `includeEvents` (#2333): varje plats av typen `country` får `_claimedElsewhere`, id för händelser som ett
 * annat land listar, så att placeEvents inte räknar dem till det här landet. Landskap får ingen sådan lista, men `_siblings`
 * (#1847): de andra landskapen med samma `partOf`, som inPlace använder så att kustmarginalen inte tar land i ett syskonlandskap.
 * Andra typer får ingenting och påverkas inte. Anropas av loadPlaces i js/model.js (och av testerna) med alla platser; ger samma lista tillbaka.
 */
export function linkIncludeEvents(places) {
  const countries = places.filter(p => p?.type === 'country');
  for (const p of countries) {
    p._claimedElsewhere = new Set(countries.filter(q => q !== p).flatMap(q => q.includeEvents ?? []));
  }
  for (const p of places.filter(p => p?.type === 'landskap')) {
    p._siblings = places.filter(q => q !== p && q?.type === 'landskap' && q.partOf === p.partOf && q.boundary?.geometry);
  }
  return places;
}

/** Högsta avstånd i km utanför gränsen för en händelse i `includeEvents` (#2333); validate-site.py och testerna läser samma tal. */
export const INCLUDE_MAX_KM = 5;
