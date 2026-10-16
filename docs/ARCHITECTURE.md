# Architecture

Production dependencies flow toward domain types and rules. There are no
imports from domain into storage/services, or between CLI and API. The CLI's
`serve` command starts the built server executable as a child process.

| Directory | Responsibility |
| --- | --- |
| `src/domain` | Entity types, Result errors, guards, dates, recurrence, filtering, dependency graph |
| `src/storage` | Repository contract, snapshot validation, migration, serialization, memory/file stores |
| `src/services` | One business operation per module, shared transactional entity mutations |
| `src/services/reports` | Counts, overdue, upcoming, completions, dependency text |
| `src/cli` | parseArgs, one command per file, tables/JSON, exit codes |
| `src/api` | One route per file, JSON body parsing, error mapping, HTTP lifecycle |
| `tests/helpers` | Fixed workspaces, executable/HTTP-pipe clients, deterministic reporter |
| `tests/integration` | Built process persistence, migration, transfer, transport, and shutdown |
| `src/checks` | Module size, forbidden constructs, dependency direction/cycles, reporter tests |

## Invariants

Every operation receives a repository, `Clock`, and `IdSource`. Runtime clocks
are fixed values; the API clones request context for a header override while
sharing the repository. Sequential IDs use exact integer arithmetic and inspect
persisted IDs. There is no global mutable application state.

Validation returns `{ ok: true, value }` or
`{ ok: false, error: { code, message } }`. Identifiers are globally unique;
project, tag, and view names are unique within their collection. Tasks refer to
existing projects, tag IDs, and dependency IDs. Dependencies are acyclic.
Completed tasks must have completed dependencies. Ready means `todo` or `doing`
with every dependency done; ordering is priority, due date (null last), then ID.

Closed tasks cannot be edited, completed again, or canceled again. Use the
explicit completion/cancellation operation; generic task updates allow only
`todo` and `doing`. Archive rejects open tasks. Deletes reject references from
remaining tasks or saved views. Tags are attached through task creation/update.

Completing a recurrence creates its successor and both activity events in one
transaction. UTC dates advance from the original due date, or completion date
when no due date exists, to a date strictly after both anchor and completion.
Weekly weekdays are 1=Monday through 7=Sunday. Monthly rules clamp to month end
without losing the original day-of-month rule. Overflow outside four-digit ISO
years fails validation and rolls back the completion.

Activity is append-only, even after entity deletion or import. Completion
reports count completion events, including subsequently deleted tasks. An import
replaces projects/tasks/tags/views, merges compatible event IDs, retains local
history, and appends `store.imported`. Conflicting event IDs reject the import.

## Data and durability

One UTF-8 JSON file contains:

```json
{
  "version": 1,
  "projects": [],
  "tasks": [],
  "tags": [],
  "views": [],
  "activity": []
}
```

Serialization uses two-space indentation and a final newline. Entity fields are
normalized on load. Writing then reading canonical data preserves the bytes.
Missing files read as empty stores; malformed or unsupported files return a
storage error. `init` creates the file, preserving existing valid data.

Version 0 requires `projects` and `tasks`. Migration supplies missing `tags`,
`views`, and `activity` arrays, and missing task description/tags/blockedBy/
recurrence/updatedAt fields. Reads migrate in memory; the next successful
transaction persists version 1. Other versions are rejected.

File mutations queue within a repository instance. An exclusive `<file>.lock`
prevents overlapping writers across processes; a competing process gets a
storage error without retry/sleep. Mutations work on a copy, validate all
invariants and the activity prefix, write `<file>.tmp`, sync and read it back,
then rename over the destination. Errors before rename leave the old file intact.
The memory repository uses the same validation and copies reads and results.

A killed writer can leave a lock/temp file. After confirming no writer remains,
inspect the committed JSON and remove those two sidecars before retrying. This
fixture has no automatic stale-lock recovery or background worker.

CSV is lossless snapshot interchange: a `kind,payload` header, `schema,1`, then
one row per entity. Kinds are `projects`, `tasks`, `tags`, `views`, and `activity`;
payload is quoted JSON. CSV quoting preserves commas, quotes, and multiline text.
JSON and CSV decode through the same schema and reference validation.

HTTP integration uses Node's HTTP parser/client on a duplex stream backed by
child stdin/stdout. This is HTTP framing over local pipes, not direct service
dispatch. TCP serving uses the same application. All application and test files
are at most 200 lines; the unchanged scaffold lockfile exceeds that limit.
