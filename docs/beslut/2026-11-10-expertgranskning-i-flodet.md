# Expertgranskning ingår i granskningen av pull requests

2026-11-10

**Beslut:** Språkexperterna (`sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`), `historiker`, `forhistoriker`, `geograf` och
`larare` används inte bara i planeringen före en milstolpe (`/milstolpe`) utan också vid slutgranskningen av pull requests
som rör deras område. Den som slutgranskar (Claude Code, dirigenten) kallar själv in experterna innan "godkänd" skrivs, och
Rikard behöver inte be om det. Vilka experter som kördes och vad de fann skrivs som kommentar i pull requesten. Experterna
ändrar inga filer och ersätter inte källkontrollen. Codex kan inte köra agenterna; i "Klar för Claude Code-granskning"
anger Codex därför vilka språk och vilken sorts fakta pull requesten rör.

**Motivering:** Experterna fanns bara i planeringen, så en färdig översättning eller faktabatch granskades av Codex och
Claude Code utan mottagarlandets öga eller historikerns. Frågor om språk, ton och namn upptäcks billigast när något är
byggt men inte slaget ihop. Att slutgranskaren kallar in dem gör att flödet är detsamma varje gång och inte hänger på att
någon minns att be om det.
