---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/workflows/asd-phase-audit.md` "Rules"). Omit any optional section entirely when it has no findings — never emit a placeholder row.

The main orchestrator writes all applicable sections. Product/domain ambiguity a source can resolve is resolved from it; ambiguity only authority or preference can settle goes to the user.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/agents/asd-tester.md`, `asd-dev.md`, `asd-external-review.md`, new scout agent file: frontmatter tiers and variants (AC-1..AC-5, AC-8).
- `.asd/sync.js` `VARIANT_SUFFIXES` (:972): new suffixes for the tester run variant and the opus dev variant (AC-1, AC-3).
- `.asd/runtime.js`: `routeTask` (:319-342, `RESERVED_CHANGE_RISKS` :15, risk normalisation :155) — tier above `standard`, effort step (AC-3, AC-4); `contextRefs` suffix strip (:1435); `writeManifestDiff`/`numstatLines`/`reviewWaveCount`/`fingerprint` (:756-1000, :136) — diff collapse (AC-22, AC-24); `persistReview` (:558-583) — floor (AC-25); `positiveInteger` (:920) (AC-9); `timingAppend`/`timingRecover`/`timingGaps` (:1190-1355, `TIMING_OUTCOMES` :109) (AC-18, AC-26); `memoryCheck` (:748) (AC-21); `defectStalemate` (:595) (AC-15); new impl-test entry-close command and design-token generator in the CLI chain (:1522-1610) (AC-27, AC-32).
- `.asd/rules/providers.md`: role-scoped context grant table (:99-130, scout row), variant sentence (:147-149), routing (:153-155) (AC-1, AC-3..AC-5).
- `.asd/rules/core.md` glossary "Main orchestrator" (:20) and `sprint-lifecycle.md` "Orchestration and adaptive gates": delegation list (AC-5, AC-10).
- `.asd/rules/sprint-lifecycle.md`: "Plan file format" Material risk and Settings change (:307-321) (AC-3, AC-29); "Decomposition rules" (:328-341) (AC-11); "Rollback reset" (:83), "Scope amendment" (:343-352) (AC-17); "Impacted test set" (:111-128) (AC-23); "Operation timing" (:272-278) (AC-18, AC-26); "Self-hosting" allowlist (:167) (AC-10); "Failed dispatch" routing anchor (:362) (AC-1); `ux` input row (:198) (AC-34).
- `.asd/rules/review-policy.md`: checklist (:55-73), escalation list (:101-106), minor test-only path (:108-112), verdict format (:144-152) (AC-20, AC-28); every "Violation = FAIL" line in `artifact-layout.md`, `asd-reviewer-quality.md`, `asd-reviewer-efficiency.md`, `design-system.md`, reviewer verdict lines and `t_prompt-external-{design,impl}.md` (AC-28).
- `.asd/rules/external-review.md` floor and stalemate (:90-96), `asd-external-review.md` (:46-48, :59) (AC-2, AC-25, AC-28).
- `.asd/rules/agent-protocol.md` "Return" (AC-13).
- `.asd/rules/git-strategy.md` Commits (:14), one-command form (:42-48) and its mirror `asd-phase-cleanup.md:24`; `asd-sprint/SKILL.md:61` rotate subject (AC-12, AC-21).
- `.asd/rules/artifact-layout.md`: sprint tree and path maps (:35-41, :70-78), Test plan (:197), Agent memory (:96-104), STATS mockups (:162) (AC-16, AC-19, AC-34).
- `.asd/rules/design-system.md` §1-§3, §11, :49, :89-95 (AC-30, AC-31, AC-33, AC-34).
- Workflows: `asd-phase-impl.md` (steps 3, 5a, 6, 9) (AC-3, AC-10, AC-29); `asd-phase-impl-review.md` step 6 emit-manifest (:33), step 8 (:43-51), step 9 suite (:56) (AC-1, AC-9, AC-14, AC-20, AC-23); `asd-phase-impl-test.md` (:20, :36-58) (AC-1, AC-15, AC-16, AC-23, AC-27); `asd-phase-pr.md:22` skip condition (AC-23); `asd-phase-audit.md`, `asd-phase-plan.md`, `asd-phase-cleanup.md` (scout dispatch, AC-5); `asd-phase-scope.md` (AC-29, AC-34); `asd-phase-design.md:25-29`, `asd-phase-design-promote.md:14,22` (AC-31..AC-34); `asd-phase-design-review.md` (AC-34 UI predicate).
- `.asd/workflows/standard.json:22`, `lite.json:20` `rollback_reset` (AC-17).
- Templates: `t_test-plan.md` (:39, :71) (AC-15, AC-16); `t_plan.md:23` (AC-11, AC-24); `t_design-md-delta.yaml` (AC-30, AC-31); `t_design-system.html` (AC-32 markers); `t_commands.yaml:28` (AC-33); `t_ux-spec.html:19-46` (AC-34); `t_state.json` `task_routing` (AC-4).
- Skills: `asd-init/SKILL.md` (:26 sprint-mediated invokers, :149-161 designmd commands) (AC-29, AC-33); `asd-design-system/SKILL.md` (:71-75, Phase 4) (AC-30, AC-32); `asd-update/SKILL.md:35,52` migration contract (AC-19, AC-33); `asd-phase-audit/SKILL.md:4` (AC-5).
- `.asd/migrations/`: new release migration (AC-19 retired-agent memory, AC-33 commands.yaml value).
- `README.md` agent roster and counts (:5, :223-263, :353, :359), runtime command list (:332), config/folder map (:188, :376-378), orchestrator model and haiku alias notes (AC-6); `AGENTS.md:83` agent count; `.asd/release-manifest.json` `canon_hashes`, `asd_version`; `CHANGELOG.md`.
- `tests/run.js`: agent counts and `WORD_TO_NUMBER` (:1098-1118), read-only prefix set (:1047), routeTask (:2468-2479, :3413-3546, :7651-7681), variant fixture and suffix pin (:2703-2716, :7281-7341), retired names (:8678-8690), cleanup Owner/Dispatch (:8601), doc-economy grant (:4447), "Violation = FAIL" literal (:4435), one-command form parts (:6397-6408), timing (:7755-7757, :7830), memory routing (:6525-6546, :8334-8350), minor test-only (:6779-6802), emit-manifest flags (:5393), manifest diff (:3370-3394, :5399-5470), persist-review (:6610-6642), runtime pre-approval list (:7914), design-review UI predicate (:4648, :8117).

## Existing docs found
- [research.md](./research.md): article findings F1-F12 and approach B.
- [providers.md](../../rules/providers.md) "Model family resolution", "Role-scoped context", routing paragraphs: current tiers; `asd-tester` unrouted; no tier above `standard` since 14.0.0.
- [README.md](../../../README.md) "Agents": roster of 7 roles + 1 variant, model-tier table for both providers.
- [CHANGELOG.md](../../../CHANGELOG.md) 14.0.0: `critical` tier and `asd-tester-*` variants retired; the reason is the cost/benefit of the time.
- Live host fact (Claude Code, this session): the Agent tool takes a per-call `effort` (low…max) and `model`; the Artifact tool lists a `Design` type whose canvas source is `project/canvas.json` plus one `project/<name>.dc.html` per artboard; artifacts are private by default.
- Article (https://claude.dev/blog/which-claude-model-should-you-build-with/): Haiku 5.5 supports effort levels (default `medium`); Claude Code effort defaults.
- `docs/architecture/tech-reference/gh-2.90.md`: gh commands used by triage.

## Contradictions
- AC-22 vs issue #93 and canon: the AC limits the collapse to "generated provider views", but those views are already outside the self-hosting change surface (`sprint-lifecycle.md` "Self-hosting") and #93 came from a consumer project, where "generated" has no canon definition; as written the criterion changes nothing; winner=unsettled → user: collapse every whole-file deletion (AC-22 retired by AC-35).
- AC-29 vs canon: "plan-declared" cannot exist at scope (`plan.md` is written after audit); a declaration needs a scope-time home and must apply before step 3a's freeze, while `sprint-lifecycle.md` "Plan file format" says a settings change binds only from the next sprint; winner=unsettled → user: a scope-time `sprint.md` declaration applied before the freeze (AC-29 retired by AC-36).

Planned changes (criterion deliberately changes canon, no gate): AC-3 re-introduces a tier above `standard`, reversing 14.0.0, under a new name (never `critical`); AC-5 and AC-10 widen the orchestrator delegation list in `core.md` and `sprint-lifecycle.md`; AC-1 ends "`asd-tester` is unrouted"; AC-4 replaces "one failed check routes `standard`"; AC-19 and AC-33 let a migration write outside `config.yaml` (precedent `4.0.0.js:21`); AC-23 turns "full suite exactly once" into "once, or reused"; AC-28 replaces severity-driven "Violation = FAIL".

Settled from sources:
- AC-4 deliverability: the Claude Code Agent tool's per-call `effort` makes the effort step a dispatch parameter — no per-effort variants, no generated-config mutation (`providers.md` "No dispatcher mutates generated configuration" holds). Codex keeps its fixed effort (AC-8): the step applies on Claude Code only.
- AC-1 name: `asd-tester-mechanical` is a retired name (`14.0.0.js` `RETIRED_AGENTS`, test :8678); the run variant takes a new suffix.
- AC-3 with AC-8: the opus dev variant's Codex render equals the base (sol, same effort) — accepted, Codex untouched.
- AC-17: an amendment accepted after design-review and before plan re-enters design, so design-review re-runs and its counter must reset; `lite` has no design-review, so the reset is `standard`-only. Moved-aside folders take a name the legacy `impl/iter-NN` read never matches.
- AC-20: "changes no behaviour" is the orchestrator's judgment at impl-review step 8 (findings.json has no such field); it depends on AC-28, which stops checklist findings being FAIL by severity.
- AC-25: stalemate detection compares floored sets on both sides.
- AC-26: "build or acceptance handoff" = the orchestrator handing the user a build for manual verification (`manual-steps.md` validation, `asd-phase-impl.md` step 8).
- AC-28: the stalemate FAIL (`external-review.md` "Stalemate detection") stays a separate escalation route; the escalation list's "new abstraction", "API contract" and complexity rows map onto "complicates the architecture" / "changes requirements".
- AC-30: prefixed token names inside the spec's existing groups satisfy "group prefixed by the subsystem" if `designmd-lint` rejects custom top-level groups (verified at plan against the spec).
- AC-34: the Artifact tool exists only in Claude desktop/web sessions; without it (CLI, Codex) the HTML-file form applies; decomposition enabled → `mockups/<subsystem>/`; mockups belong to `ux_spec` — disabled ux_spec, no mockups; publishing a private artifact is an external action under the adaptive evidence rule.

## Existing implementation found
- `sync.js:948-981`: variants work for any agent and any listed suffix; only `VARIANT_SUFFIXES` and tests pin `mechanical`.
- `asd-dev-mechanical` (haiku/high, luna/high): template for the tester run variant and the scout's tiers.
- `model_families` already holds opus, haiku, sol, luna — no manifest family change.
- route-task fail-closed/no-downgrade machinery (`priorTier`) reusable for the new tier.
- `t_test-plan.md:39` `duplicate of <test>` removal reason (AC-16 partial).
- `asd-phase-design-review.md:39-41` memory-before-FAIL order (AC-14 model).
- `asd-phase-pr.md:22` content-scoped suite skip (AC-23 model).
- `persistReview` five-column table check (AC-25 partial).
- `design-system.md` §11 per-warning lint exclusions (AC-31 partial).
- `review-policy.md` "Memory-fix dispatch" and `artifact-layout.md` dead-agent memory scan (AC-19 partial).
- `memory-check` exits 1 on a hit (AC-21 premise).
- design-review already passes `--iteration <N>` (AC-9 model).

## Gaps
- route-task has no effort input/output; `task_routing` stores no effort (AC-4).
- No tier-mapping vocabulary: "broad repository reasoning" and "unfamiliar cross-domain work" are free text (`providers.md:155`) (AC-3).
- No scout agent, grant row or Dispatch rows; plan and cleanup declare no dispatch (AC-5).
- No orchestrator-apply branch in review-fix (AC-10).
- One-command commit form has no `-m` and no length or memory check; `memory-check` takes no path filter, so it would fail on a sibling's staged file (AC-12, AC-21).
- Suite run record is single and overwritten; earlier run's HEAD can be lost (AC-23).
- No rename-map grammar; diff written as a raw git stream (AC-24).
- No CSS-variable block or regeneration markers in `t_design-system.html`; no YAML parser in zero-dependency `runtime.js` (AC-32).
- No mockups path, step or input row; design-review UI predicate matches only `ux-spec.html`/`design-md-delta.yaml` (AC-34).
- Migration gaps: commands.yaml `designmd-install` old value → `--no-save` form (AC-33); retired agents' `.claude/agent-memory/<agent>/` → removed when the name is not a live agent (AC-19).
- External dependency gaps: `@google/design.md` spec group rules (AC-30); `npm --no-save` prefix resolution without a `package.json` (AC-33).

Article dispositions (AC-7, written at impl after wave 4):
- F1 reflected: `README.md` "Orchestrator session model" (Opus `medium` default, Fable for long unattended or large runs).
- F2 reflected: effort step before a tier climb — `.asd/runtime.js` `routeTask`, `providers.md` "Task-class variants and routing"; agent default efforts kept, since lowering them is unmeasured on ASD work (F10).
- F3 reflected: haiku for cheap-to-check work — `asd-tester-runner`, `asd-scout`, External Review wrapper (`.asd/agents/asd-tester.md`, `asd-scout.md`, `asd-external-review.md`).
- F4 reflected: `escalated` tier (opus) for migration, broad-reasoning, cross-domain risks — `routeTask`, `providers.md`, `.asd/agents/asd-dev.md`.
- F5 reflected: self-verify → effort step → next tier — `routeTask` `effortRaised`/`raiseEffort`, `asd-phase-impl.md` 5a.
- F6 reflected: read-heavy scans on `asd-scout` — `asd-phase-audit.md`, `asd-phase-plan.md`, `asd-phase-cleanup.md`.
- F7 reflected (pre-existing): code picks the model — `route-task`.
- F8 reflected (pre-existing): consult-only `asd-advisor`; no executor-advisor pairing added, the article measured no gain.
- F9 reflected (pre-existing): impl waves of parallel workers — `asd-phase-impl.md` steps 5-6.
- F10 rejected: neither host returns a dispatch's token `usage` to the orchestrator, and the user chose approach B over C (measure first).
- F11 reflected: `README.md` `haiku` alias note (`ANTHROPIC_DEFAULT_HAIKU_MODEL`).
- F12 rejected: API-level settings (prices, cache writes, sampling, thinking blocks, fast mode, `opusplan`) that ASD never sets.

## Risks
- Haiku wrapper misparses CLI output (severity mapping, stalemate): impact=silently degraded external review, mitigation=AC-25 moves the floor into code; `persist-review` table check stays; wrapper keeps `high` effort.
- Tester run variant used for a suite needing triage: impact=defects misclassified, mitigation=variant only runs and reports; triage and authoring stay on the base agent.
- Opus tier raises cost on risky tasks: impact=higher spend, mitigation=only the three named change risks route there.
- Scout summaries hide a detail the orchestrator needed: impact=wrong audit/plan judgment, mitigation=path-cited summaries; orchestrator reads cited sections before deciding.
- Diff collapse (AC-22, AC-24) hides content: impact=a wrong substitution or a needed deletion review goes unseen, mitigation=collapsed files keep a coverage-ledger row with path and count; AC-24 collapses only exact map substitutions.
- AC-23 reuse across a red-suite latch clear: impact=stale green, mitigation=a reused run must postdate the last latch clear.
- AC-19 name collisions (`asd-reviewer-quality` retired in 4.0.0, live again): impact=a live agent's memory deleted, mitigation=remove only names absent from `.asd/agents/` and their variants.
- Sprint size (34 AC): impact=long review waves, mitigation=plan groups ACs editing one rule doc into one Task.

## Related open stubs
None match scope (`.asd/project/stubs.md`).
