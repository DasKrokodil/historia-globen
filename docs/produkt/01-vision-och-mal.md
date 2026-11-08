# 01. Vision och mål

**Status:** 2026-11-08. Inriktningen nedan kommer från DasKrokodil själv (beslut [2026-11-08-produktinriktning.md](../beslut/2026-11-08-produktinriktning.md)). Målen M1–M8 och prioritetsordningen är min tolkning av hens beskrivning och ska bekräftas.

## Varför projektet finns

Historia-globen föddes ur skaparglädje: DasKrokodil ville bygga något, för att det var kul. Inspirationen kommer från spel där man lär sig saker *passivt* medan man spelar: Age of Empires, Age of Mythology, Civilization och Europa Universalis. Man tar in historia för att man utforskar, inte för att någon undervisar.

Det är ett hobbyprojekt med öppen källkod. Det har inget kommersiellt syfte, och ersättningen räcker med ett tack, en high five eller en kopp kaffe. Det ska vara **öppet och fritt**.

## Syftet i en mening

Historia-globen låter vem som helst dra i tiden på en jordglob och se vad som hände **samtidigt** på olika håll i världen, utforskande och lekfullt, med varje uppgift belagd i en öppen källa.

## Vem det är för

- **Alla "normala människor med ett intresse" för historia.** Det är huvudgruppen och det är den som vinner vid konflikt.
- **Från förskoleklass till gymnasiet:** det ska finnas något för alla åldrar under hela skoltiden.
- **Skolan är en "happy little accident":** projektet växte så att det går att använda i skolan, och den som vill får göra det. Det är **inte en läroplattform**, och skolan är inte det som styr projektet.
- **Inte akademiker.** DasKrokodil vill inte dras in i akademiska, historiska eller politiska diskussioner och har varken tid eller lust för det. Det betyder inte att kvaliteten är oviktig (källorna syns), men sidan vänder sig inte till forskare.

## Plattformar

De flesta antas läsa på **mobil och surfplatta (iPad)**, några på dator. Allt ska fungera på alla de plattformarna och i alla vanliga webbläsare. Det är ett krav, inte ett önskemål. **Stödmatris (beslut 2026-11-08):** de senaste två versionerna av Chrome, Safari (iOS och iPadOS), Firefox och Edge; iPad i både liggande och stående läge.

## Problemet vi löser

Historia lärs oftast ut per land eller per epok, så sambanden går förlorade: att pyramiderna byggdes medan de sista mammutarna levde, eller att Oxford undervisade när Tenochtitlan grundades. Atlaser och tidslinjer visar antingen *var* eller *när*, sällan båda tillsammans, och källorna bakom påståendena är ofta osynliga. Benchmarken ([2026-11-07-benchmark-skola-atlaser-spel.md](../granskningar/2026-11-07-benchmark-skola-atlaser-spel.md)) visar att flera atlaser har stängd licens eller saknar synlig källa.

## Det vi erbjuder som andra inte gör (kärnan)

1. **Samtidighet som första fråga.** "Vad pågår på andra håll just nu?" är ingången.
2. **Utforska, inte läsa.** Man lär sig genom att dra, klicka och följa, som i ett strategispel.
3. **Källan syns, och sidan lär ut källkritik aktivt** (beslut 2026-11-08). Varje händelse och fun fact har en källa och en granskningsnivå, och när källorna är oense står det öppet. Det är också så sidan lär barn och unga källkritik: genom att visa var uppgiften kommer ifrån, och genom att aktivt förklara hur man bedömer en källa (hur, se #926).
4. **Öppet.** Kod under GPL-3.0, data under CC BY 4.0, ingen inloggning, ingen spårning, inget kommersiellt.

## Mål

Mål med tecken att leta efter. Inget statistikskript körs på sidan (beslut 2026-11-06, #466); den enda besöksstatistiken är Cloudflare Pages egen, som visar trafik men inte vad besökaren förstår. Tecknen är därför främst kontrollerbara i data, test, granskningar och sådana observationer som kommer till oss (se [07-valideringsplan.md](07-valideringsplan.md)).

| # | Mål | Tecken på att vi lyckas | Hur vi ser det |
|---|---|---|---|
| M1 | **Förstå samtidighet på under en minut.** En förstagångsbesökare, ung eller gammal, ser ett samband och vill fortsätta utforska. | Ingången (introduktion, Samtidigt-kort) fungerar på mobil, surfplatta och dator utan förklaring. | UX-genomgång; webbläsartestet |
| M2 | **Pålitligt innehåll och synliga källor.** Inget påhittat, och besökaren kan se var uppgiften kommer ifrån (källkritik som metod). | Alla synliga uppgifter har källa; oenighet visas; ingen fakta ur minnet. | Källkontroll, `tools/`-kontroller |
| M3 | **Går att använda i skolan, för den som vill.** Förskoleklass till gymnasiet. Ingen läroplattform. | Turer, lektionsläge och utskrift fungerar som tillval utan att styra utvecklingen. | Lärarlinsen vid skolrelease |
| M4 | **Global bredd, och tydligt att det är ett urval.** Inte slagsida mot Europa. | Täckning per världsdel, period och kategori är synlig och glapp åtgärdas. "Om urvalet" finns. | `python3 tools/tackning.py` |
| M5 | **Fungerar överallt:** mobil, surfplatta, dator, alla vanliga webbläsare; tangentbord, zoom, lugn rörelse. | Inga kända blockerande fel i någon av plattformarna vid release. | Webbläsartest (tre motorer vid release), enhetskontroll, tillgänglighetslinsen |
| M6 | **Hållbart för en ensam redaktör.** Underhållet får inte ta bort glädjen. | Inget byggsteg, data skild från kod, få centrala filer; dokumentationen hålls lätt. | Arkitekturlinsen; kökontroller |
| M7 | **På flera språk** utan att fakta ändras. | Antalet oöversatta texter ökar aldrig. | Översättningsspärren |
| M9 | **Lär ut källkritik aktivt.** Barn och unga lär sig fråga *vem säger det, hur vet vi, finns fler källor, är de överens*. | Källkritiska inslag finns i flera ytor och för flera åldrar. | Granskning mot linserna; hur: #926 |
| M8 | **Det ska vara kul.** Att bygga och att använda. | Nya idéer får plats; inget i processen känns som ett jobb. | DasKrokodils egen bedömning |

## Avgränsningar: det här är sidan inte

- **Ingen läroplattform:** inga konton, ingen elevdata, inga betyg, ingen uppföljning av klasser.
- **Ingen akademisk målgrupp** och ingen ambition att delta i akademiska, historiska eller politiska diskussioner.
- **Inget kommersiellt:** ingen reklam, ingen försäljning, inget krav på inloggning.
- **Inga aktiva fältstudier.** Projektet söker inte upp användare eller lärare. Input som kommer till oss tas gärna emot och diskuteras.
- **Ingen egen backend** (enda undantaget är formuläret för förslag, beslut 2026-10-30).
- **Ingen tredjepartsstatistik eller spårning.**
- **Ingen fysisk glob i fokus nu.** Den ursprungliga idén parkeras; en nedskalad variant kan göras i framtiden. Webben går först, och läsbarhet på mobil och surfplatta går före hänsyn till en framtida hårdvara.
- **Ingen uppgift utan källa**, och ingen avbildning av profeten Muhammed.

## Hur projektet styrs

**Det här är DasKrokodils hobbyprojekt, och det ska inte råda någon tvekan om det** (beslut 2026-11-08).

- **Input och hjälp är välkomna.** Åsikter, förslag och bidrag tas emot gärna, och det är roligt när något engagerar.
- **Men ingen annan styr.** DasKrokodil bestämmer vad som görs, vad som tas med och vad som inte görs, och slår själv ihop allt. Ett förslag är ett erbjudande, inte ett krav, och ett nej behöver inte motiveras.
- **Medarbetare och agenter** (Einzbeng, Claude Code, Codex, Copilot) arbetar *åt* projektet, enligt arbetssättet i CLAUDE.md; de bestämmer inte inriktningen.
- **Den som vill ha något annorlunda** kan göra en egen kopia (koden är öppen).
- **Texten för utomstående** står under Bidra i README.

## Redaktionella linjer

- **Ensam redaktör.** DasKrokodil gör urvalet själv, utan en redaktion. Det ska framgå öppet: globen visar ett **urval**, och saker kommer med utan att redaktören tar ställning i varje fråga. Det är inte ett ställningstagande att något finns med.
- **Politiska och omstridda frågor** (gränser, statusfrågor) följer **Sveriges officiella hållning (UD)**, med källa per fall ([omstridda-granser.md](../omstridda-granser.md)). Syftet är att ägaren personligen inte ska kunna anklagas för ett politiskt ställningstagande: det är inte hens, det är den svenska statens hållning, och det står öppet.
- **Källkritik som pedagogisk idé.** Att visa källan, osäkerheten och oenigheten är en del av erbjudandet, inte bara en kvalitetskontroll.

## Principer vi väger mot varandra

Ordnade efter vad som vinner vid konflikt (min tolkning, bekräfta):

1. Källbelagt före fullständigt. 2. Begripligt och roligt att utforska före avancerat. 3. Fungerar på mobil och surfplatta före effektfullt på dator. 4. Tillgängligt före effektfullt. 5. Enkelt att underhålla före smart. 6. Öppet före bekvämt.

## Idéer för framtiden

- **Koppla historia till det som hände senare och till vår nutid**, så att man förstår syftet med att lära sig historia: att förstå sin samtid (#927). Ingen brådska; kräver ändring av datamodellen och ett källbelagt samband per koppling.

## Beslutade frågor (2026-11-08)

Svar från DasKrokodil på de öppna frågorna i första utkastet:

1. **Primär målgrupp:** alla med ett intresse för historia ("normala människor"). Skolan är en bonus, inte styrande.
2. **Urval:** ensam redaktör, tydligt att det är ett urval, ingen ställning i enskilda frågor.
3. **Gymnasiet och yngre:** förskoleklass till gymnasiet, hela skoltiden.
4. **Fysisk glob:** parkerad; webben först.
5. **Domän:** historiagloben.se används redan (README och DEPLOYMENT). Kvar är namnfrågan, se nedan.
6. **Källkritik:** ska läras ut **aktivt** (M9). Hur avgörs i #926.
7. **Barn före läsning:** räcker att vuxna visar barn. Barnen kan själva snurra och trycka och se färger och vad som händer. Ingen egen läsfri väg byggs.
8. **Webbläsare och plattformar:** stödmatrisen ovan gäller.
9. **Kravspecifikation (PRS):** ska skrivas ([09-kravspecifikation.md](09-kravspecifikation.md)).

## Öppna frågor

1. **Namnet.** CLAUDE.md frågar om projektet ska få en egen .se-domän (det har den redan: historiagloben.se) och om namnet "Historia-globen" ska behållas eller bli ett internationellt namn. Frågan är alltså bara det andra: ska sidan heta något som fungerar på alla fem språken (till exempel ett namn utan översättning), eller behålla det svenska "Historia-globen"? Inget behöver avgöras nu; det är ett varumärkesval och påverkar bara titel, domän och delningsbilder. Se #914.
2. **Hur källkritik lärs ut** (#926) och **idén om koppling till nutiden** (#927) är öppna beslut om utförande, inte om mål.

## Att kontrollera vid uppdatering (varje release)

- [ ] Stämmer målen och avgränsningarna fortfarande? Har en ny idé, målgrupp eller ett nytt mål tillkommit?
- [ ] Har ett beslut ändrat något? Skriv det i `docs/beslut/` först.
- [ ] Har något "antagande" bekräftats eller motsagts?
