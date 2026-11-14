# Platskortet i turens steg, uppföljning: uppläsning, namn, knapptext och slutårets förklaring (#1464)

**Datum:** 2026-11-14

## Beslut
DasKrokodil svarade "följ rekommendationerna" på uppföljningen efter granskningen av [#1163](2026-11-13-turens-stegfalt-place-1163.md). Byggt enligt det:

1. **Prov som saknades (punkt 1).** (a) Ett vanligt Fokus som startas under en tur med platssteg avslutar turen (`MODE_RULES`): turkortet, `touring` och turens adressdelar är borta, kortet är Fokus-kortet med *Avsluta platsen* och *Visa i Platt karta*, och ingen kontur från steget ligger kvar (lagret nollställer `step` när läget Tur inte pågår; provas i `tests/platskort-i-tur.test.mjs`). (b) En djuplänk `#t=…&s=<steg med plats>` i en vanlig tur öppnar steget och kortet utan Fokus. Båda i webbläsartestet, dator och mobil.
2. **Knapptexten på ett ställe (punkt 4).** *Läs om platsen* ligger nu i `data/turer/index.json` som `labels.readPlace`, bredvid `labels.read` (*Läs om händelsen*), där alla turkortets knappar redan står. `tour.readPlace` är borttagen ur `data/ui/*.json`. Den enda läsaren är `TourPlayer` (`readLabel(step)`). Valet kräver minst ändring: en läsare och ingen flytt av en text som flera ställen använder.
3. **Kortets namn för skärmläsare (punkt 5).** Platskortet heter *Om platsen* (`place.cardLabel`, fem språk) i stället för *Om händelsen*. `Panel.setDetailOpen(open, label)` sätter namnet vid varje öppning, så att ett kort aldrig ärver det förra kortets namn. Temakortet och övriga kort är oförändrade (*Om händelsen*).
3b. **Träffytor på touch (andra halvan av punkt 5).** Raderna i händelselistan i platsens och temats kort (`.detail-selection .theme-event`) var 31 px höga och är nu minst 44 px i smal skärm och på pekskärm (`pointer: coarse`). Krysset är 30 × 30 px, men i smal skärm ger `#detail .detail-close::after` redan en träffyta på 46 px; samma utökning gäller nu också en bred skärm med touch, bara för `.detail-selection`. Ingen annan kortyp ändras (en global ändring skulle ha påverkat händelsekortets rader och stängknappar). Provet mäter raderna och krysset i smal skärm och är rött utan regeln.
4. **Gemensam uppläsning (punkt 6).** På bred skärm läser statusraden stegets text och kortets rubrik som en uppläsning: "Steg 2 av 3. Platsen. Steget öppnar platsens kort. Plats: Grönland". Samma mönster för ett händelsesteg ("… Om händelsen: …"). Förut skrev kortets rubrik (prioritet 2 i `js/ui/status.js`) över stegets text. Uppläsningen väntar tills kortet har öppnats (en plats laddas först). I smal skärm öppnas kortet inte av sig självt, så stegets text läses ensam och rubriken läses när *Läs om platsen* öppnar kortet. Uppläsningens meningar sätts ihop så att ingen dubbel punkt uppstår när en text redan slutar med skiljetecken.
5. **Varför slutåret inte används (punkt 7).** När ett tidsintervalls slutår ligger före platsens första eller efter dess sista händelse säger raden det: "Tidsintervallet 1990–2020 avslutades när platsen började följas. Platsens sista händelse är 2009, så platsen visas för år 1990." (`place.rangeEndedAfter` och `place.rangeEndedBefore`, fem språk). Årtalet räknas ur platsens egna händelser (`rangeEndSide` i `js/focus/place.js`, samma spann som fokuset börjar i), inte skrivet för hand. Ligger slutåret inom spannet är raden som förut.

## Inte gjort
- Punkt 2 (schemat uttrycker inte att `open` och `place` utesluter varandra) och 3 (`start(f, ctx)`): väntar tills fokustyperna ändå rörs, enligt rekommendationen.
- Punkt 8 (konturens utseende i ett steg): väntar tills en första riktig tur med platssteg finns att titta på.
- Punkt 9 (rad i platskortets lista i en tur): lämnas som den är tills en lärare har sett en lektion.

## Varför
Skärmläsaren och den som tittar ska få samma sak: stegets text och vad kortet heter. Förklaringen när slutåret inte används gör att "För år 1990 visas platsen" inte ser ut som ett fel när intervallet slutar i dag. Knapptexterna ska stå på samma ställe, så att en ändring av en av dem inte glöms för den andra.

## Berör
#1464, #1163, #579, #1161, #755, `js/ui/tour.js`, `js/ui/panel.js`, `js/focus/place.js`, `css/style.css`, `data/turer/index.json`, `data/ui/*.json`, `docs/arkitektur.md`, `docs/datamodell.md`.
