# Tre tidsgrupper i Samtidigt-panelen (#1312)

**Datum:** 2026-11-18 (byggorder efter DasKrokodils godkännande 2026-11-13)

## Beslut
Varje världsdel visar i ordning **Hände år X**, **Pågick då** och **Strax före eller efter**, utan nytt datafält. En träff med lika start/slut hör till Hände; ett överlappande spann till Pågick då; övriga träffar i tidsfönstret till Strax före eller efter. Årsläget använder årtal, datumläget befintlig EDTF-tid (en daterad dag respektive ett datumspann). Rubriken Hände följer det valda året, datumet eller intervallet. Intervalläget har ingen nära-grupp.

## Varför
Besökaren ska kunna skilja årets händelser från sådant som redan pågick eller bara låg nära i tid. Regeln är en gruppering av befintliga tidsuppgifter, ingen bedömning av händelsens historiska karaktär. Gamla öppna spann förs till sin världsdel under Pågick då; deras markörer förblir dolda tills de väljs. Tomma grupper döljs och varje grupp har eget Visa fler.

## Berör
#1312 och tidsorden i #1938. `js/ui/panel.js`, de fem språkfilerna i `data/ui/`, panel- och webbläsartester samt `docs/arkitektur.md`. Urval, filter, tidsfönster, markörer och sammanfattningens räkning ändras inte. Skärmbilder i `issue-1312/` på grenen `skarmbilder`.
