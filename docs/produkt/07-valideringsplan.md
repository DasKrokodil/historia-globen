# 07. Valideringsplan: från antaganden till observationer (utkast)

**Status:** utkast 2026-11-08, **förslag** som DasKrokodil ska godkänna. Ingen skolpilot görs (beslut 2026-11-07), så planen är avsiktligt liten och billig. Den ersätter inte en pilot; den gör att antagandena i [02](02-anvandare-och-intressenter.md), [05](05-ux-oversikt.md) och [06](06-granskningsperspektiv.md) kan bytas mot något riktigt, steg för steg.

## Vad vi har och inte har

- **Har:** granskningar av agenter och en människa (rapporterna i `docs/granskningar/`), webbläsartest, Cloudflare Pages egen trafikstatistik, förslagsformuläret (avstängt i production) och faktafel-länken i faktarutan.
- **Har inte:** någon observation av en riktig lärare, elev eller förstagångsbesökare. Inget statistikskript körs på sidan (beslut 2026-11-06), och det ska det inte göra.

## Antaganden att pröva, i prioritetsordning

Ordningen följer hur mycket det skulle ändra om antagandet är fel.

| # | Antagande | Varför det är viktigt | Hur det prövas | Mål |
|---|---|---|---|---|
| V1 | En lärare hittar och kör lektion 1 eller 2 utan hjälp från oss, och lärarbladet räcker som förberedelse | Hela skolspåret bygger på det | Lärartest (T2 nedan) | M3 |
| V2 | En förstagångsbesökare förstår på ~10 sekunder vad globen gör och vad hen kan göra | Ingången avgör om någon går vidare | Nybörjartest (T1) | M1 |
| V3 | Elever 10–13 klarar Samtidighetsjakten med bara instruktionen och skärmen | Texterna är skrivna men aldrig provade | Elevtest via lärare (T3) | M3 |
| V4 | Mobilen fungerar för elever och intresserade i vanliga flöden | Mycket användning sker på telefon | Flöde 1, 3, 5 på riktiga enheter (T4) | M1, M5 |
| V5 | Källor och osäkerhet förstås och upplevs som trovärdiga | Det är vår särart | Fråga efter T1/T2: "Hur vet du att det stämmer?" | M2 |
| V6 | Skolnät och skoldatorer kan köra sidan (CDN, WebGL, Chromebook, surfplatta) | Om det inte går att starta spelar innehållet ingen roll | Enhetstest hos en lärare eller skolas IT (T5) | M3, M6 |
| V7 | Urvalet förstås och uppfattas som rimligt | Historiker och intresserade frågar efter det | Fråga i T1; se [08](08-urvalsriktlinje.md) | M2, M4 |
| V8 | Besökare med skärmläsare eller bara tangentbord kan genomföra huvudflödena | Tillgänglighet är bevisad bara delvis | Riktad attest (T6) | M5 |

## Test: små och billiga

Varje test är 20–45 minuter och görs med **3–5 personer**, vilket brukar räcka för att hitta de största hindren. Gör ett test, rätta, gör nästa.

| Test | Vem | Uppgift | Vad vi observerar |
|---|---|---|---|
| T1 Nybörjare | 3–5 vuxna eller äldre elever som inte sett sidan | "Titta runt och berätta vad du tror att det här är." Därefter: "Hitta vad som hände samtidigt som pyramiderna byggdes." | Tid till första handling, var de tvekar, vad de inte hittar, vad de säger om källor |
| T2 Lärare | 2–3 historielärare (åk 4–9) | Få länken till en lektion och bladen; förbered och beskriv hur du skulle köra | Förberedelsetid, vad som saknas i lärarbladet, kursplanekopplingen, skolnätsfrågor |
| T3 Elever | 3–5 elever 10–13 (via lärare) | Gör Samtidighetsjakten utan hjälp | Tryck till första svar, missförstånd, ord de inte kan, tid |
| T4 Mobil | Samma personer som T1/T3 på egen telefon | Flöde 1, 3 och 5 i [05](05-ux-oversikt.md) | Krockar, täckta kontroller, tappad orientering |
| T5 Skolenhet | En lärare eller skolas IT | Öppna sidan på skoldator och surfplatta på skolnätet | Startar den, hur lång tid, vad blockeras |
| T6 Tillgänglighet | 1–2 personer som använder skärmläsare eller tangentbord | Flöde 1 och 3 | Fällor, oläsliga kontroller, uppläsning av steg |

## Regler för testerna

- **Ingen personlig data.** Skriv inga namn, bara roll och ålder (ungefär) och enhet. Spela inte in barn. Elevtester görs genom läraren i klassrummet, med skolans egna rutiner, så att vi aldrig behöver samtycken eller kontaktuppgifter. Det är den försiktiga tolkningen; ta det med någon som kan reglerna för skolor innan något görs.
- **Observera, led inte.** Be personen tänka högt, och säg inte vart hen ska klicka. Anteckna det hen gör, inte bara det hen säger.
- **En agent får förbereda och sammanfatta, men inte ersätta en människa.** Agentens bedömning av hur "en elev" skulle reagera räknas som hypotes.
- **Resultat är data, inte beslut.** Fynd blir issues enligt CLAUDE.md. Fynd som motsäger ett antagande ändrar texten i [02](02-anvandare-och-intressenter.md)/[05](05-ux-oversikt.md)/[06](06-granskningsperspektiv.md) med datum.

## Var observationerna sparas

`docs/granskningar/observationer/ÅÅÅÅ-MM-DD-<test>.md`, en fil per test med: test, antal personer (utan namn), enhet, huvudfynd, citat (anonyma), vilket antagande (V1–V8) som bekräftades eller motsades, och uppföljande issues. Mappen skapas första gången.

## Löpande insamling utan test

- **Faktarutans "Rapportera faktafel"** och förslagsformuläret (när det slås på i production, [docs/feedback.md](../feedback.md)) ger spontan återkoppling. Läs den som en källa till observationer, inte bara som felrapporter.
- **Cloudflare Pages statistik** (trafik, sidor, länder) kan visa var sidan används, men inte vad besökaren förstår.
- **En fråga vid varje lärarkontakt:** "Vad hindrade dig från att använda det?" Skriv ned svaret.

## Frågor till DasKrokodil

1. Vem kan rekrytera lärare och några vuxna testpersoner (nätverk, skolor, kollegor)?
2. Är det okej att försöka få en lärare i taget i stället för en pilot (beslutet 2026-11-07 gäller pilotlektionen, inte enskilda lärarkontakter)?
3. Vem gör testen: DasKrokodil själv, Einzbeng eller en extern person? Agenter kan förbereda protokoll och sammanfatta, men inte sitta med.
4. Ska resultaten vara offentliga i repot (anonyma) eller sparas privat?

## Att kontrollera vid uppdatering

- [ ] Har ett test gjorts? Uppdatera V-tabellen med status och datum.
- [ ] Har ett antagande i 02, 05 eller 06 bytt status?
- [ ] Finns ett nytt antagande som borde prövas?
