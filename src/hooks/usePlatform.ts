import { useEffect, useState } from 'react';

interface PlatformInfo {
  isIOS: boolean;
  isStandalone: boolean;
  /** True iff the user is on iOS in a browser tab (push won't work until they install). */
  needsIOSInstall: boolean;
}

function detect(): PlatformInfo {
  if (typeof window === 'undefined') return { isIOS: false, isStandalone: false, needsIOSInstall: false };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { isIOS, isStandalone, needsIOSInstall: isIOS && !isStandalone };
}

export function usePlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>(() => detect());
  useEffect(() => {
    setInfo(detect());
  }, []);
  return info;
}
