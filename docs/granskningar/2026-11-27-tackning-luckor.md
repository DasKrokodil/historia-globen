# Täckning: luckor jämförda med release-2026-11-26 (2026-11-27)

**Datum:** 2026-11-27. **Underlag:** `python3 tools/tackning.py` samma dag ([tackning-2026-11-27.md](tackning-2026-11-27.md), 1 706 händelser) mot luckorna i [release-2026-11-26.md](release-2026-11-26.md). Bara docs; ingen data är ändrad. Mätningen säger **var** det är tomt, inte vilka händelser som saknas; det avgörs med öppnade källor (CLAUDE.md, Källpolicy). Där jag inte har öppnat en källa står det, och inga kandidater är skrivna ur minnet.

## Vad som öppnades

| Källa | Använd till | Öppnad |
|---|---|---|
| Wikidata, SPARQL (`query.wikidata.org`) | sporter med startår före 1800 (`Q349`, `P571`); slag och strider (`Q178561`, `P585`) i länder i Oceanien före 1500 | 2026-11-27 |
| Wikipedia: [Sumo](https://en.wikipedia.org/wiki/Sumo), [Mesoamerican ballgame](https://en.wikipedia.org/wiki/Mesoamerican_ballgame), [Polynesian navigation](https://en.wikipedia.org/wiki/Polynesian_navigation), [Tupaia (navigator)](https://en.wikipedia.org/wiki/Tupaia_(navigator)), [Kemari](https://en.wikipedia.org/wiki/Kemari) (bara ingressen) | datum för kandidaterna | 2026-11-27 |
| `data/events.json`, `js/model.js` (kategorinamn) | vad som redan finns | 2026-11-27 |

Wikipedia är sekundärkälla (Källpolicyn punkt 7). Wikidatas datum är **inte** kontrollerade mot en andra källa; ett Wikidata-år står här som kandidat, inte som fakta. Wikimedia och Wikidata begränsade antalet frågor under körningen (HTTP 429, "1 fråga i minuten"), så listorna är korta och inte uttömmande. Wikipedia-sidorna för Kiplingcotes Derby, Kemari (hela sidan), Golf, Ulama och Kilikiti svarade inte och är **inte** öppnade.

## Läget jämfört med 2026-11-26

Mätningen växte från cirka 1 500 till 1 706 händelser. Luckorna i releaserapporten ligger kvar:

| Lucka i release-2026-11-26 | Nu (2026-11-27) | Har öppet issue? |
|---|---|---|
| Krig i Oceanien i antiken och medeltid: 0 | **0** och **0** | [#2345](https://github.com/DasKrokodil/historia-globen/issues/2345) (nytt) |
| Sport före modern tid: 0 i förhistoria, medeltid och tidigmodern tid | **0** i förhistoria, medeltid och tidigmodern tid; antiken har 6. Hela sporthändelser: 16, och ingen ligger mellan år 300 och 1872 | [#2344](https://github.com/DasKrokodil/historia-globen/issues/2344) (nytt) |
| `manniskan` 1501–1799: 0 | **0**, men se nedan: kategorins namn är "Människans ursprung" | delvis ([#2159](https://github.com/DasKrokodil/historia-globen/issues/2159)); beslut i [#2349](https://github.com/DasKrokodil/historia-globen/issues/2349) (nytt) |
| Vetenskap i Oceanien: 0 till och med medeltid | **0** i förhistoria, antiken, medeltid och tidigmodern tid | [#2346](https://github.com/DasKrokodil/historia-globen/issues/2346) (nytt) |
| Oceanien 180 och Afrika 260 av 1 500 | **180 och 260 av 1 706** (10,6 % och 15,2 %); samma antal som i releaserapporten | delvis ([#1962](https://github.com/DasKrokodil/historia-globen/issues/1962), [#1757](https://github.com/DasKrokodil/historia-globen/issues/1757), [#646](https://github.com/DasKrokodil/historia-globen/issues/646)) |
| Tidigmodern tid är tunnast (193) | **222**, fortfarande tunnast av de sju perioderna; Asien 38, Afrika 32, Oceanien 22 | [#2347](https://github.com/DasKrokodil/historia-globen/issues/2347) (nytt; [#766](https://github.com/DasKrokodil/historia-globen/issues/766) är stängt) |

Nytt i den här mätningen ([#2348](https://github.com/DasKrokodil/historia-globen/issues/2348)): **Asien på 1800-talet** har 31 händelser, varav 24 krig (77 %), och 0 i vetenskap och kultur. Balansen krig mot övrigt utan slag som bara syns i Fokus ger 56 % krig där (tabellen "utan slag som bara syns i Fokus").

## Vad som saknas, per lucka

### 1. Sport 300–1872
Datan har 16 sporthändelser. Äldsta är de antika Olympiska spelen, `paso-de-la-amada-bollplan` (cirka 1400 f.Kr.), `cuju-bollspel-i-kina`, `idrottande-kvinnor-i-villa-romana-del-casale` (300) och sedan `forsta-landskampen-i-fotboll` (1872). Inget i Afrika eller Oceanien före 1877.
Kandidater ur öppnade källor (alla ska källkontrolleras mot en andra källa innan de läggs in):
- **Sumo i Japan, 642:** Wikipedia (Sumo) säger att de första historiskt belagda matcherna hölls 642 vid kejsarinnan Kōgyokus hov, för en koreansk delegation. Wikidata har samma startår 642 (`Q40561`). Annan tradition (Kojiki 712, Nihon Shoki 720) är mytisk och ska inte räknas som datering.
- **Kemari, Japan:** populärt under Heian- och Kamakuraperioden (794–1333) enligt ingressen i Wikipedia (Kemari); ingen enskild händelse eller exakt år öppnad.
- **Kiplingcotes Derby, England, 1519:** Wikidata (`Q6414648`) anger startår 1519; Wikipedia-sidan svarade inte, så ingen andra källa är öppnad.
- Wikidata listar även "Heavy Events" (Skottland, −1828, uppenbart fel eller mycket osäkert) och "Tentpegging" (−400) men inget av det är något jag vill föreslå utan källkontroll.
Sportkategorin är dessutom fortfarande ensidigt europeisk och modern. Att fylla 1 500 år är ett urvalsbeslut, inte bara data.

### 2. Krig i Oceanien före 1500
Wikidata har **inga** slag eller strider (`Q178561`) med datum före 1500 i länder i Oceanien (fråga 2026-11-27, noll träffar). Luckan beror därför troligen på att daterade källor saknas, inte på att ingen har sökt. Förslaget är en källundersökning (finns daterade konflikter i arkeologi eller muntlig tradition som går att belägga?), inte en förväntan om fler händelser. Polynesiska bosättningar finns redan som upptäckter (`polynesier-nar-aotearoa`, `wairau-bar` och fler).

### 3. Vetenskap i Oceanien
Oceanien har 0 vetenskapshändelser före 1800-talet. Kandidater ur öppnade källor:
- **Tupaia ritar en karta över Stilla havet, 15 augusti 1769:** Wikipedia (Tupaia) säger att han ritade en karta över 130 öar inom 3 200 km från Ra'iatea och kunde namnge 74 av dem. Händelsen finns inte i datan. Kategori (vetenskap eller upptäckter) och plats behöver avgöras.
- **Polynesisk navigation:** Wikipedia (Polynesian navigation) beskriver färdkonsten men ger inget enskilt dateringsbart år att bygga en händelse på utan fler källor.

### 4. Tidigmodern tid 1501–1799 i Asien, Afrika och Oceanien
222 händelser; krigen är 19 av 38 i Asien, 10 av 32 i Afrika och 9 av 22 i Oceanien, så utanför krig finns det 19, 22 respektive 13 händelser i hela perioden. Kategorier som är 0 i Asien 1501–1799: natur, människan, upptäckter, klimat, hälsa, rymden. Det här är en **mätning**, och det finns ingen öppnad källlista för perioden i den här körningen. Issuet föreslår att en lista tas fram ur Wikidata eller etablerade referenslistor (till exempel tidslinjer per region) innan något skrivs.

### 5. Asien på 1800-talet
31 händelser, 24 krig. 0 i vetenskap, kultur och natur. Samma metod som i punkt 4.

### 6. Kategorin `manniskan` är "Människans ursprung"
Kategorin heter "Människans ursprung" (`js/model.js`, `CATEGORIES`). Den är därför tom efter tidigmodern tid för att innehållet slutar där ursprunget slutar, inte nödvändigtvis för att något saknas. Antal: 57 i förhistorien, 33 i antiken, 3 i medeltiden, 0 efter år 1500. Releaserapporten och [#2159](https://github.com/DasKrokodil/historia-globen/issues/2159) behandlar nollan som en lucka att fylla ("människan efter 1500"). Det som behöver avgöras av DasKrokodil är **vad kategorin ska täcka**: bara ursprung (då är nollan rätt), eller en bredare kategori (då behöver namn, färg och definition ses över, och det är ett beslut enligt CLAUDE.md om kategorier).

## Issues från den här rapporten

Dubbletter söktes först: sökningar på sport, Oceanien, Afrika täckning, tidigmodern, vetenskap Oceanien och Asien 1800-talet, samt de första 100 av 223 öppna issues. Täckningsissues får inte `redo` (fakta och data kräver källkontroll). Milstolpe 6.7.0: Täckning och riken, omgång 2, där de andra täckningsissuesen ligger.

| Issue | Gäller | Etiketter |
|---|---|---|
| [#2344](https://github.com/DasKrokodil/historia-globen/issues/2344) | Sport 300–1872 | `data`, `källkontroll` |
| [#2345](https://github.com/DasKrokodil/historia-globen/issues/2345) | Krig i Oceanien före 1500 (källundersökning) | `data`, `källkontroll` |
| [#2346](https://github.com/DasKrokodil/historia-globen/issues/2346) | Vetenskap i Oceanien före 1800-talet | `data`, `källkontroll` |
| [#2347](https://github.com/DasKrokodil/historia-globen/issues/2347) | Tidigmodern tid i Asien, Afrika och Oceanien utanför krig | `data`, `källkontroll` |
| [#2348](https://github.com/DasKrokodil/historia-globen/issues/2348) | Asien på 1800-talet | `data`, `källkontroll` |
| [#2349](https://github.com/DasKrokodil/historia-globen/issues/2349) | Kategorin `manniskan`: lucka eller rätt? | `data`, `beslut-krävs` |

Oceanien 180 och Afrika 260 av 1 706 täcks inte av något nytt issue: #1962 (förhistorien), #1757 (medeltiden) och #646 (antiken) gäller redan det.

## Att kontrollera
- [ ] Kandidaterna ovan är **inte** källkontrollerade och är inte inlagda.
- [ ] Ny mätning efter nästa släpp (`python3 tools/tackning.py`).
