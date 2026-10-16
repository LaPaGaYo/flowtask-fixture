import { expect, test } from 'vitest'
import { dependencyGraph } from './dependency-graph.js'
import { emptySnapshot } from '../../storage/snapshot.js'
import { task } from '../../domain/test-helpers/fixtures.js'

test('dependencyGraph renders an empty graph as empty text', () => {
  expect(dependencyGraph(emptySnapshot())).toBe('')
})

test('dependencyGraph sorts nodes and dependencies without mutating input', () => {
  const state = emptySnapshot()
  state.tasks = [task({ id: 't3', blockedBy: ['t2', 't1'], dueDate: '9999-12-31' }), task({ id: 't2' }), task({ id: 't1' })]
  const before = structuredClone(state)
  expect(dependencyGraph(state)).toBe('t1 -> (none)\nt2 -> (none)\nt3 -> t1, t2')
  expect(state).toEqual(before)
})
