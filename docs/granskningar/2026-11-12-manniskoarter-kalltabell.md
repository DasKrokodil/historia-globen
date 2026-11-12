# Människoarter: källtabell, lucklista och förslag på fält (#1092, del 1 av #11)

**Datum:** 2026-11-12. **Av:** Claude Code (DasKrokodil), Opus. **Ingen data ändras.** Arterna läggs in i #1093 och kartlagret byggs i #1094.

## Metod och förbehåll

- **Källor:** bara licenser som issuet tillåter. Artiklarna är hämtade ur Europe PMC med filtret öppen tillgång och `LICENSE:"cc by"`, och licensen står per artikel i tabellen. Varje påstående nedan är läst i artikelns sammanfattning eller fulltext 2026-11-12. Taxonernas Q-id kommer från Wikidata (CC0), via en SPARQL-fråga på `P171 = Homo`.
- **Wikipedia (CC BY-SA) och ROAD (CC BY-SA 4.0) används inte**, enligt issuet och docs/beslut/2026-11-09-road-avstar.md.
- **Wikidata räcker inte för dateringar och inte för taxonomin.** Ingen av de 35 taxa under *Homo* har numeriska dateringar i Wikidata (`P523`/`P524` saknas, utom en geologisk tidsålder för *H. sapiens*). Listan innehåller dessutom historiska namn som inte är arter i dag (till exempel *Homo troglodytes*, *Homo lar* och *Homo nintendonus*). Wikidata duger därför bara som id-källa, inte som andra oberoende källa för årtal. Därför är `two-sources` inte möjligt för någon art ännu.
- **Ålder** anges som "år sedan" (ka = tusen år sedan), som i källorna. Omräkningen till astronomiska år görs i #1093 (se förslaget nedan).
- **Granskad av `historiker` och `forhistoriker` 2026-11-12.** Båda öppnade alla artiklarna i fulltext i Europe PMC och bekräftade licensen `cc by`. Deras rättningar är införda nedan (avsnittet "Granskning" sist).

## Källor (öppnade 2026-11-12)

| id (förslag till sources.json) | Artikel | DOI | Licens |
|---|---|---|---|
| `harvati-2022-homo-mlp` | Evolution of Homo in the Middle and Late Pleistocene (översikt), J. Hum. Evol. 2022 | 10.1016/j.jhevol.2022.103279 | CC BY |
| `jacobs-2025-denisova-chronology` | Pleistocene chronology and history of hominins and fauna at Denisova Cave, Nat. Commun. 2025 | 10.1038/s41467-025-60140-6 | CC BY |
| `xia-2024-baishiya` | Middle and Late Pleistocene Denisovan subsistence at Baishiya Karst Cave, Nature 2024 | 10.1038/s41586-024-07612-9 | CC BY |
| `kaifu-2024-mata-menge` | Early evolution of small body size in Homo floresiensis, Nat. Commun. 2024 | 10.1038/s41467-024-50649-7 | CC BY |
| `curnoe-2025-gua-dagang` | A Late Pleistocene archaic human tooth from Gua Dagang, Niah, PLOS ONE 2025 | 10.1371/journal.pone.0338786 | CC BY |
| `arenas-2020-philippines-mtdna` | The Early Peopling of the Philippines based on mtDNA, Sci. Rep. 2020 | 10.1038/s41598-020-61793-7 | CC BY |
| `heydari-guran-2021-bawa-yawan` | The discovery of an in situ Neanderthal remain in the Bawa Yawan Rockshelter, PLOS ONE 2021 | 10.1371/journal.pone.0253708 | CC BY |
| `sumer-2025-ranis-genomes` | Earliest modern human genomes constrain timing of Neanderthal admixture, Nature 2025 | 10.1038/s41586-024-08420-x | CC BY |
| `berger-2025-naledi-engravings` | An initial report of circa 241,000- to 335,000-year-old rock engravings … Homo naledi, eLife 2025 | 10.7554/eLife.89102 | CC BY |
| `wikidata` | Wikidata, taxa med `P171 = Q171283` (Homo) | – | CC0 |

Id:t är förslag och bygger på förstaförfattaren enligt Europe PMC: Harvati och Reyes-Centeno (översikten), Jacobs m.fl. (Denisovagrottan), Xia m.fl. (Baishiya), Kaifu m.fl. (Mata Menge), Curnoe m.fl. (Niah), Arenas m.fl. (Filippinerna), Heydari-Guran m.fl. (Bawa Yawan), Sümer m.fl. (Ranis) och Berger m.fl. (Homo naledi).

## Källtabell per art (rättad efter granskningen)

"Inom läget" betyder att arten finns inom människans läge, cirka 100 000 år bakåt (beslutet 2026-11-10, punkt 2).

| Art (Wikidata) | Vad källan säger (ålder) | Fyndplats och världsdel | Dateringsmetod enligt källan | Källa | Inom läget? | Oenighet |
|---|---|---|---|---|---|---|
| *Homo sapiens* (Q15978631) | Afrika: Jebel Irhoud "ca. 300 ka", Omo Kibish ">230 ka", Florisbad och Guomde ">180 ka", Herto "ca. 160 ka". Utanför Afrika, **möjliga** tidiga fynd: Apidima (Grekland) ">210 ka", Misliya "ca. 180 ka", Qafzeh och Skhūl "130–90 ka", södra Kina ">100 och 70 ka", Tam Pa Ling (Laos) "70 ± 3 ka and 77 ± 9 ka". Denisovagrottan "at least 45 thousand years ago"; Ranis och Zlatý kůň cirka 45 ka. Sahul: Madjedbebe "back to 65 ka" | Afrika; Västasien; Europa; Ost- och Sydostasien; Sahul | Inte angiven för de afrikanska fynden i översikten. OSL för Madjedbebe (Curnoe) | `harvati-2022-homo-mlp`, `jacobs-2025-denisova-chronology`, `sumer-2025-ranis-genomes`, `curnoe-2025-gua-dagang` | ja, med öppen start (`../`) | Ja: vilka tidiga fynd som räknas till arten, och om de tidiga fynden utanför Afrika är säkra (översikten). Madjedbebe: "questions have been raised about the reliability of this date" (Curnoe) |
| Neandertalare (Q40171) | Utdöda "ca. 39 ka" (översikten); "around 40,000–37,000 years before present" (Bawa Yawan, som sammanfattning av tidigare forskning, och bara för västra Eurasien); överlappade med *H. sapiens* i Europa "at least 5,000 years" (Ranis) | Europa och västra och centrala Asien | Inte angiven för utdöendet. Bawa Yawans egna kol-14 och Bayesmodell gäller tandens fyndlager (cirka 43 600 och 41 500 år sedan), och Ranis genomdatering gäller inblandningen | `harvati-2022-homo-mlp`, `heydari-guran-2021-bawa-yawan`, `sumer-2025-ranis-genomes` | ja, med öppen start | Liten om året (39 eller 40–37 ka, källorna stämmer). Beläggen gäller västra Eurasien; i Centralasien och Sibirien finns lokala skillnader (Bawa Yawan) |
| Denisovaner (Q151055) | Denisovagrottan: äldsta lager med denisovanskt mtDNA "from ~250 ka", äldsta fossil "~200 ka", Denisova 22 i lager 13, "79 ± 11 to 67 ± 7 ka". Baishiya: underkäken Xiahe 1 "dated to at least 160 ka", revbenet Xiahe 2 i lager 3, "dated to 48–32 ka" | Altaj, Sibirien; nordöstra Tibetanska högplatån (Asien) | Optisk datering av sediment (Denisovagrottan). Uranserie, **minimiålder** (Xiahe 1); lagrets datering (Xiahe 2). ZooMS och proteomik bestämmer vem benen kommer från, inte åldern | `jacobs-2025-denisova-chronology`, `xia-2024-baishiya`, `harvati-2022-homo-mlp` | ja, med öppen start | **Ja, artnivån.** Översikten (2022) behandlar dem som en genetisk grupp "without formal attribution to taxon", med kandidater (*Homo longi*, Xuchang, Hualongdong, äldre namnet *Homo altaiensis*). En nyare CC BY-artikel (Cell 2025, 10.1016/j.cell.2025.05.040, bara sammanfattningen läst) kopplar Harbinkraniet (">146 ka", typexemplar för *H. longi*) till denisovanskt mtDNA. Artnamnet är omstritt. Wikidatas P225 "Homo longi" räknas inte som källa i taxonomifrågan |
| *Homo floresiensis* (Q186266) | "60–100 ka at Liang Bua" (Curnoe); "0.1–0.06 Ma" och typexemplaret "~60,000" (Kaifu). Mata Menge "0.65–0.773 Ma" (förfäder) | Flores, Indonesien (Asien) | Inte angiven i de öppnade källorna | `curnoe-2025-gua-dagang`, `kaifu-2024-mata-menge` | ja | Gammal fråga om fynden är en egen art eller moderna människor med sjukdom. PLOS ONE 2016 (10.1371/journal.pone.0155731, CC BY): "a phenotypically unique, valid species". Kaifus koppling mellan *H. sapiens* ankomst och artens försvinnande är en hypotes ("we suspect") |
| *Homo luzonensis* (Q5021780) | Callaogrottan "about 66.7 ± 1 ka" (Curnoe); "67,000 years old" (Arenas) | Luzon, Filippinerna (Asien) | Inte angiven | `curnoe-2025-gua-dagang`, `arenas-2020-philippines-mtdna` | ja | Ja: översikten kallar den en av "the two recognized island species", medan Arenas skriver att "for some authors these remains are fragmentary and taxonomically ambiguous". Fynden är få |
| *Homo erectus* (Q101362), sena fynd | "at Ngandong (108–117 ka)" och "Madura Strait (119 ± 27 ka to 162 ± 31 ka)"; "the youngest examples … date to more than 100 ka" | Java, Indonesien (Asien) | Inte angiven | `curnoe-2025-gua-dagang` | gränsfall: slutar strax före 100 000 år | Nej i källan. (Harvatis enda belägg var titeln på Rizal 2020 i referenslistan, inte löptexten.) |
| Obestämd arkaisk människa, Gua Dagang (Niah) | "about 52 − 55 thousand years ago" | Borneo, Malaysia (Asien) | OSL | `curnoe-2025-gua-dagang` | ja | Inte artbestämd. Kan visas som "arkaisk, inte artbestämd", eller väljas bort uttryckligen |
| *Homo naledi* (Q20962857) | "as late as 300 ka" (översikten). Skelettmaterialet i kamrarna 241 000–335 000 år (eLife 2025) | Rising Star, Sydafrika (Afrika) | ESR-US på tänder och U-Th på flowsten (eLife 2025) | `harvati-2022-homo-mlp`, `berger-2025-naledi-engravings` | **nej**: senast cirka 241 000 år | Ja: eLife bedömer artikeln som "Incomplete" ("further work needed … to support the claims about the anthropogenic nature, age, and author of the engravings"). Möjligen samtida med tidig *H. sapiens* ("possible sympatry", översikten) |
| *Homo heidelbergensis* (Q105784) | "no taxon is more contentious"; används som *sensu lato* eller *sensu stricto* | Europa och Afrika | – | `harvati-2022-homo-mlp` | **nej** | **Ja, artnivån:** ett annat förslag är *Homo bodoensis* (Q109302884) |

***Homo juluensis* (Q130969853) är struken:** ingen öppnad källa nämner namnet; bara Wikidata (namn och rang). Den tas inte med förrän en CC BY-källa finns.

**Blandning ska synas, inte bara arter som rader** (till #1093 och #1094): Denisova 11 är "a Neanderthal–Denisovan offspring" (Jacobs); neandertalsk inblandning i "a single admixture event shared with all non-Africans" för cirka 45 000–49 000 år sedan (Sümer); denisovanskt DNA hos nu levande folk på öarna i Sydostasien, på Nya Guinea och i Australien, men inga denisovanska fossil där (Curnoe); inget belägg för att *floresiensis* eller *luzonensis* mötte andra människor (Curnoe). Det sista betyder "inga säkra fynd", inte "ingen var där".

## Lucklista (saknas eller okänt)

**Arter och årtal:**
1. **`two-sources` kan bli möjligt** för *floresiensis* (Kaifu och Curnoe), *luzonensis* (Arenas och Curnoe) och neandertalarnas slut (Harvati och Bawa Yawan), där två CC BY-källor stämmer. **Förbehåll:** de bygger på samma primärdateringar. Om det räknas som oberoende är ett beslut för DasKrokodil (beslut 4). Wikidata saknar dateringar och räknas inte.
2. **Dateringsmetoden saknas** för *H. sapiens* i Afrika (Jebel Irhoud m.fl.), *floresiensis*, *luzonensis* och *erectus*. Originalartiklarna ligger i stängda tidskrifter (beslut 3).
3. **Denisovanernas slut:** ingen källa säger när de försvann. Baishiya (48–32 ka) visar närvaro, inte ett slut.
4. **Afrika inom läget:** bara *H. sapiens* i de öppnade källorna. Ingen öppnad källa nämner andra afrikanska hominider yngre än 100 ka.

**Världsdelar** (fyndplatser i källorna; tom cell = okänt, inte "ingen"):

| | Afrika | Europa | Asien | Oceanien (Sahul) | Amerika |
|---|---|---|---|---|---|
| *H. sapiens* | Jebel Irhoud, Omo Kibish, Florisbad, Guomde, Herto | Ranis, Zlatý kůň (cirka 45 ka); Apidima (möjlig, >210 ka) | Misliya, Qafzeh, Skhūl (möjliga); södra Kina (möjliga); Tam Pa Ling; Denisovagrottan (minst 45 ka) | Madjedbebe, 65 ka (ifrågasatt) | okänt i källorna |
| Neandertalare | – | ja | Zagros (Bawa Yawan), Altaj (Denisovagrottan) | – | – |
| Denisovaner | – | – | Altaj, Tibet | okänt (bara DNA hos nu levande människor) | – |
| *floresiensis*, *luzonensis*, *erectus* (sent), Gua Dagang | – | – | Flores, Luzon, Java, Borneo | – | – |

- **Amerika:** ingen öppnad CC BY-källa. Behövs före #1094.
- **Södra Asien:** översikten nämner Narmada (Indien), utan datering.
- **Penghu (Taiwan) och Tam Ngu Hao 2 (Laos):** möjliga denisovaner eller neandertalare; Penghu "10–70 ka" eller "130–190 ka" (Curnoe). Inte inlagda.
- **Våra data:** inget i `data/events.json` ligger före −9999; hela spannet 100 000–12 000 år sedan är tomt. Förhistorien har 5 händelser, Amerika och Oceanien 0 (`tools/tackning.py`, körd av `historiker`). Verktyget mäter händelser, inte arter.

## Förslag på fält i `data/` (för #1093)

Med dagens fält och utan nya:
- **En art som händelsespann:** `start`/`end` som yttre gränser i astronomiska år (1950 minus ålder i år, avrundat efter `precision`; OSL-åldrar räknas från mättillfället, vilket inte spelar roll vid `precision` 6 eller lägre). `edtf` med `~` (ungefär) och `/..` eller `../` för öppna gränser.
- **Arter som börjar före lägets gräns** (*H. sapiens*, neandertalare och denisovaner) får öppen start (`../`). `start` sätts till gränsen, med en `note` som säger att arten är äldre, och klipps inte tyst.
- **`location`** är fyndplatsen, med `locationPrecision: "region"`, och **aldrig** artens antagna utbredning. Utbredning och vandringar hör till kartlagret (#1094), med en egen stil för "tolkning" och aldrig som en enda pil.
- **Oenighet** skrivs som `note` med "Källorna skiljer sig" eller "Artindelningen är omstridd".
- **Ordval:** inget "primitiv", "stege" eller "ras"; "moderna människor med sjukdom", inte "sjuka moderna människor". Namnet *rhodesiensis* undviks (översikten nämner "colonial associations").

**Fält som saknas (behöver beslut):** `taxonStatus` (till exempel `species`, `genetic-group`, `undetermined`), `datingMethod` per spann (kan ligga i `note` tills vidare), och `Y-…`/`beforePresent` (#1085).

## Beslut som behövs innan #1093 (med experternas rekommendation)

1. **Artlistan.** Rekommendation (båda experterna): ta med *H. sapiens* (öppen start), neandertalare (öppen start, regional not om slutet), denisovaner (som grupp), *floresiensis* (100–60 ka) och *luzonensis* (cirka 67 ka, not om fåtaliga fynd). *Erectus* (Ngandong 117–108 ka) som gränsfall med en not, bara om "cirka 100 000" tolkas så. Gua Dagang som "obestämd arkaisk människa", eller uttryckligen bortvald. Inte med: *naledi*, *heidelbergensis*/*bodoensis*, och *longi*/*juluensis* som egna poster.
2. **Denisovaner.** Rekommendation: "grupp (genetiskt påvisad)" utan artnamn, med en `note` om Harbin, *H. longi* och Cell 2025, och att namnet är omstritt.
3. **Stängda originalartiklar** (Nature, Science, Cell utan CC BY) som länkade källor för årtal och metod, utan kopierad text. Rekommendation: ja, men det kräver en egen beslutsfil, eftersom NC-undantaget (2026-10-29) inte täcker stängda artiklar. I första hand används de CC BY-källor som redan anger metoden (Curnoe, Jacobs, Xia, eLife); hellre utelämna metoden än skriva den utan källa.
4. **Andra källa och ROCEEH.** Rekommendation: avgör först om två CC BY-artiklar som bygger på samma primärdatering räknas som oberoende för `two-sources`. Fråga ROCEEH parallellt (för *H. sapiens*, Amerika och Sahul), så att #1093 inte blockeras.

## Granskning 2026-11-12

`historiker` och `forhistoriker` granskade första versionen (#1238). Båda svarade "synpunkter". Rättat:
- *H. erectus*: källan byttes från Harvati (bara en titel i referenslistan) till Curnoes löptext.
- Baishiya: uranserie med minimiålder ("at least 160 ka"); ZooMS och proteomik är artbestämning, inte datering.
- *H. sapiens* i Denisovagrottan "at least 45 thousand years ago", inte 25–20 ka.
- Sahul var inte "okänt i källorna": Madjedbebe 65 ka (ifrågasatt) står hos Curnoe.
- *H. luzonensis*: Curnoe och Harvati som huvudkällor; Arenas oenighet står kvar.
- *H. juluensis*: struken (ingen källa).
- *H. naledi*: åldern gäller skelettmaterialet; eLifes bedömning "Incomplete" redovisad.
- Bawa Yawans metod gäller tandens lager, inte utdöendet; Ranis genomdatering gäller inblandningen.
- Tillagt: denisovaner 79–67 ka (Denisova 22), Harbin och Cell 2025, Gua Dagang, tidiga *H. sapiens* utanför Afrika som "möjliga", Omo Kibish och Herto, blandning mellan grupperna.

Inte kontrollerat: Wikidatas övriga Q-id (API:et gav 429) och Cell 2025 utöver sammanfattningen.
