#!/usr/bin/env python3
"""Kontrollerar den byggda webbplatsen i dist/ innan den publiceras (docs/DEPLOYMENT.md).

Körs av scripts/build-site.sh och av GitHub Actions. Avslutas med kod 1 om något fel hittas.

Kontroller:
  1. dist/index.html finns.
  2. Inga interna filer eller mappar finns i dist/ (.claude/, docs/, tools/, data/utkast/, functions/, tests/ m.fl.).
  3. All JSON i dist/ går att läsa.
  4. Alla lokala filer som index.html pekar på (src och href) finns.
  5. Alla relativa importer i JS-modulerna finns, och varje JS-fil nås från js/main.js.
  6. Alla datafiler som js/model.js laddar med getJSON('…') finns.
  7. Filer som data pekar på finns: rikesfilerna i data/empires/index.json (file), filerna med vägar
     och resor i data/routes/index.json (files), händelsernas bilder (image.file), upptäcktsvyns bilder
     (decorations[].file i data/upptackt.json) och ikonerna (icon i
     events.json, CAT_ICON i js/ui/funfact.js, symbol i religions.json och
     symbol i data/empires/index.json).
  8. Varje källa som en händelse, ett krigs berättelse, en väg, en etapp eller en dekoration i
     upptäcktsvyn anger finns i sources.json,
     och varje händelse som en fun fact eller en väg (event) pekar på finns i events.json (CLAUDE.md,
     Testa innan du är klar).
  9. Varje rike som ett krig anger i empires (#76) finns som grupp i data/empires/index.json,
     och bara krig (kind: "war") har fältet.
 10. data/events.json och de uppdelade filerna i data/genererat/ (#337) stämmer med redigeringsfilerna
     data/handelser/<period>.json (#394) och data/empires/index.json i repot, alltså att någon har kört
     python3 tools/dela_data.py efter sin ändring. Kontrollen räknar fram filerna med samma kod som
     skriptet (tools/dela_data.py i repot) och jämför med dem i dist/. Den hittar också händelser som
     ligger i fel periodfil och id som finns två gånger.
 11. Licensmanifesten (#393) stämmer med data/sources.json och bilduppgifterna i data/events.json.

Användning: python3 scripts/validate-site.py [dist]
"""
import json
import math
import re
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else 'dist').resolve()
ROOT = Path(__file__).resolve().parent.parent

# Får aldrig publiceras. Mappar anges med / på slutet.
FORBIDDEN = ['.git/', '.github/', '.claude/', '.orchestra/', 'docs/', 'tools/', 'scripts/',
             'data/utkast/', 'images/incoming/', 'node_modules/', 'dist/',
             'functions/', 'tests/']  # functions/ publiceras av Cloudflare Pages från repots rot, inte via dist/
FORBIDDEN_NAMES = {'CLAUDE.md', 'README.md', '.DS_Store', '__pycache__', '.gitignore'}
FORBIDDEN_SUFFIXES = {'.py', '.pyc', '.sh', '.md'}

errors = []


def err(msg):
    errors.append(msg)


def rel(p):
    return p.relative_to(DIST).as_posix()


def exists(path, what):
    """path är relativ till dist/. Kontrollerar att filen finns och ligger inne i dist/."""
    p = (DIST / path).resolve()
    if DIST not in p.parents or not p.is_file():
        err(f'{what}: {path} saknas i dist/')
        return False
    return True


def load(path):
    try:
        return json.loads((DIST / path).read_text(encoding='utf-8'))
    except (OSError, ValueError) as e:
        err(f'{path}: går inte att läsa ({e})')
        return None


def type_matches(value, expected):
    """Kontrollerna som schemana använder; bool är inte ett heltal i JSON Schema."""
    return {
        'object': isinstance(value, dict),
        'array': isinstance(value, list),
        'string': isinstance(value, str),
        'integer': isinstance(value, int) and not isinstance(value, bool),
        'number': isinstance(value, (int, float)) and not isinstance(value, bool),
        'boolean': isinstance(value, bool),
        'null': value is None,
    }.get(expected, False)


def schema_errors(value, schema, path='$', root=None):
    """Validerar den lilla JSON Schema-del som används i schemas/ (#391)."""
    root = root or schema
    if '$ref' in schema:
        target = root
        for part in schema['$ref'].removeprefix('#/').split('/'):
            target = target.get(part) if isinstance(target, dict) else None
        if target is None:
            return [f"{path}: okänd schemareferens {schema['$ref']!r}"]
        return schema_errors(value, target, path, root)
    found = []
    expected = schema.get('type')
    if expected and not type_matches(value, expected):
        return [f'{path}: ska vara {expected}, är {type(value).__name__}']

    if 'enum' in schema and value not in schema['enum']:
        found.append(f"{path}: {value!r} finns inte i enum")
    if 'pattern' in schema and isinstance(value, str) and not re.search(schema['pattern'], value):
        found.append(f"{path}: {value!r} matchar inte pattern {schema['pattern']!r}")
    if 'minimum' in schema and isinstance(value, (int, float)) and not isinstance(value, bool) \
            and value < schema['minimum']:
        found.append(f"{path}: {value} är mindre än minimum {schema['minimum']}")
    if 'maximum' in schema and isinstance(value, (int, float)) and not isinstance(value, bool) \
            and value > schema['maximum']:
        found.append(f"{path}: {value} är större än maximum {schema['maximum']}")

    if isinstance(value, dict):
        for name in schema.get('required', []):
            if name not in value:
                found.append(f'{path}: obligatoriska fältet {name!r} saknas')
        for name, child in schema.get('properties', {}).items():
            if name in value:
                found += schema_errors(value[name], child, f'{path}.{name}', root)
    elif isinstance(value, list) and len(value) < schema.get('minItems', 0):
        found.append(f"{path}: ska ha minst {schema['minItems']} post{'er' if schema['minItems'] > 1 else ''}")
    if isinstance(value, list) and 'items' in schema:
        for i, item in enumerate(value):
            found += schema_errors(item, schema['items'], f'{path}[{i}]', root)
    return found


def load_schema(name):
    path = ROOT / 'schemas' / name
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError) as e:
        err(f'schemas/{name}: går inte att läsa ({e})')
        return None


def validate_schema_file(data_path, value, schema_name):
    schema = load_schema(schema_name)
    if schema is None:
        return
    for problem in schema_errors(value, schema):
        err(f'{data_path}: schemafel: {problem}')


if not DIST.is_dir():
    print(f'validate-site: {DIST} finns inte; kör scripts/build-site.sh först', file=sys.stderr)
    sys.exit(1)

# 1. index.html
exists('index.html', 'Startsidan')

# 2. Förbjudna filer och mappar
for p in sorted(DIST.rglob('*')):
    r = rel(p) + ('/' if p.is_dir() else '')
    if any(r.startswith(f) for f in FORBIDDEN) or p.name in FORBIDDEN_NAMES \
            or (p.is_file() and p.suffix in FORBIDDEN_SUFFIXES):
        err(f'Intern fil får inte publiceras: {r}')

# 3. JSON-syntax
for p in sorted(DIST.rglob('*.json')):
    load(rel(p))


# 4. index.html: lokala src och href
class Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ('src', 'href') and v:
                self.refs.append(v)


if (DIST / 'index.html').is_file():
    parser = Refs()
    parser.feed((DIST / 'index.html').read_text(encoding='utf-8'))
    for ref in parser.refs:
        if re.match(r'^([a-z]+:|//|#)', ref):
            continue  # extern adress, e-post eller ankare
        exists(ref.split('#')[0].split('?')[0], 'index.html')

# 5. JS-importer, och att varje modul nås från js/main.js
IMPORT = re.compile(r'''(?:^|\s)(?:import|export)\s[^'"]*?from\s*['"](\.{1,2}/[^'"]+)['"]|import\(\s*['"](\.{1,2}/[^'"]+)['"]\s*\)''', re.M)
graph = {}
for p in sorted(DIST.rglob('*.js')):
    src = p.read_text(encoding='utf-8')
    graph[rel(p)] = []
    for m in IMPORT.finditer(src):
        target = (p.parent / (m.group(1) or m.group(2))).resolve()
        if DIST not in target.parents or not target.is_file():
            err(f'{rel(p)}: importen {m.group(1) or m.group(2)} saknas')
        else:
            graph[rel(p)].append(rel(target))
seen, todo = set(), ['js/main.js']
while todo:
    f = todo.pop()
    if f in seen or f not in graph:
        continue
    seen.add(f)
    todo += graph[f]
for f in sorted(set(graph) - seen):
    err(f'{f} importeras inte från js/main.js (onödig fil i dist/, eller saknas importen?)')

# 6. Datafiler som laddas med getJSON('…')
for p in sorted(DIST.rglob('*.js')):
    for path in re.findall(r'''getJSON\(\s*['"]([^'"]+)['"]''', p.read_text(encoding='utf-8')):
        exists(path, f'{rel(p)} (getJSON)')

# 7. Filer som data pekar på
empires = load('data/empires/index.json') if (DIST / 'data/empires/index.json').is_file() else None
group_ids = {g.get('id') for g in (empires or {}).get('groups', [])}
for g in (empires or {}).get('groups', []):
    v = g.get('vanished') or {}
    # Ett försvunnet land utan gräns i Cliopatria har ingen fil, bara en punkt (#72)
    if 'file' in g or not v.get('point'):
        exists(g.get('file', ''), f"data/empires/index.json ({g.get('id')})")
    # Föregångare och efterträdare som är riken pekar på en grupp som finns (#72)
    for x in v.get('predecessors', []) + v.get('successors', []):
        if x.get('group') and x['group'] not in group_ids:
            err(f"data/empires/index.json ({g.get('id')}): gruppen {x['group']} finns inte")

# Vägar och resor (#38): filerna i index.json finns och går att läsa (JSON-syntaxen kontrolleras i steg 3)
routes = []
routes_index = load('data/routes/index.json') if exists('data/routes/index.json', 'Vägar och resor') else None
for f in (routes_index or {}).get('files', []):
    f = f if isinstance(f, str) else (f or {}).get('file', '')
    path = f if '/' in f else f'data/routes/{f}'
    if exists(path, 'data/routes/index.json'):
        doc = load(path)
        if doc is None:
            continue
        if not isinstance(doc, dict) or not isinstance(doc.get('routes'), list):
            err(f'{path}: saknar listan routes')
        else:
            routes += [(path, r) for r in doc['routes']]

events = load('data/events.json') or {'events': []}
icons = {}
for e in events['events']:
    if e.get('image', {}).get('file'):
        exists(e['image']['file'], f"data/events.json ({e['id']}, image.file)")
    if e.get('icon'):
        icons.setdefault(e['icon'], e['id'])
funfact_js = DIST / 'js/ui/funfact.js'
if funfact_js.is_file():
    m = re.search(r'CAT_ICON\s*=\s*\{([^}]*)\}', funfact_js.read_text(encoding='utf-8'))
    if not m:
        err('js/ui/funfact.js: hittar inte CAT_ICON (ändrad kod? uppdatera validate-site.py)')
    else:
        for name in re.findall(r''':\s*['"]([\w-]+)['"]''', m.group(1)):
            icons.setdefault(name, 'CAT_ICON i js/ui/funfact.js')
    icons.setdefault('star', 'standardikonen i js/ui/funfact.js')
# Religionernas symboler (#271): fältet symbol i religions.json är en ikonfil i img/icons/
religions = load('data/religions.json') if (DIST / 'data/religions.json').is_file() else None
for r in (religions or {}).get('religions', []):
    if r.get('symbol'):
        icons.setdefault(r['symbol'], f"data/religions.json ({r['id']}, symbol)")
# Rikenas symboler (#301) och tidsstyrda flaggor (#462).
empires_idx = load('data/empires/index.json') if (DIST / 'data/empires/index.json').is_file() else None
for g in (empires_idx or {}).get('groups', []):
    if g.get('symbol'):
        icons.setdefault(g['symbol'], f"data/empires/index.json ({g['id']}, symbol)")
    for pid, pf in (g.get('polityFacts') or {}).items():
        if pf.get('symbol'):
            icons.setdefault(pf['symbol'], f"data/empires/index.json ({g['id']}, polityFacts.{pid}.symbol)")
    for fl in g.get('flags', []):
        exists(f"img/flags/{fl.get('file', '')}.svg", f"flaggan {fl.get('file', '')} (data/empires/index.json, {g['id']})")
for name, by in sorted(icons.items()):
    exists(f'img/icons/{name}.svg', f'ikonen {name} ({by})')
# Upptäcktsvyns bilder (#101)
discovery = load('data/upptackt.json') if (DIST / 'data/upptackt.json').is_file() else None
for d in (discovery or {}).get('decorations', []):
    exists(d.get('file', ''), f"data/upptackt.json ({d.get('id')}, file)")
# Tidsstyrda rasterbilder (#54)
image_layers = load('data/bildlager.json') if (DIST / 'data/bildlager.json').is_file() else None
image_slices = [(row, part) for row in (image_layers or {}).get('layers', []) if isinstance(row, dict)
                for part in row.get('slices', []) if isinstance(part, dict)]
for row, part in image_slices:
    exists(str(part.get('file', '')), f"data/bildlager.json ({part.get('id')}, file)")

# 8. Källor och fun facts
sources = load('data/sources.json') or {'sources': []}
src_ids = {s['id'] for s in sources['sources']}
ev_ids = {e['id'] for e in events['events']}
evidence_fields = {'summary', 'date', 'location', 'image', 'uncertainty'}
for e in events['events']:
    for s in e.get('sources', []) + (e.get('story') or {}).get('sources', []):
        if s not in src_ids:
            err(f"data/events.json ({e['id']}): källan {s} finns inte i sources.json")
    for field, refs in (e.get('evidence') or {}).items():
        if field not in evidence_fields:
            err(f"data/events.json ({e['id']}): evidence.{field} är inte ett känt påstående")
            continue
        if not isinstance(refs, list):
            continue  # JSON Schema ger ett tydligare formfel nedan.
        for ref in refs:
            if not isinstance(ref, dict):
                continue  # JSON Schema ger ett tydligare formfel nedan.
            source = ref.get('source')
            if source not in src_ids:
                err(f"data/events.json ({e['id']}): evidence.{field} använder källan {source}, som inte finns i sources.json")
            elif source not in e.get('sources', []):
                err(f"data/events.json ({e['id']}): evidence.{field} använder källan {source}, som saknas i händelsens sources")
for path, r in routes:
    rid = r.get('id', '?')
    for s in r.get('sources', []):
        if s not in src_ids:
            err(f'{path} ({rid}): källan {s} finns inte i sources.json')
    for i, leg in enumerate(r.get('legs', [])):
        for s in leg.get('sources', []):
            if s not in src_ids:
                err(f'{path} ({rid}, etapp {i + 1}): källan {s} finns inte i sources.json')
    if r.get('event') and r['event'] not in ev_ids:
        err(f"{path} ({rid}): händelsen {r['event']} finns inte i events.json")
for d in (discovery or {}).get('decorations', []):
    if d.get('source') and d['source'] not in src_ids:
        err(f"data/upptackt.json ({d.get('id')}): källan {d['source']} finns inte i sources.json")
for row, part in image_slices:
    for s in part.get('sources', []) if isinstance(part.get('sources'), list) else []:
        if s not in src_ids:
            err(f"data/bildlager.json ({part.get('id')}): källan {s} finns inte i sources.json")
# Människans spridning (#1094): källorna och händelserna som platserna pekar på
spread = load('data/spridning.json') if (DIST / 'data/spridning.json').is_file() else None
for item in (spread or {}).get('items', []):
    for s in item.get('sources', []):
        if s not in src_ids:
            err(f"data/spridning.json ({item.get('id')}): källan {s} finns inte i sources.json")
    for place in item.get('places', []) + [p for part in item.get('parts', []) for p in part] + [p for path in item.get('paths', []) for p in path]:
        if 'event' in place and place['event'] not in ev_ids:
            err(f"data/spridning.json ({item.get('id')}): händelsen {place['event']} finns inte i events.json")
        elif 'event' not in place and not (isinstance(place.get('coord'), list) and len(place['coord']) == 2):
            err(f"data/spridning.json ({item.get('id')}): en plats saknar event och coord")
funfacts = load('data/funfacts.json') or {'funfacts': []}
for f in funfacts['funfacts']:
    for i in f.get('events', []):
        if i not in ev_ids:
            err(f"data/funfacts.json ({f.get('id')}): händelsen {i} finns inte i events.json")
# Introduktionen (#363) får bara hänvisa till befintliga, redan visbara händelser och fun facts.
intro = load('data/intro.json') or {}
funfact_ids = {f.get('id') for f in funfacts['funfacts']}
if intro.get('funfact') not in funfact_ids:
    err(f"data/intro.json: fun facten {intro.get('funfact')} finns inte i data/funfacts.json")
for step in intro.get('steps', []):
    if step.get('event') and step['event'] not in ev_ids:
        err(f"data/intro.json: händelsen {step['event']} finns inte i data/events.json")
# Det viktigaste att ta med sig (#500): varje punkt har egna källor som finns i sources.json
for e in events['events']:
    for i, x in enumerate((e.get('story') or {}).get('takeaways', [])):
        if not x.get('sources'):
            err(f"data/events.json ({e['id']}, takeaways[{i}]): punkten saknar källor")
        for src in x.get('sources', []):
            if src not in src_ids:
                err(f"data/events.json ({e['id']}, takeaways[{i}]): källan {src} finns inte i sources.json")
# Guidade turer (#47): registret och turerna finns, och stegen pekar på befintliga händelser och källor.
# Lagrens id kontrolleras av tests/tour.test.mjs, som läser lagerlistan i js/layers/index.js.
tours = []
tours_index = load('data/turer/index.json') if exists('data/turer/index.json', 'Guidade turer') else None
for tid in (tours_index or {}).get('tours', []):
    path = f'data/turer/{tid}.json'
    if not exists(path, 'data/turer/index.json'):
        continue
    tour = load(path)
    if not isinstance(tour, dict):
        continue
    tours.append((path, tour))
    if tour.get('id') != tid:
        err(f"{path}: id {tour.get('id')!r} ska vara samma som filnamnet ({tid})")
    if tour.get('war') and tour['war'] not in ev_ids:
        err(f"{path}: kriget {tour['war']} finns inte i events.json")
    if tour.get('empire') and tour['empire'] not in {g.get('id') for g in (empires or {}).get('groups', [])}:
        err(f"{path}: riket {tour['empire']} finns inte i data/empires/index.json")
    for c in (tour.get('lesson') or {}).get('curriculum', []):  # lärarfälten (#737)
        for src in c.get('sources', []):
            if src not in src_ids:
                err(f'{path} (lesson): källan {src} finns inte i sources.json')
    for i, step in enumerate(tour.get('steps', [])):
        where = f"{path} (steg {i + 1}, {step.get('id', '?')})"
        if step.get('open') and step['open'] not in ev_ids:
            err(f"{where}: händelsen {step['open']} finns inte i events.json")
        if not step.get('sources'):
            err(f'{where}: källor saknas (sources)')
        for src in step.get('sources', []):
            if src not in src_ids:
                err(f'{where}: källan {src} finns inte i sources.json')
# Rikenas faktarutor och försvunna länders årtal och efterträdare (#170, #72): källor och händelser finns
for g in (empires or {}).get('groups', []):
    fa, v = g.get('facts') or {}, g.get('vanished') or {}
    caps = [s for c in g.get('capitals', []) for s in c.get('sources', [])]  # huvudstäder (#474)
    for s in fa.get('sources', []) + [s for m in fa.get('milestones', []) for s in m.get('sources', [])] + v.get('sources', []) + caps:
        if s not in src_ids:
            err(f"data/empires/index.json ({g.get('id')}): källan {s} finns inte i sources.json")
    for i in [i for m in fa.get('milestones', []) for i in m.get('events', [])]:
        if i not in ev_ids:
            err(f"data/empires/index.json ({g.get('id')}): händelsen {i} finns inte i events.json")

# 8b. JSON Schema (#391): schemana ligger utanför dist/ och används bara vid bygg och kontroll.
validate_schema_file('data/events.json', events, 'event.schema.json')
validate_schema_file('data/sources.json', sources, 'source.schema.json')
validate_schema_file('data/empires/index.json', empires or {}, 'empire-index.schema.json')
validate_schema_file('data/routes/index.json', routes_index or {}, 'routes-index.schema.json')
for path, route in routes:
    validate_schema_file(path, {'routes': [route]}, 'route.schema.json')
validate_schema_file('data/funfacts.json', funfacts, 'funfact.schema.json')
validate_schema_file('data/turer/index.json', tours_index or {}, 'tours-index.schema.json')
for path, tour in tours:
    validate_schema_file(path, tour, 'tour.schema.json')

# 8b2. Bildlager (#54, formatet @2 i #1325): schemat och det som den lilla schemakontrollen inte kan uttrycka.
IMAGE_ROW_KEYS = {'id', 'kind', 'aliases', 'group', 'name', 'note', 'label', 'slices'}
IMAGE_SLICE_KEYS = {'id', 'title', 'format', 'file', 'width', 'height', 'from', 'to', 'bounds', 'opacity',
                    'caveat', 'sources', 'review', 'license'}
IMAGE_MAX_PIXELS = 4096 * 2048  # en avkodad bild på 4096 × 2048 tar cirka 32 MB i minnet


def image_layer_problems(doc, reserved, groups):
    """Fel i data/bildlager.json utöver schemat. reserved = andra lagers id, groups = grupperna i vyer.json."""
    found, names, slice_ids = [], {}, set()
    for row in doc.get('layers', []):
        if not isinstance(row, dict):
            continue
        rid = row.get('id', '?')
        for key in sorted(set(row) - IMAGE_ROW_KEYS):
            found.append(f'({rid}): okänt fält {key!r}')
        for name in [rid] + [a for a in row.get('aliases', []) if isinstance(a, str)]:
            if name in reserved:
                found.append(f'({rid}): id eller alias {name!r} används redan av ett annat lager')
            if name in names:
                found.append(f'({rid}): id eller alias {name!r} används också av raden {names[name]}')
            names[name] = rid
        if groups and row.get('group') is not None and row['group'] not in groups:
            found.append(f"({rid}): gruppen {row['group']!r} finns inte i data/vyer.json")
        if row.get('kind') == 'grund' and 'label' not in row:
            found.append(f'({rid}): kind "grund" kräver label (en växlande grundkarta är alltid märkt)')
        spans = []
        for part in row.get('slices', []) if isinstance(row.get('slices'), list) else []:
            if not isinstance(part, dict):
                continue
            sid = part.get('id', '?')
            for key in sorted(set(part) - IMAGE_SLICE_KEYS):
                found.append(f'({sid}): okänt fält {key!r}')
            if sid in slice_ids:
                found.append(f'({sid}): id finns flera gånger')
            slice_ids.add(sid)
            fmt, file = part.get('format'), str(part.get('file', ''))
            if fmt == 'raster':
                if file.endswith('.json'):
                    found.append(f'({sid}): format "raster" ska peka på en bildfil, inte {file}')
                w, h = part.get('width'), part.get('height')
                if not isinstance(w, int) or not isinstance(h, int):
                    found.append(f'({sid}): format "raster" kräver width och height')
                elif w * h > IMAGE_MAX_PIXELS:
                    found.append(f'({sid}): bilden är {w} × {h}, mer än {IMAGE_MAX_PIXELS} bildpunkter')
            elif fmt == 'vektor':
                if not file.endswith('.json'):
                    found.append(f'({sid}): format "vektor" ska peka på en JSON-fil, inte {file}')
                if 'bounds' in part:
                    found.append(f'({sid}): bounds gäller bara format "raster"')
            b = part.get('bounds')
            if isinstance(b, list):
                if len(b) != 4 or not all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in b):
                    found.append(f'({sid}): bounds ska vara fyra tal, [väst, syd, öst, nord]')
                elif not (b[0] < b[2] and b[1] < b[3] and -90 <= b[1] and b[3] <= 90):
                    found.append(f'({sid}): bounds ska ha väst < öst och syd < nord, med syd och nord inom ±90')
            start, end = part.get('from'), part.get('to')
            if isinstance(start, int):
                if isinstance(end, int) and end < start:
                    found.append(f'({sid}): to ({end}) är före from ({start})')
                spans.append((start, end if isinstance(end, int) else float('inf'), sid))
        spans.sort()
        for (_, end, a), (start, _, b) in zip(spans, spans[1:]):
            if start <= end:
                found.append(f'({rid}): skivorna {a} och {b} överlappar i tid')
    return found


if image_layers is not None:
    validate_schema_file('data/bildlager.json', image_layers, 'bildlager.schema.json')
    # Lagrens id står i js/layers/index.js (LAYERS); "images" där är bildlagrens egna rader, inte ett lager-id.
    try:
        listed = re.search(r'export const LAYERS = \[([^\]]*)\]', (ROOT / 'js/layers/index.js').read_text(encoding='utf-8'))
    except OSError:
        listed = None
    if not listed:
        err('js/layers/index.js: hittar inte LAYERS, så bildlagrens id kan inte kontrolleras')
    reserved_layers = {x.strip() for x in listed.group(1).split(',')} - {'images', ''} if listed else set()
    try:
        view_groups = {g.get('id') for g in json.loads((ROOT / 'data/vyer.json').read_text(encoding='utf-8')).get('groups', [])}
    except (OSError, ValueError):
        view_groups = set()
    for problem in image_layer_problems(image_layers, reserved_layers, view_groups):
        err(f'data/bildlager.json {problem}')

# 8c. Missuppfattningar (#838): filen publiceras (scripts/build-site.sh, sedan #858) och appen läser den; här kontrolleras den ur repot.
misc_path = ROOT / 'data' / 'missuppfattningar.json'
if misc_path.is_file():
    try:
        misc = json.loads(misc_path.read_text(encoding='utf-8'))
    except ValueError as e:
        misc = None
        err(f'data/missuppfattningar.json: går inte att läsa ({e})')
    if misc is not None:
        validate_schema_file('data/missuppfattningar.json', misc, 'missuppfattning.schema.json')
        for m in misc.get('misconceptions', []):
            mid = m.get('id', '?')
            if not m.get('events') and not isinstance(m.get('year'), int):
                err(f'data/missuppfattningar.json ({mid}): saknar både events och year')
            for i in m.get('events', []):
                if i not in ev_ids:
                    err(f'data/missuppfattningar.json ({mid}): händelsen {i} finns inte i events.json')
            for s in m.get('sources', []):
                if s not in src_ids:
                    err(f'data/missuppfattningar.json ({mid}): källan {s} finns inte i sources.json')

# 8c2. Quizets tidsfrågor (#846): varje fråga pekar på händelser som finns, med rätt antal för sin sort.
quiz_path = ROOT / 'data' / 'quiz.json'
if quiz_path.is_file():
    try:
        quiz = json.loads(quiz_path.read_text(encoding='utf-8'))
    except ValueError as e:
        quiz = None
        err(f'data/quiz.json: går inte att läsa ({e})')
    if quiz is not None:
        seen = set()
        for q in quiz.get('questions', []):
            qid = q.get('id', '?')
            if qid in seen:
                err(f'data/quiz.json ({qid}): id finns två gånger')
            seen.add(qid)
            want = {'first': 2, 'closer': 3}.get(q.get('kind'))
            if want is None:
                err(f'data/quiz.json ({qid}): okänd sort {q.get("kind")}')
            elif len(q.get('events', [])) != want:
                err(f'data/quiz.json ({qid}): sorten {q.get("kind")} ska ha {want} händelser')
            for i in q.get('events', []):
                if i not in ev_ids:
                    err(f'data/quiz.json ({qid}): händelsen {i} finns inte i events.json')

# 8d. Perioder och epoker (#845, #476): filen läses inte av appen än; här kontrolleras den ur repot.
per_path = ROOT / 'data' / 'perioder.json'
if per_path.is_file():
    try:
        per = json.loads(per_path.read_text(encoding='utf-8'))
    except ValueError as e:
        per = None
        err(f'data/perioder.json: går inte att läsa ({e})')
    if per is not None:
        validate_schema_file('data/perioder.json', per, 'perioder.schema.json')
        seen_div, seen_per = set(), set()
        for d in per.get('divisions', []):
            did = d.get('id', '?')
            if did in seen_div:
                err(f'data/perioder.json: indelningen {did} finns två gånger')
            seen_div.add(did)
            for p in d.get('periods', []):
                pid = p.get('id', '?')
                if (did, pid) in seen_per:
                    err(f'data/perioder.json ({did}/{pid}): id finns två gånger')
                seen_per.add((did, pid))
                if p.get('open') and 'end' in p:
                    err(f'data/perioder.json ({did}/{pid}): en öppen period (open) ska inte ha end')
                if not p.get('open') and 'end' not in p:
                    err(f'data/perioder.json ({did}/{pid}): saknar end (eller open: true)')
                if 'end' in p and isinstance(p.get('start'), int) and p['end'] < p['start']:
                    err(f'data/perioder.json ({did}/{pid}): end ligger före start')
                for src in p.get('sources', []):
                    if src not in src_ids:
                        err(f'data/perioder.json ({did}/{pid}): källan {src} finns inte i sources.json')

# 8e. Teman (#398): filen publiceras (scripts/build-site.sh) och Fokus läser den. Ett tema är ett urval av befintliga
# händelser; regler och format står i docs/datamodell.md (teman.json). Varningar stoppar inte bygget.
VISIBLE = {'source-checked', 'two-sources'}
EARLIEST_YEAR = -99999  # MIN_YEAR i js/state.js (#1088)


def region_of(lat, lon):
    """Samma indelning som region() i js/model.js."""
    # Västra Anatoliens kust, samma som AEGEAN_COAST i js/model.js (#1334); här i funktionen så att testet kan köra den ensam
    coast = [(40.45, 26.75), (40.0, 26.2), (39.5, 26.05), (39.4, 26.62), (39.0, 26.75), (38.7, 26.7),
             (38.45, 26.4), (38.3, 26.25), (38.0, 26.9), (37.75, 27.1), (37.6, 27.05), (37.4, 27.15), (37.0, 27.2),
             (36.95, 27.38), (36.6, 27.6)]

    def coast_lon(lat):
        for i in range(1, len(coast)):
            a, x = coast[i - 1]
            b, y = coast[i]
            if lat >= b:
                return y + (lat - b) / (a - b) * (x - y)
        return coast[-1][1]
    if lat > 50 and (lon < -168 or lon > 160): return 'Asien'
    if lon < -125 and lat < 35: return 'Oceanien'
    if lon < -105 and lat < -10: return 'Oceanien'
    if -32 <= lon < -20:  # Azorerna och Kap Verde (#1334)
        if 36 < lat < 40.5: return 'Europa'
        if 13 < lat < 18: return 'Afrika'
    if lon < -25: return 'Amerika'
    if lon < -10 and lat >= 68: return 'Amerika'  # Grönlands östkust (#1135)
    if (lat < -10 and lon > 110) or (lat < 22 and lon > 130) or lon > 160: return 'Oceanien'
    if -20 <= lon < 52 and lat > -36:
        if lon < -1.5: africa = lat < 36
        elif lon <= 11.5: africa = lat < 37.5
        elif lon <= 32.5: africa = lat < 33.5
        else: africa = (lat < 31.5 and lon < 32.5 + (30 - lat) * 0.62) or lat < 12  # Somalia (#1334)
        if africa: return 'Afrika'
    if 52 <= lon < 64 and -22 < lat < -3: return 'Afrika'  # Maskarenerna och Seychellerna (#1334)
    if 36.6 <= lat <= 40.45 and lon < 28.9 and lon > coast_lon(lat): return 'Asien'  # västra Anatolien (#1334)
    if lat >= 35 and (lon < 28.9 or (lat >= 41 and lon < 60 and not (lon > 40 and lat < 44.5))): return 'Europa'
    return 'Asien'


themes_doc = load('data/teman.json') if (DIST / 'data/teman.json').is_file() else None
if themes_doc is not None:
    validate_schema_file('data/teman.json', themes_doc, 'teman.schema.json')
    views_doc = load('data/vyer.json') if (DIST / 'data/vyer.json').is_file() else None
    view_by_id = {v.get('id'): v for v in (views_doc or {}).get('views', [])}
    ev_by_id = {e['id']: e for e in events['events']}
    seen_themes = set()
    for th in themes_doc.get('themes', []):
        tid = th.get('id', '?')
        where = f'data/teman.json ({tid})'
        if tid in seen_themes:
            err(f'{where}: id finns två gånger')
        seen_themes.add(tid)
        if th.get('placeholder'):
            if th.get('review') != 'draft':
                err(f'{where}: ett tema med placeholder måste vara draft')
            err(f'{where}: platshållare (placeholder) får inte finnas i den publicerade filen')
        for s in th.get('sources', []):
            if s not in src_ids:
                err(f'{where}: källan {s} finns inte i sources.json')
        if th.get('view') is not None:
            v = view_by_id.get(th['view'])
            if v is None:
                err(f"{where}: vyn {th['view']} finns inte i data/vyer.json")
            elif v.get('tag'):
                err(f"{where}: vyn {th['view']} har en tagg (tag), vilket inte är tillåtet i ett tema")
        ids = th.get('events', [])
        if len(set(ids)) != len(ids):
            err(f'{where}: events har dubbletter')
        shown = []
        for i in ids:
            e = ev_by_id.get(i)
            if e is None:
                err(f'{where}: händelsen {i} finns inte i events.json')
            elif e.get('review') in VISIBLE:
                shown.append(e)
        if len(shown) < 5:
            err(f'{where}: minst 5 av händelserna ska synas (källkontrollerade), men det är {len(shown)}')
        regions = {region_of(e['location']['coordinates'][1], e['location']['coordinates'][0]) for e in shown}
        if len(regions) < 3:
            print(f"validate-site: VARNING: {where}: bara {len(regions)} världsdel(ar) bland de synliga händelserna (minst 3 önskas)", file=sys.stderr)
        before = [e['id'] for e in shown if e.get('start', 0) < EARLIEST_YEAR]
        if before:
            print(f"validate-site: VARNING: {where}: börjar före tidslinjens början: {', '.join(before)}", file=sys.stderr)

# 8f. Platser (#579): kurerade kort om platsers historia med dagens gräns som kontur. Händelserna ligger inom gränsen
# (räknas vid körning i js/place-geo.js), så här kontrolleras källor, gräns och att det finns något att visa.
places_doc = load('data/platser.json') if (DIST / 'data/platser.json').is_file() else None
if places_doc is not None:
    validate_schema_file('data/platser.json', places_doc, 'platser.schema.json')
    ev_all = [e for e in events['events'] if e.get('review') in VISIBLE and e['location']['type'] == 'Point']
    seen_places = set()

    def in_ring(ring, lon, lat):
        inside = False
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, yi = ring[i]; xj, yj = ring[j]
            if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
                inside = not inside
            j = i
        return inside

    def edge_km(polys, lon, lat):
        """Som edgeKm i js/place-geo.js: kortaste avståndet till gränsen i km."""
        k = math.cos(math.radians(lat))
        best = float('inf')
        for poly in polys:
            for ring in poly:
                for i in range(1, len(ring)):
                    ax, ay = (ring[i - 1][0] - lon) * k, ring[i - 1][1] - lat
                    bx, by = (ring[i][0] - lon) * k, ring[i][1] - lat
                    dx, dy = bx - ax, by - ay
                    ln = dx * dx + dy * dy
                    u = max(0, min(1, -(ax * dx + ay * dy) / ln)) if ln else 0
                    best = min(best, math.hypot(ax + u * dx, ay + u * dy) * 111.2)
        return best

    for pl in places_doc.get('places', []):
        pid = pl.get('id', '?')
        where = f'data/platser.json ({pid})'
        if pid in seen_places:
            err(f'{where}: id finns två gånger')
        seen_places.add(pid)
        if pl.get('placeholder'):
            err(f'{where}: platshållare (placeholder) får inte finnas i den publicerade filen')
        for s_ in pl.get('sources', []) + [pl.get('boundary', {}).get('source')]:
            if s_ not in src_ids:
                err(f'{where}: källan {s_} finns inte i sources.json')
        geom = pl.get('boundary', {}).get('geometry', {})
        polys = [geom['coordinates']] if geom.get('type') == 'Polygon' else geom.get('coordinates', [])
        for poly in polys:
            for ring in poly:
                if len(ring) < 4 or ring[0] != ring[-1]:
                    err(f'{where}: en ring i gränsen är inte sluten eller har färre än fyra punkter')
                    break
                if any(not (-180 <= x <= 180 and -90 <= y <= 90) for x, y in ring):
                    err(f'{where}: en koordinat i gränsen ligger utanför jordklotet')
                    break
        def within(e):
            lon, lat = e['location']['coordinates'][:2]
            return any(in_ring(poly[0], lon, lat) and not any(in_ring(h, lon, lat) for h in poly[1:]) for poly in polys) or edge_km(polys, lon, lat) <= 20  # COAST_MARGIN_KM
        inside = [e for e in ev_all if within(e)]
        if len(inside) < 5:
            err(f'{where}: minst 5 synliga händelser ska ligga inom gränsen, men det är {len(inside)}')

# 9. Krigets riken (#76): empires är grupp-id i data/empires/index.json
group_ids = {g.get('id') for g in (empires or {}).get('groups', [])}
for e in events['events']:
    if 'empires' not in e:
        continue
    if e.get('kind') != 'war':
        err(f"data/events.json ({e['id']}): empires får bara finnas på krig (kind: war)")
    if not isinstance(e['empires'], list):
        err(f"data/events.json ({e['id']}): empires ska vara en lista")
        continue
    for g in e['empires']:
        if g not in group_ids:
            err(f"data/events.json ({e['id']}): riket {g} finns inte i data/empires/index.json")

# 10. Byggda händelsefiler och uppdelade filer (#337, #394): samma innehåll som tools/dela_data.py skriver
# ur redigeringsfilerna i repot (data/handelser/ publiceras inte, så de läses från ROOT, inte från dist/)
TOOL = ROOT / 'tools' / 'dela_data.py'
if not TOOL.is_file():
    err(f'{TOOL} saknas: data/events.json och de uppdelade filerna i data/genererat/ kan inte kontrolleras')
elif (ROOT / 'data/empires/index.json').is_file():
    import importlib.util
    spec = importlib.util.spec_from_file_location('dela_data', TOOL)
    dela_data = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(dela_data)
    for e in dela_data.check(ROOT, DIST):
        err(e)

# 11. Licensmanifest (#393): genererade filer i dist/ måste stämma med källorna.
LICENSE_TOOL = Path(__file__).resolve().parent.parent / 'tools' / 'license_manifests.py'
if not LICENSE_TOOL.is_file():
    err(f'{LICENSE_TOOL} saknas: licensmanifesten kan inte kontrolleras')
else:
    import importlib.util
    spec = importlib.util.spec_from_file_location('license_manifests', LICENSE_TOOL)
    license_manifests = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(license_manifests)
    for e in license_manifests.check(DIST):
        err(e)

# 12. Versionsrad (#552): filen måste finnas och ha giltiga releaseuppgifter.
if exists('data/version.json', 'Versionsuppgifter'):
    version_data = load('data/version.json')
    if isinstance(version_data, dict):
        version = version_data.get('version')
        released = version_data.get('released')
        releases = version_data.get('releases')
        is_development = isinstance(version, str) and version.endswith('-dev')
        if not isinstance(version, str) or not re.fullmatch(r'[0-9]+\.[0-9]+\.[0-9]+(?:-dev)?', version):
            err('data/version.json: version ska följa X.Y.Z eller X.Y.Z-dev')
        if not isinstance(released, str):
            err('data/version.json: released ska vara en textsträng')
        elif released:
            if not re.fullmatch(r'[0-9]{4}-[0-9]{2}-[0-9]{2}', released):
                err('data/version.json: released ska vara ett datum på formen ÅÅÅÅ-MM-DD eller tomt')
            else:
                try:
                    date.fromisoformat(released)
                except ValueError:
                    err('data/version.json: released ska vara ett giltigt datum')
        if is_development and released:
            err('data/version.json: released ska vara tomt för en utvecklingsversion')
        if not isinstance(releases, str) or not re.fullmatch(r'https://\S+', releases):
            err('data/version.json: releases ska vara en HTTPS-länk')
    elif version_data is not None:
        err('data/version.json: roten ska vara ett objekt')

if errors:
    print(f'validate-site: {len(errors)} fel', file=sys.stderr)
    for e in errors:
        print(f'  - {e}', file=sys.stderr)
    sys.exit(1)
print(f'validate-site: ok ({sum(1 for p in DIST.rglob("*") if p.is_file())} filer, '
      f'{len(graph)} JS-moduler, {len(icons)} ikoner kontrollerade)')
