# Bildpromptar för #299, omgång 2 (krigshändelser)

Slaget vid Parramatta saknar en fri historisk bild (se [bilder-saknas.md](bilder-saknas.md), avsnittet om omgång 2). Skapad med `python3 tools/bildpromptar.py --out docs/bildpromptar-299-omgang-2.md slaget-vid-parramatta`. Bilden görs av en människa i ChatGPT enligt [bilder-ai-illustrationer.md](bilder-ai-illustrationer.md) och sparas som `images/incoming/slaget-vid-parramatta.png`.

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

## Slaget vid Parramatta (`slaget-vid-parramatta`)

- År: 1797 CE · plats: Parramatta väster om Sydney, Australien
- Stil: Barock oljemålning och gravyr (`barock`)
- Spara som: `images/incoming/slaget-vid-parramatta.jpg`

```text
Style: Baroque oil painting with dramatic chiaroscuro, or hand-coloured engraving with watercolour wash. Subject: Battle of Parramatta — Parramatta, west of Sydney, Australia, 1797 CE. What happened (show only this, do not add details): The Bidjigal warrior Pemulwuy, of the Darug people, has been leading a guerrilla war against the colonists since 1790. In March 1797, he and up to 100 warriors meet armed settlers and soldiers at Parramatta. Pemulwuy is hit by seven bullets and taken prisoner, but recovers and escapes. He was killed in 1802. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Never depict the Prophet Muhammad. Respect: no caricatures of peoples; convey mood and setting rather than invented details.
```
