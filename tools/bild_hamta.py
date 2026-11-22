#!/usr/bin/env python3
"""Hämtar metadata för riktiga bilder, kontrollerar licensen och bygger webp, källpost och image-fält (#2118).

Indata är Commons-filer (File:Namn.jpg eller filsidans adress) och/eller LoC-poster
(https://www.loc.gov/item/<id>/), var och en med ett händelse-id:

    python3 tools/bild_hamta.py --map "File:Namn.jpg=slaget-vid-x" --map https://www.loc.gov/item/2004668148/=kairo-grundas
    python3 tools/bild_hamta.py --lista bilder.txt        # en rad per bild: referens, tabb, händelse-id

Verktyget gör bara det mekaniska: metadata i batch (Commons API, högst 50 filer per anrop, licensmallen
via action=raw, LoC via ?fo=json), licenskontroll, miniatyr i 960 px och konvertering till
images/events/<händelse-id>.webp (800 × 600, helst under 150 kB, samma beskärning som tools/bilder_in.py),
och utkast till en källpost för data/sources.json och ett image-fält. Det väljer aldrig bild åt någon,
genererar inga bilder och påstår inget om motivet: bildtexten har en [TODO]-markör där människan skriver
vad bilden visar (bara det filsidan stöder), och verktyget lägger bara till fasta licensfraser på de fem språken.
Det ändrar aldrig data/ eller några andra filer, bara webp-filen (och cachen utanför repot).

Anropsregler (docs/bilder-riktiga.md): beskrivande User-Agent utan personuppgifter, Retry-After respekteras
(men aldrig längre än --max-vanta sekunder), exponentiell väntan annars, högst tre försök per begäran och
ett tidstak per bild; sedan "ej hämtad" och vidare till nästa bild. Svaren cachas i ~/.cache/historia-globen/bild_hamta
(eller --cache-dir).

Licenskontroll: godkänner bara public domain, CC0, CC BY, CC BY-SA och LoC "No known restrictions on publication".
Allt annat avvisas (NC, ND, GFDL ensamt, fair use) och flerlicens- och motstridiga fall flaggas med ett utkast till
`note`. Flaggade och avvisade bilder konverteras inte.

Flaggor: --dry-run (hämtar metadata och kontrollerar licensen men laddar inte ner bilden och skriver ingen
fil; cachen används som vanligt), --out (mapp för webp, standard images/events), --json (allt som JSON
på stdout), --cache-dir, --ingen-cache, --skriv-over, --okand fotograf|konstnar.

Kräver Pillow för konverteringen (som tools/bilder_in.py). Avslutas med 0 när alla bilder blev klara, annars 1.
"""
import argparse
import hashlib
import html
import importlib.util
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from email.utils import parsedate_to_datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from licens_commons import (  # noqa: E402  (en gemensam licensklassning, #2183)
    AVVISADE, TILLATNA, VARNINGSMALLAR, bedom_commons, klassa_mall, klassa_namn, licensmallar)

ROOT = Path(__file__).resolve().parent.parent
USER_AGENT = 'HistoriaGlobenBildverktyg/1.0 (hobbyprojekt med oppen kallkod; tools/bild_hamta.py)'
COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
COMMONS_INDEX = 'https://commons.wikimedia.org/w/index.php'
BATCH = 50
MINIATYR_BREDD = 960
MAX_FORSOK = 3
MAX_VANTA = 60       # sekunder: längsta väntan på Retry-After
TIDSTAK = 180        # sekunder per bild (och per batchanrop), omförsök inräknade
TIMEOUT = 30         # sekunder per anrop
MAX_BYTES_HAMTAD = 30_000_000
TILLATNA_VARDAR = {'commons.wikimedia.org', 'upload.wikimedia.org', 'thumb.wikimedia.org', 'www.loc.gov', 'tile.loc.gov'}
# Händelse-id blir ett filnamn (images/events/<id>.webp): gemener, siffror och bindestreck, även å, ä, ö och andra latinska
# bokstäver med accent (vapenstilleståndet-i-korea, #2182), men aldrig snedstreck, punkt eller mellanslag.
ID_RE = re.compile(r'^[a-z0-9\u00df-\u00f6\u00f8-\u00ff]+(?:-[a-z0-9\u00df-\u00f6\u00f8-\u00ff]+)*$')
HANDELSER = ROOT / 'data' / 'handelser'


def licens_commons_modul():
    """tools/licens_commons.py (för prov och andra verktyg som vill nå hela licensmodulen)."""
    import licens_commons
    return licens_commons


def kanda_id(mapp=HANDELSER):
    """Alla händelse-id i data/handelser/, eller None om mappen saknas (då prövas bara mönstret)."""
    mapp = Path(mapp)
    if not mapp.is_dir():
        return None
    ids = set()
    for f in sorted(mapp.glob('*.json')):
        try:
            ids.update(e['id'] for e in json.loads(f.read_text(encoding='utf-8')).get('events', []))
        except (OSError, ValueError, KeyError):
            continue
    return ids
MOTIV_TODO = '[TODO: vad bilden visar, bara det källan stöder]'
SPRAK = ('sv', 'en', 'de', 'es', 'fr')
NBSP = ' '

LICENSORD = {'sv': 'Licens', 'en': 'Licence', 'de': 'Lizenz', 'es': 'Licencia', 'fr': 'Licence' + NBSP}
# Följer den vanligaste formen i befintliga bildtexter per språk (räknat 2026-11-20 i data/handelser/: sv 161 mot 2, en 139 mot 23,
# es 75, fr 40 mot 29). Tyskan avviker med flit: 'gemeinfrei' är den rätta tyska formen (sprak-de) och används i de senaste bildomgångarna;
# äldre tyska bildtexter blandar formerna (73 'Public domain', 38 'gemeinfrei') och ska jämnas ut senare. Fältet license ('Public domain') är inte bildtext.
PD_FRAS = {'sv': 'Public domain', 'en': 'Public domain', 'de': 'gemeinfrei', 'es': 'dominio público', 'fr': 'domaine public'}
LOC_FRAS = {
    'sv': 'Library of Congress anger inga kända restriktioner för publicering.',
    'en': 'The Library of Congress states no known restrictions on publication.',
    'de': 'Die Library of Congress gibt keine bekannten Einschränkungen für die Veröffentlichung an.',
    'es': 'La Library of Congress no indica restricciones conocidas para su publicación.',
    'fr': 'La Library of Congress n’indique aucune restriction connue de publication.',
}
# credit är en enspråkig svensk sträng i datat (#2054 gör den språkbar): bara 'sv' används i image-fält nu. en/de/es/fr finns för #2054.
OKAND = {
    'fotograf': {'sv': 'Okänd fotograf', 'en': 'Unknown photographer', 'de': 'Unbekannter Fotograf',
                 'es': 'Fotógrafo desconocido', 'fr': 'Photographe inconnu'},
    'konstnar': {'sv': 'Okänd konstnär', 'en': 'Unknown artist', 'de': 'Unbekannter Künstler',
                 'es': 'Artista desconocido', 'fr': 'Artiste inconnu'},
}
OKAND_TEXTER = {'unknown', 'unknown author', 'unknown photographer', 'unknown artist', 'anonymous', 'anonym', 'unbekannt',
                'unknown illustrator', 'unknown painter', 'unknown engraver', 'unknown author unknown author',
                'okänd', 'not stated', 'author unknown', 'unknown creator', 'anon.', 'anon'}
LOC_LICENS = 'Inga kända restriktioner (Library of Congress)'
LOC_KALLLICENS = 'No known restrictions on publication'


class EjHamtad(Exception):
    """En begäran gav inte ett svar efter högst tre försök (eller tidstaket nåddes)."""


# ---------------------------------------------------------------- nätverk

def urllib_transport(url, headers, timeout):
    """(status, svarshuvuden med små bokstäver, kropp). Nätfel kastas som OSError."""
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read(MAX_BYTES_HAMTAD + 1)
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in (e.headers or {}).items()}, b''


def retry_after(varde, nu=None):
    """Sekunder ur ett Retry-After-huvud (heltal eller HTTP-datum), eller None."""
    if varde is None:
        return None
    varde = str(varde).strip()
    if re.fullmatch(r'\d+', varde):
        return int(varde)
    try:
        dt = parsedate_to_datetime(varde)
    except (TypeError, ValueError):
        return None
    nu = nu if nu is not None else time.time()
    return max(0, int(dt.timestamp() - nu))


class Klient:
    """Hämtar adresser med cache, User-Agent, Retry-After och högst tre försök. Transport, sömn och klocka kan bytas i prov."""

    def __init__(self, cache_dir=None, transport=urllib_transport, sleep=time.sleep, klocka=time.monotonic,
                 max_forsok=MAX_FORSOK, max_vanta=MAX_VANTA, tidstak=TIDSTAK, timeout=TIMEOUT):
        self.cache_dir = Path(cache_dir) if cache_dir else None
        self.transport, self.sleep, self.klocka = transport, sleep, klocka
        self.max_forsok, self.max_vanta, self.tidstak, self.timeout = max_forsok, max_vanta, tidstak, timeout
        self.anrop = 0

    def _cache_fil(self, url):
        return self.cache_dir / (hashlib.sha256(url.encode('utf-8')).hexdigest() + '.bin') if self.cache_dir else None

    def hamta(self, url, deadline=None):
        host = urllib.parse.urlsplit(url).hostname
        if not url.startswith('https://') or host not in TILLATNA_VARDAR:
            raise EjHamtad(f'adressen ligger inte på en tillåten värd: {host}')
        cf = self._cache_fil(url)
        if cf is not None and cf.exists():
            return cf.read_bytes()
        deadline = deadline if deadline is not None else self.klocka() + self.tidstak
        headers = {'User-Agent': USER_AGENT, 'Accept-Encoding': 'identity'}
        fel = 'inget svar'
        for forsok in range(1, self.max_forsok + 1):
            self.anrop += 1
            vanta = None
            try:
                status, huvud, body = self.transport(url, headers, self.timeout)
                huvud = {str(k).lower(): v for k, v in (huvud or {}).items()}
            except (OSError, TimeoutError) as e:
                status, huvud, body = None, {}, b''
                fel = f'nätfel ({type(e).__name__})'
            else:
                if status == 200:
                    if len(body) > MAX_BYTES_HAMTAD:
                        raise EjHamtad('svaret är större än 30 MB')
                    if cf is not None:
                        cf.parent.mkdir(parents=True, exist_ok=True)
                        tmp = cf.with_suffix('.tmp')
                        tmp.write_bytes(body)
                        os.replace(tmp, cf)
                    return body
                fel = f'HTTP {status}'
                if status not in (429, 503) and status < 500:
                    raise EjHamtad(fel)  # 404, 403 med flera: ingen mening att försöka igen
                vanta = retry_after(huvud.get('retry-after'))
            if forsok == self.max_forsok:
                break
            if vanta is None:
                vanta = 2 ** forsok
            elif vanta > self.max_vanta:
                raise EjHamtad(f'{fel}, Retry-After {vanta} s är över taket {self.max_vanta} s')
            if self.klocka() + vanta > deadline:
                raise EjHamtad(f'{fel}, tidstaket nåddes')
            self.sleep(vanta)
        raise EjHamtad(f'{fel} efter {self.max_forsok} försök')


# ---------------------------------------------------------------- indata

def commons_titel(ref):
    """Filens titel som API:et skriver den ('File:Namn med mellanslag.jpg'), eller None om ref inte är en Commons-fil."""
    ref = ref.strip()
    m = re.match(r'https?://commons\.wikimedia\.org/wiki/(.+)$', ref)
    if m:
        ref = urllib.parse.unquote(m.group(1).split('#')[0])
    m = re.match(r'(?i)^(?:file|fil):(.+)$', ref)
    if not m:
        return None
    return 'File:' + m.group(1).replace('_', ' ').strip()


def loc_id(ref):
    m = re.search(r'loc\.gov/item/([^/?#\s]+)', ref.strip())
    return m.group(1) if m else None


def parse_indata(refs, mappning):
    """Poster {ref, kalla, nyckel, id} ur referenslistan. mappning: {referens: händelse-id}."""
    norm = {}
    for k, v in mappning.items():
        t = commons_titel(k)
        norm[t or ('loc:' + (loc_id(k) or k))] = v
    poster = []
    for ref in refs:
        t, lid = commons_titel(ref), loc_id(ref)
        if t:
            kalla, nyckel = 'commons', t
        elif lid:
            kalla, nyckel = 'loc', lid
        else:
            poster.append({'ref': ref, 'kalla': None, 'nyckel': None, 'id': None})
            continue
        poster.append({'ref': ref, 'kalla': kalla, 'nyckel': nyckel, 'id': norm.get(t or ('loc:' + lid))})
    return poster


def las_lista(path, val=None):
    """Rader med referens och valfritt händelse-id efter en tabb. En rad som börjar med # är en kommentar.
    En tredje kolumn `passa-in` (#2193) passar in hela bilden i 800 × 600 i stället för att beskära till 4:3
    (stående dokument och kartor); referensen läggs då i mängden `val` om den ges."""
    refs, mappning = [], {}
    for rad in Path(path).read_text(encoding='utf-8').splitlines():
        rad = rad.strip()
        if not rad or rad.startswith('#'):
            continue
        delar = [d.strip() for d in rad.split('\t')]
        ref = delar[0]
        refs.append(ref)
        if len(delar) > 1 and delar[1]:
            mappning[ref] = delar[1]
        if val is not None and len(delar) > 2 and delar[2] == 'passa-in':
            val.add(ref)
    return refs, mappning


def rensa_html(text):
    t = html.unescape(re.sub(r'<[^>]+>', ' ', text or ''))
    return re.sub(r'\s+', ' ', t).strip()


def ext_varde(ext, nyckel):
    """Ren text ur extmetadata. Commons skriver ibland namnet två gånger (en länk och en reservtext, till exempel
    'Unknown illustrator Unknown illustrator'); då behålls det en gång (#2193)."""
    t = rensa_html((ext.get(nyckel) or {}).get('value'))
    m = re.fullmatch(r'(.+?)\s+\1', t)
    return m.group(1) if m else t


# ---------------------------------------------------------------- Commons

def commons_url(titlar):
    q = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'formatversion': '2', 'redirects': '1', 'prop': 'imageinfo',
        'iiprop': 'url|size|extmetadata|mime', 'iiurlwidth': str(MINIATYR_BREDD), 'titles': '|'.join(titlar)})
    return COMMONS_API + '?' + q


def tolka_commons_svar(data, titlar):
    """API-svaret → {begärd titel: sida eller None}. Följer normalized och redirects."""
    q = data.get('query') or {}
    pages = {p.get('title'): p for p in q.get('pages', [])}
    byte = {}
    for lista in (q.get('normalized', []), q.get('redirects', [])):
        for r in lista:
            byte[r['from']] = r['to']
    ut = {}
    for t in titlar:
        mal = t
        for _ in range(5):
            if mal in byte:
                mal = byte[mal]
        sida = pages.get(mal)
        ut[t] = sida if sida and 'missing' not in sida and sida.get('imageinfo') else None
    return ut


def commons_batch(klient, titlar):
    """{titel: ('ok', sida) | ('saknas', None) | ('ej hämtad', orsak)} i batchar om högst 50."""
    ut = {}
    unika = list(dict.fromkeys(titlar))
    for i in range(0, len(unika), BATCH):
        grupp = unika[i:i + BATCH]
        try:
            data = json.loads(klient.hamta(commons_url(grupp)).decode('utf-8'))
        except EjHamtad as e:
            for t in grupp:
                ut[t] = ('ej hämtad', str(e))
            continue
        except ValueError:
            for t in grupp:
                ut[t] = ('ej hämtad', 'svaret var inte JSON')
            continue
        if 'error' in data:
            for t in grupp:
                ut[t] = ('ej hämtad', 'API-fel: ' + str(data['error'].get('code')))
            continue
        for t, sida in tolka_commons_svar(data, grupp).items():
            ut[t] = ('ok', sida) if sida else ('saknas', None)
    return ut


def commons_raw(klient, titel, deadline=None):
    url = COMMONS_INDEX + '?' + urllib.parse.urlencode({'title': titel, 'action': 'raw'})
    return klient.hamta(url, deadline).decode('utf-8', 'replace')


def kreditrad(artist, okand, kalla):
    """Upphovsuppgiften som en rad: 'Namn / Wikimedia Commons'. Saknas namnet: den fasta frasen om --okand, annars en TODO."""
    todo = []
    if not artist or artist.lower().strip(' .') in OKAND_TEXTER:
        if okand:
            namn = OKAND[okand]['sv']
        else:
            namn = 'TODO: upphovsperson (skriv Okänd fotograf eller Okänd konstnär om filsidan säger det)'
            todo.append('credit: upphovsperson saknas i metadata')
    else:
        namn = artist
    return f'{namn} / {kalla}', todo


def licensfras(klass_etikett, kalla_typ, sprak):
    """Den fasta licensfrasen i bildtexten. Public domain och CC får 'Licens: …', LoC en egen mening."""
    if kalla_typ == 'loc':
        return LOC_FRAS[sprak]
    ord_ = LICENSORD[sprak]
    varde = PD_FRAS[sprak] if klass_etikett == 'Public domain' else klass_etikett
    return f'{ord_}: {varde}.'


def bildtext_utkast(etikett, kalla_typ):
    return {s: f'{MOTIV_TODO} {licensfras(etikett, kalla_typ, s)}' for s in SPRAK}


def image_fält(eid, etikett, kalla_typ, source_id, credit):
    return {'file': f'images/events/{eid}.webp', 'kind': 'historisk', 'style': 'TODO',
            'caption': bildtext_utkast(etikett, kalla_typ), 'credit': credit,
            'license': LOC_LICENS if kalla_typ == 'loc' else etikett, 'source': source_id}


def bygg_commons(post, sida, bedomning, okand, idag):
    """Källpost, image-fält och underlag för en Commons-fil. Rent: ingen I/O."""
    info = sida['imageinfo'][0]
    ext = info.get('extmetadata') or {}
    eid = post['id'] or '<händelse-id>'
    filnamn = re.sub(r'\.[A-Za-z0-9]+$', '', sida['title'].split(':', 1)[1])
    artist = ext_varde(ext, 'Artist')
    credit, todo = kreditrad(artist, okand, 'Wikimedia Commons')
    titel = filnamn + (f' – {artist}' if artist and len(artist) <= 80 and artist.lower() not in OKAND_TEXTER else '') + ' (Wikimedia Commons, filsida)'
    kalla = {'id': f'commons-bild-{eid}', 'title': titel, 'url': info.get('descriptionurl') or 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(sida['title'].replace(' ', '_')),
             'license': bedomning['licens'] or '', 'checked': idag}
    if bedomning['note']:
        kalla['note'] = bedomning['note']
    underlag = {'filsida': kalla['url'], 'titel': filnamn, 'upphovsperson': artist, 'credit_rad_i_metadata': ext_varde(ext, 'Credit'),
                'datum': ext_varde(ext, 'DateTimeOriginal'), 'beskrivning_i_metadata': ext_varde(ext, 'ImageDescription'),
                'mime': info.get('mime'), 'bredd': info.get('width'), 'hojd': info.get('height'),
                'miniatyr': info.get('thumburl') or info.get('url'), 'licens_api': bedomning['api'], 'licensmallar': bedomning['mallar']}
    image = image_fält(eid, bedomning['licens'], 'commons', kalla['id'], credit) if bedomning['licens'] else None
    return kalla, image, underlag, todo


# ---------------------------------------------------------------- Library of Congress

def loc_url(lid):
    return f'https://www.loc.gov/item/{lid}/?fo=json'


def _text(v):
    if isinstance(v, list):
        return ' '.join(str(x) for x in v if x)
    return str(v or '')


def _loc_filer(data):
    """JPEG-filer {url, w, h} ur första resursen; annars ur item.image_url."""
    ut = []
    res = (data.get('resources') or [{}])[0]
    for grupp in res.get('files') or []:
        for f in grupp if isinstance(grupp, list) else [grupp]:
            if f.get('mimetype') == 'image/jpeg' and f.get('width') and f.get('height'):
                ut.append({'url': f['url'], 'w': f['width'], 'h': f['height']})
    if not ut:
        for u in (data.get('item') or {}).get('image_url') or []:
            m = re.search(r'#h=(\d+)&w=(\d+)$', u)
            if m and u.split('#')[0].lower().endswith(('.jpg', '.jpeg')):
                ut.append({'url': u.split('#')[0], 'w': int(m.group(2)), 'h': int(m.group(1))})
    return ut


def valj_loc_fil(filer):
    """Minsta JPEG med längsta sida ≥ 960 px, annars den största. None om det inte finns någon."""
    if not filer:
        return None
    stora = sorted((f for f in filer if max(f['w'], f['h']) >= MINIATYR_BREDD), key=lambda f: f['w'] * f['h'])
    return stora[0] if stora else max(filer, key=lambda f: f['w'] * f['h'])


def bedom_loc(item):
    text = (_text(item.get('rights_advisory')) or _text(item.get('rights_information'))).strip()
    if re.search(r'no known restrictions on publication', text, re.I):
        return {'status': 'godkand', 'licens': LOC_KALLLICENS, 'skal': [], 'text': text}
    skal = f'rättighetstexten säger inte "No known restrictions on publication": "{text[:200] or "saknas"}"'
    return {'status': 'flagga', 'licens': None, 'skal': [skal], 'text': text}


def bygg_loc(post, data, okand, idag):
    item = data.get('item') or {}
    lid = post['nyckel']
    eid = post['id'] or '<händelse-id>'
    bed = bedom_loc(item)
    titel = _text(item.get('title')).strip().rstrip('. ')
    kontrib = [c for c in (item.get('contributor_names') or []) if c]
    credit_namn = '; '.join(kontrib)
    todo = []
    if not credit_namn:
        credit_namn = OKAND[okand]['sv'] if okand else 'TODO: upphovsperson (katalogposten anger ingen)'
        if not okand:
            todo.append('credit: upphovsperson saknas i katalogposten')
    credit = f'{credit_namn} / Library of Congress'
    rights = re.split(r' For general information', bed['text'])[0].strip()
    delar = [f'Katalogposten (öppnad som https://www.loc.gov/item/{lid}/?fo=json {idag})']
    detaljer = '; '.join(x for x in [credit_namn if kontrib else '', _text(item.get('created_published')),
                                      _text(item.get('call_number')), _text(item.get('reproduction_number')).replace('\n', ', ')] if x)
    note = delar[0] + (f': {detaljer}.' if detaljer else '.') + (f' Rättighetstexten: "{rights}"' if rights else '')
    kalla = {'id': f'loc-bild-{eid}', 'title': f'{titel} (Library of Congress)', 'url': f'https://www.loc.gov/item/{lid}/',
             'license': bed['licens'] or '', 'checked': idag, 'note': note}
    underlag = {'katalogpost': kalla['url'], 'titel': titel, 'upphovsperson': kontrib, 'datum': _text(item.get('date')),
                'skapad_publicerad': _text(item.get('created_published')), 'reproduktionsnummer': _text(item.get('reproduction_number')),
                'rattighetstext': bed['text']}
    image = image_fält(eid, None, 'loc', kalla['id'], credit) if bed['licens'] else None
    return kalla, image, underlag, todo, bed


# ---------------------------------------------------------------- bild

def _bilder_in():
    spec = importlib.util.spec_from_file_location('bilder_in', Path(__file__).with_name('bilder_in.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def passa_in(src, dst, bi):
    """Hela bilden inpassad i 800 × 600 på en kant i bildens egen kantfärg (medianen av ytterkanten), utan beskärning (#2193)."""
    from PIL import Image, ImageStat
    img = Image.open(src)
    if img.mode in ('RGBA', 'LA', 'P') and ('A' in img.mode or 'transparency' in img.info):
        # Genomskinlig bild (till exempel en SVG-karta som PNG): lägg den på vitt, annars blir bakgrunden svart (#2193)
        rgba = img.convert('RGBA')
        vit = Image.new('RGBA', rgba.size, (255, 255, 255, 255))
        img = Image.alpha_composite(vit, rgba)
    img = img.convert('RGB')
    w, h = img.size
    kant = Image.new('RGB', (w * 2 + h * 2, 1))
    for i, px in enumerate(list(img.crop((0, 0, w, 1)).getdata()) + list(img.crop((0, h - 1, w, h)).getdata())
                           + list(img.crop((0, 0, 1, h)).getdata()) + list(img.crop((w - 1, 0, w, h)).getdata())):
        kant.putpixel((i, 0), px)
    farg = tuple(int(v) for v in ImageStat.Stat(kant).median)
    skala = min(bi.W / w, bi.H / h)
    ny = img.resize((max(1, round(w * skala)), max(1, round(h * skala))), Image.LANCZOS)
    duk = Image.new('RGB', (bi.W, bi.H), farg)
    duk.paste(ny, ((bi.W - ny.width) // 2, (bi.H - ny.height) // 2))
    for q in (82, 75, 68, 60, 52, 45):
        duk.save(dst, 'WEBP', quality=q, method=6)
        if Path(dst).stat().st_size <= bi.MAX_BYTES:
            break
    return Path(dst).stat().st_size


def konvertera(data, dst, cache_dir=None, passa=False):
    """Bildbytes → 800 × 600 webp med bilder_in.convert (samma beskärning), eller hela bilden inpassad (passa=True).
    Returnerar (bytes, varningar)."""
    try:
        from PIL import Image
        import io
        bi = _bilder_in()
    except ImportError as e:
        raise RuntimeError('Pillow saknas (pip install pillow)') from e
    varningar = []
    try:
        with Image.open(io.BytesIO(data)) as im:
            w, h = im.size
    except Exception as e:  # Pillow kastar flera olika fel för trasiga bilder
        raise RuntimeError(f'bilden gick inte att läsa: {e}') from e
    if w < bi.W or h < bi.H:
        varningar.append(f'liten källbild ({w} × {h} px): bilden förstoras till {bi.W} × {bi.H}')
    dst = Path(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=cache_dir if cache_dir and Path(cache_dir).is_dir() else None) as tmp:
        src = Path(tmp) / 'kalla.img'
        src.write_bytes(data)
        storlek = passa_in(src, dst, bi) if passa else bi.convert(src, dst)
    if storlek > bi.MAX_BYTES:
        varningar.append(f'webp-filen är {storlek // 1000} kB, över {bi.MAX_BYTES // 1000} kB')
    return storlek, varningar


# ---------------------------------------------------------------- körning

def kor(poster, klient, out_dir, dry_run=False, okand=None, skriv_over=False, idag=None, klocka=time.monotonic, kanda=None,
        passa=None):
    """Kör alla poster. Varje resultat: status klar | flaggad | avvisad | ej hämtad | saknas | fel | hoppad."""
    idag = idag or date.today().isoformat()
    resultat = []
    commons = [p for p in poster if p['kalla'] == 'commons']
    meta = commons_batch(klient, [p['nyckel'] for p in commons]) if commons else {}
    for p in poster:
        r = {'ref': p['ref'], 'kalla': p['kalla'], 'handelse': p['id'], 'status': None, 'skal': [], 'todo': [], 'underlag': None,
             'sources_post': None, 'image': None, 'bildlogg_post': None, 'webp': None}
        resultat.append(r)
        if p['kalla'] is None:
            r['status'], r['skal'] = 'fel', ['okänd referens: ge File:Namn.jpg, en commons.wikimedia.org/wiki/File:-adress eller https://www.loc.gov/item/<id>/']
            continue
        if p['id'] is None:
            r['todo'].append('händelse-id saknas (--map referens=händelse-id): ingen fil skrivs, källpostens id blir <händelse-id>')
        elif not ID_RE.match(p['id']):
            r['status'], r['skal'] = 'fel', [f'ogiltigt händelse-id: {p["id"]}']
            continue
        elif kanda is not None and p['id'] not in kanda:
            r['todo'].append(f'händelse-id:t {p["id"]} finns inte i data/handelser/: kontrollera stavningen')
        deadline = klocka() + klient.tidstak
        thumb = None
        try:
            if p['kalla'] == 'commons':
                st, sida = meta[p['nyckel']]
                if st == 'ej hämtad':
                    r['status'], r['skal'] = 'ej hämtad', [sida]
                    continue
                if st == 'saknas':
                    r['status'], r['skal'] = 'saknas', ['filen finns inte på Commons (kontrollera stavningen)']
                    continue
                info = sida['imageinfo'][0]
                ext = info.get('extmetadata') or {}
                api_klass = klassa_namn((ext.get('LicenseShortName') or {}).get('value'))
                if not str(info.get('mime', '')).startswith('image/'):
                    r['status'], r['skal'] = 'flaggad', [f'filtypen är {info.get("mime")}, inte en bild']
                    continue
                wikitext = None
                if not (api_klass and api_klass[0] in AVVISADE):
                    try:
                        wikitext = commons_raw(klient, sida['title'], deadline)
                    except EjHamtad as e:
                        r['todo'].append(f'licensmallen (action=raw) ej hämtad: {e}')
                bed = bedom_commons(ext, wikitext, idag)
                kalla, image, underlag, todo = bygg_commons(p, sida, bed, okand, idag)
                thumb = info.get('thumburl') or info.get('url')
            else:
                try:
                    data = json.loads(klient.hamta(loc_url(p['nyckel']), deadline).decode('utf-8'))
                except ValueError:
                    r['status'], r['skal'] = 'ej hämtad', ['LoC svarade inte med JSON']
                    continue
                if not data.get('item'):
                    r['status'], r['skal'] = 'saknas', ['posten finns inte hos LoC (inget item i svaret)']
                    continue
                kalla, image, underlag, todo, bed = bygg_loc(p, data, okand, idag)
                filer = _loc_filer(data)
                fil = valj_loc_fil(filer)
                thumb = fil['url'] if fil else None
                if fil and max(fil['w'], fil['h']) < MINIATYR_BREDD:
                    r['todo'].append(f'källan har som störst {fil["w"]} × {fil["h"]} px (under {MINIATYR_BREDD} px)')
                if len(data.get('resources') or []) > 1:
                    r['todo'].append(f'posten har {len(data["resources"])} resurser; den första används')
                if thumb is None:
                    bed = dict(bed, status='flagga', skal=bed['skal'] + ['ingen JPEG-fil hittades i posten'])
        except EjHamtad as e:
            r['status'], r['skal'] = 'ej hämtad', [str(e)]
            continue
        r['skal'] += bed['skal']
        r['todo'] += todo
        r['underlag'] = underlag
        r['sources_post'] = kalla if kalla['license'] else None  # ingen källpost för en bild utan godtagbar licens
        r['image'] = image
        if image:
            r['bildlogg_post'] = {k: image[k] for k in ('kind', 'style', 'caption', 'credit', 'license', 'source')}
            r['bildlogg_post']['id'] = p['id'] or '<händelse-id>'
        if bed['status'] == 'avvisad':
            r['status'] = 'avvisad'
            continue
        if bed['status'] == 'flagga':
            r['status'] = 'flaggad'
            continue
        if dry_run:
            r['status'] = 'klar'
            r['todo'].append('--dry-run: ingen bild hämtad eller sparad')
            continue
        if p['id'] is None:
            r['status'] = 'klar'
            continue
        dst = Path(out_dir) / f'{p["id"]}.webp'
        if dst.exists() and not skriv_over:
            r['status'], r['skal'] = 'hoppad', r['skal'] + [f'{dst} finns redan (--skriv-over ersätter den)']
            continue
        try:
            bild = klient.hamta(thumb, deadline)
        except EjHamtad as e:
            r['status'], r['skal'] = 'ej hämtad', r['skal'] + [f'miniatyren: {e}']
            continue
        try:
            storlek, varn = konvertera(bild, dst, klient.cache_dir, passa=p['ref'] in (passa or ()))
        except RuntimeError as e:
            r['status'], r['skal'] = 'fel', r['skal'] + [str(e)]
            continue
        r['todo'] += varn
        r['webp'] = {'fil': str(dst), 'bytes': storlek}
        r['status'] = 'klar'
    for r in resultat:
        for nyckel in ('image', 'sources_post'):
            if r[nyckel] and 'TODO' in json.dumps(r[nyckel], ensure_ascii=False):
                r['todo'].append(f'{nyckel} innehåller TODO: fyll i före incheckning')
    return resultat


def skriv_ej_hamtade(fil, resultat, passa=()):
    """De bilder som blev "ej hämtad" (till exempel 429 med Retry-After över taket) som en --lista-fil, så att en senare
    körning, för hand eller i Actions, kan ta dem utan att någon väljer om. Skriver ingen fil om inget saknas."""
    rader = [f'{r["ref"]}\t{r["handelse"] or ""}' + ('\tpassa-in' if r['ref'] in passa else '')
             for r in resultat if r['status'] == 'ej hämtad']
    if rader:
        Path(fil).write_text('# Ej hämtade av tools/bild_hamta.py; kör igen med --lista\n' + '\n'.join(rader) + '\n', encoding='utf-8')
    return len(rader)


def skriv_rapport(resultat, ut=None):
    def p(*a):
        print(*a, file=ut or sys.stdout)
    for r in resultat:
        p(f'== {r["ref"]} -> {r["handelse"] or "(händelse-id saknas)"}: {r["status"].upper()}')
        for s in r['skal']:
            p(f'  - {s}')
        for t in dict.fromkeys(r['todo']):
            p(f'  * {t}')
        if r['underlag']:
            p('  Underlag (för människan, används inte i bildtexten):')
            for k, v in r['underlag'].items():
                if v:
                    p(f'    {k}: {v}')
        if r['webp']:
            p(f'  webp: {r["webp"]["fil"]} ({r["webp"]["bytes"] // 1000} kB)')
        if r['sources_post']:
            p('  Post för data/sources.json:')
            p(json.dumps(r['sources_post'], ensure_ascii=False, indent=2))
        if r['image']:
            p('  Fältet image för händelsen (style och bildtexten fylls i av människan):')
            p(json.dumps(r['image'], ensure_ascii=False, indent=2))
    klara = [r for r in resultat if r['status'] == 'klar']
    p(f'\n{len(klara)} av {len(resultat)} klara; övriga: ' + (', '.join(f'{r["ref"]} ({r["status"]})' for r in resultat if r['status'] != 'klar') or 'inga') + '.')
    if klara:
        p('Nästa steg: lägg källposterna i data/sources.json, lägg image i händelsen i data/handelser/<period>.json '
          '(eller bildlogg_post med --json och tools/bilder_in.py), skriv bildtexten, kör python3 tools/dela_data.py, '
          'tools/oversattning.py och tools/license_manifests.py (docs/bilder-riktiga.md).')


def main(argv=None):
    ap = argparse.ArgumentParser(description='Hämtar metadata och bygger webp, källpost och image-fält för riktiga bilder (#2118).')
    ap.add_argument('refs', nargs='*', help='File:Namn.jpg, filsidans adress eller https://www.loc.gov/item/<id>/')
    ap.add_argument('--map', action='append', default=[], metavar='REF=HÄNDELSE-ID', help='händelse-id för en referens (upprepas)')
    ap.add_argument('--lista', help='fil med en referens per rad, valfritt tabb och händelse-id')
    ap.add_argument('--out', default=str(ROOT / 'images' / 'events'), help='mapp för webp-filerna')
    ap.add_argument('--dry-run', action='store_true', help='kontrollera licens och skriv utkast utan att hämta eller spara bilden')
    ap.add_argument('--json', action='store_true', help='skriv allt som JSON på stdout')
    ap.add_argument('--cache-dir', help='cachemapp (standard ~/.cache/historia-globen/bild_hamta)')
    ap.add_argument('--ingen-cache', action='store_true')
    ap.add_argument('--skriv-over', action='store_true', help='ersätt en befintlig webp-fil')
    ap.add_argument('--okand', choices=sorted(OKAND), help='sätt fasta frasen Okänd fotograf/konstnär när metadata saknar upphovsperson')
    ap.add_argument('--max-vanta', type=int, default=MAX_VANTA, help='längsta väntan på Retry-After i sekunder')
    ap.add_argument('--tidstak', type=int, default=TIDSTAK,
                    help=f'högst så här många sekunder per bild, omförsök inräknade (standard {TIDSTAK}); arbetsflödet i Actions '
                         'använder ett högre tak, eftersom ingen agent väntar där (#2195)')
    ap.add_argument('--ej-hamtade', metavar='FIL',
                    help='skriv de bilder som blev "ej hämtad" som en --lista-fil, för en senare körning (#2193)')
    a = ap.parse_args(argv)
    refs, mappning, passa = list(a.refs), {}, set()
    if a.lista:
        r2, m2 = las_lista(a.lista, passa)
        refs += r2
        mappning.update(m2)
    for m in a.map:
        ref, _, eid = m.rpartition('=')
        if not ref or not eid:
            ap.error(f'--map ska vara REF=HÄNDELSE-ID: {m}')
        mappning[ref] = eid
        if ref not in refs:
            refs.append(ref)
    if not refs:
        ap.error('ge minst en referens')
    cache = None
    if not a.ingen_cache:
        cache = Path(a.cache_dir) if a.cache_dir else Path(os.environ.get('XDG_CACHE_HOME') or Path.home() / '.cache') / 'historia-globen' / 'bild_hamta'
    klient = Klient(cache_dir=cache, max_vanta=a.max_vanta, tidstak=a.tidstak)
    resultat = kor(parse_indata(refs, mappning), klient, a.out, a.dry_run, a.okand, a.skriv_over, kanda=kanda_id(), passa=passa)
    if a.ej_hamtade:
        skriv_ej_hamtade(a.ej_hamtade, resultat, passa)
    if a.json:
        print(json.dumps(resultat, ensure_ascii=False, indent=2))
    else:
        skriv_rapport(resultat)
    return 0 if all(r['status'] == 'klar' for r in resultat) else 1


if __name__ == '__main__':
    sys.exit(main())
