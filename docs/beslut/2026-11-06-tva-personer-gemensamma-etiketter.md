# Två personer, gemensamma etiketter `redo` och `pågår`

**Datum:** 2026-11-06

## Beslut
Andreas (GitHub `Einzbeng`) blir medarbetare och kör egna agenter (Codex och Claude Code) vid sidan av Rikards (Claude Code, Codex och Copilot).

1. **Dirigent är bara Claude Code på Rikards konto.** Det är den som triagerar, sätter `redo`, skapar issues och slutgranskar. Andreas agenter är arbetare.
2. **Bara Rikard slår ihop**, beslutar och sköter publicering, releaser och hemligheter. Andreas får ingen åtkomst till Cloudflare, det privata repot för besökarnas förslag eller releaser.
3. **En gemensam `redo`** ersätter `codex: redo` och `copilot: redo`. Vilken agent som helst får ta ett `redo`-issue, men Codex och Copilot tar aldrig issues med fakta, data, källor, bilder eller riken (de tar Claude Code, Rikards eller Andreas). Ett tips om vilken agent som passar får stå i issuets text.
4. **En gemensam `pågår` plus tilldelning** ersätter `orkester: pågår`, `codex: pågår` och `copilot: pågår`. Den som tar ett issue skriver en kommentar med agent och konto, sätter `pågår`, tar bort `redo` och tilldelar issuet sin person. Tar två agenter samma issue gäller den första kommentaren. Grenens prefix (`claude/`, `codex/`, `copilot/`) visar agenten.
5. **Högst 4 öppna pull requests per person** (räknat på kontot som öppnade dem), alltså högst 8 totalt.
6. Etikettkontrollen varnar också när ett taget issue är tilldelat flera personer, och körs även när tilldelningen ändras. De gamla etiketterna räknas med tills de har döpts om i GitHub.

## Varför
En "redo"- och en "pågår"-etikett per agent och person skulle bli för många med två personer. Med en gemensam etikett och GitHubs eget tilldelningsfält syns direkt vem som äger ett issue, och regeln "ett issue, en ägare" blir densamma för alla. Gränsen per person gör att den enes agenter inte stoppar den andres. Granskningen är ändå Rikards Claude Code, och det är Rikard som slår ihop, så det finns en naturlig broms.

## Berör
`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.orchestra/project.md`, `.github/scripts/etikettkontroll.cjs`, `.github/workflows/etikettkontroll.yml`, `tests/etikettkontroll.test.mjs` och etiketterna i GitHub. Ersätter etikettdelarna i besluten 2026-10-31 (Codex), 2026-11-05 (Copilot, ett issue en ägare) och gränsen på fyra öppna pull requests totalt.
