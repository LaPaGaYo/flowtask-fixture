import { expect, test } from 'vitest'
import { parseCsvRows, quoteCsvCell } from './csv-rows.js'

test.each([
  ['', []], ['\n', [['']]], [',', [['', '']]], ['""', [['']]],
  ['a,b\r\nc,d\r\ne,f\r', [['a', 'b'], ['c', 'd'], ['e', 'f']]],
  ['"a,b","line\nbreak","say ""hi"""', [['a,b', 'line\nbreak', 'say "hi"']]]
])('parseCsvRows parses empty cells and CSV delimiters: %j', (input, rows) => {
  expect(parseCsvRows(input as string)).toEqual({ ok: true, value: rows })
})

test.each(['"unclosed', 'a"b', '"closed"x', '"closed" "again"'])('parseCsvRows rejects malformed quotes: %s', input => {
  expect(parseCsvRows(input)).toMatchObject({ ok: false, error: { code: 'validation' } })
})

test.each([['', '""'], ['plain', '"plain"'], ['a,b\r\nc', '"a,b\r\nc"'], ['say "hi"', '"say ""hi"""']])(
  'quoteCsvCell escapes a complete cell: %j', (input, quoted) => {
    expect(quoteCsvCell(input)).toBe(quoted)
    expect(parseCsvRows(quoteCsvCell(input))).toEqual({ ok: true, value: [[input]] })
  })
