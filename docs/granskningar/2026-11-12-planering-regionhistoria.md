# Planering: Platser, omgång två (regionhistoria på flera nivåer)

**Datum:** 2026-11-12. **Status:** förslag till DasKrokodil. Inget är byggt, inga issues är skapade och inga etiketter är satta. Skriven med `/milstolpe` efter DasKrokodils önskemål: analys av vilken regionuppdelning och nivå som ska användas (Sverige på landskapsnivå, Tyskland och Österrike på delstatsnivå, andra länder okända).

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
3. **Tillhörighet över tid saknar riken i datan.** Skåne ska vara "danskt till 1658", men data/empires har Danmark 936–1406 (`konungariket-danmark`) och 1945–2024 (`danmark`) och **inget däremellan** (stickprov: stämmer; orsaken är inte undersökt). Bayern, Sachsen, Böhmen och Burgund finns inte som egna riken. Därför föreslås att en period kan peka på ett rike om det finns, annars skrivas som text med källa, och att kortet alltid har den fasta raden "Konturen visar dagens gräns".

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

Kontrollerat mot repot innan rapporten skrevs: `data/platser.json` 164 924 byte; `edgeKm` är ett linjärt svep i `js/place-geo.js`; byggscriptets fasta lista (`scripts/build-site.sh:76`); kravet på minst fem händelser inom gränsen (`scripts/validate-site.py:604`); Danmark 936–1406 och 1945–2024 i `data/empires/`; fliknycklarna `focus.tab.place` och `focus.tab.places`. Inte kontrollerat: Natural Earths antal per land (geografens egen räkning), Lgr22 och alla historiska årtal som agenterna angav utan öppnad källa.
