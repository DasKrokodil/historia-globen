# Inställningar flyttas från Lager till Mer (#1574, steg 4)

**Datum:** 2026-11-14 (DasKrokodil: "Ja till att göra enligt rekommendation" i #1574, och "ja" i svaret att Lugn rörelse och Pausa vid flyttas till Mer › Inställningar)

## Beslut (byggt)
- **Lugn rörelse** och **Pausa uppspelningen vid** ligger i ett eget kort, **Inställningar**, som öppnas från en ny knapp i Mer (gruppen **Anpassa**). Kortet är samma slags kort som Hjälp (`Help` i `js/ui/help.js`), är en dialog i stängregistret (`surfaces.watch('settings', …)`) och stängs med Stäng, Escape eller ett klick utanför.
- Lager har inte längre de raderna. `LayerMenu` tar kortet som `settings` (`js/ui/layers.js`) och läser `data-calm` och `data-pause` därifrån; valen sparas som förut (`hg-calm`, `hg-pause`) och raden "Nästa paus" följer kortet (`js/controllers/playback.js`).
- Gruppen som bara har "Behåll mina lager medan jag följer något" heter nu **Mina lager** (var Inställningar, som inte längre stämmer) och lämnas öppen.
- **Kategorierna** är en egen hopfälld grupp i Fler val med antalet valda på raden ("14 av 14 på", `layers.groupCount`); raden följer knapparna också när de ändras från Samtidigt-panelen.
- Pausraden säger nu att pausvalen ändras under **Mer › Inställningar** (`play.pausesAt`, fem språk).

## Berör
`index.html` (kortet, knappen och gruppen Anpassa i Mer), `js/ui/layers.js` (`settings`, `collapseCategories`), `js/main.js`, `js/controllers/playback.js`, `js/controllers/focus.js`, `css/style.css` (`.settings-card`), `data/vyer.json` (gruppnamnet), `data/ui/*.json` (`top.settings`, `more.customize`, `settings.close`, `play.pausesAt`), `tests/webblasare.mjs` (Mer-kontrollen prövar kortet; övriga kontroller sätter rutorna direkt).

## Kvar i #1574
Inget i steg 4. Förvalen är sju och inte sex (Framsteg behålls, beslut 2026-11-14).
