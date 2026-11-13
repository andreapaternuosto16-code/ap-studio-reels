"""Original beat tracks for the round-2 reels (no samples, no third-party audio → royalty-free).
Usage: python3 make-beat-track.py <name> <bpm> <seconds> <style: bright|xmas|warm>
Writes <name>.m4a next to this script. Beat 1 starts at t = 0, so reel cuts placed on
beats line up with the kick.
"""
import sys, os, wave, subprocess, tempfile
import numpy as np

name, bpm, secs, style = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
SR = 44100
beat = 60 / bpm
n = int(SR * (secs + 2))
L = np.zeros(n); R = np.zeros(n)
rs = np.random.RandomState(5)

def add(sig, at, pan=0.5, g=1.0):
    i = int(at * SR)
    if i >= n: return
    s = sig[: n - i] * g
    L[i:i + len(s)] += s * (1 - pan); R[i:i + len(s)] += s * pan

def mtof(m): return 440 * 2 ** ((m - 69) / 12)

def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 70 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def snap():
    t = np.arange(int(0.18 * SR)) / SR
    x = rs.randn(len(t)); x = np.convolve(x, [1, -0.9], "same")
    return x * np.exp(-t * 32) * 0.35

def shaker():
    t = np.arange(int(0.07 * SR)) / SR
    x = np.diff(rs.randn(len(t) + 1))
    return x * np.exp(-t * 60) * 0.12 * np.minimum(1, t * 900)

def keys(m, dur, vel):
    t = np.arange(int(dur * SR)) / SR; f = mtof(m)
    env = np.exp(-t * 2.6) * (1 - np.exp(-t * 400))
    return (np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*2*f*t)*np.exp(-t*5) + 0.1*np.sin(2*np.pi*3*f*t)*np.exp(-t*7)) * env * vel

def bass(m, dur):
    t = np.arange(int(dur * SR)) / SR; f = mtof(m)
    env = np.minimum(1, t * 60) * np.exp(-t * 1.6)
    return (np.sin(2*np.pi*f*t) + 0.2*np.sin(2*np.pi*2*f*t)) * env * 0.32

def bell(m, vel):
    t = np.arange(int(2.0 * SR)) / SR; f = mtof(m)
    parts = [(1, 1), (2.76, .45), (5.4, .25), (8.93, .12)]
    return sum(a * np.sin(2*np.pi*f*k*t) * np.exp(-t*(2.5+k)) for k, a in parts) * vel

def jingle():
    t = np.arange(int(0.12 * SR)) / SR
    x = sum(np.sin(2*np.pi*f*t + rs.rand()*6) for f in (5200, 6700, 8100, 9900))
    return x * np.exp(-t * 40) * 0.035

prog = {
    "bright": [[60, 64, 67, 71], [57, 60, 64, 67], [65, 69, 72, 76], [67, 71, 74, 77]],   # Cmaj7 Am7 Fmaj7 G
    "xmas":   [[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 62, 67], [57, 61, 64, 69]],   # D Bm G A
    "warm":   [[65, 69, 72, 76], [62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 70]],   # Fmaj7 Dm7 Bbmaj7 C7
}[style]

nbeats = int(secs / beat) + 2
for k in range(nbeats):
    t0 = k * beat
    bar, pos = divmod(k, 4)
    ch = prog[bar % 4]
    if pos in (0, 2): add(kick(), t0, 0.5, 0.75)
    if pos in (1, 3): add(snap(), t0, 0.55, 0.9 if style != "warm" else 0.6)
    for h in (0, 0.5): add(shaker(), t0 + h * beat, 0.65)
    if style == "xmas":
        for h in (0, 0.5): add(jingle(), t0 + h * beat + 0.01, 0.35)
    if pos == 0: add(bass(ch[0] - 24, 4 * beat), t0)
    if pos == 2: add(bass(ch[0] - 24 + 7, 2 * beat), t0)
    # off-beat keys stabs + melody arpeggio
    add(keys(ch[1 + pos % 3] , 0.9, 0.09), t0 + beat * 0.5, 0.3 + 0.1 * pos)
    if pos == 0:
        for m in ch: add(keys(m, 2.0, 0.045), t0, 0.5)
    if style == "xmas" and pos in (0, 1, 2, 3):
        add(bell(ch[(pos * 2) % 4] + 12, 0.05), t0, 0.7 - 0.1 * pos)

for d, g in [(0.11, 0.25), (0.19, 0.18), (0.29, 0.12)]:
    s = int(d * SR); L[s:] += R[:-s] * g; R[s:] += L[:-s] * g * 0.9
mix = np.stack([L, R], 1)[: int(SR * secs)]
mix /= np.max(np.abs(mix)) / 0.6
f = int(SR * 1.2); mix[-f:] *= np.linspace(1, 0, f)[:, None]
here = os.path.dirname(os.path.abspath(__file__))
tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
with wave.open(tmp, "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
out = os.path.join(here, name + ".m4a")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-c:a", "aac", "-b:a", "192k", out], check=True)
os.unlink(tmp)
print(out, secs, "s @", bpm, "bpm")
