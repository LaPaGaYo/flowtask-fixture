import { expect, test } from 'vitest'
import { readdirSync } from 'node:fs'
import { command as exportCommand } from './export.js'
import { command as importCommand } from './import.js'
import { command as init } from './init.js'
import { command as projectAdd } from './project-add.js'
import { command as projectArchive } from './project-archive.js'
import { command as projectList } from './project-list.js'
import { command as report } from './report.js'
import { command as serve } from './serve.js'
import { command as tagAdd } from './tag-add.js'
import { command as tagList } from './tag-list.js'
import { command as tagRm } from './tag-rm.js'
import { command as taskAdd } from './task-add.js'
import { command as taskBlock } from './task-block.js'
import { command as taskCancel } from './task-cancel.js'
import { command as taskDone } from './task-done.js'
import { command as taskList } from './task-list.js'
import { command as taskShow } from './task-show.js'
import { command as taskUnblock } from './task-unblock.js'
import { command as taskUpdate } from './task-update.js'
import { command as viewList } from './view-list.js'
import { command as viewRun } from './view-run.js'
import { command as viewSave } from './view-save.js'
import { commands } from '../commands.js'
import type { Command, Options, ServerOptions } from '../types.js'
import { context } from '../../services/test-helpers/context.js'
import { MemoryRepository } from '../../storage/memory-repository.js'
import { emptySnapshot } from '../../storage/snapshot.js'
import { encode } from '../../storage/codec.js'
import { task } from '../../domain/test-helpers/fixtures.js'
import { ok } from '../../domain/result.js'

function initialState() {
  return { ...emptySnapshot(),
    projects: [{ id: 'p1', name: 'Work', archived: false }, { id: 'p2', name: 'Empty', archived: false }],
    tasks: [task({ blockedBy: ['t2'] }), task({ id: 't2', status: 'done' }), task({ id: 't3' })],
    tags: [{ id: 'g1', name: 'urgent' }],
    views: [{ id: 'v1', name: 'All', filter: {}, sort: 'priority' as const }]
  }
}

const catalog: [string, Command, string[], Options, unknown][] = [
  ['export', exportCommand, [], {}, encode(initialState())],
  ['import', importCommand, [], { file: 'fixture.json' }, { projects: 0, tasks: 0, tags: 0, views: 0 }],
  ['init', init, [], {}, initialState()],
  ['project-add', projectAdd, [], { name: 'New' }, { id: 'id-000001', name: 'New', archived: false }],
  ['project-archive', projectArchive, ['p2'], {}, { id: 'p2', archived: true }],
  ['project-list', projectList, [], {}, initialState().projects],
  ['report', report, ['counts'], {}, { todo: 2, doing: 0, done: 1, canceled: 0 }],
  ['serve', serve, [], { data: 'store.json', port: '0', stdio: true }, 'Server stopped'],
  ['tag-add', tagAdd, [], { name: 'later' }, { name: 'later' }],
  ['tag-list', tagList, [], {}, initialState().tags],
  ['tag-rm', tagRm, ['g1'], {}, { id: 'g1', name: 'urgent' }],
  ['task-add', taskAdd, [], { project: 'p1', title: 'New', due: 'null' }, { projectId: 'p1', title: 'New', dueDate: null }],
  ['task-block', taskBlock, ['t1', 't3'], {}, { id: 't1', blockedBy: ['t2', 't3'] }],
  ['task-cancel', taskCancel, ['t1'], {}, { id: 't1', status: 'canceled' }],
  ['task-done', taskDone, ['t1'], {}, { task: { id: 't1', status: 'done' }, nextTask: null }],
  ['task-list', taskList, [], { status: 'todo' }, [task({ blockedBy: ['t2'] }), task({ id: 't3' })]],
  ['task-show', taskShow, ['t1'], {}, task({ blockedBy: ['t2'] })],
  ['task-unblock', taskUnblock, ['t1', 't2'], {}, { id: 't1', blockedBy: [] }],
  ['task-update', taskUpdate, ['t1'], { title: 'Edited', due: '9999-12-31' }, { id: 't1', title: 'Edited', dueDate: '9999-12-31' }],
  ['view-list', viewList, [], {}, initialState().views],
  ['view-run', viewRun, ['v1'], {}, initialState().tasks],
  ['view-save', viewSave, [], { name: 'Ready', filter: '{"ready":true}', sort: 'title' }, { name: 'Ready', filter: { ready: true }, sort: 'title' }]
]

test.each(catalog)('command %s dispatches directly against a MemoryRepository', async (name, command, args, options, expected) => {
  const ctx = { ...context(), repository: new MemoryRepository(initialState()) }
  const reads: string[] = []
  const starts: ServerOptions[] = []
  const result = await command({ ctx, args, options,
    read: path => { reads.push(path); return Promise.resolve(encode(emptySnapshot())) },
    serve: settings => { starts.push(settings); return Promise.resolve(ok('Server stopped')) }
  })
  expect(result).toMatchObject({ ok: true, value: expected })
  expect(reads).toEqual(name === 'import' ? ['fixture.json'] : [])
  expect(starts).toEqual(name === 'serve' ? [{ data: 'store.json', now: ctx.clock.now(), port: 0, stdio: true }] : [])
})

test('command catalog covers every module once and matches the command registry', () => {
  const files = readdirSync(new URL('.', import.meta.url)).filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts')).toSorted()
  expect(catalog.map(([name]) => `${name}.ts`).toSorted()).toEqual(files)
  expect(Object.keys(commands()).toSorted()).toEqual(catalog.map(([name]) => name.replace('-', ' ')).toSorted())
  for (const [name, command, args] of catalog) {
    const registered = commands()[name.replace('-', ' ')]
    expect(registered?.command).toBe(command)
    expect(registered?.arguments).toBe(args.length)
  }
})
