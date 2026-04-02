# Design Doc: Dependency Modernization and Security Fixes

This document outlines the plan to upgrade all dependencies in the `pipelines` repository to their latest major versions, resolving 14 security vulnerabilities and fixing the CI failure in the `Update Dependencies` job.

## Goals

1.  **Resolve Security Vulnerabilities:** Fix all high, moderate, and low-risk vulnerabilities reported by `pnpm audit`.
2.  **Fix CI Failure:** Resolve the `moduleResolution: node` deprecation error in TypeScript 5+ that causes the `Update Dependencies` job to fail.
3.  **Modernize Tooling:** Upgrade Jest (v27 -> v29+) and ESLint (v8 -> v9+) to latest standards, using `dagraph` as a reference.

## Approach

An incremental, block-by-block upgrade strategy will be used to ensure stability and ease of debugging.

### Block 1: TypeScript & Infrastructure
- **Action:** Upgrade `typescript`, `ts-node`, `prettier`, `uuid`, `@types/node`, `@types/uuid`, `chance`, `@types/chance`, `@sha1n/about-time`, `debug`, `@types/debug`.
- **TypeScript Config:** Update `tsconfig.json` to use `"moduleResolution": "node10"` (or equivalent compatible setting) to fix the deprecation warning.
- **Verification:** Run `pnpm install` and `pnpm run build`.

### Block 2: Jest v29 Upgrade
- **Action:** Upgrade `jest`, `ts-jest`, `@types/jest`, `jest-extended`, `jest-mock-extended`, `jest-html-reporters`, `jest-summary-reporter`, `jest-environment-node`.
- **Jest Config:** Update `jest.config.ts` to align with Jest 29 standards and `ts-jest` requirements.
- **Verification:** Run `pnpm jest`.

### Block 3: ESLint v9+ (Flat Config)
- **Action:** Upgrade `eslint` and all plugins (`@typescript-eslint/*`, `eslint-plugin-jest`, `eslint-plugin-prettier`, etc.).
- **Migration:** Convert `.eslintrc.js` to `eslint.config.mjs` using the modern "Flat Config" system.
- **Verification:** Run `pnpm lint`.

### Final Verification
- **Full Suite:** Run `pnpm test` (which executes both Jest and ESLint).
- **Security Audit:** Run `pnpm audit` to confirm all vulnerabilities are resolved.

## Reference Project
The `../dagraph` repository will be used as a reference for modern ESLint and Jest configurations.
