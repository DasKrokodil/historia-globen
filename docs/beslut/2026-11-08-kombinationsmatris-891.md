# Webbläsartestet får en kombinationsmatris (#891, del 1)

Datum: 2026-11-08. Av: Claude Code (orkestern), på uppdrag av #891.

**Beslut:** webbläsartestet får en kontroll som provar varje meny och verktyg ovanpå varje yta som redan kan vara öppen, och mäter vad som faktiskt tar emot klicket (`elementFromPoint`) innan knappen klickas med riktig pekning. Kontrollen ligger i ett eget CI-jobb (`matris` i `tests/jobb.json`) och är utesluten ur de andra jobben.

**Skäl:** blind-spots-rundorna (#871, #875) och U1 (#887) visade att isolerade prov är gröna medan en kedja är röd. Granskningsmallen (`docs/granskningar/README.md`) kräver att ett användarfynd som testet missade också ändrar testmetoden. Ett eget jobb gör att matrisen inte ärver öppna paneler och inte förlänger de andra jobben (#864).

**Avgränsning:** del 1 gäller tre ytor och sex knappar. Felinjektion (källregister, turfil) och skolflöden bevisade med pekning återstår i #891. Ingen app- eller datafil ändras.
