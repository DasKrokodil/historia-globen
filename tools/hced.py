#!/usr/bin/env python3
"""Gör om Historical Conflict Event Dataset (HCED) till utkast i vårt händelseformat (#24).

Datan kommer från World Historical Gazetteer (WHG), dataset 1415
(https://whgazetteer.org/datasets/1415/places). Datasetet har licensen CC0 1.0; WHG:s egna
tillägg (länkar till andra ortnamnsregister, sammanställningen) har CC BY 4.0.

WHG har en post per *plats* (6 951 platser). Varje plats har en eller flera beskrivningar av
formen "Wars of Scandinavian Union (1389)": konflikten som källan för händelsen till, och året.
Skriptet gör en händelse per beskrivning, alltså per plats, konflikt och år.

Allt blir utkast (`review: "draft"`) i data/utkast/hced.json, som appen inte läser. Ett utkast
flyttas till data/events.json först när någon har källkontrollerat det (se docs/kallor.md).
data/events.json ändras aldrig av skriptet.

Årtal: WHG anger år före vår tideräkning som negativa tal i historisk räkning utan år 0
("-0585" = 585 f.Kr.). Vi lagrar astronomiska år, så de blir 1 - 585 = -584. År 0 finns inte i
historisk räkning; en post med år 0 hoppas över och räknas.

Hämtning (bara Python 3:s standardbibliotek):
  1. https://whgazetteer.org/mapdata/datasets/1415/ – alla platser med namn, årsspann och
     koordinater i ett svar (cirka 4 MB). Koordinaten är punkten som följde med datasetet;
     WHG:s egna tillägg från andra register används inte.
  2. https://whgazetteer.org/api/db/?id=<plats> – en plats med beskrivningarna (konflikt och år).
     Svaren sparas i en cache, så att en avbruten körning kan fortsätta.
Den fullständiga nedladdningen (LPF) kräver inloggning hos WHG. Har du laddat ner den kan du
läsa den direkt med --lpf, så behövs inga fler anrop.

Kör från projektets rot:
    python3 tools/hced.py                 urval på cirka 150 utkast (standard)
    python3 tools/hced.py --urval 200     ett större urval
    python3 tools/hced.py --alla          allt (cirka 7 000 anrop med paus, tar ungefär en timme)
    python3 tools/hced.py --lpf fil.json  läs en nedladdad LPF-fil i stället för API:t

Skriptet skriver också ut vilka utkast som troligen är samma slag som redan finns i
data/events.json (samma år ±1 och inom 25 km, eller platsens namn i händelsens titel eller plats).
Listan sparas i utkastfilens `duplicates`.
"""
import argparse
import json
import math
import re
import sys
import time
import unicodedata
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'utkast' / 'hced.json'
EVENTS = ROOT / 'data' / 'events.json'
CACHE = Path.home() / '.cache' / 'historia-globen' / 'hced'
UA = 'Historia-globen (https://github.com/DasKrokodil/historia-globen)'
MAPDATA = 'https://whgazetteer.org/mapdata/datasets/1415/'
PLACE = 'https://whgazetteer.org/api/db/?id={}'
SOURCE_ID = 'whg-hced'
CHECKED = '2026-10-29'

# Världsdelar: samma grova indelning som region() i js/model.js.
REGIONS = ['Europa', 'Asien', 'Afrika', 'Amerika', 'Oceanien']
# Tidsåldrar för urvalet (astronomiska år, övre gräns exklusive).
ERAS = [('före 500 f.Kr.', -499), ('500 f.Kr.–499', 500), ('500–1499', 1500),
        ('1500–1799', 1800), ('1800–1899', 1900), ('1900–', 10000)]
DUP_KM = 25
FAR_KM = 50  # varna om datasetets punkt och WHG:s punkt skiljer sig mer än så här


def region(lat, lon):
    """Samma regler som region() i js/model.js."""
    if lat > 50 and (lon < -168 or lon > 160):
        return 'Asien'
    if lon < -120 and lat < 30:
        return 'Oceanien'
    if lon < -25:
        return 'Amerika'
    if (lat < -10 and lon > 110) or (lat < 0 and lon > 130) or lon > 160:
        return 'Oceanien'
    if lon < -1.5:
        lim = lat < 36
    elif lon <= 11.5:
        lim = lat < 37.5
    elif lon <= 32.5:
        lim = lat < 33.5
    else:
        lim = lat < 31.5 and lon < 32.5 + (30 - lat) * 0.62
    if lon >= -20 and lon < 52 and lat > -36 and lim:
        return 'Afrika'
    if lat >= 35 and (lon < 28.9 or (lat >= 41 and lon < 60 and not (lon > 40 and lat < 44.5))):
        return 'Europa'
    return 'Asien'


def era(year):
    for i, (_, top) in enumerate(ERAS):
        if year < top:
            return i
    return len(ERAS) - 1


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:  # nätverksfel eller 429: vänta och försök igen
            if attempt == 3:
                raise
            print(f'  {url}: {e}, försöker igen', file=sys.stderr)
            time.sleep(5 * (attempt + 1))


def cached(name, url, pause):
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / name
    if f.exists():
        return json.loads(f.read_text())
    data = fetch(url)
    f.write_text(json.dumps(data))
    time.sleep(pause)
    return data


def hist_to_astro(y):
    """Historiskt år (negativt = f.Kr., inget år 0) till astronomiskt år."""
    return y + 1 if y < 0 else y


def edtf_year(y):
    return f'-{-y:04d}' if y < 0 else f'{y:04d}'


def fmt_year(y, lang):
    if y <= 0:
        return f'{1 - y} f.Kr.' if lang == 'sv' else f'{1 - y} BCE'
    return str(y)


def slug(text):
    t = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-') or 'plats'


def norm(text):
    t = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9 ]+', ' ', t)


def km(a, b):
    lon1, lat1, lon2, lat2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


# ---------- Platser ----------

def places_from_mapdata(pause):
    """Alla platser: pid, namn, årsspann (historiska år) och datasetets egen punkt."""
    d = cached('mapdata.json', MAPDATA, pause)
    pts, whg = {}, {}
    for f in d['point']['features']:
        g = f['geometry']
        if g['type'] == 'Point':  # datasetets punkt; MultiPoint är WHG:s tillägg ur andra register
            pts[f['properties']['table_id']] = g['coordinates']
        elif g.get('coordinates'):
            whg[f['properties']['table_id']] = g['coordinates'][0]
    out = []
    for f in d['table']['features']:
        p = f['properties']
        out.append({'pid': p['pid'], 'srcId': p['src_id'], 'title': p['title'], 'min': p['min'], 'max': p['max'],
                    'coord': pts.get(p['table_id']), 'whgCoord': whg.get(p['table_id'])})
    return out


def points(feature):
    """(datasetets punkt, WHG:s punkt ur andra register) ur en LPF- eller API-post."""
    g = feature.get('geometry') or {}
    geoms = g.get('geometries') if g.get('type') == 'GeometryCollection' else [g]
    own = next((x['coordinates'] for x in geoms or [] if x.get('type') == 'Point' and x.get('coordinates')), None)
    other = next((x['coordinates'][0] for x in geoms or [] if x.get('type') == 'MultiPoint' and x.get('coordinates')), None)
    return own or other, other if own else None


DESC = re.compile(r'^(.*?)\s*\((-?\d{1,5})\)\s*$')


def events_of(feature, place):
    """Händelser (konflikt, historiskt år) ur en plats beskrivningar; årtal utan beskrivning blir egna."""
    found = []
    for d in feature.get('descriptions') or []:
        m = DESC.match(d.get('value', ''))
        if m:
            found.append((m.group(1).strip(), int(m.group(2))))
    if not found:
        for w in feature.get('whens') or []:
            for ts in w.get('timespans') or []:
                v = (ts.get('start') or {}).get('in') or (ts.get('start') or {}).get('earliest')
                if v is not None and re.fullmatch(r'-?\d{1,5}', str(v)):
                    found.append((None, int(v)))
    return found


def make_event(place, war, hyear, used):
    y = hist_to_astro(hyear)
    lon, lat = place['coord']
    lbl = f'{-hyear}fkr' if hyear < 0 else str(hyear)
    base = f'hced-{slug(place["title"])}-{lbl}'
    eid, n = base, 2
    while eid in used:
        eid, n = f'{base}-{n}', n + 1
    used.add(eid)
    name = place['title']
    if war:
        title_en = f'{name} ({war})'
        sum_sv = (f'Konflikthändelse vid {name} år {fmt_year(y, "sv")} enligt Historical Conflict Event Dataset, '
                  f'som för den till konflikten ”{war}”. Utkast från massimport, inte källkontrollerat.')
        sum_en = (f'Conflict event at {name} in {fmt_year(y, "en")} according to the Historical Conflict Event '
                  f'Dataset, which assigns it to “{war}”. Draft from bulk import, not source-checked.')
    else:
        title_en = name
        sum_sv = (f'Konflikthändelse vid {name} år {fmt_year(y, "sv")} enligt Historical Conflict Event Dataset. '
                  f'Utkast från massimport, inte källkontrollerat.')
        sum_en = (f'Conflict event at {name} in {fmt_year(y, "en")} according to the Historical Conflict Event '
                  f'Dataset. Draft from bulk import, not source-checked.')
    ev = {
        'id': eid, 'category': 'krig', 'icon': 'swords',
        'start': y, 'end': y, 'precision': 9, 'edtf': edtf_year(y),
        'location': {'type': 'Point', 'coordinates': [round(lon, 4), round(lat, 4)]},
        'place': {'en': name},
        'title': {'en': title_en},
        'summary': {'sv': sum_sv, 'en': sum_en},
        'sources': [SOURCE_ID], 'review': 'draft',
        'hced': {'whg': place['pid'], 'srcId': place['srcId'], 'conflict': war, 'year': hyear},
    }
    # Varning till den som källkontrollerar: datasetets punkt ligger långt från WHG:s punkt ur andra register.
    if place.get('whgCoord'):
        d = km(place['coord'], place['whgCoord'])
        if d > FAR_KM:
            ev['hced']['check'] = f'Punkten ligger {d:.0f} km från WHG:s punkt ur andra register {[round(c, 4) for c in place["whgCoord"]]}'
    elif abs(lon) >= 178:
        ev['hced']['check'] = 'Punkten ligger vid datumlinjen, kanske ett fel i datasetet'
    return ev


# ---------- Urval ----------

def select(places, n):
    """Cirka n platser spridda över världsdelar och tidsåldrar, deterministiskt.

    Bara platser med ett enda år, så att varje plats ger ungefär en händelse. Varje cell
    (världsdel × tidsålder) får lika stor kvot; celler med för få platser lämnar över till de andra.
    """
    cells = defaultdict(list)
    for p in places:
        if p['coord'] and p['min'] is not None and p['min'] == p['max'] and p['min'] != 0:
            lon, lat = p['coord']
            cells[(region(lat, lon), era(hist_to_astro(p['min'])))].append(p)
    for c in cells.values():
        c.sort(key=lambda p: p['pid'])
    keys = [(r, e) for r in REGIONS for e in range(len(ERAS)) if cells.get((r, e))]
    take = {k: 0 for k in keys}
    left = n
    while left > 0:
        progress = False
        for k in keys:
            if left and take[k] < len(cells[k]):
                take[k] += 1
                left -= 1
                progress = True
        if not progress:
            break
    chosen = []
    for k in keys:
        c, t = cells[k], take[k]
        chosen += [c[int((i + 0.5) * len(c) / t)] for i in range(t)]  # jämnt utspritt i cellen
    return chosen


# ---------- Dubbletter ----------

def existing_wars():
    ev = json.loads(EVENTS.read_text())['events']
    out = []
    for e in ev:
        # Bara enskilda händelser: ett krig (kind: war) är inte samma sak som ett slag i det.
        if e.get('category') != 'krig' or e.get('kind') == 'war' or e.get('location', {}).get('type') != 'Point':
            continue
        text = ' '.join(norm(v) for f in ('title', 'place') for v in (e.get(f) or {}).values())
        out.append((e, text))
    return out


def match(ev_or_place, start, end, coord, name, wars):
    """Troliga dubbletter: år inom ±1 och (inom DUP_KM km eller platsens namn i titel/plats)."""
    hits = []
    words = [w for w in norm(name.split(',')[0]).split() if len(w) >= 4]
    for e, text in wars:
        if start > e['end'] + 1 or end < e['start'] - 1:
            continue
        d = km(coord, e['location']['coordinates'])
        named = bool(words) and all(re.search(rf'\b{re.escape(w)}s?\b', text) for w in words)
        if d <= DUP_KM or named:
            why = []
            if d <= DUP_KM:
                why.append(f'{d:.0f} km')
            if named:
                why.append('namnet')
            hits.append((e['id'], ', '.join(why)))
    return hits


# ---------- Huvudprogram ----------

def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    g = ap.add_mutually_exclusive_group()
    g.add_argument('--urval', type=int, default=150, help='ungefärligt antal platser i urvalet (standard 150)')
    g.add_argument('--alla', action='store_true', help='gör om alla platser')
    ap.add_argument('--lpf', type=Path, help='nedladdad LPF-fil (GeoJSON) från WHG i stället för API:t')
    ap.add_argument('--ut', type=Path, default=OUT, help=f'utfil (standard {OUT.relative_to(ROOT)})')
    ap.add_argument('--paus', type=float, default=0.5, help='sekunder mellan anrop till WHG (standard 0,5)')
    a = ap.parse_args()

    skipped = Counter()
    feats = {}  # pid -> LPF/API-post
    if a.lpf:
        for f in json.loads(a.lpf.read_text())['features']:
            pr = f.get('properties') or {}
            pid = pr.get('place_id') or pr.get('pid') or f.get('@id') or pr.get('src_id')
            feats[pid] = f
        places = []
        for pid, f in feats.items():
            pr = f.get('properties') or {}
            mm = pr.get('minmax')
            if not mm:  # en LPF-fil utan minmax: ta åren ur beskrivningarna
                ys = [y for _, y in events_of(f, None)]
                mm = [min(ys), max(ys)] if ys else [None, None]
            places.append({'pid': pid, 'srcId': pr.get('src_id'), 'title': pr.get('title'), 'min': mm[0],
                           'max': mm[1], 'coord': points(f)[0], 'whgCoord': points(f)[1]})
    else:
        print('Hämtar platslistan från WHG …', file=sys.stderr)
        places = places_from_mapdata(a.paus)
    total_places = len(places)

    chosen = places if a.alla else select(places, a.urval)
    wars = existing_wars()

    def feature(p):
        if p['pid'] in feats:
            return feats[p['pid']]
        d = cached(f'{p["pid"]}.json', PLACE.format(p['pid']), a.paus)
        return (d.get('features') or [{}])[0]

    # Möjliga dubbletter i hela datasetet, på platsnivå (årsspann och punkt ur platslistan).
    cand = [p for p in places if p['coord'] and p['min'] is not None
            and match(None, hist_to_astro(p['min']), hist_to_astro(p['max']), p['coord'], p['title'], wars)]
    todo = {p['pid']: p for p in chosen + cand}

    used = set(e['id'] for e, _ in wars) | set(e['id'] for e in json.loads(EVENTS.read_text())['events'])
    taken = set(id(p) for p in chosen)
    events, dups = [], []
    print(f'Läser {len(todo)} platser ({len(chosen)} i urvalet, {len(cand)} möjliga dubbletter) …', file=sys.stderr)
    for i, p in enumerate(todo.values(), 1):
        if i % 100 == 0:
            print(f'  {i}/{len(todo)}', file=sys.stderr)
        if not p['coord']:
            skipped['saknar koordinat'] += 1
            continue
        found = events_of(feature(p), p)
        if not found:
            skipped['saknar år'] += 1
            continue
        for war, hy in found:
            if hy == 0:
                skipped['år 0 (finns inte i historisk räkning)'] += 1
                continue
            y = hist_to_astro(hy)
            hits = match(None, y, y, p['coord'], p['title'], wars)
            in_file = id(p) in taken
            if not in_file and not hits:
                continue
            e = make_event(p, war, hy, used)
            if in_file:
                events.append(e)
            for eid, why in hits:
                dups.append({'utkast': e['id'] if in_file else None, 'plats': p['title'], 'konflikt': war,
                             'år': y, 'whg': p['pid'], 'finns': eid, 'skäl': why})

    events.sort(key=lambda e: (e['start'], e['id']))
    dups.sort(key=lambda d: (d['år'], d['finns']))
    per_region = Counter(region(e['location']['coordinates'][1], e['location']['coordinates'][0]) for e in events)
    per_era = Counter(ERAS[era(e['start'])][0] for e in events)

    doc = {
        'schema': 'historia-globen/events@1',
        'notes': ('Utkast från Historical Conflict Event Dataset via World Historical Gazetteer (dataset 1415, CC0 1.0), '
                  'byggda med tools/hced.py. Appen läser inte den här filen. Ett utkast flyttas till data/events.json '
                  'först när källsidan är öppnad och årtal och plats stämmer (se docs/kallor.md). '
                  'start/end = astronomiska år; WHG:s negativa år (historisk räkning, "-0585" = 585 f.Kr.) är omräknade '
                  'till 1 - N. Titeln är platsens namn och konflikten enligt källan, på engelska. '
                  'hced = spårbarhet: WHG:s plats-id, källans id, konflikten och året som det står i källan; hced.check = varning '
                  f'när datasetets punkt ligger mer än {FAR_KM} km från WHG:s punkt ur andra register (kontrollera platsen). '
                  'duplicates = utkast eller platser som troligen redan finns i events.json (år ±1 och inom '
                  f'{DUP_KM} km eller samma namn); utkast: null betyder att platsen inte är med i urvalet.'),
        'generated': {'date': time.strftime('%Y-%m-%d'), 'mode': 'alla' if a.alla else f'urval {a.urval}',
                      'places': total_places, 'placesRead': len(chosen), 'events': len(events),
                      'skipped': dict(skipped), 'perRegion': dict(per_region), 'perEra': dict(per_era)},
        'duplicates': dups,
        'events': events,
    }
    a.ut.parent.mkdir(parents=True, exist_ok=True)
    body = ',\n'.join('    ' + json.dumps(e, ensure_ascii=False) for e in events)
    head = {k: v for k, v in doc.items() if k != 'events'}
    text = json.dumps(head, ensure_ascii=False, indent=2)[:-2] + ',\n  "events": [\n' + body + '\n  ]\n}\n'
    a.ut.write_text(text)

    print(f'Platser i datasetet: {total_places}. Lästa: {len(chosen)}. Utkast: {len(events)}.')
    print('Överhoppade:', dict(skipped) or 'inga')
    print('Per världsdel:', dict(per_region))
    print('Per tidsålder:', dict(per_era))
    print(f'Troliga dubbletter mot events.json ({len(dups)}):')
    for d in dups:
        print(f'  {d["utkast"] or "(ej i urvalet)"}: {d["plats"]} {fmt_year(d["år"], "sv")} ({d["konflikt"]}) '
              f'~ {d["finns"]} [{d["skäl"]}]')
    print(f'Skrev {a.ut.relative_to(ROOT) if a.ut.is_relative_to(ROOT) else a.ut} ({a.ut.stat().st_size // 1024} kB)')


if __name__ == '__main__':
    main()
