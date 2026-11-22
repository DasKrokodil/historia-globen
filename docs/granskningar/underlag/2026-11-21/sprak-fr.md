# sprak-fr: granskning före v6.5.0

## Omfattning och stickprov
- Underlag: `andrade-texter-fr.md`, 1 544 nya eller ändrade franska texter sedan `1a981da0`. Jämfört med svenskan och med texten före ändringen.
- **`data/ui/fr.json`:** alla 153 nya och ändrade nycklar är lästa. Kontrollerat också att alla 912 svenska nycklar finns på franska.
- **Stickprov i innehållet, cirka 560 texter:**
  - `data/handelser/1900-1945.json`: rad 1–150 alla (Rifkriget, Mexikanska revolutionen, första världskriget fram till Somme), sedan varannan rad av 151–286. Cirka 218 av 286.
  - `data/empires/index.json`: alla korta texter (namn, flaggor, symboler, Romarrikets tidslinje), cirka 300 av 495, plus fem små rikesfiler. Långa rutor "Om kartan" bara i stickprov.
  - `fkr.json` var femte rad (45 av 223). Övriga händelsefiler var sjätte rad (cirka 25).
  - Alla nya eller ändrade texter i `funfacts`, `missuppfattningar`, `platser`, `teman`, `turer/*`, `uppdrag`, `upptackt`, `vyer` och `styles` (cirka 55).
  - Varannan rad i `spridning`, `routes/*`, `bildlager` och `romarriket.json` (cirka 50).
- **Typografi, mätt med skript på alla 1 544 texterna:**
  - **0 texter** bryter mot mellanrumsregeln: vanligt mellanslag före `: ; ? ! »` eller efter `«`, saknat mellanrum, U+202F, eller tal med vanligt mellanslag.
  - `tests/typografi-fr-es.test.mjs` är grön.
  - **Felet från v6.4.0 är alltså rättat** (cirka 250 texter och 11 nycklar i #1715).
  - Inga felaktiga former av `av. J.-C.` eller `apr. J.-C.`.
- **Oöversatta franska texter:** 7 674 → 7 305. Ingen fil har ökat, och `tools/oversattning.py --check` ger kod 0. I 1900–1945 är 64 kvar (304 förut).
- **Layout:** sidan provad med Playwright med `?lang=fr` i 400 och 1280 px.
  - Ingen horisontell scroll.
  - Tidsreglagets knappar *Avant 3000 av. J.-C.* och *De 3000 av. J.-C. à aujourd’hui* får plats (högerkant 384 av 400 px).
  - Fliken *Pays et provinces historiques* får plats i 1280 px.

## Blockerande
Inget.

## Bör rättas
1. **`panel.earlier` och `panel.earlierDays` säger "il y a {n} ans" (för n år sedan). Svenskan säger "{n} år före".**
   - *Il y a* räknas från i dag. På samma sida betyder `detail.yearsAgoShort` "≈ il y a {n} ans" just "från i dag" (#1979). I förhistorien står alltså samma uttryck med två betydelser.
   - Engelskan säger "years before". Svenskan valde medvetet "före" och inte "sedan" (`docs/produkt/13-ordlista.md`: "4 år före (1912)", "om 2 år (1918)").
   - Förslag: `['{n} an avant', '{n} ans avant']` och `['{n} jour avant', '{n} jours avant']`, och gärna `['{n} an après', '{n} ans après']` för `panel.later*`, så att paret blir lika.
   - Ändrades i 739663e6 (#1306). Tyskans *vor* och spanskans *hace* har samma risk; det är en fråga till sprak-de och sprak-es.
2. **`rifkriget` (story.parties): "la Légion étrangère nouvellement créée" (sv "den nybildade Främlingslegionen").**
   - En fransk läsare tänker på den franska Främlingslegionen, som också stred i Rifkriget, men på Frankrikes sida.
   - Förslag: "la Légion espagnole (Tercio de extranjeros), nouvellement créée". Det är namnbyte för samma förband, ingen ny fakta.
   - Historikern bör bekräfta att svenskan menar det spanska förbandet. Antagande: ja, eftersom Franco nämns som befälhavare.
3. **Flaggetiketter där sv "från ÅÅÅÅ" blev "de ÅÅÅÅ" ("flaggan från år ÅÅÅÅ" i stället för "flaggan sedan år ÅÅÅÅ").** I samma fil står annars "depuis 1996" och "à partir de 1948".
   - Det gäller `irak` ("Drapeau irakien de 1963", "de 1991", "de 2004", "de 2008"), `saudiarabien` ("de 1973"), `turkmenistan` ("de 2001"), `belarus` ("de 2012"), `libanon` ("de 1943", "de 1990") och `nordmakedonien` ("Drapeau de la République de Macédoine de 1992").
   - Förslag: "depuis …" för den flagga som gäller i dag, och "à partir de …" för de övriga. Allt i `data/empires/index.json`.
4. **Fallbacknamnet `tour.button` = "Parcours".** Datan (`data/turer/index.json` labels.button) och 19 nycklar i fr.json säger *visite*/*Visites*. Förslag: "Visites".
5. **`romerska-kungadomet` = "royaume de Rome", med gemen** (`data/empires/index.json` och `data/empires/romarriket.json`). Ordlistan §16 säger att första ordet i ett rikesnamn får versal. Förslag: "Royaume de Rome".
6. **"Licence : Public domain" står kvar i 29 franska bildtexter.** Ordlistan §16 säger "Licence : domaine public", som 41 andra bildtexter redan har.
   - Exempel som ändrades i den här omgången: `tiwanaku`, `nan-madol-byggs`, `mesa-verdes-klippbostader`, `kievrus-kristnas`, `slaget-vid-hattin`, `sagan-om-genji`, `slaget-vid-plassey` och `batavia-forliser`.
   - Rättas med ett skript, med samma U+00A0 före kolon.
7. **`natet-fran-antrea` (fkr): "au fond du lac à Ancylus".** Ancylus är sjöns namn, så det ska vara "au fond du lac Ancylus".
8. **Redan känt: #1715.** Fortfarande öppet och inte rättat sedan v6.4.0:
   - `hunt.timeYear` "n'a pas eu lieu en {year}" (sv "pågick inte") och uppdraget `samtidighetsjakten-1945` "ont eu lieu en 1945" (sv "pågick"). Förslag som förut: "n'était pas en cours en {year}" och "étaient en cours en 1945".
   - `legend.spreadCoastModel` "la couche Côte de l'ère glaciaire … cette couche". Ska vara *calque* enligt §16.
   - `layer.funfactsNote` "la fiche". Ska vara "la carte".
   - `teacher.printText` "le lien avec le programme", utan förklaring av Lgr22.
   - `data/perioder.json` "Les sources diffèrent" (två ställen), som ska vara "divergent". Där står också "classes 4 à 6 / 7 à 9" utan "(numérotation suédoise)".
   - Samtidighetsjakten har fortfarande två namn: `top.hunt` "Chasse au même moment" och `range.blocked` "la chasse à la simultanéité".
   - *Fiche* används både för faktarutan och för platskortet.
   - Rakt `'` och krökt `’` blandas i alla stora filer. Ett exempel: i `data/empires/index.json` står 885 raka och 668 krökta, och samma lista har "Drapeau de l'Angola" och "Drapeau de l’Équateur".
   - "7500" ska vara "7 500" i `bildlager.json` `istidens-kust` ("80 000–7500 ans"; `legend.spreadCoastToday` har redan "7 500").
9. **Redan känt: #1710.** `samtidighetsjakten-1945` har vous ("Trouvez", "Vos trois événements", "Regardez"), medan uppdragen för år 1000 och 1500 har tu. Det väntar på beslutet om tilltal för åk 7–9 i #1710 och tas inte upp igen här.

## Smått
- **Datumspann skrivs olika i källanteckningarna.** Det står "donne le 26–30 août 1914" och "le 22 juillet–9 août 1921" (`slaget-vid-tannenberg-1914`, `forsta-slaget-vid-marne`, `slaget-vid-somme`, `slaget-vid-annual`, `slaget-vid-celaya`, `decena-tragica`, `mexikanska-revolutionen` och `coniston-massakern`), men andra ställen i samma fil skriver "du 29 juillet au 11 août 1921". Förslag: "du … au …" överallt.
- `belagringen-av-kut` skriver "anglo-indienne" och `slaget-vid-tanga` "britannico-indienne": välj en form. `gallipolifalttaget` har "1915-1916" med bindestreck, men annars används tankstreck.
- `slaget-vid-jylland`: meningen börjar med en siffra, "14 navires britanniques …". Förslag: "Quatorze navires …".
- `rifkriget` (casualties): "Selon le recensement de la source" betyder "folkräkning". Svenskan säger "sammanställning", alltså "Selon le décompte de la source".
- `fordraget-i-ciudad-juarez` och `plan-de-ayala`: "La fiche Wikidata". Förslag: "L'élément Wikidata" (Wikidatas franska term), så att *fiche* inte får en tredje betydelse.
- **Uttryck som låter konstigt på franska:**
  - `detail.yearsAgo`: "{year} correspond donc à ≈ il y a {n} ans" (à + il y a). Förslag: "… correspond donc à environ {n} ans avant aujourd’hui".
  - `sutlej-lamnar-sin-gamla-dal`: "peu après il y a 8 000 ans". Förslag: "un peu après 8 000 ans avant le présent".
  - `pil-och-bage-i-fa-hien-lena`: "d’au moins 48 000 à 34 000 ans". Förslag: "entre au moins 48 000 et 34 000 ans".
  - `baturs-kalderor`: "s’est effondré … s’effondra" blandar tempus och upprepar verbet.
- `feedback.server.busy` "C’est complet pour le moment" passar bättre om en restaurang än om en server. Förslag: "Le service est saturé pour le moment."
- `vagnshjulen-i-novokorsunskaja`: "tombe à char". *Char* låter som stridsvagn; Majkopgraven är en vagnsgrav, så "tombe à chariot".
- `nanjingmassakern`: "la république de Chine". Som statens namn: "la République de Chine".
- `zheng-he-resa-5` och `-6`: "repère à Nankin". Gränssnittet säger annars *marqueur* (ordlistan §17, regionvyn).
- Rikenas faktarutor har två rubriker för samma sak: "Dirigeants connus" (`romarriket`) och "Souverains célèbres" (`texcoco`). Välj en.
- `raddningen-av-de-danska-judarna`: "Lex" säger ingenting för en fransk läsare. Förslag: "l’encyclopédie danoise Lex" första gången (gäller också `kgh-far-handelsmonopol`).
- **Ord som har lagts till i översättningen och inte finns i svenskan.** Inga sakfel, men regeln säger samma innehåll:
  - `kamkeramikernas-byteshandel`: "du Finnmark au nord jusqu’à la Vistule au sud".
  - `utbrotten-i-ksudach`: "dont trois pendant l’Holocène, après la période glaciaire" (sv "tre av dem efter istiden").

## Möjliga sakfel till andra experter
- **Till historikern: `forsta-varldskriget`, takeaway 1.**
  - Svenskan "Det klarade inte oron mellan krigen, och det bidrog till att andra världskriget bröt ut" går att läsa på två sätt.
  - Franskan (och engelskan) säger att Nationernas förbund självt bidrog: "elle contribua". Tyskan och spanskan säger att misslyckandet bidrog: "das trug dazu bei", "esto contribuyó".
  - Kontrollera mot källan `wp-world-war-i` vilket som menas och förtydliga svenskan. Förslag på franska om det är misslyckandet: "…, ce qui contribua au déclenchement …".
- **Till historikern: `slaget-vid-somme`, bildtexten.** Engelskan, spanskan och franskan säger "support trench" / "trinchera de apoyo" / "tranchée de soutien", men svenskan och tyskan säger bara "skyttegrav". Antingen läggs "stödskyttegrav" till i svenskan (om filsidan säger så), eller så stryks ordet i de tre språken.
- **Till historikern: `rifkriget`.** Vilken legion menas, se punkt 2 under Bör rättas.
- **Till UX/tillgänglighet (gäller alla fem språk, inte bara franskan):** Sök och följ har två flikar och två grupper med samma namn, "Empires" och "Empires".
  - I svenskan heter både `focus.tab.empires` och `focus.tab.vanished` "Riken", efter beslutet i #1957.
  - På skärmbilden med `?lang=fr` i 1280 px syns "EMPIRES (401)" och "EMPIRES (11)" efter varandra.
  - Jag hittade inget öppet issue om det (sökt på "Riken två flikar" och "Försvunna länder Riken"). Antagande: det är ett oavsiktligt resultat av namnbytet.

## Ej kontrollerat
- Inga webbkällor öppnade, eftersom webbverktyg saknas i den här körningen. Rikesnamnen (*Allemagne nazie*, *Califat rachidun*, *Khaganat kirghize du Ienisseï*, *Empire Kara-Khitan*, *Dynastie des esclaves*, *Qarakhanides* m.fl.) är jämförda med ordlistans kontrollerade rader (§9 och följande, kontrollerade 2026-11-20 i #2002, #2007 och PR #2037/#2042) och stämmer med dem. Jag har inte öppnat fr.wikipedia själv.
  - *Qarakhanides* (`kara-khanid-ost`, `kara-khanid-vast`) har ingen rad med källa i ordlistan.
  - "Royaume du Kongo" och "Empire d'Oyo" från #1715 finns inte bland ändringarna här; Oyo heter fortfarande "Royaume d'Oyo".
- **Inte lästa fullt:**
  - långa rutor "Om kartan" i `data/empires/index.json` (cirka 190)
  - spridningens långa texter efter rad 24
  - var femte rad i `fkr.json` utanför stickprovet
- **Layouten i 400 px för Sök och följ** (fliken *Pays et provinces historiques*) är inte mätt, eftersom menyn inte öppnades i mobilläget i mitt skript. I 1280 px får den plats.
