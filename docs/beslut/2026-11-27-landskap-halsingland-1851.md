# Hälsingland som landskap (#1851)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Hälsingland byggs enligt mönstret från de tidigare landskapen.

## Byggt
- Platsen `halsingland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=halsingland`. En del, 305 punkter. Namn, introtext och not på fem språk. Namnen är Wikidatas etiketter (Q206564, landskap i Sverige): Hälsingland (sv, en, de, fr), Helsingia (es).
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och tolv källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/halsingland.json` (Natural Earth, som saknar Hudiksvall) och Hudiksvall (Q642964) och Järvsö (Q2367619, spanska etiketten saknas) ur Wikidata i `data/ortnamn-komplettering.json`.
- Inga `major` (fyra händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (fyra, kravet för landskap är tre)
Mätt före ändringen: noll. Efter: fyra, två i civilisationer och en vardera i krig och kultur, i 900-, 1500-, 1700- och 2000-talet.

- **Forsaringen** (900-talet, `source-checked`): svenska Wikipedia och Wikidata (Q10498077, bara punkten; ingen datering). **Källorna skiljer sig:** de flesta forskare säger 900-talet, men Bugge (1877) och Löfving (2010) har föreslagit medeltiden. Det står i `note`, liksom att det är omtvistat om böterna gick till kyrkan eller ett hedniskt vi.
- **Hudiksvall grundas** (1582, `source-checked`): svenska och engelska Wikipedia. **Källorna skiljer sig:** svenska Wikipedia om Hudiksvalls stad och Wikidata anger stadsprivilegier den 10 november 1581. Det står i `note`.
- **Ryssarna bränner Hudiksvall** (1721, `source-checked`, `partOf: "stora-nordiska-kriget"`): svenska Wikipedia (Rysshärjningarna och Hudiksvall), engelska Wikipedia (Hudiksvall) och Wikidata (Q3428126, del av stora nordiska kriget). Bara året är belagt för Hudiksvall. Händelsen hör till kriget, så krigsområdet ritas nu också runt Hudiksvall.
- **Hälsingegårdar blir världsarv** (1 juli 2012, `two-sources`): svenska och engelska Wikipedia (samma dag) och Wikidata (Q1642003, världsarv från 2012). Punkten är Wikidatas, gården Kristofers vid Järvsö; världsarvet är sju gårdar på flera orter. Unescos sida gav 403.

## Osäkert
- Konturens area är cirka 15 200 km², cirka 7 % över Store norske leksikon, Lex och svenska Wikipedia (14 264 km²); Wikidata anger 14 270 km². Troligen ingår sjöyta (antagande).
- Dellen (nedslagskrater, 89–110 miljoner år enligt källorna, som skiljer sig) ligger utanför tidslinjen, som börjar för cirka en miljon år sedan, och är inte med.
- Hälsingelagen (nedtecknad omkring 1320) har ingen naturlig punkt, och Söderhamn (1620) har bara en öppnad källa; båda är utelämnade.
- Samiska eller andra namn och landskapsvapen är inte med: ingen öppnad källa i den här körningen bär dem för Hälsingland.

## Berör
#1851, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1980-.json`, `data/ortnamn/halsingland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`.
