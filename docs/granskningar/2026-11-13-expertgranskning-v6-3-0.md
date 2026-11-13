# Expertgranskning före v6.3.0

**Datum:** 2026-11-13
**Underlag:** allt som ändrats mellan `production` (v6.2.0) och `main` (22816725): 235 commits och 306 filer. Öppna PR #1371 (tidsfönstret i förhistorien) och #1372 (avrundade årtal) är också granskade.
**Regel:** [beslut 2026-11-10](../beslut/2026-11-10-expertgranskning-fore-release.md) och [luckor](../beslut/2026-11-10-expertgranskning-luckor.md). Experterna har inte ändrat några filer. Det som rättades före releasen gjordes av Claude Code i den pull request som lägger till den här rapporten.

## Experter som kördes

| Expert | Område | Blockerande fynd |
|---|---|---|
| `historiker` | händelser, turer, riken, flaggor, källor | 1 (Lister), rättat |
| `forhistoriker` | förhistorien 100 000–3000 f.Kr., människoarter | 0. Avrundningen räckte inte, och #1372 är kompletterad |
| `geograf` | riken, flaggor, platser, datumlinjen | 1 (Ptolemaiska riket), rättat |
| `larare` | turer, quiz, lektioner, tilltal | 1 (tilltal i turen "Hur vet vi det här?"), DasKrokodil avgör |
| `sprak-en` | engelska | 0 |
| `sprak-de` | tyska | 1 (engelska rikesnamn kvar), rättat |
| `sprak-es` | spanska | 0 |
| `sprak-fr` | franska | 0 |
| UX (`ux-tillganglighet`) | genomgång i dator och mobil | se avsnittet UX |

## Rättat före releasen

1. **`lister-antiseptik`** (historikern). Texten sade att Lister den 12 augusti 1865 "för första gången" behandlade en patient med karbolsyra. Enligt källan (https://en.wikipedia.org/wiki/Joseph_Lister, öppnad 2026-11-13) misslyckades ett försök i början av mars 1865, ett andra gjordes den 21 mars, och den 12 augusti lyckades det för första gången. Rättat på fem språk: "lyckades … för första gången … efter två försök i mars samma år som inte lyckades".
2. **`ptolemaiska-riket`** (geografen). Cliopatria lägger posten "Ptolemaic Kingdom" på 332–325 f.Kr. och täcker då Alexanders erövringar ända till Indus, medan "Macedonian Empire" samma år bara är Makedonien. Enligt Wikidata (Q2320005, kontrollerad av geografen) fanns riket 305–30 f.Kr. De två perioderna före 305 f.Kr. är borttagna, och starten är klippt till 305 f.Kr. i datan och i `tools/riken.py` (`years`), så att en ombyggnad inte tar tillbaka felet. Följden är att Alexanders erövringar saknar rike på kartan 332–325 f.Kr. Det är hellre tomt än fel namn. Att fylla luckan är ett eget ärende.
3. **Tyska rikesnamn som stod kvar på engelska** (`sprak-de`):
   - Södra Song: "Südliche Song-Dynastie", som tyska Wikipedia (Song-Dynastie) skriver.
   - Väst- och Östturkiska khaganatet: "Westliches Türk-Kaganat" och "Östliches Türk-Kaganat", som tyska Wikipedia (Göktürken) skriver.
   - Rashidunkalifatet: "Kalifat der Raschidun".
   - De västra regionernas protektorat: "Protektorat der Westlichen Regionen".

   Rashidunkalifatet och protektoratet har ingen egen artikel på tyska Wikipedia, och Wikidata saknar tyskt namn. Där är namnen översättningar som följer tyska Wikipedias ord ("al-chulafa ar-raschidun", "Westlichen Regionen").
4. **Förhistoriens årtal** (förhistorikern): #1372 avrundar nu även 10 000–3000 f.Kr. till hundratal, eftersom ett steg på reglaget är hundratals år i hela segmentet.

## DasKrokodil avgör före releasen

- **Tilltalet i turen `hur-vet-vi-det-har`** (läraren). PR #1290 (#839) bytte till artigt tilltal på de, es och fr, med motiveringen att turen inte har någon lektion för åk 4–6. Det strider mot [beslut 2026-11-08, tur 938](../beslut/2026-11-08-tur-kallkritik-938.md) punkt 2: turen är för cirka 12–13-åringar och ska ha du-form i alla språk. Svenskan har fortfarande du-form. Antingen återställs de nio texterna till du/tú/tu och raden i ordlistan rättas, eller så skrivs ett nytt beslut som ersätter punkt 2.

## Bör rättas (blockerar inte, blir issues)

- **Historikern:**
  - `finlay-gula-febern`: källans brödtext anger International Sanitary Conference 1881, en fotnot anger Havanna. Det bör stå i en `note`.
  - `commons-flagga-skane` och `commons-landskapsvapen-skane` finns i `sources.json` men används inte.
  - `koch-tuberkelbakterien`: "Tyska fysiologiska sällskapet" ska kontrolleras mot källan (sprak-en: vanligen Physiological Society of Berlin).
- **Förhistorikern:**
  - Afrika saknas i förhistorien (en händelse före 3000 f.Kr.), och Homo sapiens finns inte som händelse.
  - `neandertalare` och `denisovaner` är punkter utan `locationPrecision`, medan `gua-dagang-arkaisk-manniska` har `region`.
  - `data/perioder.json`: anteckningen säger att tidslinjen börjar 3000 f.Kr.
  - `neandertalare`: "alla nu levande människor utanför Afrika" bör bli "alla som hittills undersökts" (Sumer 2025).
- **Geografen:**
  - `danmark-1815` överlappar `kungariket-island` 1918–1921.
  - Danmarks medalj och namn hamnar på Island 1814–1921, samma fel som #1189 rättade.
  - `danmark-norge` börjar 1526, men Wikidata anger 1536, och skillnaden syns inte för besökaren.
  - Tjeckiens flagga ska gälla från 1993.
- **Läraren:**
  - Turer-menyn visar inte vilken målgrupp källkritikturerna har.
  - Quizets "Sant eller myt?" har alltid svaret myt.
  - Lgr22:s rubrik "Samhällsomvandlingar" saknas i `perioder.json`.
- **Språken:**
  - **en:** "put to sleep" i `hanaoka-narkos-1804` och `eterdagen-1846` (betyder också avliva) och "New Kingdoms". Två formuleringar i `vad-vet-vi-egentligen`.
  - **de:**
    - "das deutsch besetzte Polen" ska vara "im deutsch besetzten Polen" (Auschwitz).
    - Västra Xia ska heta "Westliche Xia".
    - "Völkerwanderung".
    - "Zur Zeit" ska bli "Zur Datierung".
    - Flaggetiketterna.
  - **es:**
    - Rikesnamn med liten begynnelsebokstav (22 st).
    - "cayó" i stället för "murió" (Karl XII).
    - Kommat i "Quien informa, se ve".
    - Två översättningar av "Källorna skiljer sig".
  - **fr:**
    - Vanligt mellanslag i stället för hårt före `: ? ; »`.
    - "calque" och "couche" om vartannat.
    - "dans un rayon de" om en tid.
    - Heftaliterna ska heta "Hephtalites".
    - Versaler i rikesnamn.
    - Lgr22 utan förklaring.

## UX

Förhandsversionen dev.historiagloben.se ligger bakom Cloudflare Access och går inte att nå från molnmiljön. Genomgången gjordes därför mot samma kod (`main`) på en lokal server. Resultatet förs in i release-PR:en.

## Luckor (saknas)

Mätt med `python3 tools/tackning.py --ut -` och öppnade källor, inte ur minnet:
- **Förhistorien:** Amerika har 0 händelser, Afrika 1, Europa 1 och Oceanien 1 före 3000 f.Kr. Homo sapiens i Afrika och Europa saknas, liksom jordbrukets centra utanför Mellanöstern.
- **Riken som finns i Cliopatria men inte hos oss:**
  - Amerika före 1429: olmeker, zapoteker, Teotihuacan, mayastaterna, tolteker och Chimú.
  - Afrika: Kongoriket, Funj, Oyo och Asante.
  - Danska kolonier: Grönland 1734–1940 och Danska Indien.
- **1900-talet:** hälsa i Asien saknas helt (förslag med källa: Tu Youyou och artemisinin 1972). Andelen krig är 84 % i Asien och 81 % i Afrika. Religion och upptäckter har 0 händelser.
- **Skolan:** lärarfält finns bara i två turer. Kolonisation och slavhandel, industrialiseringen och kalla kriget saknar lektion för åk 7–9.

## Att veta till nästa granskning

`tools/tackning.py` skriver som standard över `docs/granskningar/tackning-<datum>.md`. Använd `--ut -` vid granskning.
