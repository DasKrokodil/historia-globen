#!/usr/bin/env python3
"""Bygger data/religions-polities.json: varje rikes gräns i religionslagret (#194).

I data/religions.json är rikena sammanslagna per religion och tidsperiod (ögonblicksbilder),
så att lagret går snabbt att rita. Den här filen har i stället gränsen för varje enskilt rike,
så att ett klick på ett religionsområde kan säga vilket rike som låg på just den platsen.
Filen laddas först vid det första klicket på ett religionsområde.

Bara de rikesperioder som ingår i någon ögonblicksbild i religions.json tas med: för varje
ögonblicksbild och varje rike i dess lista "polities" den period i Cliopatria som gällde det år
ögonblicksbilden börjar. Det är samma urval som när ögonblicksbilden byggdes, så rikena täcker
det område som ritas. Religionen tas inte härifrån utan ur religions.json.

Kör från projektets rot, efter att religions.json är byggd, med Cliopatria-filen
(cliopatria_polities_only_v021.geojson från https://zenodo.org/records/13363121, CC BY 4.0):
    python3 tools/religioner_riken.py <cliopatria.geojson>
Kräver shapely (pip install shapely).
"""
import json
import sys
from pathlib import Path

from shapely.geometry import mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
TOL = 0.25       # förenkling i grader (Douglas-Peucker), samma som religions.json
MIN_AREA = 0.05  # öar mindre än så här (kvadratgrader) tas bort, samma som religions.json
DEC = 1          # koordinater avrundas till 0.1 grad, samma som religions.json


def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)):
            return [round(o[0], DEC), round(o[1], DEC)]
        return [rnd(x) for x in o]
    return o


def main():
    rel = json.loads((ROOT / 'data/religions.json').read_text())
    # rikets namn -> år då en ögonblicksbild med riket börjar
    wanted = {}
    for r in rel['religions']:
        for s in r['snapshots']:
            for name in s['polities']:
                wanted.setdefault(name, set()).add(s['start'])
    src = json.loads(Path(sys.argv[1]).read_text())
    out = {}
    for f in src['features']:
        p = f['properties']
        if p['Type'] != 'POLITY' or p['Name'] not in wanted:
            continue
        if not any(p['FromYear'] <= y <= p['ToYear'] for y in wanted[p['Name']]):
            continue
        g = shape(f['geometry']).buffer(0).simplify(TOL, preserve_topology=True)
        if g.geom_type == 'MultiPolygon':
            g = unary_union([q for q in g.geoms if q.area > MIN_AREA] or [max(g.geoms, key=lambda q: q.area)])
        if g.is_empty:
            continue
        gm = mapping(g)
        out.setdefault(p['Name'], []).append({'start': p['FromYear'], 'end': p['ToYear'],
                                              'geometry': {'type': gm['type'], 'coordinates': rnd(gm['coordinates'])}})
    for periods in out.values():
        periods.sort(key=lambda q: q['start'])
    missing = sorted(set(wanted) - set(out))
    if missing:
        print('saknas i Cliopatria:', missing)
    notes = ('Varje rikes gräns i religionslagret, för klickrutan (#194). Utdrag ur Cliopatria, datafil '
             'cliopatria_polities_only_v021 (Seshat Global History Databank, CC BY 4.0, https://zenodo.org/records/13363121), '
             'byggt med tools/religioner_riken.py. Bara rikesperioder som ingår i någon ögonblicksbild i religions.json finns med. '
             f'Ändringar: geometrin är förenklad (Douglas-Peucker {TOL} grader, koordinater avrundade till 0.1 grad, öar under '
             f'{MIN_AREA} kvadratgrader borttagna). start/end är Cliopatrias årtal oförändrade (astronomiska år). Nyckeln är rikets '
             'namn i Cliopatria, samma som i religions.json. Religionen står inte här utan i religions.json.')
    doc = {'schema': 'historia-globen/religions-polities@1', 'notes': notes, 'sources': ['cliopatria'],
           'polities': dict(sorted(out.items()))}
    path = ROOT / 'data/religions-polities.json'
    path.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print(f'{len(out)} riken, {sum(len(v) for v in out.values())} perioder, {path.stat().st_size // 1000} kB')


if __name__ == '__main__':
    main()
