#!/usr/bin/env python3
"""Hämtar dagens gräns för platserna i data/platser.json ur Natural Earth (public domain) och skriver dem som GeoJSON i
platsens fält boundary.geometry (#579): länder ur 1:50m admin 0 via world-atlas 2.0.2, län och delstater ur 1:10m admin 1 (#1159).

Körs för hand: python3 tools/platser_gransar.py
Ett land väljs med ISO 3166-1 numeriskt id (boundary.ne). Polygoner vars första punkt ligger i en ruta i boundary.exclude ([väst, syd, öst, nord]) tas bort; Natural Earth
räknar Tokelau till Nya Zeeland, men Tokelau ingår inte i konturen (beslut 2026-11-10 i #579). Koordinaterna avrundas till två decimaler (cirka 1 km) och polygoner med färre än
fyra punkter tas bort.
Ett län eller en delstat väljs med adm1_code (boundary.admin1, till exempel SWE-3429 för Skåne län) ur Natural Earth 1:10m admin 1
version 5.1.2; koordinaterna avrundas där till tre decimaler (cirka 100 m). Filen är cirka 40 MB; en nedladdad kopia kan ges som
argument: python3 tools/platser_gransar.py ne_10m_admin_1_states_provinces.geojson
Ringar som korsar datumlinjen (±180°, till exempel Ryssland och Fiji) delas vid 180° med nya sömpunkter, så att varje delring ligger
på ena sidan och ingen ring har ett hopp större än 180° i längdgrad (#1268). Delningen är data: schemat är oförändrat, och
js/place-geo.js och scripts/validate-site.py skyddar ändå mot en ring som hoppar.
Grannländerna (#1449): för varje plats skrivs också boundary.neighbours, polygonerna för alla andra länder i Natural Earth admin 0
(1:50m, via world-atlas) som kommer inom boundary.neighbourKm (30 km) från platsens gräns, klippta till rutor runt gränsen (clip_neighbours).
placeEvents() i js/place-geo.js räknar en punkt inne i en av dem som utanför platsen, också inom kustmarginalen på 20 km: en punkt
på land hör bara till landet den ligger i, och marginalen hjälper bara punkter som hamnat i havet av kustens skull. Platsens eget land
är inte med (för Skåne är det Sverige). Ingen ny datakälla: samma world-atlas som platsernas länder, public domain."""
import contextlib, io, json, math, sys, urllib.request
from pathlib import Path

URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json'
# Län och delstater (boundary.admin1 = adm1_code): Natural Earth 1:10m admin 1, version 5.1.2, public domain.
# Skåne finns bara i 1:10m. Koordinaterna avrundas till tre decimaler (cirka 100 m).
ADMIN1_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson'
# Grannländerna (#1449): delarna av andra länders polygoner som ligger inom så här många km från platsens gräns. Måste vara minst
# COAST_MARGIN_KM i js/place-geo.js (20 km), eftersom bara punkter inom marginalen prövas mot dem; 10 km extra för det platta
# närmevärdet och avrundningen. tests/place-geo.test.mjs kontrollerar att fältet boundary.neighbourKm är minst marginalen.
NEIGHBOUR_KM = 30
# Gränsen delas i bitar som är högst så här många grader stora, och varje bit får en ruta runt sig (border_windows).
CHUNK_DEG = 2.0
FILE = Path(__file__).resolve().parent.parent / 'data' / 'platser.json'


def decode(topo):
    sx, sy = topo['transform']['scale']
    tx, ty = topo['transform']['translate']
    arcs = []
    for arc in topo['arcs']:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx; y += dy
            pts.append([x * sx + tx, y * sy + ty])
        arcs.append(pts)
    return arcs


def ring(arcs, idxs):
    out = []
    for i in idxs:
        pts = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(pts if not out else pts[1:])
    return [[round(x, 2), round(y, 2)] for x, y in out]


def dedupe(r):
    res = [r[0]]
    for p in r[1:]:
        if p != res[-1]:
            res.append(p)
    return res


def unwrap_ring(ring):
    """Vecklar ut en sluten ring så att varje punkt ligger på den längdgrad som är närmast den förra (som traceRing i
    js/layers/area-style.js). Ger None om ringen inte blir sluten, till exempel en ring runt en pol."""
    out, prev = [], None
    for x, y in ring:
        if prev is not None:
            x = x - 360 * round((x - prev) / 360)
        prev = x
        out.append([x, y])
    return out if abs(out[-1][0] - out[0][0]) < 1e-9 and out[-1][1] == out[0][1] else None


def _cross(a, b, bound):
    """Där kanten a-b skär linjen x = bound, med breddgraden avrundad som övriga koordinater."""
    t = (bound - a[0]) / (b[0] - a[0])
    return [bound, round(a[1] + t * (b[1] - a[1]), 2)]


def clip_half(ring, bound, below):
    """Klipper en sluten ring mot halvplanet x <= bound (below) eller x >= bound. Delarna som blir kvar sluts längs linjen:
    skärningspunkterna sorteras på breddgrad och paras ihop (0-1, 2-3 ...), eftersom linjen växelvis ligger inne i och
    utanför en enkel polygon, och varje del som lämnar halvplanet fortsätter vid sin partner. Ger en lista med ringar."""
    inside = (lambda p: p[0] <= bound) if below else (lambda p: p[0] >= bound)
    pts = ring[:-1]
    flags = [inside(p) for p in pts]
    if all(flags):
        return [ring]
    if not any(flags):
        return []
    start = flags.index(False)  # börja utanför, så att varje del har en början och ett slut
    pts = pts[start:] + pts[:start]
    frags, cur = [], None
    for i, a in enumerate(pts):
        b = pts[(i + 1) % len(pts)]
        ina, inb = inside(a), inside(b)
        if ina and inb:
            cur.append(b)
        elif ina:
            cur.append(_cross(a, b, bound))
            frags.append(cur)
            cur = None
        elif inb:
            cur = [_cross(a, b, bound), b]
    frags = [dedupe(f) for f in frags]
    frags = [f for f in frags if len(f) > 1]  # en ring som bara nuddar linjen ger en enda punkt
    if not frags:
        return []
    ends = sorted([(f[0][1], k, 'in') for k, f in enumerate(frags)] + [(f[-1][1], k, 'out') for k, f in enumerate(frags)])
    partner = {}
    for (_, k1, t1), (_, k2, t2) in zip(ends[::2], ends[1::2]):
        if t1 != t2:
            partner[k1 if t1 == 'out' else k2] = k2 if t1 == 'out' else k1
    out, seen = [], set()
    for k in range(len(frags)):
        if k in seen:
            continue
        r, c = [], k
        while c is not None and c not in seen:
            seen.add(c)
            r.extend(frags[c])
            c = partner.get(c)
        out.append(dedupe(r + [r[0]]))
    return out


def _area(ring):
    return abs(sum(ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1] for i in range(len(ring) - 1))) / 2


def split_ring(ring):
    """Delar en ring som korsar datumlinjen vid ±180°: [ring] oförändrad om ingen kant hoppar mer än 180° i längdgrad,
    annars en ring per sida, med nya sömpunkter på exakt 180 eller −180 (#1268). Ringen vecklas ut, klipps mot varje
    längdgradsband på 360° och flyttas tillbaka. Delar utan yta (en ring som bara nuddar sömmen) tas bort."""
    if not any(abs(a[0] - b[0]) > 180 for a, b in zip(ring, ring[1:])):
        return [ring]
    flat = unwrap_ring(ring)
    if flat is None:
        print('platser_gransar: en ring som inte blir sluten när den vecklas ut (en pol?) delas inte', file=sys.stderr)
        return [ring]
    lo, hi = min(p[0] for p in flat), max(p[0] for p in flat)
    out = []
    for k in range(math.floor((lo + 180) / 360), math.floor((hi + 180) / 360) + 1):
        for piece in clip_half(flat, 180 + 360 * k, True):
            for part in clip_half(piece, -180 + 360 * k, False):
                moved = [[round(x - 360 * k, 2), y] for x, y in part]
                if len(moved) >= 4 and _area(moved) > 1e-9:
                    out.append(moved)
    return out


def split_polygon(rings):
    """En polygon (yttre ring och hål) som en lista med polygoner efter delningen vid datumlinjen. Ett hål följer med den
    delring som innehåller dess första punkt."""
    polys = [[o] for o in split_ring(rings[0])]
    for hole in rings[1:]:
        for piece in split_ring(hole):
            for poly in polys:
                if len(polys) == 1 or point_in_ring(poly[0], piece[0][0], piece[0][1]):
                    poly.append(piece)
                    break
    return polys


def point_in_ring(ring, lon, lat):
    inside = False
    for i in range(len(ring) - 1):
        (xi, yi), (xj, yj) = ring[i], ring[i + 1]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
    return inside


def geometry(topo, arcs, ne_id, exclude=()):
    g = next(g for g in topo['objects']['countries']['geometries'] if g.get('id') == ne_id)
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    out = []
    for poly in polys:
        rings = [dedupe(ring(arcs, r)) for r in poly]
        rings = [r for r in rings if len(r) >= 4]
        if rings and not any(box[0] <= rings[0][0][0] <= box[2] and box[1] <= rings[0][0][1] <= box[3] for box in exclude):
            out.extend(split_polygon(rings))
    return {'type': 'MultiPolygon', 'coordinates': out}


def admin1_geometry(collection, code):
    f = next(f for f in collection['features'] if f['properties'].get('adm1_code') == code)
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    out = []
    for poly in polys:
        rings = [dedupe([[round(x, 3), round(y, 3)] for x, y in r]) for r in poly]
        rings = [r for r in rings if len(r) >= 4]
        if rings:
            out.append(rings)
    return {'type': 'MultiPolygon', 'coordinates': out}


def clip_rect(ring, x0, y0, x1, y1):
    """Klipper en sluten ring mot rutan [x0, x1] × [y0, y1] (Sutherland–Hodgman, fyra halvplan). Ger en sluten ring, eller None
    om inget blir kvar. För en konkav ring som skär rutan på flera ställen blir det en ring med oändligt smala förbindelser längs
    rutans kant; en punkt inne i rutan ger ändå rätt svar med jämn-udda-regeln, och bara sådana punkter prövas (rutan är
    större än marginalen). Skärningspunkterna ligger på rutans kant, där bara den andra koordinaten avrundas (två decimaler)."""
    pts = ring[:-1]
    for axis, bound, keep_above in ((0, x0, True), (0, x1, False), (1, y0, True), (1, y1, False)):
        if not pts:
            return None
        ok = (lambda p: p[axis] >= bound) if keep_above else (lambda p: p[axis] <= bound)
        out = []
        for i, a in enumerate(pts):
            b = pts[(i + 1) % len(pts)]
            ina, inb = ok(a), ok(b)
            if ina != inb:
                t = (bound - a[axis]) / (b[axis] - a[axis])
                o = 1 - axis
                cut = [0, 0]
                cut[axis] = bound
                cut[o] = round(a[o] + t * (b[o] - a[o]), 2)
                out.append(cut)
            if inb:
                out.append(b)
        pts = dedupe(out) if out else []
    if len(pts) < 3:
        return None
    res = pts + [pts[0]]
    return res if len(res) >= 4 and _area(res) > 1e-9 else None


def border_windows(geom, pad_km=None, chunk_deg=None):
    """Rutor [väst, syd, öst, nord] som tillsammans täcker allt som ligger inom pad_km från platsens gräns (alla ringar, också
    hål). Gränsen delas i bitar som är högst chunk_deg grader stora (långa kanter delas först), och varje bit får en ruta med pad_km
    marginal åt alla håll. Rutorna sträcker sig över ±180° när gränsen gör det."""
    pad_km = NEIGHBOUR_KM if pad_km is None else pad_km
    chunk_deg = CHUNK_DEG if chunk_deg is None else chunk_deg
    wins = []

    def emit(chunk):
        xs = [p[0] for p in chunk]
        ys = [p[1] for p in chunk]
        pad_y = pad_km / 111.2
        pad_x = pad_km / (111.2 * math.cos(math.radians(min(89.0, max(abs(min(ys)), abs(max(ys))) + pad_y))))
        wins.append((math.floor((min(xs) - pad_x) * 100) / 100, math.floor((min(ys) - pad_y) * 100) / 100,
                     math.ceil((max(xs) + pad_x) * 100) / 100, math.ceil((max(ys) + pad_y) * 100) / 100))

    for poly in geom['coordinates']:
        for ring_ in poly:
            chunk = [ring_[0]]
            for a, b in zip(ring_, ring_[1:]):
                steps = max(1, math.ceil(max(abs(b[0] - a[0]), abs(b[1] - a[1])) / chunk_deg))
                for s in range(1, steps + 1):
                    p = [a[0] + (b[0] - a[0]) * s / steps, a[1] + (b[1] - a[1]) * s / steps]
                    chunk.append(p)
                    if max(max(q[0] for q in chunk) - min(q[0] for q in chunk), max(q[1] for q in chunk) - min(q[1] for q in chunk)) >= chunk_deg:
                        emit(chunk)
                        chunk = [p]
            if len(chunk) > 1:
                emit(chunk)
    return wins


def country_rings(arcs, g):
    """Yttre ringarna för ett land i world-atlas (en post i topo['objects']['countries']), delade vid datumlinjen som platsernas
    egna (split_polygon). Hål lämnas bort."""
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    out = []
    for poly in polys:
        rings = [dedupe(ring(arcs, r)) for r in poly]
        rings = [r for r in rings if len(r) >= 4]
        if rings:
            out.extend(p[0] for p in split_polygon(rings))
    return out


def load_countries(topo, arcs):
    """[(post, yttre ringar)] för alla länder i world-atlas, så att varje land delas vid datumlinjen en gång. Antarktis ring runt polen
    går inte att dela och varnar; varningen hör till platsens egen gräns och tystas här."""
    with contextlib.redirect_stderr(io.StringIO()):
        return [(g, country_rings(arcs, g)) for g in topo['objects']['countries']['geometries']]


def own_country(countries, place):
    """Landets post i world-atlas för platsen: landet med id boundary.ne, eller för ett län (boundary.admin1) det land som rymmer
    flest av gränsens punkter. Ger None om inget land rymmer en enda av dem."""
    if 'ne' in place['boundary']:
        return next(g for g, _ in countries if g.get('id') == place['boundary']['ne'])
    pts = [p for poly in place['boundary']['geometry']['coordinates'] for p in poly[0]]
    best, most = None, 0
    for g, rings in countries:
        n = sum(1 for p in pts if any(point_in_ring(r, p[0], p[1]) for r in rings))
        if n > most:
            best, most = g, n
    return best


def clip_neighbours(countries, place, pad_km=None):
    """Grannländerna (#1449): varje annat land i Natural Earth admin 0 (1:50m, world-atlas) som kommer inom pad_km från platsens
    gräns, med bara de delar av landets polygon som ligger inom pad_km (rutorna i border_windows; hål lämnas bort, eftersom ett
    hål i ett land är ett annat land, som är med här om det ligger nära). Platsens eget land är inte med: för ett län (Skåne) är det
    landet länet ligger i. Delarna ligger kvar i landets egna koordinater, så en granne på andra sidan om datumlinjen får
    längdgrader på andra sidan om 180°; rutorna som ligger över 180° prövas därför också flyttade ±360°. Ger en lista
    [{'name', 'ne' (saknas för länder utan id i Natural Earth, som Kosovo), 'geometry'}] i namnordning. placeEvents() i
    js/place-geo.js räknar en punkt inne i ett av dessa länder som utanför platsen, också inom kustmarginalen."""
    own = own_country(countries, place)
    wins = border_windows(place['boundary']['geometry'], pad_km)
    wins += [(w[0] - 360, w[1], w[2] - 360, w[3]) for w in wins if w[2] > 180] + [(w[0] + 360, w[1], w[2] + 360, w[3]) for w in wins if w[0] < -180]
    out = []
    for g, rings in countries:
        if g is own:
            continue
        pieces = []
        for r in rings:
            lo_x, hi_x = min(p[0] for p in r), max(p[0] for p in r)
            lo_y, hi_y = min(p[1] for p in r), max(p[1] for p in r)
            for w, y0, e, n in wins:
                if e < lo_x or w > hi_x or n < lo_y or y0 > hi_y:
                    continue
                c = clip_rect(r, w, y0, e, n)
                if c:
                    pieces.append(c)
        if pieces:
            entry = {'name': g['properties'].get('name', '?')}
            if g.get('id') is not None:
                entry['ne'] = g['id']
            entry['geometry'] = {'type': 'MultiPolygon', 'coordinates': [[p] for p in pieces]}
            out.append(entry)
    return sorted(out, key=lambda n: n['name'])


def main():
    doc = json.loads(FILE.read_text(encoding='utf-8'))
    with urllib.request.urlopen(URL, timeout=60) as r:
        topo = json.load(r)
    arcs = decode(topo)
    countries = load_countries(topo, arcs)
    admin1 = None
    for place in doc['places']:
        b = place['boundary']
        if 'admin1' in b:
            if admin1 is None:
                if len(sys.argv) > 1:
                    admin1 = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
                else:
                    with urllib.request.urlopen(ADMIN1_URL, timeout=300) as r:
                        admin1 = json.load(r)
            b['geometry'] = admin1_geometry(admin1, b['admin1'])
        else:
            b['geometry'] = geometry(topo, arcs, b['ne'], b.get('exclude', []))
        n = sum(len(p[0]) for p in b['geometry']['coordinates'])
        print(f"{place['id']}: {len(b['geometry']['coordinates'])} polygoner, {n} punkter")
        b['neighbourKm'] = NEIGHBOUR_KM
        b['neighbours'] = clip_neighbours(countries, place)
        for nb in b['neighbours']:
            print(f"  granne {nb['name']}: {len(nb['geometry']['coordinates'])} delar, {sum(len(p[0]) for p in nb['geometry']['coordinates'])} punkter")
    FILE.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    sys.exit(main())
