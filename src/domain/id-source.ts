export interface IdSource { next(existing: readonly string[]): string }
export function sequentialIds(): IdSource {
  return { next(existing) {
    const maximum = existing.reduce((max, id) => /^id-\d+$/.test(id) ? (BigInt(id.slice(3)) > max ? BigInt(id.slice(3)) : max) : max, 0n)
    return `id-${String(maximum + 1n).padStart(6, '0')}`
  } }
}
