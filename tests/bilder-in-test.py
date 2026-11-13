#!/usr/bin/env python3
"""Visar att tools/bilder_in.py fyller i "image" i alla former en händelse kan stå i (#1288).

Testet gör en tillfällig kopia av det som skriptet läser (data/styles.json och en redigeringsfil
med fem händelser), kör fill_events och kontrollerar att bilden hamnar rätt, att inget annat
formateras om och att en händelse som inte går att fylla i lämnas orörd. Repot ändras inte.
Pillow behövs inte: skriptet importerar det bara för bildkonverteringen, så testet ersätter det
med en tom modul när det saknas.
"""
import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import types
from pathlib import Path

try:
    import PIL  # noqa: F401
except ImportError:
    pil = types.ModuleType('PIL')
    pil.Image = types.ModuleType('PIL.Image')
    pil.ImageFilter = types.ModuleType('PIL.ImageFilter')
    sys.modules.update({'PIL': pil, 'PIL.Image': pil.Image, 'PIL.ImageFilter': pil.ImageFilter})

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('bilder_in', ROOT / 'tools' / 'bilder_in.py')
bilder_in = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bilder_in)

CAPTION = {'sv': 'Prov med { klammer }, "citat" och radbrytning \\n.', 'en': 'Test'}


def entry(eid, credit='Prov'):
    return {'id': eid, 'style': 'kina-tusch', 'caption': dict(CAPTION), 'credit': credit}


def expected_image(eid, credit='Prov'):
    return bilder_in.image_field(entry(eid, credit), {'kina-tusch'})


OLD_IMAGE = '{"file": "images/events/ett-rad-med-bild.webp", "kind": "illustration", "style": "kina-tusch", "caption": {"sv": "Gammal", "en": "Old"}, "credit": "Gammal", "license": "CC BY 4.0"}'

# Fem former: flera rader, en rad, en rad med befintlig image, en rad utan sources, image mitt på en rad.
EVENTS = f'''{{
  "schema": "historia-globen/events@1",
  "events": [
    {{ "id": "flera-rader", "category": "kultur", "start": 1, "end": 1,
      "place": {{"sv": "A"}},
      "sources": ["a"],
      "review": "source-checked" }},
    {{ "id": "en-rad", "category": "kultur", "start": 2, "end": 2, "place": {{"sv": "B"}}, "sources": ["b"], "review": "source-checked" }},
    {{ "id": "en-rad-med-bild", "category": "kultur", "start": 3, "end": 3, "image": {OLD_IMAGE}, "sources": ["c"], "review": "source-checked" }},
    {{ "id": "utan-sources", "category": "kultur", "start": 4, "end": 4, "place": {{"sv": "D"}}, "review": "draft" }},
    {{ "id": "bild-mitt-pa-rad", "category": "kultur", "start": 5, "end": 5, "place": {{"sv": "E"}}, "image": {OLD_IMAGE}, "sources": ["e"],
      "review": "source-checked" }}
  ]
}}
'''
IDS = ['flera-rader', 'en-rad', 'en-rad-med-bild', 'utan-sources', 'bild-mitt-pa-rad']


def run(root, ids, log):
    bilder_in.ROOT = root
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        bilder_in.fill_events(ids, log)
    return out.getvalue()


def events_by_id(path):
    return {e['id']: e for e in json.loads(path.read_text(encoding='utf-8'))['events']}


def strip_image(raw):
    """Texten utan bilderna, för att visa att allt annat är byte för byte oförändrat."""
    for img in [OLD_IMAGE] + [json.dumps(expected_image(i, 'Ny'), ensure_ascii=False, separators=(', ', ': ')) for i in IDS]:
        raw = raw.replace('"image": ' + img + ', ', '').replace('      "image": ' + img + ',\n', '')
    return raw


def check(cond, msg):
    if not cond:
        raise SystemExit(msg)


def main():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / 'data' / 'handelser').mkdir(parents=True)
        (root / 'data' / 'styles.json').write_text(json.dumps({'styles': [{'id': 'kina-tusch'}]}), encoding='utf-8')
        path = root / 'data' / 'handelser' / 'prov.json'
        path.write_text(EVENTS, encoding='utf-8')
        log = [entry(i, credit='Ny') for i in IDS]

        out = run(root, IDS, log)
        raw = path.read_text(encoding='utf-8')
        found = events_by_id(path)  # json.loads: filen är fortfarande giltig JSON

        for eid in ('flera-rader', 'en-rad', 'en-rad-med-bild', 'bild-mitt-pa-rad'):
            check(found[eid].get('image') == expected_image(eid, 'Ny'), f'{eid}: fel eller ingen image i filen')
            check(f'{eid}: image ifylld' in out, f'{eid}: skriptet rapporterade inte att image fyllts i')
        check('image' not in found['utan-sources'], 'utan-sources: ska lämnas orörd')
        check('utan-sources: hittar inte var image ska stå' in out, 'utan-sources: förväntade felmeddelandet')

        # En rad: bilden står före sources på samma rad, och raden har inte brutits.
        line = next(l for l in raw.splitlines() if '"id": "en-rad"' in l)
        check(line.index('"image": ') < line.index('"sources": '), 'en-rad: image ska stå före sources på samma rad')
        # Flera rader: bilden är en egen rad med sex mellanslag före sources.
        check('\n      "image": {' in raw.split('"id": "flera-rader"')[1].split('"id": "en-rad"')[0], 'flera-rader: image ska vara en egen rad')

        # Allt utom bilderna är oförändrat (det gamla bildobjektet räknas bort ur utgångsläget).
        orig = EVENTS.replace('"image": ' + OLD_IMAGE + ', ', '')
        check(strip_image(raw) == orig, 'något annat än image har ändrats eller formaterats om')
        # Övriga fält i varje händelse är desamma som före körningen.
        before = json.loads(EVENTS)['events']
        for e in before:
            now = dict(found[e['id']])
            now.pop('image', None)
            e = dict(e)
            e.pop('image', None)
            check(now == e, f'{e["id"]}: ett annat fält än image har ändrats')

        # Idempotent: en andra körning med samma logg ger samma fil.
        run(root, IDS, log)
        check(path.read_text(encoding='utf-8') == raw, 'en andra körning ändrade filen')

        # Utan sources och utan image på egen rad är filen orörd för den händelsen.
        check(raw.count('"id": "utan-sources"') == 1 and '"review": "draft" }' in raw, 'utan-sources: raden är ändrad')

        # Två sources på samma rad kan inte avgöras: händelsen lämnas åt handen (inget gissas).
        path.write_text(EVENTS.replace('"sources": ["b"],', '"note": {"sources": ["x"]}, "sources": ["b"],'), encoding='utf-8')
        before_raw = path.read_text(encoding='utf-8')
        out = run(root, ['en-rad'], [entry('en-rad')])
        check('en-rad: hittar inte var image ska stå' in out, 'två sources på en rad: förväntade felmeddelandet')
        check(path.read_text(encoding='utf-8') == before_raw, 'två sources på en rad: filen ska vara orörd')

    print('bilder-in-test: ok')


if __name__ == '__main__':
    main()
