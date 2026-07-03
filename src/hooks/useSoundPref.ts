import { useCallback, useEffect, useState } from 'react';
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound';

/** Reactive wrapper for the localStorage-backed sound preference. */
export function useSoundPref(): { enabled: boolean; setEnabled: (v: boolean) => void } {
  const [enabled, setEnabledState] = useState<boolean>(() => isSoundEnabled());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'sound-enabled') setEnabledState(isSoundEnabled());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setSoundEnabled(v);
    setEnabledState(v);
  }, []);

  return { enabled, setEnabled };
}
