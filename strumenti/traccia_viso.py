"""Traccia il viso in ogni clip preparata (5 campioni al secondo) e salva un JSON per Remotion.
uso: python traccia_viso.py <cartella_clip> <yunet.onnx> <uscita.json>"""
import cv2, json, sys, glob, os, numpy as np

clips, model, out = sys.argv[1], sys.argv[2], sys.argv[3]
det = cv2.FaceDetectorYN.create(model, "", (320, 320), 0.6)
res = {}
for n in sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(f"{clips}/*.mp4")):
    cap = cv2.VideoCapture(f"{clips}/{n}.mp4")
    fps = cap.get(cv2.CAP_PROP_FPS); total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    pts = []
    for fr in range(0, total, 6):
        cap.set(cv2.CAP_PROP_POS_FRAMES, fr)
        ok, im = cap.read()
        if not ok:
            break
        small = cv2.resize(im, (540, 960))
        det.setInputSize((540, 960))
        _, faces = det.detect(small)
        if faces is None:
            continue
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])[:4]
        pts.append([fr, (x + w / 2) / 540, (y + h / 2) / 960, h / 960])
    a = np.array(pts)
    # smussa la traccia (media mobile su ~1 s) per evitare tremolii dell'inquadratura
    k = 5
    sm = a.copy()
    for c in (1, 2, 3):
        pad = np.pad(a[:, c], (k // 2, k // 2), mode="edge")
        sm[:, c] = np.convolve(pad, np.ones(k) / k, mode="valid")
    res[n] = [[int(r[0]), round(float(r[1]), 4), round(float(r[2]), 4), round(float(r[3]), 4)] for r in sm]
    print(n, len(pts), "campioni, cy medio", round(float(a[:, 2].mean()), 3), "h medio", round(float(a[:, 3].mean()), 3))
json.dump(res, open(out, "w"))
