import { ok } from '../domain/result.js'
import type { Context } from './context.js'
export const initialize = (ctx: Context) => ctx.repository.transact(state => ok(state))
