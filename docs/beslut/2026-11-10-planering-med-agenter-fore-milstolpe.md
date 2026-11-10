# Planering med agenter före varje milstolpe

2026-11-10

**Beslut:** Innan en milstolpe påbörjas görs en planering i två steg (kommandot `/milstolpe`, `.claude/commands/milstolpe.md`):
(1) en kort analys av vilka agenter som behövs, (2) de valda agenterna går igenom milstolpens issues från sina perspektiv
och dirigenten samlar det i en daterad rapport i `docs/granskningar/`. Rikard får planen före bygget. Ingenting byggs
och inga issues skapas förrän han har godkänt den.

Nya agenter i `.claude/agents/`: `historiker`, `ux-tillganglighet`, `arkitekt`, `larare` (granskar fakta och källor), `geograf` (platser, gränser, täckning) och en
språk- och mottagarlandsexpert per översättningsspråk: `sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`. Svenska är
källan och har ingen egen expert. Linserna 13 (geograf) och 14 (språk) är tillagda i
`docs/produkt/06-granskningsperspektiv.md`; lins 8 (historiker) fanns redan och har nu en agent.

**Nya roller:** steg 1 analyserar också om milstolpen behöver en expertroll som saknas bland agenterna och linserna. Förslaget skrivs i rapporten; en ny agent skapas först när Rikard har godkänt den.

**Gränser:** agenterna ändrar inga filer och rapporterar bara. Källpolicyn gäller fullt: aldrig fakta ur minnet, och
språkexperter rättar inte fakta utan flaggar möjliga sakfel till historikern. Agenterna ersätter inte Codex-granskningen
eller dirigentens slutgranskning. De är ett tidigt steg som flyttar frågorna före bygget.

**Motivering:** frågor om fakta, platser och översättning upptäcks billigare i planen än i en färdig pull request, och
Rikard får ett underlag att besluta om.
