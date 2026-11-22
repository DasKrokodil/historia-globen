#!/usr/bin/env python3
"""Rikenas namn på tyska, spanska och franska ur Wikidata (#676, #644).

Rikenas namn skrivs av tools/riken.py med svenska och engelska. Spärren mot oöversatt innehåll (#675) kräver
också övriga språk för nytt innehåll. Det här skriptet hämtar etiketterna (labels, CC0) för varje rikes
Wikidata-id och lägger in dem i data/empires/index.json och i rikesfilerna. tools/riken.py bevarar dem sedan när
filerna byggs om, så länge det svenska namnet är oförändrat.

  python3 tools/riken_namn.py <grupp> [<grupp> …]
  python3 tools/riken_namn.py --rapport [<grupp> …]   (skriver inget; utan grupper: alla grupper)

Bara namn som saknas fylls i; befintliga ändras inte. Gruppens namn tas från den del som har samma svenska namn
som gruppen; finns ingen sådan del skrivs gruppen ut som saknad, och dess namn får översättas för hand.
Namnen hämtas med Wikidatas frågetjänst (SPARQL, högst 100 id per fråga), eftersom wbgetentities ofta svarar
429 vid många anrop. En etikett som inte stämmer med det svenska namnet (till exempel ett annat namn på samma
land) rättas för hand i datan efteråt; skriptet ändrar inte namn som redan finns.

Ett id som pekar på en förgreningssida (Wikidatas beskrivning "Wikimedia disambiguation page" eller P31 Q4167410)
ger en varning, och dess etiketter fylls inte i, även när etiketten ser ut som rikets namn (#2005: Cliopatrias id för
Habsburg Monarchy, Zululand och New Granada var förgreningssidor). Rätta id:t med 'wikidata' i GROUPS i tools/riken.py.
Med --rapport skrivs bara ut vad som skulle fyllas i och vilka id som är förgreningssidor; inga filer ändras.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / 'data/empires/index.json'
LANGS = ('de', 'es', 'fr')
SPARQL = 'https://query.wikidata.org/sparql'
HEADERS = {'User-Agent': 'historia-globen-riken-namn/1.0 (hobbyprojekt)'}

# Etiketter som aldrig är ett rikes namn: de visar att Wikidata-id:t gäller något annat än riket, till exempel
# rikets utrikesrelationer, historia eller flagga (#2002: Cliopatrias id för Byzantine Empire var Q112039853,
# "relaciones exteriores del Imperio bizantino"). Sådana etiketter fylls inte i; rätta id:t med 'wikidata' i GROUPS
# i tools/riken.py. tests/riken-oversatta-namn-test.py använder samma mönster mot datan.
INTE_RIKESNAMN = re.compile(
    r'\b(foreign relations|relaciones exteriores|relations extérieures|relations étrangères|außenbeziehungen|außenpolitik'
    r'|history of|historia de|histoire de|geschichte|flag of|bandera de|drapeau de|flagge|coat of arms|escudo de'
    r'|armoiries|wappen|list of|lista de|liste de|liste der)\b', re.IGNORECASE)


def inte_rikesnamn(label):
    """Sant om etiketten uppenbart gäller något annat än riket (utrikesrelationer, historia, flagga, lista …)."""
    return bool(label and INTE_RIKESNAMN.search(label))


# Wikidatas klass för förgreningssidor (P31) och dess engelska beskrivning (#2005)
FORGRENINGSSIDA_KLASS = 'Q4167410'
FORGRENINGSSIDA = re.compile(r'^\s*Wikimedia disambiguation page\s*$', re.IGNORECASE)
# Id som har kontrollerats vara förgreningssidor (Special:EntityData 2026-11-20, #2005). Cliopatria anger dem;
# tests/riken-oversatta-namn-test.py stoppar dem i datan utan nätverk.
KANDA_FORGRENINGSSIDOR = {
    'Q66504140': 'Habsburg Monarchy',
    'Q13558877': 'Zululand',
    'Q1863715': 'New Granada',
}


def ar_forgreningssida(description=None, instance_of=()):
    """Sant om Wikidata-posten är en förgreningssida: beskrivningen är "Wikimedia disambiguation page" eller
    P31 är Q4167410, även när etiketten ser ut som ett rikes namn."""
    return bool((description and FORGRENINGSSIDA.match(description)) or FORGRENINGSSIDA_KLASS in (instance_of or ()))


def labels(ids):
    """Etiketterna på tyska, spanska och franska för alla id, med en fråga till Wikidatas frågetjänst (SPARQL).
    Den har andra gränser än wbgetentities, som ofta svarar 429 vid många anrop."""
    ids = sorted(set(ids))
    out = {q: {} for q in ids}
    for i in range(0, len(ids), 100):
        chunk = ids[i:i + 100]
        # Etiketterna på de/es/fr, och den engelska beskrivningen och P31 för att känna igen förgreningssidor (#2005)
        query = ('SELECT ?q ?l ?d ?c WHERE { VALUES ?q { ' + ' '.join('wd:' + q for q in chunk) + ' } '
                 '{ ?q rdfs:label ?l . FILTER(LANG(?l) IN ("de","es","fr")) } UNION '
                 '{ ?q schema:description ?d . FILTER(LANG(?d) = "en") } UNION '
                 '{ ?q wdt:P31 ?c . FILTER(?c = wd:' + FORGRENINGSSIDA_KLASS + ') } }')
        url = SPARQL + '?' + urllib.parse.urlencode({'query': query})
        for attempt in range(6):
            try:
                req = urllib.request.Request(url, headers={**HEADERS, 'Accept': 'application/sparql-results+json'})
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = json.load(r)
                break
            except Exception as e:  # 429 eller nätfel: vänta och försök igen
                print(f'  Wikidata: {e}, väntar', file=sys.stderr)
                time.sleep(30 * (attempt + 1))
        else:
            raise SystemExit('Wikidata svarar inte')
        for b in data['results']['bindings']:
            q = b['q']['value'].rsplit('/', 1)[1]
            if 'l' in b:
                out.setdefault(q, {})[b['l']['xml:lang']] = b['l']['value']
            if 'd' in b:
                out.setdefault(q, {})['_desc'] = b['d']['value']
            if 'c' in b:
                out.setdefault(q, {})['_p31'] = [FORGRENINGSSIDA_KLASS]
    return out


def forgreningssida(q, got):
    """Sant om id:t q är en förgreningssida, enligt registret eller Wikidatas svar."""
    return q in KANDA_FORGRENINGSSIDOR or ar_forgreningssida(got.get('_desc'), got.get('_p31', ()))


def main():
    args = sys.argv[1:]
    rapport = '--rapport' in args
    gids = [a for a in args if a != '--rapport']
    if not gids and not rapport:
        raise SystemExit(__doc__)
    index = json.loads(INDEX.read_text())
    groups = {g['id']: g for g in index['groups']}
    if not gids:
        gids = [g['id'] for g in index['groups'] if g.get('file')]
    files = {gid: json.loads((ROOT / groups[gid]['file']).read_text()) for gid in gids}
    lab = labels(p['wikidata'] for f in files.values() for p in f['polities'] if p.get('wikidata'))
    for gid in gids:
        g, f = groups[gid], files[gid]
        for p in f['polities']:
            got = lab.get(p.get('wikidata'), {})
            if p.get('wikidata') and forgreningssida(p['wikidata'], got):
                print(f'{gid}/{p["id"]}: Wikidata-id {p["wikidata"]} är en förgreningssida (Wikimedia disambiguation page); '
                      f'inga namn fylls i, rätta id:t med \'wikidata\' i GROUPS i tools/riken.py')
                continue
            missing = [lang for lang in LANGS if lang not in p['name']]
            for lang in missing:
                if rapport and lang in got and not inte_rikesnamn(got.get(lang)):
                    print(f'{gid}/{p["id"]}: skulle få {lang} "{got[lang]}" ({p.get("wikidata")})')
                if inte_rikesnamn(got.get(lang)):
                    print(f'{gid}/{p["id"]}: {lang}-etiketten "{got[lang]}" är inte ett rikesnamn; '
                          f'kontrollera Wikidata-id:t ({p.get("wikidata")}) och översätt för hand')
                elif lang in got:
                    p['name'][lang] = got[lang]
            for ip in g['polities']:
                if ip['id'] == p['id']:
                    ip['name'] = dict(p['name'])
            still = [lang for lang in LANGS if lang not in p['name']]
            if still:
                print(f'{gid}/{p["id"]}: saknar {", ".join(still)} i Wikidata ({p.get("wikidata")})')
        if rapport:
            continue
        same = [p for p in f['polities'] if p['name']['sv'] == g['name']['sv']]
        if same:
            g['name'] = {**same[0]['name'], **{k: v for k, v in g['name'].items() if k in ('sv', 'en')}}
        else:
            print(f'{gid}: ingen del heter som gruppen ({g["name"]["sv"]}); översätt gruppens namn för hand')
        (ROOT / g['file']).write_text(json.dumps(f, ensure_ascii=False, separators=(',', ':')))
        print(f'{gid}: {g["name"]}')
    if not rapport:
        INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
