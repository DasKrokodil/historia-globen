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
- Stilen för händelser före cirka 3000 f.Kr. i `data/styles.json` nämner människosilhuetter och följer inte reglerna av sig själv: i en prompt om en människoart tas de bort, eller så väljs en riktig bild.

## Slaget vid Thermopyle (`slaget-vid-thermopyle`)

- År: 480 BCE · plats: Passet vid Thermopyle i mellersta Grekland
- Stil: Grekisk vasmålning och romersk mosaik (`antik`)
- Spara som: `images/incoming/slaget-vid-thermopyle.jpg`

```text
Style: ancient Greek red-figure and black-figure vase painting, or Roman floor mosaic made of small stone tesserae and fresco, meander border. Subject: The Battle of Thermopylae — The pass at Thermopylae in central Greece, 480 BCE. What happened (show only this, do not add details): In 480 BC about 7,000 Greeks under the Spartan king Leonidas block the pass at Thermopylae against Xerxes' army. They hold out for two days, until a local man shows the Persians a way around the pass. The Greek rearguard, with 300 Spartans, is wiped out, and the Persians can take Athens. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Fatimiderna grundar Kairo (`kairo-grundas`)

- År: 969 CE · plats: Kairo, nordost om Fustat (i dag Egypten)
- Stil: Geometriska mönster, kalligrafi och arkitektur (`islamisk`)
- Spara som: `images/incoming/kairo-grundas.jpg`

```text
Style: Islamic art: intricate geometric tile patterns, arabesques and decorative calligraphy borders around landscapes and architecture, no human figures. Subject: The Fatimids found Cairo — Cairo, north-east of Fustat (now Egypt), 969 CE. What happened (show only this, do not add details): In 969 the Fatimid Caliphate conquered Egypt, and the caliph al-Muizz had the general Jawhar lay out a new fortified city north-east of Fustat. The construction took four years, and in 973 the city became the Fatimids' capital. The al-Azhar Mosque was built in 970–972 in the new city and in time developed into a seat of learning. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Al-Bakri beskriver Ghanarikets huvudstad (`al-bakri-beskriver-ghana`)

- År: 1068 CE · plats: Ghanarikets huvudstad, kanske Koumbi Saleh (i dag Mauretanien)
- Stil: Geometriska mönster, kalligrafi och arkitektur (`islamisk`)
- Spara som: `images/incoming/al-bakri-beskriver-ghana.jpg`

```text
Style: Islamic art: intricate geometric tile patterns, arabesques and decorative calligraphy borders around landscapes and architecture, no human figures. Subject: Al-Bakri describes the capital of the Ghana Empire — Capital of the Ghana Empire, perhaps Koumbi Saleh (now Mauritania), 1068 CE. What happened (show only this, do not add details): Around 1068 the scholar al-Bakri of Córdoba completed his book on roads and kingdoms, with a detailed description of the capital of the Ghana Empire. He described two towns on a plain, one for Muslim merchants with twelve mosques and one for the king. Al-Bakri never travelled there himself but relied on older texts and on people he met in Spain. The ruins at Koumbi Saleh have long been seen as this capital, but scholars increasingly question that. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Cahokia och Monks Mound (`cahokia`)

- År: 1050 CE · plats: Cahokia vid Mississippifloden, mittemot S:t Louis (i dag Illinois, USA)
- Stil: Illuminerad handskrift (`medeltid`)
- Spara som: `images/incoming/cahokia.jpg`

```text
Style: high medieval illuminated manuscript miniature on vellum, gold leaf, lapis blue and vermilion, decorated initial and vine border, flat perspective. Subject: Cahokia and Monks Mound — Cahokia on the Mississippi River, opposite St Louis (now Illinois, USA), 1050 CE. What happened (show only this, do not add details): Cahokia was a city that existed roughly 1050–1350 and the largest and most influential city of the Mississippian culture. Its population is estimated at between 6,000 and 40,000 at its largest. The city had up to 120 earthen mounds; the largest, Monks Mound, is about 30 metres high and the largest artificial earthen mound north of Mexico. From about 1160–1170 the population began to decline, and the city was abandoned around 1400. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Polynesier når Hawaii (`polynesier-nar-hawaii`)

- År: 940 CE · plats: Hawaiiöarna (i dag delstaten Hawaii, USA)
- Stil: Bysantinsk ikon och insulär bokmålning (`tidig-medeltid`)
- Spara som: `images/incoming/polynesier-nar-hawaii.jpg`

```text
Style: early medieval art: Byzantine icon with gold leaf background, or Insular illuminated manuscript in the style of the Book of Kells and the Lindisfarne Gospels with interlaced knotwork, spirals and zoomorphic borders. Subject: Polynesians reach Hawaii — The Hawaiian Islands (now the state of Hawaii, USA), 940 CE. What happened (show only this, do not add details): The history of Hawaii begins when Polynesians come to the Hawaiian Islands. When this happened is disputed. The latest review of carbon-14 dates puts the arrival at about 940–1130, while older assessments have given anything from about the year 300 to 700–800. The Polynesians' history was handed down through genealogical chants recited at festivals. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Slaget vid Tondibi (`slaget-vid-tondibi`)

- År: 1591 CE · plats: Nära Tondibi, norr om Gao vid Niger, Mali
- Stil: Geometriska mönster, kalligrafi och arkitektur (`islamisk`)
- Spara som: `images/incoming/slaget-vid-tondibi.jpg`

```text
Style: Islamic art: intricate geometric tile patterns, arabesques and decorative calligraphy borders around landscapes and architecture, no human figures. Subject: Battle of Tondibi — Near Tondibi, north of Gao on the Niger, Mali, 1591 CE. What happened (show only this, do not add details): In October 1590 the Moroccan sultan Ahmad al-Mansur sends an army with cannon against the Songhai Empire. On 13 March 1591 it, under Judar Pasha, meets the Songhai army under Askia Ishaq II near Tondibi, north of the capital Gao. The Moroccans win, and the Songhai Empire collapses. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Karl XII stupar vid Fredriksten (`karl-xii-stupar-1718`)

- År: 1718 CE · plats: Fredrikstens fästning vid Fredrikshald (Halden), Norge
- Stil: Barock oljemålning och gravyr (`barock`)
- Spara som: `images/incoming/karl-xii-stupar-1718.jpg`

```text
Style: Baroque oil painting with dramatic chiaroscuro, or hand-coloured engraving with watercolour wash. Subject: Charles XII is killed at Fredriksten — Fredriksten Fortress at Fredrikshald (Halden), Norway, 1718 CE. What happened (show only this, do not add details): During the siege of the Norwegian fortress of Fredriksten, Charles XII is hit in the head by a projectile, probably a bullet, and dies on 11 December 1718. The Swedes call off the attack on Norway, and his death marks the end of absolutism in Sweden. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Napoleonkrigen (`napoleonkrigen`)

- År: 1803 CE · plats: Europa och haven runt den (började med Storbritanniens krigsförklaring mot Frankrike)
- Stil: Litografi och tidningsgravyr (`1800-tal`)
- Spara som: `images/incoming/napoleonkrigen.jpg`

```text
Style: 19th-century lithograph or wood-engraved newspaper illustration, as in an illustrated weekly, fine line work, sepia or limited colour. Subject: Napoleonic Wars — Europe and the seas around it (began with Britain's declaration of war on France), 1803 CE. What happened (show only this, do not add details): A series of wars in 1803–1815 in which shifting coalitions of European states fought France under Napoleon. For a time France dominated large parts of Europe but was finally defeated. According to estimates, from just under 3 million up to 5 million soldiers died, many of them from disease. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```
