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


def region(lat, lon):
    """Samma grova världsindelning som js/model.js:region()."""
    if lat > 50 and (lon < -168 or lon > 160):
        return 'Asien'
    if lon < -125 and lat < 35:
        return 'Oceanien'
    if lon < -25:
        return 'Amerika'
    if (lat < -10 and lon > 110) or (lat < 0 and lon > 130) or lon > 160:
        return 'Oceanien'
    if lon < -1.5:
        africa_north = lat < 36
    elif lon <= 11.5:
        africa_north = lat < 37.5
    elif lon <= 32.5:
        africa_north = lat < 33.5
    else:
        africa_north = lat < 31.5 and lon < 32.5 + (30 - lat) * 0.62
    africa = lon >= -20 and lon < 52 and lat > -36 and africa_north
    if africa:
        return 'Afrika'
    if lat >= 35 and (lon < 28.9 or (lat >= 41 and lon < 60 and not (lon > 40 and lat < 44.5))):
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
