#!/usr/bin/env python3
"""Bygger rikesfilerna i data/empires/ ur Cliopatria (R1–R6).

Varje rike (grupp) får en egen fil, data/empires/<grupp>.json, som laddas först när
riket behövs. data/empires/index.json listar alla riken med namn, färg och tidsspann,
och laddas vid start. Geometrin förenklas och perioder där gränsen knappt ändras
slås ihop, så att filerna blir små.

Faktarutorna (fältet facts i index.json, #170) skrivs för hand och behålls: skriptet läser
den befintliga index.json och för över varje grupps facts när filen skrivs igen. Detsamma gäller
fältet vanished för försvunna länder (#72): årtal, föregångare, efterträdare och, för länder
utan gräns i Cliopatria, en punkt.

Kör från projektets rot, med Cliopatria-filen (cliopatria_polities_only_v021.geojson
från https://zenodo.org/records/13363121, CC BY 4.0):
    python3 tools/riken.py <cliopatria.geojson>
Kräver shapely (pip install shapely).
"""
import json
import sys
from pathlib import Path

import numpy as np
import shapely
from shapely.geometry import Polygon, box, mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
TOL = 0.2      # förenkling i grader (Douglas-Peucker)
MERGE = 0.02   # slå ihop perioder där gränsen ändras mindre än så här stor del av ytan
MIN_AREA = 0.02  # öar mindre än så här (kvadratgrader, cirka 200 km2) tas bort

# Stora, utspridda imperier förenklas hårdare så att filen blir lagom stor: grupp -> (TOL, MERGE, MIN_AREA)
OVERRIDES = {'brittiska-imperiet': (0.3, 0.08, 0.08),
             'spanska-imperiet': (0.3, 0.08, 0.08), 'portugisiska-imperiet': (0.3, 0.08, 0.08),
             'ryska-imperiet': (0.3, 0.05, 0.08),
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
    # R4 Tidigmodern tid (#70)
    'aztekriket': ('Aztekriket', 'Aztec Empire', [
        ('Tenochtitlan', 'tenochtitlan', 'Tenochtitlan', '#8f4a2a'),
        ('Aztec Triple Alliance', 'aztekiska-trippelalliansen', 'Aztekiska trippelalliansen', '#8f4a2a'),
    ]),
    'inkariket': ('Inkariket', 'Inca Empire', [
        ('Inca Empire', 'inkariket', 'Inkariket', '#8a5a9e'),
    ]),
    'songhairiket': ('Songhairiket', 'Songhai Empire', [
        ('Songhai Empire', 'songhairiket', 'Songhairiket', '#7fae4a'),
    ]),
    'mogulriket': ('Mogulriket', 'Mughal Empire', [
        ('Mughal Empire', 'mogulriket', 'Mogulriket', '#6b9e3a'),
    ]),
    'safavidriket': ('Safavidriket', 'Safavid Empire', [
        ('Safavid Dynasty', 'safavidriket', 'Safavidriket', '#3a86b0'),
    ]),
    'mingdynastin': ('Mingdynastin', 'Ming dynasty', [
        ('Ming Dynasty', 'mingdynastin', 'Mingdynastin', '#c4463c'),
        ('Southern Ming', 'sodra-ming', 'Södra Ming', '#c4463c'),
    ]),
    'qingdynastin': ('Qingdynastin', 'Qing dynasty', [
        ('Qing Dynasty', 'qingdynastin', 'Qingdynastin', '#d6a433'),
    ]),
    'spanska-imperiet': ('Spanska imperiet', 'Spanish Empire', [
        ('(Spanish Empire)', 'spanska-imperiet', 'Spanska imperiet', '#d2602e', {'homeland': ['Kingdom of Spain', 'Iberian Union']}),
    ]),
    'portugisiska-imperiet': ('Portugisiska imperiet', 'Portuguese Empire', [
        ('(Portuguese Empire)', 'portugisiska-imperiet', 'Portugisiska imperiet', '#2e7d5b', {'homeland': ['Kingdom of Portugal']}),
    ]),
    'ryska-imperiet': ('Ryssland: tsardömet och kejsardömet', 'Russia: Tsardom and Empire', [
        ('Tsardom of Russia', 'ryska-tsardomet', 'Ryska tsardömet', '#7a5fa6'),
        ('Russian Empire', 'ryska-imperiet', 'Ryska imperiet', '#7a5fa6'),
    ]),
    'svenska-stormaktsvaldet': ('Svenska stormaktsväldet', 'Swedish Empire', [
        ('Swedish Empire', 'svenska-stormaktsvaldet', 'Svenska stormaktsväldet', '#3d8fd1'),
    ]),
    'habsburgska-riket': ('Habsburgska riket', 'Habsburg Monarchy', [
        ('(Habsburg Monarchy)', 'habsburgska-riket', 'Habsburgska riket', '#a8475a'),
    ]),
    'tokugawa-japan': ('Tokugawa-Japan', 'Tokugawa Japan', [
        ('Tokugawa Shogunate', 'tokugawa-japan', 'Tokugawa-Japan', '#4b9fb0'),
    ]),
    # R5 Kolonialvälden och moderna imperier (#71)
    'franska-kolonialvaldet': ('Franska kolonialväldet', 'French colonial empire', [
        ('(Bourbon Kingdom of France)', 'frankrike-kungadomet', 'Frankrike (kungadömet)', '#2f6fdc',
         {'years': (1815, 1847), 'homeland': ['Bourbon Kingdom of France']}),
        ('(French Second Republic)', 'frankrike-andra-republiken', 'Frankrike (andra republiken)', '#2f6fdc',
         {'homeland': ['French Second Republic']}),
        ('(Second French Empire)', 'andra-franska-kejsardomet', 'Andra franska kejsardömet', '#2f6fdc',
         {'homeland': ['Second French Empire']}),
        ('(French Third Republic)', 'frankrike-tredje-republiken', 'Frankrike (tredje republiken)', '#2f6fdc',
         {'homeland': ['French Third Republic']}),
        ('(Vichy France)', 'vichyregimen', 'Vichyregimen', '#2f6fdc', {'years': (1940, 1942), 'homeland': ['Vichy France']}),
        ('(French Fourth Republic)', 'frankrike-fjarde-republiken', 'Frankrike (fjärde republiken)', '#2f6fdc',
         {'homeland': ['French Fourth Republic']}),
    ]),
    'nederlandska-kolonialvaldet': ('Nederländska kolonialväldet', 'Dutch colonial empire', [
        ('(Dutch Republic)', 'nederlandska-republiken', 'Nederländska republiken', '#e0912c', {'homeland': ['Dutch Republic']}),
        ('(Batavian Republic)', 'bataviska-republiken', 'Bataviska republiken', '#e0912c', {'homeland': ['Batavian Republic']}),
        ('(Netherlands)', 'nederlanderna', 'Nederländerna', '#e0912c', {'years': (1811, 1949), 'homeland': ['Netherlands']}),
    ]),
    'tyska-riket': ('Tyska riket', 'German Empire', [
        (['German Empire', 'German Africa'], 'tyska-riket', 'Tyska riket', '#7a5aa0', {'en': 'German Empire', 'homeland': ['German Empire']}),
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
    # R6 Försvunna länder (#72). Österrike-Ungern och Sovjetunionen ovan hör också dit. Årtal, föregångare
    # och efterträdare (vanished) skrivs för hand i index.json och behålls, som facts.
    'kalmarunionen': ('Kalmarunionen', 'Kalmar Union', [
        ('(Kalmar Union)', 'kalmarunionen', 'Kalmarunionen', '#c84b4b'),
    ]),
    'preussen': ('Preussen', 'Prussia', [
        ('Duchy of Prussia', 'hertigdomet-preussen', 'Hertigdömet Preussen', '#4a6fa0'),
        ('Brandenburg-Prussia', 'brandenburg-preussen', 'Brandenburg-Preussen', '#4a6fa0', {'years': (1619, 1701)}),
        # Från 1807 räknar Cliopatria Preussens land till andra riken; bara små rester har egen gräns
        ('Kingdom of Prussia', 'kungariket-preussen', 'Kungariket Preussen', '#4a6fa0', {'years': (1702, 1806)}),
    ]),
    'jugoslavien': ('Jugoslavien', 'Yugoslavia', [
        # Cliopatria anger Q83286 (den socialistiska förbundsrepubliken) också för kungariket
        ('Yugoslavia', 'kungariket-jugoslavien', 'Jugoslavien', '#2d8fa8', {'wikidata': 'Q36704'}),
        ('Socialist Federal Republic of Yugoslavia', 'sfr-jugoslavien', 'Jugoslavien', '#2d8fa8'),
    ]),
    'tjeckoslovakien': ('Tjeckoslovakien', 'Czechoslovakia', [
        ('Czechoslovakia', 'tjeckoslovakien', 'Tjeckoslovakien', '#c06a3a'),
    ]),
    'storcolombia': ('Storcolombia', 'Gran Colombia', [
        ('Gran Colombia', 'storcolombia', 'Storcolombia', '#d4b13a'),
    ]),
    'republiken-texas': ('Republiken Texas', 'Republic of Texas', [
        ('Republic of Texas', 'republiken-texas', 'Republiken Texas', '#8f5fbf'),
    ]),
    'kungariket-hawaii': ('Kungariket Hawaii', 'Hawaiian Kingdom', [
        ("Kingdom of Hawaï'i", 'kungariket-hawaii', 'Kungariket Hawaii', '#3fae7a', {'en': 'Hawaiian Kingdom'}),
    ]),
    # Saknas i Cliopatria (räknas till Tyska förbundet och Tyska riket). Utan gräns: en punkt (vanished.point i
    # index.json), och from/to är källornas årtal (vanished.founded/dissolved). Färgen står i inställningarna.
    'neutrala-moresnet': ('Neutrala Moresnet', 'Neutral Moresnet', [], {'color': '#e0a0c0'}),
}

# Huvudlandet i utspridda välden (#74): moderlandet ritas med kraftigare kant och en stjärna och får
# rikets namn. Delen tas ur Cliopatria-posterna i 'homeland' (för varje del av riket ovan; en tom lista
# betyder rikets eget område), avgränsat med ett fönster (bbox [väst, syd, öst, nord] eller polygon),
# eftersom moderlandets post ibland också innehåller handelsstationer långt bort.
HOMELANDS = {
    'brittiska-imperiet': {'name': {'sv': 'Storbritannien', 'en': 'Great Britain'}, 'window': (-11, 49.5, 2.2, 61)},
    # R4 (#70): Iberiska halvön med Balearerna, utan Ceuta, Melilla och Kanarieöarna
    'spanska-imperiet': {'name': {'sv': 'Spanien', 'en': 'Spain'}, 'window': (-9.8, 36.0, 4.5, 44.0)},
    'portugisiska-imperiet': {'name': {'sv': 'Portugal', 'en': 'Portugal'}, 'window': (-9.8, 36.8, -6.0, 42.2)},
    'franska-kolonialvaldet': {'name': {'sv': 'Frankrike', 'en': 'France'}, 'window': (-5.5, 41.2, 10, 51.2)},
    'nederlandska-kolonialvaldet': {'name': {'sv': 'Nederländerna', 'en': 'Netherlands'}, 'window': (2.4, 49.4, 7.3, 53.7)},
    'tyska-riket': {'name': {'sv': 'Tyskland', 'en': 'Germany'}, 'window': (5.5, 47, 23, 56)},
    # Japans huvudöar och Ryukyuöarna, utan Korea, Taiwan och Sachalin
    'japanska-imperiet': {'name': {'sv': 'Japan', 'en': 'Japan'}, 'window': [
        (122.5, 23.8), (122.5, 25.5), (128.0, 30.5), (128.3, 32.0), (128.3, 33.6), (128.9, 34.3), (129.6, 34.85),
        (130.2, 35.2), (131.5, 36.5), (139.5, 43.0), (140.5, 45.65), (147, 45.65), (147, 40), (143, 30), (131, 23.8)]},
}


# Riken som Cliopatria delar upp, men som källorna räknar som ett rike (#336). Efter året `after`
# byggs rikets gräns om: rikets egen post i Cliopatria plus de angivna riken (`add`, Cliopatria-namn
# med första och sista år, None = utan gräns), men bara den del av dem som ligger innanför gränsen
# `border` (rikets gräns ett visst år) minus länderna i `outside` (som ingick i Cliopatrias gräns men
# inte i riket). Riken i `remove` klipps bort från det angivna året, även ur rikets egen post.
# Ytan (areaKm2) räknas då fram ur den byggda gränsen.
EXTEND = {
    'tysk-romerska-riket': {
        'polity': '(Holy Roman Empire)',
        'after': 1458,
        # Cliopatria 1453–1458 räknar Ladislaus Postumus länder (också Ungern) och Tyska ordens
        # Preussen till riket. Ungern och ordensstaten/hertigdömet Preussen hörde aldrig till riket.
        'border': ('(Holy Roman Empire)', 1458),
        'outside': [('Kingdom of Hungary', 1459), ('Teutonic Order', 1458)],
        'add': [
            ('(Habsburg Monarchy)', None, None), ('(Kingdom of Bohemia)', None, None),
            ('Kingdom of Hungary', None, None),  # bara Matthias Corvinus erövringar innanför riket
            ('Electorate of Brandenburg', None, None), ('Brandenburg-Prussia', None, None),
            ('Kingdom of Prussia', None, None),
            ('House of Ascania', None, None), ('Electorate of Saxony', None, None), ('Kingdom of Saxony', None, None),
            # Cliopatria räknar Sachsen till Polen–Litauen under personalunionen 1697–1763; bara Sachsen ligger innanför
            ('Polish-Lithuanian Commonwealth', 1697, 1763),
            ('Duchy of Bavaria', None, None), ('Kingdom of Bavaria', None, None),
            ('Electorate of Hanover', None, None), ('Kingdom of Hanover', None, None),
            ('Electorate of Trier', None, None), ('Duchy of Lorraine', None, None),
            ('County of Savoy', None, None), ('House of Savoy', None, None), ('Kingdom of Sardinia', None, None),
            ('Duchy of Milan', None, None), ('Republic of Florence', None, None),
            ('(Spanish Empire)', None, None),  # Burgundiska Nederländerna, Franche-Comté och Milano
            ('(Kalmar Union)', None, None), ('Denmark-Norway', None, None),  # Holstein
            # Svenska Pommern, Wismar och Bremen-Verden (från 1648), och under trettioåriga kriget de delar av riket
            # som Sverige höll (Cliopatria räknar dem till Sverige från 1632)
            ('Swedish Empire', None, None),
            ('Swiss Confederation', None, 1647), ('Union of Utrecht', None, 1647), ('(Dutch Republic)', None, 1647),
            ('Electorate of Hesse', None, None), ('Electorate of Württemberg', None, None),
            ('Electorate of Baden', None, None), ('Electorate of Salzburg', None, None),
            ('Austrian Empire', None, None), ('Kingdom of Württemberg', None, None), ('Grand Duchy of Baden', None, None),
            ('Grand Duchy of Hesse', None, None), ('Grand Duchy of Berg', None, None), ('Duchy of Nassau', None, None),
            ('Duchy of Mecklenburg', None, None), ('Grand Duchy of Würzburg', None, None), ('Saxe-Altenburg', None, None),
            ('Principality of Regensberg', None, None), ('Free City of Lübeck', None, None), ('Duchy of Oldenburg', None, None),
        ],
        'remove': [('Swiss Confederation', 1648), ('(Dutch Republic)', 1648)],
    },
}


def km2(g):
    """Ytan i km2 på en sfär (Lamberts ytriktiga cylinderprojektion)."""
    r = 6371.0088
    return shapely.transform(g, lambda c: np.column_stack([np.radians(c[:, 0]) * r, np.sin(np.radians(c[:, 1])) * r])).area


def extend(by_name, ext):
    """Bygger om rikets perioder efter ext['after'] enligt EXTEND och returnerar rikets nya lista med poster."""
    def at(name, y):
        for f in by_name.get(name, []):
            if f['properties']['FromYear'] <= y <= f['properties']['ToYear']:
                return shape(f['geometry']).buffer(0)
        return None
    after = ext['after']
    own = by_name[ext['polity']]
    border = at(*ext['border'])
    for name, y in ext['outside']:
        border = border.difference(at(name, y))
    end = max(f['properties']['ToYear'] for f in own)
    # Ett nytt spann börjar varje gång något av rikena i listan ändras
    cuts = {after + 1}
    for name in [ext['polity']] + [a[0] for a in ext['add']] + [r[0] for r in ext['remove']]:
        for f in by_name.get(name, []):
            cuts |= {f['properties']['FromYear'], f['properties']['ToYear'] + 1}
    cuts |= {a[1] for a in ext['add'] if a[1]} | {a[2] + 1 for a in ext['add'] if a[2]} | {r[1] for r in ext['remove']}
    cuts = sorted(c for c in cuts if after < c <= end) + [end + 1]
    out = [f for f in own if f['properties']['ToYear'] <= after]
    props = own[0]['properties']
    for s, e in zip(cuts, cuts[1:]):
        parts = [at(ext['polity'], s)]
        parts += [at(name, s) for name, a, b in ext['add'] if (a is None or a <= s) and (b is None or s <= b)]
        g = unary_union([p for p in parts if p is not None]).intersection(border)
        for name, y in ext['remove']:
            if s >= y and at(name, s) is not None:
                g = g.difference(at(name, s))
        out.append({'properties': {**props, 'FromYear': s, 'ToYear': e - 1, 'Area': km2(g)}, 'geometry': mapping(g)})
    return out


def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], 1), round(o[1], 1)]
        return [rnd(x) for x in o]
    return o


def member_periods(by_name, cname, years=None, feats=None):
    """Perioderna för en del av ett rike: (start, slut, geometri, yta i km2).

    En del är ett namn i Cliopatria, eller en lista med namn som slås ihop år för år, till exempel ett
    moderland och dess kolonier som ligger som egna poster (#71). years = (från, till) klipper spannet.
    feats ersätter Cliopatrias poster för ett namn (riken som byggs om med EXTEND, #336)."""
    if not isinstance(cname, list):
        items = [(f['properties']['FromYear'], f['properties']['ToYear'], shape(f['geometry']).buffer(0), f['properties']['Area'])
                 for f in sorted(feats if feats is not None else by_name.get(cname, []), key=lambda f: f['properties']['FromYear'])]
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
    groups_old = {g['id']: g for g in json.loads(old.read_text())['groups']} if old.exists() else {}
    facts = {k: g['facts'] for k, g in groups_old.items() if 'facts' in g}
    # Försvunna länder (#72): årtal, föregångare och efterträdare skrivs också för hand
    vanished = {k: g['vanished'] for k, g in groups_old.items() if 'vanished' in g}
    index = []
    for gid, (sv, en, members, *gopts) in GROUPS.items():
        tol, merge, min_area = OVERRIDES.get(gid, (TOL, MERGE, MIN_AREA))
        if not members:
            # Ett land utan gräns i Cliopatria (#72): bara en post i index.json, med källornas årtal och en punkt
            v = vanished.get(gid)
            if not v or 'point' not in v:
                print(f'{gid}: saknar vanished.point i index.json, hoppas över')
                continue
            index.append({'id': gid, 'name': {'sv': sv, 'en': en}, 'color': gopts[0]['color'],
                          'from': v['founded'], 'to': v['dissolved'], 'polities': [], 'vanished': v})
            if gid in facts:
                index[-1]['facts'] = facts[gid]
            print(f'{gid}: ingen gräns, punkt {v["point"]["coordinates"]}')
            continue
        home = HOMELANDS.get(gid)
        polities = []
        for cname, pid, psv, color, *rest in members:
            opts = rest[0] if rest else {}
            periods = []
            feats = None
            if gid in EXTEND and EXTEND[gid]['polity'] == cname:
                feats = extend(by_name, EXTEND[gid])
            for start, end, raw, area in member_periods(by_name, cname, opts.get('years'), feats):
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
            wd = opts.get('wikidata') or by_name[first][0]['properties'].get('Wikidata')
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
        if gid in vanished:
            index[-1]['vanished'] = vanished[gid]
        if gid in facts:
            index[-1]['facts'] = facts[gid]
        size = (out / f'{gid}.json').stat().st_size
        print(f'{gid}: {len(polities)} riken, {sum(len(p["periods"]) for p in polities)} perioder, {size // 1000} kB')
    notes = ('Riken som områden (lagertyp område), ett rike per fil. Utdrag ur Cliopatria, datafil cliopatria_polities_only_v021 '
             '(Seshat Global History Databank, CC BY 4.0, https://zenodo.org/records/13363121), byggt med tools/riken.py. '
             f'Ändringar: geometrin är förenklad (Douglas-Peucker {TOL} grader, koordinater avrundade till 0.1 grad, öar under cirka 200 km2 '
             f'borttagna) och på varandra följande perioder där gränsen ändras mindre än {round(MERGE * 100)} procent är sammanslagna. '
             'Brittiska, spanska och portugisiska imperiet är förenklade hårdare (0.3 grader, 8 procent, öar under cirka 800 km2 borttagna), '
             'liksom Ryssland, Sovjetunionen, Japan och franska kolonialväldet (0.3 grader, 5 procent, öar under cirka 800 km2 borttagna) och nederländska kolonialväldet (0.3 grader, 8 procent). '
             'start/end är Cliopatrias årtal oförändrade (astronomiska år). Namn inom parentes i Cliopatria, till exempel (British Empire), '
             'är Cliopatrias sammanslagning av ett imperiums alla delar. Bysantinska riket ingår i Romarriket som fortsättningen på '
             'Östromerska riket. index.json listar varje rike (grupp) med färg, tidsspann och fil; filen laddas först när riket behövs. '
             'areaKm2 är Cliopatrias yta för den första perioden i ett sammanslaget spann. label = [lon, lat] där namnet skrivs ut. '
             'Tysk-romerska riket efter 1458 är ihopbyggt av flera riken i Cliopatria, klippta mot rikets gräns 1458 utan Ungern och '
             'Tyska ordens Preussen (EXTEND i tools/riken.py, #336); där är areaKm2 räknad ur den byggda gränsen. '
             'Kolonialvälden och moderna imperier (R5, #71): '
             'parts listar Cliopatria-poster som är ihopslagna år för år till ett rike (Tyska riket med German Africa, '
             'Etiopiska kejsardömet med Ethiopia till 1974); då är areaKm2 summan av posternas ytor. homeland (#74) är moderlandet i ett '
             'utspritt välde: Cliopatria-posterna för moderlandet (polity.homeland) inom ett fönster runt moderlandet, och per period '
             'dess gräns (period.homeland); label står då i moderlandet. För Japan, där Cliopatria inte skiljer på Japan och kolonierna, '
             'är moderlandet huvudöarna och Ryukyuöarna, avgränsade med en polygon ur rikets eget område. index.json har då '
             'homeland.name, moderlandets namn. '
             'Försvunna länder (R6, #72): vanished är landets årtal enligt källorna (founded, dissolved), föregångare och '
             'efterträdare (predecessors, successors; group pekar på ett rike i den här filen, wikidata är kontrollerat). '
             'Preussen visas 1526–1806, eftersom Cliopatria från 1807 räknar landet till andra riken. Neutrala Moresnet saknas i '
             'Cliopatria och har ingen fil, bara en punkt (vanished.point).')
    (out / 'index.json').write_text(json.dumps({'schema': 'historia-globen/empires-index@1', 'notes': notes, 'groups': index},
                                               ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
