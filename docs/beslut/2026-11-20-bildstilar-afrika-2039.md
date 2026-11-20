# Bildstilar för Etiopien, Västafrika och Egypten 1799 (#2039)

**Datum:** 2026-11-20 (DasKrokodil sa ja till rekommendationerna i #2039 samma dag)

## Beslut
1. **Etiopien:** ny regional stil `etiopien` ("Etiopisk kyrkokonst och handskrift", 320–1900) med egen `frame` (`etiopien`) och `prompt`, i samma format som `kina-brons`. Regionen `etiopiska-hogland` är en ruta på 36–40 grader öst och 10–15 grader nord, alltså det kristna högländerna (Aksum, Lalibela, Gondar, Mekelle). Harar (Adal, 42 grader öst) och Addis Abeba (9 grader nord) ligger utanför rutan och är oförändrade. Starten 320 följer händelsen `aksum-blir-kristet` (cirka 320–360 i datan), eftersom stilen är kyrkokonst och inte hör till tiden före kristnandet. Slutet 1900 är som för `islamisk` och `benin`. Stilen står före `islamisk` och `miniatyr` i listan, eftersom den första regionala stilen som träffar gäller.
2. **Västafrika efter 1500:** regionen `vastafrika` (hela rutan −18 till 15 grader öst, 0 till 20 grader nord) ersätts av `benin-riket` (5–7 grader öst, 5–7,2 grader nord, Edo i södra Nigeria). Stilen `benin` ("i stil med Benin-bronserna") gäller därmed bara Benin och inte Ghana, Dahomey, Oyo, Ife, Sierra Leone eller Liberia, som får grundstilen för året. Tidsspannet 1200–1900 är oförändrat.
3. **Rosettastenen:** ny valfri lista `exceptIds` på en regional stil (stöds av `styleFor()` i `js/model.js` och `style_for()` i `tools/bildpromptar.py`). `islamisk` och `miniatyr` har `rosettastenen-hittas` i listan, så händelsen (Egypten 1799, franska soldater) följer grundstilen `barock` (1651–1800). Platsen avgör annars stilen och Egypten ligger i rutorna för båda, så en enskild händelse går inte att undanta med geografin.
4. **Ramen `.frame-etiopien`** i `css/style.css` har nya färgvariabler i `:root` (`--ethio-ground`, `--ethio-red`, `--ethio-gold`, `--ethio-green`) och mörk botten med ljus text, som `kina-brons`. **Kontrast (WCAG 2.1, uträknat):** brödtext `--parchment` på botten 13,6:1 (sämsta fall med rödtonen i bakgrunden, alfa 0,12: 12,1:1), dämpad text `--parchment-dim` 6,9:1 (sämsta fall 6,2:1), länkar och rubriker i `--ethio-gold` 9,8:1 (sämsta fall 8,8:1), linjefärgen `--ethio-red` mot botten 3,4:1 (gränsen för grafik är 3:1). Alla över AA (4,5:1 för text).
5. Inga historiska fakta och inga händelsers bilder ändras. `image.style` i händelsens data är spårbarhetsuppgift om vilken stil bilden gjordes i; den lämnas orörd. Fyra händelser har redan bild med äldre stil i `image.style` (`aksum-blir-kristet` antik, `lalibelas-klippkyrkor`, `slaget-vid-wayna-daga` och `slaget-vid-adwa` islamisk). Bilderna är riktiga foton (`historisk`) och påverkas bara av ramen, som nu följer `styleFor()`.

## Händelser som byter stil (mätt med tools/bildpromptar.py före och efter, alla händelser)
| Händelse | År | Före (stil / ram) | Efter (stil / ram) | `image.style` i data |
|---|---|---|---|---|
| `aksum-blir-kristet` | 320 | antik / antik | etiopien / etiopien | antik |
| `lalibelas-klippkyrkor` | 1181 | islamisk / medeltid | etiopien / etiopien | islamisk |
| `ife-huvudet` | 1300 | benin / medeltid | medeltid / medeltid | - |
| `salomoniska-dynastin-tar-makten` | 1270 | islamisk / medeltid | etiopien / etiopien | - |
| `zagwedynastin` | 1137 | islamisk / medeltid | etiopien / etiopien | - |
| `garimaevangelierna` | 390 | antik / antik | etiopien / etiopien | - |
| `slaget-vid-antukyah` | 1531 | islamisk / renassans | etiopien / etiopien | - |
| `slaget-vid-amba-sel` | 1531 | islamisk / renassans | etiopien / etiopien | - |
| `slaget-vid-wofla` | 1542 | islamisk / renassans | etiopien / etiopien | - |
| `slaget-vid-wayna-daga` | 1543 | islamisk / renassans | etiopien / etiopien | islamisk |
| `gondar-blir-etiopiens-huvudstad` | 1636 | islamisk / renassans | etiopien / etiopien | - |
| `asanteriket-grundas` | 1701 | benin / barock | barock / barock | - |
| `dahomey-erovrar-ouidah` | 1727 | benin / barock | barock / barock | - |
| `hatata-1668` | 1668 | islamisk / barock | etiopien / etiopien | - |
| `rosettastenen-hittas` | 1799 | islamisk / barock | barock / barock | - |
| `oyoriket` | 1608 | benin / renassans | renassans / renassans | - |
| `freetown-grundas` | 1792 | benin / barock | barock / barock | - |
| `forsta-italiensk-etiopiska-kriget` | 1895 | islamisk / 1800-tal | etiopien / etiopien | - |
| `slaget-vid-coatit` | 1895 | islamisk / 1800-tal | etiopien / etiopien | - |
| `slaget-vid-amba-alagi-1895` | 1895 | islamisk / 1800-tal | etiopien / etiopien | - |
| `belagringen-av-mekelle` | 1896 | islamisk / 1800-tal | etiopien / etiopien | - |
| `slaget-vid-adwa` | 1896 | islamisk / 1800-tal | etiopien / etiopien | islamisk |
| `slaget-vid-dodowa` | 1826 | benin / 1800-tal | 1800-tal / 1800-tal | - |
| `liberia-blir-sjalvstandigt` | 1847 | benin / 1800-tal | 1800-tal / 1800-tal | - |

Händelser med bild (`image`) som byter ram: `aksum-blir-kristet`, `lalibelas-klippkyrkor`, `slaget-vid-wayna-daga` och `slaget-vid-adwa`. De som visas i listan utan bild får ramen och promptstilen om en illustration görs senare.

## Varför
Gondar, Hatata och Lalibela var kristna ortodoxa Etiopiens huvudplatser och fick ramen och bildstilen för den islamiska världen, eftersom rutan `islamiska-varlden` täcker norra Etiopien. Benin-bronserna är konst från Edo i Benin och inte från hela Västafrika, så Freetown och andra platser fick en stil de inte hör till. Samma lucka som i #1397 (se [listan](../granskningar/2026-11-20-stil-fran-annan-region.md)).

## Berör
Issue #2039, `data/styles.json`, `js/model.js`, `css/style.css`, `tools/bildpromptar.py`, `docs/bildpromptar.md` (genererad), `docs/datamodell.md` och [beslutet om grotta och Kina](2026-11-20-bildstilar-grotta-och-kina-1553-1397.md).
