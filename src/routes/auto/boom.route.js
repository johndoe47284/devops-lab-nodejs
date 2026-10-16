/**
 * GET /boom → triggers an error to exercise the global error handler.
 * DEVOPS-3 (Student C)
 * Optional query `?code=<4xx|5xx>` simulates a specific HTTP error;
 * anything else (missing, invalid, out of range) falls back to 500.
 */
import { Router } from 'express'

const router = Router()

export function resolveErrorCode (raw) {
  const code = Number.parseInt(raw, 10)
  return Number.isInteger(code) && code >= 400 && code <= 599 ? code : 500
}

router.get('/boom', (req, _res, next) => {
  const err = new Error('Boom!')
  err.status = resolveErrorCode(req.query.code)
  next(err)
})

export default router
