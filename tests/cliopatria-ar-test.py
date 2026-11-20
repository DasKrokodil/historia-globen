#!/usr/bin/env python3
"""Cliopatrias årtal (#1989): tools/cliopatria_ar.py räknar om Cliopatrias -N (N f.Kr.) till det astronomiska året 1 - N,
och den byggda rikesdatan har kända slag på rätt år. Körs i CI utan shapely: python3 -I tests/cliopatria-ar-test.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from cliopatria_ar import astronomiskt  # noqa: E402

fel = []
# Enhetsprov: -N blir 1 - N, år 0 (bara slutår före år 1 i Cliopatria) och år efter Kristus är oförändrade
for cl, ast in [(-1, 0), (0, 0), (1, 1), (-3400, -3399), (-2500, -2499), (-31, -30), (2024, 2024)]:
    if astronomiskt(cl) != ast:
        fel.append(f'astronomiskt({cl}) ger {astronomiskt(cl)}, väntat {ast}')


def first_starts(group):
    doc = json.loads((ROOT / f'data/empires/{group}.json').read_text(encoding='utf-8'))
    return {p['id']: [q['start'] for q in p['periods']] for p in doc['polities']}


# Den byggda datan: Cliopatrias ändringsår ligger på slagens år enligt Wikidata (astronomiska år)
rom = first_starts('romarriket')
if rom.get('romerska-kejsardomet', [None])[0] != -30:
    fel.append(f"Romerska kejsardömet börjar {rom.get('romerska-kejsardomet', [None])[0]}, väntat -30 (Actium 31 f.Kr., Q160387)")
pers = first_starts('persiska-riket').get('akemenidiska-riket', [])
for y, slag in [(-332, 'Issos 333 f.Kr., Q201526'), (-330, 'Gaugamela 331 f.Kr., Q179670')]:
    if y not in pers:
        fel.append(f'Persiska riket har ingen period som börjar {y} ({slag})')
egypt = json.loads((ROOT / 'data/empires/index.json').read_text(encoding='utf-8'))
egypt = next(g for g in egypt['groups'] if g['id'] == 'egypten')
if egypt['from'] != -2499:
    fel.append(f"Egypten börjar {egypt['from']}, väntat -2499 (Cliopatria -2500 = 2500 f.Kr.)")

if fel:
    print('cliopatria-ar-test: FEL\n  ' + '\n  '.join(fel))
    sys.exit(1)
print('cliopatria-ar-test: ok (omräkningen -N → 1 - N, år 0 och år efter Kristus; Actium, Issos, Gaugamela och Egyptens början i datan)')
