"""Uniforma luce e colore di più clip su un unico look (LUT 3D per clip).

Per ogni clip misura, su alcuni fotogrammi, la luminosità (media e contrasto) e la dominante di colore
nello spazio Lab, poi crea una LUT .cube che porta tutte le clip sugli stessi valori obiettivo:
- luminosità media e contrasto uguali per tutte (niente sovraesposizione: alte luci compresse dolcemente);
- dominante di colore riportata verso un neutro leggermente caldo, uguale per tutte;
- saturazione leggermente aumentata in modo uguale per tutte.

uso: python uniforma_colore.py <cartella_fotogrammi> <cartella_lut> [--target-l 50 --target-std 19 --sat 1.06]
  cartella_fotogrammi: un sottocartella per clip (es. 0389/), con 3-6 jpg presi dalla clip GIÀ convertita in SDR
"""
import argparse, glob, json, os
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("frames"); ap.add_argument("out")
ap.add_argument("--target-l", type=float, default=50.0)     # luminosità media (0-100)
ap.add_argument("--target-std", type=float, default=19.0)   # contrasto
ap.add_argument("--target-a", type=float, default=1.5)      # dominante verde/magenta obiettivo
ap.add_argument("--target-b", type=float, default=5.0)      # dominante blu/giallo obiettivo (leggermente caldo)
ap.add_argument("--cast", type=float, default=0.75)         # quanta parte della dominante correggere (0-1)
ap.add_argument("--sat", type=float, default=1.06)
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)

# --- conversioni sRGB <-> Lab (D65) ---
M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
Mi = np.linalg.inv(M); WP = np.array([0.95047, 1.0, 1.08883])
def to_lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def to_srgb(c): c = np.clip(c, 0, 1); return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)
def f(t): return np.where(t > 216 / 24389, np.cbrt(t), (24389 / 27 * t + 16) / 116)
def fi(t): return np.where(t ** 3 > 216 / 24389, t ** 3, (116 * t - 16) / (24389 / 27))
def rgb2lab(rgb):
    xyz = to_lin(rgb) @ M.T / WP; fx, fy, fz = f(xyz[..., 0]), f(xyz[..., 1]), f(xyz[..., 2])
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], -1)
def lab2rgb(lab):
    fy = (lab[..., 0] + 16) / 116; fx = fy + lab[..., 1] / 500; fz = fy - lab[..., 2] / 200
    xyz = np.stack([fi(fx), fi(fy), fi(fz)], -1) * WP
    return to_srgb(xyz @ Mi.T)

def soft_highlights(L, knee=78.0):
    """sopra il ginocchio le alte luci vengono compresse: niente bianchi bruciati"""
    over = np.maximum(L - knee, 0)
    return np.where(L > knee, knee + (100 - knee) * (1 - np.exp(-over / (100 - knee))), L)

report = {}
for d in sorted(glob.glob(os.path.join(args.frames, "*"))):
    if not os.path.isdir(d):
        continue
    clip = os.path.basename(d)
    px = []
    for fimg in sorted(glob.glob(os.path.join(d, "*.jpg"))):
        im = np.asarray(Image.open(fimg).convert("RGB").resize((270, 480))).reshape(-1, 3) / 255.0
        px.append(im)
    lab = rgb2lab(np.concatenate(px))
    L = lab[:, 0]
    lo, hi = np.percentile(L, [2, 98]); core = (L > lo) & (L < hi)
    muL, sdL = L[core].mean(), L[core].std()
    # dominante: media di a/b sui toni medi poco saturi (muri, asfalto, cielo coperto)
    chroma = np.hypot(lab[:, 1], lab[:, 2]); neutral = (chroma < 18) & (L > 25) & (L < 85)
    mua, mub = lab[neutral, 1].mean(), lab[neutral, 2].mean()
    report[clip] = dict(L=round(muL, 1), contrasto=round(sdL, 1), a=round(mua, 1), b=round(mub, 1))

    # LUT 33^3
    n = 33; g = np.linspace(0, 1, n)
    b_, g_, r_ = np.meshgrid(g, g, g, indexing="ij")  # ordine .cube: r varia più velocemente
    rgb = np.stack([r_, g_, b_], -1).reshape(-1, 3)
    lab = rgb2lab(rgb)
    k = np.clip(args.target_std / max(sdL, 1e-3), 0.8, 1.3)
    Ln = (lab[:, 0] - muL) * k + args.target_l
    Ln = soft_highlights(np.clip(Ln, 0, 100))
    an = (lab[:, 1] - args.cast * (mua - args.target_a)) * args.sat
    bn = (lab[:, 2] - args.cast * (mub - args.target_b)) * args.sat
    out = lab2rgb(np.stack([Ln, an, bn], -1))
    with open(os.path.join(args.out, f"{clip}.cube"), "w") as fh:
        fh.write(f'TITLE "uniforma {clip}"\nLUT_3D_SIZE {n}\n')
        for v in out:
            fh.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
json.dump(report, open(os.path.join(args.out, "misure.json"), "w"), indent=1)
for k_, v in report.items():
    print(k_, v)
