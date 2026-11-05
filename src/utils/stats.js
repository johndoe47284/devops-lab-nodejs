/**
 * Task statistics used by the dashboard (DEVOPS-15).
 * Pure function: same input, same output, so it is easy to unit test.
 */
import { TASK_STATUSES } from '../data/store.js'

/**
 * Summarise a list of tasks.
 * @param {Array} tasks - tasks to count
 * @param {Date} now - reference date to decide what is overdue
 * @returns {{ total, byStatus, overdue, completionRate }}
 *   completionRate is the share of done tasks in percent (0 when there is no task).
 */
export function computeTaskStats (tasks, now = new Date()) {
  const byStatus = Object.fromEntries(TASK_STATUSES.map(s => [s, 0]))
  let overdue = 0

  for (const task of tasks) {
    byStatus[task.status] += 1
    if (task.status !== 'done' && task.dueDate && new Date(task.dueDate) < now) overdue += 1
  }

  const total = tasks.length
  const completionRate = total === 0 ? 0 : Math.round((byStatus.done / total) * 100)
  return { total, byStatus, overdue, completionRate }
}
