#!/usr/bin/env python3
"""Prov för de delade gränserna i tools/riken.py (#1765, pilot bakom flaggan --delade-granser).

Enhetsprov med små påhittade polygoner (inga riktiga gränser): grannar som förenklas tillsammans överlappar inte, riken som
överlappar i underlaget hålls utanför, en ö tas bort bara när den inte rör en granne, och en liten ändring behåller förra
gränsen medan en granne som annars skulle överlappa får en ny. Kräver shapely 2.1 eller senare (som rikesverktyget); saknas den
hoppas provet över, eftersom CI inte har shapely.

Med miljövariabeln CLIOPATRIA=<cliopatria_polities_only_v021.geojson> körs också hela verktyget två gånger i en tillfällig mapp
(cirka två minuter): utan flaggan ska varje fil vara exakt som i data/empires (#1220), och med flaggan ska grannarna i piloten
inte överlappa mer än TROSKEL kvadratgrader något år 500–1700 (riken som överlappar något annat i underlaget det
året räknas inte, eftersom de hålls utanför täckningen).
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

# 4. Överlapp i underlaget större än SHARED_SLIVER: de två hålls utanför, den tredje har ingen att dela med
big = box(0.5, 0, 2, 2)  # överlappar a mycket
got, new, notes = R.cover_years({('g', 'a'): [(600, 700, a)], ('g', 'x'): [(600, 700, big)], ('g', 'c'): [(600, 700, c)]},
                                (500, 1700), 0.1, {('g', k): 0.02 for k in 'axc'}, {('g', k): 0.02 for k in 'axc'})
check(not got, f'riken som överlappar i underlaget ska hållas utanför täckningen, fick {sorted(got)}')
check(any('överlappar' in n for n in notes), 'överlappet i underlaget ska skrivas ut')

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

# 9. Versionskontrollen gäller bara flaggan: med en shapely utan coverage_simplify kommer main utan flaggan förbi kontrollen
KOD = '''import sys
sys.path.insert(0, sys.argv[1])
import shapely
del shapely.coverage_simplify
import riken as R
def fake(path):
    raise RuntimeError('förbi')
R.las_cliopatria = fake
sys.argv = ['riken.py', 'x.geojson'] + sys.argv[2:]
try:
    R.main()
except RuntimeError:
    print('förbi')
except SystemExit:
    print('stopp')
'''
for flaggor, vant in (([], 'förbi'), (['--delade-granser'], 'stopp')):
    r = subprocess.run([sys.executable, '-c', KOD, str(ROOT / 'tools')] + flaggor, capture_output=True, text=True)
    check(r.stdout.strip() == vant, f'med äldre shapely och flaggorna {flaggor} ska verktyget ge "{vant}", gav {r.stdout.strip()!r} {r.stderr[-200:]}')

# Hela verktyget (valfritt, med Cliopatria-filen)
clio = os.environ.get('CLIOPATRIA')
heavy = ''
if clio:
    with tempfile.TemporaryDirectory() as tmp:
        av, pa = Path(tmp) / 'av', Path(tmp) / 'pa'
        for args in (['--ut=' + str(av)], ['--delade-granser', '--ut=' + str(pa)]):
            r = subprocess.run([sys.executable, str(ROOT / 'tools/riken.py'), clio] + args, capture_output=True, text=True)
            check(r.returncode == 0, f'riken.py {" ".join(args)} misslyckades: {r.stderr[-500:]}')
        olika = [f.name for f in sorted((ROOT / 'data/empires').glob('*.json'))
                 if not (av / f.name).exists() or (av / f.name).read_bytes() != f.read_bytes()]
        check(not olika, f'utan flaggan skiljer sig {len(olika)} filer från data/empires: {olika[:5]}')
        # Underlagets överlapp, för att räkna bara det som förenklingen lägger till
        src = R.las_cliopatria(clio)
        by_name = {}
        for f in src['features']:
            if f['properties']['Type'] == 'POLITY':
                by_name.setdefault(f['properties']['Name'], []).append(f)
        R.fix_swapped_shapes(by_name)
        R.drop_remnants(by_name)
        disputed, ne = R.disputed_areas(by_name), R.ne_shapes()
        raw = {}
        for gid in R.SHARED_GROUPS:
            for cname, pid, _s, _c, *rest in R.GROUPS[gid][2]:
                raw[(gid, pid)] = R.raw_periods(gid, cname, rest[0] if rest else {}, by_name, disputed, ne)
        per = []
        for gid in R.SHARED_GROUPS:
            for pol in json.loads((pa / f'{gid}.json').read_text())['polities']:
                for q in pol['periods']:
                    per.append(((gid, pol['id']), q['start'], q['end'], shapely.make_valid(shape(q['geometry']))))
        cache, worst = {}, (0, None)
        for y in range(R.SHARED_YEARS[0], R.SHARED_YEARS[1] + 1):
            act = [(k, s, g) for k, s, e, g in per if s <= y <= e]
            key = (tuple((k, s) for k, s, g in act), tuple((k, s) for k, v in raw.items() for s, e, g, _a in v if s <= y <= e))
            if key not in cache:
                rg = {k: g for k, v in raw.items() for s, e, g, _a in v if s <= y <= e}
                # Riken som överlappar något annat i underlaget det året hålls utanför täckningen och förenklas för sig som förut;
                # deras gränser räknas inte här (de står i rapporten, docs/granskningar/2026-11-20-delade-granser-pilot.md)
                held = {a for a in rg for b in rg if a != b and rg[a].intersection(rg[b]).area > R.SHARED_SLIVER}
                t = 0.0
                for i in range(len(act)):
                    for j in range(i + 1, len(act)):
                        if act[i][0] in held or act[j][0] in held:
                            continue
                        t += act[i][2].intersection(act[j][2]).area
                cache[key] = t
            if cache[key] > worst[0]:
                worst = (cache[key], y)
        check(worst[0] < TROSKEL, f'med flaggan överlappar grannarna {worst[0]:.4f} kv.grader år {worst[1]} (gräns {TROSKEL})')
        heavy = f'; hela verktyget: utan flaggan samma filer, med flaggan högst {worst[0]:.4f} kv.grader överlapp ett år'

if fel:
    print(f'{len(fel)} fel:')
    for f in fel:
        print(' -', f)
    sys.exit(1)
print('ok: delade gränser utan överlapp, överlapp i underlaget hålls utanför, öar och sammanslagning som de ska' + heavy)
