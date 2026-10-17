# FT-02 execution plan

Status: implementation, review and fixture verification complete.
Milestone acceptance awaits launcher commit and clean qualification.
Delivery is an uncommitted launcher handoff.

## Problem and scope

Turn the unchanged application into a controlled acceptance fixture for Axiom.
Scripted patches establish test failure, merge failure, crash, retry and stale
submission evidence. The fixture tests outcomes; Axiom/Orca own dispatch state.
No application implementation, dependencies, network, commits or index writes.

## Execution unit and design

FT-02 follows FT-01 and freezes as `fixture-v1` only after launcher integration.
Use archive scratch copies instead of worktrees to honor the Git-write ban.
Keep scenario operations and their expectations together in a manifest, so the
runner evaluates every assertion rather than maintaining a second scenario list.
Use small built-in Node modules for scratch management, process observation and
pure evaluation. Script tests use a separate Vitest config for `.test.mjs` files;
application verification commands remain byte-for-byte unchanged.

## Execution and verification

1. Generate ASCII Git diffs outside the checkout. Establish real behavioural
   regressions and a merge-only contract disagreement. Record exact diagnostics.
2. Write failing pure-function tests; implement manifest-driven runners and the
   stub. Check crash, report absence, heartbeat progress and process cleanup.
3. Add a typed manifest integration test with file, pin and DAG validation.
4. Write the goal and reference tasks, scenario runbooks and fixture lifecycle.
5. Run application checks, script tests and every scenario. Mutate a patch in a
   separate input copy and prove the checker rejects its changed outcome.
6. Review constraints, measure sequential checks and capture JSON reports.
   Return to milestone verification and document the explicit delivery state.

## Risks and completion criteria

The source tree stays unchanged. Every expected failure must have the exact
recorded diagnostic, not merely a nonzero process status. Scratch dependencies
are symlinked from the installed frozen tree; Generated dependency caches remain ignored.
The main checkout and Git metadata must remain untouched by scenario execution.
Clean-checkout qualification cannot pass on uncommitted delivery artifacts;
record that result and require the launcher to rerun after committing.
