# Översikt: källgenomgång och förslag på urval (#1004, del av #868)

**Datum:** 2026-11-09 (uppdaterad samma dag efter DasKrokodils svar). **Av:** Claude Code (DasKrokodil). **Ingen ändring i `data/` eller i koden.** Fältet `significance` sätts först när DasKrokodil har godkänt listan.

## DasKrokodils svar 2026-11-09

1. **Perspektivet är svenskt och europeiskt, från skolan.** Trettioåriga kriget stannar kvar; det föreslagna bytet mot Imjinkriget görs inte. Att Europa har fler händelser per landyta än andra världsdelar är därför avsiktligt, så länge alla världsdelar finns med.
2. **Hellre färre än 150.** Listan är nu **123** händelser (se Metod, punkt 6).
3. **Oceanien med "område"-stöd behålls** (fem rader).
4. **Händelser som är del av ett krig (`partOf`) får vara med** (fyra rader).
5. **Issues skapas för det som saknas:** åtta issues, #1012–#1019 (se Saknas).

Kvar att godkänna: själva listan med 123 rader (stryk eller byt rader) och att Lgr22 och Vital articles är de listor som urvalet bygger på.

## Sammanfattning

- **Två referenslistor öppnade och lästa** (adress, utgivare, villkor och datum nedan): Skolverkets kursplan i historia (Lgr22) och engelska Wikipedias *Vital articles*, nivå 3 och nivå 4 (History). En tredje lista, OpenStax lärobok *World History* (CC BY 4.0), gick inte att öppna från den miljö där arbetet gjordes (nätverksspärr).
- **Förslag: 123 befintliga händelser** (först 150, sedan kortad efter DasKrokodils svar). Varje rad pekar på minst en post i en öppnad lista. Alla id finns i `data/events.json`, och varje stödpost är kontrollerad maskinellt mot de nedladdade listorna (se Metod). 118 rader har direkt stöd; 5 rader i Oceanien har bara stöd i regionens historia ("område"), eftersom listorna nästan saknar Oceanien.
- **Spridning:** Asien 36, Europa 35, Amerika 22, Afrika 22, Oceanien 8. Europa har 28 % av förslaget mot 18 % av globen, vilket följer skolperspektivet; Asien är fortfarande störst. Oceanien är svagt (7 % mot 15 %).
- **Reserv:** 62 händelser som också stöds av listorna men inte kom med. De kan bytas in.
- **Saknas:** 40 ämnen som listorna tar upp men som inte finns på globen. De läggs inte in här; de finns nu i åtta issues, #1012–#1019.
- Hela tabellen finns också som CSV: [2026-11-09-oversikt-urval.csv](2026-11-09-oversikt-urval.csv) (förslag och reserv, kolumnen `lista`).

## Rekommendation till DasKrokodil

**Rekommendation:** Godkänn de två listorna som grund för Översikt och godkänn tabellen med 123 rader, eller stryk de rader du inte vill ha. Börja sedan med #1012 (Sverige och Norden enligt Lgr22), som har `redo`.

**Varför:** Lgr22 ger skolans perspektiv men nämner teman, inte händelser. Vital articles är global och öppet licensierad och nämner händelser, riken och platser vid namn. Urvalet består bara av befintliga händelser, så vyn kan byggas utan nya fakta.

**Förslag på svar på det som är kvar:**
1. *Listorna:* Ja, Lgr22 och Vital articles nivå 3–4.
2. *123 rader:* Ja, eller stryk fler; reserven har 62 att byta in.

## Referenslistorna

| # | Lista | Adress | Utgivare | Villkor | Hämtad |
|---|---|---|---|---|---|
| A | Kursplan i historia för grundskolan, Lgr22 (GRGRHIS01), centralt innehåll årskurs 1–3, 4–6 och 7–9 | https://www.skolverket.se/undervisning/grundskolan/laroplan-lgr22-for-grundskolan-samt-for-forskoleklassen-och-fritidshemmet/curriculums/LGR22/GRGRHIS01 | Skolverket | Föreskrift (SKOLFS). Bara länkad och citerad med korta fraser; samma villkor som `skolverket-lgr22-historia` i `data/sources.json` | 2026-11-09 |
| B | Wikipedia:Vital articles/Level 3 (1 000 artiklar, alla ämnen) | https://en.wikipedia.org/wiki/Wikipedia:Vital_articles/Level_3 (version 1382205991, 2026-10-27) | Engelska Wikipedias gemenskap | CC BY-SA 4.0. Bara artikelnamn används som stöd; ingen text kopieras | 2026-11-09 |
| C | Wikipedia:Vital articles/Level 4/History (700 artiklar om historia) | https://en.wikipedia.org/wiki/Wikipedia:Vital_articles/Level_4/History (version 1382567282, 2026-10-29) | Engelska Wikipedias gemenskap | CC BY-SA 4.0. Bara artikelnamn används som stöd | 2026-11-09 |

**Vad listorna är.** *Vital articles* är engelska Wikipedias kurerade lista över de ämnen som en encyklopedi måste ha, i nivåer: nivå 3 har 1 000 artiklar om allt, nivå 4 har 10 000, varav 700 i History. Listan ändras genom omröstning, och nivå 3 är en delmängd av nivå 4. I kolumnen Stöd står **VA3** för nivå 3 och **VA4** för nivå 4 (History). Nivå 3 väger tyngre. Lgr22:s centrala innehåll är teman, inte händelser; där citeras den korta frasen som stöder raden, till exempel «Reformationen» eller «Förintelsen», och stadiet.

**Vad som inte gick.** OpenStax *World History* volym 1 och 2 (Rice University, CC BY 4.0) var tänkt som en tredje, oberoende lista men gick inte att nå: openstax.org och meta.wikimedia.org (Wikimedias språkoberoende lista *List of articles every Wikipedia should have*) blockeras av nätverksspärren i den miljö där arbetet gjordes. Vill DasKrokodil ha en tredje lista kan den kontrolleras i en senare session där de adresserna är tillåtna.

**Begränsningar.**
- Vital articles är skriven på engelska Wikipedia och har en viss slagsida åt Europa och Nordamerika, men den har egna avsnitt per världsdel och tidsålder. Oceanien har bara två artiklar på nivå 4 (*History of Oceania*, *History of Australia*).
- Lgr22 har tydlig Sverige- och Europatyngd i årskurs 4–6. Den har stöd för temat, inte för valet av en viss händelse. Därför har nästan alla rader med Lgr22-stöd också stöd i Vital articles.
- Listorna säger vad som är viktigt, inte när eller var. Årtal och plats i tabellen är händelsernas egna, som redan är källkontrollerade (`source-checked` eller `two-sources`) i `data/handelser/`.

## Metod

1. Listorna hämtades som råtext (`action=raw` för Wikipedia, sidan för Lgr22) den 2026-11-09.
2. Alla 827 händelser i `data/events.json` gicks igenom, med id, titel, startår, världsdel (samma `region()` som `tools/tackning.py`), kategori och `partOf`.
3. En händelse kom med när en lista nämner händelsen själv, platsen, personen, riket eller företeelsen som händelsen visar (till exempel *Mali Empire* för `mansa-musa-kairo`). Stödet skrevs som artikelnamn eller Lgr22-fras.
4. Ett litet skript (inte incheckat) kontrollerade att varje id finns, att varje artikelnamn finns ordagrant som länk i den nedladdade listan och att varje Lgr22-fras finns i rätt stadiums centrala innehåll. Alla 123 rader och 62 reserver klarade kontrollen.
5. Från första utkastet (183 rader) ströks 34 för att hålla taket 150 och dämpa Europa och krigen; en (`nalanda`, VA3 *Gupta Empire*) lades till för Asien.
6. Efter DasKrokodils svar ("hellre färre än 150") ströks 27 till. Rader med stöd i Lgr22 eller på nivå 3 behölls. Rader som bara har stöd på nivå 4 ströks, utom händelserna inom krig, Oceanien och sådana som annars hade lämnat en världsdel nästan tom i en period (till exempel `sakoku-japan-stanger` och `sokotokalifatet-grundas`). Europa fick bara ett avdrag (`magellans-jordenruntsegling`), eftersom perspektivet är svenskt och europeiskt. Från nivå 3 ströks bara tre som överlappar andra rader (`orakelben-skrift`, `nalanda`, `cai-lun-papper`). Alla strukna står under Reserv, tillsammans med `andra-slaget-vid-panipat` (VA3 *Akbar*), som hittades under arbetet.
7. Spridningen mättes med perioderna och världsdelarna i `tools/tackning.py`.

## Förslaget: 123 händelser

Kolumnen Stöd: **VA3**/**VA4** = artikel i Vital articles nivå 3/4, **Lgr22** = fras ur centralt innehåll. "(område)" = stöd bara i regionens historia. "(del av …)" = händelsen hör till ett krig och visas i dag bara i fokusläget.

### Förhistoria (före 3000 f.Kr.)

| nr | id | titel | världsdel | år | stöd |
|---:|---|---|---|---|---|
| 1 | `jordbrukets-borjan` | Jordbruket börjar i Bördiga halvmånen | Asien | ca 10000 f.Kr. | VA3 Neolithic Revolution; Lgr22 åk 1–3 «övergången till jordbruk» |
| 2 | `gobekli-tepe` | Göbekli Tepe | Asien | ca 9500 f.Kr. | VA4 Göbekli Tepe |
| 3 | `kilskriften` | Skriften uppstår: kilskrift i Uruk | Asien | ca 3300 f.Kr. | VA3 Sumer; VA3 Writing; VA4 Uruk |
| 4 | `egypten-enas` | Egypten enas under Narmer | Afrika | ca 3100 f.Kr. | VA3 Ancient Egypt |

### Antiken (3000 f.Kr.–500)

| nr | id | titel | världsdel | år | stöd |
|---:|---|---|---|---|---|
| 5 | `caral` | Caral, en av Amerikas äldsta städer | Amerika | ca 2600 f.Kr. | VA4 Caral–Supe civilization; VA3 Andean civilizations |
| 6 | `cheopspyramiden` | Cheopspyramiden byggs | Afrika | ca 2600 f.Kr. | VA3 Ancient Egypt; VA4 Old Kingdom of Egypt |
| 7 | `mohenjo-daro` | Mohenjo-daro, en av Induskulturens storstäder | Asien | ca 2500 f.Kr. | VA3 Indus Valley Civilisation; VA4 Mohenjo-daro |
| 8 | `hammurabis-lagar` | Hammurabis lagar | Asien | ca 1753 f.Kr. | VA3 Hammurabi; VA4 Babylonia |
| 9 | `lapitakulturen-i-bismarckarkipelagen` | Lapitakulturen dyker upp i Bismarckarkipelagen | Oceanien | ca 1600 f.Kr. | VA4 History of Oceania; VA4 Early human migrations (område) |
| 10 | `nok-kulturen` | Nok-kulturen och dess terrakottaskulpturer | Afrika | ca 1500 f.Kr. | VA4 Nok culture |
| 11 | `olmekerna-san-lorenzo` | Olmekernas San Lorenzo och kolossalhuvudena | Amerika | ca 1400 f.Kr. | VA4 Olmecs; VA3 Mesoamerica |
| 12 | `feniciska-alfabetet` | Det feniciska alfabetet | Asien | ca 1050 f.Kr. | VA3 Phoenicia; VA3 Alphabet |
| 13 | `karthago-grundas` | Kartago grundas | Afrika | ca 814 f.Kr. | VA4 Ancient Carthage |
| 14 | `buddha` | Buddha grundar buddhismen | Asien | 600 f.Kr. | VA3 The Buddha; VA3 Buddhism |
| 15 | `konfucius` | Konfucius lever | Asien | ca 551 f.Kr. | VA3 Confucius |
| 16 | `demokratin-i-aten` | Kleisthenes och demokratin i Aten | Europa | 508 f.Kr. | VA4 Classical Athens; VA3 Democracy; Lgr22 åk 7–9 «Antiken» |
| 17 | `perserkrigen` | Perserkrigen | Europa | ca 499 f.Kr. | VA4 Greco-Persian Wars; VA3 Achaemenid Empire |
| 18 | `tikal-vaxer-fram` | Tikal växer fram som mayastad | Amerika | ca 400 f.Kr. | VA4 Tikal; VA3 Maya civilization |
| 19 | `alexanders-faltag` | Alexander den stores fälttåg | Europa | 336 f.Kr. | VA3 Alexander the Great; VA4 Hellenistic period |
| 20 | `asokas-inskrifter` | Asokas inskrifter | Asien | 268 f.Kr. | VA3 Ashoka; VA4 Maurya Empire |
| 21 | `qins-enandekrig` | Qins enandekrig | Asien | 230 f.Kr. | VA3 Qin Shi Huang; VA4 Qin dynasty; VA4 Warring States period |
| 22 | `liu-bang-blir-kejsare` | Liu Bang blir kejsare och Handynastin grundas (del av `chu-han-kriget`) | Asien | 202 f.Kr. | VA3 Han dynasty |
| 23 | `zhang-qian-sidenvagen` | Zhang Qians resa öppnar Sidenvägen | Asien | 138 f.Kr. | VA3 Silk Road |
| 24 | `teotihuacan` | Teotihuacan | Amerika | ca 100 f.Kr. | VA4 Teotihuacan |
| 25 | `kleopatra` | Kleopatra | Afrika | ca 69 f.Kr. | VA3 Cleopatra; VA4 Ptolemaic Kingdom |
| 26 | `jesu-fodelse` | Jesus föds | Asien | ca 6 f.Kr. | VA3 Jesus; VA3 Christianity |
| 27 | `aksum-blir-kristet` | Kung Ezana gör Aksum kristet | Afrika | ca 320 | VA4 Kingdom of Aksum |
| 28 | `vastromerska-rikets-fall` | Västromerska riket faller | Europa | 476 | VA4 Fall of the Western Roman Empire |

### Medeltid (501–1500)

| nr | id | titel | världsdel | år | stöd |
|---:|---|---|---|---|---|
| 29 | `muhammeds-forsta-uppenbarelse` | Islams början: Muhammeds första uppenbarelse | Asien | ca 610 | VA3 Muhammad; VA3 Islam |
| 30 | `arabiska-erovringarna` | De arabiska erövringarna | Asien | 622 | VA4 Early Muslim conquests |
| 31 | `chichen-itza` | Chichén Itzá blir mayafolkets maktcentrum | Amerika | ca 750 | VA4 Chichen Itza |
| 32 | `visdomens-hus-bagdad` | Visdomens hus i Bagdad | Asien | ca 754 | VA3 Islamic Golden Age; VA4 Abbasid Caliphate |
| 33 | `lindisfarne` | Vikingar plundrar Lindisfarne | Europa | 793 | VA3 Viking Age; Lgr22 åk 4–6 «vikingars resor» |
| 34 | `karl-den-store-krons` | Karl den store kröns till kejsare | Europa | 800 | VA3 Charlemagne; VA3 Holy Roman Empire; VA4 Carolingian Empire |
| 35 | `diamantsutran-trycks` | Diamantsutran trycks | Asien | 868 | VA3 Printing; VA3 Tang dynasty |
| 36 | `polynesier-nar-hawaii` | Polynesier når Hawaii | Oceanien | ca 940 | VA4 History of Oceania; VA4 Early human migrations (område) |
| 37 | `lanse-aux-meadows` | Nordbor i Amerika: L'Anse aux Meadows | Amerika | 1021 | VA3 Viking Age; Lgr22 åk 4–6 «vikingars resor» |
| 38 | `al-bakri-beskriver-ghana` | Al-Bakri beskriver Ghanarikets huvudstad | Afrika | ca 1068 | VA4 Ghana Empire |
| 39 | `korstagen` | Korstågen | Europa | 1095 | VA3 Crusades |
| 40 | `angkor-wat` | Angkor Wat byggs | Asien | 1113 | VA4 Khmer Empire |
| 41 | `hansan-vaxer-fram` | Hansan växer fram | Europa | ca 1159 | VA4 Hanseatic League; Lgr22 åk 4–6 «medeltidens handelssystem» |
| 42 | `stora-zimbabwe` | Stora Zimbabwe, en stad av sten | Afrika | ca 1201 | VA4 Great Zimbabwe |
| 43 | `mongolernas-erovringar` | Mongolernas erövringar | Asien | 1209 | VA3 Mongol Empire; VA3 Genghis Khan |
| 44 | `moai-rapa-nui` | Rapa Nui och moai-statyerna | Oceanien | ca 1250 | VA4 History of Oceania (område) |
| 45 | `polynesier-nar-aotearoa` | Polynesier bosätter sig på Aotearoa (Nya Zeeland) | Oceanien | ca 1250 | VA4 History of Oceania; VA4 Early human migrations (område) |
| 46 | `osmanska-riket` | Osmanska riket | Europa | ca 1299 | VA3 Ottoman Empire |
| 47 | `mansa-musa-kairo` | Mansa Musa i Kairo | Afrika | 1324 | VA3 Mansa Musa; VA3 Mali Empire |
| 48 | `tenochtitlan` | Tenochtitlan | Amerika | ca 1325 | VA3 Aztecs; VA4 Tenochtitlan |
| 49 | `digerdoden` | Digerdöden | Europa | 1346 | VA3 Black Death |
| 50 | `ming` | Mingdynastin | Asien | 1368 | VA4 Ming dynasty |
| 51 | `kungadomet-kongo-grundas` | Kungadömet Kongo grundas | Afrika | ca 1390 | VA4 Kingdom of Kongo |
| 52 | `pachacuti-inkariket` | Pachacuti gör Cusco till Inkariket | Amerika | ca 1438 | VA3 Inca Empire |
| 53 | `gutenberg` | Gutenbergs tryckpress | Europa | ca 1440 | VA3 Johannes Gutenberg; VA3 Printing |
| 54 | `konstantinopels-fall` | Konstantinopels fall | Europa | 1453 | VA4 Fall of Constantinople |
| 55 | `guru-nanak` | Guru Nanak grundar sikhismen | Asien | 1469 | VA3 Sikhism |
| 56 | `columbus` | Columbus når Amerika | Amerika | 1492 | VA3 Christopher Columbus; VA3 European colonization of the Americas; Lgr22 åk 7–9 «Europeisk kolonisation» |
| 57 | `vasco-da-gama-nar-indien` | Vasco da Gama når Indien sjövägen | Asien | 1498 | VA3 Age of Discovery; VA4 Portuguese Empire |

### Tidigmodern tid (1501–1799)

| nr | id | titel | världsdel | år | stöd |
|---:|---|---|---|---|---|
| 58 | `luthers-teser` | Luthers 95 teser | Europa | 1517 | VA3 Martin Luther; VA3 Reformation; Lgr22 åk 4–6 «Reformationen» |
| 59 | `atlantiska-slavhandeln` | Den transatlantiska slavhandeln | Afrika | 1519 | VA4 Atlantic slave trade; Lgr22 åk 7–9 «slavhandel» |
| 60 | `spanska-erovringen-av-aztekriket` | Spanska erövringen av Aztekriket | Amerika | 1519 | VA4 Spanish conquest of the Aztec Empire |
| 61 | `gustav-vasa` | Gustav Vasa väljs till kung | Europa | 1523 | Lgr22 åk 4–6 «framväxten av en stark kungamakt i Sverige» |
| 62 | `forsta-slaget-vid-panipat` | Första slaget vid Panipat | Asien | 1526 | VA3 Mughal Empire |
| 63 | `spanska-erovringen-av-inkariket` | Spanska erövringen av Inkariket | Amerika | 1532 | VA4 Spanish conquest of the Inca Empire |
| 64 | `kopernikus-de-revolutionibus` | Kopernikus: jorden kretsar kring solen | Europa | 1543 | VA3 Nicolaus Copernicus; VA3 Scientific Revolution |
| 65 | `trettioariga-kriget` | Trettioåriga kriget | Europa | 1618 | VA4 Thirty Years' War; Lgr22 åk 4–6 «Det svenska Östersjöväldet» |
| 66 | `sakoku-japan-stanger` | Japan stänger sig (sakoku) | Asien | 1633 | VA4 Edo period; VA4 Tokugawa shogunate |
| 67 | `kapkolonin-1652` | Nederländarna grundar Kapkolonin | Afrika | 1652 | VA4 Dutch East India Company; Lgr22 åk 7–9 «Europeisk kolonisation» |
| 68 | `stora-nordiska-kriget` | Stora nordiska kriget | Europa | 1700 | VA4 Great Northern War; Lgr22 åk 4–6 «Det svenska Östersjöväldet» |
| 69 | `asanteriket-grundas` | Asanteriket växer fram | Afrika | 1701 | VA4 Asante Empire |
| 70 | `watt-separat-kondensor` | Watt kommer på den separata kondensorn | Europa | 1765 | VA3 Industrial Revolution; VA3 Steam engine; Lgr22 åk 7–9 «Industrialiseringen i Europa» |
| 71 | `amerikanska-frihetskriget` | Amerikanska frihetskriget | Amerika | 1775 | VA3 American Revolution; VA4 American Revolutionary War; Lgr22 åk 7–9 «Revolutioner» |
| 72 | `forsta-flottan-sydney` | Första flottan når Sydney | Oceanien | 1788 | VA4 History of Australia; VA3 British Empire |
| 73 | `stormningen-av-bastiljen` | Bastiljen stormas | Europa | 1789 | VA3 French Revolution; Lgr22 åk 7–9 «Revolutioner» |
| 74 | `haitiska-revolutionen` | Haitiska revolutionen | Amerika | 1791 | VA4 Haitian Revolution; Lgr22 åk 7–9 «Revolutioner» |

### 1800-tal

| nr | id | titel | världsdel | år | stöd |
|---:|---|---|---|---|---|
| 75 | `napoleonkrigen` | Napoleonkrigen | Europa | 1803 | VA3 Napoleon; VA4 Napoleonic Wars |
| 76 | `sokotokalifatet-grundas` | Usman dan Fodio grundar Sokotokalifatet | Afrika | 1804 | VA4 Sokoto Caliphate |
| 77 | `slavhandeln-forbjuds-1807` | Storbritannien förbjuder slavhandeln | Europa | 1807 | VA4 Abolitionism |
| 78 | `spanskamerikanska-sjalvstandighetskrigen` | De spanskamerikanska självständighetskrigen | Amerika | 1808 | VA3 Simón Bolívar; VA4 Spanish American wars of independence |
| 79 | `forsta-opiumkriget` | Första opiumkriget | Asien | 1839 | VA4 First Opium War |
| 80 | `waitangifordraget` | Waitangifördraget | Oceanien | 1840 | VA4 History of Oceania; VA4 Colonization (område) |
| 81 | `kommunistiska-manifestet` | Kommunistiska manifestet ges ut | Europa | 1848 | VA3 Communism; Lgr22 åk 7–9 «politiska ideologier» |
| 82 | `om-arternas-uppkomst` | Darwins Om arternas uppkomst | Europa | 1859 | VA3 Charles Darwin |
| 83 | `amerikanska-inbordeskriget` | Amerikanska inbördeskriget | Amerika | 1861 | VA4 American Civil War; VA3 Abraham Lincoln |
| 84 | `meijirestaurationen` | Meijirestaurationen i Japan | Asien | 1868 | VA4 Meiji Restoration |
| 85 | `berlinkonferensen` | Berlinkonferensen om Afrika | Europa | 1884 | VA3 Scramble for Africa; Lgr22 åk 7–9 «imperialism» |
| 86 | `kvinnlig-rostratt-nya-zeeland` | Kvinnor får rösta i Nya Zeeland | Oceanien | 1893 | Lgr22 åk 7–9 «kampen för allmän rösträtt för kvinnor och män»; VA4 Women's history |
| 87 | `forsta-italiensk-etiopiska-kriget` | Första italiensk-etiopiska kriget | Afrika | 1895 | VA3 Scramble for Africa; VA4 Ethiopian Empire |

### 1900-tal

| nr | id | titel | världsdel | år | stöd |
|---:|---|---|---|---|---|
| 88 | `wright` | Bröderna Wright flyger | Amerika | 1903 | VA3 Aircraft; VA4 History of aviation |
| 89 | `herero-och-nama-folkmordet` | Folkmordet på herero och nama | Afrika | 1904 | VA3 Genocide; Lgr22 åk 7–9 «folkmord» |
| 90 | `forsta-varldskriget` | Första världskriget | Europa | 1914 | VA3 World War I; Lgr22 åk 7–9 «De båda världskrigen» |
| 91 | `oktoberrevolutionen` | Oktoberrevolutionen i Ryssland | Europa | 1917 | VA4 Russian Revolution; VA3 Soviet Union; Lgr22 åk 7–9 «Revolutioner» |
| 92 | `spanska-sjukan` | Spanska sjukan | Amerika | 1918 | VA4 Spanish flu |
| 93 | `penicillinet-upptacks` | Penicillinet upptäcks | Europa | 1928 | VA3 Antibiotic |
| 94 | `borskraschen-1929` | Börskraschen på Wall Street | Amerika | 1929 | VA4 Wall Street crash of 1929; VA3 Great Depression |
| 95 | `saltmarschen` | Gandhis saltmarsch | Asien | 1930 | VA3 Mahatma Gandhi; VA4 Indian independence movement |
| 96 | `andra-varldskriget` | Andra världskriget | Europa | 1939 | VA3 World War II; Lgr22 åk 7–9 «De båda världskrigen» |
| 97 | `attacken-mot-pearl-harbor` | Attacken mot Pearl Harbor (del av `andra-varldskriget`) | Oceanien | 1941 | VA4 Attack on Pearl Harbor |
| 98 | `atombomberna-hiroshima-nagasaki` | Atombomberna mot Hiroshima och Nagasaki (del av `andra-varldskriget`) | Asien | 1945 | VA4 Atomic bombings of Hiroshima and Nagasaki |
| 99 | `auschwitz-befrias` | Auschwitz befrias (del av `andra-varldskriget`) | Europa | 1945 | VA4 The Holocaust; Lgr22 åk 7–9 «Förintelsen» |
| 100 | `fn-grundas` | FN-stadgan skrivs under och FN grundas | Amerika | 1945 | VA3 United Nations |
| 101 | `indonesiens-sjalvstandighet` | Indonesien utropar sin självständighet | Asien | 1945 | VA4 Indonesian National Revolution; VA3 Decolonization |
| 102 | `indiens-sjalvstandighet` | Indien blir självständigt | Asien | 1947 | VA4 Partition of India; VA3 Decolonization |
| 103 | `arabisk-israeliska-kriget-1948` | Arabisk-israeliska kriget 1948 | Asien | 1948 | VA4 Arab–Israeli conflict |
| 104 | `manskliga-rattigheter-1948` | FN antar förklaringen om de mänskliga rättigheterna | Europa | 1948 | VA3 Human rights; Lgr22 åk 1–3 «Mänskliga rättigheter» |
| 105 | `folkrepubliken-kina-utropas` | Folkrepubliken Kina utropas | Asien | 1949 | VA4 Chinese Civil War; VA4 History of the People's Republic of China |
| 106 | `koreakriget` | Koreakriget | Asien | 1950 | VA4 Korean War |
| 107 | `vietnamkriget` | Vietnamkriget | Asien | ca 1955 | VA4 Vietnam War |
| 108 | `ghanas-sjalvstandighet` | Ghana blir självständigt | Afrika | 1957 | VA3 Decolonization |
| 109 | `sputnik` | Sputnik 1, första satelliten | Asien | 1957 | VA4 Space Race; VA3 Satellite |
| 110 | `afrikas-ar-1960` | Afrikas år: 17 kolonier blir självständiga | Afrika | 1960 | VA3 Decolonization |
| 111 | `berlinmuren-byggs` | Berlinmuren byggs | Europa | 1961 | VA4 Berlin Wall; VA3 Cold War; Lgr22 åk 7–9 «Kalla krigets konflikter» |
| 112 | `kubakrisen` | Kubakrisen | Amerika | 1962 | VA4 Cuban Missile Crisis; Lgr22 åk 7–9 «Kalla krigets konflikter» |
| 113 | `apollo-11` | Apollo 11 landar på månen | Amerika | 1969 | VA4 Moon landing |
| 114 | `smittkoppor-utrotas` | Smittkopporna utrotas | Afrika | 1977 | VA3 Smallpox |
| 115 | `berlinmurens-fall` | Berlinmuren faller | Europa | 1989 | VA4 Revolutions of 1989; VA4 Berlin Wall; Lgr22 åk 7–9 «det kalla krigets slut» |
| 116 | `www` | Webben uppfinns | Europa | 1989 | VA3 Internet; VA3 Information Age |
| 117 | `sovjetunionens-upplosning` | Sovjetunionen upplöses | Europa | 1991 | VA4 Dissolution of the Soviet Union |
| 118 | `folkmordet-i-rwanda` | Folkmordet i Rwanda | Afrika | 1994 | VA4 Rwandan genocide |
| 119 | `sydafrikas-forsta-fria-val` | Sydafrikas första fria val: apartheid tar slut | Afrika | 1994 | VA4 Apartheid; VA3 Nelson Mandela |

### 2000-tal

| nr | id | titel | världsdel | år | stöd |
|---:|---|---|---|---|---|
| 120 | `attackerna-11-september-2001` | Terrorattackerna den 11 september | Amerika | 2001 | VA4 September 11 attacks; VA4 War on terror |
| 121 | `arabiska-varen` | Arabiska våren | Afrika | 2010 | VA4 Arab Spring |
| 122 | `parisavtalet` | Parisavtalet om klimatet | Europa | 2015 | VA3 Climate change |
| 123 | `covid-19-pandemin` | Covid-19-pandemin | Asien | 2019 | VA4 COVID-19 pandemic |

## Spridning

Mätt med perioderna och världsdelarna i `tools/tackning.py` (samma `region()` som Samtidigt-panelen).

| period | Europa | Asien | Afrika | Amerika | Oceanien | summa |
|---|---:|---:|---:|---:|---:|---:|
| Förhistoria (före 3000 f.Kr.) | 0 | 3 | 1 | 0 | 0 | 4 |
| Antiken (3000 f.Kr.–500) | 4 | 10 | 5 | 4 | 1 | 24 |
| Medeltid (501–1500) | 8 | 9 | 4 | 5 | 3 | 29 |
| Tidigmodern tid (1501–1799) | 7 | 2 | 3 | 4 | 1 | 17 |
| 1800-tal | 5 | 2 | 2 | 2 | 2 | 13 |
| 1900-tal | 10 | 9 | 6 | 6 | 1 | 32 |
| 2000-tal | 1 | 1 | 1 | 1 | 0 | 4 |
| **summa** | **35** | **36** | **22** | **22** | **8** | **123** |

| världsdel | i förslaget | andel av förslaget | på globen | andel av globen | urval av världsdelens händelser | andel av landytan |
|---|---:|---:|---:|---:|---:|---:|
| Europa | 35 | 28 % | 152 | 18 % | 23 % | 8 % |
| Asien | 36 | 29 % | 236 | 29 % | 15 % | 32 % |
| Afrika | 22 | 18 % | 146 | 18 % | 15 % | 22 % |
| Amerika | 22 | 18 % | 170 | 21 % | 13 % | 31 % |
| Oceanien | 8 | 7 % | 123 | 15 % | 7 % | 7 % |

Kategorier: civilisationer 46, krig 31, religion 10, kultur 9, vetenskap 7, ekonomi 6, upptackter 5, halsa 5, rymden 2, manniskan 1, klimat 1. Krig (kind war eller kategorin krig): 31 av 123. Händelser med partOf: 4.

**Bedömning.**
- **Europa** har 35 av 123 (28 %) mot 18 % av globen och 8 % av landytan. Det följer DasKrokodils beslut om ett svenskt och europeiskt skolperspektiv; Asien är ändå störst, och alla världsdelar finns med i varje period utom i förhistorien och Oceanien på 2000-talet.
- **Oceanien är svagt** (8, varav 5 med bara "område"-stöd). Listorna har nästan inget om Oceanien, så det går inte att höja andelen med direkt stöd.
- **Krig:** 31 av 123 (25 %). Krigen är oftast hela krig (`kind: war`), inte enskilda slag.
- **Tunna celler:** 2000-talet har 4 och förhistorien 4. Förhistorien är tunn eftersom tidslinjen i stort sett börjar 3000 f.Kr. och människans långa historia hör till version 7.
- **Kategorier:** vetenskap, hälsa, klimat och rymden är få (15 sammanlagt). Reserven har fler (`newtons-principia`, `curie-polonium-radium`, `dna-strukturen`, `jenners-vaccin`, `gagarin-vostok-1`, `cai-lun-papper`).

## Reserv: 62 händelser med stöd som inte kom med

| id | titel | världsdel | år | stöd |
|---|---|---|---|---|
| `kermariket` | Kermariket i Nubien | Afrika | ca 2500 f.Kr. | VA4 Nubia; VA4 Kingdom of Kush |
| `ramses-krig-mot-hettiterna` | Ramses II:s krig mot hettiterna | Asien | ca 1275 f.Kr. | VA3 Ramesses II; VA4 Hittites |
| `orakelben-skrift` | Orakelbenen, Kinas äldsta bevarade skrift | Asien | ca 1254 f.Kr. | VA4 Shang dynasty; VA3 Writing |
| `chavin-de-huantar` | Tempelplatsen Chavín de Huántar | Amerika | ca 1200 f.Kr. | VA4 Chavín culture |
| `olympiska-spelen` | De antika olympiska spelen | Europa | ca 776 f.Kr. | VA3 Ancient Greece; Lgr22 åk 7–9 «Antiken» |
| `piye-erovrar-egypten` | Piye från Kush erövrar Egypten | Afrika | ca 728 f.Kr. | VA4 Kingdom of Kush |
| `lydiska-mynt` | Lydierna präglar några av världens första mynt | Europa | ca 700 f.Kr. | VA4 Lydia |
| `mahavira` | Mahavira, jainismens 24:e tirthankara | Asien | ca 599 f.Kr. | VA3 Jainism |
| `monte-alban-grundas` | Monte Albán grundas | Amerika | ca 500 f.Kr. | VA4 Zapotec civilization |
| `sokrates` | Sokrates lever | Europa | ca 470 f.Kr. | VA3 Socrates |
| `puniska-krigen` | De puniska krigen | Europa | 264 f.Kr. | VA4 Punic Wars |
| `caesar-mordas` | Julius Caesar mördas | Europa | 44 f.Kr. | VA3 Julius Caesar; VA4 Roman Republic |
| `vesuvius-79` | Vesuvius begraver Pompeji | Europa | 79 | VA4 Pompeii |
| `cai-lun-papper` | Cai Lun förbättrar papperet | Asien | 105 | VA3 Paper |
| `tiwanaku` | Tiwanaku vid Titicacasjön | Amerika | ca 375 | VA4 Tiwanaku |
| `nalanda` | Nalanda, buddhistiskt lärosäte | Asien | ca 427 | VA3 Gupta Empire |
| `hagia-sofia-byggs-532` | Hagia Sofia byggs | Europa | 532 | VA3 Byzantine Empire |
| `wari-riket` | Wari-riket i Anderna | Amerika | ca 600 | VA4 Wari culture |
| `mosken-i-cordoba` | Stora moskén i Córdoba byggs | Europa | 785 | VA4 Al-Andalus; VA4 Umayyad state of Córdoba |
| `chan-chan` | Chan Chan, chimúfolkets huvudstad | Amerika | ca 850 | VA4 Chimor |
| `chaco-canyon` | De stora husen i Chaco Canyon | Amerika | ca 900 | VA4 Ancestral Puebloans |
| `kairo-grundas` | Fatimiderna grundar Kairo | Afrika | 969 | VA4 Fatimid Caliphate |
| `kievrus-kristnas` | Kievriket blir kristet | Europa | ca 988 | VA4 Kievan Rus' |
| `sagan-om-genji` | Sagan om Genji skrivs | Asien | ca 1000 | VA4 Heian period |
| `cahokia` | Cahokia och Monks Mound | Amerika | ca 1050 | VA4 Cahokia; VA4 Mississippian period (archaeology) |
| `marrakech-grundas` | Marrakech grundas av almoraviderna | Afrika | ca 1070 | VA4 Almoravid dynasty |
| `salomoniska-dynastin-tar-makten` | Yekuno Amlak grundar den salomoniska dynastin | Afrika | 1270 | VA4 Ethiopian Empire |
| `machu-picchu` | Machu Picchu byggs | Amerika | ca 1450 | VA4 Machu Picchu |
| `askia-muhammad-tar-makten` | Askia Muhammad tar makten i Songhairiket | Afrika | 1493 | VA4 Songhai Empire |
| `magellans-jordenruntsegling` | Den första seglingen jorden runt | Europa | 1519 | VA4 Magellan expedition |
| `andra-slaget-vid-panipat` | Andra slaget vid Panipat | Asien | 1556 | VA3 Akbar |
| `imjinkriget` | Imjinkriget | Asien | 1592 | VA4 Imjin War |
| `jamestown-1607` | Engelsmännen grundar Jamestown | Amerika | 1607 | VA4 British colonization of the Americas |
| `newtons-principia` | Newtons Principia | Europa | 1687 | VA3 Isaac Newton; VA3 Scientific Revolution |
| `slaget-vid-plassey` | Slaget vid Plassey | Asien | 1757 | VA4 East India Company |
| `jenners-vaccin` | Edward Jenner och det första vaccinet | Europa | 1796 | VA3 Vaccine; VA3 Smallpox |
| `brasiliens-sjalvstandighet` | Brasilien förklarar sig självständigt | Amerika | 1822 | VA4 Empire of Brazil |
| `taipingupproret` | Taipingupproret | Asien | 1850 | VA4 Taiping Rebellion |
| `indiska-upproret-1857` | Indiska upproret 1857 | Asien | 1857 | VA4 Indian Rebellion of 1857 |
| `paraguaykriget` | Paraguaykriget (trippelallianskriget) | Amerika | 1864 | VA4 Paraguayan War |
| `telefonen` | Bell får patent på telefonen | Amerika | 1876 | VA3 Telephone |
| `anglo-zuluiska-kriget` | Anglo-zuluiska kriget | Afrika | 1879 | VA4 Anglo-Zulu War |
| `kongofristaten` | Kongofristaten, Leopold II:s privata koloni | Afrika | 1885 | VA4 Congo Free State |
| `curie-polonium-radium` | Marie och Pierre Curie upptäcker polonium och radium | Europa | 1898 | VA3 Marie Curie |
| `mexikanska-revolutionen` | Mexikanska revolutionen | Amerika | 1910 | VA4 Mexican Revolution |
| `slaget-vid-stalingrad` | Slaget vid Stalingrad | Europa | 1942 | VA4 Battle of Stalingrad |
| `dna-strukturen` | DNA-molekylens dubbelspiral | Europa | 1953 | VA3 DNA |
| `kubanska-revolutionen` | Kubanska revolutionen | Amerika | 1953 | VA4 Cuban Revolution |
| `algeriska-frihetskriget` | Algeriska frihetskriget | Afrika | 1954 | VA4 Algerian War |
| `gagarin-vostok-1` | Jurij Gagarin blir första människan i rymden | Europa | 1961 | VA4 Space Race; VA3 Spaceflight |
| `marschen-till-washington` | Marschen till Washington och "I Have a Dream" | Amerika | 1963 | VA4 Civil rights movement |
| `kulturrevolutionen` | Kulturrevolutionen i Kina | Asien | 1966 | VA4 Cultural Revolution |
| `biafrakriget` | Biafrakriget (nigerianska inbördeskriget) | Afrika | 1967 | VA4 Nigerian Civil War |
| `bangladeshs-befrielsekrig` | Bangladeshs befrielsekrig | Asien | 1971 | VA4 Bangladesh Liberation War |
| `iran-irak-kriget` | Kriget mellan Iran och Irak | Asien | 1980 | VA4 Iran–Iraq War |
| `tjernobylkatastrofen` | Tjernobylkatastrofen | Europa | 1986 | VA4 Chernobyl disaster |
| `gulfkriget` | Gulfkriget | Asien | 1990 | VA4 Gulf War |
| `andra-kongokriget` | Andra Kongokriget | Afrika | 1998 | VA4 Second Congo War |
| `euron-infors` | Euron införs | Europa | 1999 | VA4 European integration; VA3 European Union |
| `irakkriget` | Irakkriget | Asien | 2003 | VA4 Iraq War |
| `tsunamin-i-indiska-oceanen-2004` | Tsunamin i Indiska oceanen | Asien | 2004 | VA4 2004 Indian Ocean earthquake and tsunami |
| `finanskrisen-2008` | Finanskrisen | Amerika | 2007 | VA4 2008 financial crisis |

## Saknas: listorna nämner det, globen har det inte

Kontrollerat genom sökning på id, titel och sammanfattning i `data/events.json`. Inga händelser läggs in här. DasKrokodil sa ja till issues 2026-11-09, och de 40 ämnena ligger nu i åtta issues i milstolpen "Täckning: händelser och balans", där årtal och plats tas ur öppnade källor (källpolicyn). Listorna säger bara att ämnet är viktigt.

| issue | innehåll |
|---|---|
| #1012 | Sverige och Norden enligt Lgr22: kristnandet och statsbildningen, emigrationen, demokratiseringen (har `redo`) |
| #1013 | Gulag och Holodomor |
| #1014 | Renässansen och upplysningen |
| #1015 | Afrika: bantuexpansionen, Mutapa, Oyo, Angolas inbördeskrig |
| #1016 | Amerika: de första människorna, mexikansk-amerikanska kriget, Operation Condor, columbianska utbytet |
| #1017 | Kina 1899–1989 |
| #1018 | Väst-, Syd- och Sydostasien |
| #1019 | Europa och världen |

De övriga får `redo` en i taget, eftersom de ändrar samma periodfiler i `data/handelser/`.

Hela listan:

| prio | ämne | lista | världsdel |
|---:|---|---|---|
| 1 | Kristendomens etablerande och statsbildningen i Norden | Lgr22 åk 4–6 «Statsbildning och kristendomens etablerande i Norden» | Europa |
| 1 | Emigrationen från Sverige | Lgr22 åk 4–6 «emigrationen från Sverige» | Europa (och Amerika) |
| 1 | Demokratiseringen i Sverige och allmän rösträtt | Lgr22 åk 7–9 «Demokratiseringen i Sverige», «allmän rösträtt» | Europa |
| 1 | Gulag | Lgr22 åk 7–9 «Gulag»; VA4 *Gulag* | Europa/Asien |
| 1 | Renässansen | VA3 *Renaissance* | Europa |
| 1 | Upplysningen | VA3 *Age of Enlightenment* | Europa |
| 1 | Bantuexpansionen | VA4 *Bantu expansion* | Afrika |
| 1 | Amerikas befolkning (de första människorna i Amerika) | VA4 *Peopling of the Americas* | Amerika |
| 2 | Globaliseringen | VA3 *Globalization* | världen |
| 2 | Kyros den store och Perserriket | VA3 *Cyrus the Great*, *Achaemenid Empire* | Asien |
| 2 | Armeniska folkmordet | VA4 *Armenian genocide* | Asien |
| 2 | Iranska revolutionen | VA4 *Iranian Revolution* | Asien |
| 2 | Boxarupproret | VA4 *Boxer Rebellion* | Asien |
| 2 | Rysk-japanska kriget | VA4 *Russo-Japanese War* | Asien |
| 2 | Xinhairevolutionen 1911 | VA4 *1911 Revolution* | Asien |
| 2 | Andra kinesisk-japanska kriget och Nanjingmassakern | VA4 *Second Sino-Japanese War*, *Nanjing Massacre* | Asien |
| 2 | Stora språnget | VA4 *Great Leap Forward* | Asien |
| 2 | Himmelska fridens torg 1989 | VA4 *1989 Tiananmen Square protests and massacre* | Asien |
| 2 | Folkmordet i Kambodja | VA4 *Cambodian genocide* | Asien |
| 2 | Turkiska frihetskriget | VA4 *Turkish War of Independence* | Asien |
| 2 | Safaviderna | VA4 *Safavid dynasty* | Asien |
| 2 | Mutapariket | VA4 *Mutapa Empire* | Afrika |
| 2 | Oyoriket | VA4 *Oyo Empire* | Afrika |
| 2 | Angolas inbördeskrig | VA4 *Angolan Civil War* | Afrika |
| 2 | Mexikansk-amerikanska kriget | VA4 *Mexican–American War* | Amerika |
| 2 | Operation Condor | VA4 *Operation Condor* | Amerika |
| 2 | Columbianska utbytet | VA4 *Columbian exchange* | världen |
| 3 | Tordesillasfördraget | VA4 *Treaty of Tordesillas* | Europa |
| 3 | Sjuårskriget | VA4 *Seven Years' War* | världen |
| 3 | Jordbävningen i Lissabon 1755 | VA4 *1755 Lisbon earthquake* | Europa |
| 3 | Jordbävningen i Shaanxi 1556 | VA4 *1556 Shaanxi earthquake* | Asien |
| 3 | Svälten i Bengalen 1770 | VA4 *Great Bengal famine of 1770* | Asien |
| 3 | Wienkongressen | VA4 *Congress of Vienna* | Europa |
| 3 | Revolutionerna 1848 | VA4 *Revolutions of 1848* | Europa |
| 3 | Italiens och Tysklands enande | VA4 *Unification of Italy*, *Unification of Germany* | Europa |
| 3 | Versaillesfreden | VA4 *Treaty of Versailles* | Europa |
| 3 | Spanska inbördeskriget | VA4 *Spanish Civil War* | Europa |
| 3 | Holodomor | VA4 *Holodomor* | Europa |
| 3 | Ungern 1956 och Pragvåren 1968 | VA4 *Hungarian Revolution of 1956*, *Prague Spring* | Europa |
| 3 | Bronsålderns kollaps | VA4 *Late Bronze Age collapse* | Europa/Asien/Afrika |

## Öppna frågor till DasKrokodil

Besvarade 2026-11-09: perspektivet, antalet, Oceanien, händelser inom krig och saknas-listan (se överst). Kvar:

1. **Listorna.** Räcker Lgr22 och Vital articles nivå 3–4, eller ska en tredje lista (till exempel OpenStax *World History*) kontrolleras först i en session där den går att öppna?
2. **Raderna.** Godkänner du de 123 raderna, eller vill du stryka eller byta några?
3. **Översättningar.** Fältet `significance` är ett tal och behöver ingen översättning, men vyns namn "Översikt" läggs i alla fem språken när vyn byggs (beslut 2026-11-06).

## Nästa steg efter godkännande

1. DasKrokodil stryker eller byter rader i tabellen (kommentar på #1004 eller i pull requesten).
2. Ett nytt issue: sätt `"significance": 1` på de godkända händelserna i `data/handelser/`, beskriv fältet i `docs/datamodell.md` och skriv beslutet om listorna i `docs/beslut/` (Claude Code, eftersom det är data).
3. Vyn "Översikt" i Lager (`data/vyer.json`) och kopplingen till #1000 (Codex).
4. Saknas-issuena #1012–#1019; händelser som läggs in där kan senare få `significance` om DasKrokodil vill.
