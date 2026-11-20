# Riktiga bilder: arbetsrutin för alla agenter

Gäller när en händelse ska få en **riktig bild** (Wikimedia Commons, loc.gov eller en annan tillåten källa). Reglerna för vilka bilder som får användas står i [CLAUDE.md](../CLAUDE.md#bilder-129) (Bilder, Källpolicy, Licenser). Den här filen är hur man gör det i praktiken. Om riktiga bilder i bitar och undantaget för Andreas agenter: [docs/beslut/2026-11-20-bilder-riktiga-bilder-i-bitar-och-undantag.md](beslut/2026-11-20-bilder-riktiga-bilder-i-bitar-och-undantag.md). Finns ingen riktig bild: [bilder-ai-illustrationer.md](bilder-ai-illustrationer.md) och [bilder-saknas.md](bilder-saknas.md).

Rutinen bygger på erfarenheten från omgångarna #772, #773, #299 och #1875 (2026-11-20): Wikimedia svarade ofta HTTP 429 (för många förfrågningar) från molnsessionen, ibland i över en timme. Hela rutinen går ut på att göra få, smarta anrop och att aldrig vänta.

## Anropsregler (Wikimedia och andra källor)

1. **Metadata i batch.** Hämta data om upp till 50 filer per anrop med Commons API (`https://commons.wikimedia.org/w/api.php`, `action=query`, `titles=File:A|File:B|…`, `prop=imageinfo`, `iiprop=url|extmetadata|size|mime`, `iiurlwidth=960`, `format=json`). Licensmallen på filsidan hämtas som text med `https://commons.wikimedia.org/w/index.php?title=File:<namn>&action=raw` (ett anrop per fil, bara för de som kommit fram till licenskontroll). Öppna inte filsidan som HTML.
2. **Skicka alltid en beskrivande User-Agent**, till exempel `HistoriaGlobenBildrutin/1.0 (hobbyprojekt med öppen källkod; klient: Claude Code)`. Aldrig personuppgifter, namn eller e-post.
3. **Hämta miniatyren i 960 px**, inte originalet (`iiurlwidth=960` ger `thumburl`). Bilden beskärs ändå till 800 × 600.
4. **Respektera `Retry-After`.** Svarar källan 429 eller 503 med `Retry-After`: vänta så länge som huvudet säger, men aldrig längre än några minuter (se punkt 5).
5. **Stoppa efter tre misslyckade försök.** Skriv "ej hämtad" för händelsen (id, källa, felkod, datum) och **gå vidare till nästa händelse**. Att vänta en timme är det dyraste valet. De som blev "ej hämtade" tas i en senare körning.
6. **Prova loc.gov först när Commons stoppar.** Metadata: `https://www.loc.gov/item/<id>/?fo=json`; bilden ligger på `tile.loc.gov` (adressen står i svaret). Hitta inte på id:n: leta fram dem ur en sökning på loc.gov eller ur Commons filsida.
7. **Tidsbegränsa varje bild.** Ge varje nedladdning och varje anrop ett tak (till exempel 30 sekunder per anrop och ungefär 3 minuter per händelse inklusive omförsök). Överskrids taket: "ej hämtad", nästa händelse.

### Källor som är tillåtna i nätverksinställningen

```
commons.wikimedia.org
upload.wikimedia.org
api.wikimedia.org
www.wikidata.org
www.loc.gov
tile.loc.gov
wellcomecollection.org
iiif.wellcomecollection.org
www.history.navy.mil
catalog.archives.gov
archive.org
```

Att en adress går att nå betyder inte att bilden får användas. **Varje ny källa (utöver Commons och loc.gov) kräver licenskontroll per fil, en rad i README:s licensavsnitt och en post i `data/sources.json`** innan någon bild därifrån läggs in. Ingen text eller data kopieras.

## Licenskontroll per fil

Tillåtet (CLAUDE.md, Bilder punkt 1): public domain, CC0, CC BY, CC BY-SA och Library of Congress-bilder märkta "No known restrictions on publication". Inte CC BY-NC, inte "all rights reserved", inte oklara villkor.

- Läs licensmallen i `action=raw` och `extmetadata` (`LicenseShortName`, `Artist`, `Credit`), inte bara rubriken.
- **Flera licenser eller motsägelser** (till exempel olika licens i Wikidata och på filsidan, eller "PD" med osäkert ursprung) skrivs öppet i källpostens `note`. Går det inte att avgöra: använd inte bilden, skriv varför i issuet.
- Bilden behåller sin egen licens, som står i `license` och bildtexten. Upphovet står i `credit`.
- Filsidan läggs som källa i `data/sources.json` (id, titel, url, licens, datum då den kontrollerades) och som `source` i `image`.

## Bildtexten

- Den säger **bara det filsidan stöder**: vad bilden visar, när och av vem om det står där. Inga egna tillägg ur minnet.
- **Märk senare avbildningar** ("Målning från 1800-talet av ett slag 1066"), **propaganda**, **teckningar och karikatyrer** och **fantasibilder** ("visar inte hur personen såg ut"). En bild av dokumentet eller platsen i dag säger det ("Nutida foto av ...").
- Profeten Muhammed avbildas aldrig. Reglerna om respekt i CLAUDE.md, Bilder punkt 4, gäller.
- Skriv bildtexten på svenska först, och översätt den till en, de, es och fr i samma pull request (CLAUDE.md, Språk). Översättningen ändrar aldrig fakta.

## Ordningen, steg för steg

1. Ta issuet enligt "Etiketterna `redo` och `pågår`" i CLAUDE.md (kommentar, `pågår`, tilldelning, modellnivårad: licens och källor kräver Opus eller motsvarande).
2. Kontrollera `main`: har händelsen redan en bild? Är den med i [bilder-saknas.md](bilder-saknas.md) (då redan prövad)?
3. Sök kandidater. Hämta metadata i batch (anropsregler ovan), välj en bild per händelse, kontrollera licens och vad filsidan säger.
4. Hämta miniatyren (960 px) och spara den som `images/incoming/<händelse-id>.<png|jpg>`. Filnamnet är händelsens id.
5. Lägg en post per bild i `images/incoming/bildlogg.json` (`kind: "historisk"`, `source`, `caption`, `credit`, `license`). Följ de befintliga posterna.
6. Lägg källan i `data/sources.json` (och i README:s licensavsnitt om källan är ny).
7. `python3 tools/bilder_in.py`: beskär till 4:3, skalar till 800 × 600, sparar `images/events/<id>.webp` (helst under 150 kB) och fyller i `image`.
8. **Kontrollera `image` för hand i `data/handelser/1500-1799.json`** (och i de andra periodfilerna) tills #2038 är ihopslagen: tills dess kan `bilder_in.py` hoppa över eller missa händelser i den filen. Kontrollera att `file`, `kind`, `source`, `caption`, `credit` och `license` finns på varje händelse du rört.
9. `python3 tools/dela_data.py` (bygger `data/events.json` och `data/genererat/`).
10. `python3 tools/oversattning.py` (stoppar bildtexter utan översättning; översätt först).
11. `python3 tools/license_manifests.py` (genererar `data/licenses.json` och `images/licenses.json`).
12. `python3 -m json.tool` på de ändrade JSON-filerna och `node --test 'tests/*.test.mjs'`.
13. Checka in **bilderna med git** (`.webp` i grenen). Binära filer via GitHub-automation har gett fel tidigare. Kan du inte lägga in `.webp`-filer med git: ta inte issuet.
14. Öppna pull requesten enligt CLAUDE.md. Lista i den varje bild (händelse-id, filsidans adress, licens, vad bilden visar) och varje "ej hämtad" med skäl. Saknas bilder: skriv "Del av #N", inte "Closes".

## Verktyg

- `tools/bilder_in.py`: konverterar och fyller i `image` (steg 7).
- `tools/dela_data.py`: bygger de genererade datafilerna (steg 9).
- `tools/oversattning.py`: spärren mot oöversatta texter (steg 10).
- `tools/license_manifests.py`: licensmanifesten (steg 11).
- `tools/bildpromptar.py`: bara för illustrationer ([bilder-ai-illustrationer.md](bilder-ai-illustrationer.md)).

**Planerade verktyg:** `tools/bild_hamta.py` (#2118, hämtning med batch, User-Agent, Retry-After, tre försök och tidstak) och `tools/bildkandidater.py` (#2119, kandidater och licensförslag per händelse). När de finns uppdateras den här rutinen: anropsreglerna ovan blir verktygets beteende, och det som verktyget gör för hand ersätts. Förslagen från verktygen är underlag, inte beslut: licenskontrollen och bildtexten granskas som förut.

## Kandidatlistan: skript och arbetsflöde

`tools/bildkandidater.py` (#2119) föreslår fria bilder till händelser utan bild och skriver `data/utkast/bildkandidater.json`, som appen inte läser. Allt i listan är förslag: öppna filsidan, kontrollera licensen och att bilden visar händelsen innan den används.

**Arbetsflödet** `.github/workflows/bildkandidater.yml` kör skriptet i Actions: fliken Actions, Bildkandidater, Run workflow. Fyll i världsdel (Afrika, Amerika, Asien, Europa, Oceanien), period som FRÅN-TILL i astronomiska år (till exempel `1000-1347`), högst så många händelser (standard 40) och om händelser som `docs/bilder-saknas.md` redan listar ska hoppas över (standard ja). Flödet startas bara för hand, har bara rättigheterna `contents: write` och `pull-requests: write` på jobbet, använder inga hemligheter, tar högst 30 minuter och kör en körning i taget.

Resultatet läggs på en ny gren `bildkandidater/<körnings-id>` (aldrig `main`, aldrig force-push) och en pull request mot `main` öppnas med titeln "Bildkandidater: <region> <period> (förslag)". Tillåter repots inställning inte att `GITHUB_TOKEN` skapar pull requests (Settings, Actions, General, "Allow GitHub Actions to create and approve pull requests") lämnas grenen kvar och en jämförelselänk skrivs i körningens sammanfattning; öppna pull requesten därifrån. Båda fallen är avsedda. Ingen fakta ändras, och en kandidat blir en bild först i ett vanligt bildissue med källkontroll enligt rutinen ovan.

## Granskning per pull request

- `historiker` granskar licens, motiv och bildtext (stämmer bilden med händelsen, är senare avbildningar och propaganda märkta, står bara det filsidan stöder), och **en samlad språkgranskning** av bildtexterna görs (en körning över de fyra språken, inte fyra separata).
- Fyra separata språkgranskningar (`sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`) och `larare` hör till **releasegranskningen** (CLAUDE.md, Expertgranskning före varje release), utom när bilden är känslig (död, våld, symboler, personer med ansikte i en omstridd roll) eller en ny stilart; då kallas de in redan i pull requesten.
- Fakta, licenser och källor granskas fullt av en Claude Code som inte byggde ändringen. Skriv "Granskning: godkänd" eller konkreta arbetsorder som kommentar i pull requesten.

## Vem får ta issuen

Claude Code tar issues med riktiga bilder som förut. **Andreas agenter, även Codex och Copilot, får ta issues i milstolpen "Löpande: Bilder: riktiga bilder"** under villkoren i [beslutet 2026-11-20](beslut/2026-11-20-bilder-riktiga-bilder-i-bitar-och-undantag.md): bara riktiga bilder, bara om `.webp`-filer kan läggas in i en gren med git, aldrig genererade bilder eller påhittade källor och licenser, och fullständig korsgranskning av fakta, licenser och källor. Undantaget gäller bara den milstolpen.
