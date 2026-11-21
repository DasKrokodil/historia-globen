// Startbilden (#1317): var kameran står när sidan öppnas utan delad adress, och hur stor globen är då.
// Reglerna ligger här så att main.js och testerna delar dem.
//
// Zoomen: på dator (bred och inte låg skärm) är Visste du?-kortet en ruta bredvid globen, och när den är öppen täcker den
// Tenochtitlan i kortet för 1325 (kortets tre händelser, Kairo, Tanger och Tenochtitlan, ligger cirka 130° isär).
// Globen börjar därför på appens lägsta zoom, 0,8, så att alla tre ligger fria från kortet. I smal skärm är kortet ett ark
// nedtill som inte täcker de tre platserna, och globen fyller redan bredden, så där är zoomen oförändrad (1).
// Bara första inladdningen utan adress får startzoomen: en delad länk, en tur i länken och Bakåt/Framåt rör inte kameran
// (adressen anger den själv, och en länk utan kamera ger som förut zoom 1).

export const START_LAT = 34;
export const START_LON = -50;
/** Appens lägsta zoom (Globe.setZoom); startzoomen på bred skärm. */
export const START_ZOOM_WIDE = 0.8;
export const START_ZOOM_DEFAULT = 1;
/** Samma gräns som Visste du?-kortets ark nedtill (max-width: 760px); låg yta (liggande telefon) är undantagen. */
export const WIDE_QUERY = '(min-width: 761px) and (min-height: 500px)';

/**
 * Är det en delad adress? Allt i hashen räknas (år, kamera, fokus, tur), och i frågedelen den äldre kameran (c) och turen (tur).
 */
export function hasSharedAddress({ hash = '', search = '' } = {}) {
  if (String(hash).replace(/^#/, '') !== '') return true;
  const q = new URLSearchParams(search);
  return q.has('c') || q.has('tur');
}

/**
 * Startkameran. hash och search = location.hash och location.search vid start, wide = matchMedia(WIDE_QUERY).matches.
 * Ger { lat, lon, zoom }.
 */
export function startView({ hash = '', search = '', wide = false } = {}) {
  const zoom = wide && !hasSharedAddress({ hash, search }) ? START_ZOOM_WIDE : START_ZOOM_DEFAULT;
  return { lat: START_LAT, lon: START_LON, zoom };
}
