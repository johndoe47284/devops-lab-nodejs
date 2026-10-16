/**
 * Integration test for GET /boom.
 * Ensures global error handler shapes the response.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'
import { resolveErrorCode } from '../src/routes/auto/boom.route.js'

describe('GET /boom', () => {
  it('returns 500 with error payload', async () => {
    const res = await request(app).get('/boom')
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: true, message: 'Boom!' })
    expect(res.headers['content-type']).toMatch(/application\/json/)
  })

  it('simulates a specific error code with ?code=503', async () => {
    const res = await request(app).get('/boom?code=503')
    expect(res.status).toBe(503)
    expect(res.body.error).toBe(true)
  })

  it('falls back to 500 for an invalid code', async () => {
    const res = await request(app).get('/boom?code=200')
    expect(res.status).toBe(500)
  })
})

describe('resolveErrorCode', () => {
  it.each([
    [undefined, 500], ['abc', 500], ['399', 500], ['600', 500],
    ['400', 400], ['418', 418], ['599', 599]
  ])('resolveErrorCode(%s) → %i', (raw, expected) => {
    expect(resolveErrorCode(raw)).toBe(expected)
  })
})
