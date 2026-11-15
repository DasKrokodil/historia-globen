#!/usr/bin/env python3
"""Västberlins gräns 1949–1990 ur Berlins öppna data (#1731) till tools/vastberlin.geojson.

Cliopatrias hål i DDR för Västberlin stämmer bara ungefär: det täcker också delar av Östberlin, och södra Västberlin
ligger kvar i DDR (#1706, #1731). Gränsen tas i stället ur datamängden "Verlauf der Berliner Mauer, 1989" (WFS-tjänsten
https://gdi.berlin.de/services/wfs/berlinermauer, Forum für Geschichte und Gegenwart e.V. och Senatsverwaltung für
Stadtentwicklung, Bauen und Wohnen Berlin; licens Datenlizenz Deutschland – Zero – Version 2.0, utan villkor, som CC0):
gränsmuren ("Vorderlandmauer", lagret a_grenzmauer) och den politiska gränsen där den avviker från muren
(c_politischegrenze), handritade efter ett flygfoto 25 april 1989.

Linjerna slutar inte exakt i varandra, så de breddas 0,0002 grader (cirka 15–20 m) och slås ihop. Det största hålet i
den sammanslagna ytan är Västberlin, som sedan breddas tillbaka lika mycket. Exklaverna (till exempel Steinstücken, som
fick en väg till Västberlin 1972) är för små för kartan och tas inte med.

    python3 tools/vastberlin.py                         hämtar lagren ur WFS-tjänsten
    python3 tools/vastberlin.py <a_grenzmauer.json> <c_politischegrenze.json>   använder nedladdade GeoJSON-filer
Kräver shapely.
"""
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from shapely.geometry import Polygon, mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'tools/vastberlin.geojson'
WFS = 'https://gdi.berlin.de/services/wfs/berlinermauer'
LAYERS = ('a_grenzmauer', 'c_politischegrenze')
WIDTH = 0.0002  # grader: linjerna breddas så här mycket för att slutas


def layer(name):
    q = urllib.parse.urlencode({'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
                                'typeNames': f'berlinermauer:{name}', 'outputFormat': 'application/json',
                                'srsName': 'EPSG:4326'})
    req = urllib.request.Request(f'{WFS}?{q}', headers={'User-Agent': 'historia-globen-vastberlin/1.0 (hobbyprojekt)'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], 4), round(o[1], 4)]
        return [rnd(x) for x in o]
    return o


def main():
    docs = [json.loads(Path(p).read_text()) for p in sys.argv[1:3]] if len(sys.argv) > 2 else [layer(n) for n in LAYERS]
    lines = [shape(f['geometry']) for d in docs for f in d['features']]
    band = unary_union([x.buffer(WIDTH) for x in lines])
    holes = [Polygon(r) for g in getattr(band, 'geoms', [band]) for r in g.interiors]
    # Förenklad till 0,0005 grader (cirka 40 m) och avrundad till fyra decimaler (cirka 10 m); kartan avrundar ändå
    # DDR:s gräns till två decimaler
    wb = max(holes, key=lambda p: p.area).buffer(WIDTH).simplify(0.0005, preserve_topology=True)
    # Avrundningen kan ge en ring som korsar sig själv; den görs giltig igen, och den största delen behålls
    wb = shape({'type': 'Polygon', 'coordinates': rnd(mapping(wb)['coordinates'])}).buffer(0)
    wb = max(getattr(wb, 'geoms', [wb]), key=lambda p: p.area)
    doc = {'type': 'FeatureCollection',
           'source': 'Verlauf der Berliner Mauer, 1989 (gdi.berlin.de, Datenlizenz Deutschland – Zero – Version 2.0), '
                     'lagren a_grenzmauer och c_politischegrenze, uttaget med tools/vastberlin.py',
           'features': [{'type': 'Feature', 'properties': {'id': 'vastberlin', 'name': 'West-Berlin'},
                         'geometry': {'type': 'Polygon', 'coordinates': rnd(mapping(wb)['coordinates'])}}]}
    if not shape(doc['features'][0]['geometry']).is_valid:
        raise SystemExit('Västberlins gräns blev ogiltig efter avrundningen')
    OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print(f'{OUT.relative_to(ROOT)}: Västberlin, {len(lines)} linjer, {OUT.stat().st_size // 1000} kB')


if __name__ == '__main__':
    main()
