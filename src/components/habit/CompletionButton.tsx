import { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fireCompletionConfetti } from './CompletionAnimation';

interface CompletionButtonProps {
  isCompleted: boolean;
  onToggle: () => void;
}

export function CompletionButton({ isCompleted, onToggle }: CompletionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  function handleClick() {
    if (!isCompleted && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      fireCompletionConfetti({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    }
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 400);
    onToggle();
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-pressed={isCompleted}
      aria-label={isCompleted ? 'Mark as not done' : 'Mark as done'}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        isCompleted ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400' : 'border-surface-border text-transparent',
        isPulsing && 'animate-pulse-once',
      )}
    >
      <Check size={18} />
    </button>
  );
}
