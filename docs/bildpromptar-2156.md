# Bildpromptar

Skapade av `tools/bildpromptar.py` (#129). Kopiera prompten till ett bildverktyg och lägg bilden i
`images/incoming/<händelse-id>.jpg` (eller .png/.webp). Spara verktyg och datum, så fyller Claude i `image` i händelsens fil i data/handelser/.
Sök alltid efter en riktig public domain-bild på Wikimedia Commons först.

## Människoarter (#1105)

Gäller bilder av människoarter och fynd av dem, inte all förhistoria, enligt [docs/beslut/2026-11-14-rekonstruktioner-av-manniskoarter.md](beslut/2026-11-14-rekonstruktioner-av-manniskoarter.md).

- **Riktig bild först:** fossil, fyndplatser, verktyg och andra fynd från Wikimedia Commons med tillåten licens (public domain, CC0, CC BY, CC BY-SA). Annars landskap, djur eller föremål, där människoarten inte visas i närbild.
- **Inga ansiktsrekonstruktioner som standard**, varken egna illustrationer eller foton av museirekonstruktioner. Ett undantag kräver DasKrokodils ja.
- **Bildtexten** på en illustration börjar med "Illustration, tolkning, inte en historisk bild" (en: "Illustration, interpretation, not a historical image"; de: "Illustration, Deutung, kein historisches Bild"; es: "Ilustración, interpretación, no una imagen histórica"; fr: "Illustration, interprétation, pas une image historique"). Stil, verktyg, datum och exakt prompt sparas i `image`.
- **Prompten får inte innehålla** hudfärg, hår, kroppsbehåring, ansiktsdrag, kroppsbyggnad, hållning, kläder, smycken eller beteende som händelsens källa inte stöder. Står det inte i källan, står det inte i prompten. Är fyndet en avgjutning eller kopia säger bildtexten det.
- **Inga stereotyper:** inga "grottmänniskor", inga apmänniskor, ingen hopsjunken hållning som tecken på en "primitiv" art och ingen marschrad av arter mot nutidsmänniskan.
- **Granskning:** `forhistoriker` granskar motiv, bildtext och prompt innan bilden läggs in.
- Stilen `grotta` för händelser före cirka 3000 f.Kr. i `data/styles.json` är en modern, tydligt tecknad illustration av landskap och föremål, utan människor eller ansikten och utan grottmålning eller hällkonst som kan tas för ett verkligt fynd (#1553). För en människoart gäller dessutom reglerna ovan.

## Al-Bakri beskriver Ghanarikets huvudstad (`al-bakri-beskriver-ghana`)

- År: 1068 CE · plats: Ghanarikets huvudstad, kanske Koumbi Saleh (i dag Mauretanien)
- Stil: Geometriska mönster, kalligrafi och arkitektur (`islamisk`)
- Spara som: `images/incoming/al-bakri-beskriver-ghana.jpg`

```text
Style: Islamic art: intricate geometric tile patterns, arabesques and decorative calligraphy borders around landscapes and architecture, no human figures. Subject: Al-Bakri describes the capital of the Ghana Empire — Capital of the Ghana Empire, perhaps Koumbi Saleh (now Mauritania), 1068 CE. What happened (show only this, do not add details): Around 1068 the scholar al-Bakri of Córdoba completed his book on roads and kingdoms, with a detailed description of the capital of the Ghana Empire. He described two towns on a plain, one for Muslim merchants with twelve mosques and one for the king. Al-Bakri never travelled there himself but relied on older texts and on people he met in Spain. The ruins at Koumbi Saleh have long been seen as this capital, but scholars increasingly question that. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Never depict the Prophet Muhammad. Respect: no caricatures of peoples; convey mood and setting rather than invented details. Follow al-Bakri's description as quoted in the source: the houses are of stone and acacia wood. The domes belong to the king's town: the king's palace and domed dwellings inside an enclosure like a city wall, with domed buildings, groves and thickets around the town. Do not show minarets or towers anywhere, and do not put domes on the merchants' town. Show a single scene of the two towns on the plain, with no inset pictures.
```
