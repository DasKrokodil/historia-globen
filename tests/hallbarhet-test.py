#!/usr/bin/env python3
"""Hållbarhetsvarningen för länder i scripts/validate-site.py (#1269), utan nätverk.

1. country_warnings() (samma kod som validate-site.py kör, hämtad ur filen) ger ingen varning för ett konstruerat land
   som håller riktlinjen och exakt en varning för ett land som bryter mot ett av de fyra villkoren: färre än 12 händelser,
   färre än 4 sekler, färre än 3 kategorier utöver krig, mer än 50 % krig. Gränsfallen (12 händelser, 4 sekler,
   3 kategorier, 50 % krig) varnar inte, och både kind "war" och kategorin krig räknas som krig.
2. Hela valideringen mot en kopia av dist/ med ett konstruerat land som har 5–11 händelser: varningen skrivs till stderr
   med landets id, bygget stoppas inte (utgångskod 0), och inget av de verkliga länderna får en felaktig varning här.
   Förutsätter att dist/ är byggd (bash scripts/build-site.sh), som i CI.
Körs i CI: python3 -I tests/hallbarhet-test.py
"""
import copy
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
fel = []


def check(ok, msg):
    if not ok:
        fel.append(msg)


src = (ROOT / 'scripts' / 'validate-site.py').read_text(encoding='utf-8')
ns = {}
exec(src[src.index('COUNTRY_MIN_EVENTS'):src.index('errors = []')], ns)  # trösklarna överst i filen
exec(src[src.index('def country_warnings'):src.index('# --- hållbarhetsvarning slut')], ns)
warn = ns['country_warnings']

CATS = ['kultur', 'vetenskap', 'religion', 'ekonomi']


def ev(start, category='kultur', kind=None):
    e = {'start': start, 'category': category}
    if kind:
        e['kind'] = kind
    return e


def land(n=12, centuries=4, cats=3, wars=0):
    """n händelser: wars av dem krig, resten fördelade över `centuries` sekler och `cats` kategorier."""
    out = [ev(100 * i, 'krig', 'war' if i % 2 else None) for i in range(wars)]
    out += [ev(100 * (i % centuries) + 5, CATS[i % cats]) for i in range(n - wars)]
    return out


# 1. Villkoren var för sig
check(warn(land()) == [], f'ett land som håller riktlinjen ska inte varna: {warn(land())}')
check(warn([]) != [], 'ett land utan händelser ska varna')
w = warn(land(n=11))
check(len(w) == 1 and 'händelser' in w[0], f'11 händelser ska ge en varning om antalet: {w}')
w = warn(land(centuries=3))
check(len(w) == 1 and 'sekel' in w[0], f'3 sekler ska ge en varning om spridningen: {w}')
w = warn(land(cats=2))
check(len(w) == 1 and 'kategorier' in w[0], f'2 kategorier utöver krig ska ge en varning: {w}')
w = warn(land(n=14, wars=7 + 1))  # 8 av 14 = 57 %
check(len(w) == 1 and 'krig' in w[0] and '57 %' in w[0], f'57 % krig ska ge en varning om krigsandelen: {w}')
check(warn(land(n=14, wars=7)) == [], f'exakt 50 % krig ska inte varna: {warn(land(n=14, wars=7))}')

# Krig räknas som kind war eller kategorin krig, och inte som kategori
blandat = [ev(0, 'kultur', 'war'), ev(100, 'krig'), ev(200, 'krig', 'war')] + land(n=9)
check(warn(blandat) == [], f'3 av 12 krig ska inte varna: {warn(blandat)}')
check(any('kategorier' in x for x in warn(land(cats=2, n=10) + [ev(900, 'krig'), ev(950, 'krig')])),
      'kategorin krig ska inte räknas som en av de tre kategorierna')
check(any('kategorier' in x for x in warn(land(cats=2, n=10) + [ev(900, 'natur', 'war'), ev(950, 'natur', 'war')])),
      'en händelse med kind war ska inte räknas med i kategorierna, vilken kategori den än har')

# Flera brott ger flera varningar, och f.Kr. räknas som egna sekler (−1 // 100 är −1, inte 0)
check(len(warn([ev(-5), ev(5)])) == 3, f'två händelser, två sekler och en kategori ska ge tre varningar: {warn([ev(-5), ev(5)])}')
check(len({e['start'] // 100 for e in [ev(-5), ev(5)]}) == 2, 'ett år före och ett efter år 0 ska vara olika sekler')

# 2. Hela valideringen mot en kopia av dist/
dist = ROOT / 'dist'
if not (dist / 'data' / 'platser.json').is_file():
    fel.append('dist/ saknas: kör bash scripts/build-site.sh först')
else:
    events = [e for e in json.loads((dist / 'data' / 'events.json').read_text(encoding='utf-8'))['events']
              if e.get('review') in ('source-checked', 'two-sources') and e['location']['type'] == 'Point']
    pts = [e['location']['coordinates'][:2] for e in events]
    # Ruta runt en händelse med 5–11 händelser inom rutan (och inom en säkerhetsmarginal på 0,5° för kustmarginalen)
    box = None
    for lon0, lat0 in pts:
        for r in (0.3, 0.6, 1, 2, 3):
            inner = sum(1 for lon, lat in pts if abs(lon - lon0) <= r and abs(lat - lat0) <= r)
            outer = sum(1 for lon, lat in pts if abs(lon - lon0) <= r + 0.5 and abs(lat - lat0) <= r + 0.5)
            if inner >= 5 and outer <= 11:
                box = (lon0, lat0, r)
                break
        if box:
            break
    check(box is not None, 'hittade ingen ruta med 5–11 händelser att bygga det konstruerade landet av')
    if box:
        lon0, lat0, r = box
        tmp = Path(tempfile.mkdtemp(prefix='hallbarhet-'))
        try:
            kopia = tmp / 'dist'
            shutil.copytree(dist, kopia)
            fil = kopia / 'data' / 'platser.json'
            doc = json.loads(fil.read_text(encoding='utf-8'))
            mall = copy.deepcopy(next(p for p in doc['places'] if p['type'] == 'country'))
            mall['id'] = 'provland'
            mall['boundary']['geometry'] = {'type': 'Polygon', 'coordinates': [[
                [lon0 - r, lat0 - r], [lon0 + r, lat0 - r], [lon0 + r, lat0 + r], [lon0 - r, lat0 + r], [lon0 - r, lat0 - r]]]}
            doc['places'].append(mall)
            fil.write_text(json.dumps(doc, ensure_ascii=False), encoding='utf-8')
            run = subprocess.run([sys.executable, '-I', str(ROOT / 'scripts' / 'validate-site.py'), str(kopia)],
                                 capture_output=True, text=True, timeout=300)
            check(run.returncode == 0, f'varningen får inte stoppa bygget (utgångskod {run.returncode}): {run.stderr[-800:]}')
            rader = [x for x in run.stderr.splitlines() if 'VARNING' in x and 'hållbarhetsriktlinjen' in x]
            check(any('(provland)' in x and 'synliga händelser' in x for x in rader),
                  f'provland ska varnas för antalet händelser: {rader}')
            check(all('(provland)' in x for x in rader),
                  f'bara provland ska varnas (de verkliga länderna håller riktlinjen i dag): {rader}')
            # En plats av en annan typ varnas inte, hur få händelser den än har
            mall['type'] = 'landskap'
            fil.write_text(json.dumps(doc, ensure_ascii=False), encoding='utf-8')
            run = subprocess.run([sys.executable, '-I', str(ROOT / 'scripts' / 'validate-site.py'), str(kopia)],
                                 capture_output=True, text=True, timeout=300)
            check(run.returncode == 0 and 'hållbarhetsriktlinjen' not in run.stderr,
                  f'ett landskap ska inte varnas: {run.stderr[-800:]}')
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

if fel:
    print('\n'.join(fel), file=sys.stderr)
    sys.exit(1)
print('hallbarhet-test: ok')
