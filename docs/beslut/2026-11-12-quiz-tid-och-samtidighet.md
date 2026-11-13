# Quizet: frågor om tid räknas fram ur händelsernas årtal

**Datum:** 2026-11-12 (DasKrokodil i #846: "1-3: Ja enligt förslagen", del 2)

## Beslut
1. Frågorna om tid står i `data/quiz.json` som egna poster, men en post innehåller bara händelsernas id och sort (`first` eller `closer`). Svaret och avståndet räknas fram ur händelsernas årtal i `js/quiz-rules.js`, så att inga årtal skrivs två gånger och siffrorna alltid går att räkna fram (Källpolicy punkt 5).
2. "Vad kom först?" kräver minst 50 år mellan starterna och "Vad låg närmast?" minst 100 års skillnad mellan avstånden, så att svaret inte beror på osäkra årtal. När ett årtal är ungefärligt skrivs avståndet med "cirka" och avrundas till tiotal.
3. Quizets tre sorter turas om: samtidighet, Sant eller myt och tid. Det ersätter "varannan fråga" i beslutet om Sant eller myt (2026-11-12): nu är var tredje fråga en sådan. Tidsfrågorna räknas i poängen.

## Varför
Egna poster gör att urvalet går att välja med omsorg (par där svaret överraskar), och att svaret räknas ur datan gör att en post aldrig kan säga något annat än händelserna.

## Berör
`data/quiz.json`, `js/quiz-rules.js`, `js/ui/quiz.js`, `js/model.js` (`loadQuizPosts`), `scripts/build-site.sh`, `scripts/validate-site.py`, `docs/datamodell.md`, #846.
