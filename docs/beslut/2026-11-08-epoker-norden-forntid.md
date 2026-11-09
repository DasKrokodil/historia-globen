# Epoker som data, Del 2a: de tre nordiska åldrarna (#845, #476)

Datum: 2026-11-08. Beslut av DasKrokodil i chatten 2026-11-08: de tre åldrarna läggs in, antiken avvaktar en andra källa.

**Beslut:** `data/perioder.json` får en andra indelning, `norden-forntid`, med nordisk stenålder (12 000–1700 f.Kr.), bronsålder (1700–500 f.Kr.) och järnålder (500 f.Kr.–550 e.Kr.), med Historiska museets årtal. De ligger inte i `lgr22`, eftersom läroplanen inte anger några årtal för dem; då hade indelningen blandat två källor. Fyra källposter för museets sidor (`historiska-perioder`, `-stenalder`, `-bronsalder`, `-jarnalder`) är nya, bara länkade och med datum `2026-11-08`.

**Skäl:** Historiska museet är en etablerad svensk källa med årtal för alla tre åldrar. Sidorna är museets egna, så nivån är `source-checked`, inte `two-sources`.

**Källorna är oense (sägs öppet):** museets översikt slutar järnåldern 550 e.Kr. och räknar vikingatiden (793–1050) som egen period, medan sidan om järnåldern anger 1100 e.Kr. Vi använder 550, och oenigheten står i periodens `note` på fem språk. Mesolitikums delperioder (9500 eller 10 000 till 4000 f.Kr.) utelämnas.

**Avgränsning:** indelningen är nordisk och märks så i `simplification`. Texterna på museets sidor har ingen angiven licens; bara epoknamn och årtal används. Antiken, övergången till jordbruk, högkulturer, kolonisation, industrialisering och revolutioner (Del 2b) väntar på en andra, bättre källa (snl.no är inte nåbar från molnmiljön; Nationalencyklopedin och Britannica återstår). Filen läses inte av appen än; snabbknapparna byggs efter #755.
