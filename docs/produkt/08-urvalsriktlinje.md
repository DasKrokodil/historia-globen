# 08. Urvalsriktlinje: vad är värt en plats på globen? (utkast)

**Status:** **godkänd 2026-11-08** (DasKrokodils svar på #916: kriterierna A–F, regionalt viktigt om det täcker ett glapp, och "Om urvalet" publiceras). Texten under Öppenhet mot besökaren är fortfarande ett utkast tills den skrivs och översätts. Omarbetat efter DasKrokodils besked samma dag: ensam redaktör, tydligt att det är ett urval, ingen ställning i enskilda frågor, ingen akademisk granskning. Kriterierna och balansmålen nedan är mina förslag. Det som redan är beslutat är markerat med beslutets datum. Riktlinjen innehåller inga historiska uppgifter; den säger hur vi väljer, inte vad som hände.

## Varför den behövs

Globen visar ett urval, inte allt. Historiker, lärare och nyfikna besökare frågar "varför just dessa?", och utan en uttalad riktlinje går svaret inte att ge, och urvalet drar mot det som är lättast att källbelägga: krig, Europa, nyare tid. Täckningsmätningen i november 2026 visade just det (skev balans mot krig, stora tomma celler; se [beslutet om arbetskön 2026-11-07](../beslut/2026-11-07-arbetsko-tackning-balans.md) och `python3 tools/tackning.py`).

## Vad som redan är beslutat

- **Ingen uppgift utan källa**, och inget skrivs ur minnet (CLAUDE.md, källpolicyn).
- **Luckor och balans går före fler krig och fler europeiska händelser** (2026-11-07): förhistoria, antiken i Amerika och Afrika, medeltiden i Asien och händelser som inte är krig prioriteras.
- **Varje paket och version ska ha innehåll från flera världsdelar** (versionsplanen).
- **Listan över det som borde finnas bygger på källor, aldrig på minnet** (täckningsrunda, 2026-11-03). Kärnhändelserna kom ur en lista som DasKrokodil godkände (2026-11-05, [karnhandelser.md](../karnhandelser.md)), i omgångar om högst 20 per pull request.
- **Omstridda gränser** ritas enligt Sveriges officiella hållning, med källa per fall ([omstridda-granser.md](../omstridda-granser.md)).
- **Förhistorien väntar** på beslutet om ungefärliga datum (#396).

## Förslag på urvalskriterier

En händelse, ett rike eller en fun fact bör uppfylla **A och B**, och **minst ett** av C–E. F är en spärr.

| | Kriterium | Hur det avgörs |
|---|---|---|
| **A** | **Belagd.** Går att källbelägga i öppen källa med årtal och plats. | Källpolicyn; `review` är minst `source-checked` |
| **B** | **Betydelse.** Kärnhändelser: en etablerad referenslista räcker. Allt annat: minst två oberoende referensverk, läroplanen eller etablerade tidslinjer. | Bedömningen skrivs i issuet, med källorna |
| **C** | **Samtidighetsvärde.** Den bidrar till ett oväntat eller lärorikt samband med något på ett annat håll. | Finns en fun fact, en tur eller en jämförelse som använder den? |
| **D** | **Täcker ett glapp.** Den fyller en tom eller tunn cell (period, världsdel eller kategori). | `tools/tackning.py` |
| **E** | **Undervisningsvärde.** Den hör till kursplanens centrala innehåll eller ingår i en tur eller lektion. | Skolverkets öppna text (inte minnet) |
| **F** | **Spärr: kan den visas respektfullt och utan att vilseleda?** Känsliga ämnen och omstridda gränser följer reglerna ovan. | Bilder och gränser enligt CLAUDE.md |

Om ett förslag bara uppfyller B (den är "känd") men förstärker en befintlig slagsida, väntar den tills glappen är åtgärdade.

## Balans: hur vi mäter, inte vilka tal vi siktar på

Jag föreslår **inga siffror** här, eftersom ett mål (till exempel andel krig) är ett val som DasKrokodil ska göra. Förslag på mått som redan finns eller är lätta att få fram:

- Händelser per världsdel, per period (århundrade) och per kategori.
- Andel krig mot övriga kategorier.
- Andel positiva (`tags: framsteg`) mot negativa händelser.
- Andel händelser med bild, andel med två källor.
- Riken per världsdel och period.

Förslag på regel: **varje täckningsrunda** redovisar måtten och rekommenderar nästa omgång mot de tomma cellerna, och varje release-PR säger om balansen blivit bättre eller sämre sedan förra gången.

## Öppenhet mot besökaren

Förslag: en kort text under **Källor** ("Om urvalet") som säger:

- att globen visar ett **urval**, gjort av **en person** (DasKrokodil), utan redaktion;
- att saker kommer med utan att redaktören tar ställning i enskilda frågor, och att något finns med är inget ställningstagande;
- att omstridda gränser och statusfrågor följer **Sveriges officiella hållning (UD)**, med källa;
- vad som är känt saknas, och hur man föreslår något (Rapportera faktafel, förslagsformuläret). Texten skrivs på svenska först och översätts samtidigt, enligt språkregeln.

## Vem avgör, och hur ändras listan

- **DasKrokodil är ensam redaktör** och bestämmer. Det finns ingen redaktion och inget externt granskningsorgan.
- **Förslag** kan komma från vem som helst (besökare, agenter, Einzbeng). Ett förslag blir ett issue med motivering mot A–F.
- **DasKrokodil** godkänner listor över nya omgångar, som för kärnhändelserna. Dirigenten (Claude Code på DasKrokodils konto) triagerar.
- Ensam redaktör betyder att kriterierna ska vara **få och lätta att tillämpa**; de är ett stöd, inte en process.
- **Ändrar vi kriterierna** skrivs ett beslut i `docs/beslut/`.

## Beslutade frågor (2026-11-08)

1. Kriterium B: en etablerad referenslista räcker för kärnhändelser; två för allt annat.
2. Regionalt viktigt men okänt utanför regionen: får komma med om det täcker ett glapp (kriterium D).
3. "Om urvalet" publiceras under Källor.
4. Ingen extern bedömare och ingen aktiv sökning efter någon; den som själv hör av sig är välkommen.

## Att kontrollera vid uppdatering

- [ ] Har täckningsrapporten ändrat vilka glapp som är störst?
- [ ] Har ett nytt beslut ändrat kriterierna?
- [ ] Har en granskare (lärare, historiker) ifrågasatt urvalet? Skriv in det i [06](06-granskningsperspektiv.md#8-historiker-och-källgranskare).
