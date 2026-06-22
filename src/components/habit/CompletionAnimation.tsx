import confetti from 'canvas-confetti';

/** Fires a small confetti burst from a given screen position (the tapped checkbox). */
export function fireCompletionConfetti(origin: { x: number; y: number }) {
  confetti({
    particleCount: 30,
    spread: 60,
    startVelocity: 25,
    gravity: 1.2,
    scalar: 0.8,
    origin,
    colors: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'],
  });
}
