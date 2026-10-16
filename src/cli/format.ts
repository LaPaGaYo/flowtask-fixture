import { isRecord } from '../domain/guards.js'
export function formatOutput(value: unknown, json: boolean): string {
  if (json) return `${JSON.stringify(value)}\n`
  if (typeof value === 'string') return value.endsWith('\n') ? value : `${value}\n`
  const rows = Array.isArray(value) ? value : [value]
  if (rows.length === 0) return '(empty)\n'
  const objects = rows.map((row: unknown) => isRecord(row) ? row : { value: row })
  const columns = [...new Set(objects.flatMap(row => Object.keys(row)))]
  const cells = objects.map(row => columns.map(column => {
    const item = row[column]
    return (typeof item === 'string' ? item : JSON.stringify(item) ?? '').replaceAll('\n', '\\n').replaceAll('\r', '\\r')
  }))
  const widths = columns.map((column, index) => Math.max(column.length, ...cells.map(row => row[index]?.length ?? 0)))
  return `${[columns, ...cells].map(row => row.map((cell, index) => cell.padEnd(widths[index] ?? 0)).join('  ').trimEnd()).join('\n')}\n`
}
