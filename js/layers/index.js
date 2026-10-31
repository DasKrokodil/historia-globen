// Lagerlistan (#338): alla lager som anmäler sig i registret (layers/registry.js), i radernas ordning i Lager.
// Ett nytt lager läggs till med en post (export function entry) i sin egen fil och en rad här.
// Ritordningen på lagerbilden bestäms inte av listan utan av varje posts z (Z i registry.js).
import { entry as events } from './events.js';
import { entry as areas } from './areas.js';
import { entry as religions } from './religions.js';
import { entry as routes } from './lines.js';
import { entry as discovery } from './discovery.js';
import { entry as borders } from './borders.js';
import { entry as wars } from './wars.js';

// Rader i Lager som inte är lager på kartan
const funfacts = () => ({ id: 'funfacts', name: 'Samtidigt-kortet',
  menu: { on: true, aria: 'Visa Samtidigt-kortet', note: 'fun facts och annat som hände samtidigt' } });
const keep = () => ({ id: 'keep', name: 'Behåll mina lager i fokus',
  menu: { on: false, note: 'annars dämpas riken och religioner som inte hör till det man följer' } });

/** Händelserna först: deras markörer läggs på klotet före de andra lagrens. */
export const LAYERS = [events, funfacts, areas, religions, routes, discovery, borders, keep, wars];
