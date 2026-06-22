import type { Rank } from '@/types';

export interface RankProgressInfo {
  rank: Rank;
  percent: number;
  hpIntoRank: number;
  hpForNextRank: number | null;
}

export function getRankProgress(habitPoints: number, ranks: Rank[]): RankProgressInfo | null {
  const rank = [...ranks].reverse().find((r) => habitPoints >= r.min_hp);
  if (!rank) return null;

  if (rank.max_hp == null) {
    return { rank, percent: 100, hpIntoRank: habitPoints - rank.min_hp, hpForNextRank: null };
  }

  const span = rank.max_hp - rank.min_hp + 1;
  const hpIntoRank = habitPoints - rank.min_hp;
  const percent = Math.min(100, Math.round((hpIntoRank / span) * 100));
  return { rank, percent, hpIntoRank, hpForNextRank: rank.max_hp + 1 - habitPoints };
}
