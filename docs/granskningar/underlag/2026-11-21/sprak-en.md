# sprak-en: granskning före v6.5.0

## Omfattning och stickprov
- Jämförelse 1a981da0..HEAD (1cc19f79). Underlag: andrade-texter-en.md (746 texter).
- **data/ui/en.json: alla 141 nya och ändrade nycklar lästa fullt** mot sv.json. Dessutom ett maskinprov av hela en.json: inga nycklar saknas, platshållarna stämmer med sv, och nycklar med å/ä/ö listades.
- **Stickprov i innehållet: 112 av 605 texter**, lästa mot svenskan:
  - `data/empires/index.json` och rikesfiler (cirka 45): romarriket ×4, alexanders-rike ×5, inkariket, vasttyskland ×4, irak ×9, ecuador ×4, lettland ×3, bosnien-och-hercegovina ×3, hariphunchai ×3, mamlukdynastin-i-delhi ×3, tibet, brittiska-imperiet, aksumriket och texcoco. Dessutom alla 41 namnrader i rikesfilerna, jämförda med ordlistan §9.
  - `fkr.json` (25), till exempel cheopspyramiden, slaget-vid-weifloden, sutlej, palksundet, jerimalai, maninjau, batur, sundaland, antrea, kamkeramikerna, naltjik, novokorsunskaja, majkopkurganen, bajkal, berings sund, zjochovön, ksudach och teouma.
  - Händelser 1–1945 (cirka 30, mest bildtexter): kairo, hawaii, basel, saratoga, narva, sydney-1789, gondar, lund, sarajevo, tsingtao, kut, midway, d-dagen, hiroshima, appomattox, somme, gallipoli och fler.
  - Turer och resor: alla 13 i `det-har-har-du-hort`, `andra-varldskriget`, `turer/index.json`, `hur-vet-vi-det-har`, `vad-vet-vi-egentligen`, zheng-he ×4, magellan, platser och vyer.
- **Maskinkontroll av siffror** i alla 605 innehållstexter (sv mot en, normaliserat). Alla 10 avvikelser är omräknade århundraden ("1500-talet" blir "16th century"), och samtliga är rätt.
- Maskinkontroll av tusentalsavgränsare och amerikansk stavning.
- Status för de engelska punkterna i #1715 är kontrollerad (se Bör rättas, punkt 4).

## Blockerande
Inget sakfel i engelskan. En punkt bryter mot språkregeln och bör avgöras före releasen: dirigenten avgör om den blockerar.

1. **27 nya `feedback.*`-nycklar i `data/ui/en.json` står på svenska.** Antalet oöversatta gränssnittstexter har därmed ökat.
   - **Var:** nycklarna kom in i #1901 (commit 4383f8b0). Det gäller `feedback.category.new-event|correction|feature|other`, `feedback.objectYear`, `feedback.count`, `feedback.sending`, `feedback.turnstileLoadFailed`, `feedback.waitForTurnstile`, `feedback.receiveFailed`, `feedback.networkFailed`, `feedback.sendFailed`, `feedback.errorSummary.*`, `feedback.error.*` och `feedback.server.*`.
   - **Bevis:** de är identiska med sv.json, till exempel `"feedback.server.busy": "Det är fullt just nu. Vänta en stund och försök igen."`. de, es och fr har riktiga översättningar av samma nycklar.
   - **Följd:** formuläret är påslaget (`data-sitekey` och `data-privacy="approved"` i index.html rad 378). En engelsk besökare som trycker "Send a suggestion" får en svensk rullista och svenska felmeddelanden. `tools/oversattning.py` granskar bara innehåll, inte `data/ui/`, så spärren märkte inget.
   - **Förslag:** översätt de 27 nycklarna, till exempel "Suggest a historical event", "Report a factual error", "Suggest an improvement to the website", "Other feedback", "year {year}", "{n} of {max}.", "Sending …", "Correct one field:", "Correct {n} fields:" och "Choose what your suggestion is about.". Lägg till ett prov som stoppar svenska tecken (å, ä, ö) i en.json utanför `_om`.
   - **Större brist, redan före v6.4.0:** formulärets markup i `index.html` (rad 377–450: rubrik, etiketter, integritetstext och knappar) saknar `data-i18n` och är svensk på alla språk. Det bör bli ett eget issue. Jag hittade inget befintligt; sökt på "formuläret svenska", "feedback i18n" och "fb-form".
   - **Vem:** Codex eller Claude Code (`översättning`-undantaget). Markup-delen är en kodändring.

## Bör rättas
1. **"Teacher tools" finns inte i gränssnittet.** Knappen heter "For teachers" (`top.teacher`, `help.teacherBtn`).
   - Lärarfälten skriver "Open Teacher tools" eller "Teacher tools" i `data/turer/andra-varldskriget.json` (ändrad text i den här releasen), `vikingatiden-och-varlden.json`, `hanrikets-fall.json`, `songhairikets-fall.json` och `vastroms-fall.json`.
   - Förslag: "Open For teachers" eller "Open the For teachers menu", som `help.teacherBtn`.
   - Inget befintligt issue ("Teacher tools" sökt).
2. **Svenska skolbegrepp utan förklaring i nya texter.**
   - `det-har-har-du-hort` `audience`: "Upper secondary school". Förslag: "Swedish upper secondary school (ages 16–19)".
   - `hur-vet-vi-det-har` `audience`: "About ages 12–13". Förslag: "Ages 12–13 (approx.)" eller "Around age 12–13".
   - Det är samma mönster som "years 7–9", som är **redan känt: #1715** och fortfarande öppet (`tour.lessonMeta` "Lesson · years {grades}" och lärarfälten "history in years 7–9").
3. **Ordlistan säger fortfarande "close-up map" för regionvyn.**
   - `docs/ordlista-oversattning.md` rad 517 och 523 anger "close-up map" och "Show in the close-up map".
   - Enligt beslutet `docs/beslut/2026-11-18-namn-pa-platsens-karta-1948.md` heter vyn nu "Platsens karta", och en.json följer det ("Place map", "Show on map", "Leave the place map"). Beslutsfilen säger själv att ordlistan berörs.
   - Förslag: byt raderna till Place map / Show on map, så att nästa översättare inte återinför "close-up map". Dokumentändring.
4. **#1715, engelska: allt är fortfarande öppet.** Inget av följande är rättat sedan 2026-11-15:
   - "years 7–9"
   - `teacher.printText` ("the grade", "the link to the curriculum")
   - "Whoever reports gets noticed" i `vad-vet-vi-egentligen`
   - `turer/index.json` `labels.group-tid` = "At the same time in the world", som enligt ordlistan §5 ska vara "Meanwhile in the world"
   - "Realms" i `place.empires`, `place.empiresNote` och `place.empireGap`
   - "second floor" i `tornet-i-pisa-grundlaggs`
   - "assimilation" i `stadsstaten-cusco-grundas` och "deported" i `larda-i-timbuktu-sankore`
   - blandade apostrofer: i de nya texterna 51 raka mot 77 krokiga
   
   **Nytt i samma spår:** den nya nyckeln `facts.placesNote` skriver "shows the realm … The realm may have had other borders". Samtidigt heter fliken nu "Empires" (`focus.tab.vanished`). Ta med den i #1715 och skriv "empire". Förslag: "The empire may have had different borders from the country today."

## Smått
- **`place.huntImpossible`** (opersonlig enligt #1710): "the place must no longer be followed" är stelt passiv. Engelskan har ingen artighetsform, så en neutral form går bra, till exempel "To carry on with the hunt, stop following the place." Annars opersonligt: "The hunt can continue once the place is no longer followed." Det är jakttext för elever.
- **`hunt.region`:** "An event from another continent is needed" är begripligt men tungt. Förslag: "One from another continent is needed."
- **`panel.waitsTour`:** "Meanwhile waits until the tour is over" läses som ett adverb. Förslag: "“Meanwhile” waits until the tour is over".
- **`help.s5t`:**
  - "play" bör vara "playback" (det svenska ordet är uppspelningen).
  - "“before 3000 BC”" har liten bokstav men "“Before 3000 BC”" stor, i samma text. Svenskan gör likadant, men knapparnas namn enligt ordlistan är "Before 3000 BC".
- **`tour.recap`:** "What we went through" kan bli "What we covered".
- **Stavning inom `fkr.json`:**
  - "Maikop" 17 gånger och "Maykop" 4 gånger. `vagnshjulen-i-novokorsunskaja` har "Maykop culture", medan `majkopkurganen` har "Maikop".
  - "the Ice Age" 19, "the ice age" 3 och "the last ice age" 6. Välj en form och skriv in den i ordlistan §11.
- **Svenskt "räkna till" i rikestexter:** i `vasttyskland` står "counts western Germany to the United States" och "counts them to the Netherlands". Skriv "counts … as part of", som resten av texten gör.
- **`alexanders-rike`:** "that is also the years after Alexander's death" blir bättre som "that is, including the years after Alexander's death".
- **Bildtexterna:**
  - "Licence: Public domain" och "Licence: public domain" blandas.
  - "Utsnitt" blir både "Cropped" och "detail" (`skanska-kriget`).
  - "in the U.S." och "US" blandas. Namn som "U.S. Navy" är rätt.
  - I `kapkolonin-1652` blir "a painting painted before 1851" bättre som "a painting made before 1851".
- **`jordbavningen-i-basel-1356`:** svenskan säger "Efterskalven fortsatte i ett år". "The seismic crisis lasted a year" är friare. Förslag: "The aftershocks continued for a year."
- **Små tillägg som inte finns i svenskan.** De ändrar inte sakinnehållet, men regeln är att engelskan följer svenskan:
  - `kamkeramikernas-byteshandel` lägger till "in the north … in the south"
  - `utbrotten-i-ksudach` lägger till "during the Holocene"
  - `slaget-vid-somme` skriver "support trench" där svenskan har "skyttegrav"

## Möjliga sakfel till andra experter
Till historikern. Inget av detta är bekräftat som fel.
- **`gallipolifalttaget` (bildtext):** svenskan "daterar fotot efter fälttåget, 1915–1916" kan läsas på två sätt: tiden efter fälttåget, eller dateringen utifrån fälttåget. Engelskan valde "by the campaign". Kontrollera mot Library of Congress-posten vad som menas, och förtydliga svenskan.
- **`slaget-vid-somme`:** "support trench" i engelskan kommer troligen från källans bildtext. Kontrollera om svenskan ska säga det (eller om engelskan ska förenklas).
- Inga avvikande årtal, siffror eller namn i stickprovet eller i sifferjämförelsen av alla 605 innehållstexter.

## Luckor (saknas)
(Gäller inte sprak-en.)

## Ej kontrollerat
- 493 av 605 innehållstexter lästes inte ord för ord, bara siffror och typografi maskinellt.
- Rikesnamnen är kontrollerade mot ordlistans §9, som anger Wikidata och Wikipedia med datum 2026-11-20. Jag öppnade inte en.wikipedia själv.
- Gränssnittet har inte visats i webbläsare, så längden i 400 px är inte provad. Inga nya knappnamn ser riskabla ut: "Countries and provinces", "Show on map" och "Before 3000 BC" är korta.
