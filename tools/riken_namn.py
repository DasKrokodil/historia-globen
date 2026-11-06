#!/usr/bin/env python3
"""Rikenas namn på tyska, spanska och franska ur Wikidata (#676, #644).

Rikenas namn skrivs av tools/riken.py med svenska och engelska. Spärren mot oöversatt innehåll (#675) kräver
också övriga språk för nytt innehåll. Det här skriptet hämtar etiketterna (labels, CC0) för varje rikes
Wikidata-id och lägger in dem i data/empires/index.json och i rikesfilerna. tools/riken.py bevarar dem sedan när
filerna byggs om, så länge det svenska namnet är oförändrat.

  python3 tools/riken_namn.py <grupp> [<grupp> …]

Bara namn som saknas fylls i; befintliga ändras inte. Gruppens namn tas från den del som har samma svenska namn
som gruppen; finns ingen sådan del skrivs gruppen ut som saknad, och dess namn får översättas för hand.
Wikidata svarar 429 vid många anrop: skriptet hämtar högst 10 id åt gången, väntar 10 sekunder mellan anropen och
väntar längre och försöker igen vid 429.
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / 'data/empires/index.json'
LANGS = ('de', 'es', 'fr')
API = 'https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels&languages=de%7Ces%7Cfr&format=json&ids='
HEADERS = {'User-Agent': 'historia-globen-riken-namn/1.0 (hobbyprojekt)'}


def labels(ids):
    out = {}
    ids = sorted(set(ids))
    for i in range(0, len(ids), 10):
        chunk = ids[i:i + 10]
        for attempt in range(12):
            try:
                req = urllib.request.Request(API + '%7C'.join(chunk), headers=HEADERS)
                with urllib.request.urlopen(req, timeout=30) as r:
                    data = json.load(r)
                break
            except Exception as e:  # 429 eller nätfel: vänta och försök igen
                print(f'  Wikidata: {e}, väntar', file=sys.stderr)
                time.sleep(min(60 * (attempt + 1), 300))
        else:
            raise SystemExit('Wikidata svarar inte')
        for q, ent in data['entities'].items():
            out[q] = {lang: v['value'] for lang, v in ent.get('labels', {}).items() if lang in LANGS}
        time.sleep(10)
    return out


def main():
    gids = sys.argv[1:]
    if not gids:
        raise SystemExit(__doc__)
    index = json.loads(INDEX.read_text())
    groups = {g['id']: g for g in index['groups']}
    files = {gid: json.loads((ROOT / groups[gid]['file']).read_text()) for gid in gids}
    lab = labels(p['wikidata'] for f in files.values() for p in f['polities'] if p.get('wikidata'))
    for gid in gids:
        g, f = groups[gid], files[gid]
        for p in f['polities']:
            got = lab.get(p.get('wikidata'), {})
            missing = [lang for lang in LANGS if lang not in p['name']]
            for lang in missing:
                if lang in got:
                    p['name'][lang] = got[lang]
            for ip in g['polities']:
                if ip['id'] == p['id']:
                    ip['name'] = dict(p['name'])
            still = [lang for lang in LANGS if lang not in p['name']]
            if still:
                print(f'{gid}/{p["id"]}: saknar {", ".join(still)} i Wikidata ({p.get("wikidata")})')
        same = [p for p in f['polities'] if p['name']['sv'] == g['name']['sv']]
        if same:
            g['name'] = {**same[0]['name'], **{k: v for k, v in g['name'].items() if k in ('sv', 'en')}}
        else:
            print(f'{gid}: ingen del heter som gruppen ({g["name"]["sv"]}); översätt gruppens namn för hand')
        (ROOT / g['file']).write_text(json.dumps(f, ensure_ascii=False, separators=(',', ':')))
        print(f'{gid}: {g["name"]}')
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
