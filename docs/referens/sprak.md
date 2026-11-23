# Språk: översätt samtidigt (beslut 2026-11-06)

Fullständig text om översättning, tilltal och stil. Flyttat ordagrant ur [CLAUDE.md](../../CLAUDE.md) 2026-11-23 (del av [beslutet 2026-11-23](../beslut/2026-11-23-farre-granskningar-sparar-tokens.md), punkt 5). Reglerna är oförändrade.

- **Ny gränssnittstext** läggs i alla fem språkfilerna i `data/ui/` (`sv`, `en`, `de`, `es`, `fr`) i samma pull request.
- **Nytt innehåll** (händelse, fun fact, tur, rike, religion, väg): svenskan skrivs och källkontrolleras först, och översättningarna till `en`, `de`, `es` och `fr` görs i samma pull request. En översättning ändrar aldrig fakta: årtal, siffror, namn, platser och påståenden är desamma som i svenskan. Granskaren kontrollerar källor och översättningar i samma steg.
- **Ändras svenskan** uppdateras översättningarna i samma pull request.
- **Tilltal och stil (beslut 2026-11-07, preciserat 2026-11-08):** artigt tilltal i alla språk (`Sie`, `usted`, `vous`), **utom i texter för elever upp till 13 år** (Samtidighetsjakten och lektion 2, åk 4–6), som har du-form i alla språk ([docs/beslut/2026-11-08-tilltal-efter-alder.md](../beslut/2026-11-08-tilltal-efter-alder.md)). Ordlista, tidsangivelser och typografi för spanska och franska: [docs/ordlista-oversattning.md](../ordlista-oversattning.md); nya termer läggs till där.
- Antalet oöversatta texter får aldrig öka. Äldre innehåll översätts i omgångar: engelska först, sedan tyska, spanska och franska, där spanska och franska kan göras parallellt utan att vänta på tyskan (docs/beslut/2026-11-06-oversatt-samtidigt.md, docs/beslut/2026-11-12-spanska-och-franska-parallellt.md).
