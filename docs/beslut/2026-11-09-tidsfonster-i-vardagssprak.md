# Tidsfönstret i vardagsspråk, med århundrade och riktning i tid

**Datum:** 2026-11-09 (#994, #995)

## Beslut
- Raden under årtalet skriver århundradet och fönstret i klartext: "1300-talet · visar också det som hände 38 år före och efter". I Fokus: "Följer <namn> · visar N år före och efter". Epoknamnen ur `SEGMENTS` används inte längre i raden.
- **Århundrade:** "1300-talet" är 1300–1399, i alla språk det 14:e århundradet (`XIVe siècle`, `siglo XIV`, `14. Jahrhundert`, `14th century`), enligt ordlistan för översättning. Före vår tideräkning räknas från 1 f.Kr.: 2901 f.Kr. ligger i "2900-talet f.Kr.". År 1–99 (och 99–1 f.Kr.) är "första århundradet"; 100-talet börjar år 100. Språkfilen väljer hur numret skrivs (`time.centuryStyle`).
- Etiketter på klotet och i Platt vy säger "N år före (år)" och "om N år (år)" i stället för "slut"/"börjar". Samtidigt-panelen säger "N år tidigare" och "N år senare". Avståndet räknas rakt av på astronomiska år, så 1 e.Kr. ligger ett år efter 1 f.Kr.
- Ordvalen `eventWindow` i `data/vyer.json` är borttagna; texterna ligger i `data/ui/`.
- Sök och följ behåller sitt bredare fönster men säger att det är bredare än det globen visar.

## Varför
"VISAR ±38 ÅR" förklarades ingenstans och epoknamnen var fel på flera ställen och inte översatta. Ett århundrade gäller hela världen. "slut 1912" om något som hände på en natt lästes som ett slutår.

## Öppet
Etikettprioritet (det som pågår ska få etikett först) är ett eget issue. Tidslinjens egna segmentnamn hör till #979.
