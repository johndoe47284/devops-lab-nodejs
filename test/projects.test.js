/**
 * Integration tests for the Projects API (DEVOPS-11).
 */
import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/app.js'
import { resetStore } from '../src/data/store.js'

beforeEach(() => resetStore())

describe('GET /api/projects', () => {
  it('returns the list of projects as an array', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('id')
    expect(res.body[0]).toHaveProperty('name')
  })
})

describe('GET /api/projects/:id', () => {
  it('returns one project', async () => {
    const res = await request(app).get('/api/projects/1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(1)
  })

  it('returns 404 for an unknown project', async () => {
    const res = await request(app).get('/api/projects/999')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe(true)
  })

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/projects/abc')
    expect(res.status).toBe(400)
  })
})

describe('POST /api/projects', () => {
  it('creates a project with an auto-generated id', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: '  Mobile app  ', description: 'iOS and Android' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe('Mobile app')
    expect(res.body).toHaveProperty('createdAt')

    const list = await request(app).get('/api/projects')
    expect(list.body.some(p => p.id === res.body.id)).toBe(true)
  })

  it('defaults description to an empty string', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'No description' })
    expect(res.status).toBe(201)
    expect(res.body.description).toBe('')
  })

  it('returns 400 when name is missing or blank', async () => {
    expect((await request(app).post('/api/projects').send({})).status).toBe(400)
    expect((await request(app).post('/api/projects').send({ name: '   ' })).status).toBe(400)
  })

  it('returns 400 when description is not a string', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'X', description: 42 })
    expect(res.status).toBe(400)
  })

  it('returns 409 when the name is already used (case-insensitive)', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'taskflow mvp' })
    expect(res.status).toBe(409)
  })

  it('returns 400 on malformed JSON', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Content-Type', 'application/json')
      .send('{"name": ')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
  })
})
