#!/usr/bin/env python3
"""Kontrollpunkter i rikenas gränser (#1706): platser som ska ligga i, eller utanför, ett rike vissa år.

Provet läser data/empires/<grupp>.json och testar punkt i polygon (jämnt–udda-regeln, med hål) utan shapely, så att det går
i CI: python3 -I tests/riken-kontrollpunkter-test.py. En ny kontrollpunkt läggs till i PUNKTER när ett gränsfel rättas.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CHARLOTTENBURG = (13.29, 52.52)  # Västberlin
SAARBRUCKEN = (6.99, 49.23)
VAXHOLM = (18.35, 59.40)  # Stockholms skärgård
TRONDHEIM = (10.65, 63.55)
FINNMARK = (21.85, 70.25)
KARELEN = (35.0, 62.5)
NAXOS = (25.45, 37.1)
LEVANTEN = (35.86, 33.0)

# (grupp, punkt, namn, år, ska ligga i riket)
PUNKTER = [
    *[('osttyskland', CHARLOTTENBURG, 'Charlottenburg', y, False) for y in (1949, 1961, 1973, 1974, 1975, 1980, 1990)],
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1960, True),
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1980, True),
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1990, True),
    *[('frankrike', SAARBRUCKEN, 'Saarbrücken', y, False) for y in (1958, 1960, 1980, 2024)],
    *[('frankrike', CHARLOTTENBURG, 'Charlottenburg', y, False) for y in (1958, 1960, 1961, 1980)],
    *[('nazityskland', VAXHOLM, 'Vaxholm', y, False) for y in range(1933, 1945)],
    *[('nazityskland', KARELEN, 'ryska Karelen', y, False) for y in range(1933, 1945)],
    *[('nazityskland', LEVANTEN, 'Levanten', y, False) for y in range(1933, 1945)],
    *[('nazityskland', TRONDHEIM, 'Trondheim', y, False) for y in range(1933, 1940)],
    *[('nazityskland', FINNMARK, 'Finnmark', y, False) for y in range(1933, 1940)],
    *[('nazityskland', NAXOS, 'Naxos', y, False) for y in range(1933, 1941)],
    # Rättningen tar inte bort det som ska vara kvar: Berlin och Saarbrücken i Nazityskland, ockuperade Norge 1940
    ('nazityskland', CHARLOTTENBURG, 'Charlottenburg', 1937, True),
    ('nazityskland', SAARBRUCKEN, 'Saarbrücken', 1937, True),
    ('nazityskland', TRONDHEIM, 'Trondheim', 1941, True),
]


def in_ring(pt, ring):
    x, y = pt
    inside = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def in_geometry(pt, geom):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    return any(in_ring(pt, poly[0]) and not any(in_ring(pt, hole) for hole in poly[1:]) for poly in polys)


def in_group(gid, pt, year):
    doc = json.loads((ROOT / f'data/empires/{gid}.json').read_text(encoding='utf-8'))
    return any(q['start'] <= year <= q['end'] and in_geometry(pt, q['geometry'])
               for p in doc['polities'] for q in p['periods'])


fel = []
# Enhetsprov för punkt i polygon, med hål
ruta = {'type': 'Polygon', 'coordinates': [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]], [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]]}
if not in_geometry((1, 1), ruta) or in_geometry((5, 5), ruta) or in_geometry((11, 5), ruta):
    fel.append('punkt i polygon med hål ger fel svar')

for gid, pt, namn, year, ska in PUNKTER:
    if in_group(gid, pt, year) != ska:
        fel.append(f'{namn} {pt} år {year}: {"saknas i" if ska else "ligger i"} {gid}')

if fel:
    print('\n'.join(fel))
    sys.exit(1)
print(f'riken-kontrollpunkter: {len(PUNKTER)} kontrollpunkter stämmer')
