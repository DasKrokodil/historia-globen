# Fältrapport till upstream (#412)

Datum: 2026-11-05. Skriven av Claude Code (dirigenten) på uppdrag av Rikard.

**Varför en fil här och inte ett issue hos Olof:** upstream (`solwation/dirigenten-och-orkestern`, `CONTRIBUTING.md`, avsnittet *Field reports*) vill ha fältrapporter som **ett issue i upstream-repot** med mallen `field-report.md`, inte som pull request. Den här sessionen kan läsa upstream men inte skriva där: GitHub svarar att sessionen saknar skrivrätt (`push_denied`) och att GitHub-verktygen inte täcker repot. Varken ett issue eller en pull request kunde alltså skapas härifrån. Texten nedan är därför färdig att klistra in.

**Så gör Rikard:** öppna https://github.com/solwation/dirigenten-och-orkestern/issues/new/choose, välj mallen *Field report* och klistra in texten mellan strecken (rubrik och brödtext). Texten är på engelska som upstreams filer och innehåller inga namn eller privata uppgifter.

Underlag: Codex fältrapporter i #412 (2026-11-01 och 2026-11-02), resurspolicyn i `.orchestra/project.md` (beslut 2026-10-31) och orkesterpasset 2026-11-05 (pull requests #593, #595 och uppdelningen av `main.js` i #402). Upstream läst vid `5a67f02` (v0.8.2).

---

**Title:** Field report: Historia-globen, November 2026

## Project and runtime

- Project: Historia-globen, a public hobby project (https://github.com/DasKrokodil/historia-globen): a static web app (plain ES modules, no build step) with JSON data under strict source rules, run by a non-developer project lead who merges every PR.
- Runtime: Claude Code in a cloud container (GitHub MCP tools, `gh` only for search, git worktrees, no subagents used in the latest pass). Codex runs the same orchestra through `AGENTS.md` and works its own label queue; GitHub Copilot was added 2026-11-05 with its own label. One issue has one owner across all agents.
- Installed version: v0.7.0 (`2bd0021`) via `git subtree`. Host settings changed: PR mode (the user merges), a pass delivers at most four PRs (normally two or three), one worker by default, a context map instead of "read everything first", risk-based test levels, a pause after an early defect, and a shared lock file for browser tests.
- Volume and period: 2026-10-31 to 2026-11-05. Codex posted seven field reports in this period, each pass with one or two workers and at most two PRs. The Claude Code passes on 2026-11-05 delivered four PRs with no workers (conductor alone).

## What worked

- **One worker by default, conductor review always.** Workers were added only for independent deliveries. Conductor review still found real defects in about half of the deliveries in the first passes (an inaccessible control and an empty focus target in one Codex PR, a frozen animation in another) and one wording mismatch on 2026-11-05. Keeping review mandatory while cutting team size paid off. (`.orchestra/project.md`, *Resurspolicy*, 2026-10-31)
- **Own checkout and own port per writer.** Three checkouts ran side by side on 2026-11-05 (the change, a pristine baseline for before/after screenshots, and a docs-only branch) with no cross-contamination. Codex reported the same for parallel workers. (v0.7.0 `ORCHESTRA.md`, *Isolate concurrent agents*)
- **One lock file for the expensive browser suite** (`flock <lock> node test.mjs <port>`): parallel work, serial browser runs, no competing test processes after it was introduced.
- **A context map** (which sections to read for which label or path) replaced reading the whole rulebook; workers and conductor read the core plus the matched sections and searched long references instead of reading them.

## Where work was lost

- **Edits during a running verification.** On 2026-11-05 the conductor changed a UI string in the checkout while the full browser suite was running against that checkout's server. The test process had the old string loaded, so one check failed falsely and had to be rerun. (v0.7.0 `ORCHESTRA.md`, *Verification*: "Bind results to revision")
- **Browser suite without a server, and two suites at once.** Codex's first run started the suite without its local server, and two concurrent runs competed for the same resources; both had to be rerun one at a time. (Codex field report 2026-11-01; v0.7.0 `ORCHESTRA.md`, *Isolate concurrent agents*)
- **Branches behind main.** Two Codex branches fell behind main during review; both were retested after updating. Cheap, but a recurring cost. (Codex field report 2026-11-01)
- **Binary files without a push path.** One image delivery was finished and verified, but the runtime could not push binary files, so no PR was opened and the work waited. (Codex field report 2026-11-01; environment, not a rule)
- **Field report without write access.** The conductor could prepare this report but could not open it as an issue upstream (no write access for an unattached repository), so the user has to post it by hand. (v0.8.2 `CONTRIBUTING.md`, *Field reports*)

## Suggestions

- `ORCHESTRA.md`, *Verification* (v0.8.2):
  Change: add "Do not change a checkout while a long verification runs against it; a run that spans an edit is no evidence for either revision. Edit in another checkout, or rerun the affected checks."
  Problem prevented: false failures and false passes from evidence that mixes two revisions.
- `ORCHESTRA.md`, *Choose the smallest useful team* (v0.8.2):
  Change: add "If review finds a material correction in one of the first two deliveries of a pass, start no new similar assignments until the cause is in the brief, the context map or the required checks."
  Problem prevented: the same defect repeated across parallel workers before anyone notices.
- `ORCHESTRA.md`, *Read map*, or `PROJECT.example.md` (v0.8.2):
  Change: offer an optional host "context map": per label, path or topic, which sections to read; long references are searched, not read; the brief names the map rows that apply.
  Problem prevented: workers reading the whole rulebook (or too little) for routine tasks.
- `WORKER.md`, *Rules for the worker*, Isolation (v0.8.2):
  Change: "Before a browser or server-backed suite, start your own server on your assigned port, confirm it serves your checkout, and take the shared lock for expensive suites."
  Problem prevented: suites run against no server, the wrong checkout, or in competition with another worker.
- `CONTRIBUTING.md`, *Field reports* (v0.8.2):
  Change: "If the consumer's conductor cannot open an issue here, it gives the user the report as ready-to-paste text in the template's headings."
  Problem prevented: reports that stall because the runtime lacks write access upstream.

---

## Att notera för Rikard

- **Upstream har gått vidare:** vi har v0.7.0, upstream är på v0.8.2 (2026-11-05). Bland annat finns nu en kö för färdigt arbete som väntar på integration (0.8.0) och kortare instruktioner (0.8.2). Att uppgradera är frivilligt och kräver ditt ok (`.orchestra/shared/INSTALL.md`).
- **Tidigare rapport:** upstream har redan tagit in förslag från vår första fältrapport (upstreams issue 27, 2026-10-30). Rapporten som skrevs 2026-11-02 verkar aldrig ha lagts in; den här ersätter den.
- **Utvärderingen av resurspolicyn** (försöket på 10–20 issues) har ingen sammanställd siffra för andelen rättningar per pass. Rapporten säger därför bara det som står i fältrapporterna och passens rapporter, inte att kvaliteten är uppmätt.
