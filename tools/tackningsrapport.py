#!/usr/bin/env python3
"""Skapa täckningsrapporten för Historia-globens händelser (#484).

Rapporten är ett arbetsunderlag, inte ett lager på sidan. Den räknar varje
händelse efter dess startår, den punkt som visas på globen och dess kategori.
Världsdelarnas namn och gränser följer ``region()`` i ``js/model.js``.

  python3 tools/tackningsrapport.py          skriver docs/tackningsrapport.md
  python3 tools/tackningsrapport.py --check  kontrollerar att rapporten är aktuell
"""
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path


REGIONS = ['Europa', 'Asien', 'Afrika', 'Amerika', 'Oceanien']


# Västra Anatoliens kust som (lat, lon) från Dardanellerna till Knidos, samma som AEGEAN_COAST i js/model.js (#1334)
AEGEAN_COAST = [(40.45, 26.75), (40.0, 26.2), (39.5, 26.05), (39.4, 26.62), (39.0, 26.75), (38.7, 26.7),
                (38.45, 26.4), (38.3, 26.25), (38.0, 26.9), (37.75, 27.1), (37.6, 27.05), (37.4, 27.15), (37.0, 27.2),
                (36.95, 27.38), (36.6, 27.6)]


def aegean_coast_lon(lat):
    for i in range(1, len(AEGEAN_COAST)):
        a, x = AEGEAN_COAST[i - 1]
        b, y = AEGEAN_COAST[i]
        if lat >= b:
            return y + (lat - b) / (a - b) * (x - y)
    return AEGEAN_COAST[-1][1]


# Stora Kaukasus huvudkam (vattendelaren) som (lat, lon), samma som CAUCASUS_CREST i js/model.js (#2010)
CAUCASUS_CREST = [(44.89, 37.32), (43.94, 39.9), (43.24, 41.73), (43.36, 42.44), (43.01, 43.17),
                  (42.7, 44.52), (42.57, 45.32), (41.22, 47.86), (41.02, 48.3), (40.46, 49.96)]


def caucasus_crest_lat(lon):
    for i in range(1, len(CAUCASUS_CREST)):
        a, x = CAUCASUS_CREST[i - 1]
        b, y = CAUCASUS_CREST[i]
        if lon <= y:
            return a + (lon - x) / (y - x) * (b - a)
    return CAUCASUS_CREST[-1][0]


def north_of_caucasus(lat, lon):
    """Norr om Kaukasus huvudkam (#2010); öster om kammens slut som förut söder om 44,5° N i Asien."""
    if CAUCASUS_CREST[0][1] <= lon <= CAUCASUS_CREST[-1][1]:
        return lat >= caucasus_crest_lat(lon)
    return not (lon > 40 and lat < 44.5)


def region(lat, lon):
    """Samma grova världsindelning som js/model.js:region()."""
    if lat > 50 and (lon < -168 or lon > 160):
        return 'Asien'
    if lon < -125 and lat < 35:
        return 'Oceanien'
    if lon < -105 and lat < -10:  # östra Polynesien med Rapa Nui (#630)
        return 'Oceanien'
    if -32 <= lon < -20:  # Azorerna (Europa) och Kap Verde (Afrika) (#1334)
        if 36 < lat < 40.5:
            return 'Europa'
        if 13 < lat < 18:
            return 'Afrika'
    if lon < -25:
        return 'Amerika'
    if lon < -10 and lat >= 68:  # Grönlands östkust, norr om Island (#1135)
        return 'Amerika'
    # Mikronesien öster om 130° Ö och söder om 22° N (#630)
    if (lat < -10 and lon > 110) or (lat < 22 and lon > 130) or lon > 160:
        return 'Oceanien'
    if lon < -1.5:
        africa_north = lat < 36
    elif lon <= 11.5:
        africa_north = lat < 37.5
    elif lon <= 32.5:
        africa_north = lat < 33.5
    else:
        africa_north = (lat < 31.5 and lon < 32.5 + (30 - lat) * 0.62) or lat < 12  # Somalia (#1334)
    africa = lon >= -20 and lon < 52 and lat > -36 and africa_north
    if africa:
        return 'Afrika'
    if 52 <= lon < 64 and -22 < lat < -3:  # Maskarenerna och Seychellerna (#1334)
        return 'Afrika'
    if 36.6 <= lat <= 40.45 and lon < 28.9 and lon > aegean_coast_lon(lat):  # västra Anatolien (#1334)
        return 'Asien'
    if lat >= 35 and (lon < 28.9 or (lat >= 41 and lon < 60 and north_of_caucasus(lat, lon))):
        return 'Europa'
    return 'Asien'


def century(year):
    """Första astronomiska året i det historiska århundrade som ``year`` tillhör."""
    if year >= 1:
        return ((year - 1) // 100) * 100 + 1
    return -((-year // 100) * 100 + 99)


def century_label(start):
    end = start + 99
    if start >= 1:
        return f'{start}–{end} e.Kr.'
    return f'{1 - start}–{1 - end} f.Kr.'


def report(events):
    by_century = defaultdict(Counter)
    by_region = Counter()
    by_category = Counter()
    missing_point = []

    for event in events:
        location = event.get('location', {})
        coordinates = location.get('coordinates') if location.get('type') == 'Point' else None
        if not isinstance(coordinates, list) or len(coordinates) < 2:
            missing_point.append(event['id'])
            continue
        lon, lat = coordinates[:2]
        place_region = region(lat, lon)
        by_century[century(event['start'])][place_region] += 1
        by_region[place_region] += 1
        by_category[event['category']] += 1

    lines = [
        '# Täckningsrapport',
        '',
        '> Genererad av `python3 tools/tackningsrapport.py` ur `data/events.json`. Ändra inte för hand.',
        '',
        '## Vad rapporten räknar',
        '',
        'Varje händelse räknas en gång, efter sitt `start`-år och den punkt som visas på globen. En lång händelse räknas alltså inte om för varje år den pågår. Världsdelarna följer den grova indelningen i `region()` i `js/model.js`; de är avsedda för översikt, inte geografisk precision.',
        '',
        f'**Händelser med punkt:** {sum(by_region.values())} av {len(events)}.',
    ]
    if missing_point:
        lines += ['', f'**Saknar användbar punkt:** {len(missing_point)} (`{", ".join(sorted(missing_point))}`).']

    lines += [
        '',
        '## Händelser per världsdel',
        '',
        '| Världsdel | Händelser |',
        '| --- | ---: |',
    ]
    lines += [f'| {name} | {by_region[name]} |' for name in REGIONS]

    lines += [
        '',
        '## Händelser per kategori',
        '',
        '| Kategori | Händelser |',
        '| --- | ---: |',
    ]
    lines += [f'| {name} | {count} |' for name, count in sorted(by_category.items())]

    lines += [
        '',
        '## Händelser per århundrade och världsdel',
        '',
        '| Århundrade | Europa | Asien | Afrika | Amerika | Oceanien | Summa |',
        '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ]
    for start in sorted(by_century):
        counts = by_century[start]
        values = [counts[name] for name in REGIONS]
        lines.append(f'| {century_label(start)} | ' + ' | '.join(map(str, values)) + f' | {sum(values)} |')

    return '\n'.join(lines) + '\n'


def main():
    root = Path(__file__).resolve().parent.parent
    events = json.loads((root / 'data/events.json').read_text(encoding='utf-8'))['events']
    output = root / 'docs/tackningsrapport.md'
    text = report(events)
    if '--check' in sys.argv[1:]:
        if not output.is_file() or output.read_text(encoding='utf-8') != text:
            print('tackningsrapport: docs/tackningsrapport.md stämmer inte med data/events.json', file=sys.stderr)
            sys.exit(1)
        return
    output.write_text(text, encoding='utf-8')
    print(f'{output.relative_to(root)}: {len(events)} händelser')


if __name__ == '__main__':
    main()
