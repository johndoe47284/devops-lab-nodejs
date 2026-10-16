/**
 * Unit tests for src/utils/status.js.
 * Covers all branches, including boundaries and invalid inputs.
 */
import { describe, it, expect } from 'vitest'
import { formatStatus } from '../../src/utils/status.js'

describe('formatStatus', () => {
  it('throws on negative', () => {
    expect(() => formatStatus(-1)).toThrow('invalid uptime')
  })
  it.each([NaN, '10', null, undefined])('throws on invalid input %s', (v) => {
    expect(() => formatStatus(v)).toThrow('invalid uptime')
  })
  it('warming-up under 60s', () => {
    expect(formatStatus(0)).toBe('warming-up')
    expect(formatStatus(10)).toBe('warming-up')
    expect(formatStatus(59.9)).toBe('warming-up')
  })
  it('healthy from 60s to under 1h', () => {
    expect(formatStatus(60)).toBe('healthy')
    expect(formatStatus(3599)).toBe('healthy')
  })
  it('steady at or after 1h', () => {
    expect(formatStatus(3600)).toBe('steady')
    expect(formatStatus(86400)).toBe('steady')
  })
})
