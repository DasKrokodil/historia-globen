#!/usr/bin/env bash
# Kontrollerar att production bara innehåller det som finns i main (docs/DEPLOYMENT.md).
# Användning: scripts/production-i-main.sh <production-ref> <main-ref>
#
# Varje release slås ihop med en merge commit, så production får commits som main aldrig får.
# De är godkända när de är merge commits vars innehåll är exakt det som kom från main (andra föräldern
# finns i main och har samma filträd). Allt annat, till exempel en rättning direkt i production
# (nödläge), måste först föras in i main.
set -euo pipefail

prod="$1"
main="$2"
fel=0

for c in $(git rev-list --no-merges "$main..$prod"); do
  echo "::error::Commit $(git log -1 --format='%h %s' "$c") finns i production men inte i main."
  fel=1
done

for m in $(git rev-list --merges "$main..$prod"); do
  if ! git merge-base --is-ancestor "$m^2" "$main" || [ "$(git rev-parse "$m^{tree}")" != "$(git rev-parse "$m^2^{tree}")" ]; then
    echo "::error::Merge-commiten $(git log -1 --format='%h %s' "$m") i production innehåller något annat än det som finns i main."
    fel=1
  fi
done

if [ "$fel" -ne 0 ]; then
  echo "::error::production har ändringar som inte finns i main. För in dem i main först (se Rollback i docs/DEPLOYMENT.md)."
  exit 1
fi
echo "production innehåller bara det som finns i main."
