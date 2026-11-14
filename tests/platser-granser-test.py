#!/usr/bin/env python3
"""Platsernas gränser vid datumlinjen (#1268), utan nätverk.

1. tools/platser_gransar.py delar en ring som korsar 180° vid 180° med sömpunkter, så att varje delring ligger på ena
   sidan, ytan är bevarad och ingen kant hoppar mer än 180° i längdgrad (konstruerad Rysslandsring, en ring med två
   lober på samma sida och Fiji-lika småringar), och en ring som inte korsar lämnas orörd.
2. data/platser.json har inga ringhopp, och en omdelning av dess ringar ändrar ingenting (omkörning ger tom diff).
3. Kopian av inGeometry och edgeKm i scripts/validate-site.py ger samma svar som js/place-geo.js på de fall som
   tests/place-geo.test.mjs också kör (tests/fixtures/datumlinjen.json), så att JS och Python inte glider isär.
Körs i CI: python3 -I tests/platser-granser-test.py
"""
import json
import math
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
import platser_gransar as pg  # noqa: E402

fel = []


def check(ok, msg):
    if not ok:
        fel.append(msg)


def jumps(ring):
    return sum(1 for a, b in zip(ring, ring[1:]) if abs(a[0] - b[0]) > 180)


def raw(unwrapped):
    """Samma ring med längdgraderna över 180 skrivna som i GeoJSON (190 blir −170)."""
    return [[((x + 180) % 360) - 180 if abs(x) > 180 else x, y] for x, y in unwrapped]


# 1. Delningen
ryssland = raw([[100, 50], [150, 50], [190, 50], [190, 70], [150, 70], [100, 70], [100, 50]])
check(jumps(ryssland) == 2, 'provringen ska hoppa två gånger')
delar = pg.split_ring(ryssland)
check(len(delar) == 2, f'Rysslandsringen ska bli två delringar, blev {len(delar)}')
check(all(jumps(d) == 0 and d[0] == d[-1] and len(d) >= 4 for d in delar), 'delringarna ska vara slutna och sakna hopp')
check(abs(sum(pg._area(d) for d in delar) - 90 * 20) < 1e-6, 'ytan ska bevaras vid delningen')
check(sorted((min(p[0] for p in d), max(p[0] for p in d)) for d in delar) == [(-180, -170), (100, 180)],
      f'delringarna ska sluta på exakt 180 och −180: {[(min(p[0] for p in d), max(p[0] for p in d)) for d in delar]}')

# Två lober på östra sidan: sömmen ska paras ihop rätt (en delring väster om linjen, två öster om den)
lober = raw([[170, 0], [190, 0], [190, 10], [175, 10], [175, 20], [190, 20], [190, 30], [170, 30], [170, 0]])
delar = pg.split_ring(lober)
check(len(delar) == 3, f'ringen med två lober ska bli tre delringar, blev {len(delar)}')
check(sorted(round(pg._area(d), 6) for d in delar) == [100, 100, 250], f'ytorna ska vara 100, 100 och 250: {[pg._area(d) for d in delar]}')
check(all(jumps(d) == 0 for d in delar), 'delringarna med lober ska sakna hopp')

# Fiji-lik liten ring, och en ring på västra sidan av linjen (−170 → 170 åt andra hållet)
fiji = raw([[179.5, -17], [190.5, -17], [190.5, -16], [179.5, -16], [179.5, -17]])
delar = pg.split_ring(fiji)
check(len(delar) == 2 and all(jumps(d) == 0 for d in delar), 'en liten ring över linjen ska delas i två')
omvand = raw([[-179.5, -17], [-179.5, -16], [-190.5, -16], [-190.5, -17], [-179.5, -17]])
delar = pg.split_ring(omvand)
check(len(delar) == 2 and all(jumps(d) == 0 for d in delar) and abs(sum(pg._area(d) for d in delar) - 11) < 1e-6,
      'en ring som går åt väster över linjen ska också delas, med ytan bevarad')

# En ring som inte korsar lämnas orörd, och en delad ring delas inte igen
rut = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
check(pg.split_ring(rut) == [rut] and pg.split_ring(rut)[0] is rut, 'en ring utan hopp ska lämnas orörd')
check(pg.split_polygon([rut]) == [[rut]], 'en polygon utan hopp ska lämnas orörd')
for d in pg.split_ring(ryssland):
    check(pg.split_ring(d) == [d], 'en redan delad ring ska inte delas igen')

# Polygonen med hål: hålet följer med delringen som innehåller det
stor = raw([[100, 50], [150, 50], [190, 50], [190, 70], [150, 70], [100, 70], [100, 50]])
hal = [[110, 55], [110, 60], [120, 60], [120, 55], [110, 55]]
polys = pg.split_polygon([stor, hal])
check(len(polys) == 2 and sorted(len(p) for p in polys) == [1, 2], 'hålet ska följa med rätt delring')

# 2. Datan
platser = json.loads((ROOT / 'data' / 'platser.json').read_text(encoding='utf-8'))['places']
for pl in platser:
    g = pl['boundary']['geometry']
    for poly in ([g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']):
        check(pg.split_polygon(poly) == [poly], f"{pl['id']}: delningen ändrar en ring som redan är delad (omkörning ska ge tom diff)")
        for ring in poly:
            check(jumps(ring) == 0, f"{pl['id']}: en ring hoppar över datumlinjen")

# 3. JS och Python
src = (ROOT / 'scripts' / 'validate-site.py').read_text(encoding='utf-8')
a, b = src.index('    def unwrapped(ring):'), src.index('    for pl in places_doc.get')
ns = {'math': math}
exec(textwrap.dedent(src[a:b]), ns)  # samma kod som validate-site.py kör, utan resten av skriptet
fx = json.loads((ROOT / 'tests' / 'fixtures' / 'datumlinjen.json').read_text(encoding='utf-8'))
for p in fx['points']:
    polys = fx['geometries'][p['geometry']]['coordinates']
    inside = any(ns['in_ring'](poly[0], p['lon'], p['lat']) and not any(ns['in_ring'](h, p['lon'], p['lat']) for h in poly[1:]) for poly in polys)
    check(inside == p['inside'], f"validate-site.py: {p['namn']}: inne {inside}, väntat {p['inside']}")
    if 'edgeKm' in p:
        km = ns['edge_km'](polys, p['lon'], p['lat'])
        check(p['edgeKm'][0] <= km <= p['edgeKm'][1], f"validate-site.py: {p['namn']}: {km:.1f} km, väntat {p['edgeKm']}")

if fel:
    print('\n'.join(fel), file=sys.stderr)
    sys.exit(1)
print('platser-granser-test: ok')
