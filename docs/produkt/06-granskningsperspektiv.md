# 06. Granskningsperspektiv

**Status:** utkast 2026-11-08. Det här dokumentet svarar på frågan "vad skulle en erfaren person med X-blick säga om sidan?". Varje **lins** är en uppsättning frågor och ett kontrollstöd som en granskare (människa eller agent) tar på sig. Vad linserna "brukar säga" är **hypoteser** härledda ur befintliga analyser; de är inte yttranden från riktiga personer och ersätter inte en användarstudie eller en riktig lärare.

## Så används linserna

1. **När:** vid UX-genomgången, blind-spots-rundan, arkitekturanalysen, täckningsrundan, benchmarken och inför varje release (i release-PR:en). Välj linserna som berörs, inte alla varje gång (se matrisen).
2. **Hur:** granskaren läser linsens avsnitt, tar rollen, går de angivna flödena i [05](05-ux-oversikt.md#huvudflöden) på dator och mobil och besvarar linsens frågor med **bevis** (skärmbild, test, kodrad, källa). Ett påstående utan bevis är en hypotes och ska märkas så.
3. **Utdata:** en daterad rapport i `docs/granskningar/`. Varje fynd har: **lins**, **persona** (A–I i [02](02-anvandare-och-intressenter.md)), **allvar** (blockerar / viktigt / önskvärt), **steg**, **förväntat och faktiskt**, **bevis**. Fynd blir issues enligt arbetssättet i CLAUDE.md.
4. **Uppdatera:** när ett fynd leder till en ändring eller bekräftar ett antagande, skriv en rad under "Vad linsen har sagt hittills" och ändra berört dokument.
5. **Mot vilka mål:** varje fynd ska kunna kopplas till ett mål M1–M7 i [01](01-vision-och-mal.md). Hör det inte hemma under något mål är antingen fyndet eller målen fel.

Text att klistra in i en granskningsorder till en agent:

> Granska med linsen "<namn>" i docs/produkt/06-granskningsperspektiv.md. Gå flödena <nummer> i docs/produkt/05-ux-oversikt.md på dator (1400×900) och mobil (400×800). Besvara linsens frågor med bevis, märk antaganden som antaganden, och lämna rapporten som daterad fil i docs/granskningar/ samt en kommentar i pull requesten som säger var den ligger.

## Matris: vilken lins när?

| Tillfälle | UX | Arkitekt | Lärare | Elev 10–13 | Elev 13–16 | Intresserad | Tillgänglighet | Historiker |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| UX-genomgång (daglig, före release) | ● | | ○ | ○ | ○ | ● | ● | |
| Blind-spots-runda | ● | ● | ○ | ○ | ○ | ○ | ● | |
| Arkitekturanalys | | ● | | | | | ○ | |
| Skolrelease (lektion, tur, utskrift) | ○ | | ● | ● | ● | | ● | ○ |
| Nytt innehåll (händelser, riken, fakta) | | | ○ | | | ○ | | ● |
| Ny funktion | ● | ● | ○ | ○ | ○ | ● | ● | |
| Täckningsrunda | | | ○ | | | ● | | ● |
| Release | ● | ● | ● | ○ | ○ | ● | ● | ○ |

● alltid · ○ när det berörs.

Linserna 9 (barn F–3) och 10 (spelaren) har inga egna kolumner än. Använd 10 vid UX-genomgång och nya funktioner (som "intresserad"), och 9 när något byggs för yngre barn.

---

## 1. Senior UX/UI-designer

**Blicken:** helheten ur ett människocentrerat perspektiv. Är värdet tydligt, är vägen kort, är hierarkin begriplig, och håller utseendet och mönstren ihop?

**Frågor**
- **Värde och ingång:** förstår en förstagångsbesökare inom ~10 sekunder vad sidan gör och vad man kan göra? Finns det en tydlig första handling?
- **Informationshierarki:** är det uppenbart vad som är huvudsak (tid och glob) och vad som är fördjupning? Konkurrerar kort, menyer och tidslinje om samma yta?
- **Navigation och orientering:** vet man var man är, hur man går tillbaka och hur man avslutar ett läge (tur, lektion, fokus)? Är "Mer" ett skräpkorgsmönster?
- **Konsekvens:** samma mönster för samma sak (ark mot meny, kryss mot Escape, namn på knappar)? Följer allt design-variablerna i `:root`?
- **Återkoppling och tillstånd:** laddning, tomma, delvis tomma, fel och reservlösningar. Ser en reservlösning ut som ett fel?
- **Mobil och touch:** träffytor, tumzon, att kort inte täcker kontroller, ark med tre lägen, orientering.
- **Visuell kvalitet:** typografi (läsbarhet i brödtext och årtal), kontrast, täthet på kartan, färgkodens hållbarhet.
- **Mikrotext:** begriplig, kort, konsekvent ton, rätt tilltal per åldersgrupp.
- **Förutsägbarhet:** inga överraskande hopp av år eller kamera (jfr R1 i [04](04-arkitekturoversikt.md)).

**Brukar säga (hypoteser):** "Imponerande rik, men många ingångar (Samtidigt, Sök och följ, Turer, Lager, Vy, Mer) för någon som inte vet vad hen söker." "Mobilens lager av kort och ark är lätt att tappa bort sig i." "Tydliga reservlägen behövs, så att tomt inte ser trasigt ut."

**Bevis att samla in:** skärmbilder (2× upplösning) i 1400×900 och 400×800, konsolloggar, tidtagning på första handlingen, lista över krockar och täckta kontroller.

**Vad linsen har sagt hittills:** 2026-11-06: mobilkortet täcker tidslinjen; sökningen öppnas med ett förvalt filter (helhetsanalys). 2026-11-08: tyst laddningsreserv, faktaruta bakom lektionskort (blind-spots, PR #871).

---

## 2. Senior mjukvaruarkitekt

**Blicken:** vad är det som håller på tio år, och vad går sönder först? Är beslutet rätt för storleken, laget och målen, inte för modet.

**Frågor**
- **Principer följs:** inget byggsteg, data skild från kod, ett år styr allt, ekvirektangulär rendering, lagergränssnittet, ett externt beroende. Finns det genvägar som bryter dem?
- **Gränser och kopplingar:** vilka moduler vet för mycket om varandra? Är tillståndet centralt (`state.js`) i praktiken eller finns parallella sanningar?
- **Tillståndsövergångar:** adress ↔ fokus ↔ tur ↔ lektion ↔ språk. Finns det kontrakt och test för kombinationerna?
- **Data:** schema (JSON Schema, #391), referensintegritet (`sources`, `partOf`), genererade filer som inte redigeras, versionshantering av format.
- **Prestanda:** startsträcka, minne på mobil (canvasstorlekar), datamängd som växer, skarpt utsnitt, uppspelning på svag maskin.
- **Testbarhet och driftsäkerhet:** vad bevisar webbläsartestet och vad bevisar det inte? Tre webbläsarmotorer? Release- och rollbackrutin?
- **Säkerhet och integritet:** CSP, Permissions-Policy, förslagsformuläret (origin-kontroll, storleksgräns, spamskydd), inga personuppgifter till tredje part, beroendens integritet (SRI/exakt version).
- **Underhållbarhet:** filstorlek, krockytor mellan parallella agenter, dokumentation som följer koden.
- **Reversibilitet:** vad kostar det att byta ut three.js, att lägga till en server, att göra en fysisk glob?
- **Skuld:** medveten (dokumenterad i beslut) mot omedveten.

**Brukar säga (hypoteser):** "Bra kärnbeslut: enkelt, portabelt, data först." "Risken ligger mellan komponenterna, inte i dem: tillståndsövergångar och central filer som alla rör." "Bevisa tre webbläsare och prestanda med större datamängd innan nästa stora volymökning."

**Bevis att samla in:** kodstycken med rad, CI-körning på samma commit, mått (laddningstid, minne), beslutsfil som motiverar eller saknas.

**Vad linsen har sagt hittills:** 2026-11-08 (komplett analys): ingen ramverks- eller bundlerändring; prioritera tillståndskontrakt och övergångsprov före omstrukturering; Firefox och WebKit röda i releasekörningen; dokumentationsdubblett i `arkitektur.md`.

---

## 3. Historielärare med pedagogisk utbildning

*Skolan är en bonus, inte styrande (beslut 2026-11-08). Linsen används när något byggs för skolan, inte som standard.*

**Blicken:** kan jag använda det imorgon, med en hel klass, utan att förlora kontrollen eller trovärdigheten? Främjar det lärande, eller är det bara en snygg leksak?

**Frågor**
- **Läroplan och progression:** kopplar innehållet till kursplanen (Lgr22: centralt innehåll, förmågor som historiskt tänkande och källkritik)? Går det att placera in i en lektion, och är epoker i läroplanens ordning på väg (#845)?
- **Lärandemål per aktivitet:** vilket mål har varje tur, lektion och uppgift? Är frågorna "att fundera på" öppna och tankeväckande eller bara fakta?
- **Förberedelsetid:** hur lång tid från att jag hittar sidan till att jag kan köra? Lärarpaket, lärarblad, förkunskaper, tidsåtgång finns i bladet?
- **Klassrumslogistik:** projektor (läsbarhet bak i salen, kontrast), delad länk som fungerar för alla, skolnätets blockeringar (CDN), elevenheter (surfplatta, Chromebook), tid att starta.
- **Differentiering:** går det att anpassa för elever med olika läsnivå, andra modersmål (fem språk), särskilda behov (lugn rörelse, tangentbord)?
- **Bedömning och uppföljning:** exit ticket, elevblad; finns det ett sätt att se att eleven lärt sig, utan att vi samlar elevdata?
- **Källkritik som metod:** visas oenighet och osäkerhet, och kan eleven öva på att värdera källor (Källdetektiven #742)?
- **Trovärdighet och känsliga ämnen:** krig, förtryck, religion. Är framställningen balanserad, respektfull och användbar inför föräldrar? Missuppfattningar rättas utan att peka ut?
- **Barnsäkerhet och integritet:** ingen inloggning, ingen spårning, inga annonser; vad ser eleven om hen söker fritt?
- **Verklig lektionstid:** får 40–60 minuter plats; finns "döda ändar" där klassen fastnar?

**Brukar säga (hypoteser):** "Samtidighetsidén är ett bra pedagogiskt grepp, för den bryter den eurocentriska tidslinjen." "Utan en färdig lektion och ett tryckbart blad använder jag det inte." "Jag behöver veta var gränsen går mellan det som är belagt och tolkningar." "Vad händer när nätet strular i klassrummet?"

**Bevis att samla in:** gå lektionen som lärare från länk till utskrivet blad; läs lärarbladet som om det vore det enda underlaget; kontrollera mot kursplanens centrala innehåll (från Skolverkets öppna text, inte ur minnet).

**Vad linsen har sagt hittills:** ingen riktig lärare har granskat (ingen pilot, beslut 2026-11-07). Det är det **största antagandet** i skolspåret. Tills dess: blind-spots-runda för lektionsläget (2026-11-08) har hittat att lärarens väg från länk till blad är bräcklig.

---

## 4. Elev 10–13 år (åk 4–6)

**Blicken:** förstår jag vad jag ska göra, och är det roligt nog att fortsätta?

**Frågor**
- **Uppgiften:** är instruktionen så kort att jag förstår den på första försöket? Vet jag när jag är klar?
- **Språk:** korta meningar, vardagsord, förklarade begrepp; du-form (beslut 2026-11-08). Finns det ord som en tioåring inte kan?
- **Tidsuppfattning:** hjälper visualiseringen mig förstå *hur lång tid* "3000 år" är? Är det tydligt vad "f.Kr." betyder?
- **Kontroller:** stora träffytor, få val, tydlig "nästa". Kan jag inte råka bli kvar i ett läge jag inte hittar ut ur?
- **Belöning och feedback:** får jag veta att jag gjorde rätt, utan att det känns som ett prov?
- **Överväldigande:** för mycket text, för många knappar, för mycket på kartan?
- **Känsliga ämnen:** krig, död och sjukdom får visas när händelsen handlar om det; är det åldersrimligt i det som visas i åk 4–6-spåret?
- **Enhet:** funkar det på skoldator och surfplatta, med finger?

**Brukar säga (hypoteser):** "Vad ska jag trycka på?" "Det är för mycket text." "Kan jag få veta var det är?" "Kul när det dyker upp något överraskande."

**Bevis att samla in:** gå lektion 2 och Samtidighetsjakten med bara det en elev har: instruktionen och skärmen. Räkna antalet tryck till första lyckade svar. Läsbarhetsmått på texterna.

**Vad linsen har sagt hittills:** inget observerat; texterna är skrivna för åldern (du-form) men är inte provade på barn.

---

## 5. Elev 13–16 år (åk 7–9) och äldre elev

**Blicken:** är det här värt min tid, och hjälper det mig förstå *varför*?

**Frågor**
- **Respekt för åldern:** känns innehållet barnsligt eller tillräckligt allvarligt? Du/Sie-ton rätt?
- **Orsaker och sammanhang:** får jag svar på "varför hände det?" och "vad hände före och efter?", inte bara årtal?
- **Berättelseläget:** är kapitel och frågor engagerande, och hänger turen ihop (förlopp, slutkort)?
- **Källkritik:** ser jag vad som är belagt, omtvistat och okänt? Kan jag citera och hänvisa (äldre elev)?
- **Perspektiv:** ser jag andra delar av världen under samma krig eller period (andra världskriget globalt)?
- **Prov och uppgifter:** kan jag hitta det jag behöver till uppgiften, och hitta *tillbaka*?
- **Tempo:** går det att hoppa och söka, eller är jag låst i linjär tur?
- **Mobil:** jag gör det mesta på telefon; funkar allt där?
- **Äldre elev:** finns djup och exakthet (spann, osäkerhet, källregister)? Det är ett medvetet glapp i dag.

**Brukar säga (hypoteser):** "Okej, det här är faktiskt snyggt." "Kan jag skicka en länk till mina kompisar?" "Var finns källan?" "För lite om mitt land/min region."

**Bevis att samla in:** gå lektion 1 och quizet som en elev; kontrollera frågornas svårighet och att svar inte är gissningsbara; mobilflödet.

**Vad linsen har sagt hittills:** inget observerat. Quiz och lektion 1 är byggda för åldersgruppen men inte provade med elever.

---

## 6. Historieintresserad vuxen

**Blicken:** ger det mig något jag inte redan vet, och kan jag lita på det?

**Frågor**
- **Överraskning och djup:** ger Samtidigt-kortet verkliga "aha"-ögonblick? Finns det djup att gräva i (riken, krig, religioner, turer)?
- **Tillit:** källor synliga och klickbara? Visas oenighet? Känner jag att något är fel eller förenklat utan att det sägs?
- **Täckning och balans:** saknas länder, perioder eller kategorier jag bryr mig om? Slagsida mot Europa eller krig? (`tools/tackning.py`)
- **Utforskande:** hittar jag, söker jag, bläddrar jag fritt? Kan jag följa en tråd (ett land, en idé) över tid?
- **Frihet:** kan jag styra vad som syns (Lager), spara/dela min vy (Dela), eller bli guidad (Turer)?
- **Tonläge:** vuxet, inte barnsligt; inte heller akademiskt tungt.
- **Frustration:** stängda dörrar (konton), reklam, spårning, långsamhet, buggar.
- **Åter­vändande:** finns det anledning att komma tillbaka (nytt innehåll, nya turer)?
- **Delning:** vill jag skicka något jag hittat? Vad är det jag skickar?

**Brukar säga (hypoteser):** "Fantastiskt att se allt samtidigt." "Jag saknar X (ett visst land eller en viss händelse)." "Varför just dessa händelser? Vad är urvalet?" "Jag vill veta hur ni vet."

**Bevis att samla in:** en genomgång utan guide, med tid på första "aha"; täckningsrapporten; stickprov på tre påståenden: går de att följa till källan?

**Vad linsen har sagt hittills:** helhetsanalys 2026-11-06: tydlig kärnidé, fungerar som upptäcktsmiljö för nyfikna vuxna och äldre elever; källstatus transparent; ingången för en nybörjare kan bli tydligare.

---

## 7. Tillgänglighet

**Blicken:** kan alla använda sidan, oavsett förmåga och enhet? (WCAG 2.1 AA som riktmärke; ej formellt attesterat.)

**Frågor**
- **Tangentbord:** går allt att nå och använda med Tab, Enter, piltangenter och Escape? Syns fokus? Finns fällor?
- **Skärmläsare:** namn, roll och värde på kontroller; dynamiskt innehåll annonseras (`aria-live`); globens canvas ger ett begripligt alternativ?
- **Kontrast och färg:** text mot bakgrund, kontrollramar, kategorifärger som inte bara skiljs åt av nyans (färgblindhet).
- **Storlek och zoom:** 200 % zoom, text som inte klipps, träffytor 24/44 px.
- **Rörelse:** `prefers-reduced-motion` och Lugn rörelse respekteras; ingen blinkning.
- **Läsbarhet:** radlängd, typsnitt, språkattribut per språk.
- **Tidsgränser:** uppspelning som går över användarens takt kan pausas.
- **Fel och instruktioner:** begripliga, inte bara färg.

**Brukar säga (hypoteser):** "Bra grund, men ingen har bevisat skärmläsarupplevelsen i en lång tur." "Globen som bild är svår att förmedla; finns textalternativ (listorna) som är *fullvärdiga*?"

**Bevis att samla in:** automatiska kontroller (axe) kompletterade med manuell tangentbordsgenomgång; skärmläsare (NVDA, VoiceOver); kontrastmätning.

**Vad linsen har sagt hittills:** 2026-11-08: ingen skärmläsarattest, och rimliga delar saknar bevis ("Skärmläsarbeteende kan inte bevisas med enbart DOM och ARIA").

---

## 8. Historiker och källgranskare

*Ingen akademisk målgrupp (beslut 2026-11-08). Linsen är en källkritisk kontroll av innehållet, inte ett sätt att föra akademiska eller politiska diskussioner. Omstridda frågor följer Sveriges hållning (UD).*

**Blicken:** är det sant, balanserat och ärligt om sin osäkerhet?

**Frågor**
- **Källa för varje påstående:** finns den, öppnar den, stöder den påståendet? Är sekundärkälla (Wikipedia) bara det sista alternativet?
- **Osäkerhet:** visas "cirka", spann och oenighet i stället för falsk exakthet? Är siffror i fun facts uträkningsbara ur årtalen?
- **Urval och vinkel:** vad ingår och vad saknas, och är urvalet förklarat? Slagsida (Europa, krig, män, moderna perioder)?
- **Begrepp och namn:** neutrala namn, omstridda gränser och benämningar hanterade (docs/omstridda-granser.md)?
- **Bilder:** illustrationer märkta; stämning inte fakta; respekt-reglerna följs.
- **Översättning:** ändrar den fakta? Skiljer sig årtal, namn eller betydelse mellan språken?
- **Licens:** innehåll vars licens är förenlig med CC BY 4.0?

**Brukar säga (hypoteser):** "Att källan och osäkerheten syns är sällsynt och bra." "Urvalet behöver förklaras." "Vissa gränser är omstridda; hur hanteras det på kartan?"

**Bevis att samla in:** stickprov mot öppnade källsidor; jämför översatta texters siffror med svenskan; täckningsmått.

**Vad linsen har sagt hittills:** källpolicy och granskningsnivåer är dokumenterade och i bruk; en tysk betydelseändring hittades i språkgranskningen inför release (2026-11-08).

---

## 9. Barn i förskoleklass–åk 3, med en vuxen bredvid

**Blicken:** kan ett barn som inte läser flytande ha glädje av det här tillsammans med en vuxen?

**Frågor**
- **Bild före text:** bär bilder, symboler och markörer upplevelsen utan att man måste läsa?
- **Tid och språk:** förstår barnet något av "f.Kr." eller "1325"? Finns det ett annat sätt att känna "länge sedan" (till exempel mammutar, pyramider)?
- **Kontroller:** få val, stora träffytor, inget som går sönder av ett oavsiktligt tryck, tydlig väg tillbaka.
- **Vuxenstöd:** kan en vuxen snabbt visa något häftigt (en tur, ett samtidigt-kort)?
- **Innehåll:** krig, död och sjukdom: är det rimligt att barnet möter det här utan förvarning?

**Brukar säga (hypoteser):** "Mammuten!" "Vad står det?" "Kan jag trycka där?"

**Vad linsen har sagt hittills:** ingenting. Beslutat 2026-11-08: det räcker att vuxna visar barn, och barn får själva snurra och trycka. Linsen prövar alltså om utforskandet är roligt och ofarligt, inte om det går att läsa.

---

## 10. Spelaren (uppvuxen med Age of Empires, Civilization, Europa Universalis)

**Blicken:** känns det som att utforska, eller som att läsa en lektion? Det är DasKrokodils egen bakgrund och den främsta inspirationskällan.

**Frågor**
- **Lekfullhet:** finns det en vilja att "bara en minut till": nästa händelse, nästa rike, nästa samband?
- **Direkt feedback:** händer det något när man drar i tiden eller klickar, och är det belönande?
- **Karta och tid tillsammans:** känns kartan levande när tiden går, som i ett strategispel?
- **Djup utan tvång:** kan man gräva (riken, krig, religioner) men aldrig tvingas?
- **Överblick:** hittar jag, ser jag vad som är nytt, och förstår jag symbolerna utan manual?
- **Ton:** kul och nyfiken, inte pekpinne.

**Brukar säga (hypoteser):** "Det här vill jag ha ett läge för i mitt spel." "Kan jag se vem som härskade var 1100?"

**Vad linsen har sagt hittills:** inget observerat; linsen är ägarens egen riktpunkt.

---

## Fler linser att lägga till vid behov

Förälder eller hemmapedagog · bibliotekarie eller museipedagog · lärare i andra ämnen (geografi, religionskunskap) · specialpedagog · ungdom som inte intresserar sig för historia · tekniker som sköter skolnätet · journalist eller factcheckare · utvecklare som vill bidra. En ny lins följer samma mall: blick, frågor, hypoteser, bevis, "har sagt hittills".

## Att kontrollera vid uppdatering

- [ ] Har en granskning kört en lins? Skriv in fyndet och datum under "Vad linsen har sagt hittills".
- [ ] Har en hypotes bekräftats eller motsagts av en riktig observation (lärare, elev, besökare)? Skriv datum och källa och ändra ordet "hypotes".
- [ ] Saknas en lins som skulle ha hittat något vi nyligen missat? Lägg till den.
- [ ] Stämmer frågorna med funktionerna i [03](03-anvandningsfall-och-funktioner.md) och flödena i [05](05-ux-oversikt.md)?
