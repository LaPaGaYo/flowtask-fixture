import type { Snapshot } from '../../storage/snapshot.js'
import { addDays } from '../../domain/date.js'
export function completions(state: Snapshot, from: string, to: string): { date: string; count: number }[] {
  const perDay = new Map<string, number>()
  for (const event of state.activity) {
    if (event.action === 'task.completed') {
      const day = event.at.slice(0, 10)
      perDay.set(day, (perDay.get(day) ?? 0) + 1)
    }
  }
  const rows = []
  const days = (Date.parse(to) - Date.parse(from)) / 86_400_000
  for (let offset = 0; offset <= days; offset += 1) {
    const date = addDays(from, offset)
    rows.push({ date, count: perDay.get(date) ?? 0 })
  }
  return rows
}
