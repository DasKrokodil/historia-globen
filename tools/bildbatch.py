#!/usr/bin/env python3
"""Granskningslista för en bildomgång (#2183, steg 2): kandidater, licens och motivflaggor för en batch händelser.

Verktyget läser händelserna i data/handelser/ och kandidatlistan i data/utkast/bildkandidater/ (tools/bildkandidater.py)
och skriver tre filer i data/utkast/bildbatch/, som appen inte läser:

  <namn>.json        allt som data (händelser, kandidater, licens, flaggor)
  <namn>.md          granskningslistan: en rubrik per händelse, högst --max kandidater i en tabell, en rad att fylla i
  <namn>-lista.txt   indata till tools/bild_hamta.py --lista: den främsta kandidaten per händelse, bortkommenterad med #.
                     Agenten tar bort # på de rader den har godkänt (eller byter fil) och kör bild_hamta.py.

Verktyget väljer aldrig bild och skriver ingen bildtext. Det sorterar och flaggar (beslut 2026-11-22,
docs/beslut/2026-11-22-bildpipeline-pilot.md):
  - licens: "trolig" ur Commons API (bildkandidater.py), med --licens också den strikta kontrollen i bild_hamta.py
    (licensmallen på filsidan via action=raw jämförs med API:et). En kandidat med avvisad licens visas aldrig. En flaggad
    licens visas, men får bara användas efter en människas bedömning.
  - motiv: karta, nutida foto (taget 1990 eller senare av en händelse före 1900), smal (under 800 px), ur fritextsökning
    (inte Wikidatas P18). Flaggorna sorterar och varnar; de avvisar aldrig. Ett nutida foto eller en karta kan vara rätt
    bild om bildtexten säger vad bilden är (mönstren i docs/bilder-riktiga.md).
  - händelser utan någon användbar kandidat listas för sig, så att ingen söker igen i onödan.

Kör från projektets rot:
    python3 tools/bildbatch.py --namn 2107 --ids-fran issue-2107.md          id:n ur en fil (till exempel issuets text)
    python3 tools/bildbatch.py --namn afrika-1000 --region Afrika --period 1000-1347
    python3 tools/bildbatch.py --namn 2107 --ids-fran issue-2107.md --licens  även den strikta licenskontrollen (nätverk)

Utan --licens används inget nätverk. Med --licens följer anropen reglerna i docs/bilder-riktiga.md (bild_hamta.py:s klient:
batch om 50, User-Agent, Retry-After, tre försök, cache utanför repot). Deterministiskt: samma indata och --datum ger
samma filer. Bara standardbiblioteket.
"""
import argparse
import importlib.util
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / 'tools'
UT = ROOT / 'data' / 'utkast' / 'bildbatch'
MAX_KANDIDATER = 3
NUTIDA_FRAN = 1990       # foton tagna detta år eller senare räknas som nutida ...
NUTIDA_HANDELSE = 1900   # ... när händelsen är äldre än så
SCHEMA = 'historia-globen/bildbatch@1'

FLAGGTEXT = {
    'karta': 'karta: säg i bildtexten om kartan är samtida eller ritad senare',
    'nutida-foto': 'verkets datum enligt filsidan är 1990 eller senare för en händelse före 1900: bildtexten säger '
                   '"Nutida foto (år) av …, inte från händelsens tid"',
    'datum-osakert': 'filsidan anger bara filens datum (ofta uppladdningen), 1990 eller senare: kontrollera om det är ett nutida '
                     'foto eller ett äldre verk',
    'staende': 'stående bild: 4:3-utsnittet skär bort upp- och nederkant; skriv passa-in i tredje kolumnen i listan för att visa hela',
    'konstverk': 'modernt konstverk (monument, staty, skulptur, relief, väggmålning)? kontrollera frihet för panorama i landet '
                 'och konstnärens dödsår',
    'samma-fil': 'samma fil föreslås för flera händelser i omgången: välj den för högst en',
    'licens-risk': 'licensen är tillåten men riskabel (till exempel public domain bara i USA, PD-self med annan licens, "eget '
                   'verk" av en gammal bild): läs filsidan särskilt noga',
    'smal': 'smalare än 800 px: blir suddig i kortet',
    'ur-sokning': 'ur fritextsökning, inte Wikidatas bild: kontrollera särskilt att den visar händelsen',
    'licens-flagga': 'licensen kunde inte avgöras av programmet: en människa bedömer den på filsidan',
}


def _ladda(namn):
    spec = importlib.util.spec_from_file_location(namn, TOOLS / f'{namn}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


bk = _ladda('bildkandidater')


# ---------------------------------------------------------------- urval

def har_bild(e):
    b = e.get('image')
    return bool(b) and not b.get('placeholder')


def ids_ur_text(text, kanda):
    """Händelse-id i en text (till exempel ett issue): ord inom `…` eller ensamma ord som är kända id, i textens ordning."""
    ut = []
    for m in re.finditer(r'`([^`\s]+)`|(?<![\w-])([a-z0-9\u00df-\u00ff]+(?:-[a-z0-9\u00df-\u00ff]+)+)(?![\w-])', text):
        eid = m.group(1) or m.group(2)
        if eid in kanda and eid not in ut:
            ut.append(eid)
    return ut


def valj(handelser, ids=None, period=None, region=None):
    """Händelser utan bild och utan review draft, i tidsordning."""
    ids = set(ids or [])
    ut = []
    for e in sorted(handelser, key=lambda x: (x['start'], x['id'])):
        if har_bild(e) or e.get('review') == 'draft':
            continue
        if ids and e['id'] not in ids:
            continue
        if period and not (period[0] <= e['start'] <= period[1]):
            continue
        if region and bk.del_av(e)[0].lower() != region.lower():
            continue
        ut.append(e)
    return ut


# ---------------------------------------------------------------- flaggor och ordning

KARTA = re.compile(r'\bmaps?\b|\bkarte\b|\bcarte\b|\bmapa\b|\bmappa\b|location map|locator|\bkarta\b')
KONSTVERK = re.compile(r'monument|statues?\b|sculptur|memorial|murals?\b|\brelief|staty|skulptur|denkmal|denkmäler|monumento')


def ar_i(datum):
    m = re.search(r'(?<!\d)(1[0-9]{3}|20[0-9]{2})(?!\d)', datum or '')
    return int(m.group(1)) if m else None


def flaggor(k, e):
    text = ' '.join([k.get('fil') or '', ' '.join(k.get('kategorier') or []), k.get('beskrivning') or '']).lower()
    f = []
    if KARTA.search(text):
        f.append('karta')
    if e['start'] < NUTIDA_HANDELSE:
        if 'datum_original' in k or 'datum_fil' in k:  # kandidatlistan från #2193 skiljer verkets datum från filens
            ar = ar_i(k.get('datum_original'))
            if ar and ar >= NUTIDA_FRAN:
                f.append('nutida-foto')
            elif not k.get('datum_original') and (ar_i(k.get('datum_fil')) or 0) >= NUTIDA_FRAN:
                f.append('datum-osakert')
        else:  # äldre kandidatlista: datumet kan vara uppladdningen
            ar = ar_i(k.get('datum'))
            if ar and ar >= NUTIDA_FRAN:
                f.append('datum-osakert')
    if KONSTVERK.search(text):
        f.append('konstverk')
    if k.get('smal'):
        f.append('smal')
    if k.get('bredd') and k.get('hojd') and k['hojd'] > k['bredd']:
        f.append('staende')
    if k.get('kalla') == 'commons-sok':
        f.append('ur-sokning')
    if k.get('licensstatus') == 'flagga':
        f.append('licens-flagga')
    return f


def ordna(kandidater, e, n):
    """Användbara kandidater (inte avvisade) med flaggor, de bästa först: trolig licens, Wikidatas bild, bred, få flaggor.
    Ordningen är bara en sortering; agenten väljer."""
    rader = []
    for i, k in enumerate(kandidater):
        if k.get('licensstatus') == 'avvisad':
            continue
        fl = flaggor(k, e)
        nyckel = (k.get('licensstatus') != 'trolig', k.get('kalla') != 'wikidata-P18', bool(k.get('smal')), len(fl), i)
        rader.append((nyckel, dict(k, flaggor=fl)))
    rader.sort(key=lambda x: x[0])
    return [k for _, k in rader[:n]]


# ---------------------------------------------------------------- strikt licens (valfri, nätverk)

def strikt_licens(titlar, idag, cache_dir=None, offline=False, bh=None, klient=None):
    """{titel: {'status', 'licens', 'skal', 'note'}} med bild_hamta.py:s strikta kontroll. 'ej hämtad' när Commons inte
    svarade; då gäller bara den troliga licensen."""
    bh = bh or _ladda('bild_hamta')
    if klient is None:
        if offline:
            def ingen_natverk(url, headers, timeout):
                raise OSError('offline: svaret finns inte i cachen')
            klient = bh.Klient(cache_dir=cache_dir, transport=ingen_natverk, sleep=lambda s: None, max_forsok=1)
        else:
            klient = bh.Klient(cache_dir=cache_dir)
    ut = {}
    meta = bh.commons_batch(klient, titlar) if titlar else {}
    for t in titlar:
        st, sida = meta.get(t, ('saknas', None))
        if st != 'ok':
            ut[t] = {'status': 'ej hämtad' if st == 'ej hämtad' else st, 'licens': None, 'skal': [str(sida or st)], 'note': None}
            continue
        ext = (sida.get('imageinfo') or [{}])[0].get('extmetadata') or {}
        try:
            wikitext = bh.commons_raw(klient, sida['title'])
        except bh.EjHamtad as e:
            wikitext = None
            fel = str(e)
        else:
            fel = None
        bed = bh.bedom_commons(ext, wikitext, idag)
        r = {'status': bed['status'], 'licens': bed['licens'], 'skal': bed['skal'], 'note': bed['note'],
             'risker': bed.get('risker') or [], 'mallar': bed.get('mallar') or []}
        if fel:
            r['skal'] = r['skal'] + [f'licensmallen (action=raw) ej hämtad: {fel}']
        ut[t] = r
    return ut


# ---------------------------------------------------------------- utdata

def ar_text(a):
    return f'{1 - a} f.Kr.' if a <= 0 else str(a)


def bygg(handelser, kandidatposter, n=MAX_KANDIDATER):
    poster, utan = [], []
    for e in handelser:
        kp = kandidatposter.get(e['id'])
        rad = {'id': e['id'], 'titel': (e.get('title') or {}).get('sv'), 'start': e['start'],
               'plats': (e.get('place') or {}).get('sv'), 'wikidata': e.get('wikidata'), 'kandidater': []}
        if kp is None:
            rad['anmarkning'] = 'inte med i kandidatlistan: kör tools/bildkandidater.py för händelsen'
        elif 'ej_hamtad' in kp:
            rad['anmarkning'] = f'kandidatlistan kunde inte hämtas ({kp["ej_hamtad"].get("felkod")}): kör om bildkandidater.py'
        else:
            rad['kandidater'] = ordna(kp.get('kandidater') or [], e, n)
            rad['hamtad'] = kp.get('hamtad')
        rad['stil'] = stil_for(e)
        (poster if rad['kandidater'] else utan).append(rad)
    # Samma fil för flera händelser i omgången (#2193)
    per_fil = {}
    for p in poster:
        for k in p['kandidater']:
            per_fil.setdefault(k['fil'], []).append(p['id'])
    for p in poster:
        for k in p['kandidater']:
            andra = [i for i in per_fil[k['fil']] if i != p['id']]
            if andra:
                k['samma_fil_som'] = andra
                if 'samma-fil' not in k['flaggor']:
                    k['flaggor'].append('samma-fil')
    return poster, utan


_STILAR = None


def stil_for(e):
    """Stilens id enligt data/styles.json (tid och plats, samma regel som tools/bildpromptar.py), eller None."""
    global _STILAR
    try:
        if _STILAR is None:
            _STILAR = (_ladda('bildpromptar'), json.loads((ROOT / 'data' / 'styles.json').read_text(encoding='utf-8')))
        bp, doc = _STILAR
        return bp.style_for(e, doc)[0]['id']
    except (OSError, ValueError, KeyError, IndexError, TypeError):
        return None


def lagg_till_strikt(poster, strikt):
    for p in poster:
        for k in p['kandidater']:
            s = strikt.get(k['fil'])
            if not s:
                continue
            k['licens_strikt'] = s
            if s['status'] in ('flagga', 'avvisad') and 'licens-flagga' not in k['flaggor']:
                k['flaggor'].append('licens-flagga')
            if s.get('risker') and 'licens-risk' not in k['flaggor']:
                k['flaggor'].append('licens-risk')


def licens_cell(k):
    s = k.get('licens_strikt')
    trolig = f'{k.get("licens") or "?"} ({k.get("licensstatus")})'
    if not s:
        return trolig + ', filsidans mall ej läst'
    return f'{trolig}; filsidan: {s["status"]}' + (f' {s["licens"]}' if s.get('licens') else '') + \
        (f' – {"; ".join(s["skal"])}' if s.get('skal') else '')


def kort(t, n):
    t = re.sub(r'\s+', ' ', str(t)).strip()
    return t if len(t) <= n else t[:n - 1].rstrip() + '…'


def cell(t):
    return str(t if t is not None else '').replace('|', '\\|').replace('\n', ' ')


def markdown(namn, poster, utan, idag, urval):
    rader = [
        f'# Granskningslista för bildomgång {namn}',
        '',
        f'> Skapad av `python3 tools/bildbatch.py` {idag} ({urval}). FÖRSLAG, inte beslut: programmet väljer aldrig bild och '
        'skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar '
        'händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.',
        '',
        f'**Händelser:** {len(poster) + len(utan)}. **Med minst en användbar kandidat:** {len(poster)}. '
        f'**Utan kandidat:** {len(utan)}.',
        '',
        '**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande '
        f'rad i `{namn}-lista.txt` (byt fil om du valde en annan kandidat) och kör '
        f'`python3 tools/bild_hamta.py --lista data/utkast/bildbatch/{namn}-lista.txt`.',
        '',
        '**Flaggorna** avvisar inget, de säger vad du ska titta efter:',
        '',
    ]
    rader += [f'- `{k}`: {v}' for k, v in FLAGGTEXT.items()]
    for i, p in enumerate(poster, 1):
        rader += ['', f'## {i}. `{p["id"]}`: {p["titel"]} ({ar_text(p["start"])}, {p["plats"] or "–"})', '']
        info = []
        if p.get('wikidata'):
            info.append(f'Wikidata: [{p["wikidata"]}](https://www.wikidata.org/wiki/{p["wikidata"]})')
        info.append(f'Kandidater hämtade {p.get("hamtad") or "–"}')
        if p.get('stil'):
            info.append(f'Stil enligt data/styles.json: `{p["stil"]}`')
        rader += ['. '.join(info) + '.', '']
        rader += ['| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |',
                  '| ---: | --- | --- | --- | --- | --- | --- | --- |']
        for j, k in enumerate(p['kandidater'], 1):
            storlek = f'{k.get("bredd")} × {k.get("hojd")}' if k.get('bredd') else '–'
            datum = (f'{k.get("datum_original") or "–"} / {k.get("datum_fil") or "–"}' if ('datum_original' in k or 'datum_fil' in k)
                     else f'{k.get("datum") or "–"} (verk eller fil)')
            rader.append(f'| {j} | [{cell(k["fil"])}]({k["filsida"]}) | {cell(k.get("kalla"))} | {cell(licens_cell(k))} | '
                         f'{cell(k.get("upphovsperson"))} | {cell(datum)} | {storlek} | '
                         f'{cell(", ".join(k["flaggor"]) or "–")} |')
        for j, k in enumerate(p['kandidater'], 1):
            delar = []
            if k.get('beskrivning'):
                delar.append('beskrivning: ' + kort(k['beskrivning'], 220))
            if k.get('kategorier'):
                delar.append('kategorier: ' + kort('; '.join(k['kategorier'][:6]), 220))
            if k.get('samma_fil_som'):
                delar.append('samma fil föreslås också för ' + ', '.join(f'`{i}`' for i in k['samma_fil_som']))
            if (k.get('licens_strikt') or {}).get('risker'):
                delar.append('licensrisk: ' + '; '.join(k['licens_strikt']['risker']))
            if delar:
                rader.append(f'- Nr {j}: ' + ' · '.join(delar))
        rader += ['', '- [ ] Vald (nr eller "ingen" med skäl): ', '- Motiv (bara det filsidan stöder): ']
    if utan:
        rader += ['', '## Utan användbar kandidat', '',
                  'Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i '
                  '`docs/bilder-saknas.md` med datum och skäl.', '']
        rader += [f'- `{p["id"]}`: {p["titel"]} ({ar_text(p["start"])})' + (f'. {p["anmarkning"]}' if p.get('anmarkning') else '')
                  for p in utan]
    return '\n'.join(rader) + '\n'


def lista(poster):
    rader = ['# Indata till python3 tools/bild_hamta.py --lista (#2183). En rad per händelse: referens, tabb, händelse-id.',
             '# Ta bort # på de rader som är godkända i granskningslistan; byt fil om en annan kandidat valdes.']
    for p in poster:
        rader.append(f'# {p["kandidater"][0]["fil"]}\t{p["id"]}')
    return '\n'.join(rader) + '\n'


def skriv(mapp, namn, doc, md, txt):
    mapp = bk.sakra_utkastvag(Path(mapp))
    mapp.mkdir(parents=True, exist_ok=True)
    (mapp / f'{namn}.json').write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (mapp / f'{namn}.md').write_text(md, encoding='utf-8')
    (mapp / f'{namn}-lista.txt').write_text(txt, encoding='utf-8')
    return [mapp / f'{namn}.json', mapp / f'{namn}.md', mapp / f'{namn}-lista.txt']


def main(argv=None, strikt_fn=None):
    ap = argparse.ArgumentParser(description='Granskningslista för en bildomgång (#2183).')
    ap.add_argument('--namn', required=True, help='batchens namn, till exempel issuets nummer (bara a–z, 0–9 och -)')
    ap.add_argument('--ids-fran', help='fil att läsa händelse-id ur (till exempel issuets text)')
    ap.add_argument('--id', action='append', default=[], help='händelse-id (kan upprepas)')
    ap.add_argument('--period', help='år FRÅN-TILL (astronomiska år)')
    ap.add_argument('--region', choices=bk.REGIONER + [r.lower() for r in bk.REGIONER])
    ap.add_argument('--max', type=int, default=MAX_KANDIDATER, help=f'högst så här många kandidater per händelse ({MAX_KANDIDATER})')
    ap.add_argument('--licens', action='store_true', help='kör också den strikta licenskontrollen (nätverk, bild_hamta.py)')
    ap.add_argument('--offline', action='store_true', help='med --licens: bara cachen')
    ap.add_argument('--cache-dir', help='cachemapp för --licens')
    ap.add_argument('--datum', help='dagens datum (ÅÅÅÅ-MM-DD), för deterministiska filer')
    ap.add_argument('--ut', default=str(UT), help='utdatamapp (standard data/utkast/bildbatch/)')
    ap.add_argument('--handelser', default=str(ROOT / 'data' / 'handelser'), help=argparse.SUPPRESS)
    ap.add_argument('--kandidater', default=str(bk.UTKAST), help=argparse.SUPPRESS)
    a = ap.parse_args(argv)
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', a.namn):
        ap.error('--namn får bara innehålla a–z, 0–9 och bindestreck')
    idag = a.datum or date.today().isoformat()
    try:
        period = bk.tolka_period(a.period) if a.period else None
    except ValueError as e:
        ap.error(str(e))
    alla = bk.las_handelser(a.handelser)
    kanda = {e['id'] for e in alla}
    ids = list(a.id)
    if a.ids_fran:
        ids += ids_ur_text(Path(a.ids_fran).read_text(encoding='utf-8'), kanda)
    okanda = [i for i in a.id if i not in kanda]
    if okanda:
        ap.error('okända händelse-id: ' + ', '.join(okanda))
    if not (ids or period or a.region):
        ap.error('ange --ids-fran, --id, --period eller --region')
    handelser = valj(alla, ids=ids, period=period, region=a.region)
    med_bild = sorted(set(ids) - {e['id'] for e in handelser})
    poster, utan = bygg(handelser, bk.las_mapp(a.kandidater), a.max)
    if a.licens:
        titlar = sorted({k['fil'] for p in poster for k in p['kandidater']})
        fn = strikt_fn or (lambda t: strikt_licens(t, idag, cache_dir=a.cache_dir or str(Path.home() / '.cache' / 'historia-globen' / 'bild_hamta'),
                                                    offline=a.offline))
        lagg_till_strikt(poster, fn(titlar))
    urval = ' '.join(x for x in (f'ids={len(ids)}' if ids else '', f'period={a.period}' if a.period else '',
                                 f'region={a.region}' if a.region else '', 'licens=strikt' if a.licens else 'licens=trolig') if x)
    doc = {'schema': SCHEMA, 'status': 'förslag', 'namn': a.namn, 'datum': idag, 'urval': urval,
           'redan_bild_eller_utkast': med_bild, 'handelser': poster, 'utan_kandidat': utan}
    filer = skriv(a.ut, a.namn, doc, markdown(a.namn, poster, utan, idag, urval), lista(poster))
    print(f'{len(handelser)} händelser: {len(poster)} med kandidat, {len(utan)} utan'
          + (f', {len(med_bild)} har redan bild eller är utkast' if med_bild else '') + '. Skrev ' + ', '.join(str(f.relative_to(ROOT)) if ROOT in f.parents else str(f) for f in filer),
          file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
