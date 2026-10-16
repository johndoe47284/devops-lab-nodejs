/**
 * Unit tests for src/utils/errorHandler.js.
 * We stub a minimal `res` object to capture status and body.
 */
import { describe, it, expect, vi } from 'vitest'
import { errorHandler } from '../../src/utils/errorHandler.js'

function makeRes () {
  return {
    statusCode: 0,
    body: null,
    status (code) { this.statusCode = code; return this },
    json (obj) { this.body = obj; return this }
  }
}

describe('errorHandler', () => {
  it('defaults to 500 with generic message', () => {
    const res = makeRes()
    errorHandler({}, {}, res, () => {})
    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: true, message: 'Internal Server Error' })
  })

  it('uses provided status and message', () => {
    const res = makeRes()
    errorHandler({ status: 418, message: 'teapot' }, {}, res, () => {})
    expect(res.statusCode).toBe(418)
    expect(res.body).toEqual({ error: true, message: 'teapot' })
  })
  it('delegates to next() when headers are already sent', () => {
    const res = { ...makeRes(), headersSent: true }
    const next = vi.fn()
    const err = new Error('late')
    errorHandler(err, {}, res, next)
    expect(next).toHaveBeenCalledWith(err)
    expect(res.statusCode).toBe(0)
  })
})
