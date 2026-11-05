/**
 * Integration tests for the tasks of a project (DEVOPS-12).
 */
import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStore } from '../src/data/store.js'

beforeEach(() => resetStore())

describe('GET /api/projects/:projectId/tasks', () => {
  it('returns only the tasks of the project', async () => {
    const res = await request(app).get('/api/projects/1/tasks')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body.every(t => t.projectId === 1)).toBe(true)
  })

  it('filters by status', async () => {
    const res = await request(app).get('/api/projects/1/tasks?status=done')
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body.every(t => t.status === 'done')).toBe(true)
  })

  it('filters by assignee (case-insensitive)', async () => {
    const res = await request(app).get('/api/projects/1/tasks?assignee=matthias')
    expect(res.body.length).toBe(1)
    expect(res.body[0].assignee).toBe('Matthias')
  })

  it('searches title and description with q', async () => {
    const res = await request(app).get('/api/projects/1/tasks?q=KANBAN')
    expect(res.body.length).toBe(1)
    expect(res.body[0].title).toMatch(/Kanban/)
  })

  it('returns an empty array when nothing matches', async () => {
    const res = await request(app).get('/api/projects/1/tasks?q=nothing-matches-this')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('handles tasks without assignee when filtering by assignee', async () => {
    const res = await request(app).get('/api/projects/2/tasks?assignee=nobody')
    expect(res.body).toEqual([])
  })

  it('returns 400 for an unknown status filter', async () => {
    const res = await request(app).get('/api/projects/1/tasks?status=blocked')
    expect(res.status).toBe(400)
  })

  it('returns 404 for an unknown project and 400 for an invalid id', async () => {
    expect((await request(app).get('/api/projects/999/tasks')).status).toBe(404)
    expect((await request(app).get('/api/projects/abc/tasks')).status).toBe(400)
  })
})

describe('POST /api/projects/:projectId/tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app).post('/api/projects/2/tasks').send({ title: '  Buy domain name ' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ projectId: 2, title: 'Buy domain name', status: 'todo', assignee: null, dueDate: null })
    expect(res.body).toHaveProperty('id')

    const list = await request(app).get('/api/projects/2/tasks')
    expect(list.body.some(t => t.id === res.body.id)).toBe(true)
  })

  it('creates a task with every field', async () => {
    const res = await request(app).post('/api/projects/1/tasks').send({
      title: 'Write API docs',
      description: 'OpenAPI file',
      status: 'in_progress',
      assignee: 'Théodore',
      dueDate: '2026-12-01'
    })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('in_progress')
    expect(res.body.assignee).toBe('Théodore')
  })

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/projects/1/tasks').send({ description: 'no title' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
  })

  it('returns 400 for an invalid status or dueDate', async () => {
    expect((await request(app).post('/api/projects/1/tasks').send({ title: 'T', status: 'blocked' })).status).toBe(400)
    expect((await request(app).post('/api/projects/1/tasks').send({ title: 'T', dueDate: 'not-a-date' })).status).toBe(400)
  })

  it('returns 404 when the project does not exist', async () => {
    const res = await request(app).post('/api/projects/999/tasks').send({ title: 'T' })
    expect(res.status).toBe(404)
  })
})
