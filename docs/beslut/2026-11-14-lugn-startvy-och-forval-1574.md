# Lugn startvy och färre förval (#1574, steg 1 av 4)

**Datum:** 2026-11-14 (DasKrokodil: "Ja till att göra enligt rekommendation" i #1574)

## Beslut (byggt i det här steget)
- **Startvyn Översikt** har lagren Händelser, Samtidigt och Riken, utan Resor och Krigsområden (före: alla fem). Riken ligger kvar tills DasKrokodil har bedömt startvyn med och utan Riken (alternativ B mot C i #1574).
- **Förvalet "Standard" heter "Alla händelser"** (`standard` är fortfarande id:t; alla fem lager och hela händelsemängden). Det är också vad "Visa alla" i Samtidigt och "Återställ" inte längre går till: Återställ går till startvyn (#1579).
- **Förvalet "Händelser och riken" (`utforska`) är borttaget**: det hade samma lager som den nya Översikt, utan urvalet.
- **Ordningen på knapparna** börjar med startvyn: Översikt, Alla händelser, Bara kartan, Makt och gränser, Resor och handel, Människans spridning, Framsteg.
- Bakåtkompatibelt: delade länkar bär sina lager i `l=` och urvalet i `g=`; bara en ren adress får den lugnare startvyn.

## Inte gjort här (kvar i #1574)
- Förvalen är sju, inte sex: **Framsteg** behålls, eftersom den enda ingången till händelserna taggade som framsteg (#555, #1379) är den vyn. Att ta bort den kräver ett eget beslut om var taggen ska nås.
- Lager som sex förvalskort med rubriken "Vad vill du se på kartan?", hopfällda grupper med antal och en mening om vad varje lager gör på kartan (steg 3).
- Lugn rörelse och Pausa vid flyttas till Mer › Inställningar (steg 4; mest risk, `LayerMenu` läser `data-pause` och `data-calm` ur menyn).
- Ordvalen "Förval" och "Vad vill du se på kartan?" följer med steg 3.

## Berör
`data/vyer.json` (vyerna, ordning och namn), `tests/webblasare.mjs` (första besöket och lektionen från Översikt).
