import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import noFloatingPromisePlugin from 'eslint-plugin-no-floating-promise';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '**/generated', 'coverage', 'jest-html-reporters-attach']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      prettier: prettierPlugin,
      jest: jestPlugin,
      'no-floating-promise': noFloatingPromisePlugin
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-floating-promise/no-floating-promise': 'error',
      'no-return-await': 'error',
      'prettier/prettier': [
        'warn',
        {
          printWidth: 120,
          tabWidth: 2,
          tabs: false,
          semi: true,
          singleQuote: true,
          quoteProps: 'as-needed',
          trailingComma: 'none',
          bracketSpacing: true,
          arrowParens: 'avoid'
        }
      ]
    }
  },
  {
    files: ['test/**/*.spec.ts', 'test/**/*.ts'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  },
  eslintConfigPrettier
);
