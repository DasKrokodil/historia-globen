# Mindre årtal på liggande telefon (#2221)

**Datum:** 2026-11-22 (DasKrokodil, svar i #2221: "Gör enligt rekommendationen")

## Beslut

På liggande pekskärm (`max-height: 480px`, liggande, `pointer: coarse`) är det stora årtalet i huvudet 42 px i stället för 56 px. Växlarens knappar behåller sina 44 px höga tryckytor (#2153). Gäller inte i tur, lektion och Fokus, som har egna regler för årtalet.

## Varför

Med 44 px i växlaren blev tidsraden 16 px högre. Den växer nerifrån och upp, och stegknapparna hamnade då över raden under årtalet ("50 000 f.Kr. · även 10 000 år före och efter"), som inte gick att läsa. Tryckytorna är ett tillgänglighetskrav, och raden under årtalet förklarar "samtidigt", så det är årtalet som får ge plats. På 360 px höjd är 42 px fortfarande stort och läsbart.

Alternativen var att dölja raden under årtalet på liggande telefon (B) eller att göra växlarens knappar lägre igen (C).

## Berör

`css/style.css` (blocket för liggande pekskärm från #2153), `docs/arkitektur.md` (Växlaren, #1959).
