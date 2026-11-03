"""Trascrive ogni .wav della cartella clip con i tempi parola per parola (modello Parakeet TDT v3, sherpa-onnx).
uso: python trascrivi_parole.py <cartella_clip> <cartella_modello> <uscita.json>"""
import sys, json, subprocess, glob, os, numpy as np, sherpa_onnx

clips = sys.argv[1]
m = sys.argv[2]
out = sys.argv[3]
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{m}/encoder.int8.onnx", decoder=f"{m}/decoder.int8.onnx", joiner=f"{m}/joiner.int8.onnx",
    tokens=f"{m}/tokens.txt", model_type="nemo_transducer", num_threads=4)
res = {}
for n in sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(f"{clips}/*.wav")):
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", f"{clips}/{n}.wav", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    s = rec.create_stream()
    s.accept_waveform(16000, a)
    rec.decode_stream(s)
    r = s.result
    # unisci i token in parole (i token che iniziano con spazio aprono una parola nuova)
    words = []
    for tok, t in zip(r.tokens, r.timestamps):
        if tok.startswith(" ") or tok.startswith("▁") or not words:
            words.append({"w": tok.replace("▁", "").strip(), "t": round(float(t), 3)})
        else:
            words[-1]["w"] += tok
    words = [w for w in words if w["w"]]
    res[n] = {"text": r.text, "words": words}
    print(n, r.text)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
