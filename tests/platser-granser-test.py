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
import re
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

# 4. Grannländerna (#1449): kustmarginalen gäller inte en punkt inne i ett annat lands polygon
check(ns['COAST_MARGIN_KM'] == int(re.search(r'COAST_MARGIN_KM = (\d+);', (ROOT / 'js' / 'place-geo.js').read_text(encoding='utf-8')).group(1)),
      'COAST_MARGIN_KM i validate-site.py och js/place-geo.js ska vara lika')
check(pg.NEIGHBOUR_KM >= ns['COAST_MARGIN_KM'], 'NEIGHBOUR_KM i tools/platser_gransar.py ska täcka kustmarginalen')
gr = json.loads((ROOT / 'tests' / 'fixtures' / 'granne.json').read_text(encoding='utf-8'))
for p in gr['points']:
    pl = gr['places'][p['place']]
    nb = [poly for n in pl['neighbours'] for poly in n['geometry']['coordinates']]
    got = ns['in_place'](pl['geometry']['coordinates'], nb, p['lon'], p['lat'])
    check(got == p['inPlace'], f"validate-site.py: {p['namn']}: {got}, väntat {p['inPlace']}")
for pl in platser:
    b = pl['boundary']
    check(isinstance(b.get('neighbours'), list), f"{pl['id']}: boundary.neighbours saknas (kör tools/platser_gransar.py)")
    check(b.get('neighbourKm', 0) >= ns['COAST_MARGIN_KM'], f"{pl['id']}: boundary.neighbourKm är mindre än kustmarginalen")
    check(not any('ne' in n and n['ne'] == b.get('ne') for n in b.get('neighbours', [])), f"{pl['id']}: det egna landet ligger i grannlistan")


# 5. Verktyget som skriver grannlistan, mot en konstruerad världsatlas (inget nätverk)
def mk_topo(countries):
    """countries: [(id eller None, namn, yttre ring)] som en minimal world-atlas: en båge per ring, deltakodade."""
    arcs, geoms = [], []
    for k, (cid, namn, r) in enumerate(countries):
        arcs.append([list(r[0])] + [[b[0] - a[0], b[1] - a[1]] for a, b in zip(r, r[1:])])
        g = {'type': 'Polygon', 'arcs': [[k]], 'properties': {'name': namn}}
        if cid is not None:
            g['id'] = cid
        geoms.append(g)
    return {'transform': {'scale': [1, 1], 'translate': [0, 0]}, 'arcs': arcs, 'objects': {'countries': {'geometries': geoms}}}


def rect(w, s, e, n):
    return [[w, s], [e, s], [e, n], [w, n], [w, s]]


def in_pieces(entry, x, y):
    return any(pg.point_in_ring(poly[0], x, y) for poly in entry['geometry']['coordinates'])


# En konkav granne (ett C med en vik) som sträcker sig långt utanför fönstren, ett eget land, en avlägsen stat och ett land utan id
c_form = [[-20, -10], [0, -10], [0, 0.5], [-5, 0.5], [-5, 1.5], [0, 1.5], [0, 12], [-20, 12], [-20, -10]]
topo = mk_topo([('1', 'Egna', rect(0, 0, 2, 2)), ('2', 'Granne', c_form), ('3', 'Avlägsen', rect(30, 0, 40, 10)), (None, 'Utan id', rect(2, 0, 4, 2))])
arcs = pg.decode(topo)
platsen = {'boundary': {'ne': '1', 'geometry': {'type': 'MultiPolygon', 'coordinates': [[rect(0, 0, 2, 2)]]}}}
grannar = pg.clip_neighbours(pg.load_countries(topo, arcs), platsen)
check([n['name'] for n in grannar] == ['Granne', 'Utan id'], f'grannarna ska vara Granne och Utan id (inte det egna eller det avlägsna): {[n["name"] for n in grannar]}')
check('ne' not in grannar[1] and grannar[0]['ne'] == '2', 'ett land utan id i Natural Earth får ingen ne')
check(all(len(poly) == 1 and poly[0][0] == poly[0][-1] for n in grannar for poly in n['geometry']['coordinates']), 'grannpolygonerna ska vara slutna ytterringar')
# Fullständigt inom marginalen: för punkter inom 20 km från platsens gräns ger de klippta delarna samma svar som hela landet
lo, hi, step = -0.25, 2.25, 0.01
full = {'Granne': c_form[:-1] + [c_form[0]], 'Utan id': rect(2, 0, 4, 2)}
x = lo
checked = 0
while x <= hi:
    y = lo
    while y <= hi:
        if 0 <= x <= 2 and 0 <= y <= 2:
            y += step
            continue
        for n in grannar:
            check(in_pieces(n, x, y) == pg.point_in_ring(full[n['name']], x, y), f"{n['name']}: klippt och hel polygon ger olika svar vid {x:.2f},{y:.2f}")
        checked += 1
        y += step
    x += step
check(checked > 3000, 'provet ska pröva ett nät av punkter runt platsen')
# Delarna är små: ingen punkt längre än fönstren når (det C-formade landet sträcker sig 20 grader västerut)
check(max(p[0] for n in grannar[:1] for poly in n['geometry']['coordinates'] for p in poly[0]) <= 0.01 and min(p[0] for n in grannar[:1] for poly in n['geometry']['coordinates'] for p in poly[0]) > -2, 'grannens delar ska klippas vid fönstren, inte följa hela landet')

# Datumlinjen: en granne på andra sidan av 180° hittas, och punkten −179,9 ligger i den
topo = mk_topo([('1', 'Öst', rect(175, 0, 180, 5)), ('2', 'Väst', rect(-180, 0, -175, 5))])
vid = pg.clip_neighbours(pg.load_countries(topo, pg.decode(topo)), {'boundary': {'ne': '1', 'geometry': {'type': 'MultiPolygon', 'coordinates': [[rect(175, 0, 180, 5)]]}}})
check(len(vid) == 1 and vid[0]['name'] == 'Väst', 'en granne över datumlinjen ska hittas')
check(vid and in_pieces(vid[0], -179.9, 2.5) and not in_pieces(vid[0], 179.9, 2.5), 'punkten −179,9 ligger i grannen men 179,9 ligger i platsen')
# Ett län: det egna landet är det som rymmer flest av länets punkter, och det är inte en granne
topo = mk_topo([('1', 'Landet', rect(0, 0, 10, 10)), ('2', 'Grannen', rect(10, 0, 20, 10))])
lan = {'boundary': {'admin1': 'XXX-1', 'geometry': {'type': 'MultiPolygon', 'coordinates': [[rect(8, 3, 9.95, 5)]]}}}
cs = pg.load_countries(topo, pg.decode(topo))
check(pg.own_country(cs, lan)['id'] == '1', 'länets eget land ska vara det som rymmer det')
check([n['name'] for n in pg.clip_neighbours(cs, lan)] == ['Grannen'], 'ett län har grannar utanför sitt land, inte resten av landet')
# Fönstren täcker allt inom marginalen från gränsen
wins = pg.border_windows({'type': 'MultiPolygon', 'coordinates': [[rect(0, 0, 3, 3)]]})
for k in range(0, 300):
    t = k / 100
    for (px, py) in ((t, -0.18), (t, 3.18), (-0.18, t), (3.18, t)):
        check(any(w[0] <= px <= w[2] and w[1] <= py <= w[3] for w in wins), f'punkten {px},{py} (20 km från gränsen) ligger i inget fönster')

if fel:
    print('\n'.join(fel), file=sys.stderr)
    sys.exit(1)
print('platser-granser-test: ok')
