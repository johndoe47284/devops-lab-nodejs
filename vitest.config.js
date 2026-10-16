/**
 * Vitest configuration.
 * NOTE: Vitest does NOT read a "vitest" key in package.json, so the coverage
 * thresholds must live here to be enforced (CI fails if they are not met).
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
})
