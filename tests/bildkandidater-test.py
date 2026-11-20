#!/usr/bin/env python3
"""Testar tools/bildkandidater.py (#2119) med inspelade svar i tests/fixtures/bildkandidater/.
Inget nätverk: anropen besvaras av en låtsasöppnare. Repot ändras inte (utdata i en tillfällig mapp)."""
import importlib.util
import json
import re
import sys
import tempfile
import urllib.error
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIX = ROOT / 'tests' / 'fixtures' / 'bildkandidater'
spec = importlib.util.spec_from_file_location('bildkandidater', ROOT / 'tools' / 'bildkandidater.py')
bk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bk)


def fix(namn):
    return json.loads((FIX / namn).read_text(encoding='utf-8'))


class Last:
    """Låtsasöppnare: svarar ur fixturerna och räknar anropen."""

    def __init__(self):
        self.urls = []

    def __call__(self, url):
        self.urls.append(url)
        q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
        assert 'api.php' in url
        if q['action'][0] == 'wbgetentities':
            return fix('wikidata.json')
        if q.get('generator', [''])[0] == 'search':
            return fix('commons-search.json')
        return fix('commons-info.json')


def handelse(eid, start=1000, lon=20.0, lat=0.0, **extra):
    return {'id': eid, 'start': start, 'end': start, 'review': 'source-checked',
            'location': {'type': 'Point', 'coordinates': [lon, lat]},
            'title': {'sv': 'Titel ' + eid, 'en': 'Title ' + eid},
            'place': {'sv': 'Plats', 'en': 'Place, Country'}, **extra}


def klient(opener, **kw):
    sov = []
    k = bk.Klient(opener=opener, sleep=sov.append, log=lambda m: None, **kw)
    k.sov = sov
    return k


def test_p18():
    p = bk.p18_filer(fix('wikidata.json'))
    assert p == {'Q1': ['Pyramid_preferred.jpg', 'Pyramid_normal.jpg']}, p  # föredragen först, utan bild/borttagen hoppas över


def test_licens():
    k = bk.klassa_licens
    assert k('CC BY-SA 4.0')[:2] == ('cc-by-sa', 'ok')
    assert k('CC BY 3.0')[:2] == ('cc-by', 'ok')
    assert k('CC0')[:2] == ('cc0', 'ok')
    assert k('Public domain')[:2] == ('public-domain', 'ok')
    assert k('PD-old-100')[:2] == ('public-domain', 'ok')
    assert k('CC BY-SA 3.0, GFDL')[:2] == ('cc-by-sa', 'ok')
    for lic in ('CC BY-NC 2.0', 'CC BY-NC-SA 4.0', 'CC BY-ND 4.0', 'GFDL 1.2', 'Attribution', 'All rights reserved'):
        klass, status, skal = k(lic)
        assert klass is None and status == 'avvisad' and skal, lic
    assert k(None)[1] == 'avvisad'
    assert k('CC BY 4.0', {'NonFree': {'value': 'true'}})[1] == 'avvisad'


def test_p18_och_storlek():
    k = klient(Last())
    p = bk.kor([handelse('pyr', wikidata='Q1')], k, idag='2026-01-01')['pyr']
    fil = {c['fil']: c for c in p['kandidater']}
    assert list(fil) == ['File:Pyramid preferred.jpg', 'File:Pyramid normal.jpg'], list(fil)
    smal, bred = fil['File:Pyramid preferred.jpg'], fil['File:Pyramid normal.jpg']
    assert smal['smal'] is True and bred['smal'] is False
    assert bred['licensklass'] == 'cc-by-sa' and bred['licensstatus'] == 'ok'
    assert bred['upphovsperson'] == 'Anna Andersson'  # HTML bort
    assert bred['datum'] == '1880-05-01' and (bred['bredd'], bred['hojd']) == (1600, 1200)
    assert bred['filsida'] == 'https://commons.wikimedia.org/wiki/File:Pyramid_normal.jpg'
    assert bred['kategorier'] == ['Battles of X'] and bred['kalla'] == 'wikidata-P18'
    assert 'ej_hamtad' not in p


def test_sokning_utan_id_och_utan_p18():
    k = klient(Last())
    po = bk.kor([handelse('a'), handelse('b', wikidata='Q2')], k, idag='2026-01-01')
    assert [c['fil'] for c in po['a']['kandidater']] == ['File:Slag A.jpg', 'File:Slag B.jpg', 'File:Slag NC.jpg',
                                                          'File:Slag GFDL.jpg']  # i träffordning, högst fem
    st = {c['fil']: c['licensstatus'] for c in po['a']['kandidater']}
    assert st['File:Slag NC.jpg'] == 'avvisad' and st['File:Slag GFDL.jpg'] == 'avvisad' and st['File:Slag A.jpg'] == 'ok'
    assert all(c['kalla'] == 'commons-sok' for c in po['b']['kandidater'])
    assert po['b']['anmarkningar'], 'händelse med id men utan P18 ska säga det'
    assert bk.sok_text(handelse('x')) == 'Title x Place'
    assert bk.sok_text(handelse('x', place={'sv': 'Där floderna A och B möts i dag'})) == 'Title x'


def test_batch_om_50():
    ls = Last()
    k = klient(ls)
    ev = [handelse(f'e{i}', wikidata=f'Q{1000 + i}') for i in range(120)]
    bk.kor(ev, k)
    wd = [u for u in ls.urls if 'wbgetentities' in u]
    assert len(wd) == 3, len(wd)  # 50 + 50 + 20
    assert all(len(urllib.parse.parse_qs(urllib.parse.urlparse(u).query)['ids'][0].split('|')) <= 50 for u in wd)


def test_urval():
    ev = [handelse('ny', start=1500),
          handelse('med-bild', start=1000, image={'file': 'x.webp'}),
          handelse('plats-bild', start=1001, image={'file': 'y.webp', 'placeholder': True}),
          handelse('utkast', start=1002, review='draft'),
          handelse('afrika', start=1100, lon=20, lat=0),
          handelse('europa', start=1200, lon=10, lat=50),
          handelse('fkr', start=-500, lon=20, lat=0)]
    ids = lambda r: [e['id'] for e in r]  # noqa: E731
    region = bk.region_funktion()
    allt = ids(bk.valj(ev))
    assert 'med-bild' not in allt and 'utkast' not in allt  # bild och draft hoppas över
    assert 'plats-bild' in allt  # platshållare räknas som utan riktig bild
    assert allt == ['fkr', 'plats-bild', 'afrika', 'europa', 'ny']  # tidsordning
    assert ids(bk.valj(ev, region='afrika', region_av=region)) == ['fkr', 'plats-bild', 'afrika', 'ny']
    assert ids(bk.valj(ev, region='Europa', region_av=region)) == ['europa']
    assert ids(bk.valj(ev, period=bk.tolka_period('1000-1347'), region='Afrika', region_av=region)) == \
        ['plats-bild', 'afrika']
    assert ids(bk.valj(ev, ids=['europa', 'ny'])) == ['europa', 'ny']
    assert ids(bk.valj(ev, limit=2)) == ['fkr', 'plats-bild']
    assert 'afrika' not in ids(bk.valj(ev, exkludera={'afrika'}))
    assert bk.tolka_period('-500..100') == (-500, 100) and bk.tolka_period('-800--400') == (-800, -400)
    try:
        bk.tolka_period('1000')
        raise AssertionError('borde ha stoppat')
    except ValueError:
        pass


def test_saknas():
    with tempfile.TemporaryDirectory() as t:
        f = Path(t) / 's.md'
        f.write_text('| Händelse (id) | Varför |\n|---|---|\n| `a-b` | text |\n| `c` | `d` |\ntext `x`\n', encoding='utf-8')
        assert bk.saknade_id(f) == {'a-b', 'c'}
    assert isinstance(bk.saknade_id(), set)  # den riktiga filen går att läsa


class Fel429:
    def __init__(self, antal, retry_after='7'):
        self.antal, self.n, self.retry_after = antal, 0, retry_after

    def __call__(self, url):
        self.n += 1
        if self.n <= self.antal:
            h = {'Retry-After': self.retry_after} if self.retry_after else {}
            raise urllib.error.HTTPError(url, 429, 'Too Many Requests', h, None)
        return {'query': {'pages': []}}


def test_retry():
    o = Fel429(2)
    k = klient(o)
    assert k.hamta(bk.COMMONS_API, {'action': 'query'}) == {'query': {'pages': []}}
    assert k.sov == [7, 7] and o.n == 3  # Retry-After respekteras
    o = Fel429(99, retry_after='9999')
    k = klient(o)
    try:
        k.hamta(bk.COMMONS_API, {'action': 'query'})
        raise AssertionError('borde ha gett upp')
    except bk.Hamtningsfel as e:
        assert e.kod == '429'
    assert o.n == 3 and k.sov == [bk.MAX_VANTAN, bk.MAX_VANTAN]  # tre försök, aldrig längre väntan än taket


def test_ej_hamtad_och_vidare():
    class Sok:
        def __init__(self):
            self.n = 0

        def __call__(self, url):
            if 'generator=search' in url and 'Title+a' in url:
                raise urllib.error.HTTPError(url, 429, 'Too Many Requests', {}, None)
            return Last()(url)

    k = klient(Sok())
    po = bk.kor([handelse('a'), handelse('b')], k, idag='2026-02-02')
    assert po['a']['ej_hamtad'] == {'felkod': '429', 'datum': '2026-02-02'} and po['a']['kandidater'] == []
    assert po['b']['kandidater'] and 'ej_hamtad' not in po['b']  # nästa händelse tas ändå


def test_cache_och_offline():
    with tempfile.TemporaryDirectory() as t:
        ls = Last()
        a = klient(ls, cache_dir=t)
        r1 = bk.kor([handelse('a'), handelse('p', wikidata='Q1')], a, idag='2026-01-01')
        assert ls.urls
        ls2 = Last()
        b = klient(ls2, cache_dir=t, offline=True)
        r2 = bk.kor([handelse('a'), handelse('p', wikidata='Q1')], b, idag='2026-01-01')
        assert not ls2.urls and r1 == r2  # samma resultat utan nätverk
        c = klient(Last(), cache_dir=t + '/tom', offline=True)
        po = bk.kor([handelse('z')], c, idag='2026-01-01')
        assert po['z']['ej_hamtad']['felkod'] == 'offline'


def test_utkastfilen():
    with tempfile.TemporaryDirectory() as t:
        ut = Path(t) / 'u' / 'bildkandidater.json'
        po = bk.kor([handelse('a')], klient(Last()), idag='2026-01-01')
        doc = bk.skriv(ut, po, 'test', idag='2026-01-01')
        assert doc['status'] == 'förslag' and 'kontrolleras manuellt' in doc['anmarkning']
        assert doc['schema'] == bk.SCHEMA and doc['generated']['kandidater'] == 4
        assert doc['generated']['tillatna'] == 2 and doc['generated']['avvisade'] == 2
        po2 = bk.kor([handelse('b', start=900)], klient(Last()), idag='2026-01-02')
        doc2 = bk.skriv(ut, po2, 'test2', idag='2026-01-02')
        assert [p['id'] for p in doc2['handelser']] == ['b', 'a']  # en bit i taget: den förra behålls
        assert json.loads(ut.read_text(encoding='utf-8'))['status'] == 'förslag'


def test_appen_laser_inte_utkast():
    """data/utkast/ läses inte av sidan och publiceras inte (scripts/build-site.sh, validate-site.py)."""
    for rot in ('js', 'index.html', 'functions'):
        p = ROOT / rot
        filer = [p] if p.is_file() else [f for f in p.rglob('*') if f.is_file() and f.suffix in ('.js', '.mjs', '.html')]
        for f in filer:
            assert 'data/utkast' not in f.read_text(encoding='utf-8'), f'{f} läser data/utkast'
    assert "'data/utkast/'" in (ROOT / 'scripts' / 'validate-site.py').read_text(encoding='utf-8')
    assert 'data/utkast' in (ROOT / 'scripts' / 'build-site.sh').read_text(encoding='utf-8')
    uts = ROOT / 'data' / 'utkast' / 'bildkandidater.json'
    if uts.exists():  # om en lista är incheckad ska den vara märkt som förslag
        d = json.loads(uts.read_text(encoding='utf-8'))
        assert d['status'] == 'förslag' and d['anmarkning']


if __name__ == '__main__':
    fel = 0
    for namn, f in sorted(globals().items()):
        if namn.startswith('test_') and callable(f):
            try:
                f()
                print('ok  ', namn)
            except Exception as e:  # noqa: BLE001
                fel += 1
                print('FEL ', namn, repr(e))
    sys.exit(1 if fel else 0)
