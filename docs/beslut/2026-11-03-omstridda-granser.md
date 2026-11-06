# Omstridda gränser i nutid följer Sveriges officiella hållning (#556, #644)

**Datum:** 2026-11-03 (beslutet), nedskrivet 2026-11-06

## Beslut
Nutida omstridda gränser och statusfrågor (till exempel Krim, Palestina, Kosovo, Kashmir, Västsahara och Taiwan) ritas enligt Sveriges officiella hållning, med en källa per fall på regeringen.se (länk, kontrolldatum och egna ord). Riket och sidan Om källorna får en öppen not om att gränsen är omstridd och att kartan följer Sveriges hållning enligt UD. Saknas en tydlig svensk hållning visas Cliopatrias gräns med noten att Sverige inte har någon uttalad hållning som vi hittat, och Rikard tillfrågas innan vi väljer sida. Varje fall har ett kontrolldatum och kontrolleras igen vid varje release som rör nutida gränser. Historiska gränser (före cirka 1945) följer Cliopatria. Listan över fallen står i [docs/omstridda-granser.md](../omstridda-granser.md) och godkänns av Rikard innan något ritas.

## Varför
Frågan är känslig, och källpolicyn säger att vi inte väljer sida i tysthet. Sveriges officiella hållning är en tydlig och spårbar grund, och noten visar öppet att andra synsätt finns. Det ersätter det tidigare förslaget att bara visa vad Cliopatria visar.

## Berör
`data/empires/index.json` (noter), `tools/riken.py` (klippning där Cliopatria avviker), `data/sources.json`, `docs/omstridda-granser.md`, `docs/kallor.md`.
