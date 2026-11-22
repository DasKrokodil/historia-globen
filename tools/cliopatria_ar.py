"""Cliopatrias årtal som astronomiska år (#1989, docs/beslut/2026-11-20-cliopatria-artalskonvention-1989.md).

Cliopatria (v0.2.1, Seshat Global History Databank, CC BY 4.0) skriver år före vår tideräkning som negativa tal med
f.Kr.-numret: README:n och artikeln i Scientific Data (2025, doi:10.1038/s41597-025-04516-9) säger "Years are recorded as
integers, negative for BCE, positive for CE" och att datan går "from 3400BCE", och den första posten har FromYear -3400.
Ändringsåren stämmer också med kända f.Kr.-år: Makedoniska och Persiska riket ändras -333 och -331 (Issos 333 f.Kr.,
Gaugamela 331 f.Kr.) och Romarriket börjar -31 (Actium 31 f.Kr.), enligt Wikidata (Q201526, Q179670, Q160387) och våra
egna händelser slaget-vid-issos och slaget-vid-gaugamela. "Han Dynasty" börjar -202, samma år som händelsen
liu-bang-blir-kejsare (202 f.Kr.); Wikidata (Q7209) anger grundandet till 206 f.Kr. -N är alltså N f.Kr., som i appen
är det astronomiska året 1 - N.

År 0 förekommer bara som slutår (ToYear 0, sex poster) direkt före en post som börjar år 1; inget år -1 finns. Det
läses som 1 f.Kr., det astronomiska året 0, så att perioderna fortfarande ligger kant i kant.
"""
import json
from pathlib import Path


def astronomiskt(y):
    """Ett år i Cliopatria som astronomiskt år: -N (N f.Kr.) blir 1 - N, år 0 och år efter Kristus är oförändrade."""
    return y + 1 if y < 0 else y


def las_cliopatria(path):
    """Läser Cliopatrias GeoJSON och räknar om FromYear och ToYear till astronomiska år i varje post."""
    src = json.loads(Path(path).read_text())
    for f in src['features']:
        p = f['properties']
        p['FromYear'] = astronomiskt(p['FromYear'])
        p['ToYear'] = astronomiskt(p['ToYear'])
    return src
