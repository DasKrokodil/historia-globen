# Cliopatrias årtal före vår tideräkning: -N är N f.Kr. (#1989)

**Datum:** 2026-11-20. DasKrokodil sa ja till issuet: kontrollera först, rätta bara om källan är entydig.

## Vad källan säger
- README:n ([GitHub](https://github.com/Seshat-Global-History-Databank/cliopatria), samma text i v0.2.1 på [Zenodo](https://zenodo.org/records/23128623)) och artikeln i Scientific Data 2025 ([doi:10.1038/s41597-025-04516-9](https://doi.org/10.1038/s41597-025-04516-9)): "Years are recorded as integers, negative for BCE, positive for CE", och datan går "from 3400BCE to 2024CE". Den första posten har `FromYear -3400`, alltså är `-3400` = 3400 f.Kr. Artikelns exempeltabell har bilder vid jämna f.Kr.-år (`-1800`, `-1700` …).
- Ändringsåren i datan jämförda med Wikidata: Issos 333 f.Kr. (Q201526) och Gaugamela 331 f.Kr. (Q179670) motsvarar Cliopatrias ändringar `-333` och `-331` för Makedoniska och Persiska riket; Actium 31 f.Kr. (Q160387) motsvarar Romarrikets första år `-31`. Våra egna källkontrollerade händelser (slaget-vid-issos `-332`, slaget-vid-gaugamela `-330`, astronomiska år) säger samma sak. Hanriket (`Han Dynasty`) börjar `-202`, samma år som händelsen liu-bang-blir-kejsare (202 f.Kr.); Wikidata (Q7209) anger grundandet till 206 f.Kr., så där skiljer sig källorna om vilket år som räknas som början, men inte om räknesättet.
- År 0 förekommer bara som slutår (`ToYear 0`, sex poster) direkt före en post som börjar år 1, och inget år `-1` finns. Cliopatrias öppna och stängda issues tar inte upp år 0 eller f.Kr.

## Beslut
1. Cliopatrias `-N` läses som N f.Kr. och räknas om till det astronomiska året `1 - N` direkt när filen läses (`tools/cliopatria_ar.py`). År 0 och år efter Kristus är oförändrade, så att perioderna fortfarande ligger kant i kant (`-14…0` blir `-13…0`, följt av `1…5`).
2. Omräkningen gäller alla skript som läser Cliopatria: `tools/riken.py`, `tools/religioner.py` (ögonblicksbilderna 3400 f.Kr., 3300 f.Kr. … blir `-3399`, `-3299` …), `tools/religioner_riken.py` och `tools/tackning_riken.py`. Årtal som skrivs för hand i `GROUPS` är astronomiska; de två som var Cliopatrias egna tal (Makedoniska rikets erövringar och Ptolemaiska rikets slutår) är omräknade.
3. Rikena och religionsområdena före år 0 flyttas ett år framåt: Egyptens gamla rike visas från 2500 f.Kr. (förut 2501 f.Kr.). Faktarutornas rader "Om kartan" (`mapNote`) med kartans f.Kr.-år är rättade på alla språk; källornas årtal i samma texter är oförändrade. Två rader i Hanriket (110 och 50 f.Kr.) var redan skrivna med Cliopatrias tal och stämmer nu, så de är inte ändrade.
4. Gränsen mellan tidsreglagen (`scaleForYear`, -3000 sista året i det första, -2999 första i det andra) ändras inte. Cliopatrias bild för 3000 f.Kr. hamnar nu på -2999, alltså i reglaget "3000 f.Kr.–i dag", i stället för sist i reglaget före.

## Varför
Källans dokumentation och datan säger samma sak, och tre väldokumenterade slag stämmer på året med den här läsningen men inte med den astronomiska. Datamodellen (astronomiska år, CLAUDE.md) ändras inte; det är läsningen av en källa som rättas.

## Granskning
`historiker` bör granska raderna "Om kartan" i de ändrade rikena (bland annat Kartago, som nu syns till och med 145 f.Kr. medan källorna anger förstörelsen 146 f.Kr.), och `geograf` att gränserna i religionslagret följer med.
