# historiker (del A): granskning före v6.5.0

Jämförelse: `1a981da0..HEAD` (HEAD = 1bd96bae, som bara lägger till version.json ovanpå 1cc19f79 i briefen). Bara läsning; inga filer i repot ändrade. (`tools/tackning.py` skriver som standard `docs/granskningar/tackning-<datum>.md`; filen flyttades direkt till scratchpad, och `git status` är ren.)

## Omfattning och stickprov
- **Nya händelser (19):** jämförde id-listan i `data/events.json` med `git show 1a981da0:data/events.json` (1481 → 1500 händelser, inga borttagna). Jag läste alla 19 i sin helhet: titel, sammanfattning, not, källor, start/slut/edtf och astronomisk omräkning. För 13 av dem öppnade jag källsidan: alla 13 mellan -9999 och 0 samt Sundaland bland de äldre. De 5 andra äldre (Fa-Hien, Sutlej, Jerimalai, Maninjau, Batur) kontrollerade jag bara mot formeln år = 1950 − BP; de hör till `forhistoriker`.
- **Ändrade händelser:** 166 ändrade `image`, varav 64 helt nya bilder. Övriga bildändringar gäller bara bildtexter på fr/de/es/en. Ingen `kind`, fil eller licens har ändrats på äldre bilder. I svenskan har `summary` ändrats på 5 händelser, `note` på 2 och `end`/`edtf` på 1 (alla från #1704). Inga ändringar i svenska `title`, `place`, `location`, `sources` eller `review`.
- **Bilder:** jag läste bildtext, kredit, licens, `kind` och källpost för alla 64. Licensen jämfördes med Commons-filsidan (API:t extmetadata, plus en filsida öppnad direkt) för **40 av 47 Commons-bilder**. Alla 64 finns i `images/licenses.json` med samma licens, och alla filer är under 150 kB. Jag tittade på 3 bilder: de två AI-illustrationerna och Nzinga. Library of Congress (15 bilder) gav 403, se "Ej kontrollerat".
- **Fun facts, missuppfattningar, teman:** bara franska texter är ändrade (13 fun facts, 2 missuppfattningar, temat Teknik). Siffrorna i franskan stämmer med svenskan i alla 13 fun facts.
- **Turer:** svenska ändringar finns bara i `det-har-har-du-hort.json` (styckesindelning, Mingmuren med linje och foto) och i lärartexten i `andra-varldskriget.json`. Övriga turfiler har bara ändringar i es/fr eller fältet `audience`.
- **Resor:** jag läste ändringarna i cook, ibn-battuta, magellan och zheng-he. Columbus har inga ändringar i svenskan.
- **#1704 och #1707:** varje punkt jämförd med data i HEAD.
- **Stickprov mot öppnad källa:** 58 påståenden, se de enskilda punkterna.

## Blockerande
Inga.

## Bör rättas
1. **AI-illustrationen `al-bakri-beskriver-ghana` lägger till detaljer som källan inte stöder, och delvis tvärtom mot källan.**
   - **Bilden:** köpmansstaden har moskéer med kupoler och många smala minareter, medan kungens stad är en kupollös borg av sten.
   - **Källan:** https://en.wikipedia.org/wiki/Koumbi_Saleh säger att al-Bakri beskriver kupolbyggnader i *kungens* stad och att husen var "of stone and acacia wood". Varken al-Bakri eller utgrävningen nämner minareter.
   - **Regel:** CLAUDE.md, Bilder p. 3: "Lägg inte in detaljer i bilden som inte stöds av händelsens källa."
   - **Varför inte blockerande:** bilden är märkt som illustration.
   - **Förslag:** gör om prompten för hand enligt docs/bilder-ai-illustrationer.md. Ta bort minareter och kupoler från köpmansstaden, eller välj ett landskap utan arkitekturdetaljer. Agenter kan inte göra bilden. Ägare: människa med ChatGPT plus Claude Code (prompt och bildtext).
2. **`vaxtresterna-i-spirit-cave`: sammanfattningen säger mer än källan.**
   - **Texten:** "omkring 9800–8500 f.Kr. i okalibrerade radiokolår" (alla fem språk).
   - **Källan:** https://en.wikipedia.org/wiki/Spirit_Cave_(Thailand) anger växtlagren till "roughly 9,800–8,500 years BCE" men säger inte om de är kalibrerade. "Uncalibrated radiocarbon years ago" står bara om hela boplatsens tid, 12 000–7 000 år sedan.
   - Noten säger det delvis, men sammanfattningen påstår det som fakta.
   - **Förslag:** "omkring 9800–8500 f.Kr. (källan säger inte om åren är kalibrerade)". Ägare: Claude Code (Opus), med översättningarna i samma PR.

## Smått
- **`slaget-vid-tondibi` (AI-illustration):** baneren har stjärnmotiv, röda för den ena hären och gula för den andra. Källan säger inget om fanor. Bilden har en tydlig illustrationstext, så detta är lågt prioriterat. Går det, ta bort fanorna vid nästa omtag.
- **`utbrotten-i-ksudach`:** "bildade den yngsta kalderan". Wikipedia (https://en.wikipedia.org/wiki/Ksudach) säger "produced Caldera V", den sista i numreringen, men använder inte ordet "yngsta". Det går att läsa ut, men "den femte och senaste kalderan" ligger närmare källan.
- **Kaukasiska Iberien, `christianSince` 337 (#1704 p. 2):** https://en.wikipedia.org/wiki/Christianization_of_the_Kingdom_of_Iberia anger förslag mellan 312 och 337, och 326 föredras. Valet av det senaste förslaget är motiverat i PR #2138, men det står ingen "källorna skiljer sig" i själva registret. Bör fångas i rikets eller religionens faktaruta om fältet syns där.
- **Bildlicenser:**
  - `tarikh-al-sudan` anges som CC BY-SA 4.0, och filsidan har både PD-märken och CC BY-SA 4.0 (kontrollerat). Det är korrekt men strängare än nödvändigt; ingen åtgärd behövs.
  - `slaget-vid-issos`: Commons extmetadata visar "Public domain" (mosaiken), och bildtexten anger fotot som CC BY-SA 3.0 och mosaiken som PD. Det är rimligt.

## Kontrollerat utan anmärkning
**Nya händelser, källa öppnad (13):**
- `ris-i-lahuradewa`: Sant Kabir Nagar; sjunde årtusendet f.Kr. = -6999/-6000; Habib, fyra av fem dateringar 4220–2879 f.Kr.; Fuller, vilt ris och gammalt trä. Källa: https://en.wikipedia.org/wiki/Lahuradewa
- `havet-fyller-palksundet`: 120 m; omkring 7 000 år sedan; fall från omkring 5 000 år sedan; studien om lokal landhöjning; 11 700 BP = -9750. Källa: https://en.wikipedia.org/wiki/Adam%27s_Bridge
- `vaxtresterna-i-spirit-cave`: Gorman i mitten av 1960-talet; omkring 12 släkten med Areca och Piper; Higham och Thosarat "no grounds"; krabbklor 7850–6500 f.Kr. (2021); harts omkring 1400 f.Kr. (2003); Solheim; Pang Mapha och Mae Hong Son.
- `natet-fran-antrea`: 1913; vide; 31 sänken och 18 flöten; 8540 f.Kr. = -8539; Ancylussjön; 27–30 m; 1,3–1,5 m; lax och braxen. Källa: https://en.wikipedia.org/wiki/Antrea_Net
- `saimen-bryter-igenom-salpausselka`: omkring 5000 BP; Ladoga steg 1–2 m; meningen saknar egen källhänvisning, vilket noten säger. Källa: https://en.wikipedia.org/wiki/Vuoksi
- `kamkeramikernas-byteshandel`: 4200–2000 f.Kr.; Finnmark–Weichsel; asbest, skiffer, bärnsten och flinta; kalibrerat 5600–2300 f.Kr. Källa: https://en.wikipedia.org/wiki/Comb_Ceramic_culture
- `gravfaltet-i-naltjik`: 121 gravar; 5000/4800 cal BC; utgrävt 1929; två bevarade gravar; jägare från Kaukasus och Östeuropa plus PPN-bönder i Västasien; de två motstridiga dateringarna av Progress 2 finns verkligen i källan. Källa: https://pmc.ncbi.nlm.nih.gov/articles/PMC11576401/
- `majkopkurganen`: omkring 10 m; Veselovskij 1897; tjurfigurer i guld och silver; två kvinnogravar; Eremitaget; Anthony 3700–3100 f.Kr. Källa: https://en.wikipedia.org/wiki/Maikop_kurgan
- `vagnshjulen-i-novokorsunskaja`: två massiva trähjul; "second half of the fourth millennium" = -3499/-3000 är rätt omräknat; "some of the earliest wagon wheels"; 3950–2980 calBC. Källa: https://en.wikipedia.org/wiki/Maykop_culture
- `salfangst-vid-bajkalsjon`: lager VII 9020–8650 cal BP = -7070/-6700; 94–98 % säl omkring 6750–4870 cal BP; flest på våren; 82,8 %; omkring 700 år gammalt kol; Bugulʹdejka II omkring 40 km SV. Källa: https://pmc.ncbi.nlm.nih.gov/articles/PMC4444006/
- `havet-bryter-igenom-vid-berings-sund`: omkring 11,5 ka och 11–11,5 ka; 13,3 ka; sänkning eller stillastående; yngre dryas som hypotes; tröskeln 65,5° N 168,7° V stämmer med punkten. Källa: https://pmc.ncbi.nlm.nih.gov/articles/PMC7043918/
- `hundarna-pa-zjochovon`: 6000 f.Kr. (Pitulʹko); slädmede; isbjörn och ren; Grimm 2017. Hundbenen och 9 524 BP kommer ur Sinding 2020, som jag inte har öppnat. Källa: https://en.wikipedia.org/wiki/Zhokhov_Island
- `utbrotten-i-ksudach`: stratovulkan; fem ras, tre under holocen; 8700–8800, 6100 och 6000 BP; 240 e.Kr.; 8800 och 6000 BP = -6850 och -4050. Källa: https://en.wikipedia.org/wiki/Ksudach

**Övrigt:**
- `havet-dranker-sundaland`: "starting around 18,000 years ago … until about 5000 BC" = -16050/-4999; 120 m. Källa: https://en.wikipedia.org/wiki/Sundaland
- Alla 19 nya händelser har `source-checked`, ingen har `two-sources`. Noter med "Källorna skiljer sig" och "En källa" används öppet. Siffrorna i en/de/es/fr är desamma som i svenskan (maskinell jämförelse; "sjunde årtusendet" = "7th millennium").
- **Från #1704, kontrollerat i källan:**
  - Basel: "most significant", 6,0–7,1, omkring 300 döda, 30 km. Källa: https://en.wikipedia.org/wiki/1356_Basel_earthquake
  - Baiae: andra fasen "a century later" efter 200–400-talen, så `end` 600 är rimligt. Källa: https://en.wikipedia.org/wiki/Baiae
  - Teouma: "demonstrates a ceremonial culture" och 3 110–2 710 år (https://en.wikipedia.org/wiki/Teouma). De tre kranierna står i https://en.wikipedia.org/wiki/Lapita_culture, som också finns bland källorna.
  - Zheng He, Cuilanxu: "anchored for three days due to the unfavorable winds and waves", "probably the Great Nicobar Island". Källa: https://en.wikipedia.org/wiki/Ming_treasure_voyages
  - Ibn Battuta: Mecka 1327–1330 och "may have left after the 1328 hajj"; Kap Guardafui; Astrachan till Sarai al-Jadid; Sri Lanka, Madurai, Maldiverna och Chittagong; 12 september 1333. Källa: https://en.wikipedia.org/wiki/Ibn_Battuta
- **Mingmuren:** "Ming dynasty (1368–1644)" och att de mest kända delarna byggdes av Ming stämmer (https://en.wikipedia.org/wiki/Great_Wall_of_China). Källrepot för linjen är MIT-licensierat, och README:n säger att Liaodong-delen är "not very accurate" (https://github.com/Adl3rAi/The-Great-Wall-of-China-geodata). MIT är beslutat i docs/beslut/2026-11-16-muren-som-linje-1785.md. README:n säger inte att linjen är "handritad"; det står bara i repots titel i vår sources.json, så det är ett antagande.
- **Bildtexternas tidsavstånd stämmer med årtalen:**
  - Thermopyle 1814 mot 480 f.Kr. ≈ 2 294 år
  - Issos omkring 100 f.Kr. mot 333 f.Kr. > 200 år
  - Narva 205 år
  - Karl XII 111 år
  - Lund 7–8 år
  - Kapkolonin omkring 199 år
  - Freetown 11 år
  - Kairo 1867–1899 mot 970–972 ≈ 900 år
  - Austerlitz 5 år
  - Wilson 2 april → 6 april 1917, vilket stämmer med händelsen
- **Europeiska avbildningar och propaganda är märkta:** Nzinga ("gjordes i Europa långt efter hennes död och visar inte hur hon såg ut"), Kapkolonin ("europeisk tolkning"), Tsingtao ("samtida propagandabild"), Tanga ("en bild från den ena sidan"), Sarajevo ("inte en ögonvittnesbild"). Respektreglerna följs: Auschwitz-bilden har en lärartext i turen.
- **Commons-licenser som stämmer med repot (40 filer):**
  - Thermopyle, Issos, Lothal, Cahokia, Hawaii, Tripitaka, Jikji, järnpelaren
  - Narva, Karl XII, Kapkolonin, Fort Jesus, Nzinga, Gondar, Agadez, Harar, Tarikh, Rodrigues, Skånska kriget, Lund
  - Tiangong, blåbocken, Rosetta, Freetown, Sankore, Austerlitz (2), Nya Zeeland
  - Sarajevo, Tannenberg, Tanga, Kut, Jylland, Somme, Compiègne 1918, Polen, Frankrike 1940, Spitfire, Barbarossa, Pearl Harbor

## Möjliga sakfel till andra experter
- **`geograf`:** `data/ortnamn/sverige.json` saknar fortfarande Visby men har Brest, Smolensk och Jelgava. Det är #1707 p. 10; #1689 är stängt utan att Visby kom med. Det är en fråga om urval och kan vara avsiktligt (60-gränsen).
- **`forhistoriker`:** resten av #1704 (minsta åldrar i edtf för florisbad, apidima, omo-kibish, leang-karampuang och gabarnmung, Ranis som spann, istidskustens -79300) är oförändrat och ligger i öppna #2137. Redan känt.

## Status för #1704 och #1707
- **#1704 (stängt av PR #2138):**
  - Punkterna 1, 3, 4, 5, 6, 7, 9, 10, 12 och 14 är rättade i data. Kontrollerat: Vinkovci-noten, Basel, Uripiv 850–550, Baiae 600, Teouma-noten, `wp-code-of-jutland` → Codex_Holmiensis, Magellans dateLabel för Homonhon, Sydney-texten och Kebara i spridningen.
  - Punkt 2: Iberia satt till 337, se Smått.
  - Punkterna 8 och 11: var redan rättade.
  - Punkterna 13 och 15 samt en del av 14: flyttade till öppna #2137 (redan känt).
  - Durman lades inte till som källa, eftersom källan inte gick att öppna. Noten säger det öppet, vilket följer policyn.
- **#1707 (stängt):**
  - Rättat: Cook 70,68° N, Ibn Battutas linjer via Guardafui, Astrachan, Sarai, Sri Lanka och Chittagong (Tunis–Alexandria längs kusten), Zheng He ("Kina (markören i Nanjing)", Cuilanxu, Quanzhou 118,6), `kungariket-cusco` ("Kungariket Cusco") och `yngre-dryas` med `scope: "wide"` (#1806).
  - Kvar: Nuuk (motiverat i issuet), Ven (låg prioritet) och Visby (se ovan).

## Luckor (saknas)
Måttet kommer ur `python3 tools/tackning.py` (2026-11-21, 1500 händelser), och kandidaterna ur öppnade källor. Inget av detta blockerar releasen.
1. **Förhistoria i Afrika och Amerika är fortfarande de största relativa luckorna.**
   - **Måttet:** plats 1 och 2 i verktygets topplista, med Amerika 21 händelser mot "väntat" 181 och Afrika 32 mot 129.
   - **Slagsida i releasen:** alla 19 nya händelser ligger i Asien, Europa (Finland, Kaukasus), Sibirien och Berings sund. Ingen ligger i Afrika eller Sydamerika.
   - **Spannet 10 000–3000 f.Kr.** täcks redan av #1962 (redan känt).
   - **Före 10 000 f.Kr.** saknas till exempel följande, enligt https://en.wikipedia.org/wiki/Settlement_of_the_Americas och https://en.wikipedia.org/wiki/Prehistory_of_Africa. Inget av dem finns i `data/events.json`, `data/handelser/` eller `data/utkast/`, och jag hittade inget öppet issue.
     - Paisley Caves (koproliter omkring 14 300 år)
     - Meadowcroft (minst 16 000 år)
     - Buttermilk Creek (15 500 år)
     - Chiquihuite (26 000 år, omstritt)
     - Pinnacle Point (värmebehandlad silkret omkring 72 000 år)
     - Affad 23 i Sudan (omkring 50 000 år)
   - **Precis efter 10 000 f.Kr.:** Nataruk (omkring 10 000 år sedan, 27 döda), som hör till #1962.
   - **Förslag:** nytt täckningsissue "förhistorien i Afrika och Amerika före 10 000 f.Kr.", eller utvidga #1962.
2. **Kategorin klimat är tom i tidigmodern tid (1501–1799) i alla världsdelar (0).**
   - https://en.wikipedia.org/wiki/Little_Ice_Age anger lilla istiden "conventionally … from the 16th to the 19th centuries", Themsens frostmarknader 1608–1814 och Laki 1783.
   - Ingen händelse om lilla istiden eller Laki finns, och inget öppet issue gäller dem (#1336 är stängt).
3. **Kategorin människan är 0 från 1501 till i dag i alla världsdelar,** och natur och vetenskap är nästan tomma efter 1800. Detta är bara mätt, och jag har inte källsökt kandidater. Att tolka det som urval eller kategoriregel kräver ett beslut.
4. **Krig mot övrigt:** 50 % i tidigmodern tid och 56 % på 1800-talet i datat (27 % på globen utan slagen som bara syns i Fokus). Andelen är oförändrat hög. Asien på 1800-talet har 77 % (56 % på globen), och fun facts i Asien under 1900-talet och 2000-talet ligger på 2 % och 0 %.
5. **Riken:** inga riken i Amerika eller Oceanien under antiken (0) och inga i Oceanien under medeltiden (0) enligt måttet. Det hör till `geograf` och riksspåret, och jag har inte källsökt det.

## Ej kontrollerat
- **Library of Congress:** loc.gov svarade med 403 eller Cloudflare-sidan "Just a moment" både för WebFetch och för JSON-API:t. Licensen ("No known restrictions") har jag därför inte kunnat kontrollera för de 15 LoC-bilderna:
  - kairo-grundas, amerikanska-frihetskriget, slaget-vid-saratoga, belagringen-av-yorktown
  - amerikanska-inbordeskriget, slaget-vid-fort-sumter, kapitulationen-vid-appomattox, mexikansk-amerikanska-kriget
  - forsta-varldskriget, forsta-slaget-vid-marne, belagringen-av-tsingtao, gallipolifalttaget
  - usa-gar-in-i-forsta-varldskriget, freden-i-brest-litovsk, xinhairevolutionen

  Bör kontrolleras av någon med åtkomst innan releasen, eller räknas som okontrollerat här.
- **Commons, 7 filer:** sidorna för Midway, El Alamein, D-dagen, Auschwitz, Keitel, atombomberna och Shigemitsu gav 429 och prövades inte igen.
- Sinding m.fl. 2020 (Zjochov, 9 524 BP), Kamennogorsk-artikeln (nät av nässla) och Kierikki-artikeln har jag inte öppnat.
- De 5 äldsta nya händelserna (Fa-Hien, Sutlej, Jerimalai, Maninjau, Batur) är bara kontrollerade för omräkningen från BP, inte mot källan. Det är `forhistoriker`s del.
- Bara 3 bilder är granskade visuellt. Övriga 61 bildtexter är jämförda med filsidornas beskrivning, inte med själva bilden.
