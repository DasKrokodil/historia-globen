# Förstudie: en programstyrd pipeline för bilder och faktatäckning

**Datum:** 2026-11-22 · **Gjord av:** Claude Code (DasKrokodils konto, kontrollerat med `get_me`), Opus · **Experter (read-only):** `historiker`, `arkitekt`, `larare` · **Status:** förslag. Ingenting är byggt, och ingen data är ändrad. Rekommendationen ligger i issuet som nämns sist och väntar på DasKrokodils ja.

## Sammanfattning

- **Bilder: ja, en stor del kan göras av ett program.** Licenskontrollen gick att avgöra mekaniskt för 56 av 59 slumpade kandidater (95 %). Motivet kan däremot inte bedömas av ett program: bara 214 av 776 händelser med en tillåten kandidat har en kandidat utan varningsflagga. Programmet kan ta över sökning, licens, källpost, `image`-fält och licensfraser. Agenten behåller valet av motiv och bildtexten. **Uppskattad besparing per bildissue: 35–55 % av token** (antaganden nedan).
- **Fakta: delvis.** Ett program kan ta fram kandidater med år, precision, koordinat och Wikidata-id och sortera bort dubbletter. Att öppna källan, skriva en egen sammanfattning och översätta måste en agent göra (Källpolicy punkt 3, Licenser). De största luckorna är förhistorien och antiken utanför Europa. Där har de strukturerade källorna minst data, eller fel slags data. **Uppskattad besparing: 10–30 %.**
- **Riken: liten vinst.** `tools/riken.py` och `tools/tackning_riken.py` är redan program. Det agenterna lägger token på är bedömningar (källfel i Cliopatria, handskrivna fält). **Uppskattad besparing: 0–15 %.**
- **Rekommendation:** bygg först en liten bildpipeline (en delad licensmodul och en granskningslista per batch). Prova den på Afrikas bildissues i milstolpen "Löpande: Bilder: riktiga bilder". Faktapipelinen väntar tills bildpiloten är utvärderad, och den kräver tre beslut av DasKrokodil (se Grindar).

## Steg 0: underlag

Läst: `docs/bilder-riktiga.md`, `tools/bildkandidater.py`, `tools/bild_hamta.py`, `tools/bilder_in.py`, `tools/tackning.py`, `tools/hced.py`, `tools/riken.py`, `tools/ortnamn.py` (docstrings och kärnfunktioner), `docs/beslut/2026-11-20-bilder-riktiga-bilder-i-bitar-och-undantag.md`, `docs/kallor.md` (massimport #61) och CLAUDE.md (Källpolicy, Licenser, Bilder). Också bildomgången #2170 (pilotrapport med tider) och tidigare tokenmätningar i `docs/granskningar/`.

Mätt på `main` (c8f3f72) 2026-11-22. Skripten för mätningen ligger utanför repot, och siffrorna går att räkna om ur data.

## 1. Bilder

### Händelser utan bild per period och världsdel

Synliga händelser (inte `draft`), mätt ur `data/handelser/`. Cellerna visar "saknar bild / alla".

| Period | Europa | Asien | Afrika | Amerika | Oceanien | Summa |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Förhistoria (före 3000 f.Kr.) | 48/49 | 59/62 | 31/32 | 21/21 | 18/18 | 177/182 |
| Antiken (3000 f.Kr.–500) | 90/99 | 84/104 | 54/61 | 56/61 | 29/31 | 313/356 |
| Medeltid (501–1500) | 39/53 | 41/63 | 36/43 | 30/39 | 20/26 | 166/224 |
| Tidigmodern tid (1501–1799) | 25/56 | 27/38 | 17/32 | 37/45 | 17/22 | 123/193 |
| 1800-tal | 25/44 | 24/31 | 23/26 | 35/48 | 19/30 | 126/179 |
| 1900-tal | 30/60 | 74/91 | 45/56 | 41/56 | 38/45 | 228/308 |
| 2000-tal | 10/12 | 14/18 | 9/10 | 8/10 | 8/8 | 49/58 |
| **Summa** | **267** | **323** | **215** | **228** | **149** | **1 182 / 1 500** |

Bilder i dag: 280 historiska och 38 illustrationer. Av de 1 182 utan bild syns 921 utzoomat (`top` eller inte `partOf`). De övriga 261 är slag som bara syns i Fokus.

### Wikidata-id och kandidater

- **687 av 1 182** händelser utan bild har ett Wikidata-id.
- `data/utkast/bildkandidater.json` (körd 2026-11-20, 1 182 händelser) täcker 1 169 av dem som fortfarande saknar bild:
  - **763** har minst en kandidat med tillåten licens enligt `bildkandidater.py`.
    - **530** av dem har en tillåten bild via Wikidatas P18.
    - **233** har den bara via fritextsökning på Commons.
  - **642** har en tillåten kandidat som är minst 800 px bred.
  - **406** har ingen kandidat alls. Det är ungefär en tredjedel. Ett program kan inte hjälpa dem, utöver att skicka dem direkt till `docs/bilder-saknas.md` eller illustrationskön i stället för att låta en agent söka igen.
  - 146 händelser har Wikidata-id men ingen bild på posten (P18).
- Fördelat per världsdel (saknar bild / har en tillåten kandidat / varav via P18):

  | Världsdel | Saknar bild | Tillåten kandidat | Via P18 |
  | --- | ---: | ---: | ---: |
  | Europa | 267 | 166 | 114 |
  | Asien | 323 | 208 | 132 |
  | Afrika | 215 | 136 | 100 |
  | Amerika | 228 | 164 | 124 |
  | Oceanien | 149 | 89 | 60 |

- Licensklasser bland 1 473 kandidater:
  - public domain: 632 (varav 50 med Commons-etiketten "No restrictions")
  - CC BY-SA: 574
  - CC BY: 200
  - CC0: 56
  - avvisade: 11 (Attribution 5, GODL-India 3, KOGL, GFDL, ECB)

### Vad en mekanisk licenskontroll klarar (uppmätt)

60 slumpade kandidater (första tillåtna kandidaten per händelse, slumptal 20261122) kördes som torrkörning genom `tools/bild_hamta.py --dry-run`. Verktyget läser licensmallen via `action=raw` och jämför den med `extmetadata`. Resultat:

| Utfall | Antal | Andel |
| --- | ---: | ---: |
| Licensen klar mekaniskt (mall och API stämmer) | 56 | 95 % av 59 |
| Flaggad till en människa | 3 | 5 % |
| Tekniskt fel | 1 | – |

- **De tre flaggade:**
  - API:et anger CC BY 3.0, men filsidan har ingen licensmall.
  - "No restrictions" utan licensmall.
  - API:et anger CC BY-SA 4.0, men mallen säger bara `{{self|GFDL}}`.
- **Det tekniska felet är en bugg:** `bild_hamta.py` avvisar id:t `vapenstilleståndet-i-korea`, som är det enda händelse-id:t med tecken utanför a–z.
- **De två verktygen klassar licenser olika:** `bildkandidater.py` räknar Commons "No restrictions" (50 kandidater) som public domain. `bild_hamta.py` flaggar samma etikett. CLAUDE.md tillåter bara Library of Congress-märkningen "No known restrictions on publication", inte "No restrictions" i allmänhet. En pipeline behöver **en** licensmodul.
- **Slutsats:** licensen kan avgöras utan människa i ungefär 9 av 10 fall. Resten flaggas. Ett program godkänner aldrig något flaggat.

### Var en människa måste bedöma (uppmätt)

Varningsflaggor på den första tillåtna kandidaten för 776 händelser (en kandidat kan ha flera):

| Flagga | Antal |
| --- | ---: |
| Foto taget 1990 eller senare för en händelse före 1900 (nutida foto av plats eller föremål) | 372 |
| Ur fritextsökning, inte Wikidatas P18 | 234 |
| Smalare än 800 px | 161 |
| Ser ut som en karta (filnamn, kategori, beskrivning) | 106 |
| **Ingen flagga alls** | **214** |

Både historikern och läraren säger att flaggorna bara får **sortera och varna, aldrig avvisa**. Ett nutida foto kan vara rätt bild om bildtexten säger "Nutida foto av …". Bara licensfel och för låg upplösning får avvisas automatiskt. Senare avbildningar, propaganda, karikatyrer, fantasiporträtt, kartor och respektregeln (Muhammed) kräver att någon tittar på bilden och läser filsidan.

### Jämförelse med en riktig omgång (#2170, Europa 1677–1807)

- 20 händelser gav 13 bilder (65 %).
- 5 blev "ej hämtade" (HTTP 429 från Wikimedia och 403 från loc.gov).
- 2 saknade lämplig fri bild.
- 87 minuter totalt, varav 30 minuter till rättad leverans.
- 2 av de 13 bilderna är kartor, vilket är godtagbart med bildtext.

Kandidatlistan ger nästan samma andel (763 av 1 169 = 65 %). Det betyder att **listan redan pekar ut de träffar som går att hitta**. Agenten letar i dag på nytt efter samma sak.

## 2. Fakta

### Luckor enligt `tools/tackning.py` (2026-11-22)

De tio största luckorna (relativ brist, vägd efter periodens längd och landyta):

1. Förhistoria, Amerika: 21 händelser, väntat 181
2. Förhistoria, Afrika: 32, väntat 129
3. Förhistoria, Asien: 62, väntat 186
4. Förhistoria, Oceanien: 18, väntat 39
5. Antiken, Amerika: 61, väntat 128
6. Medeltid, Amerika: 39, väntat 68
7. Antiken, Afrika: 61, väntat 91
8. Antiken, Asien: 104, väntat 131
9. Medeltid, Afrika: 43, väntat 49
10. 2000-tal, Amerika: 10, väntat 11

Fler mätvärden:

- **Tomma kategorier:** `manniskan` saknas helt efter 1500. `sport` och `rymden` är nästan tomma före 1900. Medeltid och tidigmodern tid saknar `natur` och `klimat` i nästan alla världsdelar.
- **Krig:** 31 % av alla händelser, och 13 % av det som syns utzoomat.
- **Riken:** inga riken i Amerika och Oceanien i antiken. Rikena täcker 5 % av landytan år 500 f.Kr. och 17 % år 1000.

### Öppna källor och hur många poster de har

| Källa | Licens | Poster (uppmätt eller dokumenterat) | Passar luckorna? |
| --- | --- | --- | --- |
| Wikidata | CC0 | 6 297 slag med koordinat och datum (SPARQL 2026-11-22). Cirka 69 000 arkeologiska platser (P31 = Q839954) med koordinat: Europa 47 567, Asien 7 347, Nordamerika 3 006, Sydamerika 2 937, Afrika 1 552, Oceanien 85, och 2 769 utan världsdel. Antalet med startår före 3000 f.Kr. kunde inte räknas (frågan tog för lång tid och gav sedan 429). | Delvis. Ger år, koordinat och bild, men har slagsida mot Europa. En plats är ingen händelse, och dateringar saknas ofta eller är grova. |
| HCED (via WHG) | CC0 (WHG:s tillägg CC BY 4.0) | 6 951 platser. Utkast i dag: 122 i `data/utkast/hced.json`. | Nej för luckorna: bara konflikter, och krig är redan 31 %. |
| Cliopatria v0.2.1 | CC BY 4.0 | 1 587 stater. 412 grupper i `data/empires/index.json`. | För riken från 3400 f.Kr. Inte för förhistorien. |
| Natural Earth | Public domain | Gränser, orter och hav. | Bara geografi (platser, ortnamn), inga händelser. |
| Commons och loc.gov | per fil | 1 473 bildkandidater. | Bilder, inte fakta. |

### Vad som kräver text skriven av en agent

- `summary` och `title` på fem språk. Text får inte kopieras (CLAUDE.md, Licenser).
- `note` när källorna skiljer sig.
- `place` i läsbar form.
- Bedömningen av om en kandidat alls är en händelse som hör hemma på globen (urval och balans).
- Läraren påpekar också: likadana texter ("X ägde rum i Y") fungerar inte på ett elevblad. Varje text behöver ett "varför spelar det roll". Ord som "upptäckte" och "primitiva" smittar lätt från källorna. "Cirka" och EDTF måste följa med när årtalen är osäkra.

## 3. Token: vad ett program kan ta över

**Det finns ingen uppmätt tokenförbrukning för en bild- eller faktaomgång** (#895 stängdes utan mätning). Det enda uppmätta är planeringsagenter på 34 000–106 000 tokens per körning (`2026-11-10-planering-version-7.md`, `2026-11-10-planering-version-6-3-0-teman.md`), och expertsvaren i den här förstudien (cirka 59 000–66 000 tokens per expert). Allt nedan är därför **uppskattningar med märkta antaganden**:

- **A1:** en byggrunda med 20 händelser kostar 2–4 gånger en planeringsagent, alltså 150 000–350 000 tokens. Den gör många verktygsanrop och skriver bildtexter på fem språk.
- **A2:** granskningen (Codex-förgranskning plus en Claude Code som inte byggde, med historikerns frågor) kostar 50 000–120 000 tokens. Den samlade språkgranskningen kostar 30 000–60 000.
- **A3:** programmet gör sökning, licens, källpost och licensfraser. Agenten läser en granskningslista på cirka 20 rader i stället för 20 filsidor och skriver bara motivmeningen.

| Arbete | I dag per enhet | Med pipeline per enhet | Programmet tar över | Kvar som agentarbete |
| --- | --- | --- | --- | --- |
| Bildissue (20 händelser) | 230 000–530 000 (A1+A2) | 120 000–280 000 | sökning, licenskontroll, källpost, `image`, licensfraser, 429-hantering, köa "ingen kandidat" | motivval, bildtext (sv + 4 språk), granskning. Licensgranskningen blir en kontroll av listan |
| 60 bildissues (#2056–#2117 utom #2086) | cirka 14–32 miljoner | cirka 7–17 miljoner | | |
| Faktabatch (20 händelser, till exempel #1962, #1757, #1699) | 300 000–600 000 (antagande, mer text än bilder) | 220 000–450 000 | kandidatlista ur fasta frågor, år, precision och EDTF ur Wikidata, koordinater, dubbletter, balanskontroll (högst 25 % krig) | öppna källan, egen sammanfattning, översättning, `source-checked`, urval |
| Riken (#1331, #645, #646) | varierar | 0–15 % lägre | körningar av `riken.py` finns redan | bedömning av källfel, handskrivna fält |
| Bygget av pipelinen (engångskostnad) | – | 400 000–900 000, plus prov | | |

**Bygget betalar sig efter ungefär 3–8 bildissues** (med besparingen ovan). **Osäkerheten är stor**, med en faktor på ungefär 2 åt båda håll. Piloten ska därför mäta riktiga tokens, både för en omgång med pipeline och för en kontrollomgång som görs på det gamla sättet.

**Ett betalt API för översättning** skulle ta bort en del av agentens översättningstext. Det kostar pengar, kräver en nyckel som en hemlighet i GitHub (som bara DasKrokodil sköter, aldrig i repot), och språkgranskningen behövs ändå. Det rekommenderas inte nu.

## 4. Förslag till arkitektur (utan byggsteg)

Allt följer CLAUDE.md punkt 1–2. Det är skript i `tools/` med Pythons standardbibliotek (Pillow finns redan för `bilder_in.py`). De skriver bara till `data/utkast/`, som appen inte läser. Inget nytt beroende och inget i `js/`.

```
tools/licens_commons.py   EN licensklassning (mall + extmetadata) som bildkandidater.py och bild_hamta.py delar
tools/bildbatch.py        <issue> eller --region/--period → data/utkast/bildbatch/<issue>.json + granskningslista (.md)
tools/bild_hamta.py       (finns) körs på de rader agenten har godkänt
tools/faktakandidater.py  (steg 2, efter piloten) <period> <världsdel> [kategori] → data/utkast/fakta/<cell>.json
```

### Flödet för bilder

1. `bildkandidater.py` körs som i dag, i Actions, så att 429 inte stoppar agenten.
2. `bildbatch.py <issue>` läser issuets händelse-id, kör den strikta licenskontrollen och sätter motivflaggor. Den skriver en fil per batch, så att 60 issues inte krockar i samma fil.
3. **Granskningslistan** har en rad per händelse: föreslagen fil, filsidans adress, licens enligt mall och API, flaggor, upphov, datum och fältet "motiv: ___". Agenten kryssar i godkänd eller avvisad och skriver motivmeningen (bara det filsidan stöder, mönstret "Nutida foto av …" för nutida foton).
4. `bild_hamta.py --lista` på godkända rader, följt av `bilder_in.py`, `dela_data.py`, `oversattning.py` och `license_manifests.py`, som i dag.
5. Händelser utan kandidat förs direkt till `docs/bilder-saknas.md` med datum, så att ingen agent söker igen.

### Flödet för fakta (steg 2)

1. Fasta SPARQL-mallar per lucka ur `tackning.py`, med kvot per världsdel och högst 25 % krig, som massimportregeln #61 i `docs/kallor.md`.
2. Dubblettkontroll som i `hced.py`.
3. Programmet skriver händelseformatet med `review: "draft"` och **utan `summary`**.
4. Agenten öppnar källan, skriver texten och flyttar posten till `data/handelser/` som i dag.

### Fällor som programmet måste hantera (historikern)

- Wikidata saknar år 0: lägg till 1 på år före vår tideräkning. HCED och Cliopatria räknar på andra sätt, så varje källa behöver en egen omräkning och ett eget prov.
- Jämför bara år när båda källorna har precision 9 eller finare. Annars blir svaret "kan inte jämföras".
- Flera värden i Wikidata ska ge "Källorna skiljer sig", aldrig ett tyst val.
- Ett Wikidata-påstående utan referens, eller med bara "imported from Wikipedia" (P143), är ingen oberoende andra källa när vår första källa är Wikipedia.

### Arkitektens synpunkter

**Bryter inte mot arkitekturen.** Inget i förslaget bryter mot punkterna 1, 2 eller 6. `scripts/build-site.sh` utesluter redan `data/utkast/` från webbplatsen. Pythons standardbibliotek räcker för de nya skripten, och Pillow behövs bara där det redan används.

**Licensmodulen:**
- Den strängare regeln ur `bild_hamta.py` (mall och API ska stämma överens) blir den gemensamma.
- `bildkandidater.py` får bara sätta "trolig", aldrig "godkänd".
- Händelse-id kontrolleras mot de id som faktiskt finns i `data/handelser/`, inte mot ett mönster (`ID_RE`).

**Filkrockar:**
- `data/utkast/bildkandidater.json` är 3 MB, och `skriv()` skriver om hela filen med datum, så två körningar krockar alltid. Den bör delas upp som `data/utkast/bildkandidater/<världsdel>-<period>.json`, utan datum i själva datafilen.
- Batchfilerna blir `data/utkast/bildbatch/<issue>.json` och `.md`.
- Källposter skrivs bara som utkast i batchfilen. Agenten för in dem i `data/sources.json` i bild-pull requesten, och den som slås ihop sist ombaserar.

**Prov:**
- Byggs efter mönstret i `tests/bild-hamta-test.py`: inspelade svar och `--offline`.
- Datum sätts med `--datum`, utdata sorteras, och sömn och klocka injiceras.
- Proven ska täcka:
  - en licenstabell som ger samma klass i båda skripten,
  - id med å, ä och ö,
  - att samma indata ger exakt samma utdata,
  - dubblettkontrollen ur `hced.py`, som flyttas till delad kod och provas.

**Grindar:**
- Skriptet avbryter om utdatavägen efter `resolve()` inte ligger under `data/utkast/`.
- Ett nytt prov, `tests/utkast-grans-test.py`, underkänner en pull request från grenarna `bildkandidater/*`, `bildbatch/*` och `fakta/*` som ändrar något utanför `data/utkast/`. Det underkänner också ett faktautkast med `review` skilt från `draft` eller med fältet `summary`.
- Arbetsflödet kontrollerar `git status --porcelain` före commit.

**Minsta första steg, i ordning:**
1. Licensmodulen, id-kontrollen och licenstabellen (bara verktyg och prov). Nyttan går att mäta: de 50 posterna med "No restrictions" flaggas, och korea-id:t går igenom.
2. `bildbatch.py` utan nätverk, som läser den befintliga kandidatfilen och skriver granskningslistan.
3. Uppdelningen av kandidatfilen.

Steg 1–3 kan göras med Sonnet high. **Faktadelen är i praktiken massimport (#61) i större skala och kräver en beslutsfil** innan den byggs. Den görs med Opus.

## 5. Grindar

| Programmet får själv | Kräver en agent | Kräver DasKrokodils beslut |
| --- | --- | --- |
| Hämta metadata, licensmall, P18, år, precision och koordinat | Välja bild efter motiv | Om ett program får **sätta** `two-sources`. **Rekommendation: nej.** Programmet får föreslå, med referensen (P248/P143) visad, och agenten sätter nivån. |
| Avvisa på licens (NC, ND, fair use, bara GFDL) och på upplösning | Skriva bildtexten och motivmeningen, sv först, sedan en, de, es och fr | Om ett skript får anropa ett **betalt API** för översättning. **Rekommendation: nej nu.** Nyckeln får i så fall aldrig ligga i repot, bara som en hemlighet som DasKrokodil sköter. |
| Flagga karta, nutida foto, smal bild och träff ur sökning (aldrig avvisa på flagga) | Öppna källsidan och sätta `source-checked` | Om ett **tak för krig** ska gälla i automatisk import. **Rekommendation: ja, högst 25 % per batch**, som #61. |
| Skriva till `data/utkast/` och öppna en pull request med bara den mappen | Skriva `summary`, `title` och `note` | Om mönstret för bildtext till nutida foton och kartor ska vara **obligatoriskt** (läraren föreslår "Foto från [år]: [platsen] i dag, inte från [händelsens tid]"). **Rekommendation: ja.** |
| Räkna dubbletter och balans före och efter (`tackning.py`) | Flytta en post från utkast till `data/handelser/` | Om Commons-etiketten "No restrictions" (Flickr Commons) ska vara tillåten. **Rekommendation: nej tills vidare**, flaggas till en människa. |
| Köa händelser utan kandidat till `bilder-saknas.md` | Granska (en Claude Code som inte byggde) | Pilotens start och utvärdering |

**Tekniska spärrar:** ett prov ska underkänna en pull request där en pipelinefil har skrivit utanför `data/utkast/`. Skripten skriver aldrig `review` högre än `draft` och aldrig `summary`.

## 6. Pilot

- **Var:** milstolpen "Löpande: Bilder: riktiga bilder (ingen release)", Afrika.
  - Steg A: tre issues, #2107, #2108 och #2109 (Afrika 1000–1905, 60 händelser).
  - Steg B: resten av Afrika, #2103–#2106, #2110 och #2111, om steg A håller.
  - Afrika har lägst bildandel (17 %) och blandar förhistoria (få kandidater) med senare perioder (fler). Det gör den bra att mäta på.
- **Före piloten:** bygg `licens_commons.py` och `bildbatch.py` med prov, och rätta id-buggen i `bild_hamta.py`. Det är en pull request.
- **Kontroll:** en Afrikaissue av samma storlek byggs på det gamla sättet, för att få en riktig jämförelse av token och tid.

### Mått och gränser

| Mått | Krav för att hålla |
| --- | --- |
| Licensfel som når `main` | **0**. 100 % korsgranskning i piloten. |
| Andel händelser med godkänd bild | minst samma som i dag, 65 % (#2170). Mäts per världsdel och period. |
| Andel av programmets förslag som agenten underkänner, uppdelat på licens och motiv | Mäts. Licens under 5 %. |
| Flaggor som visade sig vara fel (en flaggad bild som var bra eller en oflaggad som var fel) | Mäts. Ingen oflaggad karta eller nutida foto utan rätt bildtext når `main`. |
| Tid per issue | under 87 minuter totalt (#2170) |
| Token per issue (riktigt mätt) | minst 30 % lägre än kontrollomgången |
| Stopp för 429 under agentens tid | 0 (sökningen sker i Actions i förväg) |

Historikerns krav för fakta när steg 2 kommer: piloten underkänns om en enda felaktig `two-sources` når `data/handelser/`. Krigsandelen och fördelningen per världsdel mäts med `tackning.py` före och efter.

## 7. Utkast: spår och milstolpar efter 6.5.0

Läget 2026-11-22: 317 öppna issues, 77 med `redo`. Av dem är 60 bildissues. **Notera:** CLAUDE.md:s versionsplan säger "6.7.0 Skolan och samtidigt", men milstolparna på GitHub heter nu "6.7.0: Täckning och riken, omgång 2" och "6.8.0: Skolan och samtidigt". CLAUDE.md behöver följa milstolparna.

| Ordning | Spår (milstolpe) | Innehåll | Ägare enligt reglerna |
| --- | --- | --- | --- |
| 1 | 6.5.1 Rättningar | 15 issues, 9 med `redo` | Fakta och data (#2156, #2157, #2137, #2140, #2151, #2162) tar **Claude Code**. Buggar i gränssnitt och test (#2152–#2155, #2145, #2168, #2178) kan **Codex**, Copilot och Andreas agenter ta. |
| 2 | Bildpipelinen (verktyg, en pull request) och pilot A | `licens_commons.py`, `bildbatch.py`, id-buggen; #2107–#2109 | Verktyget: **Claude Code** (Sonnet high; licens kräver Opus i granskningen). Pilot: **Claude Code**. |
| 3 | 6.8.0 Skolan och samtidigt | "Samtidigt", lektionsblad och uppdrag (#1710, #1316, #1342) | Innehållet: **Claude Code**. Kod som inte rör fakta: **Codex**. Läraren föreslår att den går före täckningen. |
| 4 | 6.7.0 Täckning och riken, omgång 2 | #1962, #1757, #1737, #1699, #2159 och riken (#1331, #645, #646, #556) | **Claude Code**, både på DasKrokodils och Andreas konto (Opus). Faktapipelinen steg 2 provas här, efter bildpiloten. Riken tas aldrig av Codex. |
| 5 | Löpande bilder, efter piloten | resten av de 60 issues | **Andreas agenter, även Codex och Copilot**, enligt undantaget 2026-11-20, med granskningslistan. Korsgranskning av en **Claude Code** som inte byggde. |
| 6 | 6.6.1 Sveriges landskap | 9 issues | Data: **Claude Code**. Gränssnitt: **Codex**. |
| 7 | 6.6.0 och 6.6.2–6.6.4 Länder | 49 issues, 6 med `redo` (#1808–#1813) | Data: **Claude Code** (gärna Andreas Claude Code). Gränssnitt (#1260, #1261): **Codex**. |
| 8 | 7.2 Lärarstöd för förhistorien | när epokerna (#1343) är beslutade | **Claude Code** med `forhistoriker` |
| löpande | Översättning | 37 issues | **Codex och Copilot** enligt undantaget för översättning, och Claude Code |

**Varför den ordningen (läraren):** trasiga saker kostar mest förtroende i klassrummet. "Samtidigt" och bladen gör det befintliga innehållet användbart. Täckningen utanför Europa är det samtidighetsidén vilar på. Länderna ökar den europeiska slagsidan om de kommer före 6.7.0. Ordningen är ett förslag. DasKrokodil bestämmer om 6.8.0 ska gå före 6.7.0 och länderna.

**Bilder i rätt ordning:**

- Turerna saknar bara 1 bild (av 54 händelser). Temat Teknik saknar 6 av 14. Fun facts saknar 36 av 118.
- 42 av dessa prioriterade händelser saknar bild, och 32 av dem har en tillåten kandidat.
- De bör tas först i bildspåret, före resten av de 921 som syns utzoomat.

## Luckor som experterna såg

- Det finns inga turer eller teman om Amerika och Afrika före 1500, utom Songhairiket (läraren).
- Lgr22 efter 1900 för åk 7–9 saknas (#2159).
- Bara ett tema finns (Teknik).

## Avslutning

- Beslutsissuet med rekommendationen: #2183 (`beslut-krävs`, milstolpen Väntar på beslut).
- Buggen i bildverktygen: #2182 (`redo`).

Nya issues skapade: ja, #2182, #2183

Kvar att ta: 78 issues med redo: de 60 bildissuesen #2056–#2117 (utom #2075 och #2086), #2182, och #2157, #2156, #2155, #2154, #2153, #2152, #2145, #2140, #2137, #1813, #1812, #1811, #1810, #1809, #1808, #1767 och #1528
