import { afterAll, beforeAll, expect, test } from 'vitest'
import { readFile, writeFile } from 'node:fs/promises'
import { workspace } from '../helpers/workspace.js'
import { server } from '../helpers/server.js'
import { cli, parse } from '../helpers/cli.js'
let work: Awaited<ReturnType<typeof workspace>>
let app: Awaited<ReturnType<typeof server>>
beforeAll(async () => {
  work = await workspace('transfer')
  await writeFile(work.data, JSON.stringify({ version: 0, projects: [{ id: 'old', name: 'Legacy', archived: false }], tasks: [] }))
  app = await server(work.data)
})
afterAll(async () => { if (app) expect((await app.stop()).code).toBe(0); await work.cleanup() })
test('built executables migrate v0 and atomically persist v1', async () => {
  expect((await app.request('/projects')).body).toMatchObject([{ name: 'Legacy' }])
  expect((await cli(work.data, ['init'])).code).toBe(0)
  expect(parse(await readFile(work.data, 'utf8'))).toMatchObject({ version: 1, views: [], activity: [] })
})
test.each(['json', 'csv'])('%s roundtrips between CLI exports and HTTP imports', async format => {
  const output = (await cli(work.data, ['export', '--format', format])).stdout
  const snapshot = format === 'json' ? output : parse<string>(output)
  expect((await app.request('/import', 'POST', { format, content: snapshot })).status).toBe(200)
  const exported = await app.request(`/export?format=${format}`)
  const path = `${work.directory}/transfer.${format}`
  await writeFile(path, String(exported.body.content))
  expect((await cli(work.data, ['import', '--format', format, '--file', path])).code).toBe(0)
  expect((await app.request('/projects')).body).toMatchObject([{ name: 'Legacy' }])
  const before = await readFile(work.data, 'utf8')
  expect((await app.request('/import', 'POST', { content: '{' })).status).toBe(400)
  expect(await readFile(work.data, 'utf8')).toBe(before)
})
