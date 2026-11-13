# Helganalys, körning C: täckning och innehåll

**Klart:** täckningsmätningen (`tools/tackning.py`) körd mot `main`, luckorna analyserade per period, världsdel och kategori för händelser, riken, fun facts, bilder och källor, fyra experter inkallade (`historiker`, `geograf`, `larare`, `forhistoriker`), och en samlad prioritering över A, B och C. **Stod still:** nästan alla primärkällor (WHO, UNESCO, Britannica, Nobelprize, Smithsonian Human Origins, Europe PMC, NASA-sidor) var spärrade i molnmiljön, så förslagen på saknade händelser är belagda med Wikipedia som sekundärkälla och får inte läggas in över `draft` förrän en primärkälla är öppnad. Lgr22 hos Skolverket är inte öppnad. **Inget är byggt eller ändrat**, inga etiketter är satta och inga issues är skapade.

**Datum:** 2026-11-13 (körd kl. 04 på DasKrokodils begäran, inte 2026-11-15 som först schemalagt). **Data:** `main` vid `75fb6f8`. **Konto:** DasKrokodil. **Modellnivå:** Opus passar (historiska fakta, källor och täckning). **Delagenter:** fyra.

## Läget när körningen började

- **Öppna pull requests:** 4, alla från DasKrokodils konto (#1290 tilltal, #1291 `bilder_in.py`, #1292 tyska turer, #1293 källkritiktur). Einzbeng har 0. **Taket på 4 är nått**: inget nytt kan öppnas förrän någon är ihopslagen.
- **`docs/granskningar/handoff.json`** står kvar på `ready_for_triage` (`2026-11-10-version-6-3-0.md`). Det är tredje körningen som noterar det; den bör triageras eller stängas.
- **Rapporterna från A och B** finns på #1289 och är lästa.
- **Mätt i dag:** 929 händelser (472 `source-checked`, 457 `two-sources`), 56 fun facts, 1 969 källor, 8 turer i `data/turer/` (#1293 lägger till en), 8 filer med vägar, 1 uppdrag, 10 quizfrågor. Sedan mätningen 2026-11-11: +50 händelser, mest Asien i medeltid och tidigmodern tid.

## Sammanfattning

### De fem viktigaste fynden

**1. Tyskland finns inte som rike 1920–1944 och 1953–1990.** `data/empires/tyska-riket.json` slutar 1919 och `tyskland.json` börjar 1991 (kontrollerat i filerna). Cliopatria har posterna (Weimar Republic, Nazi Germany, Federal Republic of Germany, German Democratic Republic). Det betyder att lektionen om andra världskriget och hela kalla kriget visas utan Tyskland i rikeslagret. Samma slags hål, också belagda i Cliopatria: Belgiska Kongo 1900–1959 (2,3 miljoner km², det största enskilda hålet 1914 och 1950), Italienska Afrika 1900–1943, Siam 1900–1931, Tibet 1912–1952, Nord- och Sydjemen 1969–1989, Rhodesia 1969–1982, Albanien 1944–1990.

**2. Modern tid är nästan bara krig.** 448 av 929 händelser har kategorin krig (48 %). På 1800-talet är det 98 av 143 (69 %) och på 1900-talet 134 av 217 (62 %). Asien har 84–85 % krig under båda seklen och ingen händelse alls i vetenskap, kultur, religion, ekonomi eller hälsa på 1900-talet. Hälsa på 1800-talet är helt tom, och det är den enda tomma cellen som inget öppet issue äger. Nyans: 361 av de 448 är slag som hör till ett krig (`partOf`) och syns bara i Fokus. Räknar man bort dem är 87 av 568 krig (15 %). Globen utzoomad är alltså jämnare än datat; skevheten syns i listor, sök, epokknappar och täckningsmåttet. Hur panelen räknar är inte kontrollerat.

**3. Norden är tunt, och epokknapparna för Nordens forntid leder till en tom glob.** Nordisk bronsålder har 0 händelser i Norden, järnåldern 1 (Uppåkra) och stenåldern 2 (båda på Grönland). I Lgr22-perioderna för åk 4–6 bärs Norden av piloterna Skåne och Grönland; övriga Norden har 3 händelser 800–1500 och 4 under 1800-talet. Efter 1921 finns ingen händelse i Sverige utanför Skåne. Ingen av de 56 fun facts pekar på en händelse i Norden.

**4. Förhistorien har 11 händelser på 97 000 år, och natur och klimat är tomma.** Amerika har ingen händelse före 3000 f.Kr. Förhistorikern belade 20 luckor med öppnad källa (se nedan), men bara Wikipedia gick att öppna. Det som handlar om människans spridning bör vänta på version 7.1 (#1093, #1094) så att spann och osäkerhet byggs en gång.

**5. Två fel i befintligt data, inte luckor.** `region()` i `js/model.js` placerar Kap Verde i **Asien** (longitud −25 till −20 fångas av ingen regel; kontrollerat mot koden) och västra Anatolien i **Europa** (fem händelser, bland annat `lydiska-mynt`, vars platstext själv säger Mindre Asien). Och `konungariket-danmark` 1402–1406 är en fläck på 73 km² i norra Finland, ärvd ur Cliopatria; Danmark försvinner alltså redan 1402, inte 1407 som #1084 utgår från.

### Täckningen i siffror

| | Europa | Asien | Afrika | Amerika | Oceanien | Alla |
|---|---:|---:|---:|---:|---:|---:|
| Händelser | 183 | 273 | 148 | 186 | 139 | 929 |
| Andel krig | 53 % | 62 % | 43 % | 43 % | 28 % | 48 % |
| Med bild | 32 % | 27 % | 18 % | 23 % | 19 % | 25 % |
| I en fun fact | 11 % | 6 % | 16 % | 11 % | 12 % | 11 % |
| Två källor | 95 % | 86 % | 84 % | 88 % | 87 % | 88 % |

- **Tunna sekel:** Europa 1300-talet (3) och 1400-talet (2), Amerika 1200–1400 (2 var) och 1600-talet (2), Afrika 1100-talet (1), Oceanien 1500-talet (2).
- **Tunna kategorier över hela tiden:** klimat 6, natur 7, sport 9, människan 10, rymden 13, hälsa 18.
- **Bilder:** sämst i Afrika tidigmodern tid (4 %) och Oceanien 2000-tal (0 %). Inga bilder väntar i bildloggen.
- **Fun facts:** tyngdpunkten ligger före 1500. Tidigmodern tid och 1900-talet har 5 %. Av 448 krigshändelser ingår 1 i en fun fact.
- **Källor:** 626 av 929 händelser har Wikidata som en av källorna. Antiken i Amerika (42 %) och Afrika (58 %) har lägst andel med två källor. Taggen `framsteg` (#555) används inte av någon händelse, så balansen negativt mot positivt går inte att mäta.
- **Riken:** kartan täcker 88 % av landytan 1914 och 96–98 % från 1950 (Cliopatria: 95 och 99 %). De stora glappen mot källan: Asien år 1500 (19 % mot 63 %) och Afrika 1850 (6 % mot 24 %). Amerika har inga riken före medeltiden och Oceanien inga före 1500; där har Cliopatria själv nästan inget.
- **Delregioner med minst händelser:** Antarktis 0, Centralasien 5, Mikronesien 5, Sibirien 4, Centralafrika 12, Karibien 14 (20 av 25 enheter tomma). 88 av 204 stater har ingen händelse, bland dem Nederländerna, Portugal, Rumänien, Sri Lanka, Nepal, Uganda och Moçambique.
- **Vägar och resor:** ingen väg börjar och slutar inom Amerika, Oceanien eller Afrika söder om Sahara. Den senaste slutar 1873.
- **Skola:** ingen tur ligger mellan cirka 1600 och 1914 eller efter 1945. Quizets tio frågor har ingen nordisk händelse. Lektionens slutkort visar aldrig ett uppdrag, eftersom det enda uppdraget gäller 1500 och lektionerna är låsta till 793–1068 och 1939–1945 (`js/ui/lesson.js:149`; bekräftar körning A).

### Samlad prioritering över A, B och C

Ordningen är vald efter vad en besökare märker, och efter vad som blir dyrare av att vänta.

| Ordning | Vad | Ur | Varför nu |
|---:|---|---|---|
| 1 | Följdfelen av 6.2.0: årstipset som knuffar tidsraden (A1), svensk skärmläsartext (A3), filter med noll träffar (B3), årsbyte i statusraden (B4) | A | Drabbar förstagångsbesökaren i mobil. Små och reversibla |
| 2 | Tyskland 1920–1990 och Belgiska Kongo som riken | C | Lektionen om andra världskriget saknar Tyskland på kartan. Källan finns redan i verktygskedjan |
| 3 | Tidslås i tur och lektion och uppspelning som pausar bakom dialog (B:s P4 och P5) | A, B | År och kort säger olika saker i klassrummet. Kräver ett ja till B:s beslut 3 |
| 4 | Första omgången icke-krig: hälsa på 1800-talet och modern kultur, vetenskap och natur, högst 20 händelser, med tre fun facts ur befintliga händelser | C | Den enda tomma cellen utan ägare, och den billigaste vägen att ändra balansen |
| 5 | `region()`: Kap Verde och västra Anatolien, med test | C | Liten rättning av ett synligt fel i Samtidigt-panelen |
| 6 | Reglagets grund (B:s P1–P3) | B | Före 7.0; fem issues lagar annars samma brist var för sig |
| 7 | Ett uppdrag per lektion, eller uppdrag knutna till lektion i data | A, C | Slutkortet leder ingenstans i dag. Kräver beslut |
| 8 | Definitionen av "samtidigt" (A:s förslag 15) | A | Styr quiz, jakt och nya fun facts |
| 9 | Norden: forntiden och 1500–1900 utanför krig | C | Epokknapparna är tomma i Norden. Hör ihop med #1262 och #1263 |
| 10 | Bildlager v2 (B:s P7) | B | Före 7.1 |
| 11 | Förhistoriens luckor utanför människans spridning (klimat, natur, konst, jordbruk) | C | Kan göras före 7.1; spridningen väntar på #1093 |
| 12 | Riken: Inre Asien 1500–1800, Afrika 1850, mellankrigstiden, efter 1950 | C | Stort arbete i omgångar under #556 |

**Under taket på fyra pull requests.** Taket är nått i dag. När de fyra öppna är ihopslagna går dessa fyra att bygga samtidigt utan filkrockar:

1. **Följdfelen** (punkt 1): `css/style.css`, `js/ui/panel.js`, `js/controllers/render.js`, `data/ui/*.json`. Sonnet medium.
2. **Tyskland och Belgiska Kongo** (punkt 2): `tools/riken.py`, `data/empires/`, `data/genererat/`. Opus. Krockar med rikessymbolerna (#1152–#1156) om de byggs samtidigt, eftersom båda rör `data/empires/`; ta dem i följd.
3. **Icke-krig, omgång 1** (punkt 4): `data/handelser/1800-1899.json` och `1900-1945.json`, `data/funfacts.json`, `data/sources.json`. Opus. De genererade filerna räknas inte som krock.
4. **`region()`** (punkt 5): `js/model.js`, nytt test. Sonnet medium.

Punkt 3 (tidslås) och 6 (reglagets grund) rör båda `js/timeline.js` och går i följd efter varandra, i den omgång som kommer därefter.

### Rekommendation till DasKrokodil

- **Säg ja till punkt 2 och 4 som nästa innehållsarbete.** De ändrar mest för besökaren per pull request, och ingen av dem kräver ny datakälla eller ny licens.
- **Släpp in primärkällorna i molnmiljöns nät** (who.int, whc.unesco.org, nobelprize.org, humanorigins.si.edu, europepmc.org, britannica.com, nps.gov, ipcc.ch, unfccc.int). Annars blir varje ny händelse i hälsa, klimat och förhistoria belagd bara med Wikipedia, och ingen når `two-sources` på annat sätt än via Wikidata.
- **Tre frågor som behöver ditt svar** (förslag på svar inom parentes): ska täckningsmåttet räkna bort slag som bara syns i Fokus (ja, som en extra kolumn, inte i stället för dagens); ska uppdrag knytas till lektion i data i stället för via årtal (ja); ska en full lista över Lgr22:s centrala innehåll läggas i repot som kontrollista tillsammans med #843 (ja, före fler lektioner).

## Detaljer

### Luckor (saknas)

Allt nedan är förslag. Inget är inlagt. Varje rad har en källa som öppnades i körningen, men nästan alla är Wikipedia (sekundärkälla), och ingen rad är jämförd med en andra källa. Byggaren öppnar en primärkälla innan något höjs över `draft`.

#### Händelser, modern tid (historikern)

| Händelse | År och plats enligt källan | Kategori | Världsdel | Källa |
|---|---|---|---|---|
| John Snow och pumpen på Broad Street | 1854, Soho, London | halsa | Europa | en.wikipedia.org/wiki/1854_Broad_Street_cholera_outbreak |
| Röda korset grundas | 17 februari 1863, Genève | halsa | Europa | en.wikipedia.org/wiki/International_Committee_of_the_Red_Cross |
| Första offentliga eternarkosen | 16 oktober 1846, Boston | halsa | Amerika | en.wikipedia.org/wiki/Ether_Dome |
| Tredje pestpandemin | började 1855 i Yunnan; bakterien identifierad i Hongkong 1894 | halsa | Asien | en.wikipedia.org/wiki/Third_plague_pandemic |
| Första hjärttransplantationen | 3 december 1967, Kapstaden | halsa | Afrika | en.wikipedia.org/wiki/Christiaan_Barnard |
| Báb träder fram | 22 maj 1844, Shiraz | religion | Asien | en.wikipedia.org/wiki/B%C3%A1b |
| Andra Vatikankonciliet | 11 oktober 1962–8 december 1965, Vatikanstaten | religion | Europa | en.wikipedia.org/wiki/Second_Vatican_Council |
| Tagore får Nobelpriset i litteratur | 1913 | kultur | Asien | en.wikipedia.org/wiki/Rabindranath_Tagore |
| De första Nobelprisen | 10 december 1901 (källan anger inte platsen) | kultur | Europa | en.wikipedia.org/wiki/Nobel_Prize |
| Rosettastenen hittas | juli 1799, vid Rashid, Egypten | kultur | Afrika | en.wikipedia.org/wiki/Rosetta_Stone |
| Buddhastatyerna i Bamiyan förstörs | mars 2001, Afghanistan | kultur | Asien | en.wikipedia.org/wiki/Buddhas_of_Bamiyan |
| Tutankhamons grav hittas | 4 november 1922, Konungarnas dal | upptackter | Afrika | en.wikipedia.org/wiki/Discovery_of_the_tomb_of_Tutankhamun |
| Första bestigningen av Mount Everest | 29 maj 1953 | upptackter | Asien | en.wikipedia.org/wiki/1953_British_Mount_Everest_expedition |
| Bingham kommer till Machu Picchu | 24 juli 1911 | upptackter | Amerika | en.wikipedia.org/wiki/Hiram_Bingham_III |
| Trieste når Challengerdjupet | januari 1960, Marianergraven | upptackter | Oceanien | en.wikipedia.org/wiki/Challenger_Deep |
| Saavedras resa över Stilla havet | 1527–1528 | upptackter | Oceanien | en.wikipedia.org/wiki/%C3%81lvaro_de_Saavedra_Cer%C3%B3n |
| Yellowstone blir nationalpark | 1 mars 1872 | natur | Amerika | en.wikipedia.org/wiki/Yellowstone_National_Park |
| De sista säkra garfåglarna dödas | 3 juni 1844, Eldey, Island | natur | Europa | en.wikipedia.org/wiki/Great_auk |
| Den sista kända pungvargen dör | 7 september 1936, Hobart | natur | Oceanien | en.wikipedia.org/wiki/Thylacine |
| Vandringsduvan dör ut | 1 september 1914, Cincinnati | natur | Amerika | en.wikipedia.org/wiki/Passenger_pigeon |
| FN:s miljökonferens i Stockholm | 5–16 juni 1972 | klimat | Europa | www.un.org/en/conferences/environment/stockholm1972 |
| Kyotoprotokollet | antogs 11 december 1997, i kraft 16 februari 2005 | klimat | Asien | en.wikipedia.org/wiki/Kyoto_Protocol |
| OPEC grundas | 14 september 1960, Bagdad | ekonomi | Asien | en.wikipedia.org/wiki/OPEC |
| Higgspartikeln | 4 juli 2012, CERN | vetenskap | Europa | home.cern/science/physics/higgs-boson |
| Första testmatchen i cricket | 15 mars 1877, Melbourne | sport | Oceanien | en.wikipedia.org/wiki/Test_cricket |

**Källorna flaggar själva osäkerhet**, som ska bli `note` eller försiktig formulering: Machu Picchu var känt lokalt, så "upptäckt" är fel ord; Yellowstone är "allmänt uppfattad som" den första nationalparken; IUCN godtar en senare observation av garfågeln 1852; forskare är oense om pungvargens kön och dödsorsak; cricketens teststatus gavs i efterhand; pestpandemins startår gäller Yunnan, inte Hongkong.

**Belagda reserver:** Bretton Woods 1944, IPCC 1988, de första Paralympics 1960, OS i Tokyo 1964, första rugby-VM 1987, människans arvsmassa 2003, Québec 1608, almohaderna tar Marrakech 1147, kvaggan 1883.

**Ej belagt (ingen källa gick att öppna eller hanns med, inga årtal ges):** WHO grundas, poliovaccinet, hiv identifieras, p-pillret, Semmelweis, Koch, Pasteur, Arrhenius om koldioxid, Dust Bowl, lilla istiden, första Tour de France, första vinter-OS, Humboldts Amerikaresa, Amundsen vid Sydpolen, UNESCO:s världsarvskonvention, Lumières filmvisning, Stellers sjöko. Flera överlappar troligen #86.

**Fun facts ur händelser som redan finns** (årtalen ur filerna; texterna skrivs och kontrolleras av byggaren):
- `www` (mars 1989, Genève) och `berlinmurens-fall` (9 november 1989): samma år.
- `smittkoppor-sydney-1789` och `jenners-vaccin` (1796): 1796 − 1789 = 7 år. Saklig ton.
- `penicillinet-upptacks` (1928), `borskraschen-1929` och `fotbolls-vm-1930`: tre år i rad på tre platser.
- Reserv: `kabuki-borjar-1603`, `duyfken-nar-australien` (1606), `jamestown-1607` och `galileo-sidereus-nuncius` (1610): fyra världsdelar på sju år.

#### Förhistorien (förhistorikern)

Dateringar som spann, enligt öppnad Wikipedia-sida. Dateringsmetod inom parentes när källan anger den.

| Vad | Datering enligt källan | Världsdel | Kategori | Källoenighet |
|---|---|---|---|---|
| Chinchorromumierna, norra Chile | från cirka 5050 f.Kr. | Amerika | kultur | – |
| Cueva de las Manos, Argentina | 7300 f.Kr.–700 e.Kr. (radiokol) | Amerika | kultur | – |
| Majsen tämjs, Balsasdalen | cirka 9 000 år sedan | Amerika | manniskan | En annan sida säger cirka 7000 f.Kr. |
| Watson Brake, Louisiana | cirka 3500 f.Kr. (radiokol) | Amerika | kultur | – |
| Megafaunan försvinner i Amerika | cirka 13 800–11 400 år sedan | Amerika | natur | Orsaken omstridd (jakt eller klimat) |
| Blombos: ristad ockra och pärlor | cirka 75 000–72 000 år (OSL) | Afrika | kultur | Kronologin ifrågasatt |
| Den gröna Sahara | cirka 14 600–5 000 år sedan | Afrika | klimat | Slutet varierar med plats |
| Nabta Playa | stencirkel cirka 4800 f.Kr. | Afrika | kultur | Samma sida säger också cirka 4000 f.Kr. |
| Tidig keramik i Mali | minst 9400 f.Kr. | Afrika | kultur | – |
| Kuk: självständigt jordbruk, Nya Guinea | dränering cirka 9 000 år sedan | Oceanien | manniskan | Andra sidor: 11 000 år eller cirka 8000 f.Kr. |
| Budj Bim: ålfällor, Victoria | 6 600 år (radiokol), "upp till 8 000" | Oceanien | manniskan | Två tal på samma sida |
| Australiens megafauna och äldsta klippmålning | utdöenden från cirka 50 000 år sedan; målning 28 000 år | Oceanien | natur, kultur | Tidpunkten oklar |
| Chauvetgrottan | 37 000–33 500 och 31 000–28 000 år sedan (radiokol) | Europa | kultur | Några forskare anser målningarna yngre |
| Lejonmänniskan, Hohlenstein-Stadel | 35 000–41 000 år (radiokol) | Europa | kultur | – |
| Doggerland dränks | 10 000–7 000 år sedan | Europa | klimat | Storegga-tsunamins roll omstridd |
| Varnagravfältet, tidigt guld | 4569–4340 f.Kr. (radiokol) | Europa | kultur | "Äldsta guldet" är ett antagande |
| Yngre dryas och istidens maximum | 12 900–11 700 respektive 26 000–20 000 år sedan | flera | klimat | Orsak och gränser debatterade |
| Äldsta keramiken, Çatalhöyük, Jeriko, grottkonst på Sulawesi | Xianrendong 20 000–19 000 år; Çatalhöyük cirka 7500–5600 f.Kr.; Jerikos torn cirka 8300 f.Kr.; Leang Tedongnge minst 45 500 år | Asien | kultur | – |

**Väntar på version 7.1:** Mungo, de första människorna i Amerika (#1016; källorna är djupt oense, från cirka 14 000 till över 23 000 år), *Homo sapiens* i Europa, och spannen för `madjedbebe` och `homo-luzonensis`, som i dag har ett enda år trots felmarginal.

**Befintliga händelser:** tre stickprov stämde mot öppnad källa (`jordbrukets-borjan`, `gobekli-tepe`, `kilskriften`). `neandertalare` har en fyndplats i Iran som punkt och räknas därför som Asien, så Europa ser tommare ut än innehållet är.

**Ej belagt:** Toba, Ishangobenet, Jebel Sahaba, Lascaux, Newgrange, Skara Brae, Ötzi, Mehrgarh, Beringia, hundens tämjande (källan säger att samsyn saknas), potatis och lama i Anderna, hästens tämjande.

#### Riken och platser (geografen)

Metod: ett rutnät med en punkt per grad på land (15 380 punkter), prövat mot alla 2 565 rikesperioder och mot Cliopatria hämtad från Zenodo (zenodo.org/records/13363121). Årtalen är Cliopatrias och inte kontrollerade mot en andra källa.

1. **Tyskland 1920–1944 och 1953–1990.** Nytt.
2. **Belgiska Kongo 1900–1959 med Rwanda och Burundi 1916–1962.** Nytt, ryms under #556.
3. **Inre Asien 1500–1800** (Kazakh Khanate, Khanate of Sibir, Moghulistan, Tibet, Dzungar Khanate). Nytt; #645 slutar vid medeltiden.
4. **Italienska Afrika 1900–1943.** Delvis #1083.
5. **Afrika 1850** (Muhammad Ali-dynastin, Sokoto, Merina, Ottoman Tripolitania). Finns i Cliopatria och behöver inte vänta på #1200.
6. **Asien 1900–1952:** Tibet, Mongoliet 1912–1925, Kina 1916–1929, Ryssland 1917–1921, Siam, Nejd och Hijaz, Filippinerna.
7. **Efter 1950:** Nord- och Sydjemen, Rhodesia, Albanien, Serbien-Montenegro 1992–2005, Afghanistan 1987–2005. Hur Cliopatria ritar Tjeckoslovakien 1969–1989 (som Sovjetunionen) och Irak 2006–2013 (som USA) bör bedömas innan något ritas.
8. **Händelser:** Centralasien, Karibien, Mikronesien, Sibirien, Arktis utanför Grönland och Antarktis. Bara mätt i vårt data.
9. **Vägar** inom Amerika, Oceanien och Afrika söder om Sahara, och efter 1873. Bara mätt i vårt data; vilka vägar som bör finnas är inte belagt.

**Fel i befintligt data:** Newfoundland och Labrador saknar rike 1953–2024, eftersom Kanadas två perioder i Cliopatria slås ihop av en gräns i `tools/riken.py:52`. Resten på 73 km² för Danmark 1402–1406 och en likadan för `ghaznaviderna` 1202–1209.

**`region()`:** 37 av 929 händelser avviker från Natural Earths världsdel. Fel: Kap Verde (Asien), västra Anatolien (Europa). Mindre: Rodrigues och Pelusium blir Asien. Rätt eller beslutat: Hawaii, Rapa Nui, Sinai, Istanbul (#630).

#### Skolan och den historieintresserade (läraren)

Läroplanskopplingen bygger bara på det som redan står i repot. En fullständig kravlista är inte belagd och behöver kontrolleras mot Skolverket. Allt om hur lärare och elever upplever sidan är antaganden.

| Period (`data/perioder.json`) | Alla | Ej krig | Norden | Norden utom Skåne, Grönland och Island |
|---|---:|---:|---:|---:|
| Lgr22 Norden 800–1500 | 141 | 111 | 17 | 3 |
| Lgr22 Norden 1500–1800 | 168 | 72 | 20 | 6 |
| Lgr22 Norden 1800–1900 | 144 | 45 | 5 | 4 |
| Lgr22 1850–1950 | 176 | 53 | 7 | 5 |
| Lgr22 1900–i dag | 272 | 110 | 10 | 3 |
| Nordisk stenålder | 25 | 25 | 2 | 0 |
| Nordisk bronsålder | 54 | 48 | 0 | 0 |
| Nordisk järnålder | 103 | 60 | 1 | 0 |

Luckor i prioritetsordning:
1. Sverige och Norden utanför Skåne och Grönland, utom krig (delvis #1262, #1263).
2. Nordiskt innehåll i sten-, brons- och järnålder.
3. Uppdrag som passar lektionernas intervall.
4. Lektion eller tur för 1500–1800 och 1800–1900 (åk 4–6).
5. Lektion eller tur för industrialisering, demokratisering och rösträtt (åk 7–9). I dag finns Watt, två järnvägar och fyra rösträttshändelser.
6. Vardag, arbete, hälsa och kultur på 1800- och 1900-talet.
7. Tur om kalla kriget och om kolonisation, där händelserna redan finns (53 respektive 28 träffar) men ingen tur.
8. Lärarfält på `hur-vet-vi-det-har`, så att källkritik blir en lektion med blad.
9. Quiz, fun facts och missuppfattningar med nordisk och modern koppling.
10. Namn en vuxen söker och inte hittar. Noll träffar i titel och sammanfattning på bland andra Einstein, Mozart, Leonardo, Aristoteles, Stockholms blodbad, Engelbrekt, Kristina, Vasaskeppet och Palme.

### Förslag på issues (inga är skapade)

| # | Titel | Etikett | Modellnivå | Filer | Krockar |
|---|---|---|---|---|---|
| C1 | Riken: Tyskland 1920–1990 (Weimar, Nazityskland, Väst- och Östtyskland) | `data`, `riken`, `källkontroll`, `redo` | Opus | `tools/riken.py`, `data/empires/`, `data/genererat/` | Rikessymbolerna #1152–#1156; i följd |
| C2 | Riken: Belgiska Kongo, Italienska Afrika och Siam 1900–1960 | `data`, `riken`, `källkontroll`, `redo` | Opus | samma | Efter C1; utökar #1083 |
| C3 | Riken: Inre Asien 1500–1800 och Afrika 1850 ur Cliopatria | `data`, `riken`, `källkontroll` | Opus | samma | Efter C2; under #556 |
| C4 | Riken efter 1950: Jemen, Rhodesia, Albanien, Serbien-Montenegro, och hur ockupation ritas | `data`, `riken`, `beslut-krävs` | Opus | samma | Kräver beslut om Afghanistan, Irak och Tjeckoslovakien |
| C5 | Rikesfel: Newfoundland 1953–, Danmark 1402–1406 och Ghaznaviderna 1202–1209 | `bug`, `riken`, `data`, `redo` | Opus | `tools/riken.py`, tre rikesfiler | C1; kommentar på #1084 om 1402 |
| C6 | `region()`: Kap Verde och västra Anatolien hamnar i fel världsdel, med test | `bug`, `redo` | Sonnet medium | `js/model.js`, nytt test | Ingen |
| C7 | Saknas: hälsa på 1800-talet och icke-krig i modern tid, omgång 1 (högst 20) | `data`, `källkontroll` | Opus | `data/handelser/1800-1899.json`, `1900-1945.json`, `1946-1979.json`, `data/sources.json` | Kontrollera överlapp med #86 först |
| C8 | Saknas: natur och klimat (utdöda arter, nationalparker, miljöavtal), omgång om högst 20 | `data`, `källkontroll` | Opus | `data/handelser/` | I följd med C7 |
| C9 | Fun facts ur befintliga händelser efter 1500 (fyra förslag ovan) | `data`, `källkontroll`, `redo` | Opus | `data/funfacts.json` | Efter A:s förslag 15 om möjligt |
| C10 | Förhistorien utanför människans spridning: klimat, natur, konst och jordbruk | `data`, `källkontroll` | Opus | `data/handelser/fkr.json` | Utökar #767; spridningen väntar på #1093 |
| C11 | Norden i forntiden och 1500–1900: händelser för epokknapparna | `data`, `källkontroll`, `beslut-krävs` | Opus | `data/handelser/` | #1262, #1263; urvalet behöver källa (Historiska museet står redan i `perioder.json`) |
| C12 | Uppdrag knutna till lektion, och ett uppdrag per lektion | `data`, `beslut-krävs` | Opus för text, Sonnet medium för kod | `data/uppdrag.json`, `js/ui/lesson.js`, `js/uppdrag-rules.js` | A:s förslag 20 |
| C13 | Täckningsmåttet: kolumn utan Fokus-dolda slag, riken per period, och andel mot Cliopatria | `teknik`, `redo` | Sonnet medium | `tools/tackning.py` | Ingen |
| C14 | Lgr22:s centrala innehåll som kontrollista i repot | `documentation`, `beslut-krävs` | Opus | `docs/` | Tillsammans med #843 |

C7 och C8 kan bli kommentarer på #86 respektive ett nytt issue i milstolpen "Täckning: händelser och balans" i stället för egna issues, om DasKrokodil hellre håller ihop dem.

### Det experterna var oense om eller lämnade öppet

- **Krigens andel.** Läraren ser 69 % krig på 1800-talet som ett problem i klassrummet. Mätningen visar att fyra femtedelar av krigshändelserna bara syns i Fokus. Båda stämmer: problemet finns i epokknappar, listor och sök, mindre på globen.
- **"Vardag"** finns inte som kategori. En ny kategori kräver DasKrokodils ja; en tagg eller befintliga kategorier är alternativen. Ingen rekommendation här utöver att inte lägga till en kategori för sakens skull.
- **Förhistoriens dateringar** är oeniga inom en och samma källa i flera fall (jordbrukets början, Nabta Playa, Budj Bim). Det ska stå i `note`, inte väljas bort.

## Inte kontrollerat

- Primärkällor: se första stycket. Inget förslag har stöd för `two-sources`.
- Cliopatrias årtal mot en andra källa, och om Cliopatria själv har fel för de riken som föreslås.
- Lgr22:s ordalydelse hos Skolverket.
- Hur panelen, söket och epokknapparna räknar slag som bara syns i Fokus.
- Bildernas kvalitet och licenser; bara andelen är mätt.
- Översättningarnas täckning (körning A mätte den: 380 av 929 händelser har tysk titel, 168 spansk och fransk).
- Småöar: rutnätet på en grad missar dem.
- dev.historiagloben.se: allt är mätt i filerna på `main`.

## Underlag

- Dagens mätning: [tackning-2026-11-13.md](tackning-2026-11-13.md).
- Experternas skript och mellanresultat låg i molnsessionens tillfälliga mapp och är inte sparade i repot.
