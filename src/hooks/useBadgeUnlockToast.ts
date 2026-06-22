import { useEffect, useRef } from 'react';
import { useBadgeCatalog, useEarnedBadges } from '@/hooks/useBadges';
import { useToast } from '@/hooks/useToast';

/**
 * Diffs the earned-badges set against what was seen last render to detect a
 * *newly* earned badge — a realtime payload alone can't tell "just earned"
 * from "already had it before this session loaded."
 */
export function useBadgeUnlockToast() {
  const { data: catalog } = useBadgeCatalog();
  const { data: earned } = useEarnedBadges();
  const { showToast } = useToast();
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!earned || !catalog) return;
    const currentIds = new Set(earned.map((e) => e.badge_id));

    if (seenIds.current === null) {
      // First load: badges already earned before this session shouldn't toast.
      seenIds.current = currentIds;
      return;
    }

    for (const id of currentIds) {
      if (!seenIds.current.has(id)) {
        const badge = catalog.find((b) => b.id === id);
        showToast(`Badge unlocked: ${badge?.name ?? 'New badge'}!`, 'success');
      }
    }
    seenIds.current = currentIds;
  }, [earned, catalog, showToast]);
}
