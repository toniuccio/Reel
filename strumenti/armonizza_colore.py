"""Armonizza il colore di tutte le clip: stesso incarnato, stesso sfondo, stessa camicia in tutto il video.
1) pareggia la sfumatura sinistra/destra dello sfondo (correzione orizzontale lineare, nulla al centro: il viso non cambia);
2) per ogni clip calcola una correzione colore (matrice 3x3 + offset, vicina all'identità) che porta
   viso, fronte, muro e camicia agli stessi valori target.
uso: python armonizza_colore.py <cartella_clip> <faces.json> <uscita_dir> <id> [<id> ...]"""
import cv2, json, subprocess, sys, os, numpy as np

src, faces_json, out_dir = sys.argv[1:4]
ids = sys.argv[4:]
fa = json.load(open(faces_json))
os.makedirs(out_dir, exist_ok=True)

# valori target comuni (RGB 0-255): incarnato naturale, sfondo neutro caldo, camicia blu scuro
TARGET = {
    "viso": np.array([172, 117, 97.0]),
    "fronte": np.array([175, 119, 95.0]),
    "muro": np.array([175, 172, 168.0]),
    "camicia": np.array([34, 40, 50.0]),
}
WEIGHT = {"viso": 3.0, "fronte": 1.5, "muro": 2.5, "camicia": 1.0}
LAMBDA = 0.02  # quanto restare vicini all'identità

def face(c, fr):
    r = min(fa[c], key=lambda t: abs(t[0] - fr))
    return r[1] * 1080, r[2] * 1920, r[3] * 1920

def boxes(im, cx, cy, h):
    b = lambda x0, y0, x1, y1: im[int(y0):int(y1), int(x0):int(x1)].reshape(-1, 3).mean(0)
    return {
        "viso": b(cx - h * .18, cy - h * .05, cx + h * .18, cy + h * .2),
        "fronte": b(cx - h * .15, cy - h * .32, cx + h * .15, cy - h * .18),
        "muro_sx": b(40, 150, 260, 450), "muro_dx": b(820, 150, 1040, 450),
        "camicia": b(cx - h * .6, cy + h * .9, cx - h * .15, cy + h * 1.4),
        **shirt(im, cy, h),
    }

def shirt(im, cy, h):
    reg = im[int(cy + h * 0.8):int(min(1880, cy + h * 2.6)), 60:1020].reshape(-1, 3)
    Y = reg @ np.array([.299, .587, .114])
    redchair = (reg[:, 0] > reg[:, 2] + 40)
    dark = reg[(Y < 40) & ~redchair]; mid = reg[(Y >= 40) & (Y < 95) & ~redchair]
    return {"cam_ombra": dark.mean(0) if len(dark) else np.zeros(3), "cam_luce": mid.mean(0) if len(mid) else np.zeros(3)}

xs = (np.arange(1080) / 1079.0 - 0.5) * 2  # -1 a sinistra, +1 a destra

def measure(c):
    cap = cv2.VideoCapture(f"{src}/{c}.mp4")
    n = int(cap.get(7))
    samples = []
    for fr in np.linspace(2, n - 3, 10).astype(int):
        cap.set(1, fr); ok, im = cap.read()
        if ok:
            samples.append(boxes(im[:, :, ::-1].astype(np.float32), *face(c, fr)))
    return {k: np.mean([s[k] for s in samples], 0) for k in samples[0]}

ALL = ["0103a", "0103b", "0103c", "0104", "0109", "0110"]
MEAS = {c: measure(c) for c in ALL}
TARGET["cam_ombra"] = np.median([MEAS[c]["cam_ombra"] for c in ALL], 0)
TARGET["cam_luce"] = np.median([MEAS[c]["cam_luce"] for c in ALL], 0)
WEIGHT.update({"cam_ombra": 1.5, "cam_luce": 2.0})
print("target camicia", np.round(TARGET["cam_ombra"]).tolist(), np.round(TARGET["cam_luce"]).tolist())

for c in ids:
    cap = cv2.VideoCapture(f"{src}/{c}.mp4")
    n = int(cap.get(7)); fps = cap.get(5)
    S = MEAS[c]
    # 1) sfumatura sinistra/destra dello sfondo
    half = (S["muro_dx"] - S["muro_sx"]) / 2  # da aggiungere: -half a destra, +half a sinistra
    grad = -np.outer(xs, half)  # (1080,3)
    # i campioni del muro dopo la correzione della sfumatura (il centro non cambia)
    wall_after = (S["muro_sx"] + S["muro_dx"]) / 2
    keys = ["viso", "fronte", "cam_ombra", "cam_luce"]
    X = np.array([S[k] for k in keys] + [wall_after]) / 255
    Y = np.array([TARGET[k] for k in keys] + [TARGET["muro"]]) / 255
    w = np.array([WEIGHT[k] for k in keys] + [WEIGHT["muro"]])
    # 2) minimi quadrati pesati con regolarizzazione verso l'identità: per ogni canale, coefficienti [r,g,b,1]
    A = np.hstack([X, np.ones((len(X), 1))]) * w[:, None]
    M = np.zeros((4, 3))
    for ch in range(3):
        ident = np.zeros(4); ident[ch] = 1
        lhs = A.T @ A + LAMBDA * np.eye(4)
        rhs = A.T @ (Y[:, ch] * w) + LAMBDA * ident
        M[:, ch] = np.linalg.solve(lhs, rhs)
    pred = (np.hstack([X, np.ones((len(X), 1))]) @ M) * 255
    print(c, "prima", np.round(X * 255).astype(int).tolist(), "\n   dopo", np.round(pred).astype(int).tolist())
    # applica a tutti i fotogrammi
    W_, H_ = int(cap.get(3)), int(cap.get(4))
    cap.set(1, 0)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W_}x{H_}", "-r", str(fps), "-i", "-",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-color_range", "tv",
                            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart",
                            f"{out_dir}/{c}.mp4"], stdin=subprocess.PIPE)
    Mm, off = M[:3].astype(np.float32), M[3].astype(np.float32)
    g = grad.astype(np.float32)[None, :, :] / 255
    while True:
        ok, im = cap.read()
        if not ok:
            break
        x = im[:, :, ::-1].astype(np.float32) / 255 + g
        y = x @ Mm + off
        enc.stdin.write((np.clip(y, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    json.dump({"matrice": M.tolist(), "sfumatura": half.tolist()}, open(f"{out_dir}/{c}.json", "w"))


def camicia_uniforme(path_in, path_out, fattore):
    """Riduce la saturazione dei soli blu scuri (camicia) con una maschera morbida: pelle e sfondo restano invariati."""
    cap = cv2.VideoCapture(path_in)
    W_, H_, fps = int(cap.get(3)), int(cap.get(4)), cap.get(5)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W_}x{H_}", "-r", str(fps), "-i", "-",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-color_range", "tv",
                            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", path_out], stdin=subprocess.PIPE)
    while True:
        ok, im = cap.read()
        if not ok:
            break
        x = im[:, :, ::-1].astype(np.float32)
        L = x @ np.array([.299, .587, .114], np.float32)
        blu = np.clip((x[:, :, 2] - x[:, :, 0] - 8) / 20, 0, 1) * np.clip((110 - L) / 40, 0, 1)
        blu = cv2.GaussianBlur(blu, (0, 0), 2)[:, :, None]
        des = L[:, :, None] + (x - L[:, :, None]) * fattore + 6
        y = x * (1 - blu) + des * blu
        enc.stdin.write(np.clip(y, 0, 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
