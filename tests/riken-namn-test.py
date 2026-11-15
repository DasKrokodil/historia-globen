#!/usr/bin/env python3
"""Rikenas svenska namn (#1702): name.sv får inte vara det engelska namnet när det engelska innehåller Empire,
Kingdom, Sultanate eller dynasty. Det fångar ett rike som har fått Cliopatrias eller engelska Wikipedias namn i det
svenska fältet. Provet läser data/empires/index.json och rikesfilerna (grupper, delar och inflytande) och körs i CI
utan shapely: python3 -I tests/riken-namn-test.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGELSKA = re.compile(r'\b(empire|kingdom|sultanate|dynasty)\b', re.IGNORECASE)


def engelskt(name):
    return isinstance(name, dict) and name.get('sv') and name.get('sv') == name.get('en') and ENGELSKA.search(name['en'])


fel = []
# Enhetsprov
if not engelskt({'sv': 'Chola Empire', 'en': 'Chola Empire'}) or not engelskt({'sv': 'Pagan kingdom', 'en': 'Pagan kingdom'}):
    fel.append('provet känner inte igen ett engelskt namn i name.sv')
if engelskt({'sv': 'Cholariket', 'en': 'Chola Empire'}) or engelskt({'sv': 'Qocho', 'en': 'Qocho'}):
    fel.append('provet stoppar ett svenskt namn')

index = json.loads((ROOT / 'data/empires/index.json').read_text(encoding='utf-8'))
for g in index['groups']:
    if engelskt(g['name']):
        fel.append(f"index.json, gruppen {g['id']}: name.sv är det engelska namnet \"{g['name']['sv']}\"")
    for p in g.get('polities', []):
        if engelskt(p.get('name')):
            fel.append(f"index.json, {g['id']}/{p['id']}: name.sv är det engelska namnet \"{p['name']['sv']}\"")
    for q in g.get('influence', []):
        if engelskt(q.get('name')):
            fel.append(f"index.json, inflytande i {g['id']}: name.sv är det engelska namnet \"{q['name']['sv']}\"")
    f = ROOT / (g.get('file') or '')
    if not g.get('file') or not f.is_file():
        continue
    doc = json.loads(f.read_text(encoding='utf-8'))
    for p in doc.get('polities', []):
        if engelskt(p.get('name')):
            fel.append(f"{g['file']}, {p['id']}: name.sv är det engelska namnet \"{p['name']['sv']}\"")
        for q in p.get('influence', []):
            if engelskt(q.get('name')):
                fel.append(f"{g['file']}, inflytande i {p['id']}: name.sv är det engelska namnet \"{q['name']['sv']}\"")

if fel:
    print('\n'.join(sorted(set(fel))))
    sys.exit(1)
print(f"riken-namn: {len(index['groups'])} grupper har svenska namn i name.sv")
