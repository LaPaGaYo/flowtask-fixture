export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
export const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
export const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(nonempty)
