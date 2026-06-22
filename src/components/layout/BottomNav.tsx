import { NavLink } from 'react-router-dom';
import { CalendarCheck, ListChecks, Clock, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/', label: 'Today', icon: CalendarCheck },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/schedule', label: 'Schedule', icon: Clock },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-surface-border bg-surface-raised pb-safe-bottom">
      <ul className="flex items-stretch justify-around">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2 text-xs',
                  isActive ? 'text-indigo-400' : 'text-slate-400',
                )
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
