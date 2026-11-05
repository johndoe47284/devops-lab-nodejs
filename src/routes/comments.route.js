/**
 * Comments on a task (DEVOPS-14, SRS BR-04 "Collaboration on tasks").
 * Mounted on /api/tasks/:taskId/comments in src/app.js (mergeParams gives
 * access to :taskId).
 *
 *   GET  /api/tasks/:taskId/comments   comments of the task, oldest first
 *   POST /api/tasks/:taskId/comments   add a comment { author, content }
 */
import express from 'express'
import { store, nextId, parseId, isNonEmptyString } from '../data/store.js'

const router = express.Router({ mergeParams: true })

const MAX_CONTENT_LENGTH = 2000

/** Resolve the task from :taskId, or send the 400/404 answer and return null. */
function findTask (req, res) {
  const taskId = parseId(req.params.taskId)
  if (!taskId) {
    res.status(400).json({ error: true, message: 'Invalid task id' })
    return null
  }
  const task = store.tasks.find(t => t.id === taskId)
  if (!task) {
    res.status(404).json({ error: true, message: 'Task not found' })
    return null
  }
  return task
}

router.get('/', (req, res) => {
  const task = findTask(req, res)
  if (!task) return

  const comments = store.comments
    .filter(c => c.taskId === task.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  res.status(200).json(comments)
})

router.post('/', (req, res) => {
  const task = findTask(req, res)
  if (!task) return

  const { author, content } = req.body ?? {}
  if (!isNonEmptyString(author) || !isNonEmptyString(content)) {
    return res.status(400).json({ error: true, message: 'Missing required fields: author, content' })
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: true, message: `content must be at most ${MAX_CONTENT_LENGTH} characters` })
  }

  const comment = {
    id: nextId(store.comments),
    taskId: task.id,
    author: author.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString()
  }
  store.comments.push(comment)
  res.status(201).json(comment)
})

export default router
