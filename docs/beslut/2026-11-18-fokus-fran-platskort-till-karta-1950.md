# Tangentbordsfokus från platskort till karta (#1950)

**Datum:** 2026-11-18 (DasKrokodils godkännande i #1945)

## Beslut
Efter platskortets kartknapp går fokus till **Lämna regionvyn** i den öppnade regionvyn, eller till kartan om platsen ramas in i vanlig Platt karta. Fokus flyttas efter att mobilens kort har fällts ihop och utan att sidan rullas.

## Varför
Knappen kan försvinna när kortet ritas om. Tidigare hamnade fokus på sidan på dator och på kortets handtag i mobil. Besökaren ska kunna fortsätta på kartan direkt med tangentbord. Befintlig Lugn rörelse följer webbläsarens `prefers-reduced-motion` tills besökaren gör ett eget val; kamerans befintliga enmillisekundsövergång behålls.

## Berör
#1950, återgången i #1949 och den gemensamma hanteraren i `js/main.js`. Den fristående kontrollen `tests/regionfokus.mjs` provar liten regionvy, vanlig Platt karta och globens regionvy i 1280/400 px, fokus vid öppning/återgång och faktisk kameratid med/utan reducerad rörelse. Den körs före huvudsviten i Chromium-jobbet `plats` i `.github/workflows/browser-test.yml`.
