import type { Config } from 'tailwindcss';

const tokenRgb = (token: string) => `rgb(var(--color-${token}) / <alpha-value>)`;
const tokenRgbAlpha = (token: string) => `rgb(var(--color-${token}))`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: tokenRgb('bg'),
        surface: {
          DEFAULT: tokenRgb('surface'),
          raised: tokenRgb('surface-raised'),
          glass: tokenRgbAlpha('surface-glass'),
        },
        primary: tokenRgb('text-primary'),
        secondary: tokenRgb('text-secondary'),
        muted: tokenRgb('text-muted'),
        inverse: tokenRgb('text-inverse'),
        accent: {
          DEFAULT: tokenRgb('accent'),
          soft: tokenRgb('accent-soft'),
          contrast: tokenRgb('accent-contrast'),
        },
        success: tokenRgb('success'),
        warning: tokenRgb('warning'),
        danger: tokenRgb('danger'),
        border: {
          DEFAULT: tokenRgbAlpha('border'),
          strong: tokenRgbAlpha('border-strong'),
        },
      },
      textColor: {
        primary: tokenRgb('text-primary'),
        secondary: tokenRgb('text-secondary'),
        muted: tokenRgb('text-muted'),
        inverse: tokenRgb('text-inverse'),
        accent: tokenRgb('accent'),
      },
      borderColor: {
        DEFAULT: tokenRgbAlpha('border'),
        strong: tokenRgbAlpha('border-strong'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
        input: 'var(--radius-input)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        floating: 'var(--shadow-floating)',
        glass: 'var(--shadow-glass)',
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        ios: '280ms',
      },
      animation: {
        'pulse-once': 'pulse-once 400ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 280ms cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'pulse-once': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
