# Teman som 6.2.0, före Version 7 (#398, #893, #11, #49)

**Datum:** 2026-11-08 (DasKrokodil godkände ordningen samma dag)

## Beslut
1. **Version 7 (Människans långa historia) är inte ett tema** och bygger inte på temamotorn. Den består av tidsreglaget som går längre bak (#49, #396 del 1–2), vanliga händelser och befintliga lagertyper (område och linje för människoarter och vandring, #11). Ett paketerat "Människans ursprung" kan bli ett senare tema, men Version 7 väntar inte på det.
2. **Temamotorn (#398) blir "Version 6.2.0: Teman"**, med temamotorn och teknik (#105) som första tema. **Regionkort (#579) flyttas till 6.3.0.** Ordningen är: 6.0.0 → 6.0.1 → 6.1.0 → 6.2.0 (Teman) → 6.3.0 (Regionkort) → 7.
3. **Formatet skrivs före bygget.** Temamotorns fastställda format (`data/teman.json`, hur ett tema väljs i Fokus) skrivs nu som ett eget dokumentuppdrag utan kod. Bygget börjar efter att lägeskontraktet (#893) är avgjort, och #893 ska räkna "tema" som ett läge i Fokus.
4. **Epoker (#845, #476) och teman ska inte bli två format** för samma sak (ett namngivet urval med introduktion). Den som skriver temaformatet jämför med epoklistan.
5. **Version 7 blockeras av besluten a–d i förstudien** ([2026-11-07-tidsmodell-forstudie.md](../granskningar/2026-11-07-tidsmodell-forstudie.md)): riktning, hur långt bak, hur stor del av reglaget och om #767 väntar. De är fortfarande obesvarade. Del 1 (läsa `Y-…` och stora årtal i `js/model.js`) kan göras före resten när beslut a är taget.

## Varför
Temamotorn beslutades 2026-11-01 men har legat still sedan dess: den väntar på ett fastställt format, och ingen version äger den (den ligger i ett parallellt spår). 26 temaissues väntar på den. Den är redan avgjord, medan regionkorten väntar på beslut om gränskälla och licens. Version 7 behöver inte temamotorn tekniskt. Ordningen minskar också filkrockar, eftersom 6.1.0 och Version 7 båda rör tidslinjen och därför ändå måste byggas efter varandra.

## Berör
CLAUDE.md (Versionsplan), GitHub-milstolparna "Version 6.2.0: Regionkort" (ska heta 6.3.0) och "Teman: temamotor" (ska bli 6.2.0), #398, #893, #845, #476, #579, #11, #49, #50, #396, #767. Ersätter delen av [2026-11-08-version-6-1-0.md](2026-11-08-version-6-1-0.md) som säger att regionkorten är 6.2.0.
