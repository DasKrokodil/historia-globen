# Codex-granskningen ska alltid lämnas som kommentar i pull requesten

2026-11-10

**Beslut:** Codex-granskningen av en pull request räknas bara som gjord när resultatet står som kommentar i pull requesten på
GitHub, också när den blev "godkänd" utan anmärkningar och efter varje rättning. Granskaren läser kommentarerna igen direkt
efter att ha skrivit sin och kontrollerar att den syns. "Klar för Claude Code-granskning" får inte skrivas förrän
kommentaren "Codex-granskning: godkänd" finns. Kommentaren har fast innehåll: rubrik, vad som kontrollerades, vad som inte
kunde kontrolleras och eventuella arbetsorder, och den anger vilka språk och vilken sorts fakta pull requesten rör.
Reglerna står i AGENTS.md (punkt 7–9 under "Granskar du åt Rikard eller Claude Code").

**Motivering:** Regeln från 2026-11-07 fanns redan men Codex missade ändå ibland att skriva kommentaren, så att granskningen
bara syntes i chatten. Då vet varken Rikard eller Claude Code om den är gjord. Ett krav på att kontrollera att kommentaren
finns, och ett fast innehåll, gör det lätt att se och lätt att kontrollera vid kökontrollen.
