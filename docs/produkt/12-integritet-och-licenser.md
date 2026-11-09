# 12. Integritets- och licensöversikt

**Status:** utkast 2026-11-08 (#918). Det här är en **sammanställning av det som redan är beslutat och finns i repot**, så att en granskare ser det på ett ställe. Den är **inte juridiskt granskad**. DasKrokodil har bestämt att den ska läsas juridiskt en gång, av någon som kan reglerna för skolor, **innan sidan marknadsförs till lärare** (krav K-INT-07). Inget här är juridisk rådgivning.

## 1. Vilka data lämnar besökarens webbläsare?

Belagt i `index.html`, `_headers`, [feedback.md](../feedback.md) och koden. Ingen besökare loggar in, och sidan har ingen egen databas.

| Mottagare | När | Vad den får | Källa |
|---|---|---|---|
| **Cloudflare** (värd för sidan) | Varje sidvisning | Det som hör till varje webbförfrågan (till exempel IP-adress), som hos vilken värd som helst. Cloudflare Pages egen trafikstatistik är den enda statistiken (beslut 2026-11-06) | DEPLOYMENT.md |
| **jsDelivr** | Varje sidvisning | Förfrågan om three.js (IP-adress m.m.) | `index.html`, CSP |
| **Google Fonts** (fonts.googleapis.com, fonts.gstatic.com) | Varje sidvisning | Förfrågan om typsnitt (IP-adress m.m.) | `index.html`, CSP |
| **Cloudflare Turnstile** | Bara när förslagsformuläret öppnas **och** är påslaget (avstängt i production 2026-10-30) | Bot-kontrollens data; token kontrolleras på servern | feedback.md |
| **Formulärets funktion → privat GitHub-repo** | Bara när någon skickar ett förslag (påslaget på dev, avstängt i production) | Förslaget, och e-post om besökaren anger den | feedback.md |
| **Ko-fi** | Bara om besökaren klickar på "Stöd Historia Globen" | Besökaren lämnar sidan; Ko-fi:s egna villkor gäller då | `index.html` |

**Det som inte sker (belagt):** inget statistik- eller spårningsskript på sidan (beslut 2026-11-06); inga inloggningar eller konton; ingen reklam; `document.cookie` används inte i koden. Sidan sparar val i webbläsarens `localStorage` (till exempel språk `hg-lang`, lugn rörelse `hg-calm`, hastighet och paus) i `try/catch`; inget skickas därifrån.

**Att lägga märke till (till granskaren):**
- Två tredjepartstjänster (jsDelivr och Google Fonts) får besökarens IP-adress vid varje sidvisning, även om sidan själv inte spårar. Typsnitten har öppen licens (OFL) och three.js är MIT, så de **kan** läggas i repot och serveras från egen adress. **Beslutat 2026-11-08 (DasKrokodil): den juridiska läsningen (K-INT-07) får bedöma Google Fonts och jsDelivr; inget flyttas nu.** Om bedömningen blir att de bör flyttas blir det ett eget issue. Se även #486 (offline i klassrummet).
- Skolor som blockerar externa adresser kan få problem att starta sidan, eftersom three.js hämtas från jsDelivr.
- Förslagsformuläret kan innehålla e-postadress; det lagras i ett **privat** repo, inte i huvudrepot (feedback.md).

## 2. Skolan och barn

- Inga konton, ingen elevdata, inga betyg och ingen uppföljning (avgränsning, [01](01-vision-och-mal.md)).
- Elever 13 år och yngre får du-form i texterna; det är ett språkval, inget integritetsskydd.
- Utskriften (elevblad och lärarblad) skapas i webbläsaren ur turens data; inget skickas.

## 3. Licenser

Sammanfattning; den fullständiga listan står i [CONTENT-LICENSE.md](../../CONTENT-LICENSE.md), [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md), `data/licenses.json` och `images/licenses.json`.

| Material | Licens |
|---|---|
| Koden | GPL-3.0 (`LICENSE`) |
| Data i `data/` (händelser, fun facts, källregister m.m.) | CC BY 4.0 (`data/LICENSE`) |
| three.js 0.160.0 | MIT |
| Typsnitt (IM Fell English, Instrument Sans, IBM Plex Mono) | SIL Open Font License 1.1 |
| Grundkartan och dagens gränser | Natural Earth (public domain) |
| Rikenas utbredning | Cliopatria, CC BY 4.0 (förenklat utdrag) |
| Händelsebilder | Varje bild behåller sin egen licens, som står i bildtexten (public domain, CC0, CC BY, CC BY-SA, Library of Congress "No known restrictions") |
| Texter som bygger på Wikipedia | Egna korta sammanfattningar; Wikipedia är CC BY-SA, och texten kopieras inte (CLAUDE.md, Licenser) |
| Källor med NC-licens | Bara länkade för att kontrollera uppgifter; ingen text eller data kopieras (beslut 2026-10-29) |

**Copyright och bidrag.** README säger att copyright är DasKrokodils och att bidrag publiceras under projektets licenser (GPL-3.0 för koden, CC BY 4.0 för datan) och inte innebär medägande. **Detta bör granskaren titta särskilt på:** upphovsrätt till en persons egna bidrag ligger normalt kvar hos personen om den inte överlåts, och projektet har redan en medarbetare (`Einzbeng`) som bidrar.

## 4. Frågor till den som granskar juridiskt (K-INT-07)

Förslag på vad granskningen bör svara på; ordningen är min:

1. **Google Fonts och jsDelivr (DasKrokodil har lämnat bedömningen hit):** räcker det att sidan inte själv spårar, när de får IP-adressen? Bör de självhostas, och är svaret annorlunda för sidor som används i skolan?
2. Behövs en integritetstext på sidan (förslagsformuläret har en godkänd integritetstext, men hur är det för sidan i övrigt)?
3. Är förslagsformulärets hantering av e-post (privat repo, GitHub som tredje part) tillräckligt tydlig för besökaren?
4. Vad gäller för att en skola använder en sådan här sida med elever 7–13 år?
5. Är upplägget med bidrag under GPL och CC BY utan överlåtelse (se ovan) tillräckligt, eller behövs en tydligare regel för bidrag?
6. Är de egna sammanfattningarna av Wikipedias texter (CC BY-SA) förenliga med att datan publiceras som CC BY 4.0?
7. Är Ko-fi-länken ("frivilligt stöd") förenlig med att sidan är icke-kommersiell?

## Att kontrollera vid uppdatering (varje release)

- [x] Har en ny extern adress eller tjänst tillkommit (kontrollera `index.html` och CSP i `_headers`)?
- [x] Har förslagsformuläret slagits på i production? Uppdatera avsnitt 1.
- [ ] Har en ny datakälla eller bildlicens tillkommit? Uppdatera avsnitt 3 och README:s licensavsnitt.
- [ ] Har den juridiska läsningen gjorts? Skriv datum, vem och utfall här.

**Genomgång inför v6.1.0 (2026-11-09):** läst. `_headers` är oförändrad sedan v6.0.0, och `index.html` har inga nya externa adresser (bara samma Google Fonts, Ko-fi och GitHub-länkar som förut). 6.1.0 hämtar bara nya filer från egen adress (`data/perioder.json`, `data/teman.json`). Formuläret är inte påslaget i production. Inga nya datakällor eller bildlicenser har lagts in som jag har sett. Jag har inte jämfört `localStorage`-nycklarna mot förra releasen. **Den juridiska läsningen (K-INT-07) är inte gjord** och bockas inte av.
