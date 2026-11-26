#!/usr/bin/env python3
"""Skriver färdiga bildpromptar för händelser utan riktig bild (#129).

Väljer bildstil efter händelsens år och plats ur data/styles.json, på samma sätt
som styleFor() i js/model.js, och bygger en prompt av stilens beskrivning,
händelsens titel och plats och fasta regler. Resultatet skrivs till
docs/bildpromptar.md, med en rubrik per händelse.

Kör från projektets rot:
    python3 tools/bildpromptar.py                      alla händelser utan riktig bild
    python3 tools/bildpromptar.py cheopspyramiden ...  bara de angivna händelserna
    python3 tools/bildpromptar.py --out docs/x.md id ... skriv till en annan fil

Prompten innehåller också händelsens sammanfattning (fältet summary, som har källa) som
beskrivning av vad bilden ska visa, så att bildverktyget inte hittar på motivet.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXED = ('historical illustration, not a photograph, does not look like a real historical document, '
         'no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format')
RESPECT = 'Respect: no caricatures of peoples; convey mood and setting rather than invented details.'
RESPECT_MUHAMMAD = 'Never depict the Prophet Muhammad.'  # bara för händelser från år 500 och senare
# Människoarter och fynd av dem (#1105): händelser i kategorin manniskan från 10 000 f.Kr. eller tidigare vars
# sammanfattning eller titel nämner en människoart. Härleds ur data, så att nya fynd får regeln utan att listan underhålls.
SPECIES_RE = re.compile(r'Neanderthal|Denisovan|\bHomo\b|hominin|archaic human|early modern human', re.I)


def is_human_species(e):
    text = (e['title'].get('en') or '') + ' ' + (e['summary'].get('en') or '')
    return e['category'] == 'manniskan' and e['start'] <= -10000 and bool(SPECIES_RE.search(text))


HUMAN_SPECIES_RULE = (
    'Illustration, interpretation, not a historical image. Do not depict people or make facial '
    'reconstructions; show landscape, animals, objects or the find site instead.'
)
# Händelser före cirka 3000 f.Kr. (stilen grotta) vars sammanfattning handlar om hällkonst: bilden får visa platsen,
# inte återge eller efterlikna själva konstverken, så att den inte kan tas för äkta hällkonst (#1553)
ROCK_ART_RE = re.compile(r'rock art|cave paint|rock paint|rock carving|petroglyph|paint|hand stencil|engravings', re.I)
ROCK_ART_RULE = (
    'The event is about rock art: show the site and its landscape only. Do not reproduce, copy or imitate the '
    'artworks, so that the image cannot be mistaken for real rock art.'
)
# Extra regler för enskilda händelser, utöver de allmänna
EXTRA = {
    'hijra': 'Show only landscape, a caravan seen from a distance and architecture. No depiction of the Prophet Muhammad or other identifiable people.',
    # Omtag (#2156): den första bilden gav köpmansstaden kupoler och minareter och kungens stad en kupollös borg. Enligt al-Bakris
    # beskrivning (citerad i en.wikipedia "Koumbi Saleh") var husen av sten och akaciaträ och kupolerna fanns i kungens stad.
    'al-bakri-beskriver-ghana': (
        "Follow al-Bakri's description as quoted in the source: the houses are of stone and acacia wood. The domes belong to "
        "the king's town: the king's palace and domed dwellings inside an enclosure like a city wall, with domed buildings, "
        "groves and thickets around the town. Do not show minarets or towers anywhere, and do not put domes on the merchants' "
        "town. Show a single scene of the two towns on the plain, with no inset pictures."
    ),
}


def style_for(e, doc):
    year = e['start']
    lon, lat = e['location']['coordinates']
    in_time = lambda s: s['from'] <= year <= s['to']
    in_region = lambda rid: any(w <= lon <= ea and so <= lat <= n for w, so, ea, n in doc['regions'].get(rid, {}).get('bbox', []))
    base = next((s for s in doc['styles'] if not s['regions'] and in_time(s)), doc['styles'][0])
    regional = next((s for s in doc['styles'] if s['regions'] and in_time(s) and e['id'] not in s.get('exceptIds', []) and any(in_region(r) for r in s['regions'])), None)
    style = regional or base
    return style, base, (style.get('variants') or {}).get(e['category'])


def year_text(y):
    return f'{1 - y} BCE' if y <= 0 else f'{y} CE'


def prompt_for(e, doc):
    style, base, variant = style_for(e, doc)
    title = e['title'].get('en') or e['title']['sv']
    place = e['place'].get('en') or e['place']['sv']
    style_prompt = variant['prompt'] if variant else style['prompt']
    parts = [
        f"Style: {style_prompt}.",
        f"Subject: {title} — {place}, {year_text(e['start'])}.",
        f"What happened (show only this, do not add details): {e['summary'].get('en') or e['summary']['sv']}",
        FIXED + '.',
        (RESPECT_MUHAMMAD + ' ' + RESPECT) if e['start'] >= 500 else RESPECT,
    ]
    if is_human_species(e):
        parts.append(HUMAN_SPECIES_RULE)
    if style['id'] == 'grotta' and ROCK_ART_RE.search(e['summary'].get('en') or e['summary']['sv']):
        parts.append(ROCK_ART_RULE)
    if e['id'] in EXTRA:
        parts.append(EXTRA[e['id']])
    return style, variant, ' '.join(parts)


def main():
    events = json.loads((ROOT / 'data/events.json').read_text())['events']
    doc = json.loads((ROOT / 'data/styles.json').read_text())
    args = sys.argv[1:]
    out_path = ROOT / 'docs/bildpromptar.md'
    if args[:1] == ['--out']:
        out_path, args = ROOT / args[1], args[2:]
    only = set(args)
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
           '`images/incoming/<händelse-id>.jpg` (eller .png/.webp). Spara verktyg och datum, så fyller Claude i `image` i händelsens fil i data/handelser/.',
           'Sök alltid efter en riktig public domain-bild på Wikimedia Commons först.', '',
           '## Människoarter (#1105)', '',
           'Gäller bilder av människoarter och fynd av dem, inte all förhistoria, enligt '
           '[docs/beslut/2026-11-14-rekonstruktioner-av-manniskoarter.md](beslut/2026-11-14-rekonstruktioner-av-manniskoarter.md).', '',
           '- **Riktig bild först:** fossil, fyndplatser, verktyg och andra fynd från Wikimedia Commons med tillåten licens '
           '(public domain, CC0, CC BY, CC BY-SA). Annars landskap, djur eller föremål, där människoarten inte visas i närbild.',
           '- **Inga ansiktsrekonstruktioner som standard**, varken egna illustrationer eller foton av museirekonstruktioner. '
           'Ett undantag kräver DasKrokodils ja.',
           '- **Bildtexten** på en illustration börjar med "Illustration, tolkning, inte en historisk bild" '
           '(en: "Illustration, interpretation, not a historical image"; de: "Illustration, Deutung, kein historisches Bild"; '
           'es: "Ilustración, interpretación, no una imagen histórica"; fr: "Illustration, interprétation, pas une image historique"). '
           'Stil, verktyg, datum och exakt prompt sparas i `image`.',
           '- **Prompten får inte innehålla** hudfärg, hår, kroppsbehåring, ansiktsdrag, kroppsbyggnad, hållning, kläder, smycken '
           'eller beteende som händelsens källa inte stöder. Står det inte i källan, står det inte i prompten. '
           'Är fyndet en avgjutning eller kopia säger bildtexten det.',
           '- **Inga stereotyper:** inga "grottmänniskor", inga apmänniskor, ingen hopsjunken hållning som tecken på en '
           '"primitiv" art och ingen marschrad av arter mot nutidsmänniskan.',
           '- **Granskning:** `forhistoriker` granskar motiv, bildtext och prompt innan bilden läggs in.',
           '- Stilen `grotta` för händelser före cirka 3000 f.Kr. i `data/styles.json` är en modern, tydligt tecknad '
           'illustration av landskap och föremål, utan människor eller ansikten och utan grottmålning eller hällkonst som '
           'kan tas för ett verkligt fynd (#1553). För en människoart gäller dessutom reglerna ovan.', '']
    for e, style, variant, prompt in rows:
        title = e['title']['sv']
        name = variant['name']['sv'] if variant else style['name']['sv']
        out += [f"## {title} (`{e['id']}`)", '',
                f"- År: {year_text(e['start'])} · plats: {e['place']['sv']}",
                f"- Stil: {name} (`{variant['id'] if variant else style['id']}`)",
                f"- Spara som: `images/incoming/{e['id']}.jpg`", '',
                '```text', prompt, '```', '']
    out_path.write_text('\n'.join(out))
    print(f'{len(rows)} promptar skrivna till {out_path.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
