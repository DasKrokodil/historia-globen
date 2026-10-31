#!/usr/bin/env python3
"""Delar upp stora datafiler i mindre filer som sidan laddar när de behövs (#337).

Källfilerna är fortfarande det man redigerar: data/events.json och data/empires/index.json.
Skriptet skriver de uppdelade filerna i data/genererat/, och de checkas in. Inget byggsteg (CLAUDE.md
punkt 1): skriptet körs för hand efter varje ändring i källfilerna, och scripts/validate-site.py
kontrollerar att de genererade filerna stämmer med källan, så att ingen glömmer att köra det.

  python3 tools/dela_data.py          skriver om filerna i data/genererat/
  python3 tools/dela_data.py --check  skriver ingenting, avslutas med kod 1 om något inte stämmer

Filerna (docs/datamodell.md, "Uppdelade filer"):
  handelser.json            alla händelser, utan de långa fälten. Räcker för tidslinjen, markörerna, listan
                            Samtidigt i världen och Samtidigt-kortets text. Laddas vid start.
  handelser-<period>.json   de långa fälten (DETAIL nedan) för händelserna som börjar i perioden. Laddas
                            när händelserna syns eller när en faktaruta öppnas.
  riken.json                data/empires/index.json utan rikenas faktarutor (facts). hasFacts: true säger
                            att riket har en faktaruta. Laddas vid start.
  riken-fakta.json          rikenas faktarutor och nyckelår, per grupp-id. Laddas när en faktaruta öppnas
                            eller när man följer ett rike.

Texter per språk: fälten i en händelse slås ihop på djupet i webbläsaren (mergeTexts i js/model.js), så att
en senare fil med bara engelska texter kan läggas ovanpå utan att de svenska försvinner (docs/datamodell.md).
"""
import json
import sys
from pathlib import Path

# Fälten som flyttas till periodfilerna. note stannar med bara sin rubrik i indexet, eftersom markören
# visar "osäker" när rubriken är "Källorna skiljer sig" (js/layers/events.js); hela noten ligger i periodfilen.
DETAIL = ['summary', 'note', 'story', 'image', 'sources', 'wikidata']

# Perioderna efter händelsens start (astronomiskt år). from = första året i perioden, None = från början.
# Gränserna är valda så att filerna blir ungefär lika stora (40–120 kB). Ändras de, ändras filnamnen.
PERIODS = [
    ('fkr', None),          # före vår tideräkning (år 0 och tidigare)
    ('1-1499', 1),
    ('1500-1799', 1500),
    ('1800-1899', 1800),
    ('1900-1945', 1900),
    ('1946-', 1946),
]

OUT = 'data/genererat'
NOTE = 'Genereras av tools/dela_data.py ur {src}. Redigera inte här, utan i källfilen, och kör skriptet igen.'


def period_of(start):
    """Perioden en händelse hör till: den sista perioden vars from är högst start (samma regel som js/model.js)."""
    pid = PERIODS[0][0]
    for p, frm in PERIODS:
        if frm is None or start >= frm:
            pid = p
    return pid


def dump_lines(head, key, items):
    """JSON med en post per rad, så att ändringar syns rad för rad i git. head = övriga fält först."""
    c = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    lines = [f'{c(k)}:{c(v)},' for k, v in head.items()]
    if isinstance(items, dict):
        body = ',\n'.join(f'{c(k)}:{c(v)}' for k, v in items.items())
        return '{' + '\n'.join(lines) + f'\n{c(key)}:{{\n{body}\n}}}}\n'
    body = ',\n'.join(c(v) for v in items)
    return '{' + '\n'.join(lines) + f'\n{c(key)}:[\n{body}\n]}}\n'


def build(root):
    """Alla genererade filer som {relativ sökväg: innehåll}, räknade ur källfilerna under root."""
    root = Path(root)
    events = json.loads((root / 'data/events.json').read_text(encoding='utf-8'))['events']
    empires = json.loads((root / 'data/empires/index.json').read_text(encoding='utf-8'))
    out = {}

    index, details = [], {p: {} for p, _ in PERIODS}
    for e in events:
        light = {k: v for k, v in e.items() if k not in DETAIL}
        if isinstance(e.get('note'), dict) and 'title' in e['note']:
            light['note'] = {'title': e['note']['title']}
        index.append(light)
        details[period_of(e['start'])][e['id']] = {k: e[k] for k in DETAIL if k in e}
    periods = [{'id': p, 'from': frm, 'file': f'{OUT}/handelser-{p}.json'} for p, frm in PERIODS]
    out[f'{OUT}/handelser.json'] = dump_lines(
        {'note': NOTE.format(src='data/events.json'), 'detail': DETAIL, 'periods': periods}, 'events', index)
    for p, _ in PERIODS:
        out[f'{OUT}/handelser-{p}.json'] = dump_lines(
            {'note': NOTE.format(src='data/events.json'), 'period': p}, 'events', details[p])

    groups, facts = [], {}
    for g in empires['groups']:
        light = {k: v for k, v in g.items() if k != 'facts'}
        if g.get('facts'):
            light['hasFacts'] = True
            facts[g['id']] = g['facts']
        groups.append(light)
    out[f'{OUT}/riken.json'] = dump_lines({'note': NOTE.format(src='data/empires/index.json')}, 'groups', groups)
    out[f'{OUT}/riken-fakta.json'] = dump_lines({'note': NOTE.format(src='data/empires/index.json')}, 'facts', facts)
    return out


def check(root, gen_root=None):
    """Fel som text: genererade filer som saknas, inte stämmer med källan eller inte längre genereras."""
    root = Path(root)
    gen_root = Path(gen_root or root)
    want = build(root)
    errors = []
    for path, text in want.items():
        f = gen_root / path
        if not f.is_file():
            errors.append(f'{path} saknas (kör python3 tools/dela_data.py)')
        elif f.read_text(encoding='utf-8') != text:
            errors.append(f'{path} stämmer inte med källan (kör python3 tools/dela_data.py)')
    extra = sorted(p.relative_to(gen_root).as_posix() for p in (gen_root / OUT).glob('*.json')
                   if p.relative_to(gen_root).as_posix() not in want) if (gen_root / OUT).is_dir() else []
    errors += [f'{p} genereras inte längre (ta bort filen)' for p in extra]
    return errors


def main():
    root = Path(__file__).resolve().parent.parent
    if '--check' in sys.argv[1:]:
        errors = check(root)
        for e in errors:
            print(f'dela_data: {e}', file=sys.stderr)
        sys.exit(1 if errors else 0)
    files = build(root)
    (root / OUT).mkdir(parents=True, exist_ok=True)
    for old in (root / OUT).glob('*.json'):
        if old.relative_to(root).as_posix() not in files:
            old.unlink()
    for path, text in files.items():
        (root / path).write_text(text, encoding='utf-8')
        print(f'{path}: {len(text.encode()):>8} byte')


if __name__ == '__main__':
    main()
