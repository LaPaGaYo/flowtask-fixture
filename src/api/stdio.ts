import { Duplex, type Readable, type Writable } from 'node:stream'
import type { Server } from 'node:http'
// Run the same HTTP parser over local process pipes, without opening a network listener.
export function attachStdio(server: Server, input: Readable, output: Writable): Duplex {
  const connection = Duplex.from({ readable: input, writable: output })
  server.emit('connection', connection)
  return connection
}
