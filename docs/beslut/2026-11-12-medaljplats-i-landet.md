# Rikets medalj står i landet självt när etikettpunkten ger fel bild

**Datum:** 2026-11-12 (DasKrokodil i #1189)

## Beslut
1. Rikets medalj och namn står i landet självt de år där den vanliga etikettpunkten (mitten av den största delen av ytan i Cliopatria) ger fel bild. Rikets område ritas som förut.
2. Platsen räknas fram ur källans egen yta för riket det året: den del som ligger i landet självt. Den skrivs i `labelAt` i gruppen i `data/empires/index.json`, med källa och granskningsstatus.
3. Innehåller källans yta inte landet självt ett år, står ingen medalj och inget namn där det året (`"at": null`), och bara området ritas. Medaljen flyttas då inte till ett land som rikets område inte täcker.
4. Fallen 2026-11-12: Danmark 1946–2024 (Jylland i stället för Grönland), Andra spanska republiken 1938 (inte i Spanska Sahara) och Femte republiken 1958–1962 (inte i Algeriet) får en plats i landet. Kungariket Italien 1944 (bara koncessionen i Tianjin, 267 km²) och Norge 1941–1944 (bara Jan Mayen, 372 km²) får ingen medalj.
5. Afghanistan efter 2021 får ingen flagga för talibanstyret, bara en not i faktarutan, i linje med UD:s hållning. Det byggs när nutida flaggor byggs för Afghanistan.

## Motivering
Medaljen ska visa var riket var, inte var dess största ö eller koloni låg. Med flaggor (#1145) blir felet tydligare, till exempel Dannebrog mitt på Grönland, som har egen flagga sedan 1985. Att placera medaljen där källans yta inte når skulle däremot visa något källan inte säger.
