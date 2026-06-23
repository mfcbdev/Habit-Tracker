import { BottomSheet } from '@/components/ui/BottomSheet';
import { HabitForm } from '@/components/habit/HabitForm';
import { HabitDetailSheet } from '@/components/habit/HabitDetailSheet';
import { useHabitSheets } from '@/hooks/useHabitSheets';

export function GlobalHabitSheets() {
  const { mode, close } = useHabitSheets();

  const isForm = mode.kind === 'create' || mode.kind === 'edit';
  const isDetail = mode.kind === 'detail';
  const editingHabit = mode.kind === 'edit' ? mode.habit : undefined;
  const detailHabit = mode.kind === 'detail' ? mode.habit : null;

  return (
    <>
      <BottomSheet
        open={isForm}
        onOpenChange={(o) => !o && close()}
        title={editingHabit ? 'Edit habit' : 'New habit'}
      >
        <HabitForm habit={editingHabit} onDone={close} />
      </BottomSheet>

      <HabitDetailSheet habit={detailHabit} open={isDetail} onClose={close} />
    </>
  );
}
