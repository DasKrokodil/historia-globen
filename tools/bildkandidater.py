#!/usr/bin/env python3
"""Föreslår fria bildkandidater till händelser som saknar bild (#2119, steg 1).

För händelser i data/handelser/ utan `image` (och utan review `draft`):
  1. Har händelsen ett Wikidata-id (`wikidata`) hämtas Wikidatas bild (P18) som Commons-filnamn.
     Utan id söks Commons (namnrymd File) efter titel och plats, högst fem träffar.
  2. Varje kandidat får licens, klassad med samma regler som den strikta kontrollen i tools/bild_hamta.py
     (tools/licens_commons.py, #2183): "trolig" när API:ets namn är public domain, CC0, CC BY eller CC BY-SA
     (filsidans licensmall är då ännu inte läst), "flagga" när licensen inte känns igen (till exempel
     "No restrictions") och måste bedömas av en människa, och "avvisad" med skäl. Dessutom upphovsperson, datum, bredd och höjd (minst 800 px
     bred, annars flaggan `smal`), filsidans adress och Commons-kategorier. Aldrig mer än det
     filsidan själv säger.
  3. Resultatet skrivs till data/utkast/bildkandidater/<världsdel>-<period>.json (en fil per världsdel och
     period i tools/tackning.py, så att körningar för olika delar inte krockar). Appen läser inte filerna. Alla
     kandidater är FÖRSLAG: öppna filsidan, kontrollera licensen och att bilden visar händelsen
     (inte en karta eller en nutida minnessten) innan den används (docs/bilder-riktiga.md).

Anropen följer rutinen i docs/bilder-riktiga.md: batch om högst 50 per anrop, beskrivande
User-Agent utan personuppgifter, Retry-After respekteras (högst några minuter), högst tre försök
och sedan vidare (händelsen märks `ej_hamtad`), och en cache utanför repot.

Kör från projektets rot, till exempel:
    python3 tools/bildkandidater.py --region Afrika --period 1000-1347 --limit 10
    python3 tools/bildkandidater.py --id cheopspyramiden --id slaget-vid-hastings
    python3 tools/bildkandidater.py --offline --region Afrika   (bara cachen, inget nätverk)

Bara standardbiblioteket.
"""
import argparse
import hashlib
import html
import importlib.util
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from licens_commons import gissa  # noqa: E402  (samma licensklassning som bild_hamta.py, #2183)

ROOT = Path(__file__).resolve().parent.parent
UTKAST = ROOT / 'data' / 'utkast' / 'bildkandidater'
SAKNAS = ROOT / 'docs' / 'bilder-saknas.md'

USER_AGENT = 'HistoriaGlobenBildkandidater/1.0 (hobbyprojekt med öppen källkod; klient: Claude Code)'
WIKIDATA_API = 'https://www.wikidata.org/w/api.php'
COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
BATCH = 50
MAX_FORSOK = 3
MAX_VANTAN = 120  # sekunder: längre Retry-After väntas inte på, händelsen tas i en senare körning
TIMEOUT = 30
MIN_BREDD = 800
MAX_SOK = 5
MAX_P18 = 3  # fler än tre bilder på samma post är sällsynt; de första (föredragna) räcker som förslag
THUMB = 960

SCHEMA = 'historia-globen/bildkandidater@2'
ANMARKNING = (
    'FÖRSLAG, inte beslut. Kandidaterna är hämtade automatiskt och måste kontrolleras manuellt innan '
    'någon används: öppna filsidan (`filsida`), läs licensmallen, kontrollera att bilden visar själva '
    'händelsen (inte en karta, en nutida minnessten eller något annat) och skriv bildtexten ur det '
    'filsidan säger. Licensklassningen är en automatisk gissning ur Commons API ("trolig"); filsidans '
    'licensmall kontrolleras av tools/bild_hamta.py eller tools/bildbatch.py --licens, och "flagga" avgörs av en människa. Appen läser inte den här filen '
    '(data/utkast/). Se docs/bilder-riktiga.md.'
)

REGIONER = ['Europa', 'Asien', 'Afrika', 'Amerika', 'Oceanien']


class Hamtningsfel(Exception):
    """Ett anrop gav inte svar efter tre försök (eller saknas i cachen med --offline)."""

    def __init__(self, kod, text=''):
        super().__init__(f'{kod} {text}'.strip())
        self.kod = str(kod)


# ---------------------------------------------------------------- hämtning

def cache_katalog():
    bas = os.environ.get('XDG_CACHE_HOME') or str(Path.home() / '.cache')
    return Path(bas) / 'historia-globen' / 'bildkandidater'


def cache_nyckel(api, params):
    kanon = api + '?' + urllib.parse.urlencode(sorted(params.items()))
    return hashlib.sha256(kanon.encode('utf-8')).hexdigest()[:40]


class Klient:
    """Hämtar JSON från ett MediaWiki-API med cache, Retry-After och tre försök."""

    def __init__(self, cache_dir=None, offline=False, sleep=time.sleep, opener=None, log=None):
        self.cache_dir = Path(cache_dir) if cache_dir else None
        self.offline = offline
        self.sleep = sleep
        self.opener = opener or self._open
        self.log = log or (lambda m: print(m, file=sys.stderr))
        self.anrop = 0  # antal verkliga nätverksanrop (för prov och rapport)

    @staticmethod
    def _open(url):
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return json.loads(r.read().decode('utf-8'))

    def hamta(self, api, params):
        params = {**params, 'format': 'json', 'formatversion': '2'}
        namn = None
        if self.cache_dir:
            namn = self.cache_dir / (cache_nyckel(api, params) + '.json')
            if namn.exists():
                try:
                    return json.loads(namn.read_text(encoding='utf-8'))
                except (OSError, ValueError):
                    pass  # trasig cachefil: hämta på nytt
        if self.offline:
            raise Hamtningsfel('offline', 'svaret finns inte i cachen')
        url = api + '?' + urllib.parse.urlencode(params)
        sista = None
        for forsok in range(1, MAX_FORSOK + 1):
            self.anrop += 1
            try:
                svar = self.opener(url)
            except urllib.error.HTTPError as e:
                sista = Hamtningsfel(e.code, e.reason if isinstance(e.reason, str) else '')
                if e.code in (429, 503, 502, 504):
                    vantan = retry_after(e.headers.get('Retry-After') if e.headers else None, forsok)
                else:
                    break  # 4xx som inte hjälper att försöka om
            except (urllib.error.URLError, TimeoutError, OSError, ValueError) as e:
                sista = Hamtningsfel(type(e).__name__, str(e))
                vantan = 2 * forsok
            else:
                if isinstance(svar, dict) and 'error' in svar:
                    sista = Hamtningsfel(svar['error'].get('code', 'api'), svar['error'].get('info', ''))
                    vantan = 2 * forsok
                else:
                    if namn:
                        try:
                            namn.parent.mkdir(parents=True, exist_ok=True)
                            namn.write_text(json.dumps(svar, ensure_ascii=False), encoding='utf-8')
                        except OSError:
                            pass  # cachen är en bekvämlighet
                    return svar
            if forsok < MAX_FORSOK:
                self.log(f'  försök {forsok} misslyckades ({sista}); väntar {vantan} s')
                self.sleep(vantan)
        raise sista


def retry_after(varde, forsok):
    """Sekunder att vänta: Retry-After om den är ett tal (högst MAX_VANTAN), annars 5 s * försök."""
    try:
        s = int(float(varde))
    except (TypeError, ValueError):
        s = 5 * forsok
    return max(1, min(s, MAX_VANTAN))


def i_batchar(lista, n=BATCH):
    for i in range(0, len(lista), n):
        yield lista[i:i + n]


# ---------------------------------------------------------------- urval

def region_funktion():
    spec = importlib.util.spec_from_file_location('tackningsrapport', ROOT / 'tools' / 'tackningsrapport.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.region


_TACKNING = None


def tackning():
    """tools/tackning.py (världsdel och period med samma regler som täckningsrapporten), laddad en gång."""
    global _TACKNING
    if _TACKNING is None:
        spec = importlib.util.spec_from_file_location('tackning', ROOT / 'tools' / 'tackning.py')
        _TACKNING = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_TACKNING)
    return _TACKNING


def del_av(e):
    """(världsdel, period-id) för en händelse, som i tools/tackning.py."""
    t = tackning()
    lon, lat = e['location']['coordinates'][:2]
    return t.region(lat, lon), t.period_of(e['start'])


def filnamn(varldsdel, period):
    """Kandidatfilens namn för en världsdel och period, till exempel afrika-medeltid.json."""
    return f'{varldsdel.lower()}-{period}.json'


def las_handelser(handelser_dir):
    ut = []
    for f in sorted(Path(handelser_dir).glob('*.json')):
        for e in json.loads(f.read_text(encoding='utf-8'))['events']:
            ut.append(e)
    return ut


def saknade_id(fil=SAKNAS):
    """Händelse-id i första kolumnen i tabellerna i docs/bilder-saknas.md (redan prövade)."""
    ids = set()
    if Path(fil).exists():
        for rad in Path(fil).read_text(encoding='utf-8').splitlines():
            m = re.match(r'^\|\s*`([^`]+)`', rad)
            if m:
                ids.add(m.group(1))
    return ids


def tolka_period(text):
    """'1000-1347', '-500..100' eller '-800--400' (astronomiska år) -> (från, till)."""
    m = re.match(r'^\s*(-?\d+)\s*(?:\.\.|–|-)\s*(-?\d+)\s*$', text or '')
    if not m:
        raise ValueError(f'period ska skrivas som FRÅN-TILL i år, till exempel 1000-1347: {text!r}')
    a, b = int(m.group(1)), int(m.group(2))
    return (a, b) if a <= b else (b, a)


def valj(handelser, period=None, region=None, ids=None, limit=None, exkludera=None, region_av=None):
    """Händelser utan bild och utan review draft, i tidsordning, efter urvalet."""
    ids = set(ids or [])
    exkludera = set(exkludera or [])
    ut = []
    for e in sorted(handelser, key=lambda x: (x['start'], x['id'])):
        bild = e.get('image')
        if bild and not bild.get('placeholder'):
            continue
        if e.get('review') == 'draft':
            continue
        if ids and e['id'] not in ids:
            continue
        if e['id'] in exkludera:
            continue
        if period and not (period[0] <= e['start'] <= period[1]):
            continue
        if region:
            lon, lat = e['location']['coordinates'][:2]
            if region_av(lat, lon).lower() != region.lower():
                continue
        ut.append(e)
    return ut[:limit] if limit else ut


# ---------------------------------------------------------------- Wikidata och Commons

def fil_titel(namn):
    namn = namn.strip()
    return namn if namn.startswith('File:') else 'File:' + namn.replace('_', ' ')


def p18_filer(svar):
    """{Q-id: [filnamn]} ur ett wbgetentities-svar. Borttagna (deprecated) påståenden hoppas över,
    föredragna (preferred) kommer först."""
    ut = {}
    for qid, ent in (svar.get('entities') or {}).items():
        if not isinstance(ent, dict) or 'missing' in ent:
            continue
        claims = (ent.get('claims') or {}).get('P18') or []
        rank = {'preferred': 0, 'normal': 1}
        bra = [c for c in claims if c.get('rank', 'normal') in rank and
               (c.get('mainsnak') or {}).get('datavalue', {}).get('value')]
        bra.sort(key=lambda c: rank[c.get('rank', 'normal')])
        filer = [c['mainsnak']['datavalue']['value'] for c in bra][:MAX_P18]
        if filer:
            ut[qid] = filer
    return ut


def rensa(text):
    """HTML ur extmetadata -> ren text."""
    if text is None:
        return None
    t = re.sub(r'<[^>]+>', ' ', str(text))
    t = re.sub(r'\s+', ' ', html.unescape(t)).strip()
    return t or None


def klassa_licens(kort, extmeta=None):
    """(klass, status, skäl). klass: public-domain, cc0, cc-by, cc-by-sa eller None. Status trolig | flagga | avvisad.
    Samma klassning som den strikta kontrollen (tools/licens_commons.py, #2183); filsidans licensmall avgör."""
    return gissa(kort, extmeta)


def kandidat_ur_sida(sida, kalla):
    """Ett kandidatobjekt ur en sida i ett Commons-svar (prop=imageinfo|categories), eller None."""
    info = (sida.get('imageinfo') or [None])[0]
    if not info:
        return None
    em = info.get('extmetadata') or {}

    def ev(k):
        return rensa((em.get(k) or {}).get('value'))

    kort = ev('LicenseShortName')
    klass, status, skal = klassa_licens(kort, em)
    bredd, hojd = info.get('width'), info.get('height')
    kategorier = [re.sub(r'^Category:', '', c['title']) for c in sida.get('categories') or []]
    k = {
        'fil': sida['title'],
        'filsida': info.get('descriptionurl') or 'https://commons.wikimedia.org/wiki/' +
                   urllib.parse.quote(sida['title'].replace(' ', '_')),
        'kalla': kalla,
        'licens': kort,
        'licensklass': klass,
        'licensstatus': status,
        'licensadress': ev('LicenseUrl'),
        'upphovsperson': ev('Artist'),
        'datum': ev('DateTimeOriginal') or ev('DateTime'),
        'beskrivning': ev('ImageDescription'),
        'bredd': bredd,
        'hojd': hojd,
        'mime': info.get('mime'),
        'miniatyr': info.get('thumburl'),
        'kategorier': kategorier,
        'smal': bool(bredd is not None and bredd < MIN_BREDD),
    }
    if skal:
        k['licens_skal'] = skal
    return k


def sidor(svar):
    p = (svar.get('query') or {}).get('pages') or []
    if isinstance(p, dict):
        p = list(p.values())
    return p


def commons_info(klient, titlar, kalla_per_titel):
    """Metadata för filtitlar (batch om 50). Returnerar ({titel: kandidat}, {titel: felmeddelande})."""
    kand, fel = {}, {}
    unika = list(dict.fromkeys(titlar))
    for grupp in i_batchar(unika):
        try:
            svar = klient.hamta(COMMONS_API, {
                'action': 'query', 'titles': '|'.join(grupp), 'prop': 'imageinfo|categories',
                'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': THUMB,
                'clshow': '!hidden', 'cllimit': 'max'})
        except Hamtningsfel as e:
            for t in grupp:
                fel[t] = e.kod
            continue
        norm = {n['from']: n['to'] for n in (svar.get('query') or {}).get('normalized') or []}
        per = {s['title']: s for s in sidor(svar) if not s.get('missing')}
        for t in grupp:
            s = per.get(norm.get(t, t))
            k = kandidat_ur_sida(s, kalla_per_titel[t]) if s else None
            if k:
                kand[t] = k
            else:
                fel[t] = 'filen finns inte på Commons'
    return kand, fel


def sok_text(e):
    """Söksträng: engelsk (annars svensk) titel och platsens första led, men bara om platsen är ett
    kort namn (en lång platsbeskrivning ger noll träffar på Commons)."""
    titel = (e.get('title') or {})
    plats = (e.get('place') or {})
    t = titel.get('en') or titel.get('sv') or ''
    p = (plats.get('en') or plats.get('sv') or '').split(',')[0].strip()
    if len(p.split()) > 3:
        p = ''
    return re.sub(r'\s+', ' ', f'{t} {p}'.replace('"', ' ')).strip()


def commons_sok(klient, e):
    svar = klient.hamta(COMMONS_API, {
        'action': 'query', 'generator': 'search', 'gsrsearch': sok_text(e) + ' filetype:bitmap',
        'gsrnamespace': 6, 'gsrlimit': MAX_SOK, 'prop': 'imageinfo|categories',
        'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': THUMB, 'clshow': '!hidden', 'cllimit': 'max'})
    ut = [(s.get('index', 99), kandidat_ur_sida(s, 'commons-sok')) for s in sidor(svar)]
    return [k for _, k in sorted(ut, key=lambda x: x[0]) if k][:MAX_SOK]


# ---------------------------------------------------------------- körning

def kor(handelser, klient, idag=None, log=None):
    """Returnerar {id: post} för de valda händelserna."""
    log = log or (lambda m: print(m, file=sys.stderr))
    idag = idag or date.today().isoformat()
    poster = {}
    med_id = [e for e in handelser if e.get('wikidata')]
    utan_id = [e for e in handelser if not e.get('wikidata')]
    for e in handelser:
        varldsdel, period = del_av(e)
        poster[e['id']] = {
            'id': e['id'], 'titel': (e.get('title') or {}).get('sv'),
            'plats': (e.get('place') or {}).get('sv'), 'start': e['start'],
            'varldsdel': varldsdel, 'period': period, 'hamtad': idag,
            'review': e.get('review'), 'wikidata': e.get('wikidata'), 'kandidater': []}

    def ej(eid, kod):
        poster[eid]['ej_hamtad'] = {'felkod': kod, 'datum': idag}

    p18 = {}
    for grupp in i_batchar(med_id):
        try:
            svar = klient.hamta(WIKIDATA_API, {
                'action': 'wbgetentities', 'ids': '|'.join(e['wikidata'] for e in grupp),
                'props': 'claims', 'languages': 'en'})
            p18.update(p18_filer(svar))
        except Hamtningsfel as ex:
            log(f'Wikidata-batch misslyckades ({ex}); {len(grupp)} händelser märks ej_hamtad')
            for e in grupp:
                ej(e['id'], ex.kod)
    titlar, kalla = [], {}
    for e in med_id:
        for f in p18.get(e['wikidata'], []):
            t = fil_titel(f)
            titlar.append(t)
            kalla[t] = 'wikidata-P18'
    kand, fel = commons_info(klient, titlar, kalla) if titlar else ({}, {})
    for e in med_id:
        if 'ej_hamtad' in poster[e['id']]:
            continue
        for f in p18.get(e['wikidata'], []):
            t = fil_titel(f)
            if t in kand:
                poster[e['id']]['kandidater'].append(kand[t])
            else:
                poster[e['id']].setdefault('anmarkningar', []).append(f'{t}: {fel.get(t, "okänt fel")}')
    # Utan id, eller med id men utan P18: sök på Commons (id-lösa först, sedan de utan P18)
    for e in utan_id + [x for x in med_id if not p18.get(x['wikidata']) and 'ej_hamtad' not in poster[x['id']]]:
        try:
            poster[e['id']]['kandidater'].extend(commons_sok(klient, e))
            poster[e['id']]['soktext'] = sok_text(e)
            if e.get('wikidata'):
                poster[e['id']].setdefault('anmarkningar', []).append(
                    'Wikidata-posten har ingen bild (P18); kandidaterna kommer ur en sökning på Commons')
        except Hamtningsfel as ex:
            log(f'  sökning för {e["id"]} gav inget svar ({ex}); ej_hamtad, går vidare')
            ej(e['id'], ex.kod)
    return poster


def raknare(lista):
    allt = [k for p in lista for k in p['kandidater']]
    return {
        'handelser': len(lista), 'kandidater': len(allt),
        'troliga': sum(1 for k in allt if k['licensstatus'] == 'trolig'),
        'flaggade': sum(1 for k in allt if k['licensstatus'] == 'flagga'),
        'avvisade': sum(1 for k in allt if k['licensstatus'] == 'avvisad'),
        'smala': sum(1 for k in allt if k['smal']),
        'ej_hamtade': sum(1 for p in lista if 'ej_hamtad' in p)}


def skriv_fil(sokvag, poster_i_filen):
    """Skriver en kandidatfil (en världsdel och period). Deterministisk: inget körningsdatum i filen
    (varje händelse har sitt eget `hamtad`), poster i år- och id-ordning."""
    lista = sorted(poster_i_filen, key=lambda p: (p['start'], p['id']))
    doc = {'schema': SCHEMA, 'status': 'förslag', 'anmarkning': ANMARKNING, 'generated': raknare(lista),
           'handelser': lista}
    sokvag.parent.mkdir(parents=True, exist_ok=True)
    sokvag.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return doc


def las_mapp(mapp):
    """{id: post} ur alla kandidatfiler i mappen."""
    poster = {}
    for f in sorted(Path(mapp).glob('*.json')):
        try:
            for p in json.loads(f.read_text(encoding='utf-8')).get('handelser', []):
                poster[p['id']] = p
        except (OSError, ValueError, KeyError):
            continue
    return poster


def skriv(mapp, nya, urval_text, idag=None):
    """Skriver de kandidatfiler som de nya posterna hör till. Befintliga poster för andra händelser behålls (en bit i
    taget), och filer för andra världsdelar och perioder rörs inte. Returnerar en sammanställning av de filer som skrevs."""
    mapp = sakra_utkastvag(Path(mapp))
    per_fil = {}
    for p in nya.values():
        per_fil.setdefault(filnamn(p['varldsdel'], p['period']), {})[p['id']] = p
    alla = []
    for namn, bit in sorted(per_fil.items()):
        fil = mapp / namn
        poster = {}
        if fil.exists():
            try:
                for p in json.loads(fil.read_text(encoding='utf-8')).get('handelser', []):
                    poster[p['id']] = p
            except (OSError, ValueError, KeyError):
                pass
        poster.update(bit)
        alla += skriv_fil(fil, poster.values())['handelser']
    alla.sort(key=lambda p: (p['start'], p['id']))
    return {'schema': SCHEMA, 'status': 'förslag', 'anmarkning': ANMARKNING, 'senaste_urval': urval_text,
            'filer': sorted(per_fil), 'generated': raknare(alla), 'handelser': alla}


def sakra_utkastvag(vag):
    """Utdata får bara hamna under data/utkast/ (grinden i beslutet 2026-11-22). Undantag: en tillfällig mapp i prov,
    som anges med miljövariabeln HISTORIA_GLOBEN_PROV_UT."""
    rot = (ROOT / 'data' / 'utkast').resolve()
    v = Path(vag).resolve()
    prov = os.environ.get('HISTORIA_GLOBEN_PROV_UT')
    if v == rot or rot in v.parents:
        return v
    if prov and (v == Path(prov).resolve() or Path(prov).resolve() in v.parents):
        return v
    raise SystemExit(f'Utdata får bara skrivas under data/utkast/, inte {vag}')


SPARA_VAR = 50  # utdatafilen sparas efter var 50:e händelse, så att ett avbrott inte tappar allt


def kor_och_spara(handelser, klient, sokvag, urval_text, spara_var=SPARA_VAR, log=None):
    """Kör urvalet i bitar om `spara_var` händelser och skriver utdatafilen efter varje bit.
    Returnerar (alla poster i den här körningen, senaste dokumentet)."""
    poster, doc = {}, None
    for i in range(0, len(handelser), spara_var):
        bit = kor(handelser[i:i + spara_var], klient, log=log)
        poster.update(bit)
        doc = skriv(sokvag, bit, urval_text)
    return poster, doc


def sammanfatta(poster):
    """Antal händelser i körningen: med kandidater, utan kandidater och ej hämtade."""
    ej = sum(1 for p in poster.values() if 'ej_hamtad' in p)
    med = sum(1 for p in poster.values() if p['kandidater'])
    utan = sum(1 for p in poster.values() if not p['kandidater'] and 'ej_hamtad' not in p)
    return {'handelser': len(poster), 'med_kandidater': med, 'utan_kandidater': utan, 'ej_hamtade': ej}


def main(argv=None, klient=None):
    ap = argparse.ArgumentParser(description='Föreslår fria bildkandidater till händelser utan bild (#2119).')
    ap.add_argument('--period', help='år FRÅN-TILL (astronomiska år), till exempel 1000-1347')
    ap.add_argument('--region', choices=REGIONER + [r.lower() for r in REGIONER], help='världsdel')
    ap.add_argument('--id', action='append', default=[], help='händelse-id (kan upprepas)')
    ap.add_argument('--limit', type=int, help='högst så här många händelser')
    ap.add_argument('--exclude-saknas', action='store_true',
                    help='hoppa över id som står i docs/bilder-saknas.md (redan prövade)')
    ap.add_argument('--offline', action='store_true', help='bara cachen, inget nätverk')
    ap.add_argument('--cache-dir', help=f'cachekatalog (standard {cache_katalog()})')
    ap.add_argument('--ut', default=str(UTKAST), help='utdatamapp (standard data/utkast/bildkandidater/, en fil per världsdel och period)')
    ap.add_argument('--sammanfattning', help='skriv antal händelser med/utan kandidater och ej hämtade som JSON hit')
    ap.add_argument('--handelser', default=str(ROOT / 'data' / 'handelser'), help=argparse.SUPPRESS)
    a = ap.parse_args(argv)
    try:
        period = tolka_period(a.period) if a.period else None
    except ValueError as e:
        ap.error(str(e))
    handelser = valj(las_handelser(a.handelser), period=period, region=a.region, ids=a.id, limit=a.limit,
                     exkludera=saknade_id() if a.exclude_saknas else None,
                     region_av=region_funktion() if a.region else None)
    if not handelser:
        print('Inga händelser utan bild matchade urvalet.', file=sys.stderr)
        if a.sammanfattning:
            Path(a.sammanfattning).write_text(json.dumps(sammanfatta({})) + '\n', encoding='utf-8')
        return 0
    klient = klient or Klient(cache_dir=a.cache_dir or cache_katalog(), offline=a.offline)
    print(f'{len(handelser)} händelser utan bild valda.', file=sys.stderr)
    urval = ' '.join(x for x in (f'period={a.period}' if a.period else '', f'region={a.region}' if a.region else '',
                                 f'id={",".join(a.id)}' if a.id else '', f'limit={a.limit}' if a.limit else '') if x)
    poster, doc = kor_och_spara(handelser, klient, a.ut, urval or 'alla')
    if a.sammanfattning:
        Path(a.sammanfattning).write_text(json.dumps(sammanfatta(poster)) + '\n', encoding='utf-8')
    g = doc['generated']
    print(f'Skrev {", ".join(doc["filer"])} i {a.ut}: {len(poster)} händelser i den här körningen, {g["kandidater"]} kandidater i de '
          f'filerna ({g["troliga"]} troliga, {g["flaggade"]} flaggade, {g["avvisade"]} avvisade, {g["smala"]} smalare än {MIN_BREDD} px), '
          f'{sum(1 for p in poster.values() if "ej_hamtad" in p)} ej hämtade. '
          f'{klient.anrop} nätverksanrop.', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
