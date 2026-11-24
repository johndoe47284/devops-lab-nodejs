/**
 * Projects API (DEVOPS-11, SRS BR-02 "Projects & teams").
 * Mounted on /api/projects in src/app.js.
 *
 *   GET  /api/projects       list all projects
 *   GET  /api/projects/:id   one project, 404 if it does not exist
 *   POST /api/projects       create a project { name, description? }
 *   PUT  /api/projects/:id   replace a project { name, description? } (DEVOPS-18)
 *   DELETE /api/projects/:id delete a project, its tasks and their comments (DEVOPS-18)
 */
import express from 'express'
import { store, nextId, parseId, isNonEmptyString } from '../data/store.js'

const router = express.Router()

router.get('/', (_req, res) => {
  res.status(200).json(store.projects)
})

/** Resolve the project from :id, or send the 400/404 answer and return null. */
function findProject (req, res) {
  const id = parseId(req.params.id)
  if (!id) {
    res.status(400).json({ error: true, message: 'Invalid project id' })
    return null
  }
  const project = store.projects.find(p => p.id === id)
  if (!project) {
    res.status(404).json({ error: true, message: 'Project not found' })
    return null
  }
  return project
}

/**
 * Validate a project body (POST and PUT). Returns { status, message } when the
 * body is rejected, or null when it is valid. excludeId lets PUT keep its own name.
 */
function validateProject ({ name, description }, excludeId = null) {
  if (!isNonEmptyString(name)) return { status: 400, message: 'Missing required field: name' }
  if (typeof description !== 'string') return { status: 400, message: 'description must be a string' }
  const taken = store.projects.some(p =>
    p.id !== excludeId && p.name.toLowerCase() === name.trim().toLowerCase())
  if (taken) return { status: 409, message: 'A project with this name already exists' }
  return null
}

router.get('/:id', (req, res) => {
  const project = findProject(req, res)
  if (project) res.status(200).json(project)
})

router.post('/', (req, res) => {
  const { name, description = '' } = req.body ?? {}

  const invalid = validateProject({ name, description })
  if (invalid) return res.status(invalid.status).json({ error: true, message: invalid.message })

  const project = {
    id: nextId(store.projects),
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString()
  }
  store.projects.push(project)
  res.status(201).json(project)
})

// PUT replaces the editable fields: a missing description becomes ''
router.put('/:id', (req, res) => {
  const project = findProject(req, res)
  if (!project) return

  const { name, description = '' } = req.body ?? {}
  const invalid = validateProject({ name, description }, project.id)
  if (invalid) return res.status(invalid.status).json({ error: true, message: invalid.message })

  project.name = name.trim()
  project.description = description.trim()
  res.status(200).json(project)
})

router.delete('/:id', (req, res) => {
  const project = findProject(req, res)
  if (!project) return

  // A deleted project takes its tasks, and their comments, with it
  const taskIds = new Set(store.tasks.filter(t => t.projectId === project.id).map(t => t.id))
  removeWhere(store.comments, c => taskIds.has(c.taskId))
  removeWhere(store.tasks, t => t.projectId === project.id)
  store.projects.splice(store.projects.indexOf(project), 1)
  res.status(204).end()
})

/** Remove in place the items matching predicate (keeps the shared array reference). */
function removeWhere (array, predicate) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) array.splice(i, 1)
  }
}

export default router
