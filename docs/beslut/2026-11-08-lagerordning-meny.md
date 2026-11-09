# Menyn ligger över sidopanelerna (#887)

**Datum:** 2026-11-08

**Beslut:** Knapparna överst (`.top-actions`) och deras öppna menyer, Mer på datorn och Meny i mobilen, ligger över sidopanelerna. Lagren har namn i `:root`: `--z-panel` (15) för Samtidigt-panelen och `--z-meny` (17; hette `--z-topbar` till #894) för knapprad och menyer. Alternativet, att en öppnad meny stänger Samtidigt-panelen, valdes bort.

**Motivering:** Båda hade `z-index: 15`, och menyns eget värde (17) hjälpte inte eftersom den ligger inne i knappradens staplingskontext. Då tog panelen emot klicket och Samtidighetsjakten, Källor, Hjälp och Quiz gick inte att trycka med Samtidigt öppen. Att höja knappraden ändrar inget annat läge: dialoger (18 och 20) ligger fortfarande över, och i lektionsläget är menyerna dolda. En stängning av panelen hade dolt problemet och tagit bort innehåll som besökaren ville ha kvar.

**Test:** Kontrollen "Mer/Meny ligger över en öppen Samtidigt-panel" i `tests/webblasare.mjs` mäter med `document.elementFromPoint` vad som ligger överst mitt på varje knapp, och startar jakten med ett vanligt klick (ingen `force`). Den är röd utan rättningen. Ett fullständigt lagerregister för alla ytor är inte gjort här (punkt A1 i triagen väntar på beslut).
