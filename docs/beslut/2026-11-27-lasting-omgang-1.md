# Långa tillstånd, omgång 1: jaktens år 1500 och "pågick då" (#1451)

**Datum:** 2026-11-27 (DasKrokodil sa ja till rekommendationen i #1451 den 13 november: "ja till 1-3 enligt rekommendationerna"). Fortsättning på punkt 8 i [beslutet 2026-11-13 om vad "samtidigt" betyder](2026-11-13-definition-av-samtidigt.md).

## Beslut
1. **Omgång 1** är de synliga händelser som Samtidighetsjakten år 1500 kan räkna (45 när typningen gjordes; `huntCandidates` i `js/uppdrag-rules.js`). Bland dem får de händelser `"lasting": true` vars egen sammanfattning och källa beskriver något som pågick: ett rike, en kultur, en handel, en stad eller en plats som var i bruk länge. Källsidan öppnades för varje typad händelse. Ingen längdgräns används.
2. **Typade (17):** Osmanska riket, Mingdynastin, Dorsetkulturen, den transatlantiska slavhandeln, Hansan, Hansans kontor på Bryggen, Tenochtitlan, Stora Zimbabwe, Mutapariket, Funjsultanatet, Pachacámac, Roi Mata-hövdingarna, polynesierna på Henderson och Pitcairn, Moundville, undervisningen i Oxford, de lärdas storhetstid i Timbuktu och de senegambiska stencirklarna.
3. **Inte typade:** det som hände, även med osäkert spann (Rangitoto, kopparhuvudena från Ife, Österbygden överges, moriori på Chathamöarna, Piʻilani enar Maui), en persons styre eller liv som börjar med en händelse (Askia Muhammad tar makten, Afonso I, Guru Nanak), krig och resor som varade några år (erövringen av Aztekriket, Magellans segling, Sixtinska kapellets tak) och alla händelser på ett år. Moai-statyerna på Rapa Nui typas inte än: källan säger att de flesta höggs ut mellan 1250 och 1500 men beskriver inte huggandet som ett tillstånd, så det är oklart.
4. **Jakten räknar tillstånden som förut** (punkt 7 i beslutet 2026-11-13) men märker dem. Meddelandet säger "{titel} räknas: {världsdel}. Det pågick då, under lång tid." och listan har märket "pågick då" efter årtalen. En händelse utan fältet märks inte alls, eftersom bara en del av händelserna är typade och ett "hände" då kunde bli fel.
5. **Reflektionsfrågan får en rad till** när minst en av de hittade händelserna är ett tillstånd: "Vilka av dina tre var något som hände, och vilka pågick länge?" Raden är gränssnittstext (`hunt.reflectLasting`) och gäller alla uppdrag, så den följer med när fler händelser typas.
6. **Ordet i gränssnittet är "pågick då"**, med du-form i jakten i alla språk (beslutet 2026-11-08 om tilltal efter ålder). Texterna `hunt.okLasting`, `hunt.lasting` och `hunt.reflectLasting` finns i alla fem språken.

## Varför
Lärargranskningen i #1311 rådde att jakten räknar tillstånden: ett nej vore godtyckligt så länge bara en del är typat, och "tillstånd" är ett svårt ord i åk 4–6. Märket "pågick då" ger eleven skillnaden mellan något som hände och något som pågick utan att jakten blir svårare. Typningen görs med källan, inte efter längden, eftersom ett långt krig är något som hände och ett kort rike något som pågick.

## Öppet
- Flera typade händelser har en titel som talar om början ("Hansan växer fram", "Funjsultanatet grundas i Sennar", "Moundville blir ett regionalt hövdingadöme"), fast spannet och sammanfattningen gäller hela tiden. Om titeln ska ändras, eller om fältet `anchor` (öppet i beslutet 2026-11-13) behövs, tas upp senare.
- Mutaparikets slut: händelsen slutar omkring 1760, och källan anger 1760 som året då riket splittrades men 1884 som slutet. Typningen påverkas inte; årtalet granskas i ett eget ärende.
- Nästa omgång (jaktens år 1000 och 1945) och panelen (#1312).

## Berör
`data/handelser/fkr.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/events.json`, `data/genererat/handelser.json`, `js/uppdrag-rules.js`, `js/ui/uppdrag.js`, `css/style.css`, `data/ui/*.json`, `tests/uppdrag.test.mjs`, `docs/datamodell.md`, `docs/produkt/13-ordlista.md`, #1451.
