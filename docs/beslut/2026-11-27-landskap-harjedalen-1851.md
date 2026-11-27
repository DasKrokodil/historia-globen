# Härjedalen som landskap (#1851)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Härjedalen byggs enligt mönstret från de tidigare landskapen.

## Byggt
- Platsen `harjedalen` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=harjedalen`. En del, 145 punkter, Norge som grannland. Namnet är "Härjedalen" på alla fem språk enligt Wikidata (Q207444). Härjedalen har ingen kust, så noten säger det.
- **Sydsamiska namnet:** svenska Wikipedia skriver att landskapet på sydsamiska kallas Härjedaelie. Det står i introtexten på alla fem språk. Wikidata har ingen sydsamisk etikett, så namnet bärs av en källa.
- Källor (öppnade 2026-11-27): Lex, svenska Wikipedia och Wikidata för landskapet. Store norske leksikons sida "Härjedalen" gäller kommunen och används inte. Åtta källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/harjedalen.json` (Natural Earth) och Ljusnedal (Q3257468, spanska etiketten saknas) ur Wikidata i `data/ortnamn-komplettering.json`.
- Inga `major` (tre händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (tre, kravet för landskap är tre)
Mätt före ändringen: noll. Efter: tre, en vardera i kultur, ekonomi och natur, i stenåldern (3000–2000 f.Kr.), 1600-talet och 1900-talet. Alla tre är `source-checked`, eftersom källorna skiljer sig för alla tre.

- **Hällmålningarna på Flatruet** (cirka 3000–2000 f.Kr.): svenska Wikipedia (tre sidor), Lex och Wikidata (Q10531434, bara punkten). **Källorna skiljer sig:** cirka 2000 f.Kr. (utan källa i artikeln), över 4 000 år, uppemot 5 000 år och "yngre stenålder". Spannet täcker uppgifterna, och skillnaden står i `note`. Uppgiften i artikeln om att målningarna kan ha beskjutits vid en ritual är inte med.
- **Kopparverket i Ljusnedal** (1685): svenska Wikipedia (Ljusnedal, Ljusnedals bruk och Härjedalen) och Wikidata (Q10568456, bara punkten). **Källorna skiljer sig** om året (1685 eller 1686) och om fyndplatsen (Mittåkläppen eller Ramundberget); det står i `note`. Sammanfattningen tar med att staten efter 1893 köpte egendomen för att säkra samernas renbete (svenska Wikipedia, Ljusnedals bruk).
- **Sonfjället blir nationalpark** (1909): svenska Wikipedia och Wikidata (Q691597, 24 maj 1909). **Källorna skiljer sig:** Lex anger 1910. Det står i `note`, och nivån höjs inte.

## Osäkert
- Konturens area är cirka 12 400 km². Källorna skiljer sig: svenska Wikipedia 11 954 km², Lex cirka 12 000 km², Wikidata 12 533 km².
- Härjedalens övergång till Sverige genom freden i Brömsebro 1645 är inte med som händelse: freden slöts i Brömsebro, utanför landskapet, och finns inte som händelse i projektet.
- Samernas historia i Härjedalen utöver Ljusnedal och namnet Härjedaelie är inte undersökt i öppnade källor; det är en lucka. Fornsök (app.raa.se) gick inte att nå från sessionen.
- Sveg (tingsplats sedan 1270-talet, järnvägen 1909/1924 där källorna skiljer sig), Funäsdalen, Fjällnäs och Tännäs är inte prövade fullt ut.
- Landskapsvapen är inte med.

## Berör
#1851, `data/platser.json`, `data/sources.json`, `data/handelser/fkr.json`, `data/handelser/1500-1799.json`, `data/handelser/1900-1945.json`, `data/ortnamn/harjedalen.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`.
