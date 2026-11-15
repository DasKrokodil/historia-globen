# Uppspelning och hopp i förhistoriens segment (#1090)

2026-11-13, Claude Code (DasKrokodil). Provat i Chromium på 1280 och 400 px bredd. Del 4 av #49, efter #1319, #1320 och #1089.

| Fil | Vad den visar |
|---|---|
| `uppspelning-1280.jpg`, `uppspelning-400.jpg` | Uppspelningen pausad i förhistorien: farten 25 000 år/s och stegen ±1000 till ±100 000 (i mobil döljs de yttersta) |
| `snabbhopp-1280.jpg`, `snabbhopp-400.jpg` | Årshoppets snabbhopp med segmentet "100 000–3000 f.Kr." först |

## Resultat
- **Uppspelningen** går från 100 000 f.Kr. till 3000 f.Kr. på några sekunder, med 25 000 år/s före 10 000 f.Kr. och 2500 år/s till 3000 f.Kr. Därefter är farten som förut. Förut tog samma sträcka cirka en kvart. Året landar på reglagets upplösning (#1320). Inga felaktiga pauser: ingen paushändelse ligger i förhistorien i dag. Pauserna räknar "passerat sedan förra bilden", så stora steg hoppar inte över dem.
- **Snabbhoppet** till segmentet finns sedan #1088 ("100 000–3000 f.Kr.").
- **Samtidigt-fönstret** står i klartext sedan #1319 ("12 000 år före, 2000 år efter" vid en skarv).
- **Bakåt och Framåt** i webbläsaren fungerar mellan 1325 och 50 000 f.Kr.
- **Fokus:** temat Teknik (från 2200 f.Kr.) håller året inom temat även när länken pekar på 50 000 f.Kr.
- **Återgången efter hopp (#997)** hör till "Visste du?" i Samtidigt-kortet. I förhistorien finns inget Samtidigt-kort och ingen fun fact, så återgången kan i dag varken starta eller landa där. Den prövas när förhistorien får fun facts.

## Test
Webbläsarkontrollen "uppspelning och hopp i förhistoriens segment (#1090)" i `tests/webblasare.mjs` prövar:
- farten,
- att uppspelningen kommer minst 10 000 år på 10 s, vilket den gamla farten aldrig skulle klara,
- att året stannar på upplösningen,
- Bakåt/Framåt.

Kravet är oberoende av bildfrekvensen, eftersom den huvudlösa webbläsaren i datorbredd ritar långsamt.
