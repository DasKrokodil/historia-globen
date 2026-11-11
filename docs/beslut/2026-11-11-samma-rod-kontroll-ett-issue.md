# Samma röda kontroll i flera pull requests: ett gemensamt issue

**Datum:** 2026-11-11

**Beslut:** När samma webbläsarkontroll faller i flera pull requests, och felet inte hänger ihop med pull requestens ändring, samlas uppgifterna i ett och samma issue. Agenten söker först efter ett öppet issue om kontrollen och lägger en kommentar där (pull request, körning, jobb, felrad, datum). Finns inget skapas ett bug-issue. En omkörning som blir grön noteras också. Regeln står i AGENTS.md ("Röd kontroll", punkt 6) och i CLAUDE.md ("Testa innan du är klar", punkt 6).

**Motivering:** DasKrokodil har sett samma ostabila kontroll falla tidigare (#1174, "en händelse öppnas från Samtidigt"). Utan en gemensam plats ser varje pull request ut som ett engångsfel, och den som rättar kan inte se hur ofta och var det händer. Ett issue med alla förekomster ger underlag för att avgöra om det är testet eller koden som är ostabil.
