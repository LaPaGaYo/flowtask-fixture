# REPORT-FT-02 — fixture implementation and launcher handoff

FT-02 adds five deterministic scenarios (10 ASCII patches), a built-in Node
Worker, versioned manifest, typed manifest/DAG integration validation, a future
Sprints and planning Goal, qualification/replay runners, tests and runbooks.
Application source and behavior, dependency lists, lockfile and existing scripts
are unchanged. New scripts: qualify, scenarios:check, test:scripts, verify:fixture.

**Application and fixture verification pass. Qualification exits 1 solely at
its strict clean-checkout gate.** This task requires uncommitted delivery and
forbids Git metadata writes; therefore a green clean-checkout qualification
cannot be produced here without violating those rules. No gate was weakened.
The actual JSON report is included below. Launcher commit and verifier
qualification/freeze remain outstanding; FT-02 is not declared fully accepted.

## Scenario evidence

Every one of the 29 manifest steps passes in the restored final fixture.
Patch bodies have at most 23 lines and touch at most two files each.

| Scenario | Exact observable outcome |
| --- | --- |
| S1 deterministic-failure | Candidate typecheck/lint pass; unit exit 1, only `src/domain/recurrence.test.ts > advances daily, weekly, interval and clamped monthly dates` fails. Fix restores full verification. |
| S2 semantic | A/B full checks pass alone; both apply together; unit exit 1, only `src/services/date-range-contract.test.ts > dateRange keeps stable validation wording` fails, diagnostic contains `Invalid date boundaries`. |
| S2 textual | A/B full checks pass alone; second `git apply --check` exits 1 with `patch does not apply`. |
| S3 agent-crash | SIGKILL / shell 137; dirty `src/services/half-written.ts`; no report. Hang produces changing `scenarios-heartbeat.txt`, stays alive and produces no report; checker kills/reaps it. Succeed exits 0 with deterministic report. |
| S4 retry | Worker attempt 1 exits 0 with report, then unit exit 1, only `src/services/date-range.test.ts > dateRange accepts inclusive and optional boundaries: {"to":"2024-02-29","entityId":""}` fails. Incremental attempt 2 exits 0 with replacement report and full verification passes. |
| S5 stale-completion | First and stale candidates pass full verification on the original base. After first applies, stale preflight exits 1 with `patch does not apply`. |

Mission transitions, duplicate prevention and Orca stale_dispatch/inactive_dispatch
rejections require the control plane under test. The fixture proves deterministic
inputs and process/check/Git observations; it does not simulate Orca persistence.

## Goal and review

Reference plan: 12 tasks; roots T01 (sprint domain), T02 (tabular CSV), T03 (plan
report); longest chain 7 tasks / 6 edges, e.g. T01 -> T04 -> T05 -> T06 -> T08 ->
T09 -> T11. It covers domain, storage/migration, services, CLI, API, reports,
saved views, interchange, docs and integration tests. It is not the only valid
plan and no sprint feature is implemented in FT-02.

Independent read-only review found two issues, both resolved: schema-v2
interchange ownership is explicit in T04, and exact failure matching now uses
structured full names and rejects additional test-module errors. Regression tests
cover both false-positive probes. A macOS /var versus /private/var path mismatch
was reproduced with a failing archive test and fixed by canonicalizing scratch
paths; the regression now passes. Follow-up review found no remaining material
issue before that small path fix. No external/network audit was attempted.

## Counts and constraints

| Measurement | Count |
| --- | --- |
| `git ls-files` | 219 currently tracked |
| Tracked `*.test.ts` | 61 |
| `git ls-files --cached --others --exclude-standard` | 254 delivery files; expected tracked count after launcher commit |
| Delivery `*.test.ts` / `*.test.mjs` | 62 / 4 |
| Unit / integration / script test cases | 214 / 20 / 13 |

All non-lockfile delivery files are at most 200 lines. The existing lockfile is
the sole exemption. Patch paths are restricted to src/tests; no patch contains
index hashes, commit headers or timestamps. Forbidden constructs were scanned.
No dependency, application source, existing verification-command, commit, push,
index, tag or Git metadata change was made. No network or installation was used.

## Sequential measurements

Host: macOS arm64, 12 CPUs, Node v22.23.3, pnpm 10.34.7. The pinned binaries are
preinstalled at `/Users/henry/.nvm/versions/node/v22.23.3/bin` and were selected via
PATH. `/usr/bin/time -p` measured each command with combined output captured
separately from timing output. Both fast outputs are byte-identical. Fast/full
remain below twice FT-01's 2.72/4.13-second measurements.

| Command | Wall clock | Exit |
| --- | --- | --- |
| `time pnpm run verify:fast (first)` | 2.51 s | 0 |
| `time pnpm run verify:fast (second)` | 2.54 s | 0 |
| `time pnpm run verify:full` | 4.14 s | 0 |
| `time pnpm run verify:fixture` | 46.95 s | 0 |
| `time pnpm run qualify` | 9.58 s | 1 |
| `time pnpm run scenarios:check` | 41.96 s | 0 |

Scenario execution stays below the three-minute target. Scratch trees come from
HEAD archives and symlink installed node_modules. Git status and delivery-file
content fingerprints match before/after; scratch trees and heartbeat Workers
are cleaned up. Before launcher commit, scratch application checks use FT-01
HEAD; local full verification separately validates the pending fixture harness.

## Negative control

Temporarily replaced S1's overflowing `setUTCDate(rule.day)` patch addition with
`setUTCDate(Math.min(last.getUTCDate(), rule.day))`, which preserves correct
clamping. Typecheck/lint passed and all 214 unit tests passed, so scenarios:check
exited 1 at `one-failure` with `exitCode` and `failingTest` mismatches. All other
scenarios passed. The original patch was restored byte-for-byte in a finally
block. This proves that removing the intended failure cannot produce a green
scenario report; no application file was edited for the negative control.

## Qualification JSON (actual failed clean gate)

The report includes every gate, measurements, host and exact pending paths.

```json
{"pass":false,"host":{"platform":"darwin","arch":"arm64","cpus":12,"node":"v22.23.3","pnpm":"10.34.7"},"gates":[{"id":"node","measured":"v22.23.3","pass":true},{"id":"pnpm","measured":"10.34.7","pass":true},{"id":"tracked-files","measured":219,"pass":true},{"id":"test-files","measured":61,"pass":true},{"id":"fast-1","measured":{"exitCode":0,"signal":null,"durationSeconds":2.5284015},"pass":true},{"id":"fast-2","measured":{"exitCode":0,"signal":null,"durationSeconds":2.520407375},"pass":true},{"id":"fast-identical","measured":{"stdoutBytes":481,"stderrBytes":0},"pass":true},{"id":"full","measured":{"exitCode":0,"signal":null,"durationSeconds":4.121258958},"pass":true},{"id":"clean","measured":["GOAL.md","README.md","REPORT-FT-02.md","docs/ARCHITECTURE.md","docs/FIXTURE.md","docs/FT-02-PLAN.md","fixture-manifest.v1.json","package.json","scenarios/agent-crash/README.md","scenarios/deterministic-failure/README.md","scenarios/deterministic-failure/candidate.patch","scenarios/deterministic-failure/fix.patch","scenarios/goal/decomposition.json","scenarios/merge-only-failure/README.md","scenarios/merge-only-failure/semantic/a.patch","scenarios/merge-only-failure/semantic/b.patch","scenarios/merge-only-failure/textual/a.patch","scenarios/merge-only-failure/textual/b.patch","scenarios/retry/README.md","scenarios/retry/attempt-1.patch","scenarios/retry/attempt-2.patch","scenarios/stale-completion/README.md","scenarios/stale-completion/first.patch","scenarios/stale-completion/stale.patch","scenarios/stub-worker/README.md","scenarios/stub-worker/worker.mjs","scripts/qualify.mjs","scripts/qualify.test.mjs","scripts/scenario-evaluation.mjs","scripts/scenario-runtime.mjs","scripts/scenario-runtime.test.mjs","scripts/scenarios-check.mjs","scripts/scenarios-check.test.mjs","scripts/vitest.config.mjs","scripts/worker.test.mjs","tests/helpers/fixture/decomposition.ts","tests/helpers/fixture/manifest.ts","tests/integration/manifest.test.ts"],"pass":false}],"failures":[]}
```

## Scenario JSON (restored final inputs)

```json
{"pass":true,"scenarios":[{"id":"deterministic-failure","steps":[{"id":"candidate","pass":true},{"id":"typecheck","pass":true},{"id":"lint","pass":true},{"id":"one-failure","pass":true},{"id":"fix","pass":true},{"id":"fixed","pass":true}]},{"id":"merge-only-failure","steps":[{"id":"semantic-a","pass":true},{"id":"semantic-a-alone","pass":true},{"id":"semantic-b","pass":true},{"id":"semantic-b-alone","pass":true},{"id":"semantic-combine","pass":true},{"id":"semantic-combined","pass":true},{"id":"textual-a","pass":true},{"id":"textual-a-alone","pass":true},{"id":"textual-b","pass":true},{"id":"textual-b-alone","pass":true},{"id":"textual-rejected","pass":true}]},{"id":"agent-crash","steps":[{"id":"crash","pass":true},{"id":"hang","pass":true},{"id":"succeed","pass":true}]},{"id":"retry","steps":[{"id":"attempt-1","pass":true},{"id":"incomplete","pass":true},{"id":"attempt-2","pass":true},{"id":"complete","pass":true}]},{"id":"stale-completion","steps":[{"id":"first","pass":true},{"id":"advanced-base","pass":true},{"id":"stale-original","pass":true},{"id":"stale-original-full","pass":true},{"id":"stale-rejected","pass":true}]}]}
```

## Delivery state

Implementation, independent review and fixture verification are complete.
The one unmet mandatory gate is green qualification on a clean checkout.
Launcher: commit this handoff. Verifier: rerun verify:fixture and qualify on the
clean resulting HEAD, create immutable fixture-v1, and record its commit in
Axiom's fixture-version Decision. Do not claim frozen-host acceptance until then.
