# historiker (del B): granskning före v6.5.0

## Omfattning och stickprov
Jämförelsepunkt 1a981da0, HEAD 1bd96bae. Inga filer i repot ändrade.
- **Underlag hämtat:** Cliopatria v0.2.1 (Zenodo post 23128623, zip med `cliopatria_polities_only_v021.geojson`, 13 797 poster) till scratchpad. Jämförelsen gjordes maskinellt mot repots data.
- **Riken, nya (36 av 36 filer, 37 delar):** namn på fem språk, år, Wikidata-id och källa jämförda mot Cliopatria. Wikidata via SPARQL för alla 37 id (etikett, P31, P571, P576). Engelska Wikipedias faktaruta (year_start/year_end) öppnad för 16: Shang, Shunga, Funan, Goguryeo, Cao Wei, Western Satraps, Greco-Bactrian Kingdom, Chu, Kingdom of Armenia (antiquity), Nogai Horde, Khanate of Kazan, Astrakhan Khanate, Crown of Aragon, Mamluk dynasty (Delhi), Second Saudi state och Seuna dynasty. Rutan "Om kartan" (sv) läst för 27 av 37. Alla årtal och "Källorna skiljer sig"-rader jag prövade stämde med de öppnade källorna.
- **Riken, ändrade (79 filer):** id, år och namn jämförda för alla delar, före mot nu. Alla 19 bytta Wikidata-id (#2005) kontrollerade i Wikidata: alla nya id pekar på rätt stat. **Hela registret (494 unika id i 508 delar)** prövat i Wikidata: förgreningssidor, fel typ och livslängd som inte stämmer med våra år.
- **Cliopatrias f.Kr.-år (#1989):** alla 530 periodgränser före år 1 i alla rikesfiler jämförda med Cliopatrias gränser omräknade till `1 - N`. 527 stämmer. De tre som avviker är handklippta efter källorna och står i GROUPS och i Om kartan: ptolemaiska-riket start -304, shangdynastin slut -1045, sunga slut -72. Eget stickprov på 14 riken (Maurya, Qin, Romerska kungadömet, Romerska kejsardömet, Seleukidriket, Akemenidiska riket, Kartago, Hanriket, Nybabyloniska riket, Partherriket, Shang, Chu, Sunga, Grekisk-baktriska riket): första och sista år stämmer med omräkningen. `tests/cliopatria-ar-test.py` går igenom.
- **Särskilda ändringar:** Rhenlandet (#1766), Kina 1916–1929 (#1507), Tyskland (#1706) och delade gränser (#1765). Prövade med punkt-i-polygon (Charlottenburg 1960 och 1974, Leipzig 1960, Saarbrücken 1925/1946/1952/1957/1960, Oslo och Trondheim 1942, Vaxholm 1940, Mainz/Trier/Kaiserslautern 1925; koordinater ur Wikidata och ur `tests/riken-kontrollpunkter-test.py`). `tests/riken-kontrollpunkter-test.py`: 1260 punkter, alla stämmer. Kina: en.wikipedia "Empire of China (1915–1916)" öppnad.
- **Spanska och franska rikesnamn (#2002, #2007):** 15 delar jämförda med Wikidatas es- och fr-etiketter och webbplatslänkar. Namnen på de 37 nya delarna lästa på de, es och fr.
- **Flaggor (62 nya filer, alla kopplade i index.json):** för alla 62 lästa jag år, bildtext och källornas licens i sources.json. Antagandeår kontrollerade i en.wikipedias faktaruta för 18 filer: Zambia 1964 och 1996, Belize 1981 och 2019, Belarus 1991, 1995 och 2012, Irak 1959, 1963 och 2008, Paraguay, Turkmenistan, Burkina Faso, Libanon 1943, Ecuador, Kazakstan, Bulgarien 1948 och Kungariket Ungerns dubbelkors. Filsidan på Commons öppnad för 7 filer: Irak 2004–2008, Béla III:s vapen, Bulgarien 1948, Makedonien 1992, Tanganyika, Georgien 1918 och Rwanda 1961. Licensraden i SVG-filen för dubbelkorset läst. Commons API svarade 429 på allt, så resten av licenserna är lästa ur `data/sources.json` och inte på filsidan.
- **Religionslagret (#2139/#1375):** alla rikens religion i `data/religions.json` jämförd, före mot nu. en.wikipedia "Northumbria" och "Brittonic languages" öppnade.
- **Kontrollerat utan fynd:**
  - **Rhenlandet 1920–1929** är Weimarrepubliken: Mainz, Trier och Kaiserslautern 1925. Om kartan säger öppet att källorna skiljer sig om när zonerna lämnades.
  - **Kina:** Kejsardömet Kina 1916 stämmer med en.wikipedia (12 december 1915–22 mars 1916, "Unrecognized state"). Att källorna skiljer sig om åren står i Om kartan, och 1917–1929 är tomt enligt beslutet.
  - **Tyskland (#1706):** Västberlin är utan stat 1960 och 1974, Saar ligger i Västtyskland 1960, och inga bitar av Nazityskland finns vid Vaxholm 1940.
  - **Ändringarna av Wikidata-id i #2005** är alla rätt (19 av 19).
  - **De 36 nya rikena:** inga fel i år, namn eller id.
  - **Nordmakedoniens Verginasol** 1992–1994 stämmer med Commons (1992–1995, PD, GFDL och CC BY-SA 3.0).
  - **Dubbelkorset:** härledningen ur CC BY-SA 4.0 har rätt licens och kredit i SVG-filen.
- **Luckor:** `tools/tackning_riken.py` mot Cliopatria v0.2.1 (se nedan).

## Blockerande
Inga.

## Bör rättas
1. **Religionslagret: anglosaxiska riken och bretonska (brittiska) riken visas med "Germansk och nordisk religion" långt efter kristnandet.**
   - **Var:** `data/religions.json`, religionen `germansk`, ögonblicksbilderna 650–949. Kingdom of Kent finns kvar 750–799, och Mercia, Northumbria och Wessex 850–949. **Ny följd av #2139:** "(Brythonic Kingdoms)" och "Brythons" ärver 900–1099 Northumbrias religion (`inherited.from: Kingdom of Northumbria`) och har bytt från `folkreligion` till `germansk`. Det står inte i PR-tabellen, som säger "18 riken och inga andra".
   - **Bevis:** Faktarutan i en.wikipedia "Northumbria" (öppnad 2026-11-21) säger "Paganism (before 635 A.D.) / Christianity (after 635 A.D.)". Kents faktaruta enligt PR:en själv säger "Anglo-Saxon paganism (before 7th century); Chalcedonian Christianity (after 7th century)". Brittonic languages (en.wikipedia) är keltiska språk, så de brittiska rikena hör inte till germansk religion.
   - **Vad besökaren ser:** visas streckat som osäkert, men det är fel enligt källan själv. Riket var förut grått ("Annan traditionell religion"), vilket också var fel men inte pekade ut någon religion.
   - **Förslag:** ge de anglosaxiska rikena ett år för kristnandet (`christianSince`/source) ur deras faktarutor: Northumbria 635, Kent 600-talet med källans år och så vidare. Då ärver de brittiska rikena kristendom efter 899. Bygg om med `tools/religioner.py` och `tools/religioner_riken.py`.
   - **Vem:** Claude Code (Opus, fakta), nytt issue. Om det är billigt bör det göras före releasen; annars en rad i release-PR:en.
2. **romerska-republiken har fel Wikidata-id: Q175881.**
   - **Var:** `data/empires/romarriket.json`.
   - **Bevis:** Wikidata SPARQL 2026-11-21: Q175881 är "republic at Italy between 1798–1799" (systerrepublik, P571 1798). Antikens republik är Q17167 ("period of ancient Roman civilization (509 BC–27 BC)"). Felet kommer från Cliopatria (Roman Republic → Q175881) och missades i #2005. Punkt 3 i #2005 (att gå igenom alla id) blev inte gjord.
   - **Synligt?** Inte nu: ingen JS läser rikenas `wikidata`, bara händelsernas (js/ui/panel.js:981). Men id:t publiceras i data under CC BY.
   - **Mitt svep:** jag har gått igenom alla 494 id. Det här är det enda klara felet (inga förgreningssidor finns kvar).
   - **Förslag:** `'wikidata': 'Q17167'` på Roman Republic i `tools/riken.py` GROUPS, och bygg om.
   - **Vem:** Claude Code, litet issue.
3. **Saarprotektoratet 1946–1956 ritas som Frankrike (frankrike-fjarde-republiken), utan rad i Om kartan.** Felet är inte nytt i releasen: #1706 rättade bara åren från 1958.
   - **Var:** frankrike-fjarde-republiken (franska-kolonialvaldet). Punkt-i-polygon: Saarbrücken 1946, 1952 och 1957 ligger i ytan.
   - **Bevis:** en.wikipedia "Saar Protectorate" (öppnad 2026-11-21): ett franskt protektorat och omstritt område med egen regering (författning 17 december 1947), Västtyskland 1 januari 1957.
   - **Vad noterna säger i dag:** rutan för Västtyskland nämner 1957 öppet. Frankrikes ruta nämner bara Saar 1920–1935.
   - **Förslag:** en mening i Frankrikes ruta Om kartan (fem språk): "Saarprotektoratet 1947–1956 var ett franskt protektorat med egen regering, inte en del av Frankrike; Cliopatria ritar det som Frankrike." Alternativet är att visa området utan stat, som Saar 1920–1935.
   - **Vem:** Claude Code. Geografen bör säga vilket alternativ.

## Smått
- **svenska-stormaktsvaldet:** Q215443 har P31 "history of a country or state / aspect of history" (Wikidata: "the years 1611–1721 in the history of Sweden"). Det är en tidsperiod, inte en statspost. Det går att leva med, men det är samma typ av fel som #2005.
- **Kina mellan Shang och Zhou:** Shang slutar 1046 f.Kr. (källorna) och Zhou börjar 1000 f.Kr. (Cliopatria), så Kina är tomt 1045–1001 f.Kr. Det står öppet i Om kartan för båda, så det är ingen åtgärd, bara att lärare kan fråga.
- **ecuador-tricolour (data/empires/index.json, ecuador):** källan är bara wp-flag-ecuador. Ingen Commons-fil eller licensrad finns för SVG:n, som är tre ränder och är tecknad i projektet. Den kan inte skyddas av upphovsrätt (enkla former), men en rad om ursprunget i sources eller i SVG-kommentaren skulle göra spårbarheten lika som för de andra.
- **bulgaria-1948:** filsidan på Commons säger själv både 1948–1967 (titeln) och 1948–1968 (beskrivningen). Faktarutan säger öppet att källorna skiljer sig och visar ingen flagga 1967–1970. Rätt hanterat.
- **rwanda-1961:** filsidan säger 1961 i titeln, 1962 i franska beskrivningen och har inception 1962. Kartan börjar 1963 (gruppens start), så det påverkar inget.

## Möjliga sakfel till andra experter
- **sprak-fr:**
  - liu-song heter på franska "Dynastie Song du Sud (420–479)", och sodra-song heter "Song du Sud". Två riken med nästan samma franska namn kan förväxlas.
  - romerska-kungadomet fr "royaume de Rome" har liten begynnelsebokstav, medan grannarna har stor ("République romaine"). Wikidatas etikett är liten, men frwiki-titeln är "Royauté romaine".
- **sprak-de:** western-satraps de = "Western Satraps", det engelska namnet i den tyska texten. Det är kanske avsiktligt enligt beslutet 2026-11-12, men det bör prövas.
- **geograf:** Saar 1946–1956 (punkt 3 ovan). Texcoco och Tenochtitlan 1326–1428: ytorna ser förväxlade ut. Det står öppet i Om kartan och är redan avvägt i #1443, så det är bara en påminnelse.

## Luckor (saknas)
**Mätning:** egen körning med funktionerna i `tools/tackning_riken.py` (samma regler: GROUPS, Cliopatrias år omräknade enligt #1989, världsdel ur mittpunkten). Cliopatria v0.2.1, poster av typen POLITY, provår vart 50:e år 50–1450, bara land som inga av våra riken täcker och minst 20 000 km² per provår. Skriptet ligger i scratchpad (luckor.py), och resultatet i luckor.txt i samma mapp. Täckningen av Cliopatrias land 100–1400 ligger på 70–87 procent (`tools/tackning_riken.py`, hela tabellen).

De största saknade staterna 1–1500, per världsdel (miljoner km² × år):
- **Asien (166 saknade):** Xianbei 100–200 (485), Tibet 1400–1450 (155), Oghuzturkarna 750–1050 (154), De fem dynastierna och tio rikena 950 (138), Champa 250–1450 (122), Pyu-stadsstaterna 100–1000 (106), Liangdynastin 550 (97), Heian-Japan 800–1150 (97), Lakhmiderna 300–600 (91), Hunnerna 150–400 (87). Väntar redan med skäl i GROUPS: Turk Shahis (83), Hamdaniderna (82) och Sind-Habbari (80).
- **Europa (136):** Scandinavian minor kingdoms 500–1000 (179), Avarkhaganatet 600–800 (118), Gothia 250–350 (74), Kungariket Italien 600–950 (44), Polska hertigdömen 1150–1300 (42), Brythonic Kingdoms 450–1050 (42), Isländska fristaten 950–1250 (39), Kastilien 1000–1200 (38), Rumsultanatet 1100–1250 (35), **Portugal 1150–1450 (29; kartan har Portugal först från 1502 som imperium)**, Zayyaniderna 1250–1450 (25). "(Kingdom of France)" 1000–1450 (130) är Cliopatrias samlingspost och troligen en mätartefakt: delarna finns.
- **Afrika (7):** Ifat 1300–1400 (18), Takrur 1050–1200 (15), Fihriderna 750 (13), Barghawata 800–1050 (11), Kanem 1100–1350 (6; kartan har Kanem-Bornu via Bornu).
- **Amerika (6):** Maya-stadsstaterna 50–1450 (356 totalt) och Zapotekerna 50–600 (42). Båda väntar på #1300 (områden som inte är en stat). Chaco 850–1150 (14) och Norse Greenland 1100–1250 (5).
- **Oceanien (1):** Northern Fujiwara 1100–1150 (4; ligger i Japan, världsdelen är fel räknad).

**Balans:** Afrika och Amerika har få saknade stater, men det beror på att Cliopatria har få stater där, inte på att täckningen är god. Skevheten mot Eurasien ligger i källan och syns inte i måttet.

**Issues:** allt ovan faller inom de öppna #645 (medeltiden) och #646 (antiken), och Maya och Zapotekerna inom #1300. Inga nya issues behövs, men listan kan läggas som underlag i #645/#646. Portugal 1150–1501 och Heian-Japan är de mest synliga luckorna för en svensk skolanvändare. Det är ett antagande, inte en observation.

## Ej kontrollerat
- **Commons filsidor:** API:et gav 429 på alla 64 filer. Licensen kontrollerades på själva filsidan bara för 7 (se Omfattning). För de övriga 57 bygger licensen på `data/sources.json`. Ingen av dem är NC enligt registret: alla är PD, CC0, CC BY-SA eller GFDL tillsammans med CC BY-SA.
- **tools/flaggkontroll.py** kördes inte: den skriver en cache till `tools/.cache/` i repot, och jag får inte ändra filer. CI och rapporten 2026-11-11-rikessymboler.md säger att den går igenom.
- **Wikipedia:** faktarutorna för Himyar, Jabal Shammar, Balhae, Idrisider, Liu Song, Texcoco, Vijayanagar och Kamarupa gick inte att öppna (omdirigering eller 429). För dem jämförde jag bara med Wikidata och Cliopatria, och de stämmer med Om kartan.
- **Delade gränser (#1765):** granskades bara så långt att ingen datafil är ombyggd med flaggan (rapporten rad 17 och index.json `notes`). Det påverkar alltså inga fakta i releasen.
- **Mali Empire som "Traditionell afrikansk religion" 1250–1624** (oförändrat sedan förut) är inte källkontrollerat i den här omgången.
