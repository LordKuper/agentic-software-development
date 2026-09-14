---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit: sprint 011-explicit-design-skip

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/templates/t_config.yaml`: the new field and its values (AC-1). Existing top-level precedents are `user_gates` (line 1) and `self_hosting` (line 8).
- `.asd/templates/t_state.json`: new frozen field and placeholder next to `user_gates` (line 6) and `documents` (line 5) (AC-2).
- `.asd/workflows/asd-phase-scope.md`: step 3a seeds placeholders (line 8). It needs the new placeholder, the absent-means-disabled rule and the AC-4 conflict log line.
- `.asd/workflows/asd-phase-audit.md`: step 1's skip branch returns `NEXT: design` (line 3), and so does the return contract (line 18). This is the recommended owner of the explicit-skip write (AC-3).
- `.asd/workflows/asd-phase-design.md`: step 2's collapsed no-op (line 22) is the model for the write AC-3 asks for. It only changes if effective-document freezing (Gaps) is not adopted.
- `.asd/workflows/asd-phase-design-review.md` line 7 and `asd-phase-design-promote.md` line 5: collapse and no-op wording that assumes design is the only thing that collapses the block.
- `.asd/workflows/asd-phase-plan.md`: preconditions at lines 7-8 and step 2 at line 20 ("confirm design-promote done").
- `.asd/skills/asd-sprint/SKILL.md`: step 3's list of exceptions to linear routing (line 47), the resume flow (lines 40-43), and "No direct writes" (line 22).
- `.asd/hooks/session-start.js`: `PHASE_CHAIN` (lines 24-37), `nextPhase` (lines 95-99) and the `next` computation (line 158) (AC-5). Generated copies are `.claude/hooks/session-start.js` and `.codex/hooks/session-start.js`.
- `.asd/runtime.js`: evaluated as a possible owner and not recommended. It has no state or routing logic today; its commands are listed at lines 273-302.
- `.asd/rules/sprint-lifecycle.md`: "Optional documents" (lines 121-153), including the per-field/per-group defaults (123), "Skip record" (127), "Multi-phase skip" (129), the no-op table (142-151) and the collapse line (153). Also the "Audit phase" draft rule (163), "Self-hosting" allowlist (113), review change surface (119) and "Acceptance-criteria source" (133).
- `.asd/rules/checkpoints.md`: the precondition prose at line 62 ("`plan` requires promotion or collapsed design no-op"). The fenced chain at line 59 does not change.
- `.asd/skills/asd-init/SKILL.md`: fresh-mode batch (line 29), proposal (line 52), write (line 57), re-init diff mode (lines 74-82) and artefact list (line 121).
- `README.md`: config schema block (lines 245-288). The phase table design row (161) and flowchart (133-153) are optional mirrors.
- `AGENTS.md` (hand-written tail below `<!-- asd:end -->`, line 60): the "lean profile" sentence describing this repo's `documents.*`.
- `.asd/project/config.yaml`: target of AC-6. Outside the Dev allowlist (see Risks).
- `tests/run.js`: §7 hook fixtures (lines 2142-2175, the pattern for the AC-5 test), §16 phase-chain tests (2702-2811), template JSON parse (1958-1966) and manifest hash freshness (1922-1930).
- `.asd/release-manifest.json`: `upstream_hashes` for edited managed files (lines 68, 134-143), and `canon_hashes` if `asd-init` or `asd-sprint` SKILL.md change. The `asd_version` bump happens at `pr` (`git-strategy.md:81`).
- `CHANGELOG.md`: new entry at the release version.

## Existing docs found
- [sprint-lifecycle.md "Optional documents"](../../rules/sprint-lifecycle.md) line 123:
  - Documents are frozen at scope.
  - "absent group … every value `enabled`".
  - "group is present but a given field is absent … that field is `disabled`".
  - Effective `c4` is computed once at scope. This is the precedent for freezing an effective value that differs from config.
- [sprint-lifecycle.md "Multi-phase skip"](../../rules/sprint-lifecycle.md) line 129: one write appends every subsumed phase name and sets `phase` to the last one, "so `PHASE_CHAIN[idx+1]` mechanically yields the next real phase". AC-3 reuses this contract unchanged.
- [sprint-lifecycle.md collapse line](../../rules/sprint-lifecycle.md) line 153: "the design workflow performs one deterministic no-op write when all documents are disabled". It names the design workflow as the only place the collapse happens.
- [sprint-lifecycle.md "Audit phase"](../../rules/sprint-lifecycle.md) line 163: audit may pre-formulate reverse-engineered `prd.html`/`adr.html` drafts in `<sprint>/design/` "only for documents whose frozen `documents.*` flag is enabled".
- [sprint-lifecycle.md "Acceptance-criteria source"](../../rules/sprint-lifecycle.md) line 133: the AC source is PRD AC-N when frozen `documents.prd` is enabled. Every downstream phase keys on this.
- [sprint-lifecycle.md "Self-hosting"](../../rules/sprint-lifecycle.md) line 113: the Dev allowlist has no `.asd/project/**`. Line 119 excludes `.asd/project/**` from the impl-review change surface.
- [checkpoints.md "Precondition chain"](../../rules/checkpoints.md) line 62: "`plan` requires promotion or collapsed design no-op". Line 5 is the `user_gates` config-to-state freeze precedent.
- [asd-phase-design.md step 2](../../workflows/asd-phase-design.md) line 22: the exact single write AC-3 describes, including the log line "design/design-review/design-promote skipped (no documents enabled)" and `NEXT: plan`.
- [asd-sprint SKILL.md step 3](../../skills/asd-sprint/SKILL.md) line 47: "`NEXT:` is authoritative". The listed exceptions to linear order cover only impl/impl-test/impl-review/retro/pr. Design's existing `NEXT: plan` collapse is not listed either.
- [README.md Configuration](../../../README.md) lines 245-288: the schema mirror. Line 223 is the `scoped_fan_out` precedent: "absent from an existing project's `config.yaml` means `disabled`", with no migration.
- [CHANGELOG.md](../../../CHANGELOG.md) line 96: `user_gates` was added with "absent legacy policy remains strict" and no migration.

## Existing implementation found
- `.asd/workflows/asd-phase-design.md:22`: the collapse write already produces the state AC-3 wants. Only the owner and the logged reason differ.
- `.asd/workflows/asd-phase-audit.md:18`: returns `NEXT: design` only. The tests in `tests/run.js:2736-2756` require each workflow to *include* its `PHASE_CHAIN` successor and allow any known phase. Widening the contract to `NEXT: <design | plan>` keeps §16 green. Dropping `design` would turn it red.
- `.asd/hooks/session-start.js:95-99,158`: `nextPhase` is a pure `PHASE_CHAIN[idx+1]` lookup.
  - After a skip write (`phase=design-promote`) it already reports `plan`.
  - While `phase=audit` it reports `design`, which is wrong under the setting.
  - Line 158 already special-cases `pr`, so an `audit` special case follows the same pattern.
- `tests/run.js:2142-2175`: temp-repo hook fixtures asserting `Next phase: …`. Reuse this for AC-5 and for the absent-field fallback.
- `tests/run.js:2758-2787`: checks only the fenced chain in `checkpoints.md`, the chain line in `sprint-lifecycle.md` and the `core.md` glossary. The prose precondition at line 62 is not machine-checked.
- `.asd/sync.js:1020-1025`: recomputes `canon_hashes`/`upstream_hashes`. `tests/run.js:1922` fails on stale entries.
- Cost baseline confirmed: `asd-phase-design.md` is 10,689 B and `asd-phase-design/SKILL.md` is 847 B. `asd-phase-audit.md` is 1,161 B and loads every sprint where audit runs.

## Gaps
- **G-1 Config field (AC-1).** No field exists. Its location is forced by the evidence: it cannot go inside the `documents` group.
  - `sprint-lifecycle.md:123` defaults an absent group to "every value enabled" and an absent field in a present group to "disabled".
  - A skip-polarity field (`enabled` = skip) inside `documents` would skip the design block for any old config with no group, which breaks AC-1.
  - A run-polarity field (`enabled` = run) would skip it for every existing config that has the group but not the field. That covers this repo (`config.yaml:15`) and every `/asd-init`-seeded consumer, which also breaks AC-1.
  - Place it top level, like `self_hosting`/`user_gates`, or under `project:`, with an explicit "absent = disabled" statement.
  - Candidate names (the plan phase decides): config `design_phases: run|skip`, `skip_design_block: enabled|disabled`, or `project.design_block: enabled|disabled`. State could use `skip_design` (bool) or `design_block_skipped` (bool).
- **G-2 State freeze (AC-2).**
  - `t_state.json` needs a quoted placeholder, e.g. `"{{SKIP_DESIGN}}"`, replaced by a bare boolean per the `sprint-lifecycle.md:125` convention.
  - `asd-phase-scope.md:8` step 3a needs the seeding rule (accept only the declared values; absent means false).
  - AC-2's "state without field = disabled" needs one home statement in "Optional documents".
- **G-3 Effective documents under the setting (AC-4).** Nothing says what `state.json.documents.prd/ux_spec/adr/c4` hold when the setting wins. Leaving them `true` breaks known consumers:
  - The AC source stays PRD (`sprint-lifecycle.md:133`), so plan, impl, impl-test, impl-review, pr and the Dev/Tester/Correctness/Testing agents look for a `prd.html` that never exists. The agent citations are `asd-dev.md:39`, `asd-tester.md:39`, `asd-reviewer-correctness.md:48`, `asd-reviewer-testing.md:35`, `review-policy.md:179` and `asd-phase-impl-review.md:36`.
  - Audit may still create reverse-engineered drafts under `<sprint>/design/` (`sprint-lifecycle.md:163`). No design-review or design-promote runs afterwards to review or promote them, so they end up as unreviewed orphans in the archive.

  **Recommendation:** at scope, when the setting is enabled, freeze the four design `documents.*` as effective `false`, following the `c4` precedent at line 123. The AC-4 decisions-log line keeps the record of which configured documents were suppressed. Effects:
  - Every existing consumer stays correct without edits.
  - Audit's draft rule suppresses drafts automatically.
  - A direct re-dispatch of `asd-phase-design` falls into the existing collapse (defense for free).
  - `documents.audit` is untouched (out of scope).
- **G-4 Skip write owner (AC-3).** There is no step that performs the skip without loading design.
  - **A. Audit workflow exit (recommended).**
    - Change: in `asd-phase-audit.md`, both exits read the frozen field. That is step 1's skip branch (line 3) and step 4's post-gate advance (line 6).
    - When the field is true, do the one inline mechanical write (`phase="design-promote"`, the three names appended, one decisions-log line naming the setting) and return `NEXT: plan`. Widen the contract at line 18 to `NEXT: <design | plan>`.
    - Why: the audit workflow is already loaded, and adds a few lines. `asd-sprint` follows `NEXT:` as authoritative (`SKILL.md:47`), so no router logic is needed.
    - Precedent: design already self-routes past its successor (`asd-phase-design.md:81`).
    - Open detail: on the audit-disabled branch there are two writes (audit skip, then design-block skip) or one merged write. AC-3 describes the design-block write alone, so two writes is the literal reading.
  - **B. `asd-sprint` router.**
    - How: intercept `NEXT: design`, check the state, write, then dispatch plan.
    - Against: it breaks `SKILL.md:22` ("No direct writes") and contradicts `NEXT:` being authoritative at line 47.
    - Against: it misses an explicit user-invoked `asd-phase-audit` re-run, which the skill description allows (`asd-phase-audit/SKILL.md:4`) and which never passes through the router.
  - **C. `runtime.js` subcommand (e.g. `next-phase`).**
    - Against: it adds a Node surface plus tests, and the workflow still has to call it and own the writes (`sprint-lifecycle.md:322` makes the orchestrator the sole `state.json` writer).
    - Against: the hook cannot share it cleanly because it is a standalone generated copy. It is more machinery than one boolean check needs.
  - **D. Guard inside `asd-phase-design/SKILL.md`.** Still loads and dispatches the design skill, which violates AC-3's "no … skill … loaded or dispatched". Rejected.
- **G-5 Plan precondition (AC-3).**
  - `checkpoints.md:62`: "promotion or collapsed design no-op" needs to also accept the explicit skip.
  - `asd-phase-plan.md:7`: "persistent docs reflect approved sprint design" should accept `skipped_phases` containing the block.
  - `asd-phase-plan.md:20` ("confirm design-promote done") is already satisfied mechanically by `phase=design-promote` plus `skipped_phases`.
- **G-6 Hook (AC-5).**
  - `session-start.js:158` needs `phase === 'audit' && state.<field> === true ? 'plan' : nextPhase(phase)`.
  - Strict `=== true` gives the absent-field fallback.
  - `PHASE_CHAIN` stays unchanged, so §16 is unaffected.
- **G-7 Resume display (AC-5).** Resume shows only "current phase" (`asd-sprint/SKILL.md:41`), and "Delegate to the matching phase skill" (line 43) does not say whether that means the current phase or its successor.
  - After any skip write (`phase=design-promote`), reading it as "current" would load `asd-phase-design-promote`.
  - This ambiguity already exists for the collapse, but AC-5 now makes it observable.
  - Needed: one clause stating that resume dispatches the successor of a completed or skipped phase (equivalently, `skipped_phases` membership means advance), and that the "re-run earlier phase" menu under the setting offers no design-block targets or notes that they collapse.
- **G-8 `/asd-init` diff mode (AC-1, AC-6).** Re-init dumps "full current config" (line 77) and asks "which sections to edit" (line 78). Nothing offers a `t_config.yaml` field that is absent from the current config, so a new field is invisible in diff mode today.
  - Needed: re-init lists fields present in `t_config.yaml` but absent from config, together with their absent default.
  - Fresh mode needs the field in the step 2 batch (line 29). The self-hosting recommendation could suggest enabling it.
  - The artefact list at line 121 needs updating too.
- **G-9 Rule mirrors (AC-7).**
  - `sprint-lifecycle.md:153` names design as the only collapse site.
  - The no-op table (lines 144-151) and "Multi-phase skip" (line 129) need the second trigger.
  - The design-review precondition wording (`asd-phase-design-review.md:7`) says "never separately dispatched" only for the documents case.
- **G-10 README/AGENTS mirrors (AC-7).**
  - README config block (lines 245-288) needs the field with its absent default.
  - The `AGENTS.md:60` lean-profile sentence should mention the setting once AC-6 lands.
- **G-11 Tests (AC-7).** Missing:
  - hook fixtures for `phase=audit` with the field true (expects `plan`) and without it (expects `design`);
  - a content contract that the audit workflow contract offers `plan`;
  - a scope placeholder check if desired.
- **G-12 Pre-existing drift in a touched file.** `asd-phase-audit.md:3` says "Read frozen audit state and its recorded reason", but `asd-phase-scope.md:7` and `sprint-lifecycle.md:9` say "no separate reason field". Fix it while that line is edited.
- External dependency gaps: none.
- Migration gaps: none required.
  - The field is additive with absent = disabled, and state without the field = disabled. Under `backward_compat: migration` there is no breaking change.
  - Precedents: `user_gates` (`CHANGELOG.md:96`) and `scoped_fan_out` (`README.md:223`) shipped without migrations. `4.0.0.js` explicitly never touches `config.yaml` (`tests/run.js:1854`).
  - Only the release bookkeeping moves: `upstream_hashes`/`canon_hashes` via `sync.js`, a MINOR bump at `pr`, and a CHANGELOG entry.

## Risks
- **R-1 AC-6 write path.**
  - Impact: high for DoD. Dev cannot write `.asd/project/config.yaml` (`sprint-lifecycle.md:113` allowlist). `asd-sprint` dispatches phase skills only (`SKILL.md:55`), so `/asd-init` cannot be dispatched from inside the chain, and settings go only through `/asd-init` (AGENTS.md hard rule).
  - Mitigation: plan AC-6 as a human manual step (`MS-N`, `sprint-lifecycle.md:204`). The user runs `/asd-init` diff mode on the sprint branch after the `t_config.yaml`/`asd-init` canon change is committed. The orchestrator commits the result before `impl-review` because of the clean-worktree precondition (`sprint-lifecycle.md:28`).
  - Note: `.asd/project/**` is outside the review surface (line 119), so verify AC-6 at `pr` DoD by reading the file.
- **R-2 Side effects of `/asd-init` re-init.**
  - Impact: medium. Step 0a re-syncs the `AGENTS.md`/`CLAUDE.md` managed blocks unconditionally (`asd-init/SKILL.md:24`), which can add unrelated diff. Step 7 probes the external CLI.
  - Mitigation: check `git diff` after the run and keep only the config change plus any block drift that is already current.
- **R-3 Contract wording collision.**
  - Impact: medium. `t_config.yaml:4` says "Edit via /asd-init (diff mode) or manually", which contradicts AC-6 and the AGENTS.md hard rule.
  - Mitigation: align the comment while editing this template.
- **R-4 Test-bound phrasing.**
  - Impact: medium. `core.md:15` "Eleven mandatory:" and the README/AGENTS "eleven … phases" count words are regex-asserted (`tests/run.js:2762,2803-2810`). Rewording "mandatory" to reflect skippability turns §16 red.
  - Mitigation: do not reword those lines. The existing collapse already coexists with them.
- **R-5 Audit contract widening.**
  - Impact: low. If a future edit removes `design` from audit's `NEXT:`, §16 fails (`tests/run.js:2749-2752`).
  - Mitigation: use `NEXT: <design | plan>`, never `plan` alone.
- **R-6 AC-4 recorded only in the log.**
  - Impact: low. With effective freezing, `state.json.documents` no longer mirrors config for suppressed documents, and the decisions-log line is the only trace.
  - Mitigation: this matches the `c4` effective-value precedent. Say so in "Optional documents".
- **R-7 Rollback re-run of audit under the setting.**
  - Impact: low. The skip write runs again and appends duplicate names to `skipped_phases`.
  - Mitigation: already allowed ("historical record, never removed", `sprint-lifecycle.md:127`). No change needed.
- **R-8 Generated views.**
  - Impact: low. The hook, `asd-init` and `asd-sprint` edits leave `.claude/hooks`, `.codex/hooks`, `.claude/skills` and `.agents/skills` stale (the current `sync --check` exits 0).
  - Mitigation: run `node .asd/sync.js --apply` on the generated view paths, then `--check`. Hash freshness is enforced by `tests/run.js:1922`.
- **R-9 Sprint 011 itself.**
  - Impact: none. Its state was frozen without the field (`state.json` has no such key), so its design phase still takes the implicit collapse. Enabling config mid-sprint does not affect the frozen state. This is consistent with scope's out-of-scope section.
