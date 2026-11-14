# Fliken Plats i Sök och följ heter "Vad hände här?"

**Datum:** 2026-11-14 (önskemål från DasKrokodil i chatten; alternativ 1 av tre)

## Beslut
Fliken **Plats** i Sök och följ (platssökningen "Vad hände här?", #15) visas med namnet **Vad hände här?** på alla språk: *What happened here?*, *Was geschah hier?*, *¿Qué pasó aquí?* och *Que s’est-il passé ici ?* (hårt mellanrum före frågetecknet). Gruppen **Platser** (#579) behåller sitt namn. Flikens id i koden är oförändrat `Plats`, eftersom sparade val, adressen och testerna använder det; bara texten `focus.tab.place` ändras.

## Varför
"Plats" och "Platser" stod bredvid varandra och betydde olika saker: ett kort om ett område med dagens gräns (Platser) mot en sökning efter händelser nära en punkt (Plats). Funktionens eget namn beskriver vad den gör. Krocken noterades i granskningen 2026-11-12 och finns i #1261. Namnet på gruppen Platser, som på sikt rymmer fler typer än länder, avgörs separat.

## Berör
`data/ui/*.json` (`focus.tab.place`), `docs/ordlista-oversattning.md`, `docs/produkt/13-ordlista.md`.
