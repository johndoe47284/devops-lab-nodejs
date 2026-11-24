/**
 * Integration tests for GET, PUT and DELETE /api/tasks/:taskId/comments/:id (DEVOPS-20, Lab 6).
 */
import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStore, store } from '../src/data/store.js'

beforeEach(() => resetStore())

describe('GET /api/tasks/:taskId/comments/:id', () => {
  it('returns one comment of the task', async () => {
    const res = await request(app).get('/api/tasks/2/comments/1')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, taskId: 2, author: 'Mathéo' })
  })

  it('returns 404 when the comment belongs to another task', async () => {
    const res = await request(app).get('/api/tasks/1/comments/1')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Comment not found')
  })

  it('returns 404 for an unknown task and 400 for invalid ids', async () => {
    expect((await request(app).get('/api/tasks/999/comments/1')).status).toBe(404)
    expect((await request(app).get('/api/tasks/2/comments/abc')).status).toBe(400)
    expect((await request(app).get('/api/tasks/abc/comments/1')).status).toBe(400)
  })
})

describe('PUT /api/tasks/:taskId/comments/:id', () => {
  it('replaces author and content and sets updatedAt', async () => {
    const res = await request(app)
      .put('/api/tasks/2/comments/1')
      .send({ author: ' Nicolas ', content: ' Use a generic message on failed login. ' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, author: 'Nicolas', content: 'Use a generic message on failed login.' })
    expect(res.body).toHaveProperty('updatedAt')
    expect(res.body.createdAt).toBe('2026-11-02T10:00:00.000Z')
  })

  it('returns 400 when a field is missing or content is too long', async () => {
    expect((await request(app).put('/api/tasks/2/comments/1').send({ author: 'A' })).status).toBe(400)
    const long = 'x'.repeat(2001)
    expect((await request(app).put('/api/tasks/2/comments/1').send({ author: 'A', content: long })).status).toBe(400)
  })

  it('returns 404 for an unknown comment', async () => {
    const res = await request(app).put('/api/tasks/2/comments/999').send({ author: 'A', content: 'B' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/tasks/:taskId/comments/:id', () => {
  it('deletes the comment and answers 204', async () => {
    const res = await request(app).delete('/api/tasks/2/comments/1')
    expect(res.status).toBe(204)
    expect(store.comments).toHaveLength(0)
    expect((await request(app).get('/api/tasks/2/comments/1')).status).toBe(404)
  })

  it('returns 404 for an unknown comment', async () => {
    expect((await request(app).delete('/api/tasks/2/comments/42')).status).toBe(404)
  })
})
