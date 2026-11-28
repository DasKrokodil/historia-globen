# Stickprov (fakta) inför release 6.6.1 Sveriges landskap

Datum 2026-11-28. Urval: händelser vars rad ändrades i landskapens PR:er (`git log --grep="^Sveriges landskap"`, 133 händelser, 84 source-checked och 49 two-sources), fördelade över alla sju periodfiler och landskapen Öland, Bohuslän, Östergötland, Blekinge, Dalsland, Närke, Småland, Halland, Södermanland, Västerbotten, Ångermanland, Dalarna, Värmland, Jämtland, Gästrikland. Källsidor öppnades med WebFetch och som rå wikitext (sv.wikipedia.org, `action=raw`). Wikidata öppnades inte. Alla 133 händelsers översättningar kontrollerades maskinellt för siffror (inga avvikelser mellan sv och en/de/es/fr, inga saknade språk) och de 12 första läste jag helt.

## 1. Fynd

| fil | id | problem | förslag | nivå |
|---|---|---|---|---|
| data/handelser/1946-1979.json | olandsbron-invigs | Meningarna "Färjorna över sundet slutar gå" och "efter invigningen växer turismen kraftigt" finns inte i någon av de listade källorna. sv.wikipedia Ölandsbron (rå text, rad 54) har bara att utflyttningen vände och att bostäder byggdes i Färjestaden. Lex och SNL (öppnade) nämner varken färjor eller turism. Källnoten på `wp-sv-olandsbron` i data/sources.json säger "färjetrafiken upphörde", men artikeln säger inget om det. | Stryk de två meningarna (och rätta noten i sources.json), eller lägg in en öppnad källa som anger dem. Resten (30 sept 1972, 6 072 m, Europas längsta bro till 1998, utflyttningen vände) stämmer. | Fel |
| data/handelser/1900-1945.json | skansen-hultet | "där inga befästningar fått finnas sedan 1905" överdriver källan. sv.wikipedia Skansen Hultet: efter unionsupplösningen 1905 "förutsattes" att gränsfästningar inte längre skulle behövas. "Öppen för besökare" står inte i artikeln; där står att anläggningen återställts av byalaget i Charlottenberg (uppgiften är märkt 2015). | Skriv "där man efter 1905 inte längre räknade med behov av gränsfästningar" och "återställd av byalaget" (eller hitta källa för att den är öppen). | Förbättring |
| data/handelser/1980-.json | hoga-kusten-blir-varldsarv | Texten säger "nästan 300 meter". Källnoten redovisar 285 (Lex) och 286 m (SNL) och 300 endast som Wikipedias "nästan 300". Siffran hamnar vid den övre kanten av källspannet. | Skriv "omkring 285 meter" eller "nästan 300 meter enligt svenska Wikipedia"; noten finns redan. | Förbättring |
| data/handelser/1946-1979.json | forsta-hennes-butiken | "När han senare köper en herrklädesfirma" döljer en avvikelse: sv.wikipedia anger att Mauritz köptes 1968, Lex att herrkläder kom till "i midten af 1960'erne". Ingen `note` om det. (Observera att sv.wikipedia Hennes & Mauritz inte gick att öppna i rå form; 1968 och 15 sept 1947 är hämtade ur sources.json-noten och inte kontrollerade av mig.) | Lägg en kort note "Källorna skiljer sig" eller behåll "senare" och skriv det i noten. Nivån source-checked är rätt. | Notering |
| data/handelser/fkr.json | sagaholmshogen | Spannet 1475–1215 f.Kr. står ordagrant i sv.wikipedia ("1475-1215 f.Kr") och bygger på en enda C14 på 3265 ± 130 BP; det är inte självklart att spannet är kalibrerat (okalibrerat blir 3265 BP omkring 1315 f.Kr., ± 130 år). Noten säger redan att det är en enda datering. Astronomisk räkning stämmer (1475 f.Kr. = -1474). | Behåll, men skriv i noten att spannet är Wikipedias och att det inte framgår om det är kalibrerat. | Notering |
| data/handelser/1980-.json | falu-gruva-blir-varldsarv | `two-sources` vilar på sv.wikipedia, en.wikipedia (samma tema, inte oberoende av varandra) och Wikidata. Unescos egen sida är inte öppnad (403 enligt noten). Sakuppgifterna (2001, sista salvan 8 dec 1992, två tredjedelar av Europas koppar) stämmer mot sv.wikipedia. | Antingen `source-checked`, eller öppna Unesco/RAÄ som oberoende andra källa. Samma gäller halsingegardar-blir-varldsarv (inte öppnad av mig, bygger på sv, en och Wikidata). | Notering |
| data/handelser/1500-1799.json | bohuslan-blir-svenskt | sv.wikipedia Bohusläns historia säger att Viken erkändes som svenskt 1524 (Malmö recess); texten säger "tillhört Norge sedan vikingatiden, utom 1523–1532" (SNL). Noten redovisar redan avvikelsen. Länet Göteborgs och Bohus län 1680 stämmer. | Ingen ändring behövs, men "utom åren 1523–1532" är SNL:s formulering, inte Wikipedias. | Notering |

Antal Fel: 1 av 28 granskade (under beslutets tröskel på fler än ett fel per tio).

## 2. Granskade utan anmärkning (källa öppnad, uppgift stämmer)

- karlevistenen (1-1499): sv.wikipedia öppnad; omkring år 1000, troligen slutet av 900-talet, Sibbe Foldars son, Ölands äldsta, dróttkvætt, Söderbergs avvikande datering finns i noten. Översättningarna trogna.
- regalskeppet-kronan-sjunker (1500-1799): sv.wikipedia och Lex öppnade; 1 juni 1676, över 800 (Lex cirka 800), tvär gir, krutförrådet antänds, Creutz dog, vrak 1980 på 26 m, sex km öster om Hulterstad. Creutz nämns inte i Lex, men i Wikipedia. Översättningarna trogna.
- almobron-rasar (1980-): sv.wikipedia öppnad; 18 jan 1980 kl. 01.30, Star Clipper, is, mörker, dimma, åtta döda i sju fordon, vägen hann inte spärras, Tjörnbron 9 nov 1981.
- bjorketorpsstenen (1-1499): sv.wikipedia och RAÄ-PDF (via pdftotext); över fyra meter, två lägre oristade stenar framför, 600-talet (RAÄ) respektive 600–700-talen (Wikipedia), cirka 7 km öster om Ronneby; spannet i noten stämmer.
- stora-sillperioden (1500-1799): sv.wikipedia Bohusläns historia (ca 1747–1808) och Sillperiod (1747–1809); noten redovisar skillnaden.
- rokstenen (1-1499): sv.wikipedia; 760 tecken, 800-talet (första halvan), Ög 136 vid Röks kyrka, Varin/Vämod. Lex och SNL inte öppnade av mig; avvikelsen om vem som reste stenen står i noten.
- alvastra-palbyggnad (fkr): sv.wikipedia; hittad 1909, C14 omkring 3100 f.Kr., 42 verksamma år, mot slutet begravningsplats, spång. -3099/-2999 stämmer med astronomisk räkning. Lex (3000 f.Kr.) inte öppnad, avvikelsen står i noten.
- dackefejden (1500-1799): sv.wikipedia; fred 8 nov 1542, Dacke härskade i inre Småland, jul på Kronobergs slott, skjuten i augusti 1543.
- ikeas-forsta-varuhus (1946-1979): sv.wikipedia Ikea; 1943, 17 år, Älmhult 1953, varuhus 1958.
- karlskrona-grundas (1500-1799): sv.wikipedia; stadsprivilegier 10 aug 1680, Trossö. "Tredje största" (Lex 1766 respektive Blekinges historia ca 1710) inte öppnat av mig.
- sundsvallsbranden (1800-1899): sv.wikipedia; 25 juni 1888, ångsluppen Selånger, nio timmar, 9 000 hemlösa, fem döda.
- forsta-vasaloppet (1900-1945): sv.wikipedia; 19 mars 1922, nio mil, Ernst Alm IFK Norsjö 7:32.49, 117 i mål, 139 anmälda. Texten säger 119 åkare (Wikipedia: 119 startade) stämmer.
- bockstensmannen (1-1499): sv.wikipedia; 1350–1370 (Hallands museum), pålad, funnen 1936, Europas enda fullständigt bevarade medeltida mansdräkt, cirka 25 km öster om Varberg.
- engelbrekt-mordas (1-1499): sv.wikipedia Engelbrekt Engelbrektsson; död 4 maj 1436 på holme nära Göksholm; datumet lämnas öppet till våren i texten. Övriga detaljer (1818, Måns Bengtsson) endast via sources.json-noter.
- radiostationen-i-grimeton (1900-1945): sv.wikipedia; i drift 1 dec 1924, sex torn på 127 m, ena sändaren skrotad 1960, världsarv 2004.
- dalslands-kanal-byggs (1800-1899): sv.wikipedia; 1864–1868, Nils Ericson, akvedukt av plåt vid Håverud, Karl XV invigde i september 1868. Lex säger "järn" om akvedukten; texten följer Wikipedia och är försvarbar.
- umea-grundas (1500-1799): sv.wikipedia och Lex; 1622, tidigare privilegier indragna, Backens kyrka, landhöjning, ryska trupper 1714 och 1720.
- hallristningarna-i-glosa (fkr): sv.wikipedia; omkring 45 älgar eller klövdjur, nätfigurer, första beskrivning 1685, älg i Krokoms kommunvapen.

## 3. Kunde inte öppna eller inte kontrollera

- Wikidata (alla `wd-*`): inte öppnat; koordinater och datum därifrån är inte kontrollerade av mig.
- Unesco-sidor (Falu, Hälsingegårdar, Södra Öland): inte öppnade.
- sv.wikipedia Hennes & Mauritz, Freden i Roskilde och Almöbron-extra: Hennes & Mauritz och Freden i Roskilde gav fel vid första försöket och kontrollerades inte om.
- Inte kontrollerade i detta stickprov (valdes bort av tidsskäl): halland-blir-svenskt, guldmalmen-i-boliden, kapitulationen-i-kalix, bessemerstal-i-edsken, ringhals-forsta-strom, halsingegardar-blir-varldsarv (alla source-checked eller two-sources enligt data; inga avvikelser sedda i texten mot sources.json-noterna).
- SNL (snl.no) öppnades bara för Ölandsbroen; övriga SNL- och Lex-uppgifter är hämtade ur noterna i sources.json om inget annat anges ovan.
- RAÄ-PDF:en gick inte att läsa via WebFetch, men lästes med pdftotext på den nedladdade filen.
