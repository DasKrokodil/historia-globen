#!/usr/bin/env python3
"""Visar att texterna per språk fungerar (#675): tools/dela_data.py delar upp språken i egna filer utan att
något försvinner, och tools/oversattning.py stoppar ny text utan översättning och inaktuella översättningar.

Varje fall kopierar data/ till en tillfällig mapp och ändrar där. Repot ändras inte.
"""
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'tools' / f'{name}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


dela_data = load('dela_data')
oversattning = load('oversattning')


def merge(target, src):
    """Samma regel som mergeTexts i js/model.js."""
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(target.get(k), dict):
            merge(target[k], v)
        elif isinstance(v, dict) and isinstance(target.get(k), list):
            for i, part in v.items():
                if isinstance(part, dict) and isinstance(target[k][int(i)], dict):
                    merge(target[k][int(i)], part)
                else:
                    target[k][int(i)] = part
        else:
            target[k] = v
    return target


def test_split():
    langs = ['sv', 'en', 'de']
    post = {'title': {'sv': 'Titel', 'en': 'Title'}, 'start': 1, 'items': [
        {'label': {'sv': 'A'}}, {'label': {'sv': 'B', 'de': 'B-de'}, 'text': {'sv': 'b', 'en': 'b-en'}}],
        'name': {'sv': 'Namn', 'en': 'Name'}, 'sources': ['x']}
    base, extra = dela_data.split_texts(post, langs)
    assert base['title'] == {'sv': 'Titel'} and base['items'][1]['label'] == {'sv': 'B'}, base
    assert extra['en'] == {'title': {'en': 'Title'}, 'items': {'1': {'text': {'en': 'b-en'}}}, 'name': {'en': 'Name'}}, extra
    assert set(extra) == {'en', 'de'}
    whole = merge(merge(json.loads(json.dumps(base)), extra['en']), extra['de'])
    assert whole == post, whole
    kept, extra = dela_data.split_texts(post, langs, keep=('name',))
    assert kept['name'] == post['name'] and 'name' not in extra['en']
    # Ett objekt med språk men utan svenska delas inte
    assert dela_data.split_texts({'en': 'only'}, langs) == ({'en': 'only'}, {})


def test_built_files():
    """De byggda filerna i repot: grundfilerna har bara svenska, och språkfilerna står i translations."""
    gen = ROOT / 'data' / 'genererat'
    index = json.loads((gen / 'handelser.json').read_text(encoding='utf-8'))
    for lang, stems in index['translations'].items():
        for stem in stems:
            assert (gen / f'{stem}.{lang}.json').is_file(), f'{stem}.{lang}.json saknas'
    langs = set(dela_data.read_langs(ROOT))
    for f in ['handelser.json', 'riken-fakta.json'] + [f'handelser-{p}.json' for p, _ in dela_data.PERIODS]:
        doc = json.loads((gen / f).read_text(encoding='utf-8'))
        for path, text in oversattning.texts(doc, langs):
            assert set(text) == {'sv'}, f'{f} {path} har fler språk än svenska'


def with_copy(change):
    """(fel, påminnelser) för en kopia av data/ efter change(root)."""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        shutil.copytree(ROOT / 'data', root / 'data')
        errors, reminders, _ = oversattning.compare(root)
        if errors or reminders:
            raise SystemExit('kopian av data/ underkänns redan (kör python3 tools/oversattning.py):\n'
                             + '\n'.join(errors + reminders))
        change(root)
        return oversattning.compare(root)[:2]


def edit(rel, fn):
    def change(root):
        path = root / rel
        doc = json.loads(path.read_text(encoding='utf-8'))
        fn(doc)
        path.write_text(json.dumps(doc, ensure_ascii=False), encoding='utf-8')
    return change


def new_event(review):
    def add(doc):
        e = json.loads(json.dumps(doc['events'][0]))
        e['id'] = 'test-oversattning'
        e['review'] = review
        e['title'] = {'sv': 'En ny händelse'}
        doc['events'].append(e)
    return add


def first_translated(doc):
    """Den första texten i en vägfil som har engelska."""
    for path, text in oversattning.texts(doc, {'sv', 'en', 'de', 'es', 'fr'}):
        if text.get('en'):
            return text
    raise SystemExit('ingen engelsk text i vägfilen (testet behöver en)')


def main():
    test_split()
    test_built_files()

    errors, _ = with_copy(edit('data/handelser/1980-.json', new_event('source-checked')))
    assert any('utan en' in e for e in errors), errors

    errors, _ = with_copy(edit('data/handelser/1980-.json', new_event('draft')))
    assert not errors, f'ett utkast ska inte behöva översättas: {errors}'

    def change_swedish(doc):
        first_translated(doc)['sv'] += ' (ändrad)'
    errors, _ = with_copy(edit('data/routes/cook.json', change_swedish))
    assert any('inaktuell' in e for e in errors), errors

    def change_both(doc):
        text = first_translated(doc)
        text['sv'] += ' (ändrad)'
        text['en'] += ' (changed)'
    errors, reminders = with_copy(edit('data/routes/cook.json', change_both))
    assert not errors and any('inte är registrerad' in r for r in reminders), (errors, reminders)

    # Översätt en text som fortfarande saknar ett språk (vilket språk beror på hur långt översättningen har kommit)
    chosen = {}

    def translate(doc):
        for e in doc['events']:
            if e.get('review') == 'draft':
                continue
            missing_langs = [lang for lang in ('en', 'de', 'es', 'fr') if not e['title'].get(lang)]
            if missing_langs:
                chosen['lang'] = missing_langs[0]
                e['title'][missing_langs[0]] = 'A translated title'
                return
    errors, reminders = with_copy(edit('data/handelser/1980-.json', translate))
    if chosen:
        assert not errors and any(f'färre oöversatta på {chosen["lang"]}' in r for r in reminders), (errors, reminders)

    # Samma översättning till två olika svenska texter är tillåtet så länge båda svenska texterna finns kvar
    # (till exempel "Kartago" och "Karthago", som båda blir "Carthage"); en översättning vars svenska text har
    # ändrats är inaktuell, även när en annan post har samma översättning (Codex-fynd i #724)
    def both(sv1, sv2):
        def add(doc):
            r = doc['routes'][0]
            r['t1'] = {'sv': sv1, 'en': 'Paris', 'de': 'Paris', 'es': 'Paris', 'fr': 'Paris'}
            r['t2'] = {'sv': sv2, 'en': 'Paris', 'de': 'Paris', 'es': 'Paris', 'fr': 'Paris'}
        return add

    def two_phase(first, second):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copytree(ROOT / 'data', root / 'data')
            first(root)
            errors, reminders, status = oversattning.compare(root, accept_stale=True)
            (root / 'data' / 'oversattning.json').write_text(oversattning.dump(status), encoding='utf-8')
            second(root)
            return oversattning.compare(root)[:2]

    def change_second(doc):
        doc['routes'][0]['t2']['sv'] = 'Berlin'
    errors, _ = two_phase(edit('data/routes/cook.json', both('Paris', 'Paris')),
                          edit('data/routes/cook.json', change_second))
    assert any('inaktuell' in e for e in errors), errors

    def add_third(doc):
        doc['routes'][0]['t3'] = {'sv': 'Berlin', 'en': 'Paris', 'de': 'Paris', 'es': 'Paris', 'fr': 'Paris'}
    errors, _ = two_phase(edit('data/routes/cook.json', both('Paris', 'Paris')),
                          edit('data/routes/cook.json', add_third))
    assert not any('inaktuell' in e for e in errors), errors

    print('oversattning-test: ok (uppdelning per språk, ny text utan översättning, utkast, inaktuell och '
          'uppdaterad översättning, ny översättning)')


if __name__ == '__main__':
    main()
