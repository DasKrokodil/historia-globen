# Backlogggranskning – Historia-globen (2026-11-07)

**Status:** extern rådgivande granskning. **Ingen ändring av issues eller arbetsordning är beslutad genom denna rapport.**

## Underlag och metod

GitHub-sökning i `DasKrokodil/historia-globen` gav **136 öppna issues i de använda datumindelade sökresultaten** den 7 november 2026. Granskningen innefattade en översikt av dessa titlar och issuebeskrivningar, fördjupning av ett antal högriskärenden samt läsning av `CLAUDE.md`, `.orchestra/project.md` och `docs/granskningar/2026-11-07-plan-version-6.md`. Antalet är en sökresultatsräkning, **inte en verifierad totalinventering av allt som kan finnas i GitHub Projects**. Granskningen omfattar inte en fullständig kod- eller individuell detaljgranskning av varje issue. Förslag är inte bekräftade programfel.

## Övergripande bedömning

De nyare genomförandeuppgifterna har ofta filhänvisningar, testkrav och beroenden. Äldre samlings- och idéissues kan vara avsiktligt öppna; dessa ska **inte** betraktas som körklara bara för att de ligger i backloggen. Det viktigaste är att förtydliga riskutsatta issues innan de sätts till `redo`, snarare än att skriva om allt eller starta nya processer. Bevara beslutad releaseordning, källpolicy, agentfördelning och regeln att Rikard ensam beslutar om arkitekturförändringar.

## Rekommendationer per issue

| Prioritet | Issue | Föreslagen konkret komplettering | Kontroll före åtgärd |
| --- | --- | --- | --- |
| P1 | [#788](https://github.com/DasKrokodil/historia-globen/issues/788) Instabilt webbläsartest | Reproducera med fördröjd detaljladdning; behåll öppet `details`-tillstånd under omritning; vänta på färdig data i testet utan att försvaga assertionen. | Issuet beskriver redan trolig orsak och åtgärd; förstärk bara vid nytt fynd. |
| P1 | [#741](https://github.com/DasKrokodil/historia-globen/issues/741) Samtidighetsjakten | Lägg in testfall som bevisar att uppdragets tidsfönster, synlighetsregler och minst tre olika världsdelar ger tre faktiska valbara händelser. Ta ställning till om långa tidsspann som endast överlappar marginellt är pedagogiskt godtagbara. | Behåll beslutad intervallöverlappning tills annat beslut fattats. |
| P1 | [#795](https://github.com/DasKrokodil/historia-globen/issues/795) Lektionsläge | Testa direktlänk, omladdning, bakåt/framåt, tangentbordsfokus, avslut via ”Visa hela globen”, turens slut och återgång till normalt läge. | Många krav finns redan; undvik upprepning. |
| P1 | [#760](https://github.com/DasKrokodil/historia-globen/issues/760) Källstyrd kandidatlista | Dokumentera ett urvalskriterium för relevans och global balans utöver källbelagt datum/plats, och gör dubblett-/osäkerhetskontroll explicit per kandidat. | Följer redan etablerad källpolicy. |
| P2 | [#398](https://github.com/DasKrokodil/historia-globen/issues/398) Temamotor | Besluta om `data/vyer.json` ska utökas eller om `data/teman.json` krävs. Visa en enda pilot med acceptanskriterium som förhindrar dubbla representationsmodeller. | Arkitekturbeslut kräver Rikards godkännande. |
| P2 | [#575](https://github.com/DasKrokodil/historia-globen/issues/575) Upptäckt yta | Gör etiketten ”andel yta som täcks av våra data” obligatorisk; testa area-viktningen och visa ofullständighet. | Etisk och metodisk reservation finns redan i issuet. |
| P2 | [#60](https://github.com/DasKrokodil/historia-globen/issues/60) Satellitbanor | Skilj uppskjutningsdatum från historisk position; avgör om banor ska vara historiskt rekonstruerade eller schematiska. James Webb följer inte en vanlig låg jordbana. | Verifiera orbitala uppgifter mot relevanta rymdmyndighetskällor före implementation. |
| P2 | [#249](https://github.com/DasKrokodil/historia-globen/issues/249) Historisk kartöverlagring | Beskriv hur äldre kartors projektion, ofullständighet och förvrängningar visas; originalkartans perspektiv och geometrisk passning kan vara oförenliga. | Även rättigheter och kartkälla ska verifieras. |
| P2 | [#57](https://github.com/DasKrokodil/historia-globen/issues/57) Flygflöden | Märk 2019–2020-data som historiska exempel, inte realtid. Bekräfta licensen för det **specifika datasetet**. | Ändra inte datakällan utan beslutad licenskontroll. |
| P2 | [#756](https://github.com/DasKrokodil/historia-globen/issues/756) Intervall, del 3 | Byt ut subjektiva ”rimlig bildfrekvens” mot mätbar tröskel grundad på #752:s prestandarapport. | Beslut om slutårsrepresentation finns redan. |
| P2 | [#786](https://github.com/DasKrokodil/historia-globen/issues/786) Källstatus kontra historisk osäkerhet | Testa med elev att ”två jämförda källor” inte förväxlas med ”exakt datering”; skilj explicit granskningsnivå och historisk osäkerhet. | Issuet har redan ett bra förslag och ligger efter skolpiloten. |
| P3 | [#744](https://github.com/DasKrokodil/historia-globen/issues/744) Verklig pilotlektion | Använd #743:s observationsprotokoll till konkreta observationer om starttid, missförstånd, avbrott, uppgiftsresultat och skoldatorns beteende. | Ingen ny parallell pilotprocess. |

### Överlappningar att hantera innan implementation

- [#103](https://github.com/DasKrokodil/historia-globen/issues/103), [#557](https://github.com/DasKrokodil/historia-globen/issues/557) och [#579](https://github.com/DasKrokodil/historia-globen/issues/579): jämför modell för geografiska fördjupningar, men behåll skillnaden mellan kurerade regionkort, tidsordnade händelser och landsvyer.
- [#102](https://github.com/DasKrokodil/historia-globen/issues/102)–[#106](https://github.com/DasKrokodil/historia-globen/issues/106) och [#398](https://github.com/DasKrokodil/historia-globen/issues/398): låt temamotorns arkitektur styra nya specialvyer; undvik egna parallella vyformat.
- [#56](https://github.com/DasKrokodil/historia-globen/issues/56) och [#399](https://github.com/DasKrokodil/historia-globen/issues/399): pröva gemensam flödesrendering för historiska och moderna data; skilda tids-/källsemantiker kan fortfarande behövas.
- [#49](https://github.com/DasKrokodil/historia-globen/issues/49), [#396](https://github.com/DasKrokodil/historia-globen/issues/396), [#569](https://github.com/DasKrokodil/historia-globen/issues/569) samt förstudien [#775](https://github.com/DasKrokodil/historia-globen/issues/775): kontrollera kompatibiliteten mellan tidsmodeller innan arkitekturen utökas.
- [#250](https://github.com/DasKrokodil/historia-globen/issues/250), [#469](https://github.com/DasKrokodil/historia-globen/issues/469), [#472](https://github.com/DasKrokodil/historia-globen/issues/472): återanvänd gemensamma uppdragsregler, men slå inte automatiskt samman olika upplevelser.

## Föreslagna kompletterande kontroller (först efter dubblettkontroll)

1. **Datavalidering för elevuppdrag:** varje konfigurerat uppdrag ska ha tillräckligt många faktiska, synliga och källkontrollerade kandidater; koppla till #741 eller befintligt test i stället för nytt issue som standard.
2. **Mätbar skolpilot:** samla anonymt observerbara problem och användarflöden via #743 och #744. Ingen elevprofil eller insamling av persondata.
3. **Historisk representativitet:** använd täckningsverktyget och kandidatrapporten för att analysera relevans, balans och dokumenterade begränsningar – inte enbart kvantiteter.
4. **Beroende- och filkrockskontroll:** kontrollera att föregående PR är mergad, `redo` inte sätts för tidigt och att `data/ui/`, `js/url-state.js` samt `js/ui/tour.js` inte kolliderar. Detta ska nyttja orkesterns **befintliga** kökontroll.

## Rekommenderad ordning

1. Stabilitet: #788 och aktuella releaseblockerare.
2. Färdigställ redan beslutad Version 6 och utvärdera faktisk användning: #741, #795, #743, #744 enligt beroenden och godkänd plan; undvik scope creep.
3. Källkvalitet och täckning: #760 och de redan uppdelade innehållsissuena.
4. Förstudier och arkitektur: #775/#396 och #398 – **kräv Rikards beslut**.
5. Framtida idéer: förtydliga #249, #57, #60 m.fl. när respektive version närmar sig.

## Checklista för `redo` (förslag, ingen ny obligatorisk process)

- [ ] Problem, användarnytta och omfattning är tydliga.
- [ ] Utanför scope framgår.
- [ ] Beroenden och öppna PR-/filkrockar är kontrollerade.
- [ ] Acceptanskriterier går att verifiera objektivt.
- [ ] Test-, käll- och licenskrav är angivna där det behövs.
- [ ] Inga kvarstående beslut som Rikard ensam ska fatta.
- [ ] Agent/ansvarig är rätt enligt `CLAUDE.md` och orkesterpolicyn.

## Instruktion till Claude Code inför eventuell uppföljning

**Denna rapport är rådgivande, inte en byggorder.** Jämför varje förslag med nuvarande issue, kommentarer, beslut, redan mergade PR:er och aktiv milstolpe. Rapportera **endast sådant som fortfarande saknas**. Skapa inte dubbletter. Ändra inte labels, milstolpar, andra filer, issues eller arbetsrutiner utan Rikards beslut. Föreslå i första hand korta förtydliganden i befintliga issues. Behåll källkontroll, testkvalitet och begränsningarna för Codex/Claude Code.

## Referenser

- [Öppna GitHub-issues](https://github.com/DasKrokodil/historia-globen/issues)
- [CLAUDE.md](../../CLAUDE.md)
- [Orkesterns projektpolicy](../../.orchestra/project.md)
- [Godkänd plan för Version 6](2026-11-07-plan-version-6.md)
