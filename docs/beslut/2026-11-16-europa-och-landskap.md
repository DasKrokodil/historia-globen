# Europa först, Sveriges landskap och undantag för `data/platser.json` (#1807)

**Datum:** 2026-11-16 (DasKrokodil, i chatten och i #1807; skrivet i den första landspull requesten, Norge #1808)

## Beslut
1. Platserna fortsätter efter piloten (Skåne, Grönland, Aotearoa): **landskort för länder, region för region, Europa först**. Ett land per issue och per pull request (#1808–#1846).
2. **Alla Sveriges landskap** görs i samma veva (milstolpen Regioner: Sveriges landskap, #1847–#1852). Gränskälla (#1847): kontur ur öppen källa med bekräftad licens, egen ritning bara efter ok per landskap.
3. Ett eget UX-issue för vyn och vägen dit (milstolpen Länder och regioner: UX, #1853).
4. **Europa görs klart först.** Pilotländerna utanför Europa (#1270–#1273) väntar tills Europa är klart; rekommendationen att gå i samma takt gäller inte. Utvärderingen #1274 mäter balansen (andel Europa) efteråt.
5. Kravet för **landskap sänks till tre** synliga händelser. Kravet för **länder är kvar på fem** (beslutet 2026-11-12, punkt 4).
6. **Undantag för `data/platser.json`** (samma som för `data/ui/*.json`, beslut 2026-11-09): flera landspull requests får vara öppna samtidigt, så länge var och en bara lägger till eller ändrar sin egen post i `data/platser.json` och sina egna händelser i `data/handelser/`. De genererade filerna (`data/events.json`, `data/genererat/`, `data/oversattning.json`, `data/ortnamn/`) räknas inte som krock; den som slås ihop sist ombaserar och bygger om dem (`tools/dela_data.py`, `tools/oversattning.py`). Ändrar en pull request ett annat lands post eller delad kod i `js/` är det en krock som vanligt. Taket på fyra öppna pull requests per person gäller oförändrat.

Beslutet **ändrar** två tidigare beslut:
- [2026-11-12-landerna-fore-regionerna](2026-11-12-landerna-fore-regionerna.md), punkt 3: fler länder än pilotländerna byggs nu före utvärderingen #1274, med Europa först, och #1274 utvärderar allt tillsammans.
- [2026-11-14-regionniva-per-land](2026-11-14-regionniva-per-land.md), punkt 3 ("inte före utvärderingen #1274"): Sveriges landskap görs före utvärderingen, som undantag.

## Varför
Piloten visade att landskortet fungerar, och Europa har öppna källor för de flesta länder. Med undantaget kan flera länder byggas parallellt utan att vänta på varandra, eftersom varje land bara rör sin egen post; de genererade filerna byggs ändå om vid ombasering.

## Berör
#1807, #1808–#1853, #1270–#1274, #1568, `data/platser.json`, `data/handelser/`, [docs/referens/arbetssatt.md](../referens/arbetssatt.md) (punkt 5 under "Etiketterna `redo` och `pågår`"), CLAUDE.md ("Etiketter och tak"), [2026-11-09-undantag-for-parallellt-arbete](2026-11-09-undantag-for-parallellt-arbete.md).
