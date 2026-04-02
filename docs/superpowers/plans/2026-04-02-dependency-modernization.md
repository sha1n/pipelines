# Dependency Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all dependencies to latest major versions, resolve 14 security vulnerabilities, and fix the TypeScript 5+ `moduleResolution` deprecation error.

**Architecture:** Block-by-block migration strategy: Infrastructure -> Jest -> ESLint. This isolates breaking changes and ensures each tool is correctly configured before moving to the next.

**Tech Stack:** TypeScript 5, Jest 29, ESLint 10 (Flat Config), pnpm.

---

### Task 1: TypeScript & Infrastructure Upgrade

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Update package.json with latest infrastructure versions**

```json
"dependencies": {
  "@sha1n/about-time": "^1.1.0",
  "debug": "^4.4.0"
},
"devDependencies": {
  "@types/chance": "^1.1.6",
  "@types/debug": "^4.1.12",
  "@types/node": "^22.13.5",
  "@types/uuid": "^10.0.0",
  "chance": "^1.1.12",
  "prettier": "^3.5.2",
  "ts-node": "^10.9.2",
  "typescript": "^5.7.3",
  "uuid": "^11.1.0"
}
```

- [ ] **Step 2: Update tsconfig.json to fix moduleResolution deprecation**

```json
{
  "compilerOptions": {
    "moduleResolution": "node10",
    "ignoreDeprecations": "5.0"
  }
}
```

- [ ] **Step 3: Run pnpm install and verify build**

Run: `pnpm install && pnpm run build`
Expected: PASS (dist folder created, no TS errors)

- [ ] **Step 4: Commit changes**

```bash
git add package.json tsconfig.json pnpm-lock.yaml
git commit -m "chore: upgrade typescript and infrastructure"
```

---

### Task 2: Jest v29 Upgrade

**Files:**
- Modify: `package.json`
- Modify: `jest.config.ts`

- [ ] **Step 1: Update package.json with Jest 29 versions**

```json
"devDependencies": {
  "@types/jest": "^29.5.14",
  "jest": "^29.7.0",
  "jest-environment-node": "^29.7.0",
  "jest-extended": "^6.0.0",
  "jest-html-reporters": "^3.1.7",
  "jest-mock-extended": "^4.0.0",
  "jest-summary-reporter": "^0.0.2",
  "ts-jest": "^29.2.6"
}
```

- [ ] **Step 2: Update jest.config.ts for Jest 29 and modern jest-extended**

```typescript
export default {
  testMatch: ['**/test/**/*.spec.ts'],
  roots: ['./test'],
  coveragePathIgnorePatterns: ['test/*', 'dist/*', 'examples/*'],
  reporters: ['default', ['jest-summary-reporter', { failuresOnly: true }], ['jest-html-reporters', {}]],
  verbose: true,
  maxWorkers: '100%',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  testEnvironment: 'node',
  preset: 'ts-jest',
  slowTestThreshold: 1.5 * 1000,
  testTimeout: 10 * 1000,
  setupFilesAfterEnv: ['jest-extended/all']
};
```

- [ ] **Step 3: Run tests to verify compatibility**

Run: `pnpm jest`
Expected: All tests pass.

- [ ] **Step 4: Commit changes**

```bash
git add package.json jest.config.ts pnpm-lock.yaml
git commit -m "chore: upgrade jest to v29"
```

---

### Task 3: ESLint v10 Migration (Flat Config)

**Files:**
- Modify: `package.json`
- Create: `eslint.config.mjs`
- Delete: `.eslintrc.js`

- [ ] **Step 1: Update package.json with ESLint 10 versions**

```json
"devDependencies": {
  "@eslint/js": "^9.21.0",
  "eslint": "^9.21.0",
  "eslint-config-prettier": "^10.0.2",
  "eslint-plugin-import": "^2.31.0",
  "eslint-plugin-jest": "^28.11.0",
  "eslint-plugin-no-floating-promise": "^2.0.0",
  "eslint-plugin-prettier": "^5.2.3",
  "eslint-plugin-unused-imports": "^4.1.4",
  "globals": "^16.0.0",
  "typescript-eslint": "^8.24.1"
}
```

- [ ] **Step 2: Create eslint.config.mjs (Flat Config)**

```javascript
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
      '@typescript-eslint/semi': 'warn',
      '@typescript-eslint/quotes': ['error', 'single'],
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
```

- [ ] **Step 3: Delete old .eslintrc.js and run lint**

Run: `rm .eslintrc.js && pnpm lint`
Expected: Linting passes (or fixes found/applied).

- [ ] **Step 4: Commit changes**

```bash
git add package.json eslint.config.mjs pnpm-lock.yaml
git rm .eslintrc.js
git commit -m "chore: migrate to eslint v10 flat config"
```

---

### Task 4: Final Verification & Security Audit

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: Build, Jest, and Lint all pass.

- [ ] **Step 2: Run security audit**

Run: `pnpm audit`
Expected: 0 vulnerabilities found.

- [ ] **Step 3: Verify CI workflow scripts**

Run: `pnpm run build && pnpm run test`
Expected: All scripts work with the new dependency structure.

- [ ] **Step 4: Final commit (if any minor fixes needed)**

```bash
git commit -m "chore: final verification and security fix confirmation"
```
