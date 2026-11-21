// Områden som inte är en stat (#1300): stadsstäder och kulturer, märkta med areaKind på en grupp i data/empires/index.json.
// Saknas fältet är gruppen ett rike. Typordet visas i stället för ordet "rike" (beslutet 2026-11-13, punkt 3 och 5).
import { ui } from './i18n.js';

/** Värdena som areaKind får (samma lista som schemas/empire-index.schema.json). */
export const AREA_KINDS = ['city-states', 'culture'];

/** Typordet på valt språk ("stadsstäder", "kulturområde"), eller null för ett rike. */
export const areaKindWord = kind => (AREA_KINDS.includes(kind) ? ui(`area.kind.${kind}`) : null);
