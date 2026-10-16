#!/usr/bin/env node
import { startServer } from './api/start.js'
const result = await startServer(process.argv.slice(2))
if (!result.ok) {
  process.stderr.write(`${JSON.stringify({ error: result.error })}\n`)
  process.exitCode = result.error.code === 'usage' ? 2 : result.error.code === 'storage' ? 4 : 3
} else {
  const { server, stdio, close } = result.value
  const address = server.address()
  const ready = stdio ? { listening: true, transport: 'stdio' }
    : { listening: true, host: '127.0.0.1', port: typeof address === 'object' && address ? address.port : 0 }
  const output = stdio ? process.stderr : process.stdout
  output.write(`${JSON.stringify(ready)}\n`)
  process.once('SIGINT', close)
  process.once('SIGTERM', close)
}
