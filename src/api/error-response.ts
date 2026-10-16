import type { AppError } from '../domain/result.js'
import type { Response } from './types.js'
export function errorResponse(error: AppError): Response {
  const statuses = { validation: 400, usage: 400, not_found: 404, conflict: 409, blocked: 409, cycle: 409, storage: 500 }
  return { status: statuses[error.code], body: { error } }
}
