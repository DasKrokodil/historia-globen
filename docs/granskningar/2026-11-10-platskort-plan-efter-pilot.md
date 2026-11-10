# Platser: plan om piloten lyckas (#579)

**Datum:** 2026-11-10. **Status:** förslag till DasKrokodil och Andreas, inget är beslutat. Underlag: designförslaget och pedagoggranskningen i Miro, kommentarerna i #579 och beslutet [2026-11-10-platser-och-typ-i-data.md](../beslut/2026-11-10-platser-och-typ-i-data.md).

## 1. Piloten (tre platser)
Skåne, Grönland och Aotearoa. Fakta tas in först (öppnade källor, två oberoende när det går), DasKrokodil och Andreas väljer de viktigaste händelserna, sedan skrivs korten med källor och översätts till fem språk i samma pull request. Codex bygger gränssnittet; kameran (#1056) ska fungera före det.

## 2. När är piloten lyckad? (portar, avgörs av DasKrokodil och Andreas)
Mätbart (kontrolleras av Claude Code före granskningen):
- Alla uppgifter har källa; nivån `two-sources` där två källor stämmer, och oenighet skriven öppet.
- Webbläsartestet är grönt i dator och mobilbredd, inga konsolfel, ingen horisontell scroll, och antalet oöversatta texter har inte ökat.
- Flagga, vapen och gräns har kontrollerad licens.

Bedömning (antaganden tills någon observerat):
- DasKrokodil och Andreas läser korten och svarar: berättar de platsens historia (till exempel hur Skåne blev svenskt)? Förstår man att konturen är dagens gräns? Vill man öppna ett kort till?
- Pedagogens frågor (förstår en elev i åk 4–6 och 7–9 vad kortet är, belagt mot tolkat, kommer eleven tillbaka med det som syns på skärmen) besvaras mot det byggda kortet. Ingen pilot med lärare och klass görs nu (#744 stängd); har någon ändå en klass att visa det för är det ett plus, inget krav.

Slutar vi här: korten får stå kvar som de är, eller tas bort utan följdskador (ny datafil och eget lager), och beslutet skrivs som nytt beslut.

## 3. Om den är lyckad: i vilken ordning
1. **Fastställ formatet (före fler platser).** Datafilen för platser får schema (JSON Schema, #391), typlistan och dess översättningar, och ordet "Platser" i ordlistan. Beslutet om var gränser och perioder lagras skrivs. Gränskällan förs in i `data/sources.json`, README och `THIRD-PARTY-NOTICES.md`.
2. **Andra omgången, några få platser.** Högst fem platser per pull request, som händelsebatcharna. Urvalet ska bygga på öppnade listor och inte på minnet (till exempel Lgr22 för landskap, och administrativa enheter ur en öppen datakälla för delstater), och ha platser från flera världsdelar (CLAUDE.md, Regler). DasKrokodil har nämnt landskap i Sverige, Bundesländer i Tyskland och Österrike och delstater i USA som utgångspunkt; i vilken ordning avgörs efter omgång två.
3. **Skolan.** Stegfältet i turerna så att läraren öppnar ett kort i lektionsläget, lärarfält och utskrift (se pedagogens punkt 3), och en eller två frågor per plats i turernas form.
4. **Skala upp** i omgångar om pilotens arbetsgång håller: Opus samlar fakta, DasKrokodil och Andreas väljer, Claude Code skriver och källkontrollerar, den andra agenten korsgranskar översättningarna, Codex rör bara gränssnitt. Täckningen mäts per världsdel och typ med `tools/tackning.py` (en utbyggnad behövs för platser).
5. **Utvärdera efter varje omgång** (regeln i CLAUDE.md: varje version slutar med att DasKrokodil utvärderar), och pausa om platserna blir en ny slagsida mot Europa.

## 4. Risker att bevaka
- **Nutida gräns som ser historisk ut.** Fast rad på kortet; när regionbaserade gränser ändras över tid behövs ett separat beslut.
- **Urval som lär ut fel sak** (Skåne bara som krig). Händelserna väljs för berättelsen, inte för att de finns i datan.
- **Omstridda gränser och namn** (se `docs/omstridda-granser.md`): källorna återges, ingen egen värdering.
- **Licenser för flagga, vapen och gränsdata**, kontrolleras per fil.
- **Filkrockar** mellan omgångar som rör samma datafiler och `data/ui/`; samma regler som för översättningsomgångarna.
- **Volym.** Antalet platser är i praktiken obegränsat; stoppvillkor behövs (se punkt 5).

## 5. Beslut som DasKrokodil behöver ta längs vägen
1. Går vi vidare efter piloten, och med vilka platser i omgång två?
2. Vilken typ av plats först: landskap, delstater eller länder?
3. Hur många platser räknas som "färdigt" för en version (förslag: ett fåtal per världsdel, inte täckning av hela världen)?
4. Platskort som del av skolpaketet eller bara fri utforskning?
5. Ska kortet få en egen plats i versionsplanen (nu 6.4.0 Regionkort, som då byter namn till Platser)?

## 6. Kostnad
Token- och tidsåtgång för pilotens faktainsamling, skrivande och bygge mäts under piloten (jfr #895) och används för att sätta intervall för omgång två. Inga siffror föreslås här eftersom det inte finns mätningar.
