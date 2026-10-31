#!/usr/bin/env python3
"""Kontrollerar att sjöetapper i data/routes/*.json inte korsar land (#332).

Läser grundkartan data/land.json (SVG-path i 4096x2048, ekvirektangulär), tolkar etappernas `path` på
samma sätt som js/layers/lines.js (storcirklar med en punkt var 2:a grad, sedan rak linje på kartan,
wrap över datumlinjen) och provar linjen var 0,05:e grad. Punkter på land rapporteras om de ligger
längre än 0,4 grader från etappens första och sista punkt och från alla namngivna `places`.

Etapper som går över land eller längs floder (Sidenvägen, floden Guadalquivir, Dneprvägen, Nilen)
hoppas över; se SKIPPA nedan. Kör: python3 tools/rutter_land.py [-v] [fil.json ...]
Avslutas med 1 om korsningar finns.
"""
import glob
import json
import math
import re
import sys

import numpy as np
from PIL import Image, ImageChops, ImageDraw

W, H = 4096, 2048
MARGIN = 0.4   # grader från hamn och namngivna platser där land tillåts
STEP = 0.05    # provtagning längs linjen, grader
STEP_DEG = 2   # som STEP_DEG i lines.js

# (rutt-id, etappindex eller None för hela rutten): etapper över land eller längs floder
SKIPPA = {
    ("sidenvagen-hexi", None), ("sidenvagen-tarim", None), ("sidenvagen-vast", None),
    ("vikingar-vagen-till-grekerna", None),   # floder och portage
    ("magellan-elcano", 0),                   # Sevilla till Sanlúcar går på Guadalquivir
    ("kryddvag-egypten-indien", 0),           # Alexandria, Nilen och ökenvägen till Myos Hormos
}


# Hamnar en bit upp i en flod eller en lång fjord, bortom kartans upplösning: (lon, lat) och tillåtet
# avstånd i grader (i stället för MARGIN)
FLODHAMNAR = {
    (118.8, 32.1): 3.0,    # Nanjing, Yangtze
    (100.6, 14.3): 1.0,    # Siam (Ayutthaya), Chao Phraya
    (104.8, -3.0): 1.0,    # Palembang, Musi
    (-45.5, 61.2): 1.0,    # Brattahlíð, Tunulliarfik-fjorden
    (39.8, 21.4): 1.2,     # Mecka, 70 km inåt landet från Jidda
}
# Etapper där kartan själv saknar vattnet: (rutt-id, etappindex) och skäl. Räknas inte som korsningar men skrivs ut.
UNDANTAG = {
    ("magellan-elcano", 6): "Magellans sund är smalare än kartans upplösning (Natural Earth 1:50m binder inte ihop sundet)",
}
MIN_LEN = 0.12  # landstycken kortare än så (en eller två pixlar) är kartbrus och räknas inte


def land_mask(path_file="data/land.json"):
    """Landmask (bool, H x W): varje ring fylls för sig och läggs ihop med XOR (hål blir hav)."""
    d = json.load(open(path_file))["path"]
    mask = Image.new("1", (W, H), 0)
    for ring in d.split("M")[1:]:
        nums = [float(n) for n in re.findall(r"-?\d+\.?\d*", ring)]
        pts = list(zip(nums[0::2], nums[1::2]))
        if len(pts) < 3:
            continue
        layer = Image.new("1", (W, H), 0)
        ImageDraw.Draw(layer).polygon(pts, fill=1)
        mask = ImageChops.logical_xor(mask, layer)
    return np.array(mask, dtype=bool)


def vec(p):
    la, lo = math.radians(p[1]), math.radians(p[0])
    return (math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la))


def lonlat(v):
    return (math.degrees(math.atan2(v[1], v[0])), math.degrees(math.atan2(v[2], math.hypot(v[0], v[1]))))


def ritpunkter(path):
    """Punkterna som lines.js ritar: storcirkelpunkter högst STEP_DEG isär."""
    pts = [tuple(path[0])]
    for a, b in zip(path, path[1:]):
        va, vb = vec(a), vec(b)
        d = math.acos(max(-1, min(1, sum(x * y for x, y in zip(va, vb)))))
        n = max(1, math.ceil(math.degrees(d) / STEP_DEG))
        for j in range(1, n + 1):
            if j == n or d < 1e-9:
                pts.append(tuple(b))
            else:
                s = math.sin(d)
                ka, kb = math.sin((1 - j / n) * d) / s, math.sin(j / n * d) / s
                pts.append(lonlat([va[i] * ka + vb[i] * kb for i in range(3)]))
    return pts


def unwrap(pts):
    out = [pts[0]]
    for lo, la in pts[1:]:
        p = out[-1][0]
        while lo - p > 180:
            lo -= 360
        while lo - p < -180:
            lo += 360
        out.append((lo, la))
    return out


def dist(a, b):
    dl = abs(a[0] - b[0]) % 360
    dl = min(dl, 360 - dl)
    return math.hypot(dl * math.cos(math.radians((a[1] + b[1]) / 2)), a[1] - b[1])


def korsningar(leg, mask, ok=None):
    """Lista med (lon, lat, längd i grader) för varje sammanhängande landstycke utanför hamnar och platser."""
    path = leg["path"]
    if ok is None:
        ok = [path[0], path[-1]] + [p["at"] for p in leg.get("places", [])]
    line = unwrap(ritpunkter(path))
    res, run = [], []
    for (x1, y1), (x2, y2) in zip(line, line[1:]):
        n = max(1, int(math.hypot(x2 - x1, y2 - y1) / STEP))
        for i in range(n + 1):
            f = i / n
            lo, la = x1 + (x2 - x1) * f, y1 + (y2 - y1) * f
            px = int(((lo + 180) % 360) / 360 * W) % W
            py = min(H - 1, max(0, int((90 - la) / 180 * H)))
            hit = mask[py, px] and all(dist((lo, la), q) > FLODHAMNAR.get((q[0], q[1]), MARGIN) for q in ok)
            if hit:
                run.append((lo, la))
            elif run:
                res.append(run)
                run = []
    if run:
        res.append(run)
    res = [r for r in res if len(r) * STEP >= MIN_LEN]
    return [(((r[len(r) // 2][0] + 180) % 360) - 180, r[len(r) // 2][1], len(r) * STEP) for r in res]


def main(args):
    verbose = "-v" in args
    files = [a for a in args if not a.startswith("-")] or sorted(
        f for f in glob.glob("data/routes/*.json") if not f.endswith("index.json"))
    mask = land_mask()
    total = 0
    for f in files:
        n_fil = 0
        for r in json.load(open(f))["routes"]:
            for i, leg in enumerate(r["legs"]):
                if (r["id"], None) in SKIPPA or (r["id"], i) in SKIPPA:
                    continue
                if (r["id"], i) in UNDANTAG:
                    print(f"  undantag {r['id']} etapp {i}: {len(korsningar(leg, mask))} landstycken, {UNDANTAG[(r['id'], i)]}")
                    continue
                for lo, la, ln in korsningar(leg, mask):
                    n_fil += 1
                    if verbose:
                        print(f"  {r['id']} etapp {i}: land vid {lo:.2f}, {la:.2f} ({ln:.2f} grader)")
        print(f"{f}: {n_fil} korsningar")
        total += n_fil
    print(f"Totalt {total} korsningar" if total else "ok: inga korsningar")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
