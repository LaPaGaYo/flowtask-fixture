import { expect, test } from 'vitest'
import { createEntity, updateEntity, deleteEntity } from './entity-commands.js'
import { context, value } from './test-helpers/context.js'
import { parseProject } from '../domain/validate-entities.js'
import type { Snapshot } from '../storage/snapshot.js'

const projects = (state: Snapshot) => state.projects

test('createEntity applies defaults, allocates an ID and records the committed entity', async () => {
  const ctx = context()
  const created = value(await createEntity(ctx, { name: ' Work ' }, ['name'], parseProject, projects, 'project.created', { archived: false }))
  expect(created).toEqual({ id: 'id-000001', name: 'Work', archived: false })
  expect(value(await ctx.repository.read())).toMatchObject({ projects: [created], activity: [
    { id: 'id-000002', entityId: created.id, action: 'project.created', at: ctx.clock.now() }
  ] })
})

test.each([[null, 'validation'], [{ id: 'forged' }, 'validation'],
  [{ name: '' }, 'validation'], [{ name: 'Work' }, 'conflict']] as const)(
  'createEntity rejects %j without recording', async (input, code) => {
  const ctx = context()
  value(await createEntity(ctx, { name: 'Work' }, ['name'], parseProject, projects, 'project.created', { archived: false }))
  const before = await ctx.repository.read()
  expect(await createEntity(ctx, input, ['name'], parseProject, projects, 'project.created', { archived: false }))
    .toMatchObject({ ok: false, error: { code } })
  expect(await ctx.repository.read()).toEqual(before)
})

test('updateEntity merges allowed fields while retaining identity and appending an event', async () => {
  const ctx = context()
  const created = value(await createEntity(ctx, { name: 'Work' }, ['name'], parseProject, projects, 'project.created', { archived: false }))
  const updated = value(await updateEntity(ctx, created.id, { name: ' Home ' }, ['name'], parseProject, projects, 'project.updated'))
  expect(updated).toEqual({ ...created, name: 'Home' })
  const state = value(await ctx.repository.read())
  expect(state.projects).toEqual([updated])
  expect(state.activity.map(event => event.action)).toEqual(['project.created', 'project.updated'])
  expect(state.activity[1]).toMatchObject({ entityId: created.id, at: ctx.clock.now() })
})

test.each([['missing', {}, 'not_found'], ['id-000001', { name: '' }, 'validation'],
  ['id-000001', { id: 'forged' }, 'validation'], ['id-000001', null, 'validation']] as const)(
  'updateEntity rejects %s with %j without recording', async (id, input, code) => {
  const ctx = context()
  value(await createEntity(ctx, { name: 'Work' }, ['name'], parseProject, projects, 'project.created', { archived: false }))
  const before = await ctx.repository.read()
  expect(await updateEntity(ctx, id, input, ['name'], parseProject, projects, 'project.updated'))
    .toMatchObject({ ok: false, error: { code } })
  expect(await ctx.repository.read()).toEqual(before)
})

test('deleteEntity returns the deleted item, records once, and rejects a repeated deletion', async () => {
  const ctx = context()
  const created = value(await createEntity(ctx, { name: 'Work' }, ['name'], parseProject, projects, 'project.created', { archived: false }))
  expect(await deleteEntity(ctx, created.id, projects, 'project.deleted')).toEqual({ ok: true, value: created })
  const before = await ctx.repository.read()
  expect(value(before)).toMatchObject({ projects: [], activity: [
    { action: 'project.created' }, { entityId: created.id, action: 'project.deleted', at: ctx.clock.now() }
  ] })
  expect(await deleteEntity(ctx, created.id, projects, 'project.deleted'))
    .toEqual({ ok: false, error: { code: 'not_found', message: 'Entity does not exist' } })
  expect(await ctx.repository.read()).toEqual(before)
})
