# Licenser för Historia-globen

Sammanställningen beskriver licenserna som gäller för projektets kod, data och bilder. Den ändrar inte licenserna.

## Kod

Projektets kod, inklusive egna ikoner, omfattas av [GNU GPL version 3](./LICENSE).

## Data

Projektets data i `data/` omfattas av [CC BY 4.0](./data/LICENSE). Ange Historia-globen som källa, länka licensen och berätta om ändringar.

[`data/licenses.json`](./data/licenses.json) grupperar källregistrets licenser i `sourcesByLicense`; varje `sourceIds`-post pekar på en post i `data/sources.json`. Licensen beskriver den länkade källan; det betyder inte att källans text eller data har kopierats till projektet eller att den licensen gäller för Historia-globens data. Förtydliganden som ”bara länkad” behålls ordagrant.

## Bilder

Bilder har egna licenser, krediter och källor. [`images/licenses.json`](./images/licenses.json) listar bilderna som anges i `data/events.json` under `events[].image`, med bildens licens och eventuell källpost.

Manifestet omfattar inte kartbilderna i `images/karta/` eller rasterlagren i `images/lager/`; deras licenser beskrivs i [licensavsnittet i README](./README.md#licenser).

Se även [tredjepartsnotiser](./THIRD-PARTY-NOTICES.md).
