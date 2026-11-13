#!/usr/bin/env python3
"""Testar täckningsrapporten (#563) med en liten testdata: räkningen, markeringarna och att samma
indata ger samma rapport. Repot ändras inte."""
import importlib.util
import json
import re
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('tackning', ROOT / 'tools' / 'tackning.py')
tackning = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tackning)


def event(eid, start, lon, lat, category, **extra):
    return {'id': eid, 'category': category, 'start': start, 'end': start, 'precision': 9, 'edtf': str(start),
            'location': {'type': 'Point', 'coordinates': [lon, lat]}, 'sources': ['a'], **extra}


EVENTS = [
    # Europa (Paris), 1800-tal: tre händelser, en med bild, en med två källor, ett krig
    event('e1', 1850, 2.35, 48.85, 'krig', kind='war'),
    event('e2', 1860, 2.35, 48.85, 'kultur', image={'file': 'x.webp'}),
    event('e3', 1870, 2.35, 48.85, 'vetenskap', sources=['a', 'b'], edtf='1870~', locationPrecision='region'),
    # Asien (Peking), antiken: en händelse med platshållarbild och en okänd källa (räknas inte som två källor)
    event('a1', -500, 116.4, 39.9, 'religion', image={'file': 'y.webp', 'placeholder': True}, sources=['a', 'saknas']),
]
FUNFACTS = [
    {'id': 'f1', 'events': ['e1', 'a1'], 'review': 'source-checked'},
    {'id': 'f2', 'events': ['e2'], 'review': 'draft'},  # utkast räknas inte
]
SOURCES = [{'id': 'a'}, {'id': 'b'}]
BILDLOGG = [{'id': 'e2'}, {'id': 'a1'}, {'id': 'e3'}]  # e2 har bild; a1 (platshållare) och e3 väntar


def write(root, path, value):
    p = root / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False), encoding='utf-8')


with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    write(root, 'data/events.json', {'events': EVENTS})
    write(root, 'data/funfacts.json', {'funfacts': FUNFACTS})
    write(root, 'data/sources.json', {'sources': SOURCES})
    write(root, 'images/incoming/bildlogg.json', BILDLOGG)
    first = tackning.build(root, date(2026, 11, 5))
    second = tackning.build(root, date(2026, 11, 5))

assert first == second, 'samma indata ska ge samma rapport'
expect = [
    '# Täckningsrapport 2026-11-05',
    '**Händelser:** 4.',
    '| 1800-tal | 3 | **0** | **0** | **0** | **0** | 3 |',   # tre i Europa, tomt i övrigt
    '| Antiken (3000 f.Kr.–500) | **0** | 1* | **0** | **0** | **0** | 1 |',  # en = nästan tom
    '| 1800-talet | 3 | **0** | **0** | **0** | **0** | 3 |',
    '`data/land.json` saknas, så världsdelarna vägs lika.',
    'Inga händelser har taggen `framsteg` ännu',
    '**Bilder som väntar** i `images/incoming/bildlogg.json` utan att vara inlagda: 2 (a1, e3).',
]
for text in expect:
    assert text in first, f'saknas i rapporten: {text}\n\n{first}'


def row(section, period):
    part = first.split(f'## {section}\n', 1)[1]
    return next(line for line in part.splitlines() if line.startswith(f'| {period} |'))


assert row('Balans: krig mot övrigt', '1800-tal') == '| 1800-tal | 33 % | – | – | – | – | 33 % |'
assert row('Bilder', 'Antiken (3000 f.Kr.–500)').startswith('| Antiken (3000 f.Kr.–500) | – | 0 % |'), 'platshållare är ingen bild'
assert row('Fun facts', '1800-tal') == '| 1800-tal | 33 % | – | – | – | – | 33 % |', 'utkast till fun fact räknas inte'
assert row('Två källor', 'Antiken (3000 f.Kr.–500)').startswith('| Antiken (3000 f.Kr.–500) | – | 0 % |'), 'okänd källa räknas inte'
assert row('Osäkert datum', '1800-tal') == '| 1800-tal | 33 % | – | – | – | – | 33 % |'
assert row('Ungefärlig plats', '1800-tal') == '| 1800-tal | 33 % | – | – | – | – | 33 % |'
gaps = first.split('## De 10 största luckorna\n', 1)[1]
assert len(re.findall(r'^\| \d+ \|', gaps, re.M)) == 10, 'listan ska ha tio luckor'
assert '| 1 | ' in gaps and '| alla |' in gaps

# Världsdelarnas landyta ur den riktiga grundkartan: alla fem finns och andelarna summerar till 1
shares = tackning.land_shares(ROOT / 'data' / 'land.json')
assert shares and set(shares) == set(tackning.REGIONS) and abs(sum(shares.values()) - 1) < 1e-9
assert all(v > 0 for v in shares.values())
# Världsindelningen (#630): Mikronesien och Rapa Nui räknas till Oceanien, grannarna flyttar inte
for name, lat, lon, want in [('Guam', 13.47, 144.75, 'Oceanien'), ('Saipan', 15.18, 145.75, 'Oceanien'),
                             ('Nan Madol', 6.84, 158.33, 'Oceanien'), ('Rapa Nui', -27.11, -109.36, 'Oceanien'),
                             ('Tokyo', 35.68, 139.69, 'Asien'), ('Manila', 14.6, 120.98, 'Asien'),
                             ('Lima', -12.05, -77.04, 'Amerika'), ('Honolulu', 21.31, -157.86, 'Oceanien')]:
    assert tackning.region(lat, lon) == want, f'{name}: {tackning.region(lat, lon)}, väntat {want}'
# Krig utan slag som bara syns i Fokus, riken per period och rikenas landyta (#1341)
SQUARE = {'type': 'Polygon', 'coordinates': [[[0, 40], [10, 40], [10, 50], [0, 50], [0, 40]]]}
assert len(tackning.cells_inside(SQUARE['coordinates'], 1.0)) == 100, 'en ruta på 10 × 10 grader är 100 rutor'
EUROPE = {'type': 'Polygon', 'coordinates': [[[-10, 40], [40, 40], [40, 60], [-10, 60], [-10, 40]]]}
with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    write(root, 'data/events.json', {'events': [
        event('k1', 1850, 2.35, 48.85, 'krig', kind='war'),
        event('k2', 1851, 2.35, 48.85, 'krig', partOf='k1'),            # syns bara i Fokus
        event('k3', 1852, 2.35, 48.85, 'krig', partOf='k1', top=True),  # syns på globen
        event('k4', 1853, 2.35, 48.85, 'kultur'),
    ]})
    write(root, 'data/funfacts.json', {'funfacts': []})
    write(root, 'data/sources.json', {'sources': SOURCES})
    (root / 'data/land.json').write_text((ROOT / 'data/land.json').read_text(encoding='utf-8'), encoding='utf-8')
    write(root, 'data/empires/index.json', {'groups': [
        {'id': 'r1', 'file': 'data/empires/r1.json'}, {'id': 'r2', 'file': 'data/empires/r2.json'}]})
    write(root, 'data/empires/r1.json', {'polities': [{'id': 'r1', 'review': 'source-checked', 'periods': [
        {'start': 1800, 'end': 1899, 'label': [5, 45], 'geometry': EUROPE}]}]})
    write(root, 'data/empires/r2.json', {'polities': [{'id': 'r2', 'review': 'draft', 'periods': [
        {'start': 1800, 'end': 1899, 'label': [100, 30], 'geometry': SQUARE}]}]})  # utkast räknas inte
    rep = tackning.build(root, date(2026, 11, 13))
part = rep.split('## Balans: krig mot övrigt, utan slag som bara syns i Fokus\n', 1)[1]
assert 'utan de 1 händelser' in part and '2 av 3 händelser är krig' in part, part[:400]
assert next(l for l in part.splitlines() if l.startswith('| 1800-tal |')) == '| 1800-tal | 67 % | – | – | – | – | 67 % |'
whole = rep.split('## Balans: krig mot övrigt\n', 1)[1]
assert next(l for l in whole.splitlines() if l.startswith('| 1800-tal |')) == '| 1800-tal | 75 % | – | – | – | – | 75 % |'
emp = rep.split('## Riken per period och världsdel\n', 1)[1]
assert next(l for l in emp.splitlines() if l.startswith('| 1800-tal |')) == '| 1800-tal | 1 | **0** | **0** | **0** | **0** | 1 |'
land = rep.split('## Rikenas landyta\n', 1)[1]
r1850 = next(l for l in land.splitlines() if l.startswith('| 1850 |'))
assert r1850.startswith('| 1850 | 1 | ') and r1850.endswith('| inte mätt |') and '| 0 % |' not in r1850, r1850
assert next(l for l in land.splitlines() if l.startswith('| 1914 |')) == '| 1914 | 0 | 0 % | inte mätt |'
print('tackning-test: ok (räkning, markeringar, andelar, världsdelar, luckor, krig utan Fokus-slag, riken och samma rapport vid samma indata)')
