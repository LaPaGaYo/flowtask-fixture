import { expect, test } from 'vitest'
import { taskFields, filterFields, rangeFields } from './fields.js'

test('taskFields translates flags and preserves the null and maximum date boundaries', () => {
  expect(taskFields({})).toEqual({ ok: true, value: {} })
  expect(taskFields({ project: 'p1', title: 'Task', description: '', status: 'doing', priority: 'p1',
    due: '9999-12-31', tags: 'a,b', 'blocked-by': 't1,t2', recurrence: '{"kind":"daily"}', json: true }))
    .toEqual({ ok: true, value: { projectId: 'p1', title: 'Task', description: '', status: 'doing', priority: 'p1',
      dueDate: '9999-12-31', tags: ['a', 'b'], blockedBy: ['t1', 't2'], recurrence: { kind: 'daily' } } })
  expect(taskFields({ due: 'null', tags: '', 'blocked-by': '', recurrence: 'null' }))
    .toEqual({ ok: true, value: { dueDate: null, tags: [], blockedBy: [], recurrence: null } })
  expect(taskFields({ recurrence: '{' })).toEqual({ ok: false, error: { code: 'usage', message: 'Recurrence must be JSON' } })
})

test('filterFields defaults to empty filters and gives explicit JSON precedence', () => {
  expect(filterFields({})).toEqual({ ok: true, value: {} })
  expect(filterFields({ project: 'p1', status: 'todo', ready: false, title: 'ignored' }))
    .toEqual({ ok: true, value: { projectId: 'p1', status: 'todo', ready: false } })
  expect(filterFields({ filter: '{"tag":"a"}', project: 'ignored' })).toEqual({ ok: true, value: { tag: 'a' } })
  expect(filterFields({ filter: 'null' })).toEqual({ ok: true, value: null })
  expect(filterFields({ filter: '' })).toEqual({ ok: false, error: { code: 'usage', message: 'Filter must be JSON' } })
})

test('rangeFields picks only present range fields and leaves validation to the service', () => {
  expect(rangeFields({})).toEqual({})
  expect(rangeFields({ from: undefined, to: '9999-12-31', entity: 'ignored' })).toEqual({ to: '9999-12-31' })
  expect(rangeFields({ from: '', to: 'invalid' })).toEqual({ from: '', to: 'invalid' })
})
