# Google Fonts och jsDelivr: den juridiska läsningen får bedöma

**Datum:** 2026-11-08

## Beslut
DasKrokodil lämnar frågan om Google Fonts (typsnitten) och jsDelivr (three.js) till den juridiska läsningen av integritets- och licensöversikten ([docs/produkt/12-integritet-och-licenser.md](../produkt/12-integritet-och-licenser.md), krav K-INT-07), som görs en gång av någon som kan reglerna för skolor innan sidan marknadsförs till lärare. Inget flyttas eller självhostas nu. Blir bedömningen att något bör flyttas skapas ett eget issue.

## Varför
Båda tjänsterna får besökarens IP-adress vid varje sidvisning, men det är oklart om det är ett problem och i så fall hur stort. Det är en juridisk bedömning och ingen teknisk, och typsnitten (OFL) och three.js (MIT) kan läggas i repot om det behövs. Att flytta dem utan behov skulle ändra ett fungerande beroende och arkitekturregel 6 (three.js från jsDelivr).

## Berör
`docs/produkt/12-integritet-och-licenser.md`, `docs/produkt/09-kravspecifikation.md` (K-INT-07, K-INT-08), CLAUDE.md (arkitektur 6), `_headers` (CSP), #486, #918.
