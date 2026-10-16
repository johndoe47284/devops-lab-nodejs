/**
 * Integration test for GET / (root greeting).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('GET /', () => {
  it('returns a JSON greeting', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(typeof res.body.message).toBe('string')
  })

  it('returns 404 for an unknown route', async () => {
    const res = await request(app).get('/does-not-exist')
    expect(res.status).toBe(404)
  })
})
