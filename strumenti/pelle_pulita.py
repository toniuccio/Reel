"""Pulisce la pelle del viso nelle clip preparate: leviga solo i toni pelle dentro l'area del viso
(occhi, sopracciglia, barba e capelli restano nitidi) e schiarisce un po' le ombre del viso (occhiaie).
uso: python pelle_pulita.py <clip.mp4> <faces.json> <id> <uscita.mp4> [forza=0.55] [ombre=0.35]"""
import cv2, json, subprocess, sys, numpy as np

src, faces_json, cid, out = sys.argv[1:5]
amt = float(sys.argv[5]) if len(sys.argv) > 5 else 0.55
lift = float(sys.argv[6]) if len(sys.argv) > 6 else 0.35
tr = json.load(open(faces_json))[cid]

cap = cv2.VideoCapture(src)
W, H = int(cap.get(3)), int(cap.get(4))
fps = cap.get(5)
enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
     "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-color_range", "tv",
     "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", out],
    stdin=subprocess.PIPE)

def face_at(f):
    if f <= tr[0][0]:
        return tr[0][1:]
    for a, b in zip(tr, tr[1:]):
        if f <= b[0]:
            k = (f - a[0]) / (b[0] - a[0])
            return [a[i] + (b[i] - a[i]) * k for i in (1, 2, 3)]
    return tr[-1][1:]

# curva per le ombre del viso: alza solo i toni scuri/medi (occhiaie), lascia le luci
x = np.arange(256, dtype=np.float32)
lift_lut = np.clip(x + lift * 40 * np.exp(-((x - 70) / 45) ** 2), 0, 255).astype(np.uint8)

f = 0
while True:
    ok, im = cap.read()
    if not ok:
        break
    cx, cy, h = face_at(f)
    cx, cy, h = cx * W, cy * H, h * H
    # maschera: ellisse del viso morbida × toni pelle
    area = np.zeros((H, W), np.float32)
    cv2.ellipse(area, (int(cx), int(cy + h * 0.05)), (int(h * 0.48), int(h * 0.68)), 0, 0, 360, 1.0, -1)
    area = cv2.GaussianBlur(area, (0, 0), h * 0.08)
    ycc = cv2.cvtColor(im, cv2.COLOR_BGR2YCrCb)
    skin = ((ycc[:, :, 1] > 133) & (ycc[:, :, 1] < 178) & (ycc[:, :, 2] > 80) & (ycc[:, :, 2] < 130) & (ycc[:, :, 0] > 50)).astype(np.float32)
    skin = cv2.GaussianBlur(skin, (0, 0), 3)
    m = (area * skin)[:, :, None]
    # levigatura che rispetta i bordi
    smooth = cv2.bilateralFilter(im, 9, 28, 7)
    smooth = cv2.bilateralFilter(smooth, 7, 18, 5)
    # ombre del viso
    yl = ycc.copy()
    yl[:, :, 0] = lift_lut[ycc[:, :, 0]]
    lifted = cv2.cvtColor(yl, cv2.COLOR_YCrCb2BGR)
    base = im.astype(np.float32) * (1 - m * lift / max(lift, 1e-6)) + lifted.astype(np.float32) * (m * lift / max(lift, 1e-6)) if lift > 0 else im.astype(np.float32)
    res = base * (1 - m * amt) + smooth.astype(np.float32) * (m * amt)
    enc.stdin.write(np.clip(res, 0, 255).astype(np.uint8).tobytes())
    f += 1
enc.stdin.close()
enc.wait()
print(cid, f, "frame")
