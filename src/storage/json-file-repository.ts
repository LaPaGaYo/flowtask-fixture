import { mkdir, open, readFile, rename, rm } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fail, ok, type Result } from '../domain/result.js'
import { isRecord } from '../domain/guards.js'
import { emptySnapshot, type Snapshot } from './snapshot.js'
import { encode, decode } from './codec.js'
import type { Repository } from './repository.js'
import { validateTransition } from './transition.js'
export class JsonFileRepository implements Repository {
  private queue: Promise<void> = Promise.resolve()
  constructor(private readonly path: string) {}
  async read(): Promise<Result<Snapshot>> {
    try {
      const result = decode(await readFile(this.path, 'utf8'))
      return result.ok ? result : fail('storage', `Invalid data file: ${result.error.message}`)
    } catch (error) {
      return isRecord(error) && error.code === 'ENOENT' ? ok(emptySnapshot()) : fail('storage', 'Cannot read data file')
    }
  }
  transact<T>(change: (state: Snapshot) => Result<T>): Promise<Result<T>> {
    const pending = this.queue.then(() => this.commit(change))
    this.queue = pending.then(() => undefined, () => undefined)
    return pending
  }
  private async commit<T>(change: (state: Snapshot) => Result<T>): Promise<Result<T>> {
    try { await mkdir(dirname(this.path), { recursive: true }) }
    catch { return fail('storage', 'Cannot create data directory') }
    const lock = await open(`${this.path}.lock`, 'wx').catch(() => null)
    if (!lock) return fail('storage', 'Data file is locked or not writable')
    try {
      const current = await this.read()
      if (!current.ok) return current
      const draft = structuredClone(current.value)
      const result = change(draft)
      if (!result.ok) return result
      const valid = validateTransition(current.value, draft)
      if (!valid.ok) return valid
      const bytes = encode(valid.value)
      const temporary = await open(`${this.path}.tmp`, 'w')
      try { await temporary.writeFile(bytes, 'utf8'); await temporary.sync() }
      finally { await temporary.close() }
      if (await readFile(`${this.path}.tmp`, 'utf8') !== bytes) return fail('storage', 'Data verification failed')
      await rename(`${this.path}.tmp`, this.path)
      return structuredClone(result)
    } catch { return fail('storage', 'Cannot write data file') }
    finally {
      await rm(`${this.path}.tmp`, { force: true }).catch(() => undefined)
      await lock.close()
      await rm(`${this.path}.lock`, { force: true })
    }
  }
}
