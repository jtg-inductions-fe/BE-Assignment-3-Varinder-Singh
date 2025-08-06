import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  {
    ignores: ['/dist'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-shadow': 'error',
      'no-console': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',

      '@typescript-eslint/no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^@nestjs'],
            ['^\\w'],
            ['^@(?:|modules|constants)'],
            ['^\\.'],
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.e2e-spec.ts', '**/*.spec.ts', '**/*.test.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
);
