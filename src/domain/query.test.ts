import { expect, test } from 'vitest'
import { queryTasks } from './query.js'
import { task } from './test-helpers/fixtures.js'
test('filters and stable sorting never mutate their input', () => {
  const tasks = [task({ id: 'b', priority: 'p2' }), task({ id: 'a', priority: 'p1', tags: ['x'] })]
  expect(queryTasks(tasks, {}, 'priority').map(t => t.id)).toEqual(['a', 'b'])
  expect(queryTasks(tasks, { tag: 'x', projectId: 'p1', status: 'todo', ready: true }, 'title')).toHaveLength(1)
  expect(tasks[0]?.id).toBe('b')
  expect(queryTasks([task({ id: 'a' }), task({ id: 'b', dueDate: '2024-01-02' })], {}, 'dueDate')[0]?.id).toBe('b')
  expect(queryTasks(tasks, {}, 'createdAt').map(t => t.id)).toEqual(['a', 'b'])
})

test('missing due dates follow even the maximum calendar date', () => {
  const tasks = [task({ id: 'a', dueDate: null }), task({ id: 'z', dueDate: '9999-12-31' })]
  expect(queryTasks(tasks, {}, 'dueDate').map(item => item.id)).toEqual(['z', 'a'])
  expect(queryTasks(tasks, {}, 'priority').map(item => item.id)).toEqual(['z', 'a'])
})
