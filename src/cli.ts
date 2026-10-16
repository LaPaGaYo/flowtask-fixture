#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { createContext } from './services/runtime.js'
import { runCli } from './cli/run.js'
import { launchServer } from './cli/launch-server.js'
const result = await runCli(process.argv.slice(2), { context: createContext, read: path => readFile(path, 'utf8'), serve: launchServer })
process.stdout.write(result.stdout)
process.stderr.write(result.stderr)
process.exitCode = result.exitCode
