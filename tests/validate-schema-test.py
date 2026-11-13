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

print(f'validate-schema-test: ok (saknad title och ogiltig evidence underkänns; bildlagrets exempel godkänns och {len(cases)} avsiktliga fel underkänns)')
