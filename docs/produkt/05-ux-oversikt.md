# 05. UX-översikt

**Status:** utkast 2026-11-08, genomgånget inför v6.1.0 2026-11-09 (rum, känd UX-skuld), bygger på `index.html`, [arkitektur.md](../arkitektur.md) (Mobilen, Tangentbord, Fokusläget) och granskningarna i [docs/granskningar/](../granskningar/README.md). Hur sidan **upplevs** är antaganden tills vi har användarobservationer. Utseendet (observatorietema, typsnitt, färger) är bindande enligt [CLAUDE.md](../../CLAUDE.md#utseende).

## Designidé i tre meningar

Inspirationen är strategispel som Age of Empires, Civilization och Europa Universalis, där man lär sig passivt genom att utforska. Ett mörkt observatorium: pergamentfärgat land på djupblått hav, mässing som accent. Globen är scenen och tiden är det enda man *måste* röra; allt annat är fördjupning man väljer. Källan syns alltid när man läser.

## Informationsarkitektur

Det finns sex "rum" att vara i, och man ska alltid kunna komma tillbaka till huvudbilden (globen och tidslinjen).

```
                ┌──────────────────────────────────────────────┐
  Rad överst    │ År (stort) · tidsålder          Samtidigt  Meny │   mobil: bara dessa två
                │   Dator: Vy · Utforska · Mer                    │
                ├──────────────────────────────────────────────┤
  Scen          │                                                │
                │          GLOB  /  PLATT KARTA  /  UPPTÄCKT     │
                │      markörer, riken, krigsområden, vägar      │
                │                                                │
                ├───────────────┬────────────────────────────────┤
  Läsning       │ Samtidigt-kort│ Faktaruta (dator: sida; mobil: ark)│
                ├───────────────┴────────────────────────────────┤
  Tid           │ Fokusrad · ◀ ▶ ⏵ hastighet · tidslinjebanden    │
                └──────────────────────────────────────────────┘
```

| Rum | Ingång | Vad man gör | Stängs med |
|---|---|---|---|
| **Huvudbild** | Alltid | Dra i tiden och i globen, spela | – |
| **Samtidigt i världen** | Knappen Samtidigt | Läsa per världsdel, välja händelse | Kryss, Escape |
| **Faktaruta** | Markör, lista eller sökresultat | Läsa, öppna källa, rapportera fel, följa | Kryss, Escape |
| **Sök och följ** | Knappen Sök och följ | Söka; följa krig, rike, religion, land, resa och tema. Teman ligger som första grupp under Alla och har en egen flik när minst ett publicerat tema finns; fliken Plats visar vad som hände nära en plats | Val eller Escape |
| **Intervallformulär** | Årshoppet → "Välj ett tidsintervall" | Välja från och till, eller en epok med ett klick | Avsluta intervallet, Escape |
| **Lager och Vy** | Lager, Vy | Välja vad som syns; glob / platt / upptäckt | Utanför-tryck, Escape |
| **Tur / lektion / quiz / jakt** | Turer, Mer, delad länk | Följa ett förlopp steg för steg | Avsluta, Klar, Escape |

Mer-menyn (Källor, Hjälp, För lärare, Quiz, Samtidighetsjakten, Dela) samlar det som inte är kärnflödet. **För lärare** (#1315) är ingången för den som undervisar: ett kort med lektionerna (Starta som lektion), en förklaring av utskriften av elev- och lärarblad, Quiz, Samtidighetsjakten och en knapp för presentationsläget, och det säger att ingen inloggning och inga elevkonton behövs. Hjälp har en rad "Undervisar du?" som öppnar det, och en fjärde rad, "Läs om en plats", som förklarar att de prickade konturerna runt platser med kort går att trycka på när man har zoomat in, och vad Enter gör (#1454). Språket väljs med en egen knapp i raden överst (jordglob och kod, ofärdiga språk märkta beta), så att den som inte läser svenska hittar den utan att öppna en meny (#1167).

## Huvudflöden

Antagna "lyckade vägar". Varje flöde är också en testplan: den som granskar bör faktiskt gå flödet på dator och mobil.

1. **Första besöket:** öppna → se globen och Samtidigt-kortet → (Kom igång, under Mer, och ett engångstips vid tidslinjen) → dra i tiden → klicka en händelse → läs → Källor.
2. **Utforska ett år:** skriv ett år → Samtidigt i världen per världsdel → välj → faktaruta.
3. **Följ ett krig:** Sök och följ → välj krig → uppspelning pausar vid viktiga händelser → slutkort → avsluta och komma tillbaka dit man var.
4. **Tur:** Turer → välj → steg med fråga att fundera på → slutkort med det viktigaste.
5. **Lektion:** läraren öppnar För lärare under Mer (eller Hjälp → "Undervisar du?") och väljer Starta som lektion, eller delar länken (`m=lektion`) → menyerna är dolda, år och lager låsta → band med "Visa hela globen" → elevblad och lärarblad skrivs ut. Lektionen visar alltid alla händelser i lektionens år, aldrig Översikts urval (#1139).
   - **Lärarstödet (#1139):** en gammal länk utan `g=` visar alla händelser, medan en bar länk (`historiagloben.se` utan hash) börjar i Översikt, ett urval om cirka 120 händelser. Två elever som öppnar "samma" sida kan alltså se olika saker. Be eleverna öppna länken du delar (en lektionslänk visar alltid alla händelser), eller säg att de ska välja Standard i Lager. Raden "Översikt: ett urval, cirka 120 händelser. Visa alla" överst i Samtidigt säger när det är ett urval.
   - **Vyn Framsteg (#1379):** den visar bara händelser som källan själv beskriver som framsteg, och det är få än så länge, så globen kan se nästan tom ut (till exempel år 1325). Lager (under vyvalet) och Samtidigt (överst, med "Visa alla") säger det: "Den här vyn visar bara händelser som källan själv beskriver som framsteg. Än så länge är det 2 händelser." Antalet räknas ur datan. Att dölja vyn tills det finns fler taggade händelser kräver DasKrokodils ja och är inte gjort.
6. **Dela:** Dela → länk → mottagaren ser samma vy (adressen bär år, kamera, fokus, lager).
7. **Rapportera fel:** faktaruta → Rapportera faktafel.
8. **Följ ett tema:** Sök och följ → första gruppen Teman → introduktionskort → välj händelser eller spela genom urvalet → Avsluta temat. På mobil är händelselistan hopfälld; Escape stänger först kortet och därefter temat.

**Trasig länk (#1324):** en delad länk med ett skrivfel (en tur, ett krig eller ett år som inte finns) öppnas som förut, men en rad (över tidsreglaget i bred skärm, under årtalet på mobil) säger vad som saknades och vad sidan visar i stället (”Turen ’…’ finns inte. Länken kan vara felskriven eller gammal. Globen visas utan turen.”). Raden är en status för skärmläsare, tar inte fokus, har Stäng och försvinner vid nästa handling, ett nytt år, Escape eller efter 30 sekunder. En lektionslänk till en lektion som saknas förklaras som förut av lektionsbandet, utan en andra rad. Läraren som delar en länk bör öppna den själv först. Skärmbilder: `docs/ux-review/trasig-lank-1324/`.

**Visste du? (#997):** knappen visar nästa målår före hoppet. Efter hoppet finns raden ”Från … · Tillbaka” under årtalet; ett tryck återställer året, globens riktning och zoom. Raden försvinner efter tjugo sekunder eller nästa handling, medan webbläsarens Bakåt/Framåt också fungerar. Lugn rörelse följer besökarens inställning.

## Skärmstorlekar och lägen

| Läge | Bredd | Särdrag |
|---|---|---|
| Surfplatta (iPad) | 768–1024 px | Toppraden är provad automatiskt i 768×1024, 820×1180 och 1024×768 (#992). Årtalet och förklaringsraden ligger under knapparna i bredder 761–1100 px, även när knappraden bryts. Övriga flöden och verklig iPad är inte fullständigt provade |
| Dator | ≥ 761 px (testat 1400×900, och låg höjd 1280×800 och 1366×768, #1310) | Faktaruta vid sidan, tre knappgrupper, menyer fälls ned. Under 880 px höjd är faktarutans bild lägre så att texten syns under den |
| Mobil | ≤ 760 px (testat 400×800) | Bara Samtidigt och Meny i raden överst; faktaruta och Samtidigt-kort som ark med tre lägen; globen lyfts när arket är halvt; 44 px träffytor |
| Låg höjd (#1310) | båda, under 600 px höjd | 200 % zoom av 1280×800 (640×400 CSS-px) och liggande telefon: turkortet rullar i sig självt med Nästa och Avsluta fasta längst ned, turens namn döljs i kortet (det står i turraden), faktarutans ark och bild är lägre. Provas med fönsterstorlek, inte med webbläsarens zoom. Skärmbilder före och efter: `docs/ux-review/lag-hojd-1310/` |
| Platt vy | båda | Karta med zoom och panorering; samma bild som kan skickas till en fysisk glob |
| Lektionsläge | båda | Menyerna dolda, år och lager låsta |
| Presentationsläge (#488) | dator (≥ 761 px) | Större text och knappar för projektor och storskärm. Slås på med knappen i För lärare (utan omladdning; adressen får `?presentation=1`) eller med en äldre länk med parametern; Avsluta uppe i raden stänger det på stället (utan omladdning) och behåller vyn och lärarens roll i en lektion. Knappen visas inte i mobilbredd, där Avsluta täcker årtalet (känt fel i läget, #1457) |
| Utskrift | A4 | Elev- och lärarblad, svart på vitt |

## Lägen att alltid prova (blind-spots-listan)

Fel hittas sällan i "lyckat flöde". Granskare ska prova dessa lägen, och ett fynd som testet missade ska leda till en ändrad testmetod (CLAUDE.md, UX-genomgång):

- **Tomt:** år utan händelser, filter som ger inga träffar, kategori utan innehåll.
- **Delvis:** händelse utan bild, text bara på svenska i ett annat språk, rike utan alla perioder.
- **Blandat:** händelser med och utan bild i samma lista.
- **Laddning och fel:** långsam laddning, misslyckad bildhämtning, ingen grafikaccelerering (WebGL), blockerat CDN.
- **Övergångar:** byta språk mitt i en tur, avsluta lektionsläget, öppna en delad länk med Fokus, bakåt-knappen, paus och byte under uppspelning.
- **Inmatning:** bara tangentbord, bara touch, 200 % zoom, lugn rörelse på.
- **Skillnad urval mot full lista:** är det tydligt vad som visas och vad som inte gör det?

## Tillgänglighet i korthet

Det som finns: tangentbord (Tab, Enter, piltangenter på globen), globen som region med `aria-roledescription`, minst 24 px träffyta på dator och 44 px på mobil, kontrastvariabel för kontrollramar, lugn rörelse som respekterar `prefers-reduced-motion`, webbläsarens egen zoom tillåten. **Inte bevisat:** skärmläsarupplevelse, full tangentbordssekvens, färgblindhet för kategorifärger. Se [06](06-granskningsperspektiv.md#7-tillgänglighet).

## Språk och ton

Tidslinjens uppspelning, hastighet och dagsteg, årshoppets meddelanden, Platt vys klungnamn, affischens etiketter och Om källornas gränssnitt hämtar sina texter ur `data/ui/` på alla fem språk (#672). Källors egna titlar, krediter och licensnamn behålls som innehåll.

Fem språk (sv, en, de, es, fr); svenska först, saknas ett språk visas engelska och sedan svenska. **Artigt tilltal** (`Sie`, `usted`, `vous`) i gränssnittet och för vuxna, **du-form** för elever till och med 13 år (beslut 2026-11-08). Fakta skrivs opersonligt. Illustrationer märks alltid; respekt-reglerna för bilder står i CLAUDE.md.

## Känd UX-skuld

Det här är pekare, inte en backlog. Källan är den daterade rapporten; fynden hanteras som issues.

| Område | Kort | Källa |
|---|---|---|
| Mobil faktaruta bakom lektionskortet | Läsning och Stäng blockeras i 400×800 | blind-spots-rapport (PR #871, F7), komplett analys 2026-11-08 |
| Lektionslänk döljer utskriften | Lärarens väg från länk till blad | blind-spots-rapport F1 |
| Tyst laddningsreserv, slutsteg utan uppläsningssignal | Skärmläsare och laddning | blind-spots-rapport F2, F3 |
| Mobilkortet täcker tidslinjen i startläget | Kortet och kontrollerna konkurrerar | helhetsanalys 2026-11-06 (kontrollera om åtgärdat) |
| Reservpresentation vid bildfel | Bildyta och kredit finns kvar utan bild | blind-spots-rapport F8 |
| Surfplatta: övriga flöden återstår | Toppradens överlapp är åtgärdat och provat i tre iPad-format (#992); övrig trängsel och träffytor behöver fortfarande prövas | beslut 2026-11-08; R9 i [04](04-arkitekturoversikt.md), #992 |
| Intervallformuläret för skärmläsare | Dubbla årtal i epokknappar, rubriker som `<p>`, ingen uppläsning när intervallet väljs, platsfältets `aria-label` | #977, granskningen inför 6.1.0 (PR #972); väntar till nästa release |
| Länk med år utanför tidslinjen | `#y=-20000&y2=3000` ger ett intervall som inte finns | #976, samma granskning; väntar till nästa release |
| Datumformat på de, es och fr | "4 Juli 1776" skrivs på svenskt vis | #983; väntar till nästa release |
| Översättningsluckor i gränssnittet | Svensk feltext i annat språk | översättningsspärren; #672 |

## Att kontrollera vid uppdatering

- [ ] Har en ny vy, meny eller ett nytt läge tillkommit? Uppdatera rum-tabellen, flödena och lägena.
- [ ] Har ett fynd i tabellen åtgärdats? Ta bort det och skriv i [06](06-granskningsperspektiv.md) vad det lärde oss.
- [ ] Är skärmbilderna eller ASCII-skissen fortfarande rättvisande?
- [ ] Gå minst flöde 1, 3 och 5 på dator och mobil innan release.
