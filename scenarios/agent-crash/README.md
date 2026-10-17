# S3: crash and unverifiable Attempt

Inputs are supplied by `../stub-worker/worker.mjs`. Each mode starts in a
separate, clean Worker tree at `fixture-v1` with no `REPORT.md`.

1. Dispatch `node scenarios/stub-worker/worker.mjs --scenario agent-crash --mode crash`.
   It writes `src/services/half-written.ts`, then sends itself SIGKILL.
   Observe signal SIGKILL (shell exit 137), a dirty tree and no report.
2. Persist the Attempt as crashed/unverifiable. Preserve its identity and
   evidence. Resolve ownership before recovering or retrying that Mission;
   discard/reset the partial tree only after the old process is known dead.
3. In another tree dispatch
   `node scenarios/stub-worker/worker.mjs --scenario agent-crash --mode hang`.
   `scenarios-heartbeat.txt` advances once each second. The process never exits
   by itself and never writes a report.
4. Let the control-plane watchdog expire. Classify the Attempt as timed out or
   unverifiable, and reconcile or terminate its live process before retry.
   A retry while the old process is still owned/live must not start a duplicate.
5. Recovery can use a clean tree with
   `node scenarios/stub-worker/worker.mjs --scenario agent-crash --mode succeed`:
   exit 0 and a deterministic report; no patch is applied in this mode.

`scenarios:check` waits for two distinct heartbeat contents, checks that the
process is still alive, and kills/reaps its probe in a finally block. It proves
process behavior, not Axiom's persistence, watchdog or duplicate prevention.
Those state transitions are assertions for the control plane under test.
