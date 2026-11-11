# Modellrekommendation innan ett issue påbörjas

**Datum:** 2026-11-11

## Beslut
Innan en agent börjar bygga ett issue ger den en rekommendation om vilken modellnivå som passar, och den skiljer på agent:

- **Claude Code:** nivån följer "Modellnivå för Claude Code" i CLAUDE.md. Fakta, data, källor, riken, bilder och datamodell: Opus. Större ändringar i gränssnitt, tidslinje och rendering: Sonnet high. Triage, etiketter och normal granskning: Sonnet medium.
- **Codex och Copilot:** nivån följer [2026-11-10-codex-modellniva.md](2026-11-10-codex-modellniva.md). Vanliga UI-, CSS-, test- och dokumentationsissues och `översättning`: standardmodell med medelstor resonering. Större ändringar i tidslinje, rendering eller tillstånd: starkaste modellen med hög resonering. Issues med fakta och data tar Codex och Copilot inte alls; de är för Claude Code.

Rekommendationen skrivs som en rad i kommentaren "… tar det här" och sägs i chatten till den som kör agenten, före första ändringen: "Modellnivå: Opus, för att issuet skriver fakta och källor." Passar inte nivån den agent som körs (till exempel Sonnet på ett faktaissue) stoppar agenten och ber användaren byta, i stället för att börja. Dirigenten får lägga en rad "Modellnivå: …" i byggordern när `redo` sätts.

Agenten byter aldrig modell själv. Användaren byter: Claude Code med `/model`, Codex i sina egna inställningar. Rekommendationen är ett förslag och ändrar ingen regel om vem som får ta vilket issue.

## Varför
Modellnivån avgjordes tidigare per uppgiftstyp men sades inte till den som startar ett issue. Då startar faktaarbete lätt på en för svag modell, och enkla issues på en onödigt dyr.

## Berör
CLAUDE.md (Etiketterna `redo` och `pågår`, punkt 2) och AGENTS.md (Modellnivå). Ändrar inga etiketter och ingen arbetsfördelning.
