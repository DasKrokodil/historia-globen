# Pilotrapport: bildpipelinen i Afrika (#2107–#2109, kontroll #2110)

**Datum:** 2026-11-22 · **Beslut:** [docs/beslut/2026-11-22-bildpipeline-pilot.md](../beslut/2026-11-22-bildpipeline-pilot.md) (i #2186) · **Förstudie:** [2026-11-22-pipeline-forstudie.md](2026-11-22-pipeline-forstudie.md) · **Gjord av:** Claude Code (DasKrokodils konto), Opus, som dirigent. En arbetare per issue, och granskning av agenter som inte byggde.

## Kort sagt

| Mått (krav i beslutet) | Pipeline (#2107–#2109, 54 händelser) | Kontroll (#2110, 18 händelser) | Håller? |
| --- | --- | --- | --- |
| Licensfel som når `main` (0) | 0. Två bilder stoppades i granskningen. | 0. En bild stoppades i granskningen. | **Ja**, tack vare granskningen. Granskningslistan fångade inte felen. |
| Andel händelser med bild (minst 65 %) | 28 av 54 = **52 %** (58 % utan de "ej hämtade") | 8 av 18 = **44 %** (47 %) | **Nej**, i båda armarna |
| Tid per issue (under 87 min) | 12–15 min till pull request, plus cirka 2 min rättning | 20 min, plus cirka 1,5 min | **Ja**, och pipelinen var cirka 35 % snabbare |
| Token per issue (minst 30 % lägre än kontrollen) | 215 000–255 000, i snitt 230 000 | 260 000 | **Nej**: cirka 11 % lägre, osäkert mått |

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
  - Den verkliga förbrukningen per omgång är alltså inte uppmätt. Skillnaden mellan armarna är troligen liten.
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
4. **Mät token rätt nästa gång:** total förbrukning per omgång, inte sammanhangets storlek. Det kan stå i pilotrapporten om verktyget visar det.

## Övriga fynd

- Ett möjligt sakfel i en händelsetext, "Tyskland erkände 2015", ska kontrolleras: #2194.
- Fältet `style` följer tid och plats (`data/styles.json`). Granskarna tyckte att ramen `affisch` runt ett foto av fångar i ett folkmord, och ramen `islamisk` runt en brittisk affisch, passar illa. Det är en fråga för DasKrokodil och `ux-tillganglighet`, och den ändras inte här.
- Tre händelser med känsliga bilder saknar titel och sammanfattning på fr (och delvis es och de). Det är en äldre lucka i översättningen och ökar inte här.
