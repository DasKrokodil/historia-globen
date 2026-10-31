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
     events.json och CAT_ICON i js/ui/funfact.js).
  8. Varje källa som en händelse, ett krigs berättelse, en väg, en etapp eller en dekoration i
     upptäcktsvyn anger finns i sources.json,
     och varje händelse som en fun fact eller en väg (event) pekar på finns i events.json (CLAUDE.md,
     Testa innan du är klar).

Användning: python3 scripts/validate-site.py [dist]
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else 'dist').resolve()

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
for g in (empires or {}).get('groups', []):
    exists(g.get('file', ''), f"data/empires/index.json ({g.get('id')})")

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
for name, by in sorted(icons.items()):
    exists(f'img/icons/{name}.svg', f'ikonen {name} ({by})')
# Upptäcktsvyns bilder (#101)
discovery = load('data/upptackt.json') if (DIST / 'data/upptackt.json').is_file() else None
for d in (discovery or {}).get('decorations', []):
    exists(d.get('file', ''), f"data/upptackt.json ({d.get('id')}, file)")

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
funfacts = load('data/funfacts.json') or {'funfacts': []}
for f in funfacts['funfacts']:
    for i in f.get('events', []):
        if i not in ev_ids:
            err(f"data/funfacts.json ({f.get('id')}): händelsen {i} finns inte i events.json")

if errors:
    print(f'validate-site: {len(errors)} fel', file=sys.stderr)
    for e in errors:
        print(f'  - {e}', file=sys.stderr)
    sys.exit(1)
print(f'validate-site: ok ({sum(1 for p in DIST.rglob("*") if p.is_file())} filer, '
      f'{len(graph)} JS-moduler, {len(icons)} ikoner kontrollerade)')
