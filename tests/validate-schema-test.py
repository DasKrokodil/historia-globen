#!/usr/bin/env python3
"""Visar att JSON Schema-kontrollen stoppar ett avsiktligt fel (#391)."""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
FIXTURE = ROOT / 'tests' / 'fixtures' / 'schema-invalid-event.json'

if not DIST.is_dir():
    subprocess.run(['bash', 'scripts/build-site.sh'], cwd=ROOT, check=True)

with tempfile.TemporaryDirectory() as tmp:
    broken = Path(tmp) / 'dist'
    shutil.copytree(DIST, broken)
    shutil.copyfile(FIXTURE, broken / 'data' / 'events.json')
    result = subprocess.run(
        [sys.executable, '-I', 'scripts/validate-site.py', str(broken)],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )

if result.returncode == 0:
    raise SystemExit('Förväntade att det medvetet felaktiga eventet underkänns.')
if "obligatoriska fältet 'title' saknas" not in result.stderr:
    raise SystemExit(f'Feltestet underkändes av fel skäl:\n{result.stderr}')
print('validate-schema-test: ok (medvetet saknad title underkänns)')
