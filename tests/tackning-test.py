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
print('tackning-test: ok (räkning, markeringar, andelar, luckor och samma rapport vid samma indata)')
