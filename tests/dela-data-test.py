#!/usr/bin/env python3
"""Visar att tools/dela_data.py stoppar fel i redigeringsfilerna och i de byggda filerna (#394).

Varje fall kopierar data/ till en tillfällig mapp, gör ett medvetet fel och kontrollerar att
dela_data.check() underkänner det av rätt skäl. Repot ändras inte.
"""
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('dela_data', ROOT / 'tools' / 'dela_data.py')
dela_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dela_data)


def rejects(name, change, expected):
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        shutil.copytree(ROOT / 'data', root / 'data')
        if dela_data.check(root):
            raise SystemExit(f'{name}: kopian av data/ underkänns redan innan felet (kör python3 tools/dela_data.py)')
        change(root)
        errors = dela_data.check(root)
    if not errors:
        raise SystemExit(f'{name}: förväntade att felet underkänns')
    if not any(expected in e for e in errors):
        raise SystemExit(f'{name}: underkändes av fel skäl:\n' + '\n'.join(errors))


def edit_period(pid, fn):
    """Ändrar listan events i en periodfil (filen skrivs om; formatet spelar ingen roll i testet)."""
    def change(root):
        path = root / 'data' / 'handelser' / f'{pid}.json'
        doc = json.loads(path.read_text(encoding='utf-8'))
        fn(doc['events'])
        path.write_text(json.dumps(doc, ensure_ascii=False), encoding='utf-8')
    return change


def move_first_to(src, dst):
    def change(root):
        events = {}
        for pid in (src, dst):
            events[pid] = json.loads((root / 'data' / 'handelser' / f'{pid}.json').read_text(encoding='utf-8'))
        events[dst]['events'].append(events[src]['events'].pop(0))
        for pid, doc in events.items():
            (root / 'data' / 'handelser' / f'{pid}.json').write_text(json.dumps(doc, ensure_ascii=False), encoding='utf-8')
    return change


def hand_edit_events_json(root):
    path = root / 'data' / 'events.json'
    path.write_text(path.read_text(encoding='utf-8').replace('"review":"two-sources"', '"review":"draft"', 1),
                    encoding='utf-8')


def copy_first_event(events):
    events.append(dict(events[0]))


def change_title(events):
    events[0]['title'] = {'sv': 'Ändrad utan att dela_data.py kördes'}


def extra_file(root):
    (root / 'data' / 'handelser' / 'medeltid.json').write_text('{"events": []}', encoding='utf-8')


rejects('händelse i fel periodfil', move_first_to('fkr', '1946-'), 'ska ligga i data/handelser/fkr.json')
rejects('samma id två gånger', edit_period('1-1499', copy_first_event), 'finns redan i data/handelser/1-1499.json')
rejects('okänd fil i data/handelser/', extra_file, 'data/handelser/medeltid.json är ingen periodfil')
rejects('events.json ändrad för hand', hand_edit_events_json, 'data/events.json stämmer inte med redigeringsfilerna')
rejects('redigeringsfil ändrad utan att skriptet kördes', edit_period('1800-1899', change_title),
        'data/events.json stämmer inte med redigeringsfilerna')
print('dela-data-test: ok (fel periodfil, dubbla id, okänd fil, handredigerad events.json och glömd körning underkänns)')
