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
print('validate-schema-test: ok (saknad title och ogiltig evidence underkänns)')
