import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  trigger: ReactNode;
  items: ActionMenuItem[];
  align?: 'left' | 'right';
}

export function ActionMenu({ trigger, items, align = 'right' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full"
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            role="menu"
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-DEFAULT bg-surface shadow-floating',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            <ul className="py-1.5">
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={() => {
                        item.onSelect();
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors',
                        'hover:bg-surface-raised disabled:opacity-50',
                        item.destructive ? 'text-danger' : 'text-primary',
                      )}
                    >
                      <span>{item.label}</span>
                      {Icon && <Icon className="h-4 w-4 opacity-70" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
