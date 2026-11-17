#!/usr/bin/env python3
"""Ortnamn för regionvyn (#1643, del av #1627): en liten fil per plats i data/platser.json med orter, grannländer och hav runt
platsen, med namn på sv, en, de, es och fr ur Natural Earth (public domain, källan natural-earth-ortnamn i data/sources.json).

Körs för hand: python3 tools/ortnamn.py [mapp med nedladdade filer]
Utan argument hämtas de tre filerna ur natural-earth-vector v5.1.2 (cirka 34 MB). Med en mapp läses filerna därifrån, med
samma namn som nedan (ne_10m_populated_places.geojson och så vidare).

Ramen: platsens gräns (boundary.geometry) som ruta, med marginal åt alla håll (största av PAD_MIN_KM och PAD_SHARE av rutans
längsta sida), ungefär det regionvyn visar när platsen fyller cirka 65 % av bilden (#1627). En ram som korsar datumlinjen
(Aotearoa med Chathamöarna) räknas utvikt, och koordinaterna i filen skrivs tillbaka till −180…180.

Innehållet:
- places: orter ur ne_10m_populated_places inom ramen, högst MAX_PLACES, de viktigaste först (Natural Earths SCALERANK, sedan
  POP_MAX; en ort utanför platsens egen ruta räknas OUTSIDE_PENALTY steg lägre i urvalet). rank är SCALERANK (0 viktigast,
  10 minst), så att vyn kan gallra efter skala.
- neighbours: grannländerna i boundary.neighbours (#1449; vilka länder det är skrivs alltså inte här), med namn ur
  ne_10m_admin_0_countries (ISO_N3, eller ISO_N3_EH när ISO_N3 är −99 som för Norge) och en punkt för namnet inne i landet och
  inom ramen. Efter dem, med sea: true och km (kortaste avståndet från platsens gräns), länder utan landgräns mot platsen som har
  någon punkt inom landsmarginalen landPadKm från platsens gräns (#1690), de närmaste först. Landsmarginalen är platsens längsta
  sida (LAND_PAD_SHARE, minst padKm), alltså större än ortmarginalen padKm (30 %). Namnets punkt läggs i första hand som förut på
  landets delar inom padKm och inom ramen (Island vid Grönland). Ger de ingen punkt, läggs den på landets delar inom
  landsmarginalen, i landsramen (ramen utvidgad med landsmarginalen åt öst och väst men inte åt nord och syd) och högst
  landsmarginalen från platsens gräns, och landet får far: true (Australiens sydöstra del vid Aotearoa). Regionvyn prövar ett land
  med far först efter orterna och haven. Platsens eget land (för ett län landet vars ADM0_A3 står först i adm1_code) är inte med.
- seas: hav, sund och vikar ur ne_10m_geography_marine_polys som ligger inom ramen, högst MAX_SEAS, med en punkt för namnet.
Punkten för ett namn är den punkt i ett rutnät över ramen som ligger inne i området och längst från dess kant och ramens kant
(en enkel "pol för otillgänglighet"). Ett område utan en enda sådan punkt tas inte med.

Namnen: Natural Earths NAME_SV, NAME_EN, NAME_DE, NAME_ES och NAME_FR (name_sv … för haven). Saknas ett språk används engelska
(NAME_EN, annars NAME), och språket står då i fallback, så att det syns att namnet inte är översatt. Inga namn skrivs för hand.
Koordinaterna avrundas till tre decimaler för orter (cirka 100 m) och två för namnens punkter (cirka 1 km). En omkörning ger tom diff.

Kompletteringen (#1676): orter som händelser på platsen pekar på men som Natural Earth saknar (Lund, Ribe, Jelling …) står för hand
i data/ortnamn-komplettering.json, med etiketter och koordinat ur Wikidata (CC0) och de händelser de jämfördes med. De läggs sist i
places med id wd-<Q-id>, rank KOMPLETTERING_RANK (källan har ingen storleksrang), source (källans id i sources.json) och wikidata,
så att det syns att namnet inte kommer från Natural Earth. En ort som redan finns i Natural Earth inom DUPLICATE_KM läggs inte till.
"""
import gzip
import json
import math
import sys
import urllib.request
from pathlib import Path

import numpy as np

BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/'
FILES = {
    'places': 'ne_10m_populated_places.geojson',
    'marine': 'ne_10m_geography_marine_polys.geojson',
    'countries': 'ne_10m_admin_0_countries.geojson',
}
ROOT = Path(__file__).resolve().parent.parent
PLATSER = ROOT / 'data' / 'platser.json'
OUT = ROOT / 'data' / 'ortnamn'
SOURCE = 'natural-earth-ortnamn'
LANGS = ('sv', 'en', 'de', 'es', 'fr')
PAD_MIN_KM = 25
PAD_SHARE = 0.3
MAX_PLACES = 60
# Orter utanför platsens egen ruta (utan marginal) räknas som så här många steg mindre viktiga när urvalet görs, så att
# närmaste omgivningen går före storstäder vid ramens kant (Moskva och London i Sveriges ram). rank i filen är oförändrad.
OUTSIDE_PENALTY = 2
MAX_SEAS = 12
# Landsmarginalen (#1690, DasKrokodil 2026-11-16: länder får en större marginal än orter): ett land utan landgräns mot platsen
# namnges när någon del av det ligger högst så här stor andel av platsens längsta sida från platsens gräns, alltså en platslängd
# (orterna och ramen har PAD_SHARE, 30 %). Andelen i stället för de föreslagna fasta 1 000 km: Australiens fastland ligger 1 645 km
# från Aotearoas gräns (de 619 km som mättes först var Macquarieön, för liten för en namnpunkt), och en fast marginal på över
# 1 600 km skulle ge Skåne (ortmarginal 40 km) och Danmark (130 km) halva Europa. Aotearoa får 2 017 km, Grönland 2 645 km.
# Namnets punkt läggs på den del av landet som ligger inom landsmarginalen, så att namnet står på sidan mot platsen (Australiens
# sydöstra del, inte mitt i landet). Se docs/beslut/2026-11-17-landsmarginal-ortnamn-1690.md.
LAND_PAD_SHARE = 1.0
GRID = 48
KM_PER_DEG = 111.2
KOMPLETTERING = ROOT / 'data' / 'ortnamn-komplettering.json'
KOMPLETTERING_RANK = 10
DUPLICATE_KM = 2
KINDS = {'Admin-0 capital': 'capital', 'Admin-0 capital alt': 'capital', 'Admin-1 capital': 'admin1-capital'}


def load(cache, key):
    name = FILES[key]
    if cache:
        return json.loads((Path(cache) / name).read_text(encoding='utf-8'))
    with urllib.request.urlopen(BASE + name, timeout=300) as r:
        return json.load(r)


def names(props, upper):
    """Namnen på fem språk och listan över språk där engelska fick ersätta ett saknat namn."""
    key = (lambda l: f'NAME_{l.upper()}') if upper else (lambda l: f'name_{l}')
    en = (props.get(key('en')) or props.get('NAME' if upper else 'name') or '').strip()
    out, fallback = {}, []
    for lang in LANGS:
        v = (props.get(key(lang)) or '').strip()
        if not v:
            v = en
            if lang != 'en':
                fallback.append(lang)
        out[lang] = v
    return out, fallback


def frame(place, share=PAD_SHARE):
    """Ramen [väst, syd, öst, nord] i grader, utvikt så att väst < öst (öst kan vara över 180), platsens egen ruta utan
    marginal och marginalen i km. Marginalen i längdgrad räknas med cos(mittbredden), som regionvyns lokala skala (#1627).
    share är marginalens andel av rutans längsta sida: PAD_SHARE för ramen, LAND_PAD_SHARE för landsramen (#1690)."""
    pts = [p for poly in place['boundary']['geometry']['coordinates'] for ring in poly for p in ring]
    xs = [p[0] for p in pts]
    if max(xs) - min(xs) > 180:  # gränsen korsar datumlinjen: lägg de västra längdgraderna efter 180
        xs = [x + 360 if x < 0 else x for x in xs]
    ys = [p[1] for p in pts]
    w, e, s, n = min(xs), max(xs), min(ys), max(ys)
    lat0 = math.radians((s + n) / 2)
    span_km = max((e - w) * KM_PER_DEG * math.cos(lat0), (n - s) * KM_PER_DEG)
    pad_km = max(PAD_MIN_KM, share * span_km)
    pad_y = pad_km / KM_PER_DEG
    pad_x = pad_km / (KM_PER_DEG * math.cos(lat0))
    return [w - pad_x, max(-90.0, s - pad_y), e + pad_x, min(90.0, n + pad_y)], [w, s, e, n], round(pad_km)


def land_frame(place):
    """Landsramen (#1690): ramen, utvidgad med landsmarginalen åt öst och väst men inte åt nord och syd, och landsmarginalen i km.
    Skärmen är bredare än hög, så regionvyn visar mer av omgivningen i öst–väst än i nord–syd (Australien vid Aotearoa syns i dator,
    Nya Kaledonien och Antarktis norr och söder om ramen gör det inte)."""
    fr = frame(place)[0]
    wide, _, land_km = frame(place, LAND_PAD_SHARE)
    return [wide[0], fr[1], wide[2], fr[3]], land_km


def lon_in(x, fr):
    """Längdgraden x flyttad ±360 så att den hamnar i ramen om det går."""
    for k in (0, 360, -360):
        if fr[0] <= x + k <= fr[2]:
            return x + k
    return x


def normal(x):
    return ((x + 180) % 360) - 180 if abs(x) > 180 else x


def rings_of(geom, fr):
    """Alla ringar (yttre och hål) som numpy-fält, med kopior flyttade ±360 när ramen går över datumlinjen."""
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    shifts = [0] + ([360] if fr[2] > 180 else []) + ([-360] if fr[0] < -180 else [])
    out = []
    for poly in polys:
        for r in poly:
            a = np.asarray(r, dtype=float)
            for k in shifts:
                b = a.copy()
                b[:, 0] += k
                if b[:, 0].max() >= fr[0] - 1 and b[:, 0].min() <= fr[2] + 1 and b[:, 1].max() >= fr[1] - 1 and b[:, 1].min() <= fr[3] + 1:
                    out.append(b)
    return out


def grid(fr):
    """Rutnätets punkter över ramen (GRID × GRID, utan kanterna) som två platta fält med längd- och breddgrad."""
    gx = np.linspace(fr[0], fr[2], GRID + 2)[1:-1]
    gy = np.linspace(fr[1], fr[3], GRID + 2)[1:-1]
    px, py = np.meshgrid(gx, gy)
    return px.ravel(), py.ravel()


def grid_km(fr, own):
    """Varje rutnätspunkts kortaste avstånd i km (storcirkel) till platsens gränspunkter own ([lon, lat] i radianer)."""
    px, py = grid(fr)
    a = np.radians(np.stack([px, py], axis=1))
    best = np.full(len(a), np.inf)
    for i in range(0, len(own), 500):
        c = own[i:i + 500]
        dlat = c[None, :, 1] - a[:, None, 1]
        dlon = c[None, :, 0] - a[:, None, 0]
        h = np.sin(dlat / 2) ** 2 + np.cos(a[:, None, 1]) * np.cos(c[None, :, 1]) * np.sin(dlon / 2) ** 2
        best = np.minimum(best, h.min(axis=1))
    return 2 * 6371.0 * np.arcsin(np.sqrt(np.clip(best, 0.0, 1.0)))


def label_point(geom, fr, reach=None):
    """Punkten i ett rutnät över ramen som ligger inne i området och längst från områdets och ramens kant, eller None.
    reach = (km, max_km): bara punkter högst max_km från platsens gräns (km per punkt ur grid_km), och den gränsen räknas som en
    kant till (landsmarginalen, #1690)."""
    rings = rings_of(geom, fr)
    if not rings:
        return None
    cos0 = math.cos(math.radians((fr[1] + fr[3]) / 2))
    px, py = grid(fr)
    inside = np.zeros(px.shape, dtype=bool)
    dist = np.full(px.shape, np.inf)
    for r in rings:
        x1, y1, x2, y2 = r[:-1, 0], r[:-1, 1], r[1:, 0], r[1:, 1]
        # jämn-udda-regeln: kanter som korsar punktens breddgrad till höger om punkten
        cross = ((y1[None, :] > py[:, None]) != (y2[None, :] > py[:, None]))
        with np.errstate(divide='ignore', invalid='ignore'):
            xs = (x2 - x1)[None, :] * (py[:, None] - y1[None, :]) / (y2 - y1)[None, :] + x1[None, :]
        inside ^= (np.count_nonzero(cross & (px[:, None] < xs), axis=1) % 2 == 1)
        # avståndet till kanterna som ligger nära ramen, i grader breddgrad (längdgraden skalad med cos)
        near = (np.maximum(x1, x2) >= fr[0] - 2) & (np.minimum(x1, x2) <= fr[2] + 2) & (np.maximum(y1, y2) >= fr[1] - 2) & (np.minimum(y1, y2) <= fr[3] + 2)
        if near.any():
            ax, ay, bx, by = x1[near] * cos0, y1[near], x2[near] * cos0, y2[near]
            qx, qy = px[:, None] * cos0, py[:, None]
            dx, dy = bx - ax, by - ay
            ll = dx * dx + dy * dy
            with np.errstate(divide='ignore', invalid='ignore'):
                t = np.clip(np.where(ll > 0, ((qx - ax) * dx + (qy - ay) * dy) / ll, 0), 0, 1)
            d = np.hypot(qx - (ax + t * dx), qy - (ay + t * dy)).min(axis=1)
            dist = np.minimum(dist, d)
    edge = np.minimum.reduce([(px - fr[0]) * cos0, (fr[2] - px) * cos0, py - fr[1], fr[3] - py])
    if reach is not None:
        km, max_km = reach
        edge = np.minimum(edge, (max_km - km) / KM_PER_DEG)
    score = np.where(inside, np.minimum(dist, edge), -1)
    i = int(score.argmax())
    if score[i] <= 0:
        return None
    return [round(normal(float(px[i])), 2), round(float(py[i]), 2)]


def iso_n3(props):
    v = props.get('ISO_N3')
    return props.get('ISO_N3_EH') if v in (None, '', '-99') else v


KOMPLETTERING_SOURCE = ['wikidata']


def komplettering():
    """Orterna ur data/ortnamn-komplettering.json per plats (#1676), eller inget om filen saknas."""
    if not KOMPLETTERING.is_file():
        return {}
    doc = json.loads(KOMPLETTERING.read_text(encoding='utf-8'))
    KOMPLETTERING_SOURCE[0] = doc['source']
    return doc['places']


def km_between(a, b):
    """Avståndet i km mellan två punkter [lon, lat] (lokal platt skala, räcker för några km)."""
    lat0 = math.radians((a[1] + b[1]) / 2)
    return math.hypot((a[0] - b[0]) * KM_PER_DEG * math.cos(lat0), (a[1] - b[1]) * KM_PER_DEG)


def own_iso(place, countries):
    """ISO 3166-1 numeriskt id för platsens eget land: boundary.ne, eller för ett län (boundary.admin1, till exempel SWE-3429)
    landet vars ADM0_A3 står först i adm1_code (Natural Earths egen kod för landet)."""
    b = place['boundary']
    if b.get('ne'):
        return str(b['ne'])
    a3 = str(b.get('admin1', '')).split('-')[0]
    for f in countries['features']:
        if f['properties'].get('ADM0_A3') == a3:
            return str(iso_n3(f['properties']))
    return None


def boundary_points(place):
    """Platsens gränspunkter som numpy-fält [lon, lat] i radianer (alla ringar)."""
    pts = [p for poly in place['boundary']['geometry']['coordinates'] for ring in poly for p in ring]
    return np.radians(np.asarray(pts, dtype=float))


def min_km(a, b):
    """Kortaste avståndet i km (storcirkel) mellan någon punkt i a och någon i b, båda [lon, lat] i radianer."""
    best = np.inf
    for i in range(0, len(b), 4000):
        c = b[i:i + 4000]
        dlat = c[None, :, 1] - a[:, None, 1]
        dlon = c[None, :, 0] - a[:, None, 0]
        h = np.sin(dlat / 2) ** 2 + np.cos(a[:, None, 1]) * np.cos(c[None, :, 1]) * np.sin(dlon / 2) ** 2
        best = min(best, float(h.min()))
    return 2 * 6371.0 * math.asin(math.sqrt(min(1.0, max(0.0, best))))


def sea_neighbours(place, countries, fr, pad_km, skip):
    """Länder utan landgräns mot platsen som ändå ligger inom landsmarginalen (#1690): någon punkt i landets polygon inom pad_km
    från platsens gräns, till exempel Island vid Grönland och Australien vid Aotearoa. fr är landsramen och pad_km landsmarginalen.
    skip: id som inte ska med (platsens eget land och grannarna med landgräns). Ger [(km, iso, feature, geometry)] med de närmaste
    först, där geometry bara har landets delar (polygoner) inom marginalen, så att namnet hamnar på den del som ligger nära platsen.
    Bara landets punkter i landsramen prövas, så att resten av världen inte räknas."""
    own = boundary_points(place)
    out = []
    for f in countries['features']:
        iso = str(iso_n3(f['properties']))
        if iso in skip or iso in ('None', '-99'):
            continue
        g = f['geometry']
        near, best = [], math.inf
        for poly in (g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]):
            rings = rings_of({'type': 'Polygon', 'coordinates': [poly[0]]}, fr)
            if not rings:
                continue
            pts = np.concatenate(rings)
            pts = pts[(pts[:, 0] >= fr[0]) & (pts[:, 0] <= fr[2]) & (pts[:, 1] >= fr[1]) & (pts[:, 1] <= fr[3])]
            if not len(pts):
                continue
            km = min_km(own, np.radians(pts))
            if km <= pad_km:
                near.append(poly)
                best = min(best, km)
        if near:
            out.append((round(best), iso, f, {'type': 'MultiPolygon', 'coordinates': near}))
    out.sort(key=lambda t: (t[0], t[1]))
    return out


def build(place, ne_places, marine, countries):
    fr, own, pad_km = frame(place)
    out = {'schema': 'historia-globen/ortnamn@1', 'place': place['id'], 'source': SOURCE,
           'frame': [round(normal(fr[0]), 2), round(fr[1], 2), round(normal(fr[2]), 2), round(fr[3], 2)], 'padKm': pad_km,
           'landPadKm': land_frame(place)[1]}

    found = []
    for f in ne_places['features']:
        p = f['properties']
        x, y = f['geometry']['coordinates']
        if fr[1] <= y <= fr[3] and fr[0] <= lon_in(x, fr) <= fr[2]:
            inside_own = own[1] <= y <= own[3] and own[0] <= lon_in(x, fr) <= own[2]
            weight = p['SCALERANK'] + (0 if inside_own else OUTSIDE_PENALTY)
            found.append((weight, p['SCALERANK'], -(p.get('POP_MAX') or 0), p['NE_ID'], p, x, y))
    found.sort(key=lambda t: (t[0], t[2], t[3]))
    out['places'] = []
    for _, rank, _, ne_id, p, x, y in found[:MAX_PLACES]:
        nm, fb = names(p, True)
        item = {'id': f'ne-{ne_id}', 'kind': KINDS.get(p['FEATURECLA'], 'place'), 'rank': rank,
                'coordinates': [round(x, 3), round(y, 3)], 'name': nm}
        if fb:
            item['fallback'] = fb
        out['places'].append(item)

    for extra in komplettering().get(place['id'], []):
        x, y = extra['coordinates']
        if any(km_between(pl['coordinates'], (x, y)) <= DUPLICATE_KM for pl in out['places']):
            print(f"  {place['id']}: {extra['name']['sv']} finns redan i Natural Earth, läggs inte till", file=sys.stderr)
            continue
        item = {'id': f"wd-{extra['wikidata']}", 'kind': 'place', 'rank': KOMPLETTERING_RANK, 'coordinates': [x, y],
                'name': extra['name'], 'source': KOMPLETTERING_SOURCE[0], 'wikidata': extra['wikidata']}
        if extra.get('fallback'):
            item['fallback'] = extra['fallback']
        out['places'].append(item)

    by_iso = {}
    for f in countries['features']:
        by_iso.setdefault(str(iso_n3(f['properties'])), f)
    out['neighbours'] = []
    for nb in place['boundary']['neighbours']:
        f = by_iso.get(str(nb.get('ne')))
        if f is None:
            print(f"  {place['id']}: grannen {nb['name']} ({nb.get('ne')}) finns inte i admin 0, hoppas över", file=sys.stderr)
            continue
        pt = label_point(f['geometry'], fr)
        if pt is None:
            continue
        nm, fb = names(f['properties'], True)
        item = {'ne': str(nb['ne']), 'label': pt, 'name': nm}
        if fb:
            item['fallback'] = fb
        out['neighbours'].append(item)
    # Länder över havet inom landsmarginalen (#1690): efter grannarna med landgräns, med sea: true. Landsramen är platsens ruta med
    # landsmarginalen åt alla håll, och namnets punkt ligger inom landsmarginalen från platsens gräns.
    lfr, land_km = land_frame(place)
    reach = (grid_km(lfr, boundary_points(place)), land_km)
    skip = {str(nb.get('ne')) for nb in place['boundary']['neighbours']} | {own_iso(place, countries)}
    # Först som förut: namnet på landets delar inom ortmarginalen och inom ramen (Island vid Grönland). Ger de ingen punkt, läggs
    # namnet på delarna inom landsmarginalen och landet får far: true, så att regionvyn prövar det först efter orterna och haven.
    close = {iso: near for _, iso, _, near in sea_neighbours(place, countries, fr, pad_km, skip)}
    for km, iso, f, near in sea_neighbours(place, countries, lfr, land_km, skip):
        pt, far = (label_point(close[iso], fr), False) if iso in close else (None, True)
        if pt is None:
            pt, far = label_point(near, lfr, reach), True
        if pt is None:
            continue
        nm, fb = names(f['properties'], True)
        item = {'ne': iso, 'label': pt, 'name': nm, 'sea': True, 'km': km}
        if far:
            item['far'] = True
        if fb:
            item['fallback'] = fb
        out['neighbours'].append(item)

    seas = []
    for f in marine['features']:
        p = f['properties']
        if not p.get('name'):
            continue
        pt = label_point(f['geometry'], fr)
        if pt is None:
            continue
        seas.append((p.get('scalerank') if p.get('scalerank') is not None else 99, p['ne_id'], p, pt))
    seas.sort(key=lambda t: t[:2])
    out['seas'] = []
    for rank, ne_id, p, pt in seas[:MAX_SEAS]:
        nm, fb = names(p, False)
        item = {'id': f'ne-{ne_id}', 'kind': p['featurecla'], 'rank': rank, 'label': pt, 'name': nm}
        if fb:
            item['fallback'] = fb
        out['seas'].append(item)
    return out


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else None
    doc = json.loads(PLATSER.read_text(encoding='utf-8'))
    ne_places, marine, countries = load(cache, 'places'), load(cache, 'marine'), load(cache, 'countries')
    OUT.mkdir(exist_ok=True)
    wanted = set()
    for place in doc['places']:
        data = build(place, ne_places, marine, countries)
        path = OUT / f"{place['id']}.json"
        text = json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n'
        path.write_text(text, encoding='utf-8')
        wanted.add(path.name)
        print(f"{place['id']}: {len(data['places'])} orter, {len(data['neighbours'])} grannländer, {len(data['seas'])} hav; "
              f"{len(text.encode())} byte ({len(gzip.compress(text.encode(), mtime=0))} gzip)")
    for old in OUT.glob('*.json'):
        if old.name not in wanted:
            old.unlink()
            print(f'tog bort {old.name} (platsen finns inte längre)')


if __name__ == '__main__':
    sys.exit(main())
