"""Allinea una voce rigenerata (TTS) al labiale del parlato originale, parola per parola.
Per ogni tratto tra due parole guida (presenti in entrambe le trascrizioni) la voce nuova viene
accorciata o allungata con rubberband (tono invariato) per cadere negli stessi istanti dell'originale.
uso: python allinea_voce.py <tts.wav> <tts_words.json> <id_tts> <orig_words.json> <ids_orig separati da virgola> <durata_s> <uscita.wav>"""
import json, subprocess, sys, difflib, re, os, tempfile, numpy as np, soundfile as sf

tts_wav, tts_json, tts_id, orig_json, orig_ids, dur, out = sys.argv[1:8]
dur = float(dur)
norm = lambda w: re.sub(r"[^a-zà-ù0-9]", "", w.lower())

tw = json.load(open(tts_json))[tts_id]["words"]
ow, off = [], 0.0
oj = json.load(open(orig_json))
for oid in orig_ids.split(","):
    ws = oj[oid]["words"]
    ow += [{"w": w["w"], "t": w["t"] + off} for w in ws]
    off += float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                          os.path.join(os.path.dirname(orig_json), "..", "..", "..", "public", "giemme", "clips", f"{oid}.wav")]))

a = [norm(w["w"]) for w in tw]
b = [norm(w["w"]) for w in ow]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
anchors = []
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        anchors.append((tw[blk.a + k]["t"], ow[blk.b + k]["t"]))
y, sr = sf.read(tts_wav)
tts_len = len(y) / sr
# estremi: inizio e fine
pts = [(0.0, 0.0)] + [p for p in anchors if 0.05 < p[0] < tts_len - 0.05] + [(tts_len, dur)]
# tieni solo punti crescenti in entrambe le scale e con tratti non troppo corti
clean = [pts[0]]
for p in pts[1:]:
    if p[0] - clean[-1][0] > 0.25 and p[1] - clean[-1][1] > 0.18:
        clean.append(p)
if clean[-1] != pts[-1]:
    clean[-1] = pts[-1]
chunks = []
tmp = tempfile.mkdtemp()
cur = 0.0  # tempo già prodotto: ogni tratto punta all'istante reale della parola successiva (lo scarto non si accumula)
ch = y.shape[1] if y.ndim > 1 else 1
for i, ((t0, o0), (t1, o1)) in enumerate(zip(clean, clean[1:])):
    seg = y[int(t0 * sr):int(t1 * sr)]
    target = max(0.05, o1 - cur)
    ratio = (t1 - t0) / target  # >1 = accelerare
    r = min(1.45, max(0.82, ratio))
    fi, fo = f"{tmp}/i{i}.wav", f"{tmp}/o{i}.wav"
    sf.write(fi, seg, sr)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", fi, "-af", f"rubberband=tempo={r:.4f}:transients=smooth:formant=preserved", fo], check=True)
    z, _ = sf.read(fo)
    if ratio < 0.82:  # lui parla molto più lento: voce naturale + pausa prima della parola successiva
        pad = int(target * sr) - len(z)
        if pad > 0:
            z = np.concatenate([z, np.zeros((pad,) + z.shape[1:])])
    chunks.append(z)
    cur += len(z) / sr
    print(f"tratto {i}: {t1-t0:.2f}s -> {target:.2f}s (x{r:.2f}{' + pausa' if ratio < 0.82 else ''})")
res = np.concatenate(chunks)
n = int(dur * sr)
if len(res) > n * 1.005:
    # i tratti limitati hanno allungato il totale: ricompatta tutto in modo uniforme invece di tagliare la coda
    fi, fo = f"{tmp}/all.wav", f"{tmp}/all_fit.wav"
    sf.write(fi, res, sr)
    r = len(res) / n
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", fi, "-af", f"rubberband=tempo={r:.4f}:transients=smooth:formant=preserved", fo], check=True)
    res, _ = sf.read(fo)
    print(f"ricompattato x{r:.3f}")
res = res[:n] if len(res) >= n else np.concatenate([res, np.zeros((n - len(res),) + res.shape[1:])])
# dissolvenze brevissime agli estremi
f = int(0.01 * sr)
res[:f] *= np.linspace(0, 1, f)[:, None] if res.ndim > 1 else np.linspace(0, 1, f)
res[-f:] *= np.linspace(1, 0, f)[:, None] if res.ndim > 1 else np.linspace(1, 0, f)
sf.write(out, res, sr)
print("ok", out, len(res) / sr, "s; punti guida:", len(clean) - 2)
