/**
 * Lab 5 – Part 2.5: Modularization (the lab's hospitalData.js, for TaskFlow).
 * Holds the data and the functions; main.js imports and calls them.
 */
export const members = ['Mathéo', 'Matthias']

export function addMember (name) {
  if (!members.includes(name)) members.push(name)
  return members
}
