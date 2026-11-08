# Inget statistikskript på sidan, och skarp CSP

**Datum:** 2026-11-06

## Beslut
Beslutet i #466 (2026-11-02) står fast: besöksstatistiken kommer från Cloudflare Pages egen statistik, utan skript på sidan. Cloudflare Web Analytics, som Cloudflare lade in på historiagloben.se, stängs av i Cloudflares inställningar. Content-Security-Policy går från Report-Only till skarp, med samma regel som i dag (#707).

## Varför
Sidan används i skolan, och inget tredjepartsskript ska köras där. Skriptet var den enda CSP-varningen på produktionen för v5.0.0 (kontrollerat 2026-11-06). Utan det kan regeln bli skarp utan att något annat ändras, som docs/DEPLOYMENT.md förutsåg.

## Berör
`_headers`, docs/DEPLOYMENT.md, #707, #466, #392.
