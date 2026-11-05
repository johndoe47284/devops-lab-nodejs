/**
 * Integration tests for task comments (DEVOPS-14).
 */
import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStore } from '../src/data/store.js'

beforeEach(() => resetStore())

describe('GET /api/tasks/:taskId/comments', () => {
  it('returns the comments of the task', async () => {
    const res = await request(app).get('/api/tasks/2/comments')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].taskId).toBe(2)
  })

  it('returns an empty array for a task without comments', async () => {
    const res = await request(app).get('/api/tasks/1/comments')
    expect(res.body).toEqual([])
  })

  it('returns comments oldest first', async () => {
    await request(app).post('/api/tasks/2/comments').send({ author: 'Romain', content: 'Second' })
    const res = await request(app).get('/api/tasks/2/comments')
    expect(res.body.map(c => c.content)).toEqual([expect.stringMatching(/generic error/), 'Second'])
  })

  it('returns 404 for an unknown task and 400 for an invalid id', async () => {
    expect((await request(app).get('/api/tasks/999/comments')).status).toBe(404)
    expect((await request(app).get('/api/tasks/x/comments')).status).toBe(400)
  })
})

describe('POST /api/tasks/:taskId/comments', () => {
  it('adds a comment with an id and a timestamp', async () => {
    const res = await request(app)
      .post('/api/tasks/1/comments')
      .send({ author: ' Matthias ', content: ' Pipeline is green on Node 20 and 22. ' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ taskId: 1, author: 'Matthias', content: 'Pipeline is green on Node 20 and 22.' })
    expect(res.body).toHaveProperty('id')
    expect(Number.isNaN(Date.parse(res.body.createdAt))).toBe(false)
  })

  it('returns 400 when author or content is missing', async () => {
    expect((await request(app).post('/api/tasks/1/comments').send({ content: 'Hi' })).status).toBe(400)
    expect((await request(app).post('/api/tasks/1/comments').send({ author: 'A', content: '  ' })).status).toBe(400)
  })

  it('returns 400 when content is too long', async () => {
    const res = await request(app).post('/api/tasks/1/comments').send({ author: 'A', content: 'x'.repeat(2001) })
    expect(res.status).toBe(400)
  })

  it('returns 404 when the task does not exist', async () => {
    const res = await request(app).post('/api/tasks/999/comments').send({ author: 'A', content: 'B' })
    expect(res.status).toBe(404)
  })
})
