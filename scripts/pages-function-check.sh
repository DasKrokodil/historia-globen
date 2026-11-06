#!/usr/bin/env bash
# Startar formulärets Pages Function (functions/api/feedback.js) i Cloudflares egen körmiljö (#663).
#
# Varför: Cloudflare stoppar hela publiceringen om funktionen inte startar. Så hände efter #634: koden som
# functions/ importerar (js/model.js → js/i18n.js) kastade ett fel i Workers-miljön, men alla våra andra
# kontroller kör den i node eller i webbläsaren och var gröna. dev publicerades inte på 21 sammanslagningar (#662).
#
# Vad: bygger dist/, startar `wrangler pages dev dist` och skickar POST /api/feedback. Utan nycklar ska
# funktionen svara 503 { error: "disabled" }. Svarar den inte alls, eller med något annat, är kontrollen röd.
#
# wrangler installeras i en tillfällig mapp utanför repot (som Playwright i browser-test.yml), med exakt
# version. Det används bara i kontrollen; sidan får inga nya beroenden.
#
# Kör från var som helst: bash scripts/pages-function-check.sh [port]
set -euo pipefail

WRANGLER_VERSION="${WRANGLER_VERSION:-3.114.0}" # exakt version, ändras bara medvetet
COMPAT_DATE="2024-09-01"
PORT="${1:-8788}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="${RUNNER_TEMP:-$(mktemp -d)}/pages-function"
LOG="$TMP/wrangler.log"
cd "$ROOT"

mkdir -p "$TMP"
if [ ! -x "$TMP/node_modules/.bin/wrangler" ]; then
  echo "Installerar wrangler@$WRANGLER_VERSION i $TMP"
  npm install --prefix "$TMP" --no-save --no-audit --no-fund --loglevel=error "wrangler@$WRANGLER_VERSION" >/dev/null
fi

[ -f dist/index.html ] || bash scripts/build-site.sh

export WRANGLER_SEND_METRICS=false CI=true
"$TMP/node_modules/.bin/wrangler" pages dev dist --port "$PORT" --compatibility-date "$COMPAT_DATE" > "$LOG" 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT

code=000
for _ in $(seq 60); do
  if ! kill -0 "$PID" 2>/dev/null; then break; fi
  code=$(curl -s -o "$TMP/body.json" -w '%{http_code}' -X POST -H 'content-type: application/json' --data '{}' \
    "http://localhost:$PORT/api/feedback" || true)
  [ "$code" != 000 ] && break
  sleep 1
done

if [ "$code" = 503 ] && grep -q '"disabled"' "$TMP/body.json" && ! grep -qiE 'Uncaught|failed to start' "$LOG"; then
  echo "pages-function-check: ok (funktionen startade och svarade 503 disabled utan nycklar)"
  exit 0
fi

echo "::error::Formulärets Pages Function startar inte i Cloudflares körmiljö (svar: $code). Cloudflare skulle då stoppa publiceringen (#663)."
echo "--- wrangler-loggen ---"
grep -vE '^\s*$' "$LOG" | tail -40
exit 1
