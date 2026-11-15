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
| Natural Earth 1:50m och 1:10m | Underlag till grundkartan (1:50m), den finare kusten i det skarpa utsnittet vid inzoomning (1:10m, `data/land-10m.json`) dagens landsgränser via world-atlas 2.0.2 och Europas gräns i upptäcktsvyn (`data/upptackt-europa.json`, 1:50m admin 0 countries, #872) och platsernas gränser (`data/platser.json`, #579: admin 0 via world-atlas för länder, och 1:10m admin 1 version 5.1.2 för län, som Skåne län, med `tools/platser_gransar.py`; samma admin 0-data ligger också som grannländernas polygoner nära gränsen, #1449) och ortnamnen för regionvyn (`data/ortnamn/`, #1643: 1:10m `ne_10m_populated_places`, `ne_10m_geography_marine_polys` och `ne_10m_admin_0_countries` ur natural-earth-vector 5.1.2, med `tools/ortnamn.py`) | Natural Earth-data är [public domain](https://www.naturalearthdata.com/about/terms-of-use/). [world-atlas 2.0.2:s paketmetadata](https://github.com/topojson/world-atlas/blob/v2.0.2/package.json) anger ISC för paketets kod, enligt dess [licensfil](https://github.com/topojson/world-atlas/blob/v2.0.2/LICENSE); koden ingår inte här. |
| Wikidata | Kompletterande ortnamn för regionvyn (`data/ortnamn-komplettering.json` och orterna med `source: "wikidata"` i `data/ortnamn/`, #1676): etiketter på fem språk och koordinater för orter som Natural Earth saknar, till exempel Lund, Ribe och Jelling | [CC0 1.0](https://www.wikidata.org/wiki/Wikidata:Licensing); varje ort har sitt Q-id i fältet `wikidata` |
| Cliopatria | Underlag till rikenas och religionslagrens gränser | [CC BY 4.0](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md); datafilen `cliopatria_polities_only_v021.geojson` ur [version 0.2.1 på Zenodo](https://zenodo.org/records/23128623) (doi:10.5281/zenodo.23128623, Chalstrey och Bennett, 2026-10-03). Projektets urval och bearbetning beskrivs i [README](./README.md#licenser). |
| Wilmes m.fl. (2023), tidvattensimuleringar, och PaleoMIST 1.0 (Gowan 2019, Gowan m.fl. 2021) | Bildlagret Istidens kust (`images/lager/istidens-kust-*.webp`, #1096): rutnäten med land och hav för serien Gowan och PaleoMIST:s istjocklek (#1564), gjorda till bilder med `tools/istidens_kust.py` | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): [datamängden på Zenodo](https://zenodo.org/records/8147509), [PaleoMIST 1.0 på PANGAEA](https://doi.org/10.1594/PANGAEA.905800) och [artikeln](https://doi.org/10.1038/s41467-021-21469-w). Bearbetningen beskrivs i [README](./README.md#licenser). |

## Länkade kontrollkällor

| Källa | Användning | Licens och källa |
|---|---|---|
| Store norske leksikon (snl.no) och Lex (lex.dk) | Kontroll av årtal och plats i händelser, bara länkade | De flesta artiklarna har begränsad licens ("begrenset"/"begrænset"); ingen text är kopierad. Artiklarna står i [`data/sources.json`](./data/sources.json). |

## Flaggor och vapen på platskorten

Platskortens flaggor och vapen (`emblems` i `data/platser.json`, filerna i `img/flags/`, #1160, #1619) har var sin licens, kontrollerad på filsidan på Wikimedia Commons. Filsidan står i [`data/sources.json`](./data/sources.json) och bland kortets källor, och kortet visar kredit och licens under bilden. Flaggor och vapen är officiella beteckningar ("insignia") och kan ha andra begränsningar än upphovsrätt, till exempel att de inte får användas i varumärken.

| Fil | Bild | Upphovsperson | Licens och filsida |
|---|---|---|---|
| `greenland.svg` | Grönlands flagga (egen förenklad teckning) | efter Jeffrey Connell | Public domain (PD-ineligible), [filsidan](https://commons.wikimedia.org/wiki/File:Flag_of_Greenland.svg) |
| `greenland-arms.svg` | Grönlands riksvapen | Octane | Public domain (PD-self), [filsidan](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Greenland.svg) |
| `new-zealand.svg` | Nya Zeelands flagga | Zscout370 m.fl. | Public domain i Nya Zeeland och USA, [filsidan](https://commons.wikimedia.org/wiki/File:Flag_of_New_Zealand.svg) |
| `sweden.svg` | Sveriges flagga | Jon Harald Søby m.fl. | Public domain (PD-shape), [filsidan](https://commons.wikimedia.org/wiki/File:Flag_of_Sweden.svg) |
| `dannebrog.svg` | Danmarks flagga (Dannebrog) | Madden m.fl. | Public domain (PD-shape), [filsidan](https://commons.wikimedia.org/wiki/File:Flag_of_Denmark.svg) |
| `skane-arms.svg` | Skånes landskapsvapen | Lokal_Profil | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/), [filsidan](https://commons.wikimedia.org/wiki/File:Sk%C3%A5ne_vapen.svg); märkt insignia. Ändring: `viewBox` tillagd så att bilden skalas |

## Bilder

Licens och kredit för varje händelsebild finns i det genererade [`images/licenses.json`](./images/licenses.json). Det omfattar inte kartbilderna i `images/karta/` eller rasterlagren i `images/lager/`; se [README:s licensavsnitt](./README.md#licenser) för dem.
