#!/usr/bin/env python3
"""Täckningsrapport: var är det tomt på globen? (#563)

Mäter bara det som redan finns och skriver inga fakta. Verktyget räknar händelserna i
data/events.json per tidsperiod, världsdel och kategori, och visar balansen mellan krig och
övrigt, andelen med bild, fun fact och två källor, och osäkerheten. Sist kommer en prioriterad
lista över luckor. Vilka händelser som saknas avgörs inte här, utan med öppnad källa (CLAUDE.md,
Källpolicy).

  python3 tools/tackning.py                     skriver docs/granskningar/tackning-<dagens datum>.md
  python3 tools/tackning.py --datum 2026-11-05  skriver rapporten med det datumet
  python3 tools/tackning.py --root <mapp> --ut -  läser data under <mapp> och skriver till skärmen

Läser data/events.json, data/funfacts.json, data/sources.json, images/incoming/bildlogg.json
(bilder som väntar på att läggas in), data/land.json (världsdelarnas landyta) och data/empires/ (riken, #1341).
Med --cliopatria <fil> jämförs rikenas landyta också med Cliopatria (cliopatria_polities_only_v021.geojson, CC BY 4.0);
filen hämtas aldrig från nätet, och utan den står jämförelsen som "inte mätt".

Deterministiskt: samma indata och samma datum ger exakt samma rapport. Bara Pythons standardbibliotek.

Regler:
- En händelse räknas en gång, efter sitt startår och sin punkt på globen.
- Världsdel = region() i js/model.js (samma som Samtidigt-panelen), via tools/tackningsrapport.py.
- Krig = kind "war" eller kategorin krig. Balansen visas också utan de slag som bara syns i Fokus: händelser med
  partOf men utan "top": true (#1341, DasKrokodils ja 2026-11-13). Den extra tabellen räknar bort dem helt.
- Riken = grupperna i data/empires/index.json, utom delar med review "draft". Ett rike räknas i en period och
  världsdel när någon av dess gränser gäller under perioden; världsdelen tas ur gränsens etikettpunkt (label).
- Rikenas landyta = andelen av landytan i data/land.json (norr om 60° S) som ligger inom någon rikesgräns ett
  provår, på ett rutnät om en grad (rutans mittpunkt), viktad med cos(latitud).
- Bild = fältet image utan placeholder. Fun fact = händelsen finns i någon fun facts events (inte draft).
  Två källor = minst två olika id i sources som finns i data/sources.json.
- Osäkert datum = ~ eller ? i edtf. Ungefärlig plats = fältet locationPrecision.
- Världsdelens storlek = dess andel av landytan i data/land.json (Natural Earth 1:50m) norr om 60° S,
  räknad på ett rutnät om en halv grad, viktad med cos(latitud) och delad med region().
"""
import argparse
import importlib.util
import json
import math
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location('tackningsrapport', TOOLS / 'tackningsrapport.py')
_tr = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_tr)
region = _tr.region
REGIONS = _tr.REGIONS  # Europa, Asien, Afrika, Amerika, Oceanien

# Samma ordning som CATEGORIES i js/model.js
CATEGORIES = ['natur', 'manniskan', 'civilisationer', 'religion', 'vetenskap', 'upptackter', 'krig',
              'kultur', 'sport', 'ekonomi', 'halsa', 'klimat', 'katastrofer', 'rymden']

# Perioderna efter startår (astronomiskt år: 0 = 1 f.Kr.). (id, namn, första år, sista år).
# Förhistorien räknas här från 10 000 f.Kr. när periodens längd vägs in; äldre händelser räknas ändå dit.
PERIODS = [
    ('forhistoria', 'Förhistoria (före 3000 f.Kr.)', -9999, -3000),
    ('antiken', 'Antiken (3000 f.Kr.–500)', -2999, 500),
    ('medeltid', 'Medeltid (501–1500)', 501, 1500),
    ('tidigmodern', 'Tidigmodern tid (1501–1799)', 1501, 1799),
    ('1800', '1800-tal', 1800, 1899),
    ('1900', '1900-tal', 1900, 1999),
    ('2000', '2000-tal', 2000, None),  # till och med i år
]
FEW = 3  # färre än så räknas som nästan tomt
# Provår för rikenas landyta (#1341), astronomiska år (-499 = 500 f.Kr.)
EMPIRE_YEARS = [-499, 1, 500, 1000, 1300, 1500, 1700, 1850, 1914, 1950, 2000]
TOP_GAPS = 10


def period_of(start):
    for pid, _, first, _ in reversed(PERIODS):
        if start >= first:
            return pid
    return PERIODS[0][0]


def period_years(p, this_year):
    _, _, first, last = p
    return (last if last is not None else this_year) - first + 1


def century_of(start):
    """1000-talet = 1000–1099 osv. Bara år 1000 och senare."""
    return (start // 100) * 100


# ---------- Världsdelarnas landyta ----------

def land_shares(land_path, step=0.5):
    """{världsdel: andel av landytan} ur den färdigprojicerade pathen i data/land.json, eller None."""
    try:
        doc = json.loads(Path(land_path).read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return None
    w, h = doc['width'], doc['height']
    rings, ring = [], []
    for cmd, xs, ys in re.findall(r'([MLZ])(?:(-?[\d.]+),(-?[\d.]+))?', doc['path']):
        if cmd == 'M':
            if len(ring) > 2:
                rings.append(ring)
            ring = [(float(xs), float(ys))]
        elif cmd == 'L':
            ring.append((float(xs), float(ys)))
        elif cmd == 'Z':
            if len(ring) > 2:
                rings.append(ring)
            ring = []
    if len(ring) > 2:
        rings.append(ring)
    # Kanterna i grader, sorterade i band efter latitud så att varje rad bara prövar sina kanter
    rows = int(180 / step)
    bands = defaultdict(list)
    for r in rings:
        pts = [(x / w * 360 - 180, 90 - y / h * 180) for x, y in r]
        for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
            if y1 == y2:
                continue
            lo, hi = min(y1, y2), max(y1, y2)
            for b in range(max(0, int((90 - hi) / step)), min(rows, int((90 - lo) / step) + 1)):
                bands[b].append((x1, y1, x2, y2))
    area = Counter()
    for b in range(rows):
        lat = 90 - (b + 0.5) * step
        if lat < -60:
            continue  # Antarktis räknas inte
        xs = sorted(x1 + (lat - y1) * (x2 - x1) / (y2 - y1)
                    for x1, y1, x2, y2 in bands[b] if (y1 > lat) != (y2 > lat))
        weight = math.cos(math.radians(lat))
        for x_in, x_out in zip(xs[::2], xs[1::2]):  # jämn-udda-regeln: land mellan par av skärningar
            # Rutornas mittpunkter lon = -180 + (k + 0.5) * step som ligger mellan x_in och x_out
            k = max(0, math.ceil((x_in + 180) / step - 0.5))
            while k < 360 / step and -180 + (k + 0.5) * step < x_out:
                area[region(lat, -180 + (k + 0.5) * step)] += weight
                k += 1
    total = sum(area.values())
    return {r: area[r] / total for r in REGIONS} if total else None


def land_rings(land_path):
    """Landets ringar i grader [(lon, lat), ...] ur den färdigprojicerade pathen i data/land.json, eller None."""
    try:
        doc = json.loads(Path(land_path).read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return None
    w, h = doc['width'], doc['height']
    rings, ring = [], []
    for cmd, xs, ys in re.findall(r'([MLZ])(?:(-?[\d.]+),(-?[\d.]+))?', doc['path']):
        if cmd == 'M':
            if len(ring) > 2:
                rings.append(ring)
            ring = [(float(xs) / w * 360 - 180, 90 - float(ys) / h * 180)]
        elif cmd == 'L':
            ring.append((float(xs) / w * 360 - 180, 90 - float(ys) / h * 180))
        elif cmd == 'Z':
            if len(ring) > 2:
                rings.append(ring)
            ring = []
    if len(ring) > 2:
        rings.append(ring)
    return rings


def cells_inside(rings, step=1.0):
    """Rutorna (rad, kolumn) vars mittpunkt ligger inom ringarna enligt jämn-udda-regeln. Rad 0 börjar vid 90° N."""
    rows = int(180 / step)
    bands = defaultdict(list)
    for r in rings:
        for (x1, y1), (x2, y2) in zip(r, r[1:] + r[:1]):
            if y1 == y2:
                continue
            lo, hi = min(y1, y2), max(y1, y2)
            for b in range(max(0, int((90 - hi) / step)), min(rows, int((90 - lo) / step) + 1)):
                bands[b].append((x1, y1, x2, y2))
    out = set()
    for b, edges in bands.items():
        lat = 90 - (b + 0.5) * step
        xs = sorted(x1 + (lat - y1) * (x2 - x1) / (y2 - y1) for x1, y1, x2, y2 in edges if (y1 > lat) != (y2 > lat))
        for x_in, x_out in zip(xs[::2], xs[1::2]):
            k = max(0, math.ceil((x_in + 180) / step - 0.5))
            while k < 360 / step and -180 + (k + 0.5) * step < x_out:
                out.add((b, k))
                k += 1
    return out


def geometry_rings(geom):
    """Alla ringar i en GeoJSON-Polygon eller -MultiPolygon, som listor av (lon, lat)."""
    polys = [geom['coordinates']] if geom['type'] == 'Polygon' else geom['coordinates'] if geom['type'] == 'MultiPolygon' else []
    return [[(x, y) for x, y, *_ in ring] for poly in polys for ring in poly]


def geometry_cells(geom, step=1.0):
    """Rutorna inom en gräns: varje polygon för sig (hål räknas bort), sedan ihop."""
    polys = [geom['coordinates']] if geom['type'] == 'Polygon' else geom['coordinates'] if geom['type'] == 'MultiPolygon' else []
    out = set()
    for poly in polys:
        out |= cells_inside([[(x, y) for x, y, *_ in ring] for ring in poly], step)
    return out


def read_empires(root):
    """[(grupp, start, slut, (lon, lat), geometri)] för alla rikesgränser utom delar med review "draft"."""
    root = Path(root)
    try:
        index = json.loads((root / 'data/empires/index.json').read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return None
    out = []
    for g in index['groups']:
        try:
            doc = json.loads((root / g['file']).read_text(encoding='utf-8'))
        except (OSError, ValueError, KeyError):
            continue
        for pol in doc.get('polities', []):
            if pol.get('review') == 'draft':
                continue
            for per in pol.get('periods', []):
                if per.get('geometry'):
                    out.append((g['id'], per['start'], per['end'], tuple(per.get('label') or (0, 0)), per['geometry']))
    return out


def read_cliopatria(path):
    """[(start, slut, geometri)] för Cliopatrias stater (Type POLITY), eller None om filen saknas."""
    if not path:
        return None
    try:
        doc = json.loads(Path(path).read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return None
    return [(f['properties']['FromYear'], f['properties']['ToYear'], f['geometry']) for f in doc['features']
            if f['properties'].get('Type') == 'POLITY' and f.get('geometry')]


# ---------- Rapporten ----------

def pct(n, d):
    return '–' if not d else f'{round(100 * n / d)} %'


def mark(n):
    """0 = tomt, 1–2 = nästan tomt."""
    if n == 0:
        return '**0**'
    if n < FEW:
        return f'{n}*'
    return str(n)


def build(root, today, cliopatria=None):
    root = Path(root)
    read = lambda p: json.loads((root / p).read_text(encoding='utf-8'))
    events = read('data/events.json')['events']
    funfacts = read('data/funfacts.json')['funfacts']
    source_ids = {s['id'] for s in read('data/sources.json')['sources']}
    try:
        bildlogg = read('images/incoming/bildlogg.json')
    except (OSError, ValueError):
        bildlogg = []
    shares = land_shares(root / 'data/land.json')
    this_year = today.year

    with_fact = {eid for f in funfacts if f.get('review') != 'draft' for eid in f.get('events', [])}
    rows = []
    for e in events:
        lon, lat = e['location']['coordinates'][:2]
        rows.append({
            'id': e['id'], 'start': e['start'], 'period': period_of(e['start']), 'region': region(lat, lon),
            'category': e['category'],
            'war': e.get('kind') == 'war' or e['category'] == 'krig',
            'focusOnly': bool(e.get('partOf')) and not e.get('top'),
            'progress': 'framsteg' in (e.get('tags') or []),
            'image': bool(e.get('image')) and not e['image'].get('placeholder'),
            'fact': e['id'] in with_fact,
            'two': len({s for s in e.get('sources', []) if s in source_ids}) >= 2,
            'uncertain': bool(re.search(r'[~?]', e.get('edtf', ''))),
            'place': 'locationPrecision' in e,
        })
    has_image = {r['id'] for r in rows if r['image']}
    waiting = sorted({b['id'] for b in bildlogg if isinstance(b, dict) and b.get('id') and b['id'] not in has_image})

    count = Counter((r['period'], r['region'], r['category']) for r in rows)
    per_pr = Counter((r['period'], r['region']) for r in rows)
    N = len(rows)

    out = [
        f'# Täckningsrapport {today.isoformat()}',
        '',
        f'> Genererad av `python3 tools/tackning.py` (#563) ur `data/events.json`, `data/funfacts.json`, '
        '`data/sources.json`, `images/incoming/bildlogg.json` och `data/land.json`. Ändra inte för hand; kör verktyget igen.',
        '',
        'Rapporten mäter **var** det är tomt. Den säger inte vilka händelser som saknas: det avgörs med '
        'öppnad källa (CLAUDE.md, Källpolicy). Varje händelse räknas en gång, efter startår och punkt på globen. '
        'Världsdelarna följer `region()` i `js/model.js` (samma som Samtidigt-panelen) och är grova.',
        '',
        f'**Händelser:** {N}. **Markering:** **0** = tom cell, `n*` = färre än {FEW} händelser.',
        '',
        '## Översikt per period och världsdel',
        '',
        '| Period | ' + ' | '.join(REGIONS) + ' | Totalt |',
        '| --- | ' + ' | '.join('---:' for _ in REGIONS) + ' | ---: |',
    ]
    for pid, name, *_ in PERIODS:
        vals = [per_pr[(pid, r)] for r in REGIONS]
        out.append(f'| {name} | ' + ' | '.join(mark(v) for v in vals) + f' | {sum(vals)} |')
    tot = [sum(per_pr[(p[0], r)] for p in PERIODS) for r in REGIONS]
    out.append('| **Totalt** | ' + ' | '.join(map(str, tot)) + f' | {N} |')

    out += ['', '## Per sekel från 1000', '',
            '| Sekel | ' + ' | '.join(REGIONS) + ' | Totalt |',
            '| --- | ' + ' | '.join('---:' for _ in REGIONS) + ' | ---: |']
    per_c = Counter((century_of(r['start']), r['region']) for r in rows if r['start'] >= 1000)
    for c in range(1000, (this_year // 100) * 100 + 1, 100):
        vals = [per_c[(c, r)] for r in REGIONS]
        out.append(f'| {c}-talet | ' + ' | '.join(mark(v) for v in vals) + f' | {sum(vals)} |')

    out += ['', '## Per period, världsdel och kategori', '',
            'En tabell per period. Raderna är kategorierna i samma ordning som på sidan.']
    for pid, name, *_ in PERIODS:
        out += ['', f'### {name}', '',
                '| Kategori | ' + ' | '.join(REGIONS) + ' | Totalt |',
                '| --- | ' + ' | '.join('---:' for _ in REGIONS) + ' | ---: |']
        for cat in CATEGORIES:
            vals = [count[(pid, r, cat)] for r in REGIONS]
            out.append(f'| {cat} | ' + ' | '.join(mark(v) for v in vals) + f' | {sum(vals)} |')

    def share_table(title, intro, key, rows=rows):
        N = len(rows)
        lines = ['', f'## {title}', '', intro, '',
                 '| Period | ' + ' | '.join(REGIONS) + ' | Alla |',
                 '| --- | ' + ' | '.join('---:' for _ in REGIONS) + ' | ---: |']
        for pid, name, *_ in PERIODS:
            cells = []
            for r in REGIONS:
                sel = [x for x in rows if x['period'] == pid and x['region'] == r]
                cells.append(pct(sum(x[key] for x in sel), len(sel)))
            sel = [x for x in rows if x['period'] == pid]
            lines.append(f'| {name} | ' + ' | '.join(cells) + f' | {pct(sum(x[key] for x in sel), len(sel))} |')
        cells = [pct(sum(x[key] for x in rows if x['region'] == r), sum(1 for x in rows if x['region'] == r))
                 for r in REGIONS]
        lines.append('| **Alla** | ' + ' | '.join(cells) + f' | {pct(sum(x[key] for x in rows), N)} |')
        return lines

    out += share_table('Balans: krig mot övrigt', 'Andel krig och slag (`kind: "war"` eller kategorin `krig`). '
                       '– = inga händelser i cellen.', 'war')
    globe_rows = [r for r in rows if not r['focusOnly']]
    n_hidden = N - len(globe_rows)
    out += share_table('Balans: krig mot övrigt, utan slag som bara syns i Fokus',
                       f'Samma mått, men utan de {n_hidden} händelser som har `partOf` utan `"top": true` och därför '
                       'bara syns när man följer kriget i Fokus (#1341). Tabellen ovan visar balansen i datat, den här '
                       f'balansen på globen: {sum(r["war"] for r in globe_rows)} av {len(globe_rows)} händelser är krig.',
                       'war', globe_rows)
    n_prog = sum(r['progress'] for r in rows)
    if n_prog:
        out += share_table('Balans: framsteg', 'Andel händelser med taggen `framsteg` (#555).', 'progress')
    else:
        out += ['', 'Inga händelser har taggen `framsteg` ännu (#555), så den balansen kan inte mätas.']
    out += share_table('Bilder', 'Andel händelser med bild (fältet `image`, inte platshållare).', 'image')
    out += ['', f'**Bilder som väntar** i `images/incoming/bildlogg.json` utan att vara inlagda: {len(waiting)}'
            + (f' ({", ".join(waiting)}).' if waiting else '.')]
    out += share_table('Fun facts', 'Andel händelser som ingår i minst en fun fact (inte `draft`).', 'fact')
    out += share_table('Två källor', 'Andel händelser med minst två olika källor som finns i `data/sources.json`.', 'two')
    out += share_table('Osäkert datum', 'Andel händelser med `~` (ungefär) eller `?` (osäkert) i `edtf`.', 'uncertain')
    out += share_table('Ungefärlig plats', 'Andel händelser med fältet `locationPrecision`.', 'place')

    out += empire_tables(root, this_year, cliopatria)

    # Luckor: celler (period × världsdel) med färre händelser än väntat efter periodens längd och
    # världsdelens landyta. Vikten = roten ur periodens längd i år × världsdelens andel av landytan.
    out += ['', f'## De {TOP_GAPS} största luckorna', '']
    if shares is None:
        shares = {r: 1 / len(REGIONS) for r in REGIONS}
        out.append('`data/land.json` saknas, så världsdelarna vägs lika.')
        out.append('')
    weights = {(p[0], r): math.sqrt(period_years(p, this_year)) * shares[r] for p in PERIODS for r in REGIONS}
    wsum = sum(weights.values())
    gaps = []
    for (pid, r), wgt in weights.items():
        expected = N * wgt / wsum
        actual = per_pr[(pid, r)]
        if actual < expected:
            gaps.append((-(expected - actual) / expected, -expected, pid, r, expected, actual))
    gaps.sort(key=lambda g: (g[0], g[1], [p[0] for p in PERIODS].index(g[2]), REGIONS.index(g[3])))
    out += [
        'Varje period och världsdel får en vikt: roten ur periodens längd i år gånger världsdelens andel av '
        'landytan. "Väntat" är alla händelser fördelade efter vikten. Listan visar cellerna med störst '
        'relativ brist (först tomma celler, sedan de som har minst i förhållande till väntat). Det är ett '
        'grovt mått för att hitta var man ska börja leta, inte ett mål.',
        '',
        'Världsdelarnas andel av landytan (norr om 60° S): '
        + ', '.join(f'{r} {round(100 * shares[r])} %' for r in REGIONS) + '.',
        '',
        '| # | Period | Världsdel | Händelser | Väntat | Tomma kategorier |',
        '| ---: | --- | --- | ---: | ---: | --- |',
    ]
    names = {p[0]: p[1] for p in PERIODS}
    for i, (_, _, pid, r, expected, actual) in enumerate(gaps[:TOP_GAPS], 1):
        empty = [c for c in CATEGORIES if count[(pid, r, c)] == 0]
        empty_text = 'alla' if len(empty) == len(CATEGORIES) else ', '.join(empty)
        out.append(f'| {i} | {names[pid]} | {r} | {actual} | {expected:.0f} | {empty_text} |')
    if not gaps:
        out.append('| – | Inga celler under det väntade | | | | |')
    return '\n'.join(out) + '\n'


def empire_tables(root, this_year, cliopatria=None):
    """Riken per period och världsdel, och andelen av landytan inom något rike för provåren (#1341)."""
    empires = read_empires(root)
    if empires is None:
        return ['', '## Riken', '', '`data/empires/index.json` saknas, så rikena mäts inte.']
    out = ['', '## Riken per period och världsdel', '',
           'Antal riken (grupper i `data/empires/index.json`) med någon gräns under perioden. Världsdelen tas ur '
           'gränsens etikettpunkt, så ett rike kan räknas i flera världsdelar. **0** = tom cell.', '',
           '| Period | ' + ' | '.join(REGIONS) + ' | Alla |',
           '| --- | ' + ' | '.join('---:' for _ in REGIONS) + ' | ---: |']
    for pid, name, first, last in PERIODS:
        last = this_year if last is None else last
        sel = [(g, region(lab[1], lab[0])) for g, a, b, lab, _geom in empires
               if a <= last and b >= (first if pid != 'forhistoria' else -10**9)]
        cells = [len({g for g, r in sel if r == reg}) for reg in REGIONS]
        out.append(f'| {name} | ' + ' | '.join('**0**' if c == 0 else str(c) for c in cells)
                   + f' | {len({g for g, _r in sel})} |')

    rings = land_rings(Path(root) / 'data/land.json')
    out += ['', '## Rikenas landyta', '']
    if rings is None:
        return out + ['`data/land.json` saknas, så landytan mäts inte.']
    land = {c for c in cells_inside(rings, 1.0) if 90 - (c[0] + 0.5) > -60}
    weight = lambda cells: sum(math.cos(math.radians(90 - (b + 0.5))) for b, _k in cells)
    w_land = weight(land)
    clio = read_cliopatria(cliopatria)
    out += ['Andel av landytan (norr om 60° S) som ligger inom någon rikesgräns ett provår, på ett rutnät om en grad. '
            '"Mot Cliopatria" är andelen av det land som Cliopatrias stater täcker samma år som också täcks av våra '
            'riken (samma mått som `tools/tackning_riken.py`, men grövre). '
            + ('Cliopatria-filen lästes lokalt.' if clio is not None else
               'Cliopatria-filen angavs inte (`--cliopatria <fil>`), så den kolumnen är inte mätt.'), '',
            '| År | Riken | Andel av landytan | Mot Cliopatria |', '| --- | ---: | ---: | ---: |']
    for y in EMPIRE_YEARS:
        alive = [(g, geom) for g, a, b, _lab, geom in empires if a <= y <= b]
        ours = set()
        for _g, geom in alive:
            ours |= geometry_cells(geom)
        ours &= land
        if clio is None:
            vs = 'inte mätt'
        else:
            theirs = set()
            for a, b, geom in clio:
                if a <= y <= b:
                    theirs |= geometry_cells(geom)
            theirs &= land
            vs = pct(weight(ours & theirs), weight(theirs)) if theirs else '–'
        yr = f'{1 - y} f.Kr.' if y < 1 else str(y)
        out.append(f'| {yr} | {len({g for g, _geom in alive})} | {pct(weight(ours), w_land)} | {vs} |')
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description='Täckningsrapport (#563)')
    ap.add_argument('--root', default=str(TOOLS.parent), help='mappen med data/ (standard: repot)')
    ap.add_argument('--datum', help='rapportens datum, ÅÅÅÅ-MM-DD (standard: i dag)')
    ap.add_argument('--cliopatria', help='Cliopatria-filen (geojson) för jämförelsen av rikenas landyta; hämtas aldrig')
    ap.add_argument('--ut', help='fil att skriva, eller - för skärmen (standard: docs/granskningar/tackning-<datum>.md)')
    args = ap.parse_args(argv)
    today = date.fromisoformat(args.datum) if args.datum else date.today()
    text = build(args.root, today, args.cliopatria)
    if args.ut == '-':
        sys.stdout.write(text)
        return
    out = Path(args.ut) if args.ut else Path(args.root) / 'docs' / 'granskningar' / f'tackning-{today.isoformat()}.md'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding='utf-8')
    print(f'{out}: {len(text.encode())} byte')


if __name__ == '__main__':
    main()
