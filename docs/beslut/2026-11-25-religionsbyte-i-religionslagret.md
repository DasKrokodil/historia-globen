# Religionsbyte i religionslagret (#2162)

**Datum:** 2026-11-25 (DasKrokodils svar "Gör som rekommenderat" i [#2162](https://github.com/DasKrokodil/historia-globen/issues/2162), 2026-11-25)

## Beslut
Fältet `christianSince` (med `source`) i registret i `data/religions.json` ersätts av ett allmännare fält för religionsbyte:

```json
"conversion": { "religion": "islam", "since": 1076, "sources": ["wp-ghana-empire"],
                "note": { "sv": "Källorna skiljer sig …", "en": "…", "de": "…", "es": "…", "fr": "…" } }
```

- `religion` är en religion i lagret, `since` året för bytet och `sources` minst en källa i `data/sources.json`. `note` är valfri: en mening för klickrutan, på alla fem språken.
- Regeln är densamma som för det gamla fältet: från `since` visas riket säkert med den nya religionen; före året visas faktarutans religion som förut, utom när faktarutan redan gav samma religion (då visas ingen religion före bytet).
- Ett byte per rike räcker i dag. Behövs flera blir fältet en lista.
- De 26 riken som hade `christianSince` flyttades till `conversion` med religionen `kristendom`, samma år och samma källa. Lagret blev identiskt (ögonblicksbilderna och klickrutans gränser jämförda före och efter).
- Ghanariket (Ghana Empire i Cliopatria) får islam från 1076 och visas därför med islam från ögonblicksbilden 1100. Klickrutan säger att källorna skiljer sig om hur det gick till: enligt en tradition i historieskrivningen erövrade almoraviderna landet, men moderna forskare ifrågasätter att någon erövring skedde.

## Varför
Faktarutan för Ghanariket säger "African traditional religion ; Later Islam", så lagret visade traditionell afrikansk religion (osäker, regeln först nämnd) under hela rikets tid i Cliopatria (793–1201). Källan (*Ghana Empire*, Wikipedia, med hänvisning till Gomez 2018) säger att landet "certainly did convert to Islam around 1076", vare sig almoraviderna erövrade det eller inte. Samma regel som för kristnandet behövdes alltså för en annan religion. Ett allmänt fält är enklare än ett nytt fält per religion och kan återanvändas.

## Berör
`tools/religioner.py`, `data/religions.json`, `data/religions-polities.json`, `data/sources.json`, `js/ui/legend.js`, `js/ui/sources.js`, `data/ui/*.json` (`sources.conversion`), `tests/religioner-byte.test.mjs`, `tests/religioner-kristnande.test.mjs`, `tests/religioner-val.test.mjs`, `tests/religioner-test.py`, `docs/datamodell.md`; #2150, #2140.
