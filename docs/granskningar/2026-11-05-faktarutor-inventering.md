# Inventering av faktarutorna för händelser (#572)

Datum: 2026-11-05. Gjord av Claude Code (orkestern) på `main` vid `cadbdcc`, lokalt i Chromium, dator 1400 × 900 och mobil 400 × 800.

**Bara inventering.** Enligt Rikards beslut 2026-11-05 ändras inget utseende förrän rapporten är läst och nästa steg är godkänt. Förslagen sist är alltså förslag, inte byggorder.

## Vad som undersöktes

- Koden som bygger rutorna: `Panel.showDetail` (händelse), `Panel.showStory` (krigets kort före och efter) och `Panel.showFacts` (rike, försvunnet land, religion) i `js/ui/panel.js`, samt mobilens arkregler i `css/style.css`.
- Datan i `data/events.json`: 491 synliga händelser (171 källkontrollerade, 320 två källor, inga utkast).
- Fem typfall, öppnade via Samtidigt-listan i båda bredderna: historisk bild (Tyfonen kamikaze, 1281), illustration (Konfucius lever), utan bild med "Källorna skiljer sig" (Slaget vid Kirina), utan bild med exakt datum (Slaget vid Plassey) och ett krig (Perserkrigen).

## Vad som redan är konsekvent

- **Samma ordning i alla händelserutor:** plats (visa på globen) → bild om den finns → rubrik → datum · plats · kategori → sammanfattning → anteckning (`note`) → raden *Historisk osäkerhet* → kopplingar (Del av, slag, riken) → källor → granskningsstatus och *Rapportera faktafel*.
- **Ram efter tidsålder** gäller med och utan bild, så rutor utan bild ser inte trasiga ut. Alla 106 bilder har bildtext och kredit; illustrationer märks som illustrationer.
- **Källor döljs aldrig.** Ingen synlig händelse saknar källa (18 har bara en). Medan källorna laddas står ingen källrad alls i stället för "saknas".
- **Granskningsstatusen** står alltid sist i händelserutan med (i)-förklaring och länk till Om källorna.
- **Osäkerhet visas öppet** i en egen rad (170 händelser) skild från granskningsstatusen (#364).

## Vad som skiljer sig

| # | Iakttagelse | Var | Mått |
| --- | --- | --- | --- |
| 1 | **I datorn fyller bilden hela den synliga delen av rutan.** Rubrik, datum och sammanfattning börjar under kanten och man måste rulla för att se vad händelsen heter. | Händelse med bild, dator | Rutan visar 370 px. Rubriken börjar vid 415 px (historisk bild) och 370 px (illustration). Utan bild börjar den vid 16–23 px. |
| 2 | **Mobilen gör tvärtom:** i halvt ark döljs bilden helt och syns först i helt läge (avsiktligt, `#detail[data-sheet="half"] .detail-fig`). Samma händelse börjar alltså med bilden i datorn och med texten i mobilen. | Händelse med bild | Mobil: rubriken vid cirka 98 px med och utan bild. |
| 3 | **Platsen står två gånger:** i raden *visa på globen* överst och i metaraden under rubriken. | Alla händelser | – |
| 4 | **Osäkerheten står långt från datumet.** Datum står under rubriken, men *Historisk osäkerhet* (till exempel "dateringen är ungefärlig") står efter sammanfattningen och anteckningen. Datumet visar redan "cirka" eller spann, så det här gäller förklaringen, inte själva markeringen. | 170 händelser | I Kirina-rutan står osäkerhetsraden cirka 350 px under datumet i mobil. |
| 5 | **Osäkerhetsraden fångar bara anteckningar med exakt rubriken "Källorna skiljer sig"** (93 st.). Det finns 31 olika anteckningsrubriker; till exempel *Bara en källa* (31), *Om kalendern* (24), *Om datumet* (15), *Om platsen* (14) och *Om dateringen* (8) visas som anteckning men räknas inte till osäkerheten. Det är inget fel i sig, men vad som räknas som osäkerhet beror på ordvalet i en rubrik. | `uncertaintyRow` i `panel.js` | 232 händelser har anteckning. |
| 6 | **Status och källor hamnar långt ner i långa rutor.** Krig med slaglista och händelser med anteckning har statusen 435–900 px ner. | Krig, långa rutor | Perserkrigen: status vid 762 px (dator) och 899 px (mobil). |
| 7 | **Krigets kort före och efter** (berättelsen) har källrad men **ingen granskningsstatus och ingen osäkerhetsrad**, fast dödssiffrorna är spann ur källor. | `showStory` | 52 krig har berättelse. |
| 8 | **Rikets faktaruta** har statusen inne i den hopfällda delen *Källor och karta*; religionens ruta har den synlig sist. Det är ett medvetet val för mobilen (#359), men skiljer sig från händelserna. | `showFacts` | – |
| 9 | Källor per påstående (#383, fältet `evidence`) finns i koden men används inte av någon händelse ännu, så den delen gick inte att granska i verkligheten. | `evidenceView` | 0 händelser har `evidence`. |

Inget av detta döljer en källa eller en osäker datering. Det handlar om ordning och avstånd, inte om saknad information.

## Förslag på nästa steg (kräver Rikards ok)

Förslagen är små och oberoende. Rekommenderad ordning:

1. **Rubriken först i datorn** (iakttagelse 1–2): låt bilden ta mindre höjd i datorns ruta, eller flytta rubrik och datum ovanför bilden, så att man ser vad händelsen heter utan att rulla. Rekommendation: rubrik och datum ovanför bilden i båda bredderna, eftersom det också är ordningen i #572:s förslag och gör dator och mobil lika. Litet, bara CSS och `showDetail`.
2. **Osäkerheten bredvid datumet** (4): en kort markering direkt i metaraden (till exempel "cirka 1235 · ungefärlig plats") och den längre förklaringen kvar där den är. Litet.
3. **En plats, inte två** (3): behåll knappen *visa på globen* och ta bort platsen ur metaraden, eller tvärtom. Mycket litet.
4. **Status i krigets kort** (7): samma statusrad som i händelserutan. Litet.
5. **Vad som räknas som osäkerhet** (5): bestäm om anteckningar som *Om dateringen* eller *Bara en källa* ska räknas, helst med ett eget fält i datan i stället för rubriktexten. Det är en datamodellfråga och kräver beslut.

Iakttagelse 6 (status långt ner) och 8 (rikets ruta) föreslås lämnas som de är tills punkt 1–4 är prövade; #359 valde medvetet ordningen för riken.

## Begränsningar

- Fem typfall i två bredder, inte alla 491 rutor. Ordningen bygger dock på en och samma funktion, så den gäller alla händelser.
- Skärmläsare provades inte med riktigt hjälpmedel; ordningen i DOM är densamma som den synliga, så uppläsningen följer iakttagelserna ovan.
- Måtten gäller Chromium i molnmiljön utan Google Fonts; med de riktiga typsnitten kan avstånden skilja några pixlar.
