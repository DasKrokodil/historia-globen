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

from shapely.geometry import Polygon, box, mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
TOL = 0.2      # förenkling i grader (Douglas-Peucker)
MERGE = 0.02   # slå ihop perioder där gränsen ändras mindre än så här stor del av ytan
MIN_AREA = 0.02  # öar mindre än så här (kvadratgrader, cirka 200 km2) tas bort

# Stora, utspridda imperier förenklas hårdare så att filen blir lagom stor: grupp -> (TOL, MERGE, MIN_AREA)
OVERRIDES = {'brittiska-imperiet': (0.3, 0.08, 0.08),
             # R5 (#71): kolonialvälden med många öar och Sovjetunionens långa kust
             'nederlandska-kolonialvaldet': (0.3, 0.08, 0.08), 'franska-kolonialvaldet': (0.3, 0.05, 0.08),
             'japanska-imperiet': (0.3, 0.05, 0.08), 'sovjetunionen': (0.3, 0.05, 0.08)}

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
        ('(British Empire)', 'brittiska-imperiet', 'Brittiska imperiet', '#c2557a', {'homeland': ['Kingdom of Great Britain']}),
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
    # R5 Kolonialvälden och moderna imperier (#71)
    'franska-kolonialvaldet': ('Franska kolonialväldet', 'French colonial empire', [
        ('(Bourbon Kingdom of France)', 'frankrike-kungadomet', 'Frankrike (kungadömet)', '#3f6fb8',
         {'years': (1815, 1847), 'homeland': ['Bourbon Kingdom of France']}),
        ('(French Second Republic)', 'frankrike-andra-republiken', 'Frankrike (andra republiken)', '#3f6fb8',
         {'homeland': ['French Second Republic']}),
        ('(Second French Empire)', 'andra-franska-kejsardomet', 'Andra franska kejsardömet', '#3f6fb8',
         {'homeland': ['Second French Empire']}),
        ('(French Third Republic)', 'frankrike-tredje-republiken', 'Frankrike (tredje republiken)', '#3f6fb8',
         {'homeland': ['French Third Republic']}),
        ('(Vichy France)', 'vichyregimen', 'Vichyregimen', '#3f6fb8', {'years': (1940, 1942), 'homeland': ['Vichy France']}),
        ('(French Fourth Republic)', 'frankrike-fjarde-republiken', 'Frankrike (fjärde republiken)', '#3f6fb8',
         {'homeland': ['French Fourth Republic']}),
    ]),
    'nederlandska-kolonialvaldet': ('Nederländska kolonialväldet', 'Dutch colonial empire', [
        ('(Dutch Republic)', 'nederlandska-republiken', 'Nederländska republiken', '#e0912c', {'homeland': ['Dutch Republic']}),
        ('(Batavian Republic)', 'bataviska-republiken', 'Bataviska republiken', '#e0912c', {'homeland': ['Batavian Republic']}),
        ('(Netherlands)', 'nederlanderna', 'Nederländerna', '#e0912c', {'years': (1811, 1949), 'homeland': ['Netherlands']}),
    ]),
    'tyska-riket': ('Tyska riket', 'German Empire', [
        (['German Empire', 'German Africa'], 'tyska-riket', 'Tyska riket', '#6c7484', {'en': 'German Empire', 'homeland': ['German Empire']}),
    ]),
    'osterrike-ungern': ('Österrike-Ungern', 'Austria-Hungary', [
        ('Austria-Hungary', 'osterrike-ungern', 'Österrike-Ungern', '#b0902e'),
    ]),
    'japanska-imperiet': ('Japanska imperiet', 'Empire of Japan', [
        ('Empire of Japan', 'japanska-imperiet', 'Japanska imperiet', '#d8603e', {'homeland': []}),
    ]),
    'etiopiska-kejsardomet': ('Etiopiska kejsardömet', 'Ethiopian Empire', [
        (['Ethiopian Empire', 'Ethiopia'], 'etiopiska-kejsardomet', 'Etiopiska kejsardömet', '#4f9a45',
         {'en': 'Ethiopian Empire', 'years': (1272, 1974)}),
    ]),
    'sovjetunionen': ('Sovjetunionen', 'Soviet Union', [
        ('Union of Soviet Socialist Republics', 'sovjetunionen', 'Sovjetunionen', '#9a2a3a'),
    ]),
}

# Huvudlandet i utspridda välden (#74): moderlandet ritas med kraftigare kant och en stjärna och får
# rikets namn. Delen tas ur Cliopatria-posterna i 'homeland' (för varje del av riket ovan; en tom lista
# betyder rikets eget område), avgränsat med ett fönster (bbox [väst, syd, öst, nord] eller polygon),
# eftersom moderlandets post ibland också innehåller handelsstationer långt bort.
HOMELANDS = {
    'brittiska-imperiet': {'name': {'sv': 'Storbritannien', 'en': 'Great Britain'}, 'window': (-11, 49.5, 2.2, 61)},
    'franska-kolonialvaldet': {'name': {'sv': 'Frankrike', 'en': 'France'}, 'window': (-5.5, 41.2, 10, 51.2)},
    'nederlandska-kolonialvaldet': {'name': {'sv': 'Nederländerna', 'en': 'Netherlands'}, 'window': (2.4, 49.4, 7.3, 53.7)},
    'tyska-riket': {'name': {'sv': 'Tyskland', 'en': 'Germany'}, 'window': (5.5, 47, 23, 56)},
    # Japans huvudöar och Ryukyuöarna, utan Korea, Taiwan och Sachalin
    'japanska-imperiet': {'name': {'sv': 'Japan', 'en': 'Japan'}, 'window': [
        (122.5, 23.8), (122.5, 25.5), (128.0, 30.5), (128.3, 32.0), (128.3, 33.6), (128.9, 34.3), (129.6, 34.85),
        (130.2, 35.2), (131.5, 36.5), (139.5, 43.0), (140.5, 45.65), (147, 45.65), (147, 40), (143, 30), (131, 23.8)]},
}


def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], 1), round(o[1], 1)]
        return [rnd(x) for x in o]
    return o


def member_periods(by_name, cname, years=None):
    """Perioderna för en del av ett rike: (start, slut, geometri, yta i km2).

    En del är ett namn i Cliopatria, eller en lista med namn som slås ihop år för år, till exempel ett
    moderland och dess kolonier som ligger som egna poster (#71). years = (från, till) klipper spannet."""
    if not isinstance(cname, list):
        items = [(f['properties']['FromYear'], f['properties']['ToYear'], shape(f['geometry']).buffer(0), f['properties']['Area'])
                 for f in sorted(by_name.get(cname, []), key=lambda f: f['properties']['FromYear'])]
    else:
        feats = [f for n in cname for f in by_name.get(n, [])]
        cuts = sorted({f['properties']['FromYear'] for f in feats} | {f['properties']['ToYear'] + 1 for f in feats})
        items = []
        for a, b in zip(cuts, cuts[1:]):
            on = [f for f in feats if f['properties']['FromYear'] <= a <= f['properties']['ToYear']]
            if on:
                items.append((a, b - 1, unary_union([shape(f['geometry']).buffer(0) for f in on]),
                              sum(f['properties']['Area'] for f in on)))
    if years:
        items = [(max(a, years[0]), min(b, years[1]), g, ar) for a, b, g, ar in items if b >= years[0] and a <= years[1]]
    return items


def homeland_shape(by_name, names, window, raw, year, tol, min_area):
    """Moderlandet det året: Cliopatria-delarna i names (eller hela riket om names är tom) inom fönstret
    (bbox [väst, syd, öst, nord] eller en polygon), förenklat som riket. None om inget finns."""
    parts = [shape(f['geometry']).buffer(0) for n in names for f in by_name.get(n, [])
             if f['properties']['FromYear'] <= year <= f['properties']['ToYear']] if names else [raw]
    if not parts:
        return None
    w = Polygon(window) if isinstance(window[0], (list, tuple)) else box(*window)
    g = unary_union(parts).intersection(w).intersection(raw)
    if g.geom_type == 'GeometryCollection':
        g = unary_union([x for x in g.geoms if x.geom_type in ('Polygon', 'MultiPolygon')])
    if g.is_empty:
        return None
    g = g.simplify(tol, preserve_topology=True)
    if g.geom_type == 'MultiPolygon':
        g = unary_union([x for x in g.geoms if x.area > min_area] or [max(g.geoms, key=lambda x: x.area)])
    return None if g.is_empty else g


def same_homeland(a, b, merge):
    """Perioder slås bara ihop om moderlandet också är nästan detsamma (eller saknas i båda)."""
    ha, hb = a.get('_home'), b.get('_home')
    if ha is None or hb is None:
        return ha is None and hb is None
    return ha.symmetric_difference(hb).area < merge * ha.area


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
        home = HOMELANDS.get(gid)
        polities = []
        for cname, pid, psv, color, *rest in members:
            opts = rest[0] if rest else {}
            periods = []
            for start, end, raw, area in member_periods(by_name, cname, opts.get('years')):
                g = raw.simplify(tol, preserve_topology=True)
                if g.geom_type == 'MultiPolygon':
                    g = unary_union([q for q in g.geoms if q.area > min_area] or [max(g.geoms, key=lambda q: q.area)])
                if g.is_empty:
                    continue
                # Namnet skrivs där den största delen av riket ligger
                c = (max(g.geoms, key=lambda q: q.area) if g.geom_type == 'MultiPolygon' else g).representative_point()
                q = {'start': start, 'end': end, 'areaKm2': round(area),
                     'label': [round(c.x, 1), round(c.y, 1)], '_shape': g,
                     'geometry': {'type': mapping(g)['type'], 'coordinates': rnd(mapping(g)['coordinates'])}}
                # Huvudlandet (#74): den del av riket som är moderlandet. Den ritas kraftigare och får rikets namn.
                if home and 'homeland' in opts:
                    hg = homeland_shape(by_name, opts['homeland'], home['window'], raw, start, tol, min_area)
                    if hg is not None:
                        c = (max(hg.geoms, key=lambda x: x.area) if hg.geom_type == 'MultiPolygon' else hg).representative_point()
                        q['label'] = [round(c.x, 1), round(c.y, 1)]
                        q['homeland'] = {'type': mapping(hg)['type'], 'coordinates': rnd(mapping(hg)['coordinates'])}
                        q['_home'] = hg
                periods.append(q)
            merged = []
            for q in periods:
                if merged and merged[-1]['end'] + 1 >= q['start']:
                    a, b = merged[-1]['_shape'], q['_shape']
                    if a.symmetric_difference(b).area < merge * a.area and same_homeland(merged[-1], q, merge):
                        merged[-1]['end'] = q['end']
                        continue
                merged.append(q)
            for q in merged:
                del q['_shape']
                q.pop('_home', None)
            if not merged:
                print('saknas i Cliopatria:', cname)
                continue
            first = cname[0] if isinstance(cname, list) else cname
            wd = by_name[first][0]['properties'].get('Wikidata')
            polity = {'id': pid, 'group': gid, 'name': {'sv': psv, 'en': opts.get('en', first.strip('()'))}, 'wikidata': wd,
                      'color': color, 'sources': ['cliopatria'], 'review': 'source-checked', 'periods': merged}
            if isinstance(cname, list):
                polity['parts'] = cname  # Cliopatria-namnen som slogs ihop
            if home and 'homeland' in opts:
                polity['homeland'] = opts['homeland']  # Cliopatria-namnen för moderlandet
            polities.append(polity)
        doc = {'schema': 'historia-globen/areas@1', 'group': gid, 'polities': polities}
        (out / f'{gid}.json').write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
        index.append({'id': gid, 'name': {'sv': sv, 'en': en}, 'color': polities[0]['color'],
                      'from': min(q['start'] for p in polities for q in p['periods']),
                      'to': max(q['end'] for p in polities for q in p['periods']),
                      'file': f'data/empires/{gid}.json',
                      'polities': [{'id': p['id'], 'name': p['name'], 'sources': p['sources'], 'review': p['review']} for p in polities]})
        if home:
            index[-1]['homeland'] = {'name': home['name']}
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
