# Vanliga historiska missuppfattningar (#838)

**Datum:** 2026-11-07

## Beslut
Historia-globen får en ny typ av innehåll: **missuppfattningar**, alltså vad många tror, vad källorna säger och var missuppfattningen kom ifrån. De lagras i `data/missuppfattningar.json` (schema `schemas/missuppfattning.schema.json`), inte som ny kategori i `CATEGORIES` och inte som händelser.

- **Nivå först:** en ruta i faktarutan för berörd händelse. En egen flik under Mer och en tur eller ett "Sant eller myt?"-quiz kommer först om rutan fungerar. Visningen byggs efter skolpiloten (version 6); nu görs bara datamodellen och en källkontrollerad provpost (Napoleon).
- **Urval:** en missuppfattning får vara kopplad till en befintlig händelse (`events`), men behöver inte vara det (Rikards beslut 2026-11-07). Utan händelse anges i stället `year` (och valfritt `location`), så att den går att placera i tiden.
- **Källkrav:** bara sådant historiker är överens om. Källan ska helst vara forskning eller etablerad referenslitteratur, inte en sida som själv sammanfattar myter. Wikipedia är sekundärkälla enligt vanliga regler. Att något är en missuppfattning är i sig ett påstående: är källorna oense skrivs det öppet i `truth`, och nivån blir inte `two-sources`.
- **Spridning:** första omgången ska ha missuppfattningar från flera världsdelar.
- **Eget fält, inte kategori:** `originKinds` markerar hur missuppfattningen uppstod (satir, propaganda, missförstånd, media, folktro, annat).
- Översättningarna (en, de, es, fr) görs i samma pull request enligt beslutet 2026-11-06.

**Öppen fråga (Rikard):** tonen, alltså om vi får skriva var en myt spreds (till exempel brittiska karikatyrer). Tills vidare skriver vi bara det som källan själv säger, utan egna slutsatser.

## Varför
Det passar projektets idé: något oväntat som ändrar bilden av historien, och det lärorika är var missuppfattningen kom ifrån. Ny datafil och ingen ny arkitektur, så inget bryter mot "data skild från kod".

## Berör
#838, `docs/datamodell.md`, `schemas/missuppfattning.schema.json`, `data/missuppfattningar.json`, `scripts/validate-site.py`, `tools/oversattning.py`. Hänger ihop med quizet (#65) och Källdetektiven (#742).
