# Utvärdering av landspiloten: länder och landskort (#1274)

Datum: 2026-11-28. Underlag för DasKrokodils beslut. **Inget är byggt.** Modellnivå: Opus. Mätningarna är gjorda mot `data/platser.json` och `data/events.json` på `main` (2 024 händelser) med projektets egen funktion `placeEvents()` (`js/place-geo.js`), så att talen följer det kortet visar. Pedagogens bedömning kommer från `larare`, som läste skärmbilderna och texterna men inte testade i webbläsare.

## Kort svar

1. **Villkoret för utvärderingen är inte uppfyllt.** Issuet säger att utvärderingen görs när Sverige, Danmark och minst tre av Etiopien, Peru, Australien och Japan har landskort. **Inget av de fyra pilotländerna har landskort.** Utvärderingen nedan gäller därför det som finns: 22 landskort (21 i Europa och Aotearoa), Grönland och 25 svenska landskap.
2. **Europa är för dominerande, och det blir värre.** 21 av 22 landskort och 92 procent av händelserna i kortens gränser ligger i Europa, mot 41 procent av alla händelser i datan. Codex bygger nu ytterligare omkring 16 europeiska länder (#1827–#1842), så skevheten växer om inget annat byggs samtidigt.
3. **Arbetsgången håller.** Alla 759 händelser i korten har källa, ingen är `draft`, 40 procent är `two-sources`. Antalet oöversatta texter har jag inte räknat per pull request; det kontrolleras av `tools/oversattning.py` i varje pull request.
4. **Kortet fungerar tekniskt, men är mest en händelselista.** Landskorten laddar på dator och i 400 px utan konsolfel och utan horisontell scroll. Pedagogen ser tre problem: det står inte tydligt vad man ska göra, det saknas en röd tråd, och dagens gräns kan läsas som att landet alltid funnits.
5. **Rekommendation:** bygg pilotländerna utanför Europa före fler europeiska länder, och sätt spridningen som villkor för varje omgång (se beslutstabellen sist).

## 1. Läget

| | Antal |
|---|---:|
| Landskort (typ `country`) | 22 |
| varav Europa | 21 |
| varav utanför Europa | 1 (Aotearoa/Nya Zeeland) |
| Grönland (typ `autonomous`, räknas till Nordamerika) | 1 |
| Svenska landskap (typ `landskap`) | 25 |
| Pilotländer med landskort (Etiopien, Peru, Australien, Japan) | **0 av 4** |

De 19 landspull requestarna `… som land: landskort` (#1808–#1826, Norge till Ungern) är alla byggda på `claude/`-grenar. Sverige, Danmark, Grönland och Aotearoa kom tidigare.

## 2. Balans (andel Europa)

Mätning: händelserna inom varje lands gräns, 759 platser i listan (en händelse kan räknas i två länder bara om båda listar den; överlappen är liten).

| Mått | Landskorten | Alla händelser |
|---|---:|---:|
| Andel Europa | **92 %** (697 av 759 händelser) | 41 % (838 av 2 030, täckningsrapporten 2026-11-28) |
| Andel krig | **16,5 %** (125 av 758 unika) | 25,7 % (521 av 2 024) |
| Händelser per kort | median 22, minst 16 (Island, Norge), mest 175 (Sverige) | |

- **Krigsandelen är rimlig, och lägre än i datan som helhet.** Mellan kort varierar den från 0 procent (Schweiz, Island, Grönland) till 38 procent (Polen), 32 procent (Estland) och 29 procent (Frankrike). Aotearoa ligger på 25 procent.
- **Sverige är en outlier:** 175 händelser, nästan en fjärdedel av alla händelser i korten. Troligen beror det på de 25 landskapen, vars händelser också ligger inom Sveriges gräns (inte kontrollerat händelse för händelse).
- **Aotearoa har inga rikesperioder** (`periods`), medan övriga 21 länder har mellan 6 och 26. Därmed saknas raden om vilka riken som styrde området.
- **Grönland är det enda kortet i Nordamerika och Aotearoa det enda i Oceanien.** Asien, Afrika och Sydamerika har inget landskort.

## 3. Kvalitet (mätbart)

- **Källor:** 0 av 759 händelser saknar källa, 0 är `draft`. 304 (40 procent) är `two-sources`, resten `source-checked`.
- **Webbläsare:** jag öppnade `#y=1500&f=place:sverige` och `…aotearoa` i Chromium, på dator (1280×800) och 400 px. Inga konsolfel, ingen horisontell scroll. Observationer från skärmbilderna: på 400 px täcker kortpanelen ungefär halva globen, och den första axeletiketten på tidslinjen i Aotearoas läge är avklippt ("000 f.Kr." i stället för det fulla årtalet).
- **Hela webbläsartestet** (`tests/webblasare.mjs`) kördes inte i sin helhet här; en delkörning startades men hann inte klart, se pull requesten för utfall. CI på `main` är det som gäller.
- **Hållbarhetsvarningarna** (`tests/hallbarhet-test.py`) kördes inte. Det görs vid releasen.

## 4. Pedagogens frågor (`larare`)

Läst: skärmbilderna, introtexterna för Sverige, Aotearoa, Danmark och Grönland och planeringen. **Inte testat i webbläsare, inga elever.**

- **Fungerar:** meningen "Det här är dagens Sverige. Rikena visar var området hörde hemma då." gör skillnaden mot att följa ett rike tydlig och är kort nog för åk 4–6. "Det är ett urval, inte en heltäckande historia" hjälper källkritiken i åk 7–9. Danmark har en rad om vad konturen utesluter (Grönland, Färöarna), vilket är rätt.
- **Förvirrar:**
  1. *Vad gör man?* Nästan allt står i en lång textruta, tre av meningarna säger ungefär samma sak, och ingen mening säger "Tryck Spela". På mobil skymmer panelen globen.
  2. *Lista, inte berättelse.* "Händelser på platsen (175)" i tidsordning, utan perioder eller röd tråd. Aotearoa börjar med fyra vulkanutbrott, så första intrycket blir naturkatastrofer, inte människor. (Pedagogen såg inga perioder på skärmbilderna; planeringen föreslog 4–6 perioder per land. Rikesperioderna i `periods` är något annat än berättelseperioder.)
  3. *Dagens gräns.* En elev kan läsa "Sverige fanns redan på bronsåldern". Förslag: en tillståndsrad när landet inte fanns som stat det året.
  4. *Aotearoa/Nya Zeeland:* ingenstans står att Aotearoa är maoriernas namn och Nya Zeeland kom med européerna. Tidsaxeln är nästan tom före 1300, vilket kan läsas som att inget hände.
  5. Orden "land", "stat" och "rike" har ingen ordlista; etiketterna "Plats" och "Land" är svaga för barn.
- **Beslut som är DasKrokodils:** ska kortet ha berättelseperioder (annars förblir det en lista), och ska Aotearoa/Nya Zeeland-namnet förklaras (kräver öppnad källa).
- **Efter bygget:** läsbarhetstest med elever (åk 5 och åk 8).

## 5. Vad piloten kostade och vad Codex bidrog med

- **Tid och tokens kan jag inte mäta.** Det finns ingen logg över tokenförbrukning i repot eller i GitHub-historiken. Det jag kan mäta är volymen: de 19 landspull requestarna med 9–20 nya händelser vardera (omkring 320 nya händelser, räknat ur pull requestarnas titlar) plus landskortens konfiguration (`data/platser.json`, nu 48 platser).
- **Codex:** bland de 292 senast ihopslagna pull requestarna (jag hämtade de tre sista sidorna, alltså inte hela historiken) har 25 `codex/`-grenar. **Ingen av dem är ett landskort.** Codex bidrog till det som kortet bygger på: platskortets layout och laddning (#2154, #2354, #2355), kort och skarvar (#2152), regionvyns grannar (#2373), tillgänglighet och kontrast (#2153), en källundersökning om samiska namn (#2374), bilder och översättningar. Från 2026-11-28 bygger Codex självt länder i södra Europa och på Balkan (#1827–#1842). Landskortens pull requests ligger under DasKrokodils konto, så författare går inte att skilja åt; indelningen är efter grennamn och titel.
- **Risk:** de europeiska länderna kostar lite per land (samma mönster) men ger mest arbete för skeva resultat. De fyra pilotländerna utanför Europa är dyrare per land (källor, gränsfrågor, urfolkshistoria) men är det som balansen kräver.

## 6. Pilotländerna och 6.6.4

Versionsplanen (6.6.4) samlar Östeuropa (#1843–#1845), mikrostaterna (#1846) och pilotländerna Etiopien, Peru, Australien och Japan (#1270–#1273, #1267) och säger att den "startar efter utvärderingen". Planeringen från 2026-11-12 räknade händelser inom gräns för dem då: Etiopien 19, Peru 20–21, Japan 24–27, Australien 27–32 (mot 929 händelser totalt då; talen är idag högre men inte omräknade, eftersom länderna saknar gräns i `platser.json`). Japan väntar på beslut om Kurilerna och Dokdo/Takeshima (#1267).

| Pilotland | Världsdel | Hinder | Min bedömning |
|---|---|---|---|
| Etiopien | Afrika | Ingen omstridd gräns. | Först |
| Peru | Amerika | Fyller en tom Sydamerika; ingen omstridd gräns. | Först |
| Australien | Oceanien | Urfolkshistoria är bärande, känsligt ämne: källor från urfolkssamhällen och osäkerhet öppet (samma försiktighet som #2404). | Först, med Opus och `historiker` |
| Japan | Asien | Kurilerna och Dokdo/Takeshima måste avgöras först (#1267). | När gränsbeslutet är taget |

## Rekommendation till DasKrokodil

| Fråga | Rekommendation |
|---|---|
| Ska utvärderingen räknas som gjord? | **Nej, den är en förhandsutvärdering.** Villkoret (tre pilotländer utanför Europa) är inte uppfyllt. Utvärdera på riktigt när minst Etiopien, Peru och Australien har kort. |
| Hur går länderna i 6.6.4 vidare? | **Pilotländerna utanför Europa först (Etiopien, Peru, Australien, sedan Japan), därefter Östeuropa och mikrostaterna.** Sätt ett villkor per omgång: högst så många nya europeiska kort som nya kort utanför Europa. |
| Ska Codex södra Europa och Balkan (#1827–#1842) pågå parallellt? | Det är DasKrokodils beslut. Om de byggs färdigt blir 37 av 39 landskort europeiska (95 procent). Alternativ: pausa efter en omgång om fem och bygg pilotländerna emellan. (Jag rör inte Codex pågående arbete.) |
| Vad ska göras åt kortets utformning innan fler länder? | Pedagogens tre punkter är billiga och påverkar alla kort: en handlingsmening i introt ("Tryck Spela"), en tillståndsrad för år då landet inte fanns, och Aotearoa-namnet förklarat. Berättelseperioder är en större fråga och kräver beslut. |
| Aotearoa saknar rikesperioder | Lägg till dem i samband med nästa omgång (kräver öppnade källor). |

Fler länder ska tas i omgångar om fem, ett per världsdel, med spridningen som villkor, enligt rekommendationen i #1274.

## Hur siffrorna togs fram

- Landskort, typ och rikesperioder: `data/platser.json` (48 platser).
- Händelser per kort: `placeEvents(place, events)` ur `js/place-geo.js` med `linkIncludeEvents`, mot `data/events.json`, med händelsernas punkt som `_lon`/`_lat`. Krigsandel: kategorin `krig`. Källor och granskning: fälten `sources` och `review`.
- Alla händelser per världsdel: `python3 tools/tackning.py --ut -` (2026-11-28).
- Pull requests: GitHub-sökning på titlarna "landskort" och en genomläsning av grennamnen på de 292 senast ihopslagna pull requestarna.
- Webbläsarobservationerna: Chromium via Playwright, `http://localhost:8011/#y=1500&f=place:<id>`, dator och 400 px.

**Det jag inte kunde kontrollera:** tokenkostnad, tid, hela webbläsartestet, hållbarhetsvarningarna, elevers förståelse, och om det finns landskort som lagts till på öppna grenar sedan `main`.
