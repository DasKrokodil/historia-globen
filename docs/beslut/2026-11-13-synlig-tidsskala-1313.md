# Synlig tidsskala: skarvarna och en skalrad

**Datum:** 2026-11-13 (DasKrokodil sa ja till rekommendationen i #1313, helganalysens förslag A17, syntesens punkt I i `docs/ux-review/`; hör till #49)

## Beslut
- **Skarvarna syns.** Tidslinjen har fem segment med olika skala (`SEGMENTS` i `js/timeline.js`). På varje gräns mellan två segment ritas nu en skarv (`.seam`, fyra stycken): ett avbrott i axeln, två tunna sneda streck med mörkt mellanrum, i `--parchment-dim`. Tecknet är hämtat från diagram där en axel bryts. Skarven ligger över händelseprickarna så att den syns även där det finns många, och den är bara för ögat (`aria-hidden`; reglaget är fortfarande enda tabbstoppet, #1003).
- **Skalan sägs i ord, ur segmentens egna fält.** En skalrad (`#timeline-scale-note`) säger hur många år en **tiondel av tidslinjen** är vid året besökaren står på: "Här är en tiondel av tidslinjen ≈ 370 år". Efter ett drag, en tangent, ett steg, ett hopp eller en uppspelning över en skarv säger den vad som ändras: "Ny skala: en tiondel ≈ 690 år (förut 370)". Talet är `(to - from) / (b - a) / 10` för segmentet (`yearsPerTenth`), avrundat till två gällande siffror; inget tal är skrivet för hand, och ändras `SEGMENTS` ändras texterna med. Varje segments `title` (hovring i datorn) säger samma sak med segmentets årtal.
- **Enhet: en tiondel av tidslinjen.** Förslaget i syntesen ("1 cm ≈ 250 år") valdes bort: en CSS-centimeter är inte en riktig centimeter på en telefon, och sidan ska fungera i mobil. En tiondel av tidslinjen är samma andel på varje skärm och går att kontrollera med fingret.
- **Var och när.** Raden ligger i teckenförklaringens lucka under tidslinjen och tar ingen höjd (negativa marginaler, som teckenförklaringen); teckenförklaringen tonas ned (`visibility`) medan raden syns, som vid engångstipset. Raden visas när året flyttas av besökaren, när reglaget får tangentbordsfokus och när uppspelningen passerar en skarv, står kvar 5 sekunder efter sista flytten (och så länge fingret ligger kvar), och visas aldrig i Fokus eller tidsintervall, som har egna skalor, eller i tur och lektion (tidslåset, #1322). Teckenförklaringen har dessutom en punkt "ny skala" med skarvens tecken, utom i smal skärm (högst 560 px), där de längre språken inte ryms.
- **Skärmläsare** får samma besked i statusraden, i samma uppläsning som året (`takeStepNote`, tillsammans med beskedet om ny upplösning från #1089): "Ny skala: en tiondel av tidslinjen är nu cirka 370 år, förut cirka 690 år." Skalraden själv är `aria-hidden`, så att inget läses två gånger.
- **Ny gränssnittstext** (`tlegend.seam`, `scale.here`, `scale.new`, `scale.newFull`, `scale.seg`) finns på alla fem språk. Texterna är korta beskrivningar utan tilltal, och bara ordet för tidslinjen följer gränssnittet (tidslinjen, timeline, Zeitleiste, línea de tiempo, frise).
- **Ingen ny yta:** skalraden är en rad i tidsraden, inte en meny eller ruta, och anmäler sig därför inte i stängregistret (`js/surfaces.js`).

## Varför
Helganalysen (#1289) visade att inget på skärmen säger var skalan byter: en centimeter kan vara tio år eller tiotusen. Eleven ser inte att forntiden är hoptryckt, och förhistorien (version 7) gör skillnaden större. Skarvarna och raden gör det synligt utan att ändra tidsmodellen, datamodellen eller observatoriestilen (alla färger är befintliga variabler).

## Det som inte ingår
- Fönstret som ett band runt tummen och nivåer för version 8 ("tidslinje i nivåer", #49) görs när de behövs.
- Skalan i Fokus (`focusTickStep`, #1321) är oförändrad.
