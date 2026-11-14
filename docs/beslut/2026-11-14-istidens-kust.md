# Bildlagret Istidens kust ur PaleoMIST 1.0 (#1096)

**Datum:** 2026-11-14 (DasKrokodils beslut på #1096: ja till ett bildlager ur Wilmes m.fl., sedan väg A, serien Gowan, när villkoren för ICE-6G saknades)

## Beslut
1. **Ett bildlager "Istidens kust (modell)"** (`istidens-kust` i `data/bildlager.json`, `kind: lager`) visar den modellerade kusten 10 000–80 000 år sedan. Det är av som standard och ligger i gruppen Historiskt perspektiv.
2. **Källan är serien Gowan i Wilmes m.fl.** (Zenodo 8147509, CC BY 4.0), det vill säga PaleoMIST 1.0 (Gowan 2019 på PANGAEA och Gowan m.fl. 2021, båda CC BY 4.0). Serien ICE-6G i samma datamängd **valdes bort**: ingen öppnad sida anger villkor för själva ICE-6G_C-modellen. PMIP4:s sida säger bara "Please cite all following papers", och Peltiers egen sida gick inte att nå.
3. **Bilder, inte vektor:** `tools/istidens_kust.py` gör om nio tidssteg (10, 15, 20, 30, 40, 50, 60, 70 och 80 tusen år före 1950) till ekvirektangulära WebP-bilder 4096 × 2048 i `images/lager/`, 37–79 kB vardera. Det avviker från punkt 3 i [beslutet om bildlager v2](2026-11-13-bildlager-v2-format.md) ("Kusten ritas som vektor"). Skälen: dagens beslut gällde bilder, formatet läser redan raster men inte vektor, och rutnätets upplösning (1/8 grad) gör ändå kusten ungefärlig. En vektorkust kan göras senare med samma verktyg.
4. **Vad bilden visar:** bara ytor som är hav i dag men inte var hav i modellen, med ljus landton, glesa snedstreck och en mörk kustlinje (osäkerhetens språk, [beslut 2026-11-13](2026-11-13-osakerhetens-sprak-forhistoria.md)). Både "i dag" och "då" kommer ur samma modell (steget 0 och det valda steget). Hav som redan i dag är avskilt från världshavet i modellen (till exempel Kaspiska havet) är inte med, eftersom deras nivå inte följer världshavets.
5. **Närmaste steg:** varje skiva gäller fram till mitten mot nästa steg. Den yngsta gäller till 7 500 år sedan och den äldsta från 81 250 år sedan. Modellens år räknas före 1950 (BP).
6. **Synlig text:** varje skiva har `caveat` på fem språk: tolkning, inte en karta från tiden; vad de ljusa ytorna betyder; närmaste modellsteg; slutna hav är inte med; kartans kust är annars nutida. Texten står i teckenförklaringen med skivans rubrik ("Kusten för cirka 20 000 år sedan (modell)") och källorna. Radens förklaring i Lager säger samma sak kort.

## Motivering
Grundkartan har dagens kust (Natural Earth). I förhistorien ritas därför vandringar och områden över hav som då var land, till exempel Beringia, Sunda och Sahul. Ett lager med öppen licens som tydligt är märkt som modell rättar det utan att påstå mer än källan säger. Ett `lager` kan bara lägga till land. Att ta bort land där havet stod högre kräver en växlande grundkarta (`kind: grund`, version 8).

## Kvar att göra och kända begränsningar
- Masken skiljer bara hav från "inte hav", så en yta som modellen täcker med is ser likadan ut som torrt land (till exempel Hudson Bay vid 20 000 år). PaleoMIST 1.0 har också istjocklek (enligt PANGAEA-sidan), och den skulle kunna märka sådana ytor som is. Den används inte här, och geografen eller förhistorikern bör bedöma om det behövs.
- Vilken nutida bottentopografi Gowan-rutnäten i Wilmes m.fl. bygger på gick inte att se, eftersom artikeln (doi:10.1029/2023PA004727, CC BY 4.0 enligt Crossref) inte kunde öppnas. RTopo-2 (PANGAEA.856844) har licensen CC BY 3.0 enligt den öppnade sidan. Om rutnäten bygger på den är licensen förenlig, men den står inte bland lagrets källor förrän det är kontrollerat.
- Spridningslagret (`js/layers/spread.js`) klipper fortfarande bara Afrika mot dagens land. Det kan senare klippa mot istidens kust.

## Berör
`tools/istidens_kust.py`, `images/lager/istidens-kust-*.webp`, `data/bildlager.json`, `data/sources.json`, `js/layers/images.js`, `js/ui/legend.js`, `js/controllers/render.js`, `css/style.css`, `tests/images.test.mjs`, `tests/webblasare.mjs`, `README.md`, `THIRD-PARTY-NOTICES.md`, `docs/arkitektur.md`, `docs/datamodell.md`, #1096.
