# Historia-globen

En snurrbar jordglob där man drar i tiden och ser vad som hände **samtidigt** på olika håll i världen. Pyramiderna byggs medan de sista mammutarna lever på Wrangelön. Oxford undervisar redan när Tenochtitlan grundas.

Projektet är en hobbyidé och ett öppet projekt. På sikt kan samma innehåll visas på en fysisk glob.

## Kör lokalt

Sidan är vanliga HTML-, CSS- och JavaScript-filer utan byggsteg. Datan läses med `fetch`, så den måste köras via en webbserver, inte genom att öppna filen direkt:

```
python3 -m http.server 8000
```

Öppna sedan http://localhost:8000.

## Struktur

```
index.html
css/style.css
js/main.js            startar allt och kopplar ihop delarna
js/model.js           språk, kategorier, tidsformat, laddning av data
js/globe.js           3D-globen (three.js), ekvirektangulär rendering
js/timeline.js        tidsreglage, segmenterad tidsskala, nuvarande år
js/layers/events.js   lager: händelser som punkter
js/layers/areas.js    lager: riken som områden som ändras över tid
js/layers/borders.js  lager: dagens landsgränser (av som standard)
js/layers/religions.js lager: religioner som områden
js/layers/wars.js     lager: krigsområden runt krigets slag
js/ui/panel.js        "Samtidigt i världen" per världsdel, kategorifilter och detaljvy
js/ui/funfact.js      Samtidigt-kortet (fun facts, när ett krig bröt ut) och bågar på globen
js/ui/sources.js      sidan Om källorna (knappen Källor)
js/ui/help.js         kort hjälp i tre steg för nya besökare (knappen Hjälp)
js/ui/layers.js       lagerväljaren: slå av och på lager
js/ui/clusters.js     klustring av händelser som ligger nära varandra
js/ui/focusmenu.js    fokusmenyn: välj ett krig, rike eller en religion att följa
img/icons/            ikoner för händelser (egna SVG-teckningar)
img/favicon.svg       sidans ikon i webbläsarfliken (och PNG-versioner för äldre webbläsare och hemskärm)
images/events/        bilder till händelser (historiska bilder och märkta illustrationer)
images/incoming/      nya bilder innan de konverteras
tools/                hjälpskript som körs för hand (Python): riken, religioner, bildpromptar och bildkonvertering
docs/                 dokumentation: arkitektur, datamodell, beslutslogg, källarbete, bildpromptar
.orchestra/           arbetsflödet dirigenten och orkestern (MIT-licens)
data/events.json      händelser
data/funfacts.json    fun facts, kopplade till händelser
data/sources.json     källregister
data/land.json        grundkarta (Natural Earth)
tools/riken.py        bygger rikesfilerna ur Cliopatria
tools/religioner.py   bygger religionslagret (data/religions.json) ur Cliopatria och faktarutornas texter, med arv av religion
tools/religioner_riken.py  bygger rikenas gränser för religionslagrets klickruta ur Cliopatria
data/empires/         riken med utbredning per period, en fil per rike och index.json (Cliopatria)
data/borders.json     dagens landsgränser (Natural Earth)
data/religions.json   religioner över tid: varje rikes religion (Cliopatria + Wikipedia)
data/religions-polities.json  varje rikes gräns i religionslagret, för klickrutan (Cliopatria)
data/styles.json      bildstilar efter tidsålder och plats
data/utkast/          utkast från massimport som inte är källkontrollerade; appen läser dem inte
tools/hced.py         gör om Historical Conflict Event Dataset till utkast i data/utkast/hced.json
```

## Principer

- **Data skild från kod.** All data ligger i `data/`.
- **Ett år styr allt.** Tidsreglaget äger nuvarande år, lager och paneler lyssnar.
- **Ekvirektangulär rendering.** Lagren ritas på en platt världsbild som läggs på klotet. Samma bild kan skickas till en fysisk globskärm (knappen "Platt vy").
- **Lager som moduler.** Lagertyperna är punkt, linje, område, bildlager och tur.

Mer i [docs/arkitektur.md](docs/arkitektur.md). Besluten bakom finns i [docs/beslut.md](docs/beslut.md).

## Datamodell i korthet

- **År** lagras som heltal med astronomisk årsräkning (ISO 8601): `0` = 1 f.Kr., `-1` = 2 f.Kr.
- **Osäkerhet** anges som en [EDTF](https://www.loc.gov/standards/datetime/)-sträng: `~` betyder ungefär och `/` betyder spann.
- **Precision** följer Wikidatas skala: 7 = århundrade, 9 = år, 11 = dag.
- **Plats** anges som GeoJSON `[longitud, latitud]` i WGS 84.
- **Texter** lagras per språk (`sv`, `en`, `fr`, `de`, `es`). Saknas ett språk visas engelska, sedan svenska.

Alla fält och filer beskrivs i [docs/datamodell.md](docs/datamodell.md).

## Källpolicy

1. Varje uppgift har minst en källa i `data/sources.json`, med länk och datum då den kontrollerades.
2. Varje uppgift har en granskningsstatus: `draft`, `source-checked` eller `two-sources`. Utkast visas inte. Är källorna oense står det öppet.
3. Uppgifter som föreslås av AI är utkast tills källan är öppnad och stämmer.
4. Osäkerhet visas öppet, till exempel "cirka" eller ett spann.
5. En fun fact som jämför två saker har källa för båda leden.

Hur kontrollen går till står i [docs/kallor.md](docs/kallor.md).

## Bidra

Hittar du ett faktafel, öppna ett issue och ange vilken uppgift det gäller och en källa som visar det rätta. Nya händelser tas emot på samma sätt: med källa, plats och årtal.

## Licenser

- **Koden** är licensierad under [GNU GPL v3.0](LICENSE). Du får använda, ändra och sprida den, men det du sprider vidare måste också vara öppet under GPL.
- **Datan** i `data/` (händelser, fun facts och källregister) är licensierad under [CC BY 4.0](data/LICENSE). Ange "Historia-globen" som källa vid användning.
- **Grundkartan** i `data/land.json` och **dagens landsgränser** i `data/borders.json` bygger på [Natural Earth](https://www.naturalearthdata.com/) (public domain) via world-atlas.
- **Rikenas utbredning** i `data/empires/` är ett förenklat utdrag ur [Cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria) från Seshat Global History Databank, licensierat under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: bara de riken som listas i `data/empires/index.json` är med, geometrin är förenklad och perioder med nästan samma gräns är sammanslagna (`tools/riken.py`).
- **Faktarutorna om riken** (`facts` i `data/empires/index.json`) är egna korta sammanfattningar av Wikipedias artiklar om rikena (CC BY-SA). Artiklarna länkas från rutorna och från källregistret.
- **Religionerna** i `data/religions.json` använder gränser från samma Cliopatria-data, sammanslagna per religion och förenklade. Varje rikes religion kommer från faktarutan på rikets Wikipedia-sida (CC BY-SA), och sidorna listas i filen. Årtalen för när en del riken blev kristna kommer från Wikipedia och länkas från källregistret. Ändringar: varje rikes religion räknas fram ur faktarutans text, och ett område behåller sin religion när riket som följer saknar religion i faktarutan (`tools/religioner.py`). Klickrutan använder varje rikes egen, förenklade gräns ur samma Cliopatria-data (`data/religions-polities.json`, `tools/religioner_riken.py`).
- **Utkasten om slag** i `data/utkast/hced.json` kommer från [Historical Conflict Event Dataset](https://whgazetteer.org/datasets/1415/places) (Charles Miller, 2022, Harvard Dataverse, https://doi.org/10.7910/DVN/6ZFC0V) via World Historical Gazetteer. Datasetet har licensen [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), och WHG:s egna tillägg har [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: ett urval, omräknade årtal och egna texter (`tools/hced.py`). Utkasten visas inte på globen förrän de är källkontrollerade.
- **Dödssiffror i krigens berättelser** kommer delvis från [UCDP Battle-related Deaths Dataset](https://ucdp.uu.se/downloads/) (Uppsala Conflict Data Program, version 26.1; Davies, Pettersson och Öberg 2026, *Journal of Peace Research* 63(4)), licensierat under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: summerade per krig och återgivna i egna texter.
- **Ikonerna** i `img/icons/` och sidans ikon (`img/favicon.svg` med PNG-versioner) är egna teckningar för projektet och licensieras som koden (GPL v3.0).
- **Bilder i faktarutan** (`images/events/`):
  - **Historiska bilder** kommer från [Wikimedia Commons](https://commons.wikimedia.org/) (public domain, CC0, CC BY eller CC BY-SA) och från [Library of Congress](https://www.loc.gov/pictures/) (poster märkta "No known restrictions on publication"). Varje bild behåller sin egen licens, som står i bildtexten tillsammans med upphov och länk till filsidan eller arkivposten. Filsidan eller arkivposten finns i källregistret.
  - **Illustrationer** i en tidsålders bildtradition är tydligt märkta "inte en historisk bild" i bildtexten. Verktyg, datum och prompt sparas i `data/events.json`. De licensieras under CC BY 4.0 som övrig data, i den mån de alls omfattas av upphovsrätt.
  - **Platshållare** märks "Platshållare" tills den riktiga bilden finns.
- **Dirigenten och orkestern** i `.orchestra/shared/` kommer från [solwation/dirigenten-och-orkestern](https://github.com/solwation/dirigenten-och-orkestern) och har MIT-licens. Det är instruktioner för AI-agenter, inte en del av sidan.
- **three.js** laddas från jsDelivr och har MIT-licens. Typsnitten kommer från Google Fonts (SIL Open Font License).
- Händelsetexterna är egna sammanfattningar. Källorna, ofta Wikipedia (CC BY-SA), länkas från varje uppgift.

Namnet "Historia-globen" omfattas inte av licenserna ovan.

Copyright © 2026 Rikard och projektets bidragsgivare.
