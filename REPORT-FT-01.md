# REPORT-FT-01 — FlowTask, attempt 2

The direct-test coverage gate is addressed. **`verify:full` is green: 214 unit
tests plus 17 integration tests, 231 total, in 61 test files.** Expected after
launcher commit: **219 tracked files / 61 test files**. No application behavior
changed, and no implementation or verification work remains unfinished.

## Summary

FlowTask remains Axiom's frozen acceptance fixture for projects, tasks, tags,
recurrence, dependencies, saved views, activity, import/export, five reports,
22 CLI commands and 30 HTTP routes. Attempt 2 adds direct contract tests for
all 28 names identified in the verifier review, including every individual
route and command module. Existing tests remain intact.

Tests cover successful results, typed errors, transactional rollback, empty
inputs, malformed CSV and JSON, request-size limits, injected clocks and IDs,
append-only activity, null due dates and the 9999-12-31 boundary. Catalog tests
compare their directly imported modules with both the filesystem and dispatch
registries. Exported server functions are called directly over in-memory pipes
or from built-module imports inside child processes, with readiness, HTTP
responses, signal forwarding, listener cleanup and shutdown assertions.

The third test in `src/checks/contracts.test.ts` collects exported function,
const and class names from production source and requires a word-boundary
reference in a source or integration test. A negative control temporarily
removed `csv-rows.test.ts`: the guard failed and named `parseCsvRows` and
`quoteCsvCell`. Restoring the file made all three contract checks pass.

Production modules, dependencies, scripts, lockfile and configuration are
unchanged from the accepted attempt-1 candidate. No commit, push, staging,
branch or Git metadata mutation was performed.

## Module map

| Location | Files / test files | Responsibility |
| --- | --- | --- |
| `src/domain` | 26 / 9 | Entities, typed errors, dates, recurrence, queries, dependencies |
| `src/storage` | 14 / 6 | Schema, migration, codec, transactions and repositories |
| `src/services` | 59 / 18 | Lifecycle operations, views, activity, CSV/JSON, reports |
| `src/cli` | 39 / 8 | Parsing, field conversion, commands, output, server launcher |
| `src/api` | 51 / 11 | Routes, query/body parsing, errors, HTTP and stdio transport |
| `src/checks` | 2 / 2 | Architecture, size, export-test gate and reporter verification |
| `tests/helpers` | 5 / 0 | Temp directories, built processes, HTTP client, reporter |
| `tests/integration` | 7 / 7 | CLI/API, transfers, failures, direct server exports, shutdown |

Root `src/cli.ts` and `src/server.ts` still build to `dist/cli.js` and
`dist/server.js`. Existing README, CLI, API and architecture docs remain accurate.

## Verification evidence

Environment: **Node v22.23.3 / pnpm 10.34.7**, using the preinstalled Node 22 bin
path `/Users/henry/.nvm/versions/node/v22.23.3/bin`. Checks used only installed
dependencies, injected clocks and deterministic IDs, without network or sleeps.

Final measurements used `/usr/bin/time -p` with elapsed-time output captured
separately from each command's combined stdout/stderr:

| Command | Wall clock | Result |
| --- | --- | --- |
| `time pnpm run verify:fast` — first | **2.72 s** | pass |
| `time pnpm run verify:fast` — second | **2.52 s** | pass |
| `time pnpm run verify:full` | **4.13 s** | pass |

The two fast-run logs are byte-identical (`cmp` succeeded). Their SHA-256 is
`51e1885b4d5e927b1552b3667cfd482ed3c2fc46fbcdbb8aada8838b5b781c0f`.

```text
Files: 54; tests: 214 passed, 0 failed, 0 skipped, 0 pending; run: passed
Files: 7; tests: 17 passed, 0 failed, 0 skipped, 0 pending; run: passed
```

The TCP path was verified by the verifier outside the sandbox, and the stdio
path was verified by the integration tests.

## Counts and delivery state

Read-only Git counts after verification:

| Command | Count |
| --- | --- |
| `git ls-files \| wc -l` | 197 |
| `git ls-files \| grep -c -E '\.test\.ts$'` | 40 |
| `git ls-files --cached --others --exclude-standard \| wc -l` | 219 |
| `git ls-files --cached --others --exclude-standard \| grep -c -E '\.test\.ts$'` | 61 |

Attempt 1 is already committed as `815465a`; its 197 / 40 tracked counts meet
the size gates. This attempt adds 21 test files and one test helper, yielding
**219 / 61 expected after launcher commit**. The two modified tracked files are
the contracts test and this report. No padding or generated source was added.

**Frozen-lockfile note:** `pnpm-lock.yaml` remains byte-identical to HEAD. Its
existing 1,145 lines are the verifier-accepted exception to the 200-line limit.
Every other delivered file stays within 200 lines. No verification check is red.
Attempt 2 is complete and ready for launcher commit and verifier acceptance.

## New test files

- `src/storage/transition.test.ts`
- `src/services/input.test.ts`
- `src/services/date-range.test.ts`
- `src/services/csv-rows.test.ts`
- `src/services/record.test.ts`
- `src/services/runtime.test.ts`
- `src/services/entity-commands.test.ts`
- `src/services/edit-task.test.ts`
- `src/services/reports/completions.test.ts`
- `src/services/reports/dependency-graph.test.ts`
- `src/cli/parse.test.ts`
- `src/cli/fields.test.ts`
- `src/cli/commands/catalog.test.ts`
- `src/api/query.test.ts`
- `src/api/error-response.test.ts`
- `src/api/read-body.test.ts`
- `src/api/routes/catalog.test.ts`
- `src/api/stdio.test.ts`
- `src/api/start.test.ts`
- `tests/integration/launch-server.test.ts`
- `tests/integration/start-server.test.ts`

New helper: `tests/helpers/export-process.ts`, which runs direct named imports
of built server exports and captures readiness, HTTP bytes and process exit.
