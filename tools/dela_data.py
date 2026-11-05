#!/usr/bin/env python3
"""Bygger händelsefilerna ur redigeringsfilerna och delar upp stora datafiler i mindre filer (#337, #394).

Det man redigerar (redigeringsformatet, #394):
  data/handelser/<period>.json  händelserna, en fil per period (PERIODS nedan, efter händelsens startår)
  data/empires/index.json       rikena

Skriptet skriver data/events.json (alla händelser i en fil, för verktyg, tester och formulärets
serverfunktion) och de uppdelade filerna i data/genererat/ (det sidan laddar). Allt checkas in. Inget
byggsteg (CLAUDE.md punkt 1): skriptet körs för hand efter varje ändring i redigeringsfilerna, och
scripts/validate-site.py kontrollerar att de byggda filerna stämmer med dem, så att ingen glömmer att köra det.

  python3 tools/dela_data.py          skriver om data/events.json och filerna i data/genererat/
  python3 tools/dela_data.py --check  skriver ingenting, avslutas med kod 1 om något inte stämmer

Redigeringsfilerna kontrolleras först: alla sex periodfiler finns, varje händelse ligger i filen för sitt
startår och inget id finns två gånger. Är något fel skrivs ingenting.

De byggda filerna (docs/datamodell.md, "Redigeringsfiler" och "Uppdelade filer"):
  events.json               alla händelser, periodfilerna i periodernas ordning och händelserna i filens
                            ordning. En händelse per rad. Redigeras inte.
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
DETAIL = ['summary', 'note', 'story', 'image', 'sources', 'wikidata', 'evidence']

# Perioderna efter händelsens start (astronomiskt år). from = första året i perioden, None = från början.
# Gränserna är valda så att filerna blir ungefär lika stora (40–120 kB). Samma perioder används för
# redigeringsfilerna i data/handelser/ och för de uppdelade filerna i data/genererat/. Ändras de, ändras
# filnamnen, och händelserna måste flyttas till rätt redigeringsfil.
PERIODS = [
    ('fkr', None),          # före vår tideräkning (år 0 och tidigare)
    ('1-1499', 1),
    ('1500-1799', 1500),
    ('1800-1899', 1800),
    ('1900-1945', 1900),
    ('1946-', 1946),
]

SRC = 'data/handelser'  # redigeringsfilerna för händelser (#394)
EVENTS = 'data/events.json'
OUT = 'data/genererat'
NOTE = 'Genereras av tools/dela_data.py ur {src}. Redigera inte här, utan i källfilen, och kör skriptet igen.'
SCHEMA = 'historia-globen/events@1'
# Beskrivningen av fälten överst i data/events.json (fanns där innan filen började byggas, #394)
EVENTS_NOTES = ('start/end = astronomiska år (ISO 8601): 0 = 1 f.Kr., -1 = 2 f.Kr. precision = Wikidatas skala '
                '(7 = århundrade, 8 = decennium, 9 = år, 11 = dag). location = GeoJSON [lon, lat]. review: draft | '
                'source-checked | two-sources. kind = "war" för krig (spann); partOf = krigets id för slag och '
                'händelser i ett krig. top = true för krigets enda viktigaste händelse, som syns även utzoomat; '
                'major = true för viktiga händelser där fokusläget pausar; i fokusläge syns krigets alla händelser. '
                'icon = namn på en ikon i img/icons/ (valfritt). empires = grupp-id i data/empires/index.json för '
                'riken som var krigförande part i ett krig (valfritt, #76); slagen ärver dem via partOf.')


def period_of(start):
    """Perioden en händelse hör till: den sista perioden vars from är högst start (samma regel som js/model.js)."""
    pid = PERIODS[0][0]
    for p, frm in PERIODS:
        if frm is None or start >= frm:
            pid = p
    return pid


def src_file(pid):
    return f'{SRC}/{pid}.json'


def dump_lines(head, key, items):
    """JSON med en post per rad, så att ändringar syns rad för rad i git. head = övriga fält först."""
    c = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    lines = [f'{c(k)}:{c(v)},' for k, v in head.items()]
    if isinstance(items, dict):
        body = ',\n'.join(f'{c(k)}:{c(v)}' for k, v in items.items())
        return '{' + '\n'.join(lines) + f'\n{c(key)}:{{\n{body}\n}}}}\n'
    body = ',\n'.join(c(v) for v in items)
    return '{' + '\n'.join(lines) + f'\n{c(key)}:[\n{body}\n]}}\n'


def read_events(root):
    """(händelser, fel) ur redigeringsfilerna i data/handelser/. Fel är text; då ska ingenting skrivas."""
    root = Path(root)
    events, errors, seen = [], [], {}
    known = {src_file(p) for p, _ in PERIODS}
    if (root / SRC).is_dir():
        for f in sorted((root / SRC).iterdir()):
            path = f.relative_to(root).as_posix()
            if path not in known:
                errors.append(f'{path} är ingen periodfil (filerna heter {", ".join(sorted(known))})')
    for pid, _ in PERIODS:
        path = src_file(pid)
        try:
            doc = json.loads((root / path).read_text(encoding='utf-8'))
        except FileNotFoundError:
            errors.append(f'{path} saknas')
            continue
        except ValueError as e:
            errors.append(f'{path} är inte giltig JSON ({e})')
            continue
        if not isinstance(doc, dict) or not isinstance(doc.get('events'), list):
            errors.append(f'{path} saknar listan events')
            continue
        if doc.get('period') != pid:
            errors.append(f'{path}: fältet period ska vara "{pid}"')
        for i, e in enumerate(doc['events']):
            if not isinstance(e, dict) or not isinstance(e.get('id'), str):
                errors.append(f'{path}: händelse nummer {i + 1} saknar id')
                continue
            if e['id'] in seen:
                errors.append(f'{path}: id:t {e["id"]} finns redan i {seen[e["id"]]}')
                continue
            seen[e['id']] = path
            start = e.get('start')
            if not isinstance(start, int) or isinstance(start, bool):
                errors.append(f'{path} ({e["id"]}): start är inte ett heltal')
                continue
            if period_of(start) != pid:
                errors.append(f'{path} ({e["id"]}): börjar år {start} och ska ligga i {src_file(period_of(start))}')
                continue
            events.append(e)
    return events, errors


def build_from(events, empires):
    """data/events.json och de uppdelade filerna som {relativ sökväg: innehåll}."""
    out = {EVENTS: dump_lines({'schema': SCHEMA, 'note': NOTE.format(src=f'{SRC}/<period>.json'),
                               'notes': EVENTS_NOTES}, 'events', events)}

    index, details = [], {p: {} for p, _ in PERIODS}
    for e in events:
        light = {k: v for k, v in e.items() if k not in DETAIL}
        if isinstance(e.get('note'), dict) and 'title' in e['note']:
            light['note'] = {'title': e['note']['title']}
        index.append(light)
        details[period_of(e['start'])][e['id']] = {k: e[k] for k in DETAIL if k in e}
    periods = [{'id': p, 'from': frm, 'file': f'{OUT}/handelser-{p}.json'} for p, frm in PERIODS]
    out[f'{OUT}/handelser.json'] = dump_lines(
        {'note': NOTE.format(src=EVENTS), 'detail': DETAIL, 'periods': periods}, 'events', index)
    for p, _ in PERIODS:
        out[f'{OUT}/handelser-{p}.json'] = dump_lines(
            {'note': NOTE.format(src=EVENTS), 'period': p}, 'events', details[p])

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


def build(root):
    """(alla byggda filer som {relativ sökväg: innehåll}, fel i redigeringsfilerna) ur filerna under root."""
    root = Path(root)
    events, errors = read_events(root)
    empires = json.loads((root / 'data/empires/index.json').read_text(encoding='utf-8'))
    return build_from(events, empires), errors


def check(root, gen_root=None):
    """Fel som text: fel i redigeringsfilerna, och byggda filer som saknas, inte stämmer eller inte längre byggs.

    root = där redigeringsfilerna ligger, gen_root = där de byggda filerna ligger (till exempel dist/).
    """
    root = Path(root)
    gen_root = Path(gen_root or root)
    want, errors = build(root)
    if errors:
        return errors
    for path, text in want.items():
        f = gen_root / path
        if not f.is_file():
            errors.append(f'{path} saknas (kör python3 tools/dela_data.py)')
        elif f.read_text(encoding='utf-8') != text:
            hint = (' – den byggs ur data/handelser/; ändra där' if path == EVENTS else '')
            errors.append(f'{path} stämmer inte med redigeringsfilerna (kör python3 tools/dela_data.py){hint}')
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
    files, errors = build(root)
    if errors:
        for e in errors:
            print(f'dela_data: {e}', file=sys.stderr)
        print('dela_data: ingenting skrevs; rätta redigeringsfilerna i data/handelser/ först', file=sys.stderr)
        sys.exit(1)
    (root / OUT).mkdir(parents=True, exist_ok=True)
    for old in (root / OUT).glob('*.json'):
        if old.relative_to(root).as_posix() not in files:
            old.unlink()
    for path, text in files.items():
        (root / path).write_text(text, encoding='utf-8')
        print(f'{path}: {len(text.encode()):>8} byte')


if __name__ == '__main__':
    main()
