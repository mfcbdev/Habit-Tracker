import { Drawer } from 'vaul';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function BottomSheet({ open, onOpenChange, children, title, className }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-surface',
            'shadow-floating outline-none',
            className,
          )}
        >
          {/* Only the handle is draggable — the scrollable body is opted out
              via data-vaul-no-drag so native inputs (<input type="time">, etc)
              on iOS don't get their pointer events interpreted as sheet drags. */}
          <div className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-border-strong" />
          {title && (
            <Drawer.Title className="px-5 pt-1 pb-2 text-center text-sm font-medium text-secondary">
              {title}
            </Drawer.Title>
          )}
          <div
            data-vaul-no-drag
            className="overflow-y-auto overscroll-contain px-5 pb-8 pt-2"
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
