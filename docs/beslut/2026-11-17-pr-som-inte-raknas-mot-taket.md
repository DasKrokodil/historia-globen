# Pull requests som inte räknas mot taket på fyra

2026-11-17

**Beslut (DasKrokodil):** Gränsen på högst 4 öppna pull requests per person (beslutet 2026-11-06) gäller inte pull requests som **bara** ändrar något av det här:

1. **Webbläsartest och andra prov:** filer under `tests/`.
2. **Dokumentation:** `docs/`, README.md, CLAUDE.md, AGENTS.md, `.orchestra/` och kommandon i `.claude/`.
3. **Överlämningar:** rapporter i `docs/granskningar/` och `docs/ux-review/`, `docs/granskningar/handoff.json` och beslutsfiler i `docs/beslut/`.

En pull request som **också** ändrar kod (`js/`, `functions/`, `tools/`), data (`data/`), gränssnittstext, CSS eller bilder räknas som vanligt. "En ändring som byggs räknas som öppen" gäller likadant: ett pågående arbete som bara blir ett prov eller ett dokument räknas inte.

**Oförändrat:** krockreglerna (ingen tar ett issue som ändrar samma filer som en öppen PR, med undantagen från 2026-11-09), att bara DasKrokodil slår ihop, och granskningen (fakta, data och källor granskas fullt av en annan Claude Code; ett prov eller ett dokument granskas som förut). Håll dessa pull requests små, så att de går att slå ihop snabbt. Ingen automatisk kontroll räknar pull requests (etikettkontrollen gör det inte), så ändringen är en regel för agenterna.

**Motivering:** Röda webbläsarprov, rapporter och överlämningar blockerade nya byggen trots att de inte ändrar vad besökaren ser. De tar liten tid att slå ihop och ska inte konkurrera med bygg-PR:er om de fyra platserna.
