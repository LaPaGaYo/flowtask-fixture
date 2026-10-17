# S2: merge-only failures

Exercises integration-time FIX_TASK / CONFLICT -> NEEDS_FIX. Each candidate
must be verified against its declared base, then checked again on integration.
Each separate tree below starts at `fixture-v1`.

## Semantic conflict

1. Tree A: `git apply scenarios/merge-only-failure/semantic/a.patch`, then
   `pnpm run verify:full`: pass. A updates invalid date-range wording and adds
   a direct test of the new contract.
2. Tree B: `git apply scenarios/merge-only-failure/semantic/b.patch`, then
   `pnpm run verify:full`: pass. B adds a caller test of the old wording.
3. Tree A: `git apply scenarios/merge-only-failure/semantic/b.patch` succeeds
   without a textual conflict. Run `pnpm run test:unit`: exit 1, only
   `src/services/date-range-contract.test.ts > dateRange keeps stable validation wording`
   fails; the diagnostic contains `Invalid date boundaries`.
4. Integration must stop, create a FIX_TASK and route the candidate to NEEDS_FIX.
   A Worker must reconcile the contract and reverify before integration.

## Textual conflict

1. Fresh tree A: `git apply scenarios/merge-only-failure/textual/a.patch`, then
   `pnpm run verify:full`: pass.
2. Fresh tree B: `git apply scenarios/merge-only-failure/textual/b.patch`, then
   `pnpm run verify:full`: pass.
3. Tree A: `git apply --check scenarios/merge-only-failure/textual/b.patch`:
   exit 1 and `patch does not apply`. Both patches change the same message line.
4. Record CONFLICT and NEEDS_FIX; never treat individual green checks as proof
   that the integrated tree is green.

`scenarios:check` evaluates all four individual full checks and both conflicts.
