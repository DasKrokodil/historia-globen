# Religion per rike med källa i religionslagret (#2140)

**Datum:** 2026-11-22 (DasKrokodils svar "Följ rekommendationerna" på #2140, 2026-11-21)

## Beslut
Religionslagret får välja religion för ett enskilt rike när en öppnad källa uttryckligen säger vilken religion det är, även om faktarutans ord är allmännare. Valet skrivs för hand i registret i `data/religions.json` som `religionOverride` (`religion` och `sources`), och varje källa står i `data/sources.json`. Valet ersätter religionen men inte regeln eller säkerheten, så ett rike där flera religioner nämns visas fortfarande som osäkert.

Första valen: Hwicce får germansk religion och Zapotekerna mesoamerikansk religion. Visigoterna får inget val: rekommendationen i #2140 (germansk) ändrades efter källgranskningen, eftersom riket finns i Cliopatria bara 397–401 (visas i ögonblicksbilden 400–449) och goterna enligt *Gothic Christianity* blev kristna "sometime between 376 and 390 AD". Visigoterna får i stället `christianSince` 390 med den källan (det senaste förslaget, som Kaukasiska Iberien i #1704). Chimor och Kanem-Bornu flyttas inte, eftersom källorna bara säger "Polytheist" och "traditional local religions"; en andinsk eller afrikansk religion vore en slutsats ur geografin, inte vad källan säger.

## Varför
Efter #1375 låg några riken kvar i "Annan traditionell religion" fast en öppnad källa knyter dem till en religion som lagret har. Textmönstren i `tools/religioner.py` räcker inte för dem utan att också flytta riken där källan inte säger det. Ett handplockat val med källa är spårbart och följer källpolicyn. Där källorna skiljer sig, till exempel om när visigoterna kristnades (*Visigoths*: före inträdet i riket 376; *Gothic Christianity*: goterna allmänt 376–390), står det öppet i docs/datamodell.md.

## Berör
`tools/religioner.py`, `data/religions.json`, `data/religions-polities.json`, `data/sources.json`, `js/ui/sources.js`, `data/ui/*.json` (`sources.religionOverride`), `tests/religioner-val.test.mjs`, `tests/religioner-test.py`, docs/datamodell.md; #1375, #2139, #2150.
