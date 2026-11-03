"""Genera una piccola libreria di effetti sonori (48 kHz, stereo) per il reel.
Sostituisce temporaneamente libreria_sfx_reel.zip: stessi nomi, così si possono scambiare i file."""
import sys, os, wave, numpy as np

SR = 48000
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)

def save(name, x, pan=0.0):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    l, r = x * (1 - max(pan, 0)), x * (1 + min(pan, 0))
    st = np.stack([l, r], 1)
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def t(d): return np.arange(int(SR * d)) / SR

def bandnoise(d, f0, f1, q=0.25):
    """rumore filtrato con una banda che scorre da f0 a f1 (filtro risonante semplice)"""
    n = rng.standard_normal(int(SR * d))
    f = np.geomspace(f0, f1, len(n))
    y = np.zeros_like(n); s1 = s2 = 0.0
    for i in range(len(n)):
        g = np.tan(np.pi * f[i] / SR); k = 1 / q * 0.5
        a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2
        v3 = n[i] - s2; v1 = a1 * s1 + a2 * v3; v2 = s2 + a2 * s1 + a3 * v3
        s1 = 2 * v1 - s1; s2 = 2 * v2 - s2
        y[i] = v1
    return y

def env(d, peak, attack_curve=2.0, release_curve=2.5):
    tt = t(d); e = np.where(tt < peak, (tt / peak) ** attack_curve, ((d - tt) / (d - peak)) ** release_curve)
    return e

def whoosh(d, f0, f1, peak):
    return bandnoise(d, f0, f1) * env(d, peak)

save("short_whoosh", whoosh(0.35, 500, 3500, 0.22))
save("short_whoosh_2", whoosh(0.32, 700, 2800, 0.2))
save("quick_whoosh", whoosh(0.22, 900, 4500, 0.13))
save("hollow_whoosh", whoosh(0.6, 250, 1400, 0.38) + 0.4 * whoosh(0.6, 120, 500, 0.38))
save("low_whoosh", whoosh(0.7, 120, 700, 0.42))
save("low_slow_whoosh", whoosh(1.2, 90, 500, 0.75))
save("attack_whoosh", whoosh(0.6, 300, 5000, 0.55))

# boom sub: sinusoide che scende 70->38 Hz con un piccolo click d'attacco
d = 1.1; tt = t(d); f = 38 + 32 * np.exp(-tt * 9)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
boom[:240] += rng.standard_normal(240) * np.linspace(0.6, 0, 240)
save("boom_sub", boom)

# click e tick
def click(d, f, decay):
    tt = t(d); return np.sin(2 * np.pi * f * tt) * np.exp(-tt * decay) + 0.3 * rng.standard_normal(len(tt)) * np.exp(-tt * decay * 3)
save("click_secco", click(0.06, 2400, 120))
save("tick_rapido", click(0.03, 4200, 260))
save("tap_grave", click(0.12, 380, 45))
dc = np.concatenate([click(0.06, 2600, 120), np.zeros(int(SR * 0.07)), click(0.06, 2900, 120)])
save("doppio_click", dc)

# swoosh brillante: whoosh acuto + scintillio
d = 0.7; tt = t(d)
shimmer = sum(np.sin(2 * np.pi * fr * tt + i) for i, fr in enumerate([2093, 2637, 3136, 4186])) * np.exp(-tt * 5) * (tt / 0.08).clip(0, 1)
save("swoosh_brillante", whoosh(d, 1500, 7000, 0.18) + 0.25 * shimmer)

# riser tonale che finisce di colpo
d = 1.4; tt = t(d); f = 220 * (2 ** (tt / d * 1.5))
riser = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + bandnoise(d, 400, 6000) * 0.6) * (tt / d) ** 2
save("riser_tonale", riser)
print("ok")
