# Sveriges landskap: gränskälla och kontur (#1847)

**Datum:** 2026-11-27 (DasKrokodil, i chatten, efter Claude Codes källundersökning i [#1847](https://github.com/DasKrokodil/historia-globen/issues/1847#issuecomment-7212986587))

## Beslut
1. **Källa:** landskapens konturer kommer ur Lantmäteriets Distriktsindelning (CC0), sammanslagen till de 25 landskapen i [`perliedman/svenska-landskap`](https://github.com/perliedman/svenska-landskap) (CC0 enligt repots README). Filen som används är den **oklippta** `svenska-landskap.geo.json` från commit `64f033ea4cab359d6810e27b221ca6b7f10ce649` (2022-03-22). Originalet i Geotorget kräver inloggning och har inte kunnat jämföras; det står öppet i källposten.
2. **Kusten:** konturen klipps mot projektets egen kustlinje (`data/land-10m.json`, Natural Earth, public domain). Repots klippta fil används inte, eftersom dess kustlinje (`swedish_border.sqlite`) har okänd källa.
3. **Kortnot:** landskapskortet skriver öppet vad linjen är, i samma form som noten på Skånes kort ("konturen är landskapet enligt Lantmäteriets distriktsindelning, förenklad"). Skånes kort byter från länet till landskapet i ett senare steg, inte här.
4. **Egen ritning behövs inte** för något landskap. Beslutet 2026-11-16 om ok per landskap är därför inte aktuellt.
5. **Kravet för landskap är kvar:** minst tre synliga källkontrollerade händelser (beslutet [2026-11-16](2026-11-16-europa-och-landskap.md), punkt 5). Landskapsissuena #1848–#1852 kan få `redo`.

Beslutet **bekräftar** [2026-11-16-europa-och-landskap](2026-11-16-europa-och-landskap.md), punkt 2 (gränskälla: kontur ur öppen källa med bekräftad licens), och är det ok för ny källa som [2026-11-14-regionniva-per-land](2026-11-14-regionniva-per-land.md) kräver.

## Kontroller som gjordes (2026-11-27)
- Licensen CC0 och avgiftsfri står i Geotorgets produktkort för Distriktsindelning; repots README anger CC0.
- 25 landskap, rätt namn, slutna ringar, koordinater inom Sverige. Skåne: 99 % av landskapets punkter ligger inom Skåne läns kontur (Natural Earth), vilket stämmer med noten på Skånes kort.
- Areor jämförda med svenska Wikipedia (sekundärkälla): inom ±3 % för kustlandskap, 14–17 % större för landskap vid stora sjöar (Dalsland, Närke, Värmland), troligen för att sjöyta ingår (antagande).
- Länsgränserna (Natural Earth) räcker inte: 16 av 25 landskap ligger i flera län.
- Inte använda: OpenStreetMap (ODbL, inte på licenslistan), Wikidata (geometri finns bara för Halland), SCB (har ingen landskapsgeometri), OpenHistoricalMap (bara Jämtland och Härjedalen, med slutdatum 1658).

## Osäkert och kvar
- Geometrin är inte jämförd mot dagens Distriktsindelning (inloggning krävs). Landskapens gränser antas vara oförändrade, men det är inte belagt.
- Repots licens är en README-rad utan LICENSE-fil; ursprungsdatan är CC0 hos Lantmäteriet.

## Berör
#1847, #1848–#1852, #1115, #1568, `data/sources.json` (`lantmateriet-distriktsindelning`, `svenska-landskap-geojson`), README:ns licensavsnitt, `tools/platser_gransar.py` (utökas i första landskapsissuet).
