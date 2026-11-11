# Språkvalet flyttas till en knapp i översta raden

**Datum:** 2026-11-11 (DasKrokodil i #1167)

## Beslut
1. Språket väljs med en knapp i översta raden: en jordglob och språkets kod (till exempel SV). Den öppnar en kort lista med språkens egna namn (Svenska, English, Français, Deutsch, Español).
2. Inga flaggor, varken på knappen eller i listan.
3. Språk vars översättning inte är färdig (`complete: false` i `data/ui/sprak.json`) visas i listan med ett tydligt märke "beta".
4. Rutan med språkval i Mer-menyn tas bort. Det ändrar den delen av beslutet om toppmenyn (2026-11-06-toppmenyn-651.md) där Språk låg under Mer.

## Varför
Den som inte läser svenska ska kunna hitta språkvalet utan att först förstå ordet "Mer". Flaggor står för länder, inte språk: engelska, spanska, franska och tyska talas i flera länder, och flaggemojis syns inte på Windows. En knapp med text går att läsa upp med skärmläsare, och en jordglob med kod känns igen från andra stora webbplatser.

## Berör
`index.html`, `js/i18n.js` (`setupLangPicker`), `js/main.js`, `css/style.css`, `tests/webblasare.mjs`, #1167, #63.
