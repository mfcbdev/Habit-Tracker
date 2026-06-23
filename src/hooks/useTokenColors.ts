import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface TokenColors {
  primary: string;
  secondary: string;
  muted: string;
  surface: string;
  surfaceRaised: string;
  accent: string;
  border: string;
}

function rgbVar(name: string): string {
  if (typeof window === 'undefined') return '#000';
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value ? `rgb(${value.replace(/\s*\/\s*[\d.]+\s*$/, '')})` : '#000';
}

/** Resolves the current theme's CSS variable values into hex/rgb strings.
 *  Re-resolves whenever the resolved theme changes so charts re-tint. */
export function useTokenColors(): TokenColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<TokenColors>(() => readAll());

  useEffect(() => {
    setColors(readAll());
  }, [resolvedTheme]);

  return colors;
}

function readAll(): TokenColors {
  return {
    primary: rgbVar('--color-text-primary'),
    secondary: rgbVar('--color-text-secondary'),
    muted: rgbVar('--color-text-muted'),
    surface: rgbVar('--color-surface'),
    surfaceRaised: rgbVar('--color-surface-raised'),
    accent: rgbVar('--color-accent'),
    border: rgbVar('--color-border'),
  };
}
