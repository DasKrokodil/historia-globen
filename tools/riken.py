#!/usr/bin/env python3
"""Bygger rikesfilerna i data/empires/ ur Cliopatria (R1–R6).

Varje rike (grupp) får en egen fil, data/empires/<grupp>.json, som laddas först när
riket behövs. data/empires/index.json listar alla riken med namn, färg och tidsspann,
och laddas vid start. Geometrin förenklas och perioder där gränsen knappt ändras
slås ihop, så att filerna blir små.

Faktarutorna (fältet facts i index.json, #170), rikenas symboler (symbol, #301) och egna faktarutor
för enskilda riken i en grupp (polityFacts, #301) skrivs för hand och behålls: skriptet läser den
befintliga index.json och för över de fälten i varje grupp när filen skrivs igen. Detsamma gäller
fältet vanished för försvunna länder (#72): årtal, föregångare, efterträdare och, för länder
utan gräns i Cliopatria, en punkt, och uncertainBorder för osäkra gränser (#73).

Kör från projektets rot, med Cliopatria-filen (cliopatria_polities_only_v021.geojson ur cliopatria.geojson.zip
i version 0.2.1 på Zenodo, https://zenodo.org/records/23128623, doi:10.5281/zenodo.23128623, CC BY 4.0;
posten 13363121 är version 0.0.1 och ger andra riken, #1616):
    python3 tools/riken.py <cliopatria.geojson>
Kräver shapely (pip install shapely).
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import shapely
from shapely.geometry import MultiPolygon, Polygon, box, mapping, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from riken_bevara import KEEP, keep_langs, kept_fields, old_influence_names, order_like  # noqa: E402  (#1220)

ROOT = Path(__file__).resolve().parent.parent
# KEEP (fält i index.json som skrivs för hand och behålls, bland annat flags och modernState) står i tools/riken_bevara.py (#1220)
TOL = 0.2      # förenkling i grader (Douglas-Peucker)
MERGE = 0.02   # slå ihop perioder där gränsen ändras mindre än så här stor del av ytan
# Perioder från SPLIT_FROM slås inte ihop när gränsen ändras med en sammanhängande del som är större än SPLIT_KM2
# och större än SPLIT_SHARE av riket, även om ändringen är mindre än MERGE (#1732: Hatay, 0,6 procent av Turkiet,
# kom till Turkiet 1939 men försvann i sammanslagningen). SPLIT_SHARE håller tillväxten nere i de stora imperierna
# (DasKrokodil 2026-11-15: filerna växer cirka 10 procent i stället för 15 med bara km2-gränsen).
# Räknas på Cliopatrias ogenomskurna gränser; smala remsor (under cirka 2 * SLIVER grader breda) räknas inte,
# eftersom samma gräns är något olika ritad olika år i Cliopatria.
SPLIT_FROM = 1800
SPLIT_KM2 = 2000
SPLIT_SHARE = 0.005
SLIVER = 0.02
MIN_AREA = 0.02  # öar mindre än så här (kvadratgrader, cirka 200 km2) tas bort
# Rester (#1333): en period i en Cliopatria-post som är mindre än REMNANT_SHARE av postens största period och
# till mindre än REMNANT_INSIDE av sin yta ligger utanför postens övriga, större perioder hoppas över (drop_remnants)
REMNANT_SHARE = 0.01
REMNANT_INSIDE = 0.5

# Grupper som förenklas finare än förut men där namnets plats och sammanslagningen av perioder räknas med den
# gamla förenklingen (grupp -> grader), så att bara gränsens kust blir finare och perioderna står kvar (Danmark och Sverige, #1466)
SAME_AS_TOL = {'danmark': 0.3, 'konungariket-danmark': TOL, 'kalmarunionen': TOL, 'svenska-stormaktsvaldet': TOL}

# Stora, utspridda imperier förenklas hårdare så att filen blir lagom stor: grupp -> (TOL, MERGE, MIN_AREA)
# Små stater som visas som punkter, med gränsen ur Natural Earth (#722)
SMALL_STATES = ('saint-kitts-och-nevis', 'mikronesiska-federationen', 'kiribati', 'komorerna', 'liechtenstein',
                'maldiverna', 'marshalloarna', 'nauru', 'samoa', 'san-marino', 'tonga', 'tuvalu', 'andorra', 'monaco')
OVERRIDES = {'brittiska-imperiet': (0.3, 0.08, 0.08),
             'spanska-imperiet': (0.3, 0.08, 0.08), 'portugisiska-imperiet': (0.3, 0.08, 0.08),
             'ryska-imperiet': (0.3, 0.05, 0.08),
             # R5 (#71): kolonialvälden med många öar och Sovjetunionens långa kust
             'nederlandska-kolonialvaldet': (0.3, 0.08, 0.08), 'franska-kolonialvaldet': (0.3, 0.05, 0.08),
             'japanska-imperiet': (0.3, 0.05, 0.08), 'sovjetunionen': (0.3, 0.05, 0.08),
             # R7 (#407): USA med Alaska, de arktiska öarna och Stilla havet
             'usa': (0.3, 0.05, 0.08),
             # Kanada, Ryssland och Australien med långa kuster och många öar
             # Kanada slår ihop perioder under 2,5 procent (#1333), så att perioden med Newfoundland och Labrador från 1949
             # (3,3 procent av ytan) står kvar
             'kanada': (0.3, 0.025, 0.08), 'australien': (0.3, 0.05, 0.08),
             # Ryssland: perioderna slås aldrig ihop, så att små ändringar (som Krim, cirka 0,2 procent av ytan) inte försvinner
             'ryska-federationen': (0.3, 0.0, 0.08),
             # Israel och Palestina (#644): små länder med smala gränsområden (Gaza är cirka 10 km bred), så
             # förenklingen är finare, annars försvinner Gaza och gränserna mot Västbanken hamnar fel
             'israel': (0.03, 0.02, 0.02), 'palestina': (0.03, 0.02, 0.02),
             # Nutida stater (#644): Danmark med Grönland, Kina och Indonesien med många öar.
             # Danmarks och Sveriges grupper förenklas finare (0,1 grader), annars förenklas Öresundskusten bort och
             # Köpenhamn och Helsingborg hamnar långt utanför gränsen (#1466)
             'danmark': (0.1, 0.05, 0.08),
             'konungariket-danmark': (0.1, MERGE, MIN_AREA), 'kalmarunionen': (0.1, MERGE, MIN_AREA),
             'svenska-stormaktsvaldet': (0.1, MERGE, MIN_AREA),
             # Nordsjöväldet som Danmark, så att den danska kusten inte hoppar 1017/1018 och 1055/1056 (#1602, geografen)
             'nordsjovaldet': (0.1, MERGE, MIN_AREA),
             # Strathclyde och Skottland finare, annars blir Strathclyde en fyrhörning och överlappar Alba (geografen, #1721)
             'strathclyde': (0.05, MERGE, MIN_AREA), 'kungariket-skottland': (0.05, MERGE, MIN_AREA),
             # De angelsaxiska rikena och Dalriada finare, annars överlappar grannarna varandra (#1744)
             'wessex': (0.05, MERGE, MIN_AREA), 'mercia': (0.05, MERGE, MIN_AREA), 'northumbria': (0.05, MERGE, MIN_AREA),
             'dal-riata': (0.05, MERGE, MIN_AREA),
             # Moskvariket som Kalmarunionen, så att Karelen inte ritas i båda av förenklingen (#1743)
             'moskvariket': (0.1, MERGE, MIN_AREA),
             'kina': (0.3, 0.05, 0.08), 'indonesien': (0.2, 0.05, 0.05),
             # Gambia (cirka 30 km bred längs floden) och Libanon är smala: finare förenkling för dem och grannarna Senegal och
             # Syrien, annars täcker grannarnas förenklade gräns en stor del av landet
             'gambia': (0.05, 0.02, 0.02), 'libanon': (0.05, 0.02, 0.02),
             'senegal': (0.05, 0.02, 0.02), 'syrien': (0.05, 0.005, 0.02),
             # Tyskland 1949–1990 och Frankrike (#1706): med 0,2 grader fylls Västberlin i DDR-ytan och Frankrikes gräns
             # buktar in över Saarland (Saarbrücken ligger cirka 5 km från gränsen)
             'osttyskland': (0.05, MERGE, MIN_AREA), 'vasttyskland': (0.05, MERGE, MIN_AREA), 'frankrike': (0.1, MERGE, MIN_AREA),
             'polen': (0.05, MERGE, MIN_AREA),  # Słubice och Zgorzelec ligger vid Oder–Neisse (#1750)
             'belgien': (0.05, MERGE, MIN_AREA),  # Eupen ligger cirka 15 km från gränsen mot Tyskland (#1730)
             # Fria staden Danzig, cirka 2 000 km2 (#1746): Cliopatrias gräns skiljer sig cirka 3 procent 1936 utan att källorna
             # nämner någon ändring, så perioderna slås ihop under 10 procent
             'fria-staden-danzig': (0.02, 0.1, 0.005),
             # Luxemburg och Singapore är små
             'luxemburg': (0.03, 0.02, 0.005), 'singapore': (0.02, 0.02, 0.005),
             # Malaysias förenklade gräns täckte annars en del av Singapore över Johorsundet
             'malaysia': (0.03, 0.02, 0.02),
             # Små önationer (fjortonde omgången): finare förenkling och små öar behålls, annars blir öarna trianglar
             'malta': (0.02, 0.02, 0.001), 'barbados': (0.02, 0.02, 0.001), 'dominica': (0.02, 0.02, 0.001),
             'saint-lucia': (0.02, 0.02, 0.001), 'antigua-och-barbuda': (0.02, 0.02, 0.001),
             'saint-vincent-och-grenadinerna': (0.02, 0.02, 0.001), 'grenada': (0.02, 0.02, 0.001),
             'seychellerna': (0.02, 0.02, 0.001), 'palau': (0.02, 0.02, 0.001),
             # Östtimor (femtonde omgången) blir annars en triangel
             'osttimor': (0.03, 0.02, 0.005),
             # Afrika och danska kolonier (#1388): Oyo och Ashanti börjar små (6 000–33 000 km²), Grönlands kolonier
             # är en smal kust, och de små kolonierna (300–2 200 km²) behåller alla öar och fort
             'oyoriket': (0.03, 0.02, 0.005), 'ashantiriket': (0.03, 0.02, 0.005), 'kongoriket': (0.05, 0.02, 0.01),
             'gronland-koloni': (0.08, 0.03, 0.005),
             # Ruanda-Urundi (#1330) är 50 000 km² och blir annars kantigt
             'belgiska-kongo': (0.1, 0.02, 0.02),
             'danska-indien': (0.002, 0.02, 0), 'danska-guldkusten': (0.002, 0.02, 0),
             # Amerika före 1429 (#556): små riken (2 000–100 000 km²) blir annars fyrhörningar
             'chimor': (0.03, 0.02, 0.005), 'purepecha': (0.03, 0.02, 0.005), 'inkariket': (0.05, 0.02, 0.02),
             # Små stater ur Natural Earth (#722): nästan ingen förenkling, och alla öar behålls
             **{g: (0.002, 0.02, 0) for g in SMALL_STATES}}

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
    # Alexanders erövringar 332–325 f.Kr. (#1382): Cliopatria v0.2.1 har dem under namnet "Ptolemaic Kingdom" (Q2320005)
    # åren -331 till -324, medan "Macedonian Empire" samma år bara är Makedonien (218 169 km²). Ytan 332–328 f.Kr. är exakt
    # det Persiska riket förlorade från 333 f.Kr. (Mindre Asien, Levanten och Egypten, ingen överlappning med Achaemenid
    # Empire), och 327–325 f.Kr. hela det gamla Persiska riket till Indus, samma område som "Macedonian Empire" från 323 f.Kr.
    # Ptolemaios I blev kung först 305 f.Kr. (Wikidata, Wikipedia). Posterna läggs därför till Makedoniska riket de åren.
    'alexanders-rike': ('Makedoniska riket', 'Macedonian Empire', [
        ('Macedonian Empire', 'makedoniska-riket', 'Makedoniska riket', '#3f7fb5', {'join': [('Ptolemaic Kingdom', -331, -324)]}),
    ]),
    'hanriket': ('Hanriket', 'Han dynasty', [
        ('Han Dynasty', 'hanriket', 'Hanriket', '#d0703a'),
    ]),
    'mauryariket': ('Mauryariket', 'Maurya Empire', [
        ('Maurya Empire', 'mauryariket', 'Mauryariket', '#5f9e4a'),
    ]),
    'osmanska-riket': ('Osmanska riket', 'Ottoman Empire', [
        # Cliopatria har den osmanska provinsen Tripolitanien (dagens Libyen) som egen post, Ottoman Tripolitania 1840–1911.
        # Den läggs till riket (join) de år den finns, som Tyska riket med German Africa, så att gränsen andra år är densamma (#1330)
        ('Ottoman Empire', 'osmanska-riket', 'Osmanska riket', '#2f8f7f', {'join': ['Ottoman Tripolitania']}),
    ]),
    'mongolriket': ('Mongolriket och dess khanat', 'Mongol Empire and successor khanates', [
        ('Mongol Empire', 'mongolriket', 'Mongolriket', '#8a6d3b'),
        ('Yuan Dynasty', 'yuandynastin', 'Yuandynastin', '#a07e45'),
        ('Ilkhanate', 'ilkhanatet', 'Ilkhanatet', '#7d6235'),
        ('Chagatai Khanate', 'chagatai-khanatet', 'Chagatai-khanatet', '#96773f'),
        ('Golden Horde', 'gyllene-horden', 'Gyllene horden', '#b08c4a'),
    ]),
    'brittiska-imperiet': ('Brittiska imperiet', 'British Empire', [
        # Cliopatria räknar Botswana och Guyana till imperiet till och med 1968, Ghana till och med 1960 och Oman från 1973, fast de
        # är egna länder de åren i Cliopatria (#644). Likaså Rhodesia 1967–1968 (#1332)
        ('(British Empire)', 'brittiska-imperiet', 'Brittiska imperiet', '#c2557a',
         {'homeland': ['Kingdom of Great Britain'], 'minus': ['Republic of Botswana', 'Ghana', 'Guyana', ('Sultanate of Oman', 1973),
                                                                         'Malawi', 'United Arab Emirates', 'Second Republic of Austria',
                                                                         'Lesotho', 'Solomon Islands', 'Republic of Fiji',
                                                                         'Commonwealth of The Bahamas', 'State of Qatar',
                                                                         'Republic of The Gambia', 'Sultanate of Brunei',
                                                                         'Kingdom of Bahrain', 'Republic of Cyprus', 'Malta',
                                                                         'Barbados', 'Commonwealth of Dominica', 'Saint Lucia',
                                                                         'Antigua and Barbuda', 'Saint Vincent', 'Grenada',
                                                                         'Seychelles', 'Rhodesia'],
          # Perioderna delas när öländerna blir egna länder i Cliopatria (Malta, Barbados och Antigua och Barbuda 1967,
          # Saint Vincent 1969, Grenada och Seychellerna 1976, Dominica och Saint Lucia 1979, Brunei 1987), annars slås
          # ändringen ihop med åren före. 1919: Cliopatria räknar norra Moçambique till imperiet bara 1918, och det
          # ska inte ligga kvar över Portugisiska imperiet 1919–1921 (#644). 1926, 1930, 1936, 1940 och 1944: Jaghbub är
          # italienskt från 1926, Kufra i Libyen brittiskt i Cliopatria till 1929, Sarratriangeln italiensk från 1936, Brittiska
          # Somaliland italienskt 1940, och Libyen räknas till imperiet från 1944; annars ligger imperiet över Italienska
          # kolonier i Afrika eller saknas i Libyen 1944 (#1330)
          'splits': (1919, 1926, 1930, 1936, 1940, 1944, 1967, 1969, 1976, 1979, 1987)}),
    ]),
    # R2 Antiken (#68)
    # Mellersta riket (Q191324) lades till i #646 (DasKrokodils ja 2026-11-13); gruppens id står kvar så att länkar inte ändras
    'egypten': ('Egypten: gamla, mellersta och nya riket', 'Egypt: Old, Middle and New Kingdoms', [
        ('Old Kingdom of Egypt', 'egyptens-gamla-rike', 'Egyptens gamla rike', '#3aa0a8'),
        ('Middle Kingdom of Egypt', 'egyptens-mellersta-rike', 'Egyptens mellersta rike', '#3aa0a8'),
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
        # Amerika före 1429 (#556): Cliopatrias `Cuzco` är kungariket Cusco, inkarikets föregångare. Cliopatria
        # anger staden (Q5582862); kungariket är Q2314963, som saknar svensk etikett. Det svenska namnet följer svenska
        # Wikipedia ("kungariket Cusco", artikeln Inca Roca, #1702)
        ('Cuzco', 'kungariket-cusco', 'Kungariket Cusco', '#8a5a9e', {'en': 'Kingdom of Cusco', 'wikidata': 'Q2314963'}),
        ('Inca Empire', 'inkariket', 'Inkariket', '#8a5a9e'),
    ]),
    # Amerika före 1429 (#556, luckan ur #1388). Inte med, eftersom de inte är en stat och väntar på formatet i
    # #1300 (docs/beslut/2026-11-13-omraden-som-inte-ar-stat-1300.md): Olmec Civilization, Zapotec Civilization,
    # Mayan City-States, Later Mayan City-States, Classic Veracruz Culture, Puebloans, Teotihuacan (Q172613 är en
    # forntida stad) och Toltec (Q187897 är ett folk). Texcoco väntar också: Cliopatrias ytor för Texcoco och
    # Tenochtitlan ser ut att vara förväxlade (staden Tenochtitlan ligger 23 km från sin egen yta).
    # Cliopatrias `Chimor` (911–1187) och `Chimu Empire` (1188–1481) är samma stat (båda Q581741) och slås ihop
    'chimor': ('Chimor', 'Chimor', [
        (['Chimor', 'Chimu Empire'], 'chimor', 'Chimor', '#c47a3d', {'en': 'Chimor'}),
    ]),
    # Cliopatria anger dagens delstat Michoacán (Q79861); staten är Q2605410. Svensk etikett saknas på Wikidata; det
    # svenska namnet är folkets namn (svenska Wikipedia, Mexikos historia: "purepecha") med -riket som Aztekriket (#1702)
    'purepecha': ('Purépechariket', 'Purépecha Empire', [
        ('Michoacán', 'purepecha', 'Purépechariket', '#5f7fc0', {'en': 'Purépecha Empire', 'wikidata': 'Q2605410'}),
    ]),
    'songhairiket': ('Songhairiket', 'Songhai Empire', [
        ('Songhai Empire', 'songhairiket', 'Songhairiket', '#7fae4a'),
    ]),
    # Afrika och danska kolonier (luckan ur #1388, 2026-11-13). Svenska namn är Wikidatas svenska etiketter, utom
    # Ashantiriket (etiketten är "Ashanti (stat)", med en förtydligande parentes; namnet är svenska Wikipedias
    # artikelnamn) och Sultanatet Sennar (svensk etikett saknas; namnet följer svenska Wikipedia, artikeln Alodia, #1702).
    'kongoriket': ('Kongoriket', 'Kingdom of Kongo', [
        ('Kingdom of Kongo', 'kongoriket', 'Kongoriket', '#b0703a', {'en': 'Kingdom of Kongo'}),
    ]),
    'funjsultanatet': ('Sultanatet Sennar', 'Funj Sultanate', [
        ('Funj Sultanate', 'funjsultanatet', 'Sultanatet Sennar', '#3a8a8a', {'en': 'Funj Sultanate'}),
    ]),
    'oyoriket': ('Oyoriket', 'Oyo Empire', [
        ('Oyo Empire', 'oyoriket', 'Oyoriket', '#a05a8a', {'en': 'Oyo Empire'}),
    ]),
    'ashantiriket': ('Ashantiriket', 'Ashanti Empire', [
        ('Ashanti Empire', 'ashantiriket', 'Ashantiriket', '#c09a2a', {'en': 'Ashanti Empire'}),
    ]),
    # Danska kolonier som egna grupper, inte som delar av Konungariket Danmark: inget beslut säger att Grönland eller
    # kolonierna ska ritas som en del av Danmarks kontur (#1264). Cliopatrias Danish India är 1757–1808 (Wikipedia:
    # 1620–1869), och Danish Gold Coast 1659–1852 (Wikipedia: 1658–1850). Kolonierna är 300–2 200 km² och visas
    # som punkter med namn (samma visning som de små staterna, #722); gränsen är fortfarande Cliopatrias.
    'gronland-koloni': ('Grönland', 'Greenland', [
        ('Greenland', 'gronland-koloni', 'Grönland', '#6a9ac0', {'en': 'Greenland'}),
    ]),
    'danska-indien': ('Danska Indien', 'Danish India', [
        ('Danish India', 'danska-indien', 'Danska Indien', '#c0505a', {'en': 'Danish India', 'point': True}),
    ]),
    'danska-guldkusten': ('Danska Guldkusten', 'Danish Gold Coast', [
        ('Danish Gold Coast', 'danska-guldkusten', 'Danska Guldkusten', '#c0505a', {'en': 'Danish Gold Coast', 'point': True}),
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
        # Cliopatria räknar Dominikanska republiken till imperiet 1865, fast den är eget land det året (#644)
        ('(Spanish Empire)', 'spanska-imperiet', 'Spanska imperiet', '#d2602e',
         {'homeland': ['Kingdom of Spain', 'Iberian Union'], 'minus': [('Dominican Republic', 1865)]}),
    ]),
    'portugisiska-imperiet': ('Portugisiska imperiet', 'Portuguese Empire', [
        # 1911–1975 (#644): Cliopatrias Portuguese Republic (1911–1925) och Estado Novo (1926–1975) omfattar både
        # Portugal och kolonierna. Estado Novo 1979–2024 i Cliopatria är bara Cabinda, som också ligger i Angola, och
        # tas inte med. Guinea-Bissau (eget land från 1973 i Cliopatria) och Indien (Goa från 1961) klipps bort
        (['(Portuguese Empire)', 'Portuguese Republic', 'Estado Novo'], 'portugisiska-imperiet', 'Portugisiska imperiet',
         '#2e7d5b', {'homeland': ['Kingdom of Portugal', 'Portuguese Republic', 'Estado Novo'], 'years': (1502, 1975),
                     'wikidata': 'Q200464', 'minus': ['Republic of Guinea-Bissau', ('Republic of India', 1961)],
                     # Goa till Indien 1961 och Guinea-Bissau eget land 1973 är små ändringar som annars slås ihop
                     'splits': (1961, 1973)}),
    ]),
    'ryska-imperiet': ('Ryssland: tsardömet och kejsardömet', 'Russia: Tsardom and Empire', [
        ('Tsardom of Russia', 'ryska-tsardomet', 'Ryska tsardömet', '#7a5fa6'),
        ('Russian Empire', 'ryska-imperiet', 'Ryska imperiet', '#7a5fa6'),
    ]),
    # Cliopatria kallar Sverige "Swedish Empire" ända till 1814, men stormaktstiden slutade med freden i Nystad 1721
    # (wp-swedish-empire). Samma Cliopatria-post delas därför i två delar med olika namn (Rikards val A i #70).
    # Gruppen heter Sverige och börjar med medeltidens kungarike (#645, Rikards beslut 2026-11-07): Cliopatrias Kingdom of Sweden
    # finns 980–1401, 1502–1520 och 1526–1611 (Kalmarunionen 1402–1501 och 1521–1525, kontrollerat i #1264), samma post som
    # Sverige från 1905. Gruppens id står kvar, så att länkar och filnamn inte ändras.
    'svenska-stormaktsvaldet': ('Sverige', 'Sweden', [
        ('Kingdom of Sweden', 'sverige-medeltiden', 'Sverige', '#3d8fd1', {'years': (980, 1611), 'en': 'Sweden', 'wikidata': 'Q34'}),
        ('Swedish Empire', 'svenska-stormaktsvaldet', 'Svenska stormaktsväldet', '#3d8fd1', {'years': (1612, 1721)}),
        ('Swedish Empire', 'sverige-1722', 'Sverige', '#3d8fd1', {'years': (1722, 1814), 'en': 'Sweden', 'wikidata': 'Q34'}),
        # #556: unionen med Norge och Sverige efter 1905, så att gruppen går "och efter" (Kingdom of Sweden finns från 980 i Cliopatria)
        ('United Kingdoms of Sweden and Norway', 'sverige-norge', 'Sverige-Norge', '#3d8fd1', {'en': 'Sweden-Norway'}),
        ('Kingdom of Sweden', 'sverige-1905', 'Sverige', '#3d8fd1', {'years': (1905, 2024), 'en': 'Kingdom of Sweden'}),
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
        # Cliopatria räknar Saar till Frankrike till och med 1931; perioden delas 1932, annars ligger Saar kvar till 1939 (#1329)
        ('(French Third Republic)', 'frankrike-tredje-republiken', 'Frankrike (tredje republiken)', '#2f6fdc',
         # 1920 (#1330): gränsen mot Italienska Libyen ändras, annars ligger 1919 års gräns över Libyen 1920–1931
         # 1930 (#1755): Cliopatria lämnar den franska zonen i Rhenlandet 1930; utan delningen slogs 1930–1931 ihop med
         # åren före, och Pfalz ritades både som Frankrike och Weimarrepubliken
         {'homeland': ['French Third Republic'], 'splits': (1920, 1930, 1932)}),
        ('(Vichy France)', 'vichyregimen', 'Vichyregimen', '#2f6fdc', {'years': (1940, 1942), 'homeland': ['Vichy France']}),
        ('(French Fourth Republic)', 'frankrike-fjarde-republiken', 'Frankrike (fjärde republiken)', '#2f6fdc',
         {'homeland': ['French Fourth Republic']}),
    ]),
    'nederlandska-kolonialvaldet': ('Nederländska kolonialväldet', 'Dutch colonial empire', [
        ('(Dutch Republic)', 'nederlandska-republiken', 'Nederländska republiken', '#e0912c', {'homeland': ['Dutch Republic']}),
        ('(Batavian Republic)', 'bataviska-republiken', 'Bataviska republiken', '#e0912c', {'homeland': ['Batavian Republic']}),
        # Cliopatria räknar Luxemburg till Nederländerna till och med 1914, också efter 1890 då Luxemburg är eget land (#644)
        ('(Netherlands)', 'nederlanderna', 'Nederländerna', '#e0912c', {'years': (1811, 1949), 'homeland': ['Netherlands'],
                                                                         'minus': ['Luxembourg'], 'splits': (1890,)}),
    ]),
    'tyska-riket': ('Tyska riket', 'German Empire', [
        (['German Empire', 'German Africa'], 'tyska-riket', 'Tyska riket', '#7a5aa0', {'en': 'German Empire', 'homeland': ['German Empire']}),
    ]),
    # Tyskland 1920–1990 (#1329). Cliopatria har Weimar Republic till och med 1935 och Nazi Germany från 1936, men
    # Wikidata och Wikipedia låter Nazityskland börja 1933. Åren 1933–1935 ritas därför som Nazityskland med Cliopatrias
    # gräns för Weimarrepubliken (gränsen är densamma). 1945–1948 visar Cliopatria ockupationszonerna (USA, Storbritannien,
    # Frankrike och Sovjetunionen); Förbundsrepubliken börjar 1950 och DDR 1949 som i Cliopatria.
    'weimarrepubliken': ('Weimarrepubliken', 'Weimar Republic', [
        ('Weimar Republic', 'weimarrepubliken', 'Weimarrepubliken', '#8a78b0', {'en': 'Weimar Republic', 'years': (1920, 1932)}),
    ]),
    'nazityskland': ('Nazityskland', 'Nazi Germany', [
        (['Nazi Germany', 'Weimar Republic'], 'nazityskland', 'Nazityskland', '#5e5258', {'en': 'Nazi Germany', 'years': (1933, 1944)}),
    ]),
    'vasttyskland': ('Västtyskland', 'West Germany', [
        # Saarland hör till Förbundsrepubliken från 1958 i Cliopatria (1 januari 1957 enligt Wikipedia, #1706). Ändringen är
        # cirka 1 procent av ytan och slogs förut ihop med 1950–1957, så att Saarland saknades till 1990
        ('Federal Republic of Germany', 'vasttyskland', 'Västtyskland', '#c0a040', {'en': 'West Germany', 'splits': (1958,)}),
    ]),
    'osttyskland': ('Östtyskland', 'East Germany', [
        ('German Democratic Republic', 'osttyskland', 'Östtyskland', '#b0604a', {'en': 'East Germany'}),
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
        # Cliopatria räknar Litauen till Sovjetunionen till och med 1991, fast Litauen är eget land från 1990 (#644)
        # Perioden delas 1949, när DDR bildas, annars ligger den sovjetiska zonen kvar över DDR till 1952 (#1329)
        # och 1953, när Polen kommer med i Cliopatria, annars ligger Polen kvar i Sovjetunionen till 1989 (#1730)
        ('Union of Soviet Socialist Republics', 'sovjetunionen', 'Sovjetunionen', '#9a2a3a', {'minus': ['Republic of Lithuania'], 'splits': (1949, 1953, 1990)}),
    ]),
    # R6 Försvunna länder (#72). Österrike-Ungern och Sovjetunionen ovan hör också dit. Årtal, föregångare
    # och efterträdare (vanished) skrivs för hand i index.json och behålls, som facts.
    'kalmarunionen': ('Kalmarunionen', 'Kalmar Union', [
        # splits 1459: Holstein kommer med i Cliopatrias Kalmarunion (geografen, #1721)
        # splits 1475: Orkney och Shetland lämnar unionen i Cliopatria och hör till Kungariket Skottland från 1475 (#1721)
        ('(Kalmar Union)', 'kalmarunionen', 'Kalmarunionen', '#c84b4b', {'splits': (1459, 1475)}),
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
        # Cliopatria ritar landet som Sovjetunionen 1969–1990 (#1332): där ritas Tjeckoslovakien med sin egen gräns 1968,
        # som är densamma som 1991 i Cliopatria (docs/beslut/2026-11-13-ockupation-och-inbordeskrig.md)
        ('Czechoslovakia', 'tjeckoslovakien', 'Tjeckoslovakien', '#c06a3a', {'fill': [(1969, 1990, ('Czechoslovakia', 1968))]}),
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
    # R7 (#407): stater i Amerika som krigen och resorna behöver (inbördeskriget, Paraguaykriget, mexikanska revolutionen)
    'usa': ('USA', 'United States', [
        # Cliopatria räknar Japan till USA 1947–1966 och Okinawa till och med 2005, också de år då Japan är eget land
        # i Cliopatria (från 1953); de åren klipps Japan bort (#644). Likaså Västtyskland, som Cliopatria räknar till USA
        # 1947–1966 och som eget land från 1950 (#1329)
        ('United States of America', 'usa', 'USA', '#4a7ab8', {'en': 'United States', 'minus': ['Japan', 'Republic of the Philippines', 'Republic of Liberia', 'Palau',
                                                                                                    'Federal Republic of Germany', 'German Democratic Republic'],
                                                       # Liberia eget land 1848, Filippinerna 1947, Västtyskland 1950, Japan 1953, Okinawa till Japan 1973, Palau
                                                       # 1996 (Cliopatria)
                                                       'splits': (1848, 1947, 1949, 1950, 1953, 1973, 1996)}),
    ]),
    'amerikas-konfedererade-stater': ('Amerikas konfedererade stater', 'Confederate States of America', [
        ('Confederate States of America', 'amerikas-konfedererade-stater', 'Amerikas konfedererade stater', '#8c7f6a'),
    ]),
    'mexiko': ('Mexiko', 'Mexico', [
        ('First Mexican Empire', 'forsta-mexikanska-kejsardomet', 'Första mexikanska kejsardömet', '#2f9a74'),
        ('Federated Republic of Mexico', 'mexikanska-forbundsrepubliken', 'Mexikanska förbundsrepubliken', '#2f9a74',
         {'en': 'Mexican Federal Republic'}),
        ('Centralist Mexico', 'centralistiska-republiken-mexiko', 'Centralistiska republiken Mexiko', '#5aa88a',
         {'en': 'Centralist Republic of Mexico'}),
        ('Second Mexican Empire', 'andra-mexikanska-kejsardomet', 'Andra mexikanska kejsardömet', '#2f9a74'),
        # Cliopatria anger Q5062192 (centralistiska republiken) också för Mexiko från 1868
        ('Mexico', 'mexiko', 'Mexiko', '#2f9a74', {'wikidata': 'Q96'}),
    ]),
    'brasilien': ('Brasilien: kejsardömet och republiken', 'Brazil: the Empire and the Republic', [
        ('Empire of Brazil', 'kejsardomet-brasilien', 'Kejsardömet Brasilien', '#9ab83a'),
        # Cliopatria delar republiken i fyra poster efter styrelseskick; här en del
        (['Brazilian Republic', 'Unitary State of Brazil', 'Federated Republic of Brazil', 'Republic of Brazil'],
         'brasilien', 'Brasilien', '#9ab83a', {'en': 'Brazil'}),
    ]),
    'argentina': ('Argentina', 'Argentina', [
        # Cliopatria kallar landet Argentine Confederation ända till 1929; källorna säger att namnet Argentine Republic slogs fast 1860
        (['Argentine Confederation', 'Argentine Republic'], 'argentina', 'Argentina', '#6fb3d9', {'en': 'Argentina', 'wikidata': 'Q414'}),
    ]),
    'paraguay': ('Paraguay', 'Paraguay', [
        ('Paraguay', 'paraguay', 'Paraguay', '#c0504a'),
    ]),
    'uruguay': ('Uruguay', 'Uruguay', [
        ('Oriental Republic of Uruguay', 'uruguay', 'Uruguay', '#8a6fc4', {'en': 'Uruguay'}),
    ]),
    # R7 (#407), andra omgången: stater i Mellanöstern som krigen behöver (1948, 1967, 1973, Iran–Irak och Gulfkriget)
    'israel': ('Israel', 'Israel', [
        ('State of Israel', 'israel', 'Israel', '#7aa6e0', {'en': 'Israel'}),
    ]),
    # Staten Palestina (#644): finns inte i Cliopatria efter 1948. Gränsen kommer ur Natural Earth (DISPUTED) och
    # visas från Sveriges erkännande 30 oktober 2014 (Rikards beslut 2026-11-06). Cliopatria-namnet är None.
    'palestina': ('Palestina', 'Palestine', [
        (None, 'palestina', 'Palestina', '#2f9488', {'en': 'Palestine', 'wikidata': 'Q219060', 'years': (2014, 2024)}),
    ]),
    # Gruppen 'egypten' är det forntida Egypten (R2); det moderna Egypten från 1922 är en egen grupp
    'moderna-egypten': ('Egypten från 1922', 'Egypt since 1922', [
        ('Kingdom of Egypt', 'kungariket-egypten', 'Kungariket Egypten', '#c9a23a'),
        ('Republic of Egypt', 'republiken-egypten', 'Republiken Egypten', '#c9a23a'),
        # Cliopatria: Egypten och Syrien 1958–1966, sedan bara Egypten till 1972
        ('United Arab Republic', 'forenade-arabrepubliken', 'Förenade arabrepubliken', '#c9a23a'),
        ('Arab Republic of Egypt', 'arabrepubliken-egypten', 'Arabrepubliken Egypten', '#c9a23a'),
    ]),
    'syrien': ('Syrien', 'Syria', [
        # Cliopatria delar Syrien i fem poster efter styrelseskick och anger Q-id för partiet och för Baathregimen; här en del
        (['Second Syrian Republic', 'Republic of Syria', "Ba'athist Syria", "Arab Socialist Ba'ath Party", 'Syria'],
         'syrien', 'Syrien', '#b0485a', {'en': 'Syria', 'wikidata': 'Q858'}),
    ]),
    'jordanien': ('Jordanien', 'Jordan', [
        ('Kingdom of Jordan', 'jordanien', 'Jordanien', '#5aa860', {'en': 'Jordan'}),
    ]),
    'irak': ('Irak: kungariket och republiken', 'Iraq: the Kingdom and the Republic', [
        ('Kingdom of Iraq', 'kungariket-irak', 'Kungariket Irak', '#8a5fb0'),
        # Cliopatria ritar landet som USA 2006–2013 (#1332): där ritas Irak med sin egen gräns 2005, som är densamma som 2014
        (['Iraqi Republic', 'Republic of Iraq'], 'irak', 'Irak', '#8a5fb0', {'en': 'Iraq', 'fill': [(2006, 2013, ('Iraqi Republic', 2005))]}),
    ]),
    'iran': ('Iran: qajarerna, pahlavi och islamiska republiken', 'Iran: the Qajars, the Pahlavis and the Islamic Republic', [
        ('Qajar Dynasty', 'qajarernas-iran', 'Qajarernas Iran', '#d07a3a', {'en': 'Qajar Iran'}),
        ('Pahlavi Dynasty', 'pahlavis-iran', 'Pahlavis Iran', '#d07a3a', {'en': 'Pahlavi Iran'}),
        ('Islamic Republic of Iran', 'islamiska-republiken-iran', 'Islamiska republiken Iran', '#d07a3a'),
    ]),
    'kuwait': ('Kuwait', 'Kuwait', [
        # Cliopatria har emiratet 1757–1872 och från 1991 som Kuwait, och staten 1961–1989 som State of Kuwait
        (['Kuwait', 'State of Kuwait'], 'kuwait', 'Kuwait', '#a0507a', {'en': 'Kuwait', 'wikidata': 'Q817'}),
    ]),
    # R7 (#407), tredje omgången: Sydasien (Bangladeshs befrielsekrig, det afghansk-marathiska kriget, Afghanistan 2001)
    'indien': ('Indien', 'India', [
        ('Republic of India', 'indien', 'Indien', '#e0a040', {'en': 'India'}),
    ]),
    'pakistan': ('Pakistan', 'Pakistan', [
        ('Islamic Republic of Pakistan', 'pakistan', 'Pakistan', '#3f8f4f', {'en': 'Pakistan'}),
    ]),
    'bangladesh': ('Bangladesh', 'Bangladesh', [
        ("People's Republic of Bangladesh", 'bangladesh', 'Bangladesh', '#c0504a', {'en': 'Bangladesh'}),
    ]),
    'afghanistan': ('Afghanistan: Durranis rike, emiratet, kungariket och republiken',
                    'Afghanistan: the Durrani Empire, the Emirate, the Kingdom and the Republic', [
        ('Durrani Empire', 'durranis-rike', 'Durranis rike', '#9a7a4a'),
        # Cliopatria kallar emiratet Durrani Dynasty 1840–1845
        (['Emirate of Afghanistan', 'Durrani Dynasty'], 'emiratet-afghanistan', 'Emiratet Afghanistan', '#9a7a4a',
         {'en': 'Emirate of Afghanistan', 'wikidata': 'Q1335260'}),
        ('Kingdom of Afghanistan', 'kungariket-afghanistan', 'Kungariket Afghanistan', '#9a7a4a'),
        # Cliopatria ritar delar av landet som Sovjetunionen 1979–1989 och hela eller delar av det som Mujahideen 1987–1995 och
        # Taliban 1996–2005 (#1332): de åren ritas Afghanistan med sin egen gräns 1978, som är densamma som 2006 i Cliopatria
        (['Republic of Afghanistan', 'Afghanistan'], 'afghanistan', 'Afghanistan', '#9a7a4a',
         {'en': 'Afghanistan', 'wikidata': 'Q889', 'fill': [(1979, 2005, ('Republic of Afghanistan', 1978))]}),
    ]),
    'marathariket': ('Marathariket', 'Maratha Empire', [
        ('Maratha Empire', 'marathariket', 'Marathariket', '#d06a2a'),
    ]),
    # R7 (#407), fjärde omgången: Östasien (Imjinkriget, Koreakriget, Vietnamkriget, Taipingupproret)
    'korea': ('Korea: Joseon och Koreanska kejsardömet', 'Korea: Joseon and the Korean Empire', [
        # Cliopatria anger Q28405 (Gojoseon) för Joseon
        ('Joseon', 'joseon', 'Joseon (Korea)', '#4a9ab0', {'en': 'Joseon', 'wikidata': 'Q28179'}),
        ('Korean Empire', 'koreanska-kejsardomet', 'Koreanska kejsardömet', '#4a9ab0'),
    ]),
    'nordkorea': ('Nordkorea', 'North Korea', [
        ("Democratic People's Republic of Korea", 'nordkorea', 'Nordkorea', '#b0404a', {'en': 'North Korea'}),
    ]),
    'sydkorea': ('Sydkorea', 'South Korea', [
        # Cliopatria anger Nordkoreas Q-id (Q423) också för Sydkorea
        ('Republic of Korea', 'sydkorea', 'Sydkorea', '#4a7ac0', {'en': 'South Korea', 'wikidata': 'Q884'}),
    ]),
    'vietnam': ('Vietnam: Nordvietnam och det enade Vietnam', 'Vietnam: North Vietnam and unified Vietnam', [
        ('Democratic Republic of Vietnam', 'nordvietnam', 'Nordvietnam', '#c04040', {'en': 'North Vietnam'}),
        ('Socialist Republic of Vietnam', 'vietnam', 'Vietnam', '#c04040', {'en': 'Vietnam'}),
    ]),
    'sydvietnam': ('Sydvietnam', 'South Vietnam', [
        # Cliopatria anger Nordvietnams Q-id (Q172640) också för Sydvietnam
        ('Republic of Vietnam', 'sydvietnam', 'Sydvietnam', '#d0b040', {'en': 'South Vietnam', 'wikidata': 'Q180573'}),
    ]),
    'taipingriket': ('Taipingriket', 'Taiping Heavenly Kingdom', [
        ('Taiping Heavenly Kingdom', 'taipingriket', 'Taipingriket', '#b06ab0'),
    ]),
    # R7 (#407), femte omgången: Afrika och Oceanien
    'nigeria': ('Nigeria', 'Nigeria', [
        ('Federal Republic of Nigeria', 'nigeria', 'Nigeria', '#3f9a5a', {'en': 'Nigeria'}),
    ]),
    # Belgiska Kongo (#1330). Cliopatrias Belgian Congo 1890–1959 är både Kongostaten (Wikidata 1885–1908) och kolonin
    # (Wikidata 15 november 1908–30 juni 1960), och från 1916 med Ruanda-Urundi (Wikidata 1922–1962). 1960–1962 är posten
    # bara Ruanda-Urundi. Delarna följer Wikidatas årtal på helt år; gränsen är Cliopatrias
    'belgiska-kongo': ('Belgiska Kongo', 'Belgian Congo', [
        ('Belgian Congo', 'kongostaten', 'Kongostaten', '#5a7aa8', {'en': 'Congo Free State', 'years': (1890, 1907), 'wikidata': 'Q76048'}),
        ('Belgian Congo', 'belgiska-kongo', 'Belgiska Kongo', '#5a7aa8', {'en': 'Belgian Congo', 'years': (1908, 1959)}),
        ('Belgian Congo', 'ruanda-urundi', 'Ruanda-Urundi', '#5a7aa8', {'en': 'Ruanda-Urundi', 'years': (1960, 1962), 'wikidata': 'Q590743'}),
    ]),
    # Italienska kolonier i Afrika (#1330, #1083). Cliopatrias Italian Africa 1890–1943 är en post för alla kolonierna. Den delas
    # i kolonierna med rutor (clip) som bara skiljer områden som inte hänger ihop (Libyen, Eritrea och Somaliland ligger
    # åtskilda av andra länder; ingen ny gräns ritas). Namn och årtal efter Wikidata: Italienska Eritrea 1890–1936, Italienska
    # Somaliland till 1936, Italienska Östafrika 1936–1941 (Etiopien, Eritrea och Somaliland) och Italienska Libyen till 1943.
    # Etiopien saknas 1936–1941 och kommer tillbaka 1942, som i Cliopatria. Ockupationsbeslutet 2026-11-13 gäller efter 1945
    'italienska-kolonier': ('Italienska kolonier i Afrika', 'Italian colonies in Africa', [
        ('Italian Africa', 'italienska-eritrea', 'Italienska Eritrea', '#6a9a58',
         {'en': 'Italian Eritrea', 'years': (1890, 1935), 'clip': (33, 12.2, 44, 19), 'wikidata': 'Q1232988'}),
        ('Italian Africa', 'italienska-somaliland', 'Italienska Somaliland', '#6a9a58',
         {'en': 'Italian Somaliland', 'years': (1890, 1935), 'clip': (40, -2, 52, 12.2), 'wikidata': 'Q319984'}),
        ('Italian Africa', 'italienska-ostafrika', 'Italienska Östafrika', '#6a9a58',
         {'en': 'Italian East Africa', 'years': (1936, 1941), 'clip': (33, -2, 52, 19), 'wikidata': 'Q328478'}),
        ('Italian Africa', 'italienska-libyen', 'Italienska Libyen', '#6a9a58',
         {'en': 'Italian Libya', 'years': (1912, 1943), 'clip': (9, 18, 26, 34), 'wikidata': 'Q284568'}),
    ]),
    'kongo-kinshasa': ('Kongo-Kinshasa', 'Democratic Republic of the Congo', [
        # Cliopatria: Democratic Republic of the Congo 1960–1972 och från 1996, Zaire 1973–1995
        (['Democratic Republic of the Congo', 'Zaire'], 'kongo-kinshasa', 'Kongo-Kinshasa', '#4a8ac0',
         {'en': 'Democratic Republic of the Congo', 'wikidata': 'Q974'}),
    ]),
    'rwanda': ('Rwanda', 'Rwanda', [
        ('Republic of Rwanda', 'rwanda', 'Rwanda', '#c08a3a', {'en': 'Rwanda'}),
    ]),
    'uganda': ('Uganda', 'Uganda', [
        ('Republic of Uganda', 'uganda', 'Uganda', '#a04a7a', {'en': 'Uganda'}),
    ]),
    'zululand': ('Zuluriket', 'Zulu Kingdom', [
        ('Zululand', 'zuluriket', 'Zuluriket', '#8a6a3a', {'en': 'Zulu Kingdom'}),
    ]),
    'australien': ('Australien', 'Australia', [
        ('Commonwealth of Australia', 'australien', 'Australien', '#d08a3a', {'en': 'Australia'}),
    ]),
    'nya-zeeland': ('Nya Zeeland', 'New Zealand', [
        ('New Zealand', 'nya-zeeland', 'Nya Zeeland', '#3a9a8a'),
    ]),
    'papua-nya-guinea': ('Papua Nya Guinea', 'Papua New Guinea', [
        ('Papua New Guinea', 'papua-nya-guinea', 'Papua Nya Guinea', '#a05a3a'),
    ]),
    # R7 (#407), sjätte omgången: Amerika (självständighetskrigen och Haitiska revolutionen)
    'kanada': ('Kanada', 'Canada', [
        ('Canada', 'kanada', 'Kanada', '#c04a4a'),
    ]),
    'chile': ('Chile', 'Chile', [
        ('Republic of Chile', 'chile', 'Chile', '#4a6ab0', {'en': 'Chile'}),
    ]),
    'peru': ('Peru', 'Peru', [
        ('Republic of Peru', 'peru', 'Peru', '#b04a5a', {'en': 'Peru'}),
    ]),
    'bolivia': ('Bolivia', 'Bolivia', [
        ('Bolivia', 'bolivia', 'Bolivia', '#5a9a4a'),
    ]),
    'colombia': ('Colombia: Nya Granada och republiken', 'Colombia: New Granada and the Republic', [
        ('New Granada', 'forenade-provinserna-nya-granada', 'Förenade provinserna Nya Granada', '#d0a03a',
         {'en': 'United Provinces of New Granada'}),
        ('Republic of New Granada', 'republiken-nya-granada', 'Republiken Nya Granada', '#d0a03a'),
        ('United States of Colombia', 'colombias-forenta-stater', 'Colombias förenta stater', '#d0a03a'),
        ('Republic of Colombia', 'colombia', 'Colombia', '#d0a03a', {'en': 'Colombia'}),
    ]),
    'venezuela': ('Venezuela', 'Venezuela', [
        (['Republic of Venezuela', 'Venezuela'], 'venezuela', 'Venezuela', '#8a4ab0', {'en': 'Venezuela', 'wikidata': 'Q717'}),
    ]),
    'ecuador': ('Ecuador', 'Ecuador', [
        ('Republic of Ecuador', 'ecuador', 'Ecuador', '#3a9ab0', {'en': 'Ecuador'}),
    ]),
    'haiti': ('Haiti', 'Haiti', [
        # Cliopatria: Haiti 1792–1802 (före självständigheten), Empire of Haiti 1805–1915 och Republic of Haiti från 1936
        ('Haiti', 'saint-domingue', 'Saint-Domingue under revolutionen', '#3a5ab0', {'en': 'Saint-Domingue during the revolution'}),
        ('Empire of Haiti', 'haiti-1805', 'Haiti 1805–1915', '#3a5ab0', {'en': 'Haiti 1805–1915'}),
        ('Republic of Haiti', 'haiti', 'Haiti', '#3a5ab0', {'en': 'Haiti'}),
    ]),
    # R7 (#407), sjunde omgången: Europa (Rysslands invasion av Ukraina)
    'ukraina': ('Ukraina', 'Ukraine', [
        ('Ukraine', 'ukraina', 'Ukraina', '#e0c040', {'wikidata': 'Q212'}),
    ]),
    'ryska-federationen': ('Ryska federationen', 'Russian Federation', [
        ('Russian Federation', 'ryska-federationen', 'Ryska federationen', '#7a5fa6'),
    ]),
    # Global täckning, nutida stater, första omgången (#644): de tio största luckorna år 2024 enligt
    # tools/tackning_riken.py. Kartan före fakta: bara gränser och namn (svenska namn ur Wikidata), utom
    # noterna om omstridda gränser (docs/omstridda-granser.md).
    'kina': ('Kina', 'China', [
        ('Republic of China', 'republiken-kina', 'Republiken Kina', '#c8423c',
         {'en': 'Republic of China', 'wikidata': 'Q13426199', 'years': (1912, 1949)}),
        ("People's Republic of China", 'folkrepubliken-kina', 'Kina', '#c8423c', {'en': 'China'}),
    ]),
    # Taiwan (#644, Rikards svar 5): Cliopatrias Republiken Kina efter 1949, under namnet Taiwan som regeringen använder
    'taiwan': ('Taiwan', 'Taiwan', [
        ('Republic of China', 'taiwan', 'Taiwan', '#d9905a', {'en': 'Taiwan', 'wikidata': 'Q865', 'years': (1950, 2024)}),
    ]),
    'kazakstan': ('Kazakstan', 'Kazakhstan', [
        ('Kazakhstan', 'kazakstan', 'Kazakstan', '#4aa3c8', {'en': 'Kazakhstan'}),
    ]),
    'algeriet': ('Algeriet', 'Algeria', [
        ("People's Democratic Republic of Algeria", 'algeriet', 'Algeriet', '#3f9a5c', {'en': 'Algeria'}),
    ]),
    # Cliopatria anger Q350186 (Kristofer II av Danmark) för Danmark; rätt id är Q35
    'danmark': ('Danmark', 'Denmark', [
        ('Denmark', 'danmark', 'Danmark', '#c0504d', {'en': 'Denmark', 'wikidata': 'Q35'}),
    ]),
    'indonesien': ('Indonesien', 'Indonesia', [
        ('Republic of Indonesia', 'indonesien', 'Indonesien', '#b04a7a', {'en': 'Indonesia'}),
    ]),
    'saudiarabien': ('Saudiarabien', 'Saudi Arabia', [
        ('Kingdom of Hejaz and Nejd', 'hijaz-och-najd', 'Kungariket Hijaz och Najd', '#8a7a2f',
         {'en': 'Kingdom of Nejd and Hejaz', 'wikidata': 'Q1756546'}),
        ('Kingdom of Saudi Arabia', 'saudiarabien', 'Saudiarabien', '#8a7a2f', {'en': 'Saudi Arabia'}),
    ]),
    # Sydsudan blev självständigt 9 juli 2011 (FN, un-member-south-sudan), men Cliopatria räknar Sydsudan till Sudan till och med
    # 2013 och har South Sudan först från 2014 (#1534). Åren 2011–2013 får Sudan sin egen gräns i Cliopatria 2014 och Sydsudan
    # sin gräns 2014 (fill), så att gränsen mellan länderna är densamma som 2014
    'sudan': ('Sudan', 'Sudan', [
        ('Republic of Sudan', 'sudan', 'Sudan', '#a0703a', {'en': 'Sudan', 'fill': [(2011, 2013, ('Republic of Sudan', 2014))]}),
    ]),
    # Cliopatria anger Q17435890 (Libyens historia under Gaddafi) för Libyska arabrepubliken; delen får Q1016
    'libyen': ('Libyen', 'Libya', [
        ('Kingdom of Libya', 'kungariket-libyen', 'Kungariket Libyen', '#5f7fb0', {'en': 'Kingdom of Libya'}),
        (['Libyan Arab Republic', 'State of Libya'], 'libyen', 'Libyen', '#5f7fb0', {'en': 'Libya', 'wikidata': 'Q1016'}),
    ]),
    # Bogd Khanate (#1331): Cliopatrias Great Mongol State 1912–1925, med Wikidatas id (Cliopatria anger Q7313, Yuandynastin).
    # Före 1945 följer kartan Cliopatria (docs/omstridda-granser.md); att staten knappt erkändes står i rutan Om kartan
    'mongoliet': ('Mongoliet', 'Mongolia', [
        ('Great Mongol State', 'bogd-khanate', 'Bogd Khanate', '#3a6fb0', {'en': 'Bogd Khanate of Mongolia', 'wikidata': 'Q2475921'}),
        ("Mongolian People's Republic", 'mongoliska-folkrepubliken', 'Mongoliska folkrepubliken', '#3a6fb0',
         {'en': "Mongolian People's Republic"}),
        ('Mongolia', 'mongoliet', 'Mongoliet', '#3a6fb0', {'en': 'Mongolia'}),
    ]),
    'tchad': ('Tchad', 'Chad', [
        ('Republic of Chad', 'tchad', 'Tchad', '#c9a050', {'en': 'Chad'}),
    ]),
    # Nutida stater, andra omgången (#644): nästa elva luckor år 2024 enligt tools/tackning_riken.py
    'angola': ('Angola', 'Angola', [
        ("People's Republic of Angola", 'angola', 'Angola', '#c05050', {'en': 'Angola'}),
    ]),
    # Cliopatria anger Q216632 (Malifederationen, 1959–1960) för Mali; rätt id är Q912
    'mali': ('Mali', 'Mali', [
        ('Mali Federation', 'mali', 'Mali', '#d4a24a', {'en': 'Mali', 'wikidata': 'Q912'}),
    ]),
    'sydafrika': ('Sydafrika', 'South Africa', [
        ('South Africa', 'sydafrika', 'Sydafrika', '#4f8a5a', {'en': 'South Africa'}),
    ]),
    'niger': ('Niger', 'Niger', [
        ('Republic of the Niger', 'niger', 'Niger', '#b0603a', {'en': 'Niger'}),
    ]),
    'mauretanien': ('Mauretanien', 'Mauritania', [
        ('Mauritania', 'mauretanien', 'Mauretanien', '#a86a9a', {'en': 'Mauritania'}),
    ]),
    'tanzania': ('Tanzania', 'Tanzania', [
        ('Tanzania', 'tanzania', 'Tanzania', '#5aa070', {'en': 'Tanzania'}),
    ]),
    'namibia': ('Namibia', 'Namibia', [
        ('Namibia', 'namibia', 'Namibia', '#5a9ab0', {'en': 'Namibia'}),
    ]),
    'mocambique': ('Moçambique', 'Mozambique', [
        ('Mozambique', 'mocambique', 'Moçambique', '#d0a040', {'en': 'Mozambique'}),
    ]),
    'turkiet': ('Turkiet', 'Turkey', [
        ('Republic of Turkey', 'turkiet', 'Turkiet', '#4a8ab0', {'en': 'Turkey'}),
    ]),
    'zambia': ('Zambia', 'Zambia', [
        ('Zambia', 'zambia', 'Zambia', '#8a6ab0', {'en': 'Zambia'}),
    ]),
    # Frankrike efter kolonialväldet (som slutar 1957 i gruppen franska-kolonialvaldet)
    'frankrike': ('Frankrike', 'France', [
        # Cliopatria räknar Algeriet, Djibouti och Kap Verde till Femte republiken 1961–2023, också de år då de är egna stater i
        # Cliopatria. Perioden delas när Kap Verde blir självständigt (1976), annars slås ändringen ihop med 1963–1975
        ('French Fifth Republic', 'femte-republiken', 'Frankrike', '#3a5fa0',
         {'en': 'France', 'minus': ["People's Democratic Republic of Algeria", 'Republic of Djibouti', 'Republic of Cabo Verde'],
          'splits': (1976,)}),
    ]),
    # Nutida stater, tredje omgången (#644). Spanien, Norge, Japan och Marocko väntar: de överlappar riken vi har
    # (Spanska imperiet, Sverige-Norge, Japanska imperiet) eller behöver noten om Västsahara
    'myanmar': ('Myanmar', 'Myanmar', [
        (['Burma', 'Union of Myanmar'], 'myanmar', 'Myanmar', '#a8649a', {'en': 'Myanmar', 'wikidata': 'Q836', 'years': (1948, 2024)}),
    ]),
    'somalia': ('Somalia', 'Somalia', [
        ('Federal Republic of Somalia', 'somalia', 'Somalia', '#4a90c0', {'en': 'Somalia'}),
    ]),
    'centralafrikanska-republiken': ('Centralafrikanska republiken', 'Central African Republic', [
        ('Central African Republic', 'centralafrikanska-republiken', 'Centralafrikanska republiken', '#7aa04a',
         {'en': 'Central African Republic'}),
    ]),
    'madagaskar': ('Madagaskar', 'Madagascar', [
        ('Madagascar', 'madagaskar', 'Madagaskar', '#9a6ab0', {'en': 'Madagascar'}),
    ]),
    'sydsudan': ('Sydsudan', 'South Sudan', [
        ('South Sudan', 'sydsudan', 'Sydsudan', '#c06a8a', {'en': 'South Sudan', 'fill': [(2011, 2013, ('South Sudan', 2014))]}),
    ]),
    'kenya': ('Kenya', 'Kenya', [
        ('Republic of Kenya', 'kenya', 'Kenya', '#b05050', {'en': 'Kenya'}),
    ]),
    'botswana': ('Botswana', 'Botswana', [
        ('Republic of Botswana', 'botswana', 'Botswana', '#d07a5a', {'en': 'Botswana'}),
    ]),
    # Siam före 1932 (#1330): Cliopatrias Rattanakosin Kingdom 1783–1931. Wikidata saknar svensk etikett; svenska Wikipedia
    # kallar landet Siam, och engelska Wikipedia säger att riket kallades Kingdom of Siam efter 1855
    'thailand': ('Thailand', 'Thailand', [
        ('Rattanakosin Kingdom', 'siam', 'Siam', '#4f9a9a', {'en': 'Siam'}),
        ('Kingdom of Thailand', 'thailand', 'Thailand', '#4f9a9a', {'en': 'Thailand'}),
    ]),
    'turkmenistan': ('Turkmenistan', 'Turkmenistan', [
        ('Turkmenistan', 'turkmenistan', 'Turkmenistan', '#9ab04a', {'en': 'Turkmenistan'}),
    ]),
    'kamerun': ('Kamerun', 'Cameroon', [
        ('Republic of Cameroon', 'kamerun', 'Kamerun', '#c05a3a', {'en': 'Cameroon'}),
    ]),
    # Nutida stater, fjärde omgången (#644). Spanien börjar 1932 (Spanska imperiet slutar 1931), Norge 1905
    # (unionen med Sverige slutar 1904) och Japan 1953 (Japanska imperiet slutar 1945; Cliopatria saknar 1946–1952)
    'spanien': ('Spanien', 'Spain', [
        ('Second Spanish Republic', 'andra-spanska-republiken', 'Andra spanska republiken', '#d07a3a', {'en': 'Second Spanish Republic'}),
        ('Francoist Spain', 'spanien-under-franco', 'Spanien under Franco', '#d07a3a',
         {'en': 'Francoist Spain', 'minus': ['Equatorial Guinea']}),
        ('Kingdom of Spain', 'spanien', 'Spanien', '#d07a3a', {'en': 'Spain', 'years': (1976, 2024)}),
    ]),
    # Cliopatria anger Q199841 (Sydjemen) för Jemen; rätt id är Q805. Nordjemen och Sydjemen 1919–1989 (#1332):
    # Cliopatrias "North Yemen" (1919–1989) delas vid revolutionen 1962 i kungariket och Arabrepubliken
    'jemen': ('Jemen', 'Yemen', [
        ('North Yemen', 'kungariket-jemen', 'Kungariket Jemen', '#4a8aa0',
         {'en': 'Kingdom of Yemen', 'wikidata': 'Q580188', 'years': (1919, 1961)}),
        ('North Yemen', 'arabrepubliken-jemen', 'Arabrepubliken Jemen', '#4a8aa0',
         {'en': 'Yemen Arab Republic', 'wikidata': 'Q267584', 'years': (1962, 1989)}),
        ("People's Democratic Republic of Yemen", 'sydjemen', 'Sydjemen', '#a0704a', {'en': 'South Yemen'}),
        ('Republic of Yemen', 'jemen', 'Jemen', '#4a8aa0', {'en': 'Yemen', 'wikidata': 'Q805'}),
    ]),
    # Norge 1814 (#1466, DasKrokodils ja 2026-11-14): Cliopatrias Kingdom of Norway 1814 är en egen kort period;
    # 1815–1904 är Norge en del av Sverige-Norge (gruppen svenska-stormaktsvaldet)
    'norge': ('Norge', 'Norway', [
        ('Kingdom of Norway', 'norge', 'Norge', '#2f8f7a', {'en': 'Norway', 'years': (1814, 2024)}),
    ]),
    'uzbekistan': ('Uzbekistan', 'Uzbekistan', [
        ('Republic of Uzbekistan', 'uzbekistan', 'Uzbekistan', '#c0705a', {'en': 'Uzbekistan'}),
    ]),
    # Cliopatria anger Q188712 (Kejsardömet Japan) för Japan efter 1953; rätt id är Q17
    'japan': ('Japan', 'Japan', [
        ('Japan', 'japan', 'Japan', '#e07a8a', {'en': 'Japan', 'wikidata': 'Q17'}),
    ]),
    # Marocko 1670–1911 och från 1956; däremellan ingår landet i franska kolonialväldet. Västsahara hör inte till
    # Marocko i Cliopatria, vilket stämmer med att Sverige inte har uttalat vem området tillhör (docs/omstridda-granser.md)
    'marocko': ('Marocko', 'Morocco', [
        ('Morocco', 'marocko', 'Marocko', '#b0503a', {'en': 'Morocco'}),
    ]),
    # Rhodesia och Zimbabwe-Rhodesia (#1332). Cliopatria har Zimbabwe-Rhodesia 1979–1982; källorna låter Zimbabwe börja
    # 18 april 1980, så Zimbabwe ritas 1980–1982 med Zimbabwe-Rhodesias gräns, som är densamma som Zimbabwes 1983
    'zimbabwe': ('Zimbabwe', 'Zimbabwe', [
        ('Rhodesia', 'rhodesia', 'Rhodesia', '#9a4a6a', {'en': 'Rhodesia'}),
        ('Zimbabwe Rhodesia', 'zimbabwe-rhodesia', 'Zimbabwe-Rhodesia', '#9a4a6a', {'en': 'Zimbabwe Rhodesia', 'years': (1979, 1979)}),
        ('Republic of Zimbabwe', 'zimbabwe', 'Zimbabwe', '#9a4a6a', {'en': 'Zimbabwe', 'fill': [(1980, 1982, ('Zimbabwe Rhodesia', 1979))]}),
    ]),
    'tyskland': ('Tyskland', 'Germany', [
        ('Federated Republic of Germany', 'tyskland', 'Tyskland', '#c8b04a', {'en': 'Germany'}),
    ]),
    'malaysia': ('Malaysia', 'Malaysia', [
        # Cliopatria har Singapore i Malaysia 1963–1966; perioden delas 1967, annars slås den ihop med åren efter
        ('Malaysia', 'malaysia', 'Malaysia', '#d08a4a', {'en': 'Malaysia', 'splits': (1967,)}),
    ]),
    # Cliopatria anger Q974 (Kongo-Kinshasa) för Kongo-Brazzaville; rätt id är Q971
    'kongo-brazzaville': ('Kongo-Brazzaville', 'Republic of the Congo', [
        ('Republic of the Congo', 'kongo-brazzaville', 'Kongo-Brazzaville', '#c07aa0', {'en': 'Republic of the Congo', 'wikidata': 'Q971'}),
    ]),
    # Nutida stater, femte omgången (#644). Storbritannien väntar: det är moderlandet i Brittiska imperiet
    'filippinerna': ('Filippinerna', 'Philippines', [
        ('Republic of the Philippines', 'filippinerna', 'Filippinerna', '#5a8ac8', {'en': 'Philippines'}),
    ]),
    'finland': ('Finland', 'Finland', [
        ('Republic of Finland', 'finland', 'Finland', '#d0708a', {'en': 'Finland'}),
    ]),
    'elfenbenskusten': ('Elfenbenskusten', 'Ivory Coast', [
        ("Republic of Côte d'Ivoire", 'elfenbenskusten', 'Elfenbenskusten', '#5aa06a', {'en': 'Ivory Coast'}),
    ]),
    # Fria staden Danzig 1920–1939 (#1746): under Nationernas förbunds skydd från 15 november 1920 till annekteringen
    # 1 september 1939 (Wikidata Q216173, en.wikipedia "Free City of Danzig"). Cliopatrias post har också fristaden under
    # Napoleon 1809–1811, som inte är med, och räknar Memelområdet dit 1919–1935 (borttaget i DISPUTED)
    'fria-staden-danzig': ('Fria staden Danzig', 'Free City of Danzig', [
        ('Free City of Danzig', 'fria-staden-danzig', 'Fria staden Danzig', '#b8864a',
         {'en': 'Free City of Danzig', 'wikidata': 'Q216173', 'years': (1920, 1939)}),
    ]),
    # Cliopatria saknar Polen 1940–1952; 1945–1952 visas Polen med gränsen 1953 (#1730)
    'polen': ('Polen', 'Poland', [
        ('Second Polish Republic', 'andra-polska-republiken', 'Andra polska republiken', '#c04050', {'en': 'Second Polish Republic'}),
        # 1945–1952 med gränsen 1953 (#1730, #1332): Cliopatria räknar landet till Sovjetunionen de åren
        ('Republic of Poland', 'polen', 'Polen', '#c04050', {'en': 'Poland', 'fill': [(1945, 1952, ('Republic of Poland', 1953))]}),
    ]),
    # Oman 1744–1899 och från 1973, Muskat och Oman 1900–1955. Cliopatria saknar Muskat och Oman 1947–1955 och har i
    # stället en post "Qatar Protectorate" med exakt samma gräns som Muskat och Oman 1946; de åren ritas Muskat och Oman
    # med sin egen gräns 1946 (#1332). Från 1956 till 1972 räknar Cliopatria landet till Brittiska imperiet
    'oman': ('Oman', 'Oman', [
        ('Sultanate of Oman', 'oman', 'Oman', '#c07a5a', {'en': 'Oman'}),
        ('Sultanate of Muscat and Oman', 'muskat-och-oman', 'Muskat och Oman', '#c07a5a',
         {'en': 'Muscat and Oman', 'fill': [(1947, 1955, ('Sultanate of Muscat and Oman', 1946))]}),
    ]),
    # Cliopatrias "Kingdom of Italy" har också med det medeltida kungariket (936–969); här bara 1862–1945
    'italien': ('Italien', 'Italy', [
        ('Kingdom of Italy', 'kungariket-italien', 'Kungariket Italien', '#4aa070', {'en': 'Kingdom of Italy', 'years': (1862, 1945)}),
        ('Republic of Italy', 'italien', 'Italien', '#4aa070', {'en': 'Italy'}),
    ]),
    'burkina-faso': ('Burkina Faso', 'Burkina Faso', [
        ('Burkina Faso', 'burkina-faso', 'Burkina Faso', '#3a8ab0', {'en': 'Burkina Faso'}),
    ]),
    'gabon': ('Gabon', 'Gabon', [
        ('Gabon', 'gabon', 'Gabon', '#4aa0a0', {'en': 'Gabon'}),
    ]),
    # Cliopatria anger Q983 (Ekvatorialguinea) för Guinea; rätt id är Q1006
    'guinea': ('Guinea', 'Guinea', [
        ('Guinea', 'guinea', 'Guinea', '#a07ac0', {'en': 'Guinea', 'wikidata': 'Q1006'}),
    ]),
    'ghana': ('Ghana', 'Ghana', [
        ('Ghana', 'ghana', 'Ghana', '#c05a5a', {'en': 'Ghana'}),
    ]),
    # Nutida stater, sjätte omgången (#644)
    # Cliopatria anger Q203493 (Kungariket Rumänien) också för Rumänien efter 1989; rätt id är Q218
    'rumanien': ('Rumänien', 'Romania', [
        ('Kingdom of Romania', 'kungariket-rumanien', 'Kungariket Rumänien', '#3a8a9a', {'en': 'Kingdom of Romania'}),
        ('Socialist Republic of Romania', 'socialistiska-republiken-rumanien', 'Socialistiska republiken Rumänien', '#3a8a9a',
         {'en': 'Socialist Republic of Romania'}),
        ('Romania', 'rumanien', 'Rumänien', '#3a8a9a', {'en': 'Romania', 'wikidata': 'Q218'}),
    ]),
    'laos': ('Laos', 'Laos', [
        ('Kingdom of Laos', 'kungariket-laos', 'Kungariket Laos', '#4a9ad0', {'en': 'Kingdom of Laos'}),
        ('Communist Laos', 'laos', 'Laos', '#4a9ad0', {'en': 'Laos'}),
    ]),
    'guyana': ('Guyana', 'Guyana', [
        ('Guyana', 'guyana', 'Guyana', '#4aa06a', {'en': 'Guyana'}),
    ]),
    'belarus': ('Belarus', 'Belarus', [
        ('Republic of Belarus', 'belarus', 'Belarus', '#b0603a', {'en': 'Belarus'}),
    ]),
    'senegal': ('Senegal', 'Senegal', [
        ('Republic of Senegal', 'senegal', 'Senegal', '#3a9a7a', {'en': 'Senegal'}),
    ]),
    'kirgizistan': ('Kirgizistan', 'Kyrgyzstan', [
        ('Kyrgyzstan', 'kirgizistan', 'Kirgizistan', '#c04a6a', {'en': 'Kyrgyzstan'}),
    ]),
    # Kungariket Kambodja 1956–1975 och från 1996; däremellan Cliopatrias Röda khmererna och Folkrepubliken Kampuchea
    'kambodja': ('Kambodja', 'Cambodia', [
        ('Kingdom of Cambodia', 'kambodja', 'Kambodja', '#7a6ab0', {'en': 'Cambodia'}),
        ('Khmer Rouge', 'roda-khmererna', 'Röda khmererna', '#7a6ab0', {'en': 'Khmer Rouge'}),
        ("People's Republic of Kampuchea", 'folkrepubliken-kampuchea', 'Folkrepubliken Kampuchea', '#7a6ab0',
         {'en': "People's Republic of Kampuchea"}),
    ]),
    'tunisien': ('Tunisien', 'Tunisia', [
        ('Republic of Tunisia', 'tunisien', 'Tunisien', '#c06a3a', {'en': 'Tunisia'}),
    ]),
    'nepal': ('Nepal', 'Nepal', [
        ('Nepal', 'nepal', 'Nepal', '#8a5ab0', {'en': 'Nepal'}),
    ]),
    # Surinam före 1976 (#1332): Cliopatria räknar Surinam 1820–1975 till posten "Netherlands Antilles", vars del på
    # fastlandet har samma gräns som Surinam 1976. De åren ritas Surinam med gränsen 1976: kolonin till 1954 och landet
    # inom kungariket Nederländerna från stadgan i december 1954 till självständigheten 25 november 1975
    'surinam': ('Surinam', 'Suriname', [
        ('Republic of Suriname', 'kolonin-surinam', 'Kolonin Surinam', '#c0703a',
         {'en': 'Surinam (Dutch colony)', 'wikidata': 'Q7646305', 'fill': [(1820, 1954, ('Republic of Suriname', 1976))],
          'years': (1820, 1954)}),
        ('Republic of Suriname', 'surinam-i-kungariket', 'Surinam inom kungariket Nederländerna', '#c0703a',
         {'en': 'Suriname in the Kingdom of the Netherlands', 'wikidata': 'Q19901436', 'years': (1955, 1975),
          'fill': [(1955, 1975, ('Republic of Suriname', 1976))]}),
        ('Republic of Suriname', 'surinam', 'Surinam', '#c0703a', {'en': 'Suriname'}),
    ]),
    # Nutida stater, sjunde omgången (#644)
    'tadzjikistan': ('Tadzjikistan', 'Tajikistan', [
        ('Republic of Tajikistan', 'tadzjikistan', 'Tadzjikistan', '#5a9ac0', {'en': 'Tajikistan'}),
    ]),
    'nicaragua': ('Nicaragua', 'Nicaragua', [
        ('Republic of Nicaragua', 'nicaragua', 'Nicaragua', '#4a8ab0', {'en': 'Nicaragua'}),
    ]),
    'eritrea': ('Eritrea', 'Eritrea', [
        ('State of Eritrea', 'eritrea', 'Eritrea', '#6aa04a', {'en': 'Eritrea'}),
    ]),
    'kuba': ('Kuba', 'Cuba', [
        (['Republic of Cuba', 'Communist Cuba'], 'kuba', 'Kuba', '#c05050', {'en': 'Cuba', 'wikidata': 'Q241'}),
    ]),
    # Cliopatria kallar Grekland 1822–1940 "First Hellenic Republic", fast Wikidata bara använder namnet för 1822–1833;
    # posterna slås därför ihop till Grekland (Q41)
    'grekland': ('Grekland', 'Greece', [
        (['First Hellenic Republic', 'Kingdom of Greece', 'Greek junta', 'Third Hellenic Republic'], 'grekland', 'Grekland',
         '#b05a8a', {'en': 'Greece', 'wikidata': 'Q41'}),
    ]),
    'benin': ('Benin', 'Benin', [
        ('Republic of Benin', 'benin', 'Benin', '#c08a3a', {'en': 'Benin'}),
    ]),
    'honduras': ('Honduras', 'Honduras', [
        ('Honduras', 'honduras', 'Honduras', '#c0704a', {'en': 'Honduras'}),
    ]),
    'island': ('Island', 'Iceland', [
        ('Kingdom of Iceland', 'kungariket-island', 'Kungariket Island', '#5a8ab0', {'en': 'Kingdom of Iceland'}),
        ('Republic of Iceland', 'island', 'Island', '#5a8ab0', {'en': 'Iceland'}),
    ]),
    # Cliopatria kallar Bulgarien 1880–1944 "Principality of Bulgaria" (furstendömet fanns till 1908 enligt Wikidata),
    # och anger folkrepublikens id också för republiken; posterna slås ihop till Bulgarien (Q219)
    'bulgarien': ('Bulgarien', 'Bulgaria', [
        (['Principality of Bulgaria', 'Kingdom of Bulgaria', "People's Republic of Bulgaria", 'Republic of Bulgaria'],
         'bulgarien', 'Bulgarien', '#4aa070', {'en': 'Bulgaria', 'wikidata': 'Q219'}),
    ]),
    'guatemala': ('Guatemala', 'Guatemala', [
        ('Guatemala', 'guatemala', 'Guatemala', '#8a6ab0', {'en': 'Guatemala'}),
    ]),
    # Nutida stater, åttonde omgången (#644)
    'liberia': ('Liberia', 'Liberia', [
        ('Republic of Liberia', 'liberia', 'Liberia', '#3a8ab0', {'en': 'Liberia'}),
    ]),
    # Bara från 1976: Cliopatrias Portuguese Republic 1911–1925 omfattar också kolonierna
    'portugal': ('Portugal', 'Portugal', [
        ('Portugal', 'portugal', 'Portugal', '#4aa070', {'en': 'Portugal'}),
    ]),
    'malawi': ('Malawi', 'Malawi', [
        ('Malawi', 'malawi', 'Malawi', '#c05a5a', {'en': 'Malawi'}),
    ]),
    # Cliopatrias tre poster (republiken 1919–1943, Hungary och folkrepubliken) överlappar inte; Cliopatria anger
    # Q28513 (Österrike-Ungern) för Hungary, rätt id är Q28
    'ungern': ('Ungern', 'Hungary', [
        (['Hungarian Republic', 'Hungary', "Hungarian People's Republic"], 'ungern', 'Ungern', '#c0703a',
         {'en': 'Hungary', 'wikidata': 'Q28'}),
    ]),
    # Cliopatria anger Q187830 (Österrikes historia) för andra republiken; rätt id är Q40
    'osterrike': ('Österrike', 'Austria', [
        (['Republic of Austria', 'Second Republic of Austria'], 'osterrike', 'Österrike', '#c04050', {'en': 'Austria', 'wikidata': 'Q40'}),
    ]),
    'panama': ('Panama', 'Panama', [
        ('Republic of Panama', 'panama', 'Panama', '#5a9ac0', {'en': 'Panama'}),
    ]),
    'tjeckien': ('Tjeckien', 'Czech Republic', [
        ('Czech Republic', 'tjeckien', 'Tjeckien', '#5a6ab0', {'en': 'Czech Republic'}),
    ]),
    'forenade-arabemiraten': ('Förenade arabemiraten', 'United Arab Emirates', [
        ('United Arab Emirates', 'forenade-arabemiraten', 'Förenade arabemiraten', '#3a9a7a', {'en': 'United Arab Emirates'}),
    ]),
    # Cliopatria kallar 1992–2005 "Serbia-Montenegro", men staten hette Förbundsrepubliken Jugoslavien till 4 februari
    # 2003 enligt Wikidata och Wikipedia; posten delas därför 2003 (#1332). Cliopatria räknar de serbiska områdena i
    # Kroatien och Bosnien och Hercegovina till staten 1992–1995; de åren ritas den med sin egen gräns 1996 (beslut
    # 2026-11-13, ockupation och inbördeskrig). Kosovo ingår inte i Serbien i Cliopatria efter 1999, som Rikard beslutade
    # (docs/omstridda-granser.md)
    'serbien': ('Serbien', 'Serbia', [
        ('Serbia-Montenegro', 'forbundsrepubliken-jugoslavien', 'Förbundsrepubliken Jugoslavien', '#8a5ab0',
         {'en': 'Federal Republic of Yugoslavia', 'wikidata': 'Q838261', 'years': (1992, 2002),
          'fill': [(1992, 1995, ('Serbia-Montenegro', 1996))]}),
        ('Serbia-Montenegro', 'serbien-och-montenegro', 'Serbien och Montenegro', '#8a5ab0',
         {'en': 'Serbia and Montenegro', 'wikidata': 'Q37024', 'years': (2003, 2005)}),
        ('Republic of Serbia', 'serbien', 'Serbien', '#8a5ab0', {'en': 'Serbia'}),
    ]),
    # Irländska fristaten 1922–1937 och Éire slås ihop till Irland (Q27)
    'irland': ('Irland', 'Ireland', [
        (['Irish Free State', 'Éire'], 'irland', 'Irland', '#5aa060', {'en': 'Ireland', 'wikidata': 'Q27'}),
    ]),
    # Nutida stater, nionde omgången (#644). Azerbajdzjan väntar på lösningen för Nagorno-Karabach (tas med Armenien)
    'sierra-leone': ('Sierra Leone', 'Sierra Leone', [
        ('Sierra Leone', 'sierra-leone', 'Sierra Leone', '#c06a3a', {'en': 'Sierra Leone'}),
    ]),
    'sri-lanka': ('Sri Lanka', 'Sri Lanka', [
        ('Sri Lanka', 'sri-lanka', 'Sri Lanka', '#c05a5a', {'en': 'Sri Lanka'}),
    ]),
    'lettland': ('Lettland', 'Latvia', [
        ('Republic of Latvia', 'lettland', 'Lettland', '#a04a5a', {'en': 'Latvia'}),
    ]),
    # Cliopatria kallar Litauen 1919–1939 "Kingdom of Lithuania" med id:t för det medeltida kungariket (Q1656775);
    # posterna slås ihop till Litauen (Q37)
    'litauen': ('Litauen', 'Lithuania', [
        (['Kingdom of Lithuania', 'Republic of Lithuania'], 'litauen', 'Litauen', '#4aa0a0', {'en': 'Lithuania', 'wikidata': 'Q37'}),
    ]),
    'togo': ('Togo', 'Togo', [
        ('Togo', 'togo', 'Togo', '#5aa070', {'en': 'Togo'}),
    ]),
    'costa-rica': ('Costa Rica', 'Costa Rica', [
        ('Republic of Costa Rica', 'costa-rica', 'Costa Rica', '#c07a4a', {'en': 'Costa Rica'}),
    ]),
    'dominikanska-republiken': ('Dominikanska republiken', 'Dominican Republic', [
        ('Dominican Republic', 'dominikanska-republiken', 'Dominikanska republiken', '#3a8a7a', {'en': 'Dominican Republic'}),
    ]),
    # Bara från 1992; Cliopatrias Independent State of Croatia 1941–1944 är inte med. Under kriget 1992–1995 ritar Cliopatria
    # delar av Kroatien och Bosnien och Hercegovina som Förbundsrepubliken Jugoslavien (och delar av Bosnien som Kroatien);
    # de åren ritas länderna med sin egen gräns 1996 (#1332, beslut 2026-11-13, ockupation och inbördeskrig)
    'kroatien': ('Kroatien', 'Croatia', [
        ('Republic of Croatia', 'kroatien', 'Kroatien', '#c04a6a', {'en': 'Croatia', 'fill': [(1992, 1995, ('Republic of Croatia', 1996))]}),
    ]),
    'bosnien-och-hercegovina': ('Bosnien och Hercegovina', 'Bosnia and Herzegovina', [
        ('Bosnia and Herzegovina', 'bosnien-och-hercegovina', 'Bosnien och Hercegovina', '#4a7ac0',
         {'en': 'Bosnia and Herzegovina', 'fill': [(1992, 1995, ('Bosnia and Herzegovina', 1996))]}),
    ]),
    'estland': ('Estland', 'Estonia', [
        (['Estonia', 'Republic of Estonia'], 'estland', 'Estland', '#3a8ab0', {'en': 'Estonia', 'wikidata': 'Q191'}),
    ]),
    # Nutida stater, tionde omgången (#644)
    'azerbajdzjan': ('Azerbajdzjan', 'Azerbaijan', [
        ('Republic of Azerbaijan', 'azerbajdzjan', 'Azerbajdzjan', '#3a9ab0', {'en': 'Azerbaijan'}),
    ]),
    'armenien': ('Armenien', 'Armenia', [
        ('Republic of Armenia', 'armenien', 'Armenien', '#c06a4a', {'en': 'Armenia'}),
    ]),
    # Bara från 1918: Cliopatrias "Georgia" har också med ett medeltida rike (947–1009). Cliopatria anger Q4962
    # (en förgreningssida); rätt id är Q230
    'georgien': ('Georgien', 'Georgia', [
        ('Georgia', 'georgien', 'Georgien', '#a04a7a', {'en': 'Georgia', 'wikidata': 'Q230', 'years': (1918, 2024)}),
    ]),
    # Cliopatria anger Q33946 (Tjeckoslovakien) för Slovakien; rätt id är Q214
    'slovakien': ('Slovakien', 'Slovakia', [
        ('Slovakia', 'slovakien', 'Slovakien', '#4aa070', {'en': 'Slovakia', 'wikidata': 'Q214'}),
    ]),
    'bhutan': ('Bhutan', 'Bhutan', [
        ('Kingdom of Bhutan', 'bhutan', 'Bhutan', '#c0703a', {'en': 'Bhutan'}),
    ]),
    # Från 1648: före dess räknar Cliopatria Edsförbundet också till Tysk-romerska riket
    'schweiz': ('Schweiz', 'Switzerland', [
        ('Swiss Confederation', 'schweiz', 'Schweiz', '#c04040', {'en': 'Switzerland', 'years': (1648, 2024)}),
    ]),
    # Från 1950: före dess ingår Nederländerna i nederländska kolonialväldet
    'nederlanderna': ('Nederländerna', 'Netherlands', [
        ('Netherlands', 'nederlanderna', 'Nederländerna', '#d0803a', {'en': 'Netherlands', 'years': (1950, 2024)}),
    ]),
    'salomonoarna': ('Salomonöarna', 'Solomon Islands', [
        ('Solomon Islands', 'salomonoarna', 'Salomonöarna', '#4a8ac0', {'en': 'Solomon Islands'}),
    ]),
    'guinea-bissau': ('Guinea-Bissau', 'Guinea-Bissau', [
        ('Republic of Guinea-Bissau', 'guinea-bissau', 'Guinea-Bissau', '#c0a04a', {'en': 'Guinea-Bissau'}),
    ]),
    'lesotho': ('Lesotho', 'Lesotho', [
        ('Lesotho', 'lesotho', 'Lesotho', '#6a5ab0', {'en': 'Lesotho'}),
    ]),
    # Nutida stater, elfte omgången (#644)
    # Storbritannien från 2000, när Brittiska imperiet slutar (gruppen brittiska-imperiet, där Kingdom of Great Britain är
    # moderlandet). Cliopatria anger Q23666 (ön Storbritannien); här Q145, Förenade kungariket
    'storbritannien': ('Storbritannien', 'United Kingdom', [
        ('Kingdom of Great Britain', 'storbritannien', 'Storbritannien', '#c2557a',
         {'en': 'United Kingdom', 'wikidata': 'Q145', 'years': (2000, 2024),
          # Cliopatria räknar Oman, Qatar och Förenade arabemiraten till Storbritannien 2000–2023, samtidigt som de är
          # egna länder i Cliopatria (år 2024 har posten bara de brittiska öarna)
          'minus': ['Sultanate of Oman', 'State of Qatar', 'United Arab Emirates', 'Kingdom of Bahrain']}),
    ]),
    'belgien': ('Belgien', 'Belgium', [
        ('Kingdom of Belgium', 'belgien', 'Belgien', '#a04a7a', {'en': 'Belgium'}),
    ]),
    'ekvatorialguinea': ('Ekvatorialguinea', 'Equatorial Guinea', [
        ('Equatorial Guinea', 'ekvatorialguinea', 'Ekvatorialguinea', '#c05a5a', {'en': 'Equatorial Guinea'}),
    ]),
    # Cliopatria anger Q467864 (Socialistiska folkrepubliken Albanien) också efter 1991; rätt id är Q222.
    # Albanien 1912–1945 och folkrepubliken 1946–1990 (#1332), som i Cliopatria
    'albanien': ('Albanien', 'Albania', [
        ('Albania', 'albanien-1912', 'Albanien', '#c04a4a', {'en': 'Albania'}),
        ("People's Socialist Republic of Albania", 'socialistiska-folkrepubliken-albanien', 'Socialistiska folkrepubliken Albanien',
         '#c04a4a', {'en': "People's Socialist Republic of Albania"}),
        ('Republic of Albania', 'albanien', 'Albanien', '#c04a4a', {'en': 'Albania', 'wikidata': 'Q222'}),
    ]),
    'moldavien': ('Moldavien', 'Moldova', [
        ('Republic of Moldova', 'moldavien', 'Moldavien', '#5a7ab0', {'en': 'Moldova'}),
    ]),
    'nordmakedonien': ('Nordmakedonien', 'North Macedonia', [
        ('Former Yugoslav Republic of Macedonia', 'nordmakedonien', 'Nordmakedonien', '#d0803a', {'en': 'North Macedonia'}),
    ]),
    'burundi': ('Burundi', 'Burundi', [
        ('Republic of Burundi', 'burundi', 'Burundi', '#4aa070', {'en': 'Burundi'}),
    ]),
    'belize': ('Belize', 'Belize', [
        ('Belize', 'belize', 'Belize', '#4a8ab0', {'en': 'Belize'}),
    ]),
    'djibouti': ('Djibouti', 'Djibouti', [
        ('Republic of Djibouti', 'djibouti', 'Djibouti', '#5aa0a0', {'en': 'Djibouti'}),
    ]),
    'el-salvador': ('El Salvador', 'El Salvador', [
        ('Republic of El Salvador', 'el-salvador', 'El Salvador', '#5a6ab0', {'en': 'El Salvador'}),
    ]),
    # Nutida stater, tolfte omgången (#644). Östtimor väntar: Cliopatria räknar landet till Indonesien till och med 2005
    'fiji': ('Fiji', 'Fiji', [
        ('Republic of Fiji', 'fiji', 'Fiji', '#4a9ab0', {'en': 'Fiji'}),
    ]),
    'slovenien': ('Slovenien', 'Slovenia', [
        ('Republic of Slovenia', 'slovenien', 'Slovenien', '#4a7ab0', {'en': 'Slovenia'}),
    ]),
    'bahamas': ('Bahamas', 'The Bahamas', [
        ('Commonwealth of The Bahamas', 'bahamas', 'Bahamas', '#3aa0b0', {'en': 'The Bahamas'}),
    ]),
    # Wikidatas svenska etikett är Swaziland; Eswatini är dess svenska alias och Cliopatrias namn
    'eswatini': ('Eswatini', 'Eswatini', [
        ('Eswatini', 'eswatini', 'Eswatini', '#5a8a4a', {'en': 'Eswatini'}),
    ]),
    'vanuatu': ('Vanuatu', 'Vanuatu', [
        ('Vanuatu', 'vanuatu', 'Vanuatu', '#a07a3a', {'en': 'Vanuatu'}),
    ]),
    'jamaica': ('Jamaica', 'Jamaica', [
        ('Jamaica', 'jamaica', 'Jamaica', '#4aa060', {'en': 'Jamaica'}),
    ]),
    'qatar': ('Qatar', 'Qatar', [
        ('State of Qatar', 'qatar', 'Qatar', '#8a3a5a', {'en': 'Qatar'}),
    ]),
    'gambia': ('Gambia', 'The Gambia', [
        ('Republic of The Gambia', 'gambia', 'Gambia', '#c07a4a', {'en': 'The Gambia'}),
    ]),
    # Cliopatria anger Q139708 (Franska mandatet för Syrien och Libanon) också efter 1944; rätt id är Q822
    'libanon': ('Libanon', 'Lebanon', [
        ('Lebanon', 'libanon', 'Libanon', '#3a8a5a', {'en': 'Lebanon', 'wikidata': 'Q822'}),
    ]),
    'kap-verde': ('Kap Verde', 'Cape Verde', [
        ('Republic of Cabo Verde', 'kap-verde', 'Kap Verde', '#3a6aa0', {'en': 'Cape Verde'}),
    ]),
    # Nutida stater, trettonde omgången (#644)
    # Kosovo som stat från självständighetsförklaringen 2008 (Rikards beslut, fall 8 i docs/omstridda-granser.md);
    # Cliopatria har Kosovo redan från 2000, och 2000–2007 visas området utan stat
    'kosovo': ('Kosovo', 'Kosovo', [
        ('Kosovo', 'kosovo', 'Kosovo', '#4a6ab0', {'en': 'Kosovo', 'years': (2008, 2024)}),
    ]),
    # Hela ön ritas som Cypern (Rikards beslut, fall 5): Norra Cypern läggs till ur DISPUTED
    'cypern': ('Cypern', 'Cyprus', [
        ('Republic of Cyprus', 'cypern', 'Cypern', '#c08a3a', {'en': 'Cyprus'}),
    ]),
    # Bara från 2006: Cliopatrias Montenegro har också furstendömet och kungariket 1853–1915
    'montenegro': ('Montenegro', 'Montenegro', [
        ('Montenegro', 'montenegro', 'Montenegro', '#b04a4a', {'en': 'Montenegro', 'years': (2006, 2024)}),
    ]),
    # Bara från 1987, Cliopatrias nutida post (Cliopatria har sultanatet 1363–1889 och inget 1890–1986). Cliopatria anger
    # Q887803 (det historiska sultanatet); rätt id för landet är Q921
    'brunei': ('Brunei', 'Brunei', [
        ('Sultanate of Brunei', 'brunei', 'Brunei', '#c0a03a', {'en': 'Brunei', 'wikidata': 'Q921', 'years': (1987, 2024)}),
    ]),
    'trinidad-och-tobago': ('Trinidad och Tobago', 'Trinidad and Tobago', [
        ('Republic of Trinidad and Tobago', 'trinidad-och-tobago', 'Trinidad och Tobago', '#b04a5a', {'en': 'Trinidad and Tobago'}),
    ]),
    'mauritius': ('Mauritius', 'Mauritius', [
        ('Mauritius', 'mauritius', 'Mauritius', '#5a6ab0', {'en': 'Mauritius'}),
    ]),
    # Cliopatria anger Q2719360 (det medeltida hertigdömet); rätt id är Q32
    'luxemburg': ('Luxemburg', 'Luxembourg', [
        ('Luxembourg', 'luxemburg', 'Luxemburg', '#5a9ac0', {'en': 'Luxembourg', 'wikidata': 'Q32'}),
    ]),
    'sao-tome-och-principe': ('São Tomé och Príncipe', 'São Tomé and Príncipe', [
        ('São Tomé and Príncipe', 'sao-tome-och-principe', 'São Tomé och Príncipe', '#4aa070', {'en': 'São Tomé and Príncipe'}),
    ]),
    'bahrain': ('Bahrain', 'Bahrain', [
        ('Kingdom of Bahrain', 'bahrain', 'Bahrain', '#b04a6a', {'en': 'Bahrain'}),
    ]),
    'singapore': ('Singapore', 'Singapore', [
        ('Republic of Singapore', 'singapore', 'Singapore', '#c05a5a', {'en': 'Singapore'}),
    ]),
    # Nutida stater, fjortonde omgången (#644). Saint Kitts och Nevis väntar: Cliopatrias "Saint Kitts" ligger på ön
    # Saint Croix i Amerikanska Jungfruöarna, och Mikronesiska federationen har bara ön Pohnpei i Cliopatria. Andorra väntar:
    # Spaniens och Frankrikes förenklade gränser täcker nästan hela landet
    'malta': ('Malta', 'Malta', [
        ('Malta', 'malta', 'Malta', '#c04a4a', {'en': 'Malta'}),
    ]),
    'barbados': ('Barbados', 'Barbados', [
        ('Barbados', 'barbados', 'Barbados', '#3a6ab0', {'en': 'Barbados'}),
    ]),
    'dominica': ('Dominica', 'Dominica', [
        ('Commonwealth of Dominica', 'dominica', 'Dominica', '#4a9a5a', {'en': 'Dominica'}),
    ]),
    'saint-lucia': ('Saint Lucia', 'Saint Lucia', [
        ('Saint Lucia', 'saint-lucia', 'Saint Lucia', '#4a8ab0', {'en': 'Saint Lucia'}),
    ]),
    'antigua-och-barbuda': ('Antigua och Barbuda', 'Antigua and Barbuda', [
        ('Antigua and Barbuda', 'antigua-och-barbuda', 'Antigua och Barbuda', '#c05a4a', {'en': 'Antigua and Barbuda'}),
    ]),
    'saint-vincent-och-grenadinerna': ('Saint Vincent och Grenadinerna', 'Saint Vincent and the Grenadines', [
        ('Saint Vincent', 'saint-vincent-och-grenadinerna', 'Saint Vincent och Grenadinerna', '#5aa07a',
         {'en': 'Saint Vincent and the Grenadines'}),
    ]),
    'grenada': ('Grenada', 'Grenada', [
        ('Grenada', 'grenada', 'Grenada', '#c08a3a', {'en': 'Grenada'}),
    ]),
    'seychellerna': ('Seychellerna', 'Seychelles', [
        ('Seychelles', 'seychellerna', 'Seychellerna', '#3a8a9a', {'en': 'Seychelles'}),
    ]),
    'palau': ('Palau', 'Palau', [
        ('Palau', 'palau', 'Palau', '#5a7ac0', {'en': 'Palau'}),
    ]),
    # Nutida stater, femtonde omgången (#644). Etiopien efter kejsardömet: Cliopatrias Ethiopia från 1975
    # (Etiopiska kejsardömet tar posten till och med 1974)
    'etiopien': ('Etiopien', 'Ethiopia', [
        ('Ethiopia', 'etiopien', 'Etiopien', '#5a9a4a', {'en': 'Ethiopia', 'years': (1975, 2024)}),
    ]),
    # Östtimor (Rikards beslut om nutida omstridda gränser, #556): självständigt från 2002 (UD, FN:s UNTAET).
    # Cliopatria har landet från 2006 och räknar det till Indonesien 1976–2005; åren 2002–2005 får gränsen ur
    # DISPUTED ('osttimor'), och 1976–2001 räknas området inte till Indonesien
    'osttimor': ('Östtimor', 'Timor-Leste', [
        ('East Timor', 'osttimor', 'Östtimor', '#c0804a', {'en': 'Timor-Leste', 'prepend': (2002, 2005)}),
    ]),
    # Medeltidens luckor, första omgången (#645): de tio största luckorna 1000–1200 enligt tools/tackning_riken.py, med
    # undantag av Tibetans (Cliopatrias post pekar på folkgruppen Tibetaner, Q187985, inte på en stat; kvar till nästa omgång).
    # Svenska namn är Wikidatas svenska etiketter; Kimek-Kipchak saknar svenskt namn och får Cliopatrias engelska.
    # Cliopatria anger fel Wikidata-id för Kingdom of France (Q207162, Bourbonska restaurationen; rätt är Q70972) och Old Kingdom of
    # Norway (Q202266, Margareta I; rätt är Q2196956, Norgesväldet), kontrollerat mot Wikidata 2026-11-07.
    'kimek-kipchak': ('Kimek-Kipchak confederation', 'Kimek-Kipchak confederation', [
        ('Kimek-Kipchak confederation', 'kimek-kipchak', 'Kimek-Kipchak confederation', '#b89a4a', {'en': 'Kimek-Kipchak confederation'}),
    ]),
    'ghaznaviderna': ('Ghaznaviderna', 'Ghaznavid Empire', [
        ('Ghaznavid Empire', 'ghaznaviderna', 'Ghaznaviderna', '#4a9a6a', {'en': 'Ghaznavid Empire'}),
    ]),
    'seldjukiska-riket': ('Seldjukiska riket', 'Great Seljuk Empire', [
        ('Great Seljuk Empire', 'seldjukiska-riket', 'Seldjukiska riket', '#c07a4a', {'en': 'Great Seljuk Empire'}),
    ]),
    'liaodynastin': ('Liaodynastin', 'Liao dynasty', [
        ('Liao Dynasty', 'liaodynastin', 'Liaodynastin', '#6a8ac0', {'en': 'Liao dynasty'}),
    ]),
    'shrivijaya': ('Shrivijaya', 'Srivijaya', [
        ('Srivijaya', 'shrivijaya', 'Shrivijaya', '#4aa0a0', {'en': 'Srivijaya'}),
    ]),
    'republiken-novgorod': ('Republiken Novgorod', 'Novgorod Republic', [
        ('Novgorod Republic', 'republiken-novgorod', 'Republiken Novgorod', '#9a6ab0', {'en': 'Novgorod Republic'}),
    ]),
    'kungariket-ungern': ('Kungariket Ungern', 'Kingdom of Hungary', [
        ('Kingdom of Hungary', 'kungariket-ungern', 'Kungariket Ungern', '#c05a4a', {'en': 'Kingdom of Hungary'}),
    ]),
    'kungariket-frankrike': ('Kungariket Frankrike', 'Kingdom of France', [
        ('Kingdom of France', 'kungariket-frankrike', 'Kungariket Frankrike', '#4a6ac0', {'en': 'Kingdom of France', 'wikidata': 'Q70972'}),
    ]),
    'kungariket-england': ('Kungariket England', 'Kingdom of England', [
        ('Kingdom of England', 'kungariket-england', 'Kungariket England', '#c04a6a', {'en': 'Kingdom of England'}),
        # Luckorna 1072–1168 och 1645–1661 (#1741, DasKrokodils ja 2026-11-15). Cliopatrias Norman England räknas till Kungariket
        # England (MemberOf); Cliopatrias Q200485 är händelsen "Normandernas erövring av England" och används inte.
        ('Norman England', 'england-1072', 'Kungariket England', '#c04a6a', {'en': 'Kingdom of England', 'wikidata': None}),
        ('Commonwealth of England', 'engelska-samvaldet', 'Engelska samväldet', '#c04a6a', {'en': 'Commonwealth of England', 'wikidata': 'Q330362'}),
    ]),
    # Öarna (Kingdom of the Isles 1085–1176, Kingdom of Mann 1177–1271) ritar Cliopatria både som eget kungarike och i Norge; de
    # klipps bort ur Norgesväldet och visas som Kungariket Man (#1742).
    # Norge ingår i Nordsjöväldet 1028–1039 i Cliopatria, som också har Old Kingdom of Norway de åren; Norge klipps bort ur
    # Norgesväldet då, så att det inte ritas två gånger (#1602).
    'norgesvaldet': ('Norgesväldet', 'Old Kingdom of Norway', [
        ('Old Kingdom of Norway', 'norgesvaldet', 'Norgesväldet', '#4a8a9a', {'en': 'Old Kingdom of Norway', 'wikidata': 'Q2196956',
                                                                          'minus': [('North Sea Empire', 1028, 1039), ('Kingdom of the Isles', 1085, 1176),
                                                                                    ('Kingdom of Mann', 1177, 1271),
                                                                                    # Cliopatrias Norge 1066–1187 har en bit av Yorkshire som
                                                                                    # också är England; den klipps bort (#1742)
                                                                                    ('Norman England', 1072, 1168), ('Angevin Empire', 1169, 1187)],
                                                                          'minusKeepWestOf': (4.0, ('North Sea Empire',))}),
    ]),
    # Nordsjöväldet (#1602, DasKrokodils beslut 2026-11-15, alternativ A): Cliopatrias tre poster med deras egna gränser och år.
    # Regentlängderna säger något annat (Danmark–England 1040–1042, Norge–Danmark 1042–1047); det står öppet i faktarutan.
    # Cliopatrias Wikidata-id för Denmark-England (Q111953993) och Norway-Denmark (Q62651) gäller andra saker och används inte.
    'nordsjovaldet': ('Nordsjöväldet', 'North Sea Empire', [
        ('North Sea Empire', 'nordsjovaldet', 'Nordsjöväldet', '#b0604a', {'en': 'North Sea Empire', 'wikidata': 'Q3281269'}),
        ('Denmark-England', 'danmark-england', 'Danmark–England', '#b0604a', {'en': 'Denmark–England', 'wikidata': None}),
        ('Norway-Denmark', 'norge-danmark', 'Norge–Danmark', '#b0604a', {'en': 'Norway–Denmark', 'wikidata': None}),
    ]),
    # Medeltidens luckor, andra omgången (#645): Nordafrikas och Främre Orientens kalifat och dynastier, Polen, Bulgarien, Nubien
    # och Kara-Khitan. Svenska namn är Wikidatas svenska etiketter. Danmark (Cliopatrias Danish Realm) väntar: Cliopatrias Wikidata-id
    # Q756617 är dagens Danmark. Kingdom of Poland har Q577867, som Wikidata daterar 1025–1385 medan Cliopatrias post sträcker sig 962–1449.
    # Skottland, Strathclyde och Jämtland (#1721, DasKrokodils ja 2026-11-15): Cliopatrias poster med deras egna år. Cliopatrias
    # Wikidata-id för Strathclyde (Q124661, en förvaltningsregion 1975–1996) och Jaemtland (Q211661, landskapet) gäller annat;
    # Strathclyde får kungarikets id Q225890 (historikern).
    'kungariket-skottland': ('Kungariket Skottland', 'Kingdom of Scotland', [
        ('Kingdom of Alba', 'alba', 'Alba', '#4a6aa0', {'en': 'Kingdom of Alba', 'wikidata': 'Q1991742'}),
        # splits 1552 och 1556: Cliopatrias del av dagens Nordirland ska inte slås ihop bort vid den finare förenklingen
        ('Kingdom of Scotland', 'kungariket-skottland', 'Kungariket Skottland', '#4a6aa0', {'en': 'Kingdom of Scotland', 'wikidata': 'Q230791',
                                                                                         'splits': (1344, 1402, 1552, 1556),
                                                                                         # Isle of Man 1344–1401 är egen post i Cliopatria (#1742)
                                                                                         'minus': [('Isle of Man', 1344, 1401)]}),
    ]),
    # Kungariket Man (#1742, DasKrokodils ja 2026-11-15): Cliopatrias Kingdom of the Isles 1085–1176 och Kingdom of Mann 1177–1271
    # som en del (båda Q459188), och Isle of Man 1344–1401 som egen del; Cliopatrias Q9676 är dagens kronbesittning och används inte.
    'kungariket-man': ('Kungariket Man', 'Kingdom of the Isles', [
        (['Kingdom of the Isles', 'Kingdom of Mann'], 'kungariket-man', 'Kungariket Man', '#5a8a8a', {'en': 'Kingdom of the Isles', 'wikidata': 'Q459188'}),
        ('Isle of Man', 'isle-of-man', 'Isle of Man', '#5a8a8a', {'en': 'Isle of Man', 'wikidata': None}),
    ]),
    # Tidigmedeltidens Brittiska öar (#1744, DasKrokodils ja 2026-11-15): Cliopatrias poster med deras egna år och Wikidata.
    'wessex': ('Wessex', 'Kingdom of Wessex', [
        ('Kingdom of Wessex', 'wessex', 'Wessex', '#b0566a', {'en': 'Kingdom of Wessex', 'wikidata': 'Q105313'}),
    ]),
    'mercia': ('Mercia', 'Kingdom of Mercia', [
        # years: Cliopatrias Mercia 884–925 är en rest på 44 km² och visas inte (#1744)
        ('Kingdom of Mercia', 'mercia', 'Mercia', '#9a7a3a', {'en': 'Kingdom of Mercia', 'wikidata': 'Q105092', 'years': (534, 883)}),
    ]),
    'northumbria': ('Northumbria', 'Kingdom of Northumbria', [
        ('Kingdom of Northumbria', 'northumbria', 'Northumbria', '#6a7ab0', {'en': 'Kingdom of Northumbria', 'wikidata': 'Q107299'}),
    ]),
    'dal-riata': ('Dalriada', 'Dál Riata', [
        ('Dál Riata', 'dal-riata', 'Dalriada', '#5a9a8a', {'en': 'Dál Riata', 'wikidata': 'Q111471'}),
    ]),
    'strathclyde': ('Strathclyde', 'Kingdom of Strathclyde', [
        ('Strathclyde', 'strathclyde', 'Strathclyde', '#6a9a5a', {'en': 'Kingdom of Strathclyde', 'wikidata': 'Q225890'}),
    ]),
    'jamtland': ('Jämtland', 'Jämtland', [
        ('Jaemtland', 'jamtland', 'Jämtland', '#8a6ab0', {'en': 'Jämtland', 'wikidata': None}),
    ]),
    'fatimiderna': ('Fatimider', 'Fatimid Caliphate', [
        ('Fatimid Caliphate', 'fatimiderna', 'Fatimider', '#8aa04a', {'en': 'Fatimid Caliphate'}),
    ]),
    'almoravider': ('Almoravider', 'Almoravid dynasty', [
        ('Almoravid Dynasty', 'almoravider', 'Almoravider', '#b07a3a', {'en': 'Almoravid dynasty'}),
    ]),
    'ayyubiderna': ('Ayyubiderna', 'Ayyubid dynasty', [
        ('Ayyubid Sultanate', 'ayyubiderna', 'Ayyubiderna', '#5a9ab0', {'en': 'Ayyubid dynasty'}),
    ]),
    'almohader': ('Almohader', 'Almohad Caliphate', [
        ('Almohad Caliphate', 'almohader', 'Almohader', '#a05a8a', {'en': 'Almohad Caliphate'}),
    ]),
    'kalifatet-cordoba': ('Kalifatet Córdoba', 'Caliphate of Córdoba', [
        ('Caliphate of Córdoba', 'kalifatet-cordoba', 'Kalifatet Córdoba', '#7a9a3a', {'en': 'Caliphate of Córdoba'}),
    ]),
    'forsta-bulgariska-riket': ('Första bulgariska riket', 'First Bulgarian Empire', [
        ('First Bulgarian Empire', 'forsta-bulgariska-riket', 'Första bulgariska riket', '#3a9a5a', {'en': 'First Bulgarian Empire'}),
    ]),
    'kungariket-polen': ('Kungariket Polen', 'Kingdom of Poland', [
        ('Kingdom of Poland', 'kungariket-polen', 'Kungariket Polen', '#c07a8a', {'en': 'Kingdom of Poland'}),
    ]),
    'makuria': ('Makuria', 'Makuria', [
        ('Makuria', 'makuria', 'Makuria', '#b08a5a', {'en': 'Makuria'}),
    ]),
    'kara-khitan': ('Kara-Khitan', 'Qara Khitai', [
        ('Kara-Khitans', 'kara-khitan', 'Kara-Khitan', '#5a7ab0', {'en': 'Qara Khitai'}),
    ]),
    'mamluksultanatet': ('Mamluksultanatet', 'Mamluk Sultanate', [
        ('Mamluk Sultanate', 'mamluksultanatet', 'Mamluksultanatet', '#a0804a', {'en': 'Mamluk Sultanate'}),
    ]),
    # Medeltidens luckor, tredje omgången (#645, Rikards beslut 2026-11-07): Danmark som eget rike med Wikidatas svenska namn
    # (Q756617, riket sedan 965; nutidens Danmark är gruppen danmark), Tibetanska imperiet, Moskvariket, Litauen, Kastilien och
    # Uiguriska khaganatet, som saknar svenskt namn på Wikidata och har det engelska. Väntar: Tibetans och Avar Khaganate (Cliopatrias
    # Wikidata-id är folkgrupper, inte riken) och Yenisei Kyrgyz (namn saknas på tre språk).
    # Danmark 1526–1939 (#1084, DasKrokodils ja 2026-11-13): Cliopatrias Denmark-Norway heter så ända till 1939, men Norge
    # gick 1814 till Sverige-Norge. Posten delas därför i Danmark-Norge (1526–1814, Q62651; Wikidata säger 1536–1814) och
    # Danmark (1815–1939). 1407–1525 täcks av Kalmarunionen, och 1940–1944 räknar Cliopatria området till Tyskland.
    # Cliopatrias Denmark-Norway har Island med till och med 1921, men Kingdom of Iceland finns från 1918 (Wikidata Q62567:
    # 1 december 1918). Danmark klipper därför bort Cliopatrias egen yta för Kingdom of Iceland 1918–1921 (#1381); från 1922
    # har Cliopatrias Danmark inte Island med, och de perioderna lämnas orörda.
    'konungariket-danmark': ('Konungariket Danmark', 'Kingdom of Denmark', [
        ('Kingdom of Denmark', 'konungariket-danmark', 'Konungariket Danmark', '#c05a6a', {'en': 'Kingdom of Denmark'}),
        ('Denmark-Norway', 'danmark-norge', 'Danmark-Norge', '#c05a6a',
         {'en': 'Denmark–Norway', 'wikidata': 'Q62651', 'years': (1526, 1814)}),
        ('Denmark-Norway', 'danmark-1815', 'Danmark', '#c05a6a', {'en': 'Denmark', 'wikidata': 'Q35', 'years': (1815, 1939),
                                                                    'minus': [('Kingdom of Iceland', 1918, 1921)]}),
    ]),
    'tibetanska-imperiet': ('Tibetanska imperiet', 'Tibetan Empire', [
        ('Tibetan Empire', 'tibetanska-imperiet', 'Tibetanska imperiet', '#b0704a', {'en': 'Tibetan Empire'}),
    ]),
    'moskvariket': ('Moskvariket', 'Grand Principality of Moscow', [
        ('Grand Principality of Moscow', 'moskvariket', 'Moskvariket', '#8a5ab0', {'en': 'Grand Principality of Moscow'}),
    ]),
    'storfurstendomet-litauen': ('Storfurstendömet Litauen', 'Grand Duchy of Lithuania', [
        ('Grand Duchy of Lithuania', 'storfurstendomet-litauen', 'Storfurstendömet Litauen', '#5aa07a', {'en': 'Grand Duchy of Lithuania'}),
    ]),
    'kastilianska-kronan': ('Kastilianska kronan', 'Crown of Castile', [
        ('Crown of Castile', 'kastilianska-kronan', 'Kastilianska kronan', '#c0a04a', {'en': 'Crown of Castile'}),
    ]),
    'uiguriska-khaganatet': ('Uyghur Khaganate', 'Uyghur Khaganate', [
        ('Uyghur Khaganate', 'uiguriska-khaganatet', 'Uyghur Khaganate', '#4a8ac0', {'en': 'Uyghur Khaganate'}),
    ]),
    # Medeltidens luckor, fjärde omgången (#645, DasKrokodils beslut 2026-11-12): de största kvarvarande luckorna 500–1500 enligt
    # tools/tackning_riken.py. Svenska namn är Wikidatas svenska etiketter; saknas en svensk etikett används den engelska (beslutet).
    # Cliopatrias Tibetans pekar på folkgruppen (Q187985) och får Wikidatas Era of Fragmentation (Q2065143), Yenisei Kyrgyz pekar på
    # folkgruppen (Q83142) och får staten Kyrgyz Khaganate (Q2047076), och Western/Eastern Göktürks pekar båda på gökturkarna
    # (Q205466) och får Västturkiska (Q874357) respektive Östturkiska khaganatet (Q2607292), kontrollerat mot Wikidata 2026-11-12.
    # Väntar: Avar Khaganate (Cliopatrias id Q68962 är fortfarande folkgruppen Avarer).
    'era-of-fragmentation': ('Era of Fragmentation', 'Era of Fragmentation', [
        ('Tibetans', 'era-of-fragmentation', 'Era of Fragmentation', '#a8784a', {'en': 'Era of Fragmentation', 'wikidata': 'Q2065143'}),
    ]),
    'yenisei-kyrgyz': ('Yenisei Kyrgyz', 'Yenisei Kyrgyz', [
        ('Yenisei Kyrgyz', 'yenisei-kyrgyz', 'Yenisei Kyrgyz', '#6a9aa0', {'en': 'Yenisei Kyrgyz', 'wikidata': 'Q2047076'}),
    ]),
    'rouran': ('Rouran Khaganate', 'Rouran Khaganate', [
        ('Rouran Khaganate', 'rouran', 'Rouran Khaganate', '#9a8a4a', {'en': 'Rouran Khaganate'}),
    ]),
    'vastturkiska-khaganatet': ('Västturkiska khaganatet', 'Western Turkic Khaganate', [
        ('Western Göktürks', 'vastturkiska-khaganatet', 'Västturkiska khaganatet', '#4a9a8a',
         {'en': 'Western Turkic Khaganate', 'wikidata': 'Q874357'}),
    ]),
    'ostturkiska-khaganatet': ('Östturkiska khaganatet', 'Eastern Turkic Khaganate', [
        ('Eastern Göktürks', 'ostturkiska-khaganatet', 'Östturkiska khaganatet', '#3a7a9a',
         {'en': 'Eastern Turkic Khaganate', 'wikidata': 'Q2607292'}),
    ]),
    'turgesh': ('Türgesh', 'Türgesh', [
        ('Türgesh', 'turgesh', 'Türgesh', '#b08a6a', {'en': 'Türgesh'}),
    ]),
    'samaniderna': ('Samanider', 'Samanid dynasty', [
        ('Samanid Empire', 'samaniderna', 'Samanider', '#5aa05a', {'en': 'Samanid dynasty'}),
    ]),
    'visigotiska-riket': ('Visigotiska riket', 'Visigothic Kingdom', [
        ('Visigothic Kingdom', 'visigotiska-riket', 'Visigotiska riket', '#a06a4a', {'en': 'Visigothic Kingdom'}),
    ]),
    # Cliopatrias Mongol Khanate (1468–1635) läggs till Norra Yuandynastin (#1331). Cliopatrias Wikidata-id Q19927420 är en
    # förgreningssida; av rikena där är det bara Norra Yuan (Q8959, 1368–1635 enligt Wikipedia) som stämmer med år och plats.
    'norra-yuandynastin': ('Norra Yuandynastin', 'Northern Yuan dynasty', [
        ('Northern Yuan', 'norra-yuandynastin', 'Norra Yuandynastin', '#7a6ab0', {'en': 'Northern Yuan dynasty'}),
        ('Mongol Khanate', 'norra-yuandynastin-1468', 'Norra Yuandynastin', '#7a6ab0',
         {'en': 'Northern Yuan dynasty', 'wikidata': 'Q8959'}),
    ]),
    'kungariket-alodia': ('Kungariket Alodia', 'Alodia', [
        ('Alodia', 'kungariket-alodia', 'Kungariket Alodia', '#c09a5a', {'en': 'Alodia'}),
    ]),
    'cordobaemiratet': ('Córdobaemiratet', 'Emirate of Córdoba', [
        ('Emirate of Córdoba', 'cordobaemiratet', 'Córdobaemiratet', '#6a9a3a', {'en': 'Emirate of Córdoba'}),
    ]),
    # Medeltidens luckor, femte omgången (#645): de största kvarvarande luckorna 500–1500 enligt tools/tackning_riken.py
    # (2026-11-12). Svenska namn är Wikidatas svenska etiketter, annars engelska. Cliopatrias White Huns pekar på en
    # förgreningssida (Q41761342) och får Heftaliter (Q26576), och Khazaria pekar på folket khazarer (Q173282) och får staten
    # Khazar Khaganate (Q2090473), kontrollerat mot Wikidata 2026-11-12. Great Jin är Jurchens Jindynasti 1115–1234 (Q5066).
    'suidynastin': ('Suidynastin', 'Sui dynasty', [
        ('Sui Dynasty', 'suidynastin', 'Suidynastin', '#c0604a', {'en': 'Sui dynasty'}),
    ]),
    'heftaliter': ('Heftaliter', 'Hephthalites', [
        ('White Huns', 'heftaliter', 'Heftaliter', '#8a7a5a', {'en': 'Hephthalites', 'wikidata': 'Q26576'}),
    ]),
    'sodra-qidynastin': ('Södra Qidynastin', 'Southern Qi', [
        ('Southern Qi', 'sodra-qidynastin', 'Södra Qidynastin', '#5a8a6a', {'en': 'Southern Qi'}),
    ]),
    'khazar-khaganate': ('Khazar Khaganate', 'Khazar Khaganate', [
        ('Khazaria', 'khazar-khaganate', 'Khazar Khaganate', '#a07a9a', {'en': 'Khazar Khaganate', 'wikidata': 'Q2090473'}),
    ]),
    'ghuriderna': ('Ghuriderna', 'Ghurid dynasty', [
        ('Ghurid Dynasty', 'ghuriderna', 'Ghuriderna', '#7a9a4a', {'en': 'Ghurid dynasty'}),
    ]),
    'jindynastin-jurchen': ('Jindynastin', 'Jin dynasty', [
        ('Great Jin', 'jindynastin-jurchen', 'Jindynastin', '#b08a3a', {'en': 'Jin dynasty'}),
    ]),
    'qocho': ('Qocho', 'Qocho', [
        ('Qocho Kingdom', 'qocho', 'Qocho', '#4a9ab0', {'en': 'Qocho'}),
    ]),
    'tulunider': ('Tulunider', 'Tulunids', [
        ('Tulunids', 'tulunider', 'Tulunider', '#9a6a4a', {'en': 'Tulunids'}),
    ]),
    'rustamider': ('Rustamiderna', 'Rustamid dynasty', [
        ('Rustamid dynasty', 'rustamider', 'Rustamiderna', '#6a7ab0', {'en': 'Rustamid dynasty'}),
    ]),
    'hafsiderna': ('Hafsiderna', 'Hafsid dynasty', [
        ('Hafsid Dynasty', 'hafsiderna', 'Hafsiderna', '#4a8a7a', {'en': 'Hafsid dynasty'}),
    ]),
    'aghlabider': ('Aghlabider', 'Aghlabids', [
        ('Aghlabid Dynasty', 'aghlabider', 'Aghlabider', '#b0605a', {'en': 'Aghlabids'}),
    ]),
    # Medeltidens luckor, sjätte omgången (#645): de största kvarvarande luckorna 500–1500 enligt tools/tackning_riken.py
    # (2026-11-13), med Kazakkhanatet och Moldavien som börjar på 1300- och 1400-talen. Svenska namn är Wikidatas svenska
    # etiketter; Tuyuhun saknar svensk etikett och har den engelska. Väntar: Tibet (Cliopatrias Q521263 är "Tibets historia",
    # inte en stat), Mongol Khanate (Q19927420 är en förgreningssida), Avar Khaganate (folkgruppen Avarer) och Ostrogothic Kingdom
    # (Wikidata "Ostrogoternas rike", medan INFLUENCE_NAMES nedan redan säger "Östgoternas rike"; namnet bör väljas först).
    'sibirkhanatet': ('Sibirkhanatet', 'Siberian Khanate', [
        ('Khanate of Sibir', 'sibirkhanatet', 'Sibirkhanatet', '#6a8aa0', {'en': 'Siberian Khanate'}),
    ]),
    'rashtrakutariket': ('Rashtrakutariket', 'Rashtrakuta dynasty', [
        ('Rashtrakuta Dynasty', 'rashtrakutariket', 'Rashtrakutariket', '#b07a4a', {'en': 'Rashtrakuta dynasty'}),
    ]),
    'tuyuhun': ('Tuyuhun', 'Tuyuhun', [
        ('Tuyuhun', 'tuyuhun', 'Tuyuhun', '#8a9a5a', {'en': 'Tuyuhun'}),
    ]),
    'vakatakariket': ('Vakatakariket', 'Vakataka empire', [
        ('Vakataka Kingdom', 'vakatakariket', 'Vakatakariket', '#a0604a', {'en': 'Vakataka empire'}),
    ]),
    'norra-wei': ('Norra Wei', 'Northern Wei', [
        ('Northern Wei', 'norra-wei', 'Norra Wei', '#5a7a9a', {'en': 'Northern Wei'}),
    ]),
    'kanem-bornu': ('Kanem-Bornu', 'Kanem-Bornu Empire', [
        ('Bornu Empire', 'kanem-bornu', 'Kanem-Bornu', '#b09a4a', {'en': 'Kanem-Bornu Empire'}),
    ]),
    'galizien-volynien': ('Furstendömet Galizien-Volynien', 'Principality of Galicia–Volhynia', [
        ('Halych-Volhynia occupation', 'galizien-volynien', 'Furstendömet Galizien-Volynien', '#7a5a9a',
         {'en': 'Principality of Galicia–Volhynia'}),
    ]),
    'kungariket-nobatia': ('Kungariket Nobatia', 'Nobatia', [
        ('Nobatia', 'kungariket-nobatia', 'Kungariket Nobatia', '#9a7a5a', {'en': 'Nobatia'}),
    ]),
    'angevinska-riket': ('Det angevinska riket', 'Angevin Empire', [
        ('Angevin Empire', 'angevinska-riket', 'Det angevinska riket', '#a04a5a', {'en': 'Angevin Empire'}),
    ]),
    'kazakkhanatet': ('Kazakkhanatet', 'Kazakh Khanate', [
        ('Kazakh Khanate', 'kazakkhanatet', 'Kazakkhanatet', '#4aa0b0', {'en': 'Kazakh Khanate'}),
    ]),
    'furstendomet-moldavien': ('Furstendömet Moldavien', 'Principality of Moldavia', [
        ('Principality of Moldavia', 'furstendomet-moldavien', 'Furstendömet Moldavien', '#5a9a7a', {'en': 'Principality of Moldavia'}),
    ]),
    # Medeltidens luckor, sjunde omgången (#645, DasKrokodils ja 2026-11-13): de största kvarvarande luckorna 500–1500 med
    # provår var 50:e år (tools/tackning_riken.py), där Cliopatrias Wikidata-id är en stat och har svensk etikett.
    # Svenska och engelska namn är Wikidatas etiketter, kontrollerade med SPARQL 2026-11-13.
    'rashidunkalifatet': ('Rashidunkalifatet', 'Rashidun Caliphate', [
        ('Rashidun Caliphate', 'rashidunkalifatet', 'Rashidunkalifatet', '#7a9a5a', {'en': 'Rashidun Caliphate'}),
    ]),
    'majapahitriket': ('Majapahitriket', 'Majapahit', [
        ('Majapahit', 'majapahitriket', 'Majapahitriket', '#b0704a', {'en': 'Majapahit'}),
    ]),
    'chalukyadynastin': ('Chalukyadynastin', 'Chalukya dynasty', [
        ('Chalukya Dynasty', 'chalukyadynastin', 'Chalukyadynastin', '#a05a7a', {'en': 'Chalukya dynasty'}),
    ]),
    'gurjara-pratihara': ('Gurjara-Pratihara', 'Gurjara-Pratihara', [
        ('Gurjara-Pratihara Dynasty', 'gurjara-pratihara', 'Gurjara-Pratihara', '#c0804a', {'en': 'Gurjara-Pratihara'}),
    ]),
    'kara-khanid': ('Khanatet Kara-Khanid', 'Karakhanid Khanate', [
        ('Kara-Khanids', 'kara-khanid', 'Khanatet Kara-Khanid', '#5a8ab0', {'en': 'Karakhanid Khanate'}),
    ]),
    'dali': ('Dali', 'Dali Kingdom', [
        ('Kingdom of Dali', 'dali', 'Dali', '#8a6ab0', {'en': 'Dali Kingdom'}),
    ]),
    'tughlaqdynastin': ('Tughlaqdynastin', 'Tughlaq dynasty', [
        ('Tughlaq Dynasty', 'tughlaqdynastin', 'Tughlaqdynastin', '#4a9a6a', {'en': 'Tughlaq dynasty'}),
    ]),
    'palariket': ('Palariket', 'Pala Empire', [
        ('Pala Empire', 'palariket', 'Palariket', '#b09a5a', {'en': 'Pala Empire'}),
    ]),
    'xixia': ('Xixia', 'Western Xia', [
        ('Western Xia', 'xixia', 'Xixia', '#9a5a4a', {'en': 'Western Xia'}),
    ]),
    'aq-qoyunlu': ('Aq Qoyunlu', 'Aq Qoyunlu', [
        ('Aq Qoyunlu', 'aq-qoyunlu', 'Aq Qoyunlu', '#6a9aa0', {'en': 'Aq Qoyunlu'}),
    ]),
    'nanzhaoriket': ('Nanzhaoriket', 'Kingdom of Nanzhao', [
        ('Nanzhao', 'nanzhaoriket', 'Nanzhaoriket', '#a07a9a', {'en': 'Kingdom of Nanzhao'}),
    ]),
    'mariniderna': ('Mariniderna', 'Marinid dynasty', [
        ('Marinid Sultanate', 'mariniderna', 'Mariniderna', '#7a8a4a', {'en': 'Marinid dynasty'}),
    ]),
    # Östgoternas rike (DasKrokodils beslut 2026-11-13): samma svenska namn som i INFLUENCE_NAMES, inte Wikidatas "Ostrogoternas rike"
    'ostgoternas-rike': ('Östgoternas rike', 'Ostrogothic Kingdom', [
        ('Ostrogothic Kingdom', 'ostgoternas-rike', 'Östgoternas rike', '#9a6a5a', {'en': 'Ostrogothic Kingdom'}),
    ]),
    # Antikens luckor, första omgången (#646, DasKrokodils ja 2026-11-13): de största luckorna före 600 enligt
    # tools/tackning_riken.py, där Cliopatrias Wikidata-id är en stat. Svenska och engelska namn är Wikidatas etiketter,
    # kontrollerade med SPARQL 2026-11-13. Cliopatrias Western Jin (265–425) har Wikidatas hela Jindynasti (Q7352, 266–420),
    # som har samma namn som jurchenernas Jindynasti (Q5066, 1115–1234); den får därför årtalen i namnet, som i
    # Wikipedias titel "Jin dynasty (266–420)". Mellersta riket ligger i gruppen 'egypten' ovan.
    'xiongnu': ('Xiongnu', 'Xiongnu', [
        ('Xiongnu', 'xiongnu', 'Xiongnu', '#8a6a3a', {'en': 'Xiongnu'}),
    ]),
    'jindynastin-266-420': ('Jindynastin (266–420)', 'Jin dynasty (266–420)', [
        ('Western Jin', 'jindynastin-266-420', 'Jindynastin (266–420)', '#c08a5a', {'en': 'Jin dynasty (266–420)'}),
    ]),
    'kushan': ('Kushan', 'Kushan Empire', [
        ('Kushan Empire', 'kushan', 'Kushan', '#7a5aa0', {'en': 'Kushan Empire'}),
    ]),
    'satavahana': ('Satavahana', 'Satavahana dynasty', [
        ('Satavahana Dynasty', 'satavahana', 'Satavahana', '#5aa07a', {'en': 'Satavahana dynasty'}),
    ]),
    'kush': ('Kush', 'Kingdom of Kush', [
        ('Kingdom of Kush', 'kush', 'Kush', '#a0603a', {'en': 'Kingdom of Kush'}),
    ]),
    # Ptolemaiska riket börjar 305 f.Kr. enligt Wikidata (Q2320005, 305–30 f.Kr.). Cliopatria lägger posten "Ptolemaic Kingdom"
    # redan på 332–325 f.Kr. och täcker då Alexanders erövringar ända till Indus, medan "Macedonian Empire" samma år bara är
    # Makedonien; geografens granskning inför v6.3.0 (2026-11-13). Åren klipps därför till Wikidatas start, och
    # posterna 332–325 f.Kr. läggs till Makedoniska riket (#1382).
    'ptolemaiska-riket': ('Ptolemaiska riket', 'Ptolemaic Kingdom', [
        ('Ptolemaic Kingdom', 'ptolemaiska-riket', 'Ptolemaiska riket', '#4a7ab0', {'en': 'Ptolemaic Kingdom', 'years': (-304, -28)}),
    ]),
    'mitanni': ('Mitanni', 'Mitanni', [
        ('Mitanni', 'mitanni', 'Mitanni', '#b05a6a', {'en': 'Mitanni'}),
    ]),
    'vastra-regionernas-protektorat': ('De västra regionernas protektorat', 'Protectorate of the Western Regions', [
        ('Protectorate of the Western Regions', 'vastra-regionernas-protektorat', 'De västra regionernas protektorat', '#6a9a8a',
         {'en': 'Protectorate of the Western Regions'}),
    ]),
    # Medeltidens luckor, åttonde omgången (#645, DasKrokodils ja 2026-11-13): Cliopatrias Wikidata-id är en stat men
    # saknar svensk etikett (SPARQL 2026-11-13), så namnet är det engelska enligt beslutet 2026-11-12. Cliopatrias
    # Oirat Confederation (1619–1676) har samma Wikidata-id som Four Oirats men ligger utanför Wikidatas spann (1399–1628)
    # och väntar.
    'four-oirats': ('Four Oirats', 'Four Oirats', [
        ('Four Oirats', 'four-oirats', 'Four Oirats', '#7a6ab0', {'en': 'Four Oirats'}),
    ]),
    'western-chalukya-empire': ('Västra Chalukyariket', 'Western Chalukya Empire', [
        ('Western Chalukya Empire', 'western-chalukya-empire', 'Västra Chalukyariket', '#b07a6a', {'en': 'Western Chalukya Empire'}),
    ]),
    'pagan-kingdom': ('Kungariket Pagan', 'Pagan kingdom', [
        ('Pagan Kingdom', 'pagan-kingdom', 'Kungariket Pagan', '#9aa04a', {'en': 'Pagan kingdom'}),
    ]),
    'rasulid-dynasty': ('Rasuliderna', 'Rasulid dynasty', [
        ('Rasulid Dynasty', 'rasulid-dynasty', 'Rasuliderna', '#4a8aa0', {'en': 'Rasulid dynasty'}),
    ]),
    'chola-empire': ('Cholariket', 'Chola Empire', [
        ('Chola Empire', 'chola-empire', 'Cholariket', '#c0704a', {'en': 'Chola Empire'}),
    ]),
    # Inre Asien 1500–1800, Afrika 1850 och Tibet 1912–1952 (#1331, ur helganalysen #1289). Svenska och engelska namn är
    # Wikidatas etiketter, utom Khedivatet Egypten (svenska Wikipedias titel; etiketten "Khedivet" ser ut som ett skrivfel)
    # och gruppen Egypten under ätten Muhammed Ali (Wikidatas namn på ätten, Q142913, som ersätter Cliopatrias id Q3057606,
    # en historieartikel; de och es är egna översättningar byggda på Q142913:s etiketter, fr är franska Wikipedias titel för Q3057606).
    # Mogulistan: Cliopatria delar khanatet i en östra och en västra del 1519; alla tre har samma Wikidata-id och samma namn.
    # Tibet (Q2444884): bara 1912–1951; efter 1951 följer kartan Sveriges hållning (DasKrokodils beslut 2026-11-14).
    # Tibet 1363–1793 väntar, eftersom Cliopatrias id där är "Tibets historia"
    # (beslut 2026-11-07-riken-namn-645). Tibet erkändes nästan inte av någon stat; 1912–1951 visas det som i
    # Cliopatria med en not, och 1952 lämnas tomt (docs/omstridda-granser.md).
    'dzungarkhanatet': ('Dzungarkhanatet', 'Dzungar Khanate', [
        ('Dzungar Khanate', 'dzungarkhanatet', 'Dzungarkhanatet', '#9a7a4a', {'en': 'Dzungar Khanate'}),
    ]),
    'mogulistan': ('Mogulistan', 'Moghulistan', [
        ('Moghulistan', 'mogulistan', 'Mogulistan', '#5a9a8a', {'en': 'Moghulistan'}),
        ('Eastern Moghulistan', 'mogulistan-ost', 'Mogulistan', '#5a9a8a', {'en': 'Moghulistan'}),
        ('Western Moghulistan', 'mogulistan-vast', 'Mogulistan', '#5a9a8a', {'en': 'Moghulistan'}),
    ]),
    'tibet': ('Tibet', 'Tibet', [
        ('Tibet', 'tibet', 'Tibet', '#b0604a', {'en': 'Tibet', 'wikidata': 'Q2444884', 'years': (1912, 1951)}),
    ]),
    'egypten-muhammad-ali': ('Egypten under ätten Muhammed Ali', 'Egypt under the Muhammad Ali dynasty', [
        ('Muhammad Ali dynasty', 'egypten-muhammad-ali', 'Egypten under ätten Muhammed Ali', '#c9a23a',
         {'en': 'Egypt under the Muhammad Ali dynasty', 'wikidata': 'Q142913'}),
        ('Khedivate of Egypt', 'khedivatet-egypten', 'Khedivatet Egypten', '#c9a23a', {'en': 'Khedivate of Egypt'}),
    ]),
    'sokotokalifatet': ('Sokotokalifatet', 'Sokoto Caliphate', [
        ('Sokoto Caliphate', 'sokotokalifatet', 'Sokotokalifatet', '#5a8a4a', {'en': 'Sokoto Caliphate'}),
    ]),
    'kungariket-madagaskar': ('Kungariket Madagaskar', 'Merina Kingdom', [
        ('Merina Kingdom', 'kungariket-madagaskar', 'Kungariket Madagaskar', '#a04a6a', {'en': 'Merina Kingdom'}),
    ]),
    'wadai': ('Wadai', 'Ouaddai Empire', [
        ('Wadai Empire', 'wadai', 'Wadai', '#b08a4a', {'en': 'Ouaddai Empire'}),
    ]),
    'sultanatet-darfur': ('Sultanatet Darfur', 'Sultanate of Darfur', [
        ('Sultanate of Darfur', 'sultanatet-darfur', 'Sultanatet Darfur', '#8a5a3a', {'en': 'Sultanate of Darfur'}),
    ]),
    # Små stater ur Natural Earth (#722, Rikards beslut 2026-11-07): Cliopatria saknar dem i nutid eller har fel gräns
    # (Saint Kitts ligger på Saint Croix, Mikronesien är bara Pohnpei). Gränsen är dagens land i Natural Earth
    # (tools/ne-omstridda-omraden.geojson, tools/ne_omstridda.py), från självständigheten enligt Wikidata och Wikipedia
    # (docs/datamodell.md), och landet visas som en punkt med namn (point) på huvudstaden enligt Wikidata (label)
    # Andorra och Monaco (#719, Rikards beslut 2026-11-07): som de små staterna, en punkt på huvudstaden, men med
    # Cliopatrias årtal. Gränsen är dagens land i Natural Earth; grannarnas förenklade gränser täcker annars Andorra.
    # Monaco har Cliopatrias gräns till och med 1847 (164 km²) och Natural Earths från 1848, eftersom Cliopatrias
    # gräns från 1848 ligger väster om Monaco (7,15–7,23° öst; Natural Earth 7,37–7,44° öst)
    'andorra': ('Andorra', 'Andorra', [
        ('Principality of Andorra', 'andorra', 'Andorra', '#c0603a', {'en': 'Andorra', 'ne': 'andorra', 'point': True,
                                                                     'label': (1.522, 42.507)}),
    ]),
    'monaco': ('Monaco', 'Monaco', [
        (['Principality of Monaco', 'Kingdom of Monaco'], 'monaco', 'Monaco', '#c04a5a',
         {'en': 'Monaco', 'wikidata': 'Q235', 'ne': 'monaco', 'ne_from': 1848, 'point': True, 'label': (7.42, 43.731)}),
    ]),
    'saint-kitts-och-nevis': ('Saint Kitts och Nevis', 'Saint Kitts and Nevis', [
        (None, 'saint-kitts-och-nevis', 'Saint Kitts och Nevis', '#c05a4a', {'en': 'Saint Kitts and Nevis', 'wikidata': 'Q763', 'years': (1983, 2024), 'ne': 'saint-kitts-och-nevis', 'point': True,
                  'label': (-62.734, 17.298)}),
    ]),
    'mikronesiska-federationen': ('Mikronesiska federationen', 'Federated States of Micronesia', [
        (None, 'mikronesiska-federationen', 'Mikronesiska federationen', '#4a8ab0', {'en': 'Federated States of Micronesia', 'wikidata': 'Q702', 'years': (1986, 2024), 'ne': 'mikronesiska-federationen', 'point': True,
                  'label': (158.185, 6.918)}),
    ]),
    'kiribati': ('Kiribati', 'Kiribati', [
        (None, 'kiribati', 'Kiribati', '#c0904a', {'en': 'Kiribati', 'wikidata': 'Q710', 'years': (1979, 2024), 'ne': 'kiribati', 'point': True,
                  'label': (172.967, 1.333)}),
    ]),
    'komorerna': ('Komorerna', 'Comoros', [
        (None, 'komorerna', 'Komorerna', '#4a9a6a', {'en': 'Comoros', 'wikidata': 'Q970', 'years': (1975, 2024), 'ne': 'komorerna', 'point': True,
                  'label': (43.254, -11.704)}),
    ]),
    'liechtenstein': ('Liechtenstein', 'Liechtenstein', [
        (None, 'liechtenstein', 'Liechtenstein', '#4a6ab0', {'en': 'Liechtenstein', 'wikidata': 'Q347', 'years': (1806, 2024), 'ne': 'liechtenstein', 'point': True,
                  'label': (9.522, 47.141)}),
    ]),
    'maldiverna': ('Maldiverna', 'Maldives', [
        (None, 'maldiverna', 'Maldiverna', '#c04a5a', {'en': 'Maldives', 'wikidata': 'Q826', 'years': (1965, 2024), 'ne': 'maldiverna', 'point': True,
                  'label': (73.508, 4.175)}),
    ]),
    'marshalloarna': ('Marshallöarna', 'Marshall Islands', [
        (None, 'marshalloarna', 'Marshallöarna', '#3a7ac0', {'en': 'Marshall Islands', 'wikidata': 'Q709', 'years': (1986, 2024), 'ne': 'marshalloarna', 'point': True,
                  'label': (171.38, 7.092)}),
    ]),
    'nauru': ('Nauru', 'Nauru', [
        (None, 'nauru', 'Nauru', '#3a5a9a', {'en': 'Nauru', 'wikidata': 'Q697', 'years': (1968, 2024), 'ne': 'nauru', 'point': True,
                  'label': (166.921, -0.548)}),
    ]),
    'samoa': ('Samoa', 'Samoa', [
        (None, 'samoa', 'Samoa', '#b04a4a', {'en': 'Samoa', 'wikidata': 'Q683', 'years': (1962, 2024), 'ne': 'samoa', 'point': True,
                  'label': (-171.833, -13.833)}),
    ]),
    'san-marino': ('San Marino', 'San Marino', [
        (None, 'san-marino', 'San Marino', '#5a9ac0', {'en': 'San Marino', 'wikidata': 'Q238', 'years': (1291, 2024), 'ne': 'san-marino', 'point': True,
                  'label': (12.448, 43.932)}),
    ]),
    'tonga': ('Tonga', 'Tonga', [
        (None, 'tonga', 'Tonga', '#c04a4a', {'en': 'Tonga', 'wikidata': 'Q678', 'years': (1970, 2024), 'ne': 'tonga', 'point': True,
                  'label': (-175.202, -21.134)}),
    ]),
    'tuvalu': ('Tuvalu', 'Tuvalu', [
        (None, 'tuvalu', 'Tuvalu', '#4aa0b0', {'en': 'Tuvalu', 'wikidata': 'Q672', 'years': (1978, 2024), 'ne': 'tuvalu', 'point': True,
                  'label': (179.117, -8.505)}),
    ]),
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


# Omstridda gränser i nutid (beslut 2026-11-03, #644, docs/omstridda-granser.md): områden som Cliopatria räknar
# till ett rike men som enligt Sveriges officiella hållning (UD) hör till ett annat. Området (`area`) är antingen
# skillnaden mellan två gränser i Cliopatria (((namn, år), (namn, år))) eller ('ne', [id, ...]): områden ur
# tools/ne-omstridda-omraden.geojson (Natural Earth, public domain, byggd med tools/ne_omstridda.py). Från året
# `from` tas området bort ur grupperna i `remove` och läggs till grupperna i `add`. Ytan (areaKm2) räknas då fram
# ur den nya gränsen.
# Saarområdet 1920–1935 (#1730, #1750): Frankrikes gräns 1931 minus gränsen 1932 i Cliopatria, inom Tysklands gräns i Natural Earth
# Saarområdet är Saarlands nuvarande gräns (Natural Earth admin 1), som ungefär motsvarar det (#1755). Frankrikes gräns 1931 minus
# 1932 i Cliopatria tog förut också med en bit av Pfalz kring Zweibrücken, som låg utanför, men inte Homburg, som låg inom
# (de.wikipedia "Saargebiet" och "Homburg")
SAAR = ('ne', ['saarland'])
# Rutan längs gränsen mellan DDR och Västtyskland (väst, syd, öst, nord), #1750
INNERTYSKA = (9.8, 50.15, 12.3, 54.2)  # syd 50,15 och öst 12,3: hela Thüringens och Bayerns gräns (#1750)
# Rutan längs Oder–Neisse-gränsen, #1750
ODER = (13.7, 50.75, 15.2, 54.45)
# Rutan kring Lindau och Wangen im Allgäu, #1755
LINDAU = (9.3, 47.3, 10.4, 48.0)
# Rutan kring Kaliningradområdet (samma som 'kaliningrad' nedan), #1755
KALININGRAD = (19.4, 54.2, 22.95, 55.4)
# Rutan längs gränsen mellan Frankrike och Tyskland, från Schengen till Basel, och Tysklands och Frankrikes sidor av gränsen i
# den ur Natural Earth (#1755)
FRANSKA_GRANSEN = (6.3, 47.62, 8.4, 49.5)  # utan Luxemburg och Schweiz
# Rutan längs gränsen mellan Tjeckoslovakien och Tyskland (Bayern och Sachsen), #1755
TJECKISKA_GRANSEN = (11.9, 48.5, 15.1, 51.1)
# Rutorna vid Bodensee och Hochrhein (Basel, Schaffhausen, Konstanz, Vorarlberg) och längs gränsen mellan Österrike och Tyskland
# från Allgäu till Passau (#1771). Gränserna mellan Tyskland, Schweiz och Österrike har i stort sett inte ändrats sedan 1919 (en.wikipedia
# "Germany–Switzerland border", "Austria–Switzerland border" och "Austria–Germany border"), så där följer de Natural Earth från
# 1919: Cliopatrias och förenklingens gränser lägger annars Bregenz i Tyskland, Kreuzlingen i Västtyskland och Basel utan stat.
# Natural Earth 1:10m avviker upp till cirka 1 km längs Rhen och Bodensee (Konstanz, Petershausen och Bad Säckingen ritas i Schweiz);
# det godtas och står i Om kartan, eftersom en egen skiljelinje vore påhittad
HOCHRHEIN = (7.5, 47.2, 10.5, 47.85)
ALPGRANSEN = (10.5, 47.25, 14.0, 48.8)
ALP = ('rutor', [HOCHRHEIN, ALPGRANSEN])
# Kaliningradområdet och Ermland-Masuriens gräns mot det (samma som 'kaliningrad-polen'), #1771
ERMLAND = (19.4, 54.0, 22.95, 55.4)
# Natural Earth 1:10m lägger gränsen mellan Polen och Kaliningradområdet 3–4 km för långt norrut (Bagrationovsk och
# Zjeleznodorozjnyj hamnar i Polen), och Litauens gräns något för långt söderut (geografen, #1771). Polens och Litauens sidor
# är därför Natural Earth minus Ryska federationens gräns i Cliopatria 2000, så att den ryska gränsen inte flyttas; remsan
# som Natural Earth räknar till Polen eller Litauen men Cliopatria till Ryssland läggs till Sovjetunionen och Ryssland
RYSKA_CLIO = ('clio', 'Russian Federation', 2000)
POLEN_ERMLAND = ('skillnad', ('snitt', ('ne', ['polen-ne']), ('rutor', [ERMLAND])), RYSKA_CLIO)
REMSA_PL = ('snitt', ('snitt', ('ne', ['polen-ne']), ('rutor', [ERMLAND])), RYSKA_CLIO)
LITAUEN_UTAN_RU = ('ne', ['litauen-ne'])
# Jura och Sundgau: Frankrikes gräns mot Schweiz från Genève till Basel
JURA = (5.9, 46.1, 7.6, 47.65)
TYSKA_SIDAN = ('snitt', ('ne', ['tyskland']), ('rutor', [FRANSKA_GRANSEN]))
FRANSKA_SIDAN = ('snitt', ('ne', ['frankrike-ne']), ('rutor', [FRANSKA_GRANSEN]))
# Tysklands sida av gränsen mot Nederländerna 1950–1962 enligt Förbundsrepublikens gräns i Cliopatria 1955 (utan Selfkant och
# Elten), utan det som ligger i Nederländerna i Natural Earth (Gangelt, #1755)
BRD_MOT_NEDERLANDERNA = ('snitt', ('skillnad', ('clio', 'Federal Republic of Germany', 1955), ('ne', ['nederlanderna-ne'])),
                         ('snitt', ('ne', ['tyskland']), ('rutor', [(5.85, 50.75, 7.3, 53.7)])))

# Rutorna längs gränsen mellan Sudan och Sydsudan i Cliopatria 2014 (från trepunkten vid Centralafrikanska republiken, 24,15 grader
# öst, till den vid Etiopien, 34,05 grader öst), med minst 0,2 graders marginal (#1534)
SUDANGRANSEN = [(23.8, 8.3, 25.2, 10.6), (25.2, 8.9, 32.2, 10.9), (32.2, 9.2, 34.3, 12.4)]

DISPUTED = {
    # Krim och Sevastopol: Cliopatria räknar halvön till Ryssland från 2014 och till Ukraina bara till och med 2023.
    # Sverige erkänner inte annekteringen (UD, uttalande 30 september 2022), så halvön ritas som Ukraina.
    'krim': {'area': (('Ukraine', 2013), ('Ukraine', 2024)), 'from': 2014,
             'remove': ['ryska-federationen'], 'add': ['ukraina']},
    # Västbanken med Östra Jerusalem, Gaza och Golanhöjderna: Cliopatria räknar dem till Israel från 1967. Enligt UD
    # (Handel med Israel och Palestina) är de ockuperade och ingår inte i Israel inom 1967 års gränser.
    'ockuperat-1967': {'area': ('ne', ['vastbanken', 'ostra-jerusalem', 'gaza', 'golan']), 'from': 1967,
                       'remove': ['israel'], 'add': []},
    # Staten Palestina, som Sverige erkände 30 oktober 2014 (UD, Palestina): Västbanken med Östra Jerusalem och Gaza
    'palestina': {'area': ('ne', ['vastbanken', 'ostra-jerusalem', 'gaza']), 'from': 2014,
                  'remove': [], 'add': ['palestina']},
    # Nagorno-Karabach (Rikards beslut 2026-11-06): omstritt till och med 2022, Azerbajdzjan från 2023, då UD skriver
    # att Azerbajdzjan återupprättade kontrollen. Cliopatria räknar området och omkringliggande områden till Armenien;
    # det omstridda området är den del av Cliopatrias Armenien som ligger inom Azerbajdzjans gräns i Natural Earth
    'karabach-armenien': {'area': ('ne-snitt', 'azerbajdzjan', ('Republic of Armenia', 2000)), 'from': 1992,
                          'remove': ['armenien'], 'add': []},
    'karabach-azerbajdzjan': {'area': ('ne-snitt', 'azerbajdzjan', ('Republic of Armenia', 2000)), 'from': 2023,
                              'remove': [], 'add': ['azerbajdzjan']},
    # Abchazien och Sydossetien ritas som Georgien (Rikards beslut; UD: Sverige stöder Georgiens territoriella integritet)
    'abchazien-sydossetien': {'area': ('ne', ['abchazien', 'sydossetien']), 'from': 1992,
                              'remove': [], 'add': ['georgien']},
    # Transnistrien ritas som Moldavien (Rikards beslut; UD beskriver Transnistrien som en region i Moldavien)
    'transnistrien': {'area': ('ne', ['transnistrien']), 'from': 1992, 'remove': [], 'add': ['moldavien']},
    # Norra Cypern ritas som Cypern (Rikards beslut; UD: Sverige erkänner inte Norra Cypern, FN:s resolution 541/1983).
    # Cliopatria har hela ön som Republiken Cypern till och med 1975 och Norra Cypern som egen stat från 1976; området är
    # Cyperns gräns 1970 minus gränsen 2000
    'norra-cypern': {'area': (('Republic of Cyprus', 1970), ('Republic of Cyprus', 2000)), 'from': 1976,
                     'remove': [], 'add': ['cypern']},
    # Östtimor: Sverige erkände aldrig Indonesiens ockupation 1975 (UD, Östtimor), och landet blev självständigt
    # 20 maj 2002 efter FN:s förvaltning från oktober 1999 (FN, UNTAET). Cliopatria räknar området till Indonesien
    # 1976–2005; det är Indonesiens gräns 2005 minus gränsen 2006. Det räknas inte till Indonesien och visas utan
    # stat 1976–2001 (som Golanhöjderna), och som Östtimor från 2002
    'osttimor-indonesien': {'area': (('Republic of Indonesia', 2005), ('Republic of Indonesia', 2006)), 'from': 1976,
                            'remove': ['indonesien'], 'add': []},
    'osttimor': {'area': (('Republic of Indonesia', 2005), ('Republic of Indonesia', 2006)), 'from': 2002,
                 'remove': [], 'add': ['osttimor']},
    # Ockupation och inbördeskrig (#1332, docs/beslut/2026-11-13-ockupation-och-inbordeskrig.md): den internationellt
    # erkända staten ritas, med sin egen gräns i Cliopatria (fill i GROUPS), och klipps här bort ur den makt som
    # Cliopatria ritar i stället. Området är statens gräns ett visst år ('clio', namn, år), och `to` är sista året.
    # Tjeckoslovakien 1969–1991: Cliopatria räknar landet till Sovjetunionen 1969–1990 och till båda 1991
    'tjeckoslovakien-sovjet': {'area': ('clio', 'Czechoslovakia', 1968), 'from': 1969, 'to': 1991,
                               'remove': ['sovjetunionen'], 'add': []},
    # Afghanistan 1979–1989: Cliopatria räknar delar av landet till Sovjetunionen
    'afghanistan-sovjet': {'area': ('clio', 'Republic of Afghanistan', 1978), 'from': 1979, 'to': 1989,
                           'remove': ['sovjetunionen'], 'add': []},
    # Irak från 2006: Cliopatria räknar landet till USA 2006–2023 (från 2014 samtidigt med Irak)
    'irak-usa': {'area': ('clio', 'Iraqi Republic', 2005), 'from': 2006, 'remove': ['usa'], 'add': []},
    # Västberlin och Östberlin 1949–1990 (#1731, beslut 2026-11-15-vastberlin-grans.md). Cliopatrias hål i DDR för Västberlin
    # stämmer bara ungefär (det täcker delar av Östberlin, och södra Västberlin ligger i DDR) och saknas 1973–1975.
    # Västberlin är i stället gränsen ur "Verlauf der Berliner Mauer, 1989" (tools/vastberlin.geojson, byggd med
    # tools/vastberlin.py), som klipps ur DDR, och Östberlin (hela Berlin i Natural Earth admin 1 minus Västberlin) läggs till DDR
    'ostberlin-ddr': {'area': ('skillnad', ('ne', ['berlin']), ('geojson', 'tools/vastberlin.geojson')), 'from': 1949,
                      'to': 1990, 'strict': True, 'remove': [], 'add': ['osttyskland']},
    'vastberlin-ddr': {'area': ('geojson', 'tools/vastberlin.geojson'), 'from': 1949, 'to': 1990, 'strict': True,
                       'remove': ['osttyskland'], 'add': []},
    # Femte republiken: Cliopatria räknar en bit av Västberlin (den franska sektorn) till Frankrike 1958–2023. Den syns med
    # den finare förenklingen ovan och tas bort
    'frankrike-berlin': {'area': ('rutor', [(13.0, 52.3, 13.8, 52.8)]), 'parts': True,
                         'from': 1958, 'remove': ['frankrike'], 'add': []},
    # Cliopatria räknar också en bit vid Wangen im Allgäu (den franska zonens Lindau, som kom tillbaka till Bayern 1955)
    # till Frankrike 1950–2023; i Femte republiken tas den bort
    'frankrike-lindau': {'area': ('rutor', [(9.3, 47.3, 10.4, 48.0)]), 'parts': True,
                         'from': 1958, 'remove': ['frankrike'], 'add': []},
    # Tyskland 1920–1990, fortsättning (#1730). Saarområdet styrdes av Nationernas förbund 1920 till 1 mars 1935
    # (en.wikipedia "Territory of the Saar Basin"); Cliopatria räknar det till Frankrike till och med 1931 och till
    # Weimarrepubliken 1932–1935. Det visas utan stat 1920–1934. Området är Frankrikes gräns 1931 minus gränsen 1932.
    # strict: förenklingen av Frankrike (0,3 grader) buktar annars in över Saarbrücken, också 1935–1939
    # Området klipps mot Tysklands gräns i Natural Earth, annars räknas också en bit av Lorraine (Forbach) dit (#1750)
    'saar-nf': {'area': SAAR, 'from': 1920, 'to': 1934,
                'strict': True, 'remove': ['weimarrepubliken', 'nazityskland'], 'add': []},
    'saar-frankrike': {'area': SAAR, 'from': 1920,
                       'to': 1939, 'strict': True, 'remove': ['franska-kolonialvaldet'], 'add': []},
    # Kehl: Cliopatria räknar staden till Förbundsrepubliken från 1950 och till Fjärde republiken till och med 1949
    # (en.wikipedia "Kehl": frigiven i 42 delar 29 juli 1949–8 april 1953). Fjärde republiken har sin gräns från 1949
    # också 1950–1957 efter sammanslagningen och förenklingen; Västtysklands gräns klipps bort ur den från 1950
    'kehl': {'area': ('clio', 'Federal Republic of Germany', 1950), 'from': 1950, 'to': 1957, 'strict': True,
             'remove': ['franska-kolonialvaldet'], 'add': []},
    # Selfkant och Elten: annekterade av Nederländerna 23 april 1949 och tillbaka till Västtyskland 1 augusti 1963
    # (en.wikipedia "Dutch annexation of German territory after the Second World War"). Cliopatria räknar dem till
    # Nederländerna alla år. Området är den del av Cliopatrias Nederländerna som ligger inom Tysklands gräns i Natural
    # Earth (utan Duivelsberg, som är kvar i Nederländerna)
    # Hela Tysklands sida av gränsen mot Nederländerna läggs till (rutan längs gränsen), så att inga tomma fält blir kvar där
    # Nederländernas förenklade gräns har klippts bort (Gangelt, #1750)
    'selfkant-elten': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [(5.85, 50.75, 7.3, 53.7)])), 'from': 1963, 'strict': True,
                       'remove': [], 'add': ['vasttyskland', 'tyskland']},
    # Ur Nederländerna klipps hela Tysklands gräns i Natural Earth, så att den förenklade gränsen inte buktar in igen
    'selfkant-elten-nl': {'area': ('ne', ['tyskland']), 'from': 1963, 'strict': True, 'remove': ['nederlanderna'], 'add': []},
    # Ratzeburg: Cliopatrias gräns mellan DDR och Västtyskland är grov, och Ratzeburg i Schleswig-Holstein ligger i DDR.
    # Västtysklands delstater längs gränsen (Natural Earth admin 1) klipps ur DDR, och den del av DDR som ligger i dem
    # läggs till Västtyskland
    'granslander-ddr': {'area': ('ne', ['vasttyska-granslander']), 'from': 1949, 'to': 1990, 'strict': True,
                        'remove': ['osttyskland'], 'add': []},
    'granslander-brd': {'area': ('snitt', ('ne', ['vasttyska-granslander']), ('rutor', [INNERTYSKA])), 'from': 1950,
                        'to': 1990, 'strict': True, 'remove': [], 'add': ['vasttyskland']},
    # Och från andra hållet (#1750): DDR:s delstater klipps ur Västtyskland och läggs till DDR inom en ruta längs gränsen
    # (Mödlareuth, Amt Neuhaus och Hirschberg låg i DDR). Rutan når inte Polen, Tjeckoslovakien eller Berlin
    'ostlander-brd': {'area': ('ne', ['osttyska-lander']), 'from': 1950, 'to': 1990, 'strict': True,
                      'remove': ['vasttyskland'], 'add': []},
    'ostlander-ddr': {'area': ('snitt', ('ne', ['osttyska-lander']), ('rutor', [INNERTYSKA])), 'from': 1949, 'to': 1990,
                      'strict': True, 'remove': [], 'add': ['osttyskland']},
    # Samma gräns för den sovjetiska zonen 1945–1948, som Cliopatria ritar som en del av Sovjetunionen (Ratzeburg låg i
    # den brittiska zonen, Mödlareuth och Hirschberg i den sovjetiska)
    'granslander-sovjetzon': {'area': ('ne', ['vasttyska-granslander']), 'from': 1945, 'to': 1948, 'strict': True,
                              'remove': ['sovjetunionen'], 'add': []},
    'ostlander-sovjetzon': {'area': ('snitt', ('ne', ['osttyska-lander']), ('rutor', [INNERTYSKA])), 'from': 1945, 'to': 1948,
                            'strict': True, 'remove': [], 'add': ['sovjetunionen']},
    # Polen 1945–1952 (#1332, docs/beslut/2026-11-13-ockupation-och-inbordeskrig.md): Cliopatria saknar Polen och räknar
    # landet till Sovjetunionen. Polen visas med sin gräns 1953 (fill i GROUPS), och den klipps bort ur Sovjetunionen
    'polen-sovjet': {'area': ('skillnad', ('clio', 'Republic of Poland', 1953), ('ne', ['tyskland'])), 'from': 1945, 'to': 1952,
                     'strict': True,
                     'remove': ['sovjetunionen'], 'add': []},
    # Oder–Neisse (#1750): Cliopatrias Polen sträcker sig väster om gränsen (Frankfurt an der Oder och Görlitz ligger i
    # Polen). Tysklands gräns i Natural Earth klipps ur Polen, och den tyska sidan längs gränsen läggs till DDR och Tyskland
    'oder-polen': {'area': ('ne', ['tyskland']), 'from': 1945, 'strict': True, 'remove': ['polen'], 'add': []},
    # och Polens sida av gränsen i rutan (Cliopatrias Polen 1960 utom Tyskland) läggs tillbaka efter förenklingen (Słubice)
    'oder-polen-sida': {'area': ('skillnad', ('snitt', ('clio', 'Republic of Poland', 1960), ('rutor', [ODER])), ('ne', ['tyskland'])),
                        'from': 1945, 'strict': True, 'remove': [], 'add': ['polen']},
    'oder-ddr': {'area': ('snitt', ('ne', ['osttyska-lander']), ('rutor', [ODER])), 'from': 1949, 'to': 1990, 'strict': True,
                 'remove': [], 'add': ['osttyskland']},
    'oder-tyskland': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [ODER])), 'from': 1991, 'strict': True,
                      'remove': [], 'add': ['tyskland']},
    # Och den polska och tjeckiska sidan i rutan (allt utanför Tysklands gräns) klipps ur DDR och Tyskland, så att den
    # förenklade gränsen inte buktar in över Słubice och Zgorzelec
    'oder-ej-tyskland': {'area': ('skillnad', ('rutor', [ODER]), ('ne', ['tyskland'])), 'from': 1949, 'strict': True,
                         'remove': ['osttyskland', 'tyskland'], 'add': []},
    # Kaliningradområdet (#1750): Sovjetunionen förenklas med 0,3 grader, och sedan perioderna delades 1949 och 1953
    # försvann en remsa längs kusten (Baltijsk). Sovjetunionens gräns 1960 i en ruta kring området läggs tillbaka, utom Polen
    # enligt Natural Earth
    'kaliningrad': {'area': ('skillnad', ('snitt', ('clio', 'Union of Soviet Socialist Republics', 1960),
                                          ('rutor', [(19.4, 54.2, 22.95, 55.4)])), ('ne', ['polen-ne'])),
                    'from': 1945, 'to': 1989, 'strict': True, 'remove': [], 'add': ['sovjetunionen']},
    # och Polen i samma ruta klipps bort efter förenklingen, så att Sovjetunionen inte buktar in över Ermland-Masurien
    'kaliningrad-polen': {'area': POLEN_ERMLAND, 'from': 1945, 'to': 1989,
                          'strict': True, 'remove': ['sovjetunionen'], 'add': []},
    # Fria staden Danzig (#1746): Cliopatria räknar Memelområdet till fristaden 1919–1935. Det förvaltades av de allierade
    # till 1923 och hörde sedan till Litauen; delen tas bort som källfel
    # Äldre gränsfel kring Tyskland (#1755)
    # Forbach i Lorraine: Cliopatria räknar en bit av Moselle till Weimarrepubliken från 1932 och till Nazityskland, men den hörde
    # till Frankrike 1919–1940. Frankrikes gräns i Natural Earth klipps ur Tyskland 1920–1939 (inte 1940–1944, då Alsace-Moselle
    # var annekterat i praktiken och Cliopatria räknar det till Nazityskland)
    'frankrike-weimar': {'area': ('ne', ['frankrike-ne']), 'from': 1920, 'to': 1932, 'strict': True, 'efter': True,
                         'remove': ['weimarrepubliken'], 'add': []},
    'frankrike-nazityskland': {'area': ('ne', ['frankrike-ne']), 'from': 1933, 'to': 1939, 'strict': True, 'efter': True,
                               'remove': ['nazityskland'], 'add': []},
    # Efter ockupationen av Rhenlandet (Cliopatria: till och med 1929) följer gränsen Natural Earth på båda sidor 1930–1939, så
    # att förenklingen inte lämnar tomma fält eller ritar dubbelt. Saarområdet hålls utanför Tyskland till och med 1934.
    # Natural Earths gräns vid Lauter ligger ungefär en km fel: Wissembourg och Lauterbourg hamnar i Tyskland (Om kartan)
    'gransen-weimar': {'area': ('skillnad', TYSKA_SIDAN, SAAR), 'from': 1930, 'to': 1932, 'strict': True, 'efter': True,
                       'remove': [], 'add': ['weimarrepubliken']},
    'gransen-nazityskland-saar': {'area': ('skillnad', TYSKA_SIDAN, SAAR), 'from': 1933, 'to': 1934, 'strict': True, 'efter': True,
                                  'remove': [], 'add': ['nazityskland']},
    'gransen-nazityskland': {'area': TYSKA_SIDAN, 'from': 1935, 'to': 1939, 'strict': True, 'efter': True,
                             'remove': [], 'add': ['nazityskland']},
    'gransen-frankrike': {'area': FRANSKA_SIDAN, 'from': 1930, 'to': 1939, 'strict': True, 'efter': True,
                          'remove': [], 'add': ['franska-kolonialvaldet']},
    # Perioden 1930–1931 förenklas för sig och buktar då in över Schweiz och Luxemburg; deras gränser i Cliopatria klipps bort
    'frankrike-1930-grannar': {'area': ('clio-union', [('Swiss Confederation', 1930), ('Luxembourg', 1930)]), 'from': 1930,
                               'to': 1931, 'strict': True, 'efter': True, 'remove': ['franska-kolonialvaldet'], 'add': []},
    # och Schweiz förenklade gräns buktar ut över fransk mark (Jura, Genève); Frankrike i Natural Earth klipps ur Schweiz 1930–1939
    'schweiz-frankrike': {'area': ('ne', ['frankrike-ne']), 'from': 1930, 'to': 1939, 'strict': True, 'efter': True,
                          'remove': ['schweiz'], 'add': []},
    # Jura och Sundgau (#1771): gränsen mellan Frankrike och Schweiz är i stort sett från 1815 (en.wikipedia "France–Switzerland
    # border"; små byten, bland annat för flygplatsen i Genève 1960). I rutan JURA följer den Natural Earth från 1919, så att Sundgau
    # och Jura inte blir utan stat (Altkirch, Delle, Ferrette) och länderna inte ritas över varandra. 1940–1944 följer Frankrikes sida
    # Cliopatria
    'frankrike-jura': {'area': ('snitt', ('ne', ['frankrike-ne']), ('rutor', [JURA])), 'from': 1919, 'to': 1939, 'strict': True,
                       'efter': True, 'remove': [], 'add': ['franska-kolonialvaldet']},
    'frankrike-jura-1945': {'area': ('snitt', ('ne', ['frankrike-ne']), ('rutor', [JURA])), 'from': 1945, 'strict': True,
                            'efter': True, 'remove': [], 'add': ['franska-kolonialvaldet', 'frankrike']},
    'jura-frankrike-schweiz': {'area': ('snitt', ('ne', ['frankrike-ne']), ('rutor', [JURA])), 'from': 1919, 'strict': True,
                               'efter': True, 'remove': ['schweiz'], 'add': []},
    'jura-schweiz': {'area': ('snitt', ('ne', ['schweiz-ne']), ('rutor', [JURA])), 'from': 1919, 'strict': True, 'efter': True,
                     'remove': ['franska-kolonialvaldet', 'frankrike', 'nazityskland'], 'add': ['schweiz']},
    'gransen-frankrike-tyska-sidan': {'area': TYSKA_SIDAN, 'from': 1930, 'to': 1939, 'strict': True, 'efter': True,
                                      'remove': ['franska-kolonialvaldet'], 'add': []},
    # Lindau: Cliopatria har ingen stat där från 1950. Landkreis Lindau hörde till den franska zonen och återförenades med Bayern
    # 1 september 1955 (de.wikipedia "Landkreis Lindau (Bodensee)"), men staden och kretsen var med i förbundsdagsvalet 1949
    # (en.wikipedia "Oberallgäu (electoral district)"). Tysklands gräns i Natural Earth i rutan läggs till Västtyskland från 1950
    # och till Tyskland, och klipps ur Fjärde republiken (som har en bit vid Wangen till 1957)
    'lindau-brd': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [LINDAU])), 'from': 1950, 'to': 1990, 'strict': True, 'efter': True,
                   'remove': [], 'add': ['vasttyskland']},
    'lindau-tyskland': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [LINDAU])), 'from': 1991, 'strict': True, 'efter': True,
                        'remove': [], 'add': ['tyskland']},
    # Österrikes och Schweiz förenklade gränser går in över Lindau och Bodensees tyska strand
    'lindau-grannar': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [LINDAU])), 'from': 1945, 'strict': True, 'efter': True,
                       'remove': ['osterrike', 'schweiz'], 'add': []},
    'lindau-frankrike': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [LINDAU])), 'from': 1950, 'to': 1957, 'strict': True, 'efter': True,
                         'remove': ['franska-kolonialvaldet'], 'add': []},
    # Selb i Bayern: Tjeckoslovakiens förenklade gräns buktar in över gränsen. Tysklands gräns i Natural Earth klipps ur den
    'tyskland-tjeckoslovakien': {'area': ('ne', ['tyskland']), 'from': 1945, 'to': 1992, 'strict': True, 'efter': True,
                                 'remove': ['tjeckoslovakien'], 'add': []},
    # Gränsen mellan Tjeckoslovakien och Tyskland följer Natural Earth på båda sidor 1949–1992, så att inga tomma fält blir kvar
    'tjeckiska-sidan': {'area': ('ne', ['tjeckien-ne']), 'from': 1945, 'to': 1992, 'strict': True, 'efter': True,
                        'remove': ['vasttyskland', 'osttyskland'], 'add': ['tjeckoslovakien']},
    'tjeckiska-sidan-tyskland': {'area': ('ne', ['tjeckien-ne']), 'from': 1991, 'strict': True, 'efter': True,
                                 'remove': ['tyskland'], 'add': []},
    'tjeckiska-gransen-brd': {'area': ('snitt', ('ne', ['vasttyska-granslander']), ('rutor', [TJECKISKA_GRANSEN])), 'from': 1950,
                              'to': 1990, 'strict': True, 'efter': True, 'remove': [], 'add': ['vasttyskland']},
    'tjeckiska-gransen-ddr': {'area': ('snitt', ('ne', ['osttyska-lander']), ('rutor', [TJECKISKA_GRANSEN])), 'from': 1949,
                              'to': 1990, 'strict': True, 'efter': True, 'remove': [], 'add': ['osttyskland']},
    'tjeckiska-gransen-tyskland': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [TJECKISKA_GRANSEN])), 'from': 1991,
                                   'strict': True, 'efter': True, 'remove': [], 'add': ['tyskland']},
    # Tjeckien (från 1992 i Cliopatria) och Österrike: deras förenklade gränser går annars in över den tyska (och för Österrike den tjeckiska)
    # sidan, som nu följer Natural Earth
    'tjeckiska-gransen-tjeckien': {'area': ('snitt', ('ne', ['tyskland']), ('rutor', [TJECKISKA_GRANSEN])), 'from': 1992,
                                   'strict': True, 'efter': True, 'remove': ['tjeckien'], 'add': []},
    'tjeckiska-sidan-tjeckien': {'area': ('ne', ['tjeckien-ne']), 'from': 1992, 'strict': True, 'efter': True,
                                 'remove': [], 'add': ['tjeckien']},
    'tjeckiska-gransen-osterrike': {'area': ('snitt', ('ne', ['tyskland', 'tjeckien-ne']), ('rutor', [TJECKISKA_GRANSEN])),
                                    'from': 1945, 'strict': True, 'efter': True, 'remove': ['osterrike'], 'add': []},
    # Gangelt: Nederländernas förenklade gräns 1950–1962 tar med en bit av Västtyskland. Förbundsrepublikens gräns 1955 i
    # Cliopatria (utan Selfkant och Elten) klipps ur Nederländerna, utom det som ligger i Nederländerna i Natural Earth
    'brd-nederlanderna': {'area': BRD_MOT_NEDERLANDERNA, 'from': 1950, 'to': 1962, 'strict': True, 'efter': True,
                          'remove': ['nederlanderna'], 'add': ['vasttyskland']},
    # Och från andra hållet: Cliopatrias Förbundsrepublik tar med nederländsk mark vid (6,07, 51,28). Nederländerna i Natural
    # Earth klipps ur Västtyskland och Tyskland
    'nederlanderna-brd': {'area': ('ne', ['nederlanderna-ne']), 'from': 1950, 'strict': True, 'efter': True,
                          'remove': ['vasttyskland', 'tyskland'], 'add': []},
    # och läggs till Nederländerna, vars förenklade gräns annars inte når fram till gränsen
    'nederlanderna-ne': {'area': ('ne', ['nederlanderna-ne']), 'from': 1950, 'strict': True, 'efter': True,
                         'remove': [], 'add': ['nederlanderna']},
    # Kaliningradområdet 1990–2024: Sovjetunionens och Ryska federationens förenklade gränser lämnar stora tomma ytor (Baltijsk
    # utan stat 1992–2013). Rysslands gräns i Natural Earth i rutan läggs tillbaka, och Polen och Litauen i Natural Earth klipps bort
    # Från 1945 (#1771): Sovjetunionens förenklade gräns lämnar annars rysk mark vid gränsen mot Polen utan stat 1945–1989
    'kaliningrad-sovjet': {'area': ('ne', ['kaliningrad-ne']), 'from': 1945, 'to': 1991, 'strict': True, 'efter': True,
                           'remove': [], 'add': ['sovjetunionen']},
    'kaliningrad-ryssland': {'area': ('ne', ['kaliningrad-ne']), 'from': 1992, 'strict': True, 'efter': True,
                             'remove': [], 'add': ['ryska-federationen']},
    # Och från andra hållet: Polens och Litauens förenklade gränser går in i Kaliningradområdet
    'polen-kaliningrad': {'area': ('ne', ['kaliningrad-ne']), 'from': 1945, 'strict': True, 'efter': True,
                          'remove': ['polen'], 'add': []},
    'litauen-kaliningrad': {'area': ('ne', ['kaliningrad-ne']), 'from': 1990, 'strict': True, 'efter': True,
                            'remove': ['litauen'], 'add': []},
    # och Litauens sida av gränsen läggs till Litauen, vars förenklade gräns annars inte når fram (Kybartai, Pagėgiai)
    'litauen-ne': {'area': LITAUEN_UTAN_RU, 'from': 1990, 'strict': True, 'efter': True,
                   'remove': [], 'add': ['litauen']},
    'kaliningrad-grannar': {'area': POLEN_ERMLAND, 'from': 1990,
                            'strict': True, 'efter': True, 'remove': ['sovjetunionen', 'ryska-federationen'], 'add': []},
    # Ermland (#1771): Polens förenklade gräns når inte fram till gränsen mot Kaliningradområdet, så polsk mark vid (20,55, 54,36) var
    # utan stat från 1945 (Cliopatria räknar den till Sovjetunionen och Ryssland, som klipps bort ovan). Polen i Natural Earth i rutan
    # läggs till Polen
    'polen-ermland': {'area': POLEN_ERMLAND, 'from': 1945, 'strict': True, 'efter': True,
                      'remove': [], 'add': ['polen']},
    # och klipps ur Sovjetunionen också efter avrundningen ('kaliningrad-polen' klipps före den, och avrundningen till 0,1 grad
    # lägger tillbaka en remsa polsk mark)
    'ermland-sovjet': {'area': POLEN_ERMLAND, 'from': 1945, 'to': 1991, 'strict': True,
                       'efter': True, 'remove': ['sovjetunionen'], 'add': []},
    # Vid trelandspunkten med Litauen (Suwałki) går Polens och Litauens förenklade gränser in i varandra
    'polen-litauen': {'area': ('ne', ['litauen-ne']), 'from': 1945, 'strict': True, 'efter': True, 'remove': ['polen'], 'add': []},
    'litauen-polen': {'area': POLEN_ERMLAND, 'from': 1990, 'strict': True, 'efter': True,
                      'remove': ['litauen'], 'add': []},
    # och vid trelandspunkten med Tjeckoslovakien (Zittau) Polens och Tjeckoslovakiens; Polens sida i rutan (Bogatynia) läggs till Polen
    'polen-tjeckien': {'area': ('ne', ['tjeckien-ne']), 'from': 1945, 'strict': True, 'efter': True, 'remove': ['polen'], 'add': []},
    'tjeckien-polen': {'area': ('snitt', ('ne', ['polen-ne']), ('rutor', [TJECKISKA_GRANSEN])), 'from': 1945, 'strict': True,
                       'efter': True, 'remove': ['tjeckoslovakien', 'tjeckien', 'sovjetunionen'], 'add': ['polen']},
    # Kuriska näset (#1771): Cliopatria har ingen stat på näset. Den litauiska delen med Nida hörde till Litauen från 1945
    # (en.wikipedia "Curonian Spit"); Litauen i Natural Earth (rutan når 55,75 grader nord) läggs till Sovjetunionen 1945–1989.
    # Från 1990 läggs den till Litauen ('litauen-ne' ovan)
    'litauen-sovjet': {'area': ('ne', ['litauen-ne']), 'from': 1945, 'to': 1989, 'strict': True, 'efter': True,
                       'remove': [], 'add': ['sovjetunionen']},
    # och Litauens sida mot Kaliningradområdet klipps ur Sovjetunionen och Ryssland från 1990 (Natural Earth minus Cliopatrias Ryssland)
    'kaliningrad-grannar-lt': {'area': ('snitt', LITAUEN_UTAN_RU, ('rutor', [KALININGRAD])), 'from': 1990, 'strict': True,
                               'efter': True, 'remove': ['sovjetunionen', 'ryska-federationen'], 'add': []},
    # Remsorna som Natural Earth räknar till Polen eller Litauen men Cliopatria till Ryssland (Bagrationovsk) hör till Kaliningradområdet
    'kaliningrad-remsa-pl': {'area': REMSA_PL, 'from': 1945, 'strict': True, 'efter': True,
                             'remove': ['polen'], 'add': ['sovjetunionen', 'ryska-federationen']},
    'danzig-memel': {'area': ('rutor', [(20.8, 55.0, 22.6, 56.0)]), 'parts': True, 'from': 1919, 'to': 1935,
                     'remove': ['fria-staden-danzig'], 'add': []},
    # Cliopatrias gräns för fristaden överlappar grannarnas (Polen i väster, Ostpreussen i öster); grannarnas gränser i
    # Cliopatria klipps bort, så att inget ritas två gånger. Gränsen stämmer ändå bara ungefär (Zoppot ligger i Polen och
    # Marienburg i fristaden), vilket står i rutan Om kartan
    'danzig-grannar': {'area': ('clio-union', [('Second Polish Republic', 1925), ('Weimar Republic', 1925), ('Nazi Germany', 1937)]),
                       'from': 1920, 'to': 1939, 'strict': True, 'remove': ['fria-staden-danzig'], 'add': []},
    # och fristaden klipps ur Weimarrepublikens och Nazitysklands förenklade gränser, som annars buktar in över den
    'danzig-ur-tyskland': {'area': ('clio', 'Free City of Danzig', 1936), 'from': 1920, 'to': 1939, 'strict': True,
                           'remove': ['weimarrepubliken', 'nazityskland'], 'add': []},
    # Nazi Germany har småbitar (mest vatten mellan grannarnas gränser) i länder som Tyskland aldrig höll eller ännu inte
    # hade ockuperat. ('rutor', [(väst, syd, öst, nord), ...]) med 'parts': bara de delar av riket som ligger helt inne i en
    # ruta tas bort, så att rutan aldrig klipper i rikets sammanhängande yta
    'nazityskland-sverige': {'area': ('rutor', [(18.2, 59.2, 18.8, 59.6)]), 'parts': True,  # Stockholms skärgård
                             'from': 1933, 'to': 1944, 'remove': ['nazityskland'], 'add': []},
    'nazityskland-norge': {'area': ('rutor', [(10.3, 63.4, 10.9, 63.7), (21.6, 70.0, 22.1, 70.5)]), 'parts': True,
                           'from': 1933, 'to': 1939, 'remove': ['nazityskland'], 'add': []},  # Trondheim och Finnmark före 1940
    'nazityskland-karelen': {'area': ('rutor', [(33.8, 61.0, 36.3, 63.4)]), 'parts': True,  # ryska Karelen
                             'from': 1933, 'to': 1944, 'remove': ['nazityskland'], 'add': []},
    'nazityskland-estland': {'area': ('rutor', [(27.6, 57.7, 28.2, 59.1)]), 'parts': True,  # vid Peipussjön före 1941
                             'from': 1933, 'to': 1940, 'remove': ['nazityskland'], 'add': []},
    'nazityskland-naxos': {'area': ('rutor', [(25.2, 36.9, 25.7, 37.3)]), 'parts': True,  # Naxos före 1941
                           'from': 1933, 'to': 1940, 'remove': ['nazityskland'], 'add': []},
    'nazityskland-levanten': {'area': ('rutor', [(35.6, 32.6, 36.0, 33.4)]), 'parts': True,
                              'from': 1933, 'to': 1944, 'remove': ['nazityskland'], 'add': []},
    # Gränsen mellan Sudan och Sydsudan (#1534): Cliopatrias gränser 2014 delar inget område, men förenklingen (0,2 grader) ritar
    # cirka 1 400 km2 i båda länderna och lämnar cirka 2 500 km2 utan stat längs gränsen. I rutorna längs gränsen (SUDANGRANSEN)
    # läggs båda ländernas ogenomskurna gräns i Cliopatria 2014 tillbaka efter förenklingen, och var och en klipps ur grannen
    'sudan-mot-sydsudan': {'area': ('snitt', ('clio', 'Republic of Sudan', 2014), ('rutor', SUDANGRANSEN)), 'from': 2011,
                           'strict': True, 'efter': True, 'remove': ['sydsudan'], 'add': ['sudan']},
    'sydsudan-mot-sudan': {'area': ('snitt', ('clio', 'South Sudan', 2014), ('rutor', SUDANGRANSEN)), 'from': 2011,
                           'strict': True, 'efter': True, 'remove': ['sudan'], 'add': ['sydsudan']},
    # Zanzibar (#1534): Tanganyika och Zanzibar gick samman 26 april 1964 (FN, un-member-tanzania). Cliopatria saknar Pemba helt
    # och räknar Unguja till Tanzania först från 1967, och förenklingen tar bort Unguja. Öarna (Unguja och Pemba i Tanzanias gräns i
    # Natural Earth) läggs till Tanzania från 1964, efter förenklingen
    'zanzibar-tanzania': {'area': ('ne', ['unguja-ne', 'pemba-ne']), 'from': 1964, 'strict': True, 'efter': True,
                          'remove': [], 'add': ['tanzania']},
    # Bodensee, Basel och Vorarlberg (#1771): i rutorna ALP följer gränserna mellan Tyskland, Schweiz, Österrike och Frankrike
    # Natural Earth från 1919. Varje lands mark läggs till den stat som höll den och klipps ur grannarna. Källfel i Cliopatria:
    # Hörbranz i Weimarrepubliken och Nazityskland 1920–1937, Konstanz i Schweiz till 1949, Kreuzlingen i Förbundsrepubliken från
    # 1950, Basel i Fjärde republiken 1946–1949 och Riehen i Nazityskland 1940–1944 (Schweiz invaderades aldrig, en.wikipedia
    # "Switzerland during the World Wars"). Tysk mark 1945–1949 följer ockupationszonerna i Cliopatria, utom Bayern (nedan)
    'alp-schweiz': {'area': ('snitt', ('ne', ['schweiz-ne']), ALP), 'from': 1919, 'strict': True, 'efter': True,
                    'remove': ['osterrike', 'tyska-riket', 'weimarrepubliken', 'nazityskland', 'franska-kolonialvaldet', 'frankrike',
                               'vasttyskland', 'tyskland'], 'add': ['schweiz']},
    'alp-schweiz-zoner': {'area': ('snitt', ('ne', ['schweiz-ne']), ALP), 'from': 1945, 'to': 1949, 'strict': True, 'efter': True,
                          'remove': ['usa'], 'add': []},
    # Österrike 1919–1937 och från 1946 (Vorarlberg förblev österrikiskt efter folkomröstningen 1919, en.wikipedia "Vorarlberg");
    # Nazityskland 1938–1944. 1945 följer Cliopatria (Vorarlberg i den franska zonen)
    'alp-osterrike': {'area': ('snitt', ('ne', ['osterrike-ne']), ALP), 'from': 1919, 'strict': True, 'efter': True,
                      'remove': ['schweiz', 'tyska-riket', 'weimarrepubliken', 'vasttyskland', 'tyskland'], 'add': ['osterrike']},
    'alp-osterrike-1933': {'area': ('snitt', ('ne', ['osterrike-ne']), ALP), 'from': 1933, 'to': 1937, 'strict': True, 'efter': True,
                           'remove': ['nazityskland'], 'add': []},
    'alp-osterrike-anschluss': {'area': ('snitt', ('ne', ['osterrike-ne']), ALP), 'from': 1938, 'to': 1944, 'strict': True,
                                'efter': True, 'remove': [], 'add': ['nazityskland']},
    'alp-osterrike-zoner': {'area': ('snitt', ('ne', ['osterrike-ne']), ALP), 'from': 1946, 'strict': True, 'efter': True,
                            'remove': ['usa', 'franska-kolonialvaldet'], 'add': []},
    # Tysklands mark: Tyska riket 1919, Weimarrepubliken, Nazityskland, Västtyskland och Tyskland (var och en bara sina år)
    'alp-tyskland': {'area': ('snitt', ('ne', ['tyskland']), ALP), 'from': 1919, 'strict': True, 'efter': True,
                     'remove': ['schweiz', 'osterrike'], 'add': ['tyska-riket', 'weimarrepubliken', 'nazityskland', 'vasttyskland', 'tyskland']},
    'alp-tyskland-frankrike': {'area': ('snitt', ('ne', ['tyskland']), ALP), 'from': 1919, 'to': 1944, 'strict': True, 'efter': True,
                               'remove': ['franska-kolonialvaldet'], 'add': []},
    'alp-tyskland-frankrike-1950': {'area': ('snitt', ('ne', ['tyskland']), ALP), 'from': 1950, 'strict': True, 'efter': True,
                                    'remove': ['franska-kolonialvaldet', 'frankrike'], 'add': []},
    # Frankrikes mark vid Basel (Saint-Louis, Sundgau). 1940–1944 följer Cliopatria (Alsace annekterat i praktiken)
    'alp-frankrike-schweiz': {'area': ('snitt', ('ne', ['frankrike-ne']), ALP), 'from': 1919, 'strict': True, 'efter': True,
                              'remove': ['schweiz'], 'add': []},
    'alp-frankrike': {'area': ('snitt', ('ne', ['frankrike-ne']), ALP), 'from': 1919, 'to': 1939, 'strict': True, 'efter': True,
                      'remove': ['tyska-riket', 'weimarrepubliken', 'nazityskland'], 'add': ['franska-kolonialvaldet']},
    'alp-frankrike-1945': {'area': ('snitt', ('ne', ['frankrike-ne']), ALP), 'from': 1945, 'strict': True, 'efter': True,
                           'remove': ['vasttyskland', 'tyskland'], 'add': ['franska-kolonialvaldet', 'frankrike']},
    # Liechtenstein ur Natural Earth: Österrikes och Schweiz förenklade gränser går in över landet
    'alp-liechtenstein': {'area': ('ne', ['liechtenstein']), 'from': 1919, 'strict': True, 'efter': True,
                          'remove': ['osterrike', 'schweiz'], 'add': []},
    # Bayern och Sachsen 1945–1949 (#1771): Cliopatrias zoner når inte fram till gränserna mot Tjeckoslovakien och Österrike, så
    # tyskt land vid Zittau, i Bayerska skogen och vid Passau var utan stat. Den amerikanska zonen omfattade Bayern utom Lindau och
    # den sovjetiska Sachsen och Thüringen (en.wikipedia "Allied-occupied Germany"); delstaterna i Natural Earth i rutorna läggs till
    'usazon-bayern': {'area': ('snitt', ('ne', ['vasttyska-granslander']), ('rutor', [TJECKISKA_GRANSEN, ALPGRANSEN])),
                      'from': 1945, 'to': 1949, 'strict': True, 'efter': True, 'remove': ['sovjetunionen'], 'add': ['usa']},
    # (delstaterna snittas med Tyskland i Natural Earth, eftersom deras gräns vid Neisse inte är exakt densamma)
    'sovjetzon-sachsen': {'area': ('skillnad', ('snitt', ('snitt', ('ne', ['osttyska-lander']), ('ne', ['tyskland'])),
                                                ('rutor', [TJECKISKA_GRANSEN, ODER])), ('ne', ['berlin'])),
                          'from': 1945, 'to': 1948, 'strict': True, 'efter': True, 'remove': ['usa'], 'add': ['sovjetunionen']},
    # Södra Baden och Württemberg-Hohenzollern hörde till den franska zonen (samma källa): Baden-Württemberg i Natural Earth i rutan
    # vid Bodensee (Tyskland utom Bayern) läggs till Fjärde republiken 1945–1949. Bayerns del (Lindau i den franska zonen, resten i
    # den amerikanska) följer Cliopatria, eftersom gränsen för Landkreis Lindau inte finns i våra källor
    'franskzon-baden-wurttemberg': {'area': ('skillnad', ('snitt', ('ne', ['tyskland']), ('rutor', [HOCHRHEIN])),
                                             ('ne', ['vasttyska-granslander'])),
                                    'from': 1945, 'to': 1949, 'strict': True, 'efter': True, 'remove': ['usa'],
                                    'add': ['franska-kolonialvaldet']},
    # och Tjeckoslovakiens sida, som Cliopatria 1947–1949 ritar också i USA och Sovjetunionen
    'tjeckoslovakien-zoner': {'area': ('ne', ['tjeckien-ne']), 'from': 1947, 'to': 1949, 'strict': True, 'efter': True,
                              'remove': ['usa', 'sovjetunionen'], 'add': []},
}


def ne_shapes():
    """Områdena och länderna i tools/ne-omstridda-omraden.geojson (Natural Earth): {id: geometri}."""
    return {f['properties']['id']: shape(f['geometry']).buffer(0)
            for f in json.loads((ROOT / 'tools/ne-omstridda-omraden.geojson').read_text())['features']}


def disputed_areas(by_name):
    """Områdena i DISPUTED som geometrier: {namn: geometri}."""
    def at(name, y):
        for f in by_name.get(name, []):
            if f['properties']['FromYear'] <= y <= f['properties']['ToYear']:
                return shape(f['geometry']).buffer(0)
        raise SystemExit(f'DISPUTED: {name} saknas år {y} i Cliopatria')
    ne = ne_shapes()
    def area(a):
        if a[0] == 'clio':  # en stats egen gräns i Cliopatria ett visst år (#1332)
            return at(a[1], a[2])
        if a[0] == 'ne':
            return unary_union([ne[i] for i in a[1]])
        if a[0] == 'geojson':  # alla områden i en GeoJSON-fil i repot (Västberlin, #1731)
            return unary_union([shape(f['geometry']).buffer(0) for f in json.loads((ROOT / a[1]).read_text())['features']])
        if a[0] == 'clio-union':  # flera staters gränser i Cliopatria, var och en ett visst år (#1746)
            return unary_union([at(n, y) for n, y in a[1]])
        if a[0] == 'snitt':  # det som två områden har gemensamt (#1750)
            return area(a[1]).intersection(area(a[2]))
        if a[0] == 'skillnad':  # ett område minus ett annat (Östberlin, #1731)
            return area(a[1]).difference(area(a[2]))
        if a[0] == 'rutor':  # rutor (väst, syd, öst, nord), för källfel med 'parts' (#1706)
            return unary_union([box(*r) for r in a[1]])
        if a[0] == 'ne-snitt':  # ett land i Natural Earth snittat med en Cliopatria-post ett visst år
            return ne[a[1]].intersection(at(*a[2]))
        return at(*a[0]).difference(at(*a[1]))
    return {k: area(d['area']) for k, d in DISPUTED.items()}


def apply_disputed(items, gid, areas):
    """Klipper bort eller lägger till områdena i DISPUTED i en dels perioder (start, slut, geometri, yta)."""
    for key, d in DISPUTED.items():
        op = 'remove' if gid in d['remove'] else 'add' if gid in d['add'] else None
        if not op:
            continue
        out = []
        last = d.get('to', 9999)  # to: sista året (ockupation och inbördeskrig, #1332); annars gäller det för alltid
        for a, b, g, ar in items:
            cuts = sorted({a, b + 1} | {c for c in (d['from'], last + 1) if a < c <= b})
            for s, e in ((s, e - 1) for s, e in zip(cuts, cuts[1:])):
                # efter (#1755): området klipps eller läggs till bara efter förenklingen (med strict), så att en liten, lokal
                # rättning inte ändrar hur resten av gränsen förenklas. Perioderna delas ändå vid årtalen; ytan (areaKm2)
                # räknas utan området
                if s < d['from'] or s > last or d.get('efter'):
                    out.append((s, e, g, ar))
                    continue
                if op == 'remove' and d.get('parts'):
                    ng = drop_parts_within(g, areas[key])
                else:
                    ng = g.difference(areas[key]) if op == 'remove' else unary_union([g, areas[key]])
                out.append((s, e, ng, km2(ng)))
        items = out
    return items


def polygons_only(g):
    """Bara polygonerna i en geometri (en differens kan ge en GeometryCollection med linjer och punkter, #1730)."""
    if g.geom_type in ('Polygon', 'MultiPolygon'):
        return g
    parts = [x for x in getattr(g, 'geoms', []) if x.geom_type in ('Polygon', 'MultiPolygon')]
    return unary_union(parts) if parts else Polygon()


def valid_rounded(g, nd):
    """Geometrin som GeoJSON avrundad till nd decimaler. Blir den ogiltig av klippningen eller avrundningen görs den giltig
    och avrundas igen (#1750)."""
    geo = {'type': mapping(g)['type'], 'coordinates': rnd(mapping(g)['coordinates'], nd)}
    for _ in range(3):
        if shape(geo).is_valid:
            break
        # make_valid behåller ytan (buffer(0) kan tappa halva en polygon som korsar sig själv)
        g = polygons_only(shapely.make_valid(shape(geo)))
        geo = {'type': mapping(g)['type'], 'coordinates': rnd(mapping(g)['coordinates'], nd)}
    return geo


def drop_parts_within(g, area):
    """g utan de delar av en multipolygon som ligger helt inne i area (källfel, #1706). Övriga delar är oförändrade."""
    parts = list(g.geoms) if g.geom_type == 'MultiPolygon' else [g]
    keep = [q for q in parts if not q.within(area)]
    if not keep:
        return Polygon()
    return MultiPolygon(keep) if len(keep) > 1 else keep[0]


def cut_parts(g, cut):
    """g minus cut, där bara de delar av en multipolygon som skär cut klipps. De andra delarna behåller sina
    ringar oförändrade, så att förenklingen efteråt blir densamma som förut (Själland när Island klipps bort, #1381)."""
    parts = list(g.geoms) if g.geom_type == 'MultiPolygon' else [g]
    keep = [q for q in parts if not q.intersects(cut)]
    hit = [q.difference(cut) for q in parts if q.intersects(cut)]
    hit = [x for h in hit for x in (h.geoms if hasattr(h, 'geoms') else [h]) if x.geom_type == 'Polygon' and not x.is_empty]
    out = keep + hit
    if not out:
        return Polygon()
    return MultiPolygon(out) if len(out) > 1 else out[0]


def minus_others(items, names, by_name, keep_west_of=None):
    """Klipper bort andra Cliopatria-stater (names) ur en dels perioder de år de finns (#644). Cliopatria räknar ibland
    ett område både till en stat och till dess forna kolonialmakt, till exempel Algeriet och Djibouti till Femte franska
    republiken 1961–2023. Perioderna delas där någon av staterna börjar eller slutar."""
    # Ett namn kan vara (namn, från år): då klipps staten bara bort från det året. (namn, från år, till år) klipper bara
    # till och med till år, så att perioderna efter det inte räknas om (Kingdom of Iceland ur Danmark 1918–1921, #1381)
    pairs = [(n, None) if isinstance(n, str) else tuple(n[:2]) for n in names]
    last = {n[0]: n[2] for n in names if not isinstance(n, str) and len(n) > 2}
    feats = [f for n, y in pairs for f in by_name.get(n, []) if (y is None or f['properties']['ToYear'] >= y)
             and f['properties']['FromYear'] <= last.get(n, 9999)]
    first = {n: y for n, y in pairs}
    start = lambda f: max(f['properties']['FromYear'], first[f['properties']['Name']] or f['properties']['FromYear'])
    end = lambda f: min(f['properties']['ToYear'], last.get(f['properties']['Name'], 9999))
    out = []
    for a, b, g, ar in items:
        cuts = sorted({a, b + 1} | {c for f in feats for c in (start(f), end(f) + 1) if a < c <= b})
        for s, e in zip(cuts, cuts[1:]):
            on = [shape(f['geometry']).buffer(0) for f in feats if start(f) <= s <= end(f)]
            if on:
                # Med (namn, från, till) klipps bara de delar som träffas (cut_parts, #1381); övriga minus som förut
                ng = cut_parts(g, unary_union(on)) if last else g.difference(unary_union(on))
                # keep_west_of (längdgrad): av det som klippningen lämnar behålls bara delar vars mitt ligger väster om den. Öster om
                # den blir bara remsor kvar där två Cliopatria-gränser inte är ritade exakt lika, inget eget område (Norge ur
                # Nordsjöväldet 1028–1039: kvar blir norra och västra Skottland och öarna, men inte remsor vid norska kusten, #1602)
                # keep_west_of = (längdgrad, namn): gäller bara de år någon av de namngivna staterna klipps (#1742), så att
                # andra minus samma grupp inte tar bort fastlandet
                kw = keep_west_of[0] if keep_west_of and any(f['properties']['Name'] in keep_west_of[1] for f in feats
                                                             if start(f) <= s <= end(f)) else None
                if kw is not None and not ng.is_empty:
                    parts = [q for q in (ng.geoms if hasattr(ng, 'geoms') else [ng])
                             if q.geom_type == 'Polygon' and q.centroid.x < kw]
                    ng = MultiPolygon(parts) if len(parts) > 1 else (parts[0] if parts else Polygon())
                out.append((s, e - 1, ng, km2(ng)))
            else:
                out.append((s, e - 1, g, ar))
    return out


def fill_periods(items, fills, by_name):
    """Ersätter en dels perioder åren a–b med statens egen gräns i Cliopatria ett annat år (fill, #1332).

    Används där Cliopatria ritar en ockupationsmakt eller en part i ett inbördeskrig i stället för den internationellt
    erkända staten (docs/beslut/2026-11-13-ockupation-och-inbordeskrig.md), eller saknar en post för staten några år.
    fills = [(a, b, (Cliopatria-namn, år))]. Gränsen hämtas bara ur samma stats post, och bara där Cliopatrias gräns
    för staten är densamma före och efter (se docs/omstridda-granser.md, "Ockupation och inbördeskrig")."""
    for a, b, (name, year) in fills:
        src = next((f for f in by_name.get(name, []) if f['properties']['FromYear'] <= year <= f['properties']['ToYear']), None)
        if src is None:
            raise SystemExit(f'fill: {name} saknas år {year} i Cliopatria')
        g = shape(src['geometry']).buffer(0)
        out = []
        for s, e, gg, ar in items:
            if e < a or s > b:
                out.append((s, e, gg, ar))
                continue
            if s < a:
                out.append((s, a - 1, gg, ar))
            if e > b:
                out.append((b + 1, e, gg, ar))
        items = sorted(out + [(a, b, g, src['properties']['Area'])], key=lambda q: q[0])  # Cliopatrias yta för gränsen
    return items


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


# Koordinaterna avrundas till 0.1 grad, utom för små länder där gränsen annars hamnar fel (#644)
# tyskland och nederlanderna med två decimaler: Selfkant och Elten är cirka 0,1 grad breda (#1730); polen med två
# decimaler, annars hamnar Słubice och Zgorzelec vid Oder–Neisse utanför Polen (#1750)
DECIMALS = {'israel': 2, 'palestina': 2, 'osttyskland': 2, 'vasttyskland': 2, 'tyskland': 2, 'nederlanderna': 2, 'polen': 2, 'fria-staden-danzig': 2, **{g: 3 for g in SMALL_STATES},
            'chimor': 2, 'purepecha': 2, 'inkariket': 2,  # #556
            'strathclyde': 2, 'kungariket-skottland': 2,  # #1721
            'wessex': 2, 'mercia': 2, 'northumbria': 2, 'dal-riata': 2,  # #1744
            'oyoriket': 2, 'ashantiriket': 2, 'gronland-koloni': 2, 'danska-indien': 3, 'danska-guldkusten': 3}  # #1388


def rnd(o, nd=1):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], nd), round(o[1], nd)]
        return [rnd(x, nd) for x in o]
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


def join_periods(base, names, by_name):
    """Lägger till Cliopatria-posterna i names till perioderna i base de år de finns (Osmanska riket med Tripolitanien,
    #1330). Perioderna delas där posterna börjar eller slutar; år utan dem behåller sin gräns oförändrad.
    Ett namn kan vara (namn, från, till): då räknas bara de poster som ligger helt inom åren (Alexanders erövringar
    under namnet "Ptolemaic Kingdom", #1382)."""
    def within(n):
        if isinstance(n, (list, tuple)):
            name, a, b = n
            return [f for f in by_name.get(name, []) if a <= f['properties']['FromYear'] and f['properties']['ToYear'] <= b]
        return by_name.get(n, [])
    feats = [f for n in names for f in within(n)]
    cuts = {f['properties']['FromYear'] for f in feats} | {f['properties']['ToYear'] + 1 for f in feats}
    out = []
    for a, b, g, ar in base:
        edges = [a] + sorted(c for c in cuts if a < c <= b) + [b + 1]
        for x, y in zip(edges, edges[1:]):
            on = [f for f in feats if f['properties']['FromYear'] <= x <= f['properties']['ToYear']]
            if on:
                out.append((x, y - 1, unary_union([g] + [shape(f['geometry']).buffer(0) for f in on]),
                            ar + sum(f['properties']['Area'] for f in on)))
            else:
                out.append((x, y - 1, g, ar))
    return out


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


def big_change(a, b):
    """Största sammanhängande del (km2) av gränsändringen mellan perioderna a och b, om den är större än SPLIT_KM2
    och SPLIT_SHARE av a:s yta och b börjar SPLIT_FROM eller senare, annars 0 (#1732). a är den period vars form
    gäller om de slås ihop."""
    if b['start'] < SPLIT_FROM:
        return 0
    d = a['_raw'].symmetric_difference(b['_raw'])
    if d.is_empty:
        return 0
    d = d.buffer(-SLIVER).buffer(SLIVER)
    parts = getattr(d, 'geoms', [d])
    big = max((km2(x) for x in parts if not x.is_empty), default=0)
    return round(big) if big > max(SPLIT_KM2, SPLIT_SHARE * a['areaKm2']) else 0


def same_homeland(a, b, merge):
    """Perioder slås bara ihop om moderlandet också är nästan detsamma (eller saknas i båda)."""
    ha, hb = a.get('_home'), b.get('_home')
    if ha is None or hb is None:
        return ha is None and hb is None
    return ha.symmetric_difference(hb).area < merge * ha.area


# Svenska namn på lydriken som inte är egna riken i GROUPS (#75); engelska namnet är Cliopatrias
INFLUENCE_NAMES = {
    'Ziyadid dynasty': 'Ziyadiderna', 'Ayyubid Sultanate': 'Ayyubidernas sultanat', 'Sultanate of Rum': 'Rumsultanatet',
    'Delhi Sultanate': 'Delhisultanatet', 'Ostrogothic Kingdom': 'Östgoternas rike', 'Papal States': 'Kyrkostaten',
    'East Franks': 'Östfrankiska riket', 'Kidarites': 'Kidariterna', 'Jalayirid Sultanate': 'Jalayiridernas sultanat',
    'Kingdom of Georgia': 'Kungariket Georgien', 'Qara Qoyunlu': 'Qara Qoyunlu', 'Joseon': 'Joseon (Korea)',
}
# Relationer i Cliopatria som källorna motsäger och därför inte visas (#75): (lydrike, överhuvud) med motivering.
INFLUENCE_SKIP = {
    # Cliopatria anger att Seleukidriket lydde under Romerska republiken 204–190 f.Kr. Enligt wp-roman-seleucid-war
    # krigade de 192–188 f.Kr., och först freden i Apameia 188 f.Kr. tvingade Antiochos III att lämna Mindre Asien.
    ('Seleucid Empire', 'Roman Republic'): 'motsägs av källorna (Roman–Seleucid War, Wikipedia)',
}
INFLUENCE_MIN = 0.3  # inflytande mindre än så här (kvadratgrader, cirka 3 000 km2) tas bort, ofta bara glipor mellan gränserna


def relations(src):
    """Cliopatrias relationer där ett rike lydde under ett annat (#75): poster av typen RELATION med namnet
    '(Allegiance of A to B)' eller '(Vassalage of A to B)'. Geometrin är A:s och B:s områden tillsammans.
    Returnerar {B: [(A, relation, från, till, geometri)]}. Allianser och personalunioner räknas inte."""
    out = {}
    for f in src['features']:
        p = f['properties']
        if p['Type'] != 'RELATION':
            continue
        m = re.match(r'\((Allegiance|Vassalage) of (.+) to (.+)\)$', p['Name'])
        if m:
            kind, a, b = m.groups()
            out.setdefault(b, []).append((a, kind.lower(), p['FromYear'], p['ToYear'], shape(f['geometry']).buffer(0)))
    return out


def influence_periods(rels, cname, core, own, names, tol, merge, min_area):
    """Inflytandet för en del av ett rike (#75): områden som enligt Cliopatria lydde under delen (lojalitet eller
    vasallskap), men inte hörde till den. Det är relationens område minus delens eget område samma år (core =
    [(start, slut, geometri)] ur member_periods). Lydriken som själva är delar av samma grupp (own, till exempel
    khanaten under Yuan) ritas redan som egna riken och hoppas över. names = {Cliopatria-namn: namn} för riken
    som har ett eget namn i GROUPS."""
    targets = [n.strip('()') for n in (cname if isinstance(cname, list) else [cname])]
    out = []
    for a, kind, fy, ty, rg in sorted((r for t in targets for r in rels.get(t, [])), key=lambda r: (r[0], r[2])):
        if a.strip('()') in own or any((a, t) in INFLUENCE_SKIP for t in targets):
            continue
        cuts = sorted({fy, ty + 1} | {s for s, e, g in core if fy < s <= ty} | {e + 1 for s, e, g in core if fy <= e < ty})
        for s, e in zip(cuts, cuts[1:]):
            here = [g for cs, ce, g in core if cs <= s <= ce]
            if not here:
                continue  # delen finns inte på kartan det året
            g = rg.difference(here[0]).simplify(tol, preserve_topology=True)
            parts = [q for q in getattr(g, 'geoms', [g]) if q.geom_type == 'Polygon' and q.area > max(min_area, 0.05)]
            g = unary_union(parts) if parts else None
            if g is None or g.area < INFLUENCE_MIN:
                continue
            last = out[-1] if out else None
            if (last and last['_a'] == a and last['end'] + 1 >= s
                    and last['_shape'].symmetric_difference(g).area < merge * last['_shape'].area):
                last['end'] = e - 1
                continue
            out.append({'start': s, 'end': e - 1, 'relation': kind, 'name': names.get(a, {'en': a}), '_a': a, '_shape': g,
                        'geometry': {'type': mapping(g)['type'], 'coordinates': rnd(mapping(g)['coordinates'])}})
    for q in out:
        del q['_a'], q['_shape']
    return sorted(out, key=lambda q: q['start'])


def drop_remnants(by_name):
    """Tar bort rester ur Cliopatria (#1333): perioder i en post som är mindre än REMNANT_SHARE av postens
    största period och som till mest REMNANT_INSIDE av sin yta ligger inom postens övriga, större perioder.
    Det är fläckar långt från riket, till exempel Kingdom of Denmark 1402–1406 (73 km² i finska Lappland).
    Ett rike som krymper till en del av sitt gamla område (Mogulriket 1857–1858, Delhi) står kvar.
    Returnerar de borttagna som (namn, från, till, yta)."""
    gone = []
    for name, feats in by_name.items():
        top = max(f['properties']['Area'] for f in feats)
        small = [f for f in feats if f['properties']['Area'] < REMNANT_SHARE * top]
        if not small:
            continue
        big = unary_union([shape(f['geometry']).buffer(0) for f in feats if f['properties']['Area'] >= REMNANT_SHARE * top])
        for f in small:
            g = shape(f['geometry']).buffer(0)
            if g.is_empty or g.intersection(big).area < REMNANT_INSIDE * g.area:
                p = f['properties']
                gone.append((name, p['FromYear'], p['ToYear'], round(p['Area'])))
                feats.remove(f)
    return gone


def fix_swapped_shapes(by_name):
    """Rättar poster i Cliopatria (v0.0.1 och v0.2.1) där två riken har bytt geometri (#1187).

    1895–1897 ligger "Qajar Dynasty" i Nederländska Ostindien och "Dutch East Indies" i Iran:
    ytorna (1 780 919 och 1 611 467 km²) motsvarar Ostindien och Iran 1898. Geometrierna byts
    tillbaka, och "(Netherlands)" samma år byggs om av Nederländerna och den rättade kolonin.
    """
    from shapely.geometry import shape, mapping
    from shapely.ops import unary_union

    def one(name, a, b):
        hits = [f for f in by_name.get(name, []) if (f['properties']['FromYear'], f['properties']['ToYear']) == (a, b)]
        return hits[0] if len(hits) == 1 else None

    qajar, dei = one('Qajar Dynasty', 1895, 1897), one('Dutch East Indies', 1895, 1897)
    nl_all = one('(Netherlands)', 1895, 1897)
    nl = next((f for f in by_name.get('Netherlands', [])
               if f['properties']['FromYear'] <= 1895 and f['properties']['ToYear'] >= 1897), None)
    if not (qajar and dei and nl and nl_all):
        return  # en annan version av Cliopatria: inget att rätta
    if shape(qajar['geometry']).centroid.x < 90:
        return  # redan rätt i källan
    qajar['geometry'], dei['geometry'] = dei['geometry'], qajar['geometry']
    qajar['properties']['Area'], dei['properties']['Area'] = dei['properties']['Area'], qajar['properties']['Area']
    merged = unary_union([shape(nl['geometry']).buffer(0), shape(dei['geometry']).buffer(0)])
    nl_all['geometry'], nl_all['properties']['Area'] = mapping(merged), km2(merged)


def main():
    src = json.loads(Path(sys.argv[1]).read_text())
    by_name = {}
    for f in src['features']:
        p = f['properties']
        if p['Type'] == 'POLITY':
            by_name.setdefault(p['Name'], []).append(f)
    fix_swapped_shapes(by_name)
    for name, a, b, ar in drop_remnants(by_name):
        print(f'rest hoppas över (#1333): {name} {a}–{b}, {ar} km2')
    rels = relations(src)
    disputed = disputed_areas(by_name)  # omstridda gränser enligt Sveriges hållning (#644)
    ne = ne_shapes()  # små stater ur Natural Earth (#722)
    # Riken med eget namn i GROUPS, så att ett lydrike som också är ett eget rike på kartan får samma namn (#75)
    known = {}
    for _gid, (_sv, _en, _members, *_o) in GROUPS.items():
        for cname, _pid, psv, _color, *rest in _members:
            first = cname[0] if isinstance(cname, list) else cname
            if first is None:
                continue
            # En Cliopatria-post i flera delar (Sverige före och efter 1721, #70): den första delens namn gäller
            known.setdefault(first, {'sv': psv, 'en': (rest[0] if rest else {}).get('en', first.strip('()'))})
    for en_name, sv_name in INFLUENCE_NAMES.items():
        known.setdefault(en_name, {'sv': sv_name, 'en': en_name})
    out = ROOT / 'data/empires'
    out.mkdir(exist_ok=True)
    # Faktarutorna skrivs för hand och ska inte försvinna när filerna byggs om
    old = out / 'index.json'
    groups_old = {g['id']: g for g in json.loads(old.read_text())['groups']} if old.exists() else {}
    # Faktarutor, symboler och polityFacts (KEEP) skrivs för hand och läggs sist i gruppen
    kept = {k: kept_fields(g) for k, g in groups_old.items()}
    # Namnens översättningar (de, es, fr …) skrivs inte här utan står i datan (tools/riken_namn.py, #676). De
    # bevaras när filerna byggs om, så länge det svenska namnet är detsamma (annars är översättningen inaktuell)
    old_names = {}
    old_docs = []
    for k, g in groups_old.items():
        old_names[('group', k)] = g.get('name', {})
        f = out / f'{k}.json'
        if f.exists():
            old_docs.append(json.loads(f.read_text()))
            for op in old_docs[-1].get('polities', []):
                old_names[('polity', k, op['id'])] = op.get('name', {})
    # Inflytandenamnens översättningar (#1220), efter engelskt namn ur index.json och rikesfilerna
    old_infl = old_influence_names(groups_old.values(), old_docs)

    def with_old(name, key):
        return keep_langs(name, old_names.get(key, {}))
    # Försvunna länder (#72): årtal, föregångare och efterträdare skrivs också för hand
    vanished = {k: g['vanished'] for k, g in groups_old.items() if 'vanished' in g}
    # Osäkra gränser (#73): skrivs för hand, med källa som säger att gränsen var osäker eller flytande
    uncertain = {k: g['uncertainBorder'] for k, g in groups_old.items() if 'uncertainBorder' in g}
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
            index[-1].update(kept.get(gid, {}))
            index[-1] = order_like(index[-1], groups_old.get(gid))
            print(f'{gid}: ingen gräns, punkt {v["point"]["coordinates"]}')
            continue
        home = HOMELANDS.get(gid)
        polities = []
        own = {n.strip('()') for m in members for n in (m[0] if isinstance(m[0], list) else [m[0]]) if n}
        for cname, pid, psv, color, *rest in members:
            opts = rest[0] if rest else {}
            periods = []
            core = []  # delens ogenomskurna gräns per period, för inflytandet (#75)
            feats = None
            if gid in EXTEND and EXTEND[gid]['polity'] == cname:
                feats = extend(by_name, EXTEND[gid])
            # En del utan Cliopatria-namn (None) får hela sin gräns ur DISPUTED (Palestina, #644)
            # eller, med `ne`, ur ett land i Natural Earth (små stater, #722)
            if cname is None:
                g0 = ne[opts['ne']] if opts.get('ne') else Polygon()
                base = [(*opts['years'], g0, km2(g0) if opts.get('ne') else 0)]
            else:
                base = member_periods(by_name, cname, opts.get('years'), feats)
                # Cliopatrias årtal men gränsen ur Natural Earth från året ne_from (Andorra och Monaco, #719)
                if opts.get('ne'):
                    g1 = ne[opts['ne']]
                    base = [(a, b, g1, km2(g1)) if a >= opts.get('ne_from', a) else (a, b, g, ar) for a, b, g, ar in base]
            # join: andra Cliopatria-poster som läggs till delen de år de finns, utan att ändra gränsen övriga år (#1330)
            if opts.get('join'):
                base = join_periods(base, opts['join'], by_name)
            # fill: år där gränsen är statens egen gräns i Cliopatria ett annat år (ockupation och inbördeskrig, #1332)
            if opts.get('fill'):
                base = fill_periods(base, opts['fill'], by_name)
            # prepend: år före Cliopatrias första år, utan egen gräns; gränsen läggs till ur DISPUTED (Östtimor, #644)
            if opts.get('prepend'):
                base = [(*opts['prepend'], Polygon(), 0)] + base
            if opts.get('minus'):
                base = minus_others(base, opts['minus'], by_name, opts.get('minusKeepWestOf'))
            # clip: bara den del av posten som ligger i rutan (väst, syd, öst, nord). Används där en Cliopatria-post är flera
            # kolonier som inte hänger ihop, så att rutan inte drar någon ny gräns (Italienska kolonier i Afrika, #1330)
            if opts.get('clip'):
                cb = box(*opts['clip'])
                base = [(a, b, g.intersection(cb), km2(g.intersection(cb))) for a, b, g, _ar in base]
                base = [q for q in base if not q[2].is_empty]
            for start, end, raw, area in apply_disputed(base, gid, disputed):
                core.append((start, end, raw))
                g = raw.simplify(tol, preserve_topology=True)
                if g.geom_type == 'MultiPolygon':
                    g = unary_union([q for q in g.geoms if q.area > min_area] or [max(g.geoms, key=lambda q: q.area)])
                if g.is_empty:
                    continue
                # gc: gränsen förenklad som förut (SAME_AS_TOL, #1466), för namnets plats och sammanslagningen av perioder
                gc = g
                if gid in SAME_AS_TOL:
                    gc = raw.simplify(SAME_AS_TOL[gid], preserve_topology=True)
                    if gc.geom_type == 'MultiPolygon':
                        gc = unary_union([q for q in gc.geoms if q.area > min_area] or [max(gc.geoms, key=lambda q: q.area)])
                # Namnet skrivs där den största delen av riket ligger
                c = (max(gc.geoms, key=lambda q: q.area) if gc.geom_type == 'MultiPolygon' else gc).representative_point()
                # label i GROUPS ersätter den uträknade punkten (små stater: huvudstaden, #722)
                lab = list(opts['label']) if opts.get('label') else [round(c.x, 1), round(c.y, 1)]
                q = {'start': start, 'end': end, 'areaKm2': round(area),
                     'label': lab, '_shape': gc, '_g': g, '_raw': raw,
                     'geometry': {'type': mapping(g)['type'], 'coordinates': rnd(mapping(g)['coordinates'], DECIMALS.get(gid, 1))}}
                # Huvudlandet (#74): den del av riket som är moderlandet. Den ritas kraftigare och får rikets namn.
                if home and 'homeland' in opts:
                    hg = homeland_shape(by_name, opts['homeland'], home['window'], raw, start, tol, min_area)
                    if hg is not None:
                        c = (max(hg.geoms, key=lambda x: x.area) if hg.geom_type == 'MultiPolygon' else hg).representative_point()
                        q['label'] = [round(c.x, 1), round(c.y, 1)]
                        q['homeland'] = {'type': mapping(hg)['type'], 'coordinates': rnd(mapping(hg)['coordinates'])}
                        q['_home'] = hg
                periods.append(q)
            # strict (#1730): områden i DISPUTED som klipps bort också efter förenklingen, och vars år delar perioderna
            # (borttagna ur gruppen, eller tillagda med add), så att en liten ändring inte slås ihop med perioden före
            strict = [(d, disputed[k], gid in d['remove']) for k, d in DISPUTED.items()
                      if d.get('strict') and (gid in d['remove'] or gid in d['add'])]
            splits = set(opts.get('splits', ())) | {y for d, _a, _r in strict for y in (d['from'], d.get('to', 9999) + 1)}
            merged = []
            for q in periods:
                # splits: år där perioderna aldrig slås ihop, så att en liten men viktig ändring syns (#644)
                if merged and merged[-1]['end'] + 1 >= q['start'] and q['start'] not in splits:
                    a, b = merged[-1]['_shape'], q['_shape']
                    if a.symmetric_difference(b).area < merge * a.area and same_homeland(merged[-1], q, merge):
                        big = big_change(merged[-1], q)
                        if not big:
                            merged[-1]['end'] = q['end']
                            continue
                        print(f'delas efter storlek (#1732): {gid} {pid} {q["start"]}, {big} km2')
                merged.append(q)
            for q in merged:
                active = [(d, a, r) for d, a, r in strict if d['from'] <= q['start'] and q['end'] <= d.get('to', 9999)]
                on = [(a, r) for d, a, r in active if not d.get('efter')]
                # efter (#1755): läggs på efter avrundningen, så att gränsen ur Natural Earth inte blir trappsteg på 0,1 grad.
                # Bara de nya gränsbitarna får tre decimaler
                post = [(a, r) for d, a, r in active if d.get('efter')]
                if on or post:
                    # Förenklingen kan bukta in över ett område som är borttaget ur Cliopatrias gräns (Saarbrücken och
                    # Kehl ligger några km från gränsen, franska kolonialväldet förenklas med 0,3 grader), så det klipps igen
                    g = q['_g']
                    for a, r in on:
                        g = polygons_only(g.difference(a) if r else unary_union([g, a]))
                    q['geometry'] = valid_rounded(g, DECIMALS.get(gid, 1))
                    if post:
                        g = shape(q['geometry'])
                        for a, r in post:
                            g = polygons_only(g.difference(a) if r else unary_union([g, a]))
                        q['geometry'] = valid_rounded(g, 3)
                    if '_home' in q:
                        hg = q['_home']
                        for a, r in on:
                            hg = polygons_only(hg.difference(a)) if r else hg
                        q['homeland'] = valid_rounded(hg, 1)
                        if any(r for a, r in post):
                            hg = shape(q['homeland'])
                            for a, r in post:
                                hg = polygons_only(hg.difference(a)) if r else hg
                            q['homeland'] = valid_rounded(hg, 3)
                del q['_shape']
                q.pop('_g', None)
                q.pop('_raw', None)
                q.pop('_home', None)
            if not merged:
                print('saknas i Cliopatria:', cname)
                continue
            first = cname[0] if isinstance(cname, list) else cname
            # 'wikidata': None betyder inget id: Cliopatrias id gäller ibland något annat (Denmark-England, #1602)
            wd = opts['wikidata'] if 'wikidata' in opts else by_name[first][0]['properties'].get('Wikidata')
            pname = with_old({'sv': psv, 'en': opts.get('en', (first or '').strip('()'))}, ('polity', gid, pid))
            polity = {'id': pid, 'group': gid, 'name': pname, 'wikidata': wd,
                      'color': color,
                      'sources': (['cliopatria', 'natural-earth-lander'] if opts.get('ne') else ['cliopatria']) if first
                                 else ['natural-earth-lander'] if opts.get('ne') else ['natural-earth-omstridda'],
                      'review': 'source-checked', 'periods': merged}
            if wd is None:
                del polity['wikidata']  # inget verifierat id (#1602)
            if opts.get('point'):
                polity['point'] = True  # för litet för kartan: visas som en punkt med namn (#722)
            if isinstance(cname, list):
                polity['parts'] = cname  # Cliopatria-namnen som slogs ihop
            if home and 'homeland' in opts:
                polity['homeland'] = opts['homeland']  # Cliopatria-namnen för moderlandet
            if gid in uncertain:
                polity['uncertainBorder'] = True  # osäker gräns (#73): ritas med mjuk kant
            infl = influence_periods(rels, cname, core, own, known, tol, merge, min_area) if cname else None
            for q in infl or []:
                q['name'] = keep_langs(q['name'], old_infl.get(q['name'].get('en')))  # #1220
            if infl:
                polity['influence'] = infl  # lydriken och vasaller enligt Cliopatria (#75)
            polities.append(polity)
        doc = {'schema': 'historia-globen/areas@1', 'group': gid, 'polities': polities}
        (out / f'{gid}.json').write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
        index.append({'id': gid, 'name': with_old({'sv': sv, 'en': en}, ('group', gid)), 'color': polities[0]['color'],
                      'from': min(q['start'] for p in polities for q in p['periods']),
                      'to': max(q['end'] for p in polities for q in p['periods']),
                      'file': f'data/empires/{gid}.json',
                      'polities': [{'id': p['id'], 'name': p['name'], 'sources': p['sources'], 'review': p['review']} for p in polities]})
        if not any(m[0] for m in members):
            index[-1]['borderSource'] = 'Natural Earth'  # gränsen kommer inte från Cliopatria (#644)
        elif all(isinstance(m[-1], dict) and m[-1].get('ne') for m in members):
            # Cliopatrias årtal med gränsen ur Natural Earth (#719), från ett visst år när ne_from finns
            index[-1]['borderSource'] = ('Cliopatria / Natural Earth' if any(m[-1].get('ne_from') for m in members)
                                         else 'Natural Earth')
        if home:
            index[-1]['homeland'] = {'name': keep_langs(home['name'], groups_old.get(gid, {}).get('homeland', {}).get('name'))}
        if gid in vanished:
            index[-1]['vanished'] = vanished[gid]
        if gid in uncertain:
            index[-1]['uncertainBorder'] = uncertain[gid]
        # Inflytandet i korthet (#75), så att faktarutan kan nämna det utan att rikets fil har laddats
        infl = {}
        for p in polities:
            for q in p.get('influence', []):
                key = (p['id'], q['name']['en'], q['relation'])
                a = infl.setdefault(key, {'polity': p['id'], 'name': q['name'], 'relation': q['relation'], 'from': q['start'], 'to': q['end']})
                a['from'], a['to'] = min(a['from'], q['start']), max(a['to'], q['end'])
        if infl:
            index[-1]['influence'] = sorted(infl.values(), key=lambda a: a['from'])
        index[-1].update(kept.get(gid, {}))
        index[-1] = order_like(index[-1], groups_old.get(gid))  # samma fältordning som förut, så att diffen blir tom (#1220)
        size = (out / f'{gid}.json').stat().st_size
        print(f'{gid}: {len(polities)} riken, {sum(len(p["periods"]) for p in polities)} perioder, {size // 1000} kB')
    notes = ('Riken som områden (lagertyp område), ett rike per fil. Utdrag ur Cliopatria, datafil cliopatria_polities_only_v021 '
             '(version 0.2.1, Seshat Global History Databank, CC BY 4.0, https://zenodo.org/records/23128623), byggt med tools/riken.py. '
             f'Ändringar: geometrin är förenklad (Douglas-Peucker {TOL} grader, koordinater avrundade till 0.1 grad, öar under cirka 200 km2 '
             f'borttagna) och på varandra följande perioder där gränsen ändras mindre än {round(MERGE * 100)} procent är sammanslagna. '
             f'Från {SPLIT_FROM} slås perioder ändå inte ihop när en sammanhängande del av gränsändringen är större än '
             f'{SPLIT_KM2} km2 och {SPLIT_SHARE * 100:.1f} procent av riket (#1732), så att till exempel Hatay syns i Turkiet från 1939. '
             'Brittiska, spanska och portugisiska imperiet är förenklade hårdare (0.3 grader, 8 procent, öar under cirka 800 km2 borttagna), '
             'liksom Ryssland, Sovjetunionen, Japan och franska kolonialväldet (0.3 grader, 5 procent, öar under cirka 800 km2 borttagna) och nederländska kolonialväldet (0.3 grader, 8 procent). '
             'Rester i Cliopatria, perioder under 1 procent av postens största yta som till största delen ligger utanför postens '
             'övriga yta (till exempel Kingdom of Denmark 1402–1406, 73 km2 i Lappland), är borttagna (#1333). '
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
             'Cliopatria och har ingen fil, bara en punkt (vanished.point). '
             'Sverige (#70): Cliopatrias "Swedish Empire" 1612–1814 är delad i två delar med samma gränser, Svenska stormaktsväldet '
             'till och med 1721 (freden i Nystad) och Sverige 1722–1814. '
             'Inflytande (#75): polity.influence är områden som enligt Cliopatrias relationsposter (typ RELATION, '
             '"Allegiance of A to B" och "Vassalage of A to B") lydde under riket utan att höra till det: relationens område '
             'minus rikets eget område samma år, förenklat som riket, ytor under cirka 3 000 km2 borttagna. Lydriken som själva '
             'är delar av samma grupp (khanaten under Yuan) är inte med. index.json sammanfattar dem i influence. '
             'Osäker gräns (#73): uncertainBorder på gruppen i index.json skrivs för hand med källa (note, sources, review) '
             'och ger polity.uncertainBorder i rikets fil. '
             'Omstridda gränser i nutid (#644): följer Sveriges officiella hållning enligt UD (DISPUTED i tools/riken.py, '
             'docs/omstridda-granser.md). Krim och Sevastopol räknas till Ukraina även från 2014, och inte till Ryska federationen. '
             'Västbanken med Östra Jerusalem, Gaza och Golanhöjderna räknas inte till Israel från 1967; Staten Palestina '
             '(Västbanken med Östra Jerusalem och Gaza) visas från 2014, då Sverige erkände den. De gränserna kommer ur Natural Earth '
             '(ne_10m_admin_0_disputed_areas 5.1.1, public domain), och gruppen har då borderSource. Där är areaKm2 räknad ur den nya gränsen. '
             'Ockupation och inbördeskrig (#1332): där Cliopatria efter 1945 ritar en ockupationsmakt eller en part i ett inbördeskrig '
             'i stället för en stat, visas den internationellt erkända staten med sin egen gräns i Cliopatria ett närliggande år (fill i '
             'tools/riken.py), och makten klipps bort de åren; där är areaKm2 Cliopatrias yta för den gränsen. '
             'Källfel i Cliopatria, Tyskland 1920–1990 (#1706): Västberlin räknas inte till Femte franska '
             'republiken; Nazi Germanys småbitar i Sverige, ryska Karelen och Levanten, och före ockupationerna i Norge, Estland och '
             'på Naxos, är borttagna (DISPUTED i tools/riken.py). Västtyskland delas 1958, när Saarland kommer med i Cliopatria. '
             'Fortsättning (#1730): Saarområdet visas utan stat 1920–1934 (Nationernas förbund), Kehl hör inte till Frankrike från 1950, '
             'Selfkant och Elten hör till Västtyskland från 1963 (gränsen ur Natural Earth), gränsen mellan DDR och Västtyskland följer '
             'Västtysklands delstater i Natural Earth (ne_10m_admin_1_states_provinces 5.1.2), och Polen 1945–1952 visas med gränsen '
             '1953. Områden med strict i DISPUTED klipps bort eller läggs till också efter förenklingen. '
             'Västberlin och Östberlin 1949–1990 (#1731): Västberlins gräns kommer ur Verlauf der Berliner Mauer, 1989 (Geoportal '
             'Berlin, Datenlizenz Deutschland – Zero 2.0, tools/vastberlin.py) och klipps ur DDR; Östberlin är hela Berlin i Natural '
             'Earth admin 1 minus Västberlin och räknas till DDR. '
             'Rättningar efter #1730 (#1750): Saarområdet är klippt mot Tysklands gräns i Natural Earth, gränsen mellan DDR (och den '
             'sovjetiska zonen 1945–1948) och Västtyskland följer delstaterna i Natural Earth på båda sidor, Tysklands gräns mot '
             'Nederländerna och Polen följer Natural Earth, och Kaliningradområdet har Sovjetunionens gräns 1960 i Cliopatria. '
             'Äldre gränsfel kring Tyskland (#1755): Saarområdet är klippt mot Saarlands gräns i Natural Earth; gränsen mellan '
             'Frankrike och Tyskland följer Natural Earth 1930–1939 och gränsen mellan Tjeckoslovakien (Tjeckien) och Tyskland från '
             '1945; Nederländernas sida av gränsen mot Tyskland följer Natural Earth från 1950; Lindau ligger i Västtyskland från 1950 '
             'och i Tyskland; Kaliningradområdet har Rysslands gräns i Natural Earth från 1945. Områden med efter i DISPUTED klipps '
             'eller läggs till bara efter förenklingen. '
             'Bodensee, Basel, Vorarlberg, Kuriska näset och Ermland (#1771): gränserna mellan Tyskland, Schweiz, Österrike och Frankrike '
             'vid Bodensee och Basel och längs gränsen mellan Österrike och Tyskland följer Natural Earth från 1919; Polens och Litauens '
             'gränser mot Kaliningradområdet följer Natural Earth från 1945 (Polen utom det som Cliopatria räknar till Ryssland; Litauen från 1990, '
             'Kuriska näset i Sovjetunionen 1945–1989); gränsen mellan Frankrike och Schweiz följer Natural Earth från 1919 (Frankrikes sida 1919–1939 och från 1945); '
             'den amerikanska zonen (Bayern) och den sovjetiska (Sachsen och Thüringen) når 1945–1949 fram till gränserna mot '
             'Tjeckoslovakien, Polen och Österrike, och den franska (Baden-Württemberg) till Bodensee, med delstaternas gränser i Natural Earth. '
             'Sydsudan och Zanzibar (#1534): Sydsudan visas från självständigheten 2011 med sin gräns i Cliopatria 2014 (Cliopatria '
             'har landet först från 2014), Sudan 2011–2013 likaså med gränsen 2014, och gränsen mellan dem följer Cliopatrias ogenomskurna '
             'gränser; Unguja och Pemba (Zanzibar) hör till Tanzania från 1964, med öarnas gräns i Natural Earth. '
             'Små stater (#722): tolv länder som Cliopatria saknar i nutid eller har fel gräns för har gränsen ur Natural Earth '
             '(ne_10m_admin_0_countries 5.1.1, public domain), från självständigheten, och polity.point = true: de visas som en punkt med namn.')
    (out / 'index.json').write_text(json.dumps({'schema': 'historia-globen/empires-index@1', 'notes': notes, 'groups': index},
                                               ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
