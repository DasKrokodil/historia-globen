#!/usr/bin/env python3
"""Visar att JSON Schema-kontrollen stoppar ett avsiktligt fel (#391)."""
import copy
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
FIXTURE = ROOT / 'tests' / 'fixtures' / 'schema-invalid-event.json'
EVIDENCE_FIXTURE = ROOT / 'tests' / 'fixtures' / 'schema-invalid-evidence.json'

if not DIST.is_dir():
    subprocess.run(['bash', 'scripts/build-site.sh'], cwd=ROOT, check=True)

def rejects(fixture, expected):
    with tempfile.TemporaryDirectory() as tmp:
        broken = Path(tmp) / 'dist'
        shutil.copytree(DIST, broken)
        shutil.copyfile(fixture, broken / 'data' / 'events.json')
        result = subprocess.run(
            [sys.executable, '-I', 'scripts/validate-site.py', str(broken)],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
    if result.returncode == 0:
        raise SystemExit(f'Förväntade att {fixture.name} underkänns.')
    if expected not in result.stderr:
        raise SystemExit(f'{fixture.name} underkändes av fel skäl:\n{result.stderr}')

rejects(FIXTURE, "obligatoriska fältet 'title' saknas")
rejects(EVIDENCE_FIXTURE, "evidence.date använder källan cliopatria, som saknas i händelsens sources")
# Bildlager (#1325): exempelfilen övar hela formatet (grund, vektor, bounds), som riktig data ännu inte gör.
# Den ska godkännas, och varje avsiktligt fel ska underkännas av rätt skäl.
IMAGE_FIXTURE = ROOT / 'tests' / 'fixtures' / 'bildlager-exempel.json'


def image_layer_cases():
    def row(doc, i=0): return doc['layers'][i]
    def part(doc, i=0, j=0): return doc['layers'][i]['slices'][j]
    return [
        ('to som null', lambda d: part(d).update({'to': None}), 'to: ska vara integer'),
        ('saknad review', lambda d: part(d).pop('review'), "obligatoriska fältet 'review' saknas"),
        ('tom sources', lambda d: part(d).update(sources=[]), 'ska ha minst 1 post'),
        ('okänd källa', lambda d: part(d).update(sources=['finns-inte']), 'källan finns-inte finns inte i sources.json'),
        ('saknad fil', lambda d: part(d).update(file='images/lager/finns-inte.jpg'), 'finns-inte.jpg saknas i dist/'),
        ('okänt kind', lambda d: row(d).update(kind='bas'), "'bas' finns inte i enum"),
        ('felstavat fält', lambda d: part(d).update(bound=[0, 0, 1, 1]), "okänt fält 'bound'"),
        ('upptaget id', lambda d: row(d).update(id='events'), "'events' används redan av ett annat lager"),
        ('alias som krockar', lambda d: row(d).update(aliases=['exempel-grund']), "'exempel-grund' används också av raden"),
        ('okänd grupp', lambda d: row(d).update(group='finns-inte'), "gruppen 'finns-inte' finns inte i data/vyer.json"),
        ('grund utan label', lambda d: row(d, 1).pop('label'), 'kind "grund" kräver label'),
        ('raster utan storlek', lambda d: part(d).pop('width'), 'kräver width och height'),
        ('för stor bild', lambda d: part(d).update(width=4096, height=4096), 'mer än 8388608 bildpunkter'),
        ('bounds med tre tal', lambda d: part(d).update(bounds=[-30, 30, 60]), 'ska ha minst 4 poster'),
        ('bounds över datumlinjen', lambda d: part(d).update(bounds=[170, 30, -170, 75]), 'väst < öst'),
        ('bounds på vektor', lambda d: part(d, 0, 1).update(bounds=[0, 0, 1, 1]), 'bounds gäller bara format "raster"'),
        ('to före from', lambda d: part(d).update(to=1400), 'to (1400) är före from (1500)'),
        ('överlappande skivor', lambda d: part(d, 0, 1).update({'from': 1550}), 'överlappar i tid'),
    ]


with tempfile.TemporaryDirectory() as tmp:
    site = Path(tmp) / 'dist'
    shutil.copytree(DIST, site)
    target = site / 'data' / 'bildlager.json'

    def run(doc):
        target.write_text(json.dumps(doc, ensure_ascii=False), encoding='utf-8')
        return subprocess.run([sys.executable, '-I', 'scripts/validate-site.py', str(site)],
                              cwd=ROOT, text=True, capture_output=True)

    good = json.loads(IMAGE_FIXTURE.read_text(encoding='utf-8'))
    result = run(good)
    if result.returncode != 0:
        raise SystemExit(f'{IMAGE_FIXTURE.name} ska godkännas:\n{result.stderr}')
    cases = image_layer_cases()
    for name, change, expected in cases:
        doc = copy.deepcopy(good)
        change(doc)
        result = run(doc)
        if result.returncode == 0:
            raise SystemExit(f'Bildlager, {name}: förväntade att filen underkänns.')
        if expected not in result.stderr:
            raise SystemExit(f'Bildlager, {name}: underkändes av fel skäl:\n{result.stderr}')

# Ortnamn för regionvyn (#1643): de riktiga filerna godkänns ovan (dist/ är byggd), och en fil som bryter mot schemat underkänns.
def ortnamn_cases():
    return [
        ('namn som saknar franska', lambda d: d['places'][0]['name'].pop('fr'), "obligatoriska fältet 'fr' saknas"),
        ('ort utan koordinater', lambda d: d['places'][0].pop('coordinates'), "obligatoriska fältet 'coordinates' saknas"),
        ('ort utan id', lambda d: d['places'][0].pop('id'), "obligatoriska fältet 'id' saknas"),
        ('koordinat utanför jorden', lambda d: d['seas'][0].update(label=[200, 55]), 'större än maximum 180'),
        ('tomt namn', lambda d: d['neighbours'][0]['name'].update(sv=''), "matchar inte pattern '.+'"),
        ('granne med landgräns som land över havet (#1690)', lambda d: d['neighbours'][0].update(sea=True), 'har sea: true men'),
        ('land över havet som inte står i boundary.neighbours utan sea', lambda d: d['neighbours'].append({'ne': '352', 'label': [12.5, 55.5], 'name': d['neighbours'][0]['name']}), 'finns inte i platsens boundary.neighbours'),
        ('landsmarginalen saknas (#1690)', lambda d: d.pop('landPadKm'), "obligatoriska fältet 'landPadKm' saknas"),
        ('landsmarginalen mindre än ortmarginalen (#1690)', lambda d: d.update(landPadKm=d['padKm'] - 1), 'är mindre än padKm'),
        ('land över havet utan avstånd (#1690)', lambda d: d['neighbours'].append({'ne': '276', 'label': [12.5, 54.5], 'name': d['neighbours'][0]['name'], 'sea': True}), 'ska ha km högst landPadKm'),
        ('land över havet utanför landsmarginalen (#1690)', lambda d: d['neighbours'].append({'ne': '276', 'label': [12.5, 54.5], 'name': d['neighbours'][0]['name'], 'sea': True, 'km': d['landPadKm'] + 1}), 'ska ha km högst landPadKm'),
        ('avstånd för en granne med landgräns (#1690)', lambda d: d['neighbours'][0].update(km=10), 'har km eller far utan sea'),
        ('far för en granne med landgräns (#1690)', lambda d: d['neighbours'][0].update(far=True), 'har km eller far utan sea'),
    ]


with tempfile.TemporaryDirectory() as tmp:
    site = Path(tmp) / 'dist'
    shutil.copytree(DIST, site)
    target = site / 'data' / 'ortnamn' / 'skane.json'
    good = json.loads(target.read_text(encoding='utf-8'))
    for name, change, expected in ortnamn_cases():
        doc = copy.deepcopy(good)
        change(doc)
        target.write_text(json.dumps(doc, ensure_ascii=False), encoding='utf-8')
        result = subprocess.run([sys.executable, '-I', 'scripts/validate-site.py', str(site)], cwd=ROOT, text=True, capture_output=True)
        if result.returncode == 0:
            raise SystemExit(f'Ortnamn, {name}: förväntade att filen underkänns.')
        if expected not in result.stderr:
            raise SystemExit(f'Ortnamn, {name}: underkändes av fel skäl:\n{result.stderr}')

print(f'validate-schema-test: ok (saknad title och ogiltig evidence underkänns; bildlagrets exempel godkänns och {len(cases)} avsiktliga fel underkänns; '
      f'{len(ortnamn_cases())} fel i ortnamnen underkänns)')
