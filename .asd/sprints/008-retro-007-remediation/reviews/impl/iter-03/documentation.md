[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high — 4 findings dropped below floor: 2 medium, 2 low)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| D-1 | high | `.asd/workflows/asd-phase-impl-review.md:74` (SSoT home `.asd/rules/sprint-lifecycle.md:316`; readers `asd-phase-impl-test.md:34`, `asd-phase-impl-review.md:26`) | Step 13 mandates a phase-exit re-run of step 1's diff plus a `derived_handoff` write, justified by "This is the record the next phase reads" — no phase can read it. The field has exactly two readers in the whole repo; the hook reads no key under it and `runtime.js` never touches it. The validity rule requires `base` equality: impl-review's record carries `base` = `iteration_heads["iter-(NN-1)"]` (iter 1: `base_branch`), while impl-test re-entry passes the prior `Entry log` `HEAD analysed` and the next impl-review iteration passes `iteration_heads["iter-NN"]` — neither can ever equal it, so every reader re-derives. impl-review's own exit routes are `NEXT: impl` and `NEXT: retro`, and neither `asd-phase-impl.md` nor `asd-phase-retro.md` mentions the slot at all. Net effect: a whole-repo diff plus a state write on every impl-review exit with no consumer, and AC-11's stated purpose is met only on the impl-test→impl-review edge. `sprint-lifecycle.md:316` carries the same false generalisation ("Written once per phase, by `asd-phase-impl-test.md` and `asd-phase-impl-review.md`"). | Either drop impl-review's write — step 13 deleted, the rule reduced to "written at phase exit by `asd-phase-impl-test.md`", impl-review becomes a pure reader, and the field removed from impl-review's artefacts line — or, if the write is kept for crash recovery, replace the reader claim with the truth ("no current reader matches this record's `base`; retained as a recovery breadcrumb") so nobody preserves it as a live handoff. |
| D-2 | high | `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8` (home: `.asd/agents/asd-reviewer-testing.md` frontmatter) | The memory states the testing reviewer "is granted only Read/Glob/Grep/**Write** (read-only reviewer per `providers.md`)". The canonical grant is `["Read","Glob","Grep","AskUserQuestion"]` with `disallowedTools: ["Edit","Bash","WebFetch"]` and `codex.sandbox_mode: "read-only"`. The memory duplicates a fact whose home is the agent frontmatter and gets it wrong in the one direction that breaks a workflow invariant — reviewers never write, which is what lets the phase workflow own the review file — while dropping the tool its own escalation advice depends on (`AskUserQuestion`). Memory is loaded on every dispatch of this agent, so the wrong grant is asserted into context each iteration, self-contradicting the same sentence's "read-only reviewer" clause. | Replace the tool list with `Read/Glob/Grep/AskUserQuestion` (no `Write`/`Edit`/`Bash`), or drop the enumeration and cite the agent frontmatter as the home — the sentence only needs "no shell, no write". |

## Verified clean

The consolidation round itself landed correctly. The `--apply` parenthetical has one home (`AGENTS.md:74`) with all seven other sites citing `providers.md` "Canonical path -> per-provider path"; that section really does enumerate the four generated view forms, and no site documents a non-working form. `providers.md:111`'s five reserved classes match `runtime.js:12` byte-for-byte including the normalisation that maps `public-contract`, the antecedent now resolves, and `sprint-lifecycle.md` carries a pointer to a heading that exists. `review-policy.md:144`'s union property no longer references the non-existent `validate-partition` helper and no dangling reference remains; the deleted digest check is covered by `validate-ledger`. The deleted `commands.yaml` `sync-apply` alias has zero remaining references in canon, README or rules. The six added tests introduce no in-body comments. Framework mode: README's phase list, agent roster, model tiers, config schema, folder map and command list are unaffected by this diff; `core.md` "See also" still lists every rule doc; the phase chain and template variables are untouched; `release-manifest.json` updates exactly the nine changed canon files with `canon_hashes` for the two render sources and `upstream_hashes` for all nine, and no `managed_paths` change was owed. Generated views are current.

Both defects are wrong-claim defects, not duplication: D-1 documents a handoff nobody can consume, D-2 documents a tool grant the agent does not have.

## Coverage

Validated compact ledger: [`documentation.ledger.json`](./documentation.ledger.json) against [`documentation.manifest.json`](./documentation.manifest.json), findings [`documentation.findings.json`](./documentation.findings.json). `validate-ledger` → `{"ok":true}`. 15/15 files, 10/10 rules, 9/9 sections. The four pre-authorised `n/a` predicates were verified, not assumed.

## Verdict

CONCERNS: 2 (both high)

## Next action

Both are single-sentence edits at their stated locations. D-1 additionally requires choosing between dropping the write and correcting the claim; the drop is the smaller surface and matches "written once per phase" read as impl-test only. Note the choice in the decisions log, since the existing AC-11 tests guard the shape and the SSoT citation but not the readership claim.

## Escalations

None. Note for the orchestrator: neither existing AC-11 test would fail under either suggested fix.
