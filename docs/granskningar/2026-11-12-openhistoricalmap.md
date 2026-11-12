# OpenHistoricalMap som kontrollkälla: förstudie (#847)

Datum: 2026-11-12. Gjord av Claude Code (DasKrokodil) efter DasKrokodils ja på #847. Ingen data har lagts i `data/` och ingen ny källa i README:ns licensavsnitt.

## Sammanfattning

- **Licensen är bekräftad i två primära källor:** data är CC0 "except where otherwise noted", och enskilda objekt kan vara CC BY eller CC BY-SA enligt en `license`-tagg. Det passar våra regler så länge CC BY-SA-objekt filtreras bort eller bara länkas.
- **Täckningen kunde inte mätas.** Hela databasen nås bara via taginfo och Overpass, som sessionens nätverk inte släpper fram. Huvudsidans API gick att nå en kort stund, men Cloudflare spärrade sedan sessionens adress, så stickprovet runt våra händelser gav bara `403`. Inga siffror om täckning i den här rapporten kommer från en egen mätning.
- **OpenHistoricalMap kartlägger föremål, inte händelser.** Enligt Wikipedia samlar projektet "historical objects" och "does not collect data on historical events per se". Det duger alltså inte som andra källa för händelsernas årtal, och kan inte ge `two-sources`. Det kan som mest bekräfta att en plats, byggnad eller gräns fanns ett visst år.
- **Rekommendation:** vänta med att använda den. Ta upp den igen när regionkorten (#579, gränskällor i #557) eller rikenas gränser behöver en andra kontroll, och mät då täckningen med Overpass från en miljö där värdarna är tillåtna (se "Så görs mätningen").

## Vad som kontrollerades

### Licens (öppnad 2026-11-12)

| Källa | Vad den säger |
| --- | --- |
| [Copyright-sidan](https://www.openhistoricalmap.org/copyright) | "Except where otherwise noted, OpenHistoricalMap data is dedicated to the public domain under a Creative Commons CC0 dedication." Enskilda objekt finns under "Creative Commons Attribution (CC BY) or Creative Commons Attribution-ShareAlike (CC BY-SA), as noted in license=* tags on individual elements." Kustlinjer, sjöar och vattendrag kommer från OpenStreetMap ("© OpenStreetMap contributors, CC BY-SA 2.0"). Dokumentationen (wikin) är CC BY-SA 2.0. |
| [API:ets capabilities](https://www.openhistoricalmap.org/api/capabilities) | Svaret har `license="https://creativecommons.org/public-domain/cc0/"` och "OpenHistoricalMap is dedicated to the public domain except where otherwise noted." |
| [Wikipedia: OpenHistoricalMap](https://en.wikipedia.org/wiki/OpenHistoricalMap) (sekundär) | Licens per objekt, CC0 föredras; nämner också Open Database License för vissa objekt. **Källorna skiljer sig:** copyright-sidan nämner bara CC BY och CC BY-SA som undantag, inte ODbL. ODbL är inte förenlig med våra regler, så ett objekt med `license=ODbL` ska behandlas som CC BY-SA (bara länkas). |

Slutsats för licensen: ett objekt utan `license`-tagg är CC0 och får användas. Objekt med `license` som innehåller `SA` eller `ODbL` får bara länkas. Vattenlagret (sjöar, floder, kust) är importerat från OpenStreetMap under CC BY-SA och ska alltid hållas utanför.

### Täckning: vad som gick och inte gick

| Väg | Resultat |
| --- | --- |
| `taginfo.openhistoricalmap.org` (antal objekt per tagg, licensvärden) | Inte tillåten i sessionens nätverk. |
| `overpass-api.openhistoricalmap.org` (frågor över hela databasen) | Inte tillåten i sessionens nätverk. |
| `ohmdash.pages.dev` (fristående instrumentpanel över täckning per gränsnivå) | Inte tillåten i sessionens nätverk. |
| `www.openhistoricalmap.org/api/0.6/map` (rutor upp till 0,25 kvadratgrader) | Tillåten, men Cloudflare spärrade sessionens adress efter de första anropen. Alla 75 rutorna i stickprovet gav `403`. |

Det som finns om storleken kommer från en webbsökning där sidorna inte öppnades: OpenHistoricalMaps wiki ska ha uppgett cirka 7,6–7,8 miljoner daterade objekt och cirka 2 300 bidragsgivare hösten 2026, och en import av vatten från OpenStreetMap utgjorde i januari 2025 två tredjedelar av alla objekt. **Inte kontrollerat**; uppgifterna används inte som underlag.

Enligt Wikipedia (öppnad) bygger databasen på frivilliga som ritar av gamla kartor, med importer av bland annat USA:s historiska delstats- och countygränser (Newberry Library), Inkarikets gränser och franska vägnätet 1820–1866. Täckningen beskrevs 2021 som "very sparse". Det tyder på en slagsida mot USA och Europa, men det är inte mätt.

## Bedömning per tänkt användning

| Användning | Bedömning |
| --- | --- |
| Andra källa för händelsers årtal (`two-sources`) | Nej. Databasen har föremål, inte händelser. |
| Kontroll av en händelses plats (finns staden, bron, fästningen det året?) | Möjligt men omständligt: varje objekt har egna `start_date` och `end_date`, och täckningen är okänd. Wikidata gör samma sak bättre för oss i dag. |
| Gränser för riken och regionkort (#557, #579) | Det mest lovande. CC0-gränser per år skulle vara förenliga med våra licenser, i motsats till många andra gränskällor. Kräver mätning per region och period innan beslut. |
| Bild- eller kartlager | Utanför den här förstudien. Kartstilarna är CC0 enligt copyright-sidan. |

## Så görs mätningen (nästa gång)

1. Tillåt `taginfo.openhistoricalmap.org` och `overpass-api.openhistoricalmap.org` i miljöns nätverksinställningar, eller kör från en dator.
2. Taginfo: antal objekt per `license`-värde (`/api/4/key/values?key=license`) och per `boundary=administrative` och `admin_level`.
3. Overpass: för varje period och världsdel i `python3 tools/tackning.py`, räkna `boundary=administrative`-relationer med `admin_level=2` vars `start_date`–`end_date` täcker periodens mitt, inom världsdelens ruta. Jämför med rikena i `data/empires/` (Cliopatria) för samma år.
4. Stickprov runt våra händelser: en ruta runt 3 händelser per period och världsdel, räkna daterade objekt som fanns händelsens år. Undvik huvudsidans API för detta: det är byggt för redigering och spärras av Cloudflare vid många anrop.

## Rekommendation till DasKrokodil

- **Vänta.** OpenHistoricalMap ersätter inte Wikidata som andra källa för händelser, och täckningen är omätt.
- **Spara den som kandidat för gränser:** när regionkorten (#579) eller rikenas gränser behöver en andra källa är det en av få gränskällor med CC0. Mät då enligt avsnittet ovan.
- **Vill du att mätningen görs nu:** lägg till de två värdarna i miljöns nätverksinställningar, så gör jag steg 2–4 i en ny pull request.
