import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Habit } from '@/types';
import type { HabitFormValues } from '@/types/forms';

export function useHabits(includeArchived = false) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<Habit[]>({
    queryKey: ['habits', userId, includeArchived],
    queryFn: async () => {
      let query = supabase.from('habits').select('*').eq('user_id', userId!).order('time_start');
      if (!includeArchived) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

function toInsertPayload(values: HabitFormValues, userId: string) {
  return {
    user_id: userId,
    name: values.name.trim(),
    description: values.description.trim() || null,
    purpose: values.purpose.trim() || null,
    category: values.category.trim() || null,
    color: values.color,
    icon: values.icon,
    frequency: values.frequency,
    frequency_days: values.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : values.frequency_days,
    time_start: `${values.time_start}:00`,
    time_end: `${values.time_end}:00`,
    difficulty: values.difficulty,
    reminder_offset_minutes: values.reminder_offset_minutes,
  };
}

export function useCreateHabit() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: HabitFormValues) => {
      const userId = session!.user.id;
      const { data, error } = await supabase
        .from('habits')
        .insert(toInsertPayload(values, userId))
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useUpdateHabit() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: HabitFormValues }) => {
      const userId = session!.user.id;
      const { data, error } = await supabase
        .from('habits')
        .update(toInsertPayload(values, userId))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useArchiveHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from('habits').update({ is_active: isActive }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
