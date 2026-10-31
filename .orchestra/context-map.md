# Kontextkarta: vad orkestern läser (beslut 2026-10-31)

Ersätter "läs allt först". Dirigent och arbetare läser **kärnan**, issuet och dirigentens uppdrag ([shared/WORKER.md](shared/WORKER.md) med tilläggen i [project.md](project.md#resurspolicy)), och sedan **bara** de avsnitt som uppgiften träffar nedan. Långa referensdokument och hela beslutsloggen läses inte som standard: sök i dem (`grep`) efter uppgiftens begrepp, filnamn och issuenummer och läs träffarnas avsnitt.

## Kärnan (alltid)

- [CLAUDE.md](../CLAUDE.md): Arkitektur, Källpolicy, Licenser, Testa innan du är klar, Arbetssätt. (Filstruktur, Datamodell, Bilder och Utseende läses när uppgiften träffar dem nedan.)
- [project.md](project.md): hela (projektets orkesterpolicy).
- Absoluta förbud, som gäller även om inget annat läses: aldrig fakta ur minnet, aldrig pusha till `main`, inga personuppgifter till externa tjänster, inga nya beroenden eller arkitekturändringar utan Rikards ok, `.orchestra/shared/` redigeras inte.

## Efter uppgift

| Utlösare (etikett, sökväg eller ämne) | Läs dessutom |
| --- | --- |
| `data`, `faktafel`, `källkontroll`, ändring i `data/` eller fakta i text | CLAUDE.md: Datamodell; [docs/kallor.md](../docs/kallor.md): Grundregler, Granskningsnivåer, Så kontrollerar du en uppgift; avsnittet i [docs/datamodell.md](../docs/datamodell.md) för den fil som ändras; beslut som träffas vid sökning |
| Riken (`data/empires/`, `tools/riken.py`, etiketten `riken`) | docs/datamodell.md: `empires/`; docs/arkitektur.md: Faktarutan om ett rike, Rikets berättelse, Hjälpskript |
| Vägar och resor, upptäcktsvyn (`data/routes/`, `data/upptackt.json`, `js/layers/lines.js`, `discovery.js`) | docs/datamodell.md: `routes/`, `upptackt.json`; docs/arkitektur.md: Lagerregistret |
| Religioner | docs/datamodell.md: `religions.json`, `religions-polities.json`; docs/arkitektur.md: Faktarutan om en religion |
| `utseende`, CSS, paneler, menyer, mobil | CLAUDE.md: Utseende; docs/arkitektur.md: Moduler, Mobilen, Mindre trängsel på kartan; tillgänglighet: Tangentbord och skärmläsare, Pekskärmar och zoom |
| Lager, rendering, globen, tidslinje, fokusläge, uppspelning | docs/arkitektur.md: Principer, Hur delarna hänger ihop, Lagerregistret, Fokusläget, Uppspelning, Laddning av data |
| Bilder (`images/`, fältet `image`) | CLAUDE.md: Bilder; [docs/bildpromptar.md](../docs/bildpromptar.md) vid illustrationer |
| Publicering, cache, CI, release (`.github/`, `scripts/`, `_headers`) | [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md); docs/arkitektur.md: Publicering, Testa |
| Formuläret för förslag (`functions/`, `js/ui/feedback.js`) | [docs/feedback.md](../docs/feedback.md) |
| Bara dokumentation | Kärnan och de dokument som ändras |
| Arkitektur, datamodell, kategorier, licenser, nya beroenden | Hela berörda avsnitt i docs/arkitektur.md eller docs/datamodell.md och sök i docs/beslut.md; det är alltid en fråga till Rikard först |

Hittar du ett beslut eller en regel som verkar motsäga uppdraget: stanna och fråga dirigenten i stället för att läsa vidare på måfå.
