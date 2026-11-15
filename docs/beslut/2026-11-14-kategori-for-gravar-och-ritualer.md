# Kategori för gravar och ritualer (#1587)

**Datum:** 2026-11-14 (DasKrokodil sa ja till rekommendationen i #1587)

## Beslut
Kategorin för gravar, offer, tempel och ritualer väljs efter vad källan säger:
- **`religion`** när källan själv talar om tro, kult, ritual eller ceremoni: tempel, offerplatser, ceremoniella centrum, eller gravar där källan beskriver ritualen som religiös.
- **`kultur`** när det viktiga är föremål, konst eller gravgåvor.
- **`manniskan`** när det viktiga är människorna själva: hur de levde och dog, deras kroppar och deras arvsmassa.

Kategorin väljs aldrig för att fylla en tom cell i täckningsmåttet (`tools/tackning.py`).

Så går vi vidare:
- Befintliga händelser gås igenom i #1610, högst 20 händelser per pull request, och varje händelse kontrolleras mot sin källa innan kategorin ändras. Inga nya fakta tillkommer.
- Om Mungokvinnans kremering (`mungokvinnan-kremeras`) räknas som religion avgörs i den genomgången, efter vad källan säger.
- Religion i förhistorien fylls på i nästa omgång av #767, bara med händelser där källan själv talar om kult eller ritual.

## Varför
Förhistorien hade 0 händelser i kategorin religion, eftersom gravar och kremeringar utan skriven regel fått `manniskan` eller `kultur`, och kategorierna blev blandade. En tom cell i täckningsmåttet är ett grovt mått och inget mål; att flytta gravar till religion bara för att fylla den vore att tolka utöver källan. En skriven regel gör granskningen konsekvent.

## Berör
`docs/datamodell.md` (fältet `category`), `data/handelser/fkr.json` och `data/handelser/1-1499.json` (genomgången i #1610), #767, #1585, `tools/tackning.py`.
