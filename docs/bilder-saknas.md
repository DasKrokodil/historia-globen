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

## Afrika, tidigmodern tid (#772, 2026-11-20)

Tolv händelser i Afrika 1501–1799 fick en bild från Wikimedia Commons (licensen kontrollerad i varje filsidas wikitext 2026-11-20): `agadez-mosken`, `fort-jesus-byggs`, `gondar-blir-etiopiens-huvudstad`, `harar-adals-huvudstad`, `rosettastenen-hittas` (nutida foton), `larda-i-timbuktu-sankore` (Fortiers vykort, början av 1900-talet), `tarikh-al-sudan` (handskriften i BnF), `nzinga-drottning-av-ndongo` (Devérias litografi, 1830-talet), `kapkolonin-1652` (Bells målning, före 1851), `freetown-grundas` (kopparstick 1803), `blabocken-utrotas` (plansch ur Buffons naturhistoria) och `rodriguessolitaren-dor-ut` (Leguat 1708). Fem bilder ligger hela på en bakgrund i bildens egen färg i stället för att beskäras till 4:3: Nzinga, blåbocken, solitären och Freetown på papperston och Rosettastenen på svart. Värda att se över:

- `kapkolonin-1652`: Charles Davidson Bells målning är en europeisk tolkning från 1800-talet, två sekel efter händelsen. Bildtexten säger att den inte är en samtida bild.
- `nzinga-drottning-av-ndongo`: en europeisk litografi gjord långt efter hennes död; bildtexten säger att den inte visar hur hon såg ut.
- `tarikh-al-sudan`: filsidan anger både public domain (handskriften) och CC BY-SA 4.0 (fotot). Vi anger CC BY-SA 4.0, och motsägelsen står i källans `note`.
- `blabocken-utrotas`: filnamnet säger "Allamand, 1778", men filsidan daterar planschen till 1700–1880 och planschens rubrik är "Le Tzeiran". Bildtexten nämner inget år; motsägelsen står i källans `note`.
- `harar-adals-huvudstad`: muren i Harar fotograferad 2018. Ett foto av porten Asma'adin valdes bort, eftersom filsidan inte säger när porten fick sin nuvarande form och bilden lätt kan tas för en port från 1500-talet.

| Händelse (id) | Varför ingen bild |
|---|---|
| `slaget-vid-ridaniya` | Bland bilderna i Wikipedias artikel om kriget 1516–1517 finns ingen av slaget: en flygskrift tryckt i Basel 1518 (om Aleppo, Damaskus och Jerusalem), Seyyid Lokmans miniatyr 1584 där Kansu Gavris avhuggna huvud visas för Selim I (för våldsam för kortet och inte från Ridaniya enligt filsidan) och ett nutida foto av en rustning. Prompt i [bildpromptar-772.md](bildpromptar-772.md). |
| `hatata-1668` | Den enda bilden är en lokal fil på engelska Wikipedia (BnF, Éthiopien d'Abbadie 215) med licensen "PD" men utan upphovsuppgifter, så licensen går inte att kontrollera. Prompt i [bildpromptar-772.md](bildpromptar-772.md). Stilen blir `islamisk` enligt `data/styles.json`, men prompten säger "no human figures", så den visar landskap och arkitektur. |

**Väntar på AI-illustration (görs av en människa i ChatGPT):** `slaget-vid-ridaniya`, `hatata-1668`. Prompter: [bildpromptar-772.md](bildpromptar-772.md), gren `claude/issue-772-bilder-afrika`.
