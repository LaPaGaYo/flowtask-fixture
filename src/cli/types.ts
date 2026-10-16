import type { Context } from '../services/context.js'
import type { Result } from '../domain/result.js'
export type Options = Record<string, string | boolean | undefined>
export interface ServerOptions { data: string; now: string; port: number; stdio: boolean }
export interface CliDependencies {
  context(path: string, now: string): Result<Context>
  read(path: string): Promise<string>
  serve(options: ServerOptions): Promise<Result<unknown>>
}
export interface CommandInput {
  ctx: Context
  args: string[]
  options: Options
  read: CliDependencies['read']
  serve: CliDependencies['serve']
}
export type Command = (input: CommandInput) => Promise<Result<unknown>>
export interface CommandSpec { command: Command; arguments: number; options: string[] }
