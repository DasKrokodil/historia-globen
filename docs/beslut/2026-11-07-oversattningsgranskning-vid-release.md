# Större språkgranskning med en starkare modell vid release (#63, #676)

**Datum:** 2026-11-07 (Rikard godkände förslaget samma dag)

## Beslut
1. **Vid en release** som innehåller nya eller omgjorda översättningar gör Codex en större språkgranskning med en starkare modell än den som används i den löpande korsgranskningen. Den löpande korsgranskningen i varje pull request (beslut 2026-11-05) står kvar.
2. **Tidpunkt:** granskningen görs en gång för hela releasen, helst när alla fyra språken (engelska, tyska, spanska och franska) finns, inte efter varje språk.
3. **Innehåll:** tre kontroller. (a) Tidsangivelser: århundraden och årtusenden, f.Kr. och e.Kr. (svenskans "1700-talet" är det 18:e århundradet). (b) Namn och platser: etablerade namn på målspråket, och inga nya fakta. (c) Siffror och påståenden är oförändrade mot svenskan.
4. **Stickprov mot källan:** ett urval texter jämförs också med händelsens källor, så att sakfel som redan finns i svenskan upptäcks. Sådana fynd blir issues med `faktafel` och `källkontroll`, de rättas inte i översättningens pull request.
5. **Rapport, inte ändringar:** Codex rapporterar bara verifierbara fel (filnamn, rad, originaltext, översättning, förslag), ändrar inga filer och gör ingen stilgranskning. Claude Code rättar fynd på nivån Fel och slutgranskar. Bara Rikard slår ihop.
6. Rapporten skrivs i release-PR:en (#150, del C) och är ett steg i releasekontrollen i `docs/DEPLOYMENT.md`.

## Varför
Korsgranskningen av engelskan (PR #724) hittade fel som annars hade släppts ut: felaktigt omräknade århundraden, ett hål i spärren mot inaktuella översättningar och sakfel i den svenska grunden. En starkare modell i ett enda stort pass vid release är billigare än att köra den för varje språk och period, och den passar att göra när hela uppsättningen finns.

## Berör
`docs/DEPLOYMENT.md` (Release), `CLAUDE.md`/`AGENTS.md` (korsgranskningen, oförändrad). Bygger på [2026-11-06-oversatt-samtidigt.md](2026-11-06-oversatt-samtidigt.md).
