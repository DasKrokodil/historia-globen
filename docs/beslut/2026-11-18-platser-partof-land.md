# Länder och landskap i Sök och följ, och `partOf` som landets id (#1947, #1953)

**Datum:** 2026-11-18

## Beslut
DasKrokodil valde alternativ A ur UX-genomgången #1853 (`docs/ux-review/2026-11-18-lander-och-regioner-1853.md`, kommentar i #1945). Byggt enligt det:

1. **Namn och plats.** Fliken Platser heter **Länder och landskap** och står direkt efter Alla i Sök och följ. Fliken "Vad hände här?" heter **Nära en plats**. Flikarnas id i koden (`Platser`, `Plats`) är oförändrade. Namnet gäller så länge bara landskap finns som indelning av ett land.
2. **Listan är ett träd:** världsdel → land → landskap. Världsdelarna står i samma ordning som i Samtidigt (`REGIONS` i `js/model.js`), länder och landskap i namnordning. En plats hamnar i den världsdel som dess `view.center` ligger i enligt `region()`, samma regel som Samtidigt; ett landskap står under sitt lands världsdel. Världsdelarna är utfällda och landskapen ihopfällda under sitt land ("Landskap i Sverige (1)"). Varje nivå är en knapp med `aria-expanded` och `aria-controls`, som gruppernas rubriker, inte `role="tree"`; pilarna hoppar över rader i en ihopfälld nivå. Sorteringsraden döljs på fliken, eftersom trädet alltid står i namnordning.
3. **`partOf` är landets id.** Skåne har `"partOf": "sverige"`. Frasen med preposition och artikel (#1479) flyttades oförändrad från Skånes `partOf` till Sveriges nya fält `nameIn` (`"i Sverige"`, `"in Sweden"`, `"in Schweden"`, `"en Suecia"`, `"en Suède"`). Kortets typrad är densamma som förut ("Landskap i Sverige"), och knappen i listan använder typens pluralform `place.types.<typ>` och samma fras. Inga fakta ändrades.
4. **Gruppens antal är raderna som visas** (#1953): under en sökning antalet träffar, i varje grupp och varje nivå i trädet, inte hela gruppen.
5. **Mobil och låg skärm** (rättar grunden i #1951): flikarna är en vågrät rullrad i smal skärm. När mindre än 280 px finns under knapparna (liggande telefon, 800 × 360) läggs menyn över knapparna, med stängknappen som i smal skärm, och gruppens rubrik döljs på sin egen flik. Första landet syns då utan att rulla. Datorns utseende är oförändrat utom flikens namn och plats och trädet.

`scripts/validate-site.py` kontrollerar att `partOf` pekar på ett land i filen med `nameIn`, som inte självt har `partOf` och inte är ett utkast när platsen visas. Schemat och `tests/platskort-landsnamn.test.mjs` kräver frasen i `nameIn` med samma regler som förut.

## Varför
Landskapen ska kunna listas under sitt land innan Europaomgången (milstolpen 6.6.0) lägger till omkring 40 länder och 24 landskap; en fras per språk räckte för kortet men inte för att gruppera. Frasen ligger kvar per språk, på landet, så att varje språk skriver rätt preposition och artikel utan grammatik i koden (beslut 2026-11-14, #1479).

## Inte gjort
- Urvalsraden och sökningen på ett land som saknas (#1261) är inte byggda; de tas i #1261.
- Underrubriker inom en världsdel (Norden, Baltikum) kräver ett eget fält och en källa och finns inte.
- Uppgiften "cirka 200 länder" ur skissen används inte, eftersom den saknar källa.
