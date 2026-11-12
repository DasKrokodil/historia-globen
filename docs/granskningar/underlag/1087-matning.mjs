// Fristående räkneunderlag till #1087. Ändrar inte appen och kräver inga nya paket.
// Kör från repots rot: node docs/granskningar/underlag/1087-matning.mjs
// JSON skrivs på stdout. Webbläsarmåtten är frysta i filen bredvid detta skript.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SEGMENTS, MIN_YEAR, MAX_YEAR, yearToPos, yearsAcross } from '../../../js/timeline.js';

const root = new URL('../../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const measured = JSON.parse(fs.readFileSync(new URL('1087-webblasarmatt.json', import.meta.url), 'utf8'));
for (const [file, hash] of Object.entries(measured.sourceHashes)) {
  assert.equal(createHash('sha256').update(read(file)).digest('hex'), hash, `Källfilen ${file} skiljer sig från mättillfället`);
}
const events = JSON.parse(read('data/events.json')).events
  .filter(e => ['source-checked', 'two-sources'].includes(e.review));
assert.equal(MAX_YEAR, measured.viewports[0].max, 'Använd samma slutår som vid webbläsarmätningen');
assert.equal(MIN_YEAR, measured.viewports[0].min);
assert.deepEqual(SEGMENTS, measured.viewports[0].scale);

// Räkneantagande från beslutets "cirka 100 000 år bakåt", ingen fastslagen datagräns.
// År 2026 minus 100 000 = astronomiskt år -97974. Detta är ett skalantagande, ingen historisk datering.
const newMin = MAX_YEAR - 100000;
const fraction = 0.012; // Timeline.windowYears() i översikten
const finger = 44;     // jämförelsemåttet i #1087, inte en uppmätt användarförmåga
const segmentAt = (segments, year) => segments.find(s => year <= s.to) ?? segments.at(-1);
const density = s => (s.b - s.a) / (s.to - s.from);
const at = (segments, year) => {
  const s = segmentAt(segments, year);
  return s.a + (year - s.from) * density(s);
};
const windowAt = (segments, year) => fraction / density(segmentAt(segments, year));
const nearCount = (year, window) => events.filter(e => e.start <= year + window && e.end >= year - window).length;
const inOldRange = events.filter(e => e.start >= MIN_YEAR && e.start <= MAX_YEAR);
const oldSegments = SEGMENTS.map(s => ({ ...s }));
for (const year of [MIN_YEAR, -501, -500, -499, 0, 999, 1000, 1001, 1799, 1800, 1801, MAX_YEAR]) {
  assert.ok(Math.abs(at(oldSegments, year) - yearToPos(year)) < 1e-12);
  assert.ok(Math.abs(windowAt(oldSegments, year) - yearsAcross(year, fraction)) < 1e-9);
}

const layouts = [];
for (const count of [4, 5]) for (const share of [0.08, 0.10, 0.15]) {
  const spans = count === 4
    // Behåll gränserna -500, 1000, 1800. Utöka första segmentet bakåt.
    ? [[newMin, -500, share], [-500, 1000, (0.75 - share) / 2], [1000, 1800, (0.75 - share) / 2], [1800, MAX_YEAR, 0.25]]
    // Behåll samtliga fyra gamla spann. Ta lika många procentenheter från de tre äldsta.
    : [[newMin, MIN_YEAR, share], ...oldSegments.slice(0, 3).map(s => [s.from, s.to, (0.75 - share) / 3]), [1800, MAX_YEAR, 0.25]];
  let position = 0;
  const segments = spans.map(([from, to, size]) => {
    const s = { from, to, a: position, b: position + size };
    position += size;
    return s;
  });
  assert.ok(Math.abs(position - 1) < 1e-12);
  assert.ok(Math.abs(segments.at(-1).a - 0.75) < 1e-12);
  assert.ok(Math.abs(density(segments.at(-1)) / density(oldSegments.at(-1)) - 1) < 1e-12);
  for (let i = 1; i < segments.length; i++) {
    assert.equal(segments[i - 1].to, segments[i].from);
    assert.ok(Math.abs(segments[i - 1].b - segments[i].a) < 1e-12);
  }
  const cohort = { compressed: 0, unchanged: 0, expanded: 0 };
  for (const event of inOldRange) {
    const ratio = density(segmentAt(segments, event.start)) / density(segmentAt(oldSegments, event.start));
    cohort[ratio < 1 - 1e-12 ? 'compressed' : ratio > 1 + 1e-12 ? 'expanded' : 'unchanged']++;
  }
  const first = segments[0], mid = (first.from + first.to) / 2;
  layouts.push({
    id: `${count}-${Math.round(share * 100)}`, count, share, segments, cohort,
    oldScaleRatios: oldSegments.map(s => ({ from: s.from, to: s.to,
      ratio: density(segmentAt(segments, (s.from + s.to) / 2)) / density(s),
      starts: inOldRange.filter(e => segmentAt(oldSegments, e.start) === s).length,
    })),
    firstSegmentYears: first.to - first.from,
    firstWindow: windowAt(segments, mid),
    boundary: { year: first.to, window: windowAt(segments, first.to), afterWindow: windowAt(segments, first.to + 1),
      nearRecords: nearCount(first.to, windowAt(segments, first.to)),
      baselineNearRecords: nearCount(first.to, yearsAcross(first.to, fraction)),
    },
  });
}

const baseline = measured.viewports.map(v => {
  assert.equal(v.pageErrors.length, 0);
  assert.equal(v.scroll, false);
  assert.ok(Math.abs(v.modernPixels - v.track.width * 0.25) < 1e-9);
  return { viewport: v.viewport, trackWidth: v.track.width, trackHeight: v.track.height,
    modernPixels: v.modernPixels, modernDecorativePixels: v.segments.at(-1).width,
    modernPxPerYear: v.modernPixels / (MAX_YEAR - 1800),
    modernFingerYears: finger / v.modernPixels * (MAX_YEAR - 1800),
  };
});
const cases = baseline.flatMap(v => layouts.map(layout => {
  const width = layout.share * v.trackWidth;
  const modern = density(layout.segments.at(-1)) * v.trackWidth;
  assert.ok(Math.abs(modern - v.modernPxPerYear) < 1e-9);
  return { viewport: v.viewport, layout: layout.id, firstPixels: width,
    firstPxPerYear: width / layout.firstSegmentYears,
    fingerLinearYears: finger / width * layout.firstSegmentYears,
    fingerWithinSegmentYears: Math.min(finger, width) / width * layout.firstSegmentYears,
    firstSmallerThanFinger: width < finger,
    modernPxPerYear: modern, modernPixels: modern * (MAX_YEAR - 1800),
  };
}));

console.log(JSON.stringify({ sourceCommit: measured.sourceCommit, measuredAt: measured.measuredAt,
  assumptions: { newMin, maxYear: MAX_YEAR, newMinIsProposal: true, fingerCssPixels: finger, overviewWindowFraction: fraction },
  records: { reviewed: events.length, startsInCurrentRange: inOldRange.length, startsBeforeCurrentRange: events.filter(e => e.start < MIN_YEAR).length },
  baseline, layouts, cases,
}, null, 2));
