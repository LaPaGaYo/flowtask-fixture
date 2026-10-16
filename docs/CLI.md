# CLI

Build first with `pnpm run build`, then use `node dist/cli.js` (or the `flowtask`
binary entry). Global flags can precede or follow the command:

- `--data <file>`: default `.flowtask-data/store.json`.
- `--json`: JSON output/errors. Human output is plain tables, without colors.
- `--now <ISO UTC timestamp>`: fixed clock; default `2000-01-01T00:00:00.000Z`.
- `--help`: command summary.

Exit codes: **0** success, **2** usage, **3** domain/validation, **4** storage or
process error. Successful output goes to stdout; errors go to stderr. JSON
errors use `{ "error": { "code": "…", "message": "…" } }`.
Unknown commands/options and incorrect positional counts are usage errors.

| Command | Arguments/options |
| --- | --- |
| `init` | Create or migrate the selected store; preserve existing data |
| `project add` | `--name <name>` |
| `project list` | Includes archived projects |
| `project archive <id>` | Rejects projects containing open tasks |
| `task add` | `--project <id> --title <title>` and optional task fields |
| `task list` | `--project`, `--status`, `--ready`, `--filter <JSON>`, `--sort` |
| `task show <id>` | Full task |
| `task update <id>` | Optional task fields; closed tasks cannot be changed |
| `task done <id>` | Complete and return `{task,nextTask}`; nextTask can be null |
| `task cancel <id>` | Close without generating a recurrence |
| `task block <id> <dependency>` | Add a dependency; reject missing IDs/cycles |
| `task unblock <id> <dependency>` | Remove a dependency |
| `tag add` / `tag rm <id>` / `tag list` | Creation takes `--name`; removal rejects references |
| `view save` | `--name <name> [--filter <JSON>] [--sort <field>]` |
| `view list` / `view run <id>` | List definitions or execute one |
| `export` | `--format json|csv` (default json) |
| `import` | `--file <path> [--format json|csv]`; atomic replacement |
| `report <name>` | Names below; completion range uses `--from` and `--to` |
| `serve` | `--port <0..65535>` (default 3000), or `--stdio` |

Task fields are `--description`, `--priority p1|p2|p3|p4`, `--due YYYY-MM-DD|null`,
`--tags <comma-separated tag IDs>`, `--blocked-by <comma-separated task IDs>`, and
`--recurrence <JSON|null>`. Update also accepts `--project`, `--title`, and
`--status todo|doing`. Use empty quoted strings for an empty tag/dependency list.
Defaults: todo, p3, empty description/lists, no due date or recurrence.

Recurrence examples:

```sh
--recurrence '{"kind":"daily"}'
--recurrence '{"kind":"weekly","weekdays":[1,3,5]}'
--recurrence '{"kind":"monthly","day":31}'
--recurrence '{"kind":"interval","days":3}'
```

Filters support `projectId`, `status`, `tag` (ID), and `ready` (boolean).
`--filter` supplies the complete filter and takes precedence over individual
list flags. Sort fields: `priority` (default), `dueDate`, `createdAt`, `title`.
All orders use ID as the final tie-breaker; missing due dates sort last.

```sh
node dist/cli.js view save --name Urgent --filter '{"status":"todo"}' --sort priority
node dist/cli.js task list --filter '{"ready":true,"tag":"id-000005"}' --json
```

Reports: `counts`, `overdue`, `upcoming-7-days`, `completion-per-day`, and
`dependency-graph`. Upcoming includes today through six days later, excluding
closed tasks. Overdue means open with due date before today. Completion ranges
are inclusive, include zero-count days, and span at most 36,600 days.

JSON export always writes a raw snapshot, including with `--json`, so this works:

```sh
node dist/cli.js export --json > backup.json
node dist/cli.js import --file backup.json
node dist/cli.js export --format csv > backup.csv
node dist/cli.js import --format csv --file backup.csv
```

With `--json`, CSV export is a JSON string; omit that flag when saving CSV files.
Imports retain local activity, reject incompatible history, and record the import.

`serve` binds only `127.0.0.1`. Port 0 asks the OS for a port. In `--stdio` mode,
stdin/stdout carry HTTP exclusively; the readiness JSON goes to stderr. Send
SIGINT/SIGTERM for shutdown. The CLI forwards these signals to its server child.
