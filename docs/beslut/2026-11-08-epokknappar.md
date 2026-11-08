# Epokknappar i intervallformuläret (#845 del 3, #965)

**Datum:** 2026-11-08. **Beslut:** DasKrokodil godkände rekommendationens förslag 1–5 i #965 (i chatten, 2026-11-08).

1. **Placering:** knapparna sitter i intervallformuläret ("Välj ett tidsintervall" i årshoppet), som en grupp per indelning ovanför fälten Från och Till. De är en genväg till ett intervall (`range.set`), inte ett nytt läge, så lägeskontraktet (#893), adressen `y`/`y2` och Bakåt/Framåt gäller utan nytt fält.
2. **Båda indelningarna syns**, var och en med eget namn och egen förenklingstext (`name`, `simplification`). Överlappande Lgr22-perioder går bra, eftersom varje knapp väljer ett eget intervall.
3. **Stenåldern** (12 000 f.Kr.) börjar före tidslinjen (`MIN_YEAR` −2999). Knappen väljer 3000–1700 f.Kr. och säger öppet "börjar före tidslinjens början" (som #892/#942). Tidslinjen förlängs inte här (hör till #396).
4. **Epoknamnet visas inte efter valet** och adressen får inget epokfält. Intervallet står redan som år på raden under årtalet.
5. **"Från cirka 1900 till i dag"** går till `MAX_YEAR` och märks "till i dag".

**Motivering:** minst ny tillståndsvariant att hålla i synk, inget nytt på tidslinjen i mobilbredd och förenklingstexterna syns alltid bredvid knapparna (beslutet i [epoker-lgr22](2026-11-08-epoker-lgr22.md)).

**Anmärkningar från bygget:** `data/perioder.json` följde inte med bygget och lades till i `scripts/build-site.sh`. Formuläret fick `max-height` och rullning, eftersom åtta knappar med förenklingstexter annars går utanför skärmen i 400 px. Kontrollen "blockerad" i webbläsartestet använder en tur i stället för en lektion (samma `canEnter('intervall')`).
