// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import tsdoc from 'eslint-plugin-tsdoc';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  // Ignore patterns (flat config: no other properties in this object)
  {
    ignores: [
      '**/build',
      '**/node_modules',
      'documentation',
      '**/.eslintrc.js',
      '**/.eslintrc.cjs',
      '**/eslint.config.*',
    ],
  },

  // Base ESLint recommended
  eslint.configs.recommended,

  // TypeScript ESLint: recommended only for .ts (so .js files don't get TS rules)
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),

  // Prettier: disable rules that conflict (must be last of shared configs)
  eslintConfigPrettier,

  // TypeScript files: type-checked config + language options + plugins + rules
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier,
      import: importPlugin,
      jest,
      tsdoc,
    },
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      'prettier/prettier': 'error',
      'arrow-body-style': ['warn', 'always'],
      'tsdoc/syntax': 'warn',
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'error',
      'no-underscore-dangle': 'off',
    },
  },

  // Spec files: relax some rules
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },

  // JS files (examples only) – Node globals, relax some rules
  {
    files: ['examples/**/examples/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier,
      import: importPlugin,
      jest,
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': 'error',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
