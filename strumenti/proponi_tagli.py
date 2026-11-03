"""Propone i punti di taglio (inizio e fine del parlato) per ogni .mov della cartella.
uso: python proponi_tagli.py <cartella_mov> > tagli.txt   poi controlla e correggi a mano."""
import glob, os, re, subprocess, sys

files = glob.glob(os.path.join(sys.argv[1], "*.mov")) + glob.glob(os.path.join(sys.argv[1], "*.MOV"))
files.sort(key=lambda f: (re.search(r"IMG_(\d+)", f, re.I) or re.search(r"(.*)", os.path.basename(f))).group(1))
print("# clip inizio fine (secondi nel file originale, pause tolte)")
for f in files:
    m = re.search(r"IMG_(\d+)\.mov$", f, re.I)
    n = m.group(1) if m else os.path.splitext(os.path.basename(f))[0]
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                               capture_output=True, text=True).stdout)
    log = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", f, "-vn", "-af", "silencedetect=n=-35dB:d=0.25", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    a, b = 0.0, dur
    if starts and starts[0] < 0.15 and ends:  # silenzio in testa
        a = max(0.0, ends[0] - 0.08)
    if starts and (len(ends) < len(starts) or ends[-1] > dur - 0.05):  # silenzio in coda
        b = min(dur, starts[-1] + 0.12)
    print(f"{n} {a:.2f} {b:.2f}")
