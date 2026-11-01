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
 10. De uppdelade filerna i data/genererat/ (#337) stämmer med källfilerna data/events.json och
     data/empires/index.json, alltså att någon har kört python3 tools/dela_data.py efter sin ändring.
     Kontrollen räknar fram filerna med samma kod som skriptet (tools/dela_data.py i repot).

Användning: python3 scripts/validate-site.py [dist]
"""
import json
import re
import sys
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


def schema_errors(value, schema, path='$'):
    """Validerar den lilla JSON Schema-del som används i schemas/ (#391)."""
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
                found += schema_errors(value[name], child, f'{path}.{name}')
    elif isinstance(value, list) and 'items' in schema:
        for i, item in enumerate(value):
            found += schema_errors(item, schema['items'], f'{path}[{i}]')
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
# Rikenas symboler (#301): symbol i varje grupp och i polityFacts i data/empires/index.json
empires_idx = load('data/empires/index.json') if (DIST / 'data/empires/index.json').is_file() else None
for g in (empires_idx or {}).get('groups', []):
    if g.get('symbol'):
        icons.setdefault(g['symbol'], f"data/empires/index.json ({g['id']}, symbol)")
    for pid, pf in (g.get('polityFacts') or {}).items():
        if pf.get('symbol'):
            icons.setdefault(pf['symbol'], f"data/empires/index.json ({g['id']}, polityFacts.{pid}.symbol)")
for name, by in sorted(icons.items()):
    exists(f'img/icons/{name}.svg', f'ikonen {name} ({by})')
# Upptäcktsvyns bilder (#101)
discovery = load('data/upptackt.json') if (DIST / 'data/upptackt.json').is_file() else None
for d in (discovery or {}).get('decorations', []):
    exists(d.get('file', ''), f"data/upptackt.json ({d.get('id')}, file)")
# Tidsstyrda rasterbilder (#54)
image_layers = load('data/bildlager.json') if (DIST / 'data/bildlager.json').is_file() else None
for layer in (image_layers or {}).get('layers', []):
    exists(layer.get('file', ''), f"data/bildlager.json ({layer.get('id')}, file)")

# 8. Källor och fun facts
sources = load('data/sources.json') or {'sources': []}
src_ids = {s['id'] for s in sources['sources']}
ev_ids = {e['id'] for e in events['events']}
for e in events['events']:
    for s in e.get('sources', []) + (e.get('story') or {}).get('sources', []):
        if s not in src_ids:
            err(f"data/events.json ({e['id']}): källan {s} finns inte i sources.json")
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
for layer in (image_layers or {}).get('layers', []):
    if layer.get('source') and layer['source'] not in src_ids:
        err(f"data/bildlager.json ({layer.get('id')}): källan {layer['source']} finns inte i sources.json")
funfacts = load('data/funfacts.json') or {'funfacts': []}
for f in funfacts['funfacts']:
    for i in f.get('events', []):
        if i not in ev_ids:
            err(f"data/funfacts.json ({f.get('id')}): händelsen {i} finns inte i events.json")
# Rikenas faktarutor och försvunna länders årtal och efterträdare (#170, #72): källor och händelser finns
for g in (empires or {}).get('groups', []):
    fa, v = g.get('facts') or {}, g.get('vanished') or {}
    for s in fa.get('sources', []) + [s for m in fa.get('milestones', []) for s in m.get('sources', [])] + v.get('sources', []):
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

# 10. Uppdelade filer (#337): samma innehåll som tools/dela_data.py skriver ur källfilerna i dist/
TOOL = Path(__file__).resolve().parent.parent / 'tools' / 'dela_data.py'
if not TOOL.is_file():
    err(f'{TOOL} saknas: de uppdelade filerna i data/genererat/ kan inte kontrolleras')
elif (DIST / 'data/events.json').is_file() and (DIST / 'data/empires/index.json').is_file():
    import importlib.util
    spec = importlib.util.spec_from_file_location('dela_data', TOOL)
    dela_data = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(dela_data)
    for e in dela_data.check(DIST):
        err(e)

if errors:
    print(f'validate-site: {len(errors)} fel', file=sys.stderr)
    for e in errors:
        print(f'  - {e}', file=sys.stderr)
    sys.exit(1)
print(f'validate-site: ok ({sum(1 for p in DIST.rglob("*") if p.is_file())} filer, '
      f'{len(graph)} JS-moduler, {len(icons)} ikoner kontrollerade)')
