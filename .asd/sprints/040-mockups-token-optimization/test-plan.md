---
responsibility:
  owns: test approach, suite evidence and defects
  delegates_to: plan.md (tasks), sprint.md (acceptance)
---

# Test plan — sprint 040

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | be1c83b2 | full change surface |
| 2 | 17dae23b | delta since entry 1 |
| 3 | bcc7edda | delta since entry 2 |
| 4 | 7ee837fe | delta since entry 3 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1, AC-2 · Current-version shortcut and release hash | Removing the duplicate predicate could let an older installed version bypass a pending migration or leave the recorded updater hash stale. | Existing `update` CLI retry and manifest checks, `contract-rules`, `contract-workflows`, `sync-cli`, `sync-render` and sync build | none | A pending migration must be strictly newer than the installed version and at most the target. No version can meet both when installed is at or above target. The existing CLI test still exercises zero managed writes with a pending migration, including dry preview and the real retry. |
| AC-2 · Approval contract test | An ordinary rewording can break the contract test despite preserving permission to write. | Existing `update` contract test and trace to `core.md` | none | `41eea73` removed two prose assertions. The heading, literal approval choices, real, preview and partial outcome checks, and executable retry coverage remain. `asd-init` Update completion step 3 and the Settings writes invariant still require approval and limit the write to approved missing values. |
| AC-7, AC-8 · Combined reviewer memory index | Shortened cues could make a method hard to locate or break a link in the Claude reviewer's project memory. | `contract-agents` live memory-index bijection plus comparison of link labels, targets and order | none | The Claude view declares `memory: project` and is a live consumer. Both revisions have the same 44 ordered link identities and all targets exist. The owner's commit check passed and the 22 measured Codex phase bundles still match their probe inputs. |
| AC-2 · Review finding `combined.md 1`, iteration 03 | The approval menu can survive while the write step loses its approval route or its scope tied to the missing-settings diagnostic. | Extend the existing `update` content-contract test | add | Check the leading `accept-all` route token and the exact `missing` field separately in Update completion step 3. A change to other wording remains valid. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

The review-fix removed two assertions from an existing test. No tests were removed or proposed for removal.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| `tests/update.test.js:sprint-040 AC-2: only real update completion offers missing settings through installed asd-init` (extended) | The entry 4 impacted run passed 152/152 at `c5b1fed` before step 3 named the decision route or the diagnostic field. The existing menu and other diagnostic references did not cover step 3. | `node --require ./.asd/tmp/040-mockups-token-optimization-review-test-fix-wave-1-iter-03-proof.cjs tests/run.js update --filter 'only real update completion'` with a process-only read substitution. `ASD_040_APPROVAL_PROOF=approval` drops the leading `accept-all` token while keeping the choice menu and arrow. `scope` replaces only step 3's backticked `missing` with ordinary prose. Each matched 1/38 and exited 1 in `sprint-040 AC-2: only real update completion offers missing settings through installed asd-init`, at the approval-route and diagnostic-field assertions respectively (`suite impl#20` and `#21`). `reword` replaced step 3's prose while retaining both tokens and the route syntax, matched 1/38 and exited 0 (`#22`). runs: 3 |

Entry 4 added no tests.

## Suite run

- Entry 4 gate evidence: `node tests/run.js contract-agents contract-rules contract-workflows sync-cli sync-render update` passed 152/152 at `c5b1feda4d9eebce86b0af681590106044f0c658` (`suite impl-test#17`). Lint and build passed.
- Command: `node tests/run.js update`
- Scope: impacted
- Scope evidence: The `update` area verifies both write-step tokens, the existing update-completion and CLI retry checks, and the updated init skill release hash. This check verifies the review fix before re-entry.
- Result: pass, exit 0. 38 passed, 0 failed, 0 runner-level skips. One existing file-symlink fixture branch bypassed assertions on Windows.
- HEAD: 1f9b5cf285686f1ca433d3c8d604c843475ea77c
- Provenance: `suite impl#19` under dispatch `review-test-fix wave-1/iter-03`. HEAD matched before and after. Relevant source, generated views, agent memory, tests and stubs were clean, including untracked files.
- Allowance: Entry 3 covers the AC-1 and AC-2 zero-write migration retry and dry preview, linked installed-config refusal at both entry points, and default and explicit CLI input on the supported Node floor. The added fixture lines exercise those boundaries through the actual CLIs and the release migration.
- Line delta: tests +356/−43 (net 313); other +894/−888 (net 6)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
