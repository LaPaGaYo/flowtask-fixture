# Deterministic Worker

Requires Node 22 and Git; uses built-ins only, no network, clock or random data.

```sh
node scenarios/stub-worker/worker.mjs --scenario retry --attempt 1 --cwd /path/to/worker-tree
```

`--scenario` accepts the five manifest IDs. `--attempt` is 1 (default) or 2.
`--mode` is `succeed` (default), `crash` or `hang`; crash/hang are only valid for
`agent-crash`. `--cwd` defaults to the current directory and controls all writes.
Patches are resolved relative to this script, so it can operate an archive tree
that does not yet contain the fixture harness.

Succeed maps attempts to candidate/fix, semantic A/B, retry 1/2, or first/stale
patches respectively. Agent-crash succeed applies no patch. Each success writes
`REPORT.md` with task ID = scenario ID, numeric attempt, candidate description,
changed files and `checks run: none — stub`. Exit 0 does not imply green checks.
Crash/hang must start without an old report; they never create a report.

Exit codes: 0 success; 2 invalid usage; 3 failed patch; SIGKILL (shell 137) for
crash. Hang remains alive until killed and writes a numbered heartbeat each
second. Control-plane ownership and stale-dispatch rejection are external.
