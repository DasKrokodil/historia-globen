// Symbolen där en religion uppstod (#271), som klickbar markör ovanpå klotet. Den ersätter den lila stjärnan (#90).
// Markören är samma mässingsmedalj som händelsernas (#242), med religionens färg i den inre cirkeln och religionens
// symbol (fältet symbol i religions.json, img/icons/) i mitten. Den står vid händelsen som facts.origin pekar på, syns
// från händelsens startår och står kvar så länge religionen syns i religionslagret (ReligionsLayer.stars).
// Samma medalj ritas på den platta lagerbilden av ReligionsLayer.drawOverlay (beslut 1); 3D-markören täcker den.
// En osynlig knapp ligger över markören, så att den går att nå med tangentbordet och har en aria-label.
import { THREE, latLonToVec3, R } from '../globe.js';
import { medalTexture } from './events.js';
import { t, formatEventTime } from '../model.js';
import { ORIGIN_R } from './religions.js';

export const MIN_PX = 26; const MAX_PX = 46; // lite större än händelsernas medaljer (16–48 px), så att symbolen syns
const INFO = { when: 'now', major: false, unsure: false };

export class OriginMarkers {
  constructor(globe, labelsEl) {
    this.globe = globe;
    this.labelsEl = labelsEl;
    this.items = new Map(); // religionens id → { sprite, button, religion, event }
    this.onPick = () => {};
    this.scale = 1; // medaljens storlek på lagerbilden (ReligionsLayer.labelScale)
  }

  /** Id för händelserna som har en synlig symbol, så att händelsens egen medalj kan döljas under den. */
  get eventIds() { return new Set([...this.items.values()].filter(it => it.sprite.visible).map(it => it.event.id)); }

  /** stars = ReligionsLayer.stars ([{ religion, event }]); show = false när religionslagret är av eller dämpat. */
  update(stars, show = true) {
    const now = new Set();
    for (const { religion, event } of show ? stars : []) {
      now.add(religion.id);
      let it = this.items.get(religion.id);
      if (!it) it = this._make(religion, event);
      it.sprite.visible = true;
    }
    for (const [id, it] of this.items) if (!now.has(id)) { it.sprite.visible = false; it.button.hidden = true; }
  }

  _make(religion, event) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false,
      map: medalTexture(religion.symbol || null, religion.color, INFO, false) }));
    sprite.position.copy(latLonToVec3(event._lat, event._lon, R * 1.014));
    sprite.renderOrder = 2; // ovanpå händelsernas medaljer
    this.globe.markerGroup.add(sprite);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'gorigin'; button.hidden = true;
    const name = t(religion.name);
    const desc = `${name} uppstod här: ${t(event.title)}, ${formatEventTime(event)}. Öppnar faktarutan om ${name.toLowerCase()}.`;
    button.setAttribute('aria-label', desc); button.title = `${name}: där religionen uppstod. Klicka för faktarutan.`;
    button.addEventListener('click', () => this.onPick(religion.id));
    this.labelsEl.append(button);
    const it = { sprite, button, religion, event };
    this.items.set(religion.id, it);
    return it;
  }

  /** Varje bildruta: storlek på skärmen och knappens plats (frameMedals). */
  frame() { frameMedals(this.globe, this.items.values(), this.scale); }
}

/**
 * Varje bildruta, för medaljer som 3D-markörer ({ sprite, button }): storlek på skärmen (minst lika stor som
 * medaljen på lagerbilden) och den osynliga knappens plats. Delas av religionernas ursprung och rikenas symboler (#301).
 */
export function frameMedals(globe, items, scale) {
  const cam = globe.camera, h = globe.canvas.clientHeight || 1;
  const perPx = 2 * Math.max(0.2, cam.position.z - R) * Math.tan(cam.fov / 2 * Math.PI / 180) / h;
  // Medaljen på lagerbilden har radien ORIGIN_R · k · scale (k = 2 på bilden 4096 × 2048, där 2048 bildpunkter är
  // 180 grader, alltså π · R på klotet). 3D-medaljen görs lite större, så att den täcker den helt.
  const cover = 2 * ORIGIN_R * 2 * scale * Math.PI * R / 2048 * 1.15;
  for (const { sprite, button } of items) {
    if (!sprite.visible) continue;
    const px = Math.max(MIN_PX, Math.min(MAX_PX, cover / perPx));
    sprite.scale.setScalar(Math.max(px * perPx, cover));
    const p = globe.project(sprite.position);
    const size = Math.max(px, cover / perPx);
    button.hidden = p.facing < 0.1;
    if (!button.hidden) {
      button.style.width = button.style.height = `${Math.round(size)}px`;
      button.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
    }
  }
}
