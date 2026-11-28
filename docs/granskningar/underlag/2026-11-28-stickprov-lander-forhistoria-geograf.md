# Stickprov före releasen: länder, förhistoria och geografi (2026-11-28)

Experter: `historiker` (länder och pilotländer), `forhistoriker`, `geograf`. Alla read-only; källor öppnade med WebFetch/WebSearch (Wikipedia, regeringen.se, UNESCO m.fl.). Wikidata öppnades inte. Underlag till [release-6-6-0-forberedelse-2026-11-28.md](../release-6-6-0-forberedelse-2026-11-28.md).

## Siffror

| Expert | Granskade | Fel | Fel per tio | Tröskel (>1 per tio) |
|---|---|---|---|---|
| historiker, länder | 44 händelser (Etiopien 7, Peru 8, Australien 9, Japan 8, Italien 1, Grekland 1, övriga 15) | 1 | 0,2 | Under |
| forhistoriker | 29 uppgifter | 2 | 0,7 | Under (inget mönster; återkommande: BP omräknat utan att säga om åren är kalibrerade) |
| geograf | cirka 70 (28 landskort/noter, 43 koordinater) | 0 | 0 | Under |

Fel i historikerns stickprov räknades som den enda sifferuppgiften (se `kvinnor-rostar-1946`/Sipán nedan); övrigt är Förbättring eller Notering.

## Historiker, länder

| fil | id | problem | förslag | nivå |
|---|---|---|---|---|
| 1980-.json | sipan-graven-upptacks-1987 | "från omkring år 300 enligt kol-14-datering" stöds inte av öppnade källor (Huaca Rajada: guld AD 50–300, platsen 50–700) | Hitta källa för kol-14 eller skriv "Moche-tiden, cirka 50–300" | **Fel** (påstående utan stöd) |
| 1946-1979.json | kvinnor-rostar-1946 | 466 (Nippon.com) mot 468 mandat (Wikipedia); står inte | `note` "Källorna skiljer sig" eller "cirka 8,4 procent" | Förbättring |
| 1-1499.json | ise-helgedomen-byggs-om | 690 (helgedomen) mot 692 (Wikipedia) | `note` | Förbättring |
| 1946-1979.json | derg-avsatter-haile-selassie-1974 | "omkring 120 lägre officerare" (andra källor 109–110); "kommunistisk stat" är tolkning | "110–120", "socialistisk" | Förbättring |
| 1980-.json | kvinnlig-rostratt-i-schweiz-1971 | "elva kvinnor" (de.wikipedia) mot 10 (en.wikipedia) | `note` | Förbättring |
| 1500-1799.json | tupac-amaru-ii-upproret-1780 | Slutdatum 1782/1783 skiljer sig i källan | `note` | Notering |
| 1900-1945/1946-1979.json | huascaran-jordskalv-1970 | Raset 15 000–30 000 enligt olika källor, texten "över 18 000" | Visa spannet | Notering |
| data/sources.json | `wikidata` | 548 av 727 `two-sources`-händelser (74 av 189 nya) har som andra källa bara `https://www.wikidata.org/` (rotsidan), inte Q-posten | Rätta url per händelse eller dokumentera att fältet `wikidata` gäller | Förbättring |

Kontrollerat utan anmärkning: Australien (urfolkshändelserna är sakliga, namn och årtal stämmer), Etiopien, övriga Peru och Japan, Italien (kungariket utropas), Meteora (UNESCO-sidan gav 403; indirekt via sökträff), 15 händelser i övriga länder. **Japan, Kurilerna och Dokdo/Takeshima:** regeringen.se (Utrikesdeklarationen 2026) nämner varken Kurilerna eller Dokdo/Takeshima; notan i `platser.json` ("Sverige har ingen uttalad hållning som vi hittat", kortet visar kontrollen, inte tillhörigheten) stämmer med policyn.

Luckor (egna räkningar per ort, ungefärliga): Grekland 0 händelser 1501–1799; Italien 0 efter 1900; Japan 2 i antiken; Peru 2 på 1800-talet; Etiopien 3 mellan 501 och 1500; Australien 2 mellan 501 och 1500.

Kunde inte kontrolleras: Wikidata; whc.unesco.org/list/455 (403); Ainu-lagens PDF; Riga, Vilnius, Estland, Lettland, Litauen, Nederländerna, Österrike, Slovakien och landskorten i övrigt (44 av cirka 600 nya); Lima–Callao "knappt tio kilometer", quechuadekretet 21156.

## Förhistoriker

Öppnade 30 Wikipedia-sidor (bland annat Egyptian hieroglyphs, Indus script, Cretan hieroglyphs, Zapotec script, Kadero, Dabous Giraffes, Guitarrero, Valdivia, Real Alto, Rotoma Caldera, Danger Cave, Twyfelfontein, Adrar Bous). I sin ordning: hieroglyferna, Indusskriften, kretensiska hieroglyfer, Turkana, Dabous, Valdivia, Tabon (föredömlig not), m.fl.

| fil | id | problem | förslag | nivå |
|---|---|---|---|---|
| fkr.json | hallristningarna-i-twyfelfontein | `end` 1000 e.Kr. finns inte i källan (säger "cirka 6 000 år" och att khoikhoiherdar kom senare); spannet är delvis uppfunnet | Ta bort slutåret eller öppet slut, `note` | **Fel** |
| fkr.json | gravhogen-vid-lanse-amour | Spannet 6350–5550 f.Kr.; källan ger högen 7 500–7 700 år (cirka 5750–5550 f.Kr.); 6350 gäller aktivitet i trakten | Spann cirka 5750–5550 f.Kr. | **Fel** |
| fkr.json | simmarnas-grotta (#2217) | Bekräftat: `start`=`end`=-7999, källan säger bara "estimated ... as early as 8000 BC"; texten är hedgad och rätt | Spann eller markerad tidigaste uppskattning, `note` att metod saknas | Förbättring |
| fkr.json | boskapsskotare-i-kadero | BP-spann omräknat utan att säga om kalibrerat | `note` | Viktigt |
| fkr.json | tenereanska-boskapsherdar | 4600 f.Kr. (Gobero) mot 5000–2500 f.Kr. (wp-tenerian-culture, Adrar Bous) utan not | "Källorna skiljer sig" | Viktigt |
| fkr.json | champlainhavet | Okalibrerat kol-14 och reservoareffekt | `note`, helst forskningskälla | Viktigt |
| fkr.json | bisonjakten-vid-olsen-chubbuck | 8000–6500 f.Kr.; Xronos (kalibrerat) ger cirka 8750–8420 f.Kr. | Notera skillnaden; verifiera "pil och båge" | Förbättring |
| fkr.json | bumerangen-i-wyrie-swamp, fiskare-vid-banwari-trace, zapotekisk-skrift | Osäkerhet i dateringen eller två fynd blandade (San Andrés i Tabasco vs Monument 3) | Not eller dela | Notering |
| fkr.json | hieroglyferna-i-egypten | "3300-talet f.Kr." fel sekel (se #2460); källan: andra hälften av 4000-talet, Abydos 3400–3200 | "omkring 3300 f.Kr." | Notering (Fel i prosan, bekräftat) |

Luckor (tackning-2026-11-28.md): Förhistoria × Amerika 33 händelser (väntat 254), × Asien 62 (261), × Afrika 45 (181), × Oceanien 23 (54); tomma kategorier krig, sport och rymden överallt, upptäckter i Amerika. Kunde inte kontrollera: Las Vegas-kulturen och Paloma (404), Olsen–Chubbuck på Wikipedia (404), Wadi Sura (404), Wikidata, kalibreringen i Kadero, Champlain och Wyrie Swamp.

## Geograf

0 Fel. Gränserna kommer ur Natural Earth (public domain) och Cliopatria (CC BY 4.0), ingen NC. 36 av 37 jämförda koordinater stämde inom cirka 1 km (undantag stenverktyg-afar, tolkning).

| fil | id | problem | förslag | nivå |
|---|---|---|---|---|
| platser.json | japan | Konturen saknar Ogasawara, Yonaguni och Senkaku; Senkaku är ett tredje omstritt område som inte står i omstridda-granser.md | Mening i `introNotes`; fall 17 om DasKrokodil vill | Förbättring |
| platser.json | finland | Åland saknas i konturen; `aldsta-hona-i-finland-pa-aland` ligger 70 km från konturen och hör inte till något kort (`INCLUDE_MAX_KM` 5) | Nämn i noten eller bygg Ålandskort senare | Förbättring |
| platser.json | skane | Konturen från perliedman/svenska-landskap; CC0 belagd bara via repots README, Geotorgets villkor inte öppnade | Lägg Geotorgets villkor i `sources.json` | Notering |
| platser.json | australien, norge | Christmas/Cocos/Heard/Norfolk resp. Bouvetön ingår inte; noten säger inget | Nämn | Notering |
| omstridda-granser.md | fall 15–16 | Stämmer med regeringen.se; Japan-landssidan kan läggas som uppräknad källa | Lägg till | Notering |

Luckor: Europa 849 av 2 110 händelser (40 %; landyta 8 %). 28 landskort, varav 23 i Europa; saknar landskort: Kina 67 händelser, USA 61, Mexiko 48, Egypten 44, Indien 43, Ryssland 35, Irak 29, Sydafrika 26, Spanien 22 (grov träff på `place.sv`). Antiken har 0 riken i Amerika och Oceanien, medeltid 0 i Oceanien. Kunde inte kontrollera: Wikidata, Geotorget, Cliopatria-gränser per år för nya rikesperioder, koordinater för Wyrie Swamp, Paloma och Tamar Valley.
