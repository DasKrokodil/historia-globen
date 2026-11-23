# Filstruktur

Alla filer och mappar i repot med en rad om vad var och en gör. Flyttat ordagrant ur [CLAUDE.md](../../CLAUDE.md) 2026-11-23 (del av [beslutet 2026-11-23](../beslut/2026-11-23-farre-granskningar-sparar-tokens.md), punkt 5) för att kärnan ska bli kort. Reglerna är oförändrade.

```
index.html
CONTENT-LICENSE.md   sammanfattning av licenser för kod, data och bilder
THIRD-PARTY-NOTICES.md licenser för externa komponenter och datakällor
AGENTS.md             regler för Codex och andra agenter; pekar på CLAUDE.md
_headers              Cloudflare Pages cache-regler (no-cache, så att en release inte blandas med gamla filer)
css/style.css
js/main.js            startar allt och kopplar ihop delarna
js/controllers/       main.js uppdelad i val, fokus, faktarutor, omritning, uppspelning, berättelse, etiketter (#402), adressen (#501), tidsintervallet (range.js, #755), raden om en trasig länk (link-notice.js, #1324), återgång efter hopp (jump-back.js, #997), tryck på platsens kontur (places.js, #1161), fokus när faktarutan stängs (detail-focus.js, #1436) och presentationsläget (presentation.js, #488, #1315)
js/controllers/region.js regionvyn i Platt vy: knappen "Visa i regionvy", ramen, rutan, markörerna och listan som hör ihop, Escape och vägen ut (#1641, #1642)
js/model.js           språk, kategorier, granskningsstatus, tidsformat, laddning
js/i18n.js            språkval och gränssnittets texter: ui('nyckel') ur data/ui/<språk>.json och data-i18n i index.html (#63)
js/url-state.js       adressformatet för delbara länkar och Bakåt/Framåt (#501, #64)
js/search-index.js    sökningens index och matchning (#570)
js/place-search.js    "Vad hände här?": platsförslag och händelser inom 300 km, i tidsordning (#15)
js/region-frame.js    regionvyns ramning: vilka platser som får vyn (högst 5 grader på marken i Platt vy, 15–60 grader på globen), den fria ytan, skalan med cos(mittbredden) och globflygets ram; delas med testerna (#1641, #1644)
js/region-markers.js  regionvyns markörer: numrering i listans ordning, brickan för hela platsen, högar, solfjäder och ortnamn utan krockar; delas med testerna (#1642)
js/area-lookup.js    punkt mot rike med marginal: vilket rike eller religionsområde en punkt ligger i, annars det närmaste inom 0,05 grader (#1524), delas med testerna
js/place-geo.js       vilka händelser som ligger inom en plats gräns, platsen under en punkt vid tryck och gränsrutan för inramning i Platt vy, delas med testerna (#579, #1161)
js/route-steps.js     stegningen mellan en resas stopp: Föregående och Nästa stopp i pausraden (#1380)
js/theme-stops.js     stoppen när man följer en plats eller ett tema: urval och ordning, flera samma år köas (#1255, #1620)
js/date-events.js     återanvändbart urval av händelser för år eller exakt datum (#483, #489, #485)
js/state.js           det gemensamma tillståndet (år, fokus, lager, filter) som lagren läser (#338), med åtgärder, prenumeration och JSON (#403), och lägeskontraktet (#893); teman och platser är fokustyper, inga egna lägen
js/surfaces.js        stängregistret för ytor: menyerna och sidopanelen anmäler sig i grupper och en öppnad yta stänger sin grupp (#894)
js/globe.js           3D-globen, kamera, styrning, ekvirektangulära canvasar, bågar
js/start-view.js      startbilden: kameran och startzoomen utan delad adress (#1317), delas med testerna
js/globe-detail.js    skarpt utsnitt av kartan vid inzoomning: samma ritning i högre upplösning för det som syns
js/period-range.js    epok som intervall: periodToRange klipper vid tidslinjens början och går till i dag för öppna perioder (#965)
js/timeline.js        tidsreglage, segmenterad skala, uppspelning
js/time-scale.js      människans två skalposter, Före 3000 f.Kr. och 3000 f.Kr.–i dag: segment, skalstreck, skarvar, minsta fönster, upplösning, steg, fart och gränser, och `scaleForYear` som väljer post ur året (#1511, #1958)
js/layers/registry.js lagerregistret: ritordning, Lager-menyn, uppdatering och toning (#338)
js/layers/index.js    listan över lagren i Lager-menyns ordning; ett nytt lager läggs till här (#338)
js/focus/             fokustyperna som poster (#1327): registry.js (registret och kontraktet), index.js (listan) och en fil per typ (krig, rike, religion, resa, tema, plats)
js/layers/area-style.js  mjuk kant för osäkra gränser och prickat inflytande (lydriken)
js/layers/area-transition.js  mjuk övergång när ett rike byter period, delas eller slås ihop (#78)
js/layers/areas.js    lager: riken som områden som ändras över tid
js/layers/borders.js  lager: dagens landsgränser (av som standard)
js/layers/empiremarks.js rikenas symboler mitt i områdena, som klickbara markörer (#301)
js/layers/origins.js  religionens symbol där den uppstod, som klickbar markör (#271)
js/layers/places.js   lager: konturen av platsen man följer i Fokus (#579) och de prickade konturerna runt platser med kort när man har zoomat in (#1161)
js/layers/religions.js lager: religioner som områden, med symboler i områdena (#271)
js/layers/wars.js     lager: krigsområden runt krigets slag
js/layers/events.js   punktlager: händelser
js/layers/lines.js    linjelager: vägar och resor som ritas fram över tiden (#38)
js/layers/images.js   bildlager: tidsstyrda rasterbilder ur data/bildlager.json på kartans lagerbild (#54, #1325)
js/layers/discovery.js upptäcktsvyn: gammal kartstil, havsmonster och dimma som resorna lyfter (#101)
js/layers/spread.js   människans spridning: antagna områden och vågor i förhistorien som tolkningar (#1094)
js/ui/clusters.js     klustring av händelser som ligger nära varandra
js/ui/focusmenu.js    fokusmenyn: välj ett krig, rike eller en religion att följa
js/ui/help.js         kort hjälp i tre steg för nya besökare (knappen Hjälp)
js/ui/layers.js       lagerväljaren: slå av och på lager
js/ui/sheet.js        faktarutan som ark nedifrån i mobilen (litet, halvt, helt)
js/ui/viewmenu.js     mobilmenyn Meny (Lager, Fokus, Turer, Platt vy, Kom igång, Källor, Hjälp, #530)
js/ui/zoomlevels.js   vad som syns på vilken zoomnivå: tre nivåer och tröskelvärden (#358)
js/ui/areacurve.js    rikets yta över tid som SVG-kurva i faktarutan (#77)
js/ui/citation.js     kopierbara hänvisningar till händelsens registrerade källor (#844)
js/ui/legend.js       teckenförklaring, klickruta för religioner och information om dämpade lager (#166, #235)
js/ui/level-switch.js nivåväxlaren: en rad knappar för nivåer i ordning med en dörr (pil) vid kanten; används för tidsreglagen "Före 3000 f.Kr." och "3000 f.Kr.–i dag" och delas med lägesväxlaren i #1517 (#1959)
js/ui/status.js       gemensam statusrad för skärmläsare med prioritet för faktarutans rubrik (#1419)
js/ui/panel.js        "Samtidigt i världen" per världsdel, filter, detaljvy
js/ui/funfact.js      Samtidigt-kortet (fun facts m.m.) och bågar
js/ui/sources.js      sidan Om källorna
js/ui/flatmap.js      Platt vy: platt karta med zoom och panorering
js/ui/region-marks.js regionvyns numrerade markörer, bricka, högar och ortnamn som knappar och på kartans canvas (#1642)
js/ui/globe-region.js samma markörer ovanpå globen när den har flugit in till en stor plats (regionvyn på globen, #1644)
js/ui/poster.js       A4-affisch som PNG från Platt vy
js/ui/routepop.js     klickrutan för vägar och resor
js/ui/intro.js        frivillig introduktion till samtidighet i tre stilla steg (#363)
js/ui/quiz.js         quizet "Vad hände samtidigt?" från För lärare, frågor ur befintliga fun facts (#65)
js/ui/teacher.js      "För lärare" under Mer: lektioner, utskrift, quiz, jakt och knapp för presentationsläget; kortet är en dialog i stängregistret (#1315)
js/ui/print-sheet.js  utskrift av en lektionstur: elevblad och lärarblad ur turens lärarfält (#738)
js/ui/uppdrag.js      elevuppdraget Samtidighetsjakten från För lärare, med knappen i faktarutan (#741)
js/uppdrag-rules.js   jaktens regler: år, världsdel och vad som räknas, delas med testerna (#741)
js/quiz-rules.js      quizets regler: frågor och säkert felaktiga svar, delas med testerna (#65)
js/samtidighet.js     definitionen av "samtidigt" och "nära i tid" för fun facts, quiz och jakt, delas med testerna (#1311)
js/paragraphs.js      långa faktatexter i korta stycken, ren presentation: orden är desamma, delas med testerna (#1571)
js/ui/viewmode.js     vyväljaren: Glob, Platt karta och Upptäcktsresor (#651)
js/ui/tour.js         guidade turer: spelar upp en tur ur data/turer/ steg för steg (#47)
js/ui/lesson.js       lektionsläget: länken m=lektion döljer menyerna, låser år och lager och visar bandet med "Visa hela globen" (#795)
js/tour-format.js     turformatets kontroll, delas med testerna (#47)
js/ui/feedback.js     formuläret för besökarnas förslag (avstängt som standard, docs/feedback.md)
js/feedback-rules.js  förslagens kategorier, gränser och validering (delas med functions/)
functions/api/feedback.js  Cloudflare Pages Function som skapar issues i ett privat repo (enda undantaget från punkt 1)
tests/                tester för functions/ och CSS-lagerordningen (#1065) med node:test (node --test 'tests/*.test.mjs')
tests/webblasare.mjs  webbläsartest med Playwright, körs i GitHub Actions för varje PR (#339); delas i tre Chromium-jobb med BREDD, ENDAST och UTAN (tests/urval.mjs, tests/jobb.json, #864)
tests/regionfokus.mjs fristående Playwright-kontroll av fokus från platskort till karta, 1280/400 px och reducerad rörelse (#1950); node tests/regionfokus.mjs <port>
data/LICENSE          licens för data: CC BY 4.0
data/handelser/       händelserna, en redigeringsfil per period (fkr.json, 1-1499.json … 1946-1979.json, 1980-.json); här redigeras händelser (#394)
data/events.json      alla händelser i en fil, byggs av tools/dela_data.py ur data/handelser/; redigeras inte
data/funfacts.json    fun facts (kopplade till händelse-id)
data/missuppfattningar.json vanliga historiska missuppfattningar: påstående, vad källorna säger och ursprung (#838); visas i faktarutan för händelserna i `events`
data/platser.json          platser: kort om platsers historia med dagens gräns som kontur, följs i Fokus (#579); gränserna hämtas med tools/platser_gransar.py ur Natural Earth
data/quiz.json        quizets tidsfrågor (Vad kom först?, Vad låg närmast?, #846); pekar bara på händelser med id, svaret räknas ur deras årtal
data/upptackt-europa.json Europa som hemregion i upptäcktsvyn, lyft från början (#872); byggs med tools/europa_dimma.py ur Natural Earth
data/bildlager.json   bildlager: tidsstyrda rasterbilder och deras källor, bland annat nattljus och istidens kust (#54, #1325)
data/teman.json        teman: namngivna urval av händelser som följs i Fokus (#398); innehåller temat Teknik (#105)
data/perioder.json    epoker i fyra indelningar: Lgr22 (fem perioder), Nordens forntid (stenålder, bronsålder, järnålder enligt Historiska museet), antiken och industrialiseringen, med årtal, källa och förenklingstext; epokknapparna i intervallformuläret läser den (#845, #965)
data/intro.json       introduktionens steg och referenser till befintliga händelser/fun facts (#363)
data/uppdrag.json     elevuppdragen (Samtidighetsjakten): år, spann, antal världsdelar och texter (#741)
data/turer/           guidade turer: index.json och en fil per tur (#47, beslut 2026-11-01)
data/sources.json     källregister
data/version.json     versionsnummer och länk till releaserna
data/licenses.json    genererat register över källornas licensuppgifter (#393)
data/borders.json     dagens landsgränser (Natural Earth)
data/land.json        grundkarta: Natural Earth 1:50m, färdigprojicerad SVG-path i 4096×2048
data/land-10m.json    finare kust: Natural Earth 1:10m, samma format; laddas först när utsnittet vid inzoomning används (tools/land_10m.mjs)
data/empires/         riken: index.json och en fil per rike, byggs med tools/riken.py ur Cliopatria
data/routes/          vägar och resor: index.json listar filerna, en fil per resa eller väg (#38)
data/genererat/       händelser och riken uppdelade i mindre filer som sidan laddar (#337), med en fil per språk ovanpå (#675); skrivs av tools/dela_data.py, redigeras inte
data/oversattning.json spärren mot oöversatta texter och registret över översättningar (#675); skrivs av tools/oversattning.py, publiceras inte
data/ortnamn-komplettering.json orter som Natural Earth saknar, med namn och punkt ur Wikidata (CC0), som tools/ortnamn.py lägger till (#1676); publiceras inte
data/textlangd.json   spärren mot långa faktatexter: sammanfattningar över 300 tecken per fil, som bara får minska (#1599); skrivs av tools/textlangd.py, publiceras inte
data/upptackt.json    upptäcktsvyn: perspektivrad, dimma och kartbilder (#101)
data/ortnamn/         ortnamn för regionvyn (#1643): en fil per plats med orter, grannländer och hav på fem språk ur Natural Earth; skrivs av tools/ortnamn.py, redigeras inte
data/spridning.json   människans spridning: områden och vågor med platser ur händelser och Wikidata (#1094)
data/vyer.json        grupperna och de förinställda vyerna i Lager (#357)
data/ui/              gränssnittets texter: sprak.json (språken, vem som översatte och granskade) och en fil per språk (#63)
data/religions.json   religioner som områden (statsreligion per rike ur Cliopatria) och faktarutor
data/religions-polities.json  rikenas områden per religion och period, laddas vid klick (tools/religioner_riken.py)
data/styles.json      bildstilar efter tidsålder och plats (ramar och promptar)
data/utkast/          utkast från massimport (draft), läses inte av appen; hced.json byggs med tools/hced.py, bildkandidater/ med tools/bildkandidater.py och bildbatch/ med tools/bildbatch.py (granskningslistor, #2183); program skriver bara hit (beslut 2026-11-22)
images/events/        bilder till händelser, <händelse-id>.webp, 800 × 600
images/licenses.json  genererat register över händelsebildernas licenser (#393)
images/karta/         kartbilder till upptäcktsvyn (public domain, ur gamla kartor)
images/lager/         bildlagrens bilder: nattljus 2016 (NASA) och istidens kust, en bild per modellsteg 10 000–80 000 år sedan (#1096)
images/incoming/      Rikards nya bilder, innan de konverteras
img/                  sidans ikon, markörernas symboler i icons/ och rikesflaggorna i flags/
schemas/              JSON Schema för innehållsformaten, bland annat händelser, riken, turer, teman, platser och bildlager
tools/                hjälpskript som körs för hand; tools/license_manifests.py genererar licensmanifesten, och dela_data.py körs efter ändring i data/handelser/ eller empires/index.json
docs/                 dokumentation: produkt (vision, användare, användningsfall, UX, granskningslinser i docs/produkt/), arkitektur, datamodell, beslutslogg, källarbete, bildpromptar, publicering (DEPLOYMENT.md), besökarnas förslag (feedback.md), externa granskningar (granskningar/)
scripts/              build-site.sh kopierar webbplatsens filer till dist/ och kör validate-site.py (publicering, ingen kodändring); pages-function-check.sh startar formulärets funktion som Cloudflare (#663); kontrolltackning.mjs bevisar att varje webbläsarkontroll ligger i exakt ett CI-jobb (#864)
.orchestra/           dirigenten och orkestern: project.md (projektets policy) och shared/ (fäst version, redigeras inte)
```

Nya lager läggs i `js/layers/`, ny UI i `js/ui/`, ny data i `data/`. Uppdatera filstrukturen i README.md när den ändras.
