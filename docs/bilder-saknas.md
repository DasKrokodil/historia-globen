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

## Afrika 1390–1816, pilot #2108 (2026-11-22)

Elva av 18 händelser fick en bild från Wikimedia Commons (licensen kontrollerad i filsidans wikitext 2026-11-22). Valen och skälen står i granskningslistan [data/utkast/bildbatch/2108.md](../data/utkast/bildbatch/2108.md). Värda att se över:

- `etiopisk-adalska-kriget`: en fransk miniatyr från 1400-talet av Yagbea Sion mot sultanen av Adal, alltså ett tidigare krig. Bildtexten säger det.
- `afonso-i-kung-av-kongo`: en modern vektorteckning (2017) av Kongos vapen omkring 1528–1541, lagd hel på svart bakgrund.
- `bartolomeu-dias-rundar-afrika`, `askia-muhammad-tar-makten`, `shaka-bygger-zuluriket`, `rozviriket`: foton av platser och monument från långt senare tid; bildtexterna säger det.

| Händelse (id) | Varför ingen bild |
|---|---|
| `ewuare-oba-i-benin` | Den enda kandidaten är ett suddigt foto (2016) av en liten träbyst i ett hem; filsidan säger inte när eller av vem bysten gjordes, och beskärningen till 4:3 skär av huvudet. |
| `mutapariket` | Ingen kandidat i listan. En kort sökning på Commons gav kartor från 1740-talet, ett vapen och bilder ur europeiska verk från 1700-talet (till exempel "Uomo e donna del Monomotapa", 1765), som inte visar riket när det växte fram. Filsidorna öppnades inte. |
| `slaget-vid-shimbra-kure` | Listans nr 1 är samma miniatyr som kriget fick, och den visar inte slaget. Nr 2 ("Illustration of Ahmad Gragn at war") är märkt CC0 med Richard Pankhurst som upphovsperson och hans bok från 1997 som källa; filsidan säger inte vem som gjorde bilden eller när, så licensen går inte att kontrollera. |
| `slaget-vid-antukyah` | Den enda kandidaten är en modern, smal karta över Adal omkring 1500, inte av slaget. |
| `slaget-vid-amba-sel` | Ingen kandidat i listan, och en kort sökning på Commons gav ingen träff. |
| `oyoriket` | Den enda kandidaten är ett foto av palatset i Oyo från "mitten av 1900-talet", hämtat från en webbplats, med mallen PD-old (upphovspersonen död för mer än 70 år sedan). Det går inte att kontrollera för ett foto från 1900-talet utan känd fotograf. Bilden är dessutom smal (500 px). |
| `asanteriket-grundas` | Den enda kandidaten är en liten karta (428 px) ur en engelsk atlas från 1800-talet, utan uppgift om källa, upphov eller år. |
