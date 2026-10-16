export type ErrorCode = 'validation' | 'not_found' | 'conflict' | 'blocked' | 'cycle' | 'storage' | 'usage'
export interface AppError { code: ErrorCode; message: string }
export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError }
export const ok = <T>(value: T): Result<T> => ({ ok: true, value })
export const fail = (code: ErrorCode, message: string): Result<never> => ({ ok: false, error: { code, message } })
