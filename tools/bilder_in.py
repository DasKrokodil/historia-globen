#!/usr/bin/env python3
"""Tar emot bilder från images/incoming/ och gör dem klara för globen (#129).

Varje fil ska heta som händelsens id, till exempel images/incoming/columbus.png.
Bilden beskärs till 4:3, skalas till 800 × 600 pixlar och sparas som
images/events/<id>.webp, helst under 150 kB. Fältet image i data/events.json
fylls sedan i för hand (eller av Claude), med verktyg, datum och prompt.

Kör från projektets rot:
    python3 tools/bilder_in.py
Kräver Pillow (pip install pillow).
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
W, H, MAX_BYTES = 800, 600, 150_000


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
            break
    return dst.stat().st_size


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


if __name__ == '__main__':
    main()
