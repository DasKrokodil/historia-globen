
## Genomförd CI-ändring (punkt 4)

Mätning av körning 45064957726: varje jobb kör testet i 10–19 minuter och uppstarten tar cirka 40 sekunder, så att slå ihop jobb sparar inget. Ändringen gäller därför hur ofta sviten körs: ingen körning vid varje push till main (nattlig körning och `workflow_dispatch` i stället), Firefox och WebKit på söndagar eller på begäran i stället för vid varje release-PR, och ingen körning för ändringar som bara rör dokumentation. Rött i ostadiga kontroller (#1174) rättas i sina issues; ett eget icke-blockerande jobb görs först när det finns en lista över vilka kontroller som är ostadiga. Observera: har main grenskydd som kräver kontrollen "Webbläsartest" blir en docs-only-PR hängande på väntande kontroll; ta då bort kravet eller säg till.
