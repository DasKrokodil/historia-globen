# Turer-menyn: rubriker och hopfällda rader (#1573, alternativ B)

**Datum:** 2026-11-14 (DasKrokodil valde alternativ B i #1573; UX-granskningen rekommenderade E, se nedan)

## Beslut
- Turerna ligger under fyra rubriker: **Källkritik**, **Krig**, **Samtidigt i världen** och **Hur föll det?** (den senare fanns redan, #1280). Gruppen kommer ur ett nytt valfritt fält `group` i turens fil (`kallkritik`, `krig`, `tid`, `fall`); saknas det följer gruppen av `war` (krig) och `empire` (fall). Rubrikerna står i `labels` i `data/turer/index.json` på fem språk; saknas de visas alla turer i registrets ordning utan grupp.
- Varje tur är en **tät rad** (44 px) med rubriken och en vinkel. Raden fälls ut med sammanfattningen och knapparna **Starta turen** och, för en lektionstur, **Starta som lektion** (årskurs och tid står bredvid). Raderna är hopfällda varje gång menyn öppnas. Alla tio turer syns utan att rulla (före: fyra av tio på mobil).
- Lektionsknapparna finns kvar i menyn (alternativ E hade tagit bort dem; det valdes inte).

## Varför
Menyn var 1 701 px hög med 26 knappar och 110–230 tecken text per tur. B ger en kort, ordnad lista där besökaren ser vad som finns på en blick, till priset av ett extra tryck före start. UX-granskningen avrådde från B (ett nytt gruppfält i turdata, fyra rubriker × 5 språk och ett extra tryck); DasKrokodil valde B ändå. Kostnaden är betald: fältet, rubrikerna och de uppdaterade kontrollerna.

## Berör
`data/turer/*.json` (`group` på fem turer), `data/turer/index.json` (`group-kallkritik`, `group-krig`, `group-tid`), `schemas/tour.schema.json`, `js/tour-format.js`, `js/ui/tour.js` (`buildMenu`, `menuItem`, `openMenu`), `css/style.css` (`.tour-row`, `.tour-pick`), `tests/webblasare.mjs`.

## Kvar
Mässingsramen runt den första raden när menyn öppnas med tangentbord (fokusringen) kan fortfarande läsas som ett förval; den visas bara vid tangentbord.
