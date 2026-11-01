"""Makes the performances of 《大嘻哈時代3》: for each contestant a beat (synthesised here: kicks, snares, hats, an 808,
chords) and the vocal lines laid on it — rap fitted to its bars (edge-tts, then stretched to the beat with rubberband),
singing tuned note by note (each syllable recorded alone, then moved to its notes with TD-PSOLA: the hard-tuned
sound of R&B), and plain talk where the song falls apart.

    python tools/perform.py                 # every performance
    python tools/perform.py josh            # one

Writes audio/sfx/beat_<id>.mp3 (the beat, played as a sample when the performance starts), audio/rap1/p_<id>_NN.mp3
(each vocal line, padded to its slot) and audio/perf.json (for every line: when it starts in the performance, how long
its slot is, the file, the mouth envelope, the words). The film reads perf.json through js/films/rap1.perf.js.
Needs edge-tts, numpy, soundfile and ffmpeg (with rubberband).
"""
import asyncio, json, os, subprocess, sys, hashlib, re
import numpy as np
import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from songs import SONGS  # noqa: E402

SR = 44100
CACHE = os.path.join(HERE, 'tts_cache'); os.makedirs(CACHE, exist_ok=True)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def midi(n):  # 'A4', 'Eb5', 'F#3'
    m = re.match(r'^([A-G])([#b]?)(-?\d)$', n); v = NOTE[m[1]] + (1 if m[2] == '#' else -1 if m[2] == 'b' else 0); return v + (int(m[3]) + 1) * 12
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# ---------------------------------------------------------------- audio in and out
def decode(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()
def encode(x, path, stereo=None):
    ch = 1
    if stereo is None: x = np.clip(x, -1, 1).astype(np.float32)
    else: x = np.stack([np.clip(stereo[0], -1, 1), np.clip(stereo[1], -1, 1)], 1).astype(np.float32).reshape(-1); ch = 2
    p = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-b:a', '160k', path], input=x.tobytes())
    assert p.returncode == 0, path
def rubber(x, tempo=1.0, pitch=1.0):
    """time-stretch (tempo > 1 is faster) and/or pitch-shift (a ratio) with ffmpeg's rubberband"""
    p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', f'rubberband=tempo={tempo:.5f}:pitch={pitch:.5f}:formant=preserved', '-f', 'f32le', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()
async def _tts(text, voice, rate, pitch, path):
    await asyncio.wait_for(edge_tts.Communicate(text, voice, rate=f'{rate:+d}%', pitch=f'{pitch:+d}Hz').save(path), 40)
def tts(text, voice, rate=0, pitch=0):
    key = hashlib.md5(f'{text}|{voice}|{rate}|{pitch}'.encode()).hexdigest()[:16]; path = os.path.join(CACHE, key + '.mp3')
    for attempt in range(6):
        if os.path.exists(path) and os.path.getsize(path) > 0: break
        try: asyncio.run(_tts(text, voice, rate, pitch, path))
        except Exception as e: print('  retry', text, e); asyncio.run(asyncio.sleep(2))
    return trim(decode(path))
def trim(x, th=0.02):
    a = np.abs(x); idx = np.where(a > th * max(1e-6, a.max()))[0]
    if not len(idx): return x[:1]
    return x[max(0, idx[0] - 200): idx[-1] + 400]
def fade(x, a=0.004, b=0.02):
    n1, n2 = int(a * SR), int(b * SR); x = x.copy()
    if len(x) > n1 + n2: x[:n1] *= np.linspace(0, 1, n1); x[-n2:] *= np.linspace(1, 0, n2)
    return x

# ---------------------------------------------------------------- TD-PSOLA: move a recorded syllable to a melody
def f0_track(x, hop):
    w = int(0.032 * SR); n = max(1, (len(x) - w) // hop + 1); f0 = np.zeros(n); lo, hi = int(SR / 520), int(SR / 65)
    win = np.hanning(w)
    for i in range(n):
        seg = x[i * hop: i * hop + w]
        if len(seg) < w: break
        seg = (seg - seg.mean()) * win; e = np.dot(seg, seg)
        if e < 1e-5: continue
        F = np.fft.rfft(seg, 2 * w); ac = np.fft.irfft(F * np.conj(F))[:w]; ac /= ac[0] + 1e-12
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.42: f0[i] = SR / lag
    # tidy: a median over five frames, octave jumps folded back
    g = f0.copy()
    for i in range(len(f0)):
        v = [u for u in f0[max(0, i - 2): i + 3] if u > 0]
        if f0[i] > 0 and v: med = np.median(v); g[i] = f0[i] / 2 if f0[i] > med * 1.7 else f0[i] * 2 if f0[i] < med * 0.6 else f0[i]
    return g
def psola(x, target, out_len, vib=0.0, vib_rate=5.5):
    """target(u) -> Hz for u in 0..1 across the output; returns out_len samples"""
    hop = int(0.005 * SR); f0 = f0_track(x, hop)
    if not np.any(f0 > 0): return rubber(x, tempo=len(x) / max(1, out_len))[:out_len]
    fa = lambda s: f0[min(len(f0) - 1, max(0, int(s // hop)))]
    # analysis marks: one per period through the voiced parts
    marks = []; s = 0
    while s < len(x):
        f = fa(s)
        if f > 0: marks.append(int(s)); s += SR / f
        else: s += hop
    marks = np.array(marks) if marks else np.array([len(x) // 2])
    out = np.zeros(out_len + 4096); k = len(x) / max(1, out_len); tau = 0.0; h2 = int(0.012 * SR); uwin = np.hanning(2 * h2)
    while tau < out_len:
        ta = tau * k; f = fa(ta)
        if f > 0:
            m = marks[np.argmin(np.abs(marks - ta))]; Ta = int(SR / max(60, fa(m) or f)); a, b = m - Ta, m + Ta
            if a < 0 or b > len(x): tau += Ta; continue
            u = tau / out_len; ft = target(u) * (1 + vib * np.sin(2 * np.pi * vib_rate * tau / SR) * min(1, u * 3))
            Pt = SR / max(60, ft); g = x[a:b] * np.hanning(b - a) * (Pt / Ta)
            c = int(tau) - Ta
            if c >= 0: out[c:c + len(g)] += g
            tau += Pt
        else:
            c = int(ta) - h2
            if 0 <= c and c + 2 * h2 <= len(x): out[int(tau): int(tau) + 2 * h2] += x[c:c + 2 * h2] * uwin
            tau += h2
    return out[:out_len]

# ---------------------------------------------------------------- the beats
rng = np.random.default_rng(7)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(1e-4, a)) * np.exp(-t / d)
def kick(soft=False):
    n = int(0.45 * SR); t = np.arange(n) / SR; f = 45 + 110 * np.exp(-t / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.16 if soft else 0.22) * (0.8 if soft else 1.0) + rng.normal(0, 0.15, n) * env(n, 0.0005, 0.004)
def snare(clap=False):
    n = int(0.3 * SR); t = np.arange(n) / SR; nz = rng.normal(0, 1, n)
    nz = np.convolve(nz, [1, -0.9], 'same')
    if clap: e = sum(env(n, 0.0005, 0.012) * (np.arange(n) >= int(d * SR)) * 1 for d in (0, 0.011, 0.022)) * 0.5 + env(n, 0.001, 0.09) * 0.6; return nz * e * 0.55
    return (nz * env(n, 0.001, 0.07) * 0.5 + np.sin(2 * np.pi * 190 * t) * env(n, 0.001, 0.05) * 0.5) * 0.9
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); nz = rng.normal(0, 1, n); nz = np.convolve(nz, [1, -1, 0.3], 'same')
    return nz * env(n, 0.0005, 0.09 if open_ else 0.018) * 0.22
def snap():
    n = int(0.08 * SR); nz = rng.normal(0, 1, n); return np.convolve(nz, [1, -1], 'same') * env(n, 0.0003, 0.012) * 0.35
def bass808(f, dur, glide=None):
    n = int(dur * SR); t = np.arange(n) / SR; ff = f if glide is None else f + (glide - f) * np.minimum(1, t / 0.08)
    ph = 2 * np.pi * np.cumsum(np.full(n, ff) if np.isscalar(ff) else ff) / SR; x = np.sin(ph) + 0.25 * np.sin(2 * ph)
    return np.tanh(x * 1.4) * env(n, 0.003, max(0.2, dur * 0.8)) * 0.55
def keys(fs, dur, kind='rhodes'):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for f in fs:
        if kind == 'rhodes': x += (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.3)) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
        elif kind == 'pad': x += sum(np.sin(2 * np.pi * f * (1 + d) * t + d * 9) for d in (-0.004, 0, 0.004)) / 3
        elif kind == 'pluck': x += np.sign(np.sin(2 * np.pi * f * t)) * 0.3 * np.exp(-t / 0.12) + np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25)
        elif kind == 'stab': x += (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t)) * np.exp(-t / 0.15)
    a = env(n, 0.01 if kind != 'pad' else 0.3, dur * (0.9 if kind == 'pad' else 0.6))
    return x * a * (0.07 if kind == 'pad' else 0.09) / max(1, len(fs) ** 0.5)
def chord(name, octave=3):
    m = re.match(r'^([A-G][#b]?)(m7|maj7|m|7|sus4)?$', name); root = midi(m[1] + str(octave)); q = m[2] or ''
    iv = {'m': [0, 3, 7], 'm7': [0, 3, 7, 10], 'maj7': [0, 4, 7, 11], '7': [0, 4, 7, 10], 'sus4': [0, 5, 7], '': [0, 4, 7]}[q]
    return [hz(root + i + 12) for i in iv], hz(root - 12)
def put(buf, x, at):
    i = int(at * SR)
    if i >= len(buf) or i < 0: return
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n]
def crackle(n):
    x = np.zeros(n); idx = rng.integers(0, n, n // 900); x[idx] = rng.normal(0, 0.25, len(idx)); return np.convolve(x, [1, 0.5, 0.2], 'same') + rng.normal(0, 0.004, n)

def make_beat(S, total):
    bpm, style = S['bpm'], S['style']; b = 60 / bpm; bar = 4 * b; n = int((total + 2) * SR); L = np.zeros(n); R = np.zeros(n)
    stops = S.get('stops', []); prog = S.get('chords', ['Am', 'F', 'C', 'G'])
    def on(bar_i): return not any(a <= bar_i < z for a, z in stops)
    nbars = int(np.ceil(total / bar))
    for bi in range(nbars):
        t0 = bi * bar
        if t0 >= total: break
        if not on(bi): continue
        ch, root = chord(prog[bi % len(prog)])
        intro = bi < S.get('intro', 1)
        if style == 'boom':   # boom bap: a dusty kick-snare, swung hats, rhodes, a walking bass
            for s in range(8):
                tt = t0 + s * b / 2 + (b * 0.06 if s % 2 else 0)
                if not intro or s >= 4: put(L, hat(s == 7), tt); put(R, hat(s == 7) * 0.8, tt)
            if not intro:
                for k in (0, 1.5 * b, 2.5 * b): put(L, kick(), t0 + k); put(R, kick(), t0 + k)
                for k in (b, 3 * b): put(L, snare(), t0 + k); put(R, snare(), t0 + k)
                put(L, bass808(root, b * 1.6) * 0.6, t0); put(R, bass808(root, b * 1.6) * 0.6, t0); put(L, bass808(root * 1.5, b * 0.9) * 0.5, t0 + 2.5 * b); put(R, bass808(root * 1.5, b * 0.9) * 0.5, t0 + 2.5 * b)
            k_ = keys(ch, bar, 'rhodes'); put(L, k_, t0); put(R, k_ * 0.9, t0 + 0.01)
        elif style == 'trap':  # trap: half-time snare on 3, rolling hats, a long gliding 808
            for s in range(16):
                tt = t0 + s * b / 4
                if s % 2 == 0 or (s in (13, 14, 15) and bi % 2): put(L, hat() * (0.9 if s % 4 else 1.1), tt); put(R, hat() * 0.8, tt)
            if not intro:
                for k in (0, 1.75 * b, 2.5 * b): put(L, kick(), t0 + k); put(R, kick(), t0 + k)
                put(L, snare(True), t0 + 2 * b); put(R, snare(True), t0 + 2 * b)
                x = bass808(root, bar * 0.95, glide=root * (1.5 if bi % 2 else 1)); put(L, x, t0); put(R, x, t0)
            k_ = keys(ch, bar, 'pluck') * 0.8; put(L, k_, t0); put(R, k_, t0 + 0.012)
        elif style == 'rnb':   # a slow jam: soft kick, snaps, a warm pad and rhodes, a round bass
            if not intro:
                for k in (0, 2.25 * b): put(L, kick(True), t0 + k); put(R, kick(True), t0 + k)
                for k in (b, 3 * b): put(L, snap(), t0 + k); put(R, snap() * 0.9, t0 + k + 0.005)
                for s in range(8): put(R, hat() * 0.5, t0 + s * b / 2 + (b * 0.08 if s % 2 else 0))
                x = bass808(root, bar * 0.9) * 0.8; put(L, x, t0); put(R, x, t0)
            p = keys(ch, bar, 'pad'); put(L, p, t0); put(R, p, t0)
            r = keys([f * 2 for f in ch], bar, 'rhodes') * 0.7; put(L, r, t0 + 0.02); put(R, r, t0)
        elif style == 'house':  # four on the floor for the gym
            for s in range(4): put(L, kick(), t0 + s * b); put(R, kick(), t0 + s * b)
            if not intro:
                for s in range(4): put(L, hat(True) * 0.7, t0 + s * b + b / 2); put(R, hat(True) * 0.7, t0 + s * b + b / 2)
                for k in (b, 3 * b): put(L, snare(True), t0 + k); put(R, snare(True), t0 + k)
                for s in range(8): x = bass808(root * (2 if s % 2 else 1), b / 2 * 0.9) * 0.45; put(L, x, t0 + s * b / 2); put(R, x, t0 + s * b / 2)
            k_ = keys(ch, b * 0.5, 'stab'); put(L, k_, t0 + b * 0.5); put(R, k_, t0 + b * 2.5)
        elif style == 'lofi':  # lo-fi: lazy and soft, vinyl crackle
            if not intro:
                for k in (0, 2.5 * b): put(L, kick(True) * 0.7, t0 + k); put(R, kick(True) * 0.7, t0 + k)
                for k in (b, 3 * b): put(L, snare() * 0.5, t0 + k + 0.03); put(R, snare() * 0.5, t0 + k + 0.03)
                for s in range(8): put(L, hat() * 0.5, t0 + s * b / 2 + (b * 0.1 if s % 2 else 0))
            k_ = keys([f * 2 for f in ch], bar, 'rhodes') * 0.8; put(L, k_, t0); put(R, k_, t0 + 0.015)
    # a DJ scratch into the first bar, a crash where the song starts, a final hit
    scr = S.get('scratch', True)
    if scr:
        n2 = int(0.5 * SR); t = np.arange(n2) / SR; f = 300 + 900 * np.abs(np.sin(2 * np.pi * 3 * t)); sc = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * rng.normal(0.6, 0.2, n2) * env(n2, 0.01, 0.3) * 0.25
        put(L, sc, max(0, S.get('intro', 1) * bar - 0.55)); put(R, sc, max(0, S.get('intro', 1) * bar - 0.55))
    if style == 'lofi' or style == 'boom': c = crackle(n) * 0.6; L += c; R += c
    end = S.get('end_hit', True)
    if end:
        k_ = kick() * 1.2; put(L, k_, total - 0.05); put(R, k_, total - 0.05)
        cr = rng.normal(0, 1, int(1.6 * SR)) * env(int(1.6 * SR), 0.001, 0.5) * 0.18; cr = np.convolve(cr, [1, -0.8], 'same'); put(L, cr, total - 0.05); put(R, cr, total - 0.05)
    # cut at the end of the song (a beat that stops dead is part of a joke)
    cut = int((total + (1.6 if end else 0.05)) * SR); L, R = L[:cut], R[:cut]
    pk = max(1e-6, np.max(np.abs(np.concatenate([L, R])))); return L / pk * 0.85, R / pk * 0.85

# ---------------------------------------------------------------- vocals
def roomy(x, wet=0.18, len_=1.2):
    n = int(len_ * SR); ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / SR / (len_ / 5)); ir[0] = 0
    y = np.convolve(x, ir)[:len(x) + n] * wet / np.sqrt(n) * 30; z = np.zeros(len(y)); z[:len(x)] += x; return z + y
def double(x, cents=12, delay=0.016, gain=0.35):
    y = rubber(x, pitch=2 ** (cents / 1200)); d = int(delay * SR); z = np.zeros(len(x) + d); z[:len(x)] += x; z[d:d + len(y)] += y[:len(x)] * gain; return z
def comp(x, drive=2.2): return np.tanh(x * drive) / np.tanh(drive)
def norm(x, peak=0.8): m = np.max(np.abs(x)) if len(x) else 0; return x / m * peak if m > 0 else x

async def _tts_words(text, voice, rate, pitch, path):
    c = edge_tts.Communicate(text, voice, rate=f'{rate:+d}%', pitch=f'{pitch:+d}Hz', boundary='WordBoundary'); words = []
    with open(path, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append([ch['offset'] / 1e7, ch['duration'] / 1e7, ch['text']])
    json.dump(words, open(path + '.json', 'w', encoding='utf-8'), ensure_ascii=False)
def tts_words(text, voice, rate=0, pitch=0):
    """a recording and where each word in it starts and ends (seconds); not trimmed, so the times hold"""
    key = hashlib.md5(f'wb|{text}|{voice}|{rate}|{pitch}'.encode()).hexdigest()[:16]; path = os.path.join(CACHE, key + '.mp3')
    for attempt in range(6):
        if os.path.exists(path + '.json') and os.path.getsize(path) > 0: break
        try: asyncio.run(asyncio.wait_for(_tts_words(text, voice, rate, pitch, path), 40))
        except Exception as e: print('  retry', text, e); asyncio.run(asyncio.sleep(2))
    return decode(path), json.load(open(path + '.json', encoding='utf-8'))
PUNCT = set('，,、！!？?。；;…～~—')
def syllables(w):
    """a word's beats: one per Chinese character, roughly one per vowel group in English (Josh 1, Jasper 2, logo 2)"""
    n = sum(1 for ch in w if '一' <= ch <= '鿿')
    lat = re.sub(r'[^a-z]', ' ', w.lower()).split()
    for x in lat: x = x[:-1] if len(x) > 3 and x.endswith('e') else x; n += max(1, len(re.findall(r'[aeiouy]+', x)))
    return max(1, n)
def rap_flow(text, beat, beats, V, step=0.25, fx=True):
    """rap on the grid: each syllable gets a step (a 16th by default), each comma a rest, the rhyme at the end held one
    step longer and hit a little harder. The recording is cut at its word boundaries and every word stretched to its
    slots, so the words land on the beat instead of being spoken over it."""
    voice, pitch, rate = V; x, words = tts_words(text, voice, rate + 10, pitch)
    # the audio runs a little behind the reported times (about 0.1 s): measured at the first sound, then every cut moves by it
    a_ = np.abs(x); first = int(np.argmax(a_ > 0.05 * a_.max())) / SR; lag = min(0.2, max(0.0, first - words[0][0]))
    words = [[off + lag, dur, w] for off, dur, w in words]
    # walk the text alongside the words to find the rests
    plan = []; pos = 0
    for i, (off, dur, w) in enumerate(words):
        j = text.find(w, pos); gap = text[pos:j] if j >= 0 else ''; pos = j + len(w) if j >= 0 else pos
        if plan and any(c in PUNCT for c in gap): plan.append(('rest', 1))
        plan.append((i, syllables(w)))
    plan.append(('hold', 1))
    slots = sum(n for _, n in plan); room = beats / step
    st = step * beat * (min(1, room / slots))
    if slots > room: print(f'  !! "{text}" has {slots} slots, the bar holds {room:.0f}: squeezed')
    out = np.zeros(int((slots + 2) * st * SR) + SR); t = 0.0; last = max(i for i, _ in plan if isinstance(i, int))
    for k, (i, n) in enumerate(plan):
        if not isinstance(i, int): t += n * st; continue
        off, dur, w = words[i]; n_ = n + (1 if i == last else 0)
        a = int(max(0, off - 0.015) * SR); b = int(min(len(x) / SR, off + dur + 0.06) * SR); seg = x[a:b]
        # a word too long for its slots is squeezed; a short one keeps (nearly) its own length and lets the beat breathe,
        # so the voice keeps its natural speed instead of every syllable being dragged out to fill the grid
        want = n_ * st * (0.97 if i == last else 0.92); tempo = len(seg) / SR / max(0.02, want)
        tempo = min(2.2, tempo) if tempo > 1 else max(0.8 if i == last else 0.9, tempo)
        y = rubber(seg, tempo=tempo) if abs(tempo - 1) > 0.03 else seg
        y = fade(y[:int(want * SR)], 0.004, 0.03) * (1.15 if i == last else 1.0)
        put(out, y, t); t += n * st
    y = fade(norm(comp(trim(out[:int((t + st * 2) * SR)]), 1.4), 0.85))
    return roomy(double(y, cents=8, gain=0.2), wet=0.08) if fx else y
def rap_line(text, slot, V, fx=True, min_tempo=0.5):
    voice, pitch, rate = V; x = tts(text, voice, rate + 25, pitch)
    want = slot * 0.94; tempo = len(x) / SR / want
    if tempo > 1.9 or tempo < min_tempo + 0.05: print(f'  !! "{text}" wants tempo {tempo:.2f}')
    y = rubber(x, tempo=max(min_tempo, min(2.2, tempo)))
    y = fade(norm(comp(y), 0.85))
    return double(y) if fx else y
def talk_line(text, V, feel=0):
    voice, pitch, rate = V; return fade(norm(tts(text, voice, rate + feel, pitch), 0.8))
def sing_line(spec, beat, V, vib=0.012, style='tuned'):
    """spec: 'syl=note[,note...][@beats] ...' e.g. '寶=Eb4@1 貝=F4,G4@2'"""
    voice, pitch, rate = V; parts = []
    for tok in spec.split():
        m = re.match(r'^(.+?)=([^@]+)(?:@([\d.]+))?$', tok); syl, notes, beats = m[1], m[2].split(','), float(m[3] or 1)
        if syl == '-': parts.append(np.zeros(int(beats * beat * SR))); continue
        x = tts(syl, voice, rate - 10, pitch)
        out_len = int(beats * beat * SR); ms = [hz(midi(n)) for n in notes]
        if style == 'crack':  # the high note that breaks
            tgt = lambda u, ms=ms: ms[0] * (2 ** (np.sin(u * 40) * 0.25 + (1.2 if u > 0.55 else 0) * min(1, (u - 0.55) * 8) if u > 0.55 else 0))
        else:
            tgt = lambda u, ms=ms: ms[min(len(ms) - 1, int(u * len(ms)))] if len(ms) > 1 else ms[0]
        y = psola(x, tgt, out_len, vib=vib)
        parts.append(fade(y, 0.006, 0.03))
    # join with short crossfades (legato)
    xf = int(0.012 * SR); out = parts[0]
    for p in parts[1:]:
        if len(out) > xf and len(p) > xf: out = np.concatenate([out[:-xf], out[-xf:] * np.linspace(1, 0, xf) + p[:xf] * np.linspace(0, 1, xf), p[xf:]])
        else: out = np.concatenate([out, p])
    return roomy(double(norm(out, 0.8), cents=8, gain=0.3), wet=0.22)

def envelope(x):
    n = SR // 30; out = []
    for i in range(0, len(x), n): seg = x[i:i + n]; out.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    pk = max(out) if out and max(out) > 0 else 1; return [round(min(100, v / pk * 130)) for v in out]

def build(pid):
    S = SONGS[pid]; bpm = S['bpm']; beat = 60 / bpm; bar = 4 * beat; V = S['voice']; total = S['bars'] * bar
    print(f'== {pid}: {bpm} bpm, {S["bars"]} bars, {total:.1f} s')
    L, R = make_beat(S, total); encode(None, os.path.join(ROOT, 'audio', 'sfx', f'beat_{pid}.mp3'), stereo=(L, R))
    d = os.path.join(ROOT, 'audio', 'rap1'); os.makedirs(d, exist_ok=True); lines = []
    for i, ln in enumerate(S['lines']):
        kind, at, text = ln['kind'], ln['at'], ln['text']; start = at * beat  # 'at' is in beats from the top
        if kind == 'rap' and not ln.get('free'): x = rap_flow(ln.get('say', text), beat, ln['beats'], ln.get('voice', V), step=ln.get('step', S.get('step', 0.25)), fx=ln.get('fx', True))
        elif kind == 'rap': x = rap_line(ln.get('say', text), ln['beats'] * beat, ln.get('voice', V), fx=ln.get('fx', True), min_tempo=ln.get('minTempo', 0.5))
        elif kind == 'sing': x = sing_line(ln['notes'], beat, ln.get('voice', V), vib=ln.get('vib', 0.012), style=ln.get('style', 'tuned'))
        elif kind == 'talk': x = talk_line(ln.get('say', text), ln.get('voice', V), ln.get('feel', 0))
        elif kind == 'adlib': x = norm(double(talk_line(ln.get('say', text), ln.get('voice', V), 15)), 0.7)
        else: raise ValueError(kind)
        x = x * ln.get('gain', 1.0) * 0.6  # sits a little under the shouting judges
        name = f'p_{pid}_{i:02d}.mp3'; encode(x, os.path.join(d, name))
        dur = len(x) / SR
        lines.append({'at': round(start, 3), 'dur': round(dur, 3), 'file': f'rap1/{name}', 'env': envelope(x), 'text': text, 'en': ln.get('en', ''), 'who': ln.get('who', pid), 'kind': kind, 'phone': ln.get('phone', False)})
        print(f'  {start:6.2f}s {dur:5.2f}s {kind:5s} {text}')
    return {'bpm': bpm, 'beat': beat, 'bars': S['bars'], 'len': round(total + (1.6 if S.get('end_hit', True) else 0.05), 3), 'lines': lines, 'beatFile': f'beat_{pid}'}

if __name__ == '__main__':
    path = os.path.join(ROOT, 'audio', 'perf.json'); P = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    ids = sys.argv[1:] or list(SONGS)
    for pid in ids: P[pid] = build(pid)
    json.dump(P, open(path, 'w', encoding='utf-8'), ensure_ascii=False)
    js = 'export const PERF = ' + json.dumps({k: {**v, 'lines': [{kk: vv for kk, vv in l.items() if kk != 'env'} for l in v['lines']]} for k, v in P.items()}, ensure_ascii=False) + ';\n'
    open(os.path.join(ROOT, 'js', 'films', 'rap1.perf.js'), 'w', encoding='utf-8').write('// The performances as made by tools/perform.py: when each sung or rapped line starts (seconds into the song), its slot, its file.\n' + js)
    print('wrote', path)
