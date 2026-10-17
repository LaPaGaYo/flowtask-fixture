# S5: stale base and late completion

Exercises two distinct control-plane checks: integration-base freshness and
Attempt/dispatch identity. Git evidence models the former, not dispatch state.

1. Start two Worker trees at `fixture-v1`. In the first tree run
   `git apply scenarios/stale-completion/first.patch`, then
   `pnpm run verify:full`: pass. Integrate it; the current base advances.
2. The late candidate was prepared against the original base with
   `git apply scenarios/stale-completion/stale.patch`. Its `pnpm run verify:full` passes,
   but it changes the same date-range validation region as the first patch.
3. On the advanced tree, run
   `git apply --check scenarios/stale-completion/stale.patch`: exit 1 and
   `patch does not apply`. The manifest records textual rejection.
4. A submission built on the old base must be rejected/rerouted as stale to
   NEEDS_FIX/rebase, never integrated blindly. Rebuild and verify on the new base.
5. Separately, send a late completion for a superseded Attempt. Orca must reject
   it with `stale_dispatch` / `inactive_dispatch` as appropriate, without mutating
   the current Attempt, its candidate, reports, verification or dispatch owner.

`scenarios:check` proves original applicability, first-candidate full success
and advanced-base rejection. Axiom/Orca acceptance must inspect persisted state
before/after the late submission to prove step 5; this fixture has no Orca API.
