# Sfondo "moltiplicato": ripete uno o più scontorni (PNG con trasparenza) su tutto il cartello 1240x3508.
# uso: python3 moltiplica.py out.jpg --cut a.png [--cut b.png] [--tw 330] [--step 390] [--dx 0.86]
#      [--rot 9] [--bg 3a2214] [--affumica] [--seed 4]
import argparse, random
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument('out'); ap.add_argument('--cut', action='append', required=True)
ap.add_argument('--tw', type=int, default=330); ap.add_argument('--step', type=int, default=390)
ap.add_argument('--dx', type=float, default=0.86); ap.add_argument('--rot', type=float, default=9)
ap.add_argument('--bg', default='3a2214'); ap.add_argument('--affumica', action='store_true')
ap.add_argument('--seed', type=int, default=4)
a = ap.parse_args(); random.seed(a.seed)

def affumicata(im):
    r, g, b, al = im.split()
    rgb = ImageEnhance.Brightness(Image.merge('RGB', (r, g, b))).enhance(0.72)
    arr = np.array(rgb).astype(float); arr[..., 0] *= 1.05; arr[..., 1] *= 0.80; arr[..., 2] *= 0.48
    return Image.merge('RGBA', (*Image.fromarray(arr.clip(0, 255).astype('uint8')).split(), al))

cuts = [Image.open(c).convert('RGBA') for c in a.cut]
cuts = [c.crop(c.getbbox()) for c in cuts]
W, H = 1240, 3508
base = tuple(int(a.bg[i:i+2], 16) for i in (0, 2, 4))
grad = (0.85 + 0.3 * np.linspace(0, 1, H))[:, None, None]
bg = Image.fromarray((np.ones((H, W, 3)) * base * grad).clip(0, 255).astype('uint8'))
r = 0; y = -int(a.step * 0.4)
while y < H + 100:
    x = -int(a.tw * 0.36) + (int(a.tw * a.dx) // 2 if r % 2 else 0) - random.randint(0, 60)
    c = 0
    while x < W + 50:
        t = cuts[(r + c) % len(cuts)].copy()
        if random.random() < 0.5: t = t.transpose(Image.FLIP_LEFT_RIGHT)
        if a.affumica and (r + c) % 2: t = affumicata(t)
        s = a.tw * random.uniform(0.92, 1.08) / t.width
        t = t.resize((int(t.width * s), int(t.height * s)), Image.LANCZOS)
        t = t.rotate(random.uniform(-a.rot, a.rot), expand=True, resample=Image.BICUBIC)
        sh = Image.new('RGBA', t.size, (0, 0, 0, 0)); sh.putalpha(t.split()[3].point(lambda v: int(v * 0.55)))
        sh = sh.filter(ImageFilter.GaussianBlur(14))
        yy = y + random.randint(-25, 25)
        bg.paste((0, 0, 0), (x + 14, yy + 18), sh); bg.paste(t, (x, yy), t)
        x += int(a.tw * a.dx); c += 1
    y += a.step; r += 1
bg.save(a.out, quality=93)
