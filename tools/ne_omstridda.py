#!/usr/bin/env python3
"""Tar ut omstridda områden ur Natural Earth till tools/ne-omstridda-omraden.geojson (#644).

Cliopatria saknar en del nutida gränser som Sveriges officiella hållning kräver (docs/omstridda-granser.md),
till exempel Västbanken, Östra Jerusalem, Gaza och Golanhöjderna, som Cliopatria räknar till Israel från 1967.
De tas därför ur Natural Earths fil över omstridda områden (ne_10m_admin_0_disputed_areas, version 5.1.1,
public domain, https://www.naturalearthdata.com/downloads/10m-cultural-vectors/). tools/riken.py läser den
lilla filen som skriptet skriver (tabellen DISPUTED).

Abchazien, Sydossetien, Nagorno-Karabach och Transnistrien tas ur samma fil (#644). För Nagorno-Karabach behövs
också Azerbajdzjans gräns ur ne_10m_admin_0_countries (samma version), eftersom Cliopatria räknar både
Nagorno-Karabach och omkringliggande områden till Armenien: det omstridda området är den del av Cliopatrias
Armenien som ligger inom Azerbajdzjans gräns i Natural Earth (DISPUTED i tools/riken.py).

Små stater som Cliopatria saknar eller har fel gräns för (#722, Rikards beslut 2026-11-07) tas också ur
ne_10m_admin_0_countries (SMALL nedan). De förenklas nästan inte, så att atollerna finns kvar, och visas som
punkter på kartan.

Kör från projektets rot, med de uppackade shapefilerna:
    python3 tools/ne_omstridda.py <ne_10m_admin_0_disputed_areas.shp> <ne_10m_admin_0_countries.shp>
Kräver pyshp och shapely (pip install pyshp shapely).
"""
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import mapping, shape

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'tools/ne-omstridda-omraden.geojson'
# id i filen: namnet i Natural Earth (NAME eller BRK_NAME)
AREAS = {
    'vastbanken': 'West Bank',
    'ostra-jerusalem': 'East Jerusalem',
    'gaza': 'Gaza',
    'golan': 'Golan Heights',
    'abchazien': 'Abkhazia',
    'sydossetien': 'South Ossetia',
    'nagorno-karabach': 'Artsakh',
    'transnistrien': 'Transnistria',
}
# Länders gränser ur ne_10m_admin_0_countries (ADM0_A3), förenklade till 0,01 grad
COUNTRIES = {'azerbajdzjan': 'AZE'}
# Små stater (#722), ur samma fil men förenklade till bara 0,002 grader och avrundade till 0,001 grad
SMALL = {'saint-kitts-och-nevis': 'KNA', 'mikronesiska-federationen': 'FSM', 'kiribati': 'KIR', 'komorerna': 'COM',
         'liechtenstein': 'LIE', 'maldiverna': 'MDV', 'marshalloarna': 'MHL', 'nauru': 'NRU', 'samoa': 'WSM',
         'san-marino': 'SMR', 'tonga': 'TON', 'tuvalu': 'TUV'}


def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], 3), round(o[1], 3)]
        return [rnd(x) for x in o]
    return o


def main():
    r = shapefile.Reader(sys.argv[1])
    fields = [f[0] for f in r.fields[1:]]
    by_name = {}
    for s in r.shapeRecords():
        a = dict(zip(fields, s.record))
        for key in (a['NAME'], a.get('BRK_NAME')):
            by_name.setdefault(key, (a, shape(s.shape.__geo_interface__)))
    feats = []
    for key, name in AREAS.items():
        a, g = by_name[name]
        m = mapping(g.buffer(0))
        feats.append({'type': 'Feature', 'properties': {'id': key, 'name': name, 'note': a.get('NOTE_BRK') or ''},
                      'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
    if len(sys.argv) > 2:
        r = shapefile.Reader(sys.argv[2])
        fields = [f[0] for f in r.fields[1:]]
        for s in r.shapeRecords():
            a = dict(zip(fields, s.record))
            for key, a3 in {**COUNTRIES, **SMALL}.items():
                if a['ADM0_A3'] == a3:
                    tol = 0.002 if key in SMALL else 0.01
                    m = mapping(shape(s.shape.__geo_interface__).buffer(0).simplify(tol, preserve_topology=True))
                    feats.append({'type': 'Feature', 'properties': {'id': key, 'name': a['NAME'], 'note': 'ne_10m_admin_0_countries'},
                                  'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
    doc = {'type': 'FeatureCollection',
           'source': 'Natural Earth 1:10m, ne_10m_admin_0_disputed_areas och ne_10m_admin_0_countries 5.1.1 (public domain), '
                     'uttaget med tools/ne_omstridda.py',
           'features': feats}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print(f'{OUT.relative_to(ROOT)}: {len(feats)} områden, {OUT.stat().st_size // 1000} kB')


if __name__ == '__main__':
    main()
