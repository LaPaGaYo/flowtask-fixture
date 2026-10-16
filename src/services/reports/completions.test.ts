import { expect, test } from 'vitest'
import { completions } from './completions.js'
import { emptySnapshot } from '../../storage/snapshot.js'

test('completions counts only completions and fills inclusive gaps', () => {
  const state = emptySnapshot()
  state.activity = [
    ['task.completed', '2024-02-28'], ['task.completed', '2024-02-28'],
    ['task.canceled', '2024-02-29'], ['task.completed', '2024-03-01'], ['task.completed', '2024-03-02']
  ].map(([action, day], index) => ({ id: `e${index}`, entityId: `t${index}`, action: action!, at: `${day}T12:00:00.000Z` }))
  const before = structuredClone(state)
  expect(completions(state, '2024-02-28', '2024-03-01')).toEqual([
    { date: '2024-02-28', count: 2 }, { date: '2024-02-29', count: 0 }, { date: '2024-03-01', count: 1 }
  ])
  expect(state).toEqual(before)
})

test('completions terminates at the maximum date and returns no rows for invalid or reversed ranges', () => {
  const state = emptySnapshot()
  expect(completions(state, '9999-12-31', '9999-12-31')).toEqual([{ date: '9999-12-31', count: 0 }])
  expect(completions(state, '2024-01-02', '2024-01-01')).toEqual([])
  expect(completions(state, '', '')).toEqual([])
  expect(completions(state, 'invalid', '2024-01-01')).toEqual([])
})
