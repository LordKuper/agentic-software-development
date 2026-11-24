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
| 4 | | delta since entry 3 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1, AC-2 · Current-version shortcut and release hash | Removing the duplicate predicate could let an older installed version bypass a pending migration or leave the recorded updater hash stale. | Existing `update` CLI retry and manifest checks, `contract-rules`, `contract-workflows`, `sync-cli`, `sync-render` and sync build | none | A pending migration must be strictly newer than the installed version and at most the target. No version can meet both when installed is at or above target. The existing CLI test still exercises zero managed writes with a pending migration, including dry preview and the real retry. |
| AC-2 · Approval contract test | An ordinary rewording can break the contract test despite preserving permission to write. | Existing `update` contract test and trace to `core.md` | none | `41eea73` removed two prose assertions. The heading, literal approval choices, real, preview and partial outcome checks, and executable retry coverage remain. `asd-init` Update completion step 3 and the Settings writes invariant still require approval and limit the write to approved missing values. |
| AC-7, AC-8 · Combined reviewer memory index | Shortened cues could make a method hard to locate or break a link in the Claude reviewer's project memory. | `contract-agents` live memory-index bijection plus comparison of link labels, targets and order | none | The Claude view declares `memory: project` and is a live consumer. Both revisions have the same 44 ordered link identities and all targets exist. The owner's commit check passed and the 22 measured Codex phase bundles still match their probe inputs. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

The review-fix removed two assertions from an existing test. No tests were removed or proposed for removal.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

Entry 4 added no tests.

## Suite run

- Pre-strategy evidence: The command below ran before strategy. It passed all six selected areas and is eligible for the impacted gate because this entry needs no test edits and the numbered suite captured the complete affected set.
- Command: `node tests/run.js contract-agents contract-rules contract-workflows sync-cli sync-render update`
- Scope: impacted
- Scope evidence: The enabled safety valve bounds the executable change to the updater's no-op predicate. `update` covers the real CLI and live ledger hash. `contract-rules` and `contract-workflows` scan the changed updater. `sync-cli` and `sync-render` exercise release-ledger checking and loading. `contract-agents` directly checks the live, changed Claude memory index. Shared runtime, sync, test harness, hook and migration code did not change.
- Result: pass, exit 0. 152 passed, 0 failed, 0 runner-level skips. Four existing Windows fixture branches bypassed file-symlink assertions.
- Lint / build: pass. `git diff --cached --check` and `node .asd/sync.js --check` exited 0. All 77 sync targets were current.
- HEAD: c5b1feda4d9eebce86b0af681590106044f0c658
- Provenance: `suite impl-test#17` under dispatch `impl-test entry 4 strategy`. HEAD matched before and after. Relevant source, generated views, agent memory, tests and stubs were clean, including untracked files. No smoke command is configured.
- Allowance: Entry 3 covers the AC-1 and AC-2 zero-write migration retry and dry preview, linked installed-config refusal at both entry points, and default and explicit CLI input on the supported Node floor. The added fixture lines exercise those boundaries through the actual CLIs and the release migration.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
