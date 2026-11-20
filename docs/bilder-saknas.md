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

- `auschwitz-befrias`: en hög glasögon som fotograferades som bevis efter befrielsen (Bundesarchiv, Bild 183-R69919, CC BY-SA 3.0 DE). Inga människor syns. Tre andra bilder valdes bort: fotot av fångar bakom taggtråd (licensen PD-Polish med okänd fotograf, och det visar offer), Stanisław Muchas foto av Birkenaus port (filsidan säger själv att rättigheterna är oklara) och en flygbild från februari 1945 (märkt PD-USGov men med en tysk stämpel, så licensen är osäker).
- `atombomberna-hiroshima-nagasaki`: atommolnen över båda städerna, fotograferade från amerikanska flygplan (PD-USGov-DOE). Inga skadade människor syns.
- `anfallet-pa-polen` och `frankrikes-fall`: foton från tyska propagandakompanier (Bundesarchiv). Bildtexten säger det för Polen; fotot från Compiègne har okänd fotograf.
