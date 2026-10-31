// Rikenas symboler (#301), som klickbara markörer ovanpå klotet, på samma sätt som religionernas ursprung (#271).
// Ett rike med symbol (fältet symbol i data/empires/index.json, eller polityFacts.<rike>.symbol för ett rike i gruppen
// med egen faktaruta, som Bysantinska riket) får en mässingsmedalj med symbolen mitt i sitt område det år man tittar på,
// på rikets label-punkt. Markören flyttar med label-punkten när gränserna ändras. Samma medalj ritas på den platta
// lagerbilden av AreasLayer.drawOverlay (beslut 1); 3D-markören täcker den. Pekar man på markören visas rikets namn,
// och klick öppnar rikets faktaruta. En osynlig knapp ligger över markören, så att den går att nå med tangentbordet.
import { THREE, latLonToVec3, R } from '../globe.js';
import { medalTexture } from './events.js';
import { frameMedals } from './origins.js';

const INFO = { when: 'now', major: false, unsure: false };

export class EmpireMarkers {
  constructor(globe, labelsEl) {
    this.globe = globe;
    this.labelsEl = labelsEl;
    this.items = new Map(); // rikets id (polity) → { sprite, button, mark }
    this.onPick = () => {}; // anropas med markeringen ({ group, polity, ... }) vid klick
    this.scale = 1; // medaljens storlek på lagerbilden (AreasLayer.labelScale)
  }

  /**
   * marks = AreasLayer.marks() ([{ key, symbol, color, name, lon, lat, group, polity }]);
   * show = false när rikeslagret är av eller dämpat.
   */
  update(marks, show = true) {
    const now = new Set();
    for (const m of show ? marks : []) {
      now.add(m.key);
      const it = this.items.get(m.key) ?? this._make(m);
      it.mark = m;
      if (it.lon !== m.lon || it.lat !== m.lat) {
        it.sprite.position.copy(latLonToVec3(m.lat, m.lon, R * 1.014));
        it.lon = m.lon; it.lat = m.lat;
      }
      it.sprite.visible = true;
    }
    for (const [key, it] of this.items) if (!now.has(key)) { it.sprite.visible = false; it.button.hidden = true; }
  }

  _make(m) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false,
      map: medalTexture(m.symbol, m.color, INFO, false) }));
    sprite.renderOrder = 2; // ovanpå händelsernas medaljer
    this.globe.markerGroup.add(sprite);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'gorigin gempire'; button.hidden = true;
    button.setAttribute('aria-label', `${m.name}: rikets symbol. Öppnar faktarutan om riket.`);
    button.title = `${m.name}. Klicka för att läsa mer.`;
    const it = { sprite, button, mark: m, lon: null, lat: null };
    button.addEventListener('click', () => this.onPick(it.mark));
    this.labelsEl.append(button);
    this.items.set(m.key, it);
    return it;
  }

  /** Varje bildruta: storlek på skärmen och knappens plats, som religionernas medaljer. */
  frame() { frameMedals(this.globe, this.items.values(), this.scale); }
}
