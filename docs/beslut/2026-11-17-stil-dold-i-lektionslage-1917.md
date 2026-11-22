# Stil-gruppen är dold i lektionsläget (#1917)

Datum: 2026-11-17

## Beslut

Lektionsläget döljer hela Stil-gruppen (`.style-mode`, med knappen Upptäcktsresor) på samma sätt som Vy-gruppen (`.view-mode`), med `display: none` i `css/style.css`. Det gäller dator och mobilens Meny. Eleverna ska inte kunna byta kartstil i en lektion, och `display: none` gör att knappen inte heller nås med tangentbord.

## Motivering

I #1911 (#1577) flyttades `#btn-discovery` ur Vy-gruppen till en egen grupp, och regeln som dolde Vy-gruppen i lektionsläget träffade den inte längre. Beslutet i #795 (lektionsläget låser menyer, lager och vy) gäller alltså även stilen. Presentationsläget och turer döljer inte Vy eller Stil och påverkas inte.

Kontrollen "lektionsläget låser menyerna …" (#795) har fått en rad som uttryckligen kräver att `.view-mode`, `.style-mode` och `#btn-discovery` har `display: none` i lektionsläget.
