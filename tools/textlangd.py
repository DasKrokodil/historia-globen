#!/usr/bin/env python3
"""Spärren mot långa faktatexter (#1599, docs/beslut/2026-11-14-kortare-faktatexter.md).

Regeln: en sammanfattning (`summary`) på händelser, resor och vägar ska som huvudregel vara högst cirka 300 tecken
på svenska. Äldre texter kortas i omgångar, och antalet texter över gränsen får aldrig öka, på samma sätt som
antalet oöversatta texter (tools/oversattning.py).

Skriptet läser data/handelser/*.json och data/routes/*.json, utom poster med review "draft", och räknar per fil hur
många svenska sammanfattningar som är längre än GRANS tecken. Siffrorna står i data/textlangd.json (baslinje) och
får bara minska. Bara svenskan räknas: översättningarna följer svenskan (beslut 2026-11-06).

  python3 tools/textlangd.py           kontrollerar, och skriver om baslinjen om ingen fil har fler långa texter
  python3 tools/textlangd.py --check   skriver ingenting, avslutas med kod 1 om något inte stämmer
  python3 tools/textlangd.py --lista   visar de långa texterna, längst först (för nästa omgång)

Fel som stoppar: fler långa texter i en fil än baslinjen (en ny eller förlängd text över gränsen). Bara vid --check
stoppar också en baslinje som är för hög: kör då skriptet utan --check och checka in data/textlangd.json.
Undantag, bara med DasKrokodils ok: --tillat-okning skriver en högre baslinje (en text som behöver vara längre).
"""
import json
import sys
from pathlib import Path

GRANS = 300
STATUS = 'data/textlangd.json'
FILES = ['data/handelser/*.json', 'data/routes/*.json']
NOTE = ('Genereras av tools/textlangd.py (#1599). baseline: antal svenska sammanfattningar (summary) över '
        f'{GRANS} tecken per fil, som bara får minska. Redigera inte för hand; kör python3 tools/textlangd.py.')


def posts(data):
    """Händelser (events) och vägar eller resor (routes) i en datafil."""
    if isinstance(data, dict):
        for key in ('events', 'routes'):
            for p in data.get(key, []) or []:
                if isinstance(p, dict):
                    yield p


def scan(root):
    """{fil: antal långa}, [(längd, fil, id)] för alla långa texter."""
    counts, long = {}, []
    for pattern in FILES:
        for path in sorted(root.glob(pattern)):
            if path.name == 'index.json':
                continue
            rel = path.relative_to(root).as_posix()
            n = 0
            for p in posts(json.loads(path.read_text(encoding='utf-8'))):
                if p.get('review') == 'draft':
                    continue
                sv = (p.get('summary') or {}).get('sv') if isinstance(p.get('summary'), dict) else None
                if isinstance(sv, str) and len(sv) > GRANS:
                    n += 1
                    long.append((len(sv), rel, p.get('id', '?')))
            counts[rel] = n
    return counts, sorted(long, reverse=True)


def compare(root):
    """(fel, påminnelser, ny status)."""
    counts, _ = scan(root)
    status_path = root / STATUS
    baseline = json.loads(status_path.read_text(encoding='utf-8')).get('baseline', {}) if status_path.exists() else {}
    errors, reminders = [], []
    for rel, n in counts.items():
        old = baseline.get(rel, 0)
        if n > old:
            errors.append(f'{rel}: {n - old} {"ny lång text" if n - old == 1 else "nya långa texter"} över {GRANS} '
                          f'tecken ({n}, baslinjen är {old}). Korta sammanfattningen (beslut 2026-11-14).')
        elif n < old:
            reminders.append(f'{rel}: {old - n} färre långa texter än baslinjen')
    for rel, old in baseline.items():
        if rel not in counts and old:
            reminders.append(f'{rel}: filen finns inte längre (baslinjen är {old})')
    return errors, reminders, {'note': NOTE, 'limit': GRANS, 'baseline': dict(sorted(counts.items()))}


def dump(status):
    c = lambda v: json.dumps(v, ensure_ascii=False)
    rows = ',\n'.join(f'  {c(k)}: {v}' for k, v in status['baseline'].items())
    return f'{{\n"note": {c(status["note"])},\n"limit": {status["limit"]},\n"baseline": {{\n{rows}\n}}\n}}\n'


def main():
    root = Path(__file__).resolve().parent.parent
    args = sys.argv[1:]
    if '--root' in args:
        root = Path(args[args.index('--root') + 1]).resolve()
    if '--lista' in args:
        _, long = scan(root)
        for n, rel, pid in long:
            print(f'{n:5}  {rel}  {pid}')
        print(f'{len(long)} texter över {GRANS} tecken')
        return
    errors, reminders, status = compare(root)
    if '--tillat-okning' in args:
        errors = []
    if '--check' in args:
        for e in errors + reminders:
            print(f'textlangd: {e}', file=sys.stderr)
        if reminders and not errors:
            print('textlangd: kör python3 tools/textlangd.py och checka in data/textlangd.json', file=sys.stderr)
        sys.exit(1 if errors or reminders else 0)
    if errors:
        for e in errors:
            print(f'textlangd: {e}', file=sys.stderr)
        print('textlangd: ingenting skrevs', file=sys.stderr)
        sys.exit(1)
    (root / STATUS).write_text(dump(status), encoding='utf-8')
    total = sum(status['baseline'].values())
    print(f'{STATUS}: {total} sammanfattningar över {GRANS} tecken')


if __name__ == '__main__':
    main()
