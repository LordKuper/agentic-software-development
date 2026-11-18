---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/workflows/asd-phase-audit.md` "Rules"). Omit any optional section entirely when it has no findings — never emit a placeholder row.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/runtime.js`: `recordVerdicts` (1229-1255, sole runtime latch writer), file-class predicates `isExecutable` (454-457) and `isTest` (522-526, exported, no call site), `emit-manifest` (per-reviewer `<reviewer>.manifest.json` `files`, 1114-1117; `external.scope.json`, 1087-1093), `contextRefs`/`contextBundle`/`contextCommand` (1733-1773, working tree via `fs`), `parseFlagArgs` (1940-1952, callers 813, 1526, 1963), `retro-candidates` (2027-2031, 718-735) — AC-1, AC-2, AC-6, AC-9.
- `.asd/rules/sprint-lifecycle.md`: "APPROVE latch" (89-109: clears on red suite, scope amendment, late admission, rollback), "Review iteration counters" (scope per iteration, 76), "Operation timing" kinds line (278: `suite` scope `impacted`|`full`), "Impacted test set" (111-132: safety valve 122, reuse 128, Scope values 130), "Cleanup phase" verification (143) — AC-1, AC-10, AC-14.
- `.asd/rules/review-policy.md`: severity table (3-10), "Change-surface rule" (49-51), routing (99, 148-152), "Minor test-only findings" (108-112), APPROVE latch DoD (210) — AC-1, AC-5.
- `.asd/workflows/asd-phase-impl-review.md`: latch filter (33-35), late return (40), finding routing (41-55), red-suite latch clear (59-61), terminal suite (56-61) — AC-1, AC-5, AC-14.
- `.asd/workflows/asd-phase-impl.md`: fix-mode finalize (59-60), `## Rules` (63-74) — AC-1, AC-11.
- `.asd/workflows/asd-phase-impl-test.md`: suite gate step 8 (36), defect routing step 9 (37-47), green exit step 10 incl. Manual-verification smoke check (48), `## Rules` (58) — AC-3, AC-14.
- `.asd/workflows/asd-phase-cleanup.md` step 5 (25) and `.asd/workflows/asd-phase-pr.md` open mode suite reuse (21-22) — AC-14.
- `.asd/workflows/asd-phase-retro.md`: Draft step Guardrail/Home (30), step 6 writes only `retrospective.html` (32), Exit writes (44) — AC-2, AC-4.
- `.asd/workflows/asd-phase-scope.md` step 2a (35-50) — AC-4 removal candidates reach the user through the existing retro-row intake.
- `.asd/agents/asd-tester.md`: "Evidence routing" table (89-103), suite-run rules (36-40) — AC-3, AC-7. `.asd/agents/asd-dev.md` `## Rules` (34-47) — AC-12. Reviewer agents (`asd-reviewer-*`, `asd-external-review`) findings rules — AC-5.
- `.asd/templates/`: `t_review.md` findings columns (20: `# | Severity | Location | Description | Suggested fix`), `external-review/t_review-report.md` (19-21), `t_commands.yaml` (4-20), `t_config.yaml` (top-level keys 1-87), `t_tech-reference.md` (10-26), new checklist template — AC-2, AC-3, AC-5, AC-13, AC-14.
- `.asd/skills/asd-init/SKILL.md`: fresh step 2 prompts (42), step 8 command detection (52-62), step 12 writes (73), re-init 2a (91) — AC-3, AC-14.
- `.asd/rules/artifact-layout.md`: `.asd/project/*` path map (19-25), "Retro backlog" (223-225, model for a lazily created consumer-owned file), "Tech reference docs" (184-186) — AC-2, AC-13.
- `.asd/rules/providers.md` "Role-scoped context" reviewer rows (123-132) — AC-2, AC-6.
- `.asd/rules/language-policy.md` "Matrix" issue rows — AC-5.
- `docs/architecture/tech-reference/git-2.55.md`, `gh-2.90.md` — AC-5, AC-6, AC-13.
- `README.md`: "## Workflows" (130-152), "## Agents" (221+), "## Configuration" (284-333), "## Folder structure" (335-405) — AC-8, AC-14.
- `.asd/release-manifest.json` (`managed_paths` 7-17 already holds `.asd/templates`; `upstream_hashes` per template) and `tests/run.js` — AC-8.

## Existing docs found
- [git 2.55 tech reference](../../../docs/architecture/tech-reference/git-2.55.md): API surface lists `git diff` forms only; no `git show <ref>:<path>` or `git fetch` entry, which AC-6 relies on.
- [gh 2.90 tech reference](../../../docs/architecture/tech-reference/gh-2.90.md): `gh issue create -R <owner/repo> -t <title> -F <body-file>` recorded (17), last verified 2026-11-16 — usable for AC-5 issue creation.
- `.asd/project/stubs.md`: no open stubs.

## Contradictions
- AC-6 vs host agent loading (no canonical side): AC-6 says "every reviewer's context bundle takes those files from `origin/<git.base_branch>`", listing the `asd-reviewer-*` and `asd-external-review` definitions; but a reviewer's own definition is not part of its context bundle — the host loads the generated `.claude/agents/<name>.md` / `.codex/agents/<name>.toml` from the working tree (`providers.md` 12, 31), which the orchestrator's self-hosting sync regenerates after every canon-editing wave (`sprint-lifecycle.md` "Self-hosting"). Rule files in the bundle (`review-policy.md`, `external-review.md`) and the rubric `emit-manifest` parses from the agent canon (`rubricIds`, runtime.js 436) can come from base; the definition body the host injects cannot without changing sync or dispatch. winner=unsettled → user: narrow — bundle rule files and manifest rubrics from base, host-loaded definition body stays working tree as a stated limitation (AC-6 retired, AC-16).
- AC-1 "inside an APPROVE-latched reviewer's reviewed scope" vs a fix round adding a production executable file no manifest of the wave listed: the latched reviewer keeps its latch and never sees that new code, the hole the article's "review the commit that ships" targets. Not a canonical conflict; preference only the user can settle. winner=unsettled → user: a production executable file in no manifest of the wave also clears every latch (AC-1 retired, AC-15).

## Existing implementation found
- `recordVerdicts` (runtime.js 1229-1255) already deletes a latch for any non-`APPROVE` value and writes `latched[key]=N` for `APPROVE`; the other clears are inline orchestrator writes — AC-1 adds one more clear trigger, computable in runtime.
- Per-iteration reviewed scope is persisted: `reviews/impl/wave-<K>/iter-NN/<reviewer>.manifest.json` `files` (internal), `external.scope.json` `files` (External) — AC-1 can intersect a fix round's changed files with the union of a latched reviewer's manifests in the current wave.
- `isExecutable` (prose/config/markup excluded) and `isTest` (path segment or basename patterns) exist; `isExecutable && !isTest` is AC-1's production-executable class. Comment-only changes inside an executable file need line-level diff classification — not present today.
- `emit-manifest --custom-rules` already appends custom-rule paths to the coverage manifest (runtime.js 1099), the hook AC-2's per-dispatch checklist selection can follow.
- Retro already drafts rows with Guardrail and Home and the scope intake already puts each row to the user with root cause, edits and consequences (scope step 2a) — AC-4's removal candidates can travel as retro rows (Home = the checklist), no new intake path.
- `asd-tester-runner` and impl-test step 10 already hold a green-exit hook (Manual-verification smoke check) where AC-3's `smoke` command run fits.
- The safety valve is one paragraph (sprint-lifecycle.md 122) cited from impl-test step 8 and cleanup step 5; pr open mode re-runs the full suite only when code/test/stub paths changed since the terminal `Suite run` HEAD (asd-phase-pr.md 22) — AC-14's switch touches those three sites plus the pr reuse rule.
- `tests/run.js --filter <substring>` runs one test by name (runAll 10283-10293); `--filter "(D13)"` is AC-11's named load check.
- Precedent for an optional config key absent = default: `cleanup`, `upstream_issues` (t_config.yaml 10-16); `update.js` never touches `.asd/project/**` (update.js 26, 115-121), so AC-14's key needs no migration.

## Gaps
- No `pre-existing` finding concept anywhere (rules, agents, workflows, templates); `t_review.md` and `FINDINGS_COLUMNS` (runtime.js 53) have no column or marker for it, and the "Change-surface rule" (review-policy.md 51) currently makes a finding on unchanged code invalid unless the change broke it — AC-5 is a planned change to that canonical rule.
- No reliability-checklist template, path-map entry, or trigger grammar; no runtime matcher.
- No `smoke` key in `t_commands.yaml` or `asd-init` detection.
- No runtime path builds a bundle from a git ref; `contextBundle` reads only the working tree.
- `parseFlagArgs` stores unknown flags silently; only `commit-check` and `memory-check` reject their own unknowns.
- `asd-phase-impl.md` and `asd-dev.md` carry no load-check or AC re-read rule; `t_tech-reference.md` has no field for default-target resolution or state mutation.
- External dependency gaps: `git show <ref>:<path>` / `git fetch` for AC-6 are absent from the git 2.55 tech reference (refuse-to-implement rule, artifact-layout.md 186).
- Migration gaps: none — every new key is optional with an unchanged-behaviour default; the checklist file is created lazily like `retro-backlog.md`.

## Risks
- Load ceiling: orchestrator/impl load is 144,020 B, 0.6994 of its 205,926 B baseline — 128 B of headroom under the 0.70 D13 ceiling (`tests/run.js` 8467). AC-10, AC-11, AC-13 and AC-14 add text to files in that bundle (`sprint-lifecycle.md` "Operation timing", "Impacted test set"; `asd-phase-impl.md`; `artifact-layout.md` "Tech reference docs"). Headroom elsewhere: dev 41,865 B, tester 24,926 B, combined reviewer 26,106 B. impact=AC-8 red, mitigation=plan budgets bytes per Task and offsets every orchestrator/impl addition with documentation-economy cuts in the same bundle; each dev runs `--filter "(D13)"` before COMPLETED (AC-11).
- Comment-only detection (AC-1): a heuristic that misreads code as a comment keeps a latch it should clear (unsafe direction). impact=unreviewed code ships, mitigation=classify by extension family, treat an unknown extension or any mixed hunk as code.
- AC-5 issue writes are external actions (`checkpoints.md` Gate inventory: evidence rule in adaptive, approve-before-write in strict); a reviewer mislabelling a sprint-caused defect `pre-existing` would move it out of review-fix. impact=defect escapes the sprint, mitigation=the orchestrator verifies the defect exists at the base commit before filing; `critical` never leaves review-fix.
- AC-4 writes a project file from retro for the first time (retro writes only `retrospective.html` today). impact=retro write set and Exit change, mitigation=state the write in retro's Exit and keep the file lazily created.
- AC-11 names a check (`tests/run.js` D13) that exists only in this repo. impact=a consumer dev told to run a missing check, mitigation=scope the rule to `self_hosting`.
- AC-2 trigger grammar: a free-text trigger cannot be matched by runtime. impact=selection falls back to the model, mitigation=a machine-readable path-glob trigger, prose check text.
