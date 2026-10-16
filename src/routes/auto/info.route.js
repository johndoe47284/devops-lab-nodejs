/**
 * GET /info → merges two small helpers for easy unit testing.
 * DEVOPS-2 (Student B)
 * Returns: { name, version, node, uptime }
 * Runtime data changes on every call, so the response must not be cached.
 */
import { Router } from 'express'
import { getPackageInfo, getRuntimeInfo } from '../../utils/appInfo.js'

const router = Router()

router.get('/info', (_req, res) => {
  const info = { ...getPackageInfo(), ...getRuntimeInfo() }
  res.set('Cache-Control', 'no-store')
  res.status(200).json(info)
})

export default router
