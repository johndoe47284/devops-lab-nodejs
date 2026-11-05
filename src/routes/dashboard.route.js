/**
 * Progress dashboard (DEVOPS-15, SRS BR-07 "Progress dashboards & reporting").
 * Mounted on /api/dashboard in src/app.js. It plays the role of /api/metrics
 * from the lab handout, applied to TaskFlow.
 *
 *   GET /api/dashboard               stats for all projects + one line per project
 *   GET /api/dashboard?projectId=1   stats for one project
 */
import express from 'express'
import { store, parseId } from '../data/store.js'
import { computeTaskStats } from '../utils/stats.js'

const router = express.Router()

router.get('/', (req, res) => {
  const now = new Date()
  const { projectId } = req.query

  if (projectId !== undefined) {
    const id = parseId(projectId)
    if (!id) return res.status(400).json({ error: true, message: 'Invalid projectId' })
    const project = store.projects.find(p => p.id === id)
    if (!project) return res.status(404).json({ error: true, message: 'Project not found' })

    const tasks = store.tasks.filter(t => t.projectId === id)
    return res.status(200).json({ project: { id: project.id, name: project.name }, ...computeTaskStats(tasks, now) })
  }

  res.status(200).json({
    generatedAt: now.toISOString(),
    projects: store.projects.length,
    comments: store.comments.length,
    tasks: computeTaskStats(store.tasks, now),
    perProject: store.projects.map(p => ({
      id: p.id,
      name: p.name,
      ...computeTaskStats(store.tasks.filter(t => t.projectId === p.id), now)
    }))
  })
})

export default router
