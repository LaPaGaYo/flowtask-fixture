import { expect, test } from 'vitest'
import { parseArguments } from './parse.js'

test.each([
  [[], '', [], {}],
  [['task', 'show', 't1', '--json'], 'task show', ['t1'], { json: true }],
  [['--data', 'store.json', 'report', 'counts'], 'report', ['counts'], { data: 'store.json' }],
  [['task', 'add', '--title=Two words', '--now', '2024-01-01T00:00:00Z'], 'task add', [], { title: 'Two words', now: '2024-01-01T00:00:00Z' }],
  [['task', 'show', '--', '--id'], 'task show', ['--id'], {}]
] as const)('parseArguments separates command, arguments and flags: %j', (input, key, args, options) => {
  expect(parseArguments([...input])).toEqual({ ok: true, value: { key, args, options } })
})

test.each([['--unknown'], ['--data'], ['--json=true'], ['task', 'add', '--title', '--json']].map(args => ({ args })))(
  'parseArguments returns usage errors for malformed flags: $args', ({ args }) => {
    expect(parseArguments(args)).toEqual({ ok: false, error: { code: 'usage', message: 'Invalid arguments; use --help' } })
  })
