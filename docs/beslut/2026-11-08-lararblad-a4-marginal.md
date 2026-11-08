# Lärarbladet får lite tätare listor för att rymmas på A4 i alla motorer (#888)

**Datum:** 2026-11-08

## Beslut
Listpunkterna på lärarbladet i utskriften (`.print-teacher .print-curriculum > li` och `.print-teacher .print-questions-short > li` i `css/style.css`) får 2,5 pt mellanrum i stället för 4 pt. Elevbladen och Källdetektiv-bladet är oförändrade, och testets gräns för reservtypsnittet (`A4_HEIGHT - 1`) är oförändrad.

## Varför
Webbläsartestet i Firefox (CI, körning 42471602860) mätte det tyska lärarbladet i reservtypsnittet (DejaVu Sans) till 1040 px mot A4:s 1039 px. I Chromium mätte samma blad 1037 px mot gränsen 1038 px, alltså 1 px marginal. Med webbtypsnittet (Instrument Sans) ryms bladet med god marginal (946 px), så det gäller fallet när webbtypsnittet inte laddas. Lokalt i Chromium ger ändringen 1024 px (14 px marginal); Firefox bekräftas i körningen med etiketten `alla-webbläsare`.

## Alternativ som övervägdes
- **Tillåta 1–2 px skillnad mellan motorerna i testets gräns:** avvisades. Det gör testet grönt men lämnar bladet på gränsen, och en extra sida i Firefox skulle fortfarande vara möjlig.
- **Minska typsnittsstorleken på lärarbladet:** avvisades; den är redan 8 pt för Källdetektivens del (#742), och mellanrummet påverkar läsbarheten minst.

## Berör
`css/style.css` (utskrift), `docs/beslut/`. Hör ihop med #757 (A4-kontrollen), #742 och #888.
