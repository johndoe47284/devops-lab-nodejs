/**
 * Single task API (DEVOPS-13, SRS BR-03 "Task planning & Kanban board").
 * Mounted on /api/tasks in src/app.js.
 *
 *   GET    /api/tasks       all tasks, every project (DEVOPS-19)
 *   GET    /api/tasks/:id   one task
 *   PUT    /api/tasks/:id   replace a task { title, description?, status?, assignee?, dueDate? } (DEVOPS-19)
 *   PATCH  /api/tasks/:id   update title, description, status, assignee, dueDate
 *                           (moving a card on the Kanban board = changing its status)
 *   DELETE /api/tasks/:id   delete the task and its comments (204)
 */
import express from 'express'
import { store, parseId, isNonEmptyString, TASK_STATUSES } from '../data/store.js'

const router = express.Router()

const EDITABLE_FIELDS = ['title', 'description', 'status', 'assignee', 'dueDate']

/** Resolve the task from :id, or send the 400/404 answer and return null. */
function findTask (req, res) {
  const id = parseId(req.params.id)
  if (!id) {
    res.status(400).json({ error: true, message: 'Invalid task id' })
    return null
  }
  const task = store.tasks.find(t => t.id === id)
  if (!task) {
    res.status(404).json({ error: true, message: 'Task not found' })
    return null
  }
  return task
}

/** Check one field of a PATCH body; returns an error message or null. */
function validateField (field, value) {
  switch (field) {
    case 'title':
      return isNonEmptyString(value) ? null : 'title must be a non-empty string'
    case 'description':
      return typeof value === 'string' ? null : 'description must be a string'
    case 'status':
      return TASK_STATUSES.includes(value) ? null : `status must be one of: ${TASK_STATUSES.join(', ')}`
    case 'assignee':
      return value === null || isNonEmptyString(value) ? null : 'assignee must be a non-empty string or null'
    default: // dueDate
      return value === null || !Number.isNaN(Date.parse(value)) ? null : 'dueDate must be a valid date or null'
  }
}

router.get('/', (_req, res) => {
  res.status(200).json(store.tasks)
})

router.get('/:id', (req, res) => {
  const task = findTask(req, res)
  if (task) res.status(200).json(task)
})

router.patch('/:id', (req, res) => {
  const task = findTask(req, res)
  if (!task) return

  const body = req.body ?? {}
  const fields = Object.keys(body).filter(f => EDITABLE_FIELDS.includes(f))
  if (fields.length === 0) {
    return res.status(400).json({ error: true, message: `Nothing to update. Editable fields: ${EDITABLE_FIELDS.join(', ')}` })
  }

  for (const field of fields) {
    const message = validateField(field, body[field])
    if (message) return res.status(400).json({ error: true, message })
  }

  for (const field of fields) {
    task[field] = typeof body[field] === 'string' && field !== 'description' ? body[field].trim() : body[field]
  }
  res.status(200).json(task)
})

// PUT replaces every editable field: missing ones go back to their default value
router.put('/:id', (req, res) => {
  const task = findTask(req, res)
  if (!task) return

  const body = req.body ?? {}
  const next = {
    title: body.title,
    description: body.description ?? '',
    status: body.status ?? 'todo',
    assignee: body.assignee ?? null,
    dueDate: body.dueDate ?? null
  }
  for (const field of EDITABLE_FIELDS) {
    const message = validateField(field, next[field])
    if (message) return res.status(400).json({ error: true, message })
  }

  task.title = next.title.trim()
  task.description = next.description
  task.status = next.status
  task.assignee = typeof next.assignee === 'string' ? next.assignee.trim() : null
  task.dueDate = next.dueDate
  res.status(200).json(task)
})

router.delete('/:id', (req, res) => {
  const task = findTask(req, res)
  if (!task) return

  store.tasks.splice(store.tasks.indexOf(task), 1)
  // A deleted task takes its comments with it
  for (let i = store.comments.length - 1; i >= 0; i--) {
    if (store.comments[i].taskId === task.id) store.comments.splice(i, 1)
  }
  res.status(204).end()
})

export default router
