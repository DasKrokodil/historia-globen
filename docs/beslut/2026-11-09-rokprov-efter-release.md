# Rökprov i stället för hela sviten efter release

Datum: 2026-11-09

**Beslut:** Kontrollera produktionen (`production-check.yml`) kör ett rökprov ur webbläsartestet i datorbredd, inte hela sviten. Urvalet står i `ROKPROV` i arbetsflödet och använder `BREDD` och `ENDAST` (tests/urval.mjs). Tidsgränsen är 10 minuter.

**Motivering:** Hela sviten tog över 20 minuter mot produktionen och stoppades av tidsgränsen vid v5.0.0, v6.0.0 och v6.1.0, trots att releasen i sig lyckades. Hela sviten körs redan för varje pull request. Efter publicering är frågan om den skarpa sidan lever (rätt filer, cache, globen, tidslinje, Samtidigt, Lager, Fokus, Platt vy, Källor), inte om varje kontroll är grön.

**Följd:** Mobilbredd och de tunga kontrollerna (lektion, utskrift, kombinationsmatris) körs inte efter release. Ett rökprov som blir för långsamt trimmas, inte tidsgränsen.
