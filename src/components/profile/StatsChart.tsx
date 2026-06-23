import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTokenColors } from '@/hooks/useTokenColors';
import type { HabitCompletionRate, WeeklyHpSummary } from '@/types';

export function WeeklyHpChart({ data }: { data: WeeklyHpSummary[] }) {
  const colors = useTokenColors();
  const chartData = data.map((d) => ({ week: d.week_start.slice(5), hp: d.hp_total }));

  return (
    <div className="h-40 rounded-card bg-surface p-3 shadow-card">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: colors.muted }} stroke={colors.border} />
          <YAxis tick={{ fontSize: 10, fill: colors.muted }} width={28} stroke={colors.border} />
          <Tooltip
            contentStyle={{
              background: colors.surfaceRaised,
              border: 'none',
              fontSize: 12,
              borderRadius: 12,
              color: colors.primary,
            }}
            labelStyle={{ color: colors.secondary }}
          />
          <Line type="monotone" dataKey="hp" stroke={colors.accent} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeakestHabitsChart({ data }: { data: HabitCompletionRate[] }) {
  const colors = useTokenColors();
  const weakest = [...data].sort((a, b) => a.rough_weekly_rate - b.rough_weekly_rate).slice(0, 5);

  return (
    <div className="h-48 rounded-card bg-surface p-3 shadow-card">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weakest} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 10, fill: colors.muted }}
            stroke={colors.border}
          />
          <Tooltip
            contentStyle={{
              background: colors.surfaceRaised,
              border: 'none',
              fontSize: 12,
              borderRadius: 12,
              color: colors.primary,
            }}
            labelStyle={{ color: colors.secondary }}
          />
          <Bar dataKey="completions_7d" fill={colors.accent} radius={6} name="Completions (7d)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
