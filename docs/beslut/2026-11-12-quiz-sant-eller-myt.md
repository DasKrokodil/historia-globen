# Quizet får frågetypen Sant eller myt?

**Datum:** 2026-11-12 (DasKrokodil i #846: "1-3: Ja enligt förslagen"; #850 sammanslaget med #846)

## Beslut
1. Quizet får två nya frågetyper i formen "vad tror du?" med ett svar att avslöja, i stället för flerval: **Sant eller myt?** och **Tid och samtidighet**. De delar dialogen och reglerna i `js/quiz-rules.js`.
2. **Sant eller myt?** byggs ur befintliga, källkontrollerade poster i `data/missuppfattningar.json` (#838): påståendet (`claim`) är frågan, och facit är vad källorna säger (`truth`), varifrån myten kommer (`origin`) och postens källor. Inga nya fakta skrivs. Den är varannan fråga i quizet.
3. Eftersom alla poster är missuppfattningar är rätt svar alltid "myt". De frågorna räknas därför inte i poängen, så att mönstret inte ger poäng utan kunskap.
4. **Tid och samtidighet** skrivs som egna frågeposter med källa, där siffror går att räkna fram ur händelsernas årtal (Källpolicy punkt 5), i en egen pull request.

## Varför
Benchmarken mot Gapminder (#759) visade att frågor där de flesta gissar fel, följda av facit, lär ut mer än flerval. Missuppfattningarna finns redan med källor på fem språk.

## Berör
`js/quiz-rules.js`, `js/ui/quiz.js`, `index.html` (`#quiz-origin`), `data/ui/*.json` (`quiz.myth*`), #846, #850, #838.
