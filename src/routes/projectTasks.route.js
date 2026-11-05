/**
 * Tasks of a project (DEVOPS-12, SRS BR-03 "Task planning" + BR-06 "Search & filtering").
 * Mounted on /api/projects/:projectId/tasks in src/app.js (mergeParams gives
 * access to :projectId).
 *
 *   GET  /api/projects/:projectId/tasks?status=&assignee=&q=   list, filter, search
 *   POST /api/projects/:projectId/tasks                        create a task
 */
import express from 'express'
import { store, nextId, parseId, isNonEmptyString, TASK_STATUSES } from '../data/store.js'

const router = express.Router({ mergeParams: true })

/** Resolve the project from :projectId, or send the 400/404 answer and return null. */
function findProject (req, res) {
  const projectId = parseId(req.params.projectId)
  if (!projectId) {
    res.status(400).json({ error: true, message: 'Invalid project id' })
    return null
  }
  const project = store.projects.find(p => p.id === projectId)
  if (!project) {
    res.status(404).json({ error: true, message: 'Project not found' })
    return null
  }
  return project
}

router.get('/', (req, res) => {
  const project = findProject(req, res)
  if (!project) return

  const { status, assignee, q } = req.query
  if (status !== undefined && !TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: true, message: `status must be one of: ${TASK_STATUSES.join(', ')}` })
  }

  let tasks = store.tasks.filter(t => t.projectId === project.id)
  if (status) tasks = tasks.filter(t => t.status === status)
  if (assignee) tasks = tasks.filter(t => (t.assignee ?? '').toLowerCase() === String(assignee).toLowerCase())
  if (q) {
    const needle = String(q).toLowerCase()
    tasks = tasks.filter(t => `${t.title} ${t.description}`.toLowerCase().includes(needle))
  }

  res.status(200).json(tasks)
})

router.post('/', (req, res) => {
  const project = findProject(req, res)
  if (!project) return

  const { title, description = '', status = 'todo', assignee = null, dueDate = null } = req.body ?? {}

  if (!isNonEmptyString(title)) {
    return res.status(400).json({ error: true, message: 'Missing required field: title' })
  }
  if (!TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: true, message: `status must be one of: ${TASK_STATUSES.join(', ')}` })
  }
  if (dueDate !== null && Number.isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: true, message: 'dueDate must be a valid date (YYYY-MM-DD)' })
  }

  const task = {
    id: nextId(store.tasks),
    projectId: project.id,
    title: title.trim(),
    description: String(description),
    status,
    assignee: isNonEmptyString(assignee) ? assignee.trim() : null,
    dueDate
  }
  store.tasks.push(task)
  res.status(201).json(task)
})

export default router
