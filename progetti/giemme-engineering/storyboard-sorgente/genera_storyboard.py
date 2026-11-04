"""Genera lo storyboard HTML del reel Giemme "DVR" con i fotogrammi veri e i mock dei b-roll."""
import base64, json, sys, os

S = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
faces = json.load(open(f"{S}/sb/faces.json"))

def b64(p):
    return base64.b64encode(open(p, "rb").read()).decode()

IMG = {k: "data:image/jpeg;base64," + b64(f"{S}/sb/{k}.jpg") for k in faces}
AUDIO = "data:audio/mpeg;base64," + b64(f"{S}/voce.mp3")

RED = "#E50210"

def vid(fid, z=1.18, target=0.41):
    """Video a schermo intero: zoom z e viso portato a 'target' dell'altezza (max 118%)."""
    fx, fy, _ = faces[fid]
    left = max((1 - z) * 100, min(0, 50 - fx * z * 100))
    top = max((1 - z) * 100, min(0, target * 100 - fy * z * 100))
    return f'<img class="bg" alt="" src="{IMG[fid]}" style="width:{z*100:.1f}%;height:{z*100:.1f}%;left:{left:.1f}%;top:{top:.1f}%">'

def card(fid, cls="card", style=""):
    fx, fy, _ = faces[fid]
    return (f'<div class="{cls}" style="{style}"><img alt="" src="{IMG[fid]}" '
            f'style="object-position:{fx*100:.0f}% {max(0,(fy-0.08))*100:.0f}%"></div>')

GRID = '<div class="grid"></div>'
SQ = '<i class="sq"></i>'

def tag(text, check=False, style=""):
    c = '<svg class="ck" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#1F9D55"/><path d="M5.5 10.5l3 3 6-7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' if check else ""
    return f'<div class="tag" style="{style}"><b></b><b></b><b></b><b></b>{SQ}<span>{text}</span>{c}</div>'

# ---------- disegni SVG dei b-roll ----------
DRAWER = f'''<svg viewBox="0 0 300 230" class="art" style="left:9%;top:25%;width:82%">
 <!-- mobile isometrico -->
 <polygon points="40,70 150,15 260,70 150,125" fill="#ffffff" stroke="#1A1A1E" stroke-width="2"/>
 <polygon points="40,70 150,125 150,225 40,170" fill="#E9E9E6" stroke="#1A1A1E" stroke-width="2"/>
 <polygon points="150,125 260,70 260,170 150,225" fill="#DADAD6" stroke="#1A1A1E" stroke-width="2"/>
 <!-- cassetto che si chiude -->
 <polygon points="60,108 130,143 130,178 60,143" fill="#fff" stroke="#1A1A1E" stroke-width="2"/>
 <line x1="82" y1="134" x2="108" y2="147" stroke="{RED}" stroke-width="4" stroke-linecap="round"/>
 <!-- documento che scivola dentro -->
 <g transform="translate(70,40) rotate(-8)"><rect width="62" height="80" rx="3" fill="#fff" stroke="#1A1A1E" stroke-width="2"/>
 <text x="9" y="22" font-family="Inter Tight" font-weight="800" font-size="15" fill="#1A1A1E">DVR</text>
 <rect x="9" y="32" width="44" height="3" fill="#C9C9C4"/><rect x="9" y="41" width="36" height="3" fill="#C9C9C4"/><rect x="9" y="50" width="40" height="3" fill="#C9C9C4"/>
 <rect x="45" y="62" width="8" height="8" fill="{RED}"/></g>
 <path d="M101,125 v14" stroke="#1A1A1E" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#ah)"/>
 <defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#1A1A1E"/></marker></defs>
</svg>'''

STAMP = f'''<div class="stamp" style="left:50%;top:66%">IN REGOLA<i></i></div>'''

def icon(kind):
    ic = {
        "ufficio": '<rect x="9" y="11" width="22" height="15" rx="2" fill="none" stroke="#1A1A1E" stroke-width="2.2"/><path d="M15 31h10M20 26v5" stroke="#1A1A1E" stroke-width="2.2"/>',
        "cantiere": f'<path d="M8 27a12 12 0 0 1 24 0z" fill="{RED}"/><rect x="6" y="27" width="28" height="3.5" rx="1.5" fill="#1A1A1E"/><path d="M20 13v6" stroke="#fff" stroke-width="2.2"/>',
        "magazzino": '<path d="M20 8l12 6v13l-12 6-12-6V14z" fill="none" stroke="#1A1A1E" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 14l12 6 12-6M20 20v13" stroke="#1A1A1E" stroke-width="2.2"/>',
        "macchine": f'<circle cx="20" cy="20" r="5" fill="none" stroke="{RED}" stroke-width="2.6"/><path d="M20 7v5M20 28v5M7 20h5M28 20h5M11 11l3.5 3.5M25.5 25.5L29 29M11 29l3.5-3.5M25.5 14.5L29 11" stroke="#1A1A1E" stroke-width="2.4" stroke-linecap="round"/>',
    }[kind]
    return f'<svg viewBox="0 0 40 40">{ic}</svg>'

def hazard(sym):
    INK="#111"
    s = {"!": '<path d="M20 15v8" stroke="#111111" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="28" r="1.8" fill="#111111"/>',
         "el": '<path d="M22 12l-6 10h5l-3 9 7-11h-5z" fill="#111111"/>',
         "ru": '<path d="M14 18h4l5-4v14l-5-4h-4z" fill="#111111"/><path d="M26 17c2 2 2 6 0 8" stroke="#111111" stroke-width="2" fill="none"/>',
         "ca": '<path d="M20 12v12M15 20l5 6 5-6" stroke="#111111" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 30h14" stroke="#111111" stroke-width="2.8" stroke-linecap="round"/>'}[sym]
    return f'<svg viewBox="0 0 40 40"><path d="M20 4L37 34H3z" fill="#FFC21A" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>{s}</svg>'

ACTS = [("ufficio", "Ufficio"), ("cantiere", "Cantiere"), ("magazzino", "Magazzino"), ("macchine", "Macchine")]
HAZ = [("!", "Caduta"), ("el", "Elettrico"), ("ru", "Rumore"), ("ca", "Carichi")]

def board(step, fid, show_risk=False, show_shield=False, base=33, gap=11, show_circle=False):
    """Lavagna a 3 passi: attività → rischi → misure. Il soggetto resta nel cerchio tratteggiato."""
    steps = [("01", "Attività"), ("02", "Rischi"), ("03", "Misure")]
    head = "".join(
        f'<div class="st {"on" if i+1 == step else ("done" if i+1 < step else "")}"><em>{n}</em>{t}</div>'
        for i, (n, t) in enumerate(steps))
    acts = "".join(f'<div class="node" style="top:{base+i*gap}%">{icon(k)}<span>{t}</span></div>' for i, (k, t) in enumerate(ACTS))
    risks = ""
    if show_risk:
        risks = "".join(f'<div class="node r" style="top:{base+i*gap}%">{hazard(k)}<span>{t}</span></div>' for i, (k, t) in enumerate(HAZ))
        risks += '<svg class="links" viewBox="0 0 100 100" preserveAspectRatio="none">' + "".join(
            f'<path d="M37 {base+3.4+i*gap} C 50 {base+3.4+i*gap}, 50 {base+3.4+((i+1)%4)*gap}, 62 {base+3.4+((i+1)%4)*gap}" stroke="#1A1A1E" stroke-width=".35" stroke-dasharray="1.2 1.2" fill="none" vector-effect="none"/>'
            for i in range(4)) + "</svg>"
    shield = ""
    if show_shield:
        shield = f'''<svg class="shield" viewBox="0 0 120 140"><path d="M60 6l48 18v40c0 34-22 58-48 70C34 122 12 98 12 64V24z" fill="{RED}" opacity=".08" stroke="{RED}" stroke-width="3"/>
        <path d="M40 70l14 14 28-32" stroke="{RED}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'''
    circle = card(fid, "circ") if show_circle else ""
    return f'{GRID}<div class="steps">{head}</div>{circle}{acts}{risks}{shield}'

def gauge():
    return f'''<svg class="gauge" viewBox="0 0 200 120"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#1F9D55"/><stop offset=".5" stop-color="#FFC21A"/><stop offset="1" stop-color="{RED}"/></linearGradient></defs>
    <path d="M20 105a80 80 0 0 1 160 0" stroke="url(#gg)" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M20 105a80 80 0 0 1 160 0" stroke="#fff" stroke-width="1.5" stroke-dasharray="2 10" fill="none" opacity=".8"/>
    <g transform="rotate(-58 100 105)"><path d="M100 105L100 38" stroke="#1A1A1E" stroke-width="4" stroke-linecap="round"/></g>
    <path d="M100 105 L 155 60" stroke="#1A1A1E" stroke-width="2" stroke-dasharray="3 4" opacity=".35"/>
    <circle cx="100" cy="105" r="7" fill="#1A1A1E"/><text x="22" y="119" font-size="10" font-family="IBM Plex Mono" fill="#fff">BASSO</text><text x="150" y="119" font-size="10" font-family="IBM Plex Mono" fill="#fff">ALTO</text></svg>'''

BUILDING = f'''<svg viewBox="0 0 300 260" class="art" style="left:5%;top:27%;width:90%">
 <defs><marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="{RED}"/></marker></defs>
 <ellipse cx="150" cy="150" rx="140" ry="70" fill="none" stroke="{RED}" stroke-width="3" stroke-dasharray="10 8" marker-end="url(#ar)"/>
 <polygon points="70,120 150,80 230,120 150,160" fill="#fff" stroke="#1A1A1E" stroke-width="2"/>
 <polygon points="70,120 150,160 150,230 70,190" fill="#E9E9E6" stroke="#1A1A1E" stroke-width="2"/>
 <polygon points="150,160 230,120 230,190 150,230" fill="#D3D3CF" stroke="#1A1A1E" stroke-width="2"/>
 <polygon points="150,80 230,120 230,60 150,20" fill="none" stroke="{RED}" stroke-width="2.5"/>
 <polygon points="70,120 150,80 150,20 70,60" fill="none" stroke="#1A1A1E" stroke-width="2" stroke-dasharray="4 4"/>
 <path d="M90 150v26M110 160v26M170 172v-26M190 162v-26M210 152v-26" stroke="#1A1A1E" stroke-width="2"/>
 <rect x="143" y="10" width="14" height="14" fill="{RED}"/>
 <g font-family="IBM Plex Mono" font-size="11" fill="#1A1A1E"><text x="2" y="96">PROGETTO</text><text x="236" y="96">PRODUZIONE</text><text x="232" y="248">CONSEGNA</text><text x="0" y="248">MANUTENZIONE</text></g>
</svg>'''

COMMENT = f'''<svg viewBox="0 0 120 120" class="art" style="left:52%;top:65%;width:20%"><path d="M14 18h92a8 8 0 0 1 8 8v52a8 8 0 0 1-8 8H50L28 104V86H14a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" fill="#fff" stroke="{RED}" stroke-width="5"/>
<circle cx="38" cy="52" r="6" fill="{RED}"/><circle cx="60" cy="52" r="6" fill="{RED}"/><circle cx="82" cy="52" r="6" fill="{RED}"/></svg>'''

def workers():
    out = []
    for i in range(10):
        on = i < 7
        x = 8 + (i % 5) * 17.5
        y = 47 + (i // 5) * 12
        out.append(f'<svg class="wk{" on" if on else ""}" viewBox="0 0 40 44" style="left:{x}%;top:{y}%"><path d="M8 18a12 12 0 0 1 24 0z" fill="{RED if on else "#C9C9C4"}"/><rect x="5" y="17" width="30" height="3.5" rx="1.5" fill="#1A1A1E"/><circle cx="20" cy="26" r="6" fill="#1A1A1E"/><path d="M8 44a12 10 0 0 1 24 0z" fill="#1A1A1E"/></svg>')
    return "".join(out)

# ---------- scene ----------
SC = []
def scene(**k): SC.append(k)

scene(id="s1", t0=0.00, t1=0.87, title="Hook · titolo", frame=vid("F01") + f'<div class="tbox" style="top:7%">Il tuo DVR<br>è in un <i>cassetto?</i>{SQ}</div><div class="words" style="top:57%"><span>Il</span> <span>DVR…</span></div>',
      quote="«Il DVR…»", clip="0103 · 5,82–6,72 s",
      video="Parlato a schermo pieno. Dal primo frame il box rosso del titolo nasce da una linea e si allarga (come il «Did you know?» del riferimento); il quadratino rosso del logo cade sull'angolo e rimbalza.",
      testi="Titolo fisso per chi guarda senza audio: <b>Il tuo DVR è in un <em>cassetto?</em></b>. Parole piccole «Il DVR…» con pop in 4 frame.",
      trans="Nessuna: si parte già in movimento (push-in +4%).",
      sfx="<code>short_whoosh</code> sul box · <code>tick_rapido</code> sul quadratino.")

scene(id="s2", t0=0.87, t1=3.43, title="Hook · il mito", frame=vid("F02", z=1.12) + f'<div class="tbox sm" style="top:7%">Il tuo DVR<br>è in un <i>cassetto?</i>{SQ}</div><div class="words" style="top:57%"><span>non è</span> <span class="ser">solamente</span><br><span>un documento</span></div>',
      quote="«…non è solamente un documento che un'azienda deve tenere…»", clip="0103 · 8,64–13,37 s",
      video="Il taglio dell'inciso («documento di valutazione dei rischi») è coperto da un <b>punch-in</b> (+8%) su «non è». Il titolo si rimpicciolisce e resta in alto.",
      testi="Parola per parola sotto il mento; «solamente» in serif corsivo.",
      trans="Punch-in sul taglio, niente stacco visibile.",
      sfx="<code>tick_rapido</code> sulle parole.")

scene(id="s3", t0=3.43, t1=5.33, title="Hook · cassetto e timbro", frame=GRID + '<div class="words dark big" style="top:8%"><span>nel</span> <span class="ser red">cassetto</span></div><div class="lbl" style="left:50%;top:19%;transform:translateX(-50%)">D.Lgs. 81/08</div>' + DRAWER + STAMP,
      quote="«…nel cassetto affinché possa essere in regola.»", clip="0103",
      video="Su «cassetto» stacco sulla grafica a tutto schermo, <b>senza il soggetto</b> (la voce continua). Il DVR scivola nel cassetto isometrico, che si chiude. Su «in regola» cade il timbro <b>IN REGOLA</b>, che una linea rossa barra subito.",
      testi="«nel <em>cassetto</em>» in alto, poi l'etichetta piccola «D.Lgs. 81/08» e il timbro.",
      trans="Slide verso l'alto (6 frame) con sfocatura di movimento.",
      sfx="<code>short_whoosh</code> zoom · tonfo del cassetto · <code>boom_sub</code> sul timbro.")

scene(id="s4", t0=5.33, t1=7.33, title="La domanda", frame=vid("F04") + '<div class="words" style="top:56%"><span>Sai che cos\'è</span> <span class="ser">realmente</span></div><div class="kw" style="top:62%">un DVR?</div>',
      quote="«Sai che cos'è realmente un DVR?»", clip="0103 · 2,12–4,22 s",
      video="<b>Zoom in</b>: la card torna a schermo intero. Punch-in (+10%) su «DVR».",
      testi="«realmente» in serif corsivo. <b>DVR?</b> è la parola chiave della frase: entra enorme e sfocata, va a fuoco in 7 frame e si accende (nucleo chiaro, bagliore rosso). Subito dopo le lettere si aprono in <b>D</b>ocumento · <b>V</b>alutazione · <b>R</b>ischi.",
      trans="Zoom in; <b>flash rosso di 2 frame</b> sul taglio verso la scena successiva.",
      sfx="<code>boom_sub</code> su «DVR» · <code>tick_rapido</code> sulle tre parole.")

scene(id="s5", t0=7.33, t1=12.93, title="La verità · tre parole", frame=GRID + card("F05", "card", "left:22%;top:7%;width:56%;height:36%") + '<div class="words dark" style="top:46%;left:0;right:0"><span>Tale documento deve essere</span></div>' + tag("presente", True, "top:53%") + tag("attivo", True, "top:62%") + tag("visionabile", True, "top:71%"),
      quote="«Tale documento deve essere presente, attivo e visionabile da parte di tutta l'azienda…»", clip="0104 · 1,27–8,37 s",
      video="Unica scena di esempi con il soggetto: slide laterale verso l'insert con la card (il video continua dentro). Le tre parole entrano <b>nel frame in cui le dice</b> dentro i riquadri tratteggiati con le maniglie (stile selezione), con il quadratino rosso e la spunta verde.",
      testi="Testo nero sul bianco; spunte piccole verdi come segno di conferma.",
      trans="Slide veloce laterale (6 frame).",
      sfx="<code>short_whoosh</code> · <code>doppio_click</code> su ogni spunta.")

scene(id="s6", t0=12.93, t1=14.03, title="…tutti i lavoratori", frame=GRID + '<div class="words dark big" style="top:8%;left:0;right:0"><span>da parte di</span> <span class="ser red">tutti</span> <span>i lavoratori</span></div>' + tag("presente", True, "top:21%;transform:translateX(-50%) scale(.8)") + tag("attivo", True, "top:28%;transform:translateX(-50%) scale(.8)") + tag("visionabile", True, "top:35%;transform:translateX(-50%) scale(.8)") + workers(),
      quote="«…da parte di tutti i lavoratori.»", clip="0104",
      video="La card del soggetto esce verso l'alto e restano solo le grafiche: le etichette salgono e si stringono; sotto compare una fila di lavoratori con il casco che si accendono di rosso uno dopo l'altro, a ritmo con le sillabe.",
      testi="«tutti» in serif corsivo nel rosso pieno (siamo sul bianco).",
      trans="—",
      sfx="<code>tick_rapido</code> in sequenza sui caschi.")

scene(id="s7", t0=14.03, t1=19.87, title="Come si fa · 01 attività", frame=board(1, "F07", show_circle=True),
      quote="«All'interno del documento vengono analizzate le singole attività lavorative,»", clip="0109 · 1,67–22,27 s",
      video="<b>Film burn leggero</b> ed entra la lavagna a 3 passi. Il soggetto compare solo qui, piccolo nel <b>cerchio tratteggiato</b> che si disegna (come il cervello nel riferimento), e sparisce quando entrano le icone. Su «attività lavorative» le icone delle attività entrano una alla volta.",
      testi="Barra dei passi in alto: <b>01 Attività</b> acceso in rosso, 02 e 03 in grigio.",
      trans="Film burn rosso-arancio dai bordi, opacità 0,5, 12 frame.",
      sfx="<code>short_whoosh</code> · <code>tick_rapido</code> su ogni icona.")

scene(id="s8", t0=19.87, t1=23.63, title="Come si fa · 02 rischi", frame=board(2, "F08", show_risk=True),
      quote="«vengono correlati i vari rischi a queste attività lavorative,»", clip="0109",
      video="Da ogni attività parte una <b>linea tratteggiata</b> che si disegna verso i cartelli di pericolo (caduta, elettrico, rumore, carichi). Il passo 01 si spunta. Solo grafica, niente soggetto.",
      testi="«correlati» resta implicito nelle linee: nessuna scritta in più.",
      trans="Nessuno stacco: la lavagna continua.",
      sfx="«swish» corto per ogni linea · <code>doppio_click</code> sulla spunta del passo 01.")

scene(id="s9", t0=23.63, t1=30.11, title="Come si fa · 03 misure", frame=board(3, "F09", show_risk=True, show_shield=True, base=31, gap=9.5) + tag("prevenzione", False, "top:68%;left:29%;transform:translateX(-50%) scale(.72)") + tag("tecniche", False, "top:68%;left:73%;transform:translateX(-50%) scale(.72)") + tag("organizzative", False, "top:74%;transform:translateX(-50%) scale(.72)"),
      quote="«e infine si vanno a strutturare le misure di prevenzione, le tecniche organizzative,»", clip="0109",
      video="Uno <b>scudo</b> rosso si chiude sopra rischi e attività. Sotto, le etichette delle misure nei riquadri con le maniglie. Solo grafica.",
      testi="A schermo la forma corretta: <b>prevenzione · tecniche · organizzative</b> (cioè «misure tecniche e organizzative»).",
      trans="—",
      sfx="<code>boom_sub</code> morbido sullo scudo · <code>tick_rapido</code> sulle etichette.")

scene(id="s10", t0=30.11, t1=33.47, title="Ridurre il rischio", frame=vid("F10", z=1.10) + gauge() + '<div class="kw sm" style="top:52%">ridurre</div>',
      quote="«per mitigare e ridurre l'esposizione al rischio.»", clip="0109",
      video="Zoom in: torna il soggetto a schermo intero dopo 16 s di lavagna. Sotto il mento l'<b>indicatore del rischio</b>: la lancetta scende da ALTO a BASSO mentre dice «ridurre».",
      testi="Parola chiave <b>ridurre</b> che si accende. Nessun numero inventato: l'indicatore è qualitativo.",
      trans="Zoom in (6 frame).",
      sfx="<code>riser_tonale</code> che chiude sul picco di «rischio».")

scene(id="s11", t0=33.47, t1=39.31, title="Sintesi · l'azienda reale", frame=GRID + '<div class="words dark big" style="top:8%;left:0;right:0"><span>deve rappresentare</span> <span class="ser red">realmente</span><br><span>l\'azienda</span></div>' + BUILDING,
      quote="«Il DVR quindi deve rappresentare realmente l'azienda e il suo ciclo lavorativo.»", clip="0110 · 2,22–11,62 s",
      video="Parte a schermo intero su «Il DVR quindi»; su «l'azienda» slide verso la grafica a tutto schermo, senza il soggetto. La sezione isometrica dell'azienda (stessa geometria del monogramma GM) si costruisce e la freccia rossa del <b>ciclo di lavoro</b> le gira intorno.",
      testi="«realmente» in serif corsivo, rosso pieno sul bianco.",
      trans="Film burn leggero all'ingresso (secondo dei 3).",
      sfx="<code>short_whoosh</code> · rotazione morbida sul ciclo.")

scene(id="s12", t0=39.31, t1=40.95, title="CTA · la domanda", frame=vid("F12") + '<div class="kw" style="top:58%">E tu?</div>',
      quote="«E tu? Sapevi cosa fosse un DVR?»", clip="0110",
      video="Zoom in a schermo intero con <b>flash rosso di 2 frame</b> su «E tu?».",
      testi="<b>E tu?</b> parola chiave enorme che si accende; poi «Sapevi cosa fosse un DVR?» in piccolo.",
      trans="Stacco secco con flash.",
      sfx="<code>boom_sub</code> su «tu».")

scene(id="s13", t0=40.95, t1=42.33, title="CTA · commenti", frame=vid("F13", z=1.12) + '<div class="words" style="top:58%"><span>Fammelo</span> <span class="ser">sapere</span></div>' + COMMENT + '<div class="arrow">↓</div>',
      quote="«Fammelo sapere.»", clip="0110",
      video="<b>Zoom out</b> morbido di chiusura. Il fumetto del commento pulsa con la freccia verso il basso. Niente nome né logo, salvo tua richiesta.",
      testi="«sapere» in serif corsivo.",
      trans="Film burn finale (terzo) sull'ultimo mezzo secondo.",
      sfx="<code>doppio_click</code> sul fumetto · coda del whoosh.")

def fmt(t):
    return f"{int(t//60)}:{t%60:05.2f}".replace(".", ",")

rows = []
for i, s in enumerate(SC, 1):
    rows.append(f'''<article class="scene" id="{s["id"]}">
  <div class="frame">{s["frame"]}</div>
  <div class="meta">
    <div class="tc"><span>{i:02d}</span>{fmt(s["t0"])} → {fmt(s["t1"])} · {s["t1"]-s["t0"]:.1f} s<button class="play" data-a="{s["t0"]}" data-b="{s["t1"]}" aria-label="Ascolta la scena {i}">▶ ascolta</button></div>
    <h3>{s["title"]}</h3>
    <p class="quote">{s["quote"]}</p>
    <dl><dt>Clip</dt><dd>{s["clip"]}</dd><dt>Video</dt><dd>{s["video"]}</dd><dt>Testi</dt><dd>{s["testi"]}</dd><dt>Transizione</dt><dd>{s["trans"]}</dd><dt>SFX</dt><dd>{s["sfx"]}</dd></dl>
  </div>
</article>''')

html = open(f"{S}/storyboard_template.html").read()
import re
COVER = "data:image/jpeg;base64," + b64(f"{S}/cov/cop_sb.jpg")
body = "\n".join(rows)
body = re.sub(r'(fill|stroke)="#1A1A1E"', r'\1="currentColor"', body)
for col,var in (("#fff","f1"),("#ffffff","f1"),("#E9E9E6","f2"),("#DADAD6","f3"),("#D3D3CF","f3")):
    body = body.replace(f'fill="{col}"', f'style="fill:var(--{var})"')
html = html.replace("%%COVER%%", COVER)
html = html.replace("%%SCENES%%", body).replace("%%AUDIO%%", AUDIO)
open(OUT, "w").write(html)
print("ok", len(html) // 1024, "KB")
