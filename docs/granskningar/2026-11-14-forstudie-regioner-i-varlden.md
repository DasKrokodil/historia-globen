# Förstudie: regioner i länder över hela världen, och vilken nivå vi lägger oss på

**Datum:** 2026-11-14. **Status:** förslag till DasKrokodil. Inget är byggt, inga issues är skapade och inga etiketter är satta. **Frågan:** hur löser vi regioner (landskap, delstater, provinser) i hela världen, på en nivå som fortfarande är intressant men inte för finkornig? DasKrokodils utgångspunkt: landskap i Sverige, Bundesländer i Tyskland och Österrike, delstater i USA, och frågetecken för Kina och Brasilien.

Bygger på [beslutet 2026-11-12 om länderna före regionerna](../beslut/2026-11-12-landerna-fore-regionerna.md), [beslutet 2026-11-10 om platser och typ i datan](../beslut/2026-11-10-platser-och-typ-i-data.md), planeringen [2026-11-12-planering-regionhistoria.md](2026-11-12-planering-regionhistoria.md) (#1259) och [Lgr22-underlaget](2026-11-14-lgr22-lander-och-platser.md) (#1265). Det som redan är beslutat upprepas inte här.

## 1. Kort svar

1. **En regionnivå per land, vald efter vad som bär landets historia.** Det finns ingen världsstandard. Sverige kör landskap, Tyskland och Österrike delstat, USA delstat, Kina provins, Brasilien delstat (se punkt 4 för varje land). Nivån skrivs ner en gång per land i en beslutstabell.
2. **Urval, inte täckning.** Mätningen i punkt 2 visar att av 4 596 regioner i världen har bara 46 minst fem av våra händelser. Att fylla alla regioner vore ungefär dubbelt så mycket innehåll som hela datamängden i dag. Regioner tas därför med en och en, där det finns en berättelse och minst fem källkontrollerade händelser.
3. **Regioner är barn till länder.** En region byggs först när landet redan har ett landskort, eftersom regionens berättelse behöver landet som ram (beslutet 2026-11-12). Det ger också en naturlig ordning.
4. **Natural Earth räcker som gränskälla i de flesta länder** (public domain, redan godkänd, namn på alla fem språk). Undantagen är länder där landskapen är gamla områden utan dagens förvaltning (Sverige) och länder där Natural Earths nivå är för fin (Frankrike, Italien, Storbritannien).
5. **Bygg inte före utvärderingen #1274.** Under tiden behövs bara en beslutstabell (nivå per land), inte ny kod.

## 2. Mätningen

Mätt 2026-11-14 på Natural Earth 1:10m admin 1 (4 596 enheter i 251 länder, nedladdad från `main`-grenen; `tools/platser_gransar.py` låser v5.1.2, så enstaka siffror kan avvika) mot `data/events.json` (1 271 händelser, alla `source-checked` eller `two-sources`). Varje händelse är en punkt som placerats i sin region; 112 händelser (9 %) ligger utanför alla regioner (till havs eller på platser utan polygon) och räknas inte.

**Hela världen:** 582 av 4 596 regioner har minst en händelse, 118 har minst tre och **46 har minst fem** (i 27 länder). En världskarta med alla regioner skulle vara över 90 procent tom i dag.

| Land | Regioner i Natural Earth | Händelser i landets regioner | Regioner med ≥1 | ≥3 | ≥5 | Mest (händelser) |
|---|---|---|---|---|---|---|
| Sverige (län) | 21 | 51 | 11 | 5 | 2 | Skåne 20, Stockholm 13 |
| Tyskland | 16 | 26 | 12 | 2 | 1 | Berlin 7 |
| Österrike | 9 | 4 | 3 | 0 | 0 | Wien 2 |
| Schweiz | 26 | 4 | 3 | 0 | 0 | Genève 2 |
| USA | 51 | 86 | 31 | 12 | 5 | Hawaii 10, New York 7 |
| Brasilien | 27 | 11 | 6 | 2 | 0 | Rio de Janeiro 4 |
| Mexiko | 33 | 51 | 16 | 9 | 3 | Distrito Federal 12 |
| Kina | 32 | 67 | 22 | 7 | 4 | Jiangsu 11, Henan 10 |
| Japan | 47 | 27 | 16 | 2 | 1 | Kyōto 8 |
| Indien | 36 | 42 | 16 | 7 | 2 | Uttar Pradesh 6 |
| Australien | 11 | 36 | 7 | 4 | 4 | New South Wales 11 |
| Etiopien | 11 | 24 | 6 | 3 | 2 | Tigray 10, Amhara 7 |
| Sydafrika | 9 | 31 | 8 | 4 | 2 | KwaZulu-Natal 12 |
| Peru | 26 | 29 | 12 | 4 | 2 | Cusco 8 |
| Egypten | 27 | 38 | 15 | 5 | 2 | Kairo 8 |
| Frankrike (departement) | 101 | 30 | 19 | 1 | 1 | Paris 9 |
| Italien (provinser) | 110 | 21 | 12 | 1 | 1 | Rom 6 |
| Storbritannien | 232 | 22 | 14 | 1 | 1 | Westminster 7 |

Tre slutsatser:
- **Rätt nivå räcker inte, innehållet saknas.** Tyskland har 16 delstater men bara Berlin når fem händelser; Österrike och Schweiz har tillsammans åtta händelser i alla regioner. Delstatsnivån är rätt, men varje delstat kräver nya, källkontrollerade händelser.
- **Skevheten följer våra händelser, inte historien.** Hawaii (10) och Jiangsu (11) toppar för att just de har många händelser i vår data, inte för att de är viktigast. Täckningsrundan (`tools/tackning.py`) ska styra urvalet, inte den här tabellen.
- **Storleksordning på jobbet:** 15 länder på delstats- eller provinsnivå är cirka 400 regioner (Tyskland, Österrike, Schweiz, USA, Brasilien, Mexiko, Kina, Japan, Indien, Australien, Etiopien, Sydafrika, Peru, Nigeria, Egypten). Fem händelser vardera blir cirka 2 000 nya händelser, mer än hela datamängden i dag. Därför urval.

## 3. Natural Earths "första nivå" är inte en nivå

Natural Earth kallar allt "admin 1", men enheterna är olika saker. Det avgör vilka länder som kan använda källan direkt.

| Sorts land | Exempel (antal enheter, vad enheterna är) | Går Natural Earth att använda direkt? |
|---|---|---|
| **Delstater med egen historia** | Tyskland 16 State, Österrike 9 State, Schweiz 26 Canton, USA 50 + 1, Brasilien 26 + 1, Mexiko, Indien 26 State + 9 Union Territory | Ja |
| **Provinser i enhetsstater** | Kina 31 på fastlandet (22 Province, 5 Autonomous Region, 4 Municipality; plus Parcelöarna, se nedan), Japan 47, Turkiet 81, Iran 31, Egypten 27 Governorate, Peru 26 | Ja |
| **För fin nivå** | Storbritannien 232 (Unitary Authority, Borough m.m.), Slovenien 193, Lettland 119, Italien 110 provinser, Frankrike 96 + 5 departement | Nej som den är; se nästa stycke |
| **För grov nivå** | Danmark 5 regioner, Sydafrika 9, Pakistan 8, Australien 11, Etiopien 11 | Ja, men regionen är nästan landet; bara intressant där historien bärs av regionen (Tigray och Amhara har 17 av Etiopiens 24 händelser) |
| **Gamla landskap utan dagens förvaltning** | Sverige (landskap, Skåne är redan byggt), Frankrikes provinser, Englands historiska grevskap | Nej: länen finns, landskapen finns inte (kräver en egen ritning med källa, #1115) |
| **Kulturområden som korsar gränser** | Sápmi, Kurdistan, Bengalen, Tibet, Kashmir | Nej, och politiskt känsligt. Hör till teman och riken, inte regioner |

**Fynd som kan spara en ny datakälla:** Natural Earth har ett fält `region` som slår ihop de fina enheterna till nivån ovanför. Det fungerar för Frankrike (departement till regioner: 18 värden), Italien (20 regioner), Spanien (19 värden), Lettland (5 värden: Kurzeme, Latgale, Riga, Vidzeme, Zemgale, de gamla landskapen), USA (4 folkräkningsregioner) och Kina (7 stora regioner). Det fungerar **inte** för Brasilien (tomt) och är rörigt för Storbritannien (16 värden: Wales delat i två, Skottland delat i fyra statistiska områden som "Eastern" och "South Western", och England i nio, med Greater London som 33 enheter; kontrollerat 2026-11-14). Att slå ihop enheterna är en ritning vi gör själva i `tools/`; vilka regioner som är "rätt" är ett antagande tills en officiell källa har öppnats (Frankrikes och Italiens regionlistor ur respektive statistikbyrå).

## 4. Svar på de enskilda frågorna

| Land | Förslag | Varför och varning |
|---|---|---|
| **Sverige** | Landskap (25) som typ och historia; län (21) som kontur tills landskapens gräns har en dokumenterad källa | Redan beslutat 2026-11-12 (Skåne). Landskap nämns inte som provins i Lgr22 (#1265), så nivån är ett val, inte ett krav |
| **Tyskland, Österrike** | Bundesland (16 och 9), dagens gräns, skapelseår på kortet | Natural Earth, ingen licensfråga. Delstaterna är delvis efterkrigsskapelser; historiska stater (Bayern, Preussen) kommer senare via riken |
| **USA** | Delstat (50 + DC) | Inträdesåret är en naturlig tidslinje per delstat (antagande, kontrolleras mot källa) |
| **Kina** | **Provinser** (31 på fastlandet), inte de sju stora regionerna | De sju stora regionerna finns i Natural Earth (`region`) men är statistiska grupper utan egen berättelse. Provinserna bär historien. **Beslut krävs först för Taiwan, Parcelöarna, Hongkong och Macau:** Natural Earth ritar Taiwan (21 enheter), Hongkong och Macau som egna länder, och Sveriges hållning om Taiwan är ännu inte uttalad (fall 10 i `docs/omstridda-granser.md`). Kina undviks i piloten enligt 2026-11-12 |
| **Brasilien** | Delstat (26 + Distrito Federal) | Natural Earth, men bara 11 händelser i hela landet och ingen delstat med fem. Brasiliens fem statistiska stora regioner finns inte i Natural Earth och nämns här ur minnet, inte kontrollerat |
| **Mexiko, Indien, Nigeria, Australien** | Delstat | Natural Earth. Indiens delstater är i stor del omritade efter 1956 (antagande, ej kontrollerat). Kashmir är omstritt (fall 11) |
| **Japan, Turkiet, Iran, Egypten, Peru, Indonesien, Sydkorea** | Provins, prefektur eller guvernement | Natural Earth. Kuriler och Dokdo/Takeshima kräver beslut #1267 före Japan |
| **Frankrike, Italien, Spanien** | Nivån ovanför Natural Earths enheter (regioner, via `region`) | Källkontrolleras mot en officiell lista innan bygge |
| **Storbritannien** | Nationerna (England, Skottland, Wales, Nordirland) som första nivå | Natural Earth saknar den nivån rent; kräver egen sammanslagning eller annan källa |
| **Ryssland, Kanada** | Första nivån | Filerna är tunga (Ryssland 3,2 MB, Kanada 1,9 MB rå) och Ryssland korsar datumlinjen (#1268 är rättat i datan). Krim följer fall 1 |

## 5. Principer (förslag)

1. **Ett land, en regionnivå.** Aldrig blandade nivåer inom samma land (inte län i en del av Sverige och landskap i en annan).
2. **Nivån väljs efter vad som bär berättelsen**, inte efter vad som finns i datan. Historikern föreslår, geografen kontrollerar gränsen, och valet skrivs i beslutstabellen med källa.
3. **Dagens gräns och den fasta raden** gäller regionerna precis som länderna (beslutet 2026-11-12).
4. **Urval före täckning.** En region tas med när det finns en berättelse och minst fem synliga händelser (samma golv som för länder), och visas i menyn som "ett urval", inte som en full lista.
5. **Gränskälla i den här ordningen:** Natural Earth admin 1; sammanslagning av Natural Earth via `region`; egen ritning med öppen källa (landskap). Ny källa med ny licens kräver DasKrokodils ok (CLAUDE.md, "Fråga först").
6. **Spridning över världsdelar:** tak per världsdel i varje omgång, så att Europa och Nordamerika inte tar all plats (planeringen 2026-11-12, fråga 9).
7. **Omstridda gränser** följer samma regler som för länder; ett land med omstridda regioner byggs först när beslutet är taget.
8. **Namn:** "region" betyder världsdel i gränssnittet och byts inte ut. Regionen visas som en plats med en typ (delstat, provins, prefektur, landskap) enligt beslutet 2026-11-10. Typen översätts per land, så ordlistan växer med antalet nivåtyper (cirka 10–15), inte med antalet regioner.

## 6. Vad bygget kräver (övergripande)

- **Datamodell:** regionen får `parent` (landets id) och id med landsprefix (`us-texas`, `se-skane`), eftersom namn som Georgia annars krockar (arkitekten i #1259). Planeringen föreslår ett lättviktigt index och en gränsfil per land som laddas när regionen följs. Detta är inget nytt beslut utan förslaget i punkt 2 i planeringen.
- **Filstorlek:** hela Natural Earth admin 1 är 40 MB rå. Per land är det 0,1–3,2 MB rå (Ryssland 3,2, Kanada 1,9, USA 1,4, Kina 1,3). Det måste förenklas och laddas per land, annars tål inte sidan det.
- **Namn:** Natural Earth har namn på svenska, engelska, tyska, spanska och franska för 4 589 av 4 596 regioner. De bygger på Wikidata-etiketter. Enligt språkreglerna måste de stickprovskontrolleras av språkexperterna innan de används (inte kopieras blint), men arbetet blir mindre än att översätta för hand.
- **Skola:** Lgr22 nämner varken landskap (som provins), län eller delstater (#1265), så nivån i klassrummet är lärarens val; kopplingen skrivs som "kopplad till geografi: namn och läge på länder och regioner" och inte som krav.
- **Gränssnitt:** en platt lista med hundratals regioner går inte (UX i #1259): grupperad meny land, typ, plats, sök som huvudingång, och bara regioner med innehåll.

## 7. Rekommendation till DasKrokodil

Rekommendationen är ett förslag, inget beslut.

1. **Principen "en regionnivå per land, urval före täckning"** (punkt 1 och 5). Förslag: **ja**.
2. **Natural Earth som standardkälla, egen ritning bara när historien kräver det** (landskap). Förslag: **ja**.
3. **Kina på provinsnivå och Brasilien på delstatsnivå**, men Kina väntar på beslut om Taiwan (fall 10) och de andra omstridda enheterna. Förslag: **ja, med Kina sist**.
4. **Frankrike, Italien, Spanien och Storbritannien:** nivån ovanför Natural Earth via sammanslagning, men först när en officiell lista har öppnats. Förslag: **vänta**, ingen av dem behövs i första omgången.
5. **Regioner byggs bara inom länder som redan har ett landskort**, och inte före utvärderingen #1274. Förslag: **ja**. Möjliga första regioner när det är dags, utifrån mätningen (inte ett urval): New South Wales och Victoria i Australien, Tigray och Amhara i Etiopien, Cusco i Peru, delstater i USA. Det är fyra världsdelar och länder som ligger i landspiloten.
6. **Ett beslutsissue** "Regionnivå per land: beslutstabell" i milstolpen Senare, med `beslut-krävs` och en tabell med de cirka 30 länder som kan bli aktuella (nivå, källa, omstridda delar, antal regioner med minst fem händelser). Issuet skapas först när DasKrokodil har sagt ja; #1274 nämner redan "regionspåret" men har ingen tabell.

## 8. Vad som inte är gjort eller kontrollerat

- Ingen officiell förvaltningskälla är öppnad (Skolverket, Lantmäteriet, SCB, statistikbyråer): det som sägs om vad en nivå "är" i varje land (till exempel vilka regioner Frankrike har, Brasiliens stora regioner och när Indiens delstater bildades) är antagande tills en källa är öppnad. Det som sägs om Natural Earths innehåll och våra händelser är **uppmätt** i den här körningen.
- Mätningen räknar bara de 1 271 händelser som finns i dag. Den mäter inte var det borde finnas händelser; det gör täckningsrundan.
- Ingen expert är kallad (geograf, historiker, arkitekt, lärare, språk). Förstudien är en grund för att kalla in dem när beslutet är taget; planeringen 2026-11-12 har redan deras första runda för regionspåret.
- Omstridda regioner utöver `docs/omstridda-granser.md` (Krim, Kashmir, Taiwan m.fl.) är inte utredda per region.
