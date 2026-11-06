#!/usr/bin/env python3
"""Spärren mot oöversatt innehåll och kontrollen av inaktuella översättningar (#675, beslut 2026-11-06).

Regeln (docs/beslut/2026-11-06-oversatt-samtidigt.md): nytt innehåll översätts i samma pull request som det
skapas, och antalet oöversatta texter får aldrig öka. Äldre innehåll översätts i omgångar.

En text är ett objekt med svenska och eventuellt andra språk: {"sv": "…", "en": "…"}. Skriptet läser alla
datafiler som sidan visar (FILES nedan), utom poster med review "draft", och räknar per fil och språk hur många
texter som saknar språket. Siffrorna står i data/oversattning.json (baslinje) och får bara minska.

Inaktuella översättningar: data/oversattning.json har också ett register med en kort kontrollsumma av svenskan
och av översättningen för varje översatt text ("svenska:översättning"). Ändras den svenska texten men inte
översättningen står översättningen kvar i registret med den gamla svenskan, och då är den inaktuell: den
skrevs för en annan svensk text.
Samma översättning till två olika svenska texter är tillåtet så länge båda svenska texterna finns kvar ("Kartago"
och "Karthago" blir båda "Carthage"); den räknas bara som inaktuell när ingen av de registrerade svenska texterna
finns kvar med den.

  python3 tools/oversattning.py           kontrollerar, och skriver om baslinjen och registret om allt stämmer
  python3 tools/oversattning.py --check   skriver ingenting, avslutas med kod 1 om något inte stämmer
  python3 tools/oversattning.py --lista   visar varje oöversatt och inaktuell text (fil, plats, språk)

Fel som stoppar (både vid --check och när filen skrivs om):
  - fler oöversatta texter än baslinjen i en fil (ny text utan översättning)
  - en inaktuell översättning (svenskan har ändrats men inte översättningen)
Bara vid --check stoppar också en baslinje som är för hög eller en översättning som saknas i registret: kör då
skriptet utan --check och checka in data/oversattning.json.

Undantag, bara med Rikards ok: --tillat-okning skriver en högre baslinje (till exempel för ett nytt språk som
ännu inte har några texter, eller en ny fil), och --godta-inaktuella registrerar inaktuella översättningar som
ändå stämmer (till exempel när svenskan bara fick ett rättat stavfel).
"""
import hashlib
import json
import sys
from pathlib import Path

LANGS_FILE = 'data/ui/sprak.json'
STATUS = 'data/oversattning.json'
BASE_LANG = 'sv'

# Datafilerna med innehåll som sidan visar. Utkast (data/utkast/), de byggda filerna (data/genererat/,
# data/events.json) och gränssnittets texter (data/ui/, som tests/i18n.test.mjs kontrollerar) ingår inte.
FILES = [
    'data/handelser/*.json', 'data/empires/*.json', 'data/routes/*.json', 'data/turer/*.json',
    'data/funfacts.json', 'data/religions.json', 'data/intro.json', 'data/upptackt.json', 'data/vyer.json',
    'data/bildlager.json', 'data/styles.json',
]
NOTE = ('Genereras av tools/oversattning.py (#675). baseline: oöversatta texter per fil och språk, som bara får '
        'minska. register: kontrollsummor "svenska:översättning" per språk, som visar när en översättning har '
        'blivit inaktuell. Redigera inte för hand; kör python3 tools/oversattning.py.')


def short_hash(text):
    data = json.dumps(text, ensure_ascii=False, sort_keys=True).encode('utf-8')
    return hashlib.sha1(data).hexdigest()[:8]


def is_text(v, langs):
    """Samma regel som tools/dela_data.py: alla nycklar är språk, och svenskan finns."""
    return (isinstance(v, dict) and BASE_LANG in v and all(k in langs for k in v)
            and all(isinstance(x, (str, list)) for x in v.values()))


def texts(v, langs, path=''):
    """(plats, text) för varje text i v, utom i poster med review "draft"."""
    if is_text(v, langs):
        yield path, v
    elif isinstance(v, dict):
        if v.get('review') == 'draft':
            return
        for k, x in v.items():
            yield from texts(x, langs, f'{path}/{k}')
    elif isinstance(v, list):
        for i, x in enumerate(v):
            name = x['id'] if isinstance(x, dict) and isinstance(x.get('id'), str) else str(i)
            yield from texts(x, langs, f'{path}/{name}')


def read_langs(root):
    doc = json.loads((root / LANGS_FILE).read_text(encoding='utf-8'))
    return [lang['id'] for lang in doc['languages']]


def data_files(root):
    seen = []
    for pattern in FILES:
        for f in sorted(root.glob(pattern)):
            rel = f.relative_to(root).as_posix()
            if rel not in seen:
                seen.append(rel)
    return seen


def scan(root):
    """{fil: {språk: antal oöversatta}}, {språk: {par}}, [(fil, plats, språk, svenska-summa, översättnings-summa)]."""
    root = Path(root)
    langs = read_langs(root)
    others = [lang for lang in langs if lang != BASE_LANG]
    counts, pairs, found = {}, {lang: set() for lang in others}, []
    for rel in data_files(root):
        doc = json.loads((root / rel).read_text(encoding='utf-8'))
        per = {lang: 0 for lang in others}
        for path, text in texts(doc, set(langs)):
            sv = short_hash(text[BASE_LANG])
            for lang in others:
                if lang in text and text[lang]:
                    tr = short_hash(text[lang])
                    pairs[lang].add(f'{sv}:{tr}')
                    found.append((rel, path, lang, sv, tr))
                else:
                    per[lang] += 1
        counts[rel] = {lang: n for lang, n in per.items() if n}
    return {f: c for f, c in counts.items() if c}, pairs, found


def missing(root):
    """[(fil, plats, språk)] för varje oöversatt text."""
    root = Path(root)
    langs = read_langs(root)
    out = []
    for rel in data_files(root):
        doc = json.loads((root / rel).read_text(encoding='utf-8'))
        for path, text in texts(doc, set(langs)):
            out += [(rel, path, lang) for lang in langs if lang != BASE_LANG and not text.get(lang)]
    return out


def load_status(root):
    f = Path(root) / STATUS
    if not f.is_file():
        return {'baseline': {}, 'register': {}}
    return json.loads(f.read_text(encoding='utf-8'))


def compare(root, accept_stale=False):
    """(fel, påminnelser, ny status). Fel stoppar alltid; påminnelser stoppar bara vid --check."""
    counts, pairs, found = scan(root)
    status = load_status(root)
    baseline, register = status.get('baseline', {}), status.get('register', {})
    known_langs = set(status.get('languages', []))
    errors, reminders = [], []

    for rel, per in counts.items():
        for lang, n in per.items():
            # Ett nytt språk i data/ui/sprak.json börjar med det som finns; annars är en fil utan baslinje 0
            old = n if lang not in known_langs else baseline.get(rel, {}).get(lang, 0)
            if n > old:
                errors.append(f'{rel}: {n - old} {"ny text" if n - old == 1 else "nya texter"} utan {lang} '
                              f'({n} oöversatta, baslinjen är {old}). Översätt i samma pull request (beslut 2026-11-06).')
            elif n < old:
                reminders.append(f'{rel}: {old - n} färre oöversatta på {lang} än baslinjen')
    for rel, per in baseline.items():
        for lang, old in per.items():
            if counts.get(rel, {}).get(lang, 0) == 0 and old:
                reminders.append(f'{rel}: inga oöversatta på {lang} längre (baslinjen är {old})')

    # Inaktuella: översättningen finns i registret, men med en annan svensk text
    # tr -> de svenska texter (kontrollsummor) som översättningen står registrerad för. Samma översättning kan höra
    # till flera olika svenska texter ("Kartago" och "Karthago" blir båda "Carthage"); den är bara inaktuell när
    # ingen av de registrerade svenska texterna finns kvar med den översättningen.
    known_tr = {lang: {} for lang in pairs}
    for lang in pairs:
        for p in register.get(lang, []):
            old_sv, old_tr = p.split(':')
            known_tr[lang].setdefault(old_tr, set()).add(old_sv)
    present = {lang: {p.split(':')[0] + ':' + p.split(':')[1] for p in pairs[lang]} for lang in pairs}
    stale = set()
    for rel, path, lang, sv, tr in found:
        pair = f'{sv}:{tr}'
        if pair in register.get(lang, []):
            continue
        olds = known_tr.get(lang, {}).get(tr, set())
        still_there = any(f'{old_sv}:{tr}' in present[lang] for old_sv in olds)
        if olds and not still_there and not accept_stale:
            stale.add((lang, pair))
            errors.append(f'{rel} {path}: översättningen till {lang} är inaktuell; den svenska texten har ändrats '
                          f'efter översättningen. Uppdatera översättningen i samma pull request.')
        else:
            reminders.append(f'{rel} {path}: ny översättning till {lang} som inte är registrerad')
    for lang, regs in register.items():
        gone = set(regs) - pairs.get(lang, set())
        if gone:
            reminders.append(f'registret har {len(gone)} gamla poster för {lang}')

    new_pairs = {lang: sorted(p for p in ps if (lang, p) not in stale) for lang, ps in pairs.items()}
    new_status = {'note': NOTE, 'languages': sorted(pairs), 'baseline': {rel: dict(sorted(per.items())) for rel, per in sorted(counts.items())},
                  'register': {lang: ps for lang, ps in sorted(new_pairs.items()) if ps}}
    return errors, reminders, new_status


def dump(status):
    c = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    lines = [f'{{"note":{c(status["note"])},', f'"languages":{c(status["languages"])},', '"baseline":{']
    lines.append(',\n'.join(f'{c(k)}:{c(v)}' for k, v in status['baseline'].items()))
    lines.append('},\n"register":{')
    regs = []
    for lang, ps in status['register'].items():
        regs.append(f'{c(lang)}:[\n' + ',\n'.join(c(p) for p in ps) + '\n]')
    lines.append(',\n'.join(regs))
    lines.append('}}')
    return '\n'.join(lines) + '\n'


def summary(status):
    totals = {}
    for per in status['baseline'].values():
        for lang, n in per.items():
            totals[lang] = totals.get(lang, 0) + n
    return ', '.join(f'{lang}: {n}' for lang, n in sorted(totals.items())) or 'inga'


def main():
    root = Path(__file__).resolve().parent.parent
    args = sys.argv[1:]
    if '--lista' in args:
        for rel, path, lang in missing(root):
            print(f'{lang}  {rel}  {path}')
        errors, _, _ = compare(root)
        for e in errors:
            print(e)
        return
    errors, reminders, status = compare(root, accept_stale='--godta-inaktuella' in args)
    if '--tillat-okning' in args:
        errors = [e for e in errors if 'baslinjen är' not in e]
    if '--check' in args:
        problems = errors + reminders
        for e in problems:
            print(f'oversattning: {e}', file=sys.stderr)
        if reminders and not errors:
            print('oversattning: kör python3 tools/oversattning.py och checka in data/oversattning.json',
                  file=sys.stderr)
        sys.exit(1 if problems else 0)
    if errors:
        for e in errors:
            print(f'oversattning: {e}', file=sys.stderr)
        print('oversattning: ingenting skrevs', file=sys.stderr)
        sys.exit(1)
    (root / STATUS).write_text(dump(status), encoding='utf-8')
    print(f'{STATUS}: oöversatta texter {summary(status)}')


if __name__ == '__main__':
    main()
