# Bildpromptar för AI-omgången (#299)

De tio händelserna som inte fick någon fri historisk bild i omgång 1 (se [bilder-saknas.md](bilder-saknas.md)).
Skapade med `python3 tools/bildpromptar.py --out docs/bildpromptar-299.md <id> ...`.

**Så här gör du:**
1. Kopiera en prompt i taget till ChatGPT.
2. Spara bilden som **JPEG** med namnet under "Spara som", till exempel `slaget-vid-gaixia.jpg`.
3. Ladda upp bilderna till mappen `images/incoming/` på GitHub, på en egen gren, eller skicka dem till Claude i chatten.
4. Claude konverterar dem till 800 × 600 och fyller i bildtext ("Illustration i stil med …, inte en historisk bild"), verktyg, datum och prompt.

Prompten innehåller händelsens sammanfattning, som har källa, så att bilden bara visar det som har hänt.

**Stilar:** Korea (koreansk tusch- och färgmålning), det forntida Indien (fornindisk stenrelief), Stilla havets öar (gravyr från en resa i Stilla havet) och nutida krig och samhällshändelser (dokumentär illustration) har egna stilar i `data/styles.json` sedan 2026-10-30.


## Slaget vid Gaixia (`slaget-vid-gaixia`)

- År: 203 BCE · plats: Gaixia i provinsen Anhui (troligen i dagens Guzhen eller sydost om Lingbi)
- Stil: Tuschmålning på silkesrulle (`kina-tusch`)
- Spara som: `images/incoming/slaget-vid-gaixia.jpg`

```text
Style: Chinese ink and wash painting on a silk hand scroll, misty mountains and water, fine brushwork, muted mineral colours. Subject: Slaget vid Gaixia — Gaixia i provinsen Anhui (troligen i dagens Guzhen eller sydost om Lingbi), 203 BCE. What happened (show only this, do not add details): Liu Bang, Han Xin och Peng Yue omringar Xiang Yu vid Gaixia. Han Xin låter sina soldater sjunga sånger från Chu, så att Xiang Yus män tror att deras hemland har gett upp, och många deserterar. Xiang Yu bryter sig ut med en liten skara men tar sitt liv vid floden Wujiang. Det var krigets sista stora slag. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Qi ger upp och Kina enas (`qi-ger-upp-221-fkr`)

- År: 221 BCE · plats: Linzi, staten Qi
- Stil: Tuschmålning på silkesrulle (`kina-tusch`)
- Spara som: `images/incoming/qi-ger-upp-221-fkr.jpg`

```text
Style: Chinese ink and wash painting on a silk hand scroll, misty mountains and water, fine brushwork, muted mineral colours. Subject: Qi ger upp och Kina enas — Linzi, staten Qi, 221 BCE. What happened (show only this, do not add details): Qins armé tar en omväg genom det erövrade Yan och står plötsligt utanför Qis huvudstad Linzi. Kung Tian Jian ger upp utan strid 221 f.Kr. Ying Zheng utropar sig till Shi Huangdi, Kinas förste kejsare. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Sjöslaget vid Noryang (`sjoslaget-vid-noryang`)

- År: 1598 CE · plats: Noryangsundet vid ön Namhae, Korea
- Stil: Koreansk tusch- och färgmålning (`korea-joseon`)
- Spara som: `images/incoming/sjoslaget-vid-noryang.jpg`

```text
Style: Korean Joseon-era ink and colour painting on silk, fine brushwork, muted mineral colours. Subject: Sjöslaget vid Noryang — Noryangsundet vid ön Namhae, Korea, 1598 CE. What happened (show only this, do not add details): Tidigt på morgonen den 16 december 1598 anfaller koreanska och kinesiska skepp under Yi Sun-sin och Chen Lin den japanska flottan i Noryangsundet, när japanerna försöker ta sig hem. Mer än hälften av de japanska skeppen förstörs eller erövras. Yi Sun-sin träffas av en kula och dör. Det är krigets sista stora slag. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Ashoka erövrar Kalinga (`kalinga-erovras`)

- År: 261 BCE · plats: Dhauli vid floden Daya, söder om Bhubaneswar i Odisha (antagen plats)
- Stil: Fornindisk stenrelief (`indien-relief`)
- Spara som: `images/incoming/kalinga-erovras.jpg`

```text
Style: ancient Indian stone relief in the manner of early Buddhist stupa carvings, sandstone, carved figures in shallow relief. Subject: Ashoka erövrar Kalinga — Dhauli vid floden Daya, söder om Bhubaneswar i Odisha (antagen plats), 261 BCE. What happened (show only this, do not add details): Mauryarikets armé besegrar Kalinga, troligen omkring 261 f.Kr. Det avgörande slaget antas ha stått vid kullen Dhauli vid floden Daya. Kriget räknas som ett av de största och blodigaste i Indiens historia. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Éviansavtalen: Algeriet blir fritt (`eviansavtalen`)

- År: 1962 CE · plats: Évian-les-Bains, Frankrike
- Stil: Dokumentär illustration (`dokumentar`)
- Spara som: `images/incoming/eviansavtalen.jpg`

```text
Style: muted documentary editorial illustration, gouache and ink, restrained colours, as in a 1970s news magazine. Subject: Éviansavtalen: Algeriet blir fritt — Évian-les-Bains, Frankrike, 1962 CE. What happened (show only this, do not add details): Den 18 mars 1962 kommer Frankrike och FLN:s exilregering överens i Évian, där Krim Belkacem undertecknar för den algeriska sidan. Avtalen ger eldupphör från den 19 mars, frigivning av fångar och full självständighet för Algeriet efter en folkomröstning. Den 1 juli röstar nästan alla algerier för självständighet, och Algeriet blir självständigt den 3 juli 1962; den 5 juli firas som självständighetsdag. Under tiden fortsätter OAS med hundratals bombdåd i Algeriet. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Slaget vid Nuʻuanu (`slaget-vid-nuuanu`)

- År: 1795 CE · plats: Nuʻuanudalen och Nuʻuanu Pali, Oʻahu
- Stil: Gravyr från en resa i Stilla havet (`stilla-havet-gravyr`)
- Spara som: `images/incoming/slaget-vid-nuuanu.jpg`

```text
Style: late 18th- or 19th-century engraving from a Pacific voyage account, fine line work, sepia. Subject: Slaget vid Nuʻuanu — Nuʻuanudalen och Nuʻuanu Pali, Oʻahu, 1795 CE. What happened (show only this, do not add details): I maj 1795 landstiger Kamehamehas armé vid Waikīkī och driver Kalanikūpules styrkor uppför Nuʻuanudalen. Vid klippan Nuʻuanu Pali faller eller knuffas över 700 krigare från Oʻahu utför stupet. På hawaiiska kallas slaget Kalelekaʻanae, "den hoppande multen". Efter segern kallas Kamehamehas rike för första gången kungariket Hawaiʻi. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Bougainville utropar självständighet (`bougainville-utropar-sjalvstandighet`)

- År: 1990 CE · plats: Bougainville, Papua Nya Guinea
- Stil: Dokumentär illustration (`dokumentar`)
- Spara som: `images/incoming/bougainville-utropar-sjalvstandighet.jpg`

```text
Style: muted documentary editorial illustration, gouache and ink, restrained colours, as in a 1970s news magazine. Subject: Bougainville utropar självständighet — Bougainville, Papua Nya Guinea, 1990 CE. What happened (show only this, do not add details): I början av 1990 drar Papua Nya Guinea tillbaka sina styrkor och lämnar Bougainville till BRA. I maj 1990 utropar Francis Ona ensidigt självständighet och bildar en interimsregering med sig själv som president. Regeringen svarar med en blockad av ön som varar till vapenvilan 1994, och på vissa håll till 1997. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Sista avrättningen med giljotin (`sista-giljotinen`)

- År: 1977 CE · plats: Baumettesfängelset, Marseille, Frankrike
- Stil: Dokumentär illustration (`dokumentar`)
- Spara som: `images/incoming/sista-giljotinen.jpg`

```text
Style: muted documentary editorial illustration, gouache and ink, restrained colours, as in a 1970s news magazine. Subject: Sista avrättningen med giljotin — Baumettesfängelset, Marseille, Frankrike, 1977 CE. What happened (show only this, do not add details): Hamida Djandoubi avrättas med giljotin i Marseille den 10 september 1977. Han blir den siste som avrättas i Frankrike innan dödsstraffet avskaffas 1981. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Taiping intar Nanjing (`nanjing-blir-tianjing-1853`)

- År: 1853 CE · plats: Nanjing, Kina
- Stil: Tuschmålning på silkesrulle (`kina-tusch`)
- Spara som: `images/incoming/nanjing-blir-tianjing-1853.jpg`

```text
Style: Chinese ink and wash painting on a silk hand scroll, misty mountains and water, fine brushwork, muted mineral colours. Subject: Taiping intar Nanjing — Nanjing, Kina, 1853 CE. What happened (show only this, do not add details): Den 19 mars 1853 erövrar taipingarmén Nanjing efter knappt två veckors belägring. Hong Xiuquan gör staden till sin huvudstad och kallar den Tianjing, "den himmelska huvudstaden". Den manchuiska garnisonen och dess familjer dödas. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```

## Upproret i Goma inleder kriget (`upproret-i-goma-1998`)

- År: 1998 CE · plats: Goma i provinsen Nordkivu, östra Kongo
- Stil: Dokumentär illustration (`dokumentar`)
- Spara som: `images/incoming/upproret-i-goma-1998.jpg`

```text
Style: muted documentary editorial illustration, gouache and ink, restrained colours, as in a 1970s news magazine. Subject: Upproret i Goma inleder kriget — Goma i provinsen Nordkivu, östra Kongo, 1998 CE. What happened (show only this, do not add details): Den 2 augusti 1998 gör banyamulengesoldater i Goma uppror mot president Kabila, med stöd av Rwanda. Samma månad bildas rebellgruppen RCD med stöd av Rwanda och Uganda, och den tar snabbt kontroll över stora delar av östra Kongo, bland annat städerna Bukavu och Uvira. Den 23 augusti faller Kisangani. I Kinshasa uppviglar regeringen till våld mot tutsier. historical illustration, not a photograph, does not look like a real historical document, no text, no letters, no watermark, highly detailed, rich texture, 4:3 landscape format. Respect: never depict the Prophet Muhammad; no caricatures of peoples; convey mood and setting rather than invented details.
```
