# Quiz och Samtidighetsjakten får en enda ingång, och reservlänkarna i förslagsformuläret (#1575, #1581)

**Datum:** 2026-11-14 (DasKrokodil: "Ja till rekommendationen" i #1575)

## Beslut (byggt)
- **Quiz och Samtidighetsjakten** startas bara från **För lärare** under Mer. Knapparna med samma namn i Mer är borta, så att ett ord betyder en sak. Fokus går tillbaka till För lärare när de stängs. Lektionsläget döljer För lärare och därmed båda.
- **Hjälp, steg 4** ("Läs om en plats") är kortare på fem språk: meningen om när konturerna inte syns är struket ur Hjälp. Det som gäller konturerna är oförändrat och står i `docs/arkitektur.md` (#1161).
- **Förslagsformuläret (#1581):** svarar servern att formuläret är avstängt (`disabled`) medan klienten är påslagen, visas länkarna till GitHub (`#fb-closed`) och beskedet pekar på dem. Förut stod texten kvar men länkarna var dolda. En webbläsarkontroll låtsas att servern svarar 503 `disabled`.

## Berör
`index.html`, `js/main.js`, `js/ui/feedback.js`, `css/style.css`, `data/ui/*.json` (`help.s4t`), `tests/webblasare.mjs` (ny kontroll, och Quiz och jakt startas via För lärare).
