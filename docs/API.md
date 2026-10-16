# HTTP API

Run `node dist/server.js --data <file> --now <UTC timestamp> --port 3000`, or
`node dist/cli.js serve` with the same flags. TCP binds `127.0.0.1` only. The first
stdout line is readiness JSON with the selected port. `--stdio` instead accepts
HTTP on stdin and returns HTTP on stdout; readiness goes to stderr. Acceptance
tests use this pipe transport without opening network listeners.

Request bodies are JSON, up to 1 MiB, with `Content-Type: application/json`.
Responses are JSON with no real-time Date header. `X-FlowTask-Now` accepts a UTC
ISO timestamp and overrides only that request's clock. Without it, the server
uses its `--now` value (default `2000-01-01T00:00:00.000Z`).

| Method and path | Behavior |
| --- | --- |
| `GET /health` | `{ "status": "ok", "version": 1 }` |
| `GET /projects` / `GET /projects/:id` | List/read projects |
| `POST /projects` | `{name}` |
| `PATCH /projects/:id` | `{name?, archived?}`; archive rejects open tasks |
| `DELETE /projects/:id` | Reject references from tasks or views |
| `GET /tasks` / `GET /tasks/:id` | List/read tasks |
| `POST /tasks` | `{projectId,title,...optionalTaskFields}` |
| `PATCH /tasks/:id` | Editable task fields; status only todo/doing |
| `DELETE /tasks/:id` | Reject references from other tasks |
| `POST /tasks/:id/done` | `{task,nextTask}`; atomic recurring successor |
| `POST /tasks/:id/cancel` | Cancel an open task |
| `POST /tasks/:id/block` / `POST /tasks/:id/unblock` | `{dependencyId}` |
| `GET /tags` / `GET /tags/:id` | List/read tags |
| `POST /tags` / `PATCH /tags/:id` | `{name}` |
| `DELETE /tags/:id` | Reject references from tasks or views |
| `GET /views` / `GET /views/:id` | List/read definitions |
| `POST /views` | `{name,filter?,sort?}` |
| `PATCH /views/:id` | `{name?,filter?,sort?}` |
| `DELETE /views/:id` | Delete definition |
| `GET /views/:id/run` | Filtered, sorted tasks |
| `GET /activity` | Append-only events; optional entityId/from/to query |
| `GET /reports/:name` | Report; optional from/to query |
| `GET /export?format=json\|csv` | `{format,content}`; content is a string |
| `POST /import` | `{content,format?}`; default json; returns collection counts |

Create endpoints return **201**. Other successful operations return **200**;
deletes return the removed entity. Lists return arrays. PATCH merges only the
provided editable fields, rejects unknown fields, and preserves IDs.

Task fields: `projectId`, `title`, `description`, `priority` (p1 through p4),
`dueDate` (ISO calendar date or null), `tags` (tag IDs), `blockedBy` (task IDs),
`recurrence` (rule or null). Tasks start todo; closed tasks cannot be edited.
Timestamps and IDs are server-assigned. Full returned tasks also include status,
createdAt, and updatedAt. Recurrence rules are described in [CLI](CLI.md).

Task-list query keys are `projectId`, `status`, `tag`, `ready=true|false`, and
`sort=priority|dueDate|createdAt|title`. A saved view's `filter` uses those same
filter keys (ready is a JSON boolean); its `sort` is a separate field.
Defaults are empty filter and priority sorting. Unknown query fields are rejected.

Report names:

- `counts`: object with todo/doing/done/canceled totals.
- `overdue`: open tasks due before the injected current day, ordered by due date.
- `upcoming-7-days`: open tasks due today through six days later.
- `completion-per-day?from=YYYY-MM-DD&to=YYYY-MM-DD`: inclusive array of
  `{date,count}`, including zeros; at most 36,600 days between endpoints.
- `dependency-graph`: string with sorted `task-id -> prerequisite-ids` lines.

Errors always have the shape:

```json
{"error":{"code":"blocked","message":"Task has incomplete dependencies"}}
```

Status mapping: **400** validation/usage, **404** missing entity/report/route,
**405** wrong method for a known path, **409** conflict/blocked/cycle,
**500** storage failure. Invalid JSON, clock values, URL encoding, and enum
shapes return validation errors. Rejected mutations leave the data file unchanged.
