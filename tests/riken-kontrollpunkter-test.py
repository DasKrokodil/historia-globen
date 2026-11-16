#!/usr/bin/env python3
"""Kontrollpunkter i rikenas gränser (#1706): platser som ska ligga i, eller utanför, ett rike vissa år.

Provet läser data/empires/<grupp>.json och testar punkt i polygon (jämnt–udda-regeln, med hål) utan shapely, så att det går
i CI: python3 -I tests/riken-kontrollpunkter-test.py. En ny kontrollpunkt läggs till i PUNKTER när ett gränsfel rättas.
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CHARLOTTENBURG = (13.29, 52.52)  # Västberlin
SAARBRUCKEN = (6.99, 49.23)
VAXHOLM = (18.35, 59.40)  # Stockholms skärgård
TRONDHEIM = (10.65, 63.55)
FINNMARK = (21.85, 70.25)
KARELEN = (35.0, 62.5)
NAXOS = (25.45, 37.1)
LEVANTEN = (35.86, 33.0)
WANGEN = (9.83, 47.69)  # Wangen im Allgäu
# #1730, koordinater ur Wikidata
SAARBRUCKEN_WD = (7.0, 49.233)  # Q1724
SELFKANT = (5.917, 51.017)  # Q204743
ELTEN = (6.16, 51.871)  # Q895714
KEHL = (7.809, 48.571)  # Q15979
EUPEN = (6.033, 50.633)  # Q151831
STETTIN = (14.555, 53.425)  # Q393
DANZIG = (18.654, 54.348)  # Q1792
STRASBOURG = (7.752, 48.573)  # Q6602
WARSZAWA = (21.011, 52.23)  # Q270
KALININGRAD = (20.5, 54.717)  # Q1829
AMSTERDAM = (4.883, 52.367)  # Q727
RATZEBURG = (10.757, 53.702)  # Q490025
# #1750, ur Wikidata: Baltijsk Q5660, Forbach Q22703, Mödlareuth Q672150, Hirschberg Q630383, Amt Neuhaus Q479687,
# Gangelt Q204793, Frankfurt (Oder) Q4024. Görlitz (Q4077) används inte: Wikidatas punkt ligger i Polen enligt Natural Earth
BALTIJSK = (19.917, 54.65)
FORBACH = (6.9, 49.188)
MODLAREUTH = (11.883, 50.415)
HIRSCHBERG = (11.82, 50.406)
AMT_NEUHAUS = (10.932, 53.285)
GANGELT = (6.0, 50.983)
FRANKFURT_ODER = (14.552, 52.342)
SLUBICE = (14.567, 52.35)  # Q200709
ZGORZELEC = (15.0, 51.153)  # Q147929
HELDBURG = (10.725, 50.28)  # Q1601702
ZELENOGRADSK = (20.483, 54.95)  # Q5584
# #1755, ur Wikidata: Lindau Q153969, Zweibrücken Q16017, Kaiserslautern Q3758, Selb Q49812, Reuver Q1019527
LINDAU = (9.684, 47.546)
ZWEIBRUCKEN = (7.361, 49.249)
KAISERSLAUTERN = (7.769, 49.445)
SELB = (12.133, 50.167)
REUVER = (6.079, 51.285)
# Efter geografens granskning av #1755, ur Wikidata: Homburg Q7040, Kybartai Q1004295, Pagėgiai Q643376, Furth im Wald Q502370,
# Schengen Q183841, Perl Q662505, Zittau Q157200
HOMBURG = (7.333, 49.317)
KYBARTAI = (22.756, 54.639)
PAGEGIAI = (21.906, 55.136)
FURTH = (12.84, 49.31)
SCHENGEN = (6.36, 49.47)
PERL = (6.385, 49.474)
ZITTAU = (14.807, 50.896)
# #1771, ur Wikidata: Bregenz Q1737, Hörbranz Q261132, Lochau Q668055, Basel Q78, Riehen Q5262, Weil am Rhein Q61909,
# Kreuzlingen Q63905, Schaffhausen Q9009, Nida Q1004306, Zwiesel Q163091, Passau Q4190, Bartoszyce Q809585 (polsk mark i Ermland),
# Bagrationovsk Q104354, Altkirch Q208119, Delle Q676305, Ferrette Q392059
BREGENZ = (9.749, 47.505)
HORBRANZ = (9.753, 47.555)
LOCHAU = (9.752, 47.53)
BASEL = (7.588, 47.558)
RIEHEN = (7.649, 47.581)
WEIL = (7.611, 47.595)
KREUZLINGEN = (9.178, 47.646)
SCHAFFHAUSEN = (8.634, 47.697)
NIDA = (21.005, 55.304)
BARTOSZYCE = (20.808, 54.254)
BAGRATIONOVSK = (20.633, 54.383)
ALTKIRCH = (7.239, 47.623)
DELLE = (6.998, 47.507)
FERRETTE = (7.316, 47.494)
ZWIESEL = (13.233, 49.017)
# #1781, ur Wikidata (SPARQL, 2026-11-16): Konstanz Q3834, Świnoujście Q41599, Wolin Q1862, Międzyzdroje Q148615, Ahlbeck Q149899,
# Pontarlier Q214540, Morteau Q200832, Jougne Q923421, Les Rousses Q818555, Gex Q202451, Annemasse Q212901, Thonon (Thonon-les-Bains
# ligger vid 6,48, 46,37; samma punkt som i Cliopatria-provet), La Chaux-de-Fonds Q68124, Porrentruy Q68256, Vallorbe Q68587,
# Genève Q71, Leutkirch im Allgäu Q539645, Isny im Allgäu Q513446, Bad Wurzach Q506838, Memmingen Q14825, Oberstaufen Q32202664,
# Weiler-Simmerberg Q537453, Schaffhausen och Bregenz som ovan
KONSTANZ = (9.175, 47.663)
SWINOUJSCIE = (14.247, 53.91)
WOLIN = (14.611, 53.841)
MIEDZYZDROJE = (14.451, 53.928)
AHLBECK = (14.188, 53.94)
PONTARLIER = (6.355, 46.906)
MORTEAU = (6.606, 47.058)
JOUGNE = (6.388, 46.764)
LES_ROUSSES = (6.062, 46.486)
GEX = (6.058, 46.333)
ANNEMASSE = (6.236, 46.195)
LA_CHAUX = (6.83, 47.1)
PORRENTRUY = (7.083, 47.417)
VALLORBE = (6.383, 46.717)
GENEVE = (6.15, 46.2)
LEUTKIRCH = (10.022, 47.826)
ISNY = (10.039, 47.692)
BAD_WURZACH = (9.899, 47.909)
MEMMINGEN = (10.181, 47.988)
OBERSTAUFEN = (10.022, 47.556)
WEILER = (9.933, 47.583)
# #1534, ur en.wikipedia (Wikidata svarade inte): Juba, Khartoum, Zanzibar City och Wete (på Pemba). Chake-Chake, Pembas
# huvudort, används inte: punkten ligger cirka 150 m utanför Natural Earths kust, i viken vid staden
JUBA = (31.5825, 4.8539)
KHARTOUM = (32.5, 15.6)
ZANZIBAR = (39.199, -6.165)
WETE = (39.728, -5.057)
# #1500, ur en.wikipedia (kontrollerat 2026-11-15): Seoul, Busan och Daegu i Sydkorea
SEOUL = (126.99, 37.56)
BUSAN = (129.075, 35.18)
DAEGU = (128.60167, 35.87167)
KOREA_SYD = ((SEOUL, 'Seoul'), (BUSAN, 'Busan'), (DAEGU, 'Daegu'))
# Utanför Korea ska USA vara som förut 1948–1966 (geografens prov för #1500): östra Puerto Rico och norra Honshu
FAJARDO = (-65.65, 18.33)
HUMACAO = (-65.83, 18.15)
MINMAYA = (140.45, 41.2)
# #1499, ur en.wikipedia (kontrollerat 2026-11-15): Haikou och Sanya på Hainan, Taipei på Taiwan
HAIKOU = (110.3488, 20.0186)
SANYA = (109.5036, 18.2533)
TAIPEI = (121.5625, 25.0375)
DINGHAI = (122.1068, 30.0198)  # Zhoushanön, ur en.wikipedia "Dinghai, Zhoushan"
HAINAN_PUNKTER = ((HAIKOU, 'Haikou'), (SANYA, 'Sanya'), (DINGHAI, 'Dinghai'))
# #1707, ur Wikidata: Kinshasa Q3838, Brazzaville Q3844 och Nuuk Q226; Gander ur en.wikipedia "Gander, Newfoundland and Labrador"
# (48° 57′ 26″ N, 54° 35′ 19″ V). Alla öppnade 2026-11-15
KINSHASA = (15.3119, -4.3219)
BRAZZAVILLE = (15.2711, -4.2694)
NUUK = (-51.7333, 64.175)
GANDER = (-54.5886, 48.9572)
# Nära trepunkterna (geografen, #1534): punkter i Cliopatrias Sudan 2014 där Centralafrikanska republikens och Etiopiens förenklade
# gränser når in. Sudans gräns längs Sydsudan får inte läggas över dem, så att marken bara ritas i en stat
NARA_CAF = (23.96, 8.71)
NARA_ETIOPIEN = (34.18, 9.89)
PASSAU = (13.461, 48.575)
# #1469, ur en.wikipedia (infoboxarna, öppnade 2026-11-15; Wikidata svarade med 429): Prag, Budapest, Bukarest, Sofia, Kuwait City,
# Muskat och Freistadt i Mühlviertel. Warszawa står ovan (Q270)
PRAG = (14.42139, 50.0875)
BUDAPEST = (19.05139, 47.4925)
BUKAREST = (26.10389, 44.4325)
SOFIA = (23.33, 42.70)
KUWAIT_CITY = (47.97833, 29.36972)
MUSKAT = (58.40833, 23.58889)
FREISTADT = (14.5052, 48.51146)
OSTEUROPA = ((PRAG, 'Prag', 'tjeckoslovakien'), (BUDAPEST, 'Budapest', 'ungern'), (BUKAREST, 'Bukarest', 'rumanien'),
             (SOFIA, 'Sofia', 'bulgarien'), (FREISTADT, 'Freistadt', 'osterrike'))
# Berlin 1949–1990 (#1731), ur Wikidata: Västberlin och Östberlin
VASTBERLIN = {'Charlottenburg': (13.3, 52.517), 'Spandau': (13.2, 52.55), 'Wedding': (13.343, 52.55), 'Kreuzberg': (13.383, 52.488),
              'Neukölln': (13.45, 52.483), 'Steglitz': (13.333, 52.467), 'Zehlendorf': (13.259, 52.434)}
# Q162049, Q158083, Q675187, Q308928, Q4071168, Q700211, Q324402
OSTBERLIN = {'Berlin-Mitte': (13.407, 52.519), 'Pankow': (13.4, 52.567), 'Köpenick': (13.577, 52.446)}  # Q2013767, Q163012, Q521521

# (grupp, punkt, namn, år, ska ligga i riket)
PUNKTER = [
    *[('osttyskland', CHARLOTTENBURG, 'Charlottenburg', y, False) for y in (1949, 1961, 1973, 1974, 1975, 1980, 1990)],
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1960, True),
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1980, True),
    ('vasttyskland', SAARBRUCKEN, 'Saarbrücken', 1990, True),
    *[('frankrike', SAARBRUCKEN, 'Saarbrücken', y, False) for y in (1958, 1960, 1980, 2024)],
    *[('frankrike', CHARLOTTENBURG, 'Charlottenburg', y, False) for y in (1958, 1960, 1961, 1980)],
    *[('frankrike', WANGEN, 'Wangen im Allgäu', y, False) for y in (1958, 1960, 1980, 2024)],
    # Saar under Nationernas förbund 1920–1934, tysk från 1935 (#1730)
    *[(g, SAARBRUCKEN_WD, 'Saarbrücken', y, False) for g in ('weimarrepubliken', 'nazityskland', 'franska-kolonialvaldet')
      for y in (1920, 1925, 1932, 1933, 1934)],
    *[('franska-kolonialvaldet', SAARBRUCKEN_WD, 'Saarbrücken', y, False) for y in (1935, 1937, 1939)],
    *[('nazityskland', SAARBRUCKEN_WD, 'Saarbrücken', y, True) for y in (1935, 1937, 1939)],
    # Kehl: Västtyskland från 1950, inte samtidigt Frankrike
    *[('franska-kolonialvaldet', KEHL, 'Kehl', y, False) for y in (1950, 1955, 1957)],
    *[('vasttyskland', KEHL, 'Kehl', y, True) for y in (1950, 1957)],
    ('franska-kolonialvaldet', STRASBOURG, 'Strasbourg', 1955, True),
    # Selfkant och Elten: Nederländerna 1950–1962, Tyskland från 1963
    *[('nederlanderna', p, n, 1955, True) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten'))],
    *[('nederlanderna', p, n, y, False) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten')) for y in (1963, 1980, 2000)],
    *[('vasttyskland', p, n, y, True) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten')) for y in (1963, 1980)],
    *[('tyskland', p, n, 2000, True) for p, n in ((SELFKANT, 'Selfkant'), (ELTEN, 'Elten'))],
    ('nederlanderna', AMSTERDAM, 'Amsterdam', 1980, True),
    # Västberlin utanför DDR och Östberlin i DDR 1949–1990 (#1731); Västberlin visas utan stat
    *[('osttyskland', p, n, y, False) for n, p in VASTBERLIN.items() for y in (1949, 1961, 1974, 1990)],
    *[('vasttyskland', p, n, y, False) for n, p in VASTBERLIN.items() for y in (1961, 1990)],
    *[('osttyskland', p, n, y, True) for n, p in OSTBERLIN.items() for y in (1949, 1961, 1974, 1990)],
    # Ratzeburg i Västtyskland, inte i DDR; städer nära gränsen ligger kvar på rätt sida
    *[('osttyskland', RATZEBURG, 'Ratzeburg', y, False) for y in (1949, 1960, 1980, 1990)],
    *[('vasttyskland', RATZEBURG, 'Ratzeburg', y, True) for y in (1960, 1980)],
    # (Wikidata: Schwerin Q1709, Erfurt Q1729, Magdeburg Q1733, Sonneberg Q499278, Lübeck Q2843, Kassel Q2865, Hof Q6938,
    # Wolfsburg Q3014)
    *[('osttyskland', p, n, 1970, True) for p, n in (((11.415, 53.629), 'Schwerin'), ((11.029, 50.978), 'Erfurt'),
                                                       ((11.64, 52.132), 'Magdeburg'), ((11.167, 50.35), 'Sonneberg'))],
    *[('vasttyskland', p, n, 1970, True) for p, n in (((10.686, 53.87), 'Lübeck'), ((9.498, 51.316), 'Kassel'),
                                                        ((11.917, 50.317), 'Hof'), ((10.787, 52.423), 'Wolfsburg'))],
    # Felen som #1745 införde (#1750)
    *[('sovjetunionen', BALTIJSK, 'Baltijsk', y, True) for y in (1946, 1950, 1960, 1985)],
    *[('franska-kolonialvaldet', FORBACH, 'Forbach', y, True) for y in (1925, 1933, 1936, 1955)],
    *[(g, FORBACH, 'Forbach', y, False) for g in ('weimarrepubliken', 'nazityskland') for y in (1925, 1932, 1934)],
    *[('osttyskland', p, n, y, True) for p, n in ((MODLAREUTH, 'Mödlareuth'), (HIRSCHBERG, 'Hirschberg'), (AMT_NEUHAUS, 'Amt Neuhaus'))
      for y in (1950, 1970, 1990)],
    *[('vasttyskland', p, n, y, False) for p, n in ((MODLAREUTH, 'Mödlareuth'), (HIRSCHBERG, 'Hirschberg'), (AMT_NEUHAUS, 'Amt Neuhaus'))
      for y in (1950, 1970, 1990)],
    *[('sovjetunionen', p, n, 1947, True) for p, n in ((MODLAREUTH, 'Mödlareuth'), (HIRSCHBERG, 'Hirschberg'))],
    ('sovjetunionen', RATZEBURG, 'Ratzeburg', 1947, False),
    ('tyskland', GANGELT, 'Gangelt', 2000, True),
    *[('osttyskland', FRANKFURT_ODER, 'Frankfurt (Oder)', y, True) for y in (1950, 1970)],
    ('tyskland', FRANKFURT_ODER, 'Frankfurt (Oder)', 2000, True),
    *[('polen', FRANKFURT_ODER, 'Frankfurt (Oder)', y, False) for y in (1946, 1950, 1970, 2000)],
    *[('polen', p, n, y, True) for p, n in ((SLUBICE, 'Słubice'), (ZGORZELEC, 'Zgorzelec')) for y in (1946, 1950, 1970, 2000)],
    *[(g, p, n, y, False) for g, y in (('osttyskland', 1970), ('tyskland', 2000)) for p, n in ((SLUBICE, 'Słubice'), (ZGORZELEC, 'Zgorzelec'))],
    *[('osttyskland', HELDBURG, 'Heldburg', y, True) for y in (1950, 1970)],
    *[('sovjetunionen', ZELENOGRADSK, 'Zelenogradsk', y, True) for y in (1950, 1970)],
    # Äldre gränsfel kring Tyskland (#1755)
    *[('vasttyskland', LINDAU, 'Lindau', y, True) for y in (1950, 1952, 1955, 1970, 1990)],
    ('tyskland', LINDAU, 'Lindau', 2000, True),
    *[(g, LINDAU, 'Lindau', 2000, False) for g in ('osterrike', 'schweiz')],
    *[('weimarrepubliken', p, n, 1931, True) for p, n in ((ZWEIBRUCKEN, 'Zweibrücken'), (KAISERSLAUTERN, 'Kaiserslautern'))],
    *[('nazityskland', ZWEIBRUCKEN, 'Zweibrücken', y, True) for y in (1933, 1934)],
    ('franska-kolonialvaldet', KAISERSLAUTERN, 'Kaiserslautern', 1931, False),
    ('franska-kolonialvaldet', KAISERSLAUTERN, 'Kaiserslautern', 1925, True),
    *[('weimarrepubliken', SAARBRUCKEN_WD, 'Saarbrücken', y, False) for y in (1925, 1931)],
    *[('nazityskland', FORBACH, 'Forbach', y, False) for y in (1935, 1937, 1939)],
    *[('franska-kolonialvaldet', FORBACH, 'Forbach', y, True) for y in (1935, 1939)],
    *[('tjeckoslovakien', SELB, 'Selb', y, False) for y in (1947, 1960, 1990)],
    *[('vasttyskland', SELB, 'Selb', y, True) for y in (1950, 1970, 1990)],
    ('tjeckien', SELB, 'Selb', 2000, False),
    *[('nederlanderna', GANGELT, 'Gangelt', y, False) for y in (1950, 1955, 1962)],
    *[('vasttyskland', GANGELT, 'Gangelt', y, True) for y in (1950, 1955, 1962)],
    *[('nederlanderna', REUVER, 'Reuver', y, True) for y in (1955, 1970, 2000)],
    *[(g, REUVER, 'Reuver', y, False) for g, y in (('vasttyskland', 1955), ('vasttyskland', 1970), ('tyskland', 2000))],
    ('sovjetunionen', BALTIJSK, 'Baltijsk', 1990, True),
    # Homburg låg i Saarområdet 1920–1935 (de.wikipedia "Homburg")
    *[(g, HOMBURG, 'Homburg', y, False) for g, y in (('weimarrepubliken', 1925), ('weimarrepubliken', 1931), ('nazityskland', 1934),
                                                    ('franska-kolonialvaldet', 1925))],
    ('nazityskland', HOMBURG, 'Homburg', 1936, True),
    *[('litauen', p, n, y, True) for p, n in ((KYBARTAI, 'Kybartai'), (PAGEGIAI, 'Pagėgiai')) for y in (1991, 2000, 2020)],
    *[(g, KYBARTAI, 'Kybartai', y, False) for g, y in (('sovjetunionen', 1991), ('ryska-federationen', 2000))],
    *[('tjeckoslovakien', FURTH, 'Furth im Wald', y, False) for y in (1960, 1990)],
    ('vasttyskland', FURTH, 'Furth im Wald', 1970, True),
    *[(g, FURTH, 'Furth im Wald', 2000, ska) for g, ska in (('tjeckien', False), ('tyskland', True))],
    *[('tjeckien', ZITTAU, 'Zittau', y, False) for y in (1992, 2000)],
    # Bodensee, Basel, Vorarlberg, Kuriska näset och Ermland (#1771)
    *[('osterrike', p, n, y, True) for p, n in ((BREGENZ, 'Bregenz'), (HORBRANZ, 'Hörbranz'), (LOCHAU, 'Lochau'))
      for y in (1919, 1925, 1937, 1946, 1970, 2000, 2024)],
    *[(g, p, n, y, False) for p, n in ((BREGENZ, 'Bregenz'), (HORBRANZ, 'Hörbranz'), (LOCHAU, 'Lochau'))
      for g, y in (('weimarrepubliken', 1925), ('nazityskland', 1935), ('vasttyskland', 1970), ('tyskland', 2000))],
    *[('nazityskland', p, n, 1940, True) for p, n in ((BREGENZ, 'Bregenz'), (HORBRANZ, 'Hörbranz'))],
    *[('schweiz', p, n, y, True) for p, n in ((BASEL, 'Basel'), (RIEHEN, 'Riehen'), (KREUZLINGEN, 'Kreuzlingen'),
                                             (SCHAFFHAUSEN, 'Schaffhausen')) for y in (1925, 1942, 1947, 1970, 2000, 2024)],
    *[(g, p, n, y, False) for p, n in ((BASEL, 'Basel'), (RIEHEN, 'Riehen'), (KREUZLINGEN, 'Kreuzlingen'), (SCHAFFHAUSEN, 'Schaffhausen'))
      for g, y in (('weimarrepubliken', 1925), ('nazityskland', 1942), ('franska-kolonialvaldet', 1947), ('vasttyskland', 1970),
                   ('tyskland', 2000))],
    # Konstanz testas inte: Natural Earth (1:10m, både länder och delstater) lägger gamla stan söder om Seerhein i Schweiz,
    # cirka 0,8 km från gränsen, och kartan följer Natural Earth där (Om kartan)
    *[(g, WEIL, 'Weil am Rhein', y, True)
      for g, y in (('weimarrepubliken', 1925), ('nazityskland', 1937), ('franska-kolonialvaldet', 1947), ('vasttyskland', 1970),
                   ('tyskland', 2000), ('tyskland', 2024))],
    *[('schweiz', WEIL, 'Weil am Rhein', y, False) for y in (1925, 1947, 1970, 2000)],
    ('sovjetunionen', NIDA, 'Nida', 1960, True),
    *[('litauen', NIDA, 'Nida', y, True) for y in (1990, 2000, 2024)],
    *[('polen', BARTOSZYCE, 'Bartoszyce', y, True) for y in (1946, 1970, 1990, 2000, 2024)],
    *[(g, BARTOSZYCE, 'Bartoszyce', y, False) for g, y in (('sovjetunionen', 1960), ('ryska-federationen', 2000))],
    *[(g, BAGRATIONOVSK, 'Bagrationovsk', y, True) for g, y in (('sovjetunionen', 1946), ('sovjetunionen', 1970), ('sovjetunionen', 1990),
                                                                 ('ryska-federationen', 2000), ('ryska-federationen', 2024))],
    *[('polen', BAGRATIONOVSK, 'Bagrationovsk', y, False) for y in (1946, 1970, 2000)],
    # Sundgau och Jura 1930–1939 (geografen, #1771): Frankrike, inte utan stat
    *[('franska-kolonialvaldet', p, n, y, True) for p, n in ((ALTKIRCH, 'Altkirch'), (DELLE, 'Delle'), (FERRETTE, 'Ferrette'))
      for y in (1925, 1930, 1931, 1932, 1935, 1939)],
    *[('sovjetunionen', ZITTAU, 'Zittau', y, True) for y in (1945, 1946, 1948)],
    *[('tjeckoslovakien', ZITTAU, 'Zittau', y, False) for y in (1947, 1960)],
    *[('usa', p, n, y, True) for p, n in ((ZWIESEL, 'Zwiesel'), (PASSAU, 'Passau')) for y in (1945, 1946, 1949)],
    *[('osterrike', PASSAU, 'Passau', y, False) for y in (1947, 1970, 2000)],
    *[('franska-kolonialvaldet', p, n, y, False) for p, n in ((SCHENGEN, 'Schengen'), (PERL, 'Perl')) for y in (1931, 1935)],
    *[('ryska-federationen', BALTIJSK, 'Baltijsk', y, True) for y in (1992, 2000, 2013, 2020)],
    # Fria staden Danzig 1920–1939 (#1746), utan Memelområdet (Klaipėda Q776965)
    *[('fria-staden-danzig', DANZIG, 'Danzig', y, True) for y in (1920, 1925, 1937, 1939)],
    *[('fria-staden-danzig', (21.135, 55.713), 'Klaipėda', y, False) for y in (1920, 1922, 1923, 1930)],
    ('nazityskland', DANZIG, 'Danzig', 1940, True),
    # Elbląg (Q104712) i Ostpreussen och Gdynia (Q385) i Polen, inte i fristaden
    *[(g, (19.409, 54.152), 'Elbląg', y, True) for g, y in (('weimarrepubliken', 1925), ('nazityskland', 1937))],
    *[('fria-staden-danzig', p, n, y, False) for p, n in (((19.409, 54.152), 'Elbląg'), ((18.54, 54.518), 'Gdynia')) for y in (1925, 1937)],
    *[('polen', (18.54, 54.518), 'Gdynia', y, True) for y in (1925, 1937)],
    ('polen', DANZIG, 'Danzig', 1945, True),
    # Eupen i Belgien 1920–1939 och från 1945
    *[('belgien', EUPEN, 'Eupen', y, True) for y in (1925, 1935, 1950, 2000)],
    # Polen 1945–1952 med gränsen 1953, inte i Sovjetunionen; Sovjetunionen behåller Kaliningrad
    *[('polen', p, n, y, True) for p, n in ((STETTIN, 'Stettin'), (DANZIG, 'Danzig'), (WARSZAWA, 'Warszawa')) for y in (1945, 1950, 1960)],
    *[('sovjetunionen', p, n, y, False) for p, n in ((STETTIN, 'Stettin'), (DANZIG, 'Danzig'), (WARSZAWA, 'Warszawa')) for y in (1945, 1950, 1960, 1980)],
    *[('sovjetunionen', KALININGRAD, 'Kaliningrad', y, True) for y in (1946, 1960)],
    *[('nazityskland', VAXHOLM, 'Vaxholm', y, False) for y in range(1933, 1945)],
    *[('nazityskland', KARELEN, 'ryska Karelen', y, False) for y in range(1933, 1945)],
    *[('nazityskland', LEVANTEN, 'Levanten', y, False) for y in range(1933, 1945)],
    *[('nazityskland', TRONDHEIM, 'Trondheim', y, False) for y in range(1933, 1940)],
    *[('nazityskland', FINNMARK, 'Finnmark', y, False) for y in range(1933, 1940)],
    *[('nazityskland', NAXOS, 'Naxos', y, False) for y in range(1933, 1941)],
    # Rättningen tar inte bort det som ska vara kvar: Berlin och Saarbrücken i Nazityskland, ockuperade Norge 1940
    ('nazityskland', CHARLOTTENBURG, 'Charlottenburg', 1937, True),
    ('nazityskland', SAARBRUCKEN, 'Saarbrücken', 1937, True),
    ('nazityskland', TRONDHEIM, 'Trondheim', 1941, True),
    # Perioder delas efter storlek från 1800 (#1732). Koordinater ur en.wikipedia (Antakya, Stralsund), öppnade 2026-11-15.
    # Hatay kom till Turkiet i juli 1939 (en.wikipedia "Hatay State"); förut slogs perioden ihop med formen från 1924.
    *[('turkiet', (36.1606, 36.2025), 'Antakya', y, False) for y in (1924, 1930, 1938)],
    *[('turkiet', (36.1606, 36.2025), 'Antakya', y, True) for y in (1939, 1950, 2000, 2024)],
    # Svenska Pommern avträddes i Kielfreden 14 januari 1814 och lämnades över till Preussen 23 oktober 1815
    # (en.wikipedia "Swedish Pomerania"); kartan följer Cliopatria och freden, så Stralsund är svenskt till 1813
    *[('svenska-stormaktsvaldet', (13.0819, 54.3092), 'Stralsund', y, True) for y in (1809, 1813)],
    *[('svenska-stormaktsvaldet', (13.0819, 54.3092), 'Stralsund', y, False) for y in (1814, 1816)],
    # Sydsudan självständigt 9 juli 2011 och Zanzibar i Tanzania från 26 april 1964 (FN), #1534
    ('sudan', JUBA, 'Juba', 2010, True),
    *[('sydsudan', JUBA, 'Juba', y, True) for y in (2011, 2012, 2013, 2014, 2024)],
    *[('sudan', JUBA, 'Juba', y, False) for y in (2011, 2012, 2013, 2014, 2024)],
    *[('sudan', KHARTOUM, 'Khartoum', y, True) for y in (1956, 2010, 2011, 2012, 2024)],
    *[('sydsudan', KHARTOUM, 'Khartoum', y, False) for y in (2011, 2024)],
    *[('tanzania', p, n, y, True) for p, n in ((ZANZIBAR, 'Zanzibar'), (WETE, 'Wete')) for y in (1964, 1966, 1967, 2000, 2024)],
    *[('tanzania', p, n, 1963, False) for p, n in ((ZANZIBAR, 'Zanzibar'), (WETE, 'Wete'))],
    *[('sudan', p, n, y, False) for p, n in ((NARA_CAF, 'nära trepunkten vid Centralafrikanska republiken'),
                                              (NARA_ETIOPIEN, 'nära trepunkten vid Etiopien')) for y in (2011, 2012, 2020)],
    *[('centralafrikanska-republiken', NARA_CAF, 'nära trepunkten vid Centralafrikanska republiken', y, True) for y in (2012, 2020)],
    *[('etiopien', NARA_ETIOPIEN, 'nära trepunkten vid Etiopien', y, True) for y in (2012, 2020)],
    # Sydkorea (#1500): USA:s militärregering (USAMGIK) till 15 augusti 1948, Republiken Korea från dess. Cliopatrias USA-yta över
    # Korea 1948–1966 ritas inte
    *[('usa', p, n, y, True) for p, n in KOREA_SYD for y in (1946, 1947)],
    *[('sydkorea', p, n, y, True) for p, n in KOREA_SYD for y in (1948, 1950, 1953, 1960, 1966, 1967, 2024)],
    *[('usa', p, n, y, False) for p, n in KOREA_SYD for y in (1948, 1950, 1953, 1960, 1966, 1967)],
    *[('nordkorea', p, n, y, False) for p, n in KOREA_SYD for y in (1948, 1960)],
    *[('usa', p, n, y, True) for p, n in ((FAJARDO, 'Fajardo'), (HUMACAO, 'Humacao')) for y in (1948, 1950, 1953, 1960, 1966)],
    *[('usa', MINMAYA, 'Minmaya', y, True) for y in (1948, 1950, 1952)],
    # Hainan och Zhoushan (#1499): Folkrepubliken Kina intog Hainan 16 april–1 maj 1950 och Zhoushan 17 maj 1950. Cliopatrias
    # Republiken Kina 1950–2023 (Taiwan) omfattar öarna, men de ritas inte i Taiwan; Taipei ligger kvar i Taiwan
    *[('kina', p, n, y, True) for p, n in HAINAN_PUNKTER for y in (1950, 1952, 1953, 1960, 2023, 2024)],
    *[('taiwan', p, n, y, False) for p, n in HAINAN_PUNKTER for y in (1950, 1952, 1953, 1960, 2023, 2024)],
    *[('taiwan', TAIPEI, 'Taipei', y, True) for y in (1950, 1960, 2023, 2024)],
    *[('kina', TAIPEI, 'Taipei', y, False) for y in (1950, 1960, 2023, 2024)],
    # Kinshasa och Brazzaville (#1707): Kinshasa på Pool Malebos södra strand, Brazzaville på andra sidan floden (wp-kinshasa).
    # Frankrike saknas i hela Franska Ekvatorialafrika 1940–1944 i Cliopatria, så Brazzaville är utan stat de åren
    *[('belgiska-kongo', KINSHASA, 'Kinshasa', y, True) for y in (1890, 1900, 1908, 1920, 1940, 1959)],
    *[('kongo-kinshasa', KINSHASA, 'Kinshasa', y, True) for y in (1960, 1961, 1970, 2000, 2024)],
    *[(g, KINSHASA, 'Kinshasa', y, False) for g, y in (('franska-kolonialvaldet', 1890), ('franska-kolonialvaldet', 1920),
                                                      ('franska-kolonialvaldet', 1952), ('frankrike', 1959), ('frankrike', 1960),
                                                      ('kongo-brazzaville', 1961), ('kongo-brazzaville', 1970),
                                                      ('kongo-brazzaville', 2024))],
    *[(g, BRAZZAVILLE, 'Brazzaville', y, True) for g, y in (('franska-kolonialvaldet', 1895), ('franska-kolonialvaldet', 1920),
                                                           ('franska-kolonialvaldet', 1957), ('frankrike', 1958), ('frankrike', 1960),
                                                           ('kongo-brazzaville', 1961), ('kongo-brazzaville', 2024))],
    *[(g, BRAZZAVILLE, 'Brazzaville', y, False) for g, y in (('belgiska-kongo', 1890), ('belgiska-kongo', 1920),
                                                            ('belgiska-kongo', 1940), ('belgiska-kongo', 1959),
                                                            ('kongo-kinshasa', 1960), ('kongo-kinshasa', 2024))],
    # Gander (#1707): Newfoundland gick med i Kanada 31 mars 1949 (wp-newfoundland-and-labrador), och ligger inte samtidigt i
    # Brittiska imperiet
    ('brittiska-imperiet', GANDER, 'Gander', 1948, True),
    *[('brittiska-imperiet', GANDER, 'Gander', y, False) for y in (1949, 1950, 1952)],
    *[('kanada', GANDER, 'Gander', y, True) for y in (1949, 1952, 1953, 2000)],
    # Ockupation efter 1945 (#1469): den erkända staten, inte makten. Polen 1953–1989 (Sovjetunionen delas 1953, #1730)
    *[('polen', WARSZAWA, 'Warszawa', y, True) for y in (1953, 1956, 1970, 1989)],
    *[('sovjetunionen', WARSZAWA, 'Warszawa', y, False) for y in (1953, 1956, 1970, 1989)],
    # Östeuropa och Mühlviertel 1945–1946: landet, inte Sovjetunionen
    *[(g, p, n, y, True) for p, n, g in OSTEUROPA for y in (1945, 1946, 1947)],
    *[('sovjetunionen', p, n, y, False) for p, n, _g in OSTEUROPA for y in (1945, 1946)],
    # Österrike 1945 i stället för de fyra zonerna
    *[(g, FREISTADT, 'Freistadt', 1945, False) for g in ('usa', 'brittiska-imperiet', 'franska-kolonialvaldet')],
    *[('osterrike', BREGENZ, 'Bregenz', 1945, True)],
    *[('franska-kolonialvaldet', BREGENZ, 'Bregenz', 1945, False)],
    # Ungern 1956–1957 (Cliopatria: "Hungarian Nationalists")
    *[('ungern', BUDAPEST, 'Budapest', y, True) for y in (1955, 1956, 1957, 1958)],
    *[('sovjetunionen', BUDAPEST, 'Budapest', y, False) for y in (1956, 1957)],
    # Kuwait 1990: inte Irak (Kuwait City ligger cirka 500 m utanför Kuwaits förenklade kust och står i NARA)
    *[('irak', KUWAIT_CITY, 'Kuwait City', y, False) for y in (1989, 1990, 1991)],
    # Muskat från 1973 i Oman. 1956–1972 räknas staden till Brittiska imperiet som i Cliopatria, och 1946–1955 ligger den utanför
    # Muskat och Oman (fall som står öppna, docs/omstridda-granser.md); de åren prövas inte här
    *[('oman', MUSKAT, 'Muskat', y, True) for y in (1973, 2000, 2024)],
    # Före 1919 (#1781): Basel, Riehen och Schaffhausen i Schweiz, Bregenz i Österrike-Ungern, Weil am Rhein och Saint-Louis-sidan
    # i Tyska riket
    *[('schweiz', p, n, y, True) for p, n in ((BASEL, 'Basel'), (RIEHEN, 'Riehen'), (SCHAFFHAUSEN, 'Schaffhausen'))
      for y in (1820, 1870, 1871, 1900, 1915, 1918)],
    *[('tyska-riket', p, n, y, False) for p, n in ((BASEL, 'Basel'), (RIEHEN, 'Riehen'), (SCHAFFHAUSEN, 'Schaffhausen'), (BREGENZ, 'Bregenz'))
      for y in (1871, 1900, 1915, 1918)],
    *[('osterrike-ungern', BREGENZ, 'Bregenz', y, True) for y in (1868, 1900, 1918)],
    *[('tyska-riket', WEIL, 'Weil am Rhein', y, True) for y in (1871, 1900, 1915)],
    *[('schweiz', WEIL, 'Weil am Rhein', y, False) for y in (1871, 1900, 1915)],
    # Oder (#1781): Świnoujście och västra Wolin i Polen från 1945, inte i Sovjetunionen; Ahlbeck i DDR
    *[('polen', p, n, y, True) for p, n in ((SWINOUJSCIE, 'Świnoujście'), (WOLIN, 'Wolin'), (MIEDZYZDROJE, 'Międzyzdroje'))
      for y in (1945, 1946, 1949, 1952, 1953, 1990, 2024)],
    *[(g, SWINOUJSCIE, 'Świnoujście', y, False) for g, y in (('sovjetunionen', 1946), ('sovjetunionen', 1949), ('osttyskland', 1949),
                                                               ('tyskland', 2000))],
    *[('osttyskland', AHLBECK, 'Ahlbeck', y, True) for y in (1949, 1952, 1990)],
    *[('sovjetunionen', AHLBECK, 'Ahlbeck', y, False) for y in (1949, 1952)],
    # Jura 1940–1944 (#1781): Frankrikes sida som i Cliopatria (Nazityskland, Vichyregimen, Italien 1943), Schweiz sida i Schweiz
    *[('nazityskland', p, n, y, True) for p, n in ((PONTARLIER, 'Pontarlier'), (MORTEAU, 'Morteau'), (JOUGNE, 'Jougne'),
                                                   (LES_ROUSSES, 'Les Rousses'), (GEX, 'Gex'), (DELLE, 'Delle')) for y in (1940, 1942, 1944)],
    *[('italien', ANNEMASSE, 'Annemasse', 1943, True), ('nazityskland', ANNEMASSE, 'Annemasse', 1944, True)],
    *[('schweiz', p, n, y, True) for p, n in ((LA_CHAUX, 'La Chaux-de-Fonds'), (PORRENTRUY, 'Porrentruy'), (VALLORBE, 'Vallorbe'),
                                              (GENEVE, 'Genève')) for y in (1940, 1942, 1943, 1944)],
    *[(g, p, n, y, False) for p, n in ((LA_CHAUX, 'La Chaux-de-Fonds'), (PORRENTRUY, 'Porrentruy'), (VALLORBE, 'Vallorbe'),
                                       (GENEVE, 'Genève')) for g, y in (('nazityskland', 1942), ('franska-kolonialvaldet', 1942),
                                                                        ('italien', 1943), ('nazityskland', 1944))],
    # Västra Allgäu 1945–1949 (#1781): Kreis Wangen i den franska zonen, Memmingen och Oberallgäu i den amerikanska
    *[('franska-kolonialvaldet', p, n, y, True) for p, n in ((LEUTKIRCH, 'Leutkirch'), (ISNY, 'Isny'), (BAD_WURZACH, 'Bad Wurzach'))
      for y in (1945, 1946, 1949)],
    *[('usa', p, n, y, False) for p, n in ((LEUTKIRCH, 'Leutkirch'), (ISNY, 'Isny'), (BAD_WURZACH, 'Bad Wurzach')) for y in (1945, 1946, 1949)],
    *[('usa', p, n, y, True) for p, n in ((MEMMINGEN, 'Memmingen'), (OBERSTAUFEN, 'Oberstaufen')) for y in (1945, 1946, 1949)],
]

# Punkter som ligger precis utanför den förenklade kusten men som uppslaget hittar inom marginalen (AREA_MARGIN_DEG i
# js/area-lookup.js, 0,05 grader, längdgrader skalade med cos(latitud), beslut 2026-11-15, #1524): (grupp, punkt, namn, år).
# Nuuk ligger utanför också i Cliopatria och i Natural Earth 1:10m (#1707), så kartan kan inte rätta det med de källor vi har
NARA = [
    *[('gronland-koloni', NUUK, 'Nuuk', y) for y in (1734, 1750, 1800, 1900, 1940)],
    *[('danmark', NUUK, 'Nuuk', y) for y in (1946, 1979, 2000, 2024)],
    # Kuwait City ligger cirka 500 m utanför Kuwaits förenklade kust (#1469)
    *[('kuwait', KUWAIT_CITY, 'Kuwait City', y) for y in (1961, 1989, 1990, 1991, 2024)],
]
MARGINAL = 0.05


def in_ring(pt, ring):
    x, y = pt
    inside = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def in_geometry(pt, geom):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    return any(in_ring(pt, poly[0]) and not any(in_ring(pt, hole) for hole in poly[1:]) for poly in polys)


def in_group(gid, pt, year):
    doc = json.loads((ROOT / f'data/empires/{gid}.json').read_text(encoding='utf-8'))
    return any(q['start'] <= year <= q['end'] and in_geometry(pt, q['geometry'])
               for p in doc['polities'] for q in p['periods'])


fel = []
# Enhetsprov för punkt i polygon, med hål
ruta = {'type': 'Polygon', 'coordinates': [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]], [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]]}
if not in_geometry((1, 1), ruta) or in_geometry((5, 5), ruta) or in_geometry((11, 5), ruta):
    fel.append('punkt i polygon med hål ger fel svar')

# Orter som inte får ritas i två stater samma år (#1781). Konstanz ritas i Schweiz eftersom Natural Earth följer Seerhein (Om kartan)
DUBBEL = [
    *[(('schweiz', 'tyska-riket'), KONSTANZ, 'Konstanz', y) for y in (1871, 1900, 1918)],
    *[(('osttyskland', 'sovjetunionen', 'polen'), p, n, y) for p, n in ((AHLBECK, 'Ahlbeck'), (SWINOUJSCIE, 'Świnoujście'))
      for y in (1946, 1949, 1952)],
    *[(('franska-kolonialvaldet', 'nazityskland', 'italien', 'schweiz'), p, n, y) for p, n in ((PONTARLIER, 'Pontarlier'), (GEX, 'Gex'),
                                                                                            (GENEVE, 'Genève')) for y in (1940, 1942, 1943, 1944)],
    *[(('franska-kolonialvaldet', 'usa'), p, n, y) for p, n in ((WEILER, 'Weiler-Simmerberg'), (LEUTKIRCH, 'Leutkirch'), (MEMMINGEN, 'Memmingen'))
      for y in (1945, 1946, 1949)],
]
for grupper, pt, namn, year in DUBBEL:
    i = [g for g in grupper if in_group(g, pt, year)]
    if len(i) != 1:
        fel.append(f'{namn} {pt} år {year}: i {len(i)} av {", ".join(grupper)} ({", ".join(i) or "ingen"})')

for gid, pt, namn, year, ska in PUNKTER:
    if in_group(gid, pt, year) != ska:
        fel.append(f'{namn} {pt} år {year}: {"saknas i" if ska else "ligger i"} {gid}')


def seg_dist(p, a, b, c):
    """Avståndet i grader från p till sträckan a–b, med längdgrader skalade med c = cos(latitud), som areaAt()."""
    px, py, ax, ay, bx, by = p[0] * c, p[1], a[0] * c, a[1], b[0] * c, b[1]
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return ((px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2) ** 0.5


def near_group(gid, pt, year):
    """Närmaste avstånd i grader från punkten till gruppens gräns ett visst år (0 om punkten ligger i gruppen)."""
    if in_group(gid, pt, year):
        return 0
    doc = json.loads((ROOT / f'data/empires/{gid}.json').read_text(encoding='utf-8'))
    c = math.cos(math.radians(pt[1]))
    best = math.inf
    for p in doc['polities']:
        for q in p['periods']:
            if not q['start'] <= year <= q['end']:
                continue
            g = q['geometry']
            for poly in (g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]):
                for ring in poly:
                    best = min(best, *(seg_dist(pt, a, b, c) for a, b in zip(ring, ring[1:] + ring[:1])))
    return best


for gid, pt, namn, year in NARA:
    d = near_group(gid, pt, year)
    if d > MARGINAL:
        fel.append(f'{namn} {pt} år {year}: {d:.3f} grader från {gid}, mer än marginalen {MARGINAL}')

if fel:
    print('\n'.join(fel))
    sys.exit(1)
print(f'riken-kontrollpunkter: {len(PUNKTER)} kontrollpunkter och {len(NARA)} inom marginalen stämmer')
