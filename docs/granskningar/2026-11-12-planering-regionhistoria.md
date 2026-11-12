# Planering: Platser, omgång två (regionhistoria på flera nivåer)

**Datum:** 2026-11-12. **Status:** förslag till DasKrokodil. **Ordningen ändrades efter DasKrokodils beslut 2026-11-12: länder först (milstolpen "Ländernas historia"), sedan regioner. Del 1 (punkt 1–7) gäller regioner och är första expertrundan; del 2 (punkt 8) gäller landspiloten och är en andra expertrunda.** Inget är byggt, inga issues är skapade och inga etiketter är satta. Skriven med `/milstolpe` efter DasKrokodils önskemål: analys av vilken regionuppdelning och nivå som ska användas (Sverige på landskapsnivå, Tyskland och Österrike på delstatsnivå, andra länder okända).

Underlag: #579 (alla kommentarer), #557, #1115, #1159–#1164, #1255, #1227, beslutsfilerna om Platser (2026-11-10 och 2026-11-11), `docs/granskningar/2026-11-10-platskort-plan-efter-pilot.md`, `docs/granskningar/2026-11-12-openhistoricalmap.md`, `docs/omstridda-granser.md`. Allt som agenterna skriver om elever, lärare och användare är antaganden; ingen observation finns. Läget i dag: milstolpen Version 6.4.0 "Regionkort och platser" har #1159 (Skåne), #1161 (klick), #1162 (adress), #1163 (lektionsläge) och #1164 (utvärdering) öppna; #1160 (flagga och vapen) är stängt.

## 1. Bemanning

| Agent | Behövdes? | Varför |
|---|---|---|
| `geograf` | ja | nivå per land, gränskällor och licenser, nutida mot historisk gräns, filstorlek |
| `historiker` | ja | vilken nivå som ger en historia värd att berätta, överlapp med riken, berättelsemodell |
| `arkitekt` | ja | hundratals platser i flera nivåer: filstorlek, laddning, datamodell, tillhörighet över tid |
| `ux-tillganglighet` | ja | att hitta en plats bland hundratals, hierarki, konturer, tangentbord |
| `larare` | ja | nivåer i skolan, missförstånd mellan landskap, län och delstat |
| `sprak-de` | ja | typnamn och samlingsord för Tyskland, Österrike och Schweiz (DE/AT/CH) |
| `sprak-en`, `sprak-es`, `sprak-fr` | behövs inte nu | ordvalen stäms av när typlistan är bestämd (se punkt 5 nedan) |
| `forhistoriker` | behövs inte | ingen förhistoria i milstolpen |

**Ny expertroll?** Förslag: **licens- och symbolgranskare** (kartdata, flagga, vapen). Den skulle granska det ingen befintlig agent gör: att licensvillkor per land och per fil är förenliga med CC BY 4.0 (geoBoundaries har olika licens per land, vapen har juridiska varningar på Commons) och att nutida eller omstridda gränser följer `docs/omstridda-granser.md`. Berör #1159, #1160 (stängt, kontrolleras igen för nya platser) och varje ny gränskälla. Återkommer vid varje omgång. Utkast till beskrivning: "Granskar licenser för gränsdata, flaggor och vapen mot projektets licensregler och dokumenterar dem i `sources.json`; ändrar inga filer." Ingen annan ny expert behövs. Skapas inte förrän DasKrokodil har sagt ja.

## 2. Viktigaste fynden

### Rekommenderad nivå per land (geograf och historiker; ett val per land)

Natural Earth admin-1 (public domain) täcker alla länder på en enhetlig nivå och är redan en godkänd källa. Antalen nedan är räknade av geografen på Natural Earth 10m admin-1 (4 596 enheter i 251 länder).

| Land | Rekommenderad nivå | Källa och läge |
|---|---|---|
| Sverige | **landskap** (25) för historien; län (21) bara som gräns tills landskapen är ritade | Landskap saknar öppen gräns (ingen hittad; antagande). Län finns i Natural Earth. Skåne län är redan beslutat som kontur |
| Tyskland | **Bundesland** (16), med skapelseår på kortet | Natural Earth, public domain. Länderna skapades 1949, 1952, 1957 och 1990; historiska stater (Bayern, Sachsen, Preussen) är en egen nivå |
| Österrike | **Bundesland** (9) | Natural Earth, public domain (geoBoundaries har CC BY-SA, fel licens) |
| Schweiz | **kanton** (26) | Natural Earth |
| USA | **delstat** (51 med DC) | Natural Earth; inträdesår är skelettet |
| Kanada, Australien, Brasilien, Mexiko, Indien, Kina, Japan, Ryssland | **första administrativa nivån** | Natural Earth; Ryssland och Kanada är tunga och måste förenklas |
| Nigeria, Etiopien, Sydafrika | första administrativa nivån | Natural Earth; **ingen** rekommendation om det historiskt meningsfulla (kungadömen, emirat, kolonialprovinser) utan öppnade källor |
| Frankrike, Italien, Storbritannien, Spanien | **ingen rekommendation ännu** | Natural Earth ger departement, provinser och distrikt, inte regioner, provinser eller counties; historiska provinser saknar data |
| Aotearoa | land (pilot) | redan byggt |

Ingen av nivåerna ger en historisk gräns. Allt är **dagens gräns**.

### De tre viktigaste

1. **Gränsfrågan avgör Sverige.** Landskapen (som DasKrokodil vill följa) har ingen administrativ motsvarighet och ingen öppen gräns hittades; Lantmäteriet, SCB, GADM, GISCO och geoBoundaries kunde inte öppnas från sessionens nätverk. Natural Earth ger Sveriges 21 län, men landskapen skiljer sig (Skåne län är inte landskapet; Östra Karup). Egen ritning av 25 landskap är liten (cirka 150 kB, antagande) men kräver en källa för gränsdragningen. Tyskland och Österrike har däremot ingen licensfråga: Natural Earth räcker.
2. **Modellen räcker inte för hundratals platser.** `data/platser.json` är 165 kB för två platser (stickprov: stämmer), och menyn räknar händelser inom gräns för varje plats med ett linjärt svep (`js/controllers/focus.js`, `js/place-geo.js`). Arkitekten föreslår ett lättviktigt index (`data/platser/index.json`: id, typ, namn, `parent`, avgränsningsruta, förräknade händelser) och en gränsfil per land som laddas först när platsen följs, byggd av `tools/` (`platser@2`, bakåtkompatibelt). Bygget behöver också in i `scripts/build-site.sh` (fast lista, rad 76). Dessutom kräver `scripts/validate-site.py:604` minst fem synliga händelser inom gränsen per plats, vilket de flesta landskap inte klarar i dag.
3. **Tillhörighet över tid saknar riken i datan.** Skåne ska vara "danskt till 1658", men data/empires har Danmark 936–1406 (`konungariket-danmark`), Kalmarunionen 1402–1525 och Danmark 1945–2024 (`danmark`), alltså **inget danskt rike 1526–1944** (rättat i runda 2; första rundan skrev 1406–1945). Bayern, Sachsen, Böhmen och Burgund finns inte som egna riken. Därför föreslås att en period kan peka på ett rike om det finns, annars skrivas som text med källa, och att kortet alltid har den fasta raden "Konturen visar dagens gräns".

### Fynd per agent (allvar)

- **Geograf:** Natural Earth admin-1 lägger Krim och Sevastopol under Ryssland, i strid med Sveriges hållning (blockerar om Ukraina eller Ryssland tas med; fall 1 i omstridda-granser). geoBoundaries har licens per land: Österrike CC BY-SA, Ryssland och Japan ODbL (fel licens). Tyskland har Datenlizenz Deutschland 2.0, vars förenlighet med CC BY inte är bekräftad. Urfolksområden (Sápmi, Māori, Aboriginal) saknas i alla källor. Slagsida mot Europa och Nordamerika (11 av 21 granskade länder).
- **Historiker:** Tysklands Länder är delvis efterkrigsskapelser, så "Bundesland" ger vilseledande historia för till exempel Niedersachsen; två nivåer behövs (dagens Land och historiska stater). Elsass, Schleswig och Sydtyrolen står inte i `docs/omstridda-granser.md`, så ett beslut behövs före kort. Perioder bör märkas belagt, tolkat eller omstritt (Roskildefredens dag 26 eller 28 februari). Tomma celler i täckningen: Amerika och Afrika, så omgång två bör inte bli bara Europa. Fackkällor (Historisches Lexikon Bayerns, Historisches Lexikon der Schweiz) kunde inte öppnas.
- **Arkitekt:** se punkt 2. Dessutom: #1227 (datumlinjen i `places.js`) bör göras före omgången; id-konvention med landsprefix (`se-skane`, `us-texas`) eftersom namn som Georgia annars krockar; `view.center` är `[lat, lon]` men geometrin `[lon, lat]`; en enhetstest för `place-geo.js` saknas. Filkrockar: `data/platser.json`, `schemas/platser.schema.json`, `data/ui/*.json`, `data/oversattning.json`, `tests/webblasare.mjs`, `js/controllers/focus.js`.
- **UX:** en platt lista går inte (blockerar): gruppera land, typ, plats och låt sök vara huvudingång, med land som understödstext. Namnkrocken mellan fliken "Plats" (Vad hände här?) och "Platser" är viktig, och finns också på tyska (`focus.tab.place` "Ort" mot `focus.tab.places` "Orte"; stickprov: stämmer). Konturer behöver mönster, inte bara färg, tangentbordsalternativ och träffyta på minst 44 px. Agenten kunde inte läsa #579, #557 och #1115, så den bygger på beslutet och planen.
- **Lärare:** kursplanerna i Lgr22 öppnades inte, så allt om landskap i skolan är antagande; Claude Code (Opus) ska öppna dem före urvalet. Landskap passar troligen åk 4–6, delstater åk 7–9. Klassiskt missförstånd: län mot landskap. Lärarstöd som behövs: stegfält i tur och lektionsläge; utskrift kan vänta.
- **sprak-de:** typerna på tyska: Bundesland (DE och AT), Kanton (CH), US-Bundesstaat, (historische) Landschaft för svenska landskap, aldrig "Provinz" för landskap. "Orte" bör bytas mot **"Gebiete"** som samlingsord. Mallen `{type} in {of}` blockerar för tyska: "in der Schweiz" och "in den USA" kräver att landsnamnet lagras med artikel per språk.

### Där agenterna inte är överens

- Historikern föreslår två nivåer för Tyskland och Österrike (Land plus historisk stat); geografen och arkitekten tar bara dagens gräns. Förslaget här: dagens Land först, historiska stater senare via `periods` och rikena, inte som egen kontur.
- Arkitekten vill lägga `parent` i platser, medan #1115 lägger tillhörighet över tid i `teman@2`. Överlappet är ett beslut före bygge (fråga 5).

## 3. Förslag till ordning och kontextgrupper

Före gruppen: **#1255** (uppspelningen pausar inte för platser) och **#1227** (datumlinjen) är egna, små fel som bör rättas först (Sonnet, ensamma grupper). **#1220** hör inte hit.

| Grupp | Innehåll | Delar | Modell och vem | Ordning och beroenden |
|---|---|---|---|---|
| **A. Beslut, källor, gränser** | licensförstudie per land (Lantmäteriet, SCB, BKG, geoBoundaries), val av landskapsgräns, beslutsfil om `platser@2`, Krim/Elsass/Schleswig/Sydtyrolen i omstridda-granser | `docs/`, `data/sources.json`, `THIRD-PARTY-NOTICES.md` | Opus, Claude Code | först; kräver tillåtna domäner (fråga 7) och DasKrokodils ok; delar #1115 |
| **B. Datamodell och verktyg** | `platser@2`, index och gränsfil per land, `eventIds` förräknade, `validate-site.py`, `build-site.sh`, enhetstest | `schemas/`, `tools/platser_gransar.py`, `js/model.js`, `js/place-geo.js`, `scripts/` | Opus för beslutsfilen, Sonnet high för bygget; Codex bygger efter beslut | efter A; före C och D |
| **C. Gränssnitt: hitta och klicka** | Platser-menyn (land, typ, plats, sök, tomt läge), namnkrocken Plats/Platser, #1161 delat i träffyta och tangentbord kontra Platt vy, `aria`, konturer med mönster | `js/controllers/focus.js`, `js/ui/focusmenu.js`, CSS | Sonnet high, Codex | efter B; krockar med #1161 och #1163 |
| **D. Innehåll per land** | korten, högst 5 platser per pull request: Skåne (#1159), svenska landskap, Tyskland, Österrike, USA, och minst en plats i Afrika, Asien, Amerika och Oceanien | `data/platser/`, `data/handelser/`, `data/sources.json`, översättningar | Opus (fakta, källkontroll); korsgranskas av en annan Claude Code; Codex rör inte | efter B; ett land i taget |
| **E. Språk och ordlista** | typnamn och samlingsord på fem språk, mallen med artikel, `docs/ordlista-oversattning.md`, `docs/produkt/13-ordlista.md` | `data/ui/*.json` | Sonnet medium; de andra språkexperterna körs före release | i samma pull request som gruppen som lägger typen |
| **F. Skolan** | #1163 (stegfält, lektionsläge, intervall), lärarfält, Lgr22-kontroll | `js/ui/tour.js`, `js/ui/lesson.js`, `data/turer/` | Sonnet high; Opus för Lgr22 | senast; intervallet hänger på lägeskontraktet |
| **#1164** | utvärdering | | DasKrokodil | sist, stänger #579 |

## 4. Öppna frågor till DasKrokodil (med rekommendation)

Rekommendationen är ett förslag, inget beslut.

1. **Nivå per land.** Rekommendation: tabellen i punkt 2 (landskap i Sverige, Bundesland i Tyskland och Österrike, kanton, delstat), men länder utan klart svar (Frankrike, Italien, Storbritannien, Spanien, Afrika) väntar på en förstudie med öppnade källor. Förslag: **ja**.
2. **Sverige: landskap eller län?** Rekommendation: län som kontur tills landskapen har en dokumenterad gräns, och **landskap som typ och historia** (Skåne är redan så). Landskapsgränsen byggs som egen ritning med källa först när Lantmäteriets eller SCB:s licens är bekräftad. Förslag: **ja**.
3. **"Sveriges hela historia" som separat spår.** Rekommendation: en landsvy (tema, #1115 alternativ C och sedan A) och **inte** en plats; landskapen är platser med `parent: Sverige`. Förslag: **ja**, avgörs i #1115.
4. **Tyskland och Österrike.** Rekommendation: Bundesländer (nutid, Natural Earth, public domain) med skapelseår på kortet, och de historiska staterna (Bayern, Preussen) senare via riken. Förslag: **ja**.
5. **Var ligger tillhörighet över tid?** Rekommendation: i platsen (`periods` med `polity` eller text, högst tre, märkta belagt eller tolkat) och inte i `teman@2`, så att de två formaten inte överlappar. Förslag: **ja**, i en beslutsfil.
6. **Historiska gränser ritas inte i omgång två**, bara dagens gräns med fast rad. Förslag: **ja**.
7. **Tillåt domäner** i miljöns nätinställningar så att källorna kan öppnas. Värdena att lägga in (ett per rad):

```
geoboundaries.org
gadm.org
ec.europa.eu
scb.se
lantmateriet.se
historisches-lexikon-bayerns.de
hls-dhs-dss.ch
skolverket.se
```

8. **Kravet på fem händelser inom gräns** (`validate-site.py`) passar inte landskap. Rekommendation: sänk till tre för platser med `periods`, men behåll "minst tre världsdelar önskas" bara för teman. Förslag: **ja**, kräver ett beslut.
9. **Spridning.** Rekommendation: tak per världsdel, så att Europa inte tar all plats; omgång två högst cirka 12 platser, minst en i Afrika, Asien, Amerika och Oceanien, och Sverige, Tyskland, Österrike och USA som start. Förslag: **ja**.
10. **Ny expertroll** (licens- och symbolgranskare, punkt 1). Förslag: **ja**.
11. **Ord.** "Platser" behålls på svenska (samlingsord), "Gebiete" på tyska; byt namn på fliken "Plats" (Vad hände här?). Ordlistorna uppdateras i samma pull request. Förslag: **ja**.
12. **Milstolpen.** Rekommendation: låt 6.4.0 stå som den är tills Skåne är klar (#1164 säger så), och skapa sedan en ny milstolpe "Platser: omgång två" med grupperna ovan som issues. Förslag: **ja**.

## 5. Nya issues som planen föreslår (skapas först efter ok)

- Danskt rike 1525–1945 saknas i `data/empires/` (rikesarbetet, #556; behöver källa).
- Bayern, Sachsen, Böhmen, Burgund som riken (samma spår).
- Elsass, Schleswig och Sydtyrolen i `docs/omstridda-granser.md` (beslut krävs).
- Platser-menyn med hierarki och sök (grupp C), namnkrocken Plats/Platser (grupp C).
- Förstudie per land med öppnade källor: Frankrike, Italien, Storbritannien, Spanien, Afrika.
- `tools/tackning.py` för platser (per världsdel och typ).
- Ordlisteposter för platstyper (grupp E).

## 6. Uppskattad kostnad

Sessionens miljö visar ingen veckoanvändning, så procent av veckoanvändningen **saknas** och intervallen nedan är en relativ grov skattning (antagande; kalibreras mot faktisk förbrukning efter grupp A).

| Grupp | Start | Per issue | Osäkerhet |
|---|---|---|---|
| A (Opus) | stor: öppna källor, licenser | medel | hög (beror på spärrade domäner) |
| B (Sonnet high, beslutsfil Opus) | medel | liten | medel |
| C (Sonnet high) | medel | liten | medel |
| D (Opus) | liten per land | stor per plats (källkontroll, fem språk) | hög; dominerar totalen |
| E (Sonnet medium) | liten | liten | låg |
| F (Sonnet high, Opus för Lgr22) | medel | liten | medel |

Planeringen själv (sex agenter plus syntes) kostade sex agentkörningar på cirka 50–100 tusen tokens var.

## 7. Granskad med stickprov

Kontrollerat mot repot innan rapporten skrevs: `data/platser.json` 164 924 byte; `edgeKm` är ett linjärt svep i `js/place-geo.js`; byggscriptets fasta lista (`scripts/build-site.sh:76`); kravet på minst fem händelser inom gränsen (`scripts/validate-site.py:604`); Danmark 936–1406, Kalmarunionen 1402–1525 och Danmark 1945–2024 i `data/empires/`; fliknycklarna `focus.tab.place` och `focus.tab.places`. Inte kontrollerat: Natural Earths antal per land (geografens egen räkning), Lgr22 och alla historiska årtal som agenterna angav utan öppnad källa.

# Del 2: Ländernas historia (andra expertrundan, 2026-11-12)

DasKrokodil beslutade 2026-11-12 att börja med **länders historia** och gå vidare till regioner efteråt (milstolpen "Ländernas historia" skapas av DasKrokodil). Experterna i del 1 analyserade regioner, inte den här piloten, så en andra runda gjordes med historiker, geograf, UX och lärare. `sprak-de` och arkitekt kördes inte på nytt; se punkt 8.6.

## 8.1 Pilotens förslag

Landets berättelse som kort (plats av typen `country`, som Grönland och Aotearoa): dagens gräns, händelser inom gränsen i tidsordning, rikena som länkar. Pilot: **Sverige** (landsvy), **Danmark**, och tre–fyra länder utanför Europa. Ett land per pull request, källkontroll och fem språk i samma pull request. Ett utvärderingsissue sist i milstolpen (regel 2026-11-12).

## 8.2 Vad experterna säger om landspiloten

- **UX:** land är en **plats av typen land**, inte ett nytt Fokus (lägeskontraktet #893, färre ytor att stänga). Rikena är **länkar i kortet** ("Följ riket Sverige 1611–"). Fast rad: "Det här är dagens Sverige. Rikena visar var området hörde hemma då." Vid år då landet inte fanns i dagens form: en tillståndsrad, aldrig ett tomt kort. Med 6–8 länder en platt alfabetisk lista med världsdel som understödstext och raden "Ett urval: 8 länder av cirka 200"; sökning på ett land som saknas ger en tydlig rad och länk till "Vad hände här?". Byt namnet på fliken "Plats" (Vad hände här?) som krockar med "Platser".
- **Lärare:** åk 4–6 ("mitt land i världen": Sverige, Danmark, Norden, du-form), åk 7–9 (jämför två länder, källkritik), vuxen (en tråd över tid). Risker: dagens gräns läses som att landet alltid fanns (säg "området som i dag är"), krig som enda berättelse, urfolk och kolonialism, nationell ensidighet. Ordlista för land, stat, rike och nation saknas. Skolverkets kursplaner är inte öppnade, så allt om Lgr22 är antagande.
- **Historiker:** landsvyn är landets berättelse inom dagens gräns, oavsett vilka stater som härskade; modell med 4–6 perioder per land, kort text, högst tre händelser per period märkta belagt, tolkat eller omstritt, och minst en rad som inte är krig. Hållbarhetströskel (historikerns förslag, inget beslut): cirka 12–15 händelser fördelade på minst fyra sekler och tre kategorier utöver krig.
- **Geograf:** Natural Earth admin-0 1:50m räcker för landsnivå. Avgränsa kontinentalt och skriv en fast rad om vad konturen inte omfattar ("Utan Grönland och Färöarna"); utomeuropeiska delar blir egna platser.

## 8.3 Urval av länder (förslag, DasKrokodil godkänner)

Siffrorna är experternas egna punkt-i-polygon-mätningar mot `data/events.json` (929 händelser); polygonerna skiljer sig (historikern använde Cliopatria, geografen Natural Earth 50m med 20 km marginal), så talen avviker något.

| Land | Världsdel | Händelser (geograf / historiker) | Kommentar |
|---|---|---|---|
| Sverige | Europa | 30 / 28 | landsvyn; **skev mot Skåne** (historiker 27 av 28, geograf ca 20 av 30), saknar stormaktstid, 1809/1814, välfärd, EU |
| Danmark | Europa | 4 / 15 | 4 på fastlandet (Natural Earth), 14 av 15 grönländska i Cliopatria-polygonen; **nås inte kravet på fem**; vikingatid, reformation, 1800-tal saknas |
| Etiopien | Afrika | 19 / 19 | ingen omstridd gräns; 10 krig av 19 |
| Nigeria (reserv) | Afrika | 11 / 11 | tunnast |
| Peru | Amerika | 21 / 20 | fyller en tidigare tom cell; alternativ Mexiko (40) |
| Japan | Asien | 27 / 24 | Kurilerna och Dokdo/Takeshima står inte i omstridda-granser; beslut krävs |
| Australien | Oceanien | 32 / 27 | urfolkshistoria bärande |
| Aotearoa | Oceanien | 40 | redan byggt |

Undvik i piloten: Ukraina och Ryssland (Natural Earth lägger Krim i Ryssland, mot fall 1), Israel och Palestina, Georgien, Armenien och Azerbajdzjan, Cypern, Kosovo, Pakistan och Indien (Kashmir), Taiwan och Kina, Marocko (Västsahara, kräver not), Indonesien (Östtimor), Fiji och Ryssland (datumlinjen). Indien är numeriskt starkt (35 händelser) men Kashmir gör det olämpligt.

## 8.4 Där experterna skiljer sig eller något måste rättas

- **Skåne i Sverige:** historikern räknar 27 av 28 händelser i Skåne, geografen cirka 20 av 30 (stickprov på id-lista, ej exakt). Båda är överens om att Sverige-landsvyn blir skev utan fler händelser utanför Skåne.
- **Danmark:** 4 eller 15 händelser beroende på polygon. Grönlandshändelserna hör till Grönland och får inte dubbelräknas.
- **Danmarkluckan:** första rundan skrev 1406–1945; rätt är **1526–1944** (Kalmarunionen 1402–1525 täcker det däremellan; kontrollerat mot `data/empires/kalmarunionen.json`). Natural Earth-posten `Denmark-Norway` finns i `tools/riken.py:1258` men dataposten är inte öppnad.
- **Sverige-rikena:** kontrollerade: sverige-medeltiden 980–1611, stormaktsvaldet 1612–1721, sverige-1722 1722–1814, sverige-norge 1815–1904, sverige-1905 1905–2024; historikern noterar luckor 1402–1501 och 1521–1525.
- **Fun facts:** historikern fann 0 träffar på Sverige, Danmark och Skåne i `data/funfacts.json` (grov textsökning).

## 8.5 Blockerar och viktigt före bygget

- **Blockerar:** datumlinjen för Ryssland och Fiji (en enda ring över ±180° ger fel i `inGeometry` och `edgeKm`; arkitekten bekräftade mekanismen med konstruerade ringar, men geografens exempel att Kiruna räknas som Ryssland kunde inte återskapas och är antagande); åtgärden hör till #1227 och ett enhetstest för `place-geo.js`. **#1255** (uppspelningen pausar inte för platser) ska vara rättad före landsvyn, eftersom ett landkort har 17 till 30 händelser.
- **Viktigt:** 54 av cirka 240 länder klarar kravet på minst fem händelser (`validate-site.py:604`); Danmark gör det inte. Sverige och Danmark behöver fler källkontrollerade händelser utanför Skåne och Grönland före landskorten. Omstridda gränser: ett beslut för Japan, Elsass, Schleswig och Sydtyrolen.
- **Önskvärt:** flagga och vapen (#1160 är stängt) på landskortet, ordlisteposter för land, stat, rike och nation.

## 8.6 Vad som inte är expertgranskat för landspiloten

`sprak-de` kördes inte på nytt: tyska typnamn och mallen med artikel ("in der Schweiz") gäller även länder. Arkitekten kördes en tredje gång på datumlinjen och kravet på fem händelser (8.9).

## 8.7 Förslag till kontextgrupper för Ländernas historia

| Grupp | Innehåll | Modell och vem | Beroenden |
|---|---|---|---|
| **L0: förberedande fel** | #1255 (paus vid platser), #1227 (datumlinjen, enhetstest) | Sonnet | före allt annat |
| **L1: Beslut och förstudie** | val av länder, omstridda fall (Japan m.fl.), ordlista land/stat/rike, Lgr22 öppnad, kravet på fem händelser | Opus, Claude Code | innan L3 |
| **L2: Rikesluckor** | danskt rike 1526–1944, Sverige-luckorna | Opus | före Danmark-kortet |
| **L3: Sverige och Danmark** | nya händelser (utanför Skåne och Grönland), landsvyn, korten | Opus (fakta), Codex bara gränssnitt | efter L0, L1, L2; delar #1115, #557, #1159 |
| **L4: Länder utanför Europa** | ett land per pull request, högst fem nya händelser per pull request vid behov | Opus, korsgranskas | efter L0 och L1 |
| **L5: Gränssnitt** | tillståndsrad vid år utan landet, urvalsrad, sökning på land som saknas, namn på fliken "Plats" | Sonnet high, Codex | efter L0 |
| **L6: Skola** | tur med stegfält, lärarfält (#1163) | Sonnet high, Opus för Lgr22 | efter första landkortet |
| **Utvärdering** | issue sist i milstolpen | DasKrokodil | efter L3 och L4 |

## 8.8 Frågor till DasKrokodil (landspiloten)

1. **Länder:** Sverige och Danmark plus Etiopien, Peru, Japan (efter beslut om Kurilerna och Dokdo) och Australien, med Nigeria som reserv? Rekommendation: **ja**, men Japan byts mot Mexiko eller Kina bara om vi vill undvika de omstridda öarna.
2. **Land är en plats av typen land** (inte ett eget Fokus), med rikena som länkar? Rekommendation: **ja**. Det ändrar #557/#1115 (landsvyn är då inte ett tema).
3. **Hållbarhetströskel** (cirka 12–15 händelser, fyra sekler, tre kategorier utöver krig) som villkor för att ett land tas med? Rekommendation: **ja**, som riktlinje och inte som hårt valideringskrav.
4. **Kravet på fem händelser** i `validate-site.py`: sänks det för länder? Rekommendation: **nej för länder** (hållbarhetströskeln ersätter), men Danmark får nya händelser först.
5. **Vilka länder undviks i piloten** enligt listan i 8.3? Rekommendation: **ja**, och ett beslut för Elsass, Schleswig och Sydtyrolen läggs i omstridda-granser inför regionspåret.
6. **Datumlinjen (#1227) och #1255** före landsvyn? Rekommendation: **ja**.
7. **Ny roll** (licens- och symbolgranskare, punkt 1) behövs främst för regionspåret; kan vänta. Förslag: **vänta**.

## 8.9 Arkitektens tredje runda (datumlinjen och kravet på fem händelser)

- **Datumlinjen:** dela ringar vid 180° i `tools/platser_gransar.py` (i datan), låt `edgeKm` hoppa över sömsegment (både i `js/place-geo.js` och Python-kopian i `scripts/validate-site.py`), låt `js/layers/places.js` använda `traceRing`, och lägg ett fel i valideringen för ring med hopp över 180°. Ingen schemaändring och inget `platser@2`. Ryssland och Fiji finns inte i `data/platser.json` än, så felet syns inte i dag. Arkitektens mätning: en punkt vid 179,5°E gav 16 425 km till en polygon vid −179…−170 (verkligt cirka 50 km) med konstruerade ringar.
- **Kravet på fem händelser:** ett golv, inte hållbarhet. Det behålls för länder (beslut 2026-11-12) och riktlinjen blir en mjuk varning i `validate-site.py` (som den för teman, rad 540–541): färre än 12 händelser, färre än fyra sekler, färre än tre kategorier utöver krig eller över 50 % krig. Kravet per typ (till exempel `landscape` med lägre tröskel) hör till regionspåret och kräver att `landscape` läggs till i schemat och `place.type.landscape` på fem språk.
- **Viktigt:** länkar från kortet till riken kräver en validatorkontroll att varje länkat rike-id finns. `data/platser.json` är en enda fil och blir krockfil om flera länder byggs samtidigt; förslag: Danmark först, sedan ett land i taget i serie, eller utvidga krockundantaget i CLAUDE.md (kräver DasKrokodils beslut). Kontrollera att land och rikeslänkar kan delas i länk (`js/url-state.js`, inte läst i den här rundan).

## 8.10 Skapade issues i milstolpen "Länders historia" (efter DasKrokodils ok 2026-11-12)

Flyttade hit: #1255 (paus vid platser), #1227 (datumlinjen i ritningen), #1115 (Sverige-piloten, gränskälla och nivå).

| Grupp | Issues |
|---|---|
| L0 förberedande | #1255 (paus vid platser), #1227 (ritningen över datumlinjen), #1268 (ringar delas vid 180°), #1269 (mjuk varning för hållbarhet) |
| L1 beslut och förstudie | #1267 (omstridda gränser: Japan, `beslut-krävs`), #1265 (Lgr22), #1266 (ordlista) |
| L2 rikesluckor | #1264 (danskt rike 1526–1944 och Sveriges rikesluckor) |
| L3 Sverige och Danmark | #1262 (Sverige), #1263 (Danmark), #1115 (gränskälla och nivå) |
| L4 länder utanför Europa | #1270 (Etiopien), #1271 (Peru), #1272 (Australien), #1273 (Japan, väntar på #1267) |
| L5 gränssnitt | #1260 (land som plats), #1261 (länderlistan, urvalsrad och flikens namn) |
| Utvärdering | #1274 (sist i milstolpen) |

Ingen `redo` är satt: #1255 och #1227 har en egen ägare och `pågår`, och resten väntar på beroenden eller beslut (kökontrollen sätter `redo` när villkoren är uppfyllda).
