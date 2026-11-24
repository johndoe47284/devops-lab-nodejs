/**
 * Comments on a task (DEVOPS-14, SRS BR-04 "Collaboration on tasks").
 * Mounted on /api/tasks/:taskId/comments in src/app.js (mergeParams gives
 * access to :taskId).
 *
 *   GET  /api/tasks/:taskId/comments   comments of the task, oldest first
 *   POST /api/tasks/:taskId/comments   add a comment { author, content }
 *   GET    /api/tasks/:taskId/comments/:id   one comment (DEVOPS-20)
 *   PUT    /api/tasks/:taskId/comments/:id   replace { author, content } (DEVOPS-20)
 *   DELETE /api/tasks/:taskId/comments/:id   delete a comment (DEVOPS-20)
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

/** Resolve the comment :id of the task, or send the 400/404 answer and return null. */
function findComment (req, res) {
  const task = findTask(req, res)
  if (!task) return null
  const id = parseId(req.params.id)
  if (!id) {
    res.status(400).json({ error: true, message: 'Invalid comment id' })
    return null
  }
  const comment = store.comments.find(c => c.id === id && c.taskId === task.id)
  if (!comment) {
    res.status(404).json({ error: true, message: 'Comment not found' })
    return null
  }
  return comment
}

/** Check { author, content }; returns an error message or null. */
function validateComment ({ author, content }) {
  if (!isNonEmptyString(author) || !isNonEmptyString(content)) {
    return 'Missing required fields: author, content'
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return `content must be at most ${MAX_CONTENT_LENGTH} characters`
  }
  return null
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
  const message = validateComment({ author, content })
  if (message) return res.status(400).json({ error: true, message })

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

router.get('/:id', (req, res) => {
  const comment = findComment(req, res)
  if (comment) res.status(200).json(comment)
})

router.put('/:id', (req, res) => {
  const comment = findComment(req, res)
  if (!comment) return

  const { author, content } = req.body ?? {}
  const message = validateComment({ author, content })
  if (message) return res.status(400).json({ error: true, message })

  comment.author = author.trim()
  comment.content = content.trim()
  comment.updatedAt = new Date().toISOString()
  res.status(200).json(comment)
})

router.delete('/:id', (req, res) => {
  const comment = findComment(req, res)
  if (!comment) return

  store.comments.splice(store.comments.indexOf(comment), 1)
  res.status(204).end()
})

export default router
