# Omstridda gränser i nutid och Sveriges hållning (#644, steg 1)

Regeln (Rikards beslut 2026-11-03 på #556, se [beslut/2026-11-03-omstridda-granser.md](beslut/2026-11-03-omstridda-granser.md)): nutida omstridda gränser och statusfrågor ritas enligt **Sveriges officiella hållning**, med en källa på regeringen.se per fall. Saknas en tydlig svensk hållning visar vi Cliopatrias gräns med en öppen not och frågar Rikard innan vi väljer sida. Historiska gränser (före cirka 1945) följer Cliopatria.

**Läget:** listan är ett underlag för Rikards godkännande. **Ingen data är ändrad ännu.** När Rikard har godkänt listan (och svarat på frågorna sist) läggs källorna in i `data/sources.json` och ändringarna görs, fall för fall, i de omgångar där landet läggs in.

**Hur listan togs fram (2026-11-06):**
- Sveriges hållning: UD:s landsidor under *Sveriges förbindelser med omvärlden* på regeringen.se, UD:s uttalanden och reseavrådan. Allt är öppnat och läst 2026-11-06. Texten nedan är egna ord, inga citat.
- Cliopatria: datafilen `cliopatria_polities_only_v021.geojson` (v0.2.1, samma som `tools/riken.py` använder). För varje fall kontrollerades vilken stat en punkt i området hör till åren 2013, 2015, 2023 och 2024.
- Vi har ingen enskild lista från UD över omstridda gränser, så varje fall har en egen källa. Fall som inte står här (UD nämner dem inte på de sidor som öppnats) tas upp när landet läggs in.

## Sammanfattning

| Fall | Sveriges hållning (källa) | Vad Cliopatria visar | Våra riken som berörs | Förslag |
|---|---|---|---|---|
| 1. Krim och Sevastopol | Del av Ukraina; annekteringen erkänns inte | Både Ukraina och Ryssland 2014–2023, bara Ryssland 2024 | `ukraina`, `ryska-federationen` | **Avviker, rättas:** Krim som Ukraina hela tiden |
| 2. Donetsk, Luhansk, Cherson, Zaporizjzja | Del av Ukraina; annekteringarna 2022 erkänns inte | Ukraina | `ukraina` | Stämmer, bara en not |
| 3. Västbanken, Östra Jerusalem och Gaza | Ockuperade; Sverige erkände Staten Palestina 30 oktober 2014 | Västbanken och Östra Jerusalem som Israel, Gaza tomt, ingen palestinsk stat | `israel` | **Avviker:** fråga 1 |
| 4. Golanhöjderna | Ockuperat område, ingår inte i Israel inom 1967 års gränser | Israel | `israel`, `syrien` | **Avviker:** fråga 1 |
| 5. Norra Cypern | Självständigheten erkänns inte (FN:s säkerhetsråds resolution 541/1983) | Egen stat 1976–2024 | inget ännu | **Avviker:** fråga 2 |
| 6. Abchazien och Sydossetien | Sverige stöder Georgiens territoriella integritet | "Russian-occupied territories", räknas till Ryssland, 1992–2024 | inget ännu (`ryska-federationen` tar inte med dem) | **Avviker** när Georgien läggs in |
| 7. Transnistrien | UD beskriver Transnistrien som en region i Moldavien; ingen uttalad hållning om statusen hittad | Samma post som fall 6 | inget ännu | Fråga 3 |
| 8. Kosovo | Diplomatiska förbindelser sedan självständighetsförklaringen 2008, ambassad i Pristina | Egen stat 2000–2024 | inget ännu | Fråga 4 |
| 9. Västsahara | Stöder FN-processen och Marockos autonomiplan som grund för förhandlingar; ingen uttalad hållning om vem området tillhör | Tomt (ingen stat) | inget ännu | Stämmer, bara en not |
| 10. Taiwan | Inga diplomatiska förbindelser, handelskontor i Taipei, regeringen använder namnet Taiwan; ingen uttalad hållning om statusen hittad | Republiken Kina, egen stat | inget ännu | Fråga 5 |
| 11. Kashmir | Ingen uttalad hållning hittad; UD skriver "indiska unionsterritoriet Jammu och Kashmir" och "den Pakistan-kontrollerade delen av Kashmir" | Delat mellan Indien, Pakistan och Kina | `indien`, `pakistan` | Fråga 6 |
| 12. Nagorno-Karabach | Azerbajdzjan återupprättade sin kontroll hösten 2023; den armeniska befolkningen flydde | Armenien, även 2024 | inget ännu | **Avviker** från 2023: fråga 7 |
| 13. Somaliland | Ingen text om Somaliland på UD:s sida om Somalia | Somalia | inget ännu | Stämmer, inget att ändra |

## Fallen ett och ett

### 1. Krim och Sevastopol
- **Sveriges hållning:** UD skriver att Rysslands angrepp på Ukraina började våren 2014 med den olagliga annekteringen av Krim. I uttalandet 30 september 2022 säger UD att Sverige inte erkänner och inte kommer att erkänna Rysslands annekteringar, och att den autonoma republiken Krim och staden Sevastopol är en del av Ukraina inom landets internationellt erkända gränser.
- **Källor:** [Ukraina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/ukraina/) och [UD:s uttalande 30 september 2022](https://www.regeringen.se/uttalanden/20222/09/sverige-erkanner-inte-och-kommer-inte-att-erkanna-rysslands-illegala-annekteringar-av-ukrainskt-territorium/) (adressen innehåller "20222", så står den på regeringen.se), kontrollerade 2026-11-06.
- **Cliopatria:** Krim hör till både Ukraina och Ryska federationen 2014–2023 och bara till Ryssland 2024. Vår `ryska-federationen` ritar därför Krim som ryskt från 2014, och `ukraina` visas utan Krim 2024 (fyndet i kommentaren på #644).
- **Förslag:** Krim och Sevastopol ritas som Ukraina 2014–2024 och tas bort ur Ryska federationen, i `tools/riken.py` (gränsen klipps mot Ukrainas gräns 2013 i Cliopatria). Noten på båda: "Ryssland annekterade Krim 2014. Sverige erkänner inte annekteringen, och kartan följer Sveriges officiella hållning enligt UD (kontrollerad 2026-11-06)." Rysslands faktaruta och händelsen om annekteringen behålls som de är, eftersom de beskriver vad som hände.

### 2. Donetsk, Luhansk, Cherson och Zaporizjzja
- **Sveriges hållning:** samma uttalande som fall 1: regionerna är en del av Ukraina, och annekteringarna saknar folkrättslig giltighet.
- **Källa:** [UD:s uttalande 30 september 2022](https://www.regeringen.se/uttalanden/20222/09/sverige-erkanner-inte-och-kommer-inte-att-erkanna-rysslands-illegala-annekteringar-av-ukrainskt-territorium/), kontrollerad 2026-11-06.
- **Cliopatria:** områdena hör till Ukraina 2022–2024. Vår `ukraina` säger redan i sin ruta att de ockuperade områdena visas som en del av Ukraina.
- **Förslag:** ingen gränsändring. Noten utökas med att kartan följer Sveriges hållning.

### 3. Västbanken, Östra Jerusalem och Gaza
- **Sveriges hållning:** Sverige erkände Staten Palestina 30 oktober 2014. UD skriver att EU:s avtal med Israel gäller staten Israel inom 1967 års gränser och inte Västbanken, Östra Jerusalem, Gaza eller Golanhöjderna, att dessa är ockuperade områden, och att EU och Sverige anser att bosättningarna på Västbanken och i Östra Jerusalem strider mot folkrätten.
- **Källor:** [Palestina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/palestina/) och [Handel med Israel och Palestina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/israel/handel-med-israel-och-palestina/), kontrollerade 2026-11-06.
- **Cliopatria:** Västbanken och Östra Jerusalem hör till Israel (State of Israel) 2013–2024, och Gaza hör inte till någon stat. Den enda palestinska posten är "Palestinians" år 1948.
- **Förslag:** se fråga 1. Cliopatria har ingen gräns för Palestina eller för 1967 års linje, så en sådan gräns måste hämtas ur en annan källa.

### 4. Golanhöjderna
- **Sveriges hållning:** samma källa som fall 3: Golan räknas som ockuperat område och ingår inte i Israel inom 1967 års gränser.
- **Källa:** [Handel med Israel och Palestina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/israel/handel-med-israel-och-palestina/), kontrollerad 2026-11-06.
- **Cliopatria:** Golan hör till Israel 2013–2024 (åren före 2013 är inte kontrollerade än).
- **Förslag:** se fråga 1.

### 5. Norra Cypern
- **Sveriges hållning:** UD skriver att ön sedan 1974 delas av en FN-kontrollerad buffertzon, att den internationellt erkända regeringen i Republiken Cypern kontrollerar området söder om zonen, och att Sverige inte erkänner Norra Cyperns självständighet, i enlighet med FN:s säkerhetsråds resolution 541 från 1983.
- **Källa:** [Cypern, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/cypern/), kontrollerad 2026-11-06.
- **Cliopatria:** "Turkish Republic of Northern Cyprus" är en egen stat 1976–2024.
- **Förslag:** Norra Cypern läggs inte in som egen stat. Se fråga 2.

### 6. Abchazien och Sydossetien
- **Sveriges hållning:** Sverige stöder Georgiens suveränitet och territoriella integritet och bidrar till EU:s observatörsinsats, som verkar längs de administrativa gränslinjerna mot de georgiska regionerna Abchazien och Sydossetien.
- **Källa:** [Georgien, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/georgien/), kontrollerad 2026-11-06.
- **Cliopatria:** posten "Russian-occupied territories" (1992–2024) räknas som en del av Ryska federationen (fältet MemberOf). Vår `ryska-federationen` bygger bara på posten "Russian Federation" och tar inte med dem, så kartan visar dem inte som ryska i dag. En punkt i Abchazien (Suchumi) hör inte till någon stat 2013–2024, och en punkt vid Tschinvali hör till Georgien.
- **Förslag:** när Georgien läggs in ritas Abchazien och Sydossetien som en del av Georgien, med noten "Området kontrolleras inte av Georgiens regering. Sverige stöder Georgiens territoriella integritet, och kartan följer Sveriges officiella hållning enligt UD (kontrollerad …)". Posten "Russian-occupied territories" läggs aldrig till Ryssland.

### 7. Transnistrien
- **Sveriges hållning:** UD nämner Transnistrien och Gagauzien som regioner i Moldavien (i samband med rysk påverkan), men har ingen uttalad hållning om Transnistriens status på sidan.
- **Källa:** [Moldavien, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/moldavien/), kontrollerad 2026-11-06.
- **Cliopatria:** Tiraspol ligger i samma post som fall 6, "Russian-occupied territories", som räknas till Ryssland.
- **Förslag:** fråga 3.

### 8. Kosovo
- **Sveriges hållning:** Sverige har diplomatiska förbindelser med Kosovo sedan självständighetsförklaringen 2008 och har en ambassad i Pristina; Kosovo har en ambassad i Stockholm. Ett separat beslut om erkännandet 2008 hittade jag inte på regeringen.se.
- **Källa:** [Kosovo, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/kosovo/), kontrollerad 2026-11-06.
- **Cliopatria:** "Kosovo" är en egen stat redan från 2000.
- **Förslag:** fråga 4.

### 9. Västsahara
- **Sveriges hållning:** Sverige vill se en rättvis, hållbar och ömsesidigt godtagbar lösning enligt FN:s säkerhetsrådsresolutioner och FN-stadgan, stöder FN:s sändebud, och uttrycker stöd för Marockos autonomiplan som en trovärdig grund för förhandlingar i ljuset av säkerhetsrådets resolution 2797. UD säger inte vem området tillhör.
- **Källa:** [Västsahara, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/mellanostern-och-nordafrika/vastsahara/), kontrollerad 2026-11-06.
- **Cliopatria:** Västsahara hör inte till någon stat 2013–2024 (punkter vid Laâyoune, Dakhla och Tifariti), och Marockos gräns går vid 27,7° N.
- **Förslag:** ingen ändring; området lämnas tomt. När Marocko läggs in får det noten "Västsaharas status är omstridd och ska avgöras i en FN-ledd process. Sverige har inte uttalat vem området tillhör (UD, kontrollerad …)". Hållningen kontrolleras igen vid varje release.

### 10. Taiwan
- **Sveriges hållning:** Sverige har inga diplomatiska förbindelser med Taiwan men omfattande band, ett handelskontor i Taipei, och regeringen använder benämningen Taiwan. Sverige upprättade diplomatiska förbindelser med Folkrepubliken Kina 1950. Någon uttalad hållning om Taiwans status hittade jag inte på sidorna.
- **Källor:** [Taiwan, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/taiwan/) och [Kina, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/kina/), kontrollerade 2026-11-06.
- **Cliopatria:** "Republic of China" är en egen stat 1950–2024 (Taiwan med öarna).
- **Förslag:** fråga 5.

### 11. Kashmir
- **Sveriges hållning:** ingen uttalad hållning om gränsen hittad. UD:s reseavrådan (7 maj 2025) talar om "det indiska unionsterritoriet Jammu och Kashmir" och om "den Pakistan-kontrollerade delen av Kashmir", alltså om vem som kontrollerar områdena, inte om vem de tillhör.
- **Källor:** [Indien – avrådan](https://www.regeringen.se/ud-avrader/indien---avradan/) och [Pakistan – avrådan](https://www.regeringen.se/ud-avrader/pakistan---avradan/), regeringen.se, kontrollerade 2026-11-06; landsidorna för [Indien](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/indien/) och [Pakistan](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/asien-och-oceanien/pakistan/) nämner inte Kashmir.
- **Cliopatria:** Srinagar hör till Indien, Muzaffarabad och Gilgit till Pakistan, och Aksai Chin till Kina (2013–2024).
- **Förslag:** fråga 6.

### 12. Nagorno-Karabach
- **Sveriges hållning:** UD skriver att Azerbajdzjan hösten 2023 genomförde en militär operation i Nagorno-Karabach och återupprättade sin kontroll över området, att regionens armeniska befolkning flydde till Armenien, och att parterna enades om ett utkast till fredsavtal 13 mars 2025.
- **Källor:** [Azerbajdzjan](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/azerbajdzjan/) och [Armenien](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/europa-och-centralasien/armenien/), regeringen.se, kontrollerade 2026-11-06.
- **Cliopatria:** en punkt vid Stepanakert hör till Armenien 2013–2024, alltså även efter 2023.
- **Förslag:** fråga 7.

### 13. Somaliland
- **Sveriges hållning:** UD:s sida om Somalia nämner inte Somaliland.
- **Källa:** [Somalia, regeringen.se](https://www.regeringen.se/sveriges-regering/utrikesdepartementet/sveriges-forbindelser-med-omvarlden/afrika/somalia/), kontrollerad 2026-11-06.
- **Cliopatria:** en punkt vid Hargeisa hör till Somalia (Federal Republic of Somalia) 2013–2024.
- **Förslag:** ingen ändring och ingen not, eftersom kartan inte ritar något som UD säger emot.

## Frågor till Rikard

1. **Israel, Palestina och Golan.** Kartan ska enligt regeln följa Sveriges hållning: Israel inom 1967 års gränser, Västbanken (med Östra Jerusalem) och Gaza som Palestina från erkännandet 30 oktober 2014, och Golan som ockuperat (Syriens). Cliopatria har inte de gränserna. **Får vi hämta dem ur Natural Earth** (public domain, samma källa som grundkartan `data/land.json`)? Och ska Palestina ritas som stat först från 2014 (Sveriges erkännande), och områdena 1967–2014 som ockuperade utan stat?
2. **Norra Cypern.** Ska hela ön ritas som Cypern med noten att norra delen inte kontrolleras av regeringen, eller ska den norra delen lämnas tom med samma not?
3. **Transnistrien.** UD kallar området en region i Moldavien men säger inget om statusen. Ska det ritas som Moldavien (som Georgien i fall 6), eller lämnas tomt med noten "Sverige har ingen uttalad hållning som vi hittat"?
4. **Kosovo.** Ska Kosovo visas som egen stat från självständighetsförklaringen 2008 (då Sverige fick förbindelser med landet), och hur ska åren 2000–2007 visas, då Cliopatria redan ritar Kosovo som eget område? (Statusen de åren behöver då en egen källa.)
5. **Taiwan.** Sverige har ingen uttalad hållning om statusen. Enligt regeln visar vi då Cliopatrias gräns (Taiwan som eget område under namnet Taiwan, som regeringen använder) med noten "Taiwans status är omstridd. Sverige har inga diplomatiska förbindelser med Taiwan men har inte uttalat sig om statusen". Är det okej?
6. **Kashmir.** Ingen svensk hållning. Enligt regeln behåller vi Cliopatrias linjer för `indien` och `pakistan` (och Kina när det läggs in) med noten "Gränsen i Kashmir är omstridd; kartan visar vem som kontrollerar områdena, inte vem de tillhör. Sverige har ingen uttalad hållning som vi hittat". Är det okej?
7. **Nagorno-Karabach.** Ska området ritas som Azerbajdzjan från hösten 2023, när UD säger att Azerbajdzjan återupprättade kontrollen? Och åren före, då Cliopatria ritar det som Armenien (kontrollerat 2013–2023, tidigare år inte kontrollerade än): behålla Cliopatria med en not, eller visa det som omstritt?

## Nästa steg

1. Rikard godkänner listan och svarar på frågorna (kommentar på #644).
2. Första pull requesten med data rättar Krim (fall 1) och lägger in noterna för `ukraina`, `ryska-federationen`, `israel`, `indien` och `pakistan`. Källorna läggs då in i `data/sources.json`, och noterna visas på Om källorna.
3. Därefter staterna i omgångar om cirka tio, störst lucka först enligt `tools/tackning_riken.py`; varje land i listan ovan får sin not när det läggs in.
4. Hållningarna kontrolleras igen vid varje release som rör nutida gränser, och kontrolldatumet uppdateras.
