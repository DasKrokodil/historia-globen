# ux-tillganglighet: granskning före v6.5.0

Granskat 2026-11-21 av `ux-tillganglighet` (linserna 1 Senior UX/UI och 7 Tillgänglighet). Inga filer i repot är ändrade.

## Omfattning och stickprov

- **Kod:** main vid `1bd96bae` (version.json 6.5.0, en commit efter `1cc19f79` som briefen nämner), jämfört med `1a981da0`. Läst: `git diff --stat 1a981da0..HEAD -- js css index.html` (52 filer), och koden för reglaget (`js/ui/level-switch.js`, `js/model.js` roundToStep/formatWindowYear), Visste du-kortet (`js/ui/funfact.js:419`), panelen (`js/ui/panel.js` tre tidsgrupper, ≈ N år sedan, rikeskortets "Dagens länder" fa0c3e4a), ramarna (`css/style.css:2106–2170`), Lager-raden (#1960, `js/ui/layers.js:111–130`) och turkortet.
- **Webbläsare:** egen server (`python3 -m http.server 8781`), Chromium via Playwright, deviceScaleFactor 1, svenska. **Dator 1280×800**, **mobil 400×800 (touch)**, **liggande 800×360 (touch)**. Dessutom 640×400 (= 200 % zoom på 1280×800), 844×390, 915×412, 667×375, 1024×600, 1280×600/650 för turkortet. Engångstipset avstängt utom i en körning.
- **Ytor (fem frågor per yta):** start och tidsreglaget med dörren (år 1325, -40000, -80000, -3000, -2999), teckenförklaringen och tidsfönstret i ord, Samtidigt-panelen med tre tidsgrupper (1676, förhistoria), händelsekort (slaget-vid-lund med ny bild, neandertalare med ≈ N år sedan och (i)), Visste du-kortet (1889), platskortet (skane, sverige, aotearoa, gronland), platsens karta i Platt vy och på globen, rikeskortet med Dagens länder (kalmarunionen → Sverige), Lager-menyn vid 40 000 f.Kr., turkort första och sista steget (songhairikets-fall), lektionsläget med lärarroll (vikingatiden-och-varlden), utskrift A4 (4 lektionsturer), Mer-menyn, För lärare, Hjälp, Sök och följ.
- **Bilder:** alla 64 nya filer i `images/events/` kontrollerade för mått och storlek (64/64 är 800×600 och under 150 kB) och för bildfält i `data/events.json` (caption på fem språk, credit, license: 64/64; de 2 illustrationerna är märkta "Illustration" i bildtexten). Tre visade i kortet (slaget-vid-lund i alla tre lägen).
- **Mätt i varje läge:** horisontell rullning, text under 12 px, träffytor (under 24 och under 44 px), kontrast (WCAG-formeln mot närmaste heltäckande bakgrund; bildbakgrunder utesluts), tabbordning (45 steg från sidans början), fokus efter knapp och Escape, roller och live-region, konsolfel.
- **Projektets egen kontroll** `tests/regionfokus.mjs 8781`: 8 av 8 gröna (tangentbordsfokus till kartan, reducerad rörelse på globen).
- **Konsolfel:** inga i någon körning. **Horisontell rullning vid 400 px:** ingen i någon yta.
- **Skärmbilder:** `(skärmbilder i releasekörningens scratchpad)/` (filnamnen står vid varje fynd). OBS: `18-tur-…-s1-*` och `18-tur-…-s8-*` är från en felaktig körning (fel stegparameter) och visar båda steg 1; använd `-stronstriden-` och `-skronikorna-`.

## Blockerande

1. **Turkortet och lektionen går inte att läsa i liggande telefon och vid 200 % zoom: stegets text syns inte alls.**
   - **Var:** turkortet (`#tour-card`) med knappen "Fortsätt läsa ↓" (`#tour-more`, från #1866) i låga fönster. Gäller alla turer och lektionsläget.
   - **Bevis:** 800×360 touch: kortet är 142 px högt (y 64–206), foten med Nästa/Lämna turen börjar vid y≈98 och "Fortsätt läsa" ligger på y 50–98, så ingen rad av stegets rubrik eller text syns; efter tryck på "Fortsätt läsa" (scrollTop 98) syns fortfarande bara en överskuggad rad. 844×390: rubriken ligger under foten (`elementFromPoint` på rubriken ger `tour-actions`). 667×375 likadant. 640×400 (200 % zoom i en datorbrowser): bara "STEG 1 AV 8" och en överskuggad kapitelrad. 1024×600: bara rubriken, brödtexten bakom "Fortsätt läsa" trots att det finns cirka 200 px fri höjd ovanför kortet. Lektionsläget i 800×360 visar samma tomma kort. Skärmbilder: `18-tur-songhairikets-fall-stronstriden-liggande.png`, `19-tur-liggande-fortsatt-lasa.png`, `20-tur-844x390.png`, `20-tur-667x375.png`, `20-tur-1024x600.png`, `26-zoom200-tur.png`, `21-lektion-larare-liggande.png`. Stående mobil 400×800 och dator 1280×800 fungerar (`18-tur-…-stronstriden-mobil.png`, `-dator.png`).
   - **Varför blockerande:** turen och lektionen är skolans huvudflöde (M3/M4 i 01-vision-och-mal.md), och innehållet kan inte läsas i liggande telefon eller vid 200 % textförstoring (WCAG 1.4.4 Ändra textstorlek, 1.4.10 Omflöde, 1.3.4 Orientering). Knapparna går att trycka (#1694 och #1932 rättade höjden och knapparna), men texten har trängts ut av "Fortsätt läsa" och den fasta foten. Den enda vägen är att vrida telefonen eller minska zoomen. Dirigenten avgör om det får vänta.
   - **Förslag:** i låga fönster (till exempel `max-height: 480px` eller när kortets innehållsyta blir under cirka 4 rader) dölj "Fortsätt läsa"-knappen och låt foten följa med i rullningen i stället för att vara fast, eller lägg Nästa/Föregående i en rad bredvid stegräknaren. Låt kortet växa uppåt till masthuvudet i 1024×600. Lägg ett prov i `tests/webblasare.mjs`: i 800×360, 844×390 och 640×400 ska minst rubriken och två rader text synas utan att något täcker dem (`elementFromPoint`).
   - **Vem:** Claude Code (Sonnet high, gränssnitt), utan beslut eftersom det rättar en trasig visning.

## Bör rättas

2. **Visste du-kortet säger "Visste du?" två gånger: "VISSTE DU? · VISSTE DU? · NÄRA I TID: 4 ÅR ISÄR".**
   - **Var:** `js/ui/funfact.js:419` sätter `#ff-kind` till `kindLabel('funfact')` + relation, och `index.html:500` har redan `ff.title` "Visste du?" före. `ff.kind.funfact` ändrades från "Fun fact" till "Visste du?" i #1306 (739663e6). Samma i alla fem språk (en "Did you know? | Did you know?", de, es, fr likadant). Kontrollen i `tests/webblasare.mjs` mäter bara `#ff-kind` och ser därför inte dubbleringen.
   - **Bevis:** dator, mobil och liggande år 1889: `07-vistedu-dator.png`, `07-vistedu-mobil.png`, `07-vistedu-liggande.png`.
   - **Förslag:** visa inte `ff.kind.funfact` i `#ff-kind` när kortet är en vanlig fun fact (bara relationen: "Visste du? · Nära i tid: 4 år isär"), eller dölj `.ff-pre` då. Fråga 3 (Ointressant).
   - **Vem:** Claude Code eller Codex (liten ändring, fem språk berörs inte om bara visningen ändras).

3. **Dörren till "Före 3000 f.Kr." landar på ett år som säger två olika saker: stora årtalet "3000 f.Kr.", raden under "3001 f.Kr.", och Samtidigt "år 3001 f.Kr.".**
   - **Var:** `js/model.js:319–322` (`roundToStep`) avrundar -3000 (3001 f.Kr.) till "3000 f.Kr." i huvudet, medan tidsfönsterraden (`formatWindowYear`) och panelen använder det verkliga året. År -2999 (andra reglaget) visar också "3000 f.Kr.". Etiketten på globen säger samtidigt "Kotoshtraditionens tempel … · om 1 år (3000 f.Kr.)".
   - **Bevis:** `#y=-3000`: huvud "3000 f.Kr.", rad "3001 f.Kr. · även 170 år före och efter", panel "26 händelser pågår år 3001 f.Kr.", nivå "Före 3000 f.Kr." nedtryckt; `#y=-2999`: huvud "3000 f.Kr.", rad "3000-talet f.Kr.", nivå "3000 f.Kr.–i dag". Dator, mobil och liggande likadant. Skärmbilder: `03-fore3000-mobil.png`, `03-fore3000-liggande.png`, `27-samtidigt--3000-dator.png`, `27-samtidigt--2999-dator.png`.
   - **Varför:** året är det som styr allt (M1). "Före 3000 f.Kr." med årtalet "3000 f.Kr." är motsägelsefullt för en elev. Fråga 4 (Tillstånd: skarven mellan reglagen).
   - **Förslag:** låt sista året i första reglaget visas som "3001 f.Kr." (ingen avrundning vid skarven) eller låt dörren landa på närmaste runda år inom reglaget (till exempel 3100 f.Kr.), och låt huvud, rad, panel och etiketter använda samma visade år. Kräver ingen ny text.
   - **Vem:** Claude Code (Sonnet high, tidslinjen).

4. **Händelsekort i förhistorisk ram (frame-grotta) har för låg kontrast: 3,46:1.**
   - **Var:** `css/style.css:2106–2109`, `--ochre` #b5651d på `--stone` #2b2620 för datumrad, "≈ N år sedan", (i), plats, kategori, "Visa på globen", "Källor och osäkerhet" och källänkar. #1713 punkt 4 rättade bara plats- och temakort (6997d551). Räknat ur `data/styles.json`: 182 av cirka 1 500 visade händelser får ramen. Övriga ramars accentfärg ligger mellan 5,05:1 (rymdålder) och 12,7:1.
   - **Bevis:** neandertalare vid 40 000 f.Kr., dator/mobil/liggande: `06-handelsekort-neandertal-*.png`. Uppmätt 3,46:1 för 12–12,5 px text (krav 4,5:1, WCAG 1.4.3).
   - **Förslag:** ljusare accent i grottramen (till exempel en ockra som ger minst 4,5:1 mot #2b2620) och samma prov som för platskorten. Utseende: liten färgjustering inom stilen; dirigenten avgör om det behöver DasKrokodils ja.
   - **Vem:** Claude Code.

5. **Liggande telefon (800×360, touch) får datorns typografi och träffytor.**
   - **Bevis (800×360):** "Vy", "Stil", "Utforska" 9,5 px; Mer-menyns gruppnamn ("Lär dig", "För skolan", "Anpassa", "Hjälp projektet") 10,5 px och valen 31 px höga; Lager-menyns beskrivningar och rubrik 11 px; Visste du-kortets metarad 11 px; För lärare `.teacher-h` och `.teacher-lesson-meta` 11 px; nivåknapparna "Före 3000 f.Kr." / "3000 f.Kr.–i dag" 28 px höga (mobil 44 px, dator 32 px). Skärmbilder: `01-start-liggande.png`, `24-mer-liggande.png`, `25-forlarare-liggande.png`, `16-lager-40000-liggande.png`.
   - **Varför:** #1713 punkt 1 och 2 rättades för 400 px men inte för liggande pekskärm; samma fynd som 2026-11-18-genomgångens lärdom "fråga 5 ska alltid ta liggande telefon med". M6 (fungerar i mobil).
   - **Förslag:** lägg minsta textstorlek 12 px och träffytor 44 px under `@media (pointer: coarse)` (eller `(max-height: 500px)`), inte bara under `max-width`. #1712 (Mer-menyn) är rättad: alla åtta val nås genom rullning i 800×360.
   - **Vem:** Claude Code.

6. **Text under 12 px kvar i mobil 400 px i nya ytor.**
   - **Bevis (400×800):** skalraden "Före 3000 f.Kr.: en tiondel ≈ 1400 år" (`#timeline-scale-note`) 11 px (`03-fore3000-mobil.png`); platsens karta `#flat-region-context` och `#flat-region-tap` 11,5 px, på globen `#globe-region-context` 11,5 px (`09-regionvy-skane-mobil.png`, `15-globregion-gronland-mobil.png`); Lager → Fler val: gruppernas namn och den nya räknaren "1 av 4 på · 1 saknar data här" (#1960) 11 px (`17-lager-flerval-40000-mobil.png`). I liggande också `#flat-region-legend-text` 11,5 px.
   - **Förslag:** 12 px för dessa väljare i mobil och utöka provet för #1713 (det kontrollerar i dag bara platskort, fokusrad och teckenförklaring, jfr #1996).
   - **Vem:** Claude Code eller Codex.

7. **Platsens karta på globen i liggande telefon: rutan täcker årtalet när platsnamnet är långt.**
   - **Var:** `#globe-region-chip` (z-index 15) över `#year-jump`. Nya Zeeland (Aotearoa) får två rader namn, rutan blir 122 px (y 54–176) och årtalet (y 135–166) ligger under; `elementFromPoint` mitt på årtalet ger `globe-region-context`. Grönland och Skåne (kort namn) klarar sig.
   - **Bevis:** `15-globregion-aotearoa-liggande.png` (årtalet syns inte), jfr `15-globregion-gronland-liggande.png`.
   - **Förslag:** räkna rutans verkliga höjd när årtalet placeras (som `--lesson-confirm-h`), eller korta namnet i rutan till en rad i liggande. Hör till #1952 (stängd).
   - **Vem:** Claude Code.

8. **Platsens karta i mobil: när kortet öppnas ligger platsen bakom kortet och brickan under zoomknapparna.**
   - **Bevis (400×800, Skåne):** stängt ark är en tom remsa med bara × (68 px, `09-regionvy-skane-mobil.png`); när arket dras till halvt syns bara högen "×15" och brickan "Hela Skåne · 3" längst upp till höger, brickans mitt täckt av högen (`elementFromPoint` ger `rpile`) och kanten mot "−" och helskärmsknappen; resten av Skåne ligger bakom kortet (`10-regionvy-mobil-ark-uppdraget.png`). Samma mönster som baslinjen 1.4.
   - **Förslag:** rama om kartan till den fria ytan ovanför arket när arket ändrar läge (region-frame.js räknar redan den fria ytan för rutan), och visa platsens namn i det stängda arket i stället för en tom remsa (fråga 3).
   - **Vem:** Claude Code (Sonnet high).

9. **Platskortet vid 200 % zoom: "Visa på kartan" ligger under fokusraden.**
   - **Bevis:** 640×400: kortet visar typ, namn och "Landskap i Sverige"; knappen (y 226) täcks av fokusraden (y 238–296). `26-zoom200-platskort.png`. Samma familj som #1853 2.2 och baslinjen 1.10.
   - **Vem:** Claude Code, gärna ihop med punkt 1 (låga fönster).

## Smått

- **Rikeskortets "Dagens länder" (#1955) ligger långt ner:** för Kalmarunionen 1 139 px ner i ett 480 px högt kort (dator) och 1 216 px i mobil, sist under Kortfattat. Ingen väg syns i första synfältet (fråga 2). Rubriken "DAGENS LÄNDER" är 11 px i dator, knapparna 24 px höga. Tangentbordet fungerar: Enter på "▶ Sverige" följer landet och lägger fokus på det nya kortets Stäng (`14-rike-till-land-tangentbord-*.png`). Med mus hamnar fokus på `body` (ingen påverkan för tangentbord). Förslag (*kräver DasKrokodils ja*, ordningen i kortet): en rad "I dag: Sverige, Danmark" nära rubriken.
- **Hjälp saknar fortfarande `role="dialog"`** och Tab lämnar kortet efter 4 steg (till `#ff-tab`). För lärare och Inställningar har nu roll, fokus på Stäng, Tab stannar kvar och Escape återställer fokus (#1713 punkt 3 rättad där).
- **Bildtext läses två gånger:** `js/ui/panel.js:151` sätter `alt` till samma text som `figcaption`, så en skärmläsare läser bildtexten två gånger. Förslag: `alt=""` när bildtexten står bredvid, eller en kort alt.
- **Text under 12 px i dator (1280 px):** skalans årtal 10,5 px, `#year-segment` 11 px, händelsekortets metarad 11,5 px, bildtext och kredit 11 px, "Vy/Stil/Utforska" 9,5 px, Lager-beskrivningar 11 px, `.story-label` "PLATS" 10,5 px. WCAG kräver ingen minsta storlek, men projektets regel säger minst 12 px.
- **Tidslinjens romber** (`button.tff`, Visste du?-markeringar) är 13×13 px tryckbara knappar, i dator och mobil.
- **Tabbordning:** från sidans början kommer globen och 17 markörer före årtalet och menyerna (dator, år 1325). Globens aria-label säger att Escape går till årskontrollen, så det finns en väg; en synlig "hoppa till tidslinjen"-länk saknas (fanns inte heller i v6.4.0).
- **Dator: händelsekortet ligger 54 px förskjutet över Samtidigt-panelen** med två ×-knappar nära varandra (`05-handelsekort-lund-dator.png`).
- **Liggande: Visste du?-fliken** (y 177–218) nuddar tidsfönsterraden (y 217–232), och det öppna kortet (y 118–220) går 3 px ner i raden. #1713 punkt 5 (kortet över årtalet) är rättad: årtalet täcks inte längre.
- **Escape i en tur avslutar turen direkt** utan fråga (fokus till reglaget); lektionen frågar "Lämna lektionen?". Konsekvensfråga.
- **Lager vid 40 000 f.Kr.:** raden "Ingen data för året · data från 2500 f.Kr." (#1960) syns bara under "Fler val"; huvudvyn med förinställningar säger inget, och ingen förinställning är markerad (alla `aria-pressed="false"`, rutan "Anpassad" är tom). Fråga 2.
- **Sök och följ i liggande:** huvudet tar cirka 240 av 344 px; "Fönstret är bredare än det globen visar" står kvar (baslinjen 2.18). `28-sok-platser-liggande.png`.
- **Lärarbladets avsnitt "Källdetektiven"** skrivs med märkbart mindre text än resten av bladet (`23-blad-andra-varldskriget.pdf` s. 3), och långa Wikipedia-adresser bryts mitt i ordet i elevbladets källor ("…Settlement_of_Icelan d", `22-lararblad-a4.pdf`).

**Kontrollerat och rättat sedan v6.4.0 (ingen åtgärd):** #1712 Mer-menyn i 800×360 (alla val nås); #1713 punkt 1 i 400 px för de ytor issuet nämner, punkt 2 (platskortets summary 44 px i mobil), punkt 3 (För lärare/Inställningar), punkt 4 (platskort i neutral ram), punkt 5, punkt 7 ("Ungefärlig plats i Skåne", brickan i rutan); #1950/#1971 tangentbordsfokus till kartan (8/8 i `tests/regionfokus.mjs`); #1952 liggande regionvy (kartan fri, knappar 44 px) utom punkt 7 ovan; #1940 lärarbladet: alla fyra lektionsturer ger elev- och lärarblad som håller sig inom A4 (2–3 sidor, `23-blad-*.pdf`); #1307 tidsfönstret i ord och mobillegenden; #2128 "Tecken" nås med Tab; #2129 "ny skala" dold i 400 px; turkortets rullning nollställs vid Nästa (baslinjen 2.1). Nivåväxlaren: `role="group"` "Tidsreglage", `aria-pressed`, före reglaget i tabbordningen, statusraden säger "Tidslinjen visar nu tiden före 3000 f.Kr. Nu är varje steg 100 år", reglagets `aria-valuetext` är året, dold i tur, lektion och Fokus. Panelens tidsgrupper är `h3` och världsdelarna `role="tablist"` med roving tabindex. Platsens karta har bytt namn och knappen heter "Visa på kartan" i alla tre lägen (#1853 rekommendation 3).

## Möjliga sakfel till andra experter

- (historiker/forhistoriker) Neandertalarnas kort säger "≈ 102 000 år sedan" för en händelse som visas "till cirka 37 000 f.Kr."; talet räknas ur startåret (-99999, reglagets början). Kontrollera att startåret i datan är källans och inte bara tidslinjens kant.

## Luckor (saknas)

(Gäller inte `ux-tillganglighet`.)

## Ej kontrollerat

- Riktig skärmläsare (NVDA/VoiceOver): bara roller, namn, live-region och fokus är lästa ur DOM.
- Firefox och WebKit, riktiga telefoner, dragning av arken med riktig touch.
- #1978 tryck på landet i plats-Fokus med pekare (kräver globens WebGL-koordinater); täcks av webbläsartestet.
- Reducerad rörelse utöver globens flygning till platsens karta (uppspelning, kortens övergångar).
- Andra språk än svenska i gränssnittet (utom att dubbleringen i punkt 2 finns i alla språkfiler).
- Mobilens mörka rektangel över globen när Visste du-kortet är halvt öppet (`07-vistedu-mobil.png`), samma som baslinjen 2.20; kan vara programvaru-WebGL i headless-läge.
- Alla turer utom songhairikets-fall (kort) och vikingatiden-och-varlden (lektion) i skärmen; utskrift provad för fyra lektionsturer.
- Bildernas innehåll mot källorna (historikerns del); bara mått, storlek och bildfält kontrollerade.
