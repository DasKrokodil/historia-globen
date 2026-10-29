#!/usr/bin/env python3
"""Tar emot bilder från images/incoming/ och gör dem klara för globen (#129).

Varje fil ska heta som händelsens id, till exempel images/incoming/columbus.png.
Bilden beskärs till 4:3, skalas till 800 × 600 pixlar och sparas som
images/events/<id>.webp, helst under 150 kB.

Finns bildloggen images/incoming/bildlogg.json (en lista med id, kind, style,
caption, credit och prompt per bild) fylls fältet image i data/events.json i för
de bilder som konverterades. En platshållare ersätts. Illustrationer får licensen
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


def fill_events(ids, log):
    """Lägger in eller byter raden "image" i varje händelse, utan att formatera om filen."""
    path = ROOT / 'data/events.json'
    raw = path.read_text()
    styles = {s['id'] for s in json.loads((ROOT / 'data/styles.json').read_text())['styles']}
    by_id = {e['id']: e for e in log}
    for eid in ids:
        if eid not in by_id:
            print(f'  {eid}: finns inte i bildloggen, fyll i image för hand')
            continue
        line = '      "image": ' + json.dumps(image_field(by_id[eid], styles), ensure_ascii=False, separators=(', ', ': ')) + ',\n'
        start = raw.find(f'{{ "id": "{eid}"')
        if start < 0:
            print(f'  {eid}: ingen händelse med det id:t')
            continue
        end = raw.find('\n\n', start)
        end = len(raw) if end < 0 else end
        block = raw[start:end]
        if '\n      "image": ' in block:
            block = re.sub(r'\n      "image": .*\n', '\n' + line, block, count=1)
        else:
            m = re.search(r'\n(      "(wikidata|sources)": )', block)
            block = block[:m.start() + 1] + line + block[m.start() + 1:]
        raw = raw[:start] + block + raw[end:]
        print(f'  {eid}: image ifylld')
    json.loads(raw)  # kontrollera att filen fortfarande är giltig JSON
    path.write_text(raw)


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
