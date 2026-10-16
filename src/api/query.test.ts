import { expect, test } from 'vitest'
import { taskQuery, rangeQuery } from './query.js'

test('taskQuery defaults to empty filters and priority sorting', () => {
  expect(taskQuery(new URL('http://localhost/tasks'))).toEqual({ ok: true, value: { filter: {}, sort: 'priority' } })
  expect(taskQuery(new URL('http://localhost/tasks?projectId=p1&status=doing&tag=a%20b&ready=true&sort=due')))
    .toEqual({ ok: true, value: { filter: { projectId: 'p1', status: 'doing', tag: 'a b', ready: true }, sort: 'due' } })
  expect(taskQuery(new URL('http://localhost/tasks?ready=false&tag=&sort=')))
    .toEqual({ ok: true, value: { filter: { ready: false, tag: '' }, sort: '' } })
})

test.each(['?ready=', '?ready=1', '?ready=True', '?dueDate=null', '?unknown='])('taskQuery rejects invalid query fields: %s', query => {
  expect(taskQuery(new URL(`http://localhost/tasks${query}`))).toMatchObject({ ok: false, error: { code: 'validation' } })
})

test('rangeQuery preserves text for service validation and uses the last repeated parameter', () => {
  expect(rangeQuery(new URL('http://localhost/activity'))).toEqual({})
  expect(rangeQuery(new URL('http://localhost/activity?from=&to=9999-12-31&entityId=a%20b')))
    .toEqual({ from: '', to: '9999-12-31', entityId: 'a b' })
  expect(rangeQuery(new URL('http://localhost/activity?from=invalid&from=2024-01-01&unknown=x')))
    .toEqual({ from: '2024-01-01', unknown: 'x' })
})
