/**
 * GET /version → { version: "<package.json version>" }
 * DEVOPS-1 (Student A)
 * Reuses getPackageInfo() so package.json stays the single source of truth
 * (no duplicated file-reading logic in the route).
 */
import { Router } from 'express'
import { getPackageInfo } from '../../utils/appInfo.js'

const router = Router()

router.get('/version', (_req, res) => {
  const { version } = getPackageInfo()
  res.status(200).json({ version })
})

export default router
