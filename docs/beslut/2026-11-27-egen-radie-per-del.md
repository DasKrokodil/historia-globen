# Egen radie per del i Människans spridning (2026-11-27, #1593)

**Beslut (DasKrokodil, 2026-11-27).** En del i `parts` i `data/spridning.json` får vara ett objekt `{ "radiusKm": …, "places": [...] }` med en egen radie. Vanliga listor med platser fungerar som förut och använder ytans `radiusKm`.

## Varför
Ytan `sapiens-asien` hade en rak östkant som skar genom Luzon (#1593). Tabongrottan på Palawan har en öppen källa (Xhauflair m.fl. 2023, CC BY), men Palawan låg redan innanför ytan. Med samma radie (550 km) runt varje plats gick det inte att täcka Palawan utan att kanten också skar genom Mindoro, Luzon eller Visayas, där vi inte har någon öppnad källa. Med en egen radie per del kan kanten dras i sundet mellan Palawan och Mindoro och väster om Luzon och Taiwan.

DasKrokodil valde det här alternativet i Claude Codes fråga 2026-11-27 (rekommenderat), före alternativen att dra kanten väster om alla öar (även Palawan) eller att bara lägga in Tabon och skapa ett nytt issue om kanten.

## Vad som ändrades
- `js/layers/spread.js`: delen ritas med sin egen radie om den har en, annars med ytans.
- `scripts/validate-site.py`: läser platserna i båda formerna och kräver `radiusKm` > 0 och `places` i en del med egen radie.
- `docs/datamodell.md` och fältet `about` i `data/spridning.json` beskriver formen.

## Gränser
Radien är ett ritverktyg, inget påstående. Ytan är fortfarande ett antaget område och ingen gräns, och den visar inte var människor saknades.
