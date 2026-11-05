/**
 * Lab 5 – Part 2.5: Modularization.
 * Run: node main.js
 */
import { members, addMember } from './taskflowData.js'

addMember('Théodore')
addMember('Matthias') // already in the list: not added twice
console.log('Updated members:', members)
