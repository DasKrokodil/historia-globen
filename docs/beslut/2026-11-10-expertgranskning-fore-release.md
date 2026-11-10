# Expertgranskning före varje release, inte per pull request

2026-11-10

**Beslut:** Expertagenterna (`sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`, `historiker`, `forhistoriker`, `geograf` och
`larare`) granskar allt som har ändrats sedan förra releasen, innan releasen publiceras. Dirigenten (Claude Code) kallar in
dem utan att Rikard behöver be om det, och bara de experter vars område har ändrats. Resultatet blir en daterad rapport i
`docs/granskningar/` och en kommentar i release-PR:en. Releasen publiceras inte förrän fynden är rättade eller Rikard har
sagt att de får vänta. Per pull request gäller bara den vanliga granskningen: Codex-granskningen och Claude Codes
granskning, där fakta, data och källor alltid granskas fullt (källpolicyn). Är en enskild ändring stor eller riskabel (en ny
tur, en ny språkfil, riken) får granskaren kalla in en expert redan då. Experterna ändrar inga filer och ersätter inte
källkontrollen. Codex kör inte experterna och behöver inte ange språk eller faktatyp i överlämningen.

Ersätter förslaget i `2026-11-10-expertgranskning-i-flodet.md` (expert per pull request), som togs bort innan det slogs ihop.

**Motivering:** Det som slås ihop syns inte för besökarna förrän en release publiceras, så granskningen kan göras en gång
för en hel batch. Det kostar färre agentkörningar, och en språkexpert som ser alla nya översättningar samtidigt hittar
inkonsekventa termer som inte syns i en enskild pull request. Det stämmer med det riskbaserade flödet (2026-11-03), där full
granskning görs vid batch, milstolpe och releasekandidat. Priset är att fel upptäcks senare och rättas i en klump;
avgränsningen "sedan förra releasen" och undantaget för stora ändringar begränsar det.
