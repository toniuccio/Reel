"""Allinea il colore di alcune clip a un riferimento approvato (LUT 3D per clip).

Il riferimento sono fotogrammi GIÀ corretti che vanno bene (es. le prime scene approvate).
Per ogni clip da sistemare:
- la luminosità viene mappata quantile per quantile su quella del riferimento (stessa luce, stesso contrasto,
  stessa "densità" dei neri e delle alte luci);
- la saturazione viene portata alla stessa intensità media del riferimento;
- la dominante di colore sui toni neutri viene portata a quella del riferimento.

uso: python allinea_colore.py --ref <jpg del riferimento...> --frames <cartella_fotogrammi> --clips 0380,0381 --out <cartella_lut>
  cartella_fotogrammi: una sottocartella per clip con 3-6 jpg presi dalla clip convertita in SDR (senza correzioni)
"""
import argparse, glob, json, os
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("--ref", nargs="+", required=True)
ap.add_argument("--frames", required=True)
ap.add_argument("--clips", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--min-sat", type=float, default=0.9, help="guadagno minimo di saturazione")
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)

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
    return to_srgb(np.stack([fi(fx), fi(fy), fi(fz)], -1) * WP @ Mi.T)

def load(paths):
    return rgb2lab(np.concatenate([np.asarray(Image.open(p).convert("RGB").resize((270, 480))).reshape(-1, 3) / 255.0 for p in paths]))

def stats(lab):
    L = lab[:, 0]; C = np.hypot(lab[:, 1], lab[:, 2])
    neutral = (C < 18) & (L > 25) & (L < 85)
    mid = (L > 20) & (L < 90)
    return dict(q=np.percentile(L, np.linspace(0.5, 99.5, 41)), C=np.median(C[mid]),
                a=lab[neutral, 1].mean(), b=lab[neutral, 2].mean(), L=L.mean())

R = stats(load(args.ref))
report = {"riferimento": dict(L=round(R["L"], 1), saturazione=round(float(R["C"]), 1))}
for clip in args.clips.split(","):
    src = stats(load(sorted(glob.glob(os.path.join(args.frames, clip, "*.jpg")))))
    g = float(np.clip(R["C"] / max(src["C"], 1e-3), args.min_sat, 1.6))
    n = 33; grid = np.linspace(0, 1, n)
    b_, g_, r_ = np.meshgrid(grid, grid, grid, indexing="ij")
    lab = rgb2lab(np.stack([r_, g_, b_], -1).reshape(-1, 3))
    qs = np.maximum.accumulate(src["q"] + np.arange(41) * 1e-4)
    Ln = np.interp(lab[:, 0], np.concatenate([[0], qs, [100]]), np.concatenate([[0], R["q"], [100]]))
    an = (lab[:, 1] - src["a"]) * g + R["a"]
    bn = (lab[:, 2] - src["b"]) * g + R["b"]
    out = lab2rgb(np.stack([Ln, an, bn], -1))
    with open(os.path.join(args.out, f"{clip}.cube"), "w") as fh:
        fh.write(f'TITLE "allinea {clip}"\nLUT_3D_SIZE {n}\n')
        for v in out:
            fh.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
    report[clip] = dict(L_prima=round(src["L"], 1), saturazione_prima=round(float(src["C"]), 1), guadagno_saturazione=round(g, 2))
    print(clip, report[clip])
json.dump(report, open(os.path.join(args.out, "allineamento.json"), "w"), indent=1)
print("riferimento", report["riferimento"])
