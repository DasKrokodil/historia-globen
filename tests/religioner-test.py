#!/usr/bin/env python3
"""tools/religioner.py (#1609): classify känner igen rubriker för officiell religion.

Faktarutornas texter är delade i stycken vid ";" och ",". En rubrik som "State and majority" eller "Official:" står då
som eget stycke och religionen i nästa. Provet kontrollerar att sådana rubriker ger regeln "officiell" (säker), och att
stycken som inte betyder statsreligion inte gör det. Texterna nedan är faktarutornas egna texter ur data/religions.json.
Provet kontrollerar också rutan som klipper bort Cliopatrias USA-del över södra Vietnam (KLIPP, #2162) och religionsbytet
per rike (conversion, #2162).
Körs i CI utan shapely: python3 -I tests/religioner-test.py
"""
import importlib.util
import re
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# religioner.py importerar shapely för områdena. classify behöver det inte, så utan shapely räcker tomma moduler.
try:
    import shapely  # noqa: F401
except ImportError:
    for name in ('shapely', 'shapely.geometry', 'shapely.ops'):
        sys.modules[name] = types.ModuleType(name)
    sys.modules['shapely'].STRtree = None
    sys.modules['shapely.geometry'].mapping = sys.modules['shapely.geometry'].shape = None
    sys.modules['shapely.ops'].unary_union = None

spec = importlib.util.spec_from_file_location('religioner', ROOT / 'tools/religioner.py')
religioner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(religioner)
classify, OFFICIAL_HEADER = religioner.classify, religioner.OFFICIAL_HEADER

fel = []


def check(ok, msg):
    if not ok:
        fel.append(msg)


# Rubriker som betyder statsreligion eller officiell religion, med eller utan ordet "religion"
for s in ('State religion:', 'State religions :', 'Official religion:', 'Official religions', 'Official:', 'Official',
          'State and majority', 'State and majority:', 'State and official religion', 'official, and majority:'):
    check(OFFICIAL_HEADER.fullmatch(s), f'rubriken {s!r} räknas inte som officiell religion')

# Stycken som inte är rubriker för statsreligion
for s in ('Majority:', 'Majority religion:', 'Minority:', 'Unofficial:', 'Official languages', 'Official language:',
          '(official)', '( official , 1848)', 'Statehood', 'Various official religions :', 'Islam (official)'):
    check(not OFFICIAL_HEADER.fullmatch(s), f'stycket {s!r} räknas felaktigt som rubrik för officiell religion')

# Hela faktarutor: (text, väntat resultat)
FALL = [
    # De fyra rikena i #1609
    ('State and majority ; Eastern Orthodox ( Georgian Orthodox Church ) ; Minority Armenian Apostolic Church ; '
     'Catholicism ; Islam', ('kristendom', True, 'officiell')),
    ('Official: ; Islam Minority: ; Christianity , Judaism', ('islam', True, 'officiell')),
    ('Official, and majority: ; Sunni Islam ( Maliki and Hanafi ) ; Minorities: ; Ibadi Islam ; Judaism ; Christianity',
     ('islam', True, 'officiell')),
    ('Official ; Theravada Buddhism Minority Animism ; Christianity ; Hinduism ; Islam', ('buddhism', True, 'officiell')),
    # Rubriken med ordet religion fungerade redan
    ('Official religion: ; Roman Catholicism ; Minority religions: ; Islam ; Sephardic Judaism',
     ('kristendom', True, 'officiell')),
    # Ingen rubrik för statsreligion: oförändrat
    ('Majority: ; Christianity ; Minority: ; Islam', ('kristendom', True, 'majoritet')),
    ('Christianity ; Islam ; Judaism', ('kristendom', False, 'först nämnd')),
    ('Official languages ; Christianity ; Islam', ('kristendom', False, 'först nämnd')),
    ('Unofficial: ; Christianity ; Islam', ('kristendom', False, 'först nämnd')),
]
for text, want in FALL:
    got = classify(text)
    check(got == want, f'classify({text!r}) gav {got}, väntat {want}')

# Rikesdelar som Cliopatria har fel (#2162): USA:s del över södra Vietnam klipps bort 1967–2005 med samma ruta som
# VIETNAM_USA i tools/riken.py (#2151). Finns rutan i riken.py ska den vara lika; annars kontrolleras rutan som den är.
klipp = {namn: (fran, till, ruta) for namn, fran, till, ruta in religioner.KLIPP}
check(klipp.get('United States of America') == (1967, 2005, (103.0, 8.0, 110.5, 17.6)),
      f"USA:s ruta över södra Vietnam är {klipp.get('United States of America')}")
m = re.search(r'^VIETNAM_USA\s*=\s*\(([^)]*)\)', (ROOT / 'tools/riken.py').read_text(), re.M)
if m:
    ruta = tuple(float(x) for x in m.group(1).split(','))
    check(klipp['United States of America'][2] == ruta,
          f"rutan {klipp['United States of America'][2]} är inte VIETNAM_USA {ruta} i tools/riken.py")
try:
    religioner.klipp('United States of America', 1960, 1970, None)
    check(False, 'klipp godtar en period som bara delvis ligger inom rutans år')
except ValueError:
    pass
check(religioner.klipp('United States of America', 2006, 2023, 'orörd') == 'orörd', 'klipp ändrar USA efter 2005')
check(religioner.klipp('Republic of Vietnam', 1973, 1975, 'orörd') == 'orörd', 'klipp ändrar ett annat rike')

# Handplockat val per rike (religionOverride, #2140): en känd religion och minst en källa, annars stoppas bygget
override_religion = religioner.override_religion
check(override_religion('X', {'religion': 'germansk', 'sources': ['wp-hwicce']}) == 'germansk',
      'religionOverride med känd religion och källa ger inte religionen')
for bad in ({'religion': 'okand', 'sources': ['a']}, {'religion': 'germansk'}, {'religion': 'germansk', 'sources': []},
            {'religion': 'germansk', 'sources': ['']}, {'religion': 'germansk', 'sources': 'a'}):
    try:
        override_religion('X', bad)
        fel.append(f'religionOverride {bad!r} stoppar inte bygget')
    except ValueError:
        pass

# Religionsbyte per rike (conversion, #2162): en känd religion, ett år och minst en källa, annars stoppas bygget
conversion = religioner.conversion
check(conversion('X', {'religion': 'islam', 'since': 1076, 'sources': ['wp-ghana-empire']}) == ('islam', 1076),
      'conversion med religion, år och källa ger inte (religion, år)')
for bad in ({'religion': 'okand', 'since': 1, 'sources': ['a']}, {'religion': 'islam', 'sources': ['a']},
            {'religion': 'islam', 'since': '1076', 'sources': ['a']}, {'religion': 'islam', 'since': True, 'sources': ['a']},
            {'religion': 'islam', 'since': 1076}, {'religion': 'islam', 'since': 1076, 'sources': []},
            {'religion': 'islam', 'since': 1076, 'sources': ['a'], 'note': {'en': 'x'}}):
    try:
        conversion('X', bad)
        fel.append(f'conversion {bad!r} stoppar inte bygget')
    except ValueError:
        pass


def rad(text, conv=None):
    entry = {'name': 'X', **({'conversion': conv} if conv else {})}
    return religioner.Row({'FromYear': 0, 'ToYear': 2000, 'Name': 'X'}, None, {'text': text}, entry)


# Samma regel som det äldre christianSince: före året texten, utom när texten redan gav samma religion
ghana = rad('African traditional religion ; Later Islam', {'religion': 'islam', 'since': 1076, 'sources': ['a']})
check(ghana.religion_at(1050) == ('afrikansk', False), f'Ghana 1050 gav {ghana.religion_at(1050)}')
check(ghana.religion_at(1100) == ('islam', True), f'Ghana 1100 gav {ghana.religion_at(1100)}')
check(rad('African traditional religion ; Later Islam').religion_at(1100) == ('afrikansk', False),
      'Ghana utan conversion ändras')
alodia = rad('Coptic Orthodox Christianity ; Traditional African religion', {'religion': 'kristendom', 'since': 580, 'sources': ['a']})
check(alodia.religion_at(500) == (None, False), f'Alodia 500 gav {alodia.religion_at(500)}')
check(alodia.religion_at(600) == ('kristendom', True), f'Alodia 600 gav {alodia.religion_at(600)}')

if fel:
    print('\n'.join(fel))
    sys.exit(1)
print(f'religioner: {len(FALL)} faktarutor och rubrikerna klassas rätt, USA:s del över södra Vietnam klipps bort, '
      'och religionsbytet (conversion) följer regeln')
