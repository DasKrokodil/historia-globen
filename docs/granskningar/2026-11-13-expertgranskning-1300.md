# Expertgranskning av #1300: områden som inte är en stat (2026-11-13)

Granskning av förslaget i [#1300](https://github.com/DasKrokodil/historia-globen/issues/1300) ("Riken: hur visas områden som inte är en stat?"), som är ett beslutsissue utan kod. Granskare: `historiker`, `geograf`, `larare`, `ux-tillganglighet` och `arkitekt`. Språkexperterna kallades inte in, eftersom ingen ny text finns än; de behövs när orden för typerna ska översättas. Experterna ändrade inga filer. Granskningen är underlag till DasKrokodil, inget beslut.

## Slutsats

Alla fem stöder riktningen att visa områdena, så att kartan varken visar vita fält eller påhittade riken (alternativ B). Men alla fem hittar samma svagheter i det konkreta förslaget:

1. **Ett enda ord, "kulturområde", räcker inte.** Cliopatria definierar själv sina poster som politiska enheter. Stadsstäder, arkeologiska kulturer och småriken är olika saker.
2. **"Mjuk eller streckad kant" är redan upptagen.** Mjuk kant betyder osäker gräns (#73), streckad kant lydrike eller osäker religion, snedstreck krigsområde (#211). Ett eget mönster och ord behövs.
3. **En fylld sammanhängande polygon ger fel bild** för flera av posterna (se geografens mätningar).
4. **Heian och Scandinavian minor kingdoms stämmer inte med issuets beskrivning.**

## Fynd per expert

### Historiker (kontrollerat mot Cliopatria v021, Wikidata, Wikipedia)

- **Stämmer:** alla tidsspann och Q-id i issuet. Scandinavian minor kingdoms har Q1275225.
- **Typindelning:** föreslår fler typer, till exempel `citystates` (Maya, polis, Sumer, Pyu) och `culture` (Indus, Zapotec, Olmec, Veracruz, Minoan). Ordet "kulturområde" ska stå i faktarutan, inte härledas ur ett enda värde.
- **Scandinavian minor kingdoms** är inte styrkt som "flera småriken". Cliopatria länkar posten till Vendeltiden, en arkeologisk period. Posten är 500–1002 och överlappar Norge och Danmark från omkring 900. Ta med bara om faktarutan säger det, annars hoppa över.
- **Chámpa** är närmare en samling riken än en "historisk region". Cliopatria 207–1652 mot Wikipedia 192–1832: ett "Källorna skiljer sig"-fall med `note`. Att vänta håller.
- **Heian** är ett riksfall (kejsardömet Japan under hovet), inte ett kulturområde. Det hör till rikesarbetet (överlapp mot de japanska rikena i `tools/riken.py`) och bör inte vänta på `kind`. Avviker från issuets fråga 3.
- **Greek City-States** är i praktiken slut omkring 64 f.Kr. Spannet till år 83 är en svans på 1 km². Skriv inte "800 f.Kr.–83".
- **Källpolicy för faktarutan:** gränsen är forskarnas modellerade utbredning, inte en känd statsgräns; etikett och Wikidatas typ ska stå där; inte `two-sources` där årtalen skiljer sig (Heian ±2 år, Chámpa, Maya); ingen flagga, huvudstad eller ledare.
- **Luckor:** Sumerian City-States (största), Pyu City-States, Olmec, Classic Veracruz, Minoan, Early Dynastic Egypt (en period som Heian). Afrika söder om Sahara och Oceanien saknas helt i kategorin.
- **Förbehåll:** Cliopatrias polity-definition kommer från en sökträff (Seshats dokumentationssida gick inte att öppna). Namnfiltret kan ha missat poster.

### Geograf (mätt, men mot Cliopatria v0.0.1)

Geografen hittade bara v0.0.1 (Zenodo), inte v021 som repot använder. Namn och årtal kan skilja; Scandinavian minor kingdoms och Heian gick inte att mäta. Mätningarna nedan är antaganden för v021 tills de körts om.

- **Greek City-States:** redan en MultiPolygon av enskilda stadsterritorier (9–46 delar), spridda över västra till östra Medelhavet. Totalytan är mest hav. Förslag: små städer som punkter (som #722), bara de stora delarna som mjuk yta.
- **Maya:** en enda solid polygon utan hål, identisk i 550 år (299–849). Fylld yta antyder täthet och enhet som källan inte ger. Förslag: mjuk, genomskinlig yta, gärna kompletterad med punkter för några stora städer ur öppen källa.
- **Indus:** samma polygon i 500 år (−2300 till −1801), med ett steg ×19 mellan −2500 och −2300. En snapshot per period, inte tillväxt. Östkanten ligger i Kashmir-området, så fallet bör noteras i `docs/omstridda-granser.md`.
- **Zapotec:** 6 448 km² i början, alltså en punkt på globen. Hoppet ×11 vid −91 är Cliopatrias uppskattning, inte ett säkert expansionsår.
- **Chámpa:** tre poster med två stavningar och överlappande år, en av dem norr om det vietnamesiska Champaområdet enligt koordinaterna. Slå ihop till ett id och kontrollera mot källa.
- **Ritordning:** kulturområden under stater, utan medalj, med lägre etikettprioritet. Mätt överlapp: Greek × Romarriket cirka 10 000 km²; Maya, Zapotec och Indus överlappar inga riken över 100 km².
- **Namn:** kör `tools/riken_namn.py` mot Wikidata i stället för att gissa mottagarlandets namn. Undvik ordet "rike" i etikett och sökträff.
- **Förslag:** ett fält `render` per post (`soft`, `cluster`, `point`). Börja med Maya och Sumerian City-States i stället för Indus och polis.
- **Fler luckor:** Viking City-States (Europa), Haudenosaunee, Teotihuacán, Itza Mayans, förbunden i Grekland (kan ritas två gånger), Kush och andra stater i täckningsrapporten.

### Lärare (åk 4–6, 7–9, nyfiken vuxen)

- **"Kulturområde" är fel ord för polis** (politiska enheter som styrde sig själva) och halvfel för Indus. Föreslår en synlig etikett per typ ur ett litet fast ordförråd.
- **Faktarutan är inte valfri:**
  - Åk 4–6: högst två korta meningar i du-form, till exempel "Här fanns många städer som styrde sig själva. De hade inte en gemensam kung."
  - Åk 7–9: tre till fyra meningar.
  - Vuxna: en rad om osäkerhet och källa.
- **Tid:** långa spann ger intrycket av ett statiskt "Grekland" i nästan 900 år; faktarutan ska säga "under många hundra år".
- **Missförstånd som kartan kan ge:** "Grekland var ett land", "maya var ett rike som Rom", "Induskulturen hade en kung och en gräns".
- **Läroplan och epoker:** Induskulturen ligger före epoken `antiken` i `data/perioder.json`. Lgr22:s ordval är inte kontrollerat mot Skolverkets text.
- **Turer:** ingen tur i repot handlar om antiken eller högkulturer. En kort tur kan vara uppföljning, inget krav.
- **Efter bygget:** inga medaljer, flaggor eller "rike" i listor, sök, Samtidigt-panelen eller utskrift.

### UX och tillgänglighet (från koden, ingen webbläsare kördes)

- **Eget mönster i stället för kantstil:** till exempel glest rutnät eller korta tvärstreck med tunn, heldragen kant, i `js/layers/area-style.js`. Texten i namn och faktaruta ska vara det primära tecknet.
- **WCAG 1.4.1:** skillnaden får inte vara bara färg eller tunt streck, och mjuk kant syns knappt på 400 px. Legenden behöver mönstersymbol, och mönstret måste ritas på affischen som ofta skrivs ut i svartvitt.
- **Överlapp:** kulturområden ritas först och riket vinner vid hovring och klick. Testfall: Grekland 300 f.Kr. och Mesoamerika omkring 400.
- **Reglage:** inget eget; lägg dem i Riken-lagret och ändra lagrets namn. Den spanska labeln "Imperios" blir fel och bör prövas av `sprak-es`.
- **Tangentbord och skärmläsare:** utan medalj finns ingen fokuserbar knapp, en blockerande lucka. Antingen osynlig knapp med egen `aria-label` eller alltid i legendlistan och Fokus-menyn.
- **Frånvaro av medalj kan inte vara signalen**, eftersom flera riken redan saknar medalj.
- **Maya-posterna** delas vid 849/850, vilket kan läsas som att en stat föll.
- **Termer att lägga i `docs/ordlista-oversattning.md`:** "Kulturraum" (de), "aire culturelle" (fr), "área cultural" (es), "culture area" (en). Ingen ordlisteträff finns i dag.

### Arkitekt (från koden, prestanda ej mätt)

- **Formatet:** B är rätt om kulturområdet är en grupp i `data/empires/index.json` med valfritt `kind` (saknas = stat), så att det inte blir ett fjärde format bredvid religioner, teman och epoker.
- **`tools/riken_bevara.py` (`KEEP`)** måste få med fältet, annars tappas det vid ombyggnad (#1220).
- **Läsare som utgår från att grupp = rike** behöver en regel: Fokus riken-flik, faktaruta och kort, areacurve, sök, krigens `empires`-koppling, `tools/tackning_riken.py`, `tools/religioner_riken.py`, `feedback-rules`, UI-nycklar på fem språk.
- **Ritning:** en enda slinga i `areas.js`, så kulturområden måste ritas först.
- **Ordning:** formatet kan göras före #645 och #646, i tre PR:er (format utan data, pilot om högst tre poster, resten). Delade filer med #1301: `GROUPS` i `tools/riken.py` och `data/empires/index.json`.
- **Beslutsfil krävs för:** `kind` och dess värden, kriterium för kultur mot stat, delat format med riken, att krig inte får peka på kulturområde, att flagga och medalj är förbjudna.

## Omkörning av geografens mätningar mot Cliopatria v021 (2026-11-13)

Mätt på `cliopatria_polities_only_v021.geojson` (samma fil som `tools/riken.py`), ofiltrerade polygoner, geodetiska ytor (WGS 84). Repots egna filer är förenklade (0,2°, öar under cirka 200 km² borta), så små delar kan försvinna där. Skript: `v021.py` och `v021b.py` i sessionens scratchpad. Överlapp är mätt vid provår var 50:e år, så korta överlapp kan ha missats.

| Post | Rader | Yta (km²) | Delar | Anmärkning |
|---|---|---|---|---|
| Mayan City-States (−247–849) | 5 | 198 053 → 378 596 | 1, inga hål | Identisk polygon 299–849 (550 år). Hoppet kommer vid 299, inte vid 850. |
| Later Mayan City-States (850–1546) | 12 | 177 298 → 135 188 → 187 745 | 1–2 | Överlapp med inget annat än Spanska imperiet 1525 (881 km²). |
| Greek City-States (−800–83) | 52 | 58 488–206 494 | 5–46 | Bekräftat: många delar, spridda över −0,6° till 41,4° Ö (och upp till 69,5° Ö −170 till −111). Sista raden (78–83) är 602 km² i en enda del. Median-del 800–3 500 km²; 17 av 32 delar under 1 000 km² år −188. |
| Indus Valley Civilization (−3000–−1701) | 8 | 4 998 → 755 160 → 222 962 | 1–8 | Identisk polygon −2300 till −1801 (755 160 km²), stegvis ×19 mellan −2500 och −2300. |
| Zapotec Civilization (−500–895) | 7 | 6 448 → 69 757 → 8 550 | 1–2 | Samma polygon över långa spann; en ruta på cirka 1°×1° i början. |
| Scandinavian minor kingdoms (500–1002) | 14 | 378 486 → 425 999 → 53 944 | 5–45 | Nu mätt: 43–45 delar före 793. 825–865 sträcker sig till 40,5° Ö. Inget överlapp över 300 km² vid provåren. |
| Heian Japan (793–1187) | 5 | 230 097–243 671 | 1–2 | Samma form i 270 år (814–1093). |
| Chámpa (207–1652) | 17 | 72 677 → 130 295 → 7 917 | 1 | Bara en post, ett id. Efter 1475 krymper den till cirka 8 000 km². |
| Sumerian City-States (−3400–−1761) | 9 | 8 290–106 557 | 1–2 | Saknas hos oss. Lucka på −2250 till −2101 (ingen rad). |
| Pyu City-States (84–1045) | 5 | 77 478–116 226 | 3 | Saknas hos oss. |

**Vad som bekräftas:**
- Maya, Indus och Zapotec är långlivade polygoner som inte ändras på hundratals år. De beskriver en period, inte en förändring. Mayas steg sker 299, inte vid 849/850.
- Greek City-States är en MultiPolygon av enskilda territorier. Förslaget att rita små städer som punkter och bara stora delar som yta stöds av v021.
- Heian och Scandinavian minor kingdoms finns i v021 och är nu mätta.

**Vad som ändras mot geografens ursprungliga rapport (som mätte v0.0.1):**
- **Chámpa:** i v021 finns bara en post, ett id och ett namn, utan "norra" delar och utan stavningsvarianter. Geografens fynd om tre poster och en felplacerad nordlig förgrening gäller alltså inte v021 och ska strykas. Det som återstår är historikerns fynd: Cliopatria 207–1652 mot Wikipedia 192–1832, med `note`.
- **Greek City-States:** överlapp med Makedonien är 61 722 km² (−308), med Pontos 14 702 km² (−88) och med Romerska republiken 20 306 km² (−64) och Romarriket 22 249 km² (77). Det är mer än geografens "cirka 10 000 km²", så ritordning och klick (riket vinner) behövs för polis, men inte för Maya, Zapotec eller Indus.
- **Scandinavian minor kingdoms:** 43–45 delar och 380 000–426 000 km² över ett område på 15° bredd. Det är inte ett litet område; punkter eller yta bör avgöras tillsammans med Vendeltids-frågan (historikern).
- **Maya:** stämmer, men hoppet ligger vid 299, inte vid 850. UX-experten vill ge Maya-posterna samma id eller gruppnamn; det går, eftersom `Later Mayan City-States` delar Wikidata-id Q28567 med `Mayan City-States`.

**Inte gjort:** mätningen av hur repots förenklade filer beter sig för de små delarna (de går förlorade) är fortfarande ett antagande; den körs lämpligen när formatet byggs.

## Konflikter mellan experterna

- **Kantstil:** geografen vill återanvända mjuk kant (#73). UX-experten och arkitekten visar att den redan betyder "osäker gräns". Mer vikt bör ligga på de två, som läst ritkoden.
- **Heian:** issuet vill vänta; historikern säger att Heian är ett riksfall som kan lösas i rikesarbetet utan `kind`.
- **Hur många typer:** lärare och historiker vill ha flera synliga typer, UX-experten vill ha ett överord och undertyp i faktarutan. Avgörs av DasKrokodil.

## Förslag till justerad rekommendation i #1300

Alternativ B står sig, men med dessa ändringar:

1. Fråga 1 (visas?): ja.
2. Fråga 2 (hur skiljs de från riken?): eget fyllningsmönster, ord och teckenförklaring i stället för mjuk eller streckad kant; en synlig typ per post (minst stadsstäder och kultur) i stället för ett enda ord; `kind` i en beslutsfil med kriterium.
3. Fråga 3 (Heian, Chámpa): Chámpa väntar, Heian går in i rikesarbetet. Scandinavian minor kingdoms utgår ur första omgången.
4. Fråga 4 (när?): formatet kan byggas före #645 och #646. Pilot på Maya och Sumerian City-States, med mjuk yta och punkter, inte Indus eller polis.

## Att göra före bygget

- Köra om geografens mätningar mot Cliopatria v021.
- Kontrollera Lgr22:s ordval mot Skolverkets öppna text.
- Hämta mottagarlandets namn ur Wikidata med `tools/riken_namn.py`.
- Kontrollera polygonernas geometri för Indus och Maya mot en arkeologisk källa.
- Skriva beslutsfilen i `docs/beslut/`.

## Förbehåll

Inget i rapporten är byggt eller testat i webbläsare. Experterna kunde inte läsa issuet via GraphQL och använde REST, och historiker och geograf använde öppna källor utanför repot (Cliopatria, Wikidata, Wikipedia). Fynd som bygger på antaganden är märkta så ovan.
