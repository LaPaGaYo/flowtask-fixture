import type { Context } from '../services/context.js'
import type { Result } from '../domain/result.js'
export interface RouteInput { ctx: Context; params: string[]; body: unknown; url: URL }
export interface Route { method: string; pattern: RegExp; status?: number; handle(input: RouteInput): Promise<Result<unknown>> }
export interface Response { status: number; body: unknown }
