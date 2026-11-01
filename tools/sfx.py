"""The film's own sound effects, synthesised: a phone ringing, the delivery app's ding, a dinosaur roar, a mic drop
(a thud and a squeal of feedback), snoring, a record scratch that stops the beat, a chain clinking, a gong for the
chains lighting up, and a sad trombone for going home. Writes audio/sfx/<name>.mp3.

    python tools/sfx.py
"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from perform import encode, tts, rubber, SR, env, rng  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audio', 'sfx')
t_ = lambda d: np.arange(int(d * SR)) / SR
def save(name, x): x = np.asarray(x, dtype=np.float64); m = np.max(np.abs(x)); encode(x / m * 0.85 if m > 0 else x, os.path.join(OUT, name + '.mp3')); print(name, round(len(x) / SR, 2))

# a phone: two trills of 440+480 Hz
x = np.zeros(int(2.6 * SR))
for k in range(2):
    t = t_(0.9); tr = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (np.sign(np.sin(2 * np.pi * 20 * t)) > 0) * 0.4
    x[int(k * 1.3 * SR): int(k * 1.3 * SR) + len(tr)] += tr
save('ring', x)
# the app: ding-dong
t = t_(1.0); save('notify', np.sin(2 * np.pi * 1318 * t) * np.exp(-t * 4) * (t < 0.4) + np.concatenate([np.zeros(int(0.25 * SR)), (np.sin(2 * np.pi * 1046 * t) * np.exp(-t * 3))[:int(0.75 * SR)]]))
# a roar: a growl recorded, pitched down, roughened
g = tts('嘎啊啊啊吼', 'zh-CN-YunjianNeural', -20, -30); g = rubber(g, tempo=0.6, pitch=0.5); n = len(g); g = np.tanh(g * 4) * 0.7 + rng.normal(0, 0.05, n) * np.abs(g)
save('roar', g)
# a mic drop: a hollow thud, then feedback squealing up
t = t_(2.2); thud = np.sin(2 * np.pi * (60 + 80 * np.exp(-t * 30)) * t) * np.exp(-t * 9); fb = np.sin(2 * np.pi * np.cumsum(2200 + 600 * np.minimum(1, t / 1.5)) / SR) * np.minimum(1, np.maximum(0, t - 0.3) * 2) * np.exp(-np.maximum(0, t - 1.6) * 6) * 0.25
save('micdrop', thud + fb + rng.normal(0, 1, len(t)) * np.exp(-t * 25) * 0.3)
# snoring: three breaths, a buzzy in and a whistle out
x = np.zeros(int(4.5 * SR))
for k in range(3):
    t = t_(0.9); inn = np.sign(np.sin(2 * np.pi * 70 * t)) * rng.normal(0.5, 0.2, len(t)) * np.sin(np.pi * t / 0.9) * 0.4; s = int(k * 1.5 * SR); x[s:s + len(t)] += inn
    t2 = t_(0.5); out = np.sin(2 * np.pi * (1200 - 400 * t2) * t2) * np.sin(np.pi * t2 / 0.5) * 0.12; x[s + int(0.95 * SR): s + int(0.95 * SR) + len(t2)] += out
save('snore', x)
# a record scratch: the beat stops
t = t_(0.7); f = 900 * np.exp(-t * 4) + 80; sc = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * rng.normal(0.7, 0.3, len(t)) * np.exp(-t * 3)
save('scratchstop', sc)
# a chain: metal clinks
x = np.zeros(int(0.8 * SR))
for k, d in enumerate([0, 0.09, 0.2, 0.33]):
    t = t_(0.4); c = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (12 + i * 5)) for i, f in enumerate([2400 + k * 150, 3900 + k * 90, 5600])) * 0.3; s = int(d * SR); x[s:s + len(c)] += c
save('clank', x)
# a gong for a chain lighting up: a bright metallic hit with a swell
t = t_(2.0); save('chain', sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) for f, dcy in [(523, 1.6), (784, 2.0), (1046, 2.4), (1568, 3.5), (2093, 4.5)]) * (1 - np.exp(-t * 200)))
# a sad trombone: wah wah wah waaah
x = []
for f, d in [(233, 0.45), (220, 0.45), (208, 0.45), (196, 1.4)]:
    t = t_(d); vib = np.sin(2 * np.pi * 6 * t) * (t > 0.3) * 4; ph = 2 * np.pi * np.cumsum(f + vib) / SR; x.append((np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.minimum(1, t / 0.04) * np.exp(-np.maximum(0, t - d + 0.1) * 30))
save('sadtrombone', np.concatenate(x))
# a whoosh and an air horn for the big moments
t = t_(0.6); save('whoosh', rng.normal(0, 1, len(t)) * np.sin(np.pi * t / 0.6) ** 2 * 0.5)
t = t_(1.2); save('airhorn', np.sign(np.sin(2 * np.pi * 466 * t)) * 0.4 + np.sign(np.sin(2 * np.pi * 470 * t)) * 0.3 * np.minimum(1, t / 0.02) * (np.exp(-np.maximum(0, t - 1.0) * 20)))
