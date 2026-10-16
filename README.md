# FlowTask

FlowTask is a single-user, local project and task manager. It is the **frozen
Controlled Acceptance Fixture for Axiom**, a goal-driven autonomous software
engineering control plane. This repository is deliberately small, explicit, and
predictable: TypeScript, Node built-ins, a JSON file, a CLI, and an HTTP API.
It has no application framework or runtime dependencies. License: MIT.

Use Node 22 (`.nvmrc`) and pnpm 10 (the exact version is in `packageManager`).
Dependencies and the lockfile are frozen; the acceptance environment supplies
`node_modules`. Do not install, update, or add packages.

```sh
nvm use
pnpm run verify:fast
pnpm run verify:full
```

| Command | Checks |
| --- | --- |
| `typecheck` | Strict TypeScript, without emitting files |
| `lint` | oxlint over source and tests |
| `test:unit` | Colocated `src/**/*.test.ts` tests |
| `build` | TypeScript to `dist/`, excluding tests |
| `test:integration` | Built CLI and HTTP server in child processes |
| `verify:fast` | typecheck + lint + unit tests |
| `verify:full` | verify:fast + build + integration tests |

Checks require no network, random values, or ambient clock. Integration tests
send real HTTP through child-process pipes, reuse one server per file, and use
fixed temporary directories with cleanup. Run verification invocations
sequentially. The reporter omits durations and timestamps, so successive fast
verification logs are byte-identical. Measure elapsed time externally with
`time pnpm run verify:fast` or `time pnpm run verify:full`.

After building, try:

```sh
node dist/cli.js init
node dist/cli.js project add --name Work --json
node dist/cli.js task add --project id-000001 --title 'Write acceptance notes'
node dist/cli.js task list --ready
node dist/cli.js report counts --json
node dist/cli.js export > backup.json
```

The `flowtask` binary entry points to `dist/cli.js`; direct Node invocation works
without installing a global link. Default storage is `.flowtask-data/store.json`.
Pass `--data <file>` to select another store.

Time is explicitly controlled. The default clock is fixed at
`2000-01-01T00:00:00.000Z`; use `--now <ISO UTC timestamp>` for meaningful dates.
The HTTP header `X-FlowTask-Now` overrides the clock for one request. IDs advance
from persisted data, including activity, without randomness.

For a local TCP demo outside a listener-restricted sandbox:

```sh
node dist/server.js --data .flowtask-data/store.json --now 2024-01-08T12:00:00Z --port 3000
```

`node dist/cli.js serve` offers the same server. Both support `--stdio` for HTTP
on process pipes without a listener. See [CLI](docs/CLI.md), [API](docs/API.md),
[architecture](docs/ARCHITECTURE.md), and [delivery evidence](REPORT-FT-01.md).
