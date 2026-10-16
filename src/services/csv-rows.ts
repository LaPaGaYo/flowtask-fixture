import { fail, ok, type Result } from '../domain/result.js'
export function parseCsvRows(text: string): Result<string[][]> {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  let closed = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') { cell += '"'; index += 1 }
        else { quoted = false; closed = true }
      } else cell += char
    } else if (char === ',' || char === '\n' || char === '\r') {
      row.push(cell); cell = ''; closed = false
      if (char !== ',') {
        if (char === '\r' && text[index + 1] === '\n') index += 1
        rows.push(row); row = []
      }
    } else if (char === '"' && cell === '' && !closed) quoted = true
    else {
      if (closed || char === '"') return fail('validation', 'Invalid CSV quoting')
      cell += char
    }
  }
  if (quoted) return fail('validation', 'Unterminated CSV quote')
  if (cell !== '' || row.length > 0 || closed) { row.push(cell); rows.push(row) }
  return ok(rows)
}
export const quoteCsvCell = (value: string): string => `"${value.replaceAll('"', '""')}"`
