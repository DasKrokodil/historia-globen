# 09. Kravspecifikation (PRS, produktnivå)

**Status:** utkast 2026-11-08 (målen M1–M9 bekräftade samma dag). DasKrokodil har bestämt att en kravspecifikation ska skrivas. Det här är första versionen. Krav märkta **Beslutat** kommer från CLAUDE.md, beslutsfilerna eller DasKrokodils besked 2026-11-08 och hänvisar till sin källa i stället för att kopiera den. Krav märkta **Förslag** är mina och ska godkännas. Kolumnen *Läge* är **ej verifierad** överallt där jag inte har sett ett bevis; den fylls i vid varje release (se [README](README.md#så-hålls-dokumenten-levande)).

Det här är en *produktkravsspecifikation*: den säger **vad** sidan ska uppfylla och **hur vi ser att den gör det**, inte hur den är byggd ([arkitektur.md](../arkitektur.md)) och inte vilka uppgifter som ska göras (issues).

## Så läses tabellerna

| Kolumn | Betyder |
|---|---|
| **ID** | Stabilt id, `K-<grupp>-<nr>`. Återanvänds aldrig; ett borttaget krav står kvar som *Struket*. |
| **Krav** | "Sidan ska …". Ett krav, en sak. |
| **Källa** | Mål (M1–M9 i [01](01-vision-och-mal.md)), användningsfall (UC i [03](03-anvandningsfall-och-funktioner.md)), beslutsfil eller CLAUDE.md-avsnitt. |
| **Prio** | **M** måste, **B** bör, **K** kan. |
| **Bevis** | **T** automatiskt test, **S** skript eller källkontroll (`tools/`, `validate-site`), **G** granskning med lins ([06](06-granskningsperspektiv.md)), **O** observation från riktig användare, **M** mätning, **B** beslut eller dokument. |
| **Status** | **Beslutat** eller **Förslag**. |
| **Läge** | **Ok**, **Delvis**, **Ej**, **Ej verifierat**. Läget är daterat överst i varje grupp. |

**Läget 2026-11-08:** utgår från analyserna i `docs/granskningar/` (komplett analys, blind-spots-rapporten) och är **inte** nytt bevis.

## K-INN. Innehåll och källor (M2, M4)

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-INN-01 | Varje händelse och fun fact ska ha minst en källa i källregistret. | CLAUDE.md: Källpolicy 1 | M | S | Beslutat | Ej verifierat |
| K-INN-02 | Ingen uppgift får skrivas ur minnet; allt nytt är `draft` tills källan är öppnad och kontrollerad. | Källpolicy 3 | M | G | Beslutat | Ej verifierat |
| K-INN-03 | Granskningsnivån (`draft`, `source-checked`, `two-sources`) ska synas i faktarutan och under Om källorna; `draft` ska inte visas på globen. | Källpolicy 2 | M | T, S | Beslutat | Ej verifierat |
| K-INN-04 | Är källorna oense ska det stå öppet; nivån höjs inte till `two-sources`. | Källpolicy 4 | M | G | Beslutat | Ej verifierat |
| K-INN-05 | Osäkerhet ska visas öppet ("cirka", spann), inte som falsk exakthet. | Källpolicy 6 | M | G | Beslutat | Ej verifierat |
| K-INN-06 | Siffror i fun facts ska gå att räkna fram ur händelsernas årtal. | Källpolicy 5 | M | S, G | Beslutat | Ej verifierat |
| K-INN-07 | Omstridda nutida gränser och statusfrågor ska följa Sveriges officiella hållning (UD), med källa per fall. | [omstridda-granser.md](../omstridda-granser.md); beslut 2026-11-03 | M | G | Beslutat | Ok enligt listan 2026-11-06; fall återstår |
| K-INN-08 | Illustrationer ska märkas som illustrationer i en synlig bildtext och aldrig se ut som foton eller äkta dokument. | CLAUDE.md: Bilder 2 | M | G | Beslutat | Ej verifierat |
| K-INN-09 | Profeten Muhammed avbildas aldrig. | CLAUDE.md: Bilder 4 | M | G | Beslutat | Ej verifierat |
| K-INN-10 | Bildlicenser ska vara förenliga med projektets licenser och stå i bildtexten. | CLAUDE.md: Bilder 1, Licenser | M | S | Beslutat | Ej verifierat |
| K-INN-11 | Innehållet ska ha bredd över världsdelar; täckning per världsdel, period och kategori ska mätas vid varje täckningsrunda. | M4; beslut 2026-11-03, 2026-11-07 | B | S, M | Beslutat | Delvis (skev balans kända 2026-11-07) |
| K-INN-12 | Sidan ska säga öppet att den visar ett **urval** gjort av en ensam redaktör ("Om urvalet"). | M4; [08](08-urvalsriktlinje.md); #916 | M | G | Beslutat | Ok: texten finns i Om källorna på alla fem språk (2026-11-08) |

## K-KÄL. Källkritik som mål (M9)

*Hur detta utförs avgörs i #926. Kraven nedan är därför på nivån "ska finnas", inte "så här".*

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-KÄL-01 | Sidan ska aktivt lära ut källkritik, inte bara visa källor. | DasKrokodil 2026-11-08, M9 | M | G, O | Beslutat | Delvis |
| K-KÄL-02 | Besökaren ska kunna se vad granskningsnivåerna betyder (faktarutans förklaring). | #786, #926 | B | G | Beslutat | Ej |
| K-KÄL-03 | Källkritiska inslag ska finnas för flera åldrar, med olika nivå: först för elever som gått ut mellanstadiet (#938), sedan gymnasiet och vuxna med intresse. | #926, #938 | B | G | Beslutat | Delvis: första nivån (turen) finns |
| K-KÄL-04 | Källkritiska inslag ska ha nyfiken, lekfull ton och aldrig pekpinne. | M8, #926 | B | G | Beslutat | Ej verifierat |
| K-KÄL-05 | Källkritik ska vävas in i befintliga ytor först (förklaring, fyra återkommande frågor, "Sant eller myt?", en tur); ett eget läge kan komma senare. | #926 | B | G | Beslutat | Delvis: turen "Hur vet vi det här?" finns (#938); fyra frågor och "Sant eller myt?" återstår |
| K-KÄL-06 | En besökare ska kunna svara på "var kommer det här ifrån?" utan att leta. | #926 | B | G, O | Beslutat | Ej verifierat |

## K-KÄR. Kärnfunktion och utforskande (M1, UC1–UC10)

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-KÄR-01 | Ett år ska styra allt: tidslinjen äger året och alla lager och paneler följer det. | CLAUDE.md: Arkitektur 3 | M | T | Beslutat | Ej verifierat |
| K-KÄR-02 | Besökaren ska kunna dra i tiden, stega, hoppa till ett år eller datum och spela upp. | UC2 | M | T | Beslutat | Ej verifierat |
| K-KÄR-03 | En förstagångsbesökare ska utan förklaring se ett samband (Samtidigt-kortet) och förstå vad globen gör. | M1, UC1 | M | G, O | Beslutat | Ej verifierat |
| K-KÄR-04 | Händelser ska kunna läsas med källa, bild, osäkerhet och granskningsnivå. | UC3 | M | T, G | Beslutat | Ej verifierat |
| K-KÄR-05 | Besökaren ska kunna följa ett krig, ett rike eller en religion i fokusläge och komma tillbaka till det hen var. | UC4 | M | T | Beslutat | Delvis (adress och Fokus, #865) |
| K-KÄR-06 | Besökaren ska kunna söka efter händelser, platser och år. | UC6 | B | T | Beslutat | Ej verifierat |
| K-KÄR-07 | Besökaren ska kunna dela exakt vy (år, kamera, fokus, lager) med en länk. | UC7 | B | T | Beslutat | Delvis (#865) |
| K-KÄR-08 | Globen, Platt vy och Upptäcktsresor ska visa samma innehåll. | UC8, Arkitektur 4 | M | T | Beslutat | Ej verifierat |
| K-KÄR-09 | Besökaren ska kunna välja vilka lager och kategorier som syns. | UC9 | B | T | Beslutat | Ej verifierat |
| K-KÄR-10 | Sidan ska fungera utan att besökaren måste logga in, registrera sig eller skapa konto. | Avgränsning | M | B | Beslutat | Ok |
| K-KÄR-11 | Utforskandet ska kännas lekfullt: direkt återkoppling när man drar, klickar eller följer. | M8 | B | G, O | Förslag | Ej verifierat |

## K-SKO. Skolan som bonus (M3, UC11–UC13)

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-SKO-01 | Det ska finnas något för alla åldrar från förskoleklass till gymnasiet. | DasKrokodil 2026-11-08 | B | G | Beslutat | Delvis |
| K-SKO-02 | Barn i förskoleklass–åk 3 ska kunna använda sidan tillsammans med en vuxen; ingen egen läsfri väg krävs. | DasKrokodil 2026-11-08 | B | G, O | Beslutat | Ej verifierat |
| K-SKO-03 | En lärare ska kunna dela en länk till en tur eller lektion som fungerar för alla elever. | UC11; #736, #795 | B | T, G | Beslutat | Delvis (#871) |
| K-SKO-04 | Lektioner ska kunna skrivas ut som elevblad och lärarblad ur turens data. | UC11; #738 | B | T, G | Beslutat | Delvis (#871) |
| K-SKO-05 | Texter för elever till och med 13 år ska ha du-form; övriga texter artigt tilltal. | beslut 2026-11-08 | M | G | Beslutat | Ej verifierat |
| K-SKO-06 | Sidan ska inte samla in elevdata, och inga konton, betyg eller klassuppföljning ska finnas. | Avgränsning | M | B | Beslutat | Ok |
| K-SKO-07 | Skolan får inte styra utvecklingen; skolfunktioner är tillval. | DasKrokodil 2026-11-08 | M | B | Beslutat | Ok |

## K-PLA. Plattformar och webbläsare (M5)

Stödmatris (beslut 2026-11-08): de **senaste två versionerna** av Chrome, Safari (iOS och iPadOS), Firefox och Edge; iPad i **liggande och stående** läge; mobil, surfplatta och dator.

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-PLA-01 | Sidan ska fungera i stödmatrisens webbläsare. | DasKrokodil 2026-11-08 | M | T | Beslutat | Delvis (Firefox och WebKit röda i releasekörning 2026-11-08) |
| K-PLA-02 | Sidan ska fungera i mobilbredd (cirka 400 px) utan horisontell scroll. | CLAUDE.md: Utseende | M | T | Beslutat | Ej verifierat |
| K-PLA-03 | Sidan ska fungera på iPad i liggande och stående läge, inklusive bredder 768–1024 px. | DasKrokodil 2026-11-08 | M | T, G | Beslutat | **Ej provat** |
| K-PLA-04 | Alla knappar ska ha minst 44 × 44 px träffyta på mobil och minst 24 × 24 px på dator. | #406 | M | G | Beslutat | Ej verifierat |
| K-PLA-05 | Sidan ska degradera värdigt när grafikaccelerering (WebGL) saknas och inte hänga sig. | #692 | M | T | Beslutat | Ej verifierat |
| K-PLA-06 | Webbläsarens egen sidzoom ska vara tillåten. | #404 | M | T | Beslutat | Ok |
| K-PLA-07 | Release ska prövas i tre webbläsarmotorer (Chromium, Firefox, WebKit) innan publicering. | #888 | M | T | Beslutat | Delvis |

## K-TIL. Tillgänglighet (M5)

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-TIL-01 | Allt ska gå att nå och använda med tangentbord, och fokus ska synas. | #139, #386 | M | T, G | Beslutat | Ej verifierat |
| K-TIL-02 | Kontrollramar ska ha minst 3:1 kontrast mot bakgrunden. | #406 | M | G | Beslutat | Ej verifierat |
| K-TIL-03 | Rörelse ska kunna dämpas (Lugn rörelse; respekterar `prefers-reduced-motion`). | #246 | M | T | Beslutat | Ok |
| K-TIL-04 | Ändringar i innehåll och steg ska annonseras för skärmläsare. | #878 | B | G | Beslutat | Delvis (#878, #883) |
| K-TIL-05 | Skärmläsarupplevelsen och full tangentbordssekvens ska attesteras manuellt före stor release. | komplett analys 2026-11-08 | B | G, O | Förslag | **Ej attesterat** |
| K-TIL-06 | Kategorifärger ska kunna skiljas åt utan enbart färg (färgblindhet). | M5 | B | G | Förslag | Ej verifierat |

## K-SPR. Språk (M7)

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-SPR-01 | Sidan ska finnas på svenska, engelska, tyska, spanska och franska. | #63 | M | S | Beslutat | Delvis |
| K-SPR-02 | Ny gränssnittstext och nytt innehåll ska översättas i samma pull request som skrivs. | CLAUDE.md: Språk | M | S | Beslutat | Ok (spärr) |
| K-SPR-03 | Antalet oöversatta texter får aldrig öka. | CLAUDE.md: Språk | M | S | Beslutat | Ok (spärr); skuld finns |
| K-SPR-04 | En översättning får aldrig ändra fakta. | CLAUDE.md: Språk | M | G | Beslutat | Delvis (tyskt fynd 2026-11-08) |
| K-SPR-05 | Saknas ett språk ska engelska, sedan svenska, visas. | CLAUDE.md: Datamodell | M | T | Beslutat | Ok |

## K-INT. Integritet, öppenhet och licenser

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-INT-08 | Om Google Fonts och jsDelivr ska behållas eller självhostas avgörs efter den juridiska läsningen (K-INT-07); tills dess lämnas de som de är. | DasKrokodil 2026-11-08 | B | B | Beslutat | Väntar på K-INT-07 |
| K-INT-01 | Inget statistik- eller spårningsskript ska köras på sidan. | beslut 2026-11-06 | M | S | Beslutat | Ok |
| K-INT-02 | Kod ska vara GPL-3.0 och data CC BY 4.0; bara förenliga licenser får användas. | CLAUDE.md: Licenser | M | S | Beslutat | Ej verifierat |
| K-INT-03 | Sidan ska ha en skarp Content-Security-Policy. | #707 | M | S | Beslutat | Ej verifierat |
| K-INT-04 | Förslagsformuläret ska skydda mot spam och begränsa storlek och ursprung. | docs/feedback.md | B | T | Beslutat | Ej verifierat |
| K-INT-05 | Inget kommersiellt: ingen reklam eller försäljning. | DasKrokodil 2026-11-08 | M | B | Beslutat | Ok (en frivillig Ko-fi-länk finns i Hjälp, beslut 2026-10-30; fråga 7 i [12](12-integritet-och-licenser.md)) |
| K-INT-07 | Integritets- och licensöversikten ([12](12-integritet-och-licenser.md)) ska läsas juridiskt en gång, av någon som kan reglerna för skolor, innan sidan marknadsförs till lärare. | #918 | B | B | Beslutat | Utkast finns; ej juridiskt läst |
| K-INT-06 | Sidan ska vara öppen för all input från besökare (förslag, åsikter, hjälp), men DasKrokodil bestämmer ensam. | DasKrokodil 2026-11-08 | M | B | Beslutat | Ok (README: Bidra) |

## K-PRE. Prestanda (M5, M6)

*Siffror saknas medvetet. De sätts efter mätning på en verklig svag enhet, inte av mig.*

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-PRE-01 | Sidan ska starta och gå att använda inom en rimlig tid på en vanlig mobil och iPad. **Mått ska sättas.** | M5 | M | M | Förslag | Ej definierat |
| K-PRE-02 | Uppspelning och drag ska flyta utan märkbart hack på en vanlig mobil. **Mått ska sättas.** | M5 | M | M | Förslag | Ej definierat |
| K-PRE-03 | Datamängden ska kunna växa utan att starttiden växer i samma takt (data laddas vid behov). | #337 | B | M | Beslutat | Delvis |

## K-DRI. Drift, release och underhåll (M6)

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-DRI-01 | Ingen bundler eller ramverk; sidan ska gå att köra med `python3 -m http.server`. | CLAUDE.md: Arkitektur 1 | M | T | Beslutat | Ok |
| K-DRI-02 | Data ska vara skild från kod. | Arkitektur 2 | M | G | Beslutat | Ok |
| K-DRI-03 | Allt ska ritas först på en ekvirektangulär bild (beslut 1). | Arkitektur 4; [04](04-arkitekturoversikt.md) | M | G | Beslutat | Ok |
| K-DRI-04 | three.js 0.160.0 ska vara enda externa beroende; inga andra utan DasKrokodils ok. | Arkitektur 6 | M | G | Beslutat | Ok |
| K-DRI-05 | Ingen publicering till `main` utan pull request; `production` uppdateras bara via release-PR efter releasekontroll och DasKrokodils godkännande. | docs/DEPLOYMENT.md | M | S | Beslutat | Ok |
| K-DRI-06 | Produktdokumentationen i `docs/produkt/` ska gås igenom och uppdateras vid varje release. | DasKrokodil 2026-11-08; releasemallen | M | B | Beslutat | Ny |
| K-DRI-09 | Kostnader och villkor för Cloudflare, GitHub och jsDelivr ska vara dokumenterade ([11](11-kostnader-och-villkor.md)). | #918 | B | B | Beslutat | Delvis: tjänsterna listade, kostnader och villkor ska fyllas i |
| K-DRI-08 | Förbättringar av rendering (skarpare zoom, mobilminne, kartprojektion i Platt vy) ska göras som små, egna issues när ett konkret problem visar sig, utan att ändra beslut 1. | DasKrokodil 2026-11-08; [04](04-arkitekturoversikt.md) | B | G, M | Beslutat | Ny |
| K-DRI-07 | Dokumentationen ska hållas lätt så att den inte tar glädjen ur ett ensamt hobbyprojekt (M6, M8). | M6, M8 | B | G | Förslag | Ej verifierat |

## K-UTS. Utseende (M8)

| ID | Krav | Källa | Prio | Bevis | Status | Läge |
|---|---|---|---|---|---|---|
| K-UTS-01 | Mörkt observatorietema; pergamentfärgat land på djupblått hav; mässing som accent. | CLAUDE.md: Utseende | M | G | Beslutat | Ok |
| K-UTS-02 | Typsnitt: IM Fell English, Instrument Sans, IBM Plex Mono. | CLAUDE.md: Utseende | M | G | Beslutat | Ok |
| K-UTS-03 | Alla färger ska vara CSS-variabler i `:root`. | CLAUDE.md: Utseende | M | S | Beslutat | Ej verifierat |

## Följer kraven målen?

| Mål | Krav (urval) |
|---|---|
| M1 förstå på en minut | K-KÄR-03, K-PLA-02, K-PLA-03 |
| M2 pålitligt innehåll | K-INN-01–10, K-KÄL-01 |
| M3 skolan, för den som vill | K-SKO-01–07 |
| M4 global bredd och urval | K-INN-11, K-INN-12 |
| M5 fungerar överallt | K-PLA-01–07, K-TIL-01–06, K-PRE-01–02 |
| M6 hållbart för en ensam redaktör | K-DRI-01–07 |
| M7 språk | K-SPR-01–05 |
| M8 det ska vara kul | K-KÄR-11, K-UTS-01–03, K-KÄL-04 |
| M9 lära ut källkritik | K-KÄL-01–04 |

Ett krav utan mål, eller ett mål utan krav, är en lucka eller överflöd att ta upp vid nästa uppdatering.

## Vad den här första versionen inte är

- Den är **inte komplett**. Jag har tagit krav ur CLAUDE.md, beslutsfilerna, analyserna och DasKrokodils besked. Det kan finnas beslutade krav jag missat; lägg till dem.
- Den är **inte verifierad**. "Läge" är mest "ej verifierat". En första genomgång med bevis görs vid nästa release (K-DRI-06).
- Den innehåller **inga siffror för prestanda**, eftersom ingen mätning finns.
- Den är en **ram**, inte ett kontrakt: avviker något ska det bli ett medvetet beslut i `docs/beslut/`.

## Att kontrollera vid uppdatering (varje release)

- [ ] Fyll i **Läge** med bevis för de krav som berörts, och skriv datum överst.
- [ ] Lägg till krav för nya funktioner och beslut; stryk (inte radera) krav som inte längre gäller.
- [ ] Står något i CLAUDE.md eller en ny beslutsfil som saknas här?
- [ ] Har ett "Förslag" godkänts eller avslagits? Ändra status.
- [ ] Stämmer mål-krav-tabellen?
