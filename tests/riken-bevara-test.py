#!/usr/bin/env python3
"""tools/riken_bevara.py (#1220): det tools/riken.py ska bevara när data/empires/ byggs om.

Provet tar den riktiga data/empires/index.json och gör varje grupp till det som verktyget själv skriver (utan de
handskrivna fälten, namnen bara på svenska och engelska och fälten i verktygets ordning). Sedan ska hjälpfunktionerna
ge exakt den befintliga gruppen tillbaka, så att en ombyggnad utan andra ändringar ger en tom diff. Körs i CI utan
shapely: python3 -I tests/riken-bevara-test.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from riken_bevara import KEEP, keep_langs, kept_fields, old_influence_names, order_like  # noqa: E402

fel = []


def check(ok, msg):
    if not ok:
        fel.append(msg)


# Enhetsprov
check('flags' in KEEP, 'flags saknas i KEEP: flaggorna försvinner vid ombyggnad')
check(keep_langs({'sv': 'Rom', 'en': 'Rome'}, {'sv': 'Rom', 'en': 'Rome', 'de': 'Rom'}) == {'sv': 'Rom', 'en': 'Rome', 'de': 'Rom'},
      'keep_langs för inte över tyskan')
check(keep_langs({'sv': 'Nytt', 'en': 'New'}, {'sv': 'Gammalt', 'en': 'Old', 'de': 'Alt'}) == {'sv': 'Nytt', 'en': 'New'},
      'keep_langs behåller en inaktuell översättning när svenskan har ändrats')
check(list(order_like({'b': 1, 'a': 2, 'c': 3}, {'a': 0, 'b': 0})) == ['a', 'b', 'c'], 'order_like följer inte den gamla ordningen')

# Hela index.json: bygg om varje grupp som verktyget gör och kräv samma grupp tillbaka. Fälten som skrivs för hand
# räknas upp här, oberoende av KEEP, så att provet märker om ett av dem saknas i KEEP.
HAND = ('facts', 'symbol', 'polityFacts', 'capitals', 'labelAt', 'flags')
index = json.loads((ROOT / 'data/empires/index.json').read_text(encoding='utf-8'))
docs = []
for g in index['groups']:
    f = ROOT / (g.get('file') or '')
    if g.get('file') and f.is_file():
        docs.append(json.loads(f.read_text(encoding='utf-8')))
infl_names = old_influence_names(index['groups'], docs)
sv_en = lambda n: {k: n[k] for k in ('sv', 'en') if k in n}
for old in index['groups']:
    new = {k: v for k, v in old.items() if k not in HAND}
    new['name'] = sv_en(old['name'])
    if 'homeland' in new:
        new['homeland'] = {'name': sv_en(old['homeland']['name'])}
    if 'influence' in new:
        new['influence'] = [{**a, 'name': sv_en(a['name'])} for a in old['influence']]
    new = dict(reversed(list(new.items())))  # en annan ordning än i filen
    # det verktyget gör (tools/riken.py, main)
    new['name'] = keep_langs(new['name'], old['name'])
    if 'homeland' in new:
        new['homeland'] = {'name': keep_langs(new['homeland']['name'], old['homeland']['name'])}
    for a in new.get('influence', []):
        a['name'] = keep_langs(a['name'], infl_names.get(a['name'].get('en')))
    new.update(kept_fields(old))
    new = order_like(new, old)
    check(json.dumps(new, ensure_ascii=False) == json.dumps(old, ensure_ascii=False), f"{old['id']}: gruppen blir inte densamma efter ombyggnad")
# Rikesfilernas inflytandenamn får tillbaka sina språk
for doc in docs:
    for p in doc.get('polities', []):
        for q in p.get('influence', []):
            back = keep_langs(sv_en(q['name']), infl_names.get(q['name'].get('en')))
            check(back == q['name'], f"{doc.get('group')}/{p['id']}: inflytandenamnet {q['name'].get('en')} tappar språk")

n_flags = sum(1 for g in index['groups'] if 'flags' in g)
if fel:
    print(f'{len(fel)} fel:')
    for f in fel[:20]:
        print(' -', f)
    sys.exit(1)
print(f'ok: {len(index["groups"])} grupper ({n_flags} med flaggor) blir desamma efter ombyggnad, och inflytandenamnen behåller sina språk')
