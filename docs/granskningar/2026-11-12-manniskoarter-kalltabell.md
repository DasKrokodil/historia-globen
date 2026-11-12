# Människoarter: källtabell, lucklista och förslag på fält (#1092, del 1 av #11)

**Datum:** 2026-11-12. **Av:** Claude Code (DasKrokodil), Opus. **Ingen data ändras.** Arterna läggs in i #1093 och kartlagret byggs i #1094.

## Metod och förbehåll

- **Källor:** bara licenser som issuet tillåter. Artiklarna är hämtade ur Europe PMC med filtret öppen tillgång och `LICENSE:"cc by"`, och licensen står per artikel i tabellen. Varje påstående nedan är läst i artikelns sammanfattning eller fulltext 2026-11-12. Taxonernas Q-id kommer från Wikidata (CC0), via en SPARQL-fråga på `P171 = Homo`.
- **Wikipedia (CC BY-SA) och ROAD (CC BY-SA 4.0) används inte**, enligt issuet och docs/beslut/2026-11-09-road-avstar.md.
- **Wikidata räcker inte för dateringar.** Ingen av de 35 taxa under *Homo* har numeriska dateringar i Wikidata (`P523`/`P524` saknas, utom en geologisk tidsålder för *H. sapiens*). Listan innehåller dessutom historiska namn som inte är arter i dag (till exempel *Homo troglodytes*, *Homo lar* och *Homo nintendonus*). Wikidata duger därför bara som id-källa, inte som andra oberoende källa för årtal. Därför är `two-sources` inte möjligt för någon art ännu.
- **Ålder** anges som "år sedan" (ka = tusen år sedan), som i källorna. Omräkningen till astronomiska år görs i #1093 (se förslaget nedan).
- **Inte prövat av `historiker` och `forhistoriker`.** De ska granska tabellen innan #1093 börjar (issuet).

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

## Källtabell per art

"Inom läget" betyder att arten finns inom människans läge, cirka 100 000 år bakåt (beslutet 2026-11-10, punkt 2).

| Art (Wikidata) | Vad källan säger (ålder) | Fyndplats och världsdel | Dateringsmetod enligt källan | Källa | Inom läget? | Oenighet |
|---|---|---|---|---|---|---|
| *Homo sapiens* (Q15978631) | De äldsta erkända fynden, Jebel Irhoud, "ca. 300 ka"; Florisbad och Guomde ">180 ka" | Marocko, södra och östra Afrika (Afrika) | Inte angiven i översikten (hänvisar till Hublin och Richter 2017) | `harvati-2022-homo-mlp` | ja, med öppen start (`../`) | Ja: vilka fynd som räknas till arten (översikten). Ett förslag 2026 om fynd i Marocko "basal to the Homo sapiens lineage" är inte prövat här |
| Neandertalare (Q40171) | Utdöda "ca. 39 ka" (översikten); "around 40,000–37,000 years before present" (Bawa Yawan); överlappade med *H. sapiens* i Europa "at least 5,000 years" (Ranis) | Europa och västra och centrala Asien | Bayesianska åldersmodeller och kol-14 (Bawa Yawan); genom (Ranis) | `harvati-2022-homo-mlp`, `heydari-guran-2021-bawa-yawan`, `sumer-2025-ranis-genomes` | ja, med öppen start | Liten: 39 ka eller 40–37 ka. Lokala skillnader i Centralasien och Sibirien enligt Bawa Yawan |
| Denisovaner (Q151055) | Denisovagrottan: äldsta lager med denisovanskt mtDNA "from ~250 ka", äldsta fossil "~200 ka". Baishiya: underkäken "ca. 160 ka", ett revben "approximately 48–32 thousand years ago" | Altaj, Sibirien; Tibetanska högplatån (Asien) | Optisk datering av sediment (Denisovagrottan); ZooMS och proteomik (Baishiya) | `jacobs-2025-denisova-chronology`, `harvati-2022-homo-mlp`, `xia-2024-baishiya` | ja, med öppen start | **Ja, artnivån:** översikten behandlar denisovanerna som en genetisk grupp och nämner kandidater (*Homo longi*, Xuchang, Hualongdong) och det äldre namnet *Homo altaiensis*. **Wikidata ger däremot posten Q151055 det vetenskapliga namnet *Homo longi* (P225)**, alltså likställer de två. Källorna skiljer sig |
| *Homo floresiensis* (Q186266) | Typexemplaret "dated to ~60,000 years ago" (Mata Menge-artikeln); "persisted on Flores until about 60 ka" (Niah). Förfäder vid Mata Menge från tidigt mellanpleistocen | Flores, Indonesien (Asien) | Inte angiven i sammanfattningarna | `kaifu-2024-mata-menge`, `curnoe-2025-gua-dagang` | ja | Ja, äldre: om fynden är en egen art eller sjuka moderna människor. En CC BY-artikel (PLOS ONE 2016, 10.1371/journal.pone.0155731) avvisar diagnosen Downs syndrom |
| *Homo luzonensis* (Q5021780) | Callaogrottan "67,000 years old" | Luzon, Filippinerna (Asien) | Inte angiven | `arenas-2020-philippines-mtdna` | ja | Ja: Sci. Rep.-artikeln skriver "have been considered as another species", alltså inte självklart |
| *Homo erectus* (Q101362) | "Last appearance of Homo erectus at Ngandong, Java, 117,000–108,000 years ago" | Java, Indonesien (Asien) | Inte angiven i översikten | `harvati-2022-homo-mlp` | gränsfall: slutar strax före 100 000 år | Nej i källan. Artens början (cirka 2 miljoner år) ligger långt utanför läget |
| *Homo naledi* (Q20962857) | "as late as 300 ka" (översikten); ristningar "circa 241,000- to 335,000-year-old" (eLife 2025) | Rising Star, Sydafrika (Afrika) | Inte angiven | `harvati-2022-homo-mlp`, `berger-2025-naledi-engravings` | **nej**: senast cirka 241 000 år | Ja, om beteendet (ristningar, begravning) |
| *Homo heidelbergensis* (Q105784) | "no taxon is more contentious"; används som *sensu lato* eller *sensu stricto* | Europa och Afrika | – | `harvati-2022-homo-mlp` | **nej** | **Ja, artnivån:** ett annat förslag är *Homo bodoensis* (Q109302884) |
| *Homo longi* (i Wikidata samma post som denisovanerna, Q151055) och *Homo juluensis* (Q130969853) | Översikten nämner *H. longi* som möjlig kandidat för denisovanerna; årtal anges inte | Kina (Asien) | – | `harvati-2022-homo-mlp` | oklart | **Ja:** om de är egna arter eller denisovaner |

## Lucklista (saknas eller okänt)

**Arter och årtal:**
1. **Ingen andra oberoende källa** för någon art. Wikidata saknar dateringar. Alla arter blir därför `source-checked` som mest. En andra CC BY-översikt (eller ROCEEH-utdrag under CC BY, enligt beslutet) behövs för `two-sources`.
2. **Dateringsmetoden saknas** för *H. sapiens* (Jebel Irhoud), *floresiensis*, *luzonensis*, *erectus* (Ngandong) och *naledi*, eftersom översikterna bara anger åldern. Originalartiklarna (Hublin och Richter 2017, Sutikna 2016, Détroit 2019, Rizal 2020, Dirks 2017) ligger i Nature, som inte är CC BY i Europe PMC. Antingen används de bara som länkade källor för att kontrollera årtal och plats (undantaget för NC-källor, beslut 2026-10-29, behöver prövas för icke-öppna artiklar), eller så läggs metoden in utan referens.
3. ***Homo luzonensis*:** bara ett årtal (67 000), från en genetisk artikel som nämner fyndet i förbigående.
4. **Denisovanernas slut:** ingen källa säger när de försvann. Baishiya-revbenet (48–32 ka) är det yngsta fyndet i källorna, och det visar närvaro, inte ett slut.

**Världsdelar** (täckningskarta, fyndplatser i källorna; tom cell = okänt, inte "ingen"):

| | Afrika | Europa | Asien | Oceanien (Sahul) | Amerika |
|---|---|---|---|---|---|
| *H. sapiens* | Jebel Irhoud, Florisbad, Guomde | Ranis, Zlatý kůň (cirka 45 ka) | Denisovagrottan (cirka 25–20 ka) | okänt i källorna (Sahul: "long" 60–65 ka mot "short" 47–51 ka chronology, Sci. Adv. 2025, inte inlagd) | okänt i källorna |
| Neandertalare | – | ja | Zagros (Bawa Yawan), Altaj (Denisovagrottan) | – | – |
| Denisovaner | – | – | Altaj, Tibet | okänt (bara DNA hos nu levande människor) | – |
| *floresiensis*, *luzonensis*, *erectus* (sent) | – | – | Flores, Luzon, Java | – | – |

- **Amerika och Sahul saknas helt för *H. sapiens*** i de öppnade källorna. Det är en lucka i källarbetet, inte i historien. Det behövs egna CC BY-källor innan lagret byggs. Planeringen nämner att dateringarna för Amerika "går isär".
- `tools/tackning.py` mäter händelser, inte arter, så den gick inte att använda här. Täckningen ovan är räknad ur tabellen.

## Förslag på fält i `data/` (för #1093)

Med dagens fält och utan nya:
- **En art som händelsespann:** `start`/`end` som yttre gränser i astronomiska år (1950 minus ålder i år, avrundat efter `precision`). `edtf` med `~` (ungefär) och `/..` eller `../` för öppna gränser. `precision` 6 (årtusende) eller lägre.
- **Arter som börjar före lägets gräns** (*H. sapiens*, neandertalare och denisovaner) får öppen start (`../`), som issuet säger. `start` sätts då till gränsen, med en `note` som säger att arten är äldre, och klipps inte tyst.
- **`location`** är fyndplatsen, med `locationPrecision: "region"`, och **aldrig** artens antagna utbredning. Utbredningen hör till kartlagret (#1094), med en egen stil för "tolkning" (beslutet, punkt 7).
- **Oenighet** skrivs som `note` med rubriken "Källorna skiljer sig" eller "Artindelningen är omstridd" (denisovaner, *heidelbergensis*, *longi*/*juluensis*, *luzonensis*).

**Fält som saknas (behöver beslut):**
- **`taxonStatus`** (till exempel `species`, `genetic-group`, `disputed`), så att denisovanerna inte visas som en art på samma sätt som neandertalarna. Alternativet är bara en `note`.
- **`datingMethod`** per spann (issuet vill ha metoden i tabellen). Den kan ligga i `note` tills vidare.
- **Ålder i "år sedan"** behöver `Y-…` och `beforePresent` (#1085 och tidstypen i beslutet 2026-11-10). Fram till dess räknas om till astronomiska år.

## Beslut som behövs innan #1093 (stanna och fråga, enligt issuet)

1. **Artlistan:** vilka tas med inom läget? Förslag: *H. sapiens*, neandertalare, denisovaner (som genetisk grupp, med en not), *floresiensis* och *luzonensis*. *Erectus* (Ngandong, 117–108 ka) som gränsfall med en not, eftersom den slutar strax före gränsen. *Naledi* och *heidelbergensis* tas inte med, eftersom de ligger utanför läget.
2. **Denisovaner:** "grupp" eller "art"? Förslag: "grupp (genetiskt påvisad)" med `note`, utan artnamn.
3. **Nature-originalen:** får de användas som länkade källor för dateringsmetoden (som NC-undantaget), eller ska metoden utelämnas? Förslag: ja, som länkade källor utan kopierad text, men det kräver ett beslut eftersom de inte är NC utan stängda.
4. **Andra källa:** ska ROCEEH tillfrågas nu (beslutet, punkt 5)? Förslag: ja, eftersom ingen art annars kan nå `two-sources`.
