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
js/ui/sources.js      sidan Om källorna
js/ui/layers.js       lagerväljaren: slå av och på lager
js/ui/clusters.js     klustring av händelser som ligger nära varandra
js/ui/focusmenu.js    fokusmenyn: välj ett krig, rike eller en religion att följa
img/icons/            ikoner för händelser (egna SVG-teckningar)
data/events.json      händelser
data/funfacts.json    fun facts, kopplade till händelser
data/sources.json     källregister
data/land.json        grundkarta (Natural Earth)
tools/riken.py        bygger rikesfilerna ur Cliopatria
data/empires/         riken med utbredning per period, en fil per rike och index.json (Cliopatria)
data/borders.json     dagens landsgränser (Natural Earth)
data/religions.json   religioner över tid: varje rikes religion (Cliopatria + Wikipedia)
```

## Principer

- **Data skild från kod.** All data ligger i `data/`.
- **Ett år styr allt.** Tidsreglaget äger nuvarande år, lager och paneler lyssnar.
- **Ekvirektangulär rendering.** Lagren ritas på en platt världsbild som läggs på klotet. Samma bild kan skickas till en fysisk globskärm (knappen "Platt vy").
- **Lager som moduler.** Lagertyperna är punkt, linje, område, bildlager och tur.

## Datamodell i korthet

- **År** lagras som heltal med astronomisk årsräkning (ISO 8601): `0` = 1 f.Kr., `-1` = 2 f.Kr.
- **Osäkerhet** anges som en [EDTF](https://www.loc.gov/standards/datetime/)-sträng: `~` betyder ungefär och `/` betyder spann.
- **Precision** följer Wikidatas skala: 7 = århundrade, 9 = år, 11 = dag.
- **Plats** anges som GeoJSON `[longitud, latitud]` i WGS 84.
- **Texter** lagras per språk (`sv`, `en`, `fr`, `de`, `es`). Saknas ett språk visas engelska, sedan svenska.

## Källpolicy

1. Varje uppgift har minst en källa i `data/sources.json`, med länk och datum då den kontrollerades.
2. Varje uppgift har en granskningsstatus: `draft`, `source-checked` eller `human-reviewed`. Utkast visas inte.
3. Uppgifter som föreslås av AI är utkast tills källan är öppnad och stämmer.
4. Osäkerhet visas öppet, till exempel "cirka" eller ett spann.
5. En fun fact som jämför två saker har källa för båda leden.

## Bidra

Hittar du ett faktafel, öppna ett issue och ange vilken uppgift det gäller och en källa som visar det rätta. Nya händelser tas emot på samma sätt: med källa, plats och årtal.

## Licenser

- **Koden** är licensierad under [GNU GPL v3.0](LICENSE). Du får använda, ändra och sprida den, men det du sprider vidare måste också vara öppet under GPL.
- **Datan** i `data/` (händelser, fun facts och källregister) är licensierad under [CC BY 4.0](data/LICENSE). Ange "Historia-globen" som källa vid användning.
- **Grundkartan** i `data/land.json` och **dagens landsgränser** i `data/borders.json` bygger på [Natural Earth](https://www.naturalearthdata.com/) (public domain) via world-atlas.
- **Rikenas utbredning** i `data/empires/` är ett förenklat utdrag ur [Cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria) från Seshat Global History Databank, licensierat under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: bara de riken som listas i `data/empires/index.json` är med, geometrin är förenklad och perioder med nästan samma gräns är sammanslagna (`tools/riken.py`).
- **Religionerna** i `data/religions.json` använder gränser från samma Cliopatria-data, sammanslagna per religion och förenklade. Varje rikes religion kommer från faktarutan på rikets Wikipedia-sida (CC BY-SA), och sidorna listas i filen. Årtalen för när en del riken blev kristna kommer från Wikipedia och länkas från källregistret.
- **Ikonerna** i `img/icons/` är egna teckningar för projektet och licensieras som koden (GPL v3.0).
- **three.js** laddas från jsDelivr och har MIT-licens. Typsnitten kommer från Google Fonts (SIL Open Font License).
- Händelsetexterna är egna sammanfattningar. Källorna, ofta Wikipedia (CC BY-SA), länkas från varje uppgift.

Namnet "Historia-globen" omfattas inte av licenserna ovan.

Copyright © 2026 Rikard och projektets bidragsgivare.
