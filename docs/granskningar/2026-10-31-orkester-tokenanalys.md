# Historia-globen: analys av dirigent, orkester och resursanvändning

**Datum:** 2026-10-31

**Granskad utvecklingsgren:** `main` på commit `d5bb9081db95506629a84b68f1bcdccf0eb5de87`

**Senaste release:** `v4.1.1` på commit `78547071625df2976fe16020fa214fd951971947`

**Omfattning:** arbetssätt, tokenåtgång, parallellism, testkostnad, PR-flöde och kvalitetskontroll. Ingen kod har ändrats.

## Kort slutsats

Arbetssättet har en bra kvalitetskärna: avgränsade pass, högst fyra pull requests, starkare modell för fakta, egna arbetskopior och obligatorisk dirigentgranskning. Granskningen ska inte tas bort; i första orkesterpasset hittade den rättningar i **4 av 8 leveranser**.

Den största möjliga besparingen ligger i stället i tre saker:

1. **Sluta läsa all projektdokumentation inför varje uppgift.** De filer som policyn nu säger ska läsas först motsvarar grovt cirka **54 400 tokens per agent**, innan issue, kod och verktygsresultat räknas in.
2. **Använd en arbetare som norm, inte tre.** Två eller tre arbetare ska bara startas när uppgifterna är verkligt oberoende och inte rör samma centrala filer eller en beroendekedja.
3. **Anpassa kontrollen efter risk.** Fullt lokalt webbläsartest, samma fulla test i CI och dirigentens omtest behövs inte för varje ren dokumentations- eller dataändring. Dirigentens sakgranskning och full kontroll av riskfyllda ändringar ska däremot behållas.

Min rekommendation är ett **dirigentlett, kontextroutat arbetssätt**: dirigenten löser oklarheter en gång, skickar ett kort beslutspaket till minsta nödvändiga antal arbetare och granskar resultatet mot tydliga bevis.

## Vad analysen bygger på

- Projektets aktuella `CLAUDE.md`, `.orchestra/project.md` och orkesterns gemensamma regler.
- `docs/beslut.md`, `docs/kallor.md`, `docs/datamodell.md` och `docs/arkitektur.md`.
- Git-historiken och GitHubs PR-flöde fram till ovanstående commit.
- [Issue #159: Orkestern blir permanent](https://github.com/DasKrokodil/historia-globen/issues/159), inklusive utfallet från första passet.
- [Release v4.1.1](https://github.com/DasKrokodil/historia-globen/releases/tag/v4.1.1).

Det finns ingen faktisk tokenlogg i repot. Tokenvärdena nedan är därför **storleksuppskattningar** baserade på cirka fyra tecken per token, inte fakturerade värden. Prompt-cache kan sänka kostnaden, men den stora kontexten tar fortfarande plats och kan försämra agentens fokus.

## Nuläge och flaskhalsar

### 1. Startkontexten är för stor

Nuvarande projektpolicy säger att följande ska läsas först:

| Fil | Storlek | Grov tokenuppskattning |
| --- | ---: | ---: |
| `CLAUDE.md` | 20 194 tecken | 5 048 |
| `docs/beslut.md` | 53 238 tecken | 13 310 |
| `docs/kallor.md` | 15 277 tecken | 3 819 |
| `docs/datamodell.md` | 48 787 tecken | 12 197 |
| `docs/arkitektur.md` | 70 855 tecken | 17 714 |
| `.orchestra/project.md` | 9 206 tecken | 2 302 |
| **Summa** | **217 557 tecken** | **cirka 54 400 tokens** |

Med gemensamma orkesterinstruktioner blir den potentiella startmängden ungefär **66 500 tokens**. Om tre arbetare var och en läser bara de obligatoriska projektfilerna upprepas cirka **163 000 tokens**. Med dirigenten blir samma projektdokumentation cirka **218 000 tokens**, innan någon har läst själva issuet eller koden.

Detta är den tydligaste onödiga kostnaden. De långa dokumenten är värdefulla som referens, men olämpliga som obligatorisk startprompt för varje liten CSS-, text- eller dataändring.

### 2. Maximal parallellism riskerar att bli ett mål

Policyn tillåter tre samtidiga arbetare. Det är bra som tak, men tre arbetare är bara effektivare när:

- uppgifterna inte har beroenden,
- de inte ändrar samma centrala filer,
- varje leverans är begriplig och testbar ensam,
- besparad kalendertid är större än kostnaden för tre kontexter, tre arbetskopior och sammanslagning.

Repots historik innehåller både beroendekedjor och många ändringar nära varandra i centrala filer och gemensamma dataregister. I sådana fall ökar parallellism integrationsarbete, ombasering, testkö och risken att en arbetare bygger på ett snart inaktuellt antagande.

### 3. PR-flödet är snabbare än människans granskningskapacitet

Första passet gav åtta issues och nio pull requests på cirka två timmar. Det ledde redan till regeln högst fyra pull requests per pass. GitHub visar dessutom **127 sammanslagna pull requests från tidpunkten då #159 skapades till denna granskning**. Siffran omfattar hela repots PR-flöde och kan inte säkert tillskrivas orkestern ensam, men den visar mycket hög förändringstakt.

Kostnaden är inte bara agenttokens. Varje PR skapar mänsklig granskning, CI, mergearbete, konfliktrisk och ny kontext i nästa uppgift. Ett issue per verkligt självständig leverans är bra; ett PR per liten teknisk del i en beroendekedja är ofta dyrare än ett sammanhållet PR.

### 4. Kvalitetsgranskningen är värdefull

Att dirigenten hittade rättningar i hälften av första passets leveranser är ett starkt argument för att behålla:

- diffgranskning,
- kontroll mot acceptanskriterier,
- visuell kontroll när gränssnittet ändras,
- självständig källkontroll vid faktaarbete.

Besparingen ska därför tas **före och runt granskningen**, inte genom att hoppa över den.

### 5. Samma bevis kan produceras flera gånger

Nu kan en UI-ändring innebära att arbetaren kör full webbläsarkontroll lokalt, CI kör samma grundflöde igen och dirigenten provar delar på nytt. Det är rimligt för kärnrendering, tidslinje, mobil layout eller releasekritiska ändringar, men överdrivet för exempelvis en isolerad dokumentationsändring.

## Rekommenderat arbetssätt

### A. Låt dirigenten välja läge innan någon arbetare startas

- Prioritet: hög
- Storlek: liten

| Typ av uppgift | Bemanning | Modellnivå | Rekommenderad kontroll |
| --- | --- | --- | --- |
| Stavning, dokumentation, en liten konstant | Dirigenten direkt eller 1 billig arbetare | Låg | Riktad diff- och syntaxkontroll |
| Avgränsad UI- eller kodändring | 1 arbetare + dirigentgranskning | Billigare arbetare, stark dirigent | Riktat test och relevant skärmbild |
| Fakta, årtal, källor eller historisk data | 1 arbetare eller dirigenten | Samma starka nivå som dirigenten | Källa öppnas, schema och sakuppgifter kontrolleras |
| Arkitektur, datamodell, säkerhet eller central rendering | Dirigenten + högst 1 arbetare till att börja med | Stark | Relevant full testmatris och integrationsprov |
| Flera likadana, helt separata innehållspaket | 2–3 arbetare | Efter att mönster och fakta låsts | Gemensam validator, stickprov och sammanslagningstest |

**Grundregel:** en arbetare är standard. Tre är en särskild optimering, inte normal drift.

### B. Ersätt full läsning med en kontextrouter

- Prioritet: hög
- Storlek: medel

Behåll dokumenten, men ändra regeln från ”läs allt först” till:

1. Läs en kort stabil kärna med säkerhet, licens, branchregler och absoluta förbud.
2. Läs issue och dirigentens beslutspaket.
3. Slå upp bara de avsnitt som uppgiftens etiketter, sökord och filsökvägar kräver.
4. Sök i beslutsloggen efter relevanta begrepp; läs inte hela loggen.
5. Läs relevanta kodfiler och närmaste tester.

Exempel på routing:

| Utlösare | Kontext som laddas |
| --- | --- |
| `data`, `faktafel`, `källkontroll`, ändring i `data/` | Källpolicy, relevant del av datamodellen, berörda tidigare beslut |
| `utseende`, CSS eller panelkomponent | UI-regler, relevant arkitekturdel, mobil- och tillgänglighetskrav |
| Lager eller renderer | Lagerarkitektur, tillstånd, ritordning och relevanta beslut |
| Deployment eller cache | Deployment-/releaseavsnitt, inte historik- och källdokument |
| Bara dokumentation | Kärnregler och de dokument som faktiskt redigeras |

Föreslagna mål:

- stabil kärnkontext: högst **3 000–5 000 tokens**,
- dirigentens uppdragsbrief: högst **1 000 tokens**,
- domänspecifik referens: normalt **3 000–6 000 tokens**,
- total kontext före relevant kod för en vanlig arbetare: normalt **under 12 000 tokens**.

Det skulle kunna minska den upprepade projektkontexten med ungefär 70–85 procent utan att regler tas bort.

### C. Använd ett kort beslutspaket från dirigenten

- Prioritet: hög
- Storlek: liten

Dirigenten ska lösa oklarheter en gång och ge arbetaren ett paket på cirka 300–800 ord:

```markdown
## Uppgift
- Issue och önskat användarresultat

## Omfattning
- Filer eller delsystem som får ändras
- Sådant som uttryckligen inte ingår

## Beslut och bevis
- Relevant tidigare beslut
- Källor eller verifierade fakta
- Beroenden och aktuell bascommit

## Klar när
- 3–6 observerbara acceptanskriterier

## Kontroll
- Exakta kommandon eller scenarier
- Vilka skärmbilder eller mätvärden som krävs

## Stanna och fråga om
- Definierade osäkerheter som inte får gissas
```

Skicka inte hela chatthistoriken, hela kön eller fullständiga dokument till arbetaren. Arbetaren ska kunna följa länkar eller läsa ett extra avsnitt om en uttrycklig stoppregel träffas.

### D. Gör parallellismen beroende av konflikt- och beroenderisk

- Prioritet: hög
- Storlek: liten

Starta två eller tre arbetare bara om dirigenten kan svara ja på alla följande:

- Leveranserna har inga inbördes beroenden.
- De ändrar inte samma centrala filer eller genererade index.
- De kan verifieras separat.
- En misslyckad leverans blockerar inte de andra.
- Det finns faktisk tidsvinst trots webbläsartestkön.

Kör seriellt eller som ett enda sammanhållet PR när flera delar bygger på varandra. Undvik staplade PR-kedjor för små delsteg. För dataomgångar kan flera likartade poster däremot med fördel samlas i ett issue och ett PR när de delar schema, validator och acceptanskriterier.

### E. Inför tre testnivåer

- Prioritet: medel
- Storlek: medel

1. **Riktad kontroll:** dokumentation, statiska texter och mycket små isolerade ändringar. Diff, syntax, länk eller relevant validator.
2. **Komponentkontroll:** data, en panel eller ett lager. Schema/validator plus ett avgränsat browserflöde och relevant skärmbild.
3. **Full kontroll:** central JavaScript, renderer, tidslinje, mobil layout, dataladdning, arkitektur, beroenden och release. Dator + mobil, konsol, full browser smoke och integrationsprov.

CI bör fortfarande skydda `main`, men samma fulla lokala flöde behöver inte köras flera gånger om ändringens risk inte motiverar det. Dirigenten ska i första hand granska arbetarens bevis och bara köra om testet vid konkret misstanke, bristfälligt bevis eller hög risk.

### F. Behåll max fyra PR men sänk standarden

- Prioritet: hög
- Storlek: liten

- **Standardpass:** 2–3 PR.
- **Fyra PR:** bara för självständiga och lågriskmässiga leveranser.
- **Ett PR:** vid arkitektur, central UI eller beroendekedja.
- Pausa nya tilldelningar om dirigenten hittar en väsentlig rättning i någon av de två första leveranserna; slutför och lär av felet innan fler likadana uppgifter startas.

Detta minskar samtidigt projektägarens granskningskö och risken att samma missförstånd sprids till tre arbetare.

### G. Skriv resultatet en gång

- Prioritet: medel
- Storlek: liten

Använd ett gemensamt, kort evidensblock som återanvänds i issue-kommentar, PR och slutrapport:

- ändrat användarresultat,
- viktigaste filer,
- körda kontroller och utfall,
- skärmbilder eller källor,
- kända begränsningar.

Undvik tre långa omskrivningar av samma arbete. Det sparar outputtokens och gör granskningen snabbare.

## Föreslagna ändringar i orkesterreglerna

Detta är en rekommenderad text att lämna till Claude Code; den är inte genomförd i repot:

```markdown
## Resurspolicy

- En arbetare är standard. Två eller tre används bara för oberoende leveranser utan gemensamma centrala filer eller beroenden.
- Dirigenten väljer direktarbete, en arbetare eller parallell körning efter total kostnad: agentkontext, tester, integrationsrisk och mänsklig PR-granskning.
- Arbetare läser kärnreglerna, issue, uppdragsbrief och routad domänkontext. Långa referensdokument och hela beslutsloggen läses inte som standard.
- Dirigenten skickar inte hela chatten, hela kön eller fullständiga generella dokument. Briefen innehåller mål, avgränsning, beslut, acceptanskriterier, kontroll och stoppregler.
- Full webbläsarkontroll används för ändringar som kan påverka körning, rendering eller layout. Lågriskändringar använder riktad kontroll. Granskning och källkontroll hoppas aldrig över.
- Passets tak är fyra PR, men normalstorleken är två till tre. Beroende delsteg samlas när de inte är självständigt värdefulla och testbara.
- Vid väsentlig rättning i en tidig leverans pausas nya likadana tilldelningar tills orsaken har förts tillbaka till brief, kontextrouter eller testkrav.
```

Tekniskt kan detta stödjas av:

- en kort `.orchestra/context-map.md` med etikett-/sökvägsrouting,
- ett standardiserat `.orchestra/brief-template.md`,
- ett tematiskt index över `docs/beslut.md`,
- korta aktuella sammanfattningar i början av `docs/arkitektur.md` och `docs/datamodell.md`, medan detaljerna fortsätter vara referens,
- ett deterministiskt verktyg som hämtar en kompakt kölista i stället för att mata hela GitHub-kön till modellen.

## Mät så att optimeringen blir verklig

- Prioritet: medel
- Storlek: medel

Mät per avslutat issue, inte bara per agentanrop:

| Mått | Varför |
| --- | --- |
| Totala input-, cache- och outputtokens | Visar faktisk modellkostnad när miljön exponerar värdena |
| Kontextstorlek före relevant kod | Avslöjar överläsning även utan tokenrapportering |
| Antal arbetare och verktygsanrop | Visar orkestreringskostnad |
| Tid till färdig teknisk leverans, exklusive väntan på människa | Gör pass jämförbara |
| Förstagångsgodkända leveranser | Mäter briefens kvalitet |
| Väsentliga dirigenträttningar | Mäter kvalitetsrisk; ska inte döljas för att spara tokens |
| Omkörda tester och orsak | Avslöjar dubbelarbete och instabilitet |
| PR per pass och PR med beroende till annat öppet PR | Mäter mänsklig granskningsbörda och integrationsrisk |
| Regressioner efter merge | Säkerställer att besparing inte köps med sämre kvalitet |

Ett användbart huvudmått är:

> **Total resurs per accepterat issue** = alla agenttokens + uppstarts-/testarbete + dirigenträttningar + integrationsarbete.

### Föreslaget försök

1. Samla baslinje från 10–20 genomförda issues.
2. Kör nästa 10–20 med en arbetare som standard och routad kontext.
3. Jämför samma typer av uppgifter, inte faktaarbete mot stavningsfixar.
4. Behåll ändringen om tokenmängd och ledtid sjunker utan fler regressioner eller större rättningsgrad.

Inledande mål kan vara:

- minst 60 procent mindre generell startkontext,
- högst 2–3 PR i ett normalpass,
- färre fulla testomkörningar utan konkret orsak,
- oförändrad eller lägre andel dirigenträttningar,
- oförändrad regressionsnivå.

## Det som redan är bra och bör behållas

- Avgränsade pass i stället för en ständigt aktiv autonom kö.
- Högst fyra PR som ett absolut tak.
- En arbetskopia per arbetare.
- Samma starka modellnivå för fakta, årtal, källor och historisk data.
- Obligatorisk dirigentgranskning.
- Serialiserade webbläsartester när miljön kräver det.
- Sammanslagningstest när flera öppna orkester-PR faktiskt behöver fungera ihop.
- Projektägaren behåller mergebeslutet.

## Prioriterad genomförandeordning

1. **Ändra ”läs allt först” till kontextrouting.** Störst sannolik tokenvinst och låg kvalitetsrisk.
2. **Gör en arbetare till standard.** Lägg till tydliga villkor för två och tre.
3. **Inför beslutspaketet och stoppregler.** Minskar både frågor och omarbete.
4. **Dela tester i risknivåer.** Behåll full kontroll för kärnfunktioner.
5. **Mät per accepterat issue under 10–20 uppgifter.** Utan mätning går faktisk kostnad inte att skilja från uppskattning.
6. **Justera PR-storlek och batching utifrån mätningen.** Optimera för både agentkostnad och projektägarens granskningskapacitet.

## Samlad bedömning

Dirigent och orkester passar Historia-globen, särskilt eftersom projektet kombinerar UI, geodata och källkänslig historia. Dagens system är dock mer **kontexttungt och parallellt** än vad de flesta uppgifter behöver. Den bästa nästa versionen är inte en större orkester utan en bättre dirigent: en som routar kunskap, startar minsta effektiva ensemble, kräver precis rätt bevis och mäter kostnaden per godkänd leverans.
