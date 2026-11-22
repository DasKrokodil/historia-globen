# sprak-es: granskning före v6.5.0

## Omfattning och stickprov
- Jämförelse 1a981da0..HEAD (main 1cc19f79). Underlag: andrade-texter-es.md, 1 161 rader.
- **data/ui/es.json: allt läst**, 95 nya och 53 ändrade nycklar, jämförda med sv och en. Inga nycklar saknas i es.json jämfört med sv.json, och inga nycklar har tagits bort.
- **Maskinkontroll av alla 1 161 rader:**
  - Tal: alla tal i sv jämförda med tal i es, rad för rad. 19 rader skilde sig, och alla gick igenom för hand.
  - "-talet": varje "NNN-talet" (också "600- eller 700-talet") jämfört med romerska siffror i es.
  - Typografi: tal med fem siffror eller fler utan U+00A0, raka citattecken, ? och ! utan ¿ och ¡, varianter av a. C./d. C., tú-former, bindestreck i årsspann och skiljetecken som lagts till.
- **Läst för hand, cirka 400 av 1 161 rader:**
  - Alla korta rader i data/empires/index.json (rikesnamn, rubriker, flaggetiketter, cirka 260).
  - Alla långa rader för romarriket (cirka 40) och 14 slumpade långa rikestexter: franska-kolonialvaldet, kalmuckkhanatet, chaulukyadynastin, italien, nogajhorden, zhoudynastin, buchara, western-satraps, vasttyskland, idrisider, svenska-stormaktsvaldet, ungern, tibet och kongoriket/funjsultanatet.
  - Alla rader i data/spridning.json (20), data/bildlager.json (10) och data/turer/ (21), samt data/routes, data/platser.json, data/styles.json och data/vyer.json (12).
  - 22 slumpade rader ur 1900-1945, 12 ur fkr och var tredje rad ur 1-1499, 1500-1799, 1800-1899 och 1946-1979 (cirka 16), plus mexikansk-amerikanska-kriget (#2052), plan-de-ayala, slaget-vid-palonegro, orakelben-skrift och zapata-mordas-1919.
- **Status för #1715 (spanska), kontrollerat i hela innehållet:**
  - Rättat: hårt mellanrum i tal med fem siffror eller fler (inga träffar med vanligt mellanslag längre), "Somalia italiana" som namn (#2002), `place.huntImpossible` (inte längre tú), `review.subjectHelp`/korten med «¿Sabía que…?».
  - Kvar: se "Bör rättas" och "Smått".

## Blockerande
1. **Fel århundrade i spanskan (fällan med "-talet"), ändrar fakta.**
   - Var: `data/empires/index.json` → `/groups/0/polityFacts/bysantinska-riket/facts/items/0/text`.
   - Svenska: "vissa forskare sätter början först på 600- eller 700-talet" (= 600- och 700-talet, alltså sjunde eller åttonde århundradet). en, de och fr säger 7th/8th.
   - Spanska nu: "algunos investigadores lo sitúan en el siglo VI o VII". Det är ett århundrade för tidigt.
   - Förslag: "y algunos investigadores no lo sitúan hasta los siglos VII u VIII."
   - Bevis: textjämförelsen ovan (de fyra språken mot svenskan). Ordlistan §2 kräver uttryckligen att detta kontrolleras vid release.
   - Vem: översättare (Codex/Copilot enligt undantaget för `översättning`). Rättningen är på en rad och ändrar ingen fakta.

## Bör rättas
1. **`panel.earlier`/`panel.later`/`panel.earlierDays`/`panel.laterDays` (och `time.beforeLabel`/`time.afterLabel`) säger "hace {n} años"/"dentro de {n} años", samtidigt som det nya `detail.yearsAgoShort` säger "≈ hace {n} años" räknat från i dag (#1979).**
   - Problemet: på spanska betyder *hace* och *dentro de* "räknat från nu". I Samtidigt-listan räknas avståndet från det valda året. Med båda formerna på skärmen kan "hace 34 años" läsas som 34 år före i dag.
   - Svenskan undviker det med "år före", inte "år sedan".
   - Förslag: "{n} año(s) antes" / "{n} año(s) después" (dagar likadant) i alla sex nycklarna. Det är samma ord på glob och panel, som #1306 kräver.
   - Vem: översättare. Ingen fakta ändras.
2. **`layers.pAuto` och `layers.pAutoLabel`: "Continuar solo después de la tarjeta «¿Sabía que…?»".**
   - Problemet: *solo* läses som "endast" ("fortsätt bara efter kortet"). Svenskan säger "Fortsätt själv" (automatiskt), och en säger "on its own".
   - Förslag: "Continuar automáticamente después de la tarjeta «¿Sabía que…?»".
3. **Fel ord för imperium i Romarriket (`data/empires/index.json`, romarriket).**
   - Rubriken 260–274 "Riket delas i tre" → "El reino se divide en tres". Förslag: "El Imperio se divide en tres".
   - "Kartan visar en mycket liten rest av riket till och med 1474" → "…un vestigio muy pequeño del reino…". Förslag: "…del Imperio…".
   - "kungadömet visas parallellt" → "el Reino aparece en paralelo". Förslag: "la Monarquía", som i namnet *Monarquía romana*.
   - Motivering: *reino* är kungadöme, men det som avses är Romerska kejsardömet och Bysans.
4. **"Kartan visar en jämn tillväxt under krigets första år" (romarriket, 264–241 f.Kr.) → "durante el primer año de la guerra".**
   - Svenskan menar plural (en: "first years", de: "ersten Kriegsjahren").
   - Förslag: "durante los primeros años de la guerra". Utan rättning ändras påståendet om kartan.
5. **Rubriker i rikenas faktarutor är inte enhetliga (alla filer i data/empires/).**
   - "När och var det uppstod": *Cuándo y dónde surgió* 17 gånger och *ocurrió* 2 gånger (romarriket). *Ocurrió* betyder "hände". Förslag: *surgió* överallt.
   - "Kända härskare": *Gobernantes célebres* 2 gånger och *conocidos* 1 gång. Förslag: välj en form och för in den i ordlistan.
   - "Största utbredning" → *Mayor distribución* (romarriket). *Distribución* betyder fördelning. Förslag: *Máxima extensión*, som brödtexten redan säger ("alcanzó su máxima extensión").
   - "Huvudstäder" → *Capitales:* med kolon som svenskan saknar. Förslag: "Capitales".
6. **Kvar sedan v6.4.0, redan känt: #1715.**
   - "Imperio oyo" (6 gånger, data/handelser/1500-1799.json) och "Imperio uadai" (3 gånger, data/empires/index.json). Förslag: "Imperio de Oyo" och "Imperio de Uadai".
   - "condado de Skåne" (2 gånger, data/platser.json) mot "Escania" (65 gånger).
   - "Somalia Italiana" med versal i 3 brödtexter i data/empires/index.json (italienska kolonier), medan namnet nu är "Somalia italiana".

## Smått
- `data/empires/index.json`, romarriket:
  - Årsspann med bindestreck i stället för tankstreck: "264-241 a. C.", "58-50 a. C.", "31-30 a. C.", "(aprox. 753-509 a. C.)", "Trajano (98-117)", "(602-628)", "527-565" osv. och "395-632". Svenskan och resten av filen har –.
  - Etiketten "330" har fått en punkt: "330.".
  - "República Romana" står en gång mot namnet "República romana".
- Raka citattecken: `ungern` i data/empires/index.json, "Hungarian Nationalists". Förslag: «Hungarian Nationalists».
- *Las fuentes discrepan* (7 gånger, i spridning.json) och *Las fuentes no coinciden* (2 gånger) mot ordlistans *Las fuentes difieren* (292 gånger, §16). Redan känt: #1715 ("tre former"), och det finns fortfarande kvar.
- "et al." (22 gånger) mot "y otros" (11 gånger) i forskarhänvisningar. bildlager.json har "Gowan et al. 2021" och spridning.json "Dillehay y otros 2015". Välj en form. Förslag: "et al." med årtalet inom parentes.
- `homo-erectus-ngandong` (fkr): "lo recoge Curnoe y otros 2025" → "lo recogen Curnoe et al. (2025)", så att verbet böjs efter subjektet.
- `orakelben-skrift`: "La mayoría de las unas 150 000 inscripciones" → "La mayoría de las cerca de 150 000 inscripciones".
- `utbrotten-i-ksudach`: spanskan lägger till "en el Holoceno", som svenskan inte har ("efter istiden"). Ingen sakskillnad, men stryk det för att följa källtexten.
- `data/styles.json` grotta: "Ilustración dibujada moderna de paisaje y objetos" → "Ilustración moderna dibujada de paisajes y objetos".
- `data/turer/andra-varldskriget.json` lärartext:
  - "exit ticket" står kvar på engelska. Förslag: "ticket de salida".
  - Knappnamnen står utan «» ("Abra Para docentes, elija Empezar como lección"), medan andra turer har «».
- Gränssnittet:
  - `regionView.tap` "Un toque en un marcador o en el lugar muestra los datos." Förslag på usted-imperativ som i resten av filen: "Toque un marcador o el lugar para ver los datos."
  - `feedback.server.busy` "Está lleno en este momento." Förslag: "El servicio está saturado en este momento."
  - `feedback.sending` "Enviando …" → "Enviando…" (spanskan har inget mellanslag före ellipsen).
  - `feedback.error.email.invalid` "nombre@ejemplo.es" → "nombre@ejemplo.com", som är neutralt för Latinamerika.
  - `panel.emptyPrehistory` "en {within} de {at}" blir "en ±500 años de hace 40 000 años". Det följer `panel.empty`, men "a ±… de" vore naturligare (gäller båda nycklarna).
  - `help.s4t` "abre el Mapa del lugar": sätt vyns namn inom «», som «Ver en el mapa» i samma mening.
- `theme.huntImpossible` har kvar tú ("Termina el tema si quieres…"). Det är tillåtet för jakten, men tvillingen `place.huntImpossible` är nu opersonlig. Gör dem lika. Redan känt: #1715, och det är delvis rättat.
- `hunt.region` har gått från tú till opersonlig form ("Ya hay… Hace falta uno…"). Det bryter inte mot beslutet 2026-11-08, men övriga `hunt.*` har tú eller är neutrala, så stilen bör hållas lika.
- `data/turer/det-har-har-du-hort.json` nivå "Gymnasiet" → "Bachillerato": det passar Spanien. Antagande: i delar av Latinamerika betyder *bachillerato* olika stadier. Förslag om det behövs: "Bachillerato (16–19 años en Suecia)".
- Texcoco → "Tetzcuco" är verifierat i #2007 och ändras inte. Antagande: läsare i Mexiko känner främst igen "Texcoco", som också står i brödtexten ("lago de Texcoco"). "Tetzcuco (Texcoco)" vore tydligare.
- `mexikansk-amerikanska-kriget` (#2052): titeln "La guerra mexicano-estadounidense" är neutral och korrekt för både Spanien och Latinamerika, och sammanfattningen, anteckningen och bildtexten följer samma benämning. Inga kvarvarande "intervención estadounidense" hittades i data/. Inget fynd.

## Möjliga sakfel till andra experter
- **Till historikern:** `data/empires/index.json`, franska-kolonialvaldet. Svenskan säger "Cliopatria räknar **den** franska ockupationszonen i Rhenlandet till Frankrike till och med 1929", men en, de, fr och es säger "**parts of**/Teile/des parties/partes de". Antingen är svenskan för bred eller översättningarna för snäva. Svenskan är källan. Kontrollera mot Cliopatria vilken som stämmer och rätta sedan de andra.
- **Redan känt, fortfarande i texten:** `data/spridning.json`, `amerika`-anteckningen. Askan är daterad till 11 000 år, ändå sägs boplatsen "inte kunna vara äldre än 8 200–4 200 år". Spanskan är trogen svenskan. Det gäller frågan om Surovell 2026 i #1715/#1704.

## Luckor (saknas)
(Gäller inte sprak-es.)

## Ej kontrollerat
- Inga externa källor öppnades. es.wikipedia gav ett felsvar från Wikimedia via proxyn. Därför är inga namn kontrollerade på nytt: rikesnamnen litar på kontrollen i #2007 och ordlistan §9, och namnet "Intervención estadounidense en México" som mexikansk form är inte jämfört med en källa.
- Cirka 760 av 1 161 innehållsrader lästes inte för hand. De flesta är långa rikestexter i index.json (cirka 140 av 155 olästa) och händelser i 1900-1945 (cirka 285 av 308) och fkr (cirka 95 av 108). För dem gjordes bara maskinkontrollerna ovan, och de visade inget utöver det som rapporteras.
- Om texterna får plats i gränssnittet är bara kontrollerat i CSS för flikarna (`.focus-tabs` rullar vågrätt i mobil, och "Países y provincias históricas" är lika långt som franskan). Inget är provat i webbläsare.
