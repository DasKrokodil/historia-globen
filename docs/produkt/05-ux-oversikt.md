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
| **Sök och följ** | Knappen Sök och följ | Söka; följa krig, rike, religion, land, resa, tema (fliken Teman syns först när det finns ett); fliken Plats: vad hände här | Val eller Escape |
| **Intervallformulär** | Årshoppet → "Välj ett tidsintervall" | Välja från och till, eller en epok med ett klick | Avsluta intervallet, Escape |
| **Lager och Vy** | Lager, Vy | Välja vad som syns; glob / platt / upptäckt | Utanför-tryck, Escape |
| **Tur / lektion / quiz / jakt** | Turer, Mer, delad länk | Följa ett förlopp steg för steg | Avsluta, Klar, Escape |

Mer-menyn (Källor, Hjälp, Quiz, Samtidighetsjakten, Dela, Språk) samlar det som inte är kärnflödet.

## Huvudflöden

Antagna "lyckade vägar". Varje flöde är också en testplan: den som granskar bör faktiskt gå flödet på dator och mobil.

1. **Första besöket:** öppna → se globen och Samtidigt-kortet → (Kom igång, under Mer, och ett engångstips vid tidslinjen) → dra i tiden → klicka en händelse → läs → Källor.
2. **Utforska ett år:** skriv ett år → Samtidigt i världen per världsdel → välj → faktaruta.
3. **Följ ett krig:** Sök och följ → välj krig → uppspelning pausar vid viktiga händelser → slutkort → avsluta och komma tillbaka dit man var.
4. **Tur:** Turer → välj → steg med fråga att fundera på → slutkort med det viktigaste.
5. **Lektion:** lärare delar länken (`m=lektion`) → menyerna är dolda, år och lager låsta → band med "Visa hela globen" → elevblad och lärarblad skrivs ut.
6. **Dela:** Dela → länk → mottagaren ser samma vy (adressen bär år, kamera, fokus, lager).
7. **Rapportera fel:** faktaruta → Rapportera faktafel.

## Skärmstorlekar och lägen

| Läge | Bredd | Särdrag |
|---|---|---|
| Surfplatta (iPad) | 768–1024 px (**ej provat särskilt**) | Faller över mobilbrytpunkten (≤ 760 px) och får datorns layout. Eftersom många antas läsa på iPad bör liggande och stående läge prövas |
| Dator | ≥ 761 px (testat 1400×900) | Faktaruta vid sidan, tre knappgrupper, menyer fälls ned |
| Mobil | ≤ 760 px (testat 400×800) | Bara Samtidigt och Meny i raden överst; faktaruta och Samtidigt-kort som ark med tre lägen; globen lyfts när arket är halvt; 44 px träffytor |
| Platt vy | båda | Karta med zoom och panorering; samma bild som kan skickas till en fysisk glob |
| Lektionsläge | båda | Menyerna dolda, år och lager låsta |
| Presentationsläge | (att verifiera) | Länken "Avsluta presentationsläge" finns i sidhuvudet; läget är inte beskrivet här än |
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
| Surfplatta (iPad) inte särskilt provad | Stående iPad (768–820 px) får datorns layout; kontrollera trängsel och träffytor | beslut 2026-11-08; R9 i [04](04-arkitekturoversikt.md) |
| Intervallformuläret för skärmläsare | Dubbla årtal i epokknappar, rubriker som `<p>`, ingen uppläsning när intervallet väljs, platsfältets `aria-label` | #977, granskningen inför 6.1.0 (PR #972); väntar till nästa release |
| Länk med år utanför tidslinjen | `#y=-20000&y2=3000` ger ett intervall som inte finns | #976, samma granskning; väntar till nästa release |
| Datumformat på de, es och fr | "4 Juli 1776" skrivs på svenskt vis | #983; väntar till nästa release |
| Översättningsluckor i gränssnittet | Svensk feltext i annat språk | översättningsspärren; #672 |

## Att kontrollera vid uppdatering

- [ ] Har en ny vy, meny eller ett nytt läge tillkommit? Uppdatera rum-tabellen, flödena och lägena.
- [ ] Har ett fynd i tabellen åtgärdats? Ta bort det och skriv i [06](06-granskningsperspektiv.md) vad det lärde oss.
- [ ] Är skärmbilderna eller ASCII-skissen fortfarande rättvisande?
- [ ] Gå minst flöde 1, 3 och 5 på dator och mobil innan release.
