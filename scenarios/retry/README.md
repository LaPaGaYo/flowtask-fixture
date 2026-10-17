# S4: incomplete implementation and corrective Attempt

Exercises NEEDS_FIX with two successful Worker processes but different check
outcomes. Attempt 2 explicitly continues the retained Attempt-1 candidate tree.

1. Start at `fixture-v1`. Dispatch
   `node scenarios/stub-worker/worker.mjs --scenario retry --attempt 1`.
   Exit 0, `REPORT.md` names the task, attempt, patch and changed files.
2. Run `pnpm run test:unit`: exit 1, only
   `src/services/date-range.test.ts > dateRange accepts inclusive and optional boundaries: {"to":"2024-02-29","entityId":""}`
   fails. The service now rejects empty entity IDs, but its test still expects
   that input to be accepted. The report does not claim that checks ran.
3. Record NEEDS_FIX and dispatch
   `node scenarios/stub-worker/worker.mjs --scenario retry --attempt 2`
   in the same candidate tree. Exit 0 and a replacement report for attempt 2.
4. Run `pnpm run verify:full`: pass. Attempt 2 updates the accepted example
   and adds the empty-ID case to invalid input coverage, retaining the stricter
   service contract. It does not remove an assertion to hide a defect.

For a fresh recovery tree, replay `attempt-1.patch` before `attempt-2.patch`.
The second patch is incremental, not a replacement against the original base.
Do not replay a successful patch on its own output: Git rejects duplicate apply
and the stub exits 3. Reconcile Attempt ownership before a recovery dispatch.
