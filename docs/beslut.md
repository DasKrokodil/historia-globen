# Beslutslogg


Beslut som påverkar arkitektur, datamodell, källor, licenser, kategorier eller utseende. Nya beslut läggs till sist, med datum, beslut och kort motivering, i samma pull request som ändringen.


Beslut 1–10 i texten (till exempel "beslut 1" om den platta bilden) kommer från planeringsdokumentet i Rikards Claude-projekt. De viktigaste är upprepade i [CLAUDE.md](../CLAUDE.md).


## Ämnesindex


Korta ingångar till tabellen nedan, en rad per beslut i datumordning inom varje grupp. Sök på datumet och ett ord ur raden för att hitta hela beslutet. Ett senare beslut kan ersätta ett tidigare; det är tabellens text som gäller.


**Arkitektur och rendering**
- 2026-10-28 – Lagerbilden höjs till 4096×2048 (#21)
- 2026-10-30 – Platt vy ritar markörer som eget lager
- 2026-10-31 – Lagerregister och gemensamt tillstånd (#338)
- 2026-10-31 – Datan laddas i delar (#337)


**Källor och granskning**
- 2026-10-28 – Cliopatria används som den är
- 2026-10-28 – Ny granskningsnivå `two-sources` (#16)
- 2026-10-29 – NC-källor får användas som länkade källor
- 2026-10-29 – Statusraden säger vad granskningen gäller (#196)
- 2026-10-29 – Utkast från massimport i `data/utkast/`
- 2026-10-30 – Nivån `human-reviewed` tas bort (#252)


**Licenser och bilder**
- 2026-10-29 – Bilder med stil efter tidsålder (#129)
- 2026-10-29 – Fem hållna AI-illustrationer används ändå (#147)
- 2026-10-29 – Krig, sjukdom och död får visas i bilder
- 2026-10-29 – Samtidigt-kortet visar alltid bilder (#190)
- 2026-10-29 – Bilder från Library of Congress (#127)
- 2026-10-30 – Riktiga personers ansikten får visas (#299)
- 2026-10-30 – Nya bildstilar i `styles.json`


**Utseende och UI**
- 2026-10-28 – Fun facts blir eget lager
- 2026-10-29 – Ny layout: globen får hela skärmen
- 2026-10-29 – "Samtidigt" i tre nivåer
- 2026-10-30 – Knapparna grupperas i Utforska och Visa
- 2026-10-30 – En ikonfamilj för markörerna (#242)
- 2026-10-30 – Frivilligt stöd via Ko-fi-länk
- 2026-10-30 – Platt vy är en kartvy för skärmar (#292)
- 2026-10-30 – Tidsreglaget visar krig som en prick (#298)
- 2026-10-31 – Lager i grupper och förinställda vyer (#357)
- 2026-10-31 – Mindre trängsel på kartan, tre zoomnivåer (#358)
- 2026-10-31 – Kompakt rad och layout i mobilen (#361, #312)


**Fokusläget och uppspelning**
- 2026-10-29 – Fokusläget blir egen funktion bakom Fokus
- 2026-10-29 – Fokusmenyn visar bara aktuell tidsepok (#121)
- 2026-10-29 – Årtal i Fokus som inte vilseleder (#138)
- 2026-10-30 – Fokusläget dämpar andra lager (#235)
- 2026-10-30 – Uppspelningen pausar bara vid det man följer


**Riken**
- 2026-10-29 – Bysantinska riket i Romarrikets grupp
- 2026-10-29 – En fil per rike i `data/empires/`
- 2026-10-29 – Faktaruta för riken (#170)
- 2026-10-29 – Rikets berättelse under uppspelningen (#171)
- 2026-10-31 – Tysk-romerska riket sammanhängande 1459–1806 (#336)
- 2026-10-31 – Utspridda kolonialvälden med markerat moderland (#74)
- 2026-10-31 – Försvunna länder med fältet `vanished` (#72)
- 2026-10-31 – Osäkra gränser och inflytande (#73, #75)
- 2026-10-31 – Riken kan ha en symbol (#301)
- 2026-10-31 – Symboler för rikena från R2–R5 (#345)
- 2026-10-31 – Rikenas övergångar tonas över varandra (#78)
- 2026-10-31 – Sverige efter stormaktstiden (#70)


**Religioner**
- 2026-10-28 – Religioner som riken med statsreligion
- 2026-10-28 – Alla religioner över hela tidslinjen (#92)
- 2026-10-29 – Religionens årtal ur rikets faktaruta
- 2026-10-29 – Religioners grundande som händelser (#123)
- 2026-10-29 – Faktaruta och punkt för religioner (#90)
| 2026-11-01 | Säkerhetsheaders (#392): Cloudflare Pages skickar `Content-Security-Policy-Report-Only` för `/*`. Regeln tillåter den egna webbplatsen, three.js från jsDelivr, Google Fonts och Cloudflare Turnstile när förslagsformuläret används; den har `frame-ancestors 'none'`. `Permissions-Policy` stänger av kamera, mikrofon, plats och betalningar. Byt först till skarp `Content-Security-Policy` efter en release utan CSP-varningar i konsolen. | Rikards beslut: externa resurser behålls enligt arkitekturbeslut 6, men deras ursprung begränsas och observeras innan regeln börjar blockera något. |
