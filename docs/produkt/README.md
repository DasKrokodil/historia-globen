# Produktdokumentation: vad Historia-globen är till för

Det här är de dokument som svarar på *varför*, *för vem* och *vad som är gott nog*. De kompletterar [arkitektur.md](../arkitektur.md) och [datamodell.md](../datamodell.md), som svarar på *hur*. De är ramar att granska mot, inte regler som stoppar arbete: avviker något från dem ska det bli ett medvetet beslut i [docs/beslut/](../beslut/README.md), inte en tyst drift.

**Genomgång inför v6.1.0 (2026-11-09, `main` `c5935f5`):** uppdaterade [03](03-anvandningsfall-och-funktioner.md) (UC18–UC20 finns, UC20b tema), [04](04-arkitekturoversikt.md) (controllers), [05](05-ux-oversikt.md) (rum och känd UX-skuld), [06](06-granskningsperspektiv.md) (vad linserna sagt), [09](09-kravspecifikation.md) (K-PLA-01 och K-PLA-07), [13](13-ordlista.md) (tidsintervall, epok, tema, Plats) och [14](14-testoversikt.md). **Även genomlästa mot `main` `c5935f5`:** [01](01-vision-och-mal.md), [02](02-anvandare-och-intressenter.md), [07](07-valideringsplan.md), [08](08-urvalsriktlinje.md), [10](10-namn-och-domaner.md), [11](11-kostnader-och-villkor.md) och [12](12-integritet-och-licenser.md). Inget i dem har ändrats av 6.1.0; varje dokument har en rad längst ned med vad som kontrollerades och vad som inte gjordes, och bara de punkter som faktiskt gick att besvara är avbockade. Kvar öppet: kostnads- och villkorskolumnerna i 11 är ofyllda, den juridiska läsningen i 12 är inte gjord, och inget användartest i 07 har gjorts. Antagandena om användare är fortfarande antaganden. Dokument vars datum ligger före 2026-11-09 men inte nämns här har inte kontrollerats mot v6.1.0.

**Läget:** första versionen skrevs 2026-11-08 (inriktningen bekräftades av DasKrokodil samma dag, se [beslutet](../beslut/2026-11-08-produktinriktning.md)) mot `main` (commit `103792b`, version 6.1.0-dev). Allt som beskriver **användare, deras behov och hur de upplever sidan är antaganden**, eftersom ingen användarstudie har gjorts (ingen skolpilot, beslut 2026-11-07). Det är markerat i varje dokument. När vi har riktiga observationer ersätter de antagandena.

| Dokument | Svarar på | Läses när |
|---|---|---|
| [01-vision-och-mal.md](01-vision-och-mal.md) | Vad vill vi uppnå, vad vill vi inte, och hur ser vi att det går bra? | Ett förslag eller en ny version ska prioriteras |
| [02-anvandare-och-intressenter.md](02-anvandare-och-intressenter.md) | Vilka använder sidan, vilka påverkas av den och vad behöver de? | Ny funktion, nytt innehåll, ny text |
| [03-anvandningsfall-och-funktioner.md](03-anvandningsfall-och-funktioner.md) | Vad ska man kunna göra, och vilken funktion gör det? | Nytt issue, release, täckningsrunda |
| [04-arkitekturoversikt.md](04-arkitekturoversikt.md) | Hur hänger systemet ihop, i bilder, och vad är riskerna? | Arkitekturanalys, nytt lager, nytt beroende |
| [05-ux-oversikt.md](05-ux-oversikt.md) | Hur är sidan upplagd, vilka flöden och lägen finns, vad är känd UX-skuld? | UX-genomgång, UI-ändring |
| [06-granskningsperspektiv.md](06-granskningsperspektiv.md) | Hur skulle en senior UX-designer, arkitekt, historielärare, elev och historieintresserad titta på sidan? | Varje granskning, analys och release |
| [07-valideringsplan.md](07-valideringsplan.md) | Hur ersätter vi antagandena med riktiga observationer? (utkast) | Planering av användartest, lärarkontakt, release |
| [08-urvalsriktlinje.md](08-urvalsriktlinje.md) | Vad är värt en plats på globen, och hur motiverar vi urvalet? (utkast) | Nytt innehåll, täckningsrunda, "varför just den här?" |
| [10-namn-och-domaner.md](10-namn-och-domaner.md) | Hur kan sidan få namn och domäner på andra språk om intresset visar sig? Plan, inte beslut | Intresse utanför Sverige, nytt språk |
| [11-kostnader-och-villkor.md](11-kostnader-och-villkor.md) | Vilka tjänster lutar sidan mot, vad kostar de, och vad händer om de ändras? (utkast, ifylles av DasKrokodil) | Nytt beroende, ändrade villkor |
| [12-integritet-och-licenser.md](12-integritet-och-licenser.md) | Vilka data lämnar webbläsaren, och vilka licenser gäller? Underlag för juridisk läsning (utkast) | Ny extern tjänst, ny datakälla, marknadsföring mot lärare |
| [13-ordlista.md](13-ordlista.md) | Projektets egna begrepp (inte översättningsordlistan) | Nytt begrepp i gränssnittet, onboarding |
| [14-testoversikt.md](14-testoversikt.md) | Vad bevisar kontrollerna, och vad bevisar de inte? (utkast) | Röd kontroll, release, ny kontroll |
| [09-kravspecifikation.md](09-kravspecifikation.md) | Vad ska sidan uppfylla och hur ser vi det? Krav med id, prioritet, bevis och status (utkast) | Nytt issue, release, "är det här klart?" |

## Så hålls dokumenten levande

1. **Ägare:** DasKrokodil beslutar om innehållet. Claude Code och andra agenter föreslår ändringar i samma pull request som ändringen i koden eller datan, på samma sätt som för `arkitektur.md`.
2. **Utlösare:** uppdatera det dokument som berörs när
   - en ny funktion, vy eller lagertyp läggs till eller tas bort ([03](03-anvandningsfall-och-funktioner.md), [05](05-ux-oversikt.md), ibland [04](04-arkitekturoversikt.md));
   - en ny målgrupp eller intressent dyker upp, eller vi lär oss något om en befintlig ([02](02-anvandare-och-intressenter.md));
   - ett mål ändras eller en avgränsning prövas ([01](01-vision-och-mal.md), alltid med ett beslut);
   - en granskning ger ett fynd som hör hemma i en lins ([06](06-granskningsperspektiv.md), avsnittet "Vad linsen har sagt hittills").
3. **Inför varje release** (i release-PR:en) och **vid varje fullständig analys**: gå igenom "Att kontrollera"-listan längst ned i varje dokument och skriv datum och commit överst i de dokument som kontrollerats. Ett dokument vars datum är äldre än den senaste releasen räknas som inaktuellt, och det ska stå så överst.
4. **Antaganden ska bli observationer.** När en granskare, lärare eller besökare (via förslagsformuläret) säger något som bekräftar eller motsäger ett antagande: ändra texten, skriv datum och källa, och byt ordet "antagande" mot "observerat".
5. **Inget nytt i dem utan källa.** Siffror om innehållet (antal händelser m.m.) räknas fram med `python3 tools/tackning.py` eller hämtas från README:n, inte ur minnet.
6. **Ett dokument som växer över cirka fyra sidor delas**, så att agenternas kontext inte fylls i onödan (se [.orchestra/context-map.md](../../.orchestra/context-map.md)).
