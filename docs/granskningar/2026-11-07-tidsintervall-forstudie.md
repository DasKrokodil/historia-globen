# Förstudie: tidsintervall på globen (#569)

Datum: 2026-11-07. Av: Claude Code. Ingen kod ändras. Alla antal är räknade ur `data/events.json` (761 händelser, varav 53 krig) och inga nya historiska fakta förekommer. Rapporten är underlag för Rikards beslut om intervalläget ska byggas.

## Sammanfattning

- Ett intervall (från–till) går att bygga som ett **kompletterande läge** utan att röra årsläget, men det ändrar principen "ett år styr allt" (CLAUDE.md punkt 3): `state.year` blir ett tal och intervallet blir ett par. Det är en arkitekturändring och kräver Rikards ok innan bygget.
- **Urvalet är enkelt och ger rimliga mängder** för de intervall som är intressanta (cirka 20–30 händelser för 1914–1918 eller 500–400 f.Kr.). Problem uppstår först vid hela sekler eller årtusenden.
- **Riken och religioner** går inte att visa för ett helt intervall. Rekommendation: visa läget vid intervallets slut (eller början, valbart), tydligt märkt.
- **Rekommendation:** bygg i tre delar (urval och panel, gränssnitt och adress, områdeslager), där del 1 inte kräver arkitekturbeslut.

## 1. Urvalet

I dag väljer `selectEventsForYear` (`js/date-events.js`) händelser med `start <= år <= end` och döljer öppna spann som började för mer än 100 år sedan (`isLongRunningBackgroundEvent`). Händelselagret lägger dessutom på ett tidsfönster runt året (`windowYears`, 1,2 % av det synliga spannet) där händelser tonas ned.

**Förslag, regler för intervallet [a, b]:**

1. En händelse ingår om dess spann **överlappar** intervallet: `start <= b` och `end >= a`. Punkthändelser är spann med `start = end`.
2. Händelser som ligger helt inom intervallet visas som vanligt. Händelser som bara **delvis** ligger inom (börjar före eller slutar efter) visas svagare och märks "pågår före/efter intervallet". De är lätta att skilja ut: de har `start < a` eller `end > b`.
3. Öppna spann (`edtf` slutar på `/..`) följer samma bakgrundsregel som i dag: de ingår inte om de började mer än 100 år före intervallets slut. Det gäller 2 händelser; det enda pågående kriget (`ongoing`, 1 händelse) ingår när intervallet når dess period.
4. Händelser med grov precision (`precision < 9`) har bara ett år i `start` och `end`, ibland ett långt spann (`jordbrukets-borjan` är cirka 2 000 år). De inkluderas enligt regel 1 och märks som osäkra (punkt 2).
5. Delar av krig (`partOf`) följer samma regel; utzoomat syns bara krigets `top`-händelse, som i dag.

**Antal träffar (överlapp, utan bakgrundsspann):**

| Intervall | Träffar | Helt inom | Sticker ut | Osäkra | Krig | Kategorier |
|---|---:|---:|---:|---:|---:|---:|
| 2600–2500 f.Kr. | 4 | 1 | 3 | 4 | 0 | 3 |
| 500–400 f.Kr. | 26 | 12 | 14 | 20 | 1 | 6 |
| 1000–1100 | 28 | 8 | 20 | 22 | 1 | 6 |
| 1346–1353 | 19 | 1 | 18 | 18 | 0 | 6 |
| 1914–1918 | 23 | 19 | 4 | 1 | 3 | 4 |
| 1939–1945 | 20 | 20 | 0 | 0 | 1 | 2 |
| 1900–1999 | 196 | 190 | 6 | 2 | 17 | 11 |
| 3000 f.Kr.–1 e.Kr. | 107 | 95 | 12 | 67 | 7 | 10 |
| 1500–2025 | 519 | 506 | 13 | 17 | 41 | 13 |

(Som jämförelse ger ett enskilt år 11–14 händelser: 1914 → 11, år 1000 → 14, 500 f.Kr. → 11.)

**Slutsatser:** moderna perioder har få osäkra datum och blir tydliga. Äldre perioder domineras av osäkra och långa spann (till exempel 1346–1353: 18 av 19 sticker ut), så "delvis inom" måste synas, annars ser mängden mer exakt ut än den är.

## 2. Osäkerhet

Återanvänd `uncertaintyRow` och `uncertaintyMark` (`js/ui/panel.js`): de märker redan `~`, `?`, `precision < 9`, ungefärlig plats och oense källor. Förslag:

- Listan för intervallet visar samma markering som årslistan, plus en rad för "delvis inom intervallet" (regel 2).
- Ingen sortering ska se ut som en exakt tidsordning för osäkra datum: sortera efter `start` men visa spannet (`formatEventTime`), inte bara startåret.
- Inga nya texter om fakta; bara gränssnittstexter i alla fem språkfilerna.

## 3. Riken och religioner

Rikens och religionernas områden ritas per år ur perioder (`areas.js`: `periods.find(p => år >= p.start && år <= p.end)`), och gränser ändras med åren. Att rita alla gränser som gällde under intervallet skulle antingen lägga flera rikens gränser över varandra eller ge intryck av att en gräns gällde hela tiden. Alternativ:

| Alternativ | För | Mot |
|---|---|---|
| A. Läget vid intervallets **slut** (eller början, valbart), märkt "läget år N" | Enkelt, använder dagens kod (`update({ year })`), ärligt om vilket år som visas | Missar förändringar under intervallet |
| B. **Inga områden** i intervalläget | Inget som kan missförstås | Globen blir tom och kontrasten mot årsläget stor |
| C. Områden som **fanns hela intervallet**, övriga tonade | Visar stabila riken | Nytt beräkningssätt, svårt att förklara, nya randfall |
| D. Stegvis bild med reglage inom intervallet | Visar förändringen | Är i praktiken årsläget igen, och uppspelning gör redan detta |

**Rekommendation: A**, med synlig etikett ("Områden visas för år N") och ett val att byta mellan början och slut. Uppspelningen (nuvarande årsläge) täcker redan D.

## 4. Gränssnittet

- **Val:** ett kompletterande läge i tidslinjen. Två handtag (från och till) på den segmenterade skalan, tangentbordsstyrda som dagens handtag (`js/timeline.js` har redan pilsteg och sidhopp). Alternativt två årsfält med f.Kr.-val, samma som årshoppet.
- **Aktivt intervall:** en rad i tidslinjens status ("1914–1918 · 23 händelser") och en tydlig knapp "Tillbaka till ett år" som återställer till intervallets slutår.
- **Uppspelning:** intervallet bör **pausa** uppspelning (eller spela som ett fönster som glider framåt). Rekommendation: starta uppspelning stänger intervallet och återgår till årsläget, för att inte få två rörliga tidsmodeller.
- **Fokus:** Fokus har sin egen tidsskala (`setFocus`, `focus.from/to`, delar av år). Intervall och Fokus bör **utesluta varandra**: att följa ett krig eller rike stänger intervallet, och att välja intervall avslutar Fokus.
- **Delbara länkar:** `js/url-state.js` bär bara `y`. Intervallet kan läggas som `y=1914&y2=1918` (okända fält hoppas redan över, så äldre versioner öppnar länken som ett år). `STATE_VERSION` och `fromJSON` i `js/state.js` behöver stöd för slutår, och `isNewStep` behöver avgöra när intervallbyte ger en egen historikpost.
- **Mobil och tangentbord:** två handtag på 400 px är trångt; fält med stegknappar är säkrare på pekskärm.

## 5. Prestanda och mängd

- Dagens data ger högst cirka 520 markörer (1500–2025), 196 för 1900-talet. Händelselagret ritar sprites per händelse och har en klustring av markörer; storleken styrs av zoom (`MIN_PX`–`MAX_PX`).
- Intervall upp till cirka 100 år (cirka 200 träffar) bör gå med dagens klustring. Större intervall behöver en **gräns**, till exempel "visar de 150 viktigaste (`top`, `major`), resten i listan", i samma ordning som `selectEventsForYear` redan prioriterar (`top`, `major`, övriga).
- **Risk:** datamängden växer. Massimporten per världsdel (#61, 5.1c) och kärnhändelserna (#452) kan flerfaldiga antalen. Gränsen ska därför vara en inställning och inte ett fast tal, och prestanda mäts på en större testmängd innan bygget.
- Händelsefilerna laddas per period (`data/genererat/handelser-*.json`); ett intervall över flera perioder måste ladda flera filer innan första ritningen, vilket annars ger ett halvtomt läge under laddning (en blind-spot-fråga).

## 6. Beroenden

- **#396** (tidsmodell för ungefärliga datum): ändrar samma tillståndsmodell och bör avgöras först eller samtidigt, annars bygger vi intervall på en modell som ska ändras. Ligger i version 7.
- **#476** (historiska perioder): ger färdiga intervall att klicka på ("Antiken"), men kräver beslut om periodindelningen. Intervalläget behöver inte vänta; perioder kan senare bli genvägar till ett intervall.
- **Återanvänds:** `selectEventsForYear`-mönstret i `js/date-events.js` (nästa funktion kan heta `selectEventsForRange`), `uncertaintyRow`, tidsfönstret i `windowYears` och prioriteringen `top`/`major`.
- **Berörs:** `js/state.js`, `js/timeline.js`, `js/url-state.js`, `js/controllers/render.js`, `js/layers/events.js`, `js/layers/areas.js`, `js/ui/panel.js`.

## 7. Rekommendation

**Bygg det, men som en tredelad leverans i 5.2** och först efter att Rikard har godkänt att tillståndet får ett intervall:

1. **Urval och panel (liten–medel):** `selectEventsForRange`, listan med "delvis inom", osäkerhetsmarkering, tester i node. Ingen UI-ändring i tidslinjen ännu; kan provas genom en intern parameter.
2. **Gränssnitt och adress (medel–stor):** val av från och till, aktivt intervall och återgång, `y2` i länken, samspel med uppspelning och Fokus, mobil och tangentbord. Här ändras `state.js` och `url-state.js`.
3. **Områden och lager (medel):** rikes- och religionslagren enligt alternativ A, med etikett; markörgräns.

**Beslut Rikard behöver ta:**

1. Ska "ett år styr allt" kompletteras med ett intervall, och i så fall ska det utesluta Fokus och uppspelning (rekommenderat)?
2. Rikesalternativ A, B, C eller D (rekommenderat A)?
3. Ska #396 avgöras före intervalläget, eller får intervallet byggas på dagens tidsmodell?
4. Ska #569 ligga kvar i 5.2 eller flyttas efter #396?

**Osäkerhet:** storleksbedömningen är grov. Prestanda är inte mätt i webbläsaren, bara räknad ur datan, och antalen växer med importen.
