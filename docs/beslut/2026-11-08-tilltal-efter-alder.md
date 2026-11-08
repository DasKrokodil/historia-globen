# Tilltal efter ålder: du-form till och med 13 år, annars artigt tilltal

**Datum:** 2026-11-08 (Rikard bekräftade regeln samma dag; den nämndes först i release-PR:en #870 och i #876)

## Beslut
1. **Artigt tilltal** (`Sie`, `usted`, `vous`) är regeln i alla språk, enligt beslutet 2026-11-07 ([2026-11-07-artigt-tilltal.md](2026-11-07-artigt-tilltal.md)). Det gäller gränssnittet och texter som riktar sig till vuxna läsare och till elever över 13 år (lektion 1, åk 7–9).
2. **Undantag: du-form** (`du`, `tú`, `tu`) i alla språk i texter som riktar sig till elever **till och med 13 år**: Samtidighetsjakten (`hunt.*`), lektion 2 (åk 4–6) och uppdragstexterna.
3. Texter som inte tilltalar läsaren (händelser, fakta) skrivs opersonligt, som förut.
4. En ny text väljer tilltal efter vem den riktar sig till, inte efter språk. Tyska `hunt.region` är därför `du`.

## Varför
Yngre elever blir främmande inför `Sie`, `usted` och `vous`, medan en vuxen läsare eller en äldre elev förväntar sig artigt tilltal. Att välja efter åldern håller språken lika i varje text utan att jaga en enda form genom hela gränssnittet.

## Berör
`docs/ordlista-oversattning.md` (avsnitt 1), CLAUDE.md (Språk), AGENTS.md. #839 (artigt tilltal på de, es och fr) bygger på det äldre beslutet och ska skrivas om mot det här. PR #876 ändrade redan åtta spanska gränssnittstexter, lektion 1 och tyska `hunt.region` enligt regeln.
