# Färre granskningar för att spara tokens (2026-11-23)

**Beslut (DasKrokodil, 2026-11-23):** granskningskedjan kortas och instruktionsfilerna görs kortare, för att minska tokenåtgången. Källpolicyn för den som skriver är oförändrad: aldrig fakta ur minnet, och källan öppnas innan `source-checked`.

**Motivering:** att spara tokens. Instruktionsfilerna läses av varje agent och underagent vid varje start, och granskningskedjan har haft flera steg per pull request.

## Punkt 1: ingen korsgranskning och ingen separat Codex-granskning

En pull request granskas inte av en andra agent efter bygget. "Codex-granskning: godkänd", "Klar för Claude Code-granskning" och korsgranskningen i Andreas utökade roll (beslut 2026-11-11) utgår. Reglerna om att en uttrycklig granskning alltid kvitteras med en kommentar (beslut 2026-11-07) gäller när DasKrokodil ber om en granskning.

## Punkt 2: fakta granskas i batch före release

Fakta, data och källor granskas inte per pull request utan i batch före varje release, av högst tre experter ur `.claude/agents/`: `historiker` (med `geograf` och `forhistoriker` vid behov), `ux-tillganglighet` bara om gränssnittet ändrats, och ett översättningspass (`sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`) bara om texter ändrats. Resultatet blir en daterad rapport i `docs/granskningar/`, och releasen publiceras inte förrän fynden är rättade eller DasKrokodil har sagt att de får vänta. `larare` ingår inte längre. Ersätter [expertgranskningen före varje release (2026-11-10)](2026-11-10-expertgranskning-fore-release.md).

## Punkt 3: dirigenten granskar bara arkitektur, säkerhet och `functions/`

Före ihopslagning granskar dirigenten (Claude Code) bara arkitektur, säkerhet och `functions/`. Bara DasKrokodil slår ihop.

## Punkt 4: genomförd CI-ändring

Mätning av körning 45064957726: varje jobb kör testet i 10–19 minuter och uppstarten tar cirka 40 sekunder, så att slå ihop jobb sparar inget. Ändringen gäller därför hur ofta sviten körs: ingen körning vid varje push till main (nattlig körning och `workflow_dispatch` i stället), Firefox och WebKit på söndagar eller på begäran i stället för vid varje release-PR, och ingen körning för ändringar som bara rör dokumentation. Rött i ostadiga kontroller (#1174) rättas i sina issues; ett eget icke-blockerande jobb görs först när det finns en lista över vilka kontroller som är ostadiga. Observera: har main grenskydd som kräver kontrollen "Webbläsartest" blir en docs-only-PR hängande på väntande kontroll; ta då bort kravet eller säg till.

## Punkt 5: korta ner instruktionsfilerna

`CLAUDE.md` (cirka 73 kB), `AGENTS.md` (cirka 34 kB) och `.orchestra/project.md` (cirka 22 kB) läses av varje agent och underagent, alltså cirka 35 000 tokens per start. Målet är CLAUDE.md under cirka 15 kB, AGENTS.md under cirka 10 kB och `.orchestra/project.md` under cirka 8 kB. Metoden är att **flytta, inte radera**: allt som tas bort ur en instruktionsfil ligger kvar under [docs/referens/](../referens/README.md), med länk från kärnan. De absoluta förbuden står kvar överst (aldrig fakta ur minnet, aldrig pusha till `main`). Inga regler ändras i sak, utom granskningsreglerna i punkt 1–3. Genomfört i pull request [#2232](https://github.com/DasKrokodil/historia-globen/pull/2232); den gamla ordalydelsen av de ersatta granskningsreglerna står i [docs/referens/ersatta-granskningsregler.md](../referens/ersatta-granskningsregler.md).
