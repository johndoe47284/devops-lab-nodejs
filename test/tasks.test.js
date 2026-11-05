/**
 * Integration tests for the single task API (DEVOPS-13).
 */
import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStore, store } from '../src/data/store.js'

beforeEach(() => resetStore())

describe('GET /api/tasks/:id', () => {
  it('returns one task', async () => {
    const res = await request(app).get('/api/tasks/1')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, projectId: 1 })
  })

  it('returns 404 for an unknown task and 400 for an invalid id', async () => {
    expect((await request(app).get('/api/tasks/999')).status).toBe(404)
    expect((await request(app).get('/api/tasks/0')).status).toBe(400)
  })
})

describe('PATCH /api/tasks/:id', () => {
  it('moves a task to another Kanban column', async () => {
    const res = await request(app).patch('/api/tasks/3').send({ status: 'in_progress' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('in_progress')
    expect((await request(app).get('/api/tasks/3')).body.status).toBe('in_progress')
  })

  it('updates several fields at once and trims strings', async () => {
    const res = await request(app).patch('/api/tasks/4').send({
      title: ' Landing copy v2 ',
      description: 'Shorter text',
      assignee: 'Nicolas',
      dueDate: '2026-12-10'
    })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ title: 'Landing copy v2', description: 'Shorter text', assignee: 'Nicolas', dueDate: '2026-12-10' })
  })

  it('accepts null to unassign a task or clear its due date', async () => {
    const res = await request(app).patch('/api/tasks/2').send({ assignee: null, dueDate: null })
    expect(res.status).toBe(200)
    expect(res.body.assignee).toBeNull()
    expect(res.body.dueDate).toBeNull()
  })

  it('ignores fields that cannot be edited', async () => {
    const res = await request(app).patch('/api/tasks/1').send({ id: 50, projectId: 2, title: 'CI pipeline' })
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(1)
    expect(res.body.projectId).toBe(1)
  })

  it('returns 400 when no editable field is sent', async () => {
    const res = await request(app).patch('/api/tasks/1').send({ foo: 'bar' })
    expect(res.status).toBe(400)
  })

  it.each([
    [{ title: '' }],
    [{ description: 5 }],
    [{ status: 'blocked' }],
    [{ assignee: '' }],
    [{ dueDate: 'tomorrow-ish' }]
  ])('returns 400 for invalid value %o and leaves the task unchanged', async body => {
    const before = { ...store.tasks.find(t => t.id === 2) }
    const res = await request(app).patch('/api/tasks/2').send(body)
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
    expect(store.tasks.find(t => t.id === 2)).toEqual(before)
  })

  it('returns 404 for an unknown task', async () => {
    expect((await request(app).patch('/api/tasks/999').send({ status: 'done' })).status).toBe(404)
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('deletes the task and its comments', async () => {
    expect(store.comments.some(c => c.taskId === 2)).toBe(true)
    const res = await request(app).delete('/api/tasks/2')
    expect(res.status).toBe(204)
    expect((await request(app).get('/api/tasks/2')).status).toBe(404)
    expect(store.comments.some(c => c.taskId === 2)).toBe(false)
  })

  it('returns 404 when the task does not exist', async () => {
    expect((await request(app).delete('/api/tasks/999')).status).toBe(404)
  })
})
