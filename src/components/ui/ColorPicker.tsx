import { HABIT_COLORS } from '@/lib/icons';
import { cn } from '@/lib/utils';

export function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {HABIT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
          className={cn(
            'h-8 w-8 rounded-full border-2 transition-transform',
            value === color ? 'scale-110 border-white' : 'border-transparent',
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
