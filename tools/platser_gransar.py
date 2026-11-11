#!/usr/bin/env python3
"""Hämtar dagens landgräns för platserna i data/platser.json ur Natural Earth 1:50m (via world-atlas 2.0.2, public
domain) och skriver dem som GeoJSON i platsens fält boundary.geometry (#579).

Körs för hand: python3 tools/platser_gransar.py
Land väljs med ISO 3166-1 numeriskt id (boundary.ne). Polygoner vars första punkt ligger i en ruta i boundary.exclude ([väst, syd, öst, nord]) tas bort; Natural Earth
räknar Tokelau till Nya Zeeland, men Tokelau ingår inte i konturen (beslut 2026-11-10 i #579). Koordinaterna avrundas till två decimaler (cirka 1 km) och polygoner med färre än
fyra punkter tas bort."""
import json, sys, urllib.request
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


def geometry(topo, arcs, ne_id, exclude=()):
    g = next(g for g in topo['objects']['countries']['geometries'] if g.get('id') == ne_id)
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    out = []
    for poly in polys:
        rings = [dedupe(ring(arcs, r)) for r in poly]
        rings = [r for r in rings if len(r) >= 4]
        if rings and not any(box[0] <= rings[0][0][0] <= box[2] and box[1] <= rings[0][0][1] <= box[3] for box in exclude):
            out.append(rings)
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
