#!/usr/bin/env python3
"""Bygger data/upptackt-europa.json: Europa som hemregion i upptäcktsvyn (#872).

Indata: Natural Earth 1:50m admin 0 countries (public domain), till exempel
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson

    python3 tools/europa_dimma.py <ne_50m_admin_0_countries.geojson> data/upptackt-europa.json

Regeln för Europas gräns (beskrivs också i perspektivraden):
- Länder som Natural Earth räknar till Europa (CONTINENT = Europe).
- Bara delar som ligger i Europa på kartan: utan Grönland, Franska Guyana och andra områden över haven
  (varje del måste ligga inom lon -26..60 och lat 34..82).
- Ryssland klipps vid 60° ö.l., ungefär Uralbergen, så att Sibirien inte räknas.
- Turkiet och Kaukasus räknas till Asien i Natural Earth och ingår inte; de lyfts av Rom och Alexanders rike.
"""
import json, sys

LON_MIN, LON_MAX, LAT_MIN, LAT_MAX = -26.0, 60.0, 34.0, 82.0

def clip_x(ring, xmax):
    """Sutherland-Hodgman mot halvplanet x <= xmax."""
    out = []
    for i, p in enumerate(ring):
        q = ring[i - 1]
        pin, qin = p[0] <= xmax, q[0] <= xmax
        if pin != qin:
            t = (xmax - q[0]) / (p[0] - q[0])
            out.append([xmax, q[1] + t * (p[1] - q[1])])
        if pin:
            out.append(p)
    return out

def bbox(ring):
    xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
    return min(xs), min(ys), max(xs), max(ys)

def main(src, dst):
    doc = json.load(open(src, encoding='utf-8'))
    polys = []
    for f in doc['features']:
        pr = f['properties']
        if pr.get('CONTINENT') != 'Europe':
            continue
        g = f['geometry']
        parts = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        for rings in parts:
            outer = rings[0]
            x0, y0, x1, y1 = bbox(outer)
            if x1 < LON_MIN or y1 < LAT_MIN or y0 > LAT_MAX:
                continue
            if x0 < LON_MIN - 1 and x1 < 0:        # delar över Atlanten
                continue
            if y1 < LAT_MIN:
                continue
            if x0 > LON_MAX:                        # bara öster om Ural
                continue
            if x0 < -170 or y1 < 0 or (y0 < 20 and y1 < LAT_MIN):  # ö i andra världsdelar
                continue
            # Ryssland: klipp vid Ural; alla ringar (hål också)
            new = []
            for r in rings:
                c = clip_x(r, LON_MAX) if bbox(r)[2] > LON_MAX else r
                if len(c) >= 4:
                    new.append(c)
            if not new or len(new[0]) < 4:
                continue
            if bbox(new[0])[0] < LON_MIN:
                continue
            polys.append(new)
    def rnd(r):
        out = []
        for x, y in r:
            p = [round(x, 2), round(y, 2)]
            if not out or p != out[-1]:
                out.append(p)
        if out[0] != out[-1]:
            out.append(out[0])
        return out
    polys = [[rnd(r) for r in rings] for rings in polys]
    polys = [rings for rings in polys if len(rings[0]) >= 4]
    json.dump({
        'schema': 'historia-globen/upptackt-region@1',
        'id': 'europa',
        'source': 'Natural Earth 1:50m, admin 0 countries (public domain), bearbetat av tools/europa_dimma.py (#872)',
        'note': 'Europa som hemregion i upptäcktsvyn: länder med CONTINENT = Europe, utan områden över haven, Ryssland klippt vid 60° ö.l. (Ural). Turkiet och Kaukasus ingår inte.',
        'geometry': {'type': 'MultiPolygon', 'coordinates': polys},
    }, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{len(polys)} delar, {sum(len(r) for p in polys for r in p)} punkter')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
