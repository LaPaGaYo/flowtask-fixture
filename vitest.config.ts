import { defineConfig } from 'vitest/config'

// Deterministic by construction: no retries, no fake timers needed (the app injects its Clock),
// forks so integration tests can spawn child processes without sharing module state.
export default defineConfig({
  test: {
    pool: 'forks',
    reporters: ['./tests/helpers/deterministic-reporter.ts'],
    maxWorkers: 4,
    retry: 0,
    testTimeout: 20_000,
    hookTimeout: 30_000,
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**']
  }
})
