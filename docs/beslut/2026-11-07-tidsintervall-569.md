# Tidsintervall på globen: inriktning (#569)

**Datum:** 2026-11-07

## Beslut
Rikard godkände inriktningen efter förstudien (`docs/granskningar/2026-11-07-tidsintervall-forstudie.md`). Intervalläget byggs senare, efter skolpiloten (beslutet om Version 6 samma dag), enligt detta:
- **Ett år styr fortfarande allt, med ett tillägg.** Tillståndet behåller året som i dag och får ett valfritt slutår. Intervallet är "från året till slutåret". Allt som läser året fungerar som förut.
- **Intervall, Fokus och uppspelning utesluter varandra.** Om man startar uppspelningen eller följer ett krig eller rike går sidan tillbaka till ett enskilt år.
- **Riken och religioner visas som läget vid intervallets slut** (alternativ A i förstudien), med en synlig etikett, till exempel "Områden visas för år 1918". Valet mellan början och slut väntar tills någon saknar det.
- **Intervallet byggs på dagens tidsmodell** och väntar inte på #396. Urvalet (överlapp mellan händelsens spann och intervallet) ligger i en enda funktion i `js/date-events.js`, så att bara den behöver ändras om #396 ändrar tidsmodellen.
- **#569 ligger kvar i milstolpen 5.2** och görs efter skolpiloten.
- **Gränsen för antalet markörer är en inställning, inte ett fast tal.** Antalen mäts igen före bygget, eftersom massimporten (#61) och kärnhändelserna (#452) ökar datan.
- **I mobilbredd väljs intervallet med två årsfält med stegknappar**, inte två handtag på tidslinjen.

## Varför
Ett slutår ovanpå året ger minsta möjliga ändring av arkitekturen (CLAUDE.md punkt 3). Två rörliga tidsmodeller samtidigt blir förvirrande, och uppspelningen visar redan förändringen år för år. Läget vid slutet är ärligt om vilket år gränserna gäller och kan använda den kod som redan finns. #396 ligger långt fram (version 7), och intervallet behöver bara fält som redan finns. Två handtag är svåra att träffa med fingret på 400 px bredd.

## Berör
#569, #396, #476, #61, #452, `js/state.js`, `js/timeline.js`, `js/url-state.js`, `js/date-events.js`, `js/layers/events.js`, `js/layers/areas.js`, `js/ui/panel.js`. När intervalläget byggs uppdateras CLAUDE.md punkt 3 och `docs/arkitektur.md` i samma pull request.
