# Backlogg och milstolpar efter v6.2.0

**Datum:** 2026-11-12

**Beslut:** DasKrokodil godkände en genomgång av alla öppna issues och milstolpar efter v6.2.0. Ändringarna är gjorda på GitHub.

**Milstolpar**
- **Omdöpta:** "UI/UX uppdateringar" blev *Version 6.2.1: Rättningar efter 6.2.0*; "Version 6.4.0: Regionkort" blev *Version 6.4.0: Regionkort och platser* (platsernas första skiva, beslutet 2026-11-11, hör till #579); "Version 7: Människans långa historia" blev *Version 7.0: Tidsmodell och reglage*.
- **Nya:** *Version 7.1: Människoarter*, *Version 7.2: Lärarstöd för förhistorien* (uppdelning av version 7 enligt beslutet 2026-11-10), *Riken: symboler och flaggor*, *Quiz och källkritik* och *Teknik: webbläsartestet*.
- **Flyttade issues:** rättningar efter 6.2.0 till 6.2.1, #1159–#1164 till 6.4.0, rikessymbolerna och #462 till symbolmilstolpen, quiz- och källkritikissues (#838, #846, #469, #947, #948, #1126) till sin milstolpe, webbläsartestets issues till sin, version 7 delad i 7.0, 7.1 och 7.2. Inga öppna issues saknar längre milstolpe, och "Senare: beslut krävs" innehåller bara det som väntar på beslut.

**Sammanslagningar**
- #1172 in i #1174 (samlingsissue för ostabila kontroller, enligt beslutet 2026-11-11). #1060 (installationen hänger) och #1184 (tidsgräns, stängt) är kvar som egna.
- #103 stängt som dubblett av #557 (landsvyer; kartkälla och licens i #1115).
- #850 in i #846 (*Quizet: två nya frågetyper*).

**Mätning och regler**
- Översättningsläget mättes 2026-11-12 med `tools/oversattning.py`: oöversatta texter de 7 281, es 8 548, fr 8 548; engelskan och gränssnittet saknar inget. Inget periodissue var klart. #803 gäller nu bara turerna (resorna är klara på tyska).
- #14 (rymden) och #10 (flöden) är samlingsissues med delar, inte dubbletter, och behålls.

**Motivering:** 21 milstolpar hade överfulla eller blandade innehåll (Språk 49, Temavyer 27, version 7 25, "beslut krävs" 18) och 18 issues saknade milstolpe. Efter 6.2.0 behövdes en struktur där varje issue har en plats som svarar mot vad som ska göras och när, och där röda kontroller och dubbletter samlas.
