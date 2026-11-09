"""Analisi automatica di un video appena caricato: dati tecnici, tagli di scena, parlato,
provini con il tempo, trascrizione parola per parola e una prima ipotesi su che video è.
uso: python3 strumenti/analizza_video.py <video> <cartella_uscita> [--no-trascrizione]
Produce in <cartella_uscita>: analisi.json, analisi.md, provino_NN.jpg, trascrizione.txt, parole.json
"""
import json, os, re, subprocess, sys, tempfile, glob

QUI = os.path.dirname(os.path.abspath(__file__))
MODELLO = os.path.join(QUI, "modelli", "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8")


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def mmss(t):
    return f"{int(t // 60):02d}:{int(t % 60):02d}"


def dati_tecnici(v):
    p = json.loads(run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", v]).stdout)
    vs = next(s for s in p["streams"] if s["codec_type"] == "video")
    has_audio = any(s["codec_type"] == "audio" for s in p["streams"])
    w, h = int(vs["width"]), int(vs["height"])
    rot = 0
    for sd in vs.get("side_data_list", []):
        rot = abs(int(sd.get("rotation", 0)))
    if rot in (90, 270):
        w, h = h, w
    num, den = vs.get("r_frame_rate", "0/1").split("/")
    return {
        "durata": round(float(p["format"]["duration"]), 2),
        "larghezza": w, "altezza": h,
        "orientamento": "verticale" if h > w else ("orizzontale" if w > h else "quadrato"),
        "fps": round(int(num) / max(int(den), 1), 2),
        "codec": vs["codec_name"],
        "hdr": vs.get("color_transfer") in ("arib-std-b67", "smpte2084"),
        "audio": has_audio,
    }


def tagli_scena(v, soglia=0.3):
    log = run(["ffmpeg", "-nostdin", "-hide_banner", "-i", v, "-an", "-vf",
               f"scale=320:-2,select='gt(scene,{soglia})',showinfo", "-f", "null", "-"]).stderr
    return [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", log)]


def parlato(v, durata):
    log = run(["ffmpeg", "-nostdin", "-hide_banner", "-i", v, "-vn", "-af",
               "silencedetect=n=-35dB:d=0.4", "-f", "null", "-"]).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    if len(ends) < len(starts):
        ends.append(durata)
    silenzio = sum(e - s for s, e in zip(starts, ends))
    return round(max(0.0, 1 - silenzio / durata), 2) if durata else 0.0


def provini(v, out, durata):
    passo = 2 if durata <= 120 else 5 if durata <= 600 else 15
    for f in glob.glob(os.path.join(out, "provino_*.jpg")):
        os.remove(f)
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", v, "-vf",
         f"fps=1/{passo},scale=360:-2,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=18:"
         "fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x5", os.path.join(out, "provino_%02d.jpg")])
    return passo, sorted(os.path.basename(f) for f in glob.glob(os.path.join(out, "provino_*.jpg")))


def trascrivi(v, out):
    if not os.path.exists(os.path.join(MODELLO, "tokens.txt")):
        return None, "modello di trascrizione assente: vedi README (strumenti/modelli)"
    import numpy as np, sherpa_onnx
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{MODELLO}/encoder.int8.onnx", decoder=f"{MODELLO}/decoder.int8.onnx",
        joiner=f"{MODELLO}/joiner.int8.onnx", tokens=f"{MODELLO}/tokens.txt",
        model_type="nemo_transducer", num_threads=4)
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", v, "-ac", "1", "-ar", "16000",
                          "-f", "f32le", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    blocco = 16000 * 240  # 4 minuti, come da allena-stile-montaggio
    parole = []
    for i in range(0, len(a), blocco):
        s = rec.create_stream()
        s.accept_waveform(16000, a[i:i + blocco])
        rec.decode_stream(s)
        off = i / 16000
        for tok, t in zip(s.result.tokens, s.result.timestamps):
            if tok.startswith(" ") or tok.startswith("▁") or not parole:
                parole.append({"w": tok.replace("▁", "").strip(), "t": round(off + float(t), 2)})
            else:
                parole[-1]["w"] += tok
    parole = [p for p in parole if p["w"]]
    json.dump(parole, open(os.path.join(out, "parole.json"), "w"), ensure_ascii=False)
    # testo a frasi con il tempo d'inizio
    righe, frase, t0 = [], [], None
    for p in parole:
        if t0 is None:
            t0 = p["t"]
        frase.append(p["w"])
        if re.search(r"[.!?]$", p["w"]):
            righe.append(f"[{mmss(t0)}] {' '.join(frase)}"); frase, t0 = [], None
    if frase:
        righe.append(f"[{mmss(t0)}] {' '.join(frase)}")
    open(os.path.join(out, "trascrizione.txt"), "w").write("\n".join(righe) + "\n")
    return parole, None


def ipotesi(d, tagli_min, voce, wpm):
    """Prima ipotesi: Claude la conferma guardando i provini."""
    dur, vert = d["durata"], d["orientamento"] == "verticale"
    if vert and d["hdr"] and tagli_min < 4:
        return "girato", "clip grezza dell'iPhone da montare (verticale, HDR, quasi senza tagli)"
    if vert and tagli_min < 4 and voce > 0.5 and dur <= 240:
        return "girato", "clip grezza da montare (verticale, parlato continuo, pochi tagli)"
    if vert and tagli_min >= 8:
        return "riferimento-reel", "reel finito di un altro creator: stile di montaggio da studiare"
    if dur <= 90 and tagli_min >= 10 and voce < 0.5:
        return "riferimento-motion", "spot o motion graphics finito, poca voce: animazioni da studiare"
    if not vert and dur > 300 and voce > 0.6:
        return "tutorial", "video lungo orizzontale con parlato: lezione o tutorial da cui estrarre un metodo"
    if dur <= 90 and tagli_min >= 10:
        return "riferimento-motion", "spot breve con molti tagli: animazioni e ritmo da studiare"
    return "da-chiarire", "non è chiaro: guarda i provini e chiedi ad Antonio"


PERCORSO = {
    "girato": "/nuovo-reel (schede G o H) — eventuali grafiche animate con /motion-graphics",
    "riferimento-reel": "skill/allena-stile-montaggio (cartella di riferimento + scomposizione)",
    "riferimento-motion": "/motion-graphics in modalità 'studia': scomposizione delle transizioni",
    "tutorial": "estrarre il metodo: guida HTML + regole nuove nella skill giusta (o skill nuova)",
    "da-chiarire": "chiedere ad Antonio contesto e obiettivo",
}


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    v, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    d = dati_tecnici(v)
    print("dati:", d)
    tagli = tagli_scena(v)
    tagli_min = round(len(tagli) / (d["durata"] / 60), 1) if d["durata"] else 0
    voce = parlato(v, d["durata"]) if d["audio"] else 0.0
    passo, sheets = provini(v, out, d["durata"])
    parole, nota = (None, "saltata") if "--no-trascrizione" in sys.argv or not d["audio"] else trascrivi(v, out)
    wpm = round(len(parole) / (d["durata"] / 60)) if parole else 0
    tipo, motivo = ipotesi(d, tagli_min, voce, wpm)
    res = {"file": os.path.abspath(v), **d, "tagli_scena": tagli, "tagli_al_minuto": tagli_min,
           "quota_parlato": voce, "parole_al_minuto": wpm, "provini": sheets, "provino_ogni_s": passo,
           "trascrizione": "trascrizione.txt" if parole else nota, "tipo": tipo, "motivo": motivo,
           "percorso_consigliato": PERCORSO[tipo]}
    json.dump(res, open(os.path.join(out, "analisi.json"), "w"), ensure_ascii=False, indent=1)
    inizio = ""
    if parole:
        inizio = " ".join(p["w"] for p in parole[:60])
    md = f"""# Analisi di {os.path.basename(v)}

| | |
|---|---|
| Durata | {mmss(d['durata'])} ({d['durata']} s) |
| Formato | {d['larghezza']}×{d['altezza']} {d['orientamento']}, {d['fps']} fps, {d['codec']}{', HDR' if d['hdr'] else ''} |
| Tagli di scena | {len(tagli)} ({tagli_min} al minuto) |
| Parlato | {int(voce * 100)}% del tempo, {wpm} parole al minuto |
| Provini | {len(sheets)} fogli, un fotogramma ogni {passo} s |

**Ipotesi:** {tipo}, cioè {motivo}.
**Percorso consigliato:** {PERCORSO[tipo]}

**Inizio del parlato:** {inizio or '(nessuna trascrizione)'}
"""
    open(os.path.join(out, "analisi.md"), "w").write(md)
    print(md)


if __name__ == "__main__":
    main()
