export interface Wisdom {
  quote: string;
  author: string;
  book: string;
}

/** Deterministic rotation so the same day shows the same quote to everyone. */
export const WISDOM: Wisdom[] = [
  { quote: 'The key to winning back your time is a shutdown ritual — a firm end to the work day.', author: 'Cal Newport', book: 'Deep Work' },
  { quote: 'Efforts to deepen your focus will struggle if you don’t simultaneously wean your mind from a dependence on distraction.', author: 'Cal Newport', book: 'Deep Work' },
  { quote: 'Human beings are at their best when immersed deeply in something challenging.', author: 'Cal Newport', book: 'Deep Work' },
  { quote: 'Clarity about what matters provides clarity about what does not.', author: 'Cal Newport', book: 'Deep Work' },
  { quote: 'To produce at your peak level you need to work for extended periods with full concentration on a single task.', author: 'Cal Newport', book: 'Deep Work' },
  { quote: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear', book: 'Atomic Habits' },
  { quote: 'Every action you take is a vote for the type of person you wish to become.', author: 'James Clear', book: 'Atomic Habits' },
  { quote: 'Habits are the compound interest of self-improvement.', author: 'James Clear', book: 'Atomic Habits' },
  { quote: 'When you start a habit it should take less than two minutes to do.', author: 'James Clear', book: 'Atomic Habits' },
  { quote: 'You should be far more concerned with your current trajectory than with your current results.', author: 'James Clear', book: 'Atomic Habits' },
  { quote: 'Environment is the invisible hand that shapes human behavior.', author: 'James Clear', book: 'Atomic Habits' },
  { quote: 'The most effective form of motivation is progress.', author: 'James Clear', book: 'Atomic Habits' },
  { quote: 'The only way to grow is to look at yourself in the mirror and tell the truth.', author: 'David Goggins', book: 'Can’t Hurt Me' },
  { quote: 'When you think you’re done, you’re only at 40% of what your body is capable of.', author: 'David Goggins', book: 'Can’t Hurt Me' },
  { quote: 'A callused mind is one that will not falter under pressure.', author: 'David Goggins', book: 'Can’t Hurt Me' },
  { quote: 'Discipline equals freedom.', author: 'David Goggins', book: 'Can’t Hurt Me' },
  { quote: 'Suffering is a test. That’s all it is. Suffering is the true test of life.', author: 'David Goggins', book: 'Can’t Hurt Me' },
  { quote: 'Don’t stop when you’re tired. Stop when you’re done.', author: 'David Goggins', book: 'Can’t Hurt Me' },
];

/** Same date → same quote across the world. Not user-specific. */
export function wisdomForDate(iso: string): Wisdom {
  // yyyy-MM-dd → integer hash → bucket
  let sum = 0;
  for (const ch of iso.replace(/-/g, '')) sum = sum * 31 + Number(ch);
  return WISDOM[Math.abs(sum) % WISDOM.length];
}
