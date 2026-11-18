# Fynd som UX-genomgången missade

Varje gång DasKrokodil hittar något som ser konstigt ut och som genomgångarna inte fångade skrivs en rad här (beslut 2026-11-16,
#1799): vad han såg, vilken yta, och vilken fråga eller vilket tillstånd i genomgången per yta som hade fångat det. Högst en rad
per fynd. Loggen ersätter inte issuet för själva felet, och agenten läser den före varje genomgång.

De fem frågorna: **1 Förväntan**, **2 Först**, **3 Ointressant**, **4 Tillstånd**, **5 Läsbarhet och mobil**.

| Datum | Yta | Vad som sågs | Fråga eller tillstånd som hade fångat det | Issue |
|---|---|---|---|---|
| 2026-11-15 | Regionvyn, Aotearoa år 33 000 f.Kr. | Många händelser visas långt före någon bodde där. | 4 Tillstånd: år långt före platsens första händelse. | #1786 |
| 2026-11-15 | Platskort i regionvyn | Man trodde sig redan vara i regionvyn och väntade sig att kunna trycka på landet; knappen "Visa i regionvy" var förvirrande. | 1 Förväntan: vad trycker en besökare på för att få fram uppgifterna? | #1790, #1791 |
| 2026-11-15 | Platskort och händelsekort | Källinfo, "linjen visar dagens gräns" och kategorinoten låg först och störde. | 2 Först och 3 Ointressant. | #1789, #1792 |
| 2026-11-15 | Turkort i en tur (steg 1 och 2) | Andra händelser var tända under turen, och texten var svår att läsa i ett svep. | 4 Tillstånd: lager som inte hör till steget; 3 Ointressant; 5 Läsbarhet. | #1784, #1785, #1793 |
| 2026-11-15 | Samtidigt-panelen | Menyn var oöverskådlig. | 2 Först: vad syns i första synfältet. | #1782 |
| 2026-11-15 | Kartan över Europa | Danska flaggan hamnade i havet. | 4 Tillstånd: symbolen ligger utanför områdets yta. | |
| 2026-11-16 | Menyerna, vägen till länder och regionvyn | Vyn kändes bra, men vägen dit kändes inte logisk i menyerna. | 1 Förväntan, börjat före ytan: från startbilden, utan att veta vad ytan heter, vilka ord och hur många tryck leder dit? | #1853 |

## Frågor som lagts till efter baslinjen (2026-11-16)

Se [baslinjegenomgången](2026-11-16-baslinje-per-yta.md), avsnittet "Vad genomgången lärde oss":

- **Fråga 2 (Först):** vilken text syns i kortet utan rullning, och finns en signal om att det finns mer?
- **Fråga 3 (Ointressant):** använder två ytor samma ord för olika saker (till exempel "Samtidigt")?
- **Fråga 4 (Tillstånd):** nollställs rullningen när innehållet byts, och vad händer när en annan yta öppnas medan den här är öppen?
