import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
export async function workspace(name: string) {
  const directory = join(tmpdir(), `flowtask-integration-${name}`)
  await rm(directory, { recursive: true, force: true })
  await mkdir(directory, { recursive: true })
  return { directory, data: join(directory, 'store.json'), cleanup: () => rm(directory, { recursive: true, force: true }) }
}
