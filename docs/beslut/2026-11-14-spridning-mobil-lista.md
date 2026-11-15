# Människans spridning: kortare lista i smal skärm och brödtextens typsnitt (#1418)

**Datum:** 2026-11-14 (beslut av DasKrokodil 2026-11-13)

## Beslut
1. **Posterna fälls ut en och en i smal skärm (högst 760 px).** Teckenförklaringens lista för lagret Människans spridning (`spreadHtml` i `js/ui/legend.js`) visar per post bara tecknet, namnet och säkerheten. Sammanfattningen, noten och källorna ligger i ett eget stycke (`.rl-spread-text`) som är dolt tills posten fälls ut. Rubriken (`h3`) innehåller en riktig knapp (`button.rl-spread-toggle`) med `aria-expanded` och `aria-controls`, så den går att nå och använda med tangentbordet (Enter och Space) och är minst 24 px hög. Det osynliga tillägget "sammanfattning och källor" (`legend.spreadDetails`) berättar för en skärmläsare vad knappen fäller ut. Valet vilka poster som är utfällda minns teckenförklaringen så länge sidan är öppen (per rubrik), och tangentbordsfokus ligger kvar på knappen när listan ritas om.
2. **I bred skärm är allt oförändrat utfällt**, utan knappar. Gränsen följer teckenförklaringens eget läge (`matchMedia('(min-width: 761px)')`), och en ändrad fönsterbredd ritar om listan.
3. **Sammanfattningen sätts i Instrument Sans** (`--f-body`, 12 px) i hela teckenförklaringen, inte bara i mobil, som i faktarutan. IBM Plex Mono behålls för rubriker och metadata. Rubrikerna (`h3` per post) och källänkarnas träffyta på minst 24 × 24 px från #1417 är oförändrade.
4. **Ingen ändring av innehållet.** Samma texter och källor visas; inga historiska fakta ändras. Den nya gränssnittstexten (`legend.spreadDetails`) finns i alla fem språkfilerna i `data/ui/` med artigt tilltal (ingen tilltalsform behövs i en så kort etikett).

## Varför
I mobil täckte listan cirka 190 × 560 px av 400 × 860 px, och de långa sammanfattningarna stod i 11 px IBM Plex Mono, som är svårläst i löpande text. Besökaren behöver först se vilka tolkningar som finns och hur säkra de är, och läser sedan det hen vill ha mer om. En riktig knapp i rubriken är det enklaste tillgängliga mönstret (inget eget ARIA utöver `aria-expanded`) och kräver inget nytt beroende eller byggsteg.

## Berör
`js/ui/legend.js`, `css/style.css`, `data/ui/{sv,en,de,es,fr}.json`, `tests/webblasare.mjs` (ny kontroll, och #1417-kontrollen fäller ut posterna i smal skärm), `docs/arkitektur.md`.
