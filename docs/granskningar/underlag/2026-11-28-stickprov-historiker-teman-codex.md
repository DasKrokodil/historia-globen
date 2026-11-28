# Stickprov: teman och Codex-pull requests (2026-11-28)

Expert: `historiker` (read-only), källor öppnade med WebFetch/WebSearch. Cirka 65 uppgifter: 25 teman (Språk och skrift, Ordens vandring), 17 Förintelsen, 16 Codex-PR:er (#2430, #2441, #2432), 7 klimat 1501–1799 och Europa 1792–1870.

## Fel per tio

| Stickprov | Granskat | Fel | Per tio | Tröskel (>1 per tio) |
|---|---|---|---|---|
| Teman (Språk och skrift, Ordens vandring, Herero) | 25 | 3 | 1,2 | **Över** |
| Förintelsen som förlopp | 17 | 0 | 0 | Under |
| Codex-PR:er (#2430, #2441, #2432) | 16 | 3 | 1,9 | **Över** |
| Klimat 1501–1799 | 5 | 0 | 0 | Under |
| Europa 1792–1870 | 2 | 0 | 0 | Under |

**Mönster (för DasKrokodils beslut enligt beslutet 2026-11-28):** i teman är felen skalfel i svensk formulering (hieroglyferna, "3300-talet"), en tidsangivelse som inte stämmer med källan (Herero 2015) och en felaktig källhänvisning (kakao). Inga påhittade uppgifter. I Codex-PR:erna sitter alla tre felen i #2441 (bildstilarna i `data/styles.json`: tidsspann och region går längre än källorna); #2430 (Timrå) och #2432 (samiska landskap) hade 0 Fel. Urvalet är litet (16 uppgifter), så siffran är ett varningstecken och inget mått.

## Fynd

| fil | id | problem | förslag | nivå |
|---|---|---|---|---|
| fkr.json (rad 1183) | hieroglyferna-i-egypten | **#2460 bekräftat.** "3300-talet f.Kr." = 3399–3300; källan (Egyptian hieroglyphs) säger 33rd century BC = 3300–3201 och Abydos cirka 3400–3200. Samma fel i notens svenska text ("Naqada III, 3300-talet"). en/de/es/fr säger ordningstal; tyskan har dock 33 i st.f. 34 (se översättningspasset) | sv: "omkring 3300 f.Kr." i summary och note | **Fel** |
| 1900-1945.json | herero-och-nama-folkmordet | "Tyskland erkände 2015 att det var ett folkmord" stämmer inte som skrivet (se nedan) | "Sedan 2015 kallar tyska företrädare det folkmord; 2021 enades regeringarna om en gemensam förklaring som ännu inte är klar" | **Fel** |
| funfacts.json | ordens-vandring-kakao | Enda källan `wp-cocoa-bean` nämner inte mokaya eller 1900–1500 f.Kr.; det bärs av `wp-mokaya` (står i händelsen, inte i funfacten) | Lägg `wp-mokaya` i `sources`; överväg att nämna Ecuador (minst 5 300 år) | **Fel** (källhänvisning) |
| data/styles.json | yoruba (1000–1826, ife-oyo) | Ogundiran (Cambridge): Ife-glaspärlor cirka 1000–1400; inget slutår 1826; stilen läggs även på Oyo 1608 | Begränsa `to` eller dela stilen | **Fel** (#2441) |
| data/styles.json | sahel (1280–1900) | Källan har både 1238 och 1280 för Djenné; slutår 1900 saknas | Skriv avvikelsen öppet, motivera slutåret | **Fel** (#2441) |
| data/styles.json | akan (1500–1899) | Met-posterna 317673/317676 gav 429; spannet okontrollerat | Öppna posterna och datera | Kunde inte kontrolleras (#2441) |
| empires/tyska-forbunden.json | rhenforbundet | Cliopatria 1809–1814, Wikipedia 1806–1813 | `uncertainBorder`-not | Förbättring |
| empires/habsburgska-riket.json | osterrikiska-kejsardomet | 1806 (Cliopatria) mot 1804 | Not; fransk-gruppens placering under "Franska kolonialväldet" kan förvirra | Förbättring |
| 1900-1945.json | novemberpogromen-1938 | "Minst 91 mördas ... hundratals" underskattar; moderna uppskattningar cirka 1 000–2 000 inklusive följdoffer | "Minst 91 mördades direkt; med följderna uppskattas flera hundra till tusentals" | Förbättring |
| 1-1499.json | guldet-i-timra | Historiska museet säger "nära Sundsvall"; koordinaten ändrad 400 m utan förklaring | Notera att Timrå är vår tolkning | Notering (#2430) |

## Herero och Nama (#2194): vad som hände

Öppnade: bpb, Auswärtiges Amt (28.05.2021), bundesregierung.de, Wikipedia.
- **Juli 2015:** Bundestagspräsident Lammert kallade brotten folkmord; kort därefter Auswärtiges Amt. Uttalanden, inte en officiell regeringsförklaring. Ett officiellt Tyskland-erkännande 2015 belägger ingen öppnad källa.
- **Slutet av 2015:** förhandlingar med särskilda sändebud.
- **28 maj 2021:** Auswärtiges Amt: enighet om att händelserna ska kallas folkmord, Tyskland ska be om förlåtelse, 1,1 miljarder euro till återuppbyggnad; inga rättsliga ersättningskrav.
- **Därefter:** den gemensamma förklaringen paraferades 2021, förhandlingar pågår, ingen öppnad källa visar att den är undertecknad; många herero- och namagrupper avvisar överenskommelsen.
- Dödstalen (40 000–80 000 herero, cirka 10 000 nama) kontrollerades inte; bundesregierung anger cirka 100 000 döda.

## Stämde (öppnade källor)

Språk och skrift: Jikji (1377), Diamantsutran (868), orakelben, Garima, Hangul, Cherokee, Champollion, Linear B, Maya, Rosettastenen, Maddrell, Esenç, litauiska förbudet; räkningarna i fun facts `jikji-gutenberg`, `hangul-gutenberg`, `cherokee-champollion`, `linear-b-maya-1952`, `skrift-uruk-egypten` går ihop. Ordens vandring: potatis, kanot (1493), siffra (kedjan śūṇya–ṣifr–cifra, Liber Abaci 1202) stämmer med notering om osäkra etymologier. Förintelsen: 17 händelser (Warszawas getto, Treblinka, Chełmno, Wannsee, Bełżec, Sobibór, Lety, Ungern, Vel' d'Hiv m.fl.) stämmer mot USHMM och Wikipedia. Klimat: Huaynaputina, 1709, Muellerglaciären, Malawisjön. #2432: Ájtte 1989, landsmötet 1918, samiska och finska landskapsnamn.

## Luckor (saknas)

- Temat `sprak-skrift`: `indusskriften`, `kretensiska-hieroglyfer`, `rongorongo`, `grotefend-och-fornpersisk-kilskrift`, `shuowen-jiezi`, `johnsons-ordbok`, `koptiska-alfabetet` ligger som händelser men inte i temat; arabisk skrift och brahmi/devanagari saknas som händelser (kontrollpunkt, ej belagt). 15 av 37 temahändelser i Europa, Afrika 4, Oceanien 1.
- Europa 1792–1870: kvarvarande luckor står i docs/granskningar/2026-11-28-europa-1792-1870.md. Tidigmodern tid: Asien 39 och Afrika 35 mot Europa 139.

Kunde inte kontrolleras: Met-posterna för Akan (429), Wikidata (delvis), Marie Smith Jones dödsdatum, Évians startdatum, Nürnberglagarna, Łódź, Babyn Jar, Birkenau, Nürnbergrättegången, kilskriften/Uruk m.fl.
