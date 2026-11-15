# Nordsjöväldet: Cliopatrias gränser och år, avvikelsen öppet (#1602)

**Datum:** 2026-11-15 (DasKrokodil i chatten: "A, och ja på namnen")

## Beslut (byggt)
- **Alternativ A:** Cliopatrias tre poster `North Sea Empire` (1018–1039), `Denmark-England` (1040–1045) och `Norway-Denmark` (1046–1055) importeras med Cliopatrias egna gränser och år som gruppen `nordsjovaldet`. Luckan i Danmark, England och Norge 1018–1055 stängs.
- Regentlängderna säger något annat: väldet föll när Knut dog 1035, Hardeknut styrde Danmark och England 1040–1042 och Magnus den gode Norge och Danmark 1042–1047 (engelska Wikipedia; Wikidata anger 1016–1035 för väldet). Det står öppet i faktarutans `mapNote` ("Källorna skiljer sig"). Cliopatrias år ändras inte i tysthet.
- Wikidata-id sätts bara för Nordsjöväldet (Q3281269). Cliopatrias id för de två andra posterna gäller annat och används inte.
- Norge klipps bort ur Norgesväldet 1028–1039, så att det inte ritas två gånger.
- **Namnen:** Nordsjöväldet (svenska Wikipedias titel), Danmark–England och Norge–Danmark (Cliopatrias namn översatta).

## Skäl
Cliopatria är projektets godkända källa för gränser. Att ändra dess år efter regentlängderna (alternativ B) skulle ge nya luckor (Danmark 1036–1039 och 1048–1055), eftersom Cliopatria inte har någon gräns för Danmark ensamt de åren. Att skriva avvikelsen öppet följer källpolicyn.

## Berör
`tools/riken.py`, `data/empires/nordsjovaldet.json` (ny), `data/empires/norgesvaldet.json`, `data/empires/index.json`, `data/platser.json` (Danmarks `periods`), `data/sources.json`, `data/genererat/`, docs/datamodell.md.
