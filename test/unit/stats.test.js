/**
 * Unit tests for computeTaskStats (DEVOPS-15).
 */
import { describe, it, expect } from 'vitest'
import { computeTaskStats } from '../../src/utils/stats.js'

const now = new Date('2026-11-10T12:00:00Z')

describe('computeTaskStats', () => {
  it('returns zeros for an empty list', () => {
    expect(computeTaskStats([], now)).toEqual({
      total: 0,
      byStatus: { todo: 0, in_progress: 0, done: 0 },
      overdue: 0,
      completionRate: 0
    })
  })

  it('counts tasks per status and computes the completion rate', () => {
    const tasks = [
      { status: 'done', dueDate: null },
      { status: 'done', dueDate: null },
      { status: 'todo', dueDate: null },
      { status: 'in_progress', dueDate: null }
    ]
    const stats = computeTaskStats(tasks, now)
    expect(stats.total).toBe(4)
    expect(stats.byStatus).toEqual({ todo: 1, in_progress: 1, done: 2 })
    expect(stats.completionRate).toBe(50)
  })

  it('counts as overdue only unfinished tasks with a past due date', () => {
    const tasks = [
      { status: 'todo', dueDate: '2026-11-01' }, // overdue
      { status: 'in_progress', dueDate: '2026-11-09' }, // overdue
      { status: 'done', dueDate: '2026-10-01' }, // done: not overdue
      { status: 'todo', dueDate: '2026-12-01' }, // future
      { status: 'todo', dueDate: null } // no due date
    ]
    expect(computeTaskStats(tasks, now).overdue).toBe(2)
  })

  it('rounds the completion rate', () => {
    const tasks = [{ status: 'done' }, { status: 'todo' }, { status: 'todo' }]
    expect(computeTaskStats(tasks, now).completionRate).toBe(33)
  })

  it('uses the current date by default', () => {
    expect(computeTaskStats([{ status: 'todo', dueDate: '2000-01-01' }]).overdue).toBe(1)
  })
})
