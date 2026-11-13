# Reglagets upplösning: en källa för avrundning, steg och fart

**Datum:** 2026-11-13 (DasKrokodil sa ja till rekommendationen i #1320, helganalysens förslag P2)

## Beslut
- **Upplösningen:** reglaget har en upplösning per del av tidslinjen: **tusen år före 10 000 f.Kr., hundra år till 3000 f.Kr. och därefter ett år** (`RESOLUTION` och `stepAt` i `js/model.js`). Den är den enda källan för:
  - avrundningen av året i rubriken, i Samtidigt-raden och i det som skärmläsaren läser upp (`roundToStep`),
  - var ett drag i reglaget landar,
  - stegknapparna och piltangenterna (−1 är tusen år före 10 000 f.Kr.),
  - uppspelningens fart (nivån gånger upplösningen: 25 000 år/s i djup förhistoria),
  - stegknapparnas och fartknappens texter.
- **Gamla länkar** med exakta år (till exempel `#y=-7412`) öppnas som de är. Bara rubriken avrundas.
- **Djup tid:** `formatYear` avrundar årtal före 10 000 f.Kr. till tusental. Djup tid som skrivs `Y-66000000` visas därför som "66 000 000 f.Kr." och inte "66 000 001 f.Kr.". Mellan 10 000 och 3000 f.Kr. lämnas källornas årtal orörda i listor och faktarutor.
- **Märket på Samtidigt** räknar bara det som pågår. Det som bara ligger nära i tid står i raden och listan. Statusraden för skärmläsare säger samma tal.
- **I mobil** (högst 760 px bredd) döljs de yttersta stegknapparna (±100 steg) i förhistorien, så att de andra rymmer "−10 000" och "+1000" utan att någon text blir mindre än 12 px (#1309). Piltangenterna och PageUp/PageDown finns kvar.

## Varför
Året var alltid ett heltal, och steg, fart, avrundning och tidsfönster löstes var för sig (helganalysen, körning B6). Det gav falsk exakthet ("99 001 f.Kr." bredvid "±12 000 år"), steg på ett år där en pixel är cirka 970 år, och en uppspelning som tog cirka 16 minuter genom förhistorien. Det bröt mot källpolicyns punkt 6 (visa osäkerhet öppet i stället för falsk exakthet). En gemensam upplösning gör #1089 och #1090 mindre.
