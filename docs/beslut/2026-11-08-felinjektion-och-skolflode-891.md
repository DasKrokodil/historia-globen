# Felinjektion och skolflöde i matrisjobbet (#891, del 2)

Datum: 2026-11-08. Av: Claude Code, på uppdrag av #891.

**Beslut:** matrisjobbet får två kontroller till. Den ena låter källregistret och en händelsebild fela först efter att sidan har fungerat, och prövar att besked visas och att sidan återhämtar sig utan omladdning. Den andra följer ett lektionssteg på mobil som fråga → underlag → svar → återgång med riktig pekning. Båda använder `tapReal`, som mäter vad som ligger överst mitt på elementet innan det trycks.

**Skäl:** blind-spots-rundorna visade att isolerade prov missar fel mellan lägen. Provet hittade direkt ett sådant fel: Mer/Meny täckte Stäng i den helt utfällda faktarutan i lektionsläget på mobil. Det rättades i samma pull request (`css/style.css`), och kontrollen är röd utan rättningen.

**Avgränsning:** turfilerna läses vid start, så ett fel i dem mitt i sessionen syns inte för besökaren och får inget prov. Om källorna har ingen "Försök igen"-knapp; det går att öppna dialogen igen, vilket provet kontrollerar. Ingen ny funktion, ingen datafil och inga översättningar ändras.
