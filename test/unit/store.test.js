/**
 * Unit tests for the in-memory store helpers.
 */
import { describe, it, expect } from 'vitest'
import { store, resetStore, nextId, parseId, isNonEmptyString } from '../../src/data/store.js'

describe('nextId', () => {
  it('returns 1 for an empty collection', () => {
    expect(nextId([])).toBe(1)
  })

  it('returns the highest id + 1 even with gaps', () => {
    expect(nextId([{ id: 1 }, { id: 7 }, { id: 3 }])).toBe(8)
  })
})

describe('parseId', () => {
  it('accepts positive integers given as strings', () => {
    expect(parseId('12')).toBe(12)
  })

  it.each(['0', '-1', '1.5', 'abc', ''])('rejects %s', value => {
    expect(parseId(value)).toBeNull()
  })
})

describe('isNonEmptyString', () => {
  it('accepts a non-empty string', () => {
    expect(isNonEmptyString('a')).toBe(true)
  })

  it.each([' ', '', 3, null, undefined])('rejects %s', value => {
    expect(isNonEmptyString(value)).toBe(false)
  })
})

describe('resetStore', () => {
  it('restores the seed data after changes', () => {
    store.projects.length = 0
    resetStore()
    expect(store.projects.length).toBeGreaterThan(0)
    expect(store.tasks.length).toBeGreaterThan(0)
  })
})
