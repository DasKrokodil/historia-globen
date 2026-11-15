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

Västtysklands delstater längs gränsen mot DDR (Schleswig-Holstein, Niedersachsen, Hessen och Bayern) tas ur
ne_10m_admin_1_states_provinces (version 5.1.2, samma fil som tools/platser_gransar.py), eftersom Cliopatrias gräns mellan
DDR och Västtyskland är grov (Ratzeburg ligger i Cliopatrias DDR, #1730).

Kring Tyskland (#1755) tas också Frankrikes, Nederländernas, Kaliningradområdets, Litauens och Tjeckiens gränser ur
ne_10m_admin_0_countries, bara inom en ruta (CLIPPED), och Saarlands gräns ur admin 1. Vid Bodensee, Basel och längs gränsen
mellan Österrike och Tyskland (#1771) tas Schweiz och Österrike med på samma sätt.

Kör från projektets rot, med de uppackade shapefilerna och delstaternas GeoJSON:
    python3 tools/ne_omstridda.py <ne_10m_admin_0_disputed_areas.shp> <ne_10m_admin_0_countries.shp> \
        <ne_10m_admin_1_states_provinces.geojson>
Kräver pyshp och shapely (pip install pyshp shapely).
"""
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import box, mapping, shape
from shapely.ops import unary_union

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
COUNTRIES = {'azerbajdzjan': 'AZE', 'tyskland': 'DEU', 'polen-ne': 'POL'}  # Tyskland: Selfkant och Elten efter 1963 (#1730)
# Länder som bara behövs i en ruta (väst, syd, öst, nord), förenklade som Tyskland (#1755): Frankrikes europeiska del
# (gränsen mot Tyskland, Forbach), Nederländerna i Europa (gränsen mot Tyskland), Kaliningradområdet med grannarna Polen och
# Litauen, och Tjeckien längs gränsen mot Tyskland (Selb)
CLIPPED = {'frankrike-ne': ('FRA', (-5.5, 41.0, 10.0, 51.5)), 'nederlanderna-ne': ('NLD', (3.0, 50.6, 7.5, 53.8)),
           'kaliningrad-ne': ('RUS', (19.4, 54.2, 22.95, 55.4)),
           # Litauen till 55,75 grader nord, så att hela den litauiska delen av Kuriska näset (Nida) och Klaipėda kommer med (#1771)
           'litauen-ne': ('LTU', (19.4, 54.2, 22.95, 55.75)),
           'tjeckien-ne': ('CZE', (11.9, 48.5, 15.1, 51.1)),
           # Schweiz och Österrike längs gränserna mot Tyskland och Frankrike och vid Bodensee, Basel och Vorarlberg (#1771)
           'schweiz-ne': ('CHE', (5.9, 45.8, 10.5, 47.85)), 'osterrike-ne': ('AUT', (7.5, 47.0, 14.1, 48.9)),
           # Zanzibar (#1534): Unguja och Pemba ur Tanzanias gräns, var sin ruta som inte når fastlandet (Tanga, Bagamoyo)
           'unguja-ne': ('TZA', (39.17, -6.5, 39.6, -5.7)), 'pemba-ne': ('TZA', (39.55, -5.5, 39.9, -4.85))}
# Små stater (#722), ur samma fil men förenklade till bara 0,002 grader och avrundade till 0,001 grad
# Delstater ur ne_10m_admin_1_states_provinces (adm1_code), sammanslagna och förenklade till 0,003 grader (#1730, #1750)
STATES = {'vasttyska-granslander': ['DEU-1579', 'DEU-1576', 'DEU-1574', 'DEU-1591'],
          'berlin': ['DEU-1599'],
          'saarland': ['DEU-1581'],  # Saarområdet 1920–1935 ligger inom Saarland (Zweibrücken låg utanför, #1755)
          # DDR:s delstater (Mecklenburg-Vorpommern, Brandenburg, Sachsen-Anhalt, Thüringen och Sachsen), #1750
          'osttyska-lander': ['DEU-3488', 'DEU-3487', 'DEU-1600', 'DEU-1577', 'DEU-1601']}  # hela Berlin; Östberlin är Berlin minus Västberlin (tools/vastberlin.geojson, #1731)
SMALL = {'saint-kitts-och-nevis': 'KNA', 'mikronesiska-federationen': 'FSM', 'kiribati': 'KIR', 'komorerna': 'COM',
         'liechtenstein': 'LIE', 'maldiverna': 'MDV', 'marshalloarna': 'MHL', 'nauru': 'NRU', 'samoa': 'WSM',
         'san-marino': 'SMR', 'tonga': 'TON', 'tuvalu': 'TUV', 'andorra': 'AND', 'monaco': 'MCO'}


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
                    # Tyskland finare (0,003 grader), annars hamnar Görlitz vid Neisse utanför gränsen (#1750)
                    tol = 0.002 if key in SMALL else 0.003 if key in ('tyskland', 'polen-ne') else 0.01
                    m = mapping(shape(s.shape.__geo_interface__).buffer(0).simplify(tol, preserve_topology=True))
                    feats.append({'type': 'Feature', 'properties': {'id': key, 'name': a['NAME'], 'note': 'ne_10m_admin_0_countries'},
                                  'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
            for key, (a3, ruta) in CLIPPED.items():
                if a['ADM0_A3'] == a3:
                    g = shape(s.shape.__geo_interface__).buffer(0).intersection(box(*ruta))
                    # bara ytor: snittet med rutan kan ge linjer och punkter där gränsen följer rutans kant
                    g = unary_union([q for q in getattr(g, 'geoms', [g]) if q.geom_type in ('Polygon', 'MultiPolygon')])
                    m = mapping(g.simplify(0.003, preserve_topology=True))
                    feats.append({'type': 'Feature', 'properties': {'id': key, 'name': a['NAME'], 'note': 'ne_10m_admin_0_countries, inom rutan'},
                                  'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
    if len(sys.argv) > 3:
        states = {f['properties']['adm1_code']: f for f in json.loads(Path(sys.argv[3]).read_text())['features']}
        for key, codes in STATES.items():
            g = unary_union([shape(states[c]['geometry']).buffer(0) for c in codes])
            m = mapping(g.simplify(0.003, preserve_topology=True))  # som Tyskland (#1750)
            feats.append({'type': 'Feature', 'properties': {'id': key, 'name': ', '.join(states[c]['properties']['name'] for c in codes),
                                                            'note': 'ne_10m_admin_1_states_provinces 5.1.2'},
                          'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
    doc = {'type': 'FeatureCollection',
           'source': 'Natural Earth 1:10m, ne_10m_admin_0_disputed_areas och ne_10m_admin_0_countries 5.1.1 (public domain), '
                     'uttaget med tools/ne_omstridda.py',
           'features': feats}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print(f'{OUT.relative_to(ROOT)}: {len(feats)} områden, {OUT.stat().st_size // 1000} kB')


if __name__ == '__main__':
    main()
