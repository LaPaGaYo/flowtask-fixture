# Sprints and planning

Give a small team a repeatable planning workflow in FlowTask: create a sprint,
select work, see what is ready, finish the sprint, and review progress. Keep
existing projects, tasks, dependencies, saved views and history usable.

A sprint has an ID, unique nonempty name, inclusive UTC start/end dates and an
open/closed state. Start must not exceed end. Tasks may belong to at most one
sprint. Create/list/close and assign/unassign operations use the existing Result,
repository, clock and ID contracts. Reject assignment to a closed sprint and
closing a sprint with unfinished work; done and canceled tasks permit closing.
Record lifecycle and membership changes in append-only activity. Repeated close
returns a conflict without changing state or history.

Persist schema version 2. Migrate version 1 without losing entities, history or
IDs: add empty sprints and null sprint membership. Keep version-0 migration
working through version 1. Validate references on load and import. Failed
mutations and invalid migrations must leave the committed store unchanged.

Expose sprint operations through CLI commands and HTTP routes, and let task
queries and saved views filter by sprint. Add a `sprint-burndown` report: for
each inclusive sprint date, report initial committed task count, completions,
and remaining work using activity up to the injected clock. Define and test
how assignments, unassignments and canceled tasks change the daily series.
Ordering must be stable, including empty sprints and days with no events.

Also deliver two independent improvements useful before sprint support lands:

- A `plan` report groups ready tasks by project, preserving the existing ready
  ordering inside each project and ordering projects by ID. Empty projects are
  omitted; blocked and closed tasks are excluded.
- Replace the `kind,payload` CSV encoding with a documented tabular interchange
  format: one explicit column per field, a kind discriminator and schema version,
  with fixed headers and stable row order. Arrays use a documented cell encoding;
  complete entity JSON in a payload cell is not tabular. Preserve commas, quotes,
  multiline text, nulls and Unicode. Validate malformed headers, duplicate IDs,
  unknown kinds and references atomically. Keep JSON interchange working. State
  explicitly how legacy CSV is detected and rejected or migrated.

No new dependencies or changes to frozen dependency lists/lockfile. Preserve
layering, small modules, direct tests for exports, strict typing and deterministic
checks. Use injected clocks and IDs, UTC dates, explicit tie-breaks, atomic writes
and fixed test data. Update CLI, API, architecture and user documentation. All
existing verification commands must pass after each integrated task; add direct
and end-to-end tests for new behavior and migration/round-trip edge cases.

`scenarios/goal/decomposition.json` is a reference for judging planner output,
not the only valid plan. It has 12 tasks and three independent starting tasks.
Equivalent decompositions may choose different boundaries while respecting
contracts, verification and dependency readiness. This goal is future work:
FT-02 supplies the statement and reference plan, not its implementation.
