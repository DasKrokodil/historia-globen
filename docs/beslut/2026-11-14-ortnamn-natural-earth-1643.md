# Ortnamn för regionvyn som en liten datafil ur Natural Earth (#1643)

**Datum:** 2026-11-14. DasKrokodil sa ja till fråga 3 i #1627 ("Ja enligt rekommendationerna"): ortnamn som en liten ny datafil, Natural Earth, public domain, ny källa i `data/sources.json`.

## Beslut (byggt)
- **Ny källa `natural-earth-ortnamn`:** Natural Earth 1:10m `ne_10m_populated_places`, `ne_10m_geography_marine_polys` och `ne_10m_admin_0_countries` ur natural-earth-vector 5.1.2. Licensen är public domain enligt Natural Earths villkorssida (https://www.naturalearthdata.com/about/terms-of-use/, öppnad 2026-11-14: "All versions of Natural Earth raster + vector map data found on this website are in the public domain").
- **En fil per plats** i `data/ortnamn/<platsens id>.json`, skriven av `tools/ortnamn.py`: orter inom platsens ram med marginal (högst 60), grannländerna i `boundary.neighbours` och hav, sund och vikar (högst 12), med namn på sv, en, de, es och fr. Namnen är Natural Earths egna; saknas ett språk används engelska och språket står i `fallback`. Inga namn skrivs för hand, och orterna tas inte längre ur händelsernas koordinater som i prototyperna.
- **Visas inte än.** Filerna används först av regionvyn (#1627, steg 1). Schemat (`schemas/ortnamn.schema.json`) kontrolleras av `scripts/validate-site.py`, och `tests/validate-schema-test.py` visar att en fil som bryter mot det stoppas.
- **Storlek:** före 0 byte. Efter fem filer på sammanlagt 46,6 kB (9,1 kB gzip): Skåne 2,2 kB, Danmark 8,4 kB, Aotearoa 10,1 kB, Sverige och Grönland 13,0 kB vardera. Sidan laddar bara filen för den plats som visas.

## Varför
Regionvyn behöver namn runt platsen för att man ska kunna orientera sig. Källpolicyn kräver att allt kommer ur en öppnad källa, och Natural Earth är redan projektets kartkälla, har namn på alla fem språken och är public domain. En fil per plats håller nedladdningen liten.

## Berör
`tools/ortnamn.py`, `data/ortnamn/`, `schemas/ortnamn.schema.json`, `scripts/validate-site.py`, `scripts/build-site.sh`, `tests/validate-schema-test.py`, `data/sources.json`, `data/licenses.json`, README, THIRD-PARTY-NOTICES.md, docs/datamodell.md, docs/arkitektur.md, docs/kallor.md. Issues #1627 och #1643.
