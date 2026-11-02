---
name: observe-spawned-argv-and-short-fixture-paths
description: how to test a runtime limit that only bites on one host (command-line cap), and why fixture and scratch paths must stay short on Windows
metadata:
  type: feedback
---

To test a limit a host enforces only sometimes (Windows 32,767-char command line), observe the argv the code spawns instead of waiting for the failure: run the runtime CLI with `node --require <spy.js>`, where the spy wraps `child_process.spawnSync` before `.asd/runtime.js` destructures it, and appends each git argv to a log file named by an env var. Assert budget, order and unit integrity on the log; the test then fails on any host.

**Why:** a naive splitter and the pre-fix code both pass on POSIX where the cap does not bite, so a plain "emit succeeds" test proves nothing there.

**How to apply:** make chunk-edge cases irregular (vary name lengths, rename a non-periodic share of files) and prove detection with a mutation that splits per path; a periodic fixture can align every edge with a unit boundary and stay green under the bug. Keep fixture paths short (`s/<name>`): git itself fails with "Filename too long" near 260 chars, `.git/objects/pack` temp names included, which shows up when a mutation copy lives in a deep scratch directory. Run such a copy from a short `subst` drive and remove the drive after.
