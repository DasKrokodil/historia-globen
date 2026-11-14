# Omstridda gränser i nutid och Sveriges hållning (#644, steg 1)

Regeln (Rikards beslut 2026-11-03 på #556, se [beslut/2026-11-03-omstridda-granser.md](beslut/2026-11-03-omstridda-granser.md)): nutida omstridda gränser och statusfrågor ritas enligt **Sveriges officiella hållning**, med en källa på regeringen.se per fall. Saknas en tydlig svensk hållning visar vi Cliopatrias gräns med en öppen not och frågar Rikard innan vi väljer sida. Historiska gränser (före cirka 1945) följer Cliopatria.

**Läget (2026-11-06):** Rikard har godkänt listan och svarat på frågorna (se [Rikards svar](#rikards-svar-2026-11-06) sist). **Krim är rättat** (fall 1), och **Israel, Palestina och Golan** (fall 3 och 4) ritas enligt Sveriges hållning. De andra fallen görs i de omgångar där landet läggs in, och källorna läggs då in i `data/sources.json`.

**Hur listan togs fram (2026-11-06):**
- Sveriges hållning: UD:s landsidor under *Sveriges förbindelser med omvärlden* på regeringen.se, UD:s uttalanden och reseavrådan. Allt är öppnat och läst 2026-11-06. Texten nedan är egna ord, inga citat.
- Cliopatria: datafilen `cliopatria_polities_only_v021.geojson` (v0.2.1, samma som `tools/riken.py` använder). För varje fall kontrollerades vilken stat en punkt i området hör till åren 2013, 2015, 2023 och 2024.
- Vi har ingen enskild lista från UD över omstridda gränser, så varje fall har en egen källa. Fall som inte står här (UD nämner dem inte på de sidor som öppnats) tas upp när landet läggs in.

## Sammanfattning

| Fall | Sveriges hållning (källa) | Vad Cliopatria visar | Våra riken som berörs | Förslag |
|---|---|---|---|---|
| 1. Krim och Sevastopol | Del av Ukraina; annekteringen erkänns inte | Både Ukraina och Ryssland 2014–2023, bara Ryssland 2024 | `ukraina`, `ryska-federationen` | **Rättat 2026-11-06:** Krim som Ukraina hela tiden |
| 2. Donetsk, Luhansk, Cherson, Zaporizjzja | Del av Ukraina; annekteringarna 2022 erkänns inte | Ukraina | `ukraina` | Stämmer, bara en not |
| 3. Västbanken, Östra Jerusalem och Gaza | Ockuperade; Sverige erkände Staten Palestina 30 oktober 2014 | Västbanken och Östra Jerusalem som Israel, Gaza tomt, ingen palestinsk stat | `israel` | **Rättat 2026-11-06:** Palestina från 2014, gränsen ur Natural Earth |
| 4. Golanhöjderna | Ockuperat område, ingår inte i Israel inom 1967 års gränser | Israel | `israel`, `syrien` | **Rättat 2026-11-06:** inte Israel från 1967 |
| 5. Norra Cypern | Självständigheten erkänns inte (FN:s säkerhetsråds resolution 541/1983) | Egen stat 1976–2024 | `cypern` | **Gjort 2026-11-06:** hela ön som Cypern, med not |
| 6. Abchazien och Sydossetien | Sverige stöder Georgiens territoriella integritet | "Russian-occupied territories", räknas till Ryssland, 1992–2024 | inget ännu (`ryska-federationen` tar inte med dem) | **Avviker** när Georgien läggs in |
| 7. Transnistrien | UD beskriver Transnistrien som en region i Moldavien; ingen uttalad hållning om statusen hittad | Samma post som fall 6 | inget ännu | Som Moldavien, med not (svar 3) |
| 8. Kosovo | Diplomatiska förbindelser sedan självständighetsförklaringen 2008, ambassad i Pristina | Egen stat 2000–2024 | `kosovo`, `serbien` | **Gjort 2026-11-06:** egen stat från 2008, utan stat 2000–2007, med not |
| 9. Västsahara | Stöder FN-processen och Marockos autonomiplan som grund för förhandlingar; ingen uttalad hållning om vem området tillhör | Tomt (ingen stat) | inget ännu | Stämmer, bara en not |
| 10. Taiwan | Inga diplomatiska förbindelser, handelskontor i Taipei, regeringen använder namnet Taiwan; ingen uttalad hållning om statusen hittad | Republiken Kina, egen stat | inget ännu | **Gjort 2026-11-06:** Cliopatrias gräns med not |
| 11. Kashmir | Ingen uttalad hållning hittad; UD skriver "indiska unionsterritoriet Jammu och Kashmir" och "den Pakistan-kontrollerade delen av Kashmir" | Delat mellan Indien, Pakistan och Kina | `indien`, `pakistan` | **Gjort 2026-11-06:** Cliopatrias linjer med not |
| 12. Nagorno-Karabach | Azerbajdzjan återupprättade sin kontroll hösten 2023; den armeniska befolkningen flydde | Armenien, även 2024 | inget ännu | Omstritt till 2022, Azerbajdzjan från 2023 (svar 7) |
| 13. Somaliland | Ingen text om Somaliland på UD:s sida om Somalia | Somalia | inget ännu | Stämmer, inget att ändra |
| 14. Östtimor | Indonesiens ockupation 1975 erkändes aldrig av Sverige; självständigt 2002 | Indonesien 1976–2005, egen stat från 2006 | `indonesien`, `osttimor` | **Gjort 2026-11-06:** utan stat 1976–2001, Östtimor från 2002, med not |

## Fallen ett och ett

### 1. Krim och Sevastopol
- **Sveriges hållning:** UD skriver att Rysslands angrepp på Ukraina började våren 2014 med den olagliga annekteringen av Krim. I uttalandet 30 september 2022 säger UD att Sverige inte erkänner och inte kommer att erkänna Rysslands annekteringar, och att den autonoma republiken Krim och staden Sevastopol är en del av Ukraina inom landets internationellt erkända gränser.
- **Källor:** [Ukraina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/ukraina/) och [UD:s uttalande 30 september 2022](https://www.regeringen.se/uttalanden/20222/09/sverige-erkanner-inte-och-kommer-inte-att-erkanna-rysslands-illegala-annekteringar-av-ukrainskt-territorium/) (adressen innehåller "20222", så står den på regeringen.se), kontrollerade 2026-11-06.
- **Cliopatria:** Krim hör till både Ukraina och Ryska federationen 2014–2023 och bara till Ryssland 2024. Vår `ryska-federationen` ritar därför Krim som ryskt från 2014, och `ukraina` visas utan Krim 2024 (fyndet i kommentaren på #644).
- **Gjort (2026-11-06):** Krim och Sevastopol ritas som Ukraina 2014–2024 och är borttagna ur Ryska federationen (`DISPUTED` i `tools/riken.py`; området är Ukrainas gräns 2013 minus Ukrainas gräns 2024 i Cliopatria, vilket är exakt halvön). Rutan Om kartan för båda länderna och för nyckelåret 2014 säger att gränsen är omstridd och att kartan följer Sveriges officiella hållning enligt UD (kontrollerad 2026-11-06), och UD:s två sidor står bland källorna. Faktarutornas texter om annekteringen är oförändrade, eftersom de beskriver vad som hände.

### 2. Donetsk, Luhansk, Cherson och Zaporizjzja
- **Sveriges hållning:** samma uttalande som fall 1: regionerna är en del av Ukraina, och annekteringarna saknar folkrättslig giltighet.
- **Källa:** [UD:s uttalande 30 september 2022](https://www.regeringen.se/uttalanden/20222/09/sverige-erkanner-inte-och-kommer-inte-att-erkanna-rysslands-illegala-annekteringar-av-ukrainskt-territorium/), kontrollerad 2026-11-06.
- **Cliopatria:** områdena hör till Ukraina 2022–2024. Vår `ukraina` säger redan i sin ruta att de ockuperade områdena visas som en del av Ukraina.
- **Gjort (2026-11-06):** ingen gränsändring. Rutan Om kartan för Ukraina säger nu att detta stämmer med både Cliopatria och Sveriges hållning, och UD-uttalandet står som källa vid nyckelåret 2022.

### 3. Västbanken, Östra Jerusalem och Gaza
- **Sveriges hållning:** Sverige erkände Staten Palestina 30 oktober 2014. UD skriver att EU:s avtal med Israel gäller staten Israel inom 1967 års gränser och inte Västbanken, Östra Jerusalem, Gaza eller Golanhöjderna, att dessa är ockuperade områden, och att EU och Sverige anser att bosättningarna på Västbanken och i Östra Jerusalem strider mot folkrätten.
- **Källor:** [Palestina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/palestina/) och [Handel med Israel och Palestina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/israel/handel-med-israel-och-palestina/), kontrollerade 2026-11-06.
- **Cliopatria:** Västbanken och Östra Jerusalem hör till Israel (State of Israel) 2013–2024, och Gaza hör inte till någon stat. Den enda palestinska posten är "Palestinians" år 1948.
- **Beslut (svar 1):** gränsen hämtas ur Natural Earth, och Palestina ritas som stat från 30 oktober 2014. Cliopatria har ingen gräns för Palestina eller för 1967 års linje, så en sådan gräns måste hämtas ur en annan källa.

- **Gjort (2026-11-06):** Cliopatria räknar Västbanken och Östra Jerusalem till Israel från 1967 och Gaza 1967–1972 och 1976–1982 (efter 1982 hör Gaza inte till någon stat i Cliopatria). Från 1967 räknas de inte till Israel, och från 2014 visas Staten Palestina (Västbanken med Östra Jerusalem och Gaza, Wikidata Q219060) med gränser ur Natural Earths omstridda områden (`tools/ne_omstridda.py`). Åren 1967–2013 är områdena tomma. Palestina har en kort faktaruta som bygger på UD:s två sidor. Små områden som Natural Earth också markerar (ingenmansland vid Latrun och i Jerusalem, Scopusberget och Shebaagårdarna) är inte med, eftersom UD:s sidor inte nämner dem och de försvinner i förenklingen.

### 4. Golanhöjderna
- **Sveriges hållning:** samma källa som fall 3: Golan räknas som ockuperat område och ingår inte i Israel inom 1967 års gränser.
- **Källa:** [Handel med Israel och Palestina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/israel/handel-med-israel-och-palestina/), kontrollerad 2026-11-06.
- **Cliopatria:** Golan hör till Israel 2013–2024 (åren före 2013 är inte kontrollerade än).
- **Beslut (svar 1):** Golan räknas inte till Israel; gränsen hämtas ur Natural Earth.
- **Gjort (2026-11-06):** Golanhöjderna räknas inte till Israel från 1967 (Cliopatria räknar dem till Israel från 1967). Cliopatria räknar dem inte till Syrien, så området är tomt på kartan. UD:s text säger att området är ockuperat, inte vems det är, och Rikard godkände 2026-11-06 att det lämnas tomt. Not i Israels och Syriens ruta Om kartan.

### 5. Norra Cypern
- **Sveriges hållning:** UD skriver att ön sedan 1974 delas av en FN-kontrollerad buffertzon, att den internationellt erkända regeringen i Republiken Cypern kontrollerar området söder om zonen, och att Sverige inte erkänner Norra Cyperns självständighet, i enlighet med FN:s säkerhetsråds resolution 541 från 1983.
- **Källa:** [Cypern, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/cypern/), kontrollerad 2026-11-06.
- **Cliopatria:** "Turkish Republic of Northern Cyprus" är en egen stat 1976–2024.
- **Beslut (svar 2):** Norra Cypern läggs inte in som egen stat; hela ön ritas som Cypern med noten att den norra delen inte kontrolleras av regeringen och att Sverige inte erkänner Norra Cypern.
- **Gjort (2026-11-06):** Cypern är inlagt (trettonde omgången nutida stater). Cliopatria har hela ön som Republiken Cypern till och med 1975; från 1976 läggs Norra Cypern (Cyperns gräns 1970 minus gränsen 2000 i Cliopatria) till Cypern (`DISPUTED` i `tools/riken.py`). Noten i rutan Om kartan finns på alla fem språken, med UD:s sida som källa.

### 6. Abchazien och Sydossetien
- **Sveriges hållning:** Sverige stöder Georgiens suveränitet och territoriella integritet och bidrar till EU:s observatörsinsats, som verkar längs de administrativa gränslinjerna mot de georgiska regionerna Abchazien och Sydossetien.
- **Källa:** [Georgien, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/georgien/), kontrollerad 2026-11-06.
- **Cliopatria:** posten "Russian-occupied territories" (1992–2024) räknas som en del av Ryska federationen (fältet MemberOf). Vår `ryska-federationen` bygger bara på posten "Russian Federation" och tar inte med dem, så kartan visar dem inte som ryska i dag. En punkt i Abchazien (Suchumi) hör inte till någon stat 2013–2024, och en punkt vid Tschinvali hör till Georgien.
- **Förslag:** när Georgien läggs in ritas Abchazien och Sydossetien som en del av Georgien, med noten "Området kontrolleras inte av Georgiens regering. Sverige stöder Georgiens territoriella integritet, och kartan följer Sveriges officiella hållning enligt UD (kontrollerad …)". Posten "Russian-occupied territories" läggs aldrig till Ryssland.
- **Gjort (2026-11-06):** Georgien är inlagt (tionde omgången nutida stater, 1918–1921 och från 1992) med Abchazien och Sydossetien ur Natural Earths omstridda områden (`DISPUTED` i `tools/riken.py`), och noten i rutan Om kartan på alla fem språken.

### 7. Transnistrien
- **Sveriges hållning:** UD nämner Transnistrien och Gagauzien som regioner i Moldavien (i samband med rysk påverkan), men har ingen uttalad hållning om Transnistriens status på sidan.
- **Källa:** [Moldavien, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/moldavien/), kontrollerad 2026-11-06.
- **Cliopatria:** Tiraspol ligger i samma post som fall 6, "Russian-occupied territories", som räknas till Ryssland.
- **Beslut (svar 3):** ritas som Moldavien, med noten att området inte kontrolleras av Moldaviens regering.
- **Gjort (2026-11-06):** Moldavien är inlagt (elfte omgången nutida stater) med Transnistrien ur Natural Earths omstridda områden, och noten i rutan Om kartan på alla fem språken.

### 8. Kosovo
- **Sveriges hållning:** Sverige har diplomatiska förbindelser med Kosovo sedan självständighetsförklaringen 2008 och har en ambassad i Pristina; Kosovo har en ambassad i Stockholm. Ett separat beslut om erkännandet 2008 hittade jag inte på regeringen.se.
- **Källa:** [Kosovo, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/kosovo/), kontrollerad 2026-11-06.
- **Före 2008 (Rikards fråga 4):** Jag har inte hittat något uttalande där regeringen säger vem Kosovo tillhörde 1999–2008. Det som finns visar att Sverige behandlade Kosovo som ett område under FN:s förvaltning med en status som ännu inte var avgjord:
  - Sverige slöt 2004 ett avtal med *Förenta nationernas interimsadministration i Kosovo* (UNMIK) om återvändande till Kosovo, alltså med FN:s förvaltning och inte med Serbien. Källa: [Samförståndsavtal med UNMIK, SÖ 2005:29](https://www.regeringen.se/rattsliga-dokument/sveriges-internationella-overenskommelser/2005/01/so-200529/), regeringen.se, kontrollerad 2026-11-06.
  - I redogörelsen för OSSE 2007 (skrivelse 2007/08:82, 6 mars 2008) skriver regeringen att förhandlingarna om "Kosovos framtida status" pågick under 2007, och att Sverige och EU ville ha kvar OSSE i Kosovo oavsett hur statusprocessen slutade. Källa: [Regeringens skrivelse 2007/08:82](https://www.regeringen.se/contentassets/6afb120c37f446ffbafb25572fd52357/redogorelse-for-verksamheten-inom-organisationen-for-sakerhet-och-samarbete-i-europa-osse-under-ar-2007-skr.-20070882), regeringen.se, kontrollerad 2026-11-06.
  - Riksdagens webbplats (där regeringens skrivelse om EU 2008 ska nämna erkännandet) går inte att nå från molnet, så datumet för Sveriges erkännande är inte kontrollerat.
- **Cliopatria:** "Kosovo" är en egen stat redan från 2000.
- **Förslag:** Kosovo som egen stat från självständighetsförklaringen 2008. Åren 2000–2007 visas inte som egen stat utan som omstritt område, med noten "Kosovo förvaltades av FN, och statusen var inte avgjord. Sverige förhandlade med FN:s förvaltning (UNMIK) och väntade på statusprocessen" (samma visning som Nagorno-Karabach, svar 7). **Godkänt av Rikard 2026-11-06.**
- **Gjort (2026-11-06):** Kosovo är inlagt (trettonde omgången nutida stater) som stat från 2008. Åren 2000–2007 hör området inte till någon stat på kartan (Serbien börjar 2006 hos oss och räknar inte Kosovo). Noten i rutan Om kartan för Kosovo och Serbien finns på alla fem språken, med UD:s sida, samförståndsavtalet med UNMIK och skrivelsen 2007/08:82 som källor.

### 9. Västsahara
- **Sveriges hållning:** Sverige vill se en rättvis, hållbar och ömsesidigt godtagbar lösning enligt FN:s säkerhetsrådsresolutioner och FN-stadgan, stöder FN:s sändebud, och uttrycker stöd för Marockos autonomiplan som en trovärdig grund för förhandlingar i ljuset av säkerhetsrådets resolution 2797. UD säger inte vem området tillhör.
- **Källa:** [Västsahara, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/vastsahara/), kontrollerad 2026-11-06.
- **Cliopatria:** Västsahara hör inte till någon stat 2013–2024 (punkter vid Laâyoune, Dakhla och Tifariti), och Marockos gräns går vid 27,7° N.
- **Gjort (2026-11-06):** Marocko är inlagt (fjärde omgången nutida stater) utan Västsahara, som i Cliopatria, med noten i rutan Om kartan. **Förslag (från början):** ingen ändring; området lämnas tomt. När Marocko läggs in får det noten "Västsaharas status är omstridd och ska avgöras i en FN-ledd process. Sverige har inte uttalat vem området tillhör (UD, kontrollerad …)". Hållningen kontrolleras igen vid varje release.

### 10. Taiwan
- **Sveriges hållning:** Sverige har inga diplomatiska förbindelser med Taiwan men omfattande band, ett handelskontor i Taipei, och regeringen använder benämningen Taiwan. Sverige upprättade diplomatiska förbindelser med Folkrepubliken Kina 1950. Någon uttalad hållning om Taiwans status hittade jag inte på sidorna.
- **Källor:** [Taiwan, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/taiwan/) och [Kina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/kina/), kontrollerade 2026-11-06.
- **Cliopatria:** "Republic of China" är en egen stat 1950–2024 (Taiwan med öarna).
- **Beslut (svar 5):** Cliopatrias gräns, namnet Taiwan och noten om att statusen är omstridd.
- **Gjort (2026-11-06):** Taiwan är en egen grupp (`taiwan`, Cliopatrias Republiken Kina 1950–2024, Wikidata Q865) i första omgången nutida stater, med noten i rutan Om kartan. Kina (`kina`) har Republiken Kina 1912–1949 och Folkrepubliken från 1950, och dess ruta Om kartan hänvisar till Taiwan och har noten om Kashmir.

### 11. Kashmir
- **Sveriges hållning:** ingen uttalad hållning om gränsen hittad. UD:s reseavrådan (7 maj 2025) talar om "det indiska unionsterritoriet Jammu och Kashmir" och om "den Pakistan-kontrollerade delen av Kashmir", alltså om vem som kontrollerar områdena, inte om vem de tillhör.
- **Källor:** [Indien – avrådan](https://www.regeringen.se/ud-avrader/indien---avradan/) och [Pakistan – avrådan](https://www.regeringen.se/ud-avrader/pakistan---avradan/), regeringen.se, kontrollerade 2026-11-06; landsidorna för [Indien](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/indien/) och [Pakistan](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/pakistan/) nämner inte Kashmir.
- **Cliopatria:** Srinagar hör till Indien, Muzaffarabad och Gilgit till Pakistan, och Aksai Chin till Kina (2013–2024).
- **Gjort (2026-11-06):** Cliopatrias linjer behålls. Rutan Om kartan för Indien och Pakistan säger att gränsen är omstridd, att kartan visar vem som kontrollerar områdena och inte vem de tillhör, och att Sverige inte har någon uttalad hållning som vi hittat. UD:s två reseavrådan står som källor.

### 12. Nagorno-Karabach
- **Sveriges hållning:** UD skriver att Azerbajdzjan hösten 2023 genomförde en militär operation i Nagorno-Karabach och återupprättade sin kontroll över området, att regionens armeniska befolkning flydde till Armenien, och att parterna enades om ett utkast till fredsavtal 13 mars 2025.
- **Källor:** [Azerbajdzjan](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/azerbajdzjan/) och [Armenien](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/armenien/), regeringen.se, kontrollerade 2026-11-06.
- **Cliopatria:** en punkt vid Stepanakert hör till Armenien 2013–2024, alltså även efter 2023.
- **Beslut (svar 7):** området visas som omstritt, inte som Armenien, till och med 2022, och räknas till Azerbajdzjan från 2023.
- **Gjort (2026-11-06):** Armenien och Azerbajdzjan är inlagda (tionde omgången). Cliopatria räknar både Nagorno-Karabach och omkringliggande områden till Armenien 1992–2024. Det omstridda området är den del av Cliopatrias Armenien som ligger inom Azerbajdzjans gräns i Natural Earth: det räknas aldrig till Armenien, visas utan stat 1992–2022 och som Azerbajdzjan från 2023. Noten i rutan Om kartan för båda länderna säger det öppet.

### 13. Somaliland
- **Sveriges hållning:** UD:s sida om Somalia nämner inte Somaliland.
- **Källa:** [Somalia, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/afrika/somalia/), kontrollerad 2026-11-06.
- **Cliopatria:** en punkt vid Hargeisa hör till Somalia (Federal Republic of Somalia) 2013–2024.
- **Förslag:** ingen ändring och ingen not, eftersom kartan inte ritar något som UD säger emot.

### 14. Östtimor
- **Sveriges hållning:** UD skriver att Sverige aldrig erkände Indonesiens ockupation av den forna portugisiska kolonin 1975, att Östtimor blev självständigt 2002 efter ett par år som FN-protektorat, och att Sverige upprättade diplomatiska förbindelser med landet 2002.
- **Källa:** [Östtimor, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/osttimor/), kontrollerad 2026-11-06.
- **Andra källan:** FN:s sidor om [UNTAET](https://peacekeeping.un.org/en/mission/past/etimor/etimor.htm) och [bakgrunden](https://peacekeeping.un.org/en/mission/past/etimor/UntaetB.htm) säger att Indonesien tog in Östtimor som provins 1976 och att FN aldrig erkände det, att FN:s övergångsförvaltning UNTAET inrättades 25 oktober 1999, och att Östtimor blev självständigt 20 maj 2002. Kontrollerade 2026-11-06. FN:s medlemslista anger att landet blev medlem 27 september 2002.
- **Cliopatria:** området hör till Indonesien (Republic of Indonesia) 1976–2005 och är en egen stat (East Timor) från 2006. Wikidata (Q574) anger 28 november 1975 som startdatum. Källorna skiljer sig alltså, och det står i noten.
- **Gjort (2026-11-06, femtonde omgången nutida stater):** området (Indonesiens gräns 2005 minus gränsen 2006 i Cliopatria) räknas aldrig till Indonesien från 1976, visas utan stat 1976–2001 (som Golanhöjderna) och som Östtimor från 2002 (`DISPUTED` i `tools/riken.py`). Åren 2002–2005 har Östtimor samma gräns. Noten i rutan Om kartan för Östtimor och Indonesien finns på alla fem språken, med UD:s och FN:s sidor som källor. Hållningen är tydlig, så den här gången behövdes ingen fråga till Rikard; väljer han hellre att visa området på annat sätt 1976–2001 ändras bara `DISPUTED`.

## Ockupation och inbördeskrig (#1332, beslut 2026-11-13)

Regeln ([beslut/2026-11-13-ockupation-och-inbordeskrig.md](beslut/2026-11-13-ockupation-och-inbordeskrig.md), DasKrokodils svar på #1332): där Cliopatria efter 1945 ritar en ockupationsmakt eller en part i ett inbördeskrig i stället för en stat, ritas den **internationellt erkända staten**, och ockupationen eller kontrollen står med källa i rutan Om kartan. Det är en annan fråga än fallen ovan: där gäller Sveriges hållning om vem ett område tillhör, här vilken stat som ritas när Cliopatria ritar en makt som kontrollerade landet.

**Så görs gränsen (inga påhittade gränser).** De år Cliopatria ritar en annan makt används **statens egen gräns i Cliopatria** ett närliggande år (`fill` i `GROUPS` i `tools/riken.py`), och bara där Cliopatrias gräns för staten är densamma före och efter. Makten som Cliopatria ritar i stället klipps bort de åren (`DISPUTED` med `to` och området `('clio', namn, år)`). Mätt i `cliopatria_polities_only_v021` 2026-11-13 (symmetrisk skillnad mellan gränserna, delat med ytan):

| Stat | År på kartan | Cliopatria ritar i stället | Gränsen som används | Samma som | Skillnad |
|---|---|---|---|---|---|
| Afghanistan | 1979–2005 | Sovjetunionen (delar 1979–1989), `Mujahideen` (1987–1995), `Taliban` (1996–2005; `Afghanistan` bara i nordost) | `Republic of Afghanistan` 1978 | `Afghanistan` 2006 | 0,2 % |
| Irak | 2006–2013 | USA (2006–2023, från 2014 samtidigt med `Republic of Iraq`) | `Iraqi Republic` 2005 | `Republic of Iraq` 2014 | 0,1 % |
| Tjeckoslovakien | 1969–1990 | Sovjetunionen (1969–1990, och samtidigt 1991) | `Czechoslovakia` 1968 | `Czechoslovakia` 1991 | 0,1 % |
| Kroatien | 1992–1995 | `Serbia-Montenegro` (Republiken Serbiska Krajina) | `Republic of Croatia` 1996 | samma post till 2024 | 0 % |
| Bosnien och Hercegovina | 1992–1995 | `Serbia-Montenegro` och `Republic of Croatia` (Republika Srpska och Herceg-Bosna; Cliopatrias Bosnien är 1992–1995 bara en fjärdedel av landet) | `Bosnia and Herzegovina` 1996 | `Bosnia and Herzegovina` 2006 | 0,2 % |
| Förbundsrepubliken Jugoslavien | 1992–1995 | samma post med de serbiska områdena i Kroatien och Bosnien | `Serbia-Montenegro` 1996 | `Serbia-Montenegro` 2000 (utom Kosovo) | – |

Källorna för ockupationen och kontrollen (Wikipedia, kontrollerade 2026-11-13): [Soviet–Afghan War](https://en.wikipedia.org/wiki/Soviet%E2%80%93Afghan_War) (december 1979–februari 1989), [Islamic Emirate of Afghanistan (1996–2001)](https://en.wikipedia.org/wiki/Islamic_Emirate_of_Afghanistan_(1996%E2%80%932001)) (talibanerna styrde som mest omkring 90 procent av landet) och [Islamic State of Afghanistan](https://en.wikipedia.org/wiki/Islamic_State_of_Afghanistan) (FN:s erkända regering till 2001); [Coalition Provisional Authority](https://en.wikipedia.org/wiki/Coalition_Provisional_Authority) (ockupationsmyndigheten till 28 juni 2004) och [Withdrawal of United States troops from Iraq (2007–2011)](https://en.wikipedia.org/wiki/Withdrawal_of_United_States_troops_from_Iraq_(2007%E2%80%932011)) (de sista trupperna lämnade 18 december 2011); [Warsaw Pact invasion of Czechoslovakia](https://en.wikipedia.org/wiki/Warsaw_Pact_invasion_of_Czechoslovakia) (20–21 augusti 1968) och [Central Group of Forces](https://en.wikipedia.org/wiki/Central_Group_of_Forces) (de sovjetiska trupperna drogs tillbaka 1990–1991); [Croatian War of Independence](https://en.wikipedia.org/wiki/Croatian_War_of_Independence), [Republic of Serbian Krajina](https://en.wikipedia.org/wiki/Republic_of_Serbian_Krajina) och [Bosnian War](https://en.wikipedia.org/wiki/Bosnian_War). Noterna i rutan Om kartan för de sex rikena finns på alla fem språken.

**Inte med i beslutet:** Rhodesia (1965–1979) och Zimbabwe-Rhodesia (1979) erkändes inte av någon stat, men Cliopatria ritar dem som egen stat och inte som en ockupationsmakt. De visas som i Cliopatria (svaret på del 1 i #1332), och rutan Om kartan säger att staten inte erkändes.

**Före 1945: Etiopien 1936–1941 (#1330, #1083).** Beslutet gäller ockupationer efter 1945 och ändrar inte hur Italiens erövring av Etiopien ritas. Där följer kartan Cliopatria, som DasKrokodil bestämde när #1083 fördes över till #1330 (2026-11-13): Etiopiska kejsardömet slutar 1935, Italienska Östafrika (Etiopien, Eritrea och Italienska Somaliland) ritas 1936–1940 som en del av gruppen Italienska kolonier i Afrika, och Etiopien kommer tillbaka 1942. 1941 ritar Cliopatria det mesta av landet som Brittiska imperiet och bara området kring Gondar som italienskt; kartan visar det så, och rutan Om kartan för Italienska Östafrika säger det. Ingen gräns är påhittad: alla år har Cliopatrias egna gränser.

**Tibet 1912–1951 och Mongoliet 1912–1925 (#1331, DasKrokodils beslut 2026-11-14 i chatten).** Tibet var de facto självständigt från 1912 till annekteringen 1951 och Bogd Khanate (Mongoliet) 1911–1924, men nästan ingen stat erkände dem; Republiken Kina räknade båda till Kina (wp-tibet-1912-1951, wp-bogd-khanate). Före 1945 följer kartan Cliopatria, utan någon allmän regel om den erkända staten. Efter 1945 följer kartan Sveriges officiella hållning ("För de andra fallen följer vi UD", DasKrokodil 2026-11-14): UD:s landsida om Kina (ud-kina, öppnad 2026-11-14) säger att Sverige som första västland upprättade diplomatiska förbindelser med Folkrepubliken Kina 1950. Tibet visas därför som i Cliopatria till och med 1951, året för sjuttonpunktsavtalet (23 maj 1951, enligt historikerns rekommendation), och inte längre som eget land därefter. Cliopatrias Tibet 1952 lämnas tomt; det läggs inte till Folkrepubliken Kina, så ingen gräns är påhittad. Rutan Om kartan säger detta och att Wikipedia anger 1951 och Wikidata 1959 som slut. Mongoliet 1912–1925 följer Cliopatria. Rhodesia står kvar som förut.

**Fall som återstår** (sett i de byggda filerna 2026-11-13, inte ändrade här): Kuwait 1990 visas som Irak; Sovjetunionen ritas över Polen 1953–1989 och över Polen, Tjeckoslovakien, Ungern, Rumänien och Bulgarien 1945–1946; Ungern saknas 1956–1957; Muskat och Oman räknas till Brittiska imperiet 1956–1972. De prövas mot regeln i en senare omgång (#1469).

## Frågor till Rikard (2026-11-06, besvarade)

1. Israel, Palestina och Golan: får gränserna hämtas ur Natural Earth (public domain, samma källa som grundkartan)?
2. Norra Cypern: hela ön som Cypern, eller den norra delen tom?
3. Transnistrien: som Moldavien eller tomt?
4. Kosovo: hur visas 2000–2007?
5. Taiwan: Cliopatrias gräns med not?
6. Kashmir: Cliopatrias linjer med not?
7. Nagorno-Karabach: Azerbajdzjan från 2023, och vad före?

## Rikards svar (2026-11-06)

1. **Israel, Palestina och Golan:** ja till Natural Earth för gränserna. Palestina ritas som stat från Sveriges erkännande 30 oktober 2014 (svar 2026-11-06).
2. **Norra Cypern:** ritas som Cypern, med not.
3. **Transnistrien:** ritas som Moldavien, med not.
4. **Kosovo:** Rikard frågade vad Sverige sa före 2008 (svaret står i fall 8) och godkände förslaget: egen stat från 2008, åren 2000–2007 som omstritt område med not om FN:s förvaltning.
5. **Taiwan:** okej (Cliopatrias gräns, namnet Taiwan, med not).
6. **Kashmir:** ja (Cliopatrias linjer, med not).
7. **Nagorno-Karabach:** visas som omstritt till och med 2022 och räknas till Azerbajdzjan från 2023, när UD skriver att Azerbajdzjan återupprättade kontrollen.

Krim rättades först, som Rikard bad om.

## Nästa steg

1. ~~Rikard godkänner listan och svarar på frågorna.~~ Klart 2026-11-06.
2. ~~Krim rättas (fall 1).~~ Klart 2026-11-06.
3. ~~Israel inom 1967 års gränser, Golan och Palestina från 2014 (svar 1).~~ Klart 2026-11-06.
4. ~~Noterna för `indien` och `pakistan` om Kashmir (svar 6).~~ Klart 2026-11-06.
5. Därefter staterna i omgångar om cirka tio, störst lucka först enligt `tools/tackning_riken.py`; varje land i listan ovan får sin not när det läggs in.
6. Hållningarna kontrolleras igen vid varje release som rör nutida gränser, och kontrolldatumet uppdateras.
