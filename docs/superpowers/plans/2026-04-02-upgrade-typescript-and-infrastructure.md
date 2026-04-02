# Upgrade TypeScript and Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade TypeScript and core infrastructure dependencies to their specified modern versions and update TS configuration.

**Architecture:** Surgical update of `package.json` and `tsconfig.json` followed by dependency re-installation and build verification.

**Tech Stack:** TypeScript, pnpm, Node.js

---

### Task 1: Update `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update dependencies and devDependencies**

Update the following versions in `package.json`:
- `dependencies`:
  - `@sha1n/about-time`: `^1.1.0`
  - `debug`: `^4.4.0`
- `devDependencies`:
  - `@types/chance`: `^1.1.6`
  - `@types/debug`: `^4.1.12`
  - `@types/node`: `^22.13.5`
  - `@types/uuid`: `^10.0.0`
  - `chance`: `^1.1.12`
  - `prettier`: `^3.5.2`
  - `ts-node`: `^10.9.2`
  - `typescript`: `^5.7.3`
  - `uuid`: `^11.1.0`

### Task 2: Update `tsconfig.json`

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Update compiler options**

Set the following in `tsconfig.json`:
- `moduleResolution`: `node10`
- `ignoreDeprecations`: `5.0`

### Task 3: Verify and Commit

- [ ] **Step 1: Install dependencies**

Run: `pnpm install`

- [ ] **Step 2: Build the project**

Run: `pnpm run build`
Expected: Successful build without errors.

- [ ] **Step 3: Run tests (optional but recommended)**

Run: `pnpm run test`
Expected: All tests pass.

- [ ] **Step 4: Commit changes**

Run: `git add package.json tsconfig.json pnpm-lock.yaml && git commit -m "chore: upgrade typescript and infrastructure"`
