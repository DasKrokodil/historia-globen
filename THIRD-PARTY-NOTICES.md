# Tredjepartsnotiser

Licenserna nedan gäller respektive komponent eller datakälla, inte hela Historia-globen.

## Kod och typsnitt

| Komponent | Användning | Licens och källa |
|---|---|---|
| three.js 0.160.0 | 3D-globen, laddas från jsDelivr | [MIT-licens](https://github.com/mrdoob/three.js/blob/r160/LICENSE) |
| IM Fell English | Typsnitt, laddas från Google Fonts | [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/imfellenglish/OFL.txt) |
| Instrument Sans | Typsnitt, laddas från Google Fonts | [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt) |
| IBM Plex Mono | Typsnitt, laddas från Google Fonts | [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt) |

## Kartdata

| Material | Användning | Licens och källa |
|---|---|---|
| Natural Earth 1:50m och 1:10m | Underlag till grundkartan (1:50m), den finare kusten i det skarpa utsnittet vid inzoomning (1:10m, `data/land-10m.json`) dagens landsgränser via world-atlas 2.0.2 och Europas gräns i upptäcktsvyn (`data/upptackt-europa.json`, 1:50m admin 0 countries, #872) och platsernas gränser (`data/platser.json`, #579: admin 0 via world-atlas för länder, och 1:10m admin 1 version 5.1.2 för län, som Skåne län, med `tools/platser_gransar.py`) | Natural Earth-data är [public domain](https://www.naturalearthdata.com/about/terms-of-use/). [world-atlas 2.0.2:s paketmetadata](https://github.com/topojson/world-atlas/blob/v2.0.2/package.json) anger ISC för paketets kod, enligt dess [licensfil](https://github.com/topojson/world-atlas/blob/v2.0.2/LICENSE); koden ingår inte här. |
| Cliopatria | Underlag till rikenas och religionslagrens gränser | [CC BY 4.0](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md); [datasetpost på Zenodo](https://zenodo.org/records/13363121). Projektets urval och bearbetning beskrivs i [README](./README.md#licenser). |

## Länkade kontrollkällor

| Källa | Användning | Licens och källa |
|---|---|---|
| Store norske leksikon (snl.no) och Lex (lex.dk) | Kontroll av årtal och plats i händelser, bara länkade | De flesta artiklarna har begränsad licens ("begrenset"/"begrænset"); ingen text är kopierad. Artiklarna står i [`data/sources.json`](./data/sources.json). |

## Bilder

Licens och kredit för varje händelsebild finns i det genererade [`images/licenses.json`](./images/licenses.json). Det omfattar inte kartbilderna i `images/karta/` eller rasterlagren i `images/lager/`; se [README:s licensavsnitt](./README.md#licenser) för dem.
