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

## Touched areas (amendment AC-11..AC-19)
Repo-grep site lists (AC-10); generated views, `.asd/sprints/**`, `CHANGELOG.md`, `plans/`, `.asd/project/decisions-log.md`/`retro-backlog.md` excluded. Removed names = `asd-ba|ux|architect`, `asd-reviewer-correctness|testing|documentation`, `asd-dev-critical`, `asd-tester-critical|mechanical`; reviewer keys `correctness|testing|documentation`; routing tier `critical` (never finding severity).

- **Agents**: delete `asd-ba.md`, `asd-ux.md`, `asd-architect.md`, `asd-reviewer-correctness.md`, `asd-reviewer-testing.md`, `asd-reviewer-documentation.md`; add `asd-reviewer-quality.md` (opus/high, sol/high, web). `asd-dev.md`: drop `critical`, base → sonnet/high, mechanical gains `effort: high` and luna/high (`variantMeta` drops effort unless the variant declares it, sync.js:967). `asd-tester.md`: drop both variants, base → sonnet/high. `asd-reviewer-efficiency.md`: → opus/high plus new rubric entries. `asd-reviewer-combined.md`: composes quality + efficiency. `asd-advisor.md`: contract change (AC-17). `asd-external-review.md`: unchanged.
- **Workflows**: `standard.json` `reviewers.design`/`impl` = `["quality","efficiency","external"]`; `lite.json` unchanged. `asd-phase-scope.md` :3, :30, :32, :51; `asd-phase-audit.md` :3, :20 (`read_plan`/`AUDIT_BATCH_THRESHOLD_FILES` recipient), :21, :22, :24, :30, :42; `asd-phase-design.md` :3, :24, :31, :36, :40, :46, :52-53, :59; `asd-phase-design-review.md` :3, :37, :46-49 (creator fixes), :55, :56, :62, :69 (explicit reviewer names); `asd-phase-design-promote.md` :3, :21-23, :28; `asd-phase-impl-review.md` :29 (UI predicate owner), :51, :56 (tester routing), :74 (`correctness`/`testing` input rule); `asd-phase-impl-test.md` :20; `asd-phase-impl.md` :32, :33 (`<agent>-<tier>`).
- **Skills**: `asd-concept`, `asd-stack`, `asd-design-system` — delegation becomes inline steps (`## Delegates`, `context --role` lines); descriptions of `asd-phase-scope|audit|design|design-review|design-promote|impl-review` SKILL.md :4; `asd-init:74` ("Architect fills it").
- **Rules**: `providers.md` — Role-scoped context (remove 14 creator rows and 9 removed-reviewer rows, add quality rows, augment orchestrator scope/audit/design/design-review/design-promote rows, add concept/stack/design-system rows), "Conditional grants" :151-152, "Task-class variants and routing" :161, :163, :169. `review-policy.md` :85, :98, :163, :166, :194-198, :205-209, :215, :217 (:57, :75 Efficiency stay). `sprint-lifecycle.md` :5 (AC-2 + AC-12), :9, :17, :20, :36, :136-140, :144, :194, :215-225, :302, :306, :342. `core.md` :20-22, :49. `agent-protocol.md` :11, :13, "Relay". `artifact-layout.md` :114, :140, :179, :181, :223, :227 (SSoT FAIL → quality, economy FAIL → efficiency). `git-strategy.md` :17, :59. `design-system.md` :3, :83; `ux-principles.md` :3. `external-review.md` :99.
- **Runtime/generator**: `runtime.js` :36 `INTERNAL_REVIEWERS`, :41 `COMBINED_RUBRICS`, :66-71 `NA_TARGETS`, :455 noDocs, :491, :497-500 `reviewerFiles`, :311-321 `routeTask`, :33-34 `AUDIT_BATCH_THRESHOLD_FILES`; `sync.js:972` `VARIANT_SUFFIXES`. Hook: no change.
- **Templates**: `t_audit.md:12`, `t_c4-model.c4:2`, `t_c4-views.c4:2`, `t_custom-design-rules.md:10`, `t_test-plan.md:5,:75`, `t_manual-steps.md:4`, `t_review.md:5`, `external-review/t_prompt-external-design.md:71`.
- **Migration/manifest**: new `.asd/migrations/14.0.0.js` (AC-18); manifest hashes via `sync.js --apply`, `asd_version` → 14.0.0 at pr; `model_families` unchanged; `4.0.0.js:37` lists `asd-reviewer-quality` as retired (Risks).
- **Generated views**: `.claude/agents/`, `.codex/agents/` 16 → 8 each (9 removed per provider); CI `sync-check.yml` fails until deleted.
- **Agent memory** (tracked): asd-architect 3, asd-dev-critical 16, asd-reviewer-correctness 10, -documentation 4, -testing 8, asd-tester-critical 4; asd-pm 4 already ownerless; live files naming removed agents in correctness, documentation, testing, combined, asd-tester/MEMORY.md, dev-critical.
- **Mirrors**: `README.md` :5, :17, :159-168, :184-192, :220, :228-236, :238, :242, :246-253, :255, :333, :350, :356, :433, :436; `AGENTS.md:83`; `CHANGELOG.md` (MAJOR); `.asd/project/custom-design-rules.md:10` project-owned, outside the Dev allowlist.
- **Tests** (`tests/run.js`): 165, 1043, 1091 (`Seven` missing in `WORD_TO_NUMBER`); 2437-2443, 3364-3429 (routeTask critical); 3554-3700; 4321; 4536-4670, 5307-5509, 5667-5695, 6559-6662 (fixtures); 4912, 5736, 5911, 5931-5937, 5973, 8020, 8063; 7019, 7361, 8302; 7215-7275; 7308, 7350, 7602-7614; 8104, 8130, 8165-8183, 8306 (scope Owner "dispatches none" pin inverts); 1517-1623, 1814 (`asd-reviewer-quality` retired-orphan fixture name).

## Existing docs found (amendment AC-11..AC-19)
- `providers.md`: Role-scoped context (runtime-read; variant reads as base via `VARIANT_SUFFIXES`); Orphan detection (`--apply` deletes a marked orphan only when named); Task-class variants and routing (`critical`, `priorTier` clamp, suite-run ids); Model family resolution; Emitted agent frontmatter.
- `review-policy.md`: Over-engineering/Structure checklists; Autofix vs escalation (memory-fix, ownerless memory deleted); Low-severity test-only findings (location-based `isTest`, fixer `asd-tester`); Gate Verdict Format; Reviewer responsibility; DoD per review phase.
- `sprint-lifecycle.md`: Workflows (read live → roster changes for in-flight sprints); APPROVE latch (keys = verdict keys); State recovery (absent required key blocks impl-review and pr step 1; failed dispatch anchored on routing line); Staged solution design (BA scope rules, offline FAILED path); Design-promote phase; Agent liveness.
- `agent-protocol.md` "Relay": ADVICE_NEEDED creator-only, unlogged, cap 3; advisor `FAILED` on a HARD gate.
- `core.md` Autonomy and escalation, Incremental writing; `checkpoints.md` Gate policy/Gate inventory (review-cap override, stalemate, FAIL waiver, abort hard but not inventory rows).
- `artifact-layout.md`: Agent memory, Tech reference docs, HTML shell placeholder table, SSoT and economy iron rules.
- `asd-phase-audit.md` "Rules" holds nearly all architect audit rules; `t_adr.html:15,:27-39`, `t_tech-reference.md:12` already carry ADR consequences/alternatives, subsystem chip, `Last verified`.
- Migrations `4.0.0.js` (retired-view deletion, marker-gated), `6.0.0.js` (active-sprint `state.json` rewrite); `update.js` propagates canon deletion; afterwards only `sync.js --check` runs. `asd-sync` SKILL has no orphan branch.
- Host docs: Claude Code subagent `effort` depends on model (https://code.claude.com/docs/en/sub-agents); `haiku` = Haiku 5.5 with effort on the Anthropic API only, Haiku 4.5 (no effort) on Bedrock/Vertex/Foundry (https://code.claude.com/docs/en/model-config). `gpt-6-luna` `high` confirmed only by secondary sources (https://pi.dev/models/openai-codex/gpt-6-luna?name=pi, https://codersera.com/blog/gpt-6-luna-complete-guide-2026/); sync.js:178 rejects only `ultra` on luna. Codex top-level `web_search` defaults to `cached`.

## Contradictions (amendment AC-11..AC-19)
- **AC-17 reach** — settled by user: failures and questions only (sprint.md AC-17 reworded).
- **C3** — `asd-architect.md` Rules ADR doc-level `SUBSYSTEM` (shared id/`N/A`/`project`) vs `artifact-layout.md` "HTML shell wrapping" (`sprint` for sprint-scoped artifacts). Winner: `artifact-layout.md` (canonical), no gate; per-ADR `subsystem:` chip keeps id or `N/A`.

## Existing implementation found (amendment AC-11..AC-19)
- Rosters data-driven: `reviewerKeys(node)` = union of definitions' `reviewers[node]`, validated by `persist-review`/`emit-manifest`; impl-review dispatches `asd-reviewer-<key>`; test 165 requires an agent per key; `COMBINED_RUBRICS` composition reusable for quality + efficiency.
- Name-independent: severity floors, waves, counters, `iteration_heads`, review-fix collection, test-file finding routing to `asd-tester`, low-severity in-place fix.
- `rubricIds` (runtime.js:404-412): `###` headings win; bullets count only with no `###`.
- sync.js accepts haiku+effort and luna/high; `contextRefs` maps variants to base and accepts any phase string.
- Orphan/migration precedents (4.0.0, 6.0.0), update.js `delete`, leftover-term check, ownerless-memory deletion.
- Measured loads (LF bytes, D13 method): orchestrator/impl 135,218 / cap 144,148 (headroom 8,930); dev/impl 87,111 / 134,230; tester/impl-test 79,423 / 110,577; combined/impl-review 96,853 / 127,017; standalone skills 60,699 / 61,051 (352). Uncapped orchestrator loads: scope 98.3 KB, audit 90.8, design 91.8, design-review 159.2, design-promote 89.1. Creator-only refs the orchestrator row lacks: scope +15.5 KB, audit +31.2, design +23.5, design-review +23.9, design-promote +29.2, concept +15.5, stack +24.0, design-system +18.4.

## Gaps (amendment AC-11..AC-19)
- **Criterion check**:
  - AC-11 deliverable; tester has no `variants`; folder map "8 agent definitions: 7 roles + 1 tier variant".
  - AC-12 deliverable: the sprint-lifecycle.md:5 rewrite carries AC-2's cleanup exception and admits memory-fix dispatches to surviving owners; standalone skills must net-shrink (352 B headroom); moved rules go to rule/workflow sections granted by orchestrator rows, never skill bodies; new orchestrator rows for concept/stack/design-system.
  - AC-13 deliverable; design-review needs explicit name edits.
  - AC-14 deliverable only if (a) each former testing/documentation bullet becomes its own `###` in quality, (b) `NA_TARGETS` rekeyed and noDocs retargeted, (c) `reviewerFiles` gives quality and combined scope plus `--test-plan` (lite combined gains test-plan review).
  - AC-15 deliverable; haiku effort only where `haiku` resolves to Haiku 5.5; luna/high accepted by sync, secondary-source only.
  - AC-16 deliverable only with: a tester dispatch anchor line replacing the routing line Failed dispatch depends on; legacy `priorTier: critical` read as `standard` or migrated; Material-risk prose reworded; tester `execution: command` path gone.
  - AC-17 deliverable only by changing the advisor contract (always recommend, name the hard gate, never authorize; Relay step 4 → advice naming a hard gate makes the agent return `QUESTION`). Reach wording ambiguous (inventory rows like new subsystem, test removal, PR publication are not phase transitions; "and the like" is open-ended) → user decision. Escalation sites outside the inventory: audit migration deletion/contradiction; design-promote doc rename; design-review reviewer question, FAIL escalation, review-cap; design token; impl-review reviewer question, FAIL escalation, review-cap; impl-test stalemate; impl manual steps; plan stub disposition; scope abort ×2; Relay `QUESTION`; FAILED relays; External Review stalemate; second interruption; second stall; scope stage-(b) failure and ambiguity; audit 3c; design-system lint exclusion; tech-reference-missing; asd-sprint menus (dirty tree, update, release retry, resume, fast-forward refusal); Complication Approval. Also needed: orchestrator-only consult branch in agent-protocol.md "Relay"; an Advisor line in core.md "User-decision presentation format"; advice recorded with the answer; one consult per request; advisor-unavailable fallback; advice never turns an escalation into an adaptive pass.
  - AC-18 deliverable via 14.0.0.js: (a) delete marked views of the 9 retired names; (b) rewrite active `state.json` verdicts and `latched` — `quality` satisfied when every legacy key present is satisfied, else the most severe token, `latched.quality` only when all three latched, old keys kept; (c) `task_routing[*].tier: critical` → `standard` unless runtime tolerance. Without (b) a standard sprint past impl-review blocks at pr step 1. Lite unaffected. CHANGELOG warns about leftover consumer memory (pre-4.0.0 `asd-reviewer-quality/`). Supersedes the earlier Gaps line "Migration: none required … MAJOR vs minor decided at pr".
  - AC-19 deliverable; add `Seven` to `WORD_TO_NUMBER`; README tier sentence drops `-critical`.
  - Consistency: AC-12 and AC-2 edit the same rule; AC-17 covers AC-5's cleanup `FAILED` bound; AC-11 memory deletion breaks tests pinning those files; AC-16 and AC-11 agree.
- **Rule survival (AC-12)** — no other home once bodies are deleted: Architect — likec4 lint/validate and mermaid fallback after one failed retry; subsystem ids identical across registry, c4, PRD/ux-spec/code; no secrets in stack docs, fetch canonical docs by URL with `Last verified`; ADR set completes before one accept. BA — atomic ACs (one assertion), story↔AC cross-reference, no AC without a story; quote the source when reverse-engineering; dropped requirement/conflict → user decision. UX — mockup states (empty/loading/error), no a11y rules in sprint scope; Token decisions (all proposals in one decision, delta before use, lite token gate); DESIGN.md spec fetch fails twice → halt; design-system.html regeneration owner.
- **Cadence**: inline authoring states whether per-section lock-in (core.md "Incremental writing") or whole-artifact accept applies; "never invent extra mandatory pauses" favours the latter.
- **AC-14 mapping** (⚑ = check AC-14's wording does not name; the plan names it in a rubric heading):

| Check (source) | Home |
|---|---|
| Correctness: draft correctness (AC completeness, contract soundness, ADR decision soundness ⚑) | quality |
| Correctness: bugs; security; contracts (drift, reversible migration, backward_compat) | quality |
| Correctness: best practices ⚑ | quality (web) |
| Correctness: AC coverage trace | quality |
| Correctness: UI conformance and self-hosting carve-out | quality |
| Testing: check-ladder risk fit | quality = adequacy; efficiency = cost (over-leveled, redundant, hypothetical-risk tests) |
| Testing: removal validity ⚑, `none` honesty ⚑, fail-first, meaningfulness, determinism, coverage, edge cases, manual verification | quality |
| Documentation: SSoT, traceability, persistent actuality, stub resolution, framework mode ⚑ | quality (SSoT FAIL → quality) |
| Documentation: template adherence ⚑, HTML shell wrapping ⚑, provenance ⚑, custom rules consistency ⚑ | quality |
| Documentation: in-code doc comments ⚑ | quality (efficiency keeps "comment that restates code") |
| Documentation: documentation economy | efficiency (economy FAIL → efficiency) |
| Efficiency: over-engineering, structure/cohesion, complexity-vs-value, performance, cross-reviewer guard | efficiency |
| New: duplication/reuse, runtime token cost, change-size proportionality, test-suite cost | efficiency |
| Combined: overall quality, lite actuality carve-out, manual-verification rows | combined / quality |

- **Other missing pieces**: a site where the orchestrator writes a missing tech reference (`artifact-layout.md:181`); `t_custom-design-rules.md` reader line; rename the 4.0.0 test fixture; optional asd-sync orphan branch.

## Risks (amendment AC-11..AC-19)
- Untrusted web content (stage-(b) research, tech-reference and DESIGN.md-spec fetches) now enters the privileged orchestrator context (`core.md` "Untrusted-data boundary").
- Inline quality depends on the session model; Codex main-session `web_search` defaults to `cached` (creators had `live`).
- Context bloat: full audit and drafts accumulate; compaction can hit mid-artifact → disk-first writing.
- Lost tool-policy bounds (no git writes, no infra edits, `likec4 build`, `designmd-install`, write allowlists) must become rule text.
- Quality overload: one dispatch carries ~22 rubric entries; turn budget and interruptions rise on large waves (`LARGE_WAVE_FILES`/`WAVE_THRESHOLD_FILES` tuned for narrower reviewers).
- Cost/latency: efficiency sonnet → opus; advisor (fable/high) consults precede escalations.
- D13 headroom: orchestrator/impl 8,930 B; AC-17 text in whole-file `core.md` charges every role; AC-16's routing shrink frees bytes.
- Dogfooding: 028 is `lite` — combined's rubric follows live agent files; a task routed `critical` before the runtime change fails `priorTier` afterwards.
- Memory deletion loses method content (asd-dev-critical CRLF/heredoc/sync-ledger gotchas; reviewer methods).
- Name reuse: `asd-reviewer-quality` retired in 4.0.0.js:37 — stale pre-4.0.0 consumer memory loads into the new reviewer.
- CI `sync-check` fails on marked orphans unless view deletions land with the canon removal.
- Design-review fixes applied by the drafts' own author (reviewer independence remains).

## Touched areas (amendment AC-20)
Orchestrator grep for `ux_spec` (audit addendum, user-added criterion): `sprint-lifecycle.md` :36 (lite promote), :162, :164, :191 ("Disabling `ux_spec` also disables the design-system gate, `design-md-delta.yaml`, and UX promotion" — the coupling to split), :203, :211; `asd-phase-design.md` :14, :19, :28 (design-system gate "only if `ux_spec` enabled"), :31, :65; `asd-phase-design-review.md` :19; `asd-phase-design-promote.md` :22; `asd-phase-audit.md` :26; `asd-phase-scope.md` :44; `asd-init/SKILL.md` :47, :68, :73, :149 (Node and `designmd-*` commands gated on `ux_spec`); `asd-phase-design/SKILL.md` :4; `t_config.yaml` :15; `t_state.json` :6; `session-start.js` :136 (collapse test); `README.md` :285, :466; `review-policy.md` :217.
