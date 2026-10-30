#!/usr/bin/env python3
"""Bygger data/religions.json: religionerna som områden över hela tiden (#92, #118, #269).

Varje rike i Cliopatria har fått sin religion ur faktarutan på rikets Wikipedia-sida (raden
Religion). De texterna hämtades 2026-10-28 och står i religions.json under "polities" (fältet
"text", och "variants" där delar av samma rike i Cliopatria pekar på olika Wikipedia-sidor).
Skriptet läser alltså registret ur den befintliga religions.json, sorterar texten till en religion
(classify), räknar fram rikenas religion år för år och slår ihop områdena per religion i
ögonblicksbilder. Faktarutor ("facts") och religionernas namn och färger behålls som de är.

Regler för ett rikes religion ett visst år (religion_at):
- En religion markerad som statlig eller officiell väljs först; annars en över 50 procent eller
  under rubriken Majority; annars den enda som nämns (sure = true). Nämns flera utan markering
  väljs den först nämnda (sure = false).
- Riken med kontrollerat år för kristnandet (christianSince, med källa) är kristna från det året.
- Anger faktarutan ett årtal för religionen ("c. 200 AD", "from 6th century") gäller den därifrån (since).
- Procentsiffror i faktarutan kommer ofta från en nutida folkräkning och används bara från 1900,
  utom när faktarutan anger religionen som officiell utan årtal (till exempel Ryska imperiet).
- Från 1900 används Wikipedias tabell Religion by country för länder vars faktaruta saknar
  religion (modern).

Arv (#269, gäller alla religioner): ett område som har haft en religion behåller den när rikena
som följer där saknar religion i faktarutan (eller bara har en religion som enligt reglerna ovan
inte gäller det året), tills ett rike med en annan angiven religion täcker området. Arvet kräver att
ett rike i Cliopatria täcker platsen; utan rike försvinner området. Ärvda områden blir egna
ögonblicksbilder med "inherited": {"until": år, "from": [riken]}: religionen stod senast i
faktarutan för rikena i "from", i ögonblicksbilden som slutar året "until". De ritas som osäkra.
"polities" i en ärvd ögonblicksbild är rikena utan religion som täcker området.

Kör från projektets rot med Cliopatria-filen (cliopatria_polities_only_v021.geojson från
https://zenodo.org/records/13363121, CC BY 4.0), och därefter tools/religioner_riken.py:
    python3 tools/religioner.py <cliopatria.geojson>
    python3 tools/religioner_riken.py <cliopatria.geojson>
Kräver shapely (pip install shapely).
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

from shapely.geometry import mapping, shape
from shapely import STRtree
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
TOL = 0.25       # förenkling i grader (Douglas-Peucker); rikena förenklas först med hälften
MIN_AREA = 0.05  # öar mindre än så här (kvadratgrader) tas bort
DEC = 1          # koordinater avrundas till 0.1 grad
SLIVER = 0.05    # ärvda områden "öppnas" med så här många grader, så att smala remsor längs gränser försvinner
GAP = 100        # ett område utan rike i Cliopatria minns sin religion så här många år
CENSUS_FROM = 1900  # procentsiffror (folkräkningar) och tabellen Religion by country används från detta år

# (id, svenskt namn, färg, mönster). Ordningen avgör vid lika träff.
RELIGIONS = [
    ('kristendom', 'Kristendom', '#6f3fb8', r'christian|catholic|orthodox|protestant|luther|anglican|calvin|\barian|coptic|nestorian|church of|apostolic|presbyter|methodist|baptist|evangelic|tewahedo|miaphysit|chalcedon|hussit|reformed|episcopal'),
    ('islam', 'Islam', '#1f8a5b', r'islam|muslim|sunni|shia|shi.a|shiʿ|ibadi|zaydi|ismaili|sufi|alevi|bektash|kharij'),
    ('judendom', 'Judendom', '#2b62b8', r'juda|jewish|jews\b'),
    ('zoroastrism', 'Zoroastrism', '#d4782a', r'zoroastr|mazda'),
    ('manikeism', 'Manikeism', '#8a6d3b', r'manich'),
    ('buddhism', 'Buddhism', '#e0a100', r'buddh|theravada|mahayana|vajrayana|lamais|\bzen\b'),
    ('hinduism', 'Hinduism', '#c2334d', r'hindu|vaishnav|shaiv|vedic|brahman|smarta'),
    ('jainism', 'Jainism', '#b0569a', r'jain'),
    ('sikhism', 'Sikhism', '#e2603a', r'sikh'),
    ('kinesisk', 'Kinesisk religion (konfucianism, daoism)', '#a8322a', r'confuci|taois|daois|chinese folk|heaven worship|neo-confuci'),
    ('shinto', 'Shinto', '#d95f8c', r'shint|shinbutsu'),
    ('tengrism', 'Tengrism', '#4c9fb5', r'tengri'),
    ('egyptisk', 'Fornegyptisk religion', '#b8912e', r'egyptian religion|ancient egyptian|religion of ancient egypt|kemetism'),
    ('mesopotamisk', 'Mesopotamisk religion', '#7a5c2e', r'mesopotamian|ashurism|sumerian|babylonian religion|assyrian religion'),
    ('grekromersk', 'Grekisk och romersk religion', '#3f7f9f', r'greek religion|hellenis|ancient greek|roman religion|roman pagan|imperial cult|greco-roman|olympian'),
    ('fenicisk', 'Fenicisk och punisk religion', '#7c3d6b', r'punic|phoenician|canaanite'),
    ('germansk', 'Germansk och nordisk religion', '#5a7d3a', r'germanic|norse|odin'),
    ('slavisk', 'Slavisk religion', '#5b6fa0', r'slavic'),
    ('keltisk', 'Keltisk religion', '#2f8f7a', r'celtic|druid'),
    ('mesoamerikansk', 'Mesoamerikansk religion', '#9c5b2e', r'aztec|maya|mesoameric|mexica'),
    ('andinsk', 'Andinsk religion', '#6d8a2c', r'inca|andean'),
    ('afrikansk', 'Traditionell afrikansk religion', '#8f4a2a', r'traditional african|akan|yoruba|kushite|vodun|bantu'),
    ('bahai', 'Bahá’í', '#4a7ba8', r'bahá|bahai'),
    ('folkreligion', 'Annan traditionell religion', '#7f7f6a', r'shaman|musok|animis|pagan|polythe|folk religion|traditional religion|indigenous'),
]
COMPILED = [(i, re.compile(p, re.I)) for i, _, _, p in RELIGIONS]
NONE = re.compile(r'irreligi|no religion|none\b|atheis|secular|unaffiliated', re.I)
MARK = re.compile(r'\bstate\b|official|state religion', re.I)
PRE = re.compile(r'\bpre-?\s*(islamic|christian|buddhist|hindu|zoroastrian)', re.I)
SPLIT = re.compile(r';|,(?![^()]*\))')
# Årtal för den valda religionen ("Christianity c. 200 AD", "(from 6th century)"). "State religion from" gäller bara statusen.
SINCE = re.compile(r'(?:\b(?:from|after|since)\s+c?\.?\s*|\bc\.\s*)(\d{3,4})(?:\s*(?:AD|CE))?\b|\b(?:from|after)\s+(\d{1,2})(?:st|nd|rd|th)\s+century', re.I)
OFFICIAL_FROM = re.compile(r'(?:state religion|official)[^;]*?\bfrom\s+(\d{3,4})', re.I)


def match(seg):
    seg = PRE.sub('', seg)  # "Pre-Islamic Arabian religions" är inte islam
    for i, rx in COMPILED:
        if rx.search(seg):
            return i
    return None


def classify(text):
    """Faktarutans text -> (religionens id eller None, säker, regel)."""
    if not text:
        return None, False, 'saknas'
    segs = [s.strip() for s in SPLIT.split(text) if s.strip()]
    found = [(k, r, s) for k, s in enumerate(segs) for r in [match(s)] if r]
    if not found:
        return None, False, 'okänd'
    # En markerad statsreligion vinner, även om den inte står först
    for k, r, s in found:
        if MARK.search(s) and not NONE.search(s):
            return r, True, 'officiell'
    # "State religion:" som rubrik: nästa religion efter rubriken
    for k, s in enumerate(segs):
        if re.match(r'(state|official) religions?\s*:?$', s, re.I):
            after = [f for f in found if f[0] > k]
            if after:
                return after[0][1], True, 'officiell'
    # Majoritet: första religionen över 50 procent, "(majority)" eller rubriken "Majority:"
    k0, r0, s0 = found[0]
    pct = re.match(r'\s*([\d.]+)\s*%', s0)
    if pct and float(pct.group(1)) > 50:
        return r0, True, 'majoritet'
    for k, r, s in found:
        if re.search(r'\(\s*(majority|prevailing|predominant)', s, re.I):
            return r, True, 'majoritet'
    for k, s in enumerate(segs):
        if re.match(r'majority\s*:?', s, re.I):
            after = [f for f in found if f[0] >= k]
            if after:
                return after[0][1], True, 'majoritet'
    if len({r for _, r, _ in found}) == 1:
        return r0, True, 'enda'
    return r0, False, 'först nämnd'


def since(text, rel):
    """Årtal i faktarutan för den valda religionen, eller None."""
    if not rel:
        return None
    seg = next((s.strip() for s in SPLIT.split(text) if s.strip() and match(s) == rel), '')
    m = SINCE.search(seg)
    if not m or re.search(r'state religion from|official', seg, re.I):
        return None
    return int(m.group(1)) if m.group(1) else (int(m.group(2)) - 1) * 100 + 1


def steps():
    """Ögonblicksbildernas startår: tätare ju närmare nutiden."""
    y = -3400
    while y <= 2024:
        yield y
        y += 100 if y < 0 else 50 if y < 1500 else 25 if y < 1900 else 10


def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], DEC), round(o[1], DEC)]
        return [rnd(x) for x in o]
    return o


def polys(g):
    """Ytorna i ett område, som lista."""
    return list(g.geoms) if hasattr(g, 'geoms') else [g]


def clean(u):
    """Förenklar ett område för utdata och tar bort små öar."""
    u = u.simplify(TOL, preserve_topology=True)
    if u.is_empty:
        return None
    if u.geom_type == 'MultiPolygon':
        u = unary_union([q for q in u.geoms if q.area > MIN_AREA] or [max(u.geoms, key=lambda q: q.area)])
    if u.geom_type == 'GeometryCollection':
        u = unary_union([q for q in u.geoms if q.geom_type in ('Polygon', 'MultiPolygon') and q.area > MIN_AREA])
    if u.is_empty or u.area < MIN_AREA or u.geom_type not in ('Polygon', 'MultiPolygon'):
        return None
    gm = mapping(u)
    return {'type': gm['type'], 'coordinates': rnd(gm['coordinates'])}


class Row:
    """En period av ett rike i Cliopatria med uppgifterna om religion."""
    __slots__ = ('a', 'b', 'name', 'g', 'text', 'rel', 'sure', 'rule', 'adopted', 'modern', 'since', '_s')

    def __init__(self, props, geometry, rec, entry):
        self.a, self.b, self.name, self.g = props['FromYear'], props['ToYear'], props['Name'], geometry
        self.text = rec.get('text')
        self.rel, self.sure, self.rule = classify(self.text)
        self.adopted = entry.get('christianSince')
        self.modern = rec.get('modern') if self.rule in ('saknas', 'okänd') else None
        self.since = since(self.text, self.rel)
        self._s = None

    def shape(self):
        if self._s is None:
            self._s = shape(self.g).buffer(0).simplify(TOL / 2, preserve_topology=True)
        return self._s

    def religion_at(self, y):
        """(religion, säker) det här året, eller (None, False) om faktarutan inte anger någon som gäller då."""
        if self.modern and y >= CENSUS_FROM:
            return self.modern['religion'], self.modern['majority']
        text = self.text or ''
        if '%' in text and y < CENSUS_FROM and not (self.adopted and y >= self.adopted):
            # Procentsiffror: en folkräkning, ofta nutida. Undantag: religionen anges som officiell utan årtal.
            off = OFFICIAL_FROM.search(text)
            if not (self.rule == 'officiell' and (not off or y >= int(off.group(1)))):
                return None, False
        if self.adopted:
            if y >= self.adopted:
                return 'kristendom', True
            if self.rel == 'kristendom':
                return None, False
        if self.since and y < self.since:
            return None, False
        return self.rel, self.sure


def main():
    path = ROOT / 'data/religions.json'
    old = json.loads(path.read_text())
    register = {p['name']: p for p in old['polities']}
    old_rel = {r['id']: r for r in old['religions']}
    src = json.loads(Path(sys.argv[1]).read_text())

    rows, missing = [], set()
    for f in src['features']:
        p = f['properties']
        if p['Type'] != 'POLITY':
            continue
        entry = register.get(p['Name'])
        if entry is None:
            missing.add(p['Name'])
            entry = {'name': p['Name'], 'wikipedia': None, 'text': None}
            register[p['Name']] = entry
        rec = entry.get('variants', {}).get(p['Wikipedia'], entry)
        rows.append(Row(p, f['geometry'], rec, entry))
    if missing:
        print('nya riken utan text i registret (räknas som saknas):', sorted(missing))

    # Registret: regel, vald religion och årtal räknas om ur texten (första perioden av riket)
    polities = {}
    for r in rows:
        if r.name in polities:
            continue
        e = register[r.name]
        info = {'name': r.name, 'wikipedia': e.get('wikipedia'), 'text': r.text, 'religion': r.rel, 'rule': r.rule}
        if r.since:
            info['since'] = r.since
        if r.modern:
            info['modern'] = r.modern
        for k in ('christianSince', 'source', 'variants'):
            if k in e:
                info[k] = e[k]
        polities[r.name] = info

    years = list(steps())
    out = {i: [] for i, *_ in RELIGIONS}
    # Minnet för arvet: religion -> lista med (until, rikets namn, område, seen). Ett område per rike som senast
    # angav religionen där. seen = sista året då ett rike täckte området; utan rike glöms det efter GAP år.
    memory = {i: [] for i, *_ in RELIGIONS}
    for idx, y in enumerate(years):
        end = years[idx + 1] - 1 if idx + 1 < len(years) else 2024
        live = [r for r in rows if r.a <= y <= r.b]
        groups, blank = {}, []
        for r in live:
            rel, sure = r.religion_at(y)
            if rel:
                groups.setdefault((rel, sure), []).append(r)
            else:
                blank.append(r)
        for (rel, sure), rs in groups.items():
            g = clean(unary_union([r.shape() for r in rs]))
            if g:
                out[rel].append({'start': y, 'end': end, 'sure': sure, 'polities': sorted({r.name for r in rs}), 'geometry': g})
        # Riken med angiven religion tar bort arvet där de ligger. Små öar räknas inte, eftersom de inte ritas.
        decl_parts = [q for rs in groups.values() for r in rs for q in polys(r.shape()) if q.area > MIN_AREA]
        blank_shapes = [r.shape() for r in blank]
        decl_tree, blank_tree = STRtree(decl_parts), STRtree(blank_shapes)

        def under(g, tree, parts):
            idx = tree.query(g, predicate='intersects')
            return unary_union([parts[i] for i in idx]) if len(idx) else None

        new_memory = {i: [] for i in memory}
        for rel, pieces in memory.items():
            kept = {}
            for until, name, g, seen in pieces:
                d = under(g, decl_tree, decl_parts)
                if d is not None:
                    g = g.difference(d)
                if g.is_empty or g.area < 0.01:
                    continue
                c = under(g, blank_tree, blank_shapes)
                h = g.intersection(c) if c is not None else None
                if h is not None and h.area >= 0.01:
                    new_memory[rel].append((until, name, h, end))
                    kept.setdefault(until, []).append((name, h))
                rest = g.difference(c) if c is not None else g
                if rest.area >= 0.01 and y - seen <= GAP:
                    new_memory[rel].append((until, name, rest, seen))
            for until, parts in sorted(kept.items()):
                shown = unary_union([h for _, h in parts]).buffer(-SLIVER).buffer(SLIVER)
                g = clean(shown)
                if not g:
                    continue
                frm = sorted({n for n, h in parts if h.intersection(shown).area > MIN_AREA / 5} or {n for n, _ in parts})
                idx = blank_tree.query(shown, predicate='intersects')
                names = sorted({blank[i].name for i in idx if blank[i].shape().intersection(shown).area > MIN_AREA / 5})
                if not names:
                    continue
                out[rel].append({'start': y, 'end': end, 'sure': False, 'inherited': {'until': until, 'from': frm},
                                 'polities': names, 'geometry': g})
        for (rel, sure), rs in groups.items():
            for r in rs:
                new_memory[rel].append((end, r.name, r.shape(), end))
        memory = new_memory

    rels = []
    for i, name, color, _ in RELIGIONS:
        snaps = sorted(out[i], key=lambda s: (s['start'], 'inherited' in s, not s['sure'], s.get('inherited', {}).get('until', 0)))
        if not snaps:
            continue
        r = {'id': i, 'name': old_rel.get(i, {}).get('name', {'sv': name}), 'color': old_rel.get(i, {}).get('color', color)}
        if 'facts' in old_rel.get(i, {}):
            r['facts'] = old_rel[i]['facts']
        r['snapshots'] = snaps
        rels.append(r)

    notes = ('Religioner som områden (lagertyp område). Varje rike i Cliopatria (CC BY 4.0) har fått sin officiella religion '
             'eller huvudreligion ur faktarutan på rikets Wikipedia-sida (raden Religion), kontrollerat 2026-10-28. Regler: en religion '
             'markerad som statlig eller officiell väljs först; annars en religion över 50 procent eller under rubriken Majority; annars '
             'den enda religionen som nämns (sure = true). Där flera religioner nämns utan att någon är markerad väljs den först nämnda '
             '(regel "först nämnd", sure = false), och området visas ljusare med streckad kant. För riken med ett kontrollerat år för '
             'kristnandet (source) visas kristendomen från det året. '
             'Områdena är sammanslagna per religion i ögonblicksbilder (start–end) och förenklade (0.25 grader, avrundat till 0.1 grad). '
             'polities listar varje rike med Wikipedia-sida, faktarutans text, vald religion och regel (variants: texten för delar av '
             'riket som i Cliopatria pekar på en annan Wikipedia-sida). Lagret visar rikenas religion, '
             'inte var alla troende bodde. Från 1900 används Wikipedias tabell Religion by country (Pew) för länder vars faktaruta saknar '
             'religion: den största religionen väljs, och den räknas som säker om den har över 50 procent (modern i polities). '
             'Faktarutor med procentsiffror (ofta nutida folkräkningar) används bara från 1900, utom när religionen anges som officiell '
             'utan årtal. Anger faktarutan ett årtal för den valda religionen (till exempel "c. 200 AD" eller "from 6th century") visas '
             'religionen först från det året (since i polities). Arv (#269): ett område som har haft en religion behåller den när '
             'rikena som följer där inte anger någon religion som gäller, tills ett rike med en annan angiven religion täcker området. '
             'Sådana områden har inherited (until = sista året religionen stod i faktarutan där, from = de rikena) och visas som osäkra. '
             'Byggt med tools/religioner.py.')
    doc = {'schema': 'historia-globen/religions@3', 'notes': notes, 'religions': rels,
           'polities': sorted(polities.values(), key=lambda p: p['name'])}
    path.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print('regler', dict(Counter(p['rule'] for p in polities.values())))
    print('religioner', [(r['id'], len(r['snapshots']), sum('inherited' in s for s in r['snapshots'])) for r in rels])
    print(f'{path.stat().st_size // 1000} kB')


if __name__ == '__main__':
    main()
