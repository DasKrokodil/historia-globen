"""Det som tools/riken.py ska bevara när data/empires/ byggs om (#1220). Utan beroenden, så att det går att testa i CI.

Fält som skrivs för hand i index.json (KEEP) förs över oförändrade. Översättningar (de, es, fr …) av namn som verktyget
själv skriver på svenska och engelska (gruppens och rikenas namn, inflytandenamnen, moderlandets namn) förs över så
länge det svenska namnet är detsamma; annars är översättningen inaktuell och tas bort. Varje grupp får samma ordning
på fälten som i den befintliga filen, så att en ombyggnad utan andra ändringar ger en tom diff.
"""

# Fält i index.json som skrivs för hand och behålls, i den här ordningen när gruppen är ny
KEEP = ('facts', 'symbol', 'polityFacts', 'capitals', 'labelAt', 'flags', 'modernState')


def keep_langs(name, old):
    """Namnet som verktyget skriver ({sv, en}) med de andra språken ur det gamla namnet, om svenskan är densamma."""
    if not isinstance(old, dict) or old.get('sv') != name.get('sv'):
        return name
    return {**name, **{lang: v for lang, v in old.items() if lang not in name}}


def kept_fields(old_group):
    """De handskrivna fälten (KEEP) ur en grupp i den befintliga index.json."""
    return {f: old_group[f] for f in KEEP if f in old_group}


def old_influence_names(old_groups, old_polity_docs):
    """Inflytandenamnen i den befintliga datan, efter engelskt namn: ur index.json och ur rikesfilernas perioder."""
    names = {}
    for g in old_groups:
        for a in g.get('influence', []):
            names.setdefault(a.get('name', {}).get('en'), a.get('name', {}))
    for doc in old_polity_docs:
        for p in doc.get('polities', []):
            for q in p.get('influence', []):
                names.setdefault(q.get('name', {}).get('en'), q.get('name', {}))
    names.pop(None, None)
    return names


def order_like(new, old):
    """new med fälten i samma ordning som i old; fält som bara finns i new läggs sist i sin egen ordning."""
    if not isinstance(old, dict):
        return new
    out = {k: new[k] for k in old if k in new}
    out.update({k: v for k, v in new.items() if k not in out})
    return out
