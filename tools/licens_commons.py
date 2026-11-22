#!/usr/bin/env python3
"""En gemensam licensklassning för Wikimedia Commons (#2183, steg 1; rättar #2182).

Används av tools/bild_hamta.py (den strikta kontrollen: licensmallen på filsidan via action=raw jämförs med Commons API)
och tools/bildkandidater.py (den snabba gissningen ur API:ets visningsnamn, utan filsidan). Båda verktygen klassar
alltså en licens på samma sätt, och den strikta regeln avgör.

Tillåtet (CLAUDE.md, Bilder punkt 1): public domain, CC0, CC BY och CC BY-SA. NC, ND, fair use och liknande avvisas,
GFDL ensamt avvisas. Allt som inte känns igen (till exempel Commons-etiketten "No restrictions", "Attribution" eller
nationella licenser som GODL-India) flaggas till en människa och godkänns aldrig av ett program (beslut 2026-11-22,
docs/beslut/2026-11-22-bildpipeline-pilot.md). Library of Congress-märkningen "No known restrictions on publication"
bedöms i bild_hamta.py (bedom_loc), inte här.

Bara standardbiblioteket.
"""
import re

# ---------------------------------------------------------------- licensklassning

TILLATNA = {'pd', 'cc0', 'by', 'by-sa'}
AVVISADE = {'nc', 'fair'}


def _cc_etikett(sa, version, land):
    return f"CC BY{'-SA' if sa else ''} {version}" + (f' {land.upper()}' if land else '')


def klassa_namn(text):
    """Licens ur Commons visningsnamn (LicenseShortName, UsageTerms) → (klass, etikett) eller None."""
    s = re.sub(r'\s+', ' ', (text or '').strip())
    low = s.lower()
    if not low:
        return None
    if re.search(r'\bnc\b|non-?commercial|-nc\b|-nc-|\bnd\b|-nd\b|no-?derivs', low):
        return 'nc', s
    if re.search(r'fair use|non-?free|all rights reserved|copyrighted', low):
        return 'fair', s
    m = re.search(r'\bcc[ -]by(?:-(sa))?[ -]+(\d(?:\.\d)?)(?:[,\d.]*)(?: ([a-z]{2}))?\b', low)
    if m:
        return ('by-sa' if m.group(1) else 'by'), _cc_etikett(m.group(1), m.group(2), m.group(3))
    if re.search(r'\bcc0\b|cc[- ]zero', low):
        return 'cc0', 'CC0'
    if re.search(r'public domain|^pd\b|gemeinfrei|no known copyright', low):
        return 'pd', 'Public domain'
    if low.startswith('gfdl') or re.search(r'\bgfdl\b', low):
        return 'gfdl', s
    return None


def klassa_mall(namn):
    """Licensmallens namn på filsidan → (klass, etikett) eller None när mallen inte är en licens."""
    n = re.sub(r'[\s_]+', '-', namn.strip().lower())
    if n.startswith(('int:', 'template:')):
        return None
    if n in ('cc0', 'cc-zero', 'cc-zero-1.0'):
        return 'cc0', 'CC0'
    m = re.fullmatch(r'cc-by(-sa)?-(\d(?:\.\d)?)(?:,[\d.,]+)?(?:-([a-z]{2}))?(?:-migrated.*|-with-.*)?', n)
    if m:
        return ('by-sa' if m.group(1) else 'by'), _cc_etikett(m.group(1), m.group(2), m.group(3))
    if re.match(r'cc-by-(nc|nd)|cc-nc', n):
        return 'nc', namn.strip()
    if n == 'pd' or n.startswith(('pd-', 'licensed-pd', 'cc-pd')):
        return 'pd', 'Public domain'
    if n.startswith('gfdl'):
        return 'gfdl', namn.strip()
    if n.startswith(('fair-use', 'non-free', 'nonfree', 'copyrighted', 'no-license', 'no-permission', 'no-source')):
        return 'fair', namn.strip()
    return None


VARNINGSMALLAR = ('personality-rights', 'trademark', 'insignia', 'nazi-symbol', 'currency')


def licensmallar(wikitext):
    """Licensmallarna i filsidans wikitext: lista med (mallnamn, klass, etikett). Läser innersta mallar, samt parametrarna i {{self|…}}."""
    hittade, varningar = [], []
    for m in re.finditer(r'\{\{([^{}]*)\}\}', wikitext or ''):
        delar = [d.strip() for d in m.group(1).split('|')]
        namn = delar[0]
        low = re.sub(r'[\s_]+', '-', namn.lower())
        if any(low.startswith(v) for v in VARNINGSMALLAR):
            varningar.append(namn)
        if low in ('self', 'self2') or low.startswith('self-'):
            for d in delar[1:]:
                k = klassa_mall(d)
                if k:
                    hittade.append((f'{namn}|{d}', *k))
            continue
        k = klassa_mall(namn)
        if k:
            hittade.append((namn, *k))
    unika, sett = [], set()
    for h in hittade:
        if (h[1], h[2]) not in sett:
            sett.add((h[1], h[2]))
            unika.append(h)
    return unika, varningar


def bedom_commons(ext, wikitext, idag):
    """Licensbedömning för en Commons-fil.

    Returnerar {'status': godkand | godkand-med-not | flagga | avvisad, 'licens': etikett eller None, 'skal': [...], 'note': utkast eller None,
    'mallar': [...], 'api': visningsnamn}. wikitext är None om licensmallen inte kunde hämtas.
    """
    api_namn = (ext.get('LicenseShortName') or {}).get('value') or (ext.get('UsageTerms') or {}).get('value') or ''
    api_klass = klassa_namn(api_namn)
    mallar, varningar = licensmallar(wikitext) if wikitext is not None else ([], [])
    mall_text = ', '.join('{{' + m[0] + '}}' for m in mallar) or ('inga igenkända licensmallar' if wikitext is not None else 'licensmallen inte läst')
    res = {'status': None, 'licens': None, 'skal': [], 'note': None, 'api': api_namn,
           'mallar': [m[0] for m in mallar]}
    klasser = {m[1] for m in mallar} | ({api_klass[0]} if api_klass else set())
    tillatna = klasser & TILLATNA
    underlag = (f'Licens enligt filsidan (action=raw, öppnad {idag}): {mall_text}. '
                f'Commons API (LicenseShortName): "{api_namn or "saknas"}".')

    if klasser & AVVISADE:
        res['skal'].append('licensen är inte tillåten: ' + ', '.join(sorted(klasser & AVVISADE)) + f' ({mall_text}; API: "{api_namn}")')
        if tillatna:
            res['status'] = 'flagga'
            res['skal'].append('motsägelse: en tillåten och en otillåten licens anges')
            res['note'] = underlag + ' Källorna är oeniga om licensen; använd inte bilden förrän det är utrett.'
        else:
            res['status'] = 'avvisad'
        return res
    if 'gfdl' in klasser and not tillatna:
        res['status'] = 'avvisad'
        res['skal'].append(f'bara GFDL ({mall_text}), ingen tillåten licens')
        return res
    if wikitext is None and api_klass and api_klass[0] in TILLATNA:
        res['status'] = 'flagga'
        res['skal'].append('licensmallen (action=raw) kunde inte hämtas, så API:ets licens är inte korskontrollerad')
        res['licens'] = api_klass[1]
        return res
    if not tillatna:
        res['status'] = 'flagga'
        res['skal'].append(f'licensen kunde inte avgöras ({mall_text}; API: "{api_namn}")')
        return res
    mall_tillatna = [m for m in mallar if m[1] in TILLATNA]
    if api_klass and api_klass[0] in TILLATNA and mall_tillatna and (api_klass[0], api_klass[1]) not in {(m[1], m[2]) for m in mall_tillatna}:
        res['status'] = 'flagga'
        res['skal'].append(f'motsägelse: filsidans mallar ({mall_text}) och API:et ("{api_namn}") anger olika licens')
        res['licens'] = api_klass[1]
        res['note'] = underlag + ' De anger olika licens; kontrollera filsidan för hand.'
        return res
    if not mall_tillatna:
        res['status'] = 'flagga'
        res['skal'].append(f'API:et säger "{api_namn}" men ingen licensmall kändes igen på filsidan ({mall_text})')
        res['licens'] = api_klass[1]
        return res
    etiketter = []
    for m in mall_tillatna:
        if m[2] not in etiketter:
            etiketter.append(m[2])
    if api_klass and api_klass[1] in etiketter:
        valt = api_klass[1]
    else:
        valt = etiketter[0]
    res['licens'] = valt
    if len(etiketter) > 1 or 'gfdl' in klasser or varningar:
        res['status'] = 'godkand-med-not'
        delar = [underlag]
        if len(etiketter) > 1:
            delar.append('Flera licenser anges (' + ' och '.join(etiketter) + f'); bilden används under {valt}. Kontrollera vilken licens som gäller vilken del (verk respektive foto).')
            res['skal'].append('flera licenser: ' + ', '.join(etiketter))
        if 'gfdl' in klasser:
            delar.append(f'Filen är också licensierad under GFDL; bilden används under {valt}.')
            res['skal'].append('GFDL anges också (dubbellicens)')
        if varningar:
            delar.append('Filsidan har dessutom mallar om andra rättigheter: ' + ', '.join('{{' + v + '}}' for v in varningar) + '.')
            res['skal'].append('filsidan har mallar om andra rättigheter: ' + ', '.join(varningar))
        res['note'] = ' '.join(delar)
    else:
        res['status'] = 'godkand'
    return res


# ---------------------------------------------------------------- snabb gissning (utan filsidan)

# Statusvärden i kandidatlistan (data/utkast/bildkandidater/): 'trolig' = API:ets namn är en tillåten licens, men
# filsidans licensmall är inte kontrollerad (görs av bild_hamta.py eller bildbatch.py --licens); 'flagga' = licensen
# kunde inte avgöras och måste bedömas av en människa; 'avvisad' = inte tillåten.
KANDIDATKLASS = {'pd': 'public-domain', 'cc0': 'cc0', 'by': 'cc-by', 'by-sa': 'cc-by-sa'}


def gissa(kort, extmeta=None):
    """(klass, status, skäl) ur Commons visningsnamn (LicenseShortName, annars UsageTerms) utan filsidans mall.

    klass: public-domain, cc0, cc-by, cc-by-sa eller None. status: trolig | flagga | avvisad. Samma klassning som den
    strikta kontrollen (klassa_namn), så att de två verktygen aldrig är oense om vad en etikett betyder."""
    extmeta = extmeta or {}
    if str((extmeta.get('NonFree') or {}).get('value', '')).lower() in ('true', '1'):
        return None, 'avvisad', 'markerad som icke-fri på Commons'
    namn = kort or (extmeta.get('UsageTerms') or {}).get('value') or (extmeta.get('License') or {}).get('value') or ''
    if not str(namn).strip():
        return None, 'flagga', 'licens saknas i filsidans metadata'
    k = klassa_namn(str(namn))
    if k is None:
        return None, 'flagga', f'licensen känns inte igen som en tillåten licens och måste bedömas av en människa: {namn}'
    klass, etikett = k
    if klass in AVVISADE:
        return None, 'avvisad', f'licensen är inte tillåten ({namn})'
    if klass == 'gfdl':
        return None, 'avvisad', f'bara GFDL ({namn}), ingen tillåten licens'
    return KANDIDATKLASS[klass], 'trolig', None
