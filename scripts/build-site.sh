#!/usr/bin/env bash
# Bygger den publicerade webbplatsen i dist/ (docs/DEPLOYMENT.md).
#
# Bara det som webbplatsen läser när den körs kopieras. Listan bygger på referenserna i koden:
#   index.html            ikoner, stilmall och js/main.js (src/href)
#   js/                   ES-moduler som importeras från js/main.js
#   css/style.css         stilmallen (inga url() till lokala filer)
#   img/                  sidans ikoner och markörernas symboler (img/icons/<namn>.svg, namnet kommer ur
#                         events.json och js/ui/funfact.js och hämtas med fetch)
#   data/*.json           filerna som js/model.js och js/ui/layers.js (vyer.json, #357) laddar med getJSON (events.json läses också av functions/api/feedback.js)
#   data/genererat/       händelser och riken uppdelade i mindre filer (#337), som tools/dela_data.py skriver ur
#                         data/events.json och data/empires/index.json; validate-site.py kontrollerar att de stämmer
#   data/empires/         index.json och rikesfilerna som index.json pekar på (fältet file)
#   data/routes/          index.json och filerna med vägar och resor som index.json listar (fältet files, #38)
#   images/events/        bilderna som events.json pekar på (image.file)
#   images/karta/         upptäcktsvyns bilder som data/upptackt.json pekar på (decorations[].file, #101)
#   LICENSE, data/LICENSE licenserna för kod (GPL-3.0) och data (CC BY 4.0) följer med de publicerade filerna
#
# Interna filer (.claude/, .orchestra/, .github/, docs/, tools/, scripts/, tests/, data/utkast/, images/incoming/,
# CLAUDE.md, README.md) kopieras aldrig. functions/ (formulärets Pages Function, docs/feedback.md) kopieras inte
# heller: Cloudflare Pages publicerar den direkt från repots rot. Skriptet avslutas med fel om en obligatorisk fil saknas, och
# kör sedan scripts/validate-site.py på resultatet.
#
# Kör från var som helst: scripts/build-site.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
cd "$ROOT"

fail() { echo "build-site: $*" >&2; exit 1; }

# Kopierar en fil till samma relativa sökväg i dist/. Saknas filen avbryts bygget.
copy() {
  local f="$1"
  [ -f "$f" ] || fail "obligatorisk fil saknas: $f"
  mkdir -p "$DIST/$(dirname "$f")"
  cp "$f" "$DIST/$f"
}

rm -rf "$DIST"
mkdir -p "$DIST"

# Sidan, stilmallen och licenserna
copy index.html
copy css/style.css
copy LICENSE
copy data/LICENSE

# Sidans ikoner (index.html)
copy img/favicon.svg
copy img/favicon-32.png
copy img/apple-touch-icon.png

# JavaScript: alla moduler under js/ (validate-site.py kontrollerar att varje import finns)
[ -f js/main.js ] || fail "obligatorisk fil saknas: js/main.js"
while IFS= read -r f; do copy "$f"; done < <(find js -type f -name '*.js' | sort)

# Markörernas symboler: namnen kommer ur data och JS, så hela mappen följer med
ls img/icons/*.svg >/dev/null 2>&1 || fail "inga ikoner i img/icons/"
for f in img/icons/*.svg; do copy "$f"; done

# Datafiler som js/model.js laddar, och lagrens grupper och vyer (vyer.json, js/ui/layers.js, #357)
for f in events funfacts sources land borders styles religions religions-polities upptackt vyer; do
  copy "data/$f.json"
done

# Uppdelade filer (#337): alla filer som tools/dela_data.py skriver
ls data/genererat/*.json >/dev/null 2>&1 || fail "inga filer i data/genererat/ (kör python3 tools/dela_data.py)"
for f in data/genererat/*.json; do copy "$f"; done

# Riken: index.json och filerna den pekar på
copy data/empires/index.json
while IFS= read -r f; do copy "$f"; done < <(python3 -I - <<'PY'
import json
for g in json.load(open('data/empires/index.json'))['groups']:
    if 'file' in g:  # ett försvunnet land utan gräns har ingen fil, bara en punkt (#72)
        print(g['file'])
PY
)

# Vägar och resor (#38): index.json och filerna den listar (sökväg från roten eller filnamn i data/routes/)
copy data/routes/index.json
while IFS= read -r f; do copy "$f"; done < <(python3 -I - <<'PY'
import json
for f in json.load(open('data/routes/index.json')).get('files', []):
    f = f if isinstance(f, str) else f.get('file', '')
    print(f if '/' in f else 'data/routes/' + f)
PY
)

# Händelsernas bilder
while IFS= read -r f; do copy "$f"; done < <(python3 -I - <<'PY'
import json
for e in json.load(open('data/events.json'))['events']:
    if e.get('image', {}).get('file'):
        print(e['image']['file'])
PY
)

# Upptäcktsvyns bilder (#101)
while IFS= read -r f; do copy "$f"; done < <(python3 -I - <<'PY'
import json
for d in json.load(open('data/upptackt.json')).get('decorations', []):
    if d.get('file'):
        print(d['file'])
PY
)

echo "build-site: $(find "$DIST" -type f | wc -l) filer i dist/ ($(du -sh "$DIST" | cut -f1))"

python3 -I "$ROOT/scripts/validate-site.py" "$DIST"
