#!/usr/bin/env python3
"""Prov för de delade gränserna i tools/riken.py (#1765, regionerna i SHARED_REGIONS, steg 2).

Enhetsprov med små påhittade polygoner (inga riktiga gränser): grannar som förenklas tillsammans överlappar inte, en yta som två
riken delar i underlaget blir en egen bit som ritas i båda (och smala remsor går till den som står först), x kan skalas med cos
för breddgraden, en ö tas bort bara när den inte rör en granne, och en liten ändring behåller förra gränsen medan en granne som
annars skulle överlappa får en ny. Kräver shapely 2.1 eller senare (som rikesverktyget). I CI installeras den (#1765, steg 2);
saknas den lokalt hoppas provet över.

Med miljövariabeln CLIOPATRIA=<cliopatria_polities_only_v021.geojson> körs också hela verktyget i en tillfällig mapp (cirka en
minut): varje fil ska vara exakt som i data/empires (#1220), och grannarna i varje region ska inte överlappa mer än TROSKEL
kvadratgrader något år utöver det de delar i underlaget (med en marginal på MARGINAL grader runt den delade ytan, som förenklas).
    python3 tests/riken-delade-granser-test.py
    CLIOPATRIA=/sökväg/cliopatria_polities_only_v021.geojson python3 tests/riken-delade-granser-test.py
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TROSKEL = 0.005  # kvadratgrader (cirka 35 km2 på Brittiska öarnas breddgrad), summan för alla grannpar ett år
MARGINAL = 0.05  # grader runt en yta som två riken delar i underlaget; den delade biten förenklas och kan flytta så här mycket

try:
    import shapely
    from shapely.geometry import MultiPolygon, Polygon, box, shape
except ImportError:
    print('hoppas över: shapely saknas (krävs av tools/riken.py)')
    sys.exit(0)
if not hasattr(shapely, 'coverage_simplify') or shapely.geos_version < (3, 12, 0):
    print(f'hoppas över: shapely {shapely.__version__} är äldre än 2.1 eller har GEOS äldre än 3.12')
    sys.exit(0)

sys.path.insert(0, str(ROOT / 'tools'))
import riken as R  # noqa: E402

fel = []


def check(ok, msg):
    if not ok:
        fel.append(msg)


def overlap(geoms):
    t = 0.0
    for i in range(len(geoms)):
        for j in range(i + 1, len(geoms)):
            t += geoms[i].intersection(geoms[j]).area
    return t


def zigzag(x0, x1, y0, y1, xs, n=40, amp=0.15):
    """En ruta x0–x1, y0–y1 där kanten vid x = xs är en tät sicksacklinje (samma linje för båda grannarna)."""
    pts = [(xs + (amp if i % 2 else -amp) * ((i * 7) % 5) / 4, y0 + (y1 - y0) * i / n) for i in range(n + 1)]
    if x0 < xs:
        return Polygon([(x0, y0)] + pts + [(x0, y1)])
    return Polygon(pts + [(x1, y1), (x1, y0)])


# 1. Utan flaggan: simplify_alone ger en frusen gräns (Douglas–Peucker 0,2 och ön under 0,02 borttagen), tagen 2026-11-20 med
# verktyget efter att hela verktyget gav byte för byte samma rikesfiler som förut. Ändras förenklingen för sig märks det här
mp = MultiPolygon([zigzag(0, 2, 0, 2, 1), box(5, 5, 5.1, 5.1)])
FRUSEN = shapely.from_wkt('POLYGON ((0 0, 1.075 0.05, 0.85 0.6, 1.15 0.85, 0.85 1.1, 1.15 1.35, 0.85 1.6, 1.1125 1.95, 0 2, 0 0))')
check(R.simplify_alone(mp, 0.2, 0.02).equals_exact(FRUSEN, 1e-12), 'simplify_alone ger inte samma gräns som förut')

# 2. Grannar med en gemensam sicksackgräns: var för sig överlappar de, tillsammans inte
a, b = zigzag(0, 2, 0, 2, 1), zigzag(0, 2, 0, 2, 1)
a = a.intersection(box(0, 0, 2, 2))
b = box(0, 0, 2, 2).difference(a)
c = box(2, 0, 3, 2)
raws = {('g', 'a'): [(600, 700, a)], ('g', 'b'): [(600, 700, b)], ('g', 'c'): [(600, 700, c)]}
ones = {k: 0.02 for k in raws}
check(overlap([R.simplify_alone(g, 0.2, 0.02) for g in (a, b, c)]) > 0.001, 'provet är fel: var för sig överlappar inte')
got, new, notes = R.cover_years(raws, (500, 1700), 0.1, ones, ones)
check(set(got) == {(k, 600) for k in raws}, f'alla tre ska få en delad gräns 600, fick {sorted(got)}')
check(overlap([got[(k, 600)] for k in raws if (k, 600) in got]) < 1e-9, 'grannarna överlappar efter den delade förenklingen')
check(all(600 in new.get(k, ()) for k in raws), 'en ny delad gräns ska ge en ny period (shared_new)')

# 3. Utanför årtalen: inget
got, new, notes = R.cover_years({k: [(400, 450, v[0][2])] for k, v in raws.items()}, (500, 1700), 0.1, ones, ones)
check(not got and not new, 'perioder före 500 ska inte få delade gränser')

# 4. Överlapp i underlaget större än SHARED_SLIVER (punkt 2 i pilotrapporten): den gemensamma ytan blir en egen bit som läggs
# till båda, så den ritas i båda, men gränserna mot övriga grannar blir ändå gemensamma
big = box(0.5, 0, 2, 2)  # överlappar a mycket
got, new, notes = R.cover_years({('g', 'a'): [(600, 700, a)], ('g', 'x'): [(600, 700, big)], ('g', 'c'): [(600, 700, c)]},
                                (500, 1700), 0.1, {('g', k): 0.02 for k in 'axc'}, {('g', k): 0.02 for k in 'axc'})
check(set(got) == {(('g', k), 600) for k in 'axc'}, f'alla tre ska få en delad gräns trots överlappet, fick {sorted(got)}')
if len(got) == 3:
    ga, gx, gc = (got[(('g', k), 600)] for k in 'axc')
    delad = a.intersection(big)
    check(abs(ga.intersection(gx).area - delad.area) < 0.05 * delad.area, 'den gemensamma ytan ska ritas i båda')
    check(ga.intersection(gx).difference(delad.buffer(0.2)).area < 1e-9, 'utanför den gemensamma ytan ska de inte överlappa')
    check(overlap([ga, gc]) < 1e-9 and overlap([gx, gc]) < 1e-9, 'grannen utan överlapp i underlaget ska inte överlappa någon')
check(any('överlappar' in n and 'ritas i båda' in n for n in notes), 'överlappet i underlaget ska skrivas ut')

# 4b. En smal remsa (under cirka 2 * SLIVER grader bred) räknas inte som delad yta fast den är större än SHARED_SLIVER
smal = box(0, 0, 2.03, 2)  # 0,06 kv.grader men 0,03 grader bred in i c
got, new, notes = R.cover_years({('g', 's'): [(600, 700, smal)], ('g', 'c'): [(600, 700, c)]}, (500, 1700), 0.1,
                                {('g', 's'): 0.02, ('g', 'c'): 0.02}, {('g', 's'): 0.02, ('g', 'c'): 0.02})
check(len(got) == 2 and overlap(list(got.values())) < 1e-9, 'en smal remsa i underlaget ska gå till den som står först')
check(not any('ritas i båda' in n for n in notes), 'en smal remsa ska inte skrivas ut som delad yta')

# 4c. Skalning med cos för breddgraden (punkt 4): grannarna överlappar inte heller då, och gränsen ligger kvar på rätt ställe
got, new, notes = R.cover_years(raws, (500, 1700), 0.1, ones, ones, xscale=0.5)
check(set(got) == {(k, 600) for k in raws}, 'med skalning ska alla tre få en delad gräns')
check(overlap([got[(k, 600)] for k in raws if (k, 600) in got]) < 1e-9, 'med skalning ska grannarna inte överlappa')
check(all(abs(got[(k, 600)].area - raws[k][0][2].area) < 0.1 * raws[k][0][2].area for k in raws if (k, 600) in got),
      'skalningen ska räknas tillbaka efter förenklingen')

# 5. En remsa under SHARED_SLIVER går till den som står först, och täckningen blir ändå giltig
remsa = box(0, 0, 2.002, 2)  # 0,004 kv.grader in i c
got, new, notes = R.cover_years({('g', 'r'): [(600, 700, remsa)], ('g', 'c'): [(600, 700, c)]}, (500, 1700), 0.1,
                                {('g', 'r'): 0.02, ('g', 'c'): 0.02}, {('g', 'r'): 0.02, ('g', 'c'): 0.02})
check(len(got) == 2 and overlap(list(got.values())) < 1e-9, 'en remsa i underlaget ska inte ge överlapp')

# 6. MIN_AREA: en liten ö långt bort tas bort, en liten del som rör grannen står kvar
o = MultiPolygon([box(0, 0, 1, 1), box(5, 5, 5.1, 5.1), box(1, 1, 1.1, 1.1)])  # den sista ligger i ett hörn av grannen n
n = box(1, 0, 2, 2).difference(box(1, 1, 1.1, 1.1))
got, _new, _notes = R.cover_years({('g', 'o'): [(600, 700, o)], ('g', 'n'): [(600, 700, n)]}, (500, 1700), 0.01,
                                  {('g', 'o'): 0.02, ('g', 'n'): 0.02}, {('g', 'o'): 0.02, ('g', 'n'): 0.02})
g = got[(('g', 'o'), 600)]
check(not g.intersects(box(4.9, 4.9, 5.2, 5.2)), 'en liten ö som inte rör en granne ska tas bort (MIN_AREA)')
check(g.intersects(box(1.02, 1.02, 1.08, 1.08)), 'en liten del som rör en granne får inte tas bort på bara ena sidan')

# 7. MERGE: en liten ändring behåller förra gränsen (main slår ihop), en granne som annars överlappar får en ny
a2 = a.union(box(-0.01, 0, 0, 2))  # 1 procent större, ingen granne berörs
got, new, _n = R.cover_years({('g', 'a'): [(600, 649, a), (650, 700, a2)], ('g', 'b'): [(600, 700, b)]}, (500, 1700), 0.1,
                             {('g', 'a'): 0.02, ('g', 'b'): 0.02}, {('g', 'a'): 0.02, ('g', 'b'): 0.02})
check(got[(('g', 'a'), 650)].equals(got[(('g', 'a'), 600)]), 'en liten ändring ska behålla förra gränsen (MERGE)')
check(650 not in new.get(('g', 'a'), ()), 'en behållen gräns ska inte bli en ny period')
# en ändring större än merge ger en ny gräns och en ny period
a4 = a.union(box(-0.5, 0, 0, 2))  # 25 procent större
got, new, _n = R.cover_years({('g', 'a'): [(600, 649, a), (650, 700, a4)], ('g', 'b'): [(600, 700, b)]}, (500, 1700), 0.1,
                             {('g', 'a'): 0.02, ('g', 'b'): 0.02}, {('g', 'a'): 0.02, ('g', 'b'): 0.02})
check(not got[(('g', 'a'), 650)].equals(got[(('g', 'a'), 600)]) and 650 in new.get(('g', 'a'), ()),
      'en ändring större än MERGE ska ge en ny gräns och en ny period')
check(650 not in new.get(('g', 'b'), ()), 'en granne som inte ändras och inte överlappar ska behålla sin gräns')
# a tar en remsa av b och får en ny gräns (merge 0); b skulle behålla sin förra (merge 0,5), men då överlappar de vid remsan
a3 = a.union(box(1.3, 0, 1.31, 2))
b3 = b.difference(box(1.3, 0, 1.31, 2))
got, new, _n = R.cover_years({('g', 'a'): [(600, 649, a), (650, 700, a3)], ('g', 'b'): [(600, 649, b), (650, 700, b3)]},
                             (500, 1700), 0.1, {('g', 'a'): 0.02, ('g', 'b'): 0.02}, {('g', 'a'): 0.0, ('g', 'b'): 0.5})
ga = got.get((('g', 'a'), 650))
gb = got.get((('g', 'b'), 650))
check(ga is not None and gb is not None and ga.intersection(gb).area <= 0.001,
      'två grannar samma år får inte överlappa mer än SHARED_FIX, även när den ena skulle behålla sin gräns')

# 8. split_at delar en period med samma geometri och yta
p = box(0, 0, 1, 1)
check(R.split_at([(600, 700, p, 5)], {650, 600, 800}) == [(600, 649, p, 5), (650, 700, p, 5)], 'split_at delar fel')
check(R.split_at([(600, 700, p, 5)], set()) == [(600, 700, p, 5)], 'split_at utan år ska inte ändra något')

# 9. Versionskontrollen: de delade gränserna är på (steg 2), så verktyget stannar med en shapely utan coverage_simplify och går
# förbi kontrollen med en som har den
KOD = '''import sys
sys.path.insert(0, sys.argv[1])
import shapely
if sys.argv[2] == 'gammal':
    del shapely.coverage_simplify
import riken as R
def fake(path):
    raise RuntimeError('förbi')
R.las_cliopatria = fake
sys.argv = ['riken.py', 'x.geojson']
try:
    R.main()
except RuntimeError:
    print('förbi')
except SystemExit:
    print('stopp')
'''
for version, vant in (('gammal', 'stopp'), ('ny', 'förbi')):
    r = subprocess.run([sys.executable, '-c', KOD, str(ROOT / 'tools'), version], capture_output=True, text=True)
    check(r.stdout.strip() == vant, f'med {version} shapely ska verktyget ge "{vant}", gav {r.stdout.strip()!r} {r.stderr[-200:]}')

# 10. Regionerna: varje grupp och del finns, och ingen del står i två regioner
sett = {}
for region in R.SHARED_REGIONS:
    for key in R.region_keys(region):
        check(key not in sett, f'{key} står i både {sett.get(key)} och {region}')
        sett[key] = region
    for item in R.SHARED_REGIONS[region]['groups']:
        gid = item if isinstance(item, str) else item[0]
        check(gid in R.GROUPS and any(k[0] == gid for k in R.region_keys(region)), f'{item} i {region} finns inte i GROUPS')

# Hela verktyget (valfritt, med Cliopatria-filen)
clio = os.environ.get('CLIOPATRIA')
heavy = ''
if clio:
    with tempfile.TemporaryDirectory() as tmp:
        ut = Path(tmp) / 'ut'
        r = subprocess.run([sys.executable, str(ROOT / 'tools/riken.py'), clio, '--ut=' + str(ut)], capture_output=True, text=True)
        check(r.returncode == 0, f'riken.py misslyckades: {r.stderr[-500:]}')
        olika = [f.name for f in sorted((ROOT / 'data/empires').glob('*.json'))
                 if not (ut / f.name).exists() or (ut / f.name).read_bytes() != f.read_bytes()]
        check(not olika, f'{len(olika)} filer skiljer sig från data/empires: {olika[:5]}')
        # Underlagets överlapp, för att räkna bara det som förenklingen lägger till
        src = R.las_cliopatria(clio)
        by_name = {}
        for f in src['features']:
            if f['properties']['Type'] == 'POLITY':
                by_name.setdefault(f['properties']['Name'], []).append(f)
        R.fix_swapped_shapes(by_name)
        R.drop_remnants(by_name)
        disputed, ne = R.disputed_areas(by_name), R.ne_shapes()
        worst = {}
        for region, reg in R.SHARED_REGIONS.items():
            keys = R.region_keys(region)
            raw, per = {}, []
            for gid, pid in keys:
                cname, _p, _s, _c, *rest = next(m for m in R.GROUPS[gid][2] if m[1] == pid)
                raw[(gid, pid)] = R.raw_periods(gid, cname, rest[0] if rest else {}, by_name, disputed, ne)
                for pol in json.loads((ut / f'{gid}.json').read_text())['polities']:
                    if pol['id'] == pid:
                        per += [((gid, pid), q['start'], q['end'], shapely.make_valid(shape(q['geometry']))) for q in pol['periods']]
            cache, worst[region] = {}, (0, None)
            for y in range(reg['years'][0], reg['years'][1] + 1):
                act = [(k, g) for k, s, e, g in per if s <= y <= e]
                rg = {k: g for k, v in raw.items() for s, e, g, _a in v if s <= y <= e}
                key = (tuple(id(g) for k, g in act), tuple(id(g) for g in rg.values()))
                if key not in cache:
                    t = 0.0
                    for i in range(len(act)):
                        for j in range(i + 1, len(act)):
                            (ka, ga), (kb, gb) = act[i], act[j]
                            if not ga.intersects(gb):
                                continue
                            ov = ga.intersection(gb)
                            # Det de delar i underlaget ritas i båda (punkt 2); bara överlapp utöver det räknas
                            if ka in rg and kb in rg and rg[ka].intersection(rg[kb]).area > R.SHARED_SLIVER:
                                ov = ov.difference(rg[ka].intersection(rg[kb]).buffer(MARGINAL))
                            t += ov.area
                    cache[key] = t
                if cache[key] > worst[region][0]:
                    worst[region] = (cache[key], y)
            check(worst[region][0] < TROSKEL,
                  f'{region}: grannarna överlappar {worst[region][0]:.4f} kv.grader år {worst[region][1]} utöver underlaget (gräns {TROSKEL})')
        heavy = '; hela verktyget: samma filer som data/empires, största överlapp ett år utöver underlaget ' + \
            ', '.join(f'{r} {w[0]:.4f}' for r, w in worst.items())

if fel:
    print(f'{len(fel)} fel:')
    for f in fel:
        print(' -', f)
    sys.exit(1)
print('ok: delade gränser utan överlapp, delad yta i underlaget ritas i båda, smala remsor och skalning, öar och sammanslagning '
      'som de ska, regionerna' + heavy)
