# Lektionsläget: frågan innan eleven lämnar och skalning för projektor (#1572, tillägg)

**Datum:** 2026-11-14 (DasKrokodil: "Ta som rekommenderat" i #1572)

## Beslut (byggt)
- **Eleven får en fråga innan lektionen lämnas.** Knappen "Lämna lektionen" i bandet byter bandet mot frågan "Lämna lektionen? Då visas hela globen." med **Stanna kvar** (fokus hamnar där, Escape gör samma sak) och **Ja, lämna**. Stanna kvar ändrar varken året eller steget och fokus går tillbaka till "Lämna lektionen". Läraren (`r=lararen`, eller en lektion som startats från För lärare eller Turer) lämnar direkt, utan fråga. Frågan har ingen "du", så texten gäller alla åldrar (beslut 2026-11-08).
- **Projektorskalning:** från 1 600 px bredd får lektionsläget ett kort på 480 px och större text (stegets text 18 px, rubrik 28 px, band 15 px), och från 2 200 px kort på 600 px och text 22 px. Under 1 600 px är allt som förut. Presentationsläget (#488) är oförändrat.

## Inte gjort (kvar i #1572)
- Turraden ("Turen: … · Turen styr tiden") är inte ersatt av steg och tur i kortets fot. Raden är också skärmläsarens statusrad (`#pause-note`) och styr kortets höjd i många lägen, så den byts i en egen omgång.

## Berör
`index.html` (`#lesson-confirm`), `js/ui/lesson.js` (`askExit`, `cancelExit`, `hideConfirm`), `js/main.js`, `css/style.css` (projektorskalningen), `data/ui/*.json` (`lesson.confirm`, `lesson.confirmYes`, `lesson.confirmNo`), `tests/webblasare.mjs` (en ny kontroll, frågan prövas i lektionskontrollen, och `leaveLesson` klickar Ja där ett test lämnar som elev).
