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

## Kontroll mot istidens kust (geograf och forhistoriker, 2026-11-27)
- Ingen ö i Filippinerna eller i Sulu delas i något modellsteg. Förut delades Luzon och Mindoro i alla steg.
- Taiwan ligger nu utanför ytan (förut innanför, utan källa). När Taiwan hänger ihop med fastlandet (30, 20 och 15 ka) ligger en smal remsa av den torrlagda hyllan norr om ön innanför.
- Kvar: en liten lucka på Borneos östkust (cirka 118,5–118,8° O, 1,9–2,3° N, 3–4 bildpunkter), som det gamla breda höljet täckte. En större radie i delen Borneo–Tabon fyller den men delar då Tawi-Tawi och Mindanao. Sulawesi delas som förut; det kommer inte av den här ändringen.
