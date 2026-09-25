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
- `.asd/workflows/asd-phase-scope.md`: step 2 loses the cleanup/quality question (AC-6). Retro intake is inserted between raw-scope refinement and the step 4 gate (AC-1..AC-5). The References list gains the backlog template or home.
- `.asd/rules/sprint-lifecycle.md`:
  - "Orchestration and adaptive gates" L7: re-verification gains a second recording home, for the disposition.
  - "Retro phase" L277-296: row ids, and "nothing is promoted" versus the persistent backlog.
  - "Impl-test phase": fresh tester per entry (AC-13).
  - Review-fix tester scope (AC-15; this is the home the retro chose).
  - Phase-table `scope` row L110.
- `.asd/templates/t_retrospective.html`: row id on Action and Systemic rows (AC-7).
- `.asd/workflows/asd-phase-retro.md` step 6: emit the row ids.
- A new persistent backlog under `.asd/project/`, plus its `t_*` template (AC-4).
- `.asd/templates/t_decisions-log.md` "Durability rule": its closed list of persistent homes.
- `.asd/rules/artifact-layout.md`:
  - path map `.asd/project/` block L18-24 (backlog);
  - "Decisions log" Rotation L246 (AC-12);
  - "Agent memory" and/or a new leftover-term rule (AC-16, the retro's chosen home);
  - "Test plan" L184-186 (AC-15 ownership).
- `.asd/rules/checkpoints.md`: gate class for intake dispositions (hard list L7, inventory L40-50). "Criterion cost surfacing" L26 applies to included candidates.
- `.asd/rules/git-strategy.md` "Commit before review" L40 and "Commits" (AC-8).
- `.asd/rules/code-style.md` §19 L142: staged pre-commit lint. It conflicts with AC-8; see Contradictions.
- `.asd/project/commands.yaml` `lint` and `.asd/project/custom-coding-rules.md` staging mirror (AC-8).
- `.asd/rules/providers.md`: L25-40 dispatch operations (AC-9); L50 "Emitted on trust" (AC-10).
- `.asd/rules/review-policy.md`:
  - L33 exhaustive reviewer payload list (AC-9/AC-10);
  - "Autofix vs escalation" L83-91 (AC-11);
  - L142 memory channel (AC-14);
  - L162 interrupted-attempt reader (AC-12).
- `.asd/rules/external-review.md` "Phase-scoped payload": External Review also has `maxTurns: 50`.
- `.asd/workflows/asd-phase-impl.md`:
  - step 3 review-fix routing (AC-14);
  - steps 5/6 tester chain (AC-15);
  - step 6 L66, where the test-fix payload reads the stalemate answer from the "newest `decisions-log.NNN.md`" (AC-12);
  - step 9 round-diff gate (orchestrator-written paths).
- `.asd/workflows/asd-phase-impl-test.md`: L15/L74 ("one live `asd-tester` instance for the whole phase"); step 9 current-answer reader L52 (AC-12/AC-13).
- `.asd/workflows/asd-phase-impl-review.md`: step 6 payload (AC-9/10); step 9 terminal-suite tester (AC-13).
- `.asd/workflows/asd-phase-design-review.md` step 7: payload (AC-9/10).
- `.asd/skills/asd-sprint/SKILL.md` L19/L26: rotation delegation. It defers to artifact-layout, so it likely needs no text change.
- `.asd/agents/asd-tester.md`: description L4 omits the review-fix dispatch; write access at L77 (AC-13/15/16).
- `.asd/agents/asd-external-review.md` L67: memory carve-out (AC-14).
- `.claude/agent-memory/**`:
  - `asd-reviewer-documentation/project_reviewer-write-scope-declaration.md` L9 and `asd-tester-critical/feedback_fail-first-and-none-honesty.md` L55 restate the memory channel (AC-14);
  - the orphan `asd-pm/` directory matters for AC-16.
- `README.md`: L159 scope row, L168 retro row, L215 memory-channel restatement, L311-319 folder map (backlog, rotation note).
- `.asd/release-manifest.json`: `upstream_hashes` for the new template, `canon_hashes` for edited agents/skills, and `asd_version`. `CHANGELOG.md` as well (git-strategy L81).
- `tests/run.js`: the assertions listed under Risks.
- Generated views via `sync.js --apply`:
  - `.claude/agents` and `.codex/agents` for asd-tester (×3), and for the reviewers and external-review if their bodies change;
  - `.claude/skills` and `.agents/skills` for asd-sprint if it changes.

## Existing docs found
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md) "Orchestration and adaptive gates" L7: "Before such a row becomes an `AC-N`… the orchestrator checks it against current `HEAD`… Recording home is `decisions-log.md` alone… `sprint.md` gains no section."
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md) "Retro phase" L281-292:
  - retro output is "sprint-scoped, archived with the sprint. Nothing is promoted to a persistent doc.";
  - both classes are split consumer vs ASD;
  - a covered finding's row cites the rule in place of a guardrail.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md) "Self-hosting":
  - L126: the Dev write allowlist covers `.asd/{rules,templates,agents,skills,workflows,hooks,migrations}`, `runtime.js`, `sync.js`, `sync-state.json`, the manifest, `AGENTS.md`, `README.md`, `CHANGELOG.md`, `tests/**` and its own memory. **`.asd/project/**` is not on it.**
  - L132: `.asd/project/**` is excluded from every impl-review surface.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md) "State recovery" L360: failed-dispatch reconstruction anchors on "that dispatch's decisions-log routing line".
- [t_retrospective.html](../../templates/t_retrospective.html):
  - Analysis rows carry `id="F-N"`;
  - Actions columns: Addresses / Guardrail / Acts on / Home;
  - Systemic columns: Guardrail / Acts on / Home / Expected saving;
  - `Acts on` is a `chip area` holding `consumer | asd`, and a Guardrail may read `covered by: …`;
  - **Action and Systemic rows have no id.**
- Archived retros [016](../archived/016-remove-terra-family/retrospective.html), [017](../archived/017-review-waves/retrospective.html) and [018](../archived/018-agent-tool-permissions/retrospective.html) match the template:
  - no row ids anywhere; the only in-row identifier is the F-N link in Action rows, and Systemic rows have none;
  - 016 and 017 each end their Systemic table with a `covered by:` row (row 4);
  - 017 Actions row 1 is `Acts on: consumer`.
- [asd-phase-retro.md](../../workflows/asd-phase-retro.md) step 6: writes the fragment per the template, in `language.docs`.
- [asd-phase-scope.md](../../workflows/asd-phase-scope.md) step 2: "Before the scope gate, ask explicitly for cleanup and quality criteria (legacy removal, warning budget, doc consolidation) unless the raw scope already states them. Verify every retrospective-derived criterion against current `HEAD`… Seed state and decisions log."
- [asd-sprint SKILL.md](../../skills/asd-sprint/SKILL.md): L26 says "rotate the decisions log when `.asd/rules/artifact-layout.md` 'Decisions log' requires it". Step 2A collects the raw scope as a plain chat message.
- [artifact-layout.md](../../rules/artifact-layout.md):
  - "Decisions log" L246: rotation happens "before delegating a phase skill whose phase differs from `state.json.phase`". Within-phase readers read the live file alone: the interrupted-attempt count, the failed-dispatch routing line, and the impl-test stalemate answer.
  - L248: cross-span readers read every segment.
  - "Agent memory" L91-95: memory lives at `.claude/agent-memory/<agent>/`, one directory per agent name, and is in every review surface.
  - "Test plan" L184-186: owner is Tester, and rotation is done by the Tester at re-entry.
- [t_decisions-log.md](../../templates/t_decisions-log.md) "Durability rule": the persistent homes are "a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type."
- [git-strategy.md](../../rules/git-strategy.md):
  - "Commit before review" L40: a dispatched agent "stages only the paths it authored (never a whole-tree command — `git add -A`/`-u`, `git add --renormalize`, `commit -a`, `git stash`…)";
  - there is no `--only` rule and no ban on stage-then-wait;
  - "Commits" L15 carries the `ASD-Task` trailer.
- [code-style.md](../../rules/code-style.md) §19 L142: "Run the pre-commit lint against staged content… Use `git diff --cached --check`… a project's configured `lint` command must be the staged form."
- [providers.md](../../rules/providers.md):
  - L46: reviewer grants, with the memory-channel scope delegated to review-policy;
  - L50: "Emitted on trust: `effort` and `maxTurns` — … neither is a documented subagent field today.";
  - no canon rule covers repo root or shell cwd; the only mention is artifact-layout L91, "whatever working directory a dispatch names".
- [review-policy.md](../../rules/review-policy.md):
  - L32-33: reviewers are spawned anew and "never reused or resumed"; "Reviewer payload carries only: …" is an exhaustive list;
  - L53 "Diff reachability": the orchestrator commits reviewer memory writes;
  - L87: "Verify before applying";
  - no consumer-grep rule;
  - L142: "`memory: project` is a separate write channel reviewers do use and the host serves.";
  - L162: the interrupted count is rebuilt "for the current iteration, in the live log".
- [checkpoints.md](../../rules/checkpoints.md): the L7 hard list and the L40-50 inventory have no row for retro intake dispositions. L31 "fix rounds charged" is a cross-span reader.
- [asd-phase-impl.md](../../workflows/asd-phase-impl.md):
  - L55: review-fix findings route only to `asd-dev` (`asd-tester` for test files);
  - L60: the tester chain runs after the dev chain, and nothing says which `test-plan.md` sections it may touch;
  - L66: "stalemate continue answer logged for it in the newest `decisions-log.NNN.md`";
  - L100: the round-diff gate admits only agent-authorised paths plus `config.yaml`.
- [asd-phase-impl-test.md](../../workflows/asd-phase-impl-test.md):
  - L15/L74: "delegate one live `asd-tester` instance for the whole phase… recover from on-disk evidence only after session loss";
  - L52: "a **current answer** is a decisions-log stalemate answer naming this `digest` and appended after the log's last routing line naming it".
- [asd-update SKILL.md](../../skills/asd-update/SKILL.md) L20: "Never touched: `.asd/project/**` (except `config.yaml`…)". `release-manifest.json` `managed_paths` has no `.asd/project` entry.
- [asd-init SKILL.md](../../skills/asd-init/SKILL.md) steps 9-12: fresh mode seeds `config.yaml`, the three custom rule files, `stubs.md` and `commands.yaml` from templates. Re-init and sprint-mediated modes seed nothing.
- [language-policy.md](../../rules/language-policy.md): user-facing artefacts, the retrospective included, are written in `language.docs`. No row covers machine literals embedded in user-facing HTML.
- [README.md](../../../README.md): L86 update-ownership table (`.asd/project/` never touched), L159 scope row, L168 retro row, L215 "`memory: project` is a separate write channel they do use", L311-319 folder map.
- [custom-coding-rules.md](../../project/custom-coding-rules.md): its staging mirror names every whole-tree command and cites git-strategy. `tests/run.js:3709-3714` enforces the mirror.
- [decisions-log.001.md](./decisions-log.001.md): per-row HEAD `ae09bac` evidence and the triage behind the AC-4 seed.
- Claude Code subagent docs (external, treated as untrusted):
  - `maxTurns` is a documented field; at the limit the host "returns its output marked as partial, and Claude can resume it";
  - `effort` is also documented;
  - for `memory`, "Read, Write, and Edit tools are automatically enabled", but its precedence against `tools`/`disallowedTools` is not documented.

## Contradictions
- `code-style.md` §19 plus `.asd/project/commands.yaml` `lint: "git diff --cached --check"` vs AC-8 (target `git-strategy.md`: commit via `git commit --only -- <paths>` and never leave a path staged between commands).
  - `--only` commits worktree content without staging it, so a staged-content lint run before it inspects nothing. That is the blind pass §19 warns about.
  - `tests/run.js:3858-3866` pins both §19's wording and the `--cached` lint.
  - Options:
    - (a) one compound command: `git add -- <paths> && git diff --cached --check -- <paths> && git commit --only -- <paths>`, with `|| git reset -q -- <paths>` on failure. Staging exists only inside that one command, §19 and commands.yaml stay unchanged, and never-tracked paths are handled too;
    - (b) amend §19, commands.yaml and the test to an unstaged, path-scoped form (`git diff --check -- <paths>`, with `git add -N` for new files). This widens the scope.
  - winner=unsettled → user: (a), one compound command; §19, commands.yaml and the test stay unchanged (decisions-log 2026-09-25).
- `providers.md` L50 ("`maxTurns`… neither is a documented subagent field") vs the Claude Code docs and the enforcement 018 F-3 observed.
  - The `maxTurns` half is overridden by user-accepted AC-10 (scope gate), so winner=sprint.md AC-10.
  - The `effort` half has no accepted AC, so winner=providers.md by precedence. Plan note: the AC-10 rewrite must decide whether to keep an `effort` claim that the host docs contradict.
- `review-policy.md` L142 ("memory channel… the host serves") vs the 017 F-4 evidence: reviewers carry `disallowedTools: [Edit]` and no `Write`. winner=sprint.md AC-14 (user decision at the hard scope gate).
- Archived retro 017 Systemic row 4 ("covered by: `asd-phase-scope.md` step 2") vs AC-6, which removes that coverage. The archived artefact is immutable and out of scope, and intake never offers `covered by:` rows (AC-1). winner=sprint.md; nothing to edit.

## Existing implementation found
- Manual retro re-verification at scope already exists (sprint-lifecycle L7, scope step 2). `tests/run.js:3881-3887` pins both of its phrases, and AC-3 reuses them.
- The consumer/ASD split already exists as the `Acts on` chip on both Action and Systemic rows, which AC-2 filters on. `covered by:` rows are recognisable by their Guardrail prefix.
- The persistence precedent is `.asd/project/stubs.md`: project-global, it survives archival, and `asd-update` never touches it. A backlog under `.asd/project/` therefore satisfies "`/asd-update` never overwrites" with no update.js change.
- Lazy creation on first write has a precedent: `friction-log.md`.
- Decisions-log rotation is a rule (artifact-layout L246) that `asd-sprint` executes. Cross-span readers (retro, checkpoints L31) already read every segment.
- The whole-tree staging ban and author-only commits are in git-strategy L40. The dev and tester grant "`git add`/`git commit` for its own work" (`tests/run.js:3696`) already covers `--only` and `add -N`.
- Extending the payload list has a precedent: sprint 012 added the interrupted-attempt record to the list, and `tests/run.js:4451-4460` pins it.
- impl-review already runs the terminal-suite tester as its own `asd-tester` dispatch (step 9). impl-test uses one live tester per phase.
- AC-16 has a sprint-specific precedent: `tests/run.js:5515-5543` sweeps canon and agent memory for sprint 017's removed terms. It covers only agents that `.claude/agents/` defines, so the orphan `.claude/agent-memory/asd-pm/` falls outside it.
- The AC-4 seed evidence is already recorded (decisions-log.001.md).

## Gaps
- **Backlog home.** No home exists yet.
  - Needed: a path under `.asd/project/` (plan picks the name, e.g. `retro-backlog.md`), a `t_*` template with `responsibility` frontmatter, entries in the artifact-layout path map and the README folder map, and orchestrator ownership.
  - Recommendation: lazy creation at the first intake write, with no asd-init change. An AC-5 no-op writes nothing.
- **Durability rule.** `t_decisions-log.md`'s closed list of persistent homes must name the backlog. Otherwise it contradicts "never invent a new document type".
- **Retro phase wording.** "Nothing is promoted to a persistent doc" must say that the backlog holds scope-time dispositions, not retro content.
- **Recording split for AC-3.**
  - Verification evidence stays in `decisions-log.md`; the disposition goes to the backlog.
  - A candidate closed as already resolved has no AC-4 disposition. Without a recorded `closed`, a resolved deferred row is re-verified every sprint. Plan fixes this with a fourth value or an explicit mapping.
- **"Most recent archived retrospective"** is undefined:
  - which folder counts (the highest NNN under `archived/` with `phase=done`?);
  - what happens when that sprint has no `retrospective.html` (fall back to an older one, or an AC-5 no-op?).
- **Row ids (AC-7).**
  - New ids must not collide with the Analysis `id="F-N"` anchors; e.g. use `A-N` for Actions and `P-N` for Systemic.
  - They must keep `tests/run.js:3069-3101` green.
  - Proposed legacy derivation: `<NNN-slug>` + section id (`actions` | `systemic-proposals`) + the 1-based `<tbody>` ordinal counting every row, `covered by:` rows included.
  - Seed under that derivation:

    | Retro | Rows | Disposition |
    |---|---|---|
    | 016 `systemic-proposals` | #1 | deferred |
    | | #2 | included (merged with 018 #2) |
    | | #3 | rejected |
    | | #4 | covered |
    | 017 `actions` | #1 | rejected |
    | | #2, #3 | included |
    | 017 `systemic-proposals` | #1 | deferred |
    | | #2 | included |
    | | #3 | deferred |
    | | #4 | covered |
    | 018 `actions` | #1-#3 | included |
    | 018 `systemic-proposals` | #1-#3 | included |

    Totals: 10 included rows (= 9 items), 3 deferred, 2 rejected.
- **Machine literals in a translated artefact.** The `Acts on` value and the row id must stay literal English under any `language.docs`. No rule says so today; a template comment or a `data-*` attribute would fix it.
- **Parse mechanism.** Plan picks one:
  - an orchestrator inline read (about 10 rows);
  - a deterministic `runtime.js` helper with its own tests.

  AC-7's "deterministic derivation" favours at least a fixed written algorithm.
- **Gate class.** checkpoints.md has no row for intake dispositions.
  - Include adds an AC, so the existing hard scope gate covers it.
  - Reject is permanent, so it should be hard in both modes.
  - Undecided defaults to deferred.
  - "Criterion cost surfacing" applies to included candidates.
- **Scope step ordering.** The decisions log is seeded at the end of step 2, but intake's verification entry needs the log to exist. The intake step (e.g. `2a`) must sit after seeding and before step 4.
- **Writer for `.asd/project/**` in self-hosting.**
  - The Dev allowlist (L126) excludes `.asd/project/**`, and the impl step 9 round-diff gate (L100) fails any path not authorised to a dispatched agent other than `config.yaml`.
  - Two AC-17-bound edits live there: the AC-4 backlog seed and the AC-8 `custom-coding-rules.md` staging mirror, which `tests/run.js:3709-3714` pins.
  - Plan must assign a writer: the orchestrator inline plus a gate carve-out, or an allowlist extension.
- **AC-9.** No canon rule exists; the home is providers.md "delegate to agent". The review-policy L33 payload list and the external-review payload list must admit the repo root. One home statement, cited by the workflows, is cheaper than editing every payload list.
- **AC-10.**
  - The payload lists must admit the turn budget and the emit-by turn.
  - The budget source is frontmatter `maxTurns`: 50 for the reviewers and External Review, 30 for the advisor.
  - `sync.js` L296 renders `maxTurns` into the Claude view only (Codex TOML has none), so the statement must be scoped per host.
- **AC-11.** Home: review-policy "Autofix vs escalation" / "Verify before applying". asd-phase-impl step 6 already cites it, and the completion-signal content has to be named there.
- **AC-13.** Home: sprint-lifecycle "Impl-test phase". asd-phase-impl-test L15/L74 are silent about crossing entries, and asd-phase-impl-review step 9 needs "fresh".
- **AC-14.**
  - Routing: asd-phase-impl L55 routes review-fix only to dev/tester.
  - A reviewer owner cannot be dispatched as a fixer without clashing with fresh-per-iteration and verdict-token semantics (review-policy L32, L154), so plan must define how the owner returns its text.
  - Codex renders no `memory`, so the rule is Claude-only.
  - Mirrors: review-policy L142, README L215, asd-external-review L67 (`tests/run.js:3452-3453`), and memory files `asd-reviewer-documentation/project_reviewer-write-scope-declaration.md` L9 and `asd-tester-critical/feedback_fail-first-and-none-honesty.md` L55.
- **AC-15.** The rule goes in sprint-lifecycle, cited from asd-phase-impl steps 5/6 and asd-tester.md.
  - asd-tester's description (L4) omits the review-fix dispatch.
  - artifact-layout "Test plan" says "Owner: Tester" without separating impl-test from review-fix.
- **AC-16.** Canon has no leftover-term check, only sprint-specific test sweeps.
  - The rule must be created (retro home: artifact-layout.md) and bound to impl-test entry 1.
  - Plan decides whether it covers orphan memory directories of removed agents (`asd-pm/`).
- **AC-12.** Rotation skips transitions where both phases are in {impl, impl-test, impl-review}, and fires on plan→impl entry, rollback re-entry, and impl-review→retro. asd-phase-impl L66 must read the live file, not the "newest `decisions-log.NNN.md`".
- **Mirrors.**
  - README: L159 scope row (intake), L168 retro row (row ids), L215 (AC-14), folder map (backlog). The L319 rotation note stays true.
  - Manifest: `upstream_hashes` for the new template (`tests/run.js:3037`) and `canon_hashes` for edited agents/skills; `sync.js --apply` recomputes both.
  - `asd_version` bump and CHANGELOG at pr (`tests/run.js:5508`).
- **External dependency gaps.**
  - git: `git commit --only -- <untracked>` fails with "pathspec … did not match any file(s) known to git" (verified on git 2.55.0 in a scratch repo). `git add -N` or `git add` in the same command fixes it, and a sibling's staged path stays staged and uncommitted.
  - Claude Code: `maxTurns` is host-enforced, returning partial output with a resume offer. How memory tool auto-enablement interacts with `disallowedTools` is undocumented.
  - Codex: the rendered TOML has no per-agent `maxTurns` or `memory`.
- **Migration gaps.**
  - The backlog needs no `.asd/migrations/` script, and none is allowed (a migration may touch only `config.yaml` under `.asd/project/`). Lazy creation covers existing consumers.
  - Legacy retros go from having no row ids to having derived ones.
  - A consumer sprint that is mid-cycle when this lands may have a stalemate answer in a segment rotated under the old rule. The new live-file reader misses it and asks again, which is fail-safe.

## Risks
- AC-8 with never-tracked paths. Impact: the commit errors, or a half-run chain leaves intent-to-add or staged entries. Mitigation: add new paths in the same command, run `git reset -q -- <paths>` on failure, name both paths of a rename, and retry on `index.lock` contention.
- AC-8 vs the §19 lint. Impact: a pre-commit lint that checks nothing. Mitigation: settle the contradiction before plan.
- AC-12 breaks asd-phase-impl L66. Impact: the user's stalemate guidance silently drops out of the test-fix payload. Mitigation: switch that reader to the live file in the same change, and add a test.
- AC-12 widens the live log. Impact: several rounds' routing lines coexist, so the failed-dispatch anchor must be the latest routing line naming those ids. Low risk, because ids are unique per round. Mitigation: say "latest" in "State recovery".
- AC-10 host differences. Impact:
  - on Codex the budget is advisory only;
  - on Claude, a `maxTurns` stop returns partial text with no token or ledger. That counts as an interrupted dispatch and is never resumed, so the same manifest exhausts again and the second interruption escalates.

  Mitigation: scope the statement per host, and name wave division (not resume) as the lever.
- AC-14 orchestrator-applied memory writes in review-fix. Impact: they trip the step 9 round-diff gate. Mitigation: carve the path out and record it in the decisions log.
- The backlog is outside every review surface (L132). Impact: seed and format errors go unreviewed. Mitigation: a `tests/run.js` assertion on the backlog shape and seed rows (precedent: `tests/run.js:3864`).
- Dispositions land only via the sprint PR. Impact: an aborted sprint loses its intake decisions, which are then offered again. This is fail-safe; state it.
- Intake parsing is fragile. Impact: translated chips or a free-form `covered by` placement mis-filter candidates. Mitigation: pinned English literals and a fixed, tested algorithm.
- Tests that will break (mitigation: update each in the same Task as its rule edit, per AC-17):
  - `tests/run.js:5505` (AC-6; the title at 5462 too);
  - `3412`/`3417` (AC-14);
  - `3427` (AC-10);
  - `3452-3453` (External Review carve-out);
  - `4932-4937` (rotation wording);
  - `3704-3714` (AC-8 whole-tree clause mirror);
  - `3858-3866` (only under contradiction option b).
- AC-6 removes the coverage that 017's `covered by:` row relied on. Impact: the plan-gate AC widening it described may recur. The user accepted this at scope; no action.
- Documentation economy. Impact: intake adds per-sprint orchestrator text. Mitigation: one normative home in sprint-lifecycle, with the scope workflow citing it.
