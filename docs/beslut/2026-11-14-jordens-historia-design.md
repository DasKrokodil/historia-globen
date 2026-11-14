# Jordens historia: designen för version 8 (#397)

**Datum:** 2026-11-14 (DasKrokodils ja på #397 till alla tretton frågorna i designunderlaget, och i chatten samma dag om Paleobiology Database)

## Beslut
1. **Omfång:** första versionen visar karta bara för fanerozoikum (cirka 540 miljoner år till i dag). Äldre tid finns på översiktsraden, utan karta.
2. **Kartkälla:** PaleoMAP PaleoCoastlines v7.3 (Kocsis & Scotese, CC BY 4.0, doi:10.5281/zenodo.7994000) i stället för dagens kust flyttad med en GPlates-modell. Det ändrar #51.
3. **Tiden** i jordens läge är år före nutid som spann (äldst, yngst, tabellversion), med eget adressfält bredvid `d`. `y` skrivs inte i jordens läge.
4. **`domain` är en axel under lägena,** inte ett sjätte läge. Byte av domän avslutar tur, lektion, fokus och intervall.
5. **Den geologiska skalan får en egen fil** (inte `data/perioder.json`), läst ur ICS-tabellen (CC BY 4.0, version 2024-12).
6. **Grundstegen får göras först** i milstolpen Version 8, eftersom de inte syns för besökaren: skalan som post (#1511), en klampfunktion (#1512), `domains` på lager och fokustyper (#1513) och den växlande grundkartan (#1420).
7. **All rotation görs i förväg** av ett verktyg i `tools/` (#1515). GPlates-programvaran körs bara lokalt; sidan får inget nytt beroende.
8. **Märkning i tre nivåer med text:** Fynd, Rekonstruktion, Omstritt (#1518). Förbjudet: "här levde", "inga fynd" som "fanns inte", och täthetskartor utan förklaring.
9. **Åldrar** skrivs "cirka N miljoner år sedan", periodgränser med högst en decimal och tabellversionen angiven, och fynd alltid som spann. Källans egna "±" och "~" följer med i datan.
10. **Kartan byter i källans egna tidssteg,** utan utjämning mellan dem.
11. **Lager som bygger på dagens geografi stängs av** i jordens läge. Dagens kust får visas som streckad referens ("dagens kust, flyttad") tillbaka till cirka 400 miljoner år.
12. **Fossilfynden (#52) görs sist. Vi frågar inte Paleobiology Database om licensen:** API:et anger CC0 och FAQ:n CC BY 4.0, båda är tillåtna enligt beslut 10, och DasKrokodil tar risken. Vi hänvisar enligt den strängare (CC BY 4.0, med nedladdningsdatum).
13. **Domänerna för licenskontrollen är tillåtna** i nätverksinställningarna; det som återstår står i #1510.

Beslutet bygger ingenting. Arkitekturens punkt 3 ändras först i #1516 och punkt 4 i #1420, var och en med egen beslutsfil och ändrad text i CLAUDE.md.

## Varför
Källorna säger själva att kontinenternas läge i öst–väst är obundet längre bak, och två modeller placerar samma punkt olika (Stockholm för 300 miljoner år sedan på 13°, 19° eller 31° nordlig bredd). PaleoCoastlines är den enda öppnade källan med verkliga forntida kuster i färdig vektorform, med licensen angiven på två ställen och små filer. År före nutid med eget adressfält gör att en gammal länk aldrig öppnas på fel år. Grundstegen är små och går att backa ett i taget. Fynden kommer sist eftersom de måste roteras med samma modell som kartan och insamlingen är skev (av 22 122 dinosaurieförekomster ligger 9 086 i Nordamerika och 1 416 i Afrika, mätt 2026-11-14).

## Berör
Issues #397, #396, #51, #52, #53, #1420 och de nya #1510–#1521. Underlaget står i kommentarerna på #397 från 2026-11-14 (designunderlag, uppföljning om öppnade källor), med skissen på grenen `skarmbilder` i `issue-397/`. Beslut [2026-11-13-tidsdoman-reserverad.md](2026-11-13-tidsdoman-reserverad.md), [2026-11-13-bildlager-v2-format.md](2026-11-13-bildlager-v2-format.md), [2026-11-13-osakerhetens-sprak-forhistoria.md](2026-11-13-osakerhetens-sprak-forhistoria.md) och [2026-11-10-version-7-riktning.md](2026-11-10-version-7-riktning.md). Punkt 12 ersätter förslaget i underlaget om att vänta på svar från Paleobiology Database.
