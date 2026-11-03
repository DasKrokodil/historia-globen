# Plan för Claude Code och Codex efter tokenåterställningen

**Datum:** 2026-11-03  
**Syfte:** ge Claude Code ett avgränsat förslag för helgen och den första arbetsveckan efter återställningarna.

## Kapacitetsregel

Claude Code får använda **högst 60 procent av sin återställda tokenbudget fram till måndag 9 november**. Minst 40 procent ska lämnas orörd som reserv för oväntade fel, granskning och eventuell fortsättning.

Efter måndag får nya uppgifter bara ges efter att Rikard har bedömt hur mycket annan utveckling och annat arbete som återstår under veckan.

## Claude Code: fredag och helgen

Arbeta i denna ordning:

1. Slutför och granska #542 om den fortfarande har en aktiv arbetare eller pågående verifiering. Den får inte stå som `codex: pågår` utan aktivt arbete.
2. Genomför #552 om #542 är avslutad. Det är den rekommenderade huvuduppgiften: liten, avgränsad och med låg arkitekturrisk.
3. Stanna efter #552 om tokenförbrukningen närmar sig 60 procent.
4. Använd återstående utrymme endast till att förbereda #554 eller ta fram beslutsunderlag för #530. Påbörja inte båda som full implementation under samma helg.

Undvik under helgen större arkitektur-, data- och innehållsleveranser. #551, #489, #538, #402, #403, #407, #474, #556 och #353 väntar.

## Codex efter återställningen 9 november kl. 19:41

1. #538 – tester före uppdelningen av `main.js`.
2. #530 – mobilmenyn, när menybeslutet är klart.
3. #551 – datumingång och flytt av ”Min dag i historien”.
4. #489 – ”Idag i historien”, efter att den gemensamma datumlogiken i #551 är stabil.

Codex bör inte börja #402 eller #403 förrän #538 är klar. De centrala arkitekturändringarna ska göras efter varandra, inte parallellt.

## Rekommenderad milstolpeordning

### 4.2

`#542 → #552 → #554 → #530 → #551 → #489`

`#530` och `#551` bör inte utvecklas parallellt eftersom de sannolikt berör samma navigations- och årshoppningsdelar.

### 4.3

`#538 → #402 → #403 → #517 → #393 → #412`

### R7 och restarbete

`#407 → #556 → #377`, därefter `#474` och `#353` när källor och datamodell är låsta.

### 5.1

Dela upp milstolpen innan implementation: `#394 → #452 → #453 → #61`.

### 5.2

`#501 → #64 → #15`, efter att 5.1:s arkitektur är stabil.

## Samarbetsprincip

- Claude Code tar beslut, källor, data, arkitektur och granskning.
- Codex tar avgränsade implementationer och testförberedelser när issuet är redo.
- En agent börjar först när föregående steg har lämnat över relevant beslut, testbevis och kända begränsningar.
- Minst 40 procent av Claude Codes helgbudget ska inte planeras in i förväg.
- Ingen ny större uppgift startas bara för att token finns kvar; stoppunkten är en del av planen.

## Förslag: riskbaserade webbläsartester

Hela webbläsarsviten behöver inte köras lokalt för varje issue. Testnivån bör följa ändringens risk:

| Ändring | Testnivå |
| --- | --- |
| Endast dokumentation | Riktad kontroll, ingen webbläsarsvit |
| Isolerad text, konstant eller liten UI-detalj | Riktad kontroll eller komponenttest |
| En panel, meny eller ett lager | Komponenttest med dator- och mobilbild |
| Tidslinje, glob, central JavaScript, dataladdning eller mobil layout | Full webbläsarsvit |
| Release eller större arkitekturändring | Full svit plus integrationskontroll |

Rekommenderad process:

- Varje pull request kör ett snabbt smoke-test.
- Isolerade issues får riktade eller komponentbaserade tester.
- Full webbläsarsvit körs för central kod, mobiländringar, tidslinje/glob, dataladdning och arkitektur.
- Full svit körs alltid före release och när flera pull requests ska testas tillsammans.
- Efter en release görs en full integrationskontroll mot den sammanslagna versionen.

Detta är ett processförslag, inte en ändring av GitHub-workflowen i denna pull request. Claude Code och Rikard behöver bedöma hur branch protection och `.github/workflows/browser-test.yml` ska ändras innan den nya testnivån införs.
