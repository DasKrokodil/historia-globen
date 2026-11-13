# Tidsfönstret: avrundat tal med "±", och tonade markörer är "nära i tid"

**Datum:** 2026-11-12 (DasKrokodil i #1191)

## Beslut
1. Raden under årtalet visar fönstret som ett avrundat tal: till närmaste 5 under 30 år och annars till närmaste 10 (38 → 40, 72 → 70, cirka 11 → 10, 120 → 120). Samtidigt-panelen använder samma avrundade tal. Det som ritas använder fortfarande det exakta fönstret.
2. Raden är kort och skrivs med "±" som standard: "1300-talet · ±40 år". För yngre läsare skrivs den i ord: "1300-talet · även 40 år före och efter". Yngre läsare är en lektion för årskurs F-3 eller 4-6 och Samtidighetsjakten, samma avgränsning som beslutet om du-tilltal (2026-11-08).
3. Förklaringen att tonade markörer är nära i tid, inte samtida, står i radens `title` och som dold text för skärmläsare: "Tonade markörer hände upp till 40 år före eller efter. De är inte samtida, bara nära i tid."
4. Fönstret förblir en andel av tidslinjen. Det byts inte mot fasta jämna steg som 25 eller 50 år.

Det ersätter den del av beslutet 2026-11-09 (tidsfönster i vardagsspråk) där raden skrev "visar också det som hände N år före och efter" utan "±". Århundradet först, riktning i tid på etiketterna och resten av det beslutet gäller som förut.

## Varför
38 är en biprodukt av skalan, inte ett val, och såg därför slumpmässigt ut. Ett avrundat tal visar osäkerheten öppet i stället för falsk exakthet. Den långa raden blev tre rader på tyska. Fasta steg hade gett upp till 89 eller 143 händelser samtidigt, mot högst 49 i dag. Yngre elever kan läsa "±" som matematik.

## Berör
`js/model.js` (`roundWindow`), `js/controllers/render.js`, `js/ui/panel.js`, `index.html` (`#year-window-note`), `data/ui/*.json` (`time.windowYears`, `time.windowYearsWords`, `time.windowNote`), #1191, #994.
