# Ersatta granskningsregler (gäller inte längre)

Den gamla ordalydelsen av de granskningsregler som ersattes 2026-11-23 ([beslutet](../beslut/2026-11-23-farre-granskningar-sparar-tokens.md), punkt 5 och uppgiften om kortare instruktionsfiler). Sparad bara för spårbarhet: **ingen agent ska följa texten nedan**. De nya reglerna står i [CLAUDE.md](../../CLAUDE.md) och [arbetssatt.md](arbetssatt.md).

Gammal text i AGENTS.md och .orchestra/project.md som ersattes av samma regler finns längre ned.

## 1. ingen separat granskning av Codex pull requests

**Gammal text (CLAUDE.md):**

> Claude Code granskar Codex pull requests innan Rikard slår ihop.

**Ersatt av:** (ingen ersättningstext, regeln utgår)

## 2. ingen separat Codex-granskning; Claude Codes granskning begränsad till arkitektur, säkerhet och functions/

**Gammal text (CLAUDE.md):**

> En annan Codex-körning granskar först varje pull request (diff, filkrockar, test, krav; "Codex-granskning: godkänd", beslut 2026-11-02). Claude Code granskar de pull requests som har kommentaren "Klar för Claude Code-granskning", och bara det som kräver dirigentens bedömning: källpolicy, arkitektur och hur det ser ut och fungerar för besökaren. Fakta, data och källor granskas alltid fullt. Svaret är "godkänd" eller konkreta, minimala arbetsorder i samma pull request, och bara Rikard slår ihop.

**Ersatt av:** Dirigenten granskar före ihopslagning bara arkitektur, säkerhet och `functions/`, och bara Rikard slår ihop (se "Granskning (beslut 2026-11-23)" ovan).

## 3. ingen separat Codex-granskning (omedelbar handoff utgår)

**Gammal text (CLAUDE.md):**

> ; (2) när en arbetare öppnar eller uppdaterar en pull request börjar den separata Codex-granskningen i samma tur, inte vid nästa heartbeat, CI-resultat eller statusfråga; (3) ett `pågår`

**Ersatt av:** ; (2) ett `pågår`

## 4. reglerna för flödet är nu två

**Gammal text (CLAUDE.md):**

> **Tre regler för flödet (beslut 2026-11-02):**

**Ersatt av:** **Två regler för flödet (beslut 2026-11-02, regel 2 om omedelbar handoff utgick 2026-11-23):**

## 5. ingen separat granskning av Copilots pull requests

**Gammal text (CLAUDE.md):**

> Copilots pull requests granskas som Codex: Claude Code granskar bara det som kräver dirigentens bedömning, fakta, data och källor alltid fullt, och bara Rikard slår ihop.

**Ersatt av:** Bara Rikard slår ihop.

## 6. ingen korsgranskning

**Gammal text (CLAUDE.md):**

> (4) Korsgranskning: en Claude Code eller Codex som inte byggde pull requesten får granska den på vilket konto som helst, och fakta, data och källor granskas fullt av en Claude Code som inte byggde den.

**Ersatt av:** (ingen ersättningstext, regeln utgår)

## 7. ingen korsgranskning av Andreas Claude Codes fakta och data per pull request

**Gammal text (CLAUDE.md):**

> , och Rikards Claude Code granskar dem fullt. Bara Rikard slår ihop.

**Ersatt av:** . Bara Rikard slår ihop.

## 8. granskning i batch före release av högst tre experter; ingen per-PR-granskning av fakta

**Gammal text (CLAUDE.md):**

> - **Expertgranskning före varje release (beslut 2026-11-10, [docs/beslut/2026-11-10-expertgranskning-fore-release.md](../beslut/2026-11-10-expertgranskning-fore-release.md)):** experterna ur `.claude/agents/` granskar inte varje pull request utan allt som ändrats sedan förra releasen, innan releasen publiceras. Dirigenten (Claude Code) kallar in dem utan att Rikard behöver be om det: `sprak-en`, `sprak-de`, `sprak-es` och `sprak-fr` (bara språk med ändringar; ton, tilltal enligt beslutet 2026-11-08, namn som mottagarlandet använder, enhetliga termer; de flaggar möjliga sakfel men rättar dem inte), `historiker` (och `forhistoriker` vid förhistoria och djup tid) för fakta, data, källor, turer och riken, `geograf` för platser och riken, `larare` för skolinnehåll och `ux-tillganglighet` för allt som ändrats i gränssnittet (dator- och mobilbredd; rapport i `docs/ux-review/`, beslut 2026-11-16, #1799). Resultatet blir en daterad rapport i `docs/granskningar/` och en kommentar i release-PR:en om vilka experter som kördes och vad de fann. Releasen publiceras inte förrän fynden är rättade eller Rikard har sagt att de får vänta. **Luckor (beslut 2026-11-10, [docs/beslut/2026-11-10-expertgranskning-luckor.md](../beslut/2026-11-10-expertgranskning-luckor.md)):** `historiker`, `forhistoriker`, `geograf` och `larare` letar också efter det som saknas inom sitt område, med öppnade källor och `tools/tackning.py` (aldrig minnet), och rapporterar det i en egen avdelning "Luckor (saknas)". Luckorna blir issues enligt vanliga regler och blockerar inte releasen. Experterna ändrar inga filer. **Per pull request** gäller bara den vanliga granskningen och källkontrollen: fakta, data och källor granskas fortfarande fullt av Claude Code i varje pull request (källpolicyn), och expertagenterna ersätter inte det. Är en enskild ändring stor eller riskabel (en ny tur, en ny språkfil, riken) får granskaren kalla in en expert redan då.

**Ersatt av:** - **Granskning av fakta före release (beslut 2026-11-23, ersätter expertgranskningen i [beslutet 2026-11-10](../beslut/2026-11-10-expertgranskning-fore-release.md)):** fakta, data och källor granskas i batch före varje release, inte per pull request, av högst tre experter ur `.claude/agents/` som dirigenten kallar in utan att DasKrokodil behöver be om det: (1) `historiker`, med `geograf` och `forhistoriker` vid behov (platser och riken; förhistoria och djup tid); (2) `ux-tillganglighet`, bara om gränssnittet ändrats (dator- och mobilbredd; rapport i `docs/ux-review/`, beslut 2026-11-16, #1799); (3) ett översättningspass (`sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`, bara språk med ändringar), bara om texter ändrats. Resultatet blir en daterad rapport i `docs/granskningar/` och en kommentar i release-PR:en om vilka experter som kördes och vad de fann. Releasen publiceras inte förrän fynden är rättade eller DasKrokodil har sagt att de får vänta. **Luckor (beslut 2026-11-10, [docs/beslut/2026-11-10-expertgranskning-luckor.md](../beslut/2026-11-10-expertgranskning-luckor.md)):** `historiker`, `forhistoriker` och `geograf` letar också efter det som saknas inom sitt område, med öppnade källor och `tools/tackning.py` (aldrig minnet), och rapporterar det i en egen avdelning "Luckor (saknas)". Luckorna blir issues enligt vanliga regler och blockerar inte releasen. Experterna ändrar inga filer.


---

# Gammal text ur AGENTS.md

## A1. ingen korsgranskning (AGENTS.md, Två personer, flera agenter)

**Gammal text:**

> Pull requests får granskas av en agent som inte byggde dem, på vilket konto som helst.

**Ersatt av:** (ingen ersättningstext, regeln utgår)

## A2. ingen separat Codex-granskning (AGENTS.md, Roller och signal)

**Gammal text:**

> När en pull request är byggd granskas den först av en **annan Codex-körning än den som byggde** (Codex-granskning, beslut 2026-11-02): diff, filkrockar, att bygget och hela webbläsartestet är gröna, att kraven i issuet och i dirigentens order är uppfyllda, och dokumentation och beslut. Granskaren skriver kommentaren **"Codex-granskning: godkänd"** eller konkreta, minimala arbetsorder, alltid som kommentar i pull requesten på GitHub och aldrig bara i chatten (se [Granskar du åt Rikard](codex-regler.md#granskar-du-åt-rikard-eller-claude-code-lämna-alltid-en-kommentar-beslut-2026-11-07), punkt 7–9), och byggaren rättar i samma pull request. Först därefter skriver Codex **"Klar för Claude Code-granskning"**. Expertagenterna (språk, historiker, geograf, lärare) granskar inte varje pull request utan körs av Claude Code före varje release (beslut 2026-11-10); Codex kör dem inte själv. Claude Code granskar bara pull requests med den kommentaren, och bara det som kräver dirigentens bedömning: källpolicy, arkitektur och hur det ser ut och fungerar för besökaren (en körning och en skärmbild). Pull requests med fakta, data eller källor granskas alltid fullt av Claude Code. Svaret är antingen "godkänd" eller konkreta, minimala arbetsorder i samma pull request. Ingen slår ihop utom Rikard.

**Ersatt av:** **Granskning (beslut 2026-11-23):** ingen separat Codex-granskning och ingen korsgranskning. Dirigenten granskar före ihopslagning bara arkitektur, säkerhet och `functions/`; fakta granskas i batch före release av högst tre experter (se CLAUDE.md). Ingen slår ihop utom Rikard.

## A3. reglerna för flödet är nu två

**Gammal text:**

> **Tre regler för flödet (beslut 2026-11-02, riskbaserat från 2026-11-03):**

**Ersatt av:** **Två regler för flödet (beslut 2026-11-02, riskbaserat från 2026-11-03; regel 2 om omedelbar handoff utgick 2026-11-23):**

## A4. ingen separat Codex-granskning (omedelbar handoff utgår)

**Gammal text:**

> 2. **Omedelbar handoff.** När en arbetare öppnar eller uppdaterar en pull request börjar den separata Codex-granskningen i samma tur, inte vid nästa heartbeat, CI-resultat eller statusfråga.
3. **Ingen passiv

**Ersatt av:** 2. **Ingen passiv

## A5. ingen separat Codex-granskning av den andras pull requests

**Gammal text:**

> (2) gör Codex-granskningen av den andra personens pull requests, så att de blir klara för slutgranskning snabbare; (3) förbered

**Ersatt av:** (2) förbered

## A6. följdändring av numreringen

**Gammal text:**

> ; (4) analyser som rapport

**Ersatt av:** ; (3) analyser som rapport

## A7. ingen separat granskning av varje pull request

**Gammal text:**

> - **Claude Code granskar** varje pull request, och bara Rikard slår ihop.

**Ersatt av:** - Bara Rikard slår ihop.

## A8. granskning begränsad till arkitektur, säkerhet och functions/

**Gammal text:**

> - Claude Code granskar pull requesten (diff, webbläsartest, skärmbilder) innan Rikard slår ihop. Svara på granskningen i pull requesten.

**Ersatt av:** - Dirigenten granskar före ihopslagning bara arkitektur, säkerhet och `functions/` (beslut 2026-11-23). Svara på eventuell granskning i pull requesten.

## A9. den vanliga Codex-granskningen (punkt 7–9) utgår

**Gammal text:**

> 7. **Gäller alltid den vanliga Codex-granskningen (beslut 2026-11-10, [docs/beslut/2026-11-10-codex-granskning-kommentar.md](../beslut/2026-11-10-codex-granskning-kommentar.md)).** Granskar du en pull request som en annan Codex-körning har byggt ska resultatet stå som kommentar **i pull requesten på GitHub**. Det räcker aldrig att skriva det i chatten eller i terminalen. Det gäller även när granskningen bara blev "godkänd" utan anmärkningar, och även när du själv rättar något efteråt.
8. **Kontrollera att kommentaren finns.** Läs pull requestens kommentarer igen direkt efter att du har skrivit den och se att den syns. Skriv inte "Klar för Claude Code-granskning" förrän kommentaren "Codex-granskning: godkänd" finns i pull requesten. Efter rättningar skrivs en ny kommentar ("Codex-granskning: godkänd efter rättning"), inte bara en ny push.
9. **Kommentaren ska ha fast innehåll:** rubriken ("Codex-granskning: godkänd" eller "synpunkter"), vad som kontrollerades (diff, filkrockar, test, krav i issuet, dokumentation och beslut, översättningar, källor), vad som inte kunde kontrolleras, och eventuella arbetsorder som numrerad lista.

**Ersatt av:** (ingen ersättningstext, regeln utgår)


---

# Gammal text ur .orchestra/project.md

## P1. ingen separat Codex-granskning (project.md, Codex)

**Gammal text:**

> För Codex pull requests gäller i stället: Codex-förgranskning efter att pull requesten öppnats, därefter Claude Codes beslut ("godkänd" eller arbetsorder) och sist Rikards merge. Samma diff och samma verifieringsbevis återanvänds, ingen del granskas två gånger.

**Ersatt av:** För Codex pull requests gäller i stället beslutet 2026-11-23: ingen separat Codex-granskning, och dirigenten granskar före ihopslagning bara arkitektur, säkerhet och `functions/`; sist Rikards merge.

## P2. ingen separat Codex-granskning (project.md, Codex)

**Gammal text:**

> En annan Codex-körning granskar
  först varje pull request ("Codex-granskning: godkänd"). Claude Code granskar därefter bara de som Codex har märkt "Klar för Claude Code-granskning", och bara det som kräver dirigentens bedömning (källpolicy, arkitektur, synligt resultat); fakta, data och källor granskas alltid fullt.

**Ersatt av:** Ingen separat Codex-granskning (beslut 2026-11-23): dirigenten granskar före ihopslagning bara arkitektur, säkerhet och `functions/`.

## P3. ingen separat Codex-granskning (omedelbar handoff utgår)

**Gammal text:**

> (2) Omedelbar
  handoff: när en arbetare öppnar eller uppdaterar en pull request börjar den separata Codex-granskningen i samma tur.
  (3) Ingen passiv

**Ersatt av:** (2) Ingen passiv

