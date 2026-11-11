# Översikt som startvy: urvalet syns och lektionen visar alltid allt (#1139)

**Datum:** 2026-11-11

## Beslut
DasKrokodil svarade A på alla tre punkter i #1139:

1. **Förklaringstexten** för vyn Översikt (`tags.oversikt.about` i `data/vyer.json`) säger att det är "ett urval av händelser som ofta tas upp i skolan och i uppslagsverk", så att man kan bläddra i tiden utan att se allt på en gång, och att det finns mycket mer (välj Standard i Lager). Texten säger inte att händelserna är "de viktigaste" och inte att urvalet bygger på eller stöds av Lgr22. Skriven om på alla fem språk, med artigt tilltal i en/de/es/fr.
2. **Synlig urvalsmarkering:** när vyn Översikt är på står en rad överst i Samtidigt: "Översikt: ett urval, cirka 120 händelser. Visa alla". Antalet räknas ur datan (händelser med `significance` 1 som syns) och avrundas till tiotal (`overviewCount` i `js/ui/panel.js`). "Visa alla" är en knapp som gör samma sak som Standard i Lager (`layers.applyView('standard')`). Tomläget "Inget ur Översikt …" finns kvar under raden. Nya texter `panel.overviewNote`, `panel.overviewAll` och `panel.overviewAllLabel` i alla fem `data/ui/*.json`.
3. **Lektionsläget visar alltid alla händelser i lektionens år.** Ändring i `MODE_RULES` (`js/state.js`): `restore` för `lektion` och `tur` har fått fältet `tag` (vyns urval), och ögonblicksbilden (`app.modeSnapshot`) bär urvalet. När lektionen börjar släpper `LessonMode.enter` urvalet, och "Visa hela globen" återställer det som det var före lektionen. `takes` och uteslutningstabellen är oförändrade. Prövas i `tests/state.test.mjs`, `tests/panel.test.mjs` och webbläsarkontrollen "lektionsläget från Översikt visar alla händelser och lämnar inget urval kvar (#1139)".

Lärarstödet (docs/produkt/05-ux-oversikt.md, flöde 5) säger att en gammal länk utan `g=` visar alla händelser medan en bar länk börjar i Översikt, så att två elever kan se olika saker.

## Varför
Med Översikt som startvy ser en elev 3–5 händelser per år och kan tro att det är allt. "Viktigast" är ett värdeomdöme som motsäger sidans idé om samtidighet, och Lgr22 anger teman, inte händelser. De två lektionerna slog av minst ett lager och fick därför alla händelser som en bieffekt; en lektion med exakt Översikts fem lager hade fått en tunn Samtidigt. En uttrycklig regel gör att det inte beror på vilka lager en lektion råkar låsa. Tur måste återställa `tag` som Lektion, eftersom det strängaste läget bestämmer vid en utgång och en lektion alltid har en tur.

## Berör
`data/vyer.json`, `data/ui/*.json`, `index.html` (raden `#panel-tag-note`), `css/style.css`, `js/ui/panel.js`, `js/main.js`, `js/state.js` (`MODE_RULES`), `js/ui/lesson.js`, `js/ui/tour.js`, `tests/state.test.mjs`, `tests/panel.test.mjs`, `tests/webblasare.mjs`, `docs/arkitektur.md` (lägestabellen, adressfältet `g`), `docs/datamodell.md`, `docs/produkt/05-ux-oversikt.md`. Bygger på [2026-11-08-lagen](2026-11-08-lagen.md) (lägeskontraktet, #893) och Översikt som startvy (#868).
