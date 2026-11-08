# Språkbytet skriver adressen före omladdningen (#882)

**Datum:** 2026-11-08

**Beslut:** `createAddress()` har en `flush()` som skriver vyn i adressen direkt, utan att vänta tills vyn står still (`write(force)` hoppar över vänta-vakten men behåller `applying`-vakten). Språkväljaren (`setupLangPicker`) anropar `beforeReload()` (som i `js/main.js` är `address.flush()`) före den läser adressen och laddar om sidan.

**Motivering:** Adressen skrivs annars först när vyn har stått still och vid nästa 700 ms-tick. Trycker man Nästa och byter språk direkt står steget före Nästa kvar i adressen, och en tur eller lektion börjar om på steg 1 efter omladdningen. Reproducerat i testet både på dator och mobil, tre gånger. Rollen `r=lararen` skrivs fortfarande aldrig i adressen (beslut 2026-11-08), så en lärare som byter språk får inte knappen för utskrift efter omladdningen; det är samma beteende som vid en vanlig omladdning.

**Test:** `tests/webblasare.mjs`, "språkbyte direkt efter Nästa behåller steget i lektionen (#882)": Nästa och språkbyte i samma `evaluate`, omladdningen ska stå på steg 2 med `m=lektion` kvar. Röd utan rättningen (steg 1) i tre körningar, grön med den, dator och mobil.
