"""Storyboard v2 del reel Giemme DVR: scheda G (tile, nido d'ape, chevron) nei colori Giemme, con i fotogrammi veri nel nuovo look."""
import base64, json, os, sys

S = os.path.dirname(os.path.abspath(__file__))
G = os.path.dirname(S)
OUT = sys.argv[1]
faces = json.load(open(f"{S}/faces.json"))
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
IMG = {k: "data:image/jpeg;base64," + b64(f"{S}/{k}.jpg") for k in faces}
AUDIO = "data:audio/mpeg;base64," + b64(f"{G}/voce.mp3")
REF1 = "data:image/png;base64," + b64(f"{G}/../rif2/big1.png")
COVER = "data:image/jpeg;base64," + b64(f"{S}/cop.jpg")

INK, RED, PINK = "#1A1A1E", "#E50210", "#FFC9C4"

def vid(fid, z=1.18, target=0.41):
    fx, fy, _ = faces[fid]
    left = max((1 - z) * 100, min(0, 50 - fx * z * 100))
    top = max((1 - z) * 100, min(0, target * 100 - fy * z * 100))
    return f'<img class="bg" alt="" src="{IMG[fid]}" style="width:{z*100:.1f}%;height:{z*100:.1f}%;left:{left:.1f}%;top:{top:.1f}%">'

PAPER = '<div class="paper"></div><div class="sphere" style="left:-18%;top:-8%"></div><div class="sphere s2" style="right:-22%;top:58%"></div>'
ARCS = f'<svg class="arcs" viewBox="0 0 100 178" preserveAspectRatio="none"><path d="M-2 40 A 34 34 0 0 0 30 -2" stroke="{RED}" stroke-width=".8" fill="none"/><path d="M70 180 A 40 40 0 0 1 102 128" stroke="{RED}" stroke-width=".8" fill="none"/></svg>'

def line(paths, vb="0 0 100 100"):
    return f'<svg viewBox="{vb}" class="ill">{paths}</svg>'

# ---------- illustrazioni line art (contorno grafite, riempimenti bianco e rosa) ----------
st = f'stroke="{INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"'
ILL = {
    "archivio": line(f'''<rect x="22" y="14" width="56" height="74" rx="5" fill="#fff" {st}/>
      <rect x="28" y="22" width="44" height="18" rx="3" fill="{PINK}" {st}/><rect x="28" y="46" width="44" height="18" rx="3" fill="#fff" {st}/>
      <rect x="28" y="70" width="44" height="12" rx="3" fill="#fff" {st}/><path d="M44 31h12M44 55h12" {st}/>
      <g transform="translate(52,4) rotate(12)"><rect width="26" height="32" rx="2" fill="#fff" {st}/><path d="M5 9h16M5 15h12M5 21h14" {st}/><rect x="17" y="25" width="5" height="5" fill="{RED}"/></g>'''),
    "puntina": line(f'''<rect x="16" y="20" width="68" height="56" rx="6" fill="#fff" {st}/><rect x="26" y="32" width="30" height="22" rx="2" fill="{PINK}" {st}/>
      <path d="M62 34h12M62 42h10M30 64h40" {st}/><circle cx="41" cy="30" r="6" fill="{RED}" {st}/><path d="M41 36v6" {st}/>'''),
    "interruttore": line(f'''<rect x="14" y="34" width="72" height="34" rx="17" fill="{PINK}" {st}/><circle cx="68" cy="51" r="13" fill="#fff" {st}/>
      <path d="M28 51h14" {st}/><text x="26" y="86" font-family="Mulish" font-weight="800" font-size="13" fill="{INK}">ON</text>'''),
    "occhio": line(f'''<path d="M10 50 C 28 24, 72 24, 90 50 C 72 76, 28 76, 10 50z" fill="#fff" {st}/><circle cx="50" cy="50" r="15" fill="{PINK}" {st}/>
      <circle cx="50" cy="50" r="6" fill="{INK}"/><circle cx="54" cy="46" r="2" fill="#fff"/>'''),
    "lavoratore": line(f'''<path d="M30 40 a20 20 0 0 1 40 0z" fill="{RED}" {st}/><rect x="25" y="39" width="50" height="6" rx="3" fill="{INK}"/>
      <circle cx="50" cy="54" r="11" fill="#fff" {st}/><path d="M26 92 c4-18 44-18 48 0" fill="{PINK}" {st}/>'''),
    "ufficio": line(f'''<rect x="18" y="24" width="64" height="40" rx="4" fill="#fff" {st}/><rect x="24" y="30" width="52" height="28" rx="2" fill="{PINK}" {st}/>
      <path d="M40 64v10h20V64M30 78h40" {st}/><path d="M30 38h22M30 46h14" {st}/>'''),
    "cantiere": line(f'''<path d="M30 88V20h6v68M36 26h46l-6 8H36" fill="#fff" {st}/><path d="M74 34v18" {st}/><rect x="66" y="52" width="16" height="12" fill="{PINK}" {st}/>
      <path d="M22 88h40" {st}/><path d="M30 34l6 8M30 50l6 8M30 66l6 8" {st}/>'''),
    "magazzino": line(f'''<path d="M16 86V40l34-18 34 18v46z" fill="#fff" {st}/><rect x="28" y="56" width="18" height="14" fill="{PINK}" {st}/><rect x="48" y="56" width="18" height="14" fill="#fff" {st}/>
      <rect x="38" y="42" width="18" height="14" fill="{PINK}" {st}/><path d="M16 86h68" {st}/>'''),
    "macchine": line(f'''<circle cx="44" cy="54" r="20" fill="#fff" {st}/><circle cx="44" cy="54" r="8" fill="{PINK}" {st}/>
      <path d="M44 28v6M44 74v6M18 54h6M64 54h6M26 36l4 4M58 68l4 4M26 72l4-4M58 40l4-4" {st}/><circle cx="74" cy="30" r="10" fill="{PINK}" {st}/><circle cx="74" cy="30" r="3" fill="{RED}"/>'''),
    "scudo": line(f'''<path d="M50 10l34 12v26c0 22-15 38-34 46C31 86 16 70 16 48V22z" fill="#fff" {st}/>
      <path d="M50 20l24 8v20c0 16-11 28-24 34-13-6-24-18-24-34V28z" fill="{PINK}" stroke="none"/><path d="M36 50l10 10 20-22" stroke="{RED}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'''),
    "azienda": line(f'''<path d="M10 84V46l22-12v12l22-12v12l22-12v50z" fill="#fff" {st}/><rect x="62" y="24" width="24" height="60" fill="{PINK}" {st}/>
      <path d="M68 34h12M68 44h12M68 54h12M68 64h12" {st}/><rect x="20" y="62" width="10" height="22" fill="{PINK}" {st}/><rect x="40" y="58" width="12" height="10" fill="#fff" {st}/><path d="M6 84h88" {st}/>
      <rect x="80" y="14" width="7" height="7" fill="{RED}"/>'''),
}
def hazard(sym):
    s = {"!": '<path d="M20 15v8" stroke="#111" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="28" r="1.8" fill="#111"/>',
         "el": '<path d="M22 12l-6 10h5l-3 9 7-11h-5z" fill="#111"/>',
         "ru": '<path d="M14 18h4l5-4v14l-5-4h-4z" fill="#111"/>',
         "ca": '<path d="M20 12v12M15 20l5 6 5-6M13 30h14" stroke="#111" stroke-width="2.8" fill="none" stroke-linecap="round"/>'}[sym]
    return f'<svg viewBox="0 0 40 40" class="ill"><path d="M20 5L36 33H4z" fill="#FFC21A" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/>{s}</svg>'

def tile(ill, label, x, y, w, cls=""):
    return f'<div class="tile {cls}" style="left:{x}%;top:{y}%;width:{w}%">{ill}<span>{label}</span></div>'

def hexcell(x, y, inner="", cls=""):
    return f'<div class="hex {cls}" style="left:{x}%;top:{y}%">{inner}</div>'

def honey(cells):
    """griglia a nido d'ape: cells = {(col,row): html}"""
    out = []
    for r in range(6):
        for c in range(5):
            x = 4 + c * 19 + (9.5 if r % 2 else 0)
            y = 22 + r * 9.2
            if x > 86:
                continue
            out.append(hexcell(x, y, cells.get((c, r), ""), "on" if (c, r) in cells else ""))
    return "".join(out)

def nav(active):
    labels = ["Attività", "Rischi", "Misure"]
    return '<div class="nav">' + "".join(
        f'<div class="nt {"on" if i == active else ("done" if i < active else "")}"><b>0{i+1}</b><span>{l}</span></div>' for i, l in enumerate(labels)) + '</div>'

def pill(text, x, y, cls="", strike=False):
    return f'<div class="pill {cls}" style="left:{x}%;top:{y}%">{text}{"<i></i>" if strike else ""}</div>'

UNDER = f'<svg class="under" viewBox="0 0 600 40"><path d="M8 26 C 140 8, 320 6, 592 18 M60 34 C 220 22, 400 22, 560 30" stroke="{RED}" stroke-width="11" fill="none" stroke-linecap="round"/></svg>'
CURSOR = '<svg class="cursor" viewBox="0 0 24 24"><path d="M4 2l15 11-7 1-3 7z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>'

def chevrons(text_html):
    return f'''<svg class="chev" viewBox="0 0 100 178" preserveAspectRatio="none"><defs><linearGradient id="cg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7A000C"/><stop offset="1" stop-color="{RED}"/></linearGradient></defs>
    <path d="M-40 0 H40 L95 89 L40 178 H-40z" fill="url(#cg)"/><path d="M-10 0 H60 L115 89 L60 178 H-10z" fill="url(#cg)" opacity=".85"/>
    <path d="M60 0 L115 89 L60 178" stroke="rgba(255,255,255,.35)" stroke-width=".5" fill="none"/></svg><div class="chevtext">{text_html}</div>'''

ACTS = [("ufficio", "Ufficio"), ("cantiere", "Cantiere"), ("magazzino", "Magazzino"), ("macchine", "Macchine")]

SC = []
def scene(**k): SC.append(k)

scene(t0=0.00, t1=0.87, title="Hook", frame=vid("F01") + f'<div class="sub" style="top:55%">Il tuo DVR è in un</div><div class="kw" style="top:60.5%">cassetto?{UNDER}</div>',
      quote="«Il DVR…»", video="Parlato nel nuovo look, push-in lento.",
      testi="«Il tuo DVR è in un» entra parola per parola da sfocato; <b>cassetto?</b> grande, con la sottolineatura rossa tracciata a mano (si disegna in 8 frame).",
      trans="—", sfx="<code>blast_whoosh</code> sul titolo.")
scene(t0=0.87, t1=3.43, title="Il mito", frame=vid("F02", z=1.12) + '<div class="sub" style="top:56%">non è <b class="r">solamente</b></div><div class="sub" style="top:61%">un documento</div>',
      quote="«…non è solamente un documento che un'azienda deve tenere…»", video="Punch-in (+8%) sul taglio dell'inciso.",
      testi="Sottotitoli 1-4 parole, «solamente» evidenziato in una pillola rossa.", trans="Punch-in.", sfx="<code>tick_rapido</code>.")
scene(t0=3.43, t1=5.33, title="Nel cassetto", frame=PAPER + '<div class="h" style="top:13%">nel <b class="r">cassetto</b></div>' + tile(ILL["archivio"], "Archivio", 18, 21.5, 64, "big") + pill("✓ in regola", 50, 63.5, "out big", strike=True),
      quote="«…nel cassetto affinché possa essere in regola.»",
      video="Zoom out sul fondo chiaro a puntini, con una sfera rosa che scivola. Il <b>tile rosso</b> entra da sfocato; dentro, il foglio DVR scivola nel cassetto, che si chiude.",
      testi="Pillola «✓ in regola» che viene barrata da una riga rossa.", trans="Zoom out con sfocatura (6 frame).", sfx="<code>low_whoosh</code>, <code>tap_grave</code> sulla chiusura, <code>click_secco</code> sulla barra.")
scene(t0=5.33, t1=7.33, title="Che cos'è un DVR", frame=vid("F04") + '<div class="sub" style="top:54%">Sai che cos\'è realmente un DVR?</div>'
      + "".join(tile(f'<div class="letter">{l}</div>', w, 8 + i * 29, 59, 26, "mini") for i, (l, w) in enumerate([("D", "Documento"), ("V", "Valutazione"), ("R", "Rischi")])),
      quote="«Sai che cos'è realmente un DVR?»", video="Zoom in di ritorno al parlato; punch-in su «DVR».",
      testi="Tre tile piccoli <b>D · V · R</b> entrano uno dopo l'altro (0,4 s), da sfocati a nitidi, con le etichette Documento · Valutazione · Rischi.",
      trans="Zoom in.", sfx="<code>attack_whoosh</code> → <code>boom_sub</code> su «DVR», <code>short_whoosh</code> per ogni tile.")
scene(t0=7.33, t1=12.93, title="Presente · attivo · visionabile", frame=PAPER + f'<div class="vtile" style="left:29%;top:12.5%;width:42%"><img alt="" src="{IMG["F05"]}"></div>'
      + '<div class="h sm" style="top:38%">Tale documento deve essere</div>'
      + tile(ILL["puntina"], "presente", 4, 45, 29, "dim") + tile(ILL["interruttore"], "attivo", 34.5, 44, 31, "sel") + tile(ILL["occhio"], "visionabile", 67, 45, 29, "dim")
      + '<div class="checks" style="top:63%"><span>✓</span><span>✓</span><span>○</span></div>' + pill("di tutta l'azienda", 50, 70, "out"),
      quote="«Tale documento deve essere presente, attivo e visionabile da parte di tutta l'azienda…»",
      video="Il parlato si rimpicciolisce in un tile in alto (unica apparizione del soggetto negli esempi). Sotto, i tre tile con le illustrazioni entrano mentre li dice: quello appena nominato cresce, gli altri si attenuano.",
      testi="Etichette nei tile; sotto, le spunte che si accendono e la pillola «di tutta l'azienda» quando lo dice.", trans="Zoom out.", sfx="<code>short_whoosh</code> alternati, <code>doppio_click</code> sulle spunte.")
scene(t0=12.93, t1=14.03, title="Tutti i lavoratori", frame=PAPER + ARCS + '<div class="h" style="top:13%">da parte di <b class="r">tutti</b> i lavoratori</div>'
      + honey({(c, r): ILL["lavoratore"] for c, r in [(1, 0), (2, 1), (0, 1), (3, 2), (1, 2), (2, 3), (0, 3), (3, 4), (1, 4)]}),
      quote="«…da parte di tutti i lavoratori.»", video="Il tile del soggetto esce verso l'alto. Il nido d'ape si riempie di lavoratori con il casco, cella per cella; un arco rosso attraversa l'angolo.",
      testi="«tutti» in rosso.", trans="—", sfx="<code>tick_rapido</code> in sequenza.")
scene(t0=14.03, t1=19.87, title="01 · Attività", frame=PAPER + ARCS + nav(0)
      + honey({(1, 0): ILL["ufficio"], (2, 1): ILL["cantiere"], (1, 2): ILL["magazzino"], (2, 3): ILL["macchine"]})
      + "".join(f'<div class="hl" style="left:{x}%;top:{y}%">{t}</div>' for x, y, t in [(4, 27, "Ufficio"), (73, 37, "Cantiere"), (4, 46, "Magazzino"), (73, 55, "Macchine")]),
      quote="«All'interno del documento vengono analizzate le singole attività lavorative,»",
      video="Senza soggetto. In alto il <b>navigatore</b> 01 · 02 · 03, con 01 pieno e più grande. Nel nido d'ape le attività si accendono una alla volta, con l'etichetta accanto.",
      testi="Navigatore che resta per tre scene.", trans="Film burn leggero all'ingresso; archi che ruotano.", sfx="<code>digital_whoosh</code>, <code>tick_rapido</code> per cella.")
scene(t0=19.87, t1=23.63, title="02 · Rischi", frame=PAPER + ARCS + nav(1)
      + honey({(1, 0): ILL["ufficio"], (2, 0): hazard("!"), (2, 1): ILL["cantiere"], (3, 1): hazard("el"), (1, 2): ILL["magazzino"], (0, 2): hazard("ca"), (2, 3): ILL["macchine"], (3, 3): hazard("ru")})
      + f'<svg class="links" viewBox="0 0 100 178" preserveAspectRatio="none"><g stroke="{INK}" stroke-width=".5" stroke-dasharray="1.4 1.4" fill="none"><path d="M42 47 L56 44"/><path d="M60 63 L74 60"/><path d="M28 80 L16 80"/><path d="M60 96 L74 93"/></g></svg>',
      quote="«vengono correlati i vari rischi a queste attività lavorative,»",
      video="Navigatore su 02 (01 spuntato). Nelle celle vicine compaiono i cartelli di pericolo, collegati alle attività da linee tratteggiate che si disegnano.",
      testi="—", trans="Nessuno stacco.", sfx="<code>quick_whoosh</code>, <code>tick_rapido</code> per cartello.")
scene(t0=23.63, t1=30.11, title="03 · Misure", frame=PAPER + ARCS + nav(2) + tile(ILL["scudo"], "Misure", 22, 23, 56, "big grad")
      + pill("prevenzione", 28, 62, "red") + pill("tecniche", 72, 62, "red") + pill("organizzative", 50, 69, "red"),
      quote="«e infine si vanno a strutturare le misure di prevenzione, le tecniche organizzative,»",
      video="Navigatore su 03. Il nido d'ape si stringe e al centro cresce un tile grande con gradiente rosso → bianco e lo scudo in line art. Le tre pillole entrano sulle parole.",
      testi="A schermo la forma corretta: prevenzione · tecniche · organizzative.", trans="Zoom sul tile.", sfx="<code>swoosh_brillante</code>, <code>doppio_click</code>.")
scene(t0=30.11, t1=33.47, title="Ridurre il rischio", frame=vid("F10", z=1.10) + '<div class="sub" style="top:54%">per mitigare e <b class="r">ridurre</b></div>'
      + '<div class="risk" style="top:61%"><div class="track"><i></i></div><div class="lab"><span>BASSO</span><span>ALTO</span></div></div>' + '<div class="chevpeek"></div>',
      quote="«per mitigare e ridurre l'esposizione al rischio.»",
      video="I <b>chevron rossi</b> spazzano lo schermo da sinistra a destra e scoprono il parlato (a destra si vede la coda dell'ultimo chevron). Sotto il mento la barra del rischio a pillola: il cursore scivola da ALTO a BASSO.",
      testi="«ridurre» in una pillola rossa.", trans="Chevron (10 frame).", sfx="<code>hollow_whoosh</code>; <code>riser_tonale</code> che chiude su «rischio» con <code>boom_sub</code>.")
scene(t0=33.47, t1=39.31, title="L'azienda e il suo ciclo", frame=PAPER + '<div class="h" style="top:13%">rappresentare <b class="r">realmente</b> l\'azienda</div>'
      + f'<svg class="cycle" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" stroke="{RED}" stroke-width="1" fill="none" stroke-dasharray="6 4"/><path d="M93 44 l2 8 l-7 -3" fill="{RED}"/></svg>'
      + tile(ILL["azienda"], "", 27, 24, 46, "big")
      + pill("progetto", 20, 20.5, "out") + pill("produzione", 80, 33, "out") + pill("consegna", 80, 57, "out") + pill("manutenzione", 21, 64, "out")
      + '<div class="h sm" style="top:71%">e il suo <b class="r">ciclo lavorativo</b></div>',
      quote="«Il DVR quindi deve rappresentare realmente l'azienda e il suo ciclo lavorativo.»",
      video="Parlato fino a «realmente» (parola chiave in pillola), poi zoom out sul tile grande con l'azienda in line art. Intorno, l'anello tratteggiato del ciclo gira e le quattro fasi entrano in pillola.",
      testi="Titolo in alto e frase finale sotto, in rosso le parole chiave.", trans="Zoom out.", sfx="<code>low_slow_whoosh</code>, <code>tick_rapido</code> per le fasi.")
scene(t0=39.31, t1=40.95, title="E tu?", frame=chevrons('<div class="ct1">E tu?</div><div class="ct2">Sapevi cosa fosse<br>un DVR?</div>'),
      quote="«E tu? Sapevi cosa fosse un DVR?»",
      video="I <b>chevron rossi</b> coprono lo schermo; il testo bianco entra parola per parola, allineato a sinistra.",
      testi="«E tu?» grande, poi la domanda.", trans="Chevron.", sfx="<code>blast_whoosh</code>, <code>tick_rapido</code> sulle parole.")
scene(t0=40.95, t1=42.33, title="Fammelo sapere", frame=vid("F13", z=1.12) + '<div class="sub" style="top:55%">Fammelo sapere</div>' + pill("Scrivilo nei commenti", 50, 61.5, "red big") + f'<div style="position:absolute;left:58%;top:64.5%;width:8%">{CURSOR}</div>',
      quote="«Fammelo sapere.»",
      video="I chevron escono a destra e torna il parlato. Sotto il mento il bottone a pillola rosso: il <b>cursore</b> arriva e lo clicca, il bottone si abbassa. Zoom out morbido. Niente logo.",
      testi="—", trans="Chevron in uscita.", sfx="<code>click_secco</code> sul clic, <code>swoosh_brillante</code>.")

fmt = lambda t: f"{int(t//60)}:{t%60:05.2f}".replace(".", ",")
rows = []
for i, s in enumerate(SC, 1):
    rows.append(f'''<article class="scene"><div class="frame">{s["frame"]}<div class="safe"></div><div class="safetop"></div></div><div class="meta">
<div class="tc"><span>{i:02d}</span>{fmt(s["t0"])} → {fmt(s["t1"])} · {s["t1"]-s["t0"]:.1f} s<button class="play" type="button" data-a="{s["t0"]}" data-b="{s["t1"]}">▶ ascolta</button></div>
<h3>{s["title"]}</h3><p class="quote">{s["quote"]}</p>
<dl><dt>Video</dt><dd>{s["video"]}</dd><dt>Testi</dt><dd>{s["testi"]}</dd><dt>Transizione</dt><dd>{s["trans"]}</dd><dt>SFX</dt><dd>{s["sfx"]}</dd></dl></div></article>''')

html = open(f"{S}/template_sb2.html").read()
html = html.replace("%%SCENES%%", "\n".join(rows)).replace("%%AUDIO%%", AUDIO).replace("%%REF%%", REF1).replace("%%COVER%%", COVER)
open(OUT, "w").write(html)
print("ok", len(html) // 1024, "KB")
