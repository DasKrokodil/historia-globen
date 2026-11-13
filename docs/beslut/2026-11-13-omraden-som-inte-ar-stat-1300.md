# Områden som inte är en stat: stadsstater, kulturer och småriken (#1300)

**Datum:** 2026-11-13

## Beslut
1. **Områden som Cliopatria har gränser för men som inte är en stat visas på kartan** (alternativ B i #1300), tydligt skilda från riken. De visas inte som vanliga riken, och de lämnas inte som vita fält.
2. **Datamodellen får ett valfritt fält `kind` på en grupp i `data/empires/index.json`.** Saknas fältet är gruppen ett rike (som i dag). Ett kulturområde är en grupp i samma format som rikena, inte ett fjärde format bredvid religioner, teman och epoker. Gränsen kommer fortfarande från Cliopatria (CC BY 4.0, `tools/riken.py`). Fältet ska också föras vidare av `tools/riken_bevara.py` (`KEEP`, #1220).
3. **Typerna är minst två och visas med eget ord, inte med ett enda samlingsord:** stadsstäder (till exempel Mayan City-States, Greek City-States, Sumerian City-States, Pyu City-States) och kultur (till exempel Indus Valley Civilization, Zapotec Civilization). Vilka värden `kind` får och vilka svenska ord som används avgörs i bygget (se "Öppet") och läggs i alla fem språkfilerna och i `docs/ordlista-oversattning.md`.
4. **Skiljemärket är eget fyllningsmönster, ordet i namn och faktaruta och en post i teckenförklaringen.** Mjuk kant (#73, osäker gräns), streckad kant och prickar (lydrike, osäker religion) och snedstreck (krigsområde, #211) återanvänds inte, och skillnaden får inte bara vara färg eller streck (WCAG 1.4.1). Mönstret ritas också på affischen (`js/ui/poster.js`).
5. **Ingen medalj, flagga, huvudstad eller ledare.** Ordet "rike" används inte i namn, sökträff eller lista för ett kulturområde. Frånvaro av medalj är inte signalen, eftersom flera riken redan saknar medalj.
6. **Faktarutan är obligatorisk** för varje kulturområde och säger kort att gränsen är forskarnas modellerade utbredning, inte en känd statsgräns, vilken typ det är enligt källan (Wikidata), hur länge det varade i klartext ("under många hundra år", inte ett fast årtal) och att källorna eventuellt skiljer sig. För elever upp till 13 år gäller du-form och högst två korta meningar (beslut 2026-11-08). Nivån är högst `source-checked`, och aldrig `two-sources` där Cliopatria och Wikidata eller Wikipedia skiljer sig; då står det i `note`.
7. **Ritning och klick:** kulturområden ritas först, under alla riken, och ett rike vinner vid hovring och klick. De ligger i Riken-lagret utan eget reglage, och lagrets namn och legendrubrik ändras i alla fem språk. De nås med tangentbord och skärmläsare via en egen `aria-label` och via teckenförklaringen och Fokus-menyn. Krig får inte peka på ett kulturområde.
8. **Små delar visas som punkter, stora som yta,** enligt samma mönster som #722: delar under cirka 1 000 km² (till exempel de flesta grekiska städerna) ritas som punkter, de större delarna som yta med mönstret. Ett kulturområde ritas inte som en enda fylld, sammanhängande yta när källan visar många enskilda delar.
9. **Utanför första omgången:** Heian Japan (ett riksfall, det japanska riket under hovet, löses i rikesarbetet och tas som del av Japans grupp i `tools/riken.py`), Chámpa (en samling riken, Cliopatria 207–1652 mot Wikipedia 192–1832, kräver `note`) och Scandinavian minor kingdoms (Cliopatria länkar till Vendeltiden, en arkeologisk period, och 43–45 delar över 380 000–426 000 km² är inte styrkt som småriken).
10. **Ordning:** formatet byggs före #645 och #646, i tre pull requests: (a) format utan data, (b) pilot med högst tre poster, (c) resten. Piloten är Mayan City-States (med Later Mayan City-States som samma grupp) och Sumerian City-States. Indus (hopp ×19 mellan −2500 och −2300, samma polygon i 500 år) och Greek City-States (spridd över hela Medelhavet, stort överlapp med Makedonien och Rom) tas efter piloten. Delade filer med #1301 är `GROUPS` i `tools/riken.py` och `data/empires/index.json`.

## Varför
- Vita fält ger fel bild ("där fanns inget"), och ett vanligt rike ger fel bild ("där fanns ett land med en gräns"). Cliopatria skriver själv att dess gränser är en modell.
- Fem experter granskade förslaget 2026-11-13 ([granskningen](../granskningar/2026-11-13-expertgranskning-1300.md)). De stödde alternativ B men visade att ett enda ord ("kulturområde") är fel för stadsstater, att mjuk och streckad kant redan har andra betydelser, att en fylld polygon ger fel bild av utbredning och täthet (mätt mot Cliopatria v021) och att faktarutan inte kan vara valfri.
- Samma format som rikena gör att teman (#398) och epoker (#845) inte blir ännu ett parallellt format.

## Öppet (avgörs i bygget, med beslutsfil om det ändrar datamodellen)
- Vilka värden `kind` får (minst två, till exempel stadsstäder och kultur) och de svenska orden för dem, samt deras motsvarigheter på engelska ("culture area"), tyska ("Kulturraum"), spanska ("área cultural") och franska ("aire culturelle"); `sprak-en`, `sprak-de`, `sprak-es` och `sprak-fr` granskar.
- Exakt mönster och kantstil, och en kontroll i `tests/webblasare.mjs` som visar att mönstret skiljer sig från ett rikes fyllning vid 400 px (inte bara i färg).
- Om `render` per post (yta, punkt eller kluster) ska vara ett eget fält.
- Kriterium för vad som är kultur respektive stat, och vad som händer med förbund som Aitoliska och Achaiska förbundet (kan annars ritas två gånger).
- Lagrets nya namn, särskilt på spanska (i dag "Imperios").
- Läroplansordet: Skolverkets text (källa `skolverket-lgr22-historia`) kontrolleras före formuleringar som hänvisar till Lgr22.
- Mätningen av hur repots förenklade filer (0,2°, öar under cirka 200 km² borta) beter sig för de små delarna.

## Berör
`data/empires/index.json`, `tools/riken.py` (`GROUPS`), `tools/riken_bevara.py` (`KEEP`), `tools/dela_data.py`, schemat för empires, `js/layers/areas.js`, `js/layers/area-style.js`, `js/layers/empiremarks.js`, `js/ui/legend`, `js/ui/poster.js`, Fokus riken-flik, faktaruta och kort, sök, `data/ui/*.json` (fem språk), `docs/ordlista-oversattning.md`, `docs/datamodell.md`, `docs/arkitektur.md`. Hör ihop med #1300, #645, #646, #556, #1301, #1220, #722 och [expertgranskningen](../granskningar/2026-11-13-expertgranskning-1300.md). Ändrar inget tidigare beslut; [omstridda gränser](2026-11-03-omstridda-granser.md) och [små stater som punkter](2026-11-07-sma-stater-punkter-722.md) gäller nutida stater och täcker inte områden utan stat.
