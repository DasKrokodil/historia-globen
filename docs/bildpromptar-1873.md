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

## Första världskriget (`forsta-varldskriget`)

- År: 1914 CE · plats: Europa, Mellanöstern, Afrika, Stilla havet och Atlanten (började vid Belgrad, Serbien)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/forsta-varldskriget.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The First World War — Europe, the Middle East, Africa, the Pacific and the Atlantic (began at Belgrade, Serbia), 1914 CE. What happened (show only this, do not add details): A worldwide war in 1914–1918 between the Allies (the Entente) and the Central Powers. It is among the deadliest wars in history: an estimated 15–22 million soldiers and civilians died. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Skotten i Sarajevo (`skotten-i-sarajevo`)

- År: 1914 CE · plats: Vid Latinska bron i Sarajevo, Bosnien och Hercegovina (då Österrike-Ungern)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/skotten-i-sarajevo.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The shots in Sarajevo — At the Latin Bridge in Sarajevo, Bosnia and Herzegovina (then Austria-Hungary), 1914 CE. What happened (show only this, do not add details): On 28 June 1914 the Bosnian Serb student Gavrilo Princip shoots Austria-Hungary's heir to the throne Franz Ferdinand and his wife Sophie in Sarajevo. The murder sets off the July Crisis, which a month later leads to war. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Slaget vid Tannenberg (`slaget-vid-tannenberg-1914`)

- År: 1914 CE · plats: Nära Allenstein (Olsztyn), Ostpreussen (i dag Polen)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/slaget-vid-tannenberg-1914.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Battle of Tannenberg — Near Allenstein (Olsztyn), East Prussia (today Poland), 1914 CE. What happened (show only this, do not add details): In late August 1914 a German army surrounds and crushes almost the whole Russian 2nd Army in East Prussia. The battle is fought near Allenstein but is named after Tannenberg, about thirty kilometres to the west. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Första slaget vid Marne (`forsta-slaget-vid-marne`)

- År: 1914 CE · plats: Floden Marne öster om Paris, Frankrike
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/forsta-slaget-vid-marne.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The First Battle of the Marne — The Marne river east of Paris, France, 1914 CE. What happened (show only this, do not add details): In September 1914 French and British troops stop the German advance about forty kilometres from Paris. Germany's plan to defeat France quickly fails, and the Western Front becomes bogged down in trench warfare that lasts four years. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Belägringen av Tsingtao (`belagringen-av-tsingtao`)

- År: 1914 CE · plats: Qingdao (Tsingtao), tyskt arrendeområde i Kina
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/belagringen-av-tsingtao.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Siege of Tsingtao — Qingdao (Tsingtao), a German leased territory in China, 1914 CE. What happened (show only this, do not add details): From 27 August to 7 November 1914 Japanese and British forces besiege the German port city of Qingdao in China. It is the war's only major land battle in Asia and the Pacific. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Slaget vid Tanga (`slaget-vid-tanga`)

- År: 1914 CE · plats: Tanga, Tyska Östafrika (i dag Tanzania)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/slaget-vid-tanga.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Battle of Tanga — Tanga, German East Africa (today Tanzania), 1914 CE. What happened (show only this, do not add details): On 3–5 November 1914 a British-Indian force tries to take the port of Tanga in German East Africa, but is beaten back by a smaller German force under Paul von Lettow-Vorbeck. It is the first major battle in the East African campaign. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Gallipolifälttåget (`gallipolifalttaget`)

- År: 1915 CE · plats: Gallipolihalvön vid Dardanellerna, Osmanska riket (i dag Turkiet)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/gallipolifalttaget.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Gallipoli campaign — The Gallipoli Peninsula at the Dardanelles, Ottoman Empire (today Turkey), 1915 CE. What happened (show only this, do not add details): The Allies try to take control of the straits to Constantinople. The fleet fails in March 1915, and the troops who land on the peninsula in April are withdrawn in January 1916 after about 250,000 killed, wounded and captured on each side. The day of the landing, 25 April, is today Anzac Day in Australia and New Zealand. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Belägringen av Kut (`belagringen-av-kut`)

- År: 1915 CE · plats: Kut al-Amara i Mesopotamien, Osmanska riket (i dag Irak)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/belagringen-av-kut.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Siege of Kut — Kut al-Amara in Mesopotamia, Ottoman Empire (today Iraq), 1915 CE. What happened (show only this, do not add details): From December 1915 Ottoman troops besiege a British-Indian garrison in the town of Kut, south of Baghdad. The garrison surrenders on 29 April 1916, and many of the prisoners die on the march into captivity in Aleppo. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Skagerrakslaget (slaget vid Jylland) (`slaget-vid-jylland`)

- År: 1916 CE · plats: Nordsjön utanför Jylland, Danmark
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/slaget-vid-jylland.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Battle of Jutland (Skagerrak) — The North Sea off Jutland, Denmark, 1916 CE. What happened (show only this, do not add details): On 31 May–1 June 1916 the British and German fleets meet in the largest naval battle of the war. 14 British and 11 German ships are sunk. Both sides claim victory, but the German fleet afterwards avoids new major naval battles. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Slaget vid Somme (`slaget-vid-somme`)

- År: 1916 CE · plats: Vid floden Somme, norra Frankrike
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/slaget-vid-somme.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Battle of the Somme — At the Somme river, northern France, 1916 CE. What happened (show only this, do not add details): From 1 July to 18 November 1916 British and French armies attack the German lines at the Somme. Over three million soldiers take part, and more than a million are killed or wounded. Tanks are used for the first time in September. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## USA går in i kriget (`usa-gar-in-i-forsta-varldskriget`)

- År: 1917 CE · plats: Kongressen i Washington, D.C., USA
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/usa-gar-in-i-forsta-varldskriget.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The United States enters the war — Congress in Washington, D.C., USA, 1917 CE. What happened (show only this, do not add details): On 6 April 1917 the US Congress declares war on Germany. Germany had resumed unrestricted submarine warfare, and the Zimmermann Telegram, a secret German offer to Mexico, had outraged Americans. American troops begin to arrive in Europe the same year. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Freden i Brest-Litovsk (`freden-i-brest-litovsk`)

- År: 1918 CE · plats: Brest-Litovsk (i dag Brest, Belarus)
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/freden-i-brest-litovsk.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Peace of Brest-Litovsk — Brest-Litovsk (today Brest, Belarus), 1918 CE. What happened (show only this, do not add details): On 3 March 1918 Soviet Russia makes a separate peace with the Central Powers and leaves the war. Russia loses, among other things, Ukraine, Poland, Belarus and the Baltic countries. The peace is annulled by the armistice in November the same year. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Vapenstilleståndet i Compiègne (`vapenstillestandet-1918`)

- År: 1918 CE · plats: Compiègneskogen, Frankrike
- Stil: Affisch i art deco och tidig modernism (`affisch`)
- Spara som: `images/incoming/vapenstillestandet-1918.jpg`

```text
Style: early 20th-century poster art, art deco and early modernism, bold geometric shapes, flat colour areas, strong diagonals, lithographic print texture. Subject: The Armistice at Compiègne — The forest of Compiègne, France, 1918 CE. What happened (show only this, do not add details): The armistice between the Entente and Germany is signed in a railway carriage in the forest at Compiègne and takes effect at 11 o'clock on 11 November 1918. The fighting stops, and the war is over. Peace is made at Versailles on 28 June 1919. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```
