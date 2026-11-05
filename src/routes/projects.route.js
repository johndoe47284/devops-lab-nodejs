/**
 * Projects API (DEVOPS-11, SRS BR-02 "Projects & teams").
 * Mounted on /api/projects in src/app.js.
 *
 *   GET  /api/projects       list all projects
 *   GET  /api/projects/:id   one project, 404 if it does not exist
 *   POST /api/projects       create a project { name, description? }
 */
import express from 'express'
import { store, nextId, parseId, isNonEmptyString } from '../data/store.js'

const router = express.Router()

router.get('/', (_req, res) => {
  res.status(200).json(store.projects)
})

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id)
  if (!id) return res.status(400).json({ error: true, message: 'Invalid project id' })

  const project = store.projects.find(p => p.id === id)
  if (!project) return res.status(404).json({ error: true, message: 'Project not found' })

  res.status(200).json(project)
})

router.post('/', (req, res) => {
  const { name, description = '' } = req.body ?? {}

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: true, message: 'Missing required field: name' })
  }
  if (typeof description !== 'string') {
    return res.status(400).json({ error: true, message: 'description must be a string' })
  }
  const taken = store.projects.some(p => p.name.toLowerCase() === name.trim().toLowerCase())
  if (taken) {
    return res.status(409).json({ error: true, message: 'A project with this name already exists' })
  }

  const project = {
    id: nextId(store.projects),
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString()
  }
  store.projects.push(project)
  res.status(201).json(project)
})

export default router
