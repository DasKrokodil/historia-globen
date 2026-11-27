# Händelser som saknar bild efter omgång 1 (#299)

Omgång 1 gav historiska bilder från Wikimedia Commons till krigens viktigaste händelse (`"top": true`) och till händelser som inte är krig eller slag. De här händelserna fick ingen bild, eftersom det inte fanns någon fri historisk bild som visar händelsen. De kan få en illustration i AI-omgången (märkt "Illustration", se [bildpromptar.md](bildpromptar.md)).

| Händelse (id) | Varför ingen bild |
|---|---|
| `slaget-vid-gaixia` | Ingen avbildning av slaget på Commons, bara en karta och porträtt av Xiang Yu där det är oklart vem som avbildas. |
| `qi-ger-upp-221-fkr` | Ingen avbildning av händelsen hittades. |
| `kalinga-erovras` | Bara kartor, nutida foton av monument vid Dhauli och en nutida relief (2024). Ingen historisk bild. |
| `sjoslaget-vid-noryang` | Wikidatas bild är en karta (CC BY-SA 3.0/GFDL). Ingen historisk avbildning av slaget hittades. |
| `eviansavtalen` | Wikidatas bild är ett nutida minnesmärke. Fotot av FLN:s delegation i Évian har en osäker licens på Commons (hämtat från en bildbyrå, "PD US not renewed"), så det användes inte. |
| `slaget-vid-nuuanu` | Bara ett nutida foto av klippan Nuʻuanu Pali. |
| `nanjing-blir-tianjing-1853` | Ingen bild av intagandet. Det finns väggmålningar från Taipingriket och en gravyr av HMS Hermes utanför Nanjing 1853, men de visar inte händelsen. |
| `bougainville-utropar-sjalvstandighet` | Bara kartor. |
| `sista-giljotinen` | Ingen fri bild av händelsen. |
| `upproret-i-goma-1998` | Bara kartor och foton från Goma 2013. |

**AI-omgången (2026-10-30):** `slaget-vid-gaixia`, `qi-ger-upp-221-fkr`, `sjoslaget-vid-noryang`, `kalinga-erovras`, `eviansavtalen`, `slaget-vid-nuuanu`, `sista-giljotinen`, `nanjing-blir-tianjing-1853`, `bougainville-utropar-sjalvstandighet` och `upproret-i-goma-1998` har fått illustrationer gjorda med promptarna i [bildpromptar-299.md](bildpromptar-299.md). Bougainville och Goma gjordes om utan flaggor, eftersom de första versionerna hade flaggor som inte stämde (en påhittad flagga för Bougainville och Rwandas flagga från 2001 i Goma 1998).

## Turerna och lektionerna (#1875, 2026-11-20)

Sökt på Wikimedia Commons 2026-11-20. Väntar på en AI-illustration som en människa gör i ChatGPT ([bilder-ai-illustrationer.md](bilder-ai-illustrationer.md)), med promptarna i [bildpromptar-1875.md](bildpromptar-1875.md).

| Händelse (id) | Varför ingen bild |
|---|---|
| `al-bakri-beskriver-ghana` | Ingen bild av al-Bakris bok eller av huvudstaden. Under Koumbi Saleh finns bara en plan av fyndplatsen (karta, CC BY-SA 4.0), en satellitbild av gravfältet och ett museifoto av en skifferplatta med inskrift (CC BY-SA 4.0). Det är omstritt om Koumbi Saleh är den stad al-Bakri beskrev, så ett fynd därifrån visar inte säkert händelsen. |
| `slaget-vid-tondibi` | Bara kartor (Saadiernas erövringar, Songhairiket). Ingen avbildning av slaget eller av arméerna hittades. |

## Bilder att se över

Några händelser fick en bild som fungerar men som AI-omgången kan ersätta om Rikard vill:

- `ibn-battuta-resa`: en fantasiteckning av Ibn Battuta ur en egyptisk bok från 1961 (public domain enligt Commons). Bildtexten säger att den inte visar hur han såg ut.
- `muhammeds-forsta-uppenbarelse`: ett nutida foto av berget Jabal an-Nur (CC BY 2.0). Wikidatas bild användes inte, eftersom profeten aldrig avbildas.
- `nintendo`: Nintendos hanafuda-kort från 1926–1945, flera decennier efter grundandet 1889.
- `mexikos-grundlag-1917`, `haitis-sjalvstandighet` och `sjalvstandighetsforklaringen`: bilder av dokumentet, inte av händelsen.

## Andra världskriget i lektionen (#1874, 2026-11-20)

Alla tolv händelser i turen `andra-varldskriget` som saknade bild fick ett historiskt fotografi från Wikimedia Commons (public domain eller CC BY-SA 3.0 DE, filsidorna öppnade 2026-11-20). Ingen AI-illustration behövdes, och ingen prompt togs fram. Bilden ligger på händelsen (`images/events/<id>.webp`), så den syns i faktarutan som steget öppnar, i lektionen och på globen. Värda att se över:

- `auschwitz-befrias`: en hög glasögon i Auschwitz (Bundesarchiv, Bild 183-R69919, Zentralbild, CC BY-SA 3.0 DE). Bildarkivets text kallar högen vittnen om massmordet och daterar fotot till januari–februari 1945; bildtexten säger det och inget mer. Inga människor syns. Lärarfältet i lektionen säger att stegen visar bilder från Förintelsen och atombombningarna. Tre andra bilder valdes bort: fotot av fångar bakom taggtråd (licensen PD-Polish med okänd fotograf, och det visar offer), Stanisław Muchas foto av Birkenaus port (filsidan säger själv att rättigheterna är oklara) och en flygbild från februari 1945 (märkt PD-USGov men med en tysk stämpel, så licensen är osäker).
- `atombomberna-hiroshima-nagasaki`: atommolnen över båda städerna, fotograferade från amerikanska flygplan (PD-USGov-DOE). Inga skadade människor syns.
- `anfallet-pa-polen`: foto från ett tyskt propagandakompani (Bundesarchiv, PK 637), och bildtexten säger det. `frankrikes-fall`: Bundesarchiv, okänd fotograf; filsidan nämner inget propagandakompani, så bildtexten gör det inte heller.
- `slaget-om-storbritannien` och `andra-slaget-vid-el-alamein` (IWM): Commons-taggen är PD-UKGov, men filsidan citerar också IWM Non Commercial Licence. Motsägelsen står i källornas `note`, och bildtexten säger bara "public domain enligt Wikimedia Commons".

## Asien, omgång 2 (#773, 2026-11-20)

Sju händelser i Asien fick en riktig bild. Licensen kontrollerades i varje filsidas wikitext på Wikimedia Commons (öppnad med `action=raw`) och i Library of Congress katalogpost (`?fo=json`) 2026-11-20:

- `jikji`: två sidor ur boken, digitaliserade av Frankrikes nationalbibliotek (PD-scan).
- `tripitaka-koreana`: träblocken på hyllorna i Haeinsa, foto 2022 (CC0).
- `lothal`: bassängen som tolkas som en docka, foto 2012 (CC BY-SA 4.0). Bildtexten säger "kan ha varit en docka", som händelsens källa.
- `jarnpelaren-i-delhi`: pelaren i Qutbkomplexet, foto 2007 (CC BY-SA 3.0; filsidan erbjuder också GFDL och äldre CC BY-SA-versioner, och säger själv att filnamnet är felaktigt).
- `slaget-vid-issos`: Alexandermosaiken från Pompeji, omkring 100 f.Kr. Filsidan har mallen Licensed-PD: mosaiken är public domain och fotot har CC BY-SA 3.0, som vi anger. Bildtexten säger att mosaiken är romersk och gjord mer än 200 år efter slaget.
- `tiangong-kaiwu-1637`: illustrationen av vattendrivna stamphammare, fotograferad ur en engelsk översättning från 1966 (PD-Art, PD-old-100). Bildtexten säger det. Händelsen ligger i den fullt indenterade `data/handelser/1500-1799.json`, där `tools/bilder_in.py` inte hittar platsen, så `image` fylldes i för hand med verktygets `image_field`.
- `xinhairevolutionen`: kinesiskt färgträsnitt av stormningen av Nanjing, tryckt 1911–1915 (Library of Congress, "No known restrictions on publication"). Titeln är satt av biblioteket, och bildtexten säger att det är en samtida folklig bild, inte en ögonvittnesbild.

Andelen händelser med bild i Asien gick från 19 till 21 % (`python3 tools/tackning.py`).

Värda att se över: `tiangong-kaiwu-1637` (ett foto av en boksida, gråblå ton) och `slaget-vid-issos` (mosaiken visar Alexander och Dareios, men om den föreställer just Issos bygger på Commons namn).

**Licensen kontrollerad, men bilden kunde inte hämtas** (upload.wikimedia.org svarade 429 i mer än en timme 2026-11-20). De är förslag till nästa omgång, inte händelser utan fri bild, och behöver ingen AI-illustration:

| Händelse (id) | Fil på Commons och licens enligt filsidan |
|---|---|
| `slaget-vid-chosinreservoaren` | `Marines engage during the Korean War.jpg`, sergeant Frank C. Kerr, U.S. Marine Corps (PD-USGov-Military-Marines). Filsidan säger inte själv "Chosin", men källan är marinkårens sida med foton från Chosin och kategorin är Battle of Chosin Reservoir. |
| `egyptisk-hettitiska-fredsfordraget` | `Treaty of Kadesh.jpg`, den mindre lertavlan från Boğazköy i Istanbul (GFDL och CC BY 3.0, Iocanus 2009). |
| `incidenten-i-tonkinbukten` | `North Vietnamese P-4 under fire from USS Maddox (2 August 1964).jpg`, U.S. Navy USN 711524 (PD-USGov-Military-Navy). Originalet är bara 744 × 582 pixlar, så det måste skalas upp något. |
| `manilagaleonerna` | `GoodsManilaGalleonSanDiego.JPG`, varor från galeonerna i museet i Fuerte de San Diego i Acapulco, 2010 (GFDL och CC BY-SA, alla versioner). Boxerkodexens bild av en galeon vid Marianerna (PD) är bara 937 × 298 pixlar och valdes bort. |
| `gwanggaetostelen` | `Gwanggaeto Stele 1903.jpg` (foto publicerat 1903, PD-old-70-expired) eller `Haotai wang stele outside 2011 07 24.jpg` (licensen inte läst). Ett foto från 2023 (`Gwanggaeto Stele 1.jpg`, CC BY-SA 4.0) hämtades men valdes bort: stenen syns knappt bakom paviljongens glas. |

## Afrika, tidigmodern tid (#772, 2026-11-20)

Tolv händelser i Afrika 1501–1799 fick en bild från Wikimedia Commons (licensen kontrollerad i varje filsidas wikitext 2026-11-20): `agadez-mosken`, `fort-jesus-byggs`, `gondar-blir-etiopiens-huvudstad`, `harar-adals-huvudstad`, `rosettastenen-hittas` (nutida foton), `larda-i-timbuktu-sankore` (Fortiers vykort, början av 1900-talet), `tarikh-al-sudan` (handskriften i BnF), `nzinga-drottning-av-ndongo` (Devérias litografi, 1830-talet), `kapkolonin-1652` (Bells målning, före 1851), `freetown-grundas` (kopparstick 1803), `blabocken-utrotas` (plansch ur Buffons naturhistoria) och `rodriguessolitaren-dor-ut` (Leguat 1708). Fem bilder ligger hela på en bakgrund i bildens egen färg i stället för att beskäras till 4:3: Nzinga, blåbocken, solitären och Freetown på papperston och Rosettastenen på svart. Värda att se över:

- `kapkolonin-1652`: Charles Davidson Bells målning är en europeisk tolkning från 1800-talet, två sekel efter händelsen. Bildtexten säger att den inte är en samtida bild.
- `nzinga-drottning-av-ndongo`: en europeisk litografi gjord långt efter hennes död; bildtexten säger att den inte visar hur hon såg ut.
- `tarikh-al-sudan`: filsidan anger både public domain (handskriften) och CC BY-SA 4.0 (fotot). Vi anger CC BY-SA 4.0, och motsägelsen står i källans `note`.
- `blabocken-utrotas`: filnamnet säger "Allamand, 1778", men filsidan daterar planschen till 1700–1880 och planschens rubrik är "Le Tzeiran". Bildtexten nämner inget år; motsägelsen står i källans `note`.
- `harar-adals-huvudstad`: muren i Harar fotograferad 2018. Ett foto av porten Asma'adin valdes bort, eftersom filsidan inte säger när porten fick sin nuvarande form och bilden lätt kan tas för en port från 1500-talet.

| Händelse (id) | Varför ingen bild |
|---|---|
| `slaget-vid-ridaniya` | Bland bilderna i Wikipedias artikel om kriget 1516–1517 finns ingen av slaget: en flygskrift tryckt i Basel 1518 (om Aleppo, Damaskus och Jerusalem), Seyyid Lokmans miniatyr 1584 där Kansu Gavris avhuggna huvud visas för Selim I (Kansu Gavri, inte Tumanbay II som ledde mamlukerna vid Ridaniya, och för våldsam för kortet) och ett nutida foto av en rustning. Prompt i [bildpromptar-772.md](bildpromptar-772.md). |
| `hatata-1668` | Den enda bilden är en lokal fil på engelska Wikipedia (BnF, Éthiopien d'Abbadie 215) med licensen "PD" men utan upphovsuppgifter, så licensen går inte att kontrollera. Prompt i [bildpromptar-772.md](bildpromptar-772.md). Stilen blir `islamisk` enligt `data/styles.json`, men prompten säger "no human figures", så den visar landskap och arkitektur. |

**Väntar på AI-illustration (görs av en människa i ChatGPT):** `slaget-vid-ridaniya`, `hatata-1668`. Prompter: [bildpromptar-772.md](bildpromptar-772.md), gren `claude/issue-772-bilder-afrika`.

## Krig och slag i Europa, Amerika och Oceanien, omgång 2 (#299, 2026-11-20)

Tolv krigshändelser fick en historisk bild: sju ur Library of Congress (katalogposterna öppnade 2026-11-20, rättighetstexten "No known restrictions on publication") och fem från Wikimedia Commons (licensen kontrollerad i varje filsidas wikitext 2026-11-20). Krigens viktigaste händelse (`"top": true`) och krigen själva (`"kind": "war"`) togs först: `slaget-vid-lund`, `skanska-kriget`, `amerikanska-frihetskriget`, `amerikanska-inbordeskriget`, `mexikansk-amerikanska-kriget`, `nya-zeelandkrigen`, och sedan slagen `slaget-vid-narva-1700`, `slaget-vid-austerlitz`, `slaget-vid-saratoga`, `belagringen-av-yorktown`, `slaget-vid-fort-sumter` och `kapitulationen-vid-appomattox`. Två bilder ligger hela på en bakgrund i bildens egen papperston i stället för att beskäras till 4:3: Fort Sumter och Palo Alto (mexikansk-amerikanska kriget). Värda att se över:

- `slaget-vid-saratoga` och `belagringen-av-yorktown`: François Godefroys laverade teckningar (troligen 1784) finns bara i 640 pixlars bredd hos Library of Congress och har skalats upp något. Rättighetstexten gäller publicering i USA; teckningarna är över 200 år gamla och upphovsmannen dog 1819, vilket står i källornas `note`.
- `kapitulationen-vid-appomattox`: katalogposten säger att villkoren skrevs under den 8 april 1865, händelsen säger den 9 april. Bildtexten nämner inget datum för kapitulationen; motsägelsen står i källans `note`.
- `slaget-vid-fort-sumter`: tidningsbilden i Harper's Weekly visar en man som ligger på marken. Bildtexten säger att det är en tecknares bild, inte ett fotografi.
- `amerikanska-frihetskriget`, `slaget-vid-narva-1700` och `slaget-vid-lund`: målningar och gravyrer gjorda år eller sekel efter händelsen; bildtexten säger när.
- `mexikansk-amerikanska-kriget`: en amerikansk litografi från 1846 om slaget vid Palo Alto. Library of Congress titel är avkortad, så bildtexten återger inte texten under bilden.
- `slaget-vid-narva-1700`: att målningen visar ryssarna som lägger ner fanorna inför Karl XII efter slaget kommer från svenska Wikipedia (Narva (målning)), som hänvisar till Nationalmuseum; det står i källans `note`.
- `nya-zeelandkrigen`: litografin är dubbelt så bred som hög och ligger på en grå bakgrund; en beskärning till 4:3 skulle ta bort flaggstången till vänster. Bildtexten säger att den visar Kororāreka morgonen före anfallet.
- `skanska-kriget`: filsidan säger inte vem som intog Kristianstad, så bildtexten säger det inte heller.

Prövade men inte tagna i den här omgången (ingen illustration behövs, bara en annan bild):

| Händelse (id) | Varför ingen bild nu |
|---|---|
| `haitiska-revolutionen` | Wikidatas bild, January Suchodolskis målning från 1845 (public domain), visar en man som håller upp ett avhugget huvud. För våldsam för kortet när bättre kan finnas. |
| `slaget-vid-tours` | Carl von Steubens målning från 1837 (public domain) är en romantisk tolkning med en stereotyp bild av den umayyadiska armén. Tas inte utan ett ja från DasKrokodil. |
| `slaget-vid-riachuelo` | Victor Meirelles studie (omkring 1870, public domain) har döda och skadade i blodigt vatten i förgrunden, som inte går att beskära bort i 4:3. Andra bilder av slaget finns på Commons och kan prövas. |
| `paraguaykriget` | Wikidatas bild (Bate y Cía, 1866) har en filbeskrivning som inte går att lita på ("kangaroo forces"), så bildtexten skulle inte kunna bygga på filsidan. |
| `slaget-vid-borodino` | Filsidan till Wikidatas bild (Desarnod) saknar konstnär, titel och datum i beskrivningen. |

| Händelse (id) | Varför ingen bild |
|---|---|
| `slaget-vid-parramatta` | Wikidata har ingen bild, och en sökning på Commons efter Pemulwuy gav bara nutida foton av förorten med samma namn. Prompt i [bildpromptar-299-omgang-2.md](bildpromptar-299-omgang-2.md). Stilen blir `barock` enligt `data/styles.json`. |

**Väntar på AI-illustration (görs av en människa i ChatGPT):** `slaget-vid-parramatta`. Prompt: [bildpromptar-299-omgang-2.md](bildpromptar-299-omgang-2.md), gren `claude/issue-299-bilder-krig-omgang-2`.

## Europa 1677–1807, pilot #2086

Kontrollerat 2026-11-21.

| Händelse (id) | Skäl |
|---|---|
| `freden-i-lund` | Fotot av Kungshuset visar byggnaden 2005. För silvermedaljen från 1679 anger Commons med gravörens namn och PD-old-100 varför själva medaljen är fri. Rättigheten till auktionsfotot av medaljen är oklar. |
| `skanes-generalguvernement-upphor` | Kandidatlistan och sökningen på Commons gav ingen bild av förvaltningsändringen 1719. Library of Congress bildsökning svarade HTTP 403. |

### Ej hämtad, prövas igen

Den 21 november 2026 gav reservsökningarna i Library of Congress bildkatalog HTTP 403.

| Händelse (id) | Hinder |
|---|---|
| `slaget-vid-landskrona` | Lemkes målning, upload.wikimedia.org: HTTP 429 vid två försök i skilda granskningsrundor. |
| `kapitulationen-vid-perevolotjna` | Kartor i kandidatlistan. Alternativsökning på Commons: HTTP 429. |
| `stavnsbandet-upphavs` | Tom kandidatlista. Alternativsökning på Commons: HTTP 429. |
| `slaget-vid-jena-auerstedt` | En senare karta i kandidatlistan. Alternativsökning på Commons: HTTP 429. |
| `slavhandeln-forbjuds-1807` | Kandidaten visar ett riksvapen. Alternativsökning på Commons: HTTP 429. |

## Afrika 41–1000, del 4 av 9 (#2106, pilot steg B, 2026-11-22)

Kontrollerat 2026-11-22 med granskningslistan `data/utkast/bildbatch/2106.md` och högst en kort sökning på Commons per händelse utan kandidat.

| Händelse (id) | Skäl |
|---|---|
| `suetonius-paulinus-over-atlasbergen` | Tom kandidatlista. Sökningen gav bara historiska atlaser över Romarriket, ingen bild av fälttåget eller platsen. |
| `byn-kirikongo-vaxer-fram` | Tom kandidatlista, och sökningen efter Kirikongo gav inga träffar. |
| `skogen-oppnas-pa-laikipiaplatan` | Det enda landskapsfotot (File:The-laikipia-plateau-1.jpg, CC0) är en ny uppladdning från september 2026 utan kategorier, ett proffsigt flygfoto som anges som eget verk. Det går inte att bedöma, så det användes inte. |
| `tsunamin-365-alexandria` | Tom kandidatlista. Sökningen gav bara orelaterade PDF-filer. |
| `arabiska-erovringen-av-egypten` | Wikidatas bild är en arabisk karta från 1986 som Commons märker {{PD-Egypt}} med motiveringen att verk som inte är skapande och publicerades före 1987 är fria. En karta kan vara ett skapande verk, och filsidan saknar uppgift om status i USA, så licensen är osäker. |
| `sungbos-eredo` | Wikidatas bild anges som eget verk (CC BY-SA 4.0), men datumfältet säger "culled from nigeria's national monuments", alltså hämtad ur en annan källa. Uppgifterna motsäger varandra. |
| `mapungubwe-riket` | Möjlig bild: File:MapungubweHill.jpg har GFDL med migration=relicense, alltså också CC BY-SA 3.0; prövas i nästa omgång (2026-11-22). |
| `fuktigare-klimat-vid-limpopo` | Möjlig bild: File:LSConfluence.jpg har GFDL med migration=relicense, alltså också CC BY-SA 3.0; prövas i nästa omgång (2026-11-22). |

`sista-silfiumstjalken` och `burakulturen`, som först inte gick att hämta (HTTP 429), hämtades i Actions och har bild sedan 2026-11-22.

## Afrika 1970–2018, pilot #2111 (2026-11-22)

Granskningslistan `data/utkast/bildbatch/2111.md` och högst en kort sökning på Wikimedia Commons per händelse, 2026-11-22.

| Händelse (id) | Varför ingen bild |
|---|---|
| `operation-tail-wind` | Kandidaten är en gravyr från 1850 av ett kulthus vid Biafrabukten, inte händelsen. Sökningen gav ett foto av en tidningssida från 7 januari 1970 i Aart Rietvelds samling (CC BY-SA 4.0 för fotot), men licensen täcker inte tidningens egna bilder och text, så den användes inte. |
| `angolas-inbordeskrig` | Kandidaten (kubansk stridsvagnsbesättning i Angola, 1976) har okänd upphovsperson men mallen PD-USGov-Military, som förutsätter att en amerikansk statsanställd tog bilden. Filsidan visar inte det: bilden är hämtad ur en CIA-skrift från 1982. Den är också bara 616 px bred. |
| `sowetoupproret` | Sam Nzimas foto är public domain bara i USA. Filsidan säger att den sydafrikanska upphovsrätten upphör i slutet av 2026, så bilden kan prövas igen från 2027. |
| `grona-baltet-maathai` | Tom kandidatlista. Sökningen gav bara bilder från senare år (bland annat Nobelpriset 2004), inget från 1977. |
| `operation-kitona` | Tom kandidatlista. Sökningen gav bara ett diagram och en karta. |
| `mordet-pa-laurent-desire-kabila` | Kandidaten är ett porträtt från ett besök hos EG 1998 med licensmallen EC-Audiovisual Center, som verktygen inte känner igen; vi avstår enligt docs/bilder-riktiga.md. Bilden visar inte heller händelsen. |
| `afrikanska-unionen-bildas` | Kandidaterna är en mudderpråm ur Britannica 1911 och två foton med licensen GODL-India från andra möten i Durban (2006 och 2013), inte händelsen. Sökningen gav inget från 2002. |
| `kongos-overgangsregering-2003` | Tom kandidatlista. Sökningen gav bara dokument (PDF). |
| `sydsudan-blir-sjalvstandigt` | Filsidans licensmall (PD-USGov-POTUS) stämmer inte med upphovet (USAID), och Flickr-sidans licens gick inte att kontrollera (2026-11-22). |

## Afrika 1826–1905, pilot #2109 (bildpipelinen #2183)

Kontrollerat 2026-11-22 med granskningslistan `data/utkast/bildbatch/2109.md`.

| Händelse (id) | Skäl |
|---|---|
| `slaget-vid-dodowa` | Ingen kandidat i listan. En kort sökning på Commons gav bara en bild av ett annat slag mot Ashanti (1824). |
| `anglo-zuluiska-kriget` | Den enda kandidaten är ett utsnitt av samma målning av Alphonse de Neuville som nu visas för `slaget-vid-rorkes-drift`. Krigets viktigaste händelse, `slaget-vid-isandlwana`, har redan en bild. |
| `invasionen-av-zululand` | Den enda kandidaten är en kartsida ur Appleton's annual cyclopedia med Commons-etiketten "No restrictions" utan licensmall, som inte godkänns, och kartan visar inte invasionen. |
| `slaget-vid-hlobane` | Den enda kandidaten är 300 × 389 px och en senare avbildning. En kort sökning gav bara ett porträtt av Piet Uys, som inte visar slaget. |

### Ej hämtad, prövas igen

Den 22 november 2026 svarade Commons HTTP 429 (Retry-After 600 s) och loc.gov svarade inte inom 30 sekunder.

| Händelse (id) | Hinder |
|---|---|
| `slaget-vid-gingindlovu` | Gravyren "Inside the laager at Ginghilovo during the Zulu attack" (The Illustrated London News 1879, PD-art) är vald och kontrollerad, men miniatyren på upload.wikimedia.org gav HTTP 429 i tre körningar. |
| `kongofristaten` | Kandidaten är en modern karta över Belgiska Kongos järnvägar före 1960. Egen sökning: HTTP 429. |
| `freden-i-addis-abeba-1896` | Kandidaterna är nutida konferensfoton från Addis Abeba. Egen sökning: HTTP 429. |
| `liberia-blir-sjalvstandigt` | Sökningen gav ett foto av ett självständighetståg i Monrovia utan känt datum. Metadata: HTTP 429. |
| `boskapspesten-i-afrika` | Sökningen gav filen "Rinderpest 1896-CN.jpg". Metadata: HTTP 429. |

## Afrika och Egypten 1000–1347, pilot #2107

Kontrollerat 2026-11-22 med granskningslistan `data/utkast/bildbatch/2107.md`.

| Händelse (id) | Skäl |
|---|---|
| `swahilikustens-afrikanska-och-asiatiska-rotter` | Ingen kandidat i listan, och händelsen är en DNA-studie utan motiv som en historisk bild kan visa. Ingen egen sökning. |
| `banu-hilal-flyttar-till-maghreb` | Ingen kandidat i listan. Egen sökning gav nutida kartor; den närmaste (NBelazi 2014, CC BY-SA 3.0) visar stammarnas rörelser på Arabiska halvön på 900-talet, inte flytten till Maghreb, och ett manuskript från 1849 av den muntliga eposdiktningen om Banu Hilal visar inte händelsen. |
| `war-jabi-infor-sharia-i-takrur` | Ingen kandidat i listan. Egen sökning gav bara en spansk karta från 1876 ("Parte del Sudan ó Takrur") och foton av berget El-Dakrur vid Siwa, som inte visar händelsen. |
| `almoraviderna-och-ghanariket` | Ingen kandidat i listan. Egen sökning gav almoravidiska dinarer präglade av senare härskare (Yusuf ibn Tashfin, Ali ibn Yusuf), som inte visar den omstridda erövringen. |
| `svalten-i-egypten-1200` | Ingen kandidat i listan. Egen sökning gav bara PDF-skanningar av senare översättningar av Abd al-Latif al-Baghdadis bok (1800 och 1810), ingen bild. |
| `slaget-vid-kirina` | Listans enda kandidat (Wikidatas bild, 2019) visar enligt filsidans kategorier Kurukan Fuga och Mandékans stadga, inte slaget. |
| `digerdoden-i-egypten` | Listans kandidater ur sökning är en gatubild från Kairo 1870 och utgrävningsfoton från Heliopolis 1903–1906, som inte visar pesten. |
| `salomoniska-dynastin-tar-makten` | Listans kandidat (File:Yekuno Amlak.jpg): ursprung och datering saknas på filsidan (bara ett diskussionsforum som källa), så licensen går inte att belägga. Borttagen efter granskning av PR #2188. |

## Afrika 1921–1968, del 8 av 9 (#2110, 2026-11-22)

Sökt i kandidatlistan `data/utkast/bildkandidater.json` och på Wikimedia Commons 2026-11-22, licensen läst i filsidans wikitext (`action=raw`).

| Händelse (id) | Skäl |
|---|---|
| `kimbangu-predikar-1921` | Det enda samtida fotot av Simon Kimbangu på Commons är 400 px brett och har mallen PD-US-expired utan någon källa (bara "Simon Kimbangu in the early 20th century"). Övriga träffar är nutida foton av museet i Nkamba och målningar från 2025. Library of Congress svarade HTTP 429. |
| `brazzavillekonferensen-1944` | Fotot av Charles de Gaulle som öppnar konferensen ([filsidan](https://commons.wikimedia.org/wiki/File:Charles_de_Gaulle_opening_the_Brazzaville_Conference,_1944.jpg)) har PD-US-not renewed för ett franskt foto från 1944; filsidan visar inte att bilden först publicerades i USA och anger ingen status i Frankrike. |
| `ethiopian-airlines-grundas-1945` | Bilderna av bolagets Douglas DC-3 på Commons har bara GFDL, som inte är tillåten. Wikidatas bild är ett nutida flygplan (2025). Library of Congress svarade inte inom 30 sekunder. |
| `afrikas-ar-1960` | Möjlig bild, prövas i nästa omgång. Wikidatas bild ([File:Africa independence dates.svg](https://commons.wikimedia.org/wiki/File:Africa_independence_dates.svg)) är en nutida karta med självständighetsår. Filsidans licensmall är `{{GFDL|migration=relicense}}` (läst med action=raw 2026-11-22), och en sådan fil är också licensierad under CC BY-SA 3.0, som API:et anger. Ingen fri bild från 1960 hittades, bara små frimärken. |
| `biafra-utropas` | Inga samtida foton av Ojukwu eller utropandet. Det enda fotot av Ojukwu från 1969 är märkt som uppladdarens eget verk (CC0) och är 328 px brett, så ursprunget är oklart. Library of Congress gav inga träffar. |
| `enugu-faller-1967` | Bara nutida foton från delstaten Enugu (djur, landskap). |
| `massakern-i-asaba` | Ingen bild av händelsen eller av Asaba vid den tiden. |
| `port-harcourt-1968` | Bara nutida foton av staden (2023, 2024). |
| `torkan-i-sahel` | Wikidatas bild är en karta över regnmängden 2007, inte torkan 1968–1973. Ingen fri bild av torkan hittades. |

### Ej hämtad, prövas igen

| Händelse (id) | Hinder |
|---|---|
| `jordbavningen-1303-alexandria` | Vald bild: [File:Book of Wonders folio 36a.jpg](https://commons.wikimedia.org/wiki/File:Book_of_Wonders_folio_36a.jpg) (fyren i Alexandria i handskriften Kitab al-bulhan, 1390–1450, Bodleian Library, CC BY 4.0, licensmallen läst 2026-11-22). upload.wikimedia.org svarade HTTP 429 med Retry-After 600 s vid tre körningar av `tools/bild_hamta.py`. |

## Afrika 1390–1816, pilot #2108 (2026-11-22)

Tio av 18 händelser fick en bild från Wikimedia Commons (licensen kontrollerad i filsidans wikitext 2026-11-22). Valen och skälen står i granskningslistan [data/utkast/bildbatch/2108.md](../data/utkast/bildbatch/2108.md). Värda att se över:

- `etiopisk-adalska-kriget`: en fransk miniatyr från 1400-talet av Yagbea Sion mot sultanen av Adal, alltså ett tidigare krig. Bildtexten säger det.
- `afonso-i-kung-av-kongo`: en modern vektorteckning (2017) av Kongos vapen omkring 1528–1541, lagd hel på svart bakgrund.
- `bartolomeu-dias-rundar-afrika`, `askia-muhammad-tar-makten`, `rozviriket`: foton av platser och monument från långt senare tid; bildtexterna säger det.

| Händelse (id) | Varför ingen bild |
|---|---|
| `ewuare-oba-i-benin` | Den enda kandidaten är ett suddigt foto (2016) av en liten träbyst i ett hem; filsidan säger inte när eller av vem bysten gjordes, och beskärningen till 4:3 skär av huvudet. |
| `mutapariket` | Ingen kandidat i listan. En kort sökning på Commons gav kartor från 1740-talet, ett vapen och bilder ur europeiska verk från 1700-talet (till exempel "Uomo e donna del Monomotapa", 1765), som inte visar riket när det växte fram. Filsidorna öppnades inte. |
| `slaget-vid-shimbra-kure` | Listans nr 1 är samma miniatyr som kriget fick, och den visar inte slaget. Nr 2 ("Illustration of Ahmad Gragn at war") är märkt CC0 med Richard Pankhurst som upphovsperson och hans bok från 1997 som källa; filsidan säger inte vem som gjorde bilden eller när, så licensen går inte att kontrollera. |
| `slaget-vid-antukyah` | Den enda kandidaten är en modern, smal karta över Adal omkring 1500, inte av slaget. |
| `slaget-vid-amba-sel` | Ingen kandidat i listan, och en kort sökning på Commons gav ingen träff. |
| `oyoriket` | Den enda kandidaten är ett foto av palatset i Oyo från "mitten av 1900-talet", hämtat från en webbplats, med mallen PD-old (upphovspersonen död för mer än 70 år sedan). Det går inte att kontrollera för ett foto från 1900-talet utan känd fotograf. Bilden är dessutom smal (500 px). |
| `asanteriket-grundas` | Den enda kandidaten är en liten karta (428 px) ur en engelsk atlas från 1800-talet, utan uppgift om källa, upphov eller år. |
| `shaka-bygger-zuluriket` | Kandidaten är ett foto av monumentet Spirit of eMakhosini, ett monument från 2003. Sydafrika saknar frihet för panorama för konstverk enligt Commons (Commons:Copyright rules by territory/South Africa), och filsidan har varken NoFoP-mall eller konstnärens tillstånd. Bilden lades först in i #2190 och togs bort efter granskningen. |

| `ancs-ungdomsforbund-grundas-1944` | Vald bild: [Sisulu wedding with mandela and lembede.JPG](https://commons.wikimedia.org/wiki/File:Sisulu_wedding_with_mandela_and_lembede.JPG) (1944, PD-South-Africa enligt filsidan, okänd fotograf), Walter och Albertina Sisulus bröllop med Nelson Mandela och Anton Lembede. Licensen är läst, men själva filen på upload.wikimedia.org gav HTTP 429 med Retry-After 600 s vid två körningar (08:04 och 08:11 UTC). |

## Afrika 12600 f.Kr.–14 e.Kr., #2104 och #2105 (bildpipelinen, 2026-11-22)

Kontrollerat 2026-11-22 med granskningslistan `data/utkast/bildbatch/2104-2105.md`, licensen läst i filsidans wikitext (`action=raw`).

| Händelse (id) | Skäl |
|---|---|
| `dufunakanoten` | Listans enda kandidat är märkt CC0, men filsidan anger okänd upphovsperson och webbplatsen theafricanhistory.com som källa, så licensen går inte att belägga. |
| `lag-nil-och-svalt-2150-fkr` | Listans kandidater är nutida foton av Assuandammen (2012), som inte visar händelsen. |
| `kyrene-grundas` | Möjlig bild, prövas i nästa omgång. Wikidatas bilder är UNESCO-foton (2003) av Kyrenes ruiner med licensmallen `{{cc-by-sa-3.0-igo}}`, som verktygen inte känner igen; enligt beslutet 2026-11-22 godkänns den inte av ett program, och en människa får bedöma den. |
| `djenne-djenno` | Listans enda kandidat är Djennés stora moské, en annan plats från långt senare tid. |
| `eratosthenes-mater-jordens-omkrets` | Listans enda kandidat är ett porträtt med bara `{{PD-art}}` och ett webbgalleri som källa. Filsidan anger varken konstnär, år eller verk, så licensen och motivet går inte att belägga. |

### Ingen kandidat, egen sökning gav HTTP 429 (prövas igen)

Kandidatlistan hade ingen bild till de här händelserna. En kort sökning per händelse på Commons den 22 november 2026 gav HTTP 429 på varje anrop.

`kremeringen-vid-hora`, `snackor-fran-roda-havet-i-gebel-ramlah`, `uan-muhuggiag-mumien`, `kintampokulturen`, `parlhirs-tams-i-norra-mali`, `vulkanutbrottet-vid-deriba`, `herdarnas-boplats-luxmanda`, `afrikanskt-ris-odlas-i-nigerdeltat`, `koppar-vid-akjoujt`, `bananer-i-nkang`, `urewekulturen`, `tamfar-vid-spoegrivier`, `rickettsia-felis-vid-ballito`.

De sex bilder som först inte gick att hämta (HTTP 429), `ounjougou-keramik`, `simmarnas-grotta`, `dhar-tichitt`, `nok-kulturen`, `piye-erovrar-egypten` och `kungapyramiderna-i-nuri`, hämtades i Actions och har bild sedan 2026-11-22.

## Oceanien och övrigt: förhistoria (#2112, 2026-11-22)

13 av 19 händelser fick bilder. Följande sex lämnas utan bild efter sökning; sökningar och bildval finns i `data/utkast/bildbatch/2112.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas.

| Händelse (id) | Varför ingen bild |
|---|---|
| `madjedbebe` | 2026-11-22: Prövat Commons-sökningarna Madjedbebe och Malakunanja samt kategorin Madjedbebe. Inga relevanta bilder av fyndplatsen eller fynden hittades. Kandidatlistans skolmuseum, migrationskarta och Makedonienkarta valdes bort som fel motiv. |
| `cloggsgrottans-ritualeldar` | 2026-11-22: Prövat Commons-sökningarna Cloggs Cave och Cloggs (utan PDF) samt kategorin Cloggs Cave. Inga relevanta bilder av grottan, eldarna eller fynden hittades; träskor och äldre bokskanningar valdes bort. |
| `budj-bim-alfallor` | 2026-11-22: Prövat Commons-sökningarna Budj Bim channel, Budj Bim trap, Lake Condah eel traps och Tae Rak aquaculture samt kategorierna Budj Bim Cultural Landscape och Lake Condah. Inget verifierat foto av ålfällor eller kanaler hittades. Sjöfotot som används för vulkanutbrottet visar inte ålfällorna. |
| `el-nino-och-elden-vid-girraween` | 2026-11-22: Prövat Commons-sökningarna Girraween lagoon och Girraween Northern Territory samt kategorin Girraween, Northern Territory. Inget relevant foto av lagunen eller sedimentproverna hittades. Bilder av en skola och en färglöpning valdes bort. |
| `fisken-forsvinner-ur-tasmaniernas-kost` | 2026-11-22: Prövat Commons-sökningarna Tasmania fish midden och Tasmania midden samt kategorierna Shell middens in Tasmania och Fishing in Tasmania. Fotografier av skal- och stenrester vid Rupert Point och Monster Creek saknar på filsidorna koppling till fiskben eller kostförändringen; de används inte som belägg för denna händelse. |
| `gabarnmung` | 2026-11-22: Bilden [Gabarnmang Cave - 1.jpg](https://commons.wikimedia.org/wiki/File:Gabarnmang_Cave_-_1.jpg) valdes bort efter separat granskning 2026-11-22. Commons anger CC BY-SA 4.0, men originalet är figur 11.3 i [ANU-publikationens kapitel 11](https://press-files.anu.edu.au/downloads/press/n3991/html/ch11.xhtml?referer=3991&page=17). [Imprint](https://press-files.anu.edu.au/downloads/press/n3991/html/imprint.xhtml?referer=3991&page=2) anger att återgivning kräver skriftligt tillstånd; ingen särskild fri bildlicens styrktes. ANU Press [villkor](https://press.anu.edu.au/faqs/conditions-use) (kontrollerade 2026-11-22): böcker före 2018 publicerades under "all rights reserved" och får inte läggas ut på annan server utan tillstånd; boken är från 2017. Commons licensuppgift saknar alltså stöd i källan, så bilden används inte. |

## Oceanien och övrigt 1200 f.Kr.–1814 (#2113 och #2114, 2026-11-26)

18 av 38 händelser fick bild i den här omgången och tre till (`polynesier-pa-raoul`, `rangitoto-bildas`, `ambryms-kaldera`) är valda men väntar på hämtning i Actions. Följande 17 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2113-2114.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas. Urfolkens kulturarv, kvarlevor, gravplatser och bilder med personer har avståtts i väntan på en mänsklig bedömning (CLAUDE.md, Bilder).

| Händelse (id) | Varför ingen bild |
|---|---|
| `gravfaltet-i-teouma` | 2026-11-26: Händelsen handlar om begravda människor; ingen kandidat föreslogs och bilder av kvarlevor eller gravar avstås. |
| `melanesisk-invandring-till-fiji` | 2026-11-26: Kandidaterna var en snäckskrift från Internet Archive, ett foto av morgondimma i Nya Zeeland och en stående bokplansch med licensen "No restrictions" (flaggad, godkänns aldrig av program). Inget visar händelsen. |
| `lapitafolket-jagar-landskoldpaddor` | 2026-11-26: Prövat Commons-sökningen Meiolania skeleton. Fria foton visar Meiolania platyceps (en annan art, med horn), medan händelsen gäller en sköldpadda utan horn på Vanuatu och Fiji; ett sådant foto skulle vilseleda. |
| `kosten-pa-uripiv` | 2026-11-26: Prövat Commons-sökningen Uripiv island. Inga relevanta bilder hittades. |
| `andra-invandringen-till-vanuatu` | 2026-11-26: Inga kandidater. Fotot PortVilaLapita.jpg (CC BY-SA 3.0, Vanuatu Cultural Centre) valdes bort: den franska beskrivningen på filsidan säger att fatet låg som lock på en kruka med en människoskalle (gravsammanhang). |
| `polynesisk-kultur-i-tonga` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `kost-och-halsa-vid-sigatoka` | 2026-11-26: Händelsen gäller ett gravfält; ingen kandidat föreslogs och bilder av gravplatser och kvarlevor avstås. |
| `utbrott-tommer-sodra-taveuni` | 2026-11-26: Prövat Commons-sökningen Taveuni volcano. Enda användbara fria bild var rymdfärjefotot TaveuniNASA.jpg (public domain) på bara 640 × 429 px, för litet för kortet (blir suddigt). |
| `pulemelei` | 2026-11-26: Fotot [View from Pulemelei Mound - Samoa.jpg](https://commons.wikimedia.org/wiki/File:View_from_Pulemelei_Mound_-_Samoa.jpg) (CC BY 2.0, licens kontrollerad) hämtades men används inte: det visar en turist med ansiktet tydligt i förgrunden, och högen är Samoas kulturarv. Kan användas om en människa godkänner det. |
| `wairau-bar` | 2026-11-26: Det enda fotot (Wairau Bar PA01.jpg, CC0, flygfoto 2026) visar en maoriskt kulturarvsplats med gravar; avstått i väntan på mänsklig bedömning. |
| `tui-tonga-riket` | 2026-11-26: Inga kandidater. Prövat Commons-sökningarna Haʻamonga trilithon och Muʻa Tongatapu; filsidorna kopplar inte monumenten till kungadömets början 950 och Langi-gravarna är kungagravar, så inget används. |
| `tui-haatakalaua` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `moriori-pa-chathamoarna` | 2026-11-26: Inga kandidater; moriori-motiv (till exempel trädristningar) är urfolkskulturarv och avstås utan mänsklig bedömning. |
| `kaharoautbrottet` | 2026-11-26: Enda kandidaten (Okataina.jpg, USGS, public domain) visar sprickan från Taraweras utbrott 1886, inte Kaharoautbrottet 1314, och är bara 640 px bred; används inte. |
| `kuwae-utbrottet` | 2026-11-26: Kandidaten ShepherdIslandsMap.png är en liten stående karta med dubbellicens (GFDL och CC BY-SA 3.0). Fotot [1971 Kuwae Volcano Ephemeral Island.jpg](https://commons.wikimedia.org/wiki/File:1971_Kuwae_Volcano_Ephemeral_Island.jpg) är märkt CC0 av uppladdaren, men fotografen är New Hebrides Geological Survey och källan Smithsonian GVP, och filsidan visar inget stöd för att CC0 gäller; oklar licens, används inte. Kartan Kuwae Caldera Map.jpg (CC BY-SA 4.0, 2026) är gjord av en privatperson utan källa. |
| `australiska-granskrigen` | 2026-11-26: Kandidaterna var teckningar av aboriginer och en massaker (Lumholtz 1888, Gill 1865) samt ett nutida foto av en vaka. Aboriginska motiv och bilder av våld mot urfolk avstås i väntan på mänsklig bedömning; licenserna (public domain) var kontrollerade i listan. |
| `muskotkrigen` | 2026-11-26: Enda kandidaten (MaoriWardanceKahuroa.jpg, Merrett, cirka 1845, public domain) visar en maoriskt krigsdans med personer; avstått i väntan på mänsklig bedömning. |

Tillägg 2026-11-26 (#2113): `ambryms-kaldera`. Bilden [Ambrym ali 2012348 lrg.jpg](https://commons.wikimedia.org/wiki/File:Ambrym_ali_2012348_lrg.jpg) (NASA, public domain) hämtades i Actions, men både 4:3-utsnittet och hela bilden visar mest moln och en askplym; kalderan syns inte. Den används därför inte. De andra kandidaterna (Sentinel-2-bilden ESA380358 har licensen CC BY-SA 3.0 IGO, som inte är med på listan över tillåtna licenser, och MODIS-bilderna visar vulkanrök över ön) har inte prövats vidare.

## Oceanien och övrigt 1928–2022 (#2116 och #2117, 2026-11-26)

17 av 35 händelser fick bild i den här omgången, och tre till (`den-sista-pungvargen-dor`, `os-i-melbourne-1956`, `black-saturday-branderna-2009`) är valda och licenskontrollerade men väntar på hämtning i Actions. Följande 15 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2116-2117.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas. Urfolksmotiv, gravar och bilder med oklart ursprung har avståtts.

| Händelse (id) | Varför ingen bild |
|---|---|
| `coniston-massakern` | 2026-11-26: Enda kandidaten (Dowling 145.jpg, CC BY-SA 4.0) visar Frederick Brooks grav och är ett stående foto; gravar och bilder kopplade till våld mot aboriginer avstås i väntan på mänsklig bedömning. |
| `ostgronlandsmalet` | 2026-11-26: Kandidaterna visar Lindberghs flygplan och en kokkärl från hans flygningar, inte målet eller platsen. En Commons-sökning på målet i Permanent Court gav bara skannade böcker. |
| `caledon-bay-krisen` | 2026-11-26: Enda kandidaten är en användargjord topografisk skiss av Arnhem Land utan angiven källa; fel motiv. |
| `emukriget` | 2026-11-26: Kandidaten är en collage gjord av en användare. Commons-sökningen Great Emu War gav arkivfoton med okänd fotograf, märkta PD-AustraliaGov men med källor som en säljare av arkivfilm (Wazee Digital) och en hembygdsförenings sida; ursprunget är oklart, så de används inte. |
| `black-friday-skogsbranderna-1939` | 2026-11-26: Fotot [Black Friday 1939.jpg](https://commons.wikimedia.org/wiki/File:Black_Friday_1939.jpg) har motsägande licensuppgifter: filsidan har både cc-by-sa-4.0 och PD-Australia och bara en uppgift om att en förening "gave permission to use", med okänd fotograf. Går inte att avgöra, används inte. |
| `westminsterstadgan-antas-i-australien-1942` | 2026-11-26: Inga kandidater; händelsen är en lag och ingen relevant bild hittades. |
| `westminsterstadgan-antas-1947` | 2026-11-26: Inga kandidater; händelsen är en lag och ingen relevant bild hittades. |
| `fiji-blir-sjalvstandigt` | 2026-11-26: Enda kandidaten är ett foto från 2019 av en gata i Nadi utan koppling till självständigheten; Commons-sökningen Fiji independence 1970 gav bara skannade tidskrifter. |
| `waitangitribunalen-inrattas` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `constitution-act-1986` | 2026-11-26: Inga kandidater; händelsen är en lag och ingen relevant bild hittades. |
| `maori-officiellt-sprak` | 2026-11-26: Kandidaterna var vulkanfoton (Whakaari, Taranaki) och en handling om det nyzeeländska teckenspråket; fel motiv. |
| `mabodomen` | 2026-11-26: Inga kandidater och ingen relevant bild hittades; urfolkens markrätt avstås i väntan på mänsklig bedömning. |
| `waikato-tainui-uppgorelsen` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `fredssamtalen-i-nya-zeeland` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `samoa-hoppar-over-en-dag-2011` | 2026-11-26: Inga kandidater. En Commons-sökning (Samoa International Date Line) nekades med HTTP 429 och hann inte upprepas; ingen bild har valts. |

## Afrika (förhistoria) och Oceanien 1830–1907 (#2103 och #2115, 2026-11-26)

16 av 37 händelser fick bild i den här omgången, och två till (`florisbad`, `blombosgrottan`) är valda och licenskontrollerade men väntar på hämtning i Actions. Följande 19 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2115-2103.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas. Urfolksmotiv, gravar och kvarlevor har avståtts i väntan på mänsklig bedömning.

| Händelse (id) | Varför ingen bild |
|---|---|
| `panga-ya-saidi-grav` | 2026-11-26: Kandidaterna var en kyrkogård i Arkansas och en dogonskulptur; fel motiv. Händelsen gäller en barngrav, och bilder av gravar och kvarlevor avstås. |
| `dar-es-soltan-benkniv` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `katanda-benharpuner` | 2026-11-26: Inga kandidater. En Commons-sökning (Katanda bone harpoon) nekades med HTTP 429 och hann inte upprepas; ingen bild har valts. |
| `obsidian-i-porc-epicgrottan` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `lebombobenet` | 2026-11-26: Inga kandidater. Commons-sökningen Lebombo bone gav bara ljudfiler och en bok; ingen relevant bild. |
| `enkapune-ya-muto-parlor` | 2026-11-26: Inga kandidater. Commons-sökningen Enkapune Ya Muto ostrich eggshell beads gav inga träffar. |
| `apollo-11-stenarna` | 2026-11-26: Inga kandidater. Commons-sökningen Apollo 11 Cave painted stones Namibia gav inga träffar. |
| `jebel-sahaba` | 2026-11-26: Enda kandidaten är en figur ur en vetenskaplig artikel (CC BY 4.0, 685 × 606 px) med karta över gravfältet och gravarna; händelsen gäller våld mot människor vars kvarlevor hittats, och bilden är för liten, så den avstås. |
| `victoriasjon-fylls-pa-nytt` | 2026-11-26: Kandidaterna var en nordamerikansk karta från 1848 och en park i Leicester; fel motiv. |
| `svarta-linjen` | 2026-11-26: Kandidaterna var en ångare med guvernörer (1927), en järnvägskarta från 1880 och en fågelbok med licensen "No restrictions" (flaggad, godkänns aldrig av program). Commons-sökningen Black Line Tasmania 1830 gav bara skannade böcker. |
| `pinjarramassakern` | 2026-11-26: Enda kandidaten är ett nutida foto av platsen för massakern (CC BY-SA 4.0, 2020); en plats för våld mot aboriginer avstås i väntan på mänsklig bedömning. |
| `nya-zeeland-egen-kronkoloni` | 2026-11-26: Enda kandidaten (New Zealand Becomes a Dominion) gäller 1907, inte 1841. |
| `krigsutbrottet-i-waitara` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `kingitanga-forsta-maorikungen` | 2026-11-26: Enda kandidaten är ett foto (1939, public domain) av en snidad dörr med maorikungarnas vapen vid Tūrangawaewae marae; maoriskt kulturarv på en marae avstås i väntan på mänsklig bedömning. |
| `konstitutionen-1852` | 2026-11-26: Inga kandidater; händelsen är en lag och ingen relevant bild hittades. |
| `te-kooti-far-skydd` | 2026-11-26: Inga kandidater; porträtt av avlidna maoriska personer avstås. |
| `fiji-blir-brittisk-koloni` | 2026-11-26: Inga kandidater. Commons-sökningen Fiji cession 1874 deed gav inga träffar. |
| `forsta-testmatchen-i-cricket` | 2026-11-26: Kandidaterna var foton från 1925, 2015 och 1932, inte från 1877. Commons-sökningen Melbourne Cricket Ground 1877 Test match gav bara skannade böcker. |
| `nya-zeeland-blir-dominion` | 2026-11-26: Filen [New Zealand Becomes a Dominion (15149497056).jpg](https://commons.wikimedia.org/wiki/File:New_Zealand_Becomes_a_Dominion_(15149497056).jpg) (CC BY-SA 2.0, Archives New Zealand) hämtades men är en nutida rubrikgrafik ("Archive of the Moment") och inte ett historiskt dokument eller foto; används inte. |

## Amerika 3600 f.Kr.–1 (#2092 och #2093, 2026-11-26)

18 av 40 händelser fick bild i den här omgången. Följande 22 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2092-2093.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas. Mumier, skallar, kvarlevor och bilder med oklar licens har avståtts. Flera Commons-sökningar nekades med HTTP 429 och hann inte upprepas.

| Händelse (id) | Varför ingen bild |
|---|---|
| `huvudloss-hos-chinchorrofolket` | 2026-11-26: Inga kandidater; händelsen gäller undersökningar av mumier, och bilder av kvarlevor avstås. |
| `chinchorro-tatuering` | 2026-11-26: Kandidaterna var ett foto av en rappare (2025) och en bok med licensen "No restrictions" (flaggad, godkänns aldrig av program); händelsen gäller en mumie, och bilder av kvarlevor avstås. |
| `saqqaqkulturen` | 2026-11-26: Enda kandidaten ([Artefact saqqaquien baie Disko 3.jpg](https://commons.wikimedia.org/wiki/File:Artefact_saqqaquien_baie_Disko_3.jpg), CC BY-SA 4.0) är en teckning från 1843 av Christian Pingel som en användare lagt upp med en CC BY-SA-licens "to be checked"; licensen är oklar, så bilden används inte. |
| `cerro-blanco-utbrottet` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `torka-och-glaciarer-i-nordamerika-4-2` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `ortoiroiderna-nar-antillerna` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `el-manati-offermossen` | 2026-11-26: Enda kandidaten (Olmec Heartland Overview 4.svg, CC BY 3.0) är en övergripande karta över olmekernas kärnområde som inte visar El Manatí och som saknar uppgift om datum och upphov. |
| `olmekerna-san-lorenzo` | 2026-11-26: Kandidaten [CabezaColosal1 MuseoXalapa v1.1.jpg](https://commons.wikimedia.org/wiki/File:CabezaColosal1_MuseoXalapa_v1.1.jpg) saknar fotograf och källa på filsidan (bara en relicensmall för GFDL) och är en redigerad kopia av en annan fil; licensen går inte att styrka, så bilden används inte. |
| `paso-de-la-amada-bollplan` | 2026-11-26: Enda kandidaten (Paso de la amada figurine.PNG) är en 160 × 211 px stor bild av en figur med licensflagga; för liten och osäker. |
| `kotoshtraditionen` | 2026-11-26: Inga kandidater. Commons-sökningarna Kotosh Temple of the Crossed Hands och Kotosh Peru archaeological gav inga användbara träffar eller nekades med 429. |
| `nortontraditionen` | 2026-11-26: Inga kandidater. Commons-sökningen Norton tradition Alaska pottery oil lamp gav bara en tidskrift. |
| `cascajalblocket` | 2026-11-26: Enda kandidaten är en användarritad teckning ("based loosely on" blocket) och inte själva föremålet. |
| `izapas-stelar` | 2026-11-26: Inga kandidater och ingen relevant bild hittades. |
| `paracaskulturen` | 2026-11-26: Enda kandidaten (ParacasSkullsIcaMuseum.jpg, CC BY 2.0) visar skallar på Museo Regional de Ica; bilder av kvarlevor avstås. |
| `trepanation-i-paracaskulturen` | 2026-11-26: Kandidaterna visar skallar på museum; bilder av kvarlevor avstås. |
| `el-mirador` | 2026-11-26: Enda kandidaten (Elmiradortigre.jpg, CC BY-SA 2.5) är bara 400 × 300 px; för liten för kortet. En sökning på La Danta nekades med 429. |
| `monte-alban-grundas` | 2026-11-26: Enda kandidaten (Monte Albán archeological site, Oaxaca.jpg, CC BY-SA 3.0) är 640 × 480 px och saknar upphovsperson och säkert datum; för liten. Commons-sökningen Monte Alban Oaxaca nekades med 429. |
| `dorsetkulturen` | 2026-11-26: Kandidaterna var moderna ekoregionskartor över Grönland; fel motiv. |
| `saladoider-nar-antillerna` | 2026-11-26: Enda kandidaten är ett litet schema (570 × 388 px) av en ristad sten på Guadeloupe, ritat 2019; inget som visar saladoidernas ankomst. |
| `mount-meager-bridge-river-utbrottet` | 2026-11-26: Kandidater saknas; Commons-sökningen Mount Meager gav bara diagram (liten storlek). |
| `chankillo-tretton-torn` | 2026-11-26: Enda kandidaten ([Chanquillo Fortaleza (remains).jpg](https://commons.wikimedia.org/wiki/File:Chanquillo_Fortaleza_(remains).jpg), CC BY-SA 3.0) visar fästningen vid Chankillo och inte de tretton tornen; en sökning på tornen gav inga träffar. |
| `san-bartolos-vaggmalningar` | 2026-11-26: Enda kandidaten (SBmural.jpg, CC BY-SA 2.5) är bara 293 × 433 px; för liten. |

## Amerika 1200–1520 (#2096, 2026-11-26)

18 av 20 händelser i #2096 fick bild. Följande 2 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2095-2096.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas.

| Händelse (id) | Varför ingen bild |
|---|---|
| `gronland-under-norge` | 2026-11-26: Kandidaterna visar inte händelsen: ett foto från Spetsbergen (CC0), Blaeus karta över Norge från 1662 och Vinlandkartan (av omstridd äkthet). Sökningar på Håkon Håkonsson och norska Grönland gav ingen användbar bild (flera nekades med 429). |
| `vasterbygden-overges` | 2026-11-26: Kandidaterna var fel motiv (ett moshav i Galileen, en by i Makedonien, en ikon). Enda träffen efter egen sökning är en karta över Västerbygden (Western-settlement-eng.png, CC BY-SA 3.0) på 638 × 443 px; för liten för kortet. |

## Amerika 1775–1808 (#2098, 2026-11-26)

Följande händelser i #2098 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2098.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas.

| Händelse (id) | Varför ingen bild |
|---|---|
| `kgh-far-handelsmonopol` | 2026-11-26: Ingen kandidat i listan; sökningar på Den Kongelige Grønlandske Handel gav ingen användbar bild (flera nekades med HTTP 429). |
| `slaget-vid-vertieres` | 2026-11-26: Enda kandidaten i listan var samma Raffet-gravyr som visar Crête-à-Pierrot (används där). Egen sökning gav tre bilder under 800 px ([Bataille de Vertières.jpg](https://commons.wikimedia.org/wiki/File:Bataille_de_Verti%C3%A8res.jpg), 600 × 438 px, PD; en CC BY-SA 4.0-bild på 620 × 458 px; ett monument på 566 × 382 px): för små för kortet. |
| `slaveriet-avskaffas-1793` | 2026-11-26: Kandidat utsedd men inte hämtad: [Sonthonax.jpg](https://commons.wikimedia.org/wiki/File:Sonthonax.jpg) (porträtt av Léger-Félicité Sonthonax, PD-Art, målare och datering okända). Hämtningen nekades med HTTP 429 (Retry-After 600 s, över taket 60 s) vid upprepade försök. Raden finns i `data/utkast/bildbatch/2098-ej-hamtade.txt` och kan köras om med `tools/bild_hamta.py --lista` eller Actions-flödet `bild-ej-hamtade.yml`. |

## Amerika 1810–1865 (#2099, 2026-11-26)

19 av 20 händelser i #2099 fick bild. Följande lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2099.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas.

| Händelse (id) | Varför ingen bild |
|---|---|
| `marques-de-olinda-1864` | 2026-11-26: Ingen kandidat i listan; Commons-sökningar på fartyget Marquês de Olinda, det paraguayanska kriget och ångbåtar på Paraguayfloden gav bara böcker (PDF) utan användbar bild. |

## Amerika 1915–1958 (#2101, 2026-11-26)

13 av 20 händelser i #2101 fick bild. Följande 7 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/2101.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas.

| Händelse (id) | Varför ingen bild |
|---|---|
| `slaget-vid-celaya` | 2026-11-26: Enda kandidaten ([Batalla celaya.jpg](https://commons.wikimedia.org/wiki/File:Batalla_celaya.jpg), PD) är 425 × 259 px; för liten för kortet. Commons-sökningen på slaget gav bara böcker. |
| `hubbles-lag` | 2026-11-26: Ingen kandidat; sökningar på Hubbles diagram från 1929 gav bara rapporter (PDF). |
| `kauffmannavtalet` | 2026-11-26: Händelsen saknades i granskningslistan. Enda träffen är en filmjournal (video, ogv, 400 × 300 px) om undertecknandet; en video är inte en bild. |
| `brasiliens-arbetsratt-clt-1943` | 2026-11-26: Ingen kandidat; sökningen på Vargas och CLT gav inga träffar. |
| `lattes-chacaltaya-1947` | 2026-11-26: Kandidaterna är porträtt av César Lattes (1949 och 1954) ur Arquivo Nacional, Fundo Correio da Manhã. Licensmallen ("Arquivo Nacional PD-license") kunde inte tolkas av programmet (API: Public domain) och används inte utan en människas bedömning; bilderna visar dessutom inte händelsen. |
| `gabriela-mistral-nobelpris-1945` | 2026-11-26: Enda kandidaten ([Gabriela Mistral 1945.jpg](https://commons.wikimedia.org/wiki/File:Gabriela_Mistral_1945.jpg), Anna Riwkin-Brick) är 280 × 396 px och fotografen dog 1970 enligt Wikimedia; filsidans skäl till public domain är inte kontrollerat. |
| `gronland-upphor-vara-koloni` | 2026-11-26: Enda kandidaten är en bokbild från 1911 med licensen "No restrictions", som programmet inte kan avgöra och som inte visar händelsen. |

## Asien 178000 f.Kr.–7071 f.Kr. (#2056 och #2057, 2026-11-26)

14 av 40 händelser fick bild i den här omgången. Ytterligare 5 har en utsedd kandidat som inte kunde hämtas (HTTP 429) och står i `data/utkast/bildbatch/asien-1-ej-hamtade.txt`. Följande 21 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/asien-1.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas.

| Händelse (id) | Varför ingen bild |
|---|---|
| `baishiya-denisovaner` | 2026-11-26: Enda kandidaten är ett diagram ur en artikel (Deep Tibetan admixture graph modeling) och visar inte platsen; en egen sökning på grottan gav inga träffar. |
| `sodra-kina-tidiga-tander` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `denisova-11` | 2026-11-26: Fotona av Denisovagrottan på Commons har licensmallen Wikimapia, som programmet inte kan tolka; de används inte utan en människas bedömning (ett annat foto av grottan används för `denisovaner`). |
| `neandertalare` | 2026-11-26: Händelsen saknades i granskningslistan; ingen egen sökning hann göras. |
| `al-wusta` | 2026-11-26: Ingen kandidat; sökningen på Al Wusta och fyndet gav inga träffar. |
| `tam-pa-ling` | 2026-11-26: Kandidaterna (figurer ur en vetenskaplig artikel, CC BY 4.0, och en tafonomibild) öppnades inte och bedömdes inte i den här omgången. |
| `gua-dagang-arkaisk-manniska` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `utbrottet-som-skapade-maninjausjon` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `pil-och-bage-i-fa-hien-lena` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `mammutkalven-ljuba` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `tonfisk-i-jerimalai` | 2026-11-26: Ingen kandidat i listan; en sökning på grottan nekades med HTTP 429. |
| `kilugrottan` | 2026-11-26: Händelsen saknades i granskningslistan; ingen egen sökning hann göras. |
| `amputationen-i-liang-tebo` | 2026-11-26: Ingen kandidat i listan; sökningen på Liang Tebo gav bara orelaterade böcker. |
| `obsidian-fran-nya-britannien` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `kuskusen-till-nya-irland` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `havet-dranker-sundaland` | 2026-11-26: Enda träffarna är kartor under 800 px (Sunda shelf.jpg, 638 × 416 px) eller regionala kartor; ingen lämplig bild. |
| `sutlej-lamnar-sin-gamla-dal` | 2026-11-26: Enda träffen är en modern karta över flodlopp (Sarasvati river.jpg); ämnet är omstritt och kartan visar inte händelsen, så den används inte utan bedömning. |
| `noshorning-i-vargvalpens-mage` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `torressundet-bildas` | 2026-11-26: Kandidaterna var fel motiv (en gammal karta över Kaukasus, en satellitbild av hela Australien) eller hade en otillåten licens; en egen sökning gav bara en bild på 444 × 446 px. |
| `vaxtresterna-i-spirit-cave` | 2026-11-26: Sökningen på Spirit Cave gav bara bilder av en annan grotta (Spirit Well Cave); ingen lämplig bild. |
| `keramiken-i-gosan-ri` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |

Utsedda men inte hämtade (HTTP 429, Retry-After 600 s):

| Händelse (id) | Kandidat |
|---|---|
| `hundarna-pa-zjochovon` | Zhokhov - Landsat.jpg (PD, NASA/USGS) |
| `salfangst-vid-bajkalsjon` | Из жизни байкальской нерпы близ Ушканьих островов 02.jpg (CC BY-SA 4.0) |
| `persiska-viken-fylls` | PersianGulf vue satellite du golfe persique.jpg (PD, NASA) |
| `ulleungdos-kaldera-bildas` | Ulleung Island ISS064.jpg (PD, NASA) |
| `altaifloden` | Katun AltaiRepublicBoundary 013 1368.jpg (CC BY-SA 4.0) |

## Asien 7051 f.Kr.–1275 f.Kr. (#2058 och #2059, 2026-11-26)

13 av 40 händelser fick bild i den här omgången. Följande 27 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/asien-2.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas. Många står som "ingen egen sökning hann göras": Wikimedia nekade upprepat med HTTP 429, och de kan tas om i en senare omgång.

| Händelse (id) | Varför ingen bild |
|---|---|
| `kuk-jordbruk` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `lacket-i-kakinoshima` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `jiahu-jast-dryck` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `ris-i-lahuradewa` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `elsjankakulturens-lerkarl` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `kurilsjons-kaldera-bildas` | 2026-11-26: Ingen kandidat i listan; sökningen på Kurilsjön gav inga träffar. |
| `skidfragment-vid-sindorsjon` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `vassbatar-vid-h3-i-kuwait` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `eridu-grundas` | 2026-11-26: Ingen kandidat i listan; sökningarna på Eridu gav inga träffar. |
| `mustatilerna-i-arabien` | 2026-11-26: Ingen kandidat i listan; sökningen på mustatiler nekades med HTTP 429. |
| `aitapeskallen-och-tsunamin` | 2026-11-26: Händelsen gäller en skalle (mänskliga kvarlevor); bilder av kvarlevor avstås i den här omgången och ingen sökning gjordes. |
| `naqadakulturen` | 2026-11-26: Händelsen saknades i granskningslistan; ingen egen sökning hann göras. |
| `boplatsen-i-amsa-dong` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `botai-hastar` | 2026-11-26: Ingen kandidat i listan; sökningen gav bara en artikel och en figur (inte bilder av platsen eller hästarna). |
| `pesten-vid-angara` | 2026-11-26: Händelsen gäller en gravplats med människor som dog av pest (kvarlevor); bilder av kvarlevor avstås och ingen sökning gjordes. |
| `niuheliang-gudinnans-tempel` | 2026-11-26: Kandidaterna är museiföremål ur gravar (jadeföremål) och en keramikfigur på 1000 × 1138 px, samt vägstationer med platsens namn; ingen bild visar templet. Gravföremål avstås. |
| `bhirrana` | 2026-11-26: Händelsen saknades i granskningslistan; ingen egen sökning hann göras. |
| `kopparbrytning-i-kargaly` | 2026-11-26: Ingen kandidat i listan; sökningen på Kargaly gav inga träffar (nekades delvis med HTTP 429). |
| `flankskred-pa-piton-de-la-fournaise` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `spetalska-i-balathal` | 2026-11-26: Händelsen gäller ett skelett med tecken på spetälska (mänskliga kvarlevor); bilder av kvarlevor avstås och ingen sökning gjordes. |
| `torka-vid-mare-aux-songes` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `dilmun-handelsplats` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `mumierna-i-xiaohe` | 2026-11-26: Händelsen gäller mumier (mänskliga kvarlevor och gravar); bilder av kvarlevor avstås. |
| `den-syriska-elefanten` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `lapitakulturen-i-bismarckarkipelagen` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `ambumstenen` | 2026-11-26: Händelsen saknades i granskningslistan; ingen egen sökning hann göras. |
| `stort-utbrott-i-witori` | 2026-11-26: Ingen kandidat i listan; sökningen på Witori gav bara orelaterade träffar. |

## Asien 1269 f.Kr.–205 f.Kr. (#2060 och #2061, 2026-11-26)

16 av 40 händelser fick bild i den här omgången. Följande 24 lämnas utan bild; granskningslistan och valen finns i `data/utkast/bildbatch/asien-3.md`. Det här är sökningens resultat, inte ett påstående att fria bilder inte kan finnas. Många står som "ingen egen sökning hann göras": Wikimedia nekade upprepat med HTTP 429, och de kan tas om i en senare omgång.

| Händelse (id) | Varför ingen bild |
|---|---|
| `nauru-befolkas` | 2026-11-26: Kandidaterna är krigsfoton och vapen/flaggor från 1943 och senare; inget visar platsen eller befolkningen. Ingen lämplig bild. |
| `risodlingen-nar-japan` | 2026-11-26: Ingen kandidat i listan; sökningen på Toro-lämningarna gav inga träffar. |
| `arvsmassa-fran-palau` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `lapitafolket-pa-taumako` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `stora-dammen-i-marib` | 2026-11-26: Enda träffarna visar den moderna dammen (1986) eller är otydliga; ingen bild som säkert visar den forntida dammen. |
| `arvsmassa-fran-watom` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `paninis-grammatik` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `mahavira` | 2026-11-26: Händelsen saknades i granskningslistan; sökningen på statyer av Mahavira gav inga träffar. |
| `skylax-seglar-nerfor-indus` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `kungsvagen-susa-sardes` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `pazyrykgravarna` | 2026-11-26: Händelsen gäller gravar med människor och hästar; bilder av gravar och kvarlevor avstås och ingen sökning gjordes. |
| `belagringen-av-tyros` | 2026-11-26: Enda kandidaten är en karta på 738 × 563 px (Siege tryre.gif); en egen sökning gav bara böcker utan användbar bild. |
| `nearchos-flotta-fran-indus` | 2026-11-26: Enda kandidaten är en bokbild med licensen "No restrictions", som programmet inte kan avgöra. |
| `meroitisk-skrift` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `cuju-bollspel-i-kina` | 2026-11-26: Enda kandidaten är ett kinesiskt fotbollsamulett (mynt) av oklar datering och upphov ("Unknown authorship"); används inte. |
| `dujiangyan` | 2026-11-26: Händelsen saknades i granskningslistan; sökningen på Dujiangyan gav inga träffar. |
| `qins-enandekrig` | 2026-11-26: Enda kandidaten är en karta (Hou Xuanxuan, CC BY-SA 4.0); en karta visar inte händelsen och används inte när något bättre kan finnas. |
| `qin-erovrar-han` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `handan-faller-228-fkr` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `qin-intar-ji` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `daliang-satts-under-vatten` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `qin-erovrar-chu` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
| `chu-han-kriget` | 2026-11-26: Enda kandidaten är en modern karta (Chu-Han Contention.png); används inte. |
| `slaget-vid-pengcheng` | 2026-11-26: Ingen kandidat i listan; ingen egen sökning hann göras. |
