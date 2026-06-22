import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['vite.config.ts', 'tailwind.config.ts', 'postcss.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['src/sw.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    ignores: ['dist', 'dev-dist', 'node_modules', 'vite.config.js', 'vite.config.d.ts', '*.tsbuildinfo'],
  },
];
