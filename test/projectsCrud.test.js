/**
 * Integration tests for PUT and DELETE /api/projects/:id (DEVOPS-18, Lab 6).
 */
import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStore, store } from '../src/data/store.js'

beforeEach(() => resetStore())

describe('PUT /api/projects/:id', () => {
  it('replaces the name and description of a project', async () => {
    const res = await request(app)
      .put('/api/projects/1')
      .send({ name: '  TaskFlow v1  ', description: 'Public release' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, name: 'TaskFlow v1', description: 'Public release' })

    const get = await request(app).get('/api/projects/1')
    expect(get.body.name).toBe('TaskFlow v1')
  })

  it('resets description to an empty string when it is omitted', async () => {
    const res = await request(app).put('/api/projects/1').send({ name: 'TaskFlow MVP' })
    expect(res.status).toBe(200)
    expect(res.body.description).toBe('')
  })

  it('keeps createdAt unchanged', async () => {
    const before = store.projects[0].createdAt
    const res = await request(app).put('/api/projects/1').send({ name: 'Renamed' })
    expect(res.body.createdAt).toBe(before)
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app).put('/api/projects/1').send({ description: 'x' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: true, message: 'Missing required field: name' })
  })

  it('returns 400 when description is not a string', async () => {
    const res = await request(app).put('/api/projects/1').send({ name: 'Ok', description: 42 })
    expect(res.status).toBe(400)
  })

  it('returns 409 when another project already has the name', async () => {
    const res = await request(app).put('/api/projects/1').send({ name: 'marketing website' })
    expect(res.status).toBe(409)
  })

  it('accepts the project keeping its own name', async () => {
    const res = await request(app).put('/api/projects/2').send({ name: 'Marketing website', description: 'New' })
    expect(res.status).toBe(200)
  })

  it('returns 404 for an unknown project and 400 for an invalid id', async () => {
    expect((await request(app).put('/api/projects/999').send({ name: 'X' })).status).toBe(404)
    expect((await request(app).put('/api/projects/abc').send({ name: 'X' })).status).toBe(400)
  })
})

describe('DELETE /api/projects/:id', () => {
  it('deletes the project and answers 204', async () => {
    const res = await request(app).delete('/api/projects/2')
    expect(res.status).toBe(204)
    expect((await request(app).get('/api/projects/2')).status).toBe(404)
  })

  it('also deletes the tasks of the project and their comments', async () => {
    const res = await request(app).delete('/api/projects/1')
    expect(res.status).toBe(204)
    expect(store.tasks.some(t => t.projectId === 1)).toBe(false)
    expect(store.comments.some(c => c.taskId === 2)).toBe(false)
    // tasks of other projects are kept
    expect(store.tasks.some(t => t.projectId === 2)).toBe(true)
  })

  it('returns 404 for an unknown project and 400 for an invalid id', async () => {
    expect((await request(app).delete('/api/projects/999')).status).toBe(404)
    expect((await request(app).delete('/api/projects/0')).status).toBe(400)
  })
})
