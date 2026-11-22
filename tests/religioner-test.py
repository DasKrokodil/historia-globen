#!/usr/bin/env python3
"""tools/religioner.py (#1609): classify känner igen rubriker för officiell religion.

Faktarutornas texter är delade i stycken vid ";" och ",". En rubrik som "State and majority" eller "Official:" står då
som eget stycke och religionen i nästa. Provet kontrollerar att sådana rubriker ger regeln "officiell" (säker), och att
stycken som inte betyder statsreligion inte gör det. Texterna nedan är faktarutornas egna texter ur data/religions.json.
Körs i CI utan shapely: python3 -I tests/religioner-test.py
"""
import importlib.util
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

if fel:
    print('\n'.join(fel))
    sys.exit(1)
print(f'religioner: {len(FALL)} faktarutor och rubrikerna klassas rätt')
