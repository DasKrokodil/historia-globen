# Codex och Copilot får ta issues där fakta ska hittas; översättning går till Andreas (2026-11-28)

**Datum:** 2026-11-28. **Beslut (DasKrokodil, i chatten):** reglerna lättas så att Codex och Copilot, på DasKrokodils konto och på Andreas, även får ta issues där de behöver hitta fakta. Eventuella fel fångas i granskningen före release av Claude och experterna. Översättningar lämnas till Andreas.

## Ersätter
- Förbudet "Codex och Copilot tar aldrig `data`, `faktafel`, `källkontroll` eller rikesarbete" (CLAUDE.md, AGENTS.md, `docs/referens/arbetssatt.md`, `docs/referens/codex-regler.md`, `.github/copilot-instructions.md`).
- Det smala undantaget "Passar: Codex" i temat Språk och skrift ([2026-11-27-codex-pilot-sprak-och-skrift](2026-11-27-codex-pilot-sprak-och-skrift.md)): villkoren därifrån gäller nu alla fakta-issues, och märkningen "Passar: Codex" behövs inte längre.
- Delen om översättningar i [2026-11-27-codex-tar-oversattning-och-bilder](2026-11-27-codex-tar-oversattning-och-bilder.md): se punkt 4. Delen om riktiga bilder är oförändrad.

## Beslut
1. **Codex och Copilot får ta `redo`-issues med `data`, `källkontroll`, `faktafel` och rikesarbete** (nya händelser, täckning, länder, landskap, riken, rättelser av fakta). Alla andra villkor för `redo` gäller som förut: tydligt avgränsat, inga olösta beslut, inga krockar, ingen `beslut-krävs`, `utanför-kod` eller `idé` utan DasKrokodils ja.
2. **Källpolicyn är oförändrad och gäller den som skriver** (CLAUDE.md, "Källpolicy"). Det som lättas är *vem* som får ta issuet, inte hur fakta skrivs:
   - Aldrig fakta ur minnet. Varje årtal, plats, siffra och påstående kommer från en källa som agenten har öppnat.
   - Pull requesten listar per händelse eller uppgift källans adress, vad källan säger och vilket datum den öppnades.
   - `review` blir högst `source-checked`. `two-sources` bara när en andra, oberoende källa har öppnats och årtal och plats stämmer; båda står i `sources`.
   - Oense källor skrivs öppet i `note` ("Källorna skiljer sig"). Omstridda frågor, omstridda gränser och religiöst eller politiskt känsliga påståenden avgörs inte av agenten: de blir en kommentar i issuet med källorna, och uppgiften hoppas över eller blir `draft`.
   - Licensreglerna gäller (CC0, CC BY, public domain, GPL för gränsdata; ingen text kopieras). Är licensen oklar: avstå och flagga.
   - Kan en källa inte öppnas (spärr, 429, betalvägg) skrivs uppgiften inte. Det står som lucka i pull requesten.
   - Fel i befintliga händelser som agenten stöter på rättas bara om issuet gäller det; annars lämnas de som kommentar med källa.
3. **Granskning (beslut 2026-11-23 gäller):** ingen granskning av varje pull request. `historiker` (med `geograf` och `forhistoriker` vid behov) granskar fakta, data och källor i batch före release, och stickprovar särskilt pull requests från Codex och Copilot med hjälp av källistan i pull requesten. Hittar granskningen fel rättas de före release och mönstret skrivs i utvärderingen #1209. Är felen många (förslag: fler än ett fel på tio granskade uppgifter i ett stickprov) tar Claude Code åter den typen av issue tills DasKrokodil bestämt annat.
4. **Översättning går till Andreas.** Issues med `översättning` och alla `redo`-issues i milstolpen "Löpande: Språk: översättning" tas av Andreas agenter (Codex, Copilot, Claude Code på hans konto). DasKrokodils Codex, Copilot och Claude Code tar dem inte. Det ändrar beslutet 2026-11-27 för DasKrokodils konto; på Andreas konto är det oförändrat. Regeln "översätt samtidigt" gäller som förut: en pull request med nytt innehåll bär sina egna översättningar, oavsett vem som skriver den.
5. **Tak:** de vanliga fyra öppna pull requests per person gäller för fakta-pull requests. Översättnings- och bildtaken är oförändrade (8 respektive 6).
6. **Modellnivå:** fakta- och källissues får Codex Terra med starkaste modell och hög resonering, som för riktiga bilder. Dirigentens modellnivåer i CLAUDE.md är oförändrade för Claude Code.

## Varför
Claude Code har varit flaskhals för all data, och Andreas har lediga Codex-resurser. Källpolicyn och granskningen före release är kvar, och regeln att alla uppgifter ska ha en öppnad källa och högst `source-checked` skyddar mot att något påhittat hamnar på globen.

## Risk
Agenter kan läsa en källa fel eller hoppa över att öppna den. Skyddet är källistan per uppgift i pull requesten, stickprovet före release och att omstridda frågor lämnas till en människa. Beslutet prövas i första batchgranskningen efter att det börjat gälla, och i utvärderingen #1209.

## Berör
CLAUDE.md ("Etiketter och tak"), AGENTS.md, `docs/referens/arbetssatt.md`, `docs/referens/codex-regler.md`, `.github/copilot-instructions.md`, `docs/referens/orkestern.md`, `.orchestra/project.md`. Ersätter delvis [2026-11-27-codex-pilot-sprak-och-skrift](2026-11-27-codex-pilot-sprak-och-skrift.md) och [2026-11-27-codex-tar-oversattning-och-bilder](2026-11-27-codex-tar-oversattning-och-bilder.md).
