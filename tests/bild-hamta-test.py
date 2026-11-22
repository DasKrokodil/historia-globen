#!/usr/bin/env python3
"""Prov för tools/bild_hamta.py (#2118) med inspelade svar. Inget nätverk används.

Svaren i tests/fixtures/bild-hamta/ är LoC-postens riktiga ?fo=json (utdrag) och Commons-svar som
följer API:ets form (action=query, formatversion=2, imageinfo med extmetadata) med påhittade filer.
Transporten byts mot en som svarar ur fixturerna eller ur ett manus, så att också 429, Retry-After,
tre försök, nätfel och tidstak går att prova utan väntetid (sömn och klocka är falska).
Webp-delen kräver Pillow och hoppas över utan det.
"""
import io
import json
import re
import sys
import tempfile
import urllib.parse
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parent.parent
FIX = ROOT / 'tests' / 'fixtures' / 'bild-hamta'
spec = importlib.util.spec_from_file_location('bild_hamta', ROOT / 'tools' / 'bild_hamta.py')
bh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bh)

try:
    from PIL import Image, ImageDraw
    PIL_OK = True
except ImportError:
    PIL_OK = False

IDAG = '2026-11-20'
COMMONS = json.loads((FIX / 'commons-batch.json').read_text(encoding='utf-8'))
LOC = (FIX / 'loc-2004668148.json').read_bytes()
WIKITEXT = {'File:Exempel pd.jpg': 'pd', 'File:Exempel ccbysa.jpg': 'ccbysa', 'File:Exempel nc.jpg': 'nc',
            'File:Exempel flerlicens.jpg': 'flerlicens', 'File:Exempel motsagelse.jpg': 'motsagelse',
            'File:Exempel gfdl.jpg': 'gfdl', 'File:Exempel liten.jpg': 'liten'}


def check(cond, msg):
    if not cond:
        raise SystemExit('bild-hamta-test: ' + msg)


def jpeg(w=1600, h=1200):
    g = Image.linear_gradient('L').resize((w, h))
    im = Image.merge('RGB', (g, g.transpose(Image.ROTATE_90).resize((w, h)), g.point(lambda v: 255 - v)))
    ImageDraw.Draw(im).ellipse((w // 4, h // 4, 3 * w // 4, 3 * h // 4), outline=(250, 250, 250), width=6)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=85)
    return buf.getvalue()


class Falsk:
    """Transport som svarar ur fixturerna och räknar anropen."""

    def __init__(self, bild=b'', commons_status=None):
        self.anrop = []
        self.bild = bild
        self.commons_status = commons_status

    def __call__(self, url, headers, timeout):
        self.anrop.append(url)
        check('User-Agent' in headers and '@' not in headers['User-Agent'], 'User-Agent saknas eller innehåller e-post')
        u = urllib.parse.urlsplit(url)
        q = urllib.parse.parse_qs(u.query)
        if u.path == '/w/api.php':
            if self.commons_status:
                return self.commons_status, {}, b''
            titlar = q['titles'][0].split('|')
            check(len(titlar) <= 50, 'fler än 50 titlar i ett anrop')
            check(q['iiurlwidth'] == ['960'] and 'extmetadata' in q['iiprop'][0], 'API-anropet saknar iiurlwidth=960 eller extmetadata')
            return 200, {}, json.dumps(COMMONS).encode()
        if u.path == '/w/index.php':
            check(q['action'] == ['raw'], 'index.php utan action=raw')
            return 200, {}, (FIX / f'wikitext-{WIKITEXT[q["title"][0]]}.txt').read_bytes()
        if u.hostname == 'www.loc.gov':
            return 200, {}, LOC
        if u.hostname in ('upload.wikimedia.org', 'thumb.wikimedia.org', 'tile.loc.gov'):
            return 200, {}, self.bild
        return 404, {}, b''


class Manus:
    """Transport som svarar med en lista: tuple (status, huvud, kropp) eller ett undantag."""

    def __init__(self, *svar):
        self.svar = list(svar)
        self.anrop = 0

    def __call__(self, url, headers, timeout):
        self.anrop += 1
        s = self.svar.pop(0)
        if isinstance(s, Exception):
            raise s
        return s


def klient(transport, cache=None, klocka=None):
    sov = []
    k = bh.Klient(cache_dir=cache, transport=transport, sleep=sov.append, klocka=klocka or (lambda: 0.0))
    return k, sov


def poster(*par):
    return bh.parse_indata([r for r, _ in par], {r: i for r, i in par if i})


def kor(post, transport, out, **kw):
    k, _ = klient(transport)
    return bh.kor(post, k, out, idag=IDAG, **kw)


URL = 'https://commons.wikimedia.org/w/api.php?x=1'


def main():
    # --- indata
    check(bh.commons_titel('File:Exempel_pd.jpg') == 'File:Exempel pd.jpg', 'understreck ska bli mellanslag')
    check(bh.commons_titel('https://commons.wikimedia.org/wiki/File:Exempel_%C3%A5.jpg#x') == 'File:Exempel å.jpg', 'filsidans adress')
    check(bh.commons_titel('https://www.loc.gov/item/2004668148/') is None and bh.loc_id('https://www.loc.gov/item/2004668148/?fo=json') == '2004668148', 'LoC-id')
    p = poster(('File:Exempel_pd.jpg', 'a-b'), ('https://www.loc.gov/item/2004668148/', 'kairo'), ('skräp', None))
    check([x['kalla'] for x in p] == ['commons', 'loc', None] and p[0]['id'] == 'a-b' and p[1]['id'] == 'kairo', 'parse_indata')

    # --- händelse-id (#2182): å, ä och ö går igenom, men aldrig snedstreck, punkt eller versaler
    for eid, forv in [('vapenstilleståndet-i-korea', True), ('a-b', True), ('slaget-vid-lützen', True), ('../x', False),
                      ('a/b', False), ('A-b', False), ('a.b', False), ('-a', False)]:
        check(bool(bh.ID_RE.match(eid)) == forv, f'ID_RE({eid}) ska vara {forv}')
    kanda = bh.kanda_id()
    check(kanda is not None and 'vapenstilleståndet-i-korea' in kanda, 'kanda_id ska läsa id:n ur data/handelser/')

    # --- batch: 51 titlar ger två anrop, normalized, redirects och saknade filer följs
    fals = Falsk()
    k, _ = klient(fals)
    titlar = ['File:Exempel pd.jpg', 'File:Gammalt namn.jpg', 'File:Finns inte.jpg'] + [f'File:Fyllnad {i}.jpg' for i in range(48)]
    svar = bh.commons_batch(k, titlar)
    check(len(fals.anrop) == 2, f'51 titlar ska ge två batchanrop, gav {len(fals.anrop)}')
    check(svar['File:Exempel pd.jpg'][0] == 'ok' and svar['File:Gammalt namn.jpg'][1]['title'] == 'File:Exempel ccbysa.jpg', 'omdirigering följs inte')
    check(svar['File:Finns inte.jpg'][0] == 'saknas', 'saknad fil')
    check(bh.tolka_commons_svar(COMMONS, ['File:Exempel_pd.jpg'])['File:Exempel_pd.jpg']['title'] == 'File:Exempel pd.jpg', 'normalized följs inte')

    # --- licensklassning
    for text, forv in [('CC BY-SA 4.0', 'by-sa'), ('CC BY 2.0', 'by'), ('CC BY 3.0 DE', 'by'), ('Public domain', 'pd'), ('CC0', 'cc0'),
                       ('CC BY-NC 2.0', 'nc'), ('CC BY-NC-SA 3.0', 'nc'), ('CC BY-ND 4.0', 'nc'), ('GFDL', 'gfdl'), ('Fair use', 'fair'), ('Nåt annat', None)]:
        got = bh.klassa_namn(text)
        check((got[0] if got else None) == forv, f'klassa_namn({text}) gav {got}')
    check(bh.klassa_namn('CC BY-SA 3.0,2.5,2.0,1.0')[1] == 'CC BY-SA 3.0' and bh.klassa_namn('CC BY 2.0 de')[1] == 'CC BY 2.0 DE', 'etiketter')
    mall, varn = bh.licensmallar((FIX / 'wikitext-flerlicens.txt').read_text(encoding='utf-8'))
    check({m[1] for m in mall} == {'gfdl', 'by-sa', 'pd'} and varn == ['Personality rights'], f'licensmallar: {mall} {varn}')
    check(bh.licensmallar('{{Information|description={{en|x}}}} {{int:license-header}}')[0] == [], 'beskrivningsmallar ska inte tas för licenser')

    # --- risker som inte stoppar men ska synas (#2193): PD bara i USA, PD-self med annan licens, eget verk av gammal bild,
    # mall om panoramafrihet, versionslös cc-by-sa-all och dubblerat upphovsnamn
    check(bh.klassa_mall('Cc-by-sa-3.0-igo') == ('by-sa', 'CC BY-SA 3.0 IGO') and bh.klassa_namn('CC BY-SA 3.0 IGO') == ('by-sa', 'CC BY-SA 3.0 IGO'),
          'CC BY-SA 3.0 IGO ska kännas igen (fynd i omgången #2104–#2105)')
    r = bh.licensmallar('{{GFDL-user-en|Exempel|migration=relicense}}')[0]
    check(('by-sa', 'CC BY-SA 3.0') in {(m[1], m[2]) for m in r}, f'GFDL med migration=relicense ska ge CC BY-SA 3.0: {r}')
    check(('by-sa', 'CC BY-SA 3.0') not in {(m[1], m[2]) for m in bh.licensmallar('{{GFDL-user-en|Exempel|migration=not-eligible}}')[0]},
          'GFDL utan migrering ska inte bli CC BY-SA')
    r = bh.licensmallar('{{self|GFDL|cc-by-sa-all}}')[0]
    check(('by-sa', 'CC BY-SA') in {(m[1], m[2]) for m in r}, f'cc-by-sa-all ska kännas igen: {r}')
    bed = bh.bedom_commons({'LicenseShortName': {'value': 'CC BY-SA 3.0'}}, '{{self|GFDL|cc-by-sa-all}}', IDAG)
    check(bed['status'] == 'godkand-med-not' and bed['licens'] == 'CC BY-SA 3.0', f'cc-by-sa-all med API-version: {bed}')
    lc = bh.licens_commons_modul()
    check(any('bara i USA' in x for x in lc.risker('{{PD-US-not renewed}}', {}, ['PD-US-not renewed'])), 'PD-US-not renewed ska ge en risk')
    check(any('annan licens' in x for x in lc.risker('{{PD-self}} Permission: Free Art License', {}, ['PD-self'])), 'PD-self med FAL')
    check(any('eget verk' in x for x in lc.risker('', {'Credit': {'value': 'Own work'}, 'DateTimeOriginal': {'value': '1904'}}, ['PD-old-70'])),
          'eget verk av en bild från 1904 ska ge en risk')
    check(lc.risker('{{PD-old-100}}', {'Credit': {'value': 'Own work'}, 'DateTimeOriginal': {'value': '2012-05-01'}}, ['cc-by-sa-4.0']) == [],
          'ett eget foto från 2012 är ingen risk')
    bed = bh.bedom_commons({'LicenseShortName': {'value': 'Public domain'}}, '{{PD-US-not renewed}}', IDAG)
    check(bed['status'] == 'godkand-med-not' and 'risk:' in ' '.join(bed['skal']) and 'bara i USA' in bed['note'], f'risken ska stå i note: {bed}')
    check(bh.ext_varde({'Artist': {'value': '<a>Unknown illustrator</a> Unknown illustrator'}}, 'Artist') == 'Unknown illustrator',
          'dubblerat upphovsnamn ska bli ett')
    with tempfile.TemporaryDirectory() as tmp:
        lf = Path(tmp) / 'l.txt'
        lf.write_text('File:A.jpg\ta-b\tpassa-in\nFile:B.jpg\tc\n# File:C.jpg\td\n', encoding='utf-8')
        val = set()
        refs, mapp = bh.las_lista(lf, val)
        check(refs == ['File:A.jpg', 'File:B.jpg'] and mapp == {'File:A.jpg': 'a-b', 'File:B.jpg': 'c'} and val == {'File:A.jpg'}, 'passa-in i listan')
        ut = Path(tmp) / 'ej.txt'
        n = bh.skriv_ej_hamtade(ut, [{'ref': 'File:A.jpg', 'handelse': 'a-b', 'status': 'ej hämtad'},
                                     {'ref': 'File:B.jpg', 'handelse': 'c', 'status': 'klar'}], {'File:A.jpg'})
        check(n == 1 and 'File:A.jpg\ta-b\tpassa-in' in ut.read_text(encoding='utf-8'), 'ej hämtade ska skrivas som lista')

    # --- hela flödet i --dry-run: status per fil
    with tempfile.TemporaryDirectory() as tmp:
        ut = Path(tmp) / 'ut'
        fals = Falsk()
        post = poster(('File:Exempel pd.jpg', 'e-pd'), ('File:Exempel ccbysa.jpg', 'e-ccbysa'), ('File:Exempel nc.jpg', 'e-nc'),
                      ('File:Exempel flerlicens.jpg', 'e-flerlicens'), ('File:Exempel motsagelse.jpg', 'e-motsagelse'),
                      ('File:Exempel gfdl.jpg', 'e-gfdl'), ('File:Finns inte.jpg', 'e-saknas'), ('https://www.loc.gov/item/2004668148/', 'kairo-prov'))
        res = {r['handelse']: r for r in kor(post, fals, ut, dry_run=True)}
        st = {k_: v['status'] for k_, v in res.items()}
        check(st == {'e-pd': 'klar', 'e-ccbysa': 'klar', 'e-nc': 'avvisad', 'e-flerlicens': 'klar', 'e-motsagelse': 'flaggad',
                     'e-gfdl': 'avvisad', 'e-saknas': 'saknas', 'kairo-prov': 'klar'}, f'status per fil: {st}')
        check(not ut.exists(), '--dry-run skrev filer')
        check(not any('upload.wikimedia.org' in u or 'tile.loc.gov' in u for u in fals.anrop), '--dry-run hämtade en bild')
        check(not any('Exempel nc' in u for u in fals.anrop if 'index.php' in u), 'licensmallen hämtades för en fil som API:et redan avvisat')
        check(sum('api.php' in u for u in fals.anrop) == 1, 'alla Commons-filer ska hämtas i ett batchanrop')

        # licensetiketter, flerlicens och motsägelse
        check(res['e-pd']['image']['license'] == 'Public domain' and res['e-ccbysa']['image']['license'] == 'CC BY-SA 4.0', 'licensetikett')
        fl = res['e-flerlicens']
        check('Flera licenser anges (CC BY-SA 3.0 och Public domain)' in fl['sources_post']['note'] and 'GFDL' in fl['sources_post']['note']
              and 'Personality rights' in fl['sources_post']['note'], f'noten för flerlicens: {fl["sources_post"].get("note")}')
        check(fl['sources_post']['license'] == 'CC BY-SA 3.0', 'flerlicensens valda licens ska vara API:ets')
        mo = res['e-motsagelse']
        check('olika licens' in ' '.join(mo['skal']) and 'olika licens' in mo['sources_post']['note'], 'motsägelsen ska flaggas med not')
        check(res['e-nc']['image'] is None and res['e-gfdl']['image'] is None, 'avvisade bilder ska inte få image')
        check('note' not in res['e-pd']['sources_post'], 'ren licens ska inte få note')

        # --- källpostens form mot schemat
        schema = json.loads((ROOT / 'schemas' / 'source.schema.json').read_text(encoding='utf-8'))['properties']['sources']['items']
        for r in res.values():
            sp = r['sources_post']
            if not sp:
                continue
            for f in schema['required']:
                check(f in sp, f'sources_post saknar {f}')
                check(re.search(schema['properties'][f]['pattern'], sp[f]), f'sources_post.{f} följer inte schemat: {sp[f]!r}')
            check(sp['checked'] == IDAG, 'checked ska vara dagens datum')
            check(set(sp) <= set(schema['required']) | {'note'}, f'oväntade fält i sources_post: {set(sp)}')
        check(res['e-pd']['sources_post']['id'] == 'commons-bild-e-pd' and res['kairo-prov']['sources_post']['id'] == 'loc-bild-kairo-prov', 'källpostens id')
        check(res['e-pd']['sources_post']['url'] == 'https://commons.wikimedia.org/wiki/File:Exempel_pd.jpg', 'källpostens url')
        loc = res['kairo-prov']['sources_post']
        check(loc['license'] == 'No known restrictions on publication' and loc['url'] == 'https://www.loc.gov/item/2004668148/', 'LoC-källa')
        check('LC-DIG-ppmsca-04048' in loc['note'] and '2004668148/?fo=json 2026-11-20' in loc['note'], 'LoC-noten ska ange katalogposten')

        # --- image-fältet och fasta fraser
        ph = res['e-pd']['image']
        check(list(ph) == ['file', 'kind', 'style', 'caption', 'credit', 'license', 'source'] and ph['kind'] == 'historisk', 'image-fältets form')
        check(ph['file'] == 'images/events/e-pd.webp' and ph['source'] == 'commons-bild-e-pd' and ph['credit'] == 'Anna Exempel / Wikimedia Commons', 'image-fält: file/source/credit')
        nb = ' '
        check(ph['caption'] == {s: f'{bh.MOTIV_TODO} {f}' for s, f in {
            'sv': 'Licens: Public domain.', 'en': 'Licence: Public domain.', 'de': 'Lizenz: gemeinfrei.',
            'es': 'Licencia: dominio público.', 'fr': f'Licence{nb}: domaine public.'}.items()}, f'bildtexter (PD): {ph["caption"]}')
        cc = res['e-ccbysa']['image']['caption']
        check(cc['sv'].endswith('Licens: CC BY-SA 4.0.') and cc['de'].endswith('Lizenz: CC BY-SA 4.0.') and cc['es'].endswith('Licencia: CC BY-SA 4.0.')
              and cc['fr'].endswith(f'Licence{nb}: CC BY-SA 4.0.') and cc['en'].endswith('Licence: CC BY-SA 4.0.'), 'CC-fras per språk')
        lc = res['kairo-prov']['image']
        check(lc['license'] == 'Inga kända restriktioner (Library of Congress)' and lc['caption']['fr'].endswith('n’indique aucune restriction connue de publication.')
              and lc['caption']['en'].endswith('The Library of Congress states no known restrictions on publication.'), 'LoC-fraser')
        check(lc['credit'] == 'Maison Bonfils (Beirut, Lebanon), photographer / Library of Congress', f'LoC-kredit: {lc["credit"]}')
        # Okänd upphovsperson: en TODO, eller den fasta frasen med --okand
        fl_img = fl['image']
        check('TODO' in fl_img['credit'] and any('upphovsperson saknas' in t for t in fl['todo']), 'okänd upphovsperson ska ge TODO utan --okand')
        res2 = {r['handelse']: r for r in kor(poster(('File:Exempel flerlicens.jpg', 'e-fl')), Falsk(), ut, dry_run=True, okand='konstnar')}
        check(res2['e-fl']['image']['credit'] == 'Okänd konstnär / Wikimedia Commons', 'fasta frasen Okänd konstnär')
        check(bh.OKAND['fotograf']['fr'] == 'Photographe inconnu' and bh.OKAND['fotograf']['de'] == 'Unbekannter Fotograf', 'frasbord')
        check(all(r['image'] is None or 'style' in r['image'] and r['image']['style'] == 'TODO' for r in res.values()), 'style ska vara TODO (verktyget väljer inte stil)')

        # --- inget påstås om motivet: beskrivning, titel och datum ur metadata finns bara i underlaget
        for r in res.values():
            if not r['image']:
                continue
            fraser = [bh.licensfras(r['image']['license'], 'loc' if r['kalla'] == 'loc' else 'commons', s) for s in bh.SPRAK]
            for s, fras in zip(bh.SPRAK, fraser):
                check(r['image']['caption'][s].replace(bh.MOTIV_TODO, '').replace(fras, '').strip() == '', f'bildtexten ({s}) innehåller mer än TODO och licensfras: {r["image"]["caption"][s]}')
            hela = json.dumps([r['image'], r['sources_post']], ensure_ascii=False)
            check('aldrig får hamna' not in hela and 'En beskrivning' not in hela, 'metadatans beskrivning hamnade i image eller källposten')
        check('som aldrig får hamna i bildtexten' in res['e-pd']['underlag']['beskrivning_i_metadata'], 'beskrivningen ska finnas i underlaget')
        check(all(any('TODO' in t for t in r['todo']) for r in res.values() if r['image']), 'TODO-varning saknas')

    # --- licensfall direkt: rena funktioner
    ext_pd = {'LicenseShortName': {'value': 'Public domain'}}
    check(bh.bedom_commons(ext_pd, '{{PD-old-100}}', IDAG)['status'] == 'godkand', 'PD ska godkännas')
    check(bh.bedom_commons(ext_pd, None, IDAG)['status'] == 'flagga', 'utan licensmall ska en tillåten API-licens flaggas')
    check(bh.bedom_commons(ext_pd, '{{Information}}', IDAG)['status'] == 'flagga', 'ingen igenkänd mall ska flaggas')
    nc_pd = bh.bedom_commons({'LicenseShortName': {'value': 'CC BY-NC 2.0'}}, '{{PD-old-100}}', IDAG)
    check(nc_pd['status'] == 'flagga' and nc_pd['note'], 'NC mot PD är en motsägelse')
    check(bh.bedom_commons({'LicenseShortName': {'value': 'GFDL'}}, '{{GFDL}}', IDAG)['status'] == 'avvisad', 'GFDL ensamt avvisas')
    check(bh.bedom_commons({'LicenseShortName': {'value': 'Fair use'}}, '{{Non-free fair use}}', IDAG)['status'] == 'avvisad', 'fair use avvisas')
    check(bh.bedom_commons({'LicenseShortName': {'value': 'CC BY 4.0'}}, '{{cc-by-4.0}}', IDAG)['status'] == 'godkand', 'CC BY godkänns')
    check(bh.bedom_commons({'LicenseShortName': {'value': 'CC0'}}, '{{cc-zero}}', IDAG)['licens'] == 'CC0', 'CC0 godkänns')
    check(bh.bedom_commons({}, '{{cc-by-sa-4.0}}', IDAG)['status'] == 'godkand', 'mallen räcker när API:ets licens saknas')
    ver = bh.bedom_commons({'LicenseShortName': {'value': 'CC BY-SA 4.0'}}, '{{cc-by-sa-3.0}}', IDAG)
    check(ver['status'] == 'flagga', 'olika version i API och mall ska flaggas')
    # LoC
    check(bh.bedom_loc({'rights_advisory': 'No known restrictions on publication.'})['status'] == 'godkand', 'LoC utan restriktioner')
    check(bh.bedom_loc({'rights_advisory': 'Rights status not evaluated.'})['status'] == 'flagga', 'LoC med annan rättighetstext flaggas')
    check(bh.bedom_loc({})['status'] == 'flagga', 'LoC utan rättighetstext flaggas')
    loc_json = json.loads(LOC)
    fil = bh.valj_loc_fil(bh._loc_filer(loc_json))
    check(fil['url'].endswith('04048v.jpg') and fil['h'] == 1024, f'LoC-filen ska vara minsta JPEG över 960 px: {fil}')

    # --- 429, Retry-After och tre försök (utan riktig väntan)
    ok = (200, {}, b'{"x": 1}')
    t = Manus((429, {'Retry-After': '3'}, b''), ok)
    k, sov = klient(t)
    check(k.hamta(URL) == b'{"x": 1}' and sov == [3] and t.anrop == 2, f'Retry-After ska respekteras: sov={sov}')
    t = Manus((429, {}, b''), (503, {}, b''), ok)
    k, sov = klient(t)
    check(k.hamta(URL) == b'{"x": 1}' and sov == [2, 4], f'exponentiell väntan utan Retry-After: {sov}')
    t = Manus((429, {'retry-after': '1'}, b''), (429, {'retry-after': '1'}, b''), (429, {'retry-after': '1'}, b''), ok)
    k, sov = klient(t)
    try:
        k.hamta(URL)
        check(False, 'tre 429 ska ge EjHamtad')
    except bh.EjHamtad as e:
        check('429' in str(e) and '3 försök' in str(e), f'felmeddelande: {e}')
    check(t.anrop == 3 and sov == [1, 1], f'högst tre försök och ingen väntan efter det sista: anrop={t.anrop} sov={sov}')
    t = Manus((429, {'Retry-After': '3600'}, b''), ok)
    k, sov = klient(t)
    try:
        k.hamta(URL)
        check(False, 'lång Retry-After ska ge EjHamtad')
    except bh.EjHamtad as e:
        check('Retry-After 3600' in str(e), f'felmeddelande: {e}')
    check(t.anrop == 1 and sov == [], 'en Retry-After över taket ska ge upp direkt utan att vänta')
    t = Manus((404, {}, b''), ok)
    k, sov = klient(t)
    try:
        k.hamta(URL)
        check(False, '404 ska ge EjHamtad')
    except bh.EjHamtad:
        pass
    check(t.anrop == 1, '404 ska inte försökas igen')
    t = Manus(TimeoutError('t'), OSError('n'), ok)
    k, sov = klient(t)
    check(k.hamta(URL) == b'{"x": 1}' and t.anrop == 3, 'nätfel ska försökas igen')
    t0 = [0.0]
    t = Manus((429, {'Retry-After': '50'}, b''), (429, {'Retry-After': '50'}, b''), ok)
    k = bh.Klient(transport=t, sleep=lambda s: t0.__setitem__(0, t0[0] + s), klocka=lambda: t0[0], tidstak=60)
    try:
        k.hamta(URL)
        check(False, 'tidstaket ska stoppa')
    except bh.EjHamtad as e:
        check('tidstaket' in str(e), f'felmeddelande: {e}')
    try:
        bh.Klient(transport=Manus(ok)).hamta('https://example.com/x.jpg')
        check(False, 'främmande värd ska nekas')
    except bh.EjHamtad:
        pass
    check(bh.retry_after('Wed, 21 Oct 2026 07:28:30 GMT', nu=1792567700) == 10 and bh.retry_after('abc') is None, 'Retry-After som datum')

    # --- ej hämtad: fortsätter med nästa fil
    with tempfile.TemporaryDirectory() as tmp:
        ut = Path(tmp) / 'ut'
        t = Falsk(commons_status=429)
        res = kor(poster(('File:Exempel pd.jpg', 'a-1'), ('https://www.loc.gov/item/2004668148/', 'b-2')), t, ut, dry_run=True)
        check([r['status'] for r in res] == ['ej hämtad', 'klar'], f'en trasig batch ska inte stoppa LoC-posten: {[r["status"] for r in res]}')
        check(sum('api.php' in u for u in t.anrop) == 3, 'batchanropet ska försökas högst tre gånger')

        # --- cache: andra körningen ger inga nya anrop
        cache = Path(tmp) / 'cache'
        t1, t2 = Falsk(), Falsk()
        k1 = bh.Klient(cache_dir=cache, transport=t1, sleep=lambda s: None, klocka=lambda: 0.0)
        bh.kor(poster(('https://www.loc.gov/item/2004668148/', 'c-1')), k1, ut, dry_run=True, idag=IDAG)
        k2 = bh.Klient(cache_dir=cache, transport=t2, sleep=lambda s: None, klocka=lambda: 0.0)
        bh.kor(poster(('https://www.loc.gov/item/2004668148/', 'c-1')), k2, ut, dry_run=True, idag=IDAG)
        check(len(t1.anrop) == 1 and len(t2.anrop) == 0, 'cachen ska göra att inget hämtas två gånger')

    # --- webp 800 x 600 (Pillow)
    if not PIL_OK:
        print('bild-hamta-test: Pillow saknas, webp-delen hoppas över')
    else:
        with tempfile.TemporaryDirectory() as tmp:
            ut = Path(tmp) / 'ut'
            fals = Falsk(bild=jpeg(1600, 1200))
            post = poster(('File:Exempel pd.jpg', 'v-pd'), ('File:Exempel liten.jpg', 'v-liten'), ('https://www.loc.gov/item/2004668148/', 'v-loc'), ('File:Exempel nc.jpg', 'v-nc'))
            res = {r['handelse']: r for r in kor(post, fals, ut)}
            for eid in ('v-pd', 'v-loc'):
                check(res[eid]['status'] == 'klar' and res[eid]['webp'], f'{eid}: {res[eid]["status"]} {res[eid]["skal"]}')
                fil = ut / f'{eid}.webp'
                with Image.open(fil) as im:
                    check(im.format == 'WEBP' and im.size == (800, 600), f'{eid}: ska vara webp 800 × 600, var {im.format} {im.size}')
                check(fil.stat().st_size <= 150_000 and res[eid]['webp']['bytes'] == fil.stat().st_size, f'{eid}: över 150 kB')
            check(not (ut / 'v-nc.webp').exists() and res['v-nc']['status'] == 'avvisad', 'avvisad bild ska inte konverteras')
            check(any('liten källbild' in w or 'liten' in w for w in res['v-liten']['todo']) or res['v-liten']['status'] == 'klar', 'liten bild')
            # miniatyren (960 px) hämtas, inte originalet; LoC hämtar JPEG-filen, inte tif
            hamtade = [u for u in fals.anrop if 'upload.wikimedia.org' in u or 'tile.loc.gov' in u]
            check(any('/960px-' in u for u in hamtade) and not any(u.endswith('.tif') for u in hamtade), f'fel bildadress: {hamtade}')
            # en fil som redan finns skrivs inte över utan --skriv-over
            res = kor(poster(('File:Exempel pd.jpg', 'v-pd')), Falsk(bild=jpeg()), ut)
            check(res[0]['status'] == 'hoppad', 'befintlig webp ska inte skrivas över')
            res = kor(poster(('File:Exempel pd.jpg', 'v-pd')), Falsk(bild=jpeg()), ut, skriv_over=True)
            check(res[0]['status'] == 'klar', '--skriv-over ska ersätta filen')
            # trasig bild
            res = kor(poster(('File:Exempel pd.jpg', 'v-trasig')), Falsk(bild=b'inte en bild'), ut)
            check(res[0]['status'] == 'fel' and 'gick inte att läsa' in ' '.join(res[0]['skal']), 'trasig bild ska ge fel, inte krasch')

    # --- kommandoraden: --json på stdout och slutkod
    with tempfile.TemporaryDirectory() as tmp:
        import contextlib
        klass_init = bh.Klient.__init__
        transport = Falsk()
        try:

            def init(self, *a, **kw):
                kw['transport'] = transport
                kw['sleep'] = lambda s: None
                klass_init(self, *a, **kw)
            bh.Klient.__init__ = init
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                kod = bh.main(['--map', 'https://www.loc.gov/item/2004668148/=cli-prov', '--dry-run', '--json', '--ingen-cache', '--out', str(Path(tmp) / 'ut')])
            data = json.loads(buf.getvalue())
            check(kod == 0 and data[0]['status'] == 'klar' and data[0]['sources_post']['id'] == 'loc-bild-cli-prov', 'main --json')
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                kod = bh.main(['--map', 'File:Exempel nc.jpg=cli-nc', '--dry-run', '--ingen-cache'])
            check(kod == 1 and 'AVVISAD' in buf.getvalue(), 'main ska ge slutkod 1 och en läsbar rapport för en avvisad bild')
        finally:
            bh.Klient.__init__ = klass_init

    # --- passa-in (#2193): en stående bild passas in hel i 800 × 600 på en kant i bildens egen färg, utan beskärning
    if PIL_OK:
        im = Image.new('RGB', (600, 1200), (240, 230, 200))
        ImageDraw.Draw(im).rectangle((0, 0, 599, 40), fill=(200, 0, 0))  # en röd rand överst som en beskärning skulle ta bort
        buf = io.BytesIO()
        im.save(buf, 'PNG')
        with tempfile.TemporaryDirectory() as tmp:
            dst = Path(tmp) / 'x.webp'
            bh.konvertera(buf.getvalue(), dst, passa=True)
            with Image.open(dst) as ut:
                check(ut.size == (800, 600), f'passa-in ska ge 800 × 600, gav {ut.size}')
                r, g, b = ut.convert('RGB').getpixel((400, 5))
                check(r > 150 and g < 80, f'den röda randen överst ska finnas kvar efter passa-in, fick {(r, g, b)}')
                kr, kg, kb = ut.convert('RGB').getpixel((20, 300))
                check(abs(kr - 240) < 20 and abs(kg - 230) < 20, f'kanten ska ha bildens egen färg, fick {(kr, kg, kb)}')
        # En genomskinlig bild får vit och inte svart bakgrund (fynd i steg B)
        gs = Image.new('RGBA', (800, 400), (0, 0, 0, 0))
        ImageDraw.Draw(gs).rectangle((300, 100, 500, 300), fill=(0, 100, 0, 255))
        buf = io.BytesIO()
        gs.save(buf, 'PNG')
        with tempfile.TemporaryDirectory() as tmp:
            dst = Path(tmp) / 'g.webp'
            bh.konvertera(buf.getvalue(), dst, passa=True)
            with Image.open(dst) as ut:
                px = ut.convert('RGB').getpixel((10, 300))
                check(min(px) > 200, f'genomskinlig bakgrund ska bli vit, fick {px}')

    print('bild-hamta-test: ok')


if __name__ == '__main__':
    main()
