# Faktarutans ordning: rubrik och datum före bilden (#605–#608)

**Datum:** 2026-11-05

## Beslut
Rikard valde förslag 1–4 ur inventeringen i #572. I händelsens faktaruta står rubrik och datumrad först och bilden efter (#605). Datumraden får en kort markering *osäkert* efter datumet eller platsen när just den är osäker, och den leder till raden Historisk osäkerhet (#606). Platsen står en gång; mobilens knapp heter *Visa på globen* (#607). Krigets kort före och efter får granskningsstatus (#608).

## Varför
I datorn fyllde bilden hela den synliga delen av rutan, så man fick rulla för att se vad händelsen hette, och mobilen visade en annan ordning. Osäkerheten stod långt från det den gällde.

## Berör
`js/ui/panel.js`, `css/style.css`, `data/vyer.json` (`uncertainty.mark`, `uncertainty.markTitle`), `tests/webblasare.mjs`, `docs/arkitektur.md`. Förslag 5 (vad som räknas som osäkerhet) kräver ett eget datamodellbeslut och ingår inte.
