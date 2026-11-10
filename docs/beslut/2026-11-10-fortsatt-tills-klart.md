# Agenter fortsätter tills uppgiften är klar och avslutar tydligt

2026-11-10

**Beslut:** En agent som har fått en uppgift i flera delar (till exempel research eller flera issues) gör alla delarna i följd
och stannar inte mellan dem för att vänta på ett ja. Den stannar bara när allt är klart, när ett beslut som är DasKrokodils
saknas, när en regel kräver det (röd kontroll, fullt antal pull requests, `beslut-krävs`) eller när kvoten, tiden eller
kontexten tar slut. Ett avslutande meddelande får inte innehålla en dold fråga: antingen en konkret fråga med förslag på
svar, eller ingen fråga alls. Regeln står i AGENTS.md ("Fortsätt tills uppgiften är klar, och avsluta tydligt") och gäller
Codex och andra agenter som läser den filen.

**Motivering:** Codex skrev ibland att ett delmoment var klart och lät sedan meddelandet sluta i något som såg ut att kräva
ett ja ("nästa steg vore …") utan att vara en fråga. DasKrokodil, som är projektledare och inte utvecklare, förstod inte
vad som förväntades, och uppgifter i flera delar stannade upp i onödan. Tydlig avslutning och sammanhängande körning sparar
hans tid och agenternas kontext.
