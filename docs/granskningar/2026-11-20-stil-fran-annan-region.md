# Bildstil från en annan del av världen (#1397)

**Datum:** 2026-11-20 · **Underlag:** `data/events.json`, `data/styles.json` och `style_for()` i `tools/bildpromptar.py`. Allt nedan är mätt ur data och regler, inget är hämtat ur minnet.

## Frågan

Faktarutans ram följer **grundstilen** för händelsens år (`frame` i `data/styles.json`), och grundstilarna för 3000 f.Kr. och framåt kommer från Egypten, Grekland och Rom, Bysans och Irland, och därefter Europas konsthistoria. En regional stil (`regions` i filen) kan ge en egen stil, men har hittills bara varit en bildstil: ramen togs ändå från grundstilen. Fallet som hittades i #1383 var `orakelben-skrift` (Kina, −1253) som fick den egyptiska ramen. Listan visar vilka andra händelser med bild som har samma lucka.

## Metod

1. Alla händelser med fältet `image` (**241** st, oavsett `kind`) ställs mot `style_for()`. De som redan får en regional stil räknas bort.
2. Kvar blir händelser vars stil är en av grundstilarna `egypten`, `antik`, `tidig-medeltid`, `medeltid`, `renassans`, `barock`, `1800-tal`. De är grundstilar vars bildspråk (se `prompt`) är egyptiskt, grekiskt och romerskt, bysantinskt och insulärt eller europeiskt. Grundstilarna `grotta`, `affisch` och `rymdalder` räknas inte, eftersom de inte är knutna till en världsdel.
3. Händelser vars plats ligger i ett grovt "hemområde" för de stilarna (Europa, Nordafrika och Främre Orienten: longitud −25 till 60, latitud 12 till 72) räknas bort (66 st). Resten (53 st) ligger i en annan del av världen.
4. Kolumnen "Region med egen stil" visar om platsen ligger i en av rutorna i `regions` som har en regional stil under en annan tid. Av 53 har 21 det. Där finns alltså en stil som skulle passa men som inte gäller för just det året (tidsluckan). De 32 andra ligger i en del av världen som saknar regional stil helt.

Begränsningar: rutorna i `regions` är grova (ett fåtal är rektanglar över flera länder), hemområdet är en grov ruta, och "knuten till en världsdel" är en bedömning av stilarnas `prompt`, inte en mätning. För `kind: historisk` (riktiga foton) är det bara ramen som påverkas; för `illustration` påverkas också promptarna. Listan är ett underlag, inget förslag på ändring.

## Sammanfattning

| Grundstil som gäller | Antal händelser |
|---|---|
| Egyptisk väggmålning och papyrus (`egypten`) | 4 |
| Grekisk vasmålning och romersk mosaik (`antik`) | 5 |
| Bysantinsk ikon och insulär bokmålning (`tidig-medeltid`) | 7 |
| Illuminerad handskrift (`medeltid`) | 12 |
| Träsnitt och kopparstick (`renassans`) | 6 |
| Barock oljemålning och gravyr (`barock`) | 4 |
| Litografi och tidningsgravyr (`1800-tal`) | 15 |
| **Summa** | **53** |

Orakelbenen (`orakelben-skrift`) är rättade i #1397 med den nya regionstilen `kina-brons` och ingår därför inte i listan.

## A. Platsen ligger i en region med egen stil, men inte under det här året

| Händelse | År | Plats | Typ | Grundstil | Region med egen stil |
|---|---|---|---|---|---|
| `caral` | 2600 f.Kr. | Caral i Supedalen, Peru, 182 km norr om Lima | historisk | `egypten` | `anderna` |
| `mohenjo-daro` | 2500 f.Kr. | Mohenjo-daro vid nedre Indus, Sindh, Pakistan | historisk | `egypten` | `persien-indien-osmanska`, `indien` |
| `lapitafolket-nar-samoa` | 1000 f.Kr. | Mulifanua, Samoa | historisk | `egypten` | `stilla-havet` |
| `nazcalinjerna` | 500 f.Kr. | Nazcaöknen mellan Nazca och Palpa (i dag Peru) | historisk | `antik` | `anderna` |
| `tikal-vaxer-fram` | 400 f.Kr. | Tikal i Petén (i dag Guatemala) | historisk | `antik` | `mexiko` |
| `teotihuacan-solpyramiden` | 200 | Teotihuacan nordost om Mexico City (i dag Mexiko) | historisk | `antik` | `mexiko` |
| `tiwanaku` | 375 | Tiwanaku nära Titicacasjön (i dag Bolivia) | historisk | `antik` | `anderna` |
| `mayastadernas-nedgang` | 701 | Mayaländernas södra lågland (här Tikal) | historisk | `tidig-medeltid` | `mexiko` |
| `chichen-itza` | 750 | Chichén Itzá på Yucatánhalvön (i dag Mexiko) | historisk | `tidig-medeltid` | `mexiko` |
| `chan-chan` | 850 | Chan Chan vid Mochedalens mynning (i dag Peru) | historisk | `tidig-medeltid` | `anderna` |
| `sagan-om-genji` | 1000 | Kejsarhovet i Heian-kyō (Kyoto), Japan | historisk | `tidig-medeltid` | `japan` |
| `brihadisvaratemplet` | 1003 | Thanjavur i Tamil Nadu, Indien | historisk | `medeltid` | `persien-indien-osmanska`, `indien` |
| `sjoslaget-vid-dan-no-ura` | 1185 | Dan-no-ura i Kanmonsundet vid Shimonoseki | historisk | `medeltid` | `japan`, `korea` |
| `haamonga-a-maui` | 1200 | Niutōua på östra Tongatapu (i dag Tonga) | historisk | `medeltid` | `stilla-havet` |
| `polynesier-nar-aotearoa` | 1250 | Aotearoa (Nya Zeeland) | historisk | `medeltid` | `stilla-havet` |
| `stora-buddha-i-kamakura` | 1252 | Kōtoku-in i Kamakura, Japan | historisk | `medeltid` | `japan` |
| `tyfonen-kamikaze-1281` | 1281 | Kyushus nordvästkust, bland annat Imaribukten | historisk | `medeltid` | `japan`, `korea` |
| `tasman-och-maori-i-mohua` | 1642 | Golden Bay / Mohua på Sydöns nordspets (i dag Nya Zeeland) | historisk | `renassans` | `stilla-havet` |
| `slaget-vid-ayacucho` | 1824 | Pampa de Ayacucho vid Quinua, Peru | historisk | `1800-tal` | `anderna` |
| `texas-sjalvstandighet` | 1836 | Washington-on-the-Brazos, Texas | historisk | `1800-tal` | `mexiko` |
| `belagringen-av-delhi-1857` | 1857 | Delhi | historisk | `1800-tal` | `persien-indien-osmanska`, `indien` |

## B. Platsen ligger i en del av världen utan regional stil

| Händelse | År | Plats | Typ | Grundstil | Region med egen stil |
|---|---|---|---|---|---|
| `mammutar-wrangel` | 3000 f.Kr. | Wrangelön, Sibirien | illustration | `egypten` | – |
| `klippkonsten-vid-ubirr` | 1 f.Kr. | Ubirr i Kakadu nationalpark (i dag Northern Territory, Australien) | historisk | `antik` | – |
| `borobudur-byggs` | 780 | Borobudur, centrala Java, Indonesien | historisk | `tidig-medeltid` | – |
| `diamantsutran-trycks` | 868 | Hittad i Mogaogrottorna vid Dunhuang, Kina | historisk | `tidig-medeltid` | – |
| `latte-stenar-pa-marianerna` | 900 | Marianerna, bland annat Guam (i dag Guam och Nordmarianerna, USA) | historisk | `tidig-medeltid` | – |
| `lanse-aux-meadows` | 1021 | L'Anse aux Meadows, Newfoundlands nordspets, Kanada | historisk | `medeltid` | – |
| `angkor-wat` | 1113 | Angkor, Kambodja | historisk | `medeltid` | – |
| `nan-madol-byggs` | 1180 | Nan Madol vid Pohnpei (i dag Mikronesiens federerade stater) | historisk | `medeltid` | – |
| `mesa-verdes-klippbostader` | 1190 | Mesa Verde i Colorado (i dag USA) | historisk | `medeltid` | – |
| `stora-zimbabwe` | 1201 | Stora Zimbabwe, nära Masvingo, Zimbabwe | historisk | `medeltid` | – |
| `moai-rapa-nui` | 1250 | Rapa Nui (Påskön), Chile | historisk | `medeltid` | – |
| `columbus` | 1492 | San Salvador, Bahamas (troligast) | illustration | `renassans` | – |
| `jamestown-1607` | 1607 | Jamestown, Virginia, USA | historisk | `renassans` | – |
| `batavia-1619` | 1619 | Jayakarta, i dag Jakarta, Indonesien | historisk | `renassans` | – |
| `batavia-forliser` | 1629 | Houtman Abrolhos utanför Västaustraliens kust (i dag Australien) | historisk | `renassans` | – |
| `harvard` | 1636 | Cambridge, Massachusetts | illustration | `renassans` | – |
| `dronten-sista-gangen` | 1662 | Mauritius i Indiska oceanen | historisk | `barock` | – |
| `cook-nar-australien` | 1770 | Botany Bay, Australien | historisk | `barock` | – |
| `sjalvstandighetsforklaringen` | 1776 | Pennsylvania State House (Independence Hall), Philadelphia | historisk | `barock` | – |
| `forsta-flottan-sydney` | 1788 | Sydney Cove, Port Jackson, Australien | historisk | `barock` | – |
| `haitis-sjalvstandighet` | 1804 | Gonaïves, Haiti | historisk | `1800-tal` | – |
| `lincoln-fods` | 1809 | LaRue County, Kentucky, USA | historisk | `1800-tal` | – |
| `tambora-1815` | 1815 | Vulkanen Tambora på Sumbawa, Nederländska Ostindien (i dag Indonesien) | historisk | `1800-tal` | – |
| `myall-creek-massakern` | 1838 | Myall Creek, New South Wales, Australien | historisk | `1800-tal` | – |
| `burke-och-wills-expedition` | 1860 | Royal Park, Melbourne (Australien) | historisk | `1800-tal` | – |
| `slaget-vid-gettysburg` | 1863 | Gettysburg, Pennsylvania | historisk | `1800-tal` | – |
| `slaveriet-avskaffas-i-usa` | 1865 | USA (kongressen i Capitolium, Washington) | historisk | `1800-tal` | – |
| `slaget-vid-tuyuti` | 1866 | Tuyutí i södra Paraguay | historisk | `1800-tal` | – |
| `telefonen` | 1876 | Boston, USA | illustration | `1800-tal` | – |
| `slaget-vid-isandlwana` | 1879 | Isandlwana, Zuluriket (KwaZulu-Natal) | historisk | `1800-tal` | – |
| `krakatau-1883` | 1883 | Krakatau i Sundasundet, Nederländska Ostindien (i dag Indonesien) | historisk | `1800-tal` | – |
| `lei-aurea-1888` | 1888 | Brasilien (huvudstaden Rio de Janeiro) | historisk | `1800-tal` | – |

## Vad listan inte avgör

- Om en lucka är ett problem. Ramen är en dekoration och bilden har egen bildtext och kredit. Att Tikal får den antika ramen är en avvägning, inte ett fel.
- Vilka nya regionstilar som borde finnas, och med vilka årtal. Det är ett produktbeslut som kräver DasKrokodils ja (utseende) och en källa för varje stils avgränsning (`historiker`).
- Händelser utan bild. Samma lucka finns i ramen för dem, men ramen syns mest med bild; mätningen kan göras om utan filtret på `image` genom att ta bort villkoret i steg 1.

## Möjligt nästa steg (kräver DasKrokodils ja)

Ett eget issue med `beslut-krävs` för om och i så fall vilka av luckorna som ska få en regionstil med egen ram, i första hand de där en regional stil redan finns men gäller andra år (typ A) och där flera händelser delar lucka. Mest berörda regioner enligt tabell A: Främre Orienten och Persien (där grundstilen är rätt i sak och kan vara avsiktlig), Anderna, Mesoamerika, Japan, Indien och Stilla havet.
