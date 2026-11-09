# 10. Namn och domäner på andra språk (förslag för framtiden)

**Status:** utkast 2026-11-08, **förslag**, ingen brådska. DasKrokodil har bestämt att **historiagloben.se räcker tills vidare**. Om det visar sig finnas ett stort intresse utanför Sverige är det öppet att lägga till andra domäner och namn. Det här dokumentet är en färdig plan att dra fram *då*, så att ingen behöver tänka om från början.

**Viktigt om det jag inte vet:** jag har **inte** kunnat kontrollera om något av namnen nedan är ledigt som domän eller varumärke. Ett DNS-uppslag från min miljö bevisar ingenting (en registrerad domän kan sakna webbplats). Alla namn är **idéer att granska**, inte förslag som är kontrollerade. Kontroll görs hos en domänregistrator och i varumärkesregister innan något beslut.

## Läget i dag (belagt i koden)

- Sidan ligger på **historiagloben.se**; `canonical` i `index.html` pekar dit.
- Språket väljs i den här ordningen: `?lang=` i adressen, sparat val i webbläsaren, webbläsarens språk (`js/i18n.js`). En länk som `historiagloben.se/?lang=en` öppnar alltså sidan på engelska **utan någon kodändring**.
- Sökmotorer får bara startsidan listad, med en beskrivande titel och metadata på ett språk (`docs/arkitektur.md`, Synlighet och indexering). Språkversionerna är inte egna sidor.

Det betyder att en ny domän tekniskt kan vara en **omdirigering** till historiagloben.se, med rätt språk i adressen.

## Tre sätt att lägga upp det

| | A. Ett namn, en domän (idag) | B. Ett namn, flera domäner | C. Ett namn per språk, en domän per språk |
|---|---|---|---|
| **Vad** | Bara historiagloben.se | Samma namn på fler ändelser (till exempel .com, .nu) som alla leder till historiagloben.se | Varje språk får ett eget, översatt namn med egen domän som leder till sidan på det språket |
| **Kostnad** | Ingen extra | En avgift per domän och år | En avgift per domän och år, och mer att hålla ordning på |
| **Hjälper utländska besökare hitta oss?** | Nej, namnet är svenskt | Lite: skyddar namnet, men hjälper inte den som söker på sitt språk | Ja, om någon söker på namnet; men **sökmotorerna** ser fortfarande bara en sida, så vi kommer inte upp på språkets egna sökord |
| **Risk** | Låg | Låg | Splittrat varumärke; fler namn att underhålla; fler namn kan krocka med befintliga |
| **Kodändring** | Ingen | Ingen (omdirigering i Cloudflare) | Ingen för omdirigering; en sida per språk (`/en/`) skulle kräva en arkitekturändring och är **inte** på förslag |

**Rekommendation:** **A nu.** När intresset visar sig, börja med **B** (skydda namnet och en .com), och gå till **C bara för ett språk i taget** och bara där det finns ett tydligt intresse. Tillsammans med "kan göra små förbättringar när problem dyker upp" håller det arbetet litet och rimligt för en ensam redaktör.

## Idéer till namn (ej kontrollerade)

Tre olika inriktningar, med för- och nackdelar. Alla ska granskas av någon som talar språket innan något används (samma regel som för översättningar).

**1. Översättning rakt av** ("History Globe")

| Språk | Förslag | Anmärkning |
|---|---|---|
| Engelska | History Globe / The History Globe | Beskrivande och därmed troligen redan använt någonstans; svårt att skydda |
| Tyska | Geschichtsglobus (alt. Historienglobus) | Låter naturligt |
| Spanska | Globo de la Historia | Naturligt; *Globo Histórico* är kortare men betyder något annat (en historisk glob) |
| Franska | Globe de l'Histoire | Naturligt |

Fördel: begripligt direkt. Nackdel: generiskt, svårt att skilja från andra och att få egna sökträffar på.

**2. Namn som bär idén "samtidigt"**

Det som skiljer sidan är samtidigheten. Det finns ett engelskt ord för det: *Meanwhile*. Förslag att pröva: **Meanwhile Globe**. På andra språk blir det lätt klumpigt (*Mientras tanto*, *Pendant ce temps*, *Währenddessen*), så ett sådant namn fungerar bäst som **gemensamt namn**, inte översatt.

Fördel: unikt och berättar vad sidan gör. Nackdel: ett nytt namn för ett etablerat; låter inte svenskt.

**3. Ett påhittat gemensamt namn**

Till exempel **Chronoglobe**: *chrono-* finns i alla fem språken (svenska kronologi, engelska chronology, tyska, spanska *crono-*, franska *chrono-*). Ett enda namn, inga översättningar, en domän.

Fördel: ett namn för alla språk. Nackdel: bryter med "Historia-globen" och kan redan finnas.

## Om en domän per språk blir aktuellt

1. **Kontrollera** domän och varumärke (PRV i Sverige, EUIPO för EU) och att namnet inte betyder något olämpligt på språket.
2. **Registrera** bara det som behövs; skriv upp i `docs/DEPLOYMENT.md` vilka domäner som finns och var de pekar.
3. **Peka** domänen mot historiagloben.se med rätt `?lang=` (omdirigering i Cloudflare; verifiera stegen i Cloudflares dokumentation). `canonical` fortsätter peka på historiagloben.se.
4. **Behåll** historiagloben.se som huvudadress.
5. **Mät** med Cloudflare Pages egen statistik om det gav något; ingen skriptstatistik (beslut 2026-11-06).

## Signaler som visar att det är dags

Passivt, utan att söka upp någon (beslut 2026-11-08): återkommande trafik från ett land utanför Sverige i Cloudflares statistik, mejl eller förslag på ett språk, länkar från sidor på ett språk, eller att någon själv frågar efter en adress.

## Frågor till DasKrokodil (när det blir aktuellt)

1. Vilket språk är först (engelska är det naturliga)?
2. Ska namnet vara detsamma på alla språk (inriktning 2 eller 3) eller översättas (inriktning 1)?
3. Hur mycket är du beredd att betala per år för domäner?

## Att kontrollera vid uppdatering (varje release)

- [ ] Syns något intresse utanför Sverige (statistik, mejl, förslag)?
- [ ] Har en ny domän registrerats? Då ska den stå i DEPLOYMENT.md.

**Genomgång inför v6.1.0 (2026-11-09):** läst. Läget "i dag" stämmer: `canonical` pekar på historiagloben.se och `?lang=` styr språket. Inget är beslutat eller kontrollerat om namn och domäner; planen är fortfarande ett förslag utan brådska.
