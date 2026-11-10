"""Effetti sonori aggiuntivi per avere più varietà (48 kHz, stereo). Si affiancano a quelli di genera_sfx.py.
uso: python genera_sfx_extra.py <cartella_uscita>"""
import sys, os, wave, numpy as np

SR = 48000
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(11)

def t(d): return np.arange(int(SR * d)) / SR

def save(name, l, r=None, gain=0.85):
    r = l if r is None else r
    m = max(np.abs(l).max(), np.abs(r).max()) + 1e-9
    st = np.stack([l, r], 1) / m * gain
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print(name, f"{len(l)/SR:.2f}s")

def env(d, peak, a=2.0, r=2.5):
    tt = t(d)
    return np.where(tt < peak, (tt / peak) ** a, np.clip((d - tt) / (d - peak), 0, 1) ** r)

def lp(x, fc):
    """passa-basso a un polo (fc può variare nel tempo)"""
    fc = np.broadcast_to(fc, x.shape)
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * fc[i] / SR); s += a * (x[i] - s); y[i] = s
    return y

def sweep_noise(d, f0, f1):
    n = rng.standard_normal(int(SR * d))
    f = np.geomspace(f0, f1, len(n))
    hi = lp(n, f * 1.6); lo = lp(n, f * 0.6)
    return hi - lo

def tone(d, f, decay):
    tt = t(d); return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, tt.shape)) / SR) * np.exp(-tt / decay)

# pop morbido (ingresso di pillole e celle)
d = 0.12; f = np.linspace(520, 260, int(SR * d)); x = tone(d, f, 0.035) * np.minimum(1, t(d) / 0.004)
save("pop_morbido", x)
# bolla (comparsa leggera)
d = 0.09; f = np.linspace(320, 980, int(SR * d)); save("bolla", tone(d, f, 0.03) * np.minimum(1, t(d) / 0.003))
# ting (spunta, evidenza)
d = 0.7; x = tone(d, 2637, 0.18) + 0.55 * tone(d, 3951, 0.12) + 0.25 * tone(d, 5274, 0.07)
save("ting", x * np.minimum(1, t(d) / 0.002), gain=0.6)
# chime a due note (conferma)
d = 0.55; a = tone(d, 880, 0.16); b = np.concatenate([np.zeros(int(SR * 0.08)), tone(d - 0.08, 1318.5, 0.18)])
save("chime_ok", (a + b) * np.minimum(1, t(d) / 0.003), gain=0.55)
# swipe su / giù (testi che entrano / escono)
d = 0.28; x = sweep_noise(d, 700, 6500) * env(d, 0.17, 1.6, 2.2); save("swipe_su", x, gain=0.7)
d = 0.26; x = sweep_noise(d, 6500, 600) * env(d, 0.07, 1.4, 2.6); save("swipe_giu", x, gain=0.6)
# carta (foglio che scivola)
d = 0.32; n = rng.standard_normal(int(SR * d)); grain = (rng.random(len(n)) > 0.7) * 1.0
x = (n - lp(n, 1800)) * (0.6 + 0.4 * lp(grain, 60)) * env(d, 0.12, 1.5, 2.0); save("carta", x, gain=0.55)
# tonfo morbido (cassetto che si chiude)
d = 0.35; x = tone(d, np.linspace(110, 70, int(SR * d)), 0.09) + 0.35 * lp(rng.standard_normal(int(SR * d)), 400) * np.exp(-t(d) / 0.05)
save("tonfo_morbido", x * np.minimum(1, t(d) / 0.002))
# blip digitale (interfaccia, navigatore)
d1 = 0.045; s = np.sign(np.sin(2 * np.pi * 1250 * t(d1))) * 0.4; s2 = np.sign(np.sin(2 * np.pi * 1870 * t(d1))) * 0.4
x = np.concatenate([lp(s, 5000), np.zeros(int(SR * 0.02)), lp(s2, 5000)]); x *= np.exp(-np.arange(len(x)) / SR / 0.08)
save("blip_digitale", x, gain=0.45)
# riser corto (prima di una parola chiave)
d = 0.8; x = sweep_noise(d, 400, 7000) * env(d, 0.78, 2.6, 0.5) + 0.3 * tone(d, np.geomspace(200, 800, int(SR * d)), 10) * env(d, 0.78, 2.6, 0.5)
save("riser_corto", x, gain=0.6)
# whoosh al contrario (risucchio prima di un taglio)
d = 0.55; x = sweep_noise(d, 500, 4000) * env(d, 0.5, 3.0, 0.6); save("whoosh_reverse", x, gain=0.7)
# whoosh largo per i chevron, che passa da sinistra a destra
d = 0.95; x = sweep_noise(d, 180, 2400) * env(d, 0.48, 1.8, 2.2); pan = np.linspace(-0.8, 0.8, len(x))
save("whoosh_largo", x * (1 - np.clip(pan, 0, 1)), x * (1 + np.clip(pan, -1, 0)), gain=0.8)
# brillio (comparsa luminosa, scudo, logo)
d = 0.6; n = rng.standard_normal(int(SR * d)); x = (n - lp(n, 6000)) * env(d, 0.08, 1.2, 2.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t(d)))
save("brillio", x + 0.4 * tone(d, 3520, 0.2), gain=0.45)
