import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, ListChecks, Calendar, UserRound, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitSheets } from '@/hooks/useHabitSheets';
import { playTapSound } from '@/lib/sound';
import { useI18n } from '@/i18n/I18nProvider';

export function BottomNav() {
  const { openCreate } = useHabitSheets();
  const navigate = useNavigate();
  const { t } = useI18n();

  const leftTabs = [
    { to: '/', label: t('nav.today'), icon: Sun },
    { to: '/habits', label: t('nav.habits'), icon: ListChecks },
  ];

  const rightTabs = [
    { to: '/schedule', label: t('nav.schedule'), icon: Calendar },
    { to: '/profile', label: t('nav.profile'), icon: UserRound },
  ];

  function handleCreate() {
    playTapSound();
    // Bring the user to the habits tab so the form sheet has a sensible context.
    navigate('/habits');
    openCreate();
  }

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-safe-bottom"
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-4 mb-3 flex w-full max-w-md items-center gap-1 rounded-pill glass px-2 py-1.5 shadow-floating">
        {leftTabs.map((tab) => (
          <NavItem key={tab.to} {...tab} />
        ))}
        <motion.button
          type="button"
          onClick={handleCreate}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="mx-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-floating"
          aria-label={t('nav.createHabit')}
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </motion.button>
        {rightTabs.map((tab) => (
          <NavItem key={tab.to} {...tab} />
        ))}
      </div>
    </nav>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: typeof Sun;
}

function NavItem({ to, label, icon: Icon }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={() => playTapSound()}
      className={({ isActive }) =>
        cn(
          'group relative flex flex-1 flex-col items-center gap-0.5 rounded-pill py-1.5 text-[10px] font-medium transition-colors',
          isActive ? 'text-accent' : 'text-muted hover:text-secondary',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
