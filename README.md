<p align="center">
  <img src="img/favicon.svg" width="96" height="96" alt="Historia-globens ikon, en vindros i mässing">
</p>

<h1 align="center">Historia-globen</h1>

<p align="center"><strong>Dra i tiden och se vad som hände samtidigt i hela världen.</strong><br>
Pyramiderna byggs medan de sista mammutarna lever på Wrangelön. Oxford undervisar redan när Tenochtitlan grundas.</p>

<p align="center"><a href="https://historiagloben.se"><strong>Prova globen på historiagloben.se →</strong></a></p>

![Globen år 1325 med Samtidigt-kortet: Mansa Musa når Kairo, Ibn Battuta ger sig av från Tanger och Tenochtitlan grundas](docs/bilder/readme-1-samtidigt.webp)

## Det här får du

- **En snurrbar jordglob genom 5 000 år.** Dra i tidslinjen från 3000 f.Kr. till i dag, eller tryck ▶ och se världen förändras.
- **Samtidigt-kortet.** Oväntade samband dyker upp av sig själva, till exempel att Mansa Musa och Ibn Battuta var på väg mot Mecka med ett års mellanrum.
- **Krig och slag att följa.** Över 50 krig från alla världsdelar, från Kadesh och perserkrigen till Ukraina i dag. Varje krig har en berättelse: varför det började, vilka som stred, hur det slutade och hur många som dog, som spann och med vem som har räknat.
- **Riken som växer och krymper,** från Romarriket och Handynastin till Mongolriket och Brittiska imperiet.
- **Religioner över tid,** med egna symboler och faktarutor, och med en symbol där varje religion uppstod.
- **Platt vy.** Världen som en platt karta som fyller skärmen, med zoom och panorering, medan tiden spelas upp.
- **Fungerar i mobilen,** utan installation.

| Följ ett krig | Religioner år 1000 | I mobilen |
|---|---|---|
| ![Fokus på Napoleonkrigen med krigsområdet och kortet om varför kriget började](docs/bilder/readme-2-krig.webp) | ![Religionslagret år 1000 med kors, moské och dharmahjul i områdena och medaljer där religionerna uppstod](docs/bilder/readme-3-religioner.webp) | ![Globen år 1500 i mobilbredd](docs/bilder/readme-4-mobil.webp) |

## Varje uppgift har en källa

Inget på globen är skrivet ur minnet. Varje händelse pekar på minst en källa, och de flesta är jämförda med en andra, oberoende källa. När källorna är oense står det öppet, i stället för att en siffra väljs i tysthet. Under **Källor** på sidan går det att se varifrån allt kommer.

Just nu finns 469 händelser, 655 källor, 8 riken och 22 religioner. Allt är öppen källkod och öppna data.

## Om projektet

Historia-globen är ett hobbyprojekt med öppen källkod. På sikt kan samma innehåll visas på en fysisk glob. historiagloben.se visar den senaste releasen; bilderna ovan är tagna från utvecklingsversionen i `main` den 30 oktober 2026.

---

**För utvecklare:** resten av den här sidan beskriver hur projektet körs och är uppbyggt.

## Kör lokalt

Sidan är vanliga HTML-, CSS- och JavaScript-filer utan byggsteg. Datan läses med `fetch`, så den måste köras via en webbserver, inte genom att öppna filen direkt:

```
python3 -m http.server 8000
```

Öppna sedan http://localhost:8000.

## Struktur

```
index.html
CONTENT-LICENSE.md   sammanfattning av licenserna för kod, data och bilder
THIRD-PARTY-NOTICES.md licenser för externa komponenter och datakällor
AGENTS.md             regler för Codex och andra agenter; pekar på CLAUDE.md
_headers              Cloudflare Pages cache-regler (no-cache, så att en release inte blandas med gamla filer)
css/style.css
js/main.js            startar allt och kopplar ihop registret, tidslinjen och panelerna
js/controllers/       main.js uppdelad: val, fokus, faktarutor, omritning, uppspelning, berättelse, etiketter (#402), adressen (#501), tidsintervallet (range.js, #755) och återgång efter hopp (jump-back.js, #997)
js/state.js           det gemensamma tillståndet som lagren läser (år, fokus, filter, valda lager, #338), åtgärder och JSON (#403), och lägeskontraktet med uteslutningstabellen (#893)
js/surfaces.js        stängregistret för ytor: menyerna och sidopanelen anmäler sig i grupper och en öppnad yta stänger sin grupp (#894)
js/layers/registry.js lagerregistret: rader i Lager, ritordning, dämpning i fokus, teckenförklaring (#338)
js/layers/index.js    lagerlistan: alla lager som anmäler sig i registret (#338)
js/model.js           språk, kategorier, tidsformat, laddning av data
js/i18n.js            språkval och gränssnittets texter på valt språk (#63)
js/globe.js           3D-globen (three.js), ekvirektangulär rendering
js/globe-detail.js    skarpt utsnitt av kartan vid inzoomning
js/timeline.js        tidsreglage, segmenterad tidsskala, nuvarande år
js/layers/events.js   lager: händelser som punkter
js/layers/areas.js    lager: riken som områden som ändras över tid
js/layers/area-style.js  mjuk kant för osäkra gränser och prickat inflytande (lydriken)
js/layers/area-transition.js  mjuk övergång när ett rike byter period, delas eller slås ihop (#78)
js/layers/borders.js  lager: dagens landsgränser (av som standard)
js/layers/places.js   lager: konturen av platsen man följer i Fokus (#579)
js/layers/spread.js   lager: människans spridning, antagna områden och vågor i förhistorien (#1094)
js/place-geo.js       vilka händelser som ligger inom en plats gräns, delas med testerna (#579)
js/layers/religions.js lager: religioner som områden, med symboler i områdena (#271)
js/layers/origins.js  religionens symbol där den uppstod, som klickbar markör (#271)
js/layers/empiremarks.js rikenas symboler mitt i områdena, som klickbara markörer (#301)
js/layers/wars.js     lager: krigsområden runt krigets slag
js/layers/lines.js    lager: vägar och resor som ritas fram över tiden (#38)
js/layers/discovery.js lager: upptäcktsvyn med dimma som lyfts över Europa, grannarna och dit resorna når, havsmonster och kompassrosor (#101)
js/ui/panel.js        "Samtidigt i världen" per världsdel, kategorifilter och detaljvy
js/ui/funfact.js      Samtidigt-kortet (fun facts, när ett krig bröt ut) och bågar på globen
js/ui/sources.js      sidan Om källorna (knappen Källor)
js/ui/help.js         kort hjälp i tre steg för nya besökare (knappen Hjälp)
js/url-state.js       adressformatet för delbara länkar och Bakåt/Framåt (#501, #64)
js/search-index.js    sökningens index och matchning (#570)
js/place-search.js    "Vad hände här?": platsförslag och händelser inom 300 km, i tidsordning (#15)
js/date-events.js     återanvändbart urval av händelser för år eller exakt datum (#483, #489, #485)
js/ui/intro.js        frivillig introduktion till samtidighet i tre stilla steg, från Utforska (#363, #516)
js/ui/quiz.js         quizet "Vad hände samtidigt?" under Mer, med frågor ur befintliga fun facts (#65)
js/ui/print-sheet.js  utskrift av en lektionstur: elevblad och lärarblad ur turens lärarfält (#738)
js/ui/uppdrag.js      elevuppdraget Samtidighetsjakten under Mer, med knappen i faktarutan (#741)
js/uppdrag-rules.js   jaktens regler: år, världsdel och vad som räknas, delas med testerna (#741)
js/quiz-rules.js      quizets regler: frågor och säkert felaktiga svar, delas med testerna (#65)
js/ui/viewmode.js     vyväljaren: Glob, Platt karta och Upptäcktsresor (#651)
js/ui/tour.js         guidade turer: spelar upp en tur ur data/turer/ steg för steg (knappen Turer, #47)
js/ui/lesson.js       lektionsläget: länken m=lektion döljer menyerna, låser år och lager och visar bandet med "Visa hela globen" (#795)
js/tour-format.js     turformatets kontroll, delas med testerna (#47)
js/ui/flatmap.js      Platt vy: platt karta med zoom och panorering (knappen Platt vy)
js/ui/poster.js       A4-affisch som PNG från Platt vy (knappen Affisch)
js/ui/feedback.js     formuläret Lämna förslag / Rapportera faktafel (avstängt som standard, docs/feedback.md)
js/feedback-rules.js  förslagens kategorier, gränser och validering (delas med serverfunktionen)
js/ui/layers.js       lagerväljaren: slå av och på lager
js/ui/clusters.js     klustring av händelser som ligger nära varandra
js/ui/zoomlevels.js   vad som syns på vilken zoomnivå: tre nivåer och tröskelvärden (#358)
js/ui/focusmenu.js    fokusmenyn: välj ett krig, rike eller en religion att följa
js/ui/routepop.js     klickrutan för vägar och resor
js/ui/sheet.js        faktarutan som ark nedifrån i mobilen (litet, halvt, helt)
js/ui/viewmenu.js     mobilmenyn Meny (Lager, Fokus, Turer, Platt vy, Kom igång, Källor, Hjälp, #530)
img/icons/            ikoner för händelser och religionernas symboler (egna SVG-teckningar, till exempel treaty.svg för fredsavtal, cross.svg och dharma-wheel.svg, #271)
img/flags/            förenklade, källbelagda historiska flaggor för rikesmarkörer (#462)
img/favicon.svg       sidans ikon i webbläsarfliken (och PNG-versioner för äldre webbläsare och hemskärm)
images/events/        bilder till händelser (historiska bilder och märkta illustrationer)
images/karta/         upptäcktsvyns detaljer ur gamla kartor (havsmonster och kompassros, public domain)
images/incoming/      nya bilder innan de konverteras
tools/                hjälpskript som körs för hand (Python): riken, religioner, bildpromptar, bildkonvertering och licensmanifest
docs/                 dokumentation: arkitektur, datamodell, beslutslogg, källarbete, bildpromptar, omstridda gränser och Sveriges hållning (omstridda-granser.md, #644); docs/bilder/ har skärmbilderna i README; docs/granskningar/ tar emot externa granskningar
.orchestra/           arbetsflödet dirigenten och orkestern (MIT-licens)
data/handelser/       händelserna, en redigeringsfil per period; här redigeras händelser (#394)
data/events.json      alla händelser i en fil, byggd ur data/handelser/ (redigeras inte)
data/funfacts.json    fun facts, kopplade till händelser
data/missuppfattningar.json  vanliga historiska missuppfattningar och var de kom ifrån (#838); visas i faktarutan för händelserna i events och i quizet (Sant eller myt?, #846)
data/quiz.json        quizets tidsfrågor (Vad kom först?, Vad låg närmast?, #846); pekar bara på händelser med id, svaret räknas ur deras årtal
data/platser.json          platser: kort om platsers historia med dagens gräns som kontur, följs i Fokus (#579); gränserna hämtas med tools/platser_gransar.py ur Natural Earth
data/teman.json            teman: namngivna urval av händelser som följs i Fokus (#398); tom tills första temat skrivs (#105)
data/perioder.json         epoker i fyra indelningar: Lgr22 (fem perioder), Nordens forntid (stenålder, bronsålder, järnålder enligt Historiska museet), antiken och industrialiseringen, med årtal, källa och förenklingstext; epokknapparna i intervallformuläret läser den (#845, #965)
data/intro.json       introduktionens startår, texter och referenser till befintliga händelser/fun facts (#363, #516)
data/uppdrag.json     elevuppdragen (Samtidighetsjakten): år, spann, antal världsdelar och texter (#741)
data/turer/           guidade turer: index.json och en fil per tur med steg (år, kamera, text, lager, händelse, källor) (#47)
data/sources.json     källregister
data/version.json     versionsnummer och länk till releaserna
data/licenses.json    genererat register över källornas licensuppgifter
images/licenses.json  genererat register över händelsebildernas licenser (#393)
data/land.json        grundkarta (Natural Earth 1:50m)
data/land-10m.json    finare kust (Natural Earth 1:10m), laddas först när det skarpa utsnittet används; byggs med tools/land_10m.mjs
tools/riken.py        bygger rikesfilerna ur Cliopatria
tools/riken_bevara.py det riken.py behåller vid ombyggnad: handskrivna fält som flags och översatta namn (#1220)
tools/riken_namn.py   hämtar rikenas namn på tyska, spanska och franska ur Wikidata; riken.py bevarar dem (#676, #644)
tools/ne_omstridda.py tar ut omstridda områden ur Natural Earth till tools/ne-omstridda-omraden.geojson, som riken.py läser (#644)
tools/dela_data.py    bygger events.json ur data/handelser/ och delar upp händelser och riken i data/genererat/, med en fil per språk (körs efter varje ändring)
tools/oversattning.py spärren mot oöversatta texter och kontrollen av inaktuella översättningar (#675)
tools/markortak.mjs   räknar hur många markörer som syns samtidigt i vanligt läge, år för år, och varnar över taket 60 (#1192)
tools/tackning.py     skriver täckningsrapporten med luckor per period, världsdel och kategori i docs/granskningar/ (#563)
tools/tackningsrapport.py  skriver docs/tackningsrapport.md med täckningen per världsdel, århundrade och kategori
tools/religioner.py   bygger religionslagret (data/religions.json) ur Cliopatria och faktarutornas texter, med arv av religion
tools/religioner_riken.py  bygger rikenas gränser för religionslagrets klickruta ur Cliopatria
tools/matning_hopp.mjs mäter hur länge sidan inte svarar vid ett långt hopp i tiden (Playwright, #692)
tools/license_manifests.py  genererar data/licenses.json och images/licenses.json; validate-site.py kontrollerar att de är aktuella
data/empires/         riken med utbredning per period, en fil per rike och index.json (Cliopatria)
data/borders.json     dagens landsgränser (Natural Earth)
data/routes/          vägar och resor (lagertyp linje): index.json och en fil per resa eller väg
data/genererat/       händelser och riken uppdelade i mindre filer som sidan laddar, med en fil per språk (genereras, redigeras inte)
data/oversattning.json baslinjen för oöversatta texter och registret över översättningar (genereras av tools/oversattning.py)
data/upptackt.json    upptäcktsvyn: perspektivraden, den åldrade kartstilen, dimmans täckning och korridorens bredd, dekorationernas platser
data/spridning.json   människans spridning: antagna områden och vågor som tolkningar av källorna (#1094)
data/upptackt-europa.json Europa som hemregion i upptäcktsvyn, lyft från början (#872); byggs med tools/europa_dimma.py ur Natural Earth
data/vyer.json        grupperna och de förinställda vyerna i Lager (#357)
data/ui/              gränssnittets texter: sprak.json och en fil per språk (#63)
data/religions.json   religioner över tid: varje rikes religion (Cliopatria + Wikipedia)
data/religions-polities.json  varje rikes gräns i religionslagret, för klickrutan (Cliopatria)
data/styles.json      bildstilar efter tidsålder och plats
data/utkast/          utkast från massimport som inte är källkontrollerade; appen läser dem inte
tools/hced.py         gör om Historical Conflict Event Dataset till utkast i data/utkast/hced.json
scripts/build-site.sh kopierar webbplatsens filer till dist/ för publicering och kör kontrollerna (docs/DEPLOYMENT.md)
scripts/validate-site.py  kontrollerar dist/: JSON, filreferenser och att inga interna filer följer med
scripts/pages-function-check.sh  startar formulärets Pages Function med wrangler, som Cloudflare gör (#663)
scripts/kontrolltackning.mjs     bevisar att varje webbläsarkontroll körs i exakt ett CI-jobb (#864)
functions/api/feedback.js  Cloudflare Pages Function för besökarnas förslag (publiceras från repots rot, inte via dist/)
tests/                tester för serverfunktionen, etikettkontrollen och CSS-lagerordningen (#1065) (node --test 'tests/*.test.mjs') och webbläsartestet tests/webblasare.mjs (Playwright, #339), som delas i tre jobb enligt tests/jobb.json (#864)
.github/workflows/    GitHub Actions: bygger och kontrollerar dist/ vid push till main och PR mot main och production; browser-test.yml öppnar sidan i Chromium; release.yml skapar tagg och GitHub Release; etikettkontroll.yml (logik i .github/scripts/etikettkontroll.cjs) varnar när ett issue har flera ägare (etiketter eller tilldelning) eller både redo och pågår, städar etiketter efter en sammanslagen PR och påminner om ett pågår som legat orört i 7 dagar (#588)
```

## Principer

- **Data skild från kod.** All data ligger i `data/`.
- **Ett år styr allt.** Tidsreglaget äger nuvarande år, lager och paneler lyssnar.
- **Ekvirektangulär rendering.** Lagren ritas på en platt världsbild som läggs på klotet. Knappen "Platt vy" visar samma bild som en platt karta, och bilden kan också skickas till en fysisk globskärm.
- **Lager som moduler.** Lagertyperna är punkt, linje, område, bildlager och tur.

Mer i [docs/arkitektur.md](docs/arkitektur.md). Besluten bakom finns i [docs/beslut/](docs/beslut/README.md) och den äldre loggen [docs/beslut.md](docs/beslut.md).

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

**Sidan är öppen för all slags input.** Åsikter, idéer, förslag och hjälp är välkomna, och det är roligt när något engagerar. Titta gärna in, säg vad du tycker, och hjälp till om du har lust.

Samtidigt är det här DasKrokodils hobbyprojekt, och det ska vara tydligt: det är DasKrokodil som bestämmer vad som görs och vad som tas med, och som slår ihop alla ändringar. Därför går det inte att ta med allt, och ibland blir svaret "inte just nu" eller nej. Det är inget omdöme om förslaget. Vill du ta det åt ett annat håll är du varmt välkommen att göra en egen kopia, eftersom koden är öppen.

Bidrar du med kod eller data publiceras det under projektets licenser (GPL-3.0 för koden, CC BY 4.0 för datan). Att bidra innebär inget medägande i projektet.

## Licenser

Se också [licenssammanställningen](CONTENT-LICENSE.md), [tredjepartsnotiserna](THIRD-PARTY-NOTICES.md) och de maskinläsbara manifesten `data/licenses.json` och `images/licenses.json`.

- **Koden** är licensierad under [GNU GPL v3.0](LICENSE). Du får använda, ändra och sprida den, men det du sprider vidare måste också vara öppet under GPL.
- **Datan** i `data/` (händelser, fun facts och källregister) är licensierad under [CC BY 4.0](data/LICENSE). Ange "Historia-globen" som källa vid användning.
- **Grundkartan** i `data/land.json` (1:50m), den finare kusten i `data/land-10m.json` (1:10m, bara för det skarpa utsnittet vid inzoomning) och **dagens landsgränser** i `data/borders.json` bygger på [Natural Earth](https://www.naturalearthdata.com/) (public domain) via world-atlas.
- **Rikenas utbredning** i `data/empires/` är ett förenklat utdrag ur [Cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria) från Seshat Global History Databank, licensierat under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: bara de riken som listas i `data/empires/index.json` är med, geometrin är förenklad och perioder med nästan samma gräns är sammanslagna (`tools/riken.py`).
- **Nattljus 2016** i `images/lager/nattljus-2016.jpg` kommer från [NASA Earth Observatory: Black Marble](https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/) och är **public domain i USA enligt NASA:s riktlinjer för bilder**. NASA:s logotyp och märken är skyddade; bilden innehåller ingen NASA-logotyp. Bilden är NASA:s globala JPEG i 3600 × 1800, utan innehållsliga ändringar.
- **Faktarutorna om riken** (`facts` i `data/empires/index.json`) är egna korta sammanfattningar av Wikipedias artiklar om rikena (CC BY-SA). Medeltidens riken (#69) är dessutom kontrollerade mot World History Encyclopedia (CC BY-NC-SA, bara länkad, ingen text kopierad), och de tidigmoderna rikena (#70) mot World History Encyclopedia eller Wikidata (CC0). Kolonialvälden och moderna imperier (#71) bygger på Wikipedia, för det nederländska och tyska väldet, Japan och Etiopien kompletterat med World History Encyclopedia (bara länkad). Artiklarna länkas från rutorna och från källregistret.
- **Herodotos text** (Macaulays översättning, bok 9, [Project Gutenberg](https://www.gutenberg.org/ebooks/2456)) är public domain och används bara som länkad källa för siffrorna i anteckningen om slaget vid Plataiai (#941); ingen text är kopierad.
- **Nordiska uppslagsverk** (Platser-piloten, #579): [Lex.dk](https://lex.dk/) (Den Store Danske, med artiklar från danmarkshistorien.dk) och [Store norske leksikon](https://snl.no/) är märkta "begränsad återanvändning" och används bara som länkade källor för årtal och plats; ingen text är kopierad. Nordisk familjebok (andra upplagan, Uggleupplagan, på [Projekt Runeberg](https://runeberg.org/)) är public domain och används också bara som länkad källa med egna sammanfattningar.
- **Ibn Battutas resor** (`data/routes/ibn-battuta.json`, #1376) är egna korta sammanfattningar av Wikipedias artiklar (CC BY-SA). Att han lämnade Tanger för att vallfärda är också kontrollerat i Samuel Lees översättning av Rihla (London 1829, public domain) på Wikisource. Platsernas koordinater kommer ur Wikidata (CC0).
- **Magellans resa** (`data/routes/magellan.json`) bygger på Wikipedia (CC BY-SA) och Encyclopædia Britannica 1911 (public domain). Stoppens datum (#1377) är dessutom jämförda med Pigafettas berättelse i Blair och Robertsons utgåva, The Philippine Islands, vol. 33 och 34 (1906, public domain, Project Gutenberg).
- **Columbus resor** (`data/routes/columbus.json`) bygger på Wikipedia (CC BY-SA) och Encyclopædia Britannica 1911 (public domain). Stoppens datum på resa 2–4 (#1377) är dessutom jämförda med Majors Select Letters of Christopher Columbus (1870) och Olson och Bournes The Northmen, Columbus and Cabot (1906), båda public domain på Project Gutenberg.
- **Missuppfattningarna** (`data/missuppfattningar.json`, #838) är egna korta sammanfattningar av Wikipedias artiklar (CC BY-SA). Posterna på nivån `two-sources` är dessutom kontrollerade mot en andra källa: NASA (public domain), HISTORY, Smithsonian Magazine, Snopes, Mount Vernon och National Post. De är bara länkade, ingen text är kopierad, och de står i källregistret med licensen "bara länkad".
- **Grönlands historia** (platser-piloten, #579) är kontrollerad mot Lex (Den Store Danske och Trap Grønland, [lex.dk](https://lex.dk/)), [Store norske leksikon](https://snl.no/) och Internationella domstolens arkiv över Fasta mellanfolkliga domstolens domar ([icj-cij.org](https://icj-cij.org/pcij-series-ab)). De är bara länkade källor, även de Lex-artiklar som är märkta CC BY-SA, och ingen text är kopierad; sammanfattningarna är egna.
- **Lektionsturerna** (skolpiloten, #737, #739) kopplas till Skolverkets kursplan i historia (Lgr22) med egna korta formuleringar; kursplanen är bara länkad, ingen text kopierad.
- **Förhistorien och människans spridning** (#1093, #1094) bygger på vetenskapliga artiklar under CC BY, lästa i fulltext via Europe PMC, och några stängda artiklar som bara är länkade (beslut 2026-11-12). Sammanfattningarna är egna och ingen text är kopierad. Platserna som spridningens områden och vågor ritas runt är fyndplatser ur händelserna eller koordinater ur Wikidata (CC0). Artiklarna står i källregistret.
- **Omstridda gränser i nutid** (#644) följer Sveriges officiella hållning enligt Utrikesdepartementets sidor på regeringen.se (bara länkade, ingen text kopierad). Fallen och källorna står i [docs/omstridda-granser.md](docs/omstridda-granser.md). Där Cliopatria saknar gränsen (Västbanken, Östra Jerusalem, Gaza och Golanhöjderna, och Staten Palestina från 2014) kommer den ur Natural Earths omstridda områden (`ne_10m_admin_0_disputed_areas` 5.1.1, public domain), uttagna med `tools/ne_omstridda.py`. Tolv små stater som Cliopatria saknar (#722), och Andorra och Monaco (#719, med Cliopatrias årtal), har dagens gräns ur Natural Earths länder (`ne_10m_admin_0_countries` 5.1.1, public domain), med samma skript, och årtalen för självständigheten ur Wikidata (CC0) och Wikipedia (CC BY-SA, bara länkad).
- **Religionerna** i `data/religions.json` använder gränser från samma Cliopatria-data, sammanslagna per religion och förenklade. Varje rikes religion kommer från faktarutan på rikets Wikipedia-sida (CC BY-SA), och sidorna listas i filen. Årtalen för när en del riken blev kristna kommer från Wikipedia och länkas från källregistret. Ändringar: varje rikes religion räknas fram ur faktarutans text, och ett område behåller sin religion när riket som följer saknar religion i faktarutan (`tools/religioner.py`). Klickrutan använder varje rikes egen, förenklade gräns ur samma Cliopatria-data (`data/religions-polities.json`, `tools/religioner_riken.py`).
- **Utkasten om slag** i `data/utkast/hced.json` kommer från [Historical Conflict Event Dataset](https://whgazetteer.org/datasets/1415/places) (Charles Miller, 2022, Harvard Dataverse, https://doi.org/10.7910/DVN/6ZFC0V) via World Historical Gazetteer. Datasetet har licensen [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), och WHG:s egna tillägg har [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: ett urval, omräknade årtal och egna texter (`tools/hced.py`). Utkasten visas inte på globen förrän de är källkontrollerade.
- **Dödssiffror i krigens berättelser** kommer delvis från [UCDP Battle-related Deaths Dataset](https://ucdp.uu.se/downloads/) (Uppsala Conflict Data Program, version 26.1; Davies, Pettersson och Öberg 2026, *Journal of Peace Research* 63(4)), licensierat under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: summerade per krig och återgivna i egna texter.
- **Krigens år och intensitet före 1989** (till exempel Algeriet och Biafra) kommer delvis från [UCDP/PRIO Armed Conflict Dataset](https://ucdp.uu.se/downloads/) (Uppsala Conflict Data Program och PRIO, version 26.1; Gleditsch m.fl. 2002, *Journal of Peace Research* 39(5); Davies, Pettersson och Öberg 2026), licensierat under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ändringar: start, slut och intensitet återgivna i egna texter.
- **Ikonerna** i `img/icons/`, flaggorna i `img/flags/` och sidans ikon (`img/favicon.svg` med PNG-versioner) är egna teckningar för projektet och licensieras som koden (GPL v3.0).
- **Bilder i faktarutan** (`images/events/`):
  - **Historiska bilder** kommer från [Wikimedia Commons](https://commons.wikimedia.org/) (public domain, CC0, CC BY eller CC BY-SA) och från [Library of Congress](https://www.loc.gov/pictures/) (poster märkta "No known restrictions on publication"). Varje bild behåller sin egen licens, som står i bildtexten tillsammans med upphov och länk till filsidan eller arkivposten. Filsidan eller arkivposten finns i källregistret.
  - **Illustrationer** i en tidsålders bildtradition är tydligt märkta "inte en historisk bild" i bildtexten. Verktyg, datum och prompt sparas i händelsens fält `image` (`data/handelser/`). De licensieras under CC BY 4.0 som övrig data, i den mån de alls omfattas av upphovsrätt.
  - **Platshållare** märks "Platshållare" tills den riktiga bilden finns.
- **Upptäcktsvyns kartbilder** (`images/karta/`) är beskurna detaljer ur Olaus Magnus *Carta marina* (1539) och Guillaume Brouscons världskarta (1543, Huntington Library), via [Wikimedia Commons](https://commons.wikimedia.org/), public domain. Ändringar: beskurna med mjuk oval kant och förminskade. Filsidorna finns i källregistret, och krediten står i teckenförklaringen när upptäcktsvyn är på.
- **Dirigenten och orkestern** i `.orchestra/shared/` kommer från [solwation/dirigenten-och-orkestern](https://github.com/solwation/dirigenten-och-orkestern) och har MIT-licens. Det är instruktioner för AI-agenter, inte en del av sidan.
- **three.js** laddas från jsDelivr och har MIT-licens. Typsnitten kommer från Google Fonts (SIL Open Font License).
- Händelsetexterna är egna sammanfattningar. Källorna, ofta Wikipedia (CC BY-SA), länkas från varje uppgift.
- **Store norske leksikon** (snl.no) och **Lex** (lex.dk, Den Store Danske) används som länkade kontrollkällor för årtal och plats, till exempel för händelserna om Aotearoa/Nya Zeeland (#579). De flesta artiklarna har en begränsad licens; ingen text är kopierad, och artiklarna står i källregistret.

Namnet "Historia-globen" omfattas inte av licenserna ovan.

Copyright © 2026 Rikard (DasKrokodil). Projektet är hans; att bidra innebär inget medägande.
