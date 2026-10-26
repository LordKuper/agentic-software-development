---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
Every site a repo grep finds for phase names, `NEXT:`, count words and retro preconditions (AC-1, AC-7, AC-10). Change required unless marked "no change".

- `.asd/workflows/standard.json`: `cleanup` into `phases` between `impl-review` and `retro`; `next["impl-review"]` = `["cleanup","impl"]`; `next.cleanup` = `["retro"]`; `rollback_reset` unchanged (cleanup follows impl).
- `.asd/workflows/lite.json`: `cleanup` after `design-promote`; `next["design-promote"]` = `["cleanup"]`; `next.cleanup` = `["retro"]`.
- New `.asd/workflows/asd-phase-cleanup.md` and `.asd/skills/asd-phase-cleanup/SKILL.md` (owner: inline orchestrator; dispatches none).
- `.asd/workflows/asd-phase-impl-review.md`: :57 green `NEXT: retro` (standard), :86 exit route, :91 return `<retro|design-promote|impl>` → cleanup.
- `.asd/workflows/asd-phase-design-promote.md`: :34 exit `{"if":"lite","next":"retro"}`, :40 return `<plan|retro>` → cleanup.
- `.asd/workflows/asd-phase-retro.md:8`: entry "advanced from … impl-review (standard) or design-promote (lite)" → cleanup in both; "review DoD met at impl-review" stays.
- `.asd/workflows/asd-phase-pr.md`: :8 "review DoD plus a completed retro" no change (pr must not require a cleanup record); :21-22 content-scoped tests/lint re-run interacts with cleanup commits (AC-5).
- `.asd/workflows/asd-phase-plan.md` step 4 cites "Plan file format" Decomposition rules — no restatement for AC-9/AC-10.
- `.asd/workflows/asd-phase-scope.md`: :44 step 3a seeds placeholders → gains the cleanup placeholder; :25 update branch inherits it.
- `.asd/skills/asd-sprint/SKILL.md`: :54 Step 3 `NEXT:` description gains "`cleanup` always returns `NEXT: retro`"; :49-50 resume/re-run menu generic, no change.
- `.asd/skills/asd-phase-impl-review/SKILL.md:4` ("green completes to retro (standard)"), `.asd/skills/asd-phase-design-promote/SKILL.md:4` ("runs before retro").
- `.asd/skills/asd-init/SKILL.md`: :42 fresh step 2 batch list and :65 step 8a proposal need `cleanup`; :91 re-init 2a and :103 sprint-mediated validation pick a new `t_config.yaml` field up automatically.
- `.asd/rules/sprint-lifecycle.md`: :5 delegation rule (AC-2); :33/:36 lite chain and "committed before `NEXT: retro`"; :43 standard chain; "Impacted test set" :122 safety valve ("`asd-tester` MUST"), :124 "Where impacted-only applies", :128 "Only the terminal full-suite run … measures the final tree" (AC-5); Phase table :144 impl-review exit + new cleanup row; "Self-hosting" :152 writers and sync point; "Optional documents" :162 absent-snapshot rule, :166 placeholder→boolean rule; "No-op phase rule" table needs a cleanup row; "Plan file format" Decomposition rules (AC-9, AC-10).
- `.asd/rules/checkpoints.md`: "Precondition chain" :63 fenced chain, :66 → cleanup requires review DoD, retro requires cleanup; :68 lite line → "`cleanup` requires design-promote"; "Gate inventory" test-removal row (Contradiction 1).
- `.asd/rules/core.md`: :16 glossary phase list; :21 main-orchestrator ownership mirrors the AC-2 exception.
- `.asd/rules/providers.md` "Role-scoped context": add an orchestrator `cleanup` row (today `--phase cleanup` resolves through the `*` row only).
- `.asd/rules/artifact-layout.md`: no change (rotation fires at impl-review→cleanup and cleanup→retro; state keys come from `t_state.json`).
- `.asd/rules/git-strategy.md`: "Commits"/"Commit before review" need cleanup's commit form; "TODO stubs" — removing a marker deletes its row.
- `.asd/rules/code-style.md` §3, §7, §19 bind Dev/Tester only (Risks).
- `.asd/agents/asd-external-review.md:47`: Kept findings table empty-table rule (AC-8).
- `.asd/templates/t_state.json`: top-level `"cleanup": "{{CLEANUP}}"`.
- `.asd/templates/t_config.yaml`: top-level `cleanup:` key (AC-6).
- `.asd/templates/t_decisions-log.md`: removal-record entry shape (AC-4).
- `.asd/runtime.js`: no change (`loadWorkflow` :165-180 validates any phase name; `PHASES` :73 review phases only; `TIMING_KINDS` :100 has `suite`; `retro-candidates` keys on `phase="done"` :657).
- `.asd/sync.js`: no change (walks `.asd/skills` generically :937-946; `--apply` recomputes `canon_hashes`/`upstream_hashes` :1023-1034).
- `.asd/hooks/session-start.js`: no change (next phase derived from the live definition :44-46, :128-132).
- `.asd/release-manifest.json`: `managed_paths` already cover `.asd/skills`, `.asd/workflows`; hashes via `sync.js --apply`; `asd_version` bumped at pr.
- `.asd/migrations/**`: none (Gaps).
- `README.md`: :126 "eleven/nine"; :134 "eleven-phase"; :135 lite chain, "nine-phase"; :155 "eleven mandatory phases"; :137-149 per-workflow table row; :157-178 flowchart node; :180 "before advancing to `retro`"; :182-194 phase table row, :192 "green advances to `retro`"; :277-311 config block; :335 "11 phase orchestration files"; :334/:351/:360 "18 … skill" (not test-checked); :466 FAQ "`retro`/`pr` always run".
- `AGENTS.md` tail: :60, :95 "eleven/nine"; :82 "the 11 `asd-phase-*` skills" (not test-checked). `t_AGENTS.md` no change.
- `CHANGELOG.md`: release section at pr.
- `tests/run.js` §16 (2916-3118): data-driven, fails until every mirror moves together; pinned tokens in Risks.
- `.asd/project/config.yaml`, `commands.yaml`: no change.
- `.claude/agent-memory/asd-dev/project_asd-self-hosting.md:8` "ten phases": already stale → owner's memory-fix.

## Existing docs found
No `docs/` (decomposition disabled); under `self_hosting` the canonical docs are `.asd/rules/`.

- `sprint-lifecycle.md`: "Orchestration and adaptive gates" :5 — sole home of the delegate-only rule; "Workflows" :28 — frozen by name, definitions read live; "Impacted test set" :122/:126/:128; "Self-hosting" :152; "Optional documents" :162 (absent snapshot = every value enabled, no behaviour change); "No-op phase rule"; "Plan file format" Decomposition rules (restating-site grep bullet, edge-semantics bullet — sibling homes for AC-10/AC-9); "State recovery".
- `checkpoints.md`: "Gate inventory" test-removal row; "Gate policy" routine candidate "out-of-scope test deletion"; "Precondition chain"; "Re-run" (a no-op satisfies its successor).
- `core.md`: :16 glossary; :21 orchestrator ownership; :33 infrastructure read-only except self-hosting allowlist; :72 phase skill naming.
- `artifact-layout.md`: "Test plan" — impl-test Tester alone appends the Entry log (orchestrator cannot record cleanup's run in `Suite run`); "Decisions log"; "Scratch directory"; "Agent memory"; SSoT and Documentation economy.
- `git-strategy.md`: "TODO stubs"; "Commit before review"; "PR self-review checklist" ("Full test suite green, once, at the end of `impl-review`"); "Versioning" (`!` → MAJOR).
- `providers.md` "Role-scoped context": `contextRefs` fails only when no row matches.
- `review-policy.md:168`: empty-table rule covers `t_review.md`, not External Review's Kept findings.
- `code-style.md`: binding during impl/impl-test; §3 remove only what your change introduced; §7 no commented-out/dead code; §19 preserve EOL, lint staged form.
- `asd-phase-pr.md:21-22`: re-run skipped only when the code/test/stub diff since the recorded Suite-run HEAD is empty; a failed check blocks.
- `asd-external-review.md:47` (no empty-table rule); `external-review/t_review-report.md:20-22` sample row.
- `asd-init/SKILL.md:91` re-init lists absent `t_config.yaml` fields with the template comment's default.
- `migrations/6.0.0.js:20-22`: retro insertion precedent — no state mutation, in-flight sprints route through the new chain.
- `CHANGELOG.md:445`: retro insertion marked BREAKING.
- `commands.yaml`: test `node tests/run.js`, lint `git diff --cached --check`, build `node .asd/sync.js --check`.
- `.github/workflows/sync-check.yml:19-38`: CI judges `--check` by report items (non-`current` fails; `AGENTS.md` `modified-foreign` exempt), not exit code.
- `plans/*.md`: historical design notes, no chain claims; not a migration target.

## Contradictions
- **C1** — sprint.md AC-4 ("No user approval of the removal list") vs `checkpoints.md` "Gate inventory"/"Gate policy" (test removal gated; out-of-scope test deletion a routine candidate). Winner: `checkpoints.md` (canonical). Test files stay out of cleanup reach; AC-3 names only fixtures and test data no final test uses, test pruning stays impl-test's (code-style §17). Everything else keeps AC-4's no-approval rule.
- **C2** — sprint.md AC-6 ("absent = enabled", frozen at scope) vs `sprint-lifecycle.md` "Optional documents" (absent snapshot = no behaviour change). Definitions are frozen by name and read live, so an upgraded in-flight consumer sprint, and this sprint 028 (no `cleanup` key in its `state.json`), route into cleanup with no snapshot. No canonical side settles it → user decision (step 3b): an absent snapshot reads `enabled` (user, 2026-10-26).

## Existing implementation found
- Routing is generic: asd-sprint Step 3 checks `NEXT:` against `next[<phase>]`; resume/re-run menus read `phases`; `rollback_reset` needs no entry.
- `session-start.js` already shows `Next phase: cleanup` from the definition.
- `sync.js` generates the new skill for both providers; `--apply` adds its hash entries.
- `runtime.js context --phase cleanup` resolves via the orchestrator `*` row; timing kind `suite` fits cleanup's test run.
- No-op mechanism exists (table row + `skipped_phases` append; "Re-run" no-op satisfies successor).
- asd-init re-init 2a and sprint-mediated validation pick up a new `t_config.yaml` field.
- PR open mode already re-runs tests/lint when code lands after the recorded Suite-run HEAD.
- Inline orchestrator file-work precedents: design-promote `git mv`/`git rm`; pr version bump/CHANGELOG; pr inline tests/lint re-run; impl-review clean-worktree entry check committing a dirty timing ledger alone (template for AC-4's checkpoint).
- code-style §7 already bans commented-out/dead code; the leftover-term check sweeps removed-mechanism mentions at impl-test.
- `tests/run.js` §16 derives assertions from the definitions (skill/workflow bijection, return targets = union of `next`, friction line, `'Operation timing'` token, Bash allowed-tools :7849-7858, workflow sections :7915, return-line shape :8008, lite predecessor deltas :3023-3032, README/AGENTS counts and nodes :3037-3118).

## Gaps
- **Criterion check**:
  - AC-1 deliverable; checkpoints' "In `lite`" line must read "`cleanup` requires design-promote" and asd-phase-cleanup.md must bind lite in the "advanced from … design-promote (lite)" form (tests/run.js:3031); retro has no lite delta afterwards.
  - AC-2 deliverable at sprint-lifecycle.md:5; "delegates only X" is ambiguous, so the exception is worded as a mandate; mirror core.md:21.
  - AC-3 deliverable with the reach exclusions (Risks) and C1.
  - AC-4 deliverable: checkpoint = clean tree at entry after committing orchestrator bookkeeping; reverts restore paths from the checkpoint; the removal record must fit `t_decisions-log.md` (Decision ≤3 sentences → paths in Affected docs, or a new one-line form).
  - AC-5 deliverable with caveats: build exit code blind to stale views; lint checks staged content only; the safety valve makes this repo's impacted set the full suite; cleanup joins "Where impacted-only applies" and the safety valve binds the orchestrator in cleanup.
  - AC-6 deliverable as a top-level key in config and state, not under `documents`; open point C2.
  - AC-7 deliverable; "`sync.js --check` clean" = every report item `current` (AGENTS.md `modified-foreign` excepted), not exit 0.
  - AC-8 deliverable at asd-external-review.md:47, worded for Kept findings only (distinct fact from review-policy.md:168).
  - AC-9 deliverable as a sibling bullet in "Plan file format" Decomposition rules; recommended to apply to cleanup's own resume semantics.
  - AC-10 deliverable as a sibling of the "restating site" bullet; binds this sprint's plan for AC-1/AC-7 (site list above is the grep evidence).
  - Mutual consistency: AC-4 "reverts only its own removals" vs AC-5 "fixes autonomously" — fixes limited to consequences of cleanup's own removals; AC-2 vs the tester-only safety valve; AC-5 vs "final tree" (:128 amended).
- **Missing pieces**:
  - Cleanup rule home: reach, exclusions, evidence bar, checkpoint, commit form, verification order, failure bound, record, freeze and absent-snapshot rule — recommended new `## Cleanup phase` section in sprint-lifecycle.md, granted only via a new orchestrator `cleanup` row in providers.md (dev/tester/orchestrator-impl bundles do not grow). Plus a Phase table row and a "No-op phase rule" row.
  - Self-hosting allowlist names only Dev; cleanup's canon removals need the orchestrator named, plus a `sync.js --apply` point after removals, regenerated views and manifest ledgers committed with them.
  - Failure bound: when reverting every removal still leaves a red check, the cause is not cleanup's → `FAILED`, never an unreviewed code fix.
  - Dirty tree at checkpoint: commit the timing ledger alone, then orchestrator bookkeeping; any other dirty path → `FAILED` naming it.
  - Interrupted-cleanup resume (AC-9 style): checkpoint sha to decisions-log before any removal; removal commits after it; record after verification; on re-entry uncommitted paths are the phase's own and are restored from the checkpoint.
  - Commit form: "Commit before review" one-command form over named paths, Conventional `chore`/`refactor` subject, no `ASD-Task` trailer; removing a TODO marker deletes its `stubs.md` row.
  - Seeding: scope 3a gains `{{CLEANUP}}`; state the quoted-placeholder→bare-boolean rule once for both `documents` and `cleanup`.
  - `t_config.yaml`: top-level `cleanup: enabled`, `Values: enabled | disabled`, "Absent field = enabled" comment; README config mirror; asd-init fresh step 2 / 8a list.
- External dependencies: none (dead-code detector out of scope).
- Migration: none required — config absent reads `enabled`; no state mutation (6.0.0 precedent) provided C2's rule is written and no downstream gate reads a cleanup record. CHANGELOG documents the chain change and the `cleanup: disabled` opt-out; MAJOR vs minor decided at pr (6.0.0 marked a phase insertion `!`).

## Risks
- `sync.js --check` exits 1 only on an ownership-marked orphan (sync.js:1470-1472); stale views exit 0 → run `--apply` over stale views and judge by report items as CI does.
- `git diff --cached --check` inspects staged content only → lint inside the one-command commit form, before each commit.
- Cleanup commits land after impl-review's terminal suite, unreviewed: pr open mode re-runs full suite and lint; a red re-run blocks pr with no route back; the re-run is unrecorded (test-plan tester-owned) so each pr re-entry repeats it. Mitigations: safety valve in cleanup's impacted run; failure bound; PR "Verification" names cleanup's runs.
- Autonomous fixes as an unreviewed code-change channel → fixes limited to consequences of cleanup's own removals plus the `FAILED` bound.
- False deletion of dynamically referenced code (reflection, convention, generated use) → "clear evidence" bar, safest-first ordering, revert path, impacted tests.
- Reach must exclude: `.asd/sprints/**`, `.asd/project/**` (except the stub-row deletion), `.asd/tmp/**`, `.claude/agent-memory/**`, generated views, consumer workflow infrastructure, persistent `docs/**`, `test-plan.md`, `manual-steps.md`, test files (C1). Under self_hosting, removing canon prose is a documentation-economy edit (Documentation reviewer's domain) → residue only.
- code-style.md binds only Dev/Tester; scripted removal on Windows can strip CRLF (§19). If §19 binds cleanup, §3 must not (collides with AC-3's pre-existing reach).
- Switch under `documents` would break tests (:2285, :3012) and the hook's collapse test, and per-field fail-closed would invert AC-6's default → top-level `cleanup`.
- Pinned tokens: tests/run.js:5762-5763 fails any asd-phase-scope.md sentence containing both `\bask` and "cleanup"; :4774 pins `final tree` and `entry analysed` in "Impacted test set"; :2922 requires `retro, pr` to end every chain.
- Byte caps (not measured): D13 load ≤0.70 of baseline for dev/impl, tester/impl-test, combined/impl-review, orchestrator/impl (:8329-8348); standalone skills ≤61,051 B (:8318-8323). Edits to `*`-granted sections and to asd-init/asd-sprint grow them → dedicated section/row; check with `node tests/run.js --filter`.
- Mid-sprint upgrade: a sprint at or before impl-review (standard) / design-promote (lite) routes into cleanup via the new `NEXT:` (C2 applies); one already in retro/pr resumes in place — holds only if retro/pr preconditions key on `state.json.phase`, never on a cleanup record.
- Dogfooding: a new skill under `.claude/skills/` takes effect without restart in Claude Code (https://code.claude.com/docs/en/skills); Codex mid-session pickup unverified. Fallback: execute `.asd/workflows/asd-phase-cleanup.md` directly.

## Documentation migration plan
None: no external documentation bears on the touched areas.
