import { expect, test } from 'vitest'
import { hasCycle, isReady } from './dependencies.js'
import { task } from './test-helpers/fixtures.js'
test('cycles include self references and disconnected components', () => {
  expect(hasCycle([task({ id: 'a', blockedBy: ['b'] }), task({ id: 'b', blockedBy: ['a'] })])).toBe(true)
  expect(hasCycle([task({ blockedBy: ['t1'] })])).toBe(true)
  expect(hasCycle([task()])).toBe(false)
})
test('readiness requires an open task and completed dependencies', () => {
  const blocked = task({ blockedBy: ['b'] })
  expect(isReady(blocked, [blocked])).toBe(false)
  expect(isReady(blocked, [task({ id: 'b', status: 'done' })])).toBe(true)
  expect(isReady(task({ status: 'done' }), [])).toBe(false)
})
