---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entries

<!-- entries appended below this line -->

## 2026-09-02 — scope approved: doc-links review mechanic + asd-advisor autonomy

- **Decision**: User approved sprint scope with AC-1..AC-8 as written in `sprint.md`. Gated artifacts move to write-then-review-accept (link + delta summary in chat, review in the real file, revise in place); `c4-full/` loses its gate entirely; design-promote loses its final-mutation and per-persistent-write gates but keeps decomposition and new-subsystem gates; a new read-only `asd-advisor` agent absorbs non-gate agent uncertainty.
- **Rationale**: Full-content dumps into chat and redundant re-confirmation of already-accepted drafts are the dominant cost in ASD's user loop. Decomposition/new-subsystem gates are retained because they decide persistent-doc and C4-registry layout, which AC-1's draft acceptance never showed the user.
- **Affected docs**: `.asd/sprints/003-doc-links-and-autonomy/sprint.md`; planned targets `.asd/rules/checkpoints.md`, `.asd/agents/asd-pm.md`, `.asd/agents/asd-advisor.md` (new), `.asd/workflows/asd-phase-*.md`, `.asd/release-manifest.json`, `README.md`.
- **Config note**: per `.asd/project/config.yaml`, `documents.audit: enabled`; `prd`/`ux_spec`/`adr`/`c4` disabled — frozen into `state.json.documents`, so design/design-review/design-promote will collapse to the no-op path after audit.
- **Bootstrap note**: this sprint's own `scope` gate used the old chat-text approve-before-write mechanic; AC-1 goes live starting at this sprint's `plan` gate.

## 2026-09-02 — audit approved

- **Decision**: User approved `audit.md` unchanged (no section re-dispatch). Audit confirms `checkpoints.md` is the gate SSoT with ~6 rule files, 5 workflows, 4 skills, 5 agent files and README/AGENTS.md as mirrors; confirms design-promote has four gate classes, not three, matching AC-4's split; confirms `sync.js` needs no engine change for a 16th agent and `tests/run.js` has no gate/agent-count coverage.
- **Rationale**: Findings are complete and consistent with the approved AC set; the open items it raises are design/plan decisions, not defects in the audit itself.
- **Affected docs**: [audit.md](./audit.md), [sprint.md](./sprint.md)
- **Carried forward to plan phase** (design/design-review/design-promote collapse to a no-op — `documents.prd`/`ux_spec`/`adr`/`c4` all disabled — so these land at `plan`, not `design`):
  - **G-3** — `asd-advisor` dispatch path undecided: (a) agent→agent, adding `Task` to all 15 agents' `claude.tools` (currently zero occurrences, G-4) with Codex subagent-nesting unverified (R-7); vs (b) workflow-mediated relay, new signal token plus a branch in all 10 `asd-phase-*.md`. Requires a user decision, must not be picked silently.
  - **R-2** — advisor consults have no audit trail; needs a durable home (decisions-log line per consult, `<sprint>/advisories/`, or read-only-analysis-only). The clause "never authorizes, never substitutes for a HARD gate" is mandatory regardless.
  - **G-9 / R-6** — `.asd/sync.js --check` is already unclean (`AGENTS.md` `modified-foreign`, pre-existing drift from sprint 002 commit `317aa50`). AC-8 demands a clean `--check`, so the sprint must re-baseline the digest in `.asd/sync-state.json` — a path outside `sprint-lifecycle.md` "Self-hosting"'s exhaustive write allowlist. Route via `/asd-sync`'s `keep-local` path or amend the allowlist; settle at plan time, not mid-impl.
  - **R-5** — live for this repo: `language.chat: ru`, `language.docs: en`, so under write-then-review the user reviews files in a language they do not interact in. Needs a `language-policy.md` rule (self-sufficient delta summary, or key passages quoted-and-translated per the existing quote-translation precedent, without dumping the body).

## 2026-09-02 — design/design-review/design-promote skipped (no documents enabled)

- **Decision**: mechanical, no gate — frozen `state.json.documents` has `prd`/`ux_spec`/`adr`/`c4` all `false`, so per `sprint-lifecycle.md` "No-op phase rule" the three phases collapse to one deterministic skip.
- **Rationale**: no applicable artifact exists for any of the three phases under this sprint's document profile; nothing to gate.
- **Affected docs**: none — `phase` set to `design-promote`, `skipped_phases` gains `["design", "design-review", "design-promote"]`.

## 2026-09-02 — plan approved for sprint 003-doc-links-and-autonomy

- **Decision**: User accepted [plan.md](./plan.md) — 13 tasks, all owner backend-dev, no test-authoring tasks. Acceptance-criteria source is `sprint.md`'s AC-1..AC-8 (`documents.prd` disabled). Every AC has at least one covering task.
- **Rationale**: Task split follows the audit's finding that `checkpoints.md` is the gate SSoT and every other file is a mirror; the dominant risk is a stale mirror surviving unedited (R-1), so the grep sweep is its own task rather than reviewer discretion.
- **Affected docs**: [plan.md](./plan.md), [sprint.md](./sprint.md), [audit.md](./audit.md)
- **Gate mechanic note**: this is the first gate run under the new write-then-review-accept mechanic, per `sprint.md`'s Bootstrap note — `plan.md` was written to disk first, presented as path + delta summary with no body dump, and accepted in place. The `scope` and `audit` gates before it ran under the old approve-before-write mechanic.

### Decisions resolved before decomposition

- **D-1 (audit G-3) — advisor dispatch is workflow-mediated (option b).** A consulting agent emits a new `ADVICE_NEEDED` signal; the dispatching phase workflow catches it, dispatches `asd-advisor`, relays the answer back. **Rationale**: no agent gains `Task`, so the 8 reviewers' read-only contract is untouched; Codex subagent-of-subagent nesting (audit R-7) is unverified in canon and is avoided by construction; matches ASD's existing "workflows delegate, agents return text" topology. **Cost accepted**: a new Signal-vocabulary token plus a uniform relay branch in all 10 `asd-phase-*.md`.
- **D-2 (audit R-2) — advisor consults are not logged (option iii).** **Rationale**: the advisor is read-only, non-binding analysis; the human-visible artifact and its `accept` remain the only gate, so there is no authority to audit. **Binding condition**: `asd-advisor.md` MUST state "never authorizes, never substitutes for a HARD gate" as a hard rule — that clause is what makes the absence of a log safe, and it is not optional.
- **D-3 (audit G-9/R-6) — `.asd/sync-state.json` added to `sprint-lifecycle.md`'s self-hosting write allowlist (option ii).** **Rationale**: it is generated state already written by the sanctioned `sync.js --apply` path, so naming it documents existing behavior rather than loosening the allowlist; that paragraph self-describes as exhaustive, making the omission a defect in the claim. Unblocks AC-8's clean `--check`, which cannot pass while `AGENTS.md` carries pre-existing `modified-foreign` drift from sprint 002 (`317aa50`).
- **G-8 — unlisted gates stay approve-before-write** (clarification, not a user decision). AC-3's artifact list is closed and `sprint.md`'s Out-of-scope section contains nothing contradicting the reading. So `design-md-delta.yaml`'s per-entry gate and `/asd-stack` Phase 6's per-tech-reference write gate are unchanged. **Known seam accepted**: this leaves `/asd-stack` internally mixed (`stack.html` write-then-review, sibling tech-reference writes approve-before-write); recorded in `plan.md` Task 8 so a later reviewer does not "fix" it.

## 2026-09-02 — impl-test: suite green (80/80), 0 added / 0 removed tests

- **Decision**: no-new-test decision for the whole sprint (entry 1, full change surface). Every changed file is rule/agent/workflow/skill prose or auto-recomputed JSON ledger data — no application code changed. `tests/run.js`'s directory-driven per-agent assertion already covers the new `asd-advisor.md` agent generically (no hardcoded agent list), and its ledger-consistency assertion already covers `release-manifest.json`/`sync-state.json`'s recomputed hashes. Prose-correctness verification is impl Task 12's grep sweep + Task 13's `sync.js --check`, both already performed.
- **Rationale**: per `code-style.md` §17, skipping new tests is warranted when the change adds no tested behavior or existing checks already cover the risk — both apply here, verified by reading the actual `tests/run.js` assertions rather than assumed.
- **Suite run**: `node tests/run.js` 80/80 pass; `git diff --check` clean; `node .asd/sync.js --check` 0 drift. HEAD `54176d017`.
- **Affected docs**: [test-plan.md](./test-plan.md)
- **G-5 — decisions-log provenance under revise-in-place**: one entry per artifact at `accept`, not one per revision round (revision rounds are not decisions). To be written as an explicit rule in `checkpoints.md` "Approval recording" by Task 1.

## 2026-09-02 — impl assessment approved

- **Phase**: impl
- **Decision**: impl assessment approved — 13/13 tasks complete, AC-1..AC-8 covered, build (`sync.js --check` 72/72) and lint (`git diff --check`) clean, no sprint-introduced stubs. Advance to impl-test.
- **Rationale**: All plan.md checkboxes ticked; Task 12 grep sweep returned zero stale approve-before-write hits; Task 13 re-baseline landed with a clean `--check`. Two beyond-literal-plan judgment calls presented and accepted: design-promote bookkeeping relocated inline (T3/T9, audit G-6) and the non-blocking post-promotion summary retained as the audit-R-3 compensating control.
- **Alternatives considered**: request changes (no defect found to justify); abort (no blocker).

## 2026-09-02 — impl-review iter-1: FAIL(implementation, documentation) + CONCERNS(quality, testing, simplification, performance, external) → impl fix

- **Phase**: impl-review, iteration 1
- **Decision**: route back to `impl` in review-fix mode. `review_fixes_pending = "iter-1"`; fix set = every finding across all 8 reviewer files, no override, no deferral.
- **FAIL escalation resolved with user** (Complication Approval format, presented and answered): both FAILs share one root cause. AC-3 names 10 in-scope artifacts (`concept.html`, `stack.html`, `DESIGN.md`, `design-system.html`, `accessibility.html`, `prd.html`, `ux-spec.html`, `adr.html`, `sprint.md`, `plan.md`), but only 5 were converted to write-then-review-accept; the five owned by `/asd-concept`, `/asd-stack`, `/asd-design-system` were never touched, leaving `checkpoints.md`'s design-system gate row contradicting the very skill it dispatches. **User chose: implement now** — convert those three skills' final gates to write-then-review-accept in this sprint, honoring AC-3 as originally written rather than narrowing scope. Both FAIL review files carry an "Escalation resolved" note recording this.
- **Rationale**: narrowing AC-3 would ship a rule set whose SSoT (`checkpoints.md`) disagrees with its own dispatch targets — the exact stale-mirror risk (R-1) this sprint exists to eliminate. The gap is mechanical conversion of already-designed mechanics, not new design.
- **Fix-set totals per reviewer** (findings live in the already-written review files, not restated here):
  - [quality.md](./reviews/impl/iter-1/quality.md) — CONCERNS, 11 findings
  - [implementation.md](./reviews/impl/iter-1/implementation.md) — FAIL, 1 high + 5 lower
  - [testing.md](./reviews/impl/iter-1/testing.md) — CONCERNS, 7 findings
  - [simplification.md](./reviews/impl/iter-1/simplification.md) — CONCERNS, 4 findings
  - [documentation.md](./reviews/impl/iter-1/documentation.md) — FAIL, 2 high + 5 lower
  - [performance.md](./reviews/impl/iter-1/performance.md) — CONCERNS, 2 findings
  - [ui.md](./reviews/impl/iter-1/ui.md) — APPROVE, 0 findings (clean; no UI-surface regression from the gate-mechanic change)
  - [external.md](./reviews/impl/iter-1/external.md) — CONCERNS, 8 findings
- **Affected docs**: [state.json](./state.json), [plan.md](./plan.md), `reviews/impl/iter-1/*`; fix targets add `.asd/skills/asd-concept/SKILL.md`, `.asd/skills/asd-stack/SKILL.md`, `.asd/skills/asd-design-system/SKILL.md` to the existing `checkpoints.md` mirror set.
- **Alternatives considered**: narrow AC-3 to the 5 sprint-artifact gates and defer the three skills to a follow-up sprint (rejected by user — leaves `checkpoints.md` self-contradictory in the shipped state); override the FAILs (not offered; no reviewer finding was disputed).

## 2026-09-02 — impl fix for iter-1: findings resolved

- **Decision**: all 38 findings across the 8 iter-1 reviewer files resolved (implementation F-1 + AC-3 completion; documentation #1/#2 + AC-3 completion; quality #1,#3-#11; testing T-1..T-7 marked for correction in a later `test-plan.md` amendment during impl-test re-entry; simplification #1-#4; performance #1-#2; external #1-#8), across four parallel dev dispatches (AC-3 skills; SSoT rule fixes; agent-file cleanups; workflow-file fixes) with disjoint file sets, followed by one centralized `node .asd/sync.js --apply` pass covering all 16 stale generated targets.
- **Verification**: `node .asd/sync.js --check` 72/72 current; `node tests/run.js` 80/80; `git diff --check` clean (CRLF notices only).
- **Affected docs**: `.asd/rules/{checkpoints.md,core.md,language-policy.md,sprint-lifecycle.md,providers.md}`, `.asd/agents/{asd-pm.md,asd-advisor.md,asd-ba.md,asd-ux-designer.md,asd-architect.md}`, `.asd/workflows/{asd-phase-scope.md,asd-phase-plan.md,asd-phase-design.md,asd-phase-design-promote.md,asd-phase-audit.md}`, `.asd/skills/{asd-concept,asd-stack,asd-design-system}/SKILL.md`, `.asd/skills/asd-phase-scope/SKILL.md`, `.asd/release-manifest.json`, generated provider views.
- **Note for impl-test re-entry**: `testing.md`'s T-2/T-4/T-3/T-5/T-6/T-7 findings are about `test-plan.md`'s own record accuracy (not code) — these need `test-plan.md` amendments (deferred-verification record, `AGENTS.md`-drift regression guard, corrected claims) during the next impl-test entry, not a code fix here.

## 2026-09-02 — impl-review iter-2: CONCERNS(quality×7, implementation×1, testing×4, simplification×6, performance×2, documentation×6, external×5) + APPROVE(ui) → impl fix

- **Decision**: no FAIL this iteration (real progress from iter-1's 2 FAILs) — route straight to `impl` review-fix mode, `review_fixes_pending = "iter-2"`, no escalation needed.
- **Correction to iter-1's fix-round record**: the "impl fix for iter-1: findings resolved" entry claimed all 8 external findings were resolved. External iter-2 finding #1 shows `core.md:57` (iter-1 external #7, the `accept`-token-reuse ambiguity between per-section lock-in and gate-advance) was never actually edited — `core.md` does not appear in the iter-1 fix-round diff at all. The claim was inaccurate; noted here rather than silently corrected, per append-only policy.
- **Dominant pattern this iteration**: the iter-1 fix round's `sprint-lifecycle.md` edit changed `ADVICE_NEEDED`'s resume model from same-turn to fresh-dispatch (external iter-1 #5's fix), but three consuming agent files (`asd-ba.md`, `asd-architect.md`, `asd-ux-designer.md`) still say "resumes in the same turn" — flagged independently by quality, simplification, documentation, performance, and external. The same fix round's consult cap (`sprint-lifecycle.md:217`, "3 per consulting-agent dispatch") is structurally unenforceable under the fresh-dispatch model it was written against, since every relay resets the count — also flagged by all five reviewers independently.
- **New findings this round**: implementation/external found the design-system gate's `accept` produces no decisions-log entry (AC-5 gap, unexercised this sprint since `ux_spec` disabled); quality found the 3 setup-skill writers' "Write access restricted to" lists don't authorize the new AC-3 writes (an agent honoring its own restriction would refuse); quality/external found `checkpoints.md` has no table rows for `/asd-concept`/`/asd-stack`'s skill-level gates; simplification found dead code (`tests/run.js:29-31`, unused `readRaw` helper) plus duplication that moved down a level rather than disappearing (`asd-pm.md`, the 3 setup skills, `asd-ux-designer.md`'s triple-stated carve-out); documentation found sprint-local `audit G-8` citations baked into permanent canon (`asd-phase-design.md`) and narrative-not-invariant phrasing in `checkpoints.md`; external found `ADVICE_NEEDED` emission was added to only 4 of 15 dispatchable agents, contradicting AC-6's "dispatchable by any agent".
- **Rationale**: all findings are autofixable (wording corrections, missing rows/entries, dead-code deletion, one structural fix for the consult-cap counter) — none needs Complication Approval, none expands scope beyond `sprint.md`.
- **Affected docs**: [reviews/impl/iter-2/*](./reviews/impl/iter-2/), [state.json](./state.json)
- **Alternatives considered**: none — no FAIL, no override to consider.

## 2026-09-02 — impl fix for iter-3: findings resolved

- **Decision**: all 4 iter-3 findings resolved via 2 parallel dev dispatches on disjoint files (checkpoints.md+asd-phase-design.md; the 3 setup skills), followed by centralized `sync.js --apply` on 6 stale skill-view targets.
- **Fixes**: replaced the sprint-local `AC-2` citation in `asd-phase-design.md`'s c4-full step with the canonical `checkpoints.md` reference; reworded `checkpoints.md`'s "Approval recording" rule to "one entry per accepted gate, naming every path it covers" (making the design-system gate's combined 3-artifact entry correct by rule); added a "Recording scope" clause to `checkpoints.md` distinguishing sprint-phase gates (advance phase + log) from standalone skill gates with no active sprint (log if one exists, else the accepted file is the record); converted `asd-concept`/`asd-stack`/`asd-design-system` skills' per-section loops from present-in-chat-then-write to write-first order matching `core.md`'s Incremental-writing pattern, closing the AC-2 violation quality found in 5 of AC-3's 10 artifacts.
- **Verification**: `node .asd/sync.js --check` 72/72 current; `node tests/run.js` 83/83; `git diff --check` clean.
- **Affected docs**: `.asd/rules/checkpoints.md`, `.asd/workflows/asd-phase-design.md`, `.asd/skills/{asd-concept,asd-stack,asd-design-system}/SKILL.md`, generated provider views.

## 2026-09-02 — impl fix for iter-2: findings resolved

- **Decision**: all 33 findings across the 7 non-clean iter-2 reviewer files resolved via 5 parallel dev dispatches on disjoint file sets (sprint-lifecycle.md+core.md; 4 creator agents; checkpoints.md+asd-phase-design.md+asd-design-system/SKILL.md; asd-concept/asd-stack skill dedup; tests/run.js+test-plan.md via asd-test-engineer per the test-file routing rule), followed by one centralized `node .asd/sync.js --apply` pass covering 14 stale generated targets.
- **Key architectural call made this round**: `ADVICE_NEEDED` emission mentions were REMOVED from the 4 agent files that had them (`asd-pm.md`, `asd-ba.md`, `asd-architect.md`, `asd-ux-designer.md`), rather than added to the other 11 dispatchable agents — matching `plan.md` Task 7's original "one canonical rule referenced from `core.md`, not duplicated into each file" instruction; `core.md`'s autonomy/escalation rule (a Mandatory rule loaded by every agent) is now the sole source.
- **Verification**: `node .asd/sync.js --check` 72/72 current; `node tests/run.js` 83/83; `git diff --check` clean (CRLF notices only).
- **Affected docs**: `.asd/rules/{checkpoints.md,core.md,sprint-lifecycle.md}`, `.asd/agents/{asd-pm.md,asd-ba.md,asd-architect.md,asd-ux-designer.md}`, `.asd/workflows/asd-phase-design.md`, `.asd/skills/{asd-concept,asd-stack,asd-design-system}/SKILL.md`, `tests/run.js`, `test-plan.md`, generated provider views.

## 2026-09-02 — impl-test entry 3: suite green (83/83), no new tests

- **Decision**: delta since iter-2's fix round (13 files) re-verified as prose-only (no application code path parses `core.md`/`checkpoints.md`/`sprint-lifecycle.md` content) except the test-guard hardenings themselves, which were already correctly applied during the iter-2 review-fix round — re-confirmed fresh (tools-array guard non-vacuous, all 5 README count claims checked, `readRaw` fully removed with zero call sites).
- **Rationale**: three consecutive impl-test entries have now independently reached the same conclusion for this sprint's canon-only diffs — no gap to paper over, just a stable characteristic of a framework-rule-prose sprint.
- **Suite run**: `node tests/run.js` 83/83; `git diff --check` clean; `node .asd/sync.js --check` 72/72 current. HEAD `852e70bb5`.
- **Affected docs**: [test-plan.md](./test-plan.md)

## 2026-09-02 — impl-review iter-3: CONCERNS(quality×1, documentation×1, external×2) + APPROVE(implementation, testing, simplification, performance, ui) → impl fix

- **Decision**: no FAIL, 5 of 8 reviewers now APPROVE (up from 1/8 in iter-1). Route to `impl` review-fix mode, `review_fixes_pending = "iter-3"`. No escalation needed — chosen fix directions for both conditionally-escalatable findings (quality #1, external #2) are the non-scope-changing autofix paths.
- **Findings**: (1) quality #1 / high — the 3 setup skills (`asd-concept`, `asd-stack`, `asd-design-system`) still run their whole per-section `Lock in`/`Revise this section` loop BEFORE any write (full section content posted in chat), contradicting `core.md`'s own write-first "Incremental writing" rule and violating AC-2 for 5 of AC-3's 10 artifacts — missed across all 3 prior rounds. Fix direction: convert to write-first order matching `core.md:57`, not a `core.md` carve-out (would narrow AC-2's coverage, needing escalation — not chosen). (2) documentation #1 / high — a fresh sprint-local "AC-2" citation in `asd-phase-design.md`'s c4-full step, same defect class fixed elsewhere in iter-2. (3) external #1 / high — the design-system gate's combined decisions-log entry (3 artifacts, 1 entry) contradicts `checkpoints.md`'s "one entry per artifact" rule; fix by amending the SSoT rule to "one entry per gate, naming every path it covers" rather than splitting into 3 entries (matches the skill's own single-accept design). (4) external #2 / high — `/asd-concept`/`/asd-stack`'s new gates (added iter-2) inherit an unsatisfiable "advance phase + append to sprint log" obligation since these skills run standalone with no active sprint; fix by scoping the recording rule (sprint-phase gates advance+log; standalone skill gates log to the active sprint if one exists, else the accepted file is the record) — not by narrowing AC-5 (would need escalation — not chosen).
- **Rationale**: all four fixes are autofixable, non-scope-changing edits; the alternative (scope-narrowing) paths for #1 and #2's conditional escalations were explicitly not selected.
- **Affected docs**: [reviews/impl/iter-3/*](./reviews/impl/iter-3/), [state.json](./state.json)
- **Alternatives considered**: none — no FAIL, no override to consider.

## 2026-09-02 — impl-test entry 2: suite green (83/83), 3 added tests, T-1/T-3/T-4/T-5 resolved

- **Decision**: added 3 new `tests/run.js` assertions closing the gaps `reviews/impl/iter-1/testing.md` found (T-1: read-only-agent contract, directory-driven over 9 agents; T-3: README/AGENTS.md roster-count vs `.asd/agents/` directory count; T-5: `release-manifest.json` `canon_hashes` completeness for the agents tree). T-4 hardened an existing test by removing the `SELF_SOURCED_ALLOWLIST` exemption for `AGENTS.md`, now that its digest is genuinely `current` — a real fail-first regression guard (fails at parent `317aa50`, passes at HEAD). T-2/T-6/T-7 resolved as `test-plan.md` record corrections (deferred-verification table for AC-4/AC-5's unexercised rows; corrected coverage claims), no code change.
- **Rationale**: all four additions are directory-driven static checks matching the check-ladder's cheapest applicable rung, per `code-style.md` §17 — none re-litigates the sprint's core no-application-code-changed conclusion, they close specific, independently-verified gaps.
- **Suite run**: `node tests/run.js` 83/83 pass; `git diff --check` clean; `node .asd/sync.js --check` 72/72 current, 0 drift. HEAD `7347537fa`.
- **Affected docs**: [test-plan.md](./test-plan.md)

## 2026-09-02 — correction: impl-test entry 2's suite-run HEAD

- **Decision**: correction: impl-test entry 2's suite-run HEAD is `03b492036c4c46f284651235daa980871e9d6aaa`, not `7347537fa851ae8970cf24306b323be77e8b5474` — the earlier sha was the entry's delta BASE (pre-test-authoring), conflated with the suite-run commit in the original entry above. `test-plan.md`'s Suite-run section stamps the correct commit (the one 83/83 was actually verified at); this entry is append-only and left as originally written.
- **Rationale**: two records must not disagree about which commit the suite-run result attests to, since that is what the `pr`-phase gate reads.
- **Affected docs**: [test-plan.md](./test-plan.md)

## 2026-09-02 — impl-test entry 4: suite green (83/83), no new tests

- **Decision**: delta since iter-3's fix round (6 files) re-verified as prose-only. Considered and rejected adding a genuinely new automatable invariant for the write-first section-order change (would need either a brittle string-position heuristic or a full agent-dispatch simulation harness — new test infrastructure requiring Complication Approval, out of scope for a wording/ordering fix). `checkpoints.md`'s reworded recording rule + new scope clause likewise prose-only, same category as every prior `checkpoints.md` edit this sprint.
- **Rationale**: no code path simulates or replays a skill's phase sequence — only frontmatter + render is asserted; manual cross-file consistency review (impl-review reviewers) remains the correct verification path for this class of change.
- **Suite run**: `node tests/run.js` 83/83; `git diff --check` clean; `node .asd/sync.js --check` 72/72 current. HEAD `487e65fc8`.
- **Affected docs**: [test-plan.md](./test-plan.md)

## 2026-09-02 — impl-review iter-4: CONCERNS(quality×4, implementation×1, simplification×1, external×2) + APPROVE(testing, documentation, performance, ui) → impl fix

- **Decision**: no FAIL, 4 of 8 reviewers APPROVE. Route to `impl` review-fix mode, `review_fixes_pending = "iter-4"`. No escalation — all findings autofixable within sprint scope. Next iteration (5) moves to severity floor `critical`.
- **Findings**: (1) quality#1/high — unconditional skeleton-write in the 3 setup skills is reachable from Edit mode and would overwrite an already-approved persistent doc with placeholders (content-loss bug); fix: skeleton write only in create mode. (2) quality#2/high — `asd-design-system` Phase 7's feedback loop-back never re-runs Phase 5 (design-system.html regen) or designmd-lint, contradicting the file's own "never left stale" rule. (3) quality#3/high — same defect in `asd-stack`: Phase 7 loop-back never re-runs Phase 5-6 (tech-reference), can emit COMPLETED with a tech lacking its required doc. (4) quality#4 + external#1/high — `checkpoints.md`'s "Recording scope" clause (b) has no permitted writer for the "sprint exists" branch (no skill detects sprint state or appends to decisions-log) and omits `/asd-design-system`; fix: drop the sprint-exists branch entirely (accepted file in git history is the record), add `/asd-design-system` to the standalone list. (5) implementation#1/high — `asd-design-system`'s Hard rule "designmd-lint MUST pass before write" contradicts the write-first order; reword to gate Phase 5 regen + Phase 7 accept, not section writes. (6) simplification#1/critical — the "write not deferred, only accept is" fact restated 3× in `asd-design-system` (sibling skills state it once); delete/relocate. (7) external#2/high — write-first conversion's skeleton includes placeholder optional sections; option `C) Skip` has no removal step, leaving stub placeholders in the artifact presented at `accept` (regression from iter-3's fix); fix: Skip removes the section from disk.
- **Rationale**: all seven fixes are autofixable — bug fixes and clarifying rewordings inside files already in sprint scope, no new abstraction, no AC change.
- **Affected docs**: [reviews/impl/iter-4/*](./reviews/impl/iter-4/), [state.json](./state.json)
- **Alternatives considered**: none — no FAIL, no override to consider.

## 2026-09-02 — impl fix for iter-4: findings resolved

- **Decision**: all 7 iter-4 findings resolved via 4 parallel dev dispatches on disjoint files (`checkpoints.md`; and one each for `asd-concept`/`asd-stack`/`asd-design-system` SKILL.md, since `asd-design-system` alone carried 4 findings), followed by centralized `sync.js --apply` on 6 stale skill-view targets.
- **Fixes**: `checkpoints.md`'s "Recording scope" clause dropped the unreachable "append if sprint exists" branch entirely (no skill detects sprint state) and added `/asd-design-system` to the standalone-gate list; all three setup skills' skeleton-write step now fires create-mode-only (edit mode skips it, preventing the content-loss bug); all three skills' `Skip` option now removes the section's placeholder from disk instead of leaving a stub; `asd-design-system` and `asd-stack`'s Phase 7 loop-back now re-runs the derived-artifact regeneration (design-system.html + lint; tech-reference + lint) before re-accepting; `asd-design-system`'s lint Hard rule reworded to gate Phase 5/7, not section writes; the triple-restated deferral fact trimmed to one instance.
- **Verification**: `node .asd/sync.js --check` 72/72 current; `node tests/run.js` 83/83; `git diff --check` clean.
- **Affected docs**: `.asd/rules/checkpoints.md`, `.asd/skills/{asd-concept,asd-stack,asd-design-system}/SKILL.md`, generated provider views.

## 2026-09-02 — impl-test entry 5: suite green (83/83), no new tests

- **Decision**: delta since iter-4's fix round (5 files) re-examined fresh — this round fixed real conditional-logic bugs (create-mode-only guards, loop-back regeneration requirements), not just wording. Considered a structural anchor-phrase check but rejected it: such a check can't fail on the actual bug class this round fixed (an incorrectly-wired guard) while passing on correct prose — it would only assert word presence, not correct wiring. A real invariant would need an agent-dispatch simulation harness this repo has never had — still out of scope, still Complication-Approval territory.
- **Rationale**: the rejection basis is round-specific (runtime/filesystem-state-dependent behavior, not merely absent test infrastructure), re-derived rather than restated from entries 2-4.
- **Suite run**: `node tests/run.js` 83/83; `git diff --check` clean; `node .asd/sync.js --check` 72/72 current. HEAD `1b9e49fd2`.
- **Affected docs**: [test-plan.md](./test-plan.md)
