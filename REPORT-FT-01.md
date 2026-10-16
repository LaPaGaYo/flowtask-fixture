# REPORT-FT-01 — FlowTask

Implementation and executable verification are complete. **`verify:full` is
green: 59 unit tests plus 15 integration tests, 74 total, in 40 test files.**
Delivery remains an uncommitted workspace for the launcher. The tracked-file
acceptance gate is pending launcher staging; details below distinguish current
Git counts from the files actually delivered.

## Summary

Implemented projects, tasks, tags, recurrence, dependencies, saved views,
append-only activity, scheduling, import/export, five reports, all 22 CLI
commands, and 30 HTTP routes. File and memory repositories share schema and
invariant validation. The JSON store migrates v0 to v1, queues local writers,
locks against competing processes, verifies temporary bytes, and renames
atomically. CLI errors use the specified exit codes; HTTP errors share one
envelope. Clocks and IDs are injected and deterministic.

No dependencies, package scripts, license metadata, or package-manager version
were changed. `pnpm-lock.yaml` is byte-identical to HEAD. The only configuration
changes are ES2023 library declarations for Node 22's immutable array sorting,
and deterministic Vitest reporting with four workers. No commit, push, branch,
index, or other Git metadata mutation was performed.

## Module map

| Location | Files / test files | Responsibility |
| --- | --- | --- |
| `src/domain` | 26 / 9 | Entities, typed errors, dates, recurrence, queries, dependencies |
| `src/storage` | 13 / 5 | Schema, migration, codec, transactional repositories |
| `src/services` | 50 / 9 | Lifecycle operations, views, activity, CSV/JSON, reports |
| `src/cli` | 36 / 5 | Argument parsing, command modules, output, server launcher |
| `src/api` | 45 / 5 | Route modules, request parsing, HTTP server and pipe transport |
| `src/checks` | 2 / 2 | Architecture/size contracts and reporter verification |
| `tests/helpers` | 4 / 0 | Temp directories, built processes, HTTP client, reporter |
| `tests/integration` | 5 / 5 | CLI, HTTP, migration/transfer, failures, serve/shutdown |

Root `src/cli.ts` and `src/server.ts` build to the requested executable paths.
README and CLI/API/architecture docs were written from the completed code.

## Verification evidence

Environment: **Node v22.23.3**, **pnpm 10.34.7**, existing dependencies only.
The shell initially selected Node 20; commands used the installed Node 22 bin
path (`/Users/henry/.nvm/versions/node/v22.23.3/bin`). No download was needed.

Domain, storage, services, CLI, and API each passed `pnpm run verify:fast` before
advancing to the next layer. Final measurements used `/usr/bin/time -p` around
the exact scripts, equivalent to `time pnpm run …`:

| Command | Wall clock | Result |
| --- | --- | --- |
| `time pnpm run verify:fast` — first | **2.03 s** | pass |
| `time pnpm run verify:fast` — second | **2.07 s** | pass |
| `time pnpm run verify:full` | **3.61 s** | pass |

Both fast-run stdout/stderr logs are byte-identical. Their SHA-256 is
`1c3b7f2fb74d5e5c940c3d090fe2c386b378dc5a8a5568c3527c6a49719cb19b`.
Elapsed-time output was captured separately. Final output reports:

```text
Files: 35; tests: 59 passed, 0 failed, 0 skipped, 0 pending; run: passed
Files: 5; tests: 15 passed, 0 failed, 0 skipped, 0 pending; run: passed
```

Tests cover malformed input, cyclic/missing dependencies, blocked completion,
recurrence boundaries, archived projects, saved views, report ranges, exact
JSON bytes, quoted/multiline CSV, atomic rollback, real I/O failure/recovery,
writer serialization, migration, error codes, and built-process interoperability.
No sleeps, random IDs, ambient timestamps, or network listeners are used by the
final verification commands. Production imports are checked for cycles and
layer direction. All authored files are at most 200 lines.

Independent review found and drove regressions for enum coercion, large numeric
IDs, year-9999 report termination, JSON-export double encoding, and stdio shutdown
framing. A final boundary test fixed null due-date ordering against 9999-12-31.
All findings are resolved. Commands and routes have dispatch-level tests; built
process tests exercise entry points, HTTP parsing, persistence, and shutdown.

## Counts and delivery state

Requested commands, run without staging:

```text
git ls-files | wc -l
10

git ls-files | grep -c -E '\.test\.ts$'
0
```

The delivered workspace contains **197 eligible files, including 40 test files**,
counted with `git ls-files --cached --others --exclude-standard`. That count
includes this report and excludes ignored dependencies/build output. It is
within 150–500 files and above 20 tests once the launcher stages the new files.
There are no padding modules, generated source artifacts, or copied tests.

**Pending gate:** the literal tracked-file/test-file counts cannot change while
obeying the instruction not to touch `.git/`. The launcher must stage the
workspace and rerun the two requested count commands. I did not run `git add`.

**Frozen-scaffold exception:** the existing lockfile has 1,145 lines. It was left
unchanged as required. Every authored application, test, helper, and document is
under 200 lines; a literal all-files interpretation of the 200-line gate cannot
also preserve this frozen lockfile.

**Transport evidence:** this sandbox rejects TCP and Unix listeners with
`EPERM`. Final integration tests therefore spawn the actual built HTTP server
in `--stdio` mode and exchange HTTP through pipes using Node's HTTP client and
parser. No service-dispatch substitution or test skipping is used. Normal TCP
serving remains implemented and code-reviewed, but binding a TCP port could not
be exercised here.

No verification check is red. No implementation work remains open. Milestone
acceptance awaits the launcher's tracked-count confirmation and acknowledgment
of the pre-existing lockfile length constraint.
