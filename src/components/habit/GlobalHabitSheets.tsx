import { BottomSheet } from '@/components/ui/BottomSheet';
import { HabitForm } from '@/components/habit/HabitForm';
import { HabitWizard } from '@/components/habit/HabitWizard';
import { HabitDetailSheet } from '@/components/habit/HabitDetailSheet';
import { useHabitSheets } from '@/hooks/useHabitSheets';

export function GlobalHabitSheets() {
  const { mode, close } = useHabitSheets();

  const isCreate = mode.kind === 'create';
  const isEdit = mode.kind === 'edit';
  const isDetail = mode.kind === 'detail';
  const editingHabit = isEdit ? mode.habit : undefined;
  const detailHabit = isDetail ? mode.habit : null;

  return (
    <>
      <BottomSheet open={isCreate} onOpenChange={(o) => !o && close()} title="New habit">
        {isCreate && <HabitWizard onDone={close} />}
      </BottomSheet>

      <BottomSheet open={isEdit} onOpenChange={(o) => !o && close()} title="Edit habit">
        {isEdit && editingHabit && <HabitForm habit={editingHabit} onDone={close} />}
      </BottomSheet>

      <HabitDetailSheet habit={detailHabit} open={isDetail} onClose={close} />
    </>
  );
}
