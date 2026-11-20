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

## Tyskland anfaller Polen (`anfallet-pa-polen`)

- År: 1939 CE · plats: Polen (bland de första striderna: Westerplatte vid Danzig)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/anfallet-pa-polen.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: Germany attacks Poland — Poland (among the first fighting: Westerplatte at Danzig), 1939 CE. What happened (show only this, do not add details): On 1 September 1939 Germany, together with Slovakia, attacks Poland. Among the first fighting is the shelling of Westerplatte at Danzig. Britain and France declare war on Germany on 3 September, and on 17 September the Soviet Union attacks Poland from the east. By 6 October Poland is divided between Germany and the Soviet Union. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Frankrikes fall (`frankrikes-fall`)

- År: 1940 CE · plats: Frankrike och Beneluxländerna (vapenstilleståndet skrevs under vid Compiègne)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/frankrikes-fall.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The fall of France — France and the Benelux countries (the armistice was signed at Compiègne), 1940 CE. What happened (show only this, do not add details): On 10 May 1940 Germany attacks the Netherlands, Belgium, Luxembourg and France. British and French troops are evacuated from Dunkirk, Italy enters the war on 10 June and Paris is taken on 14 June. The armistice is signed at Compiègne on 22 June and takes effect on 25 June 1940. Northern and western France are occupied. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Slaget om Storbritannien (`slaget-om-storbritannien`)

- År: 1940 CE · plats: Luftrummet över Storbritannien och Engelska kanalen
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/slaget-om-storbritannien.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Battle of Britain — The airspace over Britain and the English Channel, 1940 CE. What happened (show only this, do not add details): British air forces defend Britain against the German air force's attacks in the summer and autumn of 1940. It is the first major campaign fought only by air forces. Germany fails to gain air superiority, and Hitler postpones and finally cancels the planned invasion. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Operation Barbarossa (`operation-barbarossa`)

- År: 1941 CE · plats: Västra Sovjetunionen (ett av de första slagen stod vid Brest)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/operation-barbarossa.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: Operation Barbarossa — Western Soviet Union (one of the first battles was at Brest), 1941 CE. What happened (show only this, do not add details): On 22 June 1941 Germany and several of its European allies attack the Soviet Union with more than 3.8 million soldiers. It is the largest military offensive in history and opens the Eastern Front. The operation lasts until 5 December 1941 but does not reach its goals, and the Soviet Union joins the Allies. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Attacken mot Pearl Harbor (`attacken-mot-pearl-harbor`)

- År: 1941 CE · plats: Pearl Harbor, Oahu, Hawaii
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/attacken-mot-pearl-harbor.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The attack on Pearl Harbor — Pearl Harbor, Oahu, Hawaii, 1941 CE. What happened (show only this, do not add details): On 7 December 1941 Japanese aircraft from six aircraft carriers attack the American Pacific Fleet at Pearl Harbor. 2,403 Americans are killed. Within a few hours Japan also attacks, among other places, the Philippines, Malaya, Singapore and Hong Kong. The United States declares war on Japan the next day, and Germany then declares war on the United States. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Slaget vid Midway (`slaget-vid-midway`)

- År: 1942 CE · plats: Havet nära Midwayatollen, Stilla havet
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/slaget-vid-midway.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Battle of Midway — The sea near Midway Atoll, Pacific Ocean, 1942 CE. What happened (show only this, do not add details): On 4–7 June 1942 the American navy defeats a Japanese fleet near Midway. American codebreakers have learned of the attack in advance. Japan loses four aircraft carriers, and its advance in the Pacific is halted. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Andra slaget vid el-Alamein (`andra-slaget-vid-el-alamein`)

- År: 1942 CE · plats: El Alamein, Egypten
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/andra-slaget-vid-el-alamein.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Second Battle of El Alamein — El Alamein, Egypt, 1942 CE. What happened (show only this, do not add details): From 23 October 1942 the British Eighth Army under Bernard Montgomery attacks the German-Italian Panzer Army at El Alamein. After 13 days of fighting the Axis forces have to withdraw from Egypt and Libya. The threat to the Suez Canal and the Middle East is gone. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## D-dagen, landstigningen i Normandie (`d-dagen`)

- År: 1944 CE · plats: Normandies kust, Frankrike
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/d-dagen.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: D-Day, the Normandy landings — The coast of Normandy, France, 1944 CE. What happened (show only this, do not add details): On 6 June 1944 Allied troops, among them American, British and Canadian, are landed from the air and from the sea on five sectors of the Normandy coast. It is the largest seaborne landing in history and the beginning of the liberation of France and Western Europe. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Tyskland kapitulerar (`tysklands-kapitulation`)

- År: 1945 CE · plats: Karlshorst, Berlin
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/tysklands-kapitulation.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: Germany surrenders — Karlshorst, Berlin, 1945 CE. What happened (show only this, do not add details): On 8 May 1945 Germany's supreme military command signs an unconditional surrender in Karlshorst in Berlin, and the war in Europe is over. The day before, Germany had signed a first surrender in Reims, which the Soviet Union did not accept. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Japan kapitulerar, kriget slutar (`japans-kapitulation`)

- År: 1945 CE · plats: Slagskeppet USS Missouri i Tokyobukten, Japan
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/japans-kapitulation.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: Japan surrenders, the war ends — The battleship USS Missouri in Tokyo Bay, Japan, 1945 CE. What happened (show only this, do not add details): On 15 August 1945 Emperor Hirohito announces on the radio that Japan accepts the Allies' terms. On 2 September Japan and nine Allied countries sign the surrender aboard USS Missouri in Tokyo Bay. The Second World War is over. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```
