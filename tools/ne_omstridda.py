#!/usr/bin/env python3
"""Tar ut omstridda områden ur Natural Earth till tools/ne-omstridda-omraden.geojson (#644).

Cliopatria saknar en del nutida gränser som Sveriges officiella hållning kräver (docs/omstridda-granser.md),
till exempel Västbanken, Östra Jerusalem, Gaza och Golanhöjderna, som Cliopatria räknar till Israel från 1967.
De tas därför ur Natural Earths fil över omstridda områden (ne_10m_admin_0_disputed_areas, version 5.1.1,
public domain, https://www.naturalearthdata.com/downloads/10m-cultural-vectors/). tools/riken.py läser den
lilla filen som skriptet skriver (tabellen DISPUTED).

Kör från projektets rot, med den uppackade shapefilen:
    python3 tools/ne_omstridda.py <ne_10m_admin_0_disputed_areas.shp>
Kräver pyshp och shapely (pip install pyshp shapely).
"""
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import mapping, shape

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'tools/ne-omstridda-omraden.geojson'
# id i filen: namnet (NAME) i Natural Earth
AREAS = {
    'vastbanken': 'West Bank',
    'ostra-jerusalem': 'East Jerusalem',
    'gaza': 'Gaza',
    'golan': 'Golan Heights',
}


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
        by_name[a['NAME']] = (a, shape(s.shape.__geo_interface__))
    feats = []
    for key, name in AREAS.items():
        a, g = by_name[name]
        m = mapping(g.buffer(0))
        feats.append({'type': 'Feature', 'properties': {'id': key, 'name': name, 'note': a.get('NOTE_BRK') or ''},
                      'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
    doc = {'type': 'FeatureCollection',
           'source': 'Natural Earth 1:10m, ne_10m_admin_0_disputed_areas 5.1.1 (public domain), uttaget med tools/ne_omstridda.py',
           'features': feats}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print(f'{OUT.relative_to(ROOT)}: {len(feats)} områden, {OUT.stat().st_size // 1000} kB')


if __name__ == '__main__':
    main()
