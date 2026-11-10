#!/usr/bin/env python3
"""Kontrollerar att fältet significance (#1021) sitter på exakt de händelser som den godkända listan
anger (lista = forslag i docs/granskningar/2026-11-09-oversikt-urval.csv): rätt antal, rätt id:n, inga andra."""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
csv_ids = {r['id'] for r in csv.DictReader(open(ROOT / 'docs/granskningar/2026-11-09-oversikt-urval.csv', encoding='utf-8'))
           if r['lista'] == 'forslag'}
marked = set()
for f in sorted((ROOT / 'data/handelser').glob('*.json')):
    for e in json.load(open(f, encoding='utf-8'))['events']:
        if 'significance' in e:
            assert e['significance'] == 1, f"{e['id']}: significance ska vara 1"
            marked.add(e['id'])
generated = json.load(open(ROOT / 'data/events.json', encoding='utf-8'))
generated = generated['events'] if isinstance(generated, dict) else generated
built = {e['id'] for e in generated if 'significance' in e}
problems = []
if len(csv_ids) != 123:
    problems.append(f'CSV:n har {len(csv_ids)} förslag, väntade 123')
if marked != csv_ids:
    problems.append(f'saknas: {sorted(csv_ids - marked)}; för mycket: {sorted(marked - csv_ids)}')
if built != marked:
    problems.append('data/events.json är inte ombyggd (kör python3 tools/dela_data.py)')
if problems:
    print('\n'.join(problems))
    sys.exit(1)
print(f'significance: {len(marked)} händelser, stämmer med CSV:n')
