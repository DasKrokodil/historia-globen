#!/usr/bin/env python3
"""Bygger rikesfilerna i data/empires/ ur Cliopatria (R1–R6).

Varje rike (grupp) får en egen fil, data/empires/<grupp>.json, som laddas först när
riket behövs. data/empires/index.json listar alla riken med namn, färg och tidsspann,
och laddas vid start. Geometrin förenklas och perioder där gränsen knappt ändras
slås ihop, så att filerna blir små.

Faktarutorna (fältet facts i index.json, #170) skrivs för hand och behålls: skriptet läser
den befintliga index.json och för över varje grupps facts när filen skrivs igen.

Kör från projektets rot, med Cliopatria-filen (cliopatria_polities_only_v021.geojson
från https://zenodo.org/records/13363121, CC BY 4.0):
    python3 tools/riken.py <cliopatria.geojson>
Kräver shapely (pip install shapely).
"""
import json
import sys
from pathlib import Path

from shapely.geometry import mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
TOL = 0.2      # förenkling i grader (Douglas-Peucker)
MERGE = 0.02   # slå ihop perioder där gränsen ändras mindre än så här stor del av ytan
MIN_AREA = 0.02  # öar mindre än så här (kvadratgrader, cirka 200 km2) tas bort

# Stora, utspridda imperier förenklas hårdare så att filen blir lagom stor: grupp -> (TOL, MERGE, MIN_AREA)
OVERRIDES = {'brittiska-imperiet': (0.3, 0.08, 0.08)}

# grupp: (svenskt namn, engelskt namn, [(Cliopatria-namn, id, svenskt namn, färg)])
GROUPS = {
    'romarriket': ('Rom: kungadöme, republik, kejsardöme och Bysans', 'Rome: kingdom, republic, empire and Byzantium', [
        ('Roman Kingdom', 'romerska-kungadomet', 'Romerska kungadömet', '#b8433a'),
        ('Roman Republic', 'romerska-republiken', 'Romerska republiken', '#b8433a'),
        ('Roman Empire', 'romerska-kejsardomet', 'Romerska kejsardömet', '#b8433a'),
        ('Western Roman Empire', 'vastromerska-riket', 'Västromerska riket', '#b8433a'),
        ('Eastern Roman Empire', 'ostromerska-riket', 'Östromerska riket', '#8a4fa8'),
        ('Byzantine Empire', 'bysantinska-riket', 'Bysantinska riket', '#8a4fa8'),
    ]),
    'persiska-riket': ('Persiska riket (akemeniderna)', 'Achaemenid Empire', [
        ('Achaemenid Empire', 'akemenidiska-riket', 'Persiska riket', '#c08a2e'),
    ]),
    'alexanders-rike': ('Makedoniska riket', 'Macedonian Empire', [
        ('Macedonian Empire', 'makedoniska-riket', 'Makedoniska riket', '#3f7fb5'),
    ]),
    'hanriket': ('Hanriket', 'Han dynasty', [
        ('Han Dynasty', 'hanriket', 'Hanriket', '#d0703a'),
    ]),
    'mauryariket': ('Mauryariket', 'Maurya Empire', [
        ('Maurya Empire', 'mauryariket', 'Mauryariket', '#5f9e4a'),
    ]),
    'osmanska-riket': ('Osmanska riket', 'Ottoman Empire', [
        ('Ottoman Empire', 'osmanska-riket', 'Osmanska riket', '#2f8f7f'),
    ]),
    'mongolriket': ('Mongolriket och dess khanat', 'Mongol Empire and successor khanates', [
        ('Mongol Empire', 'mongolriket', 'Mongolriket', '#8a6d3b'),
        ('Yuan Dynasty', 'yuandynastin', 'Yuandynastin', '#a07e45'),
        ('Ilkhanate', 'ilkhanatet', 'Ilkhanatet', '#7d6235'),
        ('Chagatai Khanate', 'chagatai-khanatet', 'Chagatai-khanatet', '#96773f'),
        ('Golden Horde', 'gyllene-horden', 'Gyllene horden', '#b08c4a'),
    ]),
    'brittiska-imperiet': ('Brittiska imperiet', 'British Empire', [
        ('(British Empire)', 'brittiska-imperiet', 'Brittiska imperiet', '#c2557a'),
    ]),
    # R2 Antiken (#68)
    'egypten': ('Egypten: gamla och nya riket', 'Egypt: Old and New Kingdom', [
        ('Old Kingdom of Egypt', 'egyptens-gamla-rike', 'Egyptens gamla rike', '#3aa0a8'),
        ('New Kingdom of Egypt', 'egyptens-nya-rike', 'Egyptens nya rike', '#3aa0a8'),
    ]),
    'assyriska-riket': ('Assyriska riket', 'Assyria', [
        ('Assyria', 'assyrien', 'Assyrien', '#6170bd'),
        ('Neo-Assyrian Empire', 'nyassyriska-riket', 'Nyassyriska riket', '#6170bd'),
    ]),
    'nybabyloniska-riket': ('Nybabyloniska riket', 'Neo-Babylonian Empire', [
        ('Neo-Babylonian Empire', 'nybabyloniska-riket', 'Nybabyloniska riket', '#c7568a'),
    ]),
    'kartago': ('Kartago', 'Carthage', [
        ('Carthage', 'kartago', 'Kartago', '#7b5fc0'),
    ]),
    'seleukidriket': ('Seleukidriket', 'Seleucid Empire', [
        ('Seleucid Empire', 'seleukidriket', 'Seleukidriket', '#4aa8c8'),
    ]),
    'partherriket': ('Partherriket', 'Parthian Empire', [
        ('Parthian Empire', 'partherriket', 'Partherriket', '#9a9433'),
    ]),
    'sasanidriket': ('Sasanidriket', 'Sasanian Empire', [
        ('Sasanian Empire', 'sasanidriket', 'Sasanidriket', '#3f9a5f'),
    ]),
    'qinriket': ('Qin: staten och Qindynastin', 'Qin: the state and the Qin dynasty', [
        ('Qin', 'qin-staten', 'Staten Qin', '#5a7fc0'),
        ('Qin Dynasty', 'qindynastin', 'Qindynastin', '#5a7fc0'),
    ]),
    'guptariket': ('Guptariket', 'Gupta Empire', [
        ('Gupta Empire', 'guptariket', 'Guptariket', '#d9a03a'),
    ]),
    'aksumriket': ('Aksumriket', 'Kingdom of Aksum', [
        ('Kingdom of Axum', 'aksumriket', 'Aksumriket', '#c06a9a'),
    ]),
    # R3 Medeltiden (#69)
    'umayyadkalifatet': ('Umayyadkalifatet', 'Umayyad Caliphate', [
        ('Umayyad Caliphate', 'umayyadkalifatet', 'Umayyadkalifatet', '#4e9a2e'),
    ]),
    'abbasidkalifatet': ('Abbasidkalifatet', 'Abbasid Caliphate', [
        ('Abbasid Caliphate', 'abbasidkalifatet', 'Abbasidkalifatet', '#2a6f97'),
        ('Abbasid Caliphate/Buyid Dynasty', 'abbasidkalifatet-buyiderna', 'Abbasidkalifatet under buyiderna', '#5b9bbd'),
    ]),
    'frankerriket': ('Frankerriket', 'Francia (Kingdom of the Franks)', [
        ('(Merovingian Empire)', 'merovingiska-riket', 'Frankerriket under merovingerna', '#3b62b0'),
        ('(Carolingian Empire)', 'karolingiska-riket', 'Frankerriket under karolingerna', '#3b62b0'),
    ]),
    'tysk-romerska-riket': ('Tysk-romerska riket', 'Holy Roman Empire', [
        ('(Holy Roman Empire)', 'tysk-romerska-riket', 'Tysk-romerska riket', '#d4a017'),
    ]),
    'tangdynastin': ('Tangdynastin', 'Tang dynasty', [
        ('Tang Dynasty', 'tangdynastin', 'Tangdynastin', '#a8323e'),
    ]),
    'songdynastin': ('Songdynastin', 'Song dynasty', [
        ('Northern Song', 'norra-song', 'Norra Song', '#3fa38c'),
        ('Southern Song', 'sodra-song', 'Södra Song', '#3fa38c'),
    ]),
    'khmerriket': ('Khmerriket', 'Khmer Empire', [
        ('Khmer Empire', 'khmerriket', 'Khmerriket', '#c46fb0'),
    ]),
    'ghanariket': ('Ghanariket', 'Ghana Empire', [
        ('Ghana Empire', 'ghanariket', 'Ghanariket', '#e08a2e'),
    ]),
    'maliriket': ('Maliriket', 'Mali Empire', [
        ('Mali Empire', 'maliriket', 'Maliriket', '#9c4a2e'),
    ]),
    'kievriket': ('Kievriket', "Kievan Rus'", [
        ("Kievan Rus'", 'kievriket', 'Kievriket', '#7fb0e0'),
    ]),
    'timuridriket': ('Timuridriket', 'Timurid Empire', [
        ('Timurid Empire', 'timuridriket', 'Timuridriket', '#4a5fc4'),
    ]),
}


def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], 1), round(o[1], 1)]
        return [rnd(x) for x in o]
    return o


def main():
    src = json.loads(Path(sys.argv[1]).read_text())
    by_name = {}
    for f in src['features']:
        p = f['properties']
        if p['Type'] == 'POLITY':
            by_name.setdefault(p['Name'], []).append(f)
    out = ROOT / 'data/empires'
    out.mkdir(exist_ok=True)
    # Faktarutorna skrivs för hand och ska inte försvinna när filerna byggs om
    old = out / 'index.json'
    facts = {g['id']: g['facts'] for g in json.loads(old.read_text())['groups'] if 'facts' in g} if old.exists() else {}
    index = []
    for gid, (sv, en, members) in GROUPS.items():
        tol, merge, min_area = OVERRIDES.get(gid, (TOL, MERGE, MIN_AREA))
        polities = []
        for cname, pid, psv, color in members:
            periods = []
            for f in sorted(by_name.get(cname, []), key=lambda f: f['properties']['FromYear']):
                p = f['properties']
                g = shape(f['geometry']).buffer(0).simplify(tol, preserve_topology=True)
                if g.geom_type == 'MultiPolygon':
                    g = unary_union([q for q in g.geoms if q.area > min_area] or [max(g.geoms, key=lambda q: q.area)])
                if g.is_empty:
                    continue
                # Namnet skrivs där den största delen av riket ligger
                c = (max(g.geoms, key=lambda q: q.area) if g.geom_type == 'MultiPolygon' else g).representative_point()
                periods.append({'start': p['FromYear'], 'end': p['ToYear'], 'areaKm2': round(p['Area']),
                                'label': [round(c.x, 1), round(c.y, 1)], '_shape': g,
                                'geometry': {'type': mapping(g)['type'], 'coordinates': rnd(mapping(g)['coordinates'])}})
            merged = []
            for q in periods:
                if merged and merged[-1]['end'] + 1 >= q['start']:
                    a, b = merged[-1]['_shape'], q['_shape']
                    if a.symmetric_difference(b).area < merge * a.area:
                        merged[-1]['end'] = q['end']
                        continue
                merged.append(q)
            for q in merged:
                del q['_shape']
            if not merged:
                print('saknas i Cliopatria:', cname)
                continue
            wd = by_name[cname][0]['properties'].get('Wikidata')
            polities.append({'id': pid, 'group': gid, 'name': {'sv': psv, 'en': cname.strip('()')}, 'wikidata': wd,
                             'color': color, 'sources': ['cliopatria'], 'review': 'source-checked', 'periods': merged})
        doc = {'schema': 'historia-globen/areas@1', 'group': gid, 'polities': polities}
        (out / f'{gid}.json').write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
        index.append({'id': gid, 'name': {'sv': sv, 'en': en}, 'color': polities[0]['color'],
                      'from': min(q['start'] for p in polities for q in p['periods']),
                      'to': max(q['end'] for p in polities for q in p['periods']),
                      'file': f'data/empires/{gid}.json',
                      'polities': [{'id': p['id'], 'name': p['name'], 'sources': p['sources'], 'review': p['review']} for p in polities]})
        if gid in facts:
            index[-1]['facts'] = facts[gid]
        size = (out / f'{gid}.json').stat().st_size
        print(f'{gid}: {len(polities)} riken, {sum(len(p["periods"]) for p in polities)} perioder, {size // 1000} kB')
    notes = ('Riken som områden (lagertyp område), ett rike per fil. Utdrag ur Cliopatria, datafil cliopatria_polities_only_v021 '
             '(Seshat Global History Databank, CC BY 4.0, https://zenodo.org/records/13363121), byggt med tools/riken.py. '
             f'Ändringar: geometrin är förenklad (Douglas-Peucker {TOL} grader, koordinater avrundade till 0.1 grad, öar under cirka 200 km2 '
             f'borttagna) och på varandra följande perioder där gränsen ändras mindre än {round(MERGE * 100)} procent är sammanslagna. '
             'Brittiska imperiet är förenklat hårdare (0.3 grader, 8 procent, öar under cirka 800 km2 borttagna). '
             'start/end är Cliopatrias årtal oförändrade (astronomiska år). Namn inom parentes i Cliopatria, till exempel (British Empire), '
             'är Cliopatrias sammanslagning av ett imperiums alla delar. Bysantinska riket ingår i Romarriket som fortsättningen på '
             'Östromerska riket. index.json listar varje rike (grupp) med färg, tidsspann och fil; filen laddas först när riket behövs. '
             'areaKm2 är Cliopatrias yta för den första perioden i ett sammanslaget spann. label = [lon, lat] där namnet skrivs ut.')
    (out / 'index.json').write_text(json.dumps({'schema': 'historia-globen/empires-index@1', 'notes': notes, 'groups': index},
                                               ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
