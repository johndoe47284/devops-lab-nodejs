/**
 * Integration tests for the dashboard (DEVOPS-15).
 * The clock is frozen so "overdue" does not depend on the day the tests run.
 */
import request from 'supertest'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import app from '../src/app.js'
import { resetStore } from '../src/data/store.js'

beforeEach(() => {
  resetStore()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-20T12:00:00Z'))
})

afterEach(() => vi.useRealTimers())

describe('GET /api/dashboard', () => {
  it('returns global stats and one line per project', async () => {
    const res = await request(app).get('/api/dashboard')
    expect(res.status).toBe(200)
    expect(res.body.projects).toBe(2)
    expect(res.body.comments).toBe(1)
    expect(res.body.tasks).toEqual({
      total: 4,
      byStatus: { todo: 2, in_progress: 1, done: 1 },
      overdue: 1, // "Implement login" was due on 2026-11-15
      completionRate: 25
    })
    expect(res.body.perProject).toHaveLength(2)
    expect(res.body.perProject[0]).toMatchObject({ id: 1, name: 'TaskFlow MVP', total: 3 })
    expect(res.body.generatedAt).toBe('2026-11-20T12:00:00.000Z')
  })

  it('reflects changes made through the other routes', async () => {
    await request(app).patch('/api/tasks/2').send({ status: 'done' })
    const res = await request(app).get('/api/dashboard')
    expect(res.body.tasks.byStatus.done).toBe(2)
    expect(res.body.tasks.overdue).toBe(0)
  })
})

describe('GET /api/dashboard?projectId=', () => {
  it('returns the stats of one project', async () => {
    const res = await request(app).get('/api/dashboard?projectId=2')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ project: { id: 2, name: 'Marketing website' }, total: 1, completionRate: 0 })
  })

  it('returns 404 for an unknown project and 400 for an invalid id', async () => {
    expect((await request(app).get('/api/dashboard?projectId=999')).status).toBe(404)
    expect((await request(app).get('/api/dashboard?projectId=abc')).status).toBe(400)
  })
})
