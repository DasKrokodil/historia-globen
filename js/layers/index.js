// Lagerlistan (#338): alla lager som anmäler sig i registret (layers/registry.js), i radernas ordning i Lager.
// Ett nytt lager läggs till med en post (export function entry) i sin egen fil och en rad här.
// En fil får också ge flera poster som en lista: bildlagren (images) ger en post per rad i data/bildlager.json (#1325).
// Ritordningen på lagerbilden bestäms inte av listan utan av varje posts z (Z i registry.js).
// Gruppen i Lager anges av varje posts group (#357); gruppernas namn och ordning står i data/vyer.json.
import { entry as events } from './events.js';
import { entry as areas } from './areas.js';
import { entry as religions } from './religions.js';
import { entry as routes } from './lines.js';
import { entry as discovery } from './discovery.js';
import { entry as borders } from './borders.js';
import { entry as wars } from './wars.js';
import { entries as images } from './images.js';
import { entry as places } from './places.js';
import { ui } from '../i18n.js';

// Rader i Lager som inte är lager på kartan
const funfacts = ({ data }) => ({ id: 'funfacts', name: ui('layer.funfacts'), group: 'people',
  menu: { on: true, aria: ui('layer.funfactsLabel'), note: ui('layer.funfactsNote') },
  marks: s => !s.focus && s.layers.funfacts ? data.funfacts.map(f => ({ type: 'funfact', at: (f.show[0] + f.show[1]) / 2, label: 'Samtidigt' })) : [] });
const keep = () => ({ id: 'keep', name: ui('layer.keep'), group: 'settings',
  menu: { on: false, note: ui('layer.keepNote') } });

/** Händelserna först: deras markörer läggs på klotet före de andra lagrens. */
export const LAYERS = [events, funfacts, areas, religions, routes, images, discovery, borders, keep, wars, places];
