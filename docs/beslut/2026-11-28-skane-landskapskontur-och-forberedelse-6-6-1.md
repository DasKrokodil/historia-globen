# Skånes kontur byter till landskapet, och beslut inför releasen av 6.6.1 (2026-11-28)

**Datum:** 2026-11-28. **Beslut (DasKrokodil, i chatten, svar på de sex frågorna i [releaserapporten](../granskningar/release-6-6-1-forberedelse-2026-11-28.md)):** han höll med rekommendationerna.

1. **Skånes kort byter från Natural Earths Skåne län till landskapet Skåne** ur Lantmäteriets distriktsindelning, som de andra 24 landskapen (ersätter "i ett senare steg" i [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md), punkt 3). Konturen låg 237 km² utanför landskapet. Antalet händelser är oförändrat (Skåne 21, Halland 7).
2. **Ölandsbron:** meningarna om färjorna och turismen stryks (de stod inte i någon öppnad källa, #2478); källnoten rättas.
3. **Fyra riksomfattande händelser** (regeringsformen 1809, allmän rösträtt för män 1911, kvinnor röstar 1921, EU 1995) får `scope: "place"` (#1674). **Obs:** det döljer dem *inte* i Upplands kort; de står där kvar som ungefärliga markörer, och Sveriges kort visar dem som "hela landet". Att dölja dem helt kräver `scope: "wide"`, som också tar bort dem ur Sveriges kort, och är inte gjort.
4. **De fyra tunna landskapen** (Lappland, Jämtland, Härjedalen, Västergötland) fylls i en egen omgång efter releasen, med de samiska händelserna.
5. **UX-granskning före releasen: ja. Översättningspass: stickprov** (cirka 20 händelser per språk).
6. **6.6.1 släpps efter #2469 och #2470** (landkortets ruta och etiketter), inte efter #2474 och #2475.

## Berör
6.6.1, #2478, #2469, #2470, `data/platser.json`, `data/handelser/`.
