# Skiss för #1094/#1095: osäkerhet på kartan i 400 px med simulerad färgblindhet.
# Körs från repots rot: python3 docs/skisser/2026-11-13-forhistoria-osakerhet/skiss.py
# Skriver html/ (läggs inte i repot); bilderna tas med Playwright, se README.md.
import json,sys,html
out=sys.argv[1] if len(sys.argv)>1 else "docs/skisser/2026-11-13-forhistoria-osakerhet/html"; import os; os.makedirs(out, exist_ok=True)
land=json.load(open('data/land.json'))['path']
ev=[e for e in json.load(open('data/events.json'))['events'] if e['category']=='manniskan' and e['start']< -9999]
X=lambda lon:(lon+180)/360*4096; Y=lambda lat:(90-lat)/180*2048
vx,vy,vw,vh=X(-20),Y(58),X(150)-X(-20),Y(-42)-Y(58)
pts=[]
for e in ev:
    lon,lat=e['location']['coordinates']
    pts.append((X(lon),Y(lat),e['title']['sv'],bool(e.get('locationPrecision')),e['end']< -99999,e['start']< -99999))
def dot(x,y,reg):
    if reg: return f'<circle cx="{x:.0f}" cy="{y:.0f}" r="40" fill="rgba(11,23,36,.35)" stroke="#d6b06a" stroke-width="8" stroke-dasharray="12 9"/><circle cx="{x:.0f}" cy="{y:.0f}" r="13" fill="#d6b06a"/>'
    return f'<circle cx="{x:.0f}" cy="{y:.0f}" r="24" fill="#d6b06a" stroke="#0b1724" stroke-width="8"/>'
marks=''.join(dot(x,y,r) for x,y,_,r,before,_s in pts if not before)
mono='font-family="IBM Plex Mono, monospace"'
area=f'<ellipse cx="{X(30):.0f}" cy="{Y(5):.0f}" rx="230" ry="300" fill="url(#hatch)" stroke="#ecdfc2" stroke-width="6" stroke-dasharray="20 14"/><text x="{X(30):.0f}" y="{Y(5):.0f}" fill="#ecdfc2" font-size="58" text-anchor="middle" {mono}>EXEMPEL</text><text x="{X(30):.0f}" y="{Y(5)+64:.0f}" fill="#ecdfc2" font-size="46" text-anchor="middle" {mono}>tolkning</text>'
def wave(p,lab,anchor='start',dx=14,dy=-18):
    d='M'+' L'.join(f'{X(a):.0f},{Y(b):.0f}' for a,b in p); a,b=p[-1]
    return f'<path d="{d}" fill="none" stroke="#ecdfc2" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round"/><text x="{X(a)+dx:.0f}" y="{Y(b)+dy:.0f}" fill="#ecdfc2" font-size="42" text-anchor="{anchor}" {mono}>{lab}</text>'
waves=wave([(38,10),(45,20),(60,25),(80,22)],'våg? (exempel)')+wave([(38,10),(48,15),(70,12),(100,5),(120,-5)],'våg? (exempel)','end',0,-30)
svgmap=f'''<svg viewBox="{vx:.0f} {vy:.0f} {vw:.0f} {vh:.0f}" width="100%" role="img" aria-label="Skiss: fyndplatser som punkter, antagna områden och vågor som streckade exempelformer">
<defs><pattern id="hatch" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="28" height="28" fill="rgba(236,223,194,.10)"/><line x1="0" y1="0" x2="0" y2="28" stroke="rgba(236,223,194,.35)" stroke-width="6"/></pattern></defs>
<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" fill="#13324a"/><path d="{land}" fill="#c8b48a"/>{area}{waves}{marks}</svg>'''
def flag(b,s): return ' <em>(före tidslinjen, syns inte på kartan)</em>' if b else (' <em>(börjar före tidslinjen)</em>' if s else '')
items=''.join(f'<li><span class="k {"r" if r else "p"}"></span><span>{html.escape(t)}{flag(b,s)}</span></li>' for _,_,t,r,b,s in sorted(pts,key=lambda p:p[2]))
filters='''<svg width="0" height="0" style="position:absolute"><defs>
<filter id="deut"><feColorMatrix type="matrix" values="0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0"/></filter>
<filter id="prot"><feColorMatrix type="matrix" values="0.152 1.053 -0.205 0 0  0.115 0.786 0.099 0 0  -0.004 -0.048 1.052 0 0  0 0 0 1 0"/></filter>
<filter id="trit"><feColorMatrix type="matrix" values="1.256 -0.077 -0.179 0 0  -0.078 0.931 0.148 0 0  0.005 0.691 0.304 0 0  0 0 0 1 0"/></filter>
<filter id="gray"><feColorMatrix type="saturate" values="0"/></filter></defs></svg>'''
css='''body{margin:0;background:#0b1724;color:#ecdfc2;font:14px/1.45 "Instrument Sans",system-ui,sans-serif}
.w{width:400px;padding:12px 16px;box-sizing:border-box}h1{font:400 20px "IM Fell English",serif;color:#d6b06a;margin:4px 0}
.note{font:11.5px/1.4 "IBM Plex Mono",monospace;color:#a9a08c}.leg{display:grid;gap:6px;margin:10px 0;font-size:13px}
.leg div{display:flex;gap:8px;align-items:center}.k{display:inline-block;width:14px;height:14px;border-radius:50%;flex:none}
.k.p{background:#d6b06a;box-shadow:0 0 0 2px #0b1724}.k.r{border:2px dashed #d6b06a;background:radial-gradient(#d6b06a 30%,transparent 32%)}
.k.a{border-radius:3px;border:2px dashed #ecdfc2;background:repeating-linear-gradient(35deg,rgba(236,223,194,.35) 0 2px,transparent 2px 5px)}
.k.v{border-radius:0;height:0;border-top:3px dotted #ecdfc2;width:18px}
.card{background:#14243a;border:1px solid #2c3d55;border-radius:10px;padding:10px 12px;margin-top:10px}
.card h3{margin:0 0 2px;font:400 17px "IM Fell English",serif}.meta{font:11.5px "IBM Plex Mono",monospace;color:#a9a08c}
.tag{display:inline-block;border:1px dashed #ecdfc2;border-radius:4px;padding:0 5px;font:11px "IBM Plex Mono",monospace;margin-right:4px}
ul{padding-left:0;list-style:none;margin:6px 0}li{display:flex;gap:8px;align-items:flex-start;margin:4px 0}li .k{margin-top:3px}em{color:#a9a08c}'''
def page(f,label):
    return f'''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=400"><style>{css}</style>{filters}
<div class="w" style="filter:{f}"><h1>Skiss: osäkerhet på kartan (#1094, #1095)</h1>
<p class="note">{label} · 400 px · Fyndplatserna är riktiga (data/events.json). Ytan och vågorna är EXEMPELFORMER utan data.</p>
{svgmap}
<div class="leg"><div><span class="k p"></span>Fyndplats (en grotta med egen koordinat)</div><div><span class="k r"></span>Fyndplats, ungefärlig (står för ett större område)</div>
<div><span class="k a"></span>Antaget område: streckad kant, randning och ordet "tolkning"</div><div><span class="k v"></span>Möjlig våg: prickad linje, frågetecken, flera grenar</div></div>
<div class="card"><h3>Homo sapiens i Tam Pà Ling i Laos</h3><div class="meta">cirka 75 000–68 000 f.Kr. · fyndplats</div>
<p style="margin:6px 0"><span class="tag">fyndplats</span><span class="tag">cirka</span></p>
<p class="note">Detaljen (spann, källa, oenighet) ligger i faktarutan, inte på kartan.</p></div>
<div class="card"><h3>Som lista (textalternativ, #1106)</h3><ul>{items}</ul></div></div>'''
for f,lab,fn in [('none','Normal färgsyn','normal'),('url(#deut)','Simulerad deuteranopi (grönsvag)','deut'),('url(#prot)','Simulerad protanopi (rödsvag)','prot'),('url(#trit)','Simulerad tritanopi (blåsvag)','trit'),('url(#gray)','Gråskala','gray')]:
    open(f'{out}/{fn}.html','w').write(page(f,lab))
