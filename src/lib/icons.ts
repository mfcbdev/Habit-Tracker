import {
  Circle,
  Sparkles,
  Flame,
  Medal,
  Star,
  Award,
  Dumbbell,
  BookOpen,
  Droplet,
  Moon,
  Sun,
  Heart,
  Brain,
  Coffee,
  Pencil,
  Music,
  Bike,
  Salad,
  Wallet,
  Smile,
  type LucideIcon,
} from 'lucide-react';

// Maps the free-text `icon` column (habits.icon, badges.icon) to a component.
// Keep keys in sync with seeded badge icons: sparkles, flame, medal, star, award.
export const ICONS: Record<string, LucideIcon> = {
  circle: Circle,
  sparkles: Sparkles,
  flame: Flame,
  medal: Medal,
  star: Star,
  award: Award,
  dumbbell: Dumbbell,
  book: BookOpen,
  droplet: Droplet,
  moon: Moon,
  sun: Sun,
  heart: Heart,
  brain: Brain,
  coffee: Coffee,
  pencil: Pencil,
  music: Music,
  bike: Bike,
  salad: Salad,
  wallet: Wallet,
  smile: Smile,
};

export const ICON_NAMES = Object.keys(ICONS);

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Circle;
}

export const HABIT_COLORS = [
  '#6366f1', // indigo
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#a855f7', // purple
  '#84cc16', // lime
];
