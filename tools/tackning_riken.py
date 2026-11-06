#!/usr/bin/env python3
"""Täckningsanalys för rikena (#556, fas 0).

Räknar för ett antal år hur stor del av Cliopatrias land (alla stater i filen det året) som täcks av de riken
vi har i tools/riken.py (GROUPS), och listar de Cliopatria-stater som saknas, rangordnade efter hur mycket
land de täcker som våra riken inte täcker (km² × år, summerat över provåren). Världsdelen är ungefärlig och
räknas ur statens mittpunkt.

Kör från projektets rot, med Cliopatria-filen (cliopatria_polities_only_v021.geojson, CC BY 4.0):
    python3 tools/tackning_riken.py <cliopatria.geojson> [rapport.md]
Kräver shapely. Skriptet ändrar inga datafiler; resultatet skrivs som Markdown (standard: till skärmen).

Begränsningar: riken som tools/riken.py bygger ihop av andra poster (EXTEND, Tysk-romerska riket efter 1458)
räknas bara med sina egna poster, och relationsposter (Type = RELATION) räknas inte.
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

from shapely.geometry import shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from riken import GROUPS, km2  # noqa: E402

YEARS = list(range(-3399, 1, 100)) + list(range(100, 1500, 100)) + list(range(1500, 2025, 25)) + [2024]
STEP = {y: (100 if y < 1500 else 25) for y in YEARS}  # hur många år ett provår står för (-3399 = 3400 f.Kr.)
SIMPLIFY = 0.05


def our_names():
    names = set()
    for _gid, (_sv, _en, members, *_o) in GROUPS.items():
        for cname, *_rest in members:
            names.update(n for n in (cname if isinstance(cname, list) else [cname]) if n)
    return names


def continent(lon, lat):
    """Ungefärlig världsdel ur en mittpunkt."""
    if lon < -30:
        return 'Amerika'
    if lat < -10 and lon > 110:
        return 'Oceanien'
    if lon > 140 or (lat < 0 and lon > 160):
        return 'Oceanien'
    if lat > 35 and lon < 40 and lon > -30:
        return 'Europa'
    if lat < 37 and -20 < lon < 52 and not (lat > 12 and lon > 34):
        return 'Afrika'
    return 'Asien'


def main():
    src = json.loads(Path(sys.argv[1]).read_text())
    feats = []
    for f in src['features']:
        p = f['properties']
        if p['Type'] != 'POLITY':
            continue
        g = shape(f['geometry']).buffer(0).simplify(SIMPLIFY, preserve_topology=True)
        if not g.is_empty:
            feats.append((p['Name'], p['FromYear'], p['ToYear'], g))
    ours = our_names()
    rows, missing = [], defaultdict(lambda: {'kmyears': 0.0, 'from': 9999, 'to': -9999, 'pt': None})
    for y in YEARS:
        alive = [(n, g) for n, a, b, g in feats if a <= y <= b]
        if not alive:
            continue
        allu = unary_union([g for _n, g in alive])
        mine = unary_union([g for n, g in alive if n in ours]) if any(n in ours for n, _g in alive) else None
        a_all = km2(allu)
        a_mine = km2(mine.intersection(allu)) if mine is not None else 0
        rows.append((y, a_all, a_mine))
        for n, g in alive:
            if n in ours:
                continue
            rest = g.difference(mine) if mine is not None else g
            a = km2(rest) if not rest.is_empty else 0
            if a < 1000:
                continue
            m = missing[n]
            m['kmyears'] += a * STEP[y]
            m['from'], m['to'] = min(m['from'], y), max(m['to'], y)
            if m['pt'] is None:
                c = g.representative_point()
                m['pt'] = (c.x, c.y)
    out = ['# Täckningsanalys för rikena (#556, fas 0)', '',
           'Andel av Cliopatrias land (alla stater i filen det året) som våra riken täcker. Ytor i miljoner km².', '',
           '| År | Cliopatrias land | Våra riken | Andel |', '|---|---:|---:|---:|']
    for y, a_all, a_mine in rows:
        yr = f'{1 - y} f.Kr.' if y < 1 else str(y)
        out.append(f'| {yr} | {a_all / 1e6:.1f} | {a_mine / 1e6:.1f} | {100 * a_mine / a_all:.0f} % |')
    out += ['', '## Saknade stater per världsdel', '',
            'Rangordnade efter land som inte täcks av våra riken (miljoner km² × år, summerat över provåren). '
            'Världsdelen är ungefärlig, ur statens mittpunkt (Danmark hamnar till exempel i Amerika genom Grönland). '
            'Spannet är provåren då staten finns. Namn inom parentes, till exempel (Kingdom of France), är Cliopatrias '
            'sammanslagning av en stats alla delar och överlappar med delarna, som också står i listan.', '']
    per = defaultdict(list)
    for n, m in missing.items():
        per[continent(*m['pt'])].append((m['kmyears'], n, m['from'], m['to']))
    total = {k: sum(x[0] for x in v) for k, v in per.items()}
    for cont in sorted(per, key=lambda k: -total[k]):
        lst = sorted(per[cont], reverse=True)
        out += [f'### {cont} ({len(lst)} stater, {total[cont] / 1e9:.0f} miljarder km² × år)', '',
                '| Stat i Cliopatria | Provår | Mkm² × år |', '|---|---|---:|']
        for kmy, n, a, b in lst[:25]:
            fy = lambda v: f'{1 - v} f.Kr.' if v < 1 else str(v)
            out.append(f'| {n} | {fy(a)}–{fy(b)} | {kmy / 1e6:.0f} |')
        if len(lst) > 25:
            out.append(f'| … och {len(lst) - 25} till | | |')
        out.append('')
    text = '\n'.join(out) + '\n'
    if len(sys.argv) > 2:
        Path(sys.argv[2]).write_text(text)
    else:
        print(text)


if __name__ == '__main__':
    main()
