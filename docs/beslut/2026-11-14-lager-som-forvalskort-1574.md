# Lager: förvalen som kort och hopfällda grupper (#1574, steg 2–3)

**Datum:** 2026-11-14 (DasKrokodil: "Ja till att göra enligt rekommendation" i #1574, och "ja" till att Framsteg behålls som sjunde förval)

## Beslut (byggt)
- Rubriken i Lager är **"Vad vill du se på kartan?"** (var "Förval") och knappen som visar de enskilda valen heter **"Fler val"** (var "Anpassa själv"). Menyn är 460 px bred på dator.
- De **sju förvalen** (Översikt, Alla händelser, Bara kartan, Makt och gränser, Resor och handel, Människans spridning, Framsteg) är **kort** med namnet och en mening om vad vyn visar på kartan (`description` i `data/vyer.json`, fem språk). Det tillgängliga namnet är bara namnet (`aria-label`); meningen är en beskrivning (`aria-describedby`). Ordningen och namnen från steg 1 (#1574, Alla händelser) är oförändrade.
- **Grupperna** i Fler val (Människor och händelser, Makt, tro och gränser, Rörelser och handel, Historiskt perspektiv) är **hopfällda avsnitt** med antalet påslagna lager på raden ("Makt, tro och gränser · 1 av 4 på", `layers.groupCount`). Raderna i en grupp är oförändrade och står kvar i dokumentet. Gruppen Inställningar är ingen lagergrupp och är orörd.
- **Raderna förklarar vad lagret gör på kartan**, inte vilket märke det har på tidslinjen: Händelser ("markörer på kartan för det som hände"), Samtidigt-kortet ("kortet som visar vad som hände samtidigt på olika håll") och Resor och handelsvägar ("… som linjer på kartan · streckad = osäker väg"). Övriga rader hade redan en beskrivning av vad lagret gör.

## Inte gjort (kvar i #1574, steg 4)
- **Inställningarna** (Lugn rörelse, Pausa uppspelningen vid) ligger kvar i Lager under Kategorier. Att flytta dem till Mer › Inställningar kräver en ny yta och att `LayerMenu` slutar läsa `data-pause` och `data-calm` ur menyn; det görs i en egen omgång.
- **Kategorierna** (14 piller) är inte hopfällda som en egen grupp.

## Berör
`data/vyer.json` (rubrik, Fler val, beskrivningar), `data/ui/*.json` (`layers.groupCount`, `layer.eventsNote`, `layer.funfactsNote`, `layer.routesNote`), `js/ui/layers.js` (korten, `collapseGroups`, `syncGroups`), `css/style.css` (`.view-chip`, `.layer-sect`), `tests/webblasare.mjs` (`setLayer` öppnar gruppen).
