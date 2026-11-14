# Människans spridning klipps mot istidens kust (#1565)

**Datum:** 2026-11-14 (DasKrokodils beslut på #1565: spridningens ytor klipps mot istidens kust efter #1564; före 80 000 år sedan klipps de inte, och det står en rad om det i texten)

## Beslut
1. **Alla områden klipps mot land utan is i modellen** (`kind: area` i `data/spridning.json`, inte bara Afrika) mellan cirka 80 000 och 7 500 år sedan, för det närmaste modellsteget: samma skivor och perioder som bildlagret Istidens kust (PaleoMIST 1.0, [beslut 2026-11-14](2026-11-14-istidens-kust.md) och [inlandsisen](2026-11-14-inlandsis-i-istidens-kust.md)). Ytan, snedstrecken och den streckade kanten ritas bara där modellen har land utan inlandsis, så att ingen yta hamnar på hav eller på isen (till exempel Hudson Bay vid 20 000 år sedan), medan torrlagd havsbotten som Sunda och Sahul får yta. Det gäller också när bildlagret Istidens kust är av.
2. **Vågornas linjer klipps inte.** De visar riktning, inte väg, och kan gå över hav och is (det står redan i bildlagrets text).
3. **Utanför spannet som förut:** före cirka 80 000 år sedan (och efter 7 500 år sedan) finns ingen modell. Då klipps Afrika (`clipLand`) mot dagens land och övriga områden inte alls. Teckenförklaringen för Människans spridning har en rad om vilken kust som gäller (`legend.spreadCoastModel` eller `legend.spreadCoastToday`, fem språk).
4. **En egen, liten mask per steg, inte lagerbilden.** `tools/istidens_kust.py` skriver nio masker `images/lager/istidens-land-<N>ka.webp`, 2048 × 1024, vita med alfa = andelen land utan is (bilinjärt samplad ur Wilmes mask och PaleoMIST:s istjocklek, med mjuk kant). Skivorna i `data/bildlager.json` pekar på dem med det nya fältet `mask` (schemat, `scripts/validate-site.py` och `scripts/build-site.sh` känner till det). Lagerbilden kan inte användas: den är genomskinlig över dagens land och skiljer inte land från is där. Masken laddas bara när spridningslagret är på och ett område syns i modellens spann, högst en åt gången, och släpps annars. Före ritningen av en laddad mask (och om den inte går att läsa) ritas som utan modell.
5. **Ritningen** följer arkitekturen (inget byggsteg, inga nya beroenden, lagret ritar på `overlayCanvas` 4096 × 2048): varje område ritas på en återanvänd arbetsduk i områdets ruta, och den delen av masken läggs på med `destination-in` innan resultatet ritas på lagerbilden. Namnet och ordet "tolkning" ritas som förut, mitt i höljet.
6. **Texterna** i `sapiens-asien` och `sapiens-sahul` säger inte längre att kusterna på kartan är dagens, utan att ytan följer kusten och inlandsisen i modellen bakom lagret Istidens kust, för närmaste modellsteg, och att grundkartans kust är dagens. Inga nya uppgifter om var människor fanns.

## Mätning (2026-11-14, Chromium i Playwright 1.63, mjukvarurendering)
- **Filer:** 42–60 kB per mask (nio masker, 478 kB totalt). Lokalt hämtad på 8–9 ms; avkodad på 14–16 ms.
- **Minne:** en avkodad mask är 2048 × 1024 × 4 byte = 8 MB (lagerbilden 4096 × 2048 hade varit 32 MB), och bara en hålls åt gången. Arbetsduken blir som störst 1164 × 1114 bildpunkter (cirka 5 MB) och släpps med masken. JS-högen ändrades från 19 till 20 MB när masken laddades (dator och mobilemulering 400 × 800, enhetsskala 2).
- **Ritningstid för hela lagret** (alla områden och vågor, 4096 × 2048), mobilemulering med fyra gånger långsammare processor: 20 000 år sedan 162 ms med mask mot 62 ms utan, 40 000 år sedan 298 mot 93 ms, 12 900 år sedan 270 mot 83 ms. Utan nedsaktning 40–65 ms mot 17–23 ms. Ritningen görs vid varje omritning när året eller zoomen ändras, inte varje bildruta.
- Inga konsolfel vid 40 000, 20 000 och 13 000 år sedan i 1280 och 400 px, med och utan bildlagret Istidens kust.

## Motivering
Bildlagret Istidens kust visar att Sunda, Sahul och Beringia var land och att Hudson Bay och Östersjön var is. Spridningens ytor följde ändå dagens kust (eller ingen kust alls) och kunde ligga på isen. Att klippa mot samma modell gör att kartan inte säger emot sig själv, utan att påstå något nytt om var människor fanns. En liten mask håller minnet nere i mobil (jfr #1421).

## Kända begränsningar
- Ritningen tar två till fyra gånger längre tid i förhistorien med lagret på. Om det märks i mobil kan de klippta områdena sparas mellan omritningarna (kostar några MB per område).
- Namnet står mitt i höljet och kan hamna på hav när ytan klipps.
- Masken har lägre upplösning än lagerbilden (cirka 20 km per bildpunkt vid ekvatorn), så små öar och smala sund följer modellen grovt.

## Berör
`tools/istidens_kust.py`, `images/lager/istidens-land-*.webp`, `data/bildlager.json`, `schemas/bildlager.schema.json`, `scripts/validate-site.py`, `scripts/build-site.sh`, `js/layers/spread.js`, `js/ui/legend.js`, `data/ui/*.json`, `data/spridning.json`, `tests/spread-mask.test.mjs`, `tests/webblasare.mjs`, `docs/arkitektur.md`, `docs/datamodell.md`, #1565.
