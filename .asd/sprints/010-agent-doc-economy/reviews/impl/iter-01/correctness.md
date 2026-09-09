[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 1 (attempt 2 — attempt 1 was interrupted at the host turn limit, `friction-log.md` F-3)
- **Severity floor**: low
- **Ledger status**: NOT VALIDATED — see "Ledger deviation" below. Findings and the AC trace stand as evidence for the fix round; the verdict token is not counted toward this iteration's DoD, and this reviewer is re-dispatched fresh next iteration against a corrected manifest.

## Findings

### CR-1 — medium — contracts

**Location**: `.asd/workflows/asd-phase-impl.md:11-16` (`## Operations used`) against `:96` (step 9)

AC-5b's new gate condition — the round's diff, committed plus still uncommitted, read before committing or advancing — is an unauthorised-path check that can only be answered by running git, since uncommitted work is invisible to a file read. The workflow's `## Operations used` block grants only read, write-a-file, request-user-decision, delegate and append-friction; the file contains no `run command` operation and no git invocation anywhere. Both sibling workflows that read git declare it explicitly. Operations map to host tools per `providers.md`, so the obligation is stated at the acting site but not granted there — the recurring rule-with-no-acting-site-binding defect class. `tests/run.js:3684-3696` pins the step-9 prose only, so nothing catches the gap.

**Suggested fix**: add to `## Operations used` a `run command` line covering `git status --porcelain` / `git diff` for step 9's authorised-paths read, in the same one-line shape as the impl-test and impl-review declarations.

### CR-2 — low — bugs

**Location**: `.asd/sync.js:296`

D-1's fix moved Claude `effort` validation to the emission site, which is correct for the model-less case, but the site is guarded by truthiness. A canonical agent declaring `"effort": ""` — or `0`, or `false` — is falsy, so the validator never runs, no `effort:` line is emitted, and `--check`/`--apply` stay green, while canon and the README tier table claim an effort the generated view does not carry. That is the silent-divergence failure `audit.md` C-10 describes, in a narrower case; `EFFORT_VOCABULARY.claude` would reject the empty string if it were reached.

**Suggested fix**: guard on `c.effort !== undefined` instead — absent stays valid, present-but-empty fails closed like every other invalid value.

### CR-3 — low — AC coverage trace

**Location**: `.asd/sprints/010-agent-doc-economy/plan.md:122-123` (AC-10)

Task 13's first two subtasks are unticked, but both landed: the authoring obligation is in the rule's own home at `artifact-layout.md:197`, and `code-style.md:11` names both iron rules. `asd-phase-impl-review.md` preconditions require all plan checkboxes ticked at first entry, and `retro` and `pr` read the plan as the task-status SSoT, so AC-10 reads half-delivered against text that is actually complete. Raised under the `review-policy.md` "Change-surface rule" exception — the landed rule text is what made these boxes wrong. Task 11's second box is legitimately unticked: it carries an explicit reassignment note.

**Suggested fix**: tick `plan.md` Task 13 subtasks 1 and 2.

## AC coverage trace (source: `sprint.md` AC-1 … AC-10, `documents.prd` disabled)

- **AC-1** satisfied. `sprint-lifecycle.md:312` defines the wave declaration once — plan-level table in the required `## Dependencies`, alone-in-its-wave rule, partition property, named consumer, pre-rule fallback; `asd-phase-plan.md:39` assigns waves at authoring time; `asd-phase-impl.md:51,56,60` parse and schedule from the table with the inter-wave barrier; `t_plan.md` gives it a required slot inside the parser-critical comment. No canon file still calls `## Dependencies` optional.
- **AC-2** satisfied. `git-strategy.md:39` extends the existing parenthetical with all four commands, states the ban unconditionally for a dispatched agent and holds the conditional permission with the orchestrator (G-3); mirrored at `custom-coding-rules.md:12`.
- **AC-3** satisfied. The same sentence adds the second carve-out member; `review-policy.md:42` names the concurrency case as a pointer; `artifact-layout.md:87` defines when co-authorship can arise (G-4).
- **AC-4** satisfied. `external-review.md:37` appends an `F-N` friction entry beside the decisions-log write, as a pointer.
- **AC-5** satisfied. `code-style.md:120` carries the restore obligation and the mutation-left-on-disk clause; `asd-phase-impl.md:96` places the diff read in step 9, the all-modes gate, spanning committed and uncommitted, marked distinct from §19. See CR-1 for the operation grant.
- **AC-6** satisfied. `review-policy.md:115` partitions the eight rejection classes; `:119` splits enforcement into one transcription then pass-or-reject, and both workflows carry the second branch. Interrupts are explicitly kept out of the transcription branch. `runtime.js:16` builds `LEDGER_ROW_EXAMPLE` from `LEDGER_VOCABULARY.p`, so it cannot publish a row the validator rejects; stamped, digest-covered, equality-validated with the backward-compatibility branch, exported, documented.
- **AC-7** satisfied. `artifact-layout.md:195-201` — one canonical home beside the SSoT iron rule, reach stated, three named decision tests, cut list, preserve list, the FAIL consequence, within a paragraph plus two lists. Enforceable through the rubric bullet, and `review-policy.md:101` states the rubric-ID derivation that makes it a manifest id (G-9).
- **AC-8** satisfied. The corpus audit records per finding the file, the defect and the authority, with the bytes-per-dispatch evidence unit, a carried-forward table and an explicit considered-and-cleared list.
- **AC-9** satisfied as far as a read-only review can verify. Spot-checked the riskiest deletions and found no rule left homeless: E-1's removal is fully owned by `review-policy.md:148-168`; E-3's two pointers resolve and `core.md` lists all twelve rule docs; E-12's pointers keep only what each file owns; E-11 left every phase skill's load-bearing execute line intact; E-6 has one home cited from both granted roles; E-20's dangling pointer is fixed; E-22 is a role-row scope, not a trim; all five verdict tokens and all eleven agents' structural sections survive. README mirrors the changes.
- **AC-10** satisfied in canon. `artifact-layout.md:197` binds the tests at authoring time without displacing the enforcement sentence; `code-style.md:11` sends authors to both iron rules by name; `providers.md:94-105` grants `artifact-layout.md` to every fixed-context role, the sole exemption being `asd-advisor`, which persists nothing. Plan bookkeeping lags — CR-3.

No code change lacks a traceable AC or plan task; no AC is partially implemented without a recorded follow-up.

## Ledger deviation

This reviewer resolved all 56 file rows, all 6 rule rows (one as `n/a` on the authorized UI-surface predicate) and all 4 section rows, and returned them bound to manifest digest `304cd767…`. The manifest on disk now digests to `2990ccc7…`: the orchestrator corrected and re-stamped it while this dispatch was in flight, which is defect **F-2** in `friction-log.md`. The underlying reason for the correction was **F-1**, the flat `n_a` shape, which would have rejected this reviewer's single truthful `n/a` row against the original manifest. Neither is a reviewer fault, and the findings and AC trace do not depend on the ledger. Per `review-policy.md`, a verdict without a validated ledger does not count toward DoD, so this iteration does not record it as satisfied.

## Verdict

CONCERNS: 3

## Next action

Route to `impl` review-fix mode. CR-1 is one line in `asd-phase-impl.md` `## Operations used`; CR-2 is one guard in `.asd/sync.js`, non-render canon, so refresh `release-manifest.json` `upstream_hashes` in the same commit and re-run `node tests/run.js` and `node .asd/sync.js --check`; CR-3 is plan bookkeeping.

## Escalations

None. No architecture change, no new abstraction, no contract break, no scope expansion.

## Note recorded by the reviewer

The dispatch's injected `AGENTS.md` snapshot and git-status block showed `main`'s pre-sprint content rather than the branch under review; quoting them would have produced false findings against text the branch had already reduced to pointers.
