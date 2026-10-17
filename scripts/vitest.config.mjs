import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.mjs'],
    reporters: ['./tests/helpers/deterministic-reporter.ts'],
    pool: 'forks', maxWorkers: 2, retry: 0,
  },
})
