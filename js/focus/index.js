// Fokustyperna (#1327), i den ordning grupperna står i Sök och följ. En ny typ läggs till med en post
// (export function entry) i sin egen fil, en rad här och ordet i FOCUS_TYPES i js/state.js (adressens vitlista).
// Kontraktet står överst i registry.js. Innan en ny typ läggs till: ett nytt namngivet urval är en händelselista
// (som temat), ett tidsspann (läget intervall) eller en geometri (som platsen), och får inget eget format
// (docs/beslut/2026-11-13-fokustyper-som-poster.md).
import { entry as theme } from './theme.js';
import { entry as place } from './place.js';
import { entry as war } from './war.js';
import { entry as empire } from './empire.js';
import { entry as religion } from './religion.js';
import { entry as route } from './route.js';

export const FOCUS_ENTRIES = [theme, place, war, empire, religion, route];
