# Kartprecisionen styr vilken plats som får brickan

Beslut den 28 november 2026 i [#2375](https://github.com/DasKrokodil/historia-globen/issues/2375). Detta ändrar urvalet av kandidater i [beslutet om hela platsen](2026-11-15-scope-place-1674.md).

Vid `scope: "place"` och kartprecision `country` söker regionvyn bland synliga platser med typ `country`. Vid kartprecision `region` söker den bland alla synliga platser. Inom urvalet används den befintliga regeln för minsta plats och samma kustmarginal som förut. Därmed kan en rikstäckande händelse med punkt i Stockholm få brickan ”Hela Sverige”. En regional händelse med samma punkt kan få ”Hela Uppland”.

En jämförelse med alla 67 befintliga händelser med denna räckvidd visade två som behövde ändrad kartprecision för att behålla sin bricka. Grönlands platstyp är `autonomous`. DasKrokodil valde därför `region` för `gronland-upphor-vara-koloni` och `gronland-lamnar-eg`. Båda gäller fortsatt hela Grönland. [Val av alternativ 1](https://github.com/DasKrokodil/historia-globen/issues/2375#issuecomment-7237710148).
