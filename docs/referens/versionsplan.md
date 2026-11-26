# Versionsplan, löpande spår och öppna frågor

GitHub-milstolparna är huvudkällan; den här filen beskriver ordningen. Flyttat ordagrant ur [CLAUDE.md](../../CLAUDE.md) 2026-11-23 (del av [beslutet 2026-11-23](../beslut/2026-11-23-farre-granskningar-sparar-tokens.md), punkt 5) för att kärnan ska bli kort. Reglerna är oförändrade.


**GitHub-milstolparna är huvudkällan** för vad som ingår och vad som pågår. Versionsnumren nedan beskriver ordningen och upprepas inte i andra dokument. Version 2–6.5.0 och rikena R1–R7 är klara och släppta, senast **v6.5.0** (2026-11-21). Milstolparna 6.2.1 och 6.3.0 släpptes tillsammans som **v6.3.0**. Milstolparna döptes om 2026-11-16 så att varje namn börjar med den release den tillhör (docs/beslut/2026-11-16-milstolpar-med-releasenummer.md). Ordningen ändrades 2026-10-31 (docs/beslut.md): först det som gör sidan stabil och användbar i skolan, sedan de dyra specialfunktionerna. Tekniska förutsättningar byggs före de funktioner som behöver dem. Milstolparna ordnades om 2026-11-13 efter backloganalysen (docs/beslut/2026-11-13-milstolpar-efter-backloggen.md).

| Version | Innehåll |
|---|---|
| 4.2 Stabilitet och tillgänglighet | Upptäcktsvyn (#375, #376, #378; dimman över riken #377 ligger i R7), tangentbord och zoom (#386, #362), kontroll efter publicering (#388), läsbar tidslinje (#298), faktarutor och introduktion (#359, #363, #364) och små förenklingar |
| 4.3 Teknisk grund | main.js delas upp och tillståndet blir centralt (#389, utan adressdelen som är #501 i 5.2), lättare mobilrendering (#390), JSON Schema (#391), lagertypen bildlager (#54) |
| 5.0 Guidade berättelser | Turformat som data (#47), turer om andra och första världskriget (#13, #48), berättelseläget med kapitel och frågor (#247) och slutkort med det viktigaste att ta med sig (#500). Rikens fall (#499) och tidslinjebläddraren (#231) flyttades till senare (2026-11-06) |
| 5.1 Global täckning, delad i tre (beslut 2026-11-03) | **5.1a** redigeringsformat (#394), **5.1b** kärnhändelser (#452) och deras bilder (#453) i källkontrollerade batchar om högst 20 per PR, **5.1c** massimport per världsdel (#61) när format, schema, källflöde och täckningsmått är stabila. Granskningsvyn för människor (#62) är stängd (#252) |
| 5.1d Stabilisering (2026-11-06) | Efter helhetsanalysen (docs/granskningar/2026-11-06-gemensam-rekommendation.md): mobilkortet (#706), låsning utan grafikkort (#692), webbläsartestet i Firefox och WebKit (#702), skarp CSP (#707), zoom och tangentbord i testet (#708) |
| 6.0.0 Skolpaketet | Quiz (#65), turlänk (#736), lärarfält i turerna (#737), utskrift av elev- och lärarblad (#738), lektion 1 åk 7–9 (#739) och lektion 2 åk 4–6 (#740), Samtidighetsjakten (#741), Källdetektiven (#742), lektionsläget (#795) och lärarpaket (#743). Ingen pilot med lärare och klass görs nu (#744 stängd, beslut 2026-11-07); släpps som 6.0.0 (#862, plan i docs/granskningar/2026-11-07-plan-version-6.md) |
| 6.0.1 Rättningar efter skolreleasen | Fynd ur blind-spots-rundan (#871, #877–#884), lärarens väg till bladen (#885), Samtidigt mot Mer/Meny (#887), tomma filter (#886), webbläsartestet (#864, #891, Firefox och WebKit i release-körningen #888), adressens kapplöpning (#865) och de fem händelserna före tidslinjens start (#892) |
| 6.1.0 Tidsintervall, plats och epoker | Ersätter "Version 5.2" (beslut 2026-11-08, docs/beslut/2026-11-08-version-6-1-0.md): tidsintervall (#569 i #754–#756), "Vad hände här?" (#15), faktarutans förklaring (#786) och epoker enligt svenska läroplanen (#845, #476, listan godkänns först). Lägeskontraktet (#893) ska vara avgjort före #755; sök och delbara länkar släpptes redan i v5.0.0 |
| 6.2.0 UI/UX uppdatering | Nästa efter 6.1.0 (beslut 2026-11-09, docs/beslut/2026-11-09-ui-ux-efter-6-1-0.md): rättningarna ur UX-granskningen i `docs/ux-review/` (#991–#1004) och de UX-ärenden som flyttats dit (#571, #868, #894, #937, #977, #979–#981). Målet är att sidan känns lugnare och lättare att förstå: ett tydligt "samtidigt", färre samtidiga ytor och ett ord per sak |
| 6.2.1 Rättningar efter 6.2.0 | Klar; släpps i v6.3.0 |
| 6.3.0 Teman | Temamotorn (#398, `data/teman.json`, tema som fokustyp (`theme`), inget eget läge) med teknik (#105) som första tema (beslut 2026-11-08, docs/beslut/2026-11-08-teman-fore-version-7.md). Före releasen också faktafelen #1344–#1346 och en minsta rättning av "samtidigt" och årtalen i förhistorien |
| 6.3.1 Rättningar och reglagets grund | Små buggar ur helganalysen (#1302–#1305, #1334, #1326), tidslås i tur och lektion (#1322), stängregistret (#1323) och reglagets grund (#1319–#1321), som flyttades hit från 7.0 |
| 6.4.0 Länder och platser (släppt 2026-11-15) | Sverige och Danmark som länder (#1262–#1264), Norden i forntiden (#1339), skolkopplingen (#1265) och platserna (#1159–#1164). Övriga pilotländer ligger nu i 6.6.0 och väntar på utvärderingen #1274 (beslut 2026-11-12, länderna före regionerna) |
| 6.5.0 Riken, täckning, symboler och UI/UX (släppt 2026-11-21) | Fem milstolpar som släpptes tillsammans (beslut 2026-11-16, DasKrokodils prioritering): "Version 6.5.0: Riken: global täckning", "Version 6.5.0: Täckning: händelser och balans", "Version 6.5.0: Riken: symboler och flaggor", "Version 6.5.0: UI/UX: tydlighet och tillgänglighet" (där också regionvyns UX-fynd, de två tidsreglagen och webbläsartestet ingår) och "Version 6.5.0: Bilder: lektioner och viktiga händelser". Expertgranskningen före releasen: docs/granskningar/release-2026-11-21.md |
| 6.5.1 Rättningar efter 6.5.0 | Faktafel, tillgänglighetsfel och röda kontroller ur expertgranskningen av v6.5.0 (till exempel #2151, #2153, #2154, #2155, #2156, #2157, #2162, #2145, #1996, #1174, #2168 och #2178); faktafel först (beslut 2026-11-22, docs/beslut/2026-11-22-milstolpar-efter-6-5-0.md) |
| 6.6.0 Länder: Sök och följ, Norden och Baltikum | Länderlistan och landskortet först (#1261, #1260), därefter Norden och Baltikum (#1808–#1813, samlingsissue #1807). Delad ur "Länder och regioner" 2026-11-22 |
| 6.6.1 Regioner: Sveriges landskap | Gränskälla och ritning (#1847, #1115, #1568), de fem landskapsgrupperna (#1848–#1852) och utvärderingen av piloten (#1274) |
| 6.6.2 Länder: Västeuropa och Mellaneuropa | Brittiska öarna, Västeuropa och Mellaneuropa (#1814–#1826) |
| 6.6.3 Länder: Södra Europa och Balkan | #1827–#1842 |
| 6.6.4 Länder: Östeuropa, mikrostater och pilotländer omgång 2 | Östeuropa (#1843–#1845), mikrostaterna (#1846), pilotländerna Etiopien, Peru, Australien och Japan (#1270–#1273, #1267), kartan först (#1954) och regionstilar för Västafrika (#2053). Startar efter utvärderingen #1274 |
| 6.7.0 Täckning och riken, omgång 2 | Förhistoria, medeltid och antiken samt rikena som flyttades ur 6.5.0 (#645, #646, #1331, #1765, #1767, #1444, #2032, #1699, #1737, #1962, #1757, #2159, #1388, #1714, #1593, #556, #1300, #1116). Fakta och källor: Claude Code |
| 6.8.0 Skolan och samtidigt | Definitionen av "samtidigt" (#1311) först, sedan lektionsblad (#1316), uppdrag per lektion (#1340), "För lärare" (#1315), quizet (#1314), lärarfält i fall-turerna (#1279), missuppfattningar (#1229) och Lgr22-listan (#1342). Bytte nummer från 6.7.0 2026-11-22 |
| 7.0 Tidsmodell och reglage | Tidslinje i nivåer (#49) och synlig tidsskala (#1313); reglagets grund görs redan i 6.3.1 |
| 7.1 Människoarter | Människoarter (#11), bildlager v2 (#1325), fokustyper som poster (#1327) och förhistorien utöver människans spridning (#1338) |
| 7.2 Lärarstöd för förhistorien | Epoker för förhistorien (#1343, beslutsfil 2026-11-13) och lärarstöd. Version 7 som helhet följer riktningen 2026-11-10 (docs/beslut/2026-11-10-version-7-riktning.md): människans läge cirka 100 000 år bakåt, jordens historia först i version 8; "förhistorien högst cirka 10 % av reglaget" är ersatt av två reglage (docs/beslut/2026-11-19-tva-reglage-1958.md, #1958) |
| 8 Jordens historia | Eget läge med geologisk tidslinje och forntida kartor (#397, #51–#53). Designen är beslutad 2026-11-14 (docs/beslut/2026-11-14-jordens-historia-design.md): karta för fanerozoikum först, PaleoCoastlines som kartkälla, tid som år före nutid, och de osynliga grundstegen först (#1511–#1513, #1420); delissues #1510–#1521 |
| 9 Atlas och jämförelse | Jämför två tider (#248), historiska kartor (#249), skolatlasens bildlager (#8, #9, #55) |

Löpande spår och parkerade milstolpar (utan release, görs bredvid huvudversionerna):
- **Löpande: Språk: översättning** (#63, #670–#679): i den ordning texterna syns (viktiga händelser och turer, rikesnamn, etiketter, sedan löptext), med högst en av fyra platser för pull requests per person.
- **Löpande: Bilder: riktiga bilder (ingen release)** (beslut 2026-11-20, docs/beslut/2026-11-20-bilder-riktiga-bilder-i-bitar-och-undantag.md) delar upp händelserna utan bild i issues om högst 20 händelser under samlingsissuet #299. Riktiga bilder är målet; illustrationer är bara reserv. Bildbatcharna görs i källkontrollerade omgångar.
- **Idébank (inte planerat)** och **Rymden (inte planerat):** temavyer, experiment och hårdvara. En idé lämnar Idébanken bara genom DasKrokodils beslut. Hårdvaran planeras i Rikards Claude-projekt.
- **Senare: innehåll, paket och teknik (ingen release)** samlar de tidigare "Paket: Vetenskap och medicin", "Paket: Temavyer och innehåll", "Senare: teknik" och "Senare: innehåll och media". **Väntar på beslut** är inkorgen för nya beslutsissues och ska vara tom när besluten är tagna. **Att följa upp** används bara för sådant som väntar på något utanför projektet (utvärderingar, Skolverket, mätningar).

Regler:
- **Varje version slutar med att Rikard utvärderar** innan nästa börjar.
- **Stora datamängder fylls på först när tekniken för dem fungerar.**
- **Varje paket och varje version ska ha innehåll från flera världsdelar**, eftersom öppna data har slagsida mot Europa.
- Nya datakällor läggs in i README:ns licensavsnitt när de faktiskt används, inte innan.

## Öppna frågor (Rikard bestämmer)

- ~~Domän och namn~~ Besvarat 2026-11-08: historiagloben.se används och räcker tills vidare; om stort intresse visar sig öppnas andra domäner och namn per språk (plan i docs/produkt/10-namn-och-domaner.md, beslut i docs/beslut/2026-11-08-produktinriktning.md).
- Vilket fördjupningsläge kommer först (till exempel andra världskriget)?
