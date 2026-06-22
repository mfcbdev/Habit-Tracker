import { ICON_NAMES, getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

export function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {ICON_NAMES.map((name) => {
        const Icon = getIcon(name);
        const isSelected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={`Select icon ${name}`}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border',
              isSelected ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-surface-border text-slate-400',
            )}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
