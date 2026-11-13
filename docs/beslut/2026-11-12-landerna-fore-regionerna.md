# Länderna före regionerna: milstolpen Länders historia

**Datum:** 2026-11-12 (DasKrokodil)

## Beslut
1. Historien byggs först på **landsnivå** (milstolpen Länders historia) och sedan på regionsnivå (landskap och delstater). Skåne (#1159) och utvärderingen (#1164) fortsätter som planerat.
2. Ett land är en **plats av typen land** i `data/platser.json`, inte ett eget Fokus. Rikena visas som länkar i kortet, och kortet har en fast rad om att konturen är dagens gräns.
3. Piloten: Sverige (landsvy) och Danmark, plus Etiopien, Peru, Australien och Japan (efter beslut om omstridda gränser). Ett land per pull request, med källkontroll och fem språk. Länder med omstridda gränser undviks enligt `docs/omstridda-granser.md`.
4. Kravet på minst fem synliga händelser inom gräns behålls för länder. Hållbarhetsriktlinjen (cirka 12–15 händelser, minst fyra sekler, minst tre kategorier utöver krig) är en riktlinje med mjuk varning, inte ett valideringskrav.
5. Datumlinjen (#1268, #1227) och uppspelningen vid platser (#1255) rättas före landsvyn.
6. Pilotens utvärdering (#1274) ligger sist i milstolpen och förs in i #1209.

## Motivering
Landsnivån kräver ingen ny gränskälla (Natural Earth admin-0 är public domain och redan i projektet), använder den befintliga platsmekanismen och ger spridning över världsdelar. Regionerna är blockerade av gränskälla för landskap och en ny datamodell, och regionernas berättelser behöver landet som ram (Skånes historia förutsätter Sverige och Danmark). Underlag: `docs/granskningar/2026-11-12-planering-regionhistoria.md` (#1259).
