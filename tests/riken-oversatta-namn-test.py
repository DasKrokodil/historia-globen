#!/usr/bin/env python3
"""Rikenas namn på engelska, tyska, spanska och franska (#2002). Provet slår larm när

1. ett namn uppenbart gäller något annat än riket (utrikesrelationer, historia, flagga, lista; samma mönster som
   tools/riken_namn.py använder när etiketterna hämtas ur Wikidata),
2. två delar i samma grupp med olika svenska namn har samma namn på ett annat språk (Romerska kejsardömet och
   Östromerska riket hette båda "Imperio bizantino"),
3. delens namn i index.json och i rikesfilen skiljer sig åt,
4. en del har ett Wikidata-id som är känt fel (Cliopatrias id för Roman Empire och Byzantine Empire, och för
   Hanriket, Sasanidriket, Seleukidriket, Staten Qin, Frankrike (kungadömet), Qajar och Pahlavi, #2005),
5. en del har ett Wikidata-id som är en förgreningssida (Wikimedia disambiguation page, #2005), ur registret
   KANDA_FORGRENINGSSIDOR i tools/riken_namn.py; provet kräver inget nätverk.

Körs i CI utan shapely: python3 -I tests/riken-oversatta-namn-test.py
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from riken_namn import KANDA_FORGRENINGSSIDOR, ar_forgreningssida, inte_rikesnamn  # noqa: E402

LANGS = ('en', 'de', 'es', 'fr')
# (delens id, Wikidata-id som är fel): Q12544 är Bysantinska riket, Q112039853 Bysans utrikesrelationer (#2002)
KANDA_FEL_ID = {('romerska-kejsardomet', 'Q12544'), ('bysantinska-riket', 'Q112039853'),
                # #2005: Cliopatrias id, kontrollerade mot Wikidata 2026-11-20 (klanen Chauhan, indo-sasaniderna,
                # seleukiddynastin, Tidigare Qin, Bourbonska restaurationen, dynastierna Qajar och Pahlavi, Första
                # kejsardömet Haiti 1804–1806 för Saint-Domingue och Haiti 1805–1915, merovingerna för karolingerna)
                ('hanriket', 'Q1068371'), ('sasanidriket', 'Q1661685'), ('seleukidriket', 'Q705904'),
                ('qin-staten', 'Q1471995'), ('frankrike-kungadomet', 'Q207162'), ('qajarernas-iran', 'Q189326'),
                ('pahlavis-iran', 'Q207991'), ('saint-domingue', 'Q2006756'), ('haiti-1805', 'Q2006756'),
                ('karolingiska-riket', 'Q146246'), ('norra-song', 'Q7462'), ('sodra-song', 'Q7462'),
                ('ghaznaviderna', 'Q12844800'),
                # #2156: Cliopatrias id för Roman Republic är Romerska republiken 1798–1799 (Wikidata 2026-11-22); rätt är Q17167
                ('romerska-republiken', 'Q175881')}
# Delar vars id är kontrollerat mot Wikidata och ska stå kvar (#2156): antikens romerska republik (P571 509 f.Kr., P576
# 27 f.Kr.) och stormaktsväldet, som har P31 historiskt land (Q3024240) och imperium (Q48349) vid sidan av tidsperioden
KANDA_RATT_ID = {'romerska-republiken': 'Q17167', 'svenska-stormaktsvaldet': 'Q215443'}

fel = []
# Enhetsprov
if not inte_rikesnamn('relaciones exteriores del Imperio bizantino') or not inte_rikesnamn('Flagge Schwedens'):
    fel.append('provet känner inte igen en etikett som inte är ett rikesnamn')
if inte_rikesnamn('Imperio bizantino') or inte_rikesnamn("Empire romain d'Orient") or inte_rikesnamn('Dynastie Liao'):
    fel.append('provet stoppar ett rikesnamn')
# Förgreningssidor (#2005): beskrivningen eller P31, även när etiketten ser rimlig ut
if not ar_forgreningssida('Wikimedia disambiguation page') or not ar_forgreningssida(None, ['Q4167410']):
    fel.append('provet känner inte igen en förgreningssida')
if ar_forgreningssida('monarchy in Europe (1282–1918)', ['Q3024240']) or ar_forgreningssida(None, []):
    fel.append('provet tar ett rike för en förgreningssida')

index = json.loads((ROOT / 'data/empires/index.json').read_text(encoding='utf-8'))
antal = 0
for g in index['groups']:
    namn = [('gruppen', g['name'])] + [(p['id'], p.get('name') or {}) for p in g.get('polities', [])]
    for pid, n in namn:
        for lang in LANGS:
            antal += 1
            if inte_rikesnamn(n.get(lang)):
                fel.append(f"index.json, {g['id']}/{pid}: {lang} \"{n[lang]}\" är inte ett rikesnamn")
    for lang in ('de', 'es', 'fr'):
        sv_per_namn = defaultdict(set)
        for p in g.get('polities', []):
            n = p.get('name') or {}
            if n.get(lang):
                sv_per_namn[n[lang]].add(n.get('sv'))
        for v, svs in sv_per_namn.items():
            if len(svs) > 1:
                fel.append(f"index.json, {g['id']}: {lang} \"{v}\" är namnet på flera delar ({', '.join(sorted(svs))})")
    f = ROOT / (g.get('file') or '')
    if not g.get('file') or not f.is_file():
        continue
    doc = {p['id']: p for p in json.loads(f.read_text(encoding='utf-8')).get('polities', [])}
    for p in g.get('polities', []):
        q = doc.get(p['id'])
        if q is None:
            continue
        if q.get('name') != p.get('name'):
            fel.append(f"{g['file']}, {p['id']}: namnet skiljer sig från index.json ({q.get('name')} mot {p.get('name')})")
        if (p['id'], q.get('wikidata')) in KANDA_FEL_ID:
            fel.append(f"{g['file']}, {p['id']}: Wikidata-id {q['wikidata']} är känt fel (#2002, #2005)")
        if p['id'] in KANDA_RATT_ID and q.get('wikidata') != KANDA_RATT_ID[p['id']]:
            fel.append(f"{g['file']}, {p['id']}: Wikidata-id {q.get('wikidata')} ska vara {KANDA_RATT_ID[p['id']]} (#2156)")
        if q.get('wikidata') in KANDA_FORGRENINGSSIDOR:
            fel.append(f"{g['file']}, {p['id']}: Wikidata-id {q['wikidata']} är en förgreningssida (#2005)")

if fel:
    print('\n'.join(sorted(set(fel))))
    sys.exit(1)
print(f"riken-oversatta-namn: {antal} namn i {len(index['groups'])} grupper kontrollerade")
