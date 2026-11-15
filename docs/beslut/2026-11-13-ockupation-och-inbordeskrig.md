# Ockupation och inbördeskrig: den internationellt erkända staten ritas (#1332)

**Datum:** 2026-11-13 (DasKrokodils svar "1-2: Ja enligt rekommendationerna" på #1332)

## Beslut
1. Där Cliopatria efter 1945 ritar en ockupationsmakt eller en part i ett inbördeskrig i stället för en stat (till exempel Irak som USA, Tjeckoslovakien som Sovjetunionen, Afghanistan som Mujahideen eller Taliban), ritar kartan den **internationellt erkända staten**. Ockupationen eller kontrollen skrivs i rikets ruta Om kartan (`mapNote`), med källa.
2. **Inga påhittade gränser.** Statens gräns de åren är **statens egen gräns i Cliopatria** ett närliggande år, och bara där Cliopatrias gräns för staten är densamma före och efter (skillnad under en halv procent av ytan). Året står i rutan Om kartan. Går det inte utan nya gränsdata, ritas inget och frågan lämnas öppen.
3. Makten som Cliopatria ritar i stället klipps bort de åren, så att den inte ritas över staten.
4. Första omgången (#1332): Afghanistan 1979–2005 (gränsen 1978), Irak 2006–2013 (gränsen 2005), Tjeckoslovakien 1969–1990 (gränsen 1968), och under krigen i före detta Jugoslavien 1992–1995 Kroatien och Bosnien och Hercegovina (gränsen 1996) och Förbundsrepubliken Jugoslavien inom sin egen gräns 1996.
5. Beslutet gäller inte stater som saknade erkännande men som Cliopatria ritar som egen stat utan ockupant, som Rhodesia 1967–1979: de visas som i Cliopatria (svaret på del 1 i #1332), och rutan Om kartan säger att staten inte erkändes.

## Varför
Att rita Irak som USA eller Tjeckoslovakien som Sovjetunionen säger något som källorna inte är eniga om, och det strider mot källpolicyn att inte välja sida i tysthet. Den erkända staten är en spårbar grund, och noten visar öppet vad Cliopatria visar. Beslutet hör ihop med [omstridda gränser i nutid](2026-11-03-omstridda-granser.md), som följer Sveriges hållning, och med [områden som inte är en stat](2026-11-13-omraden-som-inte-ar-stat-1300.md); det ändrar inget av dem.

## Berör
`tools/riken.py` (inställningen `fill` per del i `GROUPS`, och `to` och området `('clio', namn, år)` i `DISPUTED`), `data/empires/` (afghanistan, irak, tjeckoslovakien, kroatien, bosnien-och-hercegovina, serbien, sovjetunionen), `docs/omstridda-granser.md` (avsnittet "Ockupation och inbördeskrig", med fall som återstår), `docs/datamodell.md`.
