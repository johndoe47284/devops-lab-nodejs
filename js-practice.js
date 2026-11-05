/**
 * Lab 5 – Part 2: JavaScript practice, adapted to TaskFlow.
 * The lab uses a hospital (doctors, patients); TaskFlow has projects, members
 * and tasks, so each exercise uses the same JavaScript notions on our data.
 *
 * Run: node js-practice.js
 * (Exercise 2.5 "Modularization" is in taskflowData.js + main.js.)
 */

// ─── 2.1 Variables and data types ────────────────────────────────────────────
const workspaceName = 'TaskFlow Team' // const: never changes
let numberOfMembers = 5 // let: changes later
let isWorkspaceOpen = true // Boolean

numberOfMembers += 1 // a new member joins → 6

function workspaceMessage () {
  return isWorkspaceOpen
    ? `Welcome to ${workspaceName}! We have ${numberOfMembers} members currently available.`
    : `${workspaceName} is closed. Come back later.`
}

console.log('── 2.1 Variables')
console.log(workspaceMessage())
isWorkspaceOpen = false // change the Boolean → different message
console.log(workspaceMessage())

// ─── 2.2 Arrays and loops ────────────────────────────────────────────────────
const members = ['Mathéo', 'Matthias', 'Théodore', 'Romain', 'Nicolas']

console.log('\n── 2.2 Arrays and loops')
for (const [index, name] of members.entries()) {
  console.log(`Member #${index + 1}: ${name}`)
}

members.push('Alice') // add a member with push()
console.log(`Updated count: ${members.length} members`)

function findMember (name) {
  return members.includes(name) ? 'Member found' : 'Member not found'
}
console.log('findMember("Romain") →', findMember('Romain'))
console.log('findMember("Bob") →', findMember('Bob'))

// ─── 2.3 Objects and nested data ─────────────────────────────────────────────
const task = {
  title: 'Implement login',
  priority: 3,
  labels: ['auth', 'security'],
  assignee: { name: 'Matthias', role: 'Developer' }
}

console.log('\n── 2.3 Objects and nested data')
console.log('Assignee:', task.assignee.name)
console.log('Number of labels:', task.labels.length)
console.log(`${task.title} is assigned to ${task.assignee.name} (${task.assignee.role}).`)

task.labels.push('backend') // add a label dynamically
console.log('Updated task:', task)

// ─── 2.4 Functions and array filtering ───────────────────────────────────────
const tasks = [
  { id: 1, title: 'Set up CI pipeline', points: 5 },
  { id: 2, title: 'Implement login', points: 8 },
  { id: 3, title: 'Log out', points: 2 }
]

/** Tasks estimated with more than minPoints story points. */
function filterByPoints (minPoints) {
  return tasks.filter(t => t.points > minPoints)
}

/** Add a task with the next free id. */
function addTask (title, points) {
  const id = Math.max(0, ...tasks.map(t => t.id)) + 1
  const newTask = { id, title, points }
  tasks.push(newTask)
  return newTask
}

console.log('\n── 2.4 Functions and filtering')
console.log('Tasks with more than 3 points:', filterByPoints(3))
addTask('Kanban board', 5)
console.log('Updated list:', tasks)

// ─── 2.6 Error handling and validation ───────────────────────────────────────
/** Assign a task to a member on a date; every field is required. */
function createAssignment (member, taskTitle, date) {
  if (!member || !taskTitle || !date) {
    throw new Error('Missing required fields')
  }
  return { member, task: taskTitle, date }
}

console.log('\n── 2.6 Error handling')
try {
  console.log(createAssignment('Matthias', 'Implement login', '2026-11-15'))
  console.log(createAssignment('Matthias')) // should trigger the error
} catch (err) {
  console.error('Error:', err.message)
}

// ─── 2.7 Asynchronous code ───────────────────────────────────────────────────
/** Simulate a database call that answers after 1 second. */
function getWorkspaceData () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ name: workspaceName, projects: 2, openTasks: tasks.length })
    }, 1000)
  })
}

async function showData () {
  console.log('\n── 2.7 Async code')
  console.log('Fetching workspace data...')
  const data = await getWorkspaceData()
  console.log('Data loaded:', data)
}

showData()
