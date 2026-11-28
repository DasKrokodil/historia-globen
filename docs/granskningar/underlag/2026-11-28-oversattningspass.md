# Översättningspass före releasen (2026-11-28)

Experter: `sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`, alla read-only. Omfång: 45 nya eller ändrade gränssnittsnycklar per språk och 1 129 nya eller ändrade händelser (610 nya, 519 ändrade), 9 fun facts, temat sprak-skrift och 52 platstexter. Alla fyra körde automatiska kontroller över alla ändrade texter (siffror mot svenskan, tilltal, era, typografi, svenska rester) och manuella stickprov om 12–35 poster per språk. Inga blockerande fynd i en, es och fr; tyskan har ett befintligt fel som syns för läsaren (se första raden).

**Läge** (`python3 tools/oversattning.py`, 2026-11-28): oöversatta texter de 3 911, es 5 341, fr 6 098. Vid v6.5.1: de 4 074, es 5 603, fr 6 239. Antalet har alltså minskat (-163, -262, -141). 158 ändrade händelser saknar fr och 147 es helt, men det är äldre luckor och ingen ökning.

## Tyska
| fil | id/nyckel | problem | förslag | nivå |
|---|---|---|---|---|
| 1500-1799.json (och events.json, genererat) | spanska-erovringen-av-aztekriket, spanska-erovringen-av-inkariket (`story.intro`) | Den tyska texten är ett översättnings-API:s felmeddelande ("QUERY LENGTH LIMIT EXCEEDED. MAX ALLOWED QUERY : 500 CHARS"). Fanns redan i v6.5.1 | Översätt om; kontrollera es och fr | **Fel**, synligt för läsaren |
| fkr.json | hieroglyferna-i-egypten | "3300-talet" blir "33. Jahrhundert" men ska vara 34 enligt beslutet 2026-11-09 (#2460) | Rätta tillsammans med svenskan | Fel |
| 1-1499.json | garimaevangelierna (bildtext) | "600-talet" = "6. Jahrhundert" ska vara 7. | "7. Jahrhundert" | Fel |
| data/ui/de.json | hunt.region | Fragment utan du-form | "Du hast schon ein Ereignis aus {region}. Suche in einem anderen Erdteil." | Fel |
| flera (19 bildtexter) | t.ex. slavupproret-1791, juneteenth-1865 | „ med rakt " som slutcitat | „…“ | Fel |
| 1-1499.json | wiener-gesera | "Danach sind Juden verboten" missvisande | "Danach wird Juden der Aufenthalt im Land untersagt." | Fel |
| cirka 21 texter | t.ex. ordens-vandring-potatis | "7 000" med mellanrum; ordlistan kräver "7.000" | Tusentalspunkt | Fel |
| övrigt | Kolonialherrschaft/Kolonialmacht, kinder-der-landstrasse (schweiziska former), Reichstag för Japans parlament, `Uluru-Statement` oöversatt, "bis in die 1970er" | Se rapporten | | Förbättring |
| 1900-1945.json | herero-och-nama-folkmordet (#2194) | Terminologin är god; "erkannte 2015 an" bör kontrolleras av historikern (regeringens formella erkännande kom troligen 2021) | Historikern | Notering |

## Engelska
| fil | id/nyckel | problem | förslag | nivå |
|---|---|---|---|---|
| handelser | hartogs-tennplatta | "sailed on on 27 October" | "sailed on 27 October" | Fel |
| handelser | kyros-grundar-perserriket (bildtext) | "mid 500s BC" | "mid-6th century BC" | Fel |
| handelser | guldgruvan-i-las-medulas, kristi-kyrka-grundas-1830 m.fl. | "in 77" utan era; "Latter Day Saints" | "AD 77"; "Latter-day Saints" | Förbättring |
| platser.json | alla `intro` | 43 av 52 säger "in order of time", 9 "in chronological order" | Enhetligt "in chronological order" | Förbättring |
| teman.json, funfacts | sprak-skrift, ordens-vandring-kanot/-siffra | "time order", "travelogues", "number system" | Se rapporten | Förbättring |
| genomgående | apostrofer och citattecken | 402 fält med raka, 295 med typografiska tecken | Normalisera med skript | Notering |
| data/ui/en.json | hunt.region | Stelt, annan ton än svenskans uppmaning | "Look on another continent." | Förbättring |

## Spanska
| fil | id/nyckel | problem | förslag | nivå |
|---|---|---|---|---|
| data/ui/es.json | place.today | "Este es {name} tal como es hoy." blir fel genus för de flesta länder | "Así es {name} hoy." | Fel |
| 20 händelser | caral-varldsarv-2009, pachacamac m.fl. | "desde hacia 1060" | "desde alrededor de" | Fel |
| flera (cirka 10) | slaget-vid-visby, gavle-brinner-1869 m.fl. | Tusentalspunkt eller mellanrum i fyrsiffriga tal ("1.700", "2 023") | Ordlistan avsnitt 3 | Fel |
| handelser | brexit, belagringen-av-pyongyang-1593 | "votaron salir"; "Entre el 6–8 de febrero" | "votaron por salir"; "Entre el 6 y el 8" | Fel |
| funfacts | ordens-vandring-potatis | "la palabra no procede de allí" missvisar latinamerikanska läsare (papa är quechua) | Förtydliga; historikern | Viktigt |
| handelser | Cuzco/Cusco, Dama/Señora de Cao, Imperio incaico/inca, Library of Congress | Inkonsekvent namnform | Samma form | Förbättring |
| platser.json | japan.introNotes | Dokdo/Takeshima heter "rocas de Liancourt" på spanska; Sveriges hållning obegriplig utan förförståelse | Lägg till namnet; Rikard avgör meningen | Förbättring |

## Franska
| fil | id/nyckel | problem | förslag | nivå |
|---|---|---|---|---|
| data/ui/fr.json | place.today | "Voici {name} dans sa forme actuelle." ogrammatisk utan artikel | "Voici le territoire actuel : {name}." | Viktigt |
| data/platser.json | schweiz (introNotes) | "la carte compte la ville dans aucun empire" saknar "ne" | "ne rattache la ville à aucun empire" | Fel (grammatik) |
| cirka 63 träffar | t.ex. polynesier-nar-rapa-nui, paquime | "(actuel Mexique)", "(actuelle Éthiopie)" (#2271 punkt 5) | "(Mexique actuel)", "(aujourd’hui au Pérou)" | Viktigt |
| 616 fält | | Rak apostrof mot ’ i övriga | Normalisera | Förbättring |
| flera | Haïlé Sélassié, Ménélik, Tigré, Choa, "Premier Empire" | Stavningsvarianter | Enhetligt | Förbättring |
| data/ui/fr.json | hunt.region | Blandat tilltal | "Tu as déjà…" | Förbättring |

## Gemensamt för alla språk
`place.today` (en/de/es/fr) och `hunt.region` (en/de/fr) är de två nya gränssnittsnycklar som flaggas av flera språk. `tools/oversattning.py --check` är grön. Ej hunnet: manuell läsning av alla 610 nya händelser (täcks av automatiska kontroller), egennamn mot nationell Wikipedia, landskapens texter, textlängd i webbläsaren.
