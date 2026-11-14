#!/usr/bin/env python3
"""Gör bilderna till bildlagret "Istidens kust" (#1096) ur Wilmes m.fl. (Zenodo 8147509, CC BY 4.0).

Källan är rutnäten för serien Gowan (PaleoMIST 1.0) i datamängden "Late Pleistocene evolution of tides and
tidal dissipation: tidal simulations" (https://zenodo.org/records/8147509). Varje fil
grid_gowan_glacial_1_8_<N>kyrBP_flon har vattendjup (hz) och en mask för land och hav (mz: 1 = hav, 0 = inte hav)
på ett rutnät om 1/8 grad, 2880 × 1400 punkter, −85,9375 till 88,9375 grader latitud. Filerna är binära i
big-endian och läses som datamängdens egen grd_in.m (Fortran-poster: n, m, latituder, longituder, dt, nob,
sedan hz som float och mz som long).

Bilden visar bara skillnaden mot i dag i samma modell: ytor som är hav i steget 0 år sedan men inte var hav i
det valda steget. De fylls med en ljusare landton med glesa snedstreck (tolkning, beslutet 2026-11-13 om
osäkerhetens språk), och den modellerade kusten ritas som en mörk linje. Allt annat är genomskinligt, så att
grundkartans nutida land syns under. Bilden är ekvirektangulär 4096 × 2048 (−180…180, 90…−90), som
lagerbilden (beslut 1), och sparas som WebP med alfakanal i images/lager/.

Kör från projektets rot:
    python3 tools/istidens_kust.py --grids <katalog> [--steps 10 15 20 30 40 50 60 70 80]
Saknas en fil i <katalog> hämtas den från Zenodo (cirka 32 MB per steg) och kontrolleras mot md5-summan i
Zenodos API. Lägg inte rutnäten i repot. Kräver numpy och Pillow (som tools/riken.py och tools/bilder_in.py).
Skivorna i data/bildlager.json (raden "istidens-kust") skrivs för hand efter körningen; verktyget skriver ut
filerna, storlekarna och hur stor del av bilden som är torrlagd.
"""
import argparse
import hashlib
import json
import struct
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'images' / 'lager'
RECORD = 'https://zenodo.org/api/records/8147509'
FILE_URL = 'https://zenodo.org/records/8147509/files/{name}?download=1'
NAME = 'grid_gowan_glacial_1_8_{k}kyrBP_flon'
W, H = 4096, 2048

# Färgerna följer grundkartan (js/globe.js: land #cdb88d, kust rgba(80,58,25,…)), men ljusare, så att den
# modellerade kusten skiljer sig från dagens land. Snedstrecken säger att ytan är en tolkning.
FILL = (214, 196, 150, 220)
HATCH = (80, 58, 25, 120)
COAST = (80, 58, 25, 235)
HATCH_EVERY, HATCH_WIDTH, COAST_WIDTH = 14, 2, 3


def md5_of(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def fetch(name, folder, checksums):
    path = folder / name
    if not path.exists():
        print(f'Hämtar {name} …')
        urllib.request.urlretrieve(FILE_URL.format(name=name), path)
    want = checksums.get(name)
    if want and md5_of(path) != want:
        raise SystemExit(f'{name}: md5 stämmer inte med Zenodo ({want})')
    return path


def read_grid(path):
    """Läser en gridfil som grd_in.m: returnerar (latituder, longituder, mz) med mz[rad=latitud, kolumn=longitud]."""
    b = path.read_bytes()
    p = 4
    n, m = struct.unpack('>ii', b[p:p + 8]); p += 8
    lats = struct.unpack('>ff', b[p:p + 8]); p += 8
    lons = struct.unpack('>ff', b[p:p + 8]); p += 8
    p += 4  # dt
    nob, = struct.unpack('>i', b[p:p + 4]); p += 4
    if nob != 0:
        raise SystemExit(f'{path.name}: nob = {nob}, väntade 0')
    p += 20
    p += n * m * 4 + 8  # hz (vattendjup) behövs inte här
    mz = np.frombuffer(b, '>i4', n * m, p).reshape(m, n)
    return np.linspace(lats[0], lats[1], m), np.linspace(lons[0], lons[1], n), mz


def sample(mask, lats, lons):
    """Bilinjär interpolation av en 0/1-mask till lagerbildens pixlar; utanför rutnätets latituder blir värdet nan."""
    lon = -180 + (np.arange(W) + 0.5) * 360 / W
    lat = 90 - (np.arange(H) + 0.5) * 180 / H
    dlon, dlat = lons[1] - lons[0], lats[1] - lats[0]
    fx = (lon - lons[0]) / dlon
    fy = (lat - lats[0]) / dlat
    n, m = len(lons), len(lats)
    x0 = np.floor(fx).astype(int); tx = fx - x0
    y0 = np.floor(fy).astype(int); ty = fy - y0
    xa, xb = x0 % n, (x0 + 1) % n  # longituden går runt
    inside = (y0 >= 0) & (y0 + 1 < m)
    ya, yb = np.clip(y0, 0, m - 1), np.clip(y0 + 1, 0, m - 1)
    g = mask.astype(np.float32)
    top = g[ya][:, xa] * (1 - tx) + g[ya][:, xb] * tx
    bot = g[yb][:, xa] * (1 - tx) + g[yb][:, xb] * tx
    out = top * (1 - ty[:, None]) + bot * ty[:, None]
    out[~inside, :] = np.nan
    return out


def grow(a):
    """Ett steg åt de fyra grannarna; longituden går runt, polerna gör det inte."""
    out = a | np.roll(a, 1, 1) | np.roll(a, -1, 1)
    out[1:] |= a[:-1]
    out[:-1] |= a[1:]
    return out


def reach(seed, allowed):
    """Allt i allowed som hänger ihop med seed (fyllning steg för steg)."""
    region = seed & allowed
    while True:
        nxt = grow(region) & allowed
        if nxt.sum() == region.sum():
            return region
        region = nxt


def exposed_on_grid(then_mz, now_mz, lats, lons):
    """Torrlagt i modellen: hav i dag men inte hav i steget, utom i hav som redan i dag är avskilt från världshavet.

    Världshavet är det hav i steget 0 år sedan som hänger ihop med en punkt mitt i Stilla havet. Hav som inte gör det
    (till exempel Kaspiska havet) har en egen nivå som inte följer världshavets, så deras stränder visas inte.
    Returnerar (torrlagt som visas, avskilt hav i dag).
    """
    then_sea, now_sea = then_mz == 1, now_mz == 1
    seed = np.zeros_like(now_sea)
    seed[np.abs(lats - 0).argmin(), np.abs(lons - (-140)).argmin()] = True
    enclosed = now_sea & ~reach(seed, now_sea)
    return ~then_sea & now_sea & ~enclosed, enclosed


def dilate(a, r):
    out = a.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                out |= np.roll(np.roll(a, dy, 0), dx, 1)
    return out


def render(shown, then_sea):
    """shown = andel torrlagt som visas, then_sea = andel hav i steget, båda samplade till lagerbilden."""
    exposed = np.nan_to_num(shown) >= 0.5
    then_water = np.nan_to_num(then_sea) >= 0.5
    # Kusten: torrlagda pixlar som gränsar till dåtidens hav, förtjockad till COAST_WIDTH
    edge = exposed & (np.roll(then_water, 1, 0) | np.roll(then_water, -1, 0) | np.roll(then_water, 1, 1) | np.roll(then_water, -1, 1))
    edge = dilate(edge, COAST_WIDTH // 2) & ~then_water | edge
    yy, xx = np.mgrid[0:H, 0:W]
    hatch = exposed & (((xx + yy) % HATCH_EVERY) < HATCH_WIDTH)
    img = np.zeros((H, W, 4), np.uint8)
    img[exposed] = FILL
    img[hatch] = HATCH
    img[edge] = COAST
    return img, exposed


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--grids', required=True, type=Path, help='katalog för rutnäten (hämtas dit om de saknas)')
    ap.add_argument('--steps', nargs='+', default=['10', '15', '20', '30', '40', '50', '60', '70', '80'],
                    help='tidssteg i tusental år före 1950 (Gowan-serien har vart 2,5:e, 0–80)')
    args = ap.parse_args()
    args.grids.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(RECORD) as r:
        record = json.load(r)
    checksums = {f['key']: f['checksum'].removeprefix('md5:') for f in record['files']}
    if record['metadata'].get('license', {}).get('id') != 'cc-by-4.0':
        raise SystemExit('Datamängdens licens är inte längre CC BY 4.0 på Zenodo: stanna och kontrollera.')
    lats, lons, now = read_grid(fetch(NAME.format(k='0'), args.grids, checksums))
    OUT.mkdir(parents=True, exist_ok=True)
    for k in args.steps:
        la, lo, mz = read_grid(fetch(NAME.format(k=k), args.grids, checksums))
        if not (np.array_equal(la, lats) and np.array_equal(lo, lons)):
            raise SystemExit(f'Steget {k}: rutnätet skiljer sig från steget 0')
        shown, enclosed = exposed_on_grid(mz, now, lats, lons)
        img, exposed = render(sample(shown, lats, lons), sample(mz == 1, lats, lons))
        path = OUT / f'istidens-kust-{k.replace(".", "-")}ka.webp'
        Image.fromarray(img, 'RGBA').save(path, 'WEBP', lossless=True, quality=100, method=6)
        print(f'{path.relative_to(ROOT)}: {path.stat().st_size // 1024} kB, torrlagt {exposed.mean() * 100:.2f} % av bilden, '
              f'avskilt hav i dag {enclosed.mean() * 100:.2f} % av rutnätet')


if __name__ == '__main__':
    main()
