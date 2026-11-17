# Hopfällt mönster för sekundär information på korten: slutförd, med korta stycken (#1571)

**Datum:** 2026-11-17 (DasKrokodil 2026-11-14: "Ja till att göra som rekommenderat" och "kolla även över om formateringen av faktatexten kan göras bättre")

## Beslut
Alternativ E, tre nivåer, byggt i den ordning issuet anger. Delarna 1 till 3 är byggda sedan tidigare ([2026-11-14-hopfallda-noteringar-1571.md](2026-11-14-hopfallda-noteringar-1571.md) och #1792 för händelsens faktaruta); den här filen samlar det som återstod:

1. **Resans ruta (pilot), Upptäcktsvyns panel och händelsens faktaruta** följer mönstret: noten som en rad med synlig rubrik och vinkel, själva noten hopfälld, och en sektion längst ned med källor och status ("Källor (N) · status", "Kartbilder · N filsidor", "Källor och osäkerhet · N källor · status"). Utfällda avsnitt står kvar när kortet ritas om. Faktarutans sektion heter "Källor och osäkerhet" (beslut i #1792), inte "Om uppgifterna" som issuet föreslog.
2. **Kredit och licens för våra egna illustrationer** (36 händelser, `image.kind` `illustration`, till exempel "AI-genererad med ChatGPT, 2026-10-30 · CC BY 4.0") flyttas från raden under bilden till sektionen "Källor och osäkerhet" (`imageCredit()` i `js/ui/panel.js`). Bildens märkning "Illustration i stil med …, inte en historisk bild" står alltid kvar synlig under bilden (CLAUDE.md, Bilder 2 och 7). Ny nyckel `detail.imageCredit` på alla fem språken.
3. **Kredit för historiska bilder (andras verk, 205 händelser) står kvar vid bilden.** Se öppen fråga nedan.
4. **Korta stycken (formatering av faktatexter).** Långa sammanfattningar delas i stycken om högst två meningar och högst cirka 240 tecken (`js/paragraphs.js`, `splitParagraphs()`), i händelsens faktaruta, krigets intro och utgång, rikets och religionens ingress och resans ruta. Det gäller texter över 220 tecken, och en ensam kort slutmening får inget eget stycke. Medianen för en händelses sammanfattning är 321 tecken och krigens intro 610 tecken, så de flesta texter delades förut inte alls utan stod som ett block. Delningen är ren presentation: stycken sammanfogade med ett blanksteg är exakt den ursprungliga texten, och inget ord, årtal eller påstående ändras. Brott läggs aldrig efter förkortningar (f.Kr., v. Chr., a. C., ca, t.ex.), ordningstal ("16. Dezember", "5.–6. Jahrhundert") eller initialer. Det provas i `tests/paragraphs.test.mjs` mot 5 844 texter på fem språk. Radavståndet och radlängden (65 tecken) fanns redan; `text-wrap: pretty` är tillagt.

## Varför
Noterna om oenighet är upp till 1 340 tecken och sammanfattningarna ofta 300 till 600 tecken i ett enda stycke. Källpolicyn kräver att osäkerhet visas öppet, så raden med rubriken står kvar; det som fälls ihop är texten bakom den. Kortare stycken ger luft utan att något tas bort.

## Öppna frågor till DasKrokodil
- **Kredit för historiska bilder** (Wikimedia Commons, CC BY och CC BY-SA kräver att upphovsperson och licens anges "på rimligt sätt"): får den flyttas in i "Källor och osäkerhet" som egna illustrationer, eller ska den stå kvar vid bilden? Den juridiska bedömningen är inte gjord av agenten. Tills vidare står den kvar.
- **Kortare texter i sig.** DasKrokodil vill ha "hellre kortare och enklare än mycket fakta". Att skriva om själva texterna är nytt innehåll med källkontroll och översättning på fem språk, och påbörjas inte utan ett ja. Fråga: ska sammanfattningarna över 300 tecken kortas i omgångar, där svenska texten kortas först utan att något påstående läggs till, översättningarna följer samma pull request och `data/textlangd.json` håller gränsen? Äldre beslutet [2026-11-14-kortare-faktatexter.md](2026-11-14-kortare-faktatexter.md) är redan igång som spärr (#1599).
- **"Se anteckningen ovan"** i `how.agree.differ` stämmer fortfarande (noten ligger ovanför som en hopfälld rad), så texten är oförändrad.

## Berör
`js/paragraphs.js` (ny), `js/ui/panel.js` (`paras()`, `figure()`, `imageCredit()`), `js/ui/routepop.js`, `css/style.css` (`.detail p`, `.detail-image-credit`), `data/ui/*.json` (`detail.imageCredit`), `tests/paragraphs.test.mjs` (ny), `tests/webblasare.mjs` ("faktarutan: korta stycken och bildens kredit på rätt nivå (#1571)"), `docs/arkitektur.md`, `docs/produkt/05-ux-oversikt.md`, `CLAUDE.md` och `README.md` (filstrukturen).
