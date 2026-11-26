#!/usr/bin/env python3
"""Prov för tools/bildbatch.py (#2183): urval, flaggor, ordning, utdata och grinden mot data/utkast/.
Inget nätverk: den strikta licenskontrollen byts mot en låtsasfunktion. Repot ändras inte (utdata i en tillfällig mapp)."""
import importlib.util
import json
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('bildbatch', ROOT / 'tools' / 'bildbatch.py')
bb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bb)


def handelse(eid, start=1200, lon=20.0, lat=0.0, **extra):
    return {'id': eid, 'start': start, 'end': start, 'review': 'source-checked', 'category': 'kultur',
            'location': {'type': 'Point', 'coordinates': [lon, lat]},
            'title': {'sv': 'Titel ' + eid}, 'place': {'sv': 'Plats ' + eid}, **extra}


def kand(fil, licens='CC BY-SA 4.0', status='trolig', kalla='wikidata-P18', datum='1880', smal=False, kategorier=()):
    return {'fil': fil, 'filsida': 'https://commons.wikimedia.org/wiki/' + fil.replace(' ', '_'), 'kalla': kalla,
            'licens': licens, 'licensstatus': status, 'upphovsperson': 'A | B', 'datum': datum, 'bredd': 700 if smal else 1600,
            'hojd': 1200, 'smal': smal, 'kategorier': list(kategorier), 'beskrivning': None}


HANDELSER = [
    handelse('a', 1100),
    handelse('b', 1150),
    handelse('c-bild', 1160, image={'file': 'x.webp'}),
    handelse('d-utkast', 1170, review='draft'),
    handelse('e-utan', 1180),
    handelse('f-ö', 1190),  # id med ö (#2182)
    handelse('g-europa', 1195, lon=15.0, lat=50.0),
]
KANDIDATER = {
    'a': {'id': 'a', 'start': 1100, 'hamtad': '2026-11-20', 'kandidater': [
        kand('File:Sok.jpg', kalla='commons-sok'),
        kand('File:Karta.jpg', kategorier=['Maps of Africa']),
        kand('File:NC.jpg', licens='CC BY-NC 2.0', status='avvisad'),
        kand('File:Bra.jpg'),
        kand('File:Foto.jpg', datum='2012-05-01'),
    ]},
    'b': {'id': 'b', 'start': 1150, 'kandidater': [kand('File:Flagga.jpg', licens='No restrictions', status='flagga')]},
    'e-utan': {'id': 'e-utan', 'start': 1180, 'kandidater': [kand('File:Bara NC.jpg', status='avvisad')]},
    'f-ö': {'id': 'f-ö', 'start': 1190, 'kandidater': [kand('File:Smal.jpg', smal=True)]},
    'g-europa': {'id': 'g-europa', 'start': 1195, 'kandidater': [kand('File:E.jpg')]},
}


def forbered(t):
    os.environ['HISTORIA_GLOBEN_PROV_UT'] = t
    h = Path(t) / 'handelser'
    h.mkdir()
    (h / 'x.json').write_text(json.dumps({'events': HANDELSER}, ensure_ascii=False), encoding='utf-8')
    k = Path(t) / 'kandidater'
    k.mkdir()
    (k / 'afrika-medeltid.json').write_text(json.dumps({'handelser': [v for i, v in KANDIDATER.items() if i != 'g-europa']},
                                                       ensure_ascii=False), encoding='utf-8')
    (k / 'europa-medeltid.json').write_text(json.dumps({'handelser': [KANDIDATER['g-europa']]}), encoding='utf-8')
    return ['--handelser', str(h), '--kandidater', str(k), '--ut', str(Path(t) / 'ut'), '--datum', '2026-11-22']


def test_ids_ur_text():
    kanda = {'a', 'b', 'f-ö', 'slaget-vid-x'}
    text = 'Händelser: `a`, `okand`, slaget-vid-x och `f-ö`. Ordet b ensamt räknas inte, men `b` gör det.'
    assert bb.ids_ur_text(text, kanda) == ['a', 'slaget-vid-x', 'f-ö', 'b']


def test_flaggor_och_ordning():
    e = handelse('a', 1100)
    rader = bb.ordna(KANDIDATER['a']['kandidater'], e, 10)
    filer = [k['fil'] for k in rader]
    assert 'File:NC.jpg' not in filer  # en avvisad licens visas aldrig
    assert filer[0] == 'File:Bra.jpg' and filer[-1] == 'File:Sok.jpg', filer  # flaggorna sorterar, de avvisar inte
    fl = {k['fil']: k['flaggor'] for k in rader}
    # Äldre kandidatlista utan skilda datum: ett datum från 2012 kan vara uppladdningen, så det blir datum-osakert (#2193)
    # Äldre kandidatlista utan skilda datum: ingen datumflagga (den var fel för nästan alla bilder i omgången #2104–#2105)
    assert fl['File:Karta.jpg'] == ['karta'] and fl['File:Foto.jpg'] == [] and fl['File:Sok.jpg'] == ['ur-sokning']
    assert bb.flaggor(kand('x', datum='2012'), handelse('ny', 1950)) == []  # ett foto från 2012 av en händelse 1950 är inte "nutida" här
    assert bb.flaggor(kand('x', status='flagga'), e) == ['licens-flagga']
    assert len(bb.ordna(KANDIDATER['a']['kandidater'], e, 3)) == 3


def test_flaggor_efter_piloten():
    """Flaggorna från #2193: verkets datum mot filens, stående bild, moderna konstverk."""
    e = handelse('x', 1100)
    nytt_foto = dict(kand('a'), datum_original='2013-10-27', datum_fil='2013-10-28')
    gammalt_verk = dict(kand('b'), datum_original='1572', datum_fil='2006-01-08')  # kopparstick, uppladdat 2006
    bara_fil = dict(kand('c'), datum_original=None, datum_fil='2006-01-08')
    assert bb.flaggor(nytt_foto, e) == ['nutida-foto']
    assert bb.flaggor(gammalt_verk, e) == []  # inte "nutida" bara för att filen laddades upp 2006 (fel 6 gånger i piloten)
    assert bb.flaggor(bara_fil, e) == ['datum-osakert']
    staende = dict(kand('d'), bredd=1446, hojd=1496)
    assert 'staende' in bb.flaggor(staende, e)
    monument = kand('e', kategorier=['Monuments and memorials in KwaZulu-Natal', '2003 sculptures'])
    assert 'konstverk' in bb.flaggor(monument, e)
    assert 'konstverk' not in bb.flaggor(kand('f', kategorier=['Battles of X']), e)
    # Fynd i steg B: antika föremål, kartor och nästan kvadratiska bilder ska inte flaggas
    assert 'konstverk' not in bb.flaggor(kand('g', kategorier=['Igbo-Ukwu bronzes', '9th-century sculptures']), e)
    assert 'konstverk' not in bb.flaggor(kand('h', kategorier=['Maps of South Sudan', 'Monuments']), e)
    assert 'staende' in bb.flaggor(dict(kand('i'), bredd=1080, hojd=1143), e)  # utsnittet tar bort 29 % av höjden
    assert 'staende' not in bb.flaggor(dict(kand('j'), bredd=1600, hojd=1300), e)  # 8 %


def test_samma_fil_och_stil():
    poster, _ = bb.bygg([handelse('p', 1300), handelse('q', 1301)],
                        {'p': {'id': 'p', 'kandidater': [kand('File:Delad.jpg')]},
                         'q': {'id': 'q', 'kandidater': [kand('File:Delad.jpg'), kand('File:Egen.jpg')]}})
    k = {(p['id'], x['fil']): x for p in poster for x in p['kandidater']}
    assert 'samma-fil' in k[('p', 'File:Delad.jpg')]['flaggor'] and k[('p', 'File:Delad.jpg')]['samma_fil_som'] == ['q']
    assert 'samma-fil' not in k[('q', 'File:Egen.jpg')]['flaggor']
    assert all(p['stil'] for p in poster)  # stilen enligt data/styles.json föreslås för varje händelse


def test_hela_flodet_och_determinism():
    with tempfile.TemporaryDirectory() as t:
        arg = forbered(t)
        idfil = Path(t) / 'issue.md'
        idfil.write_text('`a` `b` `c-bild` `e-utan` `f-ö` `d-utkast`', encoding='utf-8')
        assert bb.main(['--namn', '2107', '--ids-fran', str(idfil)] + arg) == 0
        ut = Path(t) / 'ut'
        doc = json.loads((ut / '2107.json').read_text(encoding='utf-8'))
        assert [p['id'] for p in doc['handelser']] == ['a', 'b', 'f-ö']
        assert [p['id'] for p in doc['utan_kandidat']] == ['e-utan']  # bara avvisade kandidater = utan kandidat
        assert doc['redan_bild_eller_utkast'] == ['c-bild', 'd-utkast']  # inte med: har bild eller är utkast
        md = (ut / '2107.md').read_text(encoding='utf-8')
        assert '## 1. `a`' in md and 'A \\| B' in md and '## Utan användbar kandidat' in md and 'Vald (nr' in md
        assert 'licens-flagga' in md and 'No restrictions (flagga)' in md and 'Stil enligt data/styles.json' in md
        lista = (ut / '2107-lista.txt').read_text(encoding='utf-8').splitlines()
        assert '# File:Bra.jpg\ta' in lista and '# File:Smal.jpg\tf-ö' in lista
        assert all(r.startswith('#') for r in lista)  # inget är godkänt förrän agenten tar bort #
        fore = {f.name: f.read_bytes() for f in ut.iterdir()}
        assert bb.main(['--namn', '2107', '--ids-fran', str(idfil)] + arg) == 0
        assert {f.name: f.read_bytes() for f in ut.iterdir()} == fore  # samma indata och datum ger samma filer
        # region och period i stället för id
        assert bb.main(['--namn', 'eu', '--region', 'Europa', '--period', '1000-1300'] + arg) == 0
        assert [p['id'] for p in json.loads((ut / 'eu.json').read_text(encoding='utf-8'))['handelser']] == ['g-europa']


def test_strikt_licens_lagger_till_flagga():
    with tempfile.TemporaryDirectory() as t:
        arg = forbered(t)

        def falsk(titlar):
            return {x: ({'status': 'flagga', 'licens': None, 'skal': ['ingen mall'], 'note': None} if x == 'File:Bra.jpg'
                        else {'status': 'godkand-med-not', 'licens': 'CC BY-SA 4.0', 'skal': [], 'note': None,
                              'risker': ['public domain bara i USA']} if x == 'File:Karta.jpg'
                        else {'status': 'godkand', 'licens': 'CC BY-SA 4.0', 'skal': [], 'note': None}) for x in titlar}
        assert bb.main(['--namn', 's', '--id', 'a', '--licens'] + arg, strikt_fn=falsk) == 0
        doc = json.loads((Path(t) / 'ut' / 's.json').read_text(encoding='utf-8'))
        k = {x['fil']: x for x in doc['handelser'][0]['kandidater']}
        assert k['File:Bra.jpg']['licens_strikt']['status'] == 'flagga' and 'licens-flagga' in k['File:Bra.jpg']['flaggor']
        md = (Path(t) / 'ut' / 's.md').read_text(encoding='utf-8')
        assert 'filsidan: godkand CC BY-SA 4.0' in md and 'licensrisk: public domain bara i USA' in md
        assert 'licens-risk' in k['File:Karta.jpg']['flaggor']


def test_grind_och_indata():
    with tempfile.TemporaryDirectory() as t:
        arg = forbered(t)
        os.environ.pop('HISTORIA_GLOBEN_PROV_UT')
        try:
            bb.main(['--namn', 'x', '--id', 'a'] + arg)  # --ut ligger utanför data/utkast/
        except SystemExit as e:
            assert 'data/utkast' in str(e)
        else:
            raise AssertionError('utdata utanför data/utkast/ ska stoppas')
        os.environ['HISTORIA_GLOBEN_PROV_UT'] = t
        for fel in (['--namn', '../x', '--id', 'a'], ['--namn', 'x', '--id', 'finns-inte'], ['--namn', 'x']):
            try:
                bb.main(fel + arg)
            except SystemExit as e:
                assert e.code == 2, fel
            else:
                raise AssertionError(f'{fel} ska ge fel')


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
