import test from 'node:test';
import assert from 'node:assert/strict';
import { TourPlayer } from '../js/ui/tour.js';

test('ett platskort som laddas vid slutsteget öppnas inte efter att jakten startat (#1709)', async () => {
  let finish;
  const loading = new Promise(resolve => { finish = resolve; });
  let opened = false;
  const player = Object.create(TourPlayer.prototype);
  const step = { place: 'en-plats' };
  Object.assign(player, {
    tour: { steps: [step] }, index: 0, card: { hidden: false, querySelector: () => null }, huntHidden: false,
    app: {
      lesson: { active: true }, root: { classList: { remove() {}, add() {} } },
      globe: { setViewLift() {} }, select() {},
      places: {
        closeStep() {},
        async openStep(id, { current }) {
          await loading;
          if (!current()) return false;
          opened = true;
          return true;
        },
      },
    },
  });
  player.lift = () => {};
  const showing = player.showPlace(step, true);
  player.hideForHunt();
  player.resumeAfterHunt(); // en sen hämtning ska vara ogiltig även efter att eleven kommit tillbaka
  finish();
  assert.equal(await showing, false);
  assert.equal(opened, false);
  assert.equal(player.card.hidden, false);
});
