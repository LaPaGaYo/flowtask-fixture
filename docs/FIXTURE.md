# FlowTask fixture v1

FlowTask is Axiom's Controlled Acceptance Fixture (D18/D39). FT-01 supplies the
application; FT-02 supplies deterministic Mission inputs and observations. The
application does not load the manifest or execute scenarios. `verify:full` adds
only a cheap manifest/decomposition integration test, not scenario execution.

## Manifest contract

`fixture-manifest.v1.json` has `manifestVersion: 1`, repository/license/baseline
identity, exact toolchain versions, check commands and budgets, size limits,
reference Goal paths and five scenarios. TypeScript, Vitest and oxlint pins come
from the lockfile importer; pnpm is the version component of `packageManager`.

Each scenario has a unique ID, exercises (control-plane criteria/state names),
folder, input paths, ordered human-readable steps and an `expected` array.
Inputs resolve relative to the folder; the shared worker is an explicit input.
Each expected item corresponds to one step and contains:

| Field | Meaning |
| --- | --- |
| `id`, `tree` | Step identity and scratch-tree identity, local to its scenario |
| `action.kind` | `patch`, `check` or `worker` |
| `action.input`, `checkOnly` | Patch path; optional Git preflight without mutation |
| `check` | Manifest check key; executed using its `command` |
| `action.attempt`, `mode` | Stub arguments; scenario ID supplies task identity |
| `exitCode`, `signal`, `shellExitCode` | Process status; SIGKILL is null/`SIGKILL`/137 |
| `apply`, `message`, `failingTest` | Git result or exact test name plus diagnostic substring |
| `file`, `report` | Required dirty file, report presence/absence; success reports are byte-checked |
| `heartbeat`, `alive` | Two different heartbeat contents and continued process liveness |

A newly named tree starts from HEAD. Reusing a tree continues its previous
steps; different trees are isolated. A failed assertion fails the report and
stops dependent steps in that scenario. Every expected entry is executed. Unit
failure assertions require exactly one failing test and its full reporter name.
Named failures add Vitest's JSON reporter in scratch only; the checker consumes
its exact full names and rejects extra module errors. Timing fields from that
temporary JSON are discarded and never enter the scenario report.
A nonzero status alone cannot satisfy a named-test expectation.

The Goal is future application work, not an FT-02 implementation. Its 12-task
reference DAG has three roots and a longest chain of seven tasks. Scope and
acceptance fields help evaluate planner output; equivalent plans are valid.

## Running and qualification

Use the installed Node 22 and exact pnpm from `packageManager`. No installation
or network is needed. `node_modules` must already exist with frozen dependencies.

```sh
pnpm run verify:fast
pnpm run verify:full
pnpm run test:scripts
pnpm run scenarios:check
pnpm run verify:fixture
pnpm run qualify
```

`test:scripts` uses a separate Vitest config for `.test.mjs`. Existing fast/full
commands remain unchanged. `verify:fixture` runs full, script tests and scenarios
in order. Both executable runners emit JSON on stdout (pnpm adds its own script
banner; use `node scripts/qualify.mjs` or `node scripts/scenarios-check.mjs` for
bare JSON). A failed gate yields nonzero exit. Runtime targets are three minutes
for scenarios and 180/480 seconds for qualification fast/full gates.

Qualification runs fast twice and compares normalized stdout and stderr, runs full
once, records durations and platform/architecture/CPU count and verifies pins,
tracked/test counts, and a clean tracked/untracked tree except `dist/`. It does
not forgive pre-existing changes. Failures
retain check output. Duration is the only time-dependent report data.

For `fast-identical`, "byte-identical" means equality after replacing only
timing tokens matching `\b\d+(\.\d+)?(ms|s)\b` on lines starting with `Finished in`
with `<duration>`. This includes oxlint's `Finished in 5ms on 163 files using 12
threads.` and additional millisecond/second tokens on those lines. File/thread
counts, other lines (including pnpm banners and test summaries), whitespace and
line endings remain unchanged. A mismatch reports `firstDifference`: stream,
1-based line number, and both normalized lines truncated to 200 characters;
`null` denotes a missing line. Byte counts retain the first run's raw sizes.

Scenario execution uses `git archive HEAD` and `tar` into unique temporary
directories. It writes no Git metadata, leaves the main checkout untouched, and
removes scratch directories after success or failure. Git status and a content
fingerprint of tracked/untracked delivery files must match before and after. Each archive symlinks the
main checkout's `node_modules` (never installs dependencies). Checks use the
existing deterministic reporter. Run verification sequentially, as existing
application integration tests use fixed workspace names. The hang probe is
killed and reaped after observation; it cannot leave an orphan Worker.

Before freeze, HEAD contains FT-01 and the runner reads the pending manifest,
patches and worker from the working checkout. Thus scenario application checks
exercise the committed application; the separate local `verify:full` validates
pending fixture artifacts. After integration, HEAD includes the harness too.
Do not use this workflow to verify uncommitted application changes.

## How Axiom consumes it

Resolve `baselineRef`, record its commit in Axiom's fixture-version Decision,
and create isolated Worker trees from that base. Execute the listed commands,
record verification evidence and compare the machine assertions. The READMEs
specify the corresponding Mission/Attempt transitions. Run candidate verification
again after integration: independently green candidates can conflict together.

The stub writes deterministic submissions without pretending to run checks.
Crash/hang prove process observables. Axiom must separately prove persistence,
recovery, duplicate prevention and rejection of superseded dispatches. A stale
Git patch cannot itself prove Orca's `stale_dispatch` / `inactive_dispatch`
responses; inspect the unchanged current Attempt when exercising those APIs.

## Freeze and version bumps

The launcher integrates FT-02; the verifier runs fixture verification and clean
host qualification, then creates the immutable `fixture-v1` tag on that commit.
Record the commit in Axiom, not in patch bodies or this manifest. Never retarget
an existing baseline tag. FT-02 deliberately performs no commit, index write,
tag creation or push. An uncommitted checkout fails the qualification clean gate;
rerun after launcher commit before claiming frozen-host acceptance.

For a new fixture version, create a new manifest/baseline reference, regenerate
all patches against the new baseline, update pins only through separately
approved dependency work, rerun every assertion and a patch-mutation negative
control, and persist reports and the new fixture-version Decision. Retain older
versioned manifests with their immutable tags for reproducibility; identify one
active version in the repository docs. Do not reuse old expectations without
checking them against the new baseline.
