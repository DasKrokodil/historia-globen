// Bygger en färdigprojicerad kustkarta ur Natural Earth (world-atlas) i samma format som data/land.json:
// { source, note, width, height, path }, path i pixelrymden 4096 × 2048, ekvirektangulär, klippt vid datumlinjen.
//
//   NODE_PATH=<mapp med d3-geo och topojson-client> node tools/land_10m.mjs <land-10m.json> <ut.json> [decimaler] [upplösning]
//
// Används för data/land-10m.json (1:10m, laddas bara när det skarpa utsnittet vid inzoomning används, se
// docs/beslut/2026-11-07-skarpt-utsnitt-vid-inzoomning.md). land-10m.json hämtas från
// https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-10m.json (Natural Earth, public domain).
// Med upplösning 50 och samma indata kan data/land.json återskapas för att kontrollera att flödet stämmer.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { geoEquirectangular, geoPath, geoArea } = require('d3-geo');
const { feature } = require('topojson-client');

const [, , inFile, outFile, digitsArg = '2', res = '10'] = process.argv;
if (!inFile || !outFile) { console.error('Användning: node tools/land_10m.mjs <land-NNm.json> <ut.json> [decimaler] [10|50]'); process.exit(1); }
const W = 4096, H = 2048;
const topo = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const collection = feature(topo, topo.objects.land);
// Några småöar (till exempel i Maldiverna) har i 1:10m ringar som kvantiseringen har gjort till tre punkter på en linje.
// d3 räknar en sådan ring som "allt utom ringen" (sfärisk area 4π) och fyller hela kartan. De har ingen yta och tas bort.
const FULL_SPHERE = 6;
const dropped = [];
const land = { type: 'MultiPolygon', coordinates: collection.features.flatMap(f => f.geometry.coordinates).filter(poly => {
  const bad = geoArea({ type: 'Polygon', coordinates: poly }) > FULL_SPHERE;
  if (bad) dropped.push(poly[0][0]);
  return !bad;
}) };
if (dropped.length) console.log(`Tog bort ${dropped.length} ringar utan yta (kvantiserade småöar), till exempel vid ${dropped[0].map(v => v.toFixed(2))}`);
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]).precision(0.1);
const path = geoPath(projection).digits(Number(digitsArg))(land);
fs.writeFileSync(outFile, JSON.stringify({
  source: 'natural-earth',
  note: `Natural Earth 1:${res}m land (world-atlas 2.0.2), projicerad ekvirektangulärt med d3-geo och klippt vid datumlinjen. Path i pixelrymden ${W}x${H}.`,
  width: W, height: H, path,
}));
console.log(`${outFile}: ${path.length} tecken, ${(path.match(/L/g) || []).length} linjesegment`);
