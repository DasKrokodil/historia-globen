# Bilder av människoarter och förhistoria: inga ansiktsrekonstruktioner som standard (#1105)

**Datum:** 2026-11-14 (DasKrokodil sa ja till rekommendationen i #1105 2026-11-13)

## Beslut
Gäller bilder till händelser om människoarter och förhistoria (version 7, #11, #1338), utöver de vanliga bildreglerna i CLAUDE.md ("Bilder (#129)").

1. **Förstahandsval är riktiga bilder** från Wikimedia Commons med tillåten licens (public domain, CC0, CC BY, CC BY-SA): fossil, fyndplatser, verktyg och andra fynd, helst i museum eller på plats. Filsidan läggs i `sources.json` och licensen står i bildtexten, som vanligt.
2. **Andrahandsval är landskap och föremål**: en illustration av miljön, djuren eller redskapen, utan människor i närbild.
3. **Ansiktsrekonstruktioner görs inte som standard**, varken egna illustrationer eller fotografier av museirekonstruktioner. Ett undantag för en enskild bild kräver DasKrokodils ja i issuet eller pull requesten.
4. **En illustration får bara göras** med synlig bildtext och spårbar prompt enligt bildreglerna (stil, verktyg, datum och exakt prompt i `image`). Bildtexten börjar alltid med standardtexten nedan, och kan sedan säga vad bilden visar:

   | Språk | Standardtext |
   |---|---|
   | sv | Illustration, tolkning, inte en historisk bild |
   | en | Illustration, interpretation, not a historical image |
   | de | Illustration, Deutung, kein historisches Bild |
   | es | Ilustración, interpretación, no una imagen histórica |
   | fr | Illustration, interprétation, pas une image historique |

   Översättningarna följer [ordlistan](../ordlista-oversattning.md) och granskas av språkexperterna före release som all annan text.
5. **En prompt får inte innehålla** hudfärg, hår, ansiktsdrag, kroppsbyggnad, kläder, smycken eller beteende som händelsens källa inte stöder. Står det inte i källan, står det inte i prompten.
6. **Stereotyper undviks:** inga "grottmänniskor", inga apmänniskor, ingen hopsjunken hållning eller tom blick som tecken på en "primitiv" art, och ingen bild som ordnar arter i en marschrad mot nutidsmänniskan.
7. **`forhistoriker` granskar** varje bild av människoarter och förhistoria (motiv, bildtext och prompt) innan den läggs in, utöver den vanliga källkontrollen.

## Varför
Hur en utdöd människoart såg ut och betedde sig är till stor del tolkning, och en bild säger mer än texten bredvid. Projektets regel är därför att en bild bara visar det som källan stöder och att tolkningar märks öppet. Bilder av "grottmänniskor" och apmänniskor är gamla stereotyper som skulle säga emot globens källpolicy. Riktiga fynd och platser är både mer sanna och lättare att källbelägga. Granskningen läggs hos `forhistoriker` eftersom det är den expert som redan granskar förhistoria och djup tid.

## Berör
Issue #1105, CLAUDE.md ("Bilder (#129)"), `tools/bildpromptar.py` och `docs/bildpromptar.md` (avsnittet om människoarter och förhistoria), `.claude/agents/forhistoriker.md`, version 7 (#11, #1325, #1338), [docs/beslut/2026-11-10-version-7-riktning.md](2026-11-10-version-7-riktning.md) och [docs/granskningar/2026-11-10-planering-version-7.md](../granskningar/2026-11-10-planering-version-7.md).
