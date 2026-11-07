# Artigt tilltal i alla språk (#808)

**Datum:** 2026-11-07 (Rikard)

## Beslut
1. Alla språk som tilltalar läsaren gör det artigt: tyska `Sie`, spanska `usted`, franska `vous`. Det är samma nivå på alla tre.
2. Gäller gränssnittet och alla texter som riktar sig till läsaren (turer, frågor, quiz, uppdrag, lärarfält, hjälptexter).
3. Stilreglerna, tidsangivelserna och ordlistan för spanska och franska står i [docs/ordlista-oversattning.md](../ordlista-oversattning.md). Nya termer läggs till där i samma pull request som de används.
4. **Befintliga texter som avviker rättas** i ett eget issue: `data/ui/de.json` (informellt `du`), `data/ui/es.json` (informellt `tú`) och `hunt.region` i `data/ui/fr.json` (`tu`).

## Varför
Sidan används i skolan och av en bred publik. Ett artigt tilltal passar en källkontrollerad faktasida, och ett gemensamt val gör att språken låter likadant och att översättarna inte behöver välja i varje fil. Rikard ville att spanska och franska följer tyskans `Sie`.

## Berör
`docs/ordlista-oversattning.md`, `CLAUDE.md` (Språk), `data/ui/de.json`, `data/ui/es.json`, `data/ui/fr.json` och översättningsissuerna #776–#835.
