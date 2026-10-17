# S1: deterministic failure

Exercises Axiom V1 success criterion 5: a failed verification enters NEEDS_FIX
and a corrective candidate completes the same Mission.

1. Start a Worker tree at `fixture-v1`; apply
   `git apply scenarios/deterministic-failure/candidate.patch`.
2. Run `pnpm run typecheck` and `pnpm run lint`: both pass.
3. Run `pnpm run test:unit`: exit 1, exactly one test fails:
   `src/domain/recurrence.test.ts > advances daily, weekly, interval and clamped monthly dates`.
4. Record failed verification and issue NEEDS_FIX. In that same candidate tree,
   run `git apply scenarios/deterministic-failure/fix.patch`.
5. Run `pnpm run verify:full`: exit 0. Verify and integrate the fixed candidate.

The candidate removes month-end clamping, allowing a day-31 recurrence to
roll into March instead of February. Assertions are unchanged. The fix restores
the clamp. `scenarios:check` proves both checks and the single failing test.
