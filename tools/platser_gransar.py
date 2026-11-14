#!/usr/bin/env python3
"""Hämtar dagens landgräns för platserna i data/platser.json ur Natural Earth 1:50m (via world-atlas 2.0.2, public
domain) och skriver dem som GeoJSON i platsens fält boundary.geometry (#579).

Körs för hand: python3 tools/platser_gransar.py
Land väljs med ISO 3166-1 numeriskt id (boundary.ne). Polygoner vars första punkt ligger i en ruta i boundary.exclude ([väst, syd, öst, nord]) tas bort; Natural Earth
räknar Tokelau till Nya Zeeland, men Tokelau ingår inte i konturen (beslut 2026-11-10 i #579). Koordinaterna avrundas till två decimaler (cirka 1 km) och polygoner med färre än
fyra punkter tas bort.
Ringar som korsar datumlinjen (±180°, till exempel Ryssland och Fiji) delas vid 180° med nya sömpunkter, så att varje delring ligger
på ena sidan och ingen ring har ett hopp större än 180° i längdgrad (#1268). Delningen är data: schemat är oförändrat, och
js/place-geo.js och scripts/validate-site.py skyddar ändå mot en ring som hoppar."""
import json, math, sys, urllib.request
from pathlib import Path

URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json'
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


def main():
    doc = json.loads(FILE.read_text(encoding='utf-8'))
    with urllib.request.urlopen(URL, timeout=60) as r:
        topo = json.load(r)
    arcs = decode(topo)
    for place in doc['places']:
        b = place['boundary']
        b['geometry'] = geometry(topo, arcs, b['ne'], b.get('exclude', []))
        n = sum(len(p[0]) for p in b['geometry']['coordinates'])
        print(f"{place['id']}: {len(b['geometry']['coordinates'])} polygoner, {n} punkter")
    FILE.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    sys.exit(main())
