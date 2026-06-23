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
              'flex h-10 w-10 items-center justify-center rounded-input border transition',
              isSelected ? 'border-accent bg-accent/10 text-accent' : 'border-DEFAULT text-secondary',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
