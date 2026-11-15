#!/usr/bin/env python3
"""Mätning för #1765: förenklas grannriken var för sig (som tools/riken.py gör i dag) eller tillsammans som en täckning
(shapely.coverage_simplify, GEOS 3.12+)? Skriver en tabell per region och år: överlapp mellan grannar, avvikelse från
Cliopatria (symmetrisk skillnad), antal hörnpunkter och tid. Ändrar inga filer.

Körs för hand:  python3 tools/forenkling_matning.py <cliopatria_polities_only_v021.geojson>

Urval: alla Cliopatria-poster som finns året och skär regionens ruta, utom sammanslagna poster med namn inom parentes
("(Kalmar Union)"), som täcker sina delar och därför alltid överlappar dem. Före förenklingen görs posterna till en giltig
täckning: buffer(0) och, i namnordning, minus de tidigare posterna, så att råa överlapp i Cliopatria inte räknas.
"""
import json
import sys
import time

import numpy as np
import shapely
from shapely.geometry import box, shape
from shapely.ops import unary_union

REGIONS = {
    'Brittiska öarna': (box(-11, 49.5, 2.5, 61.5), (650, 750, 850, 1000, 1050, 1100)),
    'Ryssland och Sibirien': (box(20, 45, 90, 70), (1480, 1500, 1550, 1580)),
}
TOL = (0.2, 0.1)  # som TOL och de finare OVERRIDES i tools/riken.py


def vertices(geoms):
    return int(sum(shapely.get_num_coordinates(g) for g in geoms))


def overlap(geoms):
    tree = shapely.STRtree(geoms)
    total = 0.0
    for i, g in enumerate(geoms):
        for j in tree.query(g):
            if j > i:
                total += g.intersection(geoms[j]).area
    return total


def deviation(raw, simp):
    return sum(r.symmetric_difference(s).area for r, s in zip(raw, simp)) / max(sum(r.area for r in raw), 1e-9)


def coverage(feats):
    out, seen = [], None
    for _name, g in sorted(feats, key=lambda t: t[0]):
        g = g.buffer(0)
        if seen is not None:
            g = g.difference(seen)
        if not g.is_empty and g.area > 1e-6:
            out.append(g)
            seen = g if seen is None else unary_union([seen, g])
    return out


def tolerance_for(raw, target):
    """Den täckningstolerans som ger ungefär lika många hörnpunkter som den enskilda förenklingen (bisektion)."""
    lo, hi = 0.0005, 2.0
    for _ in range(24):
        mid = (lo * hi) ** 0.5
        n = vertices(shapely.coverage_simplify(np.array(raw, dtype=object), mid))
        lo, hi = (mid, hi) if n > target else (lo, mid)
    return (lo * hi) ** 0.5


def main():
    src = json.loads(open(sys.argv[1], encoding='utf-8').read())['features']
    print('| Region | År | Riken | Metod | Överlapp (kv.grader) | Avvikelse | Hörnpunkter | Tid (ms) |')
    print('|---|---|---|---|---|---|---|---|')
    for region, (rbox, years) in REGIONS.items():
        for y in years:
            feats = [(f['properties']['Name'], shape(f['geometry'])) for f in src
                     if f['properties']['FromYear'] <= y <= f['properties']['ToYear'] and not f['properties']['Name'].startswith('(')]
            feats = [(n, g) for n, g in feats if g.intersects(rbox)]
            raw = coverage(feats)
            print(f'| {region} | {y} | {len(raw)} | rå (Cliopatria, gjord giltig) | {overlap(raw):.3f} | 0 | {vertices(raw)} | – |')
            for tol in TOL:
                t0 = time.perf_counter()
                ind = [g.simplify(tol, preserve_topology=True) for g in raw]
                ms = (time.perf_counter() - t0) * 1000
                print(f'| | | | var för sig, {tol} | {overlap(ind):.3f} | {deviation(raw, ind):.1%} | {vertices(ind)} | {ms:.0f} |')
                ct = tolerance_for(raw, vertices(ind))
                t0 = time.perf_counter()
                cov = list(shapely.coverage_simplify(np.array(raw, dtype=object), ct))
                ms = (time.perf_counter() - t0) * 1000
                print(f'| | | | tillsammans, lika många punkter (tol {ct:.3f}) | {overlap(cov):.3f} | {deviation(raw, cov):.1%} | {vertices(cov)} | {ms:.0f} |')


if __name__ == '__main__':
    main()
