# Kategorifärger och tonade etiketter: mätt, och bara det som mätningen krävde (#1318)

**Datum:** 2026-11-17. DasKrokodil sa ja till rekommendationerna i issuet 2026-11-14.

## Beslut
1. **Etiketterna på globen är läsbara eller dolda.** Ingen etikett tonas längre ned till en svag skugga när markören vänder sig bort från kameran. Den har full styrka eller minst 85 procent, och därunder ritas ingen etikett (markören syns kvar). Då är kontrasten mellan text och bakgrund minst 4,5:1 också över det ljusaste underlaget (`labelOpacity` i `js/ui/clusters.js`).
2. **"Nära i tid" skiljs från "pågår" med kursiv text**, utöver orden ("om 16 år (1607)"). Det är det minst ingripande: ingen ny gränssnittstext, ingen ändring av etikettens bredd (webbläsaren lutar Instrument Sans) och ingen ny färg.
3. **Tio av de fjorton kategorifärgerna justeras lite** (högst ΔE00 5,3 i ton, mest ljushet): natur, människans ursprung, civilisationer, religion, vetenskap, kultur, sport, ekonomi, hälsa och klimat. Krig, katastrofer, upptäcktsresor och rymden är oförändrade. Tonen behålls.
4. **Inget eget färgblindläge i Lager.** Mätningen visade att standardfärgerna går att rädda med små justeringar, utan att stilen ändras.

## Mätningen
- Simulering enligt Machado, Oliveira och Fernandes (2009), fullt bortfall (severity 1.0), i linjärt RGB. Färgskillnad i CIEDE2000 (ΔE00). Gränserna står i ΔE00, det mått som är byggt för att ligga närmast hur skillnaden ses. Under cirka 3 ser man knappt någon skillnad, 5–6 syns tydligt sida vid sida och 10 eller mer är ett säkert avstånd också för små markörer.
- Före: 27 av 91 par låg under ΔE00 10 i någon simulering och 9 under 5. Sämst var religion och vetenskap (1,2 vid deuteranopi), civilisationer och sport (2,1), upptäcktsresor och kultur (2,4) samt religion och klimat (2,4).
- Formen bär inte skillnaden: de flesta händelser har ingen egen symbol (kultur 122 av 139, civilisationer 188 av 234, ekonomi 75 av 80 är en prick i kategorins färg). Undantagen är krig (svärd på 360 av 464) och rymden (satellit eller raket på 13 av 18). Därför är färgen det som skiljer de flesta kategorier åt på en markör, i etiketten och i brickorna.
- Vilka par som ses samtidigt: händelsepar i olika kategorier med överlappande tid (±10 år) och högst 1 500 km mellan platserna. De flesta par förekommer ofta (civilisationer och kultur 120, krig och ekonomi 93, civilisationer och ekonomi 80).
- Efter: alla par utan egen form håller minst ΔE00 5,4 vid simulerad färgblindhet (förut 1,2) och minst 10 med normalt färgseende (förut 9,3). Inget par med minst 5 förekomster ligger under ΔE00 6,9. 22 av 91 par ligger fortfarande under ΔE00 10 i någon simulering, och det går inte att få bort utan att stilen ändras: 14 pastellfärger kan inte alla hållas på ΔE00 10 från varandra vid deuteranopi.

## Vad som inte gjordes, och varför
- Inget färgblindläge, ingen ny symbol per kategori. En egen form per kategori (en kvadrat, en triangel och så vidare i stället för prickarna) vore det enda som skiljer alla fjorton åt för alla, men det ändrar markörernas utseende och är ett produktbeslut för DasKrokodil.
- Tonade markörer (högst 45 procents styrka, #434) är oförändrade: de är medvetet svaga för att visa att händelsen bara ligger nära i tid, och orden, tidsbågen och etiketten bär det.

## Berör
`js/model.js` (`CATEGORIES`), `js/ui/clusters.js` (`labelOpacity`, `placeLabels`), `js/controllers/labels.js`, `css/style.css` (`.glabel-near`), `tests/farger.test.mjs`, `tests/farg-berakning.mjs`, `tests/webblasare.mjs`, `docs/arkitektur.md`. Kompletterar [2026-11-03-kategori-katastrofer.md](2026-11-03-kategori-katastrofer.md), som mätte färgen för katastrofer på samma sätt.
