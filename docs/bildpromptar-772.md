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

## Slaget vid Ridaniya (`slaget-vid-ridaniya`)

- År: 1517 CE · plats: Ridaniya, strax utanför Kairo, Egypten
- Stil: Geometriska mönster, kalligrafi och arkitektur (`islamisk`)
- Spara som: `images/incoming/slaget-vid-ridaniya.jpg`

```text
Style: Islamic art: intricate geometric tile patterns, arabesques and decorative calligraphy borders around landscapes and architecture, no human figures. Subject: Battle of Ridaniya — Ridaniya, just outside Cairo, Egypt, 1517 CE. What happened (show only this, do not add details): On 22 January 1517, the army of the Ottoman sultan Selim I defeats the Mamluks under Sultan Tumanbay II at their fortifications just outside Cairo. The Ottomans then take Cairo, and the Mamluk Sultanate comes to an end. The Ottoman grand vizier Hadım Sinan Pasha is killed in the battle. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Never depict the Prophet Muhammad. Respect: no caricatures of peoples; convey mood and setting rather than invented details.
```

## Hatata, etiopisk förnuftsfilosofi (`hatata-1668`)

- År: 1668 CE · plats: Etiopien (Zara Yaqob kom från Aksum)
- Stil: Geometriska mönster, kalligrafi och arkitektur (`islamisk`)
- Spara som: `images/incoming/hatata-1668.jpg`

```text
Style: Islamic art: intricate geometric tile patterns, arabesques and decorative calligraphy borders around landscapes and architecture, no human figures. Subject: The Hatata, Ethiopian philosophy of reason — Ethiopia (Zara Yaqob came from Aksum), 1668 CE. What happened (show only this, do not add details): The Hatata ("inquiry" in Ge'ez) are two philosophical treatises on ethics and reason from what is today Ethiopia. The first was written by Zara Yaqob, according to the text in 1668, and the second some years later by his pupil Walda Heywat. Zara Yaqob writes that he fled from Aksum and lived for two years in a cave. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Never depict the Prophet Muhammad. Respect: no caricatures of peoples; convey mood and setting rather than invented details.
```
