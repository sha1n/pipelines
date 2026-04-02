# Upgrade `about-time` Jest to v29 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Jest to v29 and modernize the test configuration in the `about-time` project, aligning it with the patterns used in `pipelines` (and `dagraph`).

**Architecture:** Update `package.json` with specific dependency versions and modernize `jest.config.ts` to use the `ts-jest` transformer object syntax and ensure compatibility with Jest 29 standards.

**Tech Stack:** Jest 29, ts-jest 29, jest-extended 6.

---

### Task 1: Update Dependencies

**Files:**
- Modify: `../about-time/package.json`

- [ ] **Step 1: Update devDependencies to target versions**

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

- [ ] **Step 2: Run pnpm install in about-time**

Run: `cd ../about-time && pnpm install`
Expected: Installation completes successfully.

---

### Task 2: Modernize Jest Configuration

**Files:**
- Modify: `../about-time/jest.config.ts`

- [ ] **Step 1: Update jest.config.ts with modern transformer setup**

```typescript
import isCI from 'is-ci';

const reporters: any[] = ['default', ['jest-summary-reporter', { failuresOnly: true }]];

if (!isCI) {
  reporters.push(['jest-html-reporters', { failuresOnly: false }]);
}

export default {
  testMatch: ['**/test/**/*.spec.ts'],
  coveragePathIgnorePatterns: ['test/*', 'dist/*'],
  reporters,
  verbose: true,
  maxWorkers: isCI ? '2' : '100%',
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

- [ ] **Step 2: Verify tests pass**

Run: `cd ../about-time && pnpm jest`
Expected: All tests pass.

---

### Task 3: Commit Changes

- [ ] **Step 1: Commit changes in about-time**

Run: `cd ../about-time && git add package.json jest.config.ts pnpm-lock.yaml && git commit -m "chore: upgrade jest to v29"`
Expected: Commit successful.
