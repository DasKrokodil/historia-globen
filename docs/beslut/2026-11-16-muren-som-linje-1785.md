# Mingmuren som linje i turen, med en MIT-licensierad källa

2026-11-16

**Beslut (DasKrokodil i #1785, "ja"):**

1. Steget "Kinesiska muren" i turen *Det här har du hört* ritar Mingmuren som en linje på kartan (fältet `line` i turformatet,
   filen `data/turer/linjer/muren-ming.json`).
2. Källan är GitHub-repot Adl3rAi/The-Great-Wall-of-China-geodata (handritade linjer, licens **MIT**). MIT är en ny datalicens
   utanför listan i CLAUDE.md (CC0, CC BY, public domain, GPL) och godkänns här **bara för den här filen**, med upphovsmannen
   angiven i `data/sources.json`, `THIRD-PARTY-NOTICES.md` och README:ns licensavsnitt. MIT är förenlig med CC BY 4.0 när
   upphovsmannen anges.
3. Texten säger öppet att linjen är Mingmuren (1368–1644 enligt Wikipedia, sekundärkälla), inte hela muren, att äldre murar inte
   visas, att den är handritad av en privatperson och att sträckningen är ungefärlig.
4. Linjen är förenklad (Douglas–Peucker, 0,03 grader, cirka 11 kB) och ritas streckad. Sträckningen jämfördes mot Wikidatas
   koordinater för 51 delar av muren (inom 0,3 km utom vid ett pass med en lucka i linjen); det är en indikation, inte en
   oberoende kontroll, eftersom ursprunget kan vara gemensamt. Luckor och den grova Liaodong-delen redovisas i texten som
   "ungefärlig".
5. Frågan om hur linjen spårades ställs till upphovsmannen bara om DasKrokodil lägger inlägget på hans repo själv; sessionen
   når inte det repot.

**Motivering:** DasKrokodil ville se muren utritad på kartan (#1784). Det fanns ingen källa med geometri under en licens på
listan (Wikidata saknar geoshapes, Commons och Zenodo har inga mursidor, OpenStreetMap och Overpass var spärrade i sessionen).
Källan är den enda som fungerar, och vi är öppna med vad den är i stället för att utelämna linjen.
