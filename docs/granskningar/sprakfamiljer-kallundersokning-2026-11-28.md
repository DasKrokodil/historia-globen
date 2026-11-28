# Källundersökning: språkfamiljer som områden (#2406)

Datum: 2026-11-28. Underlag för DasKrokodils beslut. **Inget är byggt och ingen data har lagts in.** Modellnivå: Opus. Arkitektbedömningen kommer från `arkitekt`; fakta om datamängderna kommer bara från sidor jag själv öppnade (listade sist).

## Kort svar

1. **Det finns ingen öppen, tidsdaterad datamängd över språkfamiljers utbredning över tid.** De fria datamängderna ger antingen släktskapsträd och punkter (Glottolog) eller polygoner för ett enda, nutida eller "traditionellt" läge (Glottography). Ett område "år 1000 f.Kr." skulle alltså vara en handgjord tolkning, och det är precis den falska exakthet som källpolicyn varnar för.
2. **Licenser:** Glottolog och de flesta Glottography-dataset är CC BY 4.0 och går att använda. Glottographys Stillahavsdataset (Wurm & Hattori) är CC BY-NC 4.0 och får inte användas som data. Native Land anger ingen licens på startsidan och är dessutom uttryckligen inte "officiella gränser".
3. **Lagertyp:** ingen ny lagertyp behövs. Områdeslagret med `areaKind: "culture"` (#1300) passar, men det kräver en liten ny datakonvention och beslut (se nedan).
4. **Rekommendation:** vänta med polygoner över tid. Börja i så fall med ett enda pilotområde, och bara när DasKrokodil har sagt ja till att använda `culture` för språkfamiljer.

## Vilka fria datamängder finns

| Datamängd | Innehåll | Licens (enligt sidan) | Duger för oss? |
|---|---|---|---|
| **Glottolog 5.4** | Språkens släktskapsträd (`glottolog_languoid.csv.zip`, `tree_glottolog_newick.txt`), geografiska platser för språk och dialekter (`languages_and_dialects_geo.csv`), litteraturlista. Wikipedia beskriver en enda punkt per språk, i dess geografiska mitt. Inga polygoner nämns. | CC BY 4.0 | **Ja, som källa till släktträd och nutida punkter.** Ger inte områden och inte tid. |
| **Glottography** (samling av 34 dataset, CLDF/GeoJSON) | Polygoner för talområden, hämtade ur publicerade kartor och kopplade till Glottolog | Per dataset. Sidan visar CC BY 4.0 för bland annat `rantanen2021uralic`, `wikipedia2024officiallang`, `walker2011bayesian`, `allen2016resource`; **CC BY-NC 4.0 för `wurm1981pacific`**; för `bowern2021australia` visas ingen licens | **Delvis.** CC BY-dataseten går att använda, men varje dataset måste kontrolleras för sig. |
| **`rantanen2021uralic`** (Glottography) | Uralisk-språkens polygoner. Alla poster har värdet "traditional", som källan beskriver som "början av 1900-talet" (Mator och Kamas början av 1800-talet). Sidan beskriver ingen osäkerhet. | CC BY 4.0 | Ett enda statiskt läge omkring 1900. **Ingen tidsserie.** |
| **`wikipedia2024officiallang`** (Glottography) | "Överlappande, nutida språkområden" ur Wikipedias lista över officiella språk 2024 | CC BY 4.0 | Nutida och grovt; metoden beskrivs inte. Passar inte historia. |
| **`wurm1981pacific`** (Glottography) | Ur Wurm och Hattoris Stillahavsatlas 1981/83 | **CC BY-NC 4.0** | **Nej** (licensregeln i CLAUDE.md). Får högst länkas som källa utan att något kopieras. |
| **Native Land Digital** | Territorier, fördrag och språk; GeoJSON och API "gratis" | Ingen licens står på startsidan; kartorna är "inte officiella källor" och inte officiella eller juridiska gränser | **Inte utan vidare undersökning.** Licensen måste först läsas i API-villkoren. Och ämnet (urfolks territorier) är känsligt. |
| **Wikidata** | Språk och språkfamiljer som poster | CC0 enligt `docs/kallor.md` (inte öppnad i den här körningen) | Bra för namn och identiteter, ger inga områden. |

**Sådant jag inte kunde öppna** (värden saknas i molnmiljöns nätverksinställning, fel `ENOTFOUND`): WALS (`wals.info`) och D-PLACE (`d-place.org`). Europe PMC:s sökning svarade 503 när jag sökte efter studier om bantuspridningen. Dessa är kandidater om värdena släpps fram. **Ethnologue** har jag inte undersökt; ingen uppgift om den ska användas före en öppnad licenstext. Den som fyllde i kommentaren på #2406 öppnade Glottologs nedladdningar och ordlista (28 november) och kom till samma slutsats: släktträd och geografi är skilda, och dateringar av gränser saknas.

**Glottologs GitHub-sida** (`github.com/glottolog/glottolog`) visar ingen licenstext och ingen beskrivning av geografifilen eller makroområden; licensen CC BY 4.0 står på nedladdningssidan.

## Hur osäkerheten kan visas (förslag, inte fakta)

Att språkfamiljers ursprung och spridning är omstridda är källornas egen bild i exemplen jag öppnade: Wikipedia anger till exempel för ordet *kakao* att ursprunget är föremål för "betydande språkvetenskaplig debatt", och forskningsfältet har flera konkurrerande hypoteser. För visningen finns tre vägar i den befintliga modellen:

1. **Mjuk kant.** `softEdge()` ritar redan tre svaga linjer för riken med osäker gräns (#73), och religionslagret har streckad och prickad kant för osäkra områden. Samma visuella språk kan användas.
2. **Flera hypoteser som separata grupper.** Varje tolkning blir en egen grupp i `data/empires/` (till exempel en stäpphypotes och en anatolisk hypotes för indoeuropeiska), med egna `facts`, `sources`, `review` och färg. Då kan båda ligga på kartan och följas i Fokus. Periodposter inom en grupp ska bara vara tidsutveckling av *en* tolkning.
3. **Bara en punkt för troligt ursprung.** Går med händelseschemat och `locationPrecision: region`, men förhistoriebeslutet säger att plats alltid är en fyndplats och aldrig ett antaget område, så det kräver ett särskilt beslut.

Det som saknas i modellen: perioder har bara heltalen `start` och `end` (inte `edtf`), och det finns ingen flagga för "hypotes, ungefärlig" (religionslagret har `sure`). Arkitekten föreslår en enda flagga per grupp eller period som tvingar `softEdge`.

## Lagertyp (bedömning av `arkitekt`)

- **Områdeslagret passar** (lagertyp "område", `js/layers/areas.js`), med `areaKind: "culture"`: svag fyllning, eget ringmönster, ingen medalj eller flagga, egen teckenförklaring. Fältet är byggt (#1300) men **ingen grupp använder det än** (`grep -c '"areaKind"' data/empires/index.json` ger 0); steg (b), pilot med Maya och Sumer, är inte gjort. Språkfamiljerna blir i praktiken första riktiga användaren och måste samordnas med #1300.
- **Religionslagret passar inte** (det förutsätter stater ur Cliopatria). **Händelselagret** ger bara punkter.
- **Ingen av de sex arkitekturbesluten bryts**, så länge det byggs som data i egna filer och en ny registerpost. Det som skulle bryta: en sjätte lagertyp, en separat laddningsväg eller körtidsberoende på Glottologs bibliotek.
- **Prestanda:** några få förenklade familjer ger några hundra kB i egna filer och påverkar inte starten. Ritkostnaden på mobil är inte mätt.
- **Regionvyn** ritar inte områden (de är bildpunktsbaserade), vilket är acceptabelt för stora ungefärliga områden.
- **Reversibelt:** ja. Allt är data plus en registerpost.

## Risker

- **Falsk exakthet** är den största risken: utan tidsdaterad källa blir varje årtal för en polygon en egen tolkning. Använd i så fall få, grova tidssnitt (århundrade eller årtusende) och skriv ut att det är en tolkning.
- **Pilotbeslutet 2026-11-27** utesluter omstridda frågor för Codex. Det bör göras av Claude Code med Opus, och `historiker` granskar före release.
- **Samtidighet:** språkområden ger sällan en tydlig "samtidigt"-poäng utan tolkning, så fun facts bör vänta.
- **Filkrockar:** `data/empires/index.json` (2,27 MB) och `data/genererat/riken.json` är delade; lägg ett pilotområde i en egen pull request.

## Rekommendation till DasKrokodil

**Beslut som behövs (ja/nej per rad):**

| Fråga | Rekommendation |
|---|---|
| Ska språkfamiljer visas som områden över tid just nu? | **Nej, vänta.** Det saknas en öppen tidsdaterad källa, och varje polygon blir en tolkning. |
| Är det ändå intressant: ska en pilot göras med `areaKind: "culture"` för *en* språkfamilj? | **Ja, men först efter ditt ok**, med en enda familj som har bäst öppen källa, en eller två grova tidsperioder, `source-checked` och `facts` som säger öppet att utbredningen är en tolkning. Det provar samtidigt `culture` (#1300 steg b). |
| Ny källa (Glottolog, enskilda Glottography-dataset, Wikidata)? | **Glottolog och CC BY-dataseten ja** (kräver en rad per källa i `data/sources.json` och README:ns licensavsnitt). **Wurm & Hattori nej.** Native Land först efter att API-villkoren har lästs. |
| Flagga för "hypotes, ungefärlig" på grupp eller period? | Först om piloten blir av; kräver beslutsfil och ändring i datamodellen. |
| Släpp fram `wals.info` och `d-place.org` i nätverksinställningen? | Ja om du vill att nästa undersökning ska gälla uppskattningar av ursprung och spridning (bantu, austronesiska). |

Billigaste alternativet som inte kräver något beslut om kartan: visa Glottologs släktträd eller nutida språkpunkter i Fokus eller faktaruta, utan polygon. Det svarar inte på frågan "över tid".

## Källor jag öppnade (2026-11-28)

- Glottolog, nedladdningar: https://glottolog.org/meta/downloads
- Wikipedia, Glottolog: https://en.wikipedia.org/wiki/Glottolog
- Glottography på GitHub: https://github.com/Glottography, samt `rantanen2021uralic`, `wikipedia2024officiallang` och `wurm1981pacific` under samma konto
- Glottolog på GitHub: https://github.com/glottolog/glottolog (ingen licens- eller geografibeskrivning på sidan)
- Native Land Digital: https://native-land.ca/
- Wikipedia, Cocoa bean: https://en.wikipedia.org/wiki/Cocoa_bean (för exemplet om omstridd ordhärkomst)
- Kommentaren på #2406 (Glottologs nedladdningar och ordlista, öppnade 28 november)
- Projektets egna dokument som `arkitekt` läste: `docs/arkitektur.md`, `docs/datamodell.md`, `docs/beslut/2026-11-16-areakind-1300.md`, `docs/beslut/2026-11-27-codex-pilot-sprak-och-skrift.md`, `js/layers/areas.js`, `js/layers/area-style.js`
