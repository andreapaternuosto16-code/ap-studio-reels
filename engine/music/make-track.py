"""Generates calm-keys-01.wav: an original, gentle keys + pad loop (78 bpm, ~24 s).
No samples or third-party audio are used, so the track is ours and royalty-free.
Run: python3 engine/music/make-track.py
"""
import wave, struct, os
import numpy as np

SR = 44100
BPM = 78
beat = 60 / BPM
bars = 8
dur = bars * 4 * beat + 3
t_all = np.arange(int(SR * dur)) / SR
out = np.zeros((len(t_all), 2))

def note(f):  # midi -> Hz
    return 440 * 2 ** ((f - 69) / 12)

# Fmaj9 – Am7 – Dm9 – Bbmaj7 (soft, warm), two bars each pass
chords = [[53, 60, 64, 67, 69], [57, 60, 64, 67, 72], [50, 57, 60, 64, 69], [46, 53, 57, 62, 65]]

def keys(start, f, length, vel):
    n = int(length * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 2.2) * (1 - np.exp(-t * 300))
    tone = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4)
            + 0.08 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 6))
    i = int(start * SR)
    seg = (tone * env * vel)[: len(out) - i]
    pan = 0.5 + 0.25 * np.sin(f)
    out[i:i + len(seg), 0] += seg * (1 - pan)
    out[i:i + len(seg), 1] += seg * pan

def pad(start, notes, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 1.2) * np.minimum(1, (length - t) / 1.2)
    sig = sum(np.sin(2 * np.pi * note(m) * t * (1 + d)) for m in notes for d in (-0.002, 0.002))
    i = int(start * SR)
    seg = (sig * env * 0.018)[: len(out) - i]
    out[i:i + len(seg)] += seg[:, None]

pattern = [0, 2, 1, 3, 4, 2, 3, 1]  # arpeggio order over 8 eighth-notes
for bar in range(bars):
    ch = chords[(bar // 2) % 4]
    t0 = bar * 4 * beat
    pad(t0, [m + 12 for m in ch[1:4]], 4 * beat + 1.2)
    keys(t0, note(ch[0] - 12), 3.5, 0.10)
    for k, p in enumerate(pattern):
        keys(t0 + k * beat / 2, note(ch[p] + 12), 2.0, 0.055 if k % 2 else 0.07)

# simple room: a few decaying echoes
for d, g in [(0.149, 0.30), (0.237, 0.22), (0.331, 0.15), (0.443, 0.10)]:
    s = int(d * SR)
    out[s:] += out[:-s] * g * np.array([0.8, 1.0])
out /= np.max(np.abs(out)) / 0.5   # leave headroom; reels keep music quiet
fade = int(SR * 2.5)
out[-fade:] *= np.linspace(1, 0, fade)[:, None]

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "calm-keys-01.wav")
with wave.open(path, "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
print(path, round(dur, 1), "s")
