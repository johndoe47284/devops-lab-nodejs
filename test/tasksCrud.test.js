/**
 * Integration tests for GET /api/tasks and PUT /api/tasks/:id (DEVOPS-19, Lab 6).
 */
import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStore, store } from '../src/data/store.js'

beforeEach(() => resetStore())

describe('GET /api/tasks', () => {
  it('lists the tasks of every project', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(store.tasks.length)
    expect(new Set(res.body.map(t => t.projectId)).size).toBeGreaterThan(1)
  })
})

describe('PUT /api/tasks/:id', () => {
  it('replaces every editable field', async () => {
    const res = await request(app).put('/api/tasks/3').send({
      title: '  Build Kanban board  ',
      description: 'Drag and drop between columns',
      status: 'in_progress',
      assignee: ' Nicolas ',
      dueDate: '2026-12-05'
    })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: 3,
      projectId: 1,
      title: 'Build Kanban board',
      description: 'Drag and drop between columns',
      status: 'in_progress',
      assignee: 'Nicolas',
      dueDate: '2026-12-05'
    })
  })

  it('puts omitted fields back to their default values', async () => {
    const res = await request(app).put('/api/tasks/2').send({ title: 'Implement login' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ description: '', status: 'todo', assignee: null, dueDate: null })
  })

  it('returns 400 when title is missing and leaves the task unchanged', async () => {
    const before = { ...store.tasks.find(t => t.id === 1) }
    const res = await request(app).put('/api/tasks/1').send({ status: 'done' })
    expect(res.status).toBe(400)
    expect(store.tasks.find(t => t.id === 1)).toEqual(before)
  })

  it('returns 400 for an invalid status or date', async () => {
    expect((await request(app).put('/api/tasks/1').send({ title: 'A', status: 'blocked' })).status).toBe(400)
    expect((await request(app).put('/api/tasks/1').send({ title: 'A', dueDate: 'tomorrow' })).status).toBe(400)
  })

  it('returns 404 for an unknown task and 400 for an invalid id', async () => {
    expect((await request(app).put('/api/tasks/999').send({ title: 'A' })).status).toBe(404)
    expect((await request(app).put('/api/tasks/x').send({ title: 'A' })).status).toBe(400)
  })
})
