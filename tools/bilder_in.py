#!/usr/bin/env python3
"""Tar emot bilder från images/incoming/ och gör dem klara för globen (#129).

Varje fil ska heta som händelsens id, till exempel images/incoming/columbus.png.
Bilden beskärs till 4:3, skalas till 800 × 600 pixlar och sparas som
images/events/<id>.webp, helst under 150 kB.

Finns bildloggen images/incoming/bildlogg.json (en lista med id, kind, style,
caption, credit och prompt per bild) fylls fältet image i för de bilder som
konverterades, i händelsens redigeringsfil data/handelser/<period>.json (#394). Kör sedan
python3 tools/dela_data.py, som bygger data/events.json och data/genererat/. En platshållare ersätts. Illustrationer får licensen
CC BY 4.0, som övrig data. Bilder som inte finns i loggen får image ifyllt för hand.

Kör från projektets rot:
    python3 tools/bilder_in.py
Kräver Pillow (pip install pillow).
"""
import json
import re
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
W, H, MAX_BYTES = 800, 600, 150_000

# Bildloggens stilnamn -> stil (och variant) i data/styles.json
STYLE_ALIAS = {
    'kina': ('kina-tusch', None), 'osmansk': ('miniatyr', None), 'aztekisk': ('aztekisk-kodex', None),
    'anderna': ('inka', None), 'portolan': ('renassans', 'portolan'), 'modern': ('rymdalder', None),
    'dokumentar': ('rymdalder', 'dokumentar'),
}


def convert(src: Path, dst: Path):
    img = Image.open(src).convert('RGB')
    # Beskär till 4:3 runt mitten och skala ner
    r = img.width / img.height
    if r > W / H:
        nw = round(img.height * W / H)
        img = img.crop(((img.width - nw) // 2, 0, (img.width + nw) // 2, img.height))
    else:
        nh = round(img.width * H / W)
        img = img.crop((0, (img.height - nh) // 2, img.width, (img.height + nh) // 2))
    img = img.resize((W, H), Image.LANCZOS)
    for q in (82, 75, 68, 60, 52):
        img.save(dst, 'WEBP', quality=q, method=6)
        if dst.stat().st_size <= MAX_BYTES:
            return dst.stat().st_size
    # Fina linjer (till exempel kopparstick) blir stora: mjuka upp bilden lite och försök igen
    soft = img.filter(ImageFilter.GaussianBlur(0.5))
    for q in (60, 52, 45, 40):
        soft.save(dst, 'WEBP', quality=q, method=6)
        if dst.stat().st_size <= MAX_BYTES:
            break
    return dst.stat().st_size


def image_field(entry, styles):
    style, variant = STYLE_ALIAS.get(entry['style'], (entry['style'], None))
    if style not in styles:
        raise SystemExit(f"Okänd stil i bildloggen: {entry['style']} ({entry['id']})")
    img = {'file': f"images/events/{entry['id']}.webp", 'kind': entry.get('kind', 'illustration'), 'style': style}
    if variant:
        img['variant'] = variant
    img['caption'] = entry['caption']
    img['credit'] = entry['credit']
    img['license'] = entry.get('license', 'CC BY 4.0')
    for k in ('source', 'prompt'):
        if entry.get(k):
            img[k] = entry[k]
    return img


DECODER = json.JSONDecoder()


def _skip_ws(text, i):
    while i < len(text) and text[i] in ' \t\r\n':
        i += 1
    return i


def find_event(raw, eid):
    """Hittar händelsen med id:t eid i en redigeringsfil: (start, slut) för dess objekt i texten, eller None.

    Filen läses som JSON (raw_decode) och inte med regex eller klammerräkning, så strängar med
    klamrar och citattecken, och objekt inom objekt, spelar ingen roll, oavsett indentering (#2038).
    """
    i = raw.index('"events"')
    i = _skip_ws(raw, raw.index(':', i) + 1)
    if raw[i] != '[':
        return None
    i = _skip_ws(raw, i + 1)
    while i < len(raw) and raw[i] != ']':
        obj, j = DECODER.raw_decode(raw, i)
        if isinstance(obj, dict) and obj.get('id') == eid:
            return i, j
        i = _skip_ws(raw, j)
        if raw[i] == ',':
            i = _skip_ws(raw, i + 1)
    return None


def members(block):
    """Objektets egna fält som (nyckel, nyckelns start, värdets start, värdets slut) i texten."""
    out = []
    i = _skip_ws(block, 1)
    while block[i] != '}':
        key, j = DECODER.raw_decode(block, i)
        v = _skip_ws(block, block.index(':', j) + 1)
        _, e = DECODER.raw_decode(block, v)
        out.append((key, i, v, e))
        i = _skip_ws(block, e)
        if block[i] == ',':
            i = _skip_ws(block, i + 1)
    return out


def line_indent(block, pos):
    """Radens indrag före pos om bara blanktecken står före pos på raden, annars None."""
    k = block.rfind('\n', 0, pos) + 1
    pre = block[k:pos]
    return pre if pre.strip() == '' and k > 0 else None


def render_image(block, mem, image, indent):
    """Bildobjektet som text i samma stil som händelsen: radbrutet med filens indrag om
    händelsens egna objekt (till exempel place) är radbrutna, annars på en rad."""
    nl = '\r\n' if '\r\n' in block else '\n'
    for _, ks, vs, ve in mem:
        text = block[vs:ve]
        if text.startswith('{') and '\n' in text:
            inner = re.match(r'\{\r?\n([ \t]*)', text).group(1)
            unit = inner[len(line_indent(block, ks) or ''):] or ' '
            return json.dumps(image, ensure_ascii=False, indent=unit).replace('\n', nl + indent)
    return json.dumps(image, ensure_ascii=False, separators=(', ', ': '))


def put_image(block, image):
    """Lägger in eller byter "image" i en händelses text (objektet från "{" till "}"), utan att formatera om något annat.

    Tre fall (#1288, #2038):
    1. händelsen har redan en "image": värdet byts ut;
    2. annars läggs "image" in före händelsens "wikidata" eller "sources" (det av dem som kommer först):
       som egen rad med samma indrag om fältet står på egen rad, annars på samma rad före fältet;
    3. finns varken "wikidata" eller "sources": None, och image måste fyllas i för hand.
    Fälten läses som JSON, så indrag och radbrytningar kan vara vilka som helst.
    """
    mem = members(block)
    keys = [m[0] for m in mem]
    if keys.count('image') > 1:
        return None
    for key, ks, vs, ve in mem:
        if key == 'image':
            ind = line_indent(block, ks) or ''
            others = [m for m in mem if m[0] != 'image']
            return block[:vs] + render_image(block, others, image, ind) + block[ve:]
    anchor = next((m for m in mem if m[0] in ('wikidata', 'sources')), None)
    if anchor is None:
        return None
    ks = anchor[1]
    ind = line_indent(block, ks)
    if ind is not None:
        return block[:ks] + '"image": ' + render_image(block, mem, image, ind) + (',\r\n' if '\r\n' in block else ',\n') + ind + block[ks:]
    return block[:ks] + '"image": ' + render_image(block, mem, image, '') + ', ' + block[ks:]


def fill_events(ids, log):
    """Lägger in eller byter "image" i varje händelse i redigeringsfilerna, utan att formatera om dem."""
    files = sorted((ROOT / 'data/handelser').glob('*.json'))
    # Läsning och skrivning som bytes bevarar radslut och teckenkodning
    raws = {f: f.read_bytes().decode('utf-8') for f in files}
    styles = {s['id'] for s in json.loads((ROOT / 'data/styles.json').read_text())['styles']}
    by_id = {e['id']: e for e in log}
    for eid in ids:
        if eid not in by_id:
            print(f'  {eid}: finns inte i bildloggen, fyll i image för hand')
            continue
        image = image_field(by_id[eid], styles)
        found = [(f, span) for f, raw in raws.items() for span in [find_event(raw, eid)] if span]
        if not found:
            print(f'  {eid}: ingen händelse med det id:t i data/handelser/')
            continue
        f, (start, end) = found[0]
        raw = raws[f]
        new_block = put_image(raw[start:end], image)
        if new_block is None:
            print(f'  {eid}: hittar inte var image ska stå i {f.relative_to(ROOT)}, fyll i image för hand')
            continue
        raws[f] = raw[:start] + new_block + raw[end:]
        print(f'  {eid}: image ifylld i {f.relative_to(ROOT)}')
    for f, raw in raws.items():
        json.loads(raw)  # kontrollera att filen fortfarande är giltig JSON
        data = raw.encode('utf-8')
        if data != f.read_bytes():
            f.write_bytes(data)
    print('Kör python3 tools/dela_data.py så att data/events.json och data/genererat/ byggs om.')


def main():
    incoming = ROOT / 'images/incoming'
    out = ROOT / 'images/events'
    out.mkdir(parents=True, exist_ok=True)
    files = [p for p in sorted(incoming.iterdir()) if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')]
    if not files:
        print('Inga bilder i images/incoming/')
    for p in files:
        size = convert(p, out / f'{p.stem}.webp')
        print(f'{p.name} -> images/events/{p.stem}.webp ({size // 1000} kB)')
    log_path = incoming / 'bildlogg.json'
    if files and log_path.exists():
        fill_events([p.stem for p in files], json.loads(log_path.read_text()))


if __name__ == '__main__':
    main()
