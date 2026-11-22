#!/usr/bin/env python3
"""Grinden för pipelinen (#2183, beslut 2026-11-22): program skriver bara förslag till data/utkast/.

1. En pull request från en pipelinegren (bildkandidater/*, bildbatch/*, fakta/*) får bara ändra filer under data/utkast/.
   I GitHub Actions läses grenen ur GITHUB_HEAD_REF och de ändrade filerna ur `git diff HEAD^1 HEAD` (sammanslagnings-
   committen för pull requesten). Utanför Actions, eller för andra grenar, prövas bara reglerna nedan.
2. Faktautkast i data/utkast/fakta/ har alltid review "draft" och aldrig någon summary (texten skrivs av en agent efter
   öppnad källa, CLAUDE.md Källpolicy och Licenser).
3. Pipelineverktygen (tools/bildkandidater.py, tools/bildbatch.py) skickar sin utdatamapp genom sakra_utkastvag.

Kör: python3 -I tests/utkast-grans-test.py
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PIPELINEGRENAR = re.compile(r'^(bildkandidater|bildbatch|fakta)/')
VERKTYG = ('tools/bildkandidater.py', 'tools/bildbatch.py')


def fel_for_gren(gren, filer):
    """Filer som en pipelinegren inte får ändra (tom lista = godkänt eller inte en pipelinegren)."""
    if not PIPELINEGRENAR.match(gren or ''):
        return []
    return [f for f in filer if not f.startswith('data/utkast/')]


def fel_i_faktautkast(mapp=ROOT / 'data' / 'utkast' / 'fakta'):
    fel = []
    for f in sorted(Path(mapp).glob('*.json')):
        d = json.loads(f.read_text(encoding='utf-8'))
        for e in d.get('events', d.get('handelser', [])):
            if e.get('review') != 'draft':
                fel.append(f'{f.name}: {e.get("id")} har review {e.get("review")!r}, inte "draft"')
            if 'summary' in e:
                fel.append(f'{f.name}: {e.get("id")} har en summary; texten skrivs av en agent efter öppnad källa')
    return fel


def sjalvprov():
    assert fel_for_gren('bildkandidater/123', ['data/utkast/bildkandidater/afrika-1800.json']) == []
    assert fel_for_gren('bildbatch/2107', ['data/utkast/bildbatch/2107.md', 'data/handelser/1000-1499.json']) == \
        ['data/handelser/1000-1499.json']
    assert fel_for_gren('fakta/afrika', ['data/sources.json']) == ['data/sources.json']
    assert fel_for_gren('claude/issue-2107-bilder', ['data/handelser/1000-1499.json']) == []  # en vanlig bildgren
    import tempfile
    with tempfile.TemporaryDirectory() as t:
        (Path(t) / 'a.json').write_text(json.dumps({'events': [
            {'id': 'ok', 'review': 'draft'}, {'id': 'hog', 'review': 'source-checked'}, {'id': 'text', 'review': 'draft', 'summary': {}}]}))
        assert len(fel_i_faktautkast(t)) == 2


def andrade_filer():
    try:
        ut = subprocess.run(['git', 'diff', '--name-only', 'HEAD^1', 'HEAD'], cwd=ROOT, capture_output=True, text=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    return [r for r in ut.stdout.splitlines() if r]


def main():
    sjalvprov()
    fel = fel_i_faktautkast()
    for v in VERKTYG:
        if 'sakra_utkastvag(' not in (ROOT / v).read_text(encoding='utf-8'):
            fel.append(f'{v} skickar inte utdatamappen genom sakra_utkastvag')
    gren = os.environ.get('GITHUB_HEAD_REF', '')
    if PIPELINEGRENAR.match(gren):
        filer = andrade_filer()
        if filer is None:
            fel.append('kunde inte läsa de ändrade filerna (git diff HEAD^1 HEAD)')
        else:
            fel += [f'{gren} ändrar {f}, utanför data/utkast/' for f in fel_for_gren(gren, filer)]
    for f in fel:
        print('FEL', f)
    print('utkast-grans-test: ' + ('fel' if fel else 'ok'))
    return 1 if fel else 0


if __name__ == '__main__':
    sys.exit(main())
