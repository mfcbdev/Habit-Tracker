import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HabitCompletionRate, WeeklyHpSummary } from '@/types';

export function WeeklyHpChart({ data }: { data: WeeklyHpSummary[] }) {
  const chartData = data.map((d) => ({ week: d.week_start.slice(5), hp: d.hp_total }));

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={28} />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', fontSize: 12 }} />
          <Line type="monotone" dataKey="hp" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeakestHabitsChart({ data }: { data: HabitCompletionRate[] }) {
  const weakest = [...data].sort((a, b) => a.rough_weekly_rate - b.rough_weekly_rate).slice(0, 5);

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weakest} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', fontSize: 12 }} />
          <Bar dataKey="completions_7d" fill="#ef4444" radius={4} name="Completions (7d)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
