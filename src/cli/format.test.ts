import { expect, test } from 'vitest'
import { formatOutput } from './format.js'
test('plain tables and JSON handle empty and nested values without ANSI codes', () => {
  expect(formatOutput([], false)).toBe('(empty)\n')
  expect(formatOutput([{ id: '1', title: 'two\nlines', tags: ['a'] }], false)).toContain('two\\nlines')
  expect(formatOutput({ ok: true }, true)).toBe('{"ok":true}\n')
  expect(formatOutput('text', false)).toBe('text\n')
})
