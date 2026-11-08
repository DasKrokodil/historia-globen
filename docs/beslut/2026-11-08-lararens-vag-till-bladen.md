# Lärarens väg till elev- och lärarbladen i lektionsläget (#885)

**Datum:** 2026-11-08

**Beslut:** Läraren får en väg till bladen via **en länkparameter**, `r=lararen`, som läggs till lektionslänken (`#t=<tur>&m=lektion&r=lararen`), och via **Starta som lektion** i Turer-menyn. Då visas knappen "Skriv ut elev- och lärarblad" i lektionsbandet. Eleven i den vanliga lektionslänken (`m=lektion`) ser ingen knapp. Rollen läses bara vid start och skrivs aldrig tillbaka till adressen. Utskriften görs ur steget läraren står i (samma `printLesson()` som i den fria vyn) och rör varken steg, år eller lås; fokus går tillbaka till knappen.

**Motivering:** Beslutet 2026-11-08 (alternativ A) säger att läraren ska kunna skriva ut men inte eleven, och att eleven inte ska se vägen i den vanliga länken. En knapp som alla ser i bandet uppfyller inte det, så en länkparameter valdes. Att inte skriva rollen i adressen gör att Dela, omladdning och Bakåt aldrig sprider utskriftsknappen till eleverna; priset är att läraren öppnar lärarlänken igen efter en omladdning. Menyvägen följer av att den som väljer Starta som lektion i den fulla vyn redan är läraren.

**Medvetet inte gjort:** Lärarlänken står inte på lärarbladet. En extra rad där gör bladet för högt i tyska med reservtypsnitt (1073 px mot gränsen 1039, #757). Hur läraren får lärarlänken (till exempel en knapp "Kopiera lärarlänk" i turkortet i den fria vyn) är en uppföljning som DasKrokodil bestämmer.

**Test:** `tests/webblasare.mjs` ("läraren når elev- och lärarbladen i lektionsläget, eleven inte (#885)"): eleven ser ingen knapp; läraren ser den, skriver ut tre blad från steg 3, steg och år står kvar, fokus kommer tillbaka, rollen finns inte i adressen och knappen är borta efter omladdning. Menyvägen provas i "Turer-menyn märker lektionerna…". `tests/url-state.test.mjs` har enhetstest för `decodeRole`.
