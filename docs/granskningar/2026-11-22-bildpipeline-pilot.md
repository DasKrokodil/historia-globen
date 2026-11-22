# Pilotrapport: bildpipelinen i Afrika (#2107–#2109, kontroll #2110)

**Datum:** 2026-11-22 · **Beslut:** [docs/beslut/2026-11-22-bildpipeline-pilot.md](../beslut/2026-11-22-bildpipeline-pilot.md) (i #2186) · **Förstudie:** [2026-11-22-pipeline-forstudie.md](2026-11-22-pipeline-forstudie.md) · **Gjord av:** Claude Code (DasKrokodils konto), Opus, som dirigent. En arbetare per issue, och granskning av agenter som inte byggde.

## Kort sagt

| Mått (krav i beslutet) | Pipeline (#2107–#2109, 54 händelser) | Kontroll (#2110, 18 händelser) | Håller? |
| --- | --- | --- | --- |
| Licensfel som når `main` (0) | 0. Två bilder stoppades i granskningen. | 0. En bild stoppades i granskningen. | **Ja**, tack vare granskningen. Granskningslistan fångade inte felen. |
| Andel händelser med bild (minst 65 %) | 28 av 54 = **52 %** (58 % utan de "ej hämtade") | 8 av 18 = **44 %** (47 %) | **Nej**, i båda armarna |
| Tid per issue (under 87 min) | 12–15 min till pull request, plus cirka 2 min rättning | 20 min, plus cirka 1,5 min | **Ja**, och pipelinen var cirka 35 % snabbare |
| Token per issue (minst 30 % lägre än kontrollen) | i snitt 2,86 miljoner viktade tokens (2,44–3,41 miljoner) | 2,75 miljoner | **Nej**: cirka 4 % *högre* i snitt (uppmätt, se Efterhandsmätning) |

**Slutsats:**
- Pipelinen sparar tid och ger fler bilder per issue.
- Den sparar inte tillräckligt med token, och licensrisken hittas fortfarande först i granskningen.
- Piloten **håller inte** måttet för token. Den bör inte utvidgas som den är.
- Förbättringarna i #2193 riktar sig mot just de fel som granskningen hittade.

## Så mättes det

- **Uppsättning:** fyra arbetare (Opus) startade samtidigt kl. 07:53 UTC, var och en med samma gemensamma regler.
  - Pilotarbetarna fick granskningslistan ur `tools/bildbatch.py`.
  - Kontrollen följde rutinen på `main` utan listan.
- **Tid:** arbetarnas egna tidsstämplar (`date -u`) och körtiden för varje arbetare.
- **Token:** det värde som verktyget rapporterar för en underagent (`subagent_tokens`).
  - **Det är ett osäkert mått.** Det ser ut att vara storleken på agentens sammanhang i slutet, inte summan av alla anrop: det växte bara 10 000–20 000 tokens när samma agent gjorde en rättning med 15 verktygsanrop.
  - Därför redovisas också antalet verktygsanrop. Det var ungefär lika i båda armarna, i snitt 94 mot 93.
  - **Rättat 2026-11-22:** den verkliga förbrukningen är nu uppmätt ur arbetarnas loggar. Se avsnittet "Efterhandsmätning" nedan. Den ersätter siffran "cirka 11 % lägre".
- **Granskning:** en `historiker` per pull request, en samlad språkgranskning över alla fyra, och för de känsliga bilderna `sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr` och `larare`.

## Siffror per issue

| Issue och PR | Arm | Händelser | Bild efter granskning | Ej hämtad (429) | Ingen fri bild | Tid till PR | Verktygsanrop | Token (sammanhang) |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| #2107, [#2188](https://github.com/DasKrokodil/historia-globen/pull/2188) | pipeline | 18 | 9 | 1 | 8 | 13 min | 80 | 215 451 |
| #2108, [#2190](https://github.com/DasKrokodil/historia-globen/pull/2190) | pipeline | 18 | 10 | 0 | 8 | 15 min | 106 | 254 746 |
| #2109, [#2187](https://github.com/DasKrokodil/historia-globen/pull/2187) | pipeline | 18 | 9 | 5 | 4 | 12 min | 97 | 219 364 |
| #2110, [#2191](https://github.com/DasKrokodil/historia-globen/pull/2191) | kontroll | 18 | 8 | 1 | 9 | 20 min | 93 | 259 798 |

**Rättningar efter granskningen:** cirka 1,5–2 minuter per pull request i båda armarna. En andra omgång efter granskningen av de känsliga bilderna gällde #2187, #2190 och #2191.

**Granskningens kostnad (sammanhang per historiker):**

| Pull request | Token |
| --- | ---: |
| #2188 | 86 435 |
| #2190 | 98 806 |
| #2187 | 88 070 |
| #2191 (kontroll) | 79 321 |
| Samlad språkgranskning, alla fyra | 123 307 |
| De fem expertgranskningarna av känsliga bilder | 62 000–82 000 var |

## Vad granskningen hittade, och om listan kunde ha fångat det

| Fynd | Arm | Hade granskningslistan kunnat fånga det? |
| --- | --- | --- |
| Yekuno Amlak: datering och ursprung saknas på filsidan (bara ett forum), så licensen går inte att belägga. **Borttagen.** | pipeline | Nej. Mallen PD-old såg giltig ut. Behövs: filsidans källfält och en flagga för forum som enda källa (#2193 punkt 7). |
| eMakhosini: monument från 2003, och Sydafrika saknar frihet för panorama. **Borttagen.** | pipeline | Nej. Behövs: en flagga för moderna konstverk (#2193 punkt 5). |
| Brazzaville: "PD-US-not renewed" på ett franskt foto från 1944. **Borttagen.** | kontroll | Kontrollen använde inte listan. Mallen hade inte flaggats där heller. Behövs: en flagga för licenser med särskild risk (#2193 punkt 7). |
| Astérix: filsidan säger "modèle d'essais" (testexemplar) | kontroll | Nej. Det är en fråga om bildtexten. |
| Herero: bildtexten nämnde inte kedjorna och soldaten, och "kriget mot Tyskland" ramade in det fel | pipeline | Nej. Det är en fråga om bildtexten. |
| Maji Maji: 4:3-utsnittet skar bort en tredjedel av kartan, och kartans årtal skiljer sig från händelsens | pipeline | Delvis. En flagga för stående bild och en förhandsbild (#2193 punkt 4). |
| Flaggan `nutida-foto` var fel 6 gånger (uppladdningsdatum på gamla verk) | pipeline | Rättas med verkets datum (#2193 punkt 2). |
| Samma bild föreslogs för två händelser, två gånger | pipeline | Rättas med en varning (#2193 punkt 3). |

**Mönster:** licensmallen klarade programmet. Felen satt i det som mallen inte säger: ursprung, frihet för panorama, var verket först publicerades, och motivet. Det är just det som granskningen fångade. Granskningen per pull request behövs alltså fullt ut.

## Varför tokenmålet inte nåddes

- Granskningslistan tar bort **sökandet** efter kandidater. Arbetarna valde listans första kandidat för 24 av de 40 händelser som hade minst en kandidat i listan (byggarnas rapporter).
- De fasta kostnaderna finns kvar i varje omgång:
  - att öppna filsidan för den valda bilden;
  - bildtexter på fem språk;
  - dela_data, översättningsspärren och licensmanifesten;
  - hela testsviten och bygget;
  - skärmbilder i två bredder;
  - pull request med tabell.
- Den antagna besparingen på 35–55 % i förstudien byggde på att sökningen var den största kostnaden. Piloten visar att den inte är det.
- **Wikimedias 429** stoppade 6 av 54 händelser i pipelinen och 1 av 18 i kontrollen. Det sänker andelen bilder mer än någon brist i listan.

## Rekommendation till DasKrokodil

1. **Utvidga inte pipelinen till alla bildissues ännu.** Tokenmålet nåddes inte. Tiden och andelen med bild var bättre, så pipelinen är inte sämre än det gamla sättet.
2. **Bygg #2193 först.** Den ger beskrivning, kategorier, verkets datum, varning för dubbletter, flagga för stående bild, konstverk och riskabla licenser, och en lista med de "ej hämtade" bilderna. Gör sedan **steg B av piloten** på de övriga Afrikaissuesen (#2103–#2106, #2110 är gjord, #2111) med samma mått.
3. **Vill vi spara token på riktigt** måste de fasta kostnaderna per omgång ner. Det kräver DasKrokodils beslut:
   - (a) större omgångar per pull request, till exempel 30–40 händelser, eftersom testsviten, bygget och skärmbilderna kostar lika mycket oavsett storlek;
   - (b) skärmbilder bara för ett urval av bildomgångarna;
   - (c) att de "ej hämtade" bilderna körs i Actions utan agent.
4. **Mät token rätt nästa gång:** total förbrukning per omgång, inte sammanhangets storlek. Det går att räkna ur arbetarnas loggar; metoden står i "Efterhandsmätning".

## Efterhandsmätning: verklig tokenförbrukning (2026-11-22)

**Metod:**
- Varje arbetares logg (en rad per anrop till modellen) lästes med ett skript som summerar fälten `usage` en gång per anrop.
- Det ger fyra delar: ny indata, indata som skrivs till cache, indata som läses ur cache, och utdata.
- För att jämföra kostnad viktas delarna i förhållande till vanlig indata. Viktningen följer modellens prisförhållanden: ny indata 1, cacheskrivning 1,25, cacheläsning 0,1 och utdata 5.
- Siffrorna omfattar hela arbetet per issue: byggande och alla rättningar efter granskningen.

| Issue | Arm | Anrop | Cacheskrivning | Cacheläsning | Utdata | Viktad summa |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| #2107 | pipeline | 83 | 560 191 | 14 272 895 | 62 703 | cirka 2,44 miljoner |
| #2108 | pipeline | 120 | 451 389 | 24 431 927 | 80 140 | cirka 3,41 miljoner |
| #2109 | pipeline | 107 | 381 574 | 19 264 477 | 64 676 | cirka 2,73 miljoner |
| #2110 | kontroll | 102 | 233 402 | 21 223 705 | 66 117 | cirka 2,75 miljoner |

**Slutsats:**
- Pipelinen kostade i snitt **cirka 2,86 miljoner** viktade tokens per issue, mot **2,75 miljoner** för kontrollen. Det är ungefär 4 % mer, med ett spann från 11 % mindre till 24 % mer.
- Någon besparing finns alltså inte.
- Det mesta av kostnaden är cacheläsning: varje anrop läser om hela det sammanhang som vuxit fram. Kostnaden växer därför med **antalet anrop gånger sammanhangets storlek**, inte med hur mycket agenten söker.
- Pipelinens arbetare gjorde lika många anrop som kontrollen eller fler, bland annat för fler bilder per issue, handbeskärningar och skärmbilder.

**Granskningens verkliga förbrukning (viktad):**

| Granskning | Viktad summa |
| --- | ---: |
| Historikern för #2188 | cirka 0,23 miljoner |
| Historikern för #2190 | cirka 0,29 miljoner |
| Historikern för #2187 | cirka 0,26 miljoner |
| Historikern för #2191 | cirka 0,22 miljoner |
| Den samlade språkgranskningen, alla fyra | cirka 0,20 miljoner |
| Varje expertgranskning av de känsliga bilderna | cirka 0,12–0,16 miljoner |

Granskningen är alltså ungefär en tiondel av byggarnas kostnad.

**Vad det betyder för nästa steg:**
- Den största hävstången är **färre anrop med mindre sammanhang**, inte bättre kandidater.
- Konkret: kortare uppdrag att läsa in, skärmbilder och hela testsviten en gång per omgång i stället för flera, inga omtag av skärmbilder, och omgångar som inte drar ut på tiden på grund av 429.
- Förbättringarna i #2193 minskar granskningens fynd. Steg B ska visa om de också minskar antalet anrop.

## Steg B: efter förbättringarna i #2200 (2026-11-22)

DasKrokodil beslutade att följa rekommendationerna (#2195): bygga #2193 (#2200) och sedan göra steg B med samma mått och verklig tokenmätning. Steg B gjordes på #2106 och #2111. Fler gick inte att ta, eftersom taket är sex öppna bild-pull requests per person. Uppdraget var detsamma som i steg A; bara verktygen var nya.

**Rättningar gjordes av en ny, liten arbetare** med en kort order, i stället för av byggaren. Byggaren hade ett långt sammanhang som gjorde rättningarna dyra i steg A.

| Issue och PR | Händelser | Bild efter granskning | Ej hämtad (429) | Ingen fri bild | Tid till PR | Rättning | Bygge (viktat) | Rättning (viktat) | Summa |
| --- | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: | ---: |
| #2106, [#2202](https://github.com/DasKrokodil/historia-globen/pull/2202) | 18 | 8 | 2 | 8 | 12 min | 3,5 min, och main ihopslagen | 1,68 miljoner | 0,68 miljoner | 2,36 miljoner |
| #2111, [#2204](https://github.com/DasKrokodil/historia-globen/pull/2204) | 17 | 8 | 0 | 9 | 15 min | 5 min, och main ihopslagen | 1,39 miljoner | 0,79 miljoner | 2,18 miljoner |

**Jämförelse:**
- **Kostnaden för att bygga, före rättningar, räknat ur loggarna:**

  | Omgång | Viktad kostnad | Jämfört med kontrollen |
  | --- | ---: | ---: |
  | Steg B, i snitt | 1,54 miljoner | **−28 %** |
  | Steg A, i snitt (1,54 / 2,41 / 1,82) | 1,92 miljoner | −10 % |
  | Kontrollen #2110 | 2,14 miljoner | – |

- **Hela kostnaden med rättningar:** steg B 2,27 miljoner i snitt, steg A 2,86, och kontrollen 2,74. Steg B är **−17 %** mot kontrollen.
- **Rättningarna med en ny arbetare** kostade 0,68 och 0,79 miljoner, och då ingick att slå ihop main. Det är ungefär lika mycket som steg A:s två rättningsomgångar per issue (0,6–1,0 miljoner), men steg A slog inte ihop main.
- **Andel med bild:**

  | Omgång | Med bild | Utan de "ej hämtade" |
  | --- | --- | --- |
  | Steg B | 16 av 35 = 46 % | 48 % |
  | Steg A | 52 % | – |
  | Kontrollen | 44 % | – |

  Inget av dem når 65 %. Det kravet kom från en omgång i Europa (#2170). I Afrika finns färre fria bilder: kandidatlistan saknade kandidat för 11 av 18 händelser i #2106.
- **Licensfel som når `main`:** 0. Granskningen stoppade Sydsudan-bilden: licensmallen stämde inte med upphovet, och Flickr-licensen gick inte att kontrollera.
- **Granskningens kostnad:** historikern 0,27 och 0,30 miljoner, den samlade språkgranskningen 0,20 miljoner, och de fem expertgranskningarna av barnsoldatbilden 0,11–0,13 miljoner var.

**Vad förbättringarna gav:**
- Beskrivningen i listan sparade öppnade filsidor. Lydenburgs kandidater visade sig vara ormar redan i listan.
- `passa-in` ersatte handbeskärningen.
- `--ej-hamtade` gjorde att arbetarna slapp vänta på 429.
- Byggarna gjorde färre anrop: 72 och 54, mot 66–96 i steg A och 82 i kontrollen.

**Fynd i steg B som redan är rättade i #2200:**
- GFDL med `migration=relicense` räknas nu som CC BY-SA 3.0, så två bilder valdes bort i onödan.
- `passa-in` gav svart bakgrund på genomskinliga bilder.
- `konstverk` flaggade antika föremål, kartor och en kyrkogård.
- `staende` mäter nu hur mycket av höjden 4:3-utsnittet tar bort.

**Kvar att göra:** kandidatlistan saknar kandidater för många händelser i Afrika. En ny körning av `bildkandidater.py` med bättre söktext kan ge fler.

**Slutsats efter steg B:**
- Byggkostnaden ligger nära målet (−28 % mot 30 %), och hela kostnaden är −17 %.
- Pipelinen är snabbare än det gamla sättet och ger lika många eller fler bilder, utan fler licensfel.
- Måttet för andel med bild bör sättas per världsdel.

## Rekommendation till DasKrokodil efter steg B

1. **Gör pipelinen till standard för bildissuesen**, med rättningar av en ny, liten arbetare. Den är billigare och snabbare än det gamla sättet.
2. **Sätt måttet för andel med bild per världsdel**, till exempel kontrollens nivå som golv i Afrika (44 %). Behåll licensfel noll och full granskning.
3. **De fasta kostnaderna** (fråga 2 i #2195) är nästa hävstång: större omgångar, skärmbilder för ett urval, och de "ej hämtade" i Actions. Avgör dem innan alla 58 återstående bildissues körs.
4. **Ramstilen** för känsliga foton (fråga 4) är fortfarande öppen.

## Första omgången med pipelinen som standard: #2104 och #2105 (2026-11-22)

Omgången följde beslutet om pipelinen som standard: 36 händelser i en pull request ([#2210](https://github.com/DasKrokodil/historia-globen/pull/2210)), inga skärmbilder, testsviten en gång och rättningen gjord av en ny, liten arbetare. Händelserna är förhistoria och antik tid i Afrika och granskades därför av `forhistoriker`.

| Mått | Värde |
| --- | --- |
| Händelser | 36 |
| Med bild efter granskning | 12 (33 %) |
| Ej hämtade (429) | 6, med färdiga bildtexter i `data/utkast/bildbatch/2104-2105.json`, för omhämtning i Actions |
| Ingen fri bild | 18, varav 13 utan kandidat; alla egna sökningar gav 429 |
| Tid till pull request | 11 minuter |
| Bygget (viktat) | 1,66 miljoner (0,83 miljoner per 18 händelser) |
| Rättningen (viktad) | 0,42 miljoner |
| Summa per 18 händelser | 1,04 miljoner: **−62 %** mot det gamla sättet (2,74), −54 % mot steg B (2,27) |
| Granskning (viktad) | förhistorikern 0,25 och språket 0,19 miljoner |
| Licensfel till main | 0 |

**Slutsatser:**
- Större omgångar utan skärmbilder halverar kostnaden per händelse.
- Andelen med bild (33 %, eller 50 % när de sex ej hämtade är inne) ligger under golvet 44 % för Afrika, men den här omgången var nästan bara förhistoria.
- Golvet bör därför gälla per världsdel och period, eller mätas över flera omgångar.
- Fynd som är rättade i #2200: flaggan `datum-osakert` var fel för nästan alla bilder med den gamla kandidatlistan och sätts inte längre, och licensen CC BY-SA 3.0 IGO känns nu igen.

## Övriga fynd

- Ett möjligt sakfel i en händelsetext, "Tyskland erkände 2015", ska kontrolleras: #2194.
- Fältet `style` följer tid och plats (`data/styles.json`). Granskarna tyckte att ramen `affisch` runt ett foto av fångar i ett folkmord, och ramen `islamisk` runt en brittisk affisch, passar illa. Det är en fråga för DasKrokodil och `ux-tillganglighet`, och den ändras inte här.
- Tre händelser med känsliga bilder saknar titel och sammanfattning på fr (och delvis es och de). Det är en äldre lucka i översättningen och ökar inte här.
