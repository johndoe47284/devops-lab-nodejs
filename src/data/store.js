/**
 * In-memory data store shared by the TaskFlow API routes.
 * It stands in for the PostgreSQL database described in the SDD until the
 * persistence layer is added. Every route reads and writes these arrays, so
 * tasks can check that their project exists and comments that their task exists.
 *
 * resetStore() puts the seed data back; tests call it in beforeEach so each
 * test starts from the same known state.
 */

export const TASK_STATUSES = ['todo', 'in_progress', 'done']

const seed = () => ({
  projects: [
    { id: 1, name: 'TaskFlow MVP', description: 'First release of the TaskFlow app', createdAt: '2026-10-01T09:00:00.000Z' },
    { id: 2, name: 'Marketing website', description: 'Landing page and docs', createdAt: '2026-10-05T09:00:00.000Z' }
  ],
  tasks: [
    { id: 1, projectId: 1, title: 'Set up CI pipeline', description: 'Lint, tests and coverage on every PR', status: 'done', assignee: 'Nicolas', dueDate: '2026-10-20' },
    { id: 2, projectId: 1, title: 'Implement login', description: 'Email and password authentication', status: 'in_progress', assignee: 'Matthias', dueDate: '2026-11-15' },
    { id: 3, projectId: 1, title: 'Design Kanban board', description: 'Columns To Do, In Progress, Done', status: 'todo', assignee: 'Romain', dueDate: '2026-11-30' },
    { id: 4, projectId: 2, title: 'Write landing page copy', description: '', status: 'todo', assignee: null, dueDate: null }
  ],
  comments: [
    { id: 1, taskId: 2, author: 'Mathéo', content: 'Remember the generic error message on failed login.', createdAt: '2026-11-02T10:00:00.000Z' }
  ]
})

export const store = { projects: [], tasks: [], comments: [] }

/** Put the seed data back (mutates the arrays so every importer sees the reset). */
export function resetStore () {
  const data = seed()
  for (const key of Object.keys(store)) {
    store[key].length = 0
    store[key].push(...data[key])
  }
}

/** Next id for a collection: highest id + 1, so ids never repeat after a delete. */
export function nextId (collection) {
  return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

/** Parse a route id; returns a positive integer or null when the id is invalid. */
export function parseId (value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

/** True when value is a string with at least one non-space character. */
export function isNonEmptyString (value) {
  return typeof value === 'string' && value.trim().length > 0
}

resetStore()
