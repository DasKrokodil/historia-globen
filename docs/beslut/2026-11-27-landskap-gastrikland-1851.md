# Gästrikland som landskap (#1851)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Gästrikland byggs enligt mönstret från de tidigare landskapen.

## Byggt
- Platsen `gastrikland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=gastrikland`. En del, 211 punkter. Namn, introtext och not på fem språk. Namnen är Wikidatas etiketter (Q183459, landskap i Sverige): Gästrikland (sv, en, de, fr), Gestricia (es).
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och nio källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/gastrikland.json` (Natural Earth) och Edsken (Q2955468) och Björke (Q3283732) ur Wikidata i `data/ortnamn-komplettering.json`; spanska etiketter saknas och står som `fallback`.
- Inga `major` (fyra händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (fyra, kravet för landskap är tre)
Mätt före ändringen: noll. Efter: fyra, en vardera i kategorierna människan, civilisationer, vetenskap och katastrofer, i 200-talet (spann till 300-talet), 1400-talet och två i 1800-talet.

- **Björkebåten** (cirka 250–390, `source-checked`): svenska Wikipedia (Björkebåten), svenska Wikipedia (Gästrikland) och Wikidata (Q879501). **Källorna skiljer sig:** båtens sida anger cirka 320 e.Kr. ±70 år efter kol 14, landskapets sida 400 e.Kr. och Wikidata 400-talet. Spannet följer båtens sida, och skillnaden står i `note`. Punkten är tätorten Björke, inte den exakta fyndplatsen (står också i noten).
- **Gävle får stadsprivilegier** (1446, `two-sources`): svenska och engelska Wikipedia och Wikidata (Q25748). Wikidatas årtal är importerat från Wikipedia, så den är inte helt oberoende. Att privilegierna kom från Kristofer av Bayern står bara på engelska Wikipedia, och texten säger det.
- **Bessemerstål i Edsken** (18 juli 1858, `source-checked`): svenska Wikipedia (Edsken) och engelska Wikipedia (Göran Fredrik Göransson) anger samma dag; Wikidata har inget datum.
- **Gävle brinner** (10 juli 1869, `source-checked`): datumet bara från svenska Wikipedia (årtalssidan 1869); året, omfattningen (norr om Gavleån, omkring 8 000 av cirka 10 000 hemlösa) och den nya stadsplanen från svenska och engelska Wikipedia (Gävle).

## Osäkert
- Konturens area är cirka 4 500 km², cirka 8 % över Store norske leksikon, Lex och svenska Wikipedia (4 181 km²); Wikidata anger 4 215 km². Troligen ingår sjöyta (antagande).
- Sandvikens grundande är inte med: svenska Wikipedia om Göransson anger både 1861 och 1862.
- Gävle–Dala järnväg, Högbo, Hofors bruk och Järbo är inte prövade mot källor.
- Samiska eller andra namn och landskapsvapen är inte med: ingen öppnad källa i den här körningen bär dem för Gästrikland.

## Berör
#1851, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1800-1899.json`, `data/ortnamn/gastrikland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`.
