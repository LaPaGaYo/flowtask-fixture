import { expect, test } from 'vitest'
import { readdirSync } from 'node:fs'
import { route as activity } from './activity.js'
import { route as exportRoute } from './export.js'
import { route as health } from './health.js'
import { route as importRoute } from './import.js'
import { route as projectCreate } from './project-create.js'
import { route as projectDelete } from './project-delete.js'
import { route as projectGet } from './project-get.js'
import { route as projectList } from './project-list.js'
import { route as projectUpdate } from './project-update.js'
import { route as report } from './report.js'
import { route as tagCreate } from './tag-create.js'
import { route as tagDelete } from './tag-delete.js'
import { route as tagGet } from './tag-get.js'
import { route as tagList } from './tag-list.js'
import { route as tagUpdate } from './tag-update.js'
import { route as taskBlock } from './task-block.js'
import { route as taskCancel } from './task-cancel.js'
import { route as taskCreate } from './task-create.js'
import { route as taskDelete } from './task-delete.js'
import { route as taskDone } from './task-done.js'
import { route as taskGet } from './task-get.js'
import { route as taskList } from './task-list.js'
import { route as taskUnblock } from './task-unblock.js'
import { route as taskUpdate } from './task-update.js'
import { route as viewCreate } from './view-create.js'
import { route as viewDelete } from './view-delete.js'
import { route as viewGet } from './view-get.js'
import { route as viewList } from './view-list.js'
import { route as viewRun } from './view-run.js'
import { route as viewUpdate } from './view-update.js'
import { routes } from '../routes.js'
import type { Route } from '../types.js'

const catalog: [string, Route, string, string, number][] = [
  ['activity', activity, 'GET', '/activity', 200],
  ['export', exportRoute, 'GET', '/export', 200],
  ['health', health, 'GET', '/health', 200],
  ['import', importRoute, 'POST', '/import', 200],
  ['project-create', projectCreate, 'POST', '/projects', 201],
  ['project-delete', projectDelete, 'DELETE', '/projects/id-1', 200],
  ['project-get', projectGet, 'GET', '/projects/id-1', 200],
  ['project-list', projectList, 'GET', '/projects', 200],
  ['project-update', projectUpdate, 'PATCH', '/projects/id-1', 200],
  ['report', report, 'GET', '/reports/counts', 200],
  ['tag-create', tagCreate, 'POST', '/tags', 201],
  ['tag-delete', tagDelete, 'DELETE', '/tags/id-1', 200],
  ['tag-get', tagGet, 'GET', '/tags/id-1', 200],
  ['tag-list', tagList, 'GET', '/tags', 200],
  ['tag-update', tagUpdate, 'PATCH', '/tags/id-1', 200],
  ['task-block', taskBlock, 'POST', '/tasks/id-1/block', 200],
  ['task-cancel', taskCancel, 'POST', '/tasks/id-1/cancel', 200],
  ['task-create', taskCreate, 'POST', '/tasks', 201],
  ['task-delete', taskDelete, 'DELETE', '/tasks/id-1', 200],
  ['task-done', taskDone, 'POST', '/tasks/id-1/done', 200],
  ['task-get', taskGet, 'GET', '/tasks/id-1', 200],
  ['task-list', taskList, 'GET', '/tasks', 200],
  ['task-unblock', taskUnblock, 'POST', '/tasks/id-1/unblock', 200],
  ['task-update', taskUpdate, 'PATCH', '/tasks/id-1', 200],
  ['view-create', viewCreate, 'POST', '/views', 201],
  ['view-delete', viewDelete, 'DELETE', '/views/id-1', 200],
  ['view-get', viewGet, 'GET', '/views/id-1', 200],
  ['view-list', viewList, 'GET', '/views', 200],
  ['view-run', viewRun, 'GET', '/views/id-1/run', 200],
  ['view-update', viewUpdate, 'PATCH', '/views/id-1', 200]
]

test.each(catalog)('route %s pins its method, complete path, captures and status', (_file, route, method, path, status) => {
  expect(route.method).toBe(method)
  expect(route.status ?? 200).toBe(status)
  expect(route.pattern.exec(path)?.slice(1)).toEqual(path.includes('id-1') ? ['id-1'] : path === '/reports/counts' ? ['counts'] : [])
  for (const invalid of ['', `/prefix${path}`, `${path}/extra`, `${path}/`]) expect(route.pattern.test(invalid)).toBe(false)
})

test('route catalog includes every module exactly once and matches the dispatch registry', () => {
  const files = readdirSync(new URL('.', import.meta.url)).filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts')).toSorted()
  expect(catalog.map(([file]) => `${file}.ts`).toSorted()).toEqual(files)
  const registered = routes()
  expect(registered).toHaveLength(catalog.length)
  expect(new Set(registered).size).toBe(catalog.length)
  for (const [, route] of catalog) expect(registered).toContain(route)
})
