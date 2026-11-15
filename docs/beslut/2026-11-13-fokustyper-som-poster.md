# Fokustyper som poster, och regeln för nya urval

**Datum:** 2026-11-13 (DasKrokodil sa ja till regeln i #1327, förslag P10 i helganalysen #1289)

## Beslut
1. **Ett nytt namngivet urval är en händelselista, ett tidsspann eller en geometri.** En händelselista blir ett fokus som temat (`data/teman.json`), en geometri ett fokus som platsen (`data/platser.json`) och ett tidsspann läget intervall som epoken (`data/perioder.json`). Det kommer inget fjärde format. **Människoarter får inget eget format:** de är händelser, och visas med ett lager.
2. **En fokustyp är en post, inte en gren.** Varje sak man kan följa i Fokus (krig, rike, religion, resa, tema, plats) anmäler sig med en post från sin egen fil i `js/focus/`, på samma sätt som lagren i `js/layers/` (#338). Styrningen (`js/controllers/focus.js`) och kortet (`Panel.showSelection` i `js/ui/panel.js`) läser posterna.
3. **Kontraktet** (står överst i `js/focus/registry.js` och i docs/arkitektur.md, "Fokustyper som poster"). En post anger:
   - `type`: adressens namn, `f=<type>:<id>`;
   - `selectsBy`: `'events'`, `'geometry'` eller `null` (man följer något som redan finns i datan);
   - `load(id)`: laddar och ger fokusets fält. **Här räknas spannet** (`from`, `to`, valfritt `fine`), titeln, mitten och zoomen. En urvalstyp ger alltid `themeEvents` och `eventIds`;
   - `menu()` och valfritt `menuLoad()`: gruppen i Sök och följ;
   - valfritt `exists(id)` (gamla länkar), `follows(f)` (kriget eller resan i tillståndet), `prepare(f)`, `start(f)` (**vad kortet säger** när man börjar följa), `facts` (knappen Fakta), `movedKey` (texten i "Tiden flyttades") och, för urvalstyper, `empty` (texten för ett år utan händelser i urvalet).
4. **`FOCUS_TYPES` i `js/state.js` är kvar som adressens vitlista.** Adressen ska gå att läsa och kontrollera utan att appen är laddad. Registret vägrar en post vars typ saknas i listan, och ett prov kräver exakt en post per typ. En ny typ är alltså en fil i `js/focus/`, en rad i `js/focus/index.js` och ett ord i `FOCUS_TYPES`.
5. **Utanför kontraktet tills vidare:** lagren avgör själva när de syns för det man följer (`enabled(s)` i lagrets post), och uppspelningens pauser per typ ligger kvar i `js/controllers/playback.js`, där krigets och resans stoppköer delar inre tillstånd. Det som gäller alla urval (pausen vid urvalets händelser, tomläget, att Escape och Avsluta lämnar urvalet) frågar fokuset (`themeEvents`, `eventIds`), inte typnamnet. `selectsBy` är en deklaration som registret kontrollerar mot det posten laddar.
6. **Ordningen i `startFocus()` är en del av kontraktet:** biljetten (#865) tas före `load()` och kontrolleras efter, och `load()` får lägga till data men inte ändra vyn. Ordningen står i docs/arkitektur.md.

## Varför
`startFocus()` hade en gren per typ, och den sista grenen behandlade allt okänt som en religion. Typnamnen stod dessutom på sex andra ställen (knapparna Fakta och Avsluta, tomläget, kontrollen av gamla länkar, pausen, menyn), och kortet för tema och plats fanns i två kopior. Varje ny typ hade lagt till en gren på varje ställe. Version 7.1 (människoarter) och länderna (6.4.0) hade annars blivit den fjärde och femte grenen.

Regeln i punkt 1 hindrar att det i stället växer fram nya dataformat: de tre grunderna räcker för allt som är planerat (länder är platser, högkulturer är region plus tidsspann, människoarter är händelser).

## Vad som inte ändras
Besökaren ser ingen skillnad: samma titlar, spann, kort, pauser och adresser. Adressformatet, `MODE_RULES`, `store.setFocus` och fältnamnen i `state.focus` (`themeEvents`, `eventIds`, `theme`, `place`, `route`) är oförändrade. En enda sak är ändrad: ett krig, ett rike eller en religion med okänt id, eller en okänd typ, börjar inget fokus (`startFocus` ger `false`) i stället för att kasta ett fel. Adressen släppte redan bara igenom typerna i `FOCUS_TYPES` och fångade felet; länkar i faktarutor och turer gjorde det inte. Tema och plats visar som förut raden om att urvalet saknas.

## Känd begränsning
Plats plus intervall (#1163) och region plus tidsspann (#971) går inte att uttrycka, eftersom Fokus och intervall utesluter varandra i lägeskontraktet (#893). Det avgörs för sig.

## Granskning
Agenten `arkitekt` granskade skissen före bygget (godkänd med ändringar; fynden och vad som gjordes står i #1327).

## Berör
`js/focus/` (ny), `js/controllers/focus.js`, `js/ui/panel.js`, `js/main.js`, `js/controllers/render.js`, `js/controllers/address.js`, `js/controllers/playback.js`, `js/state.js` (ordet `export`), `tests/focus-types.test.mjs`, `tests/webblasare.mjs`, `docs/arkitektur.md`, `docs/datamodell.md`. Efter detta: #1161 och #1163 (platser) och människoarterna i 7.1.
