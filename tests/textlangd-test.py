#!/usr/bin/env python3
"""Visar att spärren mot långa faktatexter fungerar (#1599): tools/textlangd.py stoppar en ny sammanfattning över
gränsen, godtar en kortare text och räknar inte utkast.

Varje fall kopierar data/handelser/ och data/routes/ till en tillfällig mapp och ändrar där. Repot ändras inte.
"""
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('textlangd', ROOT / 'tools' / 'textlangd.py')
textlangd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(textlangd)
ROUTE = 'data/routes/columbus.json'


def copy():
    tmp = Path(tempfile.mkdtemp())
    for d in ('data/handelser', 'data/routes'):
        shutil.copytree(ROOT / d, tmp / d)
    shutil.copy(ROOT / textlangd.STATUS, tmp / textlangd.STATUS)
    return tmp


def edit(root, fn):
    path = root / ROUTE
    data = json.loads(path.read_text(encoding='utf-8'))
    fn(next(r for r in data['routes'] if r['id'] == 'columbus-resa-4'))  # 292 tecken, under gränsen
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def check(name, ok):
    print(('ok    ' if ok else 'FEL   ') + name)
    return ok


results = []

# 1. Repots egen baslinje stämmer
errors, reminders, _ = textlangd.compare(ROOT)
results.append(check('baslinjen i data/textlangd.json stämmer med datan', not errors and not reminders))

# 2. En förlängd sammanfattning stoppas
root = copy()
edit(root, lambda r: r['summary'].update(sv='x' * (textlangd.GRANS + 1)))
before = json.loads((ROOT / textlangd.STATUS).read_text(encoding='utf-8'))['baseline'][ROUTE]
errors, _, _ = textlangd.compare(root)
results.append(check('en ny text över gränsen stoppas', any(ROUTE in e and f'baslinjen är {before}' in e for e in errors)))

# 3. Samma text som utkast räknas inte
edit(root, lambda r: r.update(review='draft'))
errors, _, _ = textlangd.compare(root)
results.append(check('ett utkast räknas inte', not errors))
shutil.rmtree(root)

# 4. En kortad text ger en påminnelse om att sänka baslinjen, inget fel
root = copy()
path = root / 'data/routes/slavhandeln.json'
data = json.loads(path.read_text(encoding='utf-8'))
data['routes'][0]['summary']['sv'] = 'Kort.'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
errors, reminders, status = textlangd.compare(root)
results.append(check('en kortad text sänker baslinjen utan fel',
                     not errors and reminders and status['baseline']['data/routes/slavhandeln.json'] == 2))
shutil.rmtree(root)

if not all(results):
    raise SystemExit(1)
