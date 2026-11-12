# Spanska och franska översätts parallellt, utan att vänta på tyskan

**Datum:** 2026-11-12 (DasKrokodil)

## Beslut
1. Spanska och franska får översättas **samtidigt**. De behöver inte vänta på att tyskan är klar, och franskan behöver inte vänta på att spanskan är klar.
2. Det ersätter ordningen "ett språk görs färdigt innan nästa" i [2026-11-06-oversatt-samtidigt.md](2026-11-06-oversatt-samtidigt.md) (punkt 5) och "tyska först, sedan spanska, sist franska" i [2026-11-09-undantag-for-parallellt-arbete.md](2026-11-09-undantag-for-parallellt-arbete.md) (punkt 2). Engelskan är fortfarande först, och tyskan fortsätter parallellt.
3. **Det som gäller kvar:**
   - Första innehållsomgången i varje språk är småfilerna (vyer, upptäcktsvy, bildstilar, religioner: #809 för spanska, #822 för franska). Där sätts tonen och namnvalen, så periodernas och rikesindexets issues startar när småfilerna för just det språket är ihopslagna.
   - Delarna av `data/empires/index.json` byggs en i taget per språk, eftersom de ändrar samma fil. Perioderna ändrar olika filer och kan byggas parallellt.
   - Högst en pull request per redigeringsfil och språk, och gränsen på fyra öppna pull requests per konto.
   - Ordlistan [docs/ordlista-oversattning.md](../ordlista-oversattning.md), tilltalet och källpolicyn gäller som förut. Översättningen ändrar aldrig fakta.

## Motivering
Tyskan går långsammare än väntat, och spanskan och franskan rör andra filer (`*.es.json` och `*.fr.json` i `data/genererat/`). Andreas och hans agenter kan därmed ta fler issues parallellt utan att filerna krockar. De genererade filerna och `data/oversattning.json` räknas inte som krock (beslut 2026-11-09).
