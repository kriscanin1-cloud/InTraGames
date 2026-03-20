let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playTone(freq, duration, gain = 0.15, type = 'sine', delay = 0) {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.connect(g);
    g.connect(c.destination);
    o.frequency.setValueAtTime(freq, c.currentTime + delay);
    o.frequency.exponentialRampToValueAtTime(freq * 0.7, c.currentTime + delay + duration);
    g.gain.setValueAtTime(gain, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + duration);
  } catch (e) {}
}

export const soundEngine = {
  playDrop() {
    playTone(500 + Math.random() * 150, 0.09, 0.12, 'triangle');
  },
  playCapture() {
    [0, 0.07, 0.14].forEach((delay, i) => {
      playTone(440 + i * 130, 0.18, 0.18, 'sine', delay);
    });
  },
  playTuz() {
    playTone(330, 0.1, 0.2, 'sine', 0);
    playTone(660, 0.25, 0.15, 'sine', 0.1);
    playTone(990, 0.3, 0.1, 'sine', 0.2);
  },
  playWin() {
    [440, 550, 660, 880].forEach((freq, i) => {
      playTone(freq, 0.4, 0.2, 'sine', i * 0.1);
    });
  },
};