#!/usr/bin/env python3
"""Skriver färdiga bildpromptar för händelser utan riktig bild (#129).

Väljer bildstil efter händelsens år och plats ur data/styles.json, på samma sätt
som styleFor() i js/model.js, och bygger en prompt av stilens beskrivning,
händelsens titel och plats och fasta regler. Resultatet skrivs till
docs/bildpromptar.md, med en rubrik per händelse.

Kör från projektets rot:
    python3 tools/bildpromptar.py                      alla händelser utan riktig bild
    python3 tools/bildpromptar.py cheopspyramiden ...  bara de angivna händelserna
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXED = ('historical illustration, not a photograph, does not look like a real historical document, '
         'no text, no letters, no watermark, no gore, highly detailed, rich texture, 4:3 landscape format')
RESPECT = ('Respect: never depict the Prophet Muhammad; no caricatures of peoples; no bloody war scenes; '
           'no close-up faces of real people; convey mood and setting rather than invented details.')
# Extra regler för enskilda händelser, utöver de allmänna
EXTRA = {
    'hijra': 'Show only landscape, a caravan seen from a distance and architecture. No depiction of the Prophet Muhammad or other identifiable people.',
}


def style_for(e, doc):
    year = e['start']
    lon, lat = e['location']['coordinates']
    in_time = lambda s: s['from'] <= year <= s['to']
    in_region = lambda rid: any(w <= lon <= ea and so <= lat <= n for w, so, ea, n in doc['regions'].get(rid, {}).get('bbox', []))
    base = next((s for s in doc['styles'] if not s['regions'] and in_time(s)), doc['styles'][0])
    regional = next((s for s in doc['styles'] if s['regions'] and in_time(s) and any(in_region(r) for r in s['regions'])), None)
    style = regional or base
    return style, base, (style.get('variants') or {}).get(e['category'])


def year_text(y):
    return f'{1 - y} BCE' if y <= 0 else f'{y} CE'


def prompt_for(e, doc):
    style, base, variant = style_for(e, doc)
    title = e['title'].get('en') or e['title']['sv']
    place = e['place'].get('en') or e['place']['sv']
    parts = [
        f"Style: {variant['prompt'] if variant else style['prompt']}.",
        f"Subject: {title} — {place}, {year_text(e['start'])}.",
        FIXED + '.',
        RESPECT,
    ]
    if e['id'] in EXTRA:
        parts.append(EXTRA[e['id']])
    return style, variant, ' '.join(parts)


def main():
    events = json.loads((ROOT / 'data/events.json').read_text())['events']
    doc = json.loads((ROOT / 'data/styles.json').read_text())
    only = set(sys.argv[1:])
    rows = []
    for e in events:
        if only and e['id'] not in only:
            continue
        img = e.get('image') or {}
        if not only and img.get('kind') == 'historisk':
            continue  # riktig bild finns redan
        if not only and img and not img.get('placeholder'):
            continue  # illustrationen är redan klar
        style, variant, prompt = prompt_for(e, doc)
        rows.append((e, style, variant, prompt))
    out = ['# Bildpromptar', '',
           'Skapade av `tools/bildpromptar.py` (#129). Kopiera prompten till ett bildverktyg och lägg bilden i',
           '`images/incoming/<händelse-id>.png` (eller .jpg/.webp). Spara verktyg och datum, så fyller Claude i `image` i events.json.',
           'Sök alltid efter en riktig public domain-bild på Wikimedia Commons först.', '']
    for e, style, variant, prompt in rows:
        title = e['title']['sv']
        name = variant['name']['sv'] if variant else style['name']['sv']
        out += [f"## {title} (`{e['id']}`)", '',
                f"- År: {year_text(e['start'])} · plats: {e['place']['sv']}",
                f"- Stil: {name} (`{variant['id'] if variant else style['id']}`)",
                f"- Fil: `images/events/{e['id']}.webp`", '',
                '```text', prompt, '```', '']
    (ROOT / 'docs/bildpromptar.md').write_text('\n'.join(out))
    print(f'{len(rows)} promptar skrivna till docs/bildpromptar.md')


if __name__ == '__main__':
    main()
