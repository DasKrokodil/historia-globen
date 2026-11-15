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
WANGEN = (9.83, 47.69)  # Wangen im Allgäu
# #1730, koordinater ur Wikidata
SAARBRUCKEN_WD = (7.0, 49.233)  # Q1724
SELFKANT = (5.917, 51.017)  # Q204743
ELTEN = (6.16, 51.871)  # Q895714
KEHL = (7.809, 48.571)  # Q15979
EUPEN = (6.033, 50.633)  # Q151831
STETTIN = (14.555, 53.425)  # Q393
DANZIG = (18.654, 54.348)  # Q1792
STRASBOURG = (7.752, 48.573)  # Q6602
WARSZAWA = (21.011, 52.23)  # Q270
KALININGRAD = (20.5, 54.717)  # Q1829
AMSTERDAM = (4.883, 52.367)  # Q727
RATZEBURG = (10.757, 53.702)  # Q490025
# #1750, ur Wikidata: Baltijsk Q5660, Forbach Q22703, Mödlareuth Q672150, Hirschberg Q630383, Amt Neuhaus Q479687,
# Gangelt Q204793, Frankfurt (Oder) Q4024, Görlitz Q4077
BALTIJSK = (19.917, 54.65)
FORBACH = (6.9, 49.188)
MODLAREUTH = (11.883, 50.415)
HIRSCHBERG = (11.82, 50.406)
AMT_NEUHAUS = (10.932, 53.285)
GANGELT = (6.0, 50.983)
FRANKFURT_ODER = (14.552, 52.342)
GORLITZ = (14.991, 51.156)
# Berlin 1949–1990 (#1731), ur Wikidata: Västberlin och Östberlin
VASTBERLIN = {'Charlottenburg': (13.3, 52.517), 'Spandau': (13.2, 52.55), 'Wedding': (13.343, 52.55), 'Kreuzberg': (13.383, 52.488),
              'Neukölln': (13.45, 52.483), 'Steglitz': (13.333, 52.467), 'Zehlendorf': (13.259, 52.434)}
# Q162049, Q158083, Q675187, Q308928, Q4071168, Q700211, Q324402
OSTBERLIN = {'Berlin-Mitte': (13.407, 52.519), 'Pankow': (13.4, 52.567), 'Köpenick': (13.577, 52.446)}  # Q2013767, Q163012, Q521521

# (grupp, punkt, namn, år, ska ligga i riket)
PUNKTER = [
    *[('osttyskland', CHARLOTTENBURG, 'Charlottenburg', y, False) for y in (1949, 1961, 1973, 1974, 1975, 1980, 1990)],
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1960, True),
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1980, True),
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1990, True),
    *[('frankrike', SAARBRUCKEN, 'Saarbrücken', y, False) for y in (1958, 1960, 1980, 2024)],
    *[('frankrike', CHARLOTTENBURG, 'Charlottenburg', y, False) for y in (1958, 1960, 1961, 1980)],
    *[('frankrike', WANGEN, 'Wangen im Allgäu', y, False) for y in (1958, 1960, 1980, 2024)],
    # Saar under Nationernas förbund 1920–1934, tysk från 1935 (#1730)
    *[(g, SAARBRUCKEN_WD, 'Saarbrücken', y, False) for g in ('weimarrepubliken', 'nazityskland', 'franska-kolonialvaldet')
      for y in (1920, 1925, 1932, 1933, 1934)],
    *[('franska-kolonialvaldet', SAARBRUCKEN_WD, 'Saarbrücken', y, False) for y in (1935, 1937, 1939)],
    *[('nazityskland', SAARBRUCKEN_WD, 'Saarbrücken', y, True) for y in (1935, 1937, 1939)],
    # Kehl: Västtyskland från 1950, inte samtidigt Frankrike
    *[('franska-kolonialvaldet', KEHL, 'Kehl', y, False) for y in (1950, 1955, 1957)],
    *[('vasttyskland', KEHL, 'Kehl', y, True) for y in (1950, 1957)],
    ('franska-kolonialvaldet', STRASBOURG, 'Strasbourg', 1955, True),
    # Selfkant och Elten: Nederländerna 1950–1962, Tyskland från 1963
    *[('nederlanderna', p, n, 1955, True) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten'))],
    *[('nederlanderna', p, n, y, False) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten')) for y in (1963, 1980, 2000)],
    *[('vasttyskland', p, n, y, True) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten')) for y in (1963, 1980)],
    *[('tyskland', p, n, 2000, True) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten'))],
    ('nederlanderna', AMSTERDAM, 'Amsterdam', 1980, True),
    # Västberlin utanför DDR och Östberlin i DDR 1949–1990 (#1731); Västberlin visas utan stat
    *[('osttyskland', p, n, y, False) for n, p in VASTBERLIN.items() for y in (1949, 1961, 1974, 1990)],
    *[('vasttyskland', p, n, y, False) for n, p in VASTBERLIN.items() for y in (1961, 1990)],
    *[('osttyskland', p, n, y, True) for n, p in OSTBERLIN.items() for y in (1949, 1961, 1974, 1990)],
    # Ratzeburg i Västtyskland, inte i DDR; städer nära gränsen ligger kvar på rätt sida
    *[('osttyskland', RATZEBURG, 'Ratzeburg', y, False) for y in (1949, 1960, 1980, 1990)],
    *[('vasttyskland', RATZEBURG, 'Ratzeburg', y, True) for y in (1960, 1980)],
    # (Wikidata: Schwerin Q1709, Erfurt Q1729, Magdeburg Q1733, Sonneberg Q499278, Lübeck Q2843, Kassel Q2865, Hof Q6938,
    # Wolfsburg Q3014)
    *[('osttyskland', p, n, 1970, True) for p, n in (((11.415, 53.629), 'Schwerin'), ((11.029, 50.978), 'Erfurt'),
                                                       ((11.64, 52.132), 'Magdeburg'), ((11.167, 50.35), 'Sonneberg'))],
    *[('vasttyskland', p, n, 1970, True) for p, n in (((10.686, 53.87), 'Lübeck'), ((9.498, 51.316), 'Kassel'),
                                                        ((11.917, 50.317), 'Hof'), ((10.787, 52.423), 'Wolfsburg'))],
    # Felen som #1745 införde (#1750)
    *[('sovjetunionen', BALTIJSK, 'Baltijsk', y, True) for y in (1946, 1950, 1960, 1985)],
    *[('franska-kolonialvaldet', FORBACH, 'Forbach', y, True) for y in (1925, 1933, 1936, 1955)],
    *[(g, FORBACH, 'Forbach', y, False) for g in ('weimarrepubliken', 'nazityskland') for y in (1925, 1932, 1934)],
    *[('osttyskland', p, n, y, True) for p, n in ((MODLAREUTH, 'Mödlareuth'), (HIRSCHBERG, 'Hirschberg'), (AMT_NEUHAUS, 'Amt Neuhaus'))
      for y in (1950, 1970, 1990)],
    *[('vasttyskland', p, n, y, False) for p, n in ((MODLAREUTH, 'Mödlareuth'), (HIRSCHBERG, 'Hirschberg'), (AMT_NEUHAUS, 'Amt Neuhaus'))
      for y in (1950, 1970, 1990)],
    *[('sovjetunionen', p, n, 1947, True) for p, n in ((MODLAREUTH, 'Mödlareuth'), (HIRSCHBERG, 'Hirschberg'))],
    ('sovjetunionen', RATZEBURG, 'Ratzeburg', 1947, False),
    ('tyskland', GANGELT, 'Gangelt', 2000, True),
    *[('osttyskland', FRANKFURT_ODER, 'Frankfurt (Oder)', y, True) for y in (1950, 1970)],
    ('tyskland', FRANKFURT_ODER, 'Frankfurt (Oder)', 2000, True),
    *[('polen', p, n, y, False) for p, n in ((FRANKFURT_ODER, 'Frankfurt (Oder)'), (GORLITZ, 'Görlitz')) for y in (1946, 1950, 1970, 2000)],
    # Eupen i Belgien 1920–1939 och från 1945
    *[('belgien', EUPEN, 'Eupen', y, True) for y in (1925, 1935, 1950, 2000)],
    # Polen 1945–1952 med gränsen 1953, inte i Sovjetunionen; Sovjetunionen behåller Kaliningrad
    *[('polen', p, n, y, True) for p, n in ((STETTIN, 'Stettin'), (DANZIG, 'Danzig'), (WARSZAWA, 'Warszawa')) for y in (1945, 1950, 1960)],
    *[('sovjetunionen', p, n, y, False) for p, n in ((STETTIN, 'Stettin'), (DANZIG, 'Danzig'), (WARSZAWA, 'Warszawa')) for y in (1945, 1950, 1960, 1980)],
    *[('sovjetunionen', KALININGRAD, 'Kaliningrad', y, True) for y in (1946, 1960)],
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
