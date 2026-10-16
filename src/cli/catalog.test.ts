import { expect, test } from 'vitest'
import { runner, output } from './test-helpers/runner.js'
test('tag and view commands, reports, transfer and serve dispatch correctly', async () => {
  const { run } = runner()
  const tag = output((await run(['tag', 'add', '--name', 'urgent', '--json'])).stdout)
  expect((await run(['tag', 'list'])).stdout).toContain('urgent')
  expect((await run(['tag', 'rm', String(tag.id)])).exitCode).toBe(0)
  const view = output((await run(['view', 'save', '--name', 'Ready', '--filter', '{"ready":true}', '--json'])).stdout)
  expect((await run(['view', 'list'])).stdout).toContain('Ready')
  expect((await run(['view', 'run', String(view.id), '--json'])).stdout).toBe('[]\n')
  expect((await run(['report', 'counts', '--json'])).stdout).toContain('"todo":0')
  expect((await run(['export', '--format', 'csv'])).stdout).toContain('kind,payload')
  expect((await run(['import', '--file', 'fixture.json', '--json'])).exitCode).toBe(3)
  expect((await run(['serve', '--port', '0', '--json'])).exitCode).toBe(0)
})

test('JSON export is a snapshot object even with the global JSON flag', async () => {
  const { run } = runner()
  const exported = await run(['export', '--json'])
  expect(output(exported.stdout)).toMatchObject({ version: 1, projects: [], tasks: [] })
})

test('stdio serving never appends human output to the HTTP stream', async () => {
  const { run } = runner()
  expect(await run(['serve', '--stdio'])).toEqual({ exitCode: 0, stdout: '', stderr: '' })
})
