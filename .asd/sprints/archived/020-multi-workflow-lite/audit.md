---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/rules/sprint-lifecycle.md` "Audit phase"). Omit any optional section entirely when it has no findings — never emit a placeholder row.

Architect returns all applicable sections; the phase orchestrator writes this file. BA contributes only on evidenced material product/domain ambiguity.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
Include documentation and implementation touched by scope.

**Workflow definitions (new, AC-1)**
- New `standard`/`lite` definition files — recommended `.asd/workflows/<name>.json`: already a `managed_paths` entry and on the self-hosting allowlist; `upstream_hashes` rebuilt by `sync.js` (`recomputeAndWriteHashLedgers`, `.asd/sync.js:1022-1030`). JSON, not YAML — hook/runtime/tests are zero-dependency.

**Hard-coded phase chain / phase set (main risk list for plan)**
1. `.asd/hooks/session-start.js`: `:24-37` `PHASE_CHAIN` literal; `:71` archived-sprint check; `:95-99` `nextPhase`; `:101-104`, `:188` design-collapse special case. Must read `state.workflow` (absent = standard), fail silently. Copied to `.claude/hooks/` and `.codex/hooks/` (`sync.js:1247-1257`); `findUp` root lookup makes `<root>/.asd/workflows/*.json` reachable from every copy.
2. `.asd/rules/sprint-lifecycle.md`: `:15-20` "Phases (all mandatory)" + chain line (test §16 parses `^scope →`); `:26`, `:104` "before `NEXT: retro`"; `:56-63` rollback-reset table (`design-promote` resets `reviews.impl` — wrong for lite); `:108-122` phase table (`:117` plan input "promoted persistent docs", `:120` impl-review → retro); `:146` `PHASE_CHAIN[idx+1]`; `:150` AC source; `:159-170` no-op table + collapse; `:202-221` "Design-promote phase" is drafts-only; `:281` retro "between impl-review and pr".
3. `.asd/rules/core.md`: `:15` "Eleven mandatory: …" (test §16 parses `mandatory:`); `:20` reviewer roster; `:70` one skill per phase (holds as union).
4. `.asd/rules/checkpoints.md`: `:59-65` precondition chain + prose (plan/retro/design-promote predecessors standard-only); `:7` hard list lacks the workflow choice.
5. Phase workflows: `asd-phase-audit.md:10,22` (exit collapse, `NEXT: design|plan`; lite always `plan`, no design skip record); `asd-phase-design-promote.md:5,8,9,20` (drafts intersection, "never dispatched after collapse", `NEXT: plan` — lite needs `NEXT: retro`); `asd-phase-plan.md:7-8,20` (preconditions "design-promote done"); `asd-phase-impl-review.md:65,101-104` (`NEXT: retro|impl`; lite needs `design-promote`); `asd-phase-retro.md:7` ("advanced from impl-review"); `asd-phase-design.md:22` (`PHASE_CHAIN[idx+1]`). Unchanged: `asd-phase-scope.md:24`, `asd-phase-impl.md:145`, `asd-phase-impl-test.md:80`, `asd-phase-pr.md:31`.
6. `.asd/skills/asd-sprint/SKILL.md`: `:18-22` operations list; `:34-39` Step 2A (only confirm/abort); `:43-45` Step 2B resume display, re-run menu, collapse exclusions, design-promote resume → plan; `:49` Step 3 routing enumeration; `:57` skills dispatched.
7. Skill descriptions (triggers): `asd-phase-impl-review/SKILL.md:4` ("four internal reviewers … completes to retro"); `asd-phase-design-promote`, `asd-phase-plan`, `asd-phase-design` descriptions.
8. `tests/run.js`: §16 `:2785-2936` (`readPhaseChain` `:2810-2815` regex-parses the hook literal; `:2827-2859` workflow/skill bijection + "retro directly after impl-review"; `:2861-2881` successor `NEXT:`; `:2883-2912` rule-doc chain lines; `:2914-2936` README table/flowchart/count words); `:2938-2970` collapse exit test; `:2017-2290` ~10 hook tests copy only the hook into a temp root; `:2286` hook collapse assertion; `:6175-6176` rotation cycle from `PHASE_CHAIN`; `:5585-5614` t_state seed + rollback wording; `:5539` CHANGELOG heading = `asd_version`.
9. README.md: `:13`, `:124`, `:130` (11/eleven phases); `:132-155` flowchart; `:157-169` phase table (`:162`, `:167` rosters); `:308` "11 phase orchestration files".
10. AGENTS.md (repo tail): `:60`, `:95` "eleven phases".
11. `.asd/rules/artifact-layout.md`: `:253` rotation exit "impl-review→retro"; `:145` `{{STATUS}}` "approved (post design-promote)"; `:247` state keys only from `t_state.json`.
12. `.asd/templates/t_state.json:1-20`: no `workflow` field (needs `{{WORKFLOW}}` seeded at scope).

**Hard-coded reviewer roster / verdict keys**
- `.asd/runtime.js`: `:29` `INTERNAL_REVIEWERS` (tested vs `asd-reviewer-*` files, `tests/run.js:5080`); `:44-51` `NA_TARGETS`; `:394-397` `reviewerFiles`; `:734` rubric from `agents/asd-reviewer-${reviewer}.md`; `:748` reviewer name `^[a-z]+$`; `:52` `PHASES`.
- `.asd/rules/review-policy.md`: `:41`, `:114`, `:164` "4 internal reviewers"; `:153` verdict enum; `:176-186` Reviewer responsibility table (test `:5094-5102`: one row per reviewer agent, both phases); `:188-197` DoD table (needs a lite impl-review row; pr gate reads it).
- `.asd/rules/sprint-lifecycle.md`: `:75` latch keys; `:368` verdict keys.
- `.asd/workflows/asd-phase-impl-review.md`: `:40-44` step 6 roster; `:42` manual-verification tied to Testing; `:51` keys; `:79-83` artefacts; `:93` "4 internal reviewers".
- `.asd/rules/providers.md`: `:46`, `:78` (model table "asd-reviewer-* (4)"), `:108-111` role rows.
- README.md: `:195`, `:213`, `:215`, `:217-223`, `:225`, `:305`, `:322`, `:328` (agent counts, asserted at `tests/run.js:1075-1103`). AGENTS.md `:83`.
- `.asd/release-manifest.json` `canon_hashes` for a new agent. Test roster lists `tests/run.js:3418`, `:3476`, `:6161`.
- Generic (no change): `t_state.json` verdicts, `validate-ledger`, `session-start.js:146-161` `lastReviewVerdict`.

**AC-8 sites**: `review-policy.md:93-95` ("fixes NOT applied inside the review phase"); `asd-phase-impl-review.md:60-62` (step 8), `:64-68` (step 9, tester in-place fix only for terminal-suite test defects), `:90`; `asd-phase-impl.md:55,60`; `artifact-layout.md:187`; `asd-tester.md:4,20,66`; `git-strategy.md:16`; `sprint-lifecycle.md:375` (`resolved:` kinds).

**AC-9 sites**: `review-policy.md:126,130,132,160`; `asd-phase-impl-review.md:17,46-47`; `asd-phase-design-review.md:37`; `runtime.js:400-409` `ledgerFromText`, `:263-303` `validateCoverageLedger`, `:820-824` `validate-ledger`, `:867`, `:874`; README `:303` command inventory.

**Lite design-promote creators**: `asd-architect.md:31` + promote Inputs/Outputs; `asd-ba.md`, `asd-ux.md` (promote from drafts); `providers.md:101-103`.

**Release**: `.asd/release-manifest.json` `asd_version` 13.2.0; `CHANGELOG.md`; version bump changes every generated view's ownership marker → full re-sync.

## Existing docs found
No `docs/` tree (all `documents.*` disabled); under self_hosting the canonical docs are `.asd/rules/`.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md): phase model, cycle, counters/waves, latch, rollback reset, optional documents, no-op/collapse, design-promote, AC source, retro, PR, State recovery — home for most per-workflow differences.
- [checkpoints.md](../../rules/checkpoints.md): gate policy + hard list, gate inventory, precondition chain.
- [core.md](../../rules/core.md): glossary ("Eleven mandatory", reviewer roster), phase-skill naming.
- [review-policy.md](../../rules/review-policy.md): scope hand-off, ledger enforcement/persistence, Gate Verdict Format, Reviewer responsibility, DoD per review phase, "impl-review — fixes NOT applied inside the review phase".
- [artifact-layout.md](../../rules/artifact-layout.md): Test plan review-fix grants; Decisions log rotation cycle and exit; State file keys.
- [providers.md](../../rules/providers.md): reviewer grants ("four internal reviewers"), model table, role-scoped context, dispatch payload header.
- [git-strategy.md](../../rules/git-strategy.md) "Commits": `ASD-Task` trailer ids.
- [external-review.md](../../rules/external-review.md): pathspec rows; External Review unchanged in lite (AC-4).
- [README.md](../../../../README.md), [AGENTS.md](../../../../AGENTS.md): mirrors above.
- [plans/self-hosting-and-optional-documents.md](../../../../plans/self-hosting-and-optional-documents.md):293 (non-canonical, Russian): lists configurable reordering/removal of chain phases as out of scope.
- `archived/016-remove-terra-family/retrospective.html` P-1, `archived/017-review-waves/retrospective.html` P-3: sources of AC-8/AC-9.

## Contradictions
- `plans/self-hosting-and-optional-documents.md:293` vs `sprint.md` AC-1/AC-3: old plan puts phase removal out of scope; winner=sprint.md (accepted scope; plan is non-canonical historical).
- `checkpoints.md:7` hard gates + `sprint-lifecycle.md:196` (each `design-md-delta` entry user-approved) vs `sprint.md` AC-5 ("no draft and no design review"): AC-5 removes the review phase, not user gates — a new subsystem, material stack/UX/brand direction or `DESIGN.md` token change at lite design-promote keeps its hard gate; winner=checkpoints.md (canonical).
- `sprint.md` AC-2 ("standard … same routing, gates and review roster") vs AC-8/AC-9 (new impl-review route; changed review-file persistence in both review phases): same sprint document, neither canonical; winner=unsettled → user: AC-8 and AC-9 apply to both workflows; AC-2 reads "today's lifecycle plus AC-8/AC-9" (decisions-log 2026-09-28).

## Existing implementation found
- Routing already follows `NEXT:` tokens (`sprint-lifecycle.md:28`, asd-sprint Step 3); `PHASE_CHAIN` only drives hook display and §16 mirrors. Lite changes: audit/impl-review/design-promote `NEXT:` values, retro/plan preconditions, hook, tests.
- Design-block collapse (`sprint-lifecycle.md:170`, `asd-phase-audit.md:10`) already skips design/design-review/design-promote when every design document is disabled (this repo's own mode). Lite differs: design/design-review absent (not skipped), design-promote moved after impl-review; the collapse `skipped_phases` write must not fire under lite.
- Scope already freezes `documents.*` and `user_gates` (`asd-phase-scope.md:8-9`); "absent key = legacy default" pattern exists (flat `reviews.impl`, absent `latched`, absent `documents`) — `workflow` absent = standard fits, no migration script.
- No-op rule + `skipped_phases` (`sprint-lifecycle.md:144,159`) covers lite design-promote with no enabled document.
- AC-8 precedents: impl-review step 9 already dispatches `asd-tester` for in-place terminal-suite test fixes with an `impl-review … suite` trailer; review-fix tester chain (`asd-phase-impl.md:55,60`) handles test-file findings.
- AC-9 building blocks: `ledgerFromText`, `validateCoverageLedger`; archived sprints show hand-written `<reviewer>.md` + `<reviewer>.findings.json` (`archived/019-retro-intake/reviews/impl/wave-1/iter-01/`); `retro-candidates` is a precedent for deterministic artefact parsing.
- New internal reviewer plug-in point: `emit-manifest` builds any reviewer's manifest from `agents/asd-reviewer-<name>.md` `## Review rubric`; latch, waves, severity floor, ledger, DoD aggregation keyed generically.

## Gaps
- Definition files + schema: nothing declares a workflow. Minimal machine-read data: ordered `phases`; per-phase allowed `NEXT` targets (incl. the impl cycle); impl-/design-review rosters; rollback-reset map; collapse rule (standard only); design-promote mode (drafts vs implementation). Semantics stay prose in rule docs.
- `state.json.workflow`: absent from `t_state.json` and scope seeding (`asd-phase-scope.md:9`).
- Workflow-choice decision: new-sprint flow asks only confirm/abort (`asd-sprint/SKILL.md:37`); scope step 1 does not ask; `checkpoints.md` does not classify it (AC-6 makes it effectively hard).
- Per-workflow rule-doc text: chain line, phase table, no-op table, rollback-reset table (lite: `reviews.impl` resets on `scope`, `audit`, `plan`; `reviews.design` unused), precondition chain, resume/re-run menu, retro placement, rotation exit (`artifact-layout.md:253`).
- Lite AC source: `sprint-lifecycle.md:150` selects PRD when `documents.prd` enabled, but lite writes no PRD before impl → lite uses `sprint.md` always. Restating sites: `sprint-lifecycle.md:150`, `review-policy.md:203`, `asd-phase-plan.md:19,21`, `asd-phase-impl-review.md:40`, `asd-reviewer-correctness.md:38,49`, `asd-reviewer-testing.md:35`, `asd-tester.md:39`, `asd-dev.md:39`, `asd-architect.md:31`, `asd-ux.md:23,33`.
- Lite design-promote from implementation: no workflow branch, creator inputs (sprint.md, plan.md, sprint diff) or creator contract text (BA requirements; Architect folds into `owns`-matching docs, `stack.html`, tech-reference, c4 when frozen `c4`; UX `docs/ux/<subsystem>.html`, `DESIGN.md`); design-system gate (`sprint-lifecycle.md:199`) has no lite home; needs a commit point before retro.
- Lite impl-review roster: combined internal reviewer (new agent or composed rubric); no lite DoD row; no verdict-enum key; no `NA_TARGETS` entries; `--test-plan` input and manual-verification decisions tied to the Testing dispatch (`asd-phase-impl-review.md:42`).
- AC-9 runtime command (e.g. `persist-review`): parse/validate first-line token, derive finding ids/severity/location from the Findings table (`t_review.md`, `external-review/t_review-report.md`), validate ledger for internal reviewers, write `<reviewer>.md` + findings JSON, return `{token, findings}`. Undecided: ledger transcription, `Interrupted attempts:` line, `.late.md`, later `resolved:`/`answer:` appends.
- AC-8 routing: no step-8 branch — needs classifier (severity `low` AND every Location path a test file per `runtime.js` `isTest`, or `test-plan.md`/segment), tester fix + commit, resolution kind beside `override|stop|cap-accept` (`sprint-lifecycle.md:375`), per-wave dispatch point (step 9 runs only after the last wave), `test-plan.md` row grant (`artifact-layout.md:187`).
- Test suite: §16 iterates both definitions (chain, `NEXT`, rule-doc/README/AGENTS.md mirrors); README table/count-word assertions assume one chain (lite = 9 phases needs its own table/format); hook tests must copy or fall back on definition files.
- External dependency gaps: none — zero-dependency Node + Markdown/JSON.
- Migration gaps: in-flight `state.json` without `workflow` → standard (AC-6), no script; `config.yaml` unchanged; hand-persisted review files stay valid; CHANGELOG states the new sprint-start question and that nothing migrates (`backward_compat: migration` satisfied); sprint 020 itself (no `workflow` field) must keep resuming as standard across its own hook/test changes.

## Risks
- ~30 hard-coded chain/roster sites drift: impact=a stale `NEXT:`/precondition silently skips or blocks a phase in one workflow while the other stays green; mitigation=every §16 assertion runs per definition file, grep phase names and `retro`/`design-promote` successors across canon + README, state per-workflow deltas once in `sprint-lifecycle.md` and cite.
- Rollback reset wrong for lite: impact=re-running lite design-promote would wipe `reviews.impl` under today's table; mitigation=reset map in each definition file, rule doc cites it.
- Hook fragility: impact=hook now reads a file; ~10 tests put only the hook in a temp root; missing/malformed/unknown workflow must not throw; mitigation=guard every read, fall back to "unknown", tests copy definitions, add a malformed-definition test.
- Over-engineered definition schema: impact=Efficiency "premature config"/"plugin without plugins" critical, DSL review cost; mitigation=schema holds only machine-read data (hook, tests, runtime, resume menu), prose stays in rules, no consumer workflows.
- New combined reviewer agent ripples widely: impact=agent counts (README ×5, AGENTS.md, test-asserted), model-tier table, `canon_hashes`, providers row/grants, `INTERNAL_REVIEWERS`, verdict enum, `^[a-z]+$` key limit, Reviewer-responsibility row (both phases, test-enforced); mitigation=single-word key and full mirror sweep in one Task, or compose correctness+efficiency rubrics in `emit-manifest` for an existing agent (no count ripple, but agent body contradicts its "Does NOT handle").
- Lite drops Testing and Documentation review: impact=test-plan decisions, manual-verification capture, stub resolution, persistent-doc actuality, and in self-hosting the README/`.asd/rules` consistency check go unreviewed; lite docs never reviewed; mitigation=manual-verification decision at orchestrator level in both workflows, `test-plan.md` passed to the combined reviewer, decide self-hosting on lite.
- AC-8 classifier fuzzy: impact=free-text multi-path Location could let the tester alone fix a mixed test/code finding; mitigation=qualify only when every extracted path is test/test-plan, unparseable → review-fix, derive from AC-9 structured findings.
- AC-8 fixes unreviewed: impact=bad test fix caught only by terminal suite (K<n: enters wave K+1 scope; K=n: suite only); mitigation=accept for low severity, suite after the fix, finding-id trailer.
- Lite design-promote writes land after terminal suite and review: impact=pr open-mode content-scoped re-run (`sprint-lifecycle.md:307`) fires if `docs/` is in its pathspec; unreviewed docs reach the PR; mitigation=state it explicitly or exclude lite-promoted `docs/**` from that pathspec.
- Change surface / review cost: impact=~40-45 files (under `SURFACE_CAP_FILES` 100) but a large `tests/run.js` diff → likely 2-3 review waves; mitigation=`surface-check` at plan, definitions + hook first, doc sweep in its own wave.
- "workflow" overloaded (ASD as a whole, `.asd/workflows/` orchestration files, GitHub workflows, now sprint lifecycle): impact=misread references; mitigation=`core.md` glossary entry, definition files `<name>.json` distinct from `asd-phase-*.md`.
- AC-9 partial coverage: impact=orchestrator still hand-writes `.late.md`, `resolved:`, `answer:`, `Interrupted attempts:` — conflicts with "never re-authors"; mitigation=plan states the command's exact scope.
- Documentation economy: impact=per-workflow duplication across rule docs, README and skill descriptions raises runtime tokens; mitigation=lite deltas defined once (one `sprint-lifecycle.md` section + definition file), others cite.

**Flagged material ambiguities** (architect, evidence-based):
- A1 lite combined reviewer scope — AC-4 names AC conformance, quality, performance, simplicity; Testing (`review-policy.md:184`) and Documentation (`:185`, self-hosting Framework mode `:203`) concerns unowned in lite. Recommended: Correctness + Efficiency rubrics, `test-plan.md` as context, manual verification to orchestrator.
- A2 AC-2 vs AC-8/AC-9 — see Contradictions.
- A3 workflow-choice gate — recommended hard in both modes, on the `checkpoints.md:7` list, asked at scope step 1.
- A5 lite AC source with `documents.prd` enabled — recommended `sprint.md` always.
- A6 AC-9 command scope — recommended token + findings + ledger file only, returns JSON; `state.json` stays orchestrator-written (`sprint-lifecycle.md:362`).
- A7 AC-8 trigger — recommended: only when every unresolved finding of the wave qualifies; external findings count; new resolution kind.
- A8 runtime consumer — recommended: runtime reads the per-workflow roster to validate `emit-manifest --reviewer` and the persist key; no routing in runtime.
- A10 self-hosting on lite — a lite sprint here skips the Documentation reviewer's cross-file consistency check ("main editing hazard", AGENTS.md).
