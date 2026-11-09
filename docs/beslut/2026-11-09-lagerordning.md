# Lagerordning för ytor: namngivna lager i stället för handskrivna z-index (#894)

**Datum:** 2026-11-09

**Beslut:** DasKrokodil sa ja till #894 enligt rekommendationen: lagren får namn i `:root` i `css/style.css`, lägst först: `--z-kort` (13), `--z-turkort` (14), `--z-panel` (15), `--z-kort-over-tur` (15), `--z-band` (16) och `--z-meny` (17). Första steget är en ren namngivning av de ytor som #887 och #876 rörde (meny, panel, faktaruta, turkort, lektionsband); värdena är oförändrade, så ingen visuell ändring. De övriga ytorna flyttas över i små pull requests när de ändå rörs. Registret i `js/main.js` där en öppnad yta stänger sin grupp byggs senare, en yta i taget, med kombinationsmatrisen (#891) som bevis.

**Motivering:** handskrivna siffror tätt intill varandra gav två fel på en vecka (#887, #876). Namn gör ordningen läsbar utan nytt beroende eller ny arkitektur.
