// Regionvyn i Platt vy (#1641): ramningen av en liten plats. Ren funktion utan DOM, så att testerna kan dela den
// (tests/regionvy.test.mjs). Rutan kommer ur platsens gräns (placeBounds i place-geo.js), aldrig ur ett fält i datan.
//
// Kartan är fortfarande ekvirektangulär (beslut 1), men lokalt: en grad i öst–väst ritas cos(mittbredden) gånger så bred
// som en grad i nord–syd, så att platsen får sin form på marken. Utan det ser Skåne (56° N) ut 1,8 gånger för bred.

/** Platser upp till så här många grader på marken (största av bredd · cos(mittbredd) och höjd) får regionvyn. */
export const REGION_MAX_DEG = 5;
/** Hur stor del av den fria ytan platsen fyller; resten är den närmaste omgivningen. */
export const REGION_FILL = 0.65;

const DEG = Math.PI / 180;

/**
 * Platsens storlek på marken. bounds = { west, east, south, north } (longituderna uppvikta, som placeBounds ger).
 * Ger { lat0, kx, wide, high, ground }: mittbredden, öst–västskalan cos(lat0), bredden på marken och höjden i grader,
 * och den största av dem.
 */
export function regionSize({ west, east, south, north }) {
  const lat0 = (north + south) / 2, kx = Math.cos(lat0 * DEG);
  const wide = (east - west) * kx, high = north - south;
  return { lat0, kx, wide, high, ground: Math.max(wide, high) };
}

/** Får platsen regionvyn? Bara små platser (Skåne, Danmark); större behåller Platt vys vanliga inramning. */
export function regionEligible(bounds) {
  const { ground } = regionSize(bounds);
  return Number.isFinite(ground) && ground > 0 && ground <= REGION_MAX_DEG;
}

/**
 * Ramen för regionvyn. view = { w, h }: kartans yta i skärmpixlar. free = { x, y, w, h }: den fria delen av ytan (inte täckt av
 * kortet, arket, fokusraden eller regionvyns ruta), i samma pixlar. Platsen fyller `fill` av den fria ytan i den led som tar
 * slut först och hamnar mitt i den.
 * Ger { ppd, kx, lat, lon, box }: skärmpixlar per grad i nord–syd (en grad i öst–väst blir ppd · kx), kartans mitt (lat, lon)
 * och platsens ruta på skärmen { x0, y0, x1, y1 }.
 */
export function regionFrame(bounds, view, free, fill = REGION_FILL) {
  const { lat0, kx, wide, high } = regionSize(bounds);
  const ppd = Math.min(free.w * fill / Math.max(wide, 1e-3), free.h * fill / Math.max(high, 1e-3));
  const cLon = (bounds.west + bounds.east) / 2, cLat = lat0;
  // Platsens mitt ska ligga i den fria ytans mitt: kartans mitt flyttas lika mycket åt andra hållet
  const dx = free.x + free.w / 2 - view.w / 2, dy = free.y + free.h / 2 - view.h / 2;
  const lon = cLon - dx / (ppd * kx), lat = cLat + dy / ppd;
  const sx = free.x + free.w / 2, sy = free.y + free.h / 2;
  const halfW = (bounds.east - bounds.west) / 2 * ppd * kx, halfH = high / 2 * ppd;
  return { ppd, kx, lat, lon, box: { x0: sx - halfW, y0: sy - halfH, x1: sx + halfW, y1: sy + halfH } };
}

/**
 * Den fria ytan: kartans ruta minus det som täcker den. rects = rektanglar i kartans pixlar ({ x0, y0, x1, y1 }) som ligger
 * ovanpå kartan. Varje rektangel skär bort en remsa av det som är kvar, från höger, vänster, upptill eller nertill: den som
 * lämnar mest plats åt platsen. Med shape = { wide, high } (platsens mått på marken, regionSize) är det den som ger platsen
 * störst skala, annars den som tar minst yta. Kortet i dator blir då en remsa till höger, arket och fokusraden en remsa
 * nertill, och regionvyns ruta en remsa till vänster eller upptill, efter platsens form. Ger rektangeln som blir kvar.
 */
export function freeArea(view, rects, shape = null) {
  let x0 = 0, y0 = 0, x1 = view.w, y1 = view.h;
  const score = (w, h) => (shape ? Math.min(w / Math.max(shape.wide, 1e-3), h / Math.max(shape.high, 1e-3)) : w * h);
  for (const r of rects) {
    if (!r || r.x1 <= x0 || r.x0 >= x1 || r.y1 <= y0 || r.y0 >= y1) continue; // utanför det som är kvar
    const cuts = [
      { w: r.x0 - x0, h: y1 - y0, apply: () => { x1 = r.x0; } },
      { w: x1 - r.x1, h: y1 - y0, apply: () => { x0 = r.x1; } },
      { w: x1 - x0, h: y1 - r.y1, apply: () => { y0 = r.y1; } },
      { w: x1 - x0, h: r.y0 - y0, apply: () => { y1 = r.y0; } },
    ].filter(c => c.w > 0 && c.h > 0).sort((a, b) => score(b.w, b.h) - score(a.w, a.h));
    cuts[0]?.apply();
  }
  return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}

// ---- Regionvy steg 2 (#1644): globen flyger in för stora platser -------------------------------------------------------------
// En stor plats (Aotearoa, Grönland) förvrängs av den platta kartan, också med cos-skalan: Grönland spänner 24 breddgrader och Aotearoa
// korsar datumgränsen. Där flyger globen in i stället, med ett smalt synfält ("teleoptik"), så att bilden blir nästan en ortografisk
// projektion med mitten i platsen: sfären ger platsen rätt form. Ramningen är samma regel som i Platt vy (platsen fyller REGION_FILL av
// den fria ytan och ligger mitt i den), räknad på klotet i stället för på kartan.

/** Platser större än så här (grader på marken, regionSize) får globflyget. Sverige (13,7) väntar på DasKrokodils bedömning efter
 *  steg 1 (beslut 2026-11-15) och ligger därför under gränsen; Aotearoa (18,1) och Grönland (23,8) ligger över. Mellan
 *  REGION_MAX_DEG och den här gränsen ramas platsen in i Platt vy som förut. Obs: Aotearoa ligger över gränsen tack vare de
 *  subantarktiska öarna (Campbellön sätter sydgränsen, 52,6° S); utan dem och Aucklandöarna vore höjden cirka 13 grader, under 15.
 *  Ändras gränsen i data/platser.json ska regeln prövas igen (geografens granskning 2026-11-15). */
export const GLOBE_MIN_DEG = 15;
/** Större platser än så här visas hellre som hela klotet (ingen plats i dag är så stor). */
export const GLOBE_MAX_DEG = 60;
/** Synfältet i regionvyn på globen, i grader (den vanliga globen har 35). Smalt, så att perspektivet nästan försvinner. */
export const GLOBE_REGION_FOV = 12;

/** Får platsen globflyget? bounds som placeBounds ger. */
export function globeRegionEligible(bounds) {
  const { ground } = regionSize(bounds);
  return Number.isFinite(ground) && ground > GLOBE_MIN_DEG && ground <= GLOBE_MAX_DEG;
}

/**
 * Den minsta fria yta (skärmpixlar) där regionvyn är till nytta: platsen fyller 65 % av den, alltså minst cirka 150 × 100 px.
 * Är ytan mindre (till exempel en liggande telefon med arket uppe) ramas platsen in i Platt vy som förut (controllers/region.js).
 */
export const MIN_FREE = { w: 230, h: 150 };

/** Ryms regionvyn i den fria ytan (freeArea)? Samma regel för beslutet när vyn öppnas och för texten på knappen i platskortet (#1692). */
export function hasRoom(free) {
  return !!free && free.w >= MIN_FREE.w && free.h >= MIN_FREE.h;
}

/**
 * Texten på knappen i platskortet (#1692): 'place.regionMap' när knappen ger regionvyn och 'place.flatMap' ("Visa på Platt karta")
 * när platsen i stället ramas in i Platt vy. bounds = platsens gränsruta (placeBounds), free = den fria ytan som regionvyn skulle
 * få (freeArea), eller undefined när den inte är känd (då antas den rymmas). En stor plats får regionvyn på globen, som inte har
 * någon gräns för ytan; en liten plats i Platt vy bara när den fria ytan rymmer den; Sverige och andra platser aldrig.
 */
export function regionButtonKey(bounds, free) {
  if (!bounds) return 'place.flatMap';
  if (globeRegionEligible(bounds)) return 'place.regionMap';
  if (!regionEligible(bounds)) return 'place.flatMap';
  return free === undefined || hasRoom(free) ? 'place.regionMap' : 'place.flatMap';
}

/** Punkten (lon, lat) i ortografisk projektion med mitten i (lat0, lon0), i klotradier: x österut, y norrut, z mot betraktaren. */
export function orthographic(lon, lat, lat0, lon0) {
  const p = lat * DEG, p0 = lat0 * DEG, dl = (lon - lon0) * DEG;
  return {
    x: Math.cos(p) * Math.sin(dl),
    y: Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(dl),
    z: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(dl),
  };
}

/** De yttre ringarnas punkter i en Polygon eller MultiPolygon. */
export function outerPoints(geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys.flatMap(poly => poly[0]);
}

/**
 * Ramen för globflyget. geometry: platsens gräns (GeoJSON). bounds: placeBounds. free = { x, y, w, h }: den fria ytan på globens
 * canvas i skärmpixlar. Mitten (lat, lon) är rutans mitt; platsens utbredning räknas i ortografisk projektion kring den, så att
 * datumgränsen (Aotearoa) och polens närhet (Grönland) inte spelar någon roll.
 * Ger { lat, lon, pxPerR, cx, cy, fov }: klotets vridning, skärmpixlar per klotradie mitt i bilden och var på canvasen (cx, cy)
 * projektionens mitt ska ligga, så att platsens ruta hamnar mitt i den fria ytan.
 */
export function globeFrame(geometry, bounds, free, { fill = REGION_FILL, fov = GLOBE_REGION_FOV } = {}) {
  const lat = (bounds.north + bounds.south) / 2;
  const lon = ((((bounds.west + bounds.east) / 2) + 540) % 360) - 180;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [plon, plat] of outerPoints(geometry)) {
    const p = orthographic(plon, plat, lat, lon);
    if (p.z <= 0) continue; // på baksidan (ingen plats i dag är så stor)
    x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
  }
  if (!(x1 > x0) || !(y1 > y0)) return null;
  const pxPerR = Math.min(free.w * fill / (x1 - x0), free.h * fill / (y1 - y0));
  // Rutans mitt (mx, my) ska hamna i den fria ytans mitt; skärmens y växer nedåt
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  return { lat, lon, pxPerR, fov, cx: free.x + free.w / 2 - mx * pxPerR, cy: free.y + free.h / 2 + my * pxPerR,
    box: { x0: free.x + free.w / 2 - (x1 - x0) / 2 * pxPerR, x1: free.x + free.w / 2 + (x1 - x0) / 2 * pxPerR,
      y0: free.y + free.h / 2 - (y1 - y0) / 2 * pxPerR, y1: free.y + free.h / 2 + (y1 - y0) / 2 * pxPerR } };
}

/** Kamerans avstånd från klotets mitt som ger pxPerR skärmpixlar per klotradie mitt i bilden, med synfältet fov och höjden h. */
export function cameraDistance(pxPerR, h, fov) {
  return 1 + h / (2 * Math.tan(fov / 2 * DEG) * pxPerR);
}
