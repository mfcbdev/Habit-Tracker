const STORAGE_KEY = 'sound-enabled';

let audioCtx: AudioContext | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored !== 'false'; // default on
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

/** Plays a soft two-note ascending chime. Cheap, generated on the fly, no asset. */
export function playCompletionSound() {
  if (!isSoundEnabled()) return;
  const ctx = ensureContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.25, now);
  master.connect(ctx.destination);

  // Two-note ascending: E5 → G#5 (major third). Warm sine wave with a
  // short percussive envelope so it doesn't bleed into the next tap.
  const notes: { freq: number; start: number; length: number }[] = [
    { freq: 659.25, start: 0, length: 0.14 },
    { freq: 830.61, start: 0.08, length: 0.22 },
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(1, now + note.start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.length);
    osc.connect(gain).connect(master);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.length + 0.01);
  }
}

let lastTapAt = 0;

/**
 * Ultra-short percussive tap for button/tab presses. Extremely quiet
 * (peak 0.06 amplitude) and rate-limited to 40ms so rapid taps don't
 * turn into a buzz. No-op when sound is disabled.
 */
export function playTapSound() {
  if (!isSoundEnabled()) return;
  const now = performance.now();
  if (now - lastTapAt < 40) return;
  lastTapAt = now;

  const ctx = ensureContext();
  if (!ctx) return;

  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  // A single crisp click centered around A5. Triangle wave has a bit more
  // percussive bite than sine while staying warm.
  osc.frequency.setValueAtTime(880, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.06, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.06);
}
