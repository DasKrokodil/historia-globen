#!/usr/bin/env python3
"""Kontrollerar tidsstyrda rikesflaggor och deras medaljpunkter (#1532).

Kör från repots rot: ``python3 tools/flaggkontroll.py``.  Natural Earths
admin-0-data hämtas en gång till ``tools/.cache/`` och används sedan lokalt;
``--no-network`` gör körningen helt nätfri och kräver den cachade filen.
"""
import argparse
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / 'data/empires/index.json'
CACHE = ROOT / 'tools/.cache/countries-50m.json'
URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json'

# Natural Earths engelska namn skiljer sig från några av rikenas namn.
ALIASES = {
    'bahamas': 'Bahamas', 'bolivia': 'Bolivia', 'brunei': 'Brunei',
    'centralafrikanska republiken': 'Central African Republic',
    'demokratiska republiken kongo': 'Democratic Republic of the Congo',
    'elfenbenskusten': "Côte d'Ivoire", 'forenade arabemiraten': 'United Arab Emirates',
    'guinea bissau': 'Guinea-Bissau', 'kap verde': 'Cape Verde',
    'kina': 'China', 'kongo': 'Republic of the Congo', 'moldavien': 'Moldova',
    'nordmakedonien': 'North Macedonia', 'osttimor': 'Timor-Leste',
    'rysska federationen': 'Russia', 'sydkorea': 'South Korea',
    'sydsudan': 'South Sudan', 'tjeckien': 'Czechia', 'turkiet': 'Turkey',
    'usa': 'United States of America', 'vatikanstaten': 'Vatican',
    'vietnam': 'Vietnam', 'colombia': 'Colombia', 'ryska-federationen': 'Russia',
    'gambia': 'Gambia',
    'centralafrikanska-republiken': 'Central African Rep.',
    'sydsudan': 'S. Sudan', 'nordmakedonien': 'Macedonia',
    'salomonoarna': 'Solomon Is.', 'sao-tome-och-principe': 'Sao Tome and Principe',
    'antigua-och-barbuda': 'Antigua and Barb.', 'saint-kitts-och-nevis': 'St. Kitts and Nevis',
    'brasilien': 'Brazil', 'saint-vincent-och-grenadinerna': 'St. Vin. and Gren.',
    'dominikanska-republiken': 'Dominican Rep.',
    'bosnien-och-hercegovina': 'Bosnia and Herz.',
    'irak': 'Iraq',
}
# 1:50m förenklar eller särredovisar dessa områden. De kontrolleras i respektive
# plats-/granskningsunderlag, inte med en falskt exakt point-in-polygon här.
NE_EXCEPTIONS = {'cypern', 'singapore', 'palau', 'monaco', 'tuvalu'}


def norm(value):
    plain = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', plain)


def load_topology(no_network):
    if not CACHE.exists():
        if no_network:
            raise SystemExit(f'{CACHE.relative_to(ROOT)} saknas (kör utan --no-network en gång)')
        CACHE.parent.mkdir(exist_ok=True)
        print('hämtar Natural Earth admin-0 till lokal cache …', file=sys.stderr)
        with urllib.request.urlopen(URL, timeout=60) as response:
            CACHE.write_bytes(response.read())
    return json.loads(CACHE.read_text())


def decode_arcs(topology):
    sx, sy = topology['transform']['scale']
    tx, ty = topology['transform']['translate']
    decoded = []
    for arc in topology['arcs']:
        x = y = 0
        points = []
        for dx, dy in arc:
            x += dx; y += dy
            points.append((x * sx + tx, y * sy + ty))
        decoded.append(points)
    return decoded


def join_ring(arcs, indexes):
    points = []
    for index in indexes:
        arc = arcs[index] if index >= 0 else list(reversed(arcs[~index]))
        points.extend(arc if not points else arc[1:])
    return points


def contains(ring, lon, lat):
    inside = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        if (y1 > lat) != (y2 > lat) and lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def country_rings(topology):
    arcs = decode_arcs(topology)
    countries = {}
    for feature in topology['objects']['countries']['geometries']:
        polygons = feature['arcs'] if feature['type'] == 'MultiPolygon' else [feature['arcs']]
        rings = [join_ring(arcs, polygon[0]) for polygon in polygons if polygon]
        countries[norm(feature['properties']['name'])] = rings
    return countries


def label_for_year(group, data, year):
    for override in group.get('labelAt', []):
        if override.get('from', group['from']) <= year <= override.get('to', group['to']):
            return override.get('at')
    for polity in data.get('polities', []):
        for period in polity.get('periods', []):
            if period['start'] <= year <= period['end']:
                return period.get('label')
    return None


def report(errors, group, year, message):
    errors.append((group, year, message))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--no-network', action='store_true', help='kräv redan cachad Natural Earth-fil')
    args = parser.parse_args()
    countries = country_rings(load_topology(args.no_network))
    index = json.loads(INDEX.read_text())
    errors = []
    for group in index['groups']:
        flags = group.get('flags', [])
        if not flags:
            continue
        area_file = ROOT / group['file']
        data = json.loads(area_file.read_text()) if area_file.exists() else None
        polities = (data or {}).get('polities', [])
        for flag in flags:
            start, end = flag.get('from'), flag.get('to', group['to'])
            if not isinstance(start, int) or not isinstance(end, int) or start > end:
                report(errors, group['id'], start or group['from'], 'flaggan har ogiltigt from/to')
                continue
            if start < group['from'] or end > group['to']:
                report(errors, group['id'], start, f'flaggan {flag.get("file", "?")} ligger utanför gruppens år')
            if not (ROOT / 'img/flags' / f'{flag.get("file", "")}.svg').is_file():
                report(errors, group['id'], start, f'flaggan {flag.get("file", "?")} saknar SVG-fil')
            # Själva rikets fil ska fortfarande peka ut minst en kontrollerbar polity.
            if not any(p.get('wikidata', '').startswith('Q') for p in polities):
                report(errors, group['id'], start, 'gruppen saknar polity med Wikidata-id')
            # Nutida stater ska ha medaljen i dagens Natural Earth-land. Historiska riken saknar
            # en entydig admin-0-motsvarighet och kontrolleras därför ovan mot sin egen polity.
            if not group.get('modernState') or group['id'] in NE_EXCEPTIONS:
                continue
            name = ALIASES.get(group['id'], group['name'].get('en', group['id']))
            rings = countries.get(norm(name))
            if not rings:  # ett nytt namn i Natural Earth: strukturkontrollen ovan kör ändå
                print(f'{group["id"]}: Natural Earth-namn saknas för {name}; platskontrollen hoppas över', file=sys.stderr)
                continue
            last_point = object()
            for year in range(start, end + 1):
                point = label_for_year(group, data, year)
                if not point or point == last_point:
                    continue
                last_point = point
                if not any(contains(ring, point[0], point[1]) for ring in rings):
                    report(errors, group['id'], year, f'medaljens punkt {point} ligger utanför {name} i Natural Earth')
    for group, year, message in errors:
        print(f'{group}\t{year}\t{message}')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
