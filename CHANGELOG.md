# Changelog

All notable consumer-facing changes to ASD. Format: [Keep a Changelog](https://keepachangelog.com/). Versions follow [SemVer](https://semver.org/). Newest first.

## v13.2.0

Retro findings no longer wait for someone to remember them. Scope now offers the open Action/Systemic-proposal rows of the last archived retro automatically, and a few workflow-gate fixes from prior retros land: the commit contract, the dispatch payload header, review-fix consumer search, decisions-log rotation, per-entry tester lifecycle, memory-finding routing and the `impl-test` review-fix boundary.

### Added
- **Retro intake** (`sprint-lifecycle.md` "Retro intake"). At scope, after the raw scope is collected and before the scope gate, `node .asd/runtime.js retro-candidates` offers every open Action/Systemic-proposal row of the most recent archived retro plus every backlog `deferred` row (self-hosting also gets `asd`-scoped rows). Each candidate is re-verified at `HEAD`; an already-resolved one closes without asking. The rest go to you with a recommendation each: include becomes an `AC-N`, defer offers it again next sprint, reject drops it for good. No prior retro or no candidates after filtering is a silent no-op.
- **Retro backlog** (`.asd/project/retro-backlog.md`, `t_retro-backlog.md`). One persistent, orchestrator-owned table of cross-sprint retro-row dispositions (`deferred | included | rejected | closed`), created lazily, never touched by `/asd-update`.
- **Retro row ids.** `t_retrospective.html` and the retro phase now emit a stable `A-N`/`P-N` id per Actions/Systemic-proposals row, addressable cross-sprint as `<NNN-slug>#A-N`. Legacy retros derive the same id from table + row ordinal.

### Changed
- **Scope phase** drops the mandatory cleanup/quality-criteria question; such criteria now enter scope only via the raw ask or an included retro candidate.
- **Commit contract** (`git-strategy.md` "Commit before review"). A dispatched agent now commits in one compound command — stage, `--check`, `commit --only` — resetting on failure, never leaving a path staged between commands.
- **Dispatch payload header** (`providers.md`). Every dispatch payload opens with `Repo root: <absolute path>`; a reviewer/External/advisor payload also carries a turn budget. `maxTurns` is now documented as host-enforced on Claude and absent on Codex, not "emitted on trust".
- **Review-fix consumer search** (`review-policy.md` "Autofix vs escalation"). A review-fix that changes a rule other files consume now searches for and updates every consumer in the same commit, listed in its completion signal.
- **Decisions-log rotation** (`artifact-layout.md` "Decisions log") now happens once per entry into the `impl`/`impl-test`/`impl-review` cycle, not at each transition inside it.
- **Fresh tester per entry** (`sprint-lifecycle.md` "Impl-test phase"). Each `impl-test` entry and each terminal full-suite run dispatches a fresh tester; a tester is never resumed across entries. A review-fix tester amends only `test-plan.md`'s risk and added-test rows — `Entry log` and segment rotation stay with `impl-test`.
- **Memory-finding routing** (`review-policy.md` "Autofix vs escalation"). A review finding or test-fix `D-N` in `.claude/agent-memory/<owner>/` routes to `<owner>` in a fresh memory-fix dispatch, one per owner, run one at a time after the fix chains: the owner fixes the file with its own write tool (on Claude a reviewer holds `Write` through `memory: project`), and the orchestrator commits it when the owner cannot; an owner with no write tool returns replacement text for the orchestrator to apply. A finding in a removed agent's memory directory has no owner, so the orchestrator deletes the stale file. `review-policy.md` "Gate Verdict Format" now states that policy, not the host, keeps a reviewer's writes to its own memory directory.
- **Leftover-term check** (`artifact-layout.md` "Agent memory") runs at the first `impl-test` entry of a sprint that removes a mechanism or term, over the whole repo including `.claude/agent-memory/**` and orphan agent directories.

## v13.1.0

Agent tool grants now match how agents are actually dispatched. No subagent can reach the user on either host, so every user prompt comes from the main orchestrator. BA and UX get a bounded shell. Web access moves to the agents that benefit from it, on Claude and on Codex.

### Changed
- **Tool grants.** No agent grants `AskUserQuestion`.
  - BA and UX gain `Bash`, bounded by a run-command policy: BA may run read-only git inspection; UX may run `designmd-lint`, `designmd-diff` and `designmd-export`.
  - Dev, Tester, Advisor and Correctness gain `WebFetch` and `WebSearch`, each scoped by its Tool policy.
  - Efficiency, Testing, Documentation and External Review stay web-less.
  - Consider pre-allowing `WebFetch`/`WebSearch` in `.claude/settings.json` to avoid permission prompts.
- **Codex web access.** The same agents render `web_search = "live"`; the four web-less agents render `"disabled"`. `sync.js` accepts an optional `codex.web_search` key (`disabled|cached|indexed|live`). Run `/asd-update` to regenerate the views.
- **User contact is orchestrator-only** (`core.md` "Request user decision"):
  - A dispatched creator, dev or tester returns `QUESTION`. The orchestrator asks you, logs the answer and re-dispatches (`sprint-lifecycle.md` "`QUESTION` protocol").
  - The design phase's section discuss/accept loops and the UX token gate now run in the orchestrator.
  - `/asd-concept` and `/asd-stack` collect your description before delegating.
  - impl-review asks you for manual-verification results before dispatching the testing reviewer.
  - The orchestrator runs `designmd-install`, on Windows once per session, before dispatching UX.
- **Reviewer questions** (`review-policy.md` "Reviewer question carrier"):
  - A reviewer never returns a bare `QUESTION`. It lists `question: <finding id> — <text>; options: …` under `## Escalations`, and returns at least `CONCERNS` while a question is open.
  - The orchestrator writes your `answer:` into the review file, and review-fix acts on it.
- **External Review stalemate.** A stalemate returns `FAIL` plus a `Stalemate:` block. Its options are now **stop**, **continue fixing** and **abort**, defined in `external-review.md` "Stalemate detection". They replace the old accept as-is / override wording.
- **Findings you resolve without a fix.** Override, stalemate stop and iteration-cap accept append a `resolved:` line to the review file. Such a verdict now satisfies DoD and the pr gate (`sprint-lifecycle.md` "State recovery" "User-resolved findings").
- **Commit tool.** `git-strategy.md` now defines who holds a commit tool by role policy, not by tool grant: only Dev and Tester commit, and the orchestrator commits BA, UX and Architect drafts.

## v13.0.0

A large impl-review scope is now reviewed as up to 3 sequential **review waves**, each running the standard review process with its own iteration counter. Waves replace split dispatch parts, External Review's file batches and the dispatch ceiling. Every reviewer, External Review included, receives the same three-part hand-off: its own file list, a runtime-written `.diff` for exactly that list, and whole files as context only.

### Migration (breaking)
- **No migration script.** A sprint already in flight with the old flat `state.json.reviews.impl` (`iteration`, `verdicts`, `iteration_heads`, `latched`) is read as one wave, and its first wave-aware impl-review entry rewrites it into `{wave, waves: [...]}` in place. Legacy `reviews/impl/iter-NN/` dirs, a bare `review_fixes_pending: "iter-NN"` and a recorded `"APPROVE (partial: ...)"` External verdict are all read as wave 1 and still count as satisfied.
- **Custom External Review prompts.** `external-review/t_review-scope.json` changed from `base_ref`/`head_ref`/`exclude_paths` to `phase`, `iteration`, `wave`, `files[]` and `diff`. A local prompt that tells the wrapped CLI to run `git diff` over the refs must instead read the `diff` file path the manifest names.
- **Removed runtime surface.** `SPLIT_THRESHOLD_FILES`, `DISPATCH_CEILING`, `--halve`, `NA_PREDICATES.outOfPart`, `surface-check`'s `dispatches` and `--test-plan-files`, and `draft-snapshot`'s `snapshot.json` are gone. A script that calls them has to drop those flags and fields. `draft-snapshot --out/--previous` now take iteration directories.

### Added
- **Review waves** (`sprint-lifecycle.md` "Review iteration counters"). At the first impl-review entry, `node .asd/runtime.js review-waves` measures the scope's changed lines (binary files and pure renames count 0). The wave count is one per `WAVE_THRESHOLD_LINES` (3000) begun, capped by the file count and by `MAX_REVIEW_WAVES` (3). The orchestrator groups the files into cohesive waves; `review-waves --division` validates the grouping and writes `reviews/impl/waves.json`.
  - Waves are reviewed one after another, each with its own severity floor, iteration cap, verdicts and APPROVE latches.
  - When a wave's reviewers are done, the next wave starts in the same entry. The full test suite runs once, after the last wave.
  - A fix touching an earlier wave's file is reviewed in the current wave, and a closed wave is never reopened.
  - The iteration id is `wave-<K>/iter-NN`, and review files live under `reviews/impl/wave-<K>/iter-NN/`. The impl-review return contract gains `WAVE: <K>`.
- **`wave-files`**: builds a wave's iteration-1 list, carrying files renamed since the division over to their current paths.
- **Scope hand-off** (`review-policy.md` "Scope hand-off"). This is now the one statement of what each reviewer receives, in both review phases:
  - its file list, which is the only normative scope;
  - one `.diff` named by a fingerprint of its inputs, rewritten on every emit and shared by reviewers with the same list and range;
  - whole files, as context only.

  External Review now gets its list and diff from `emit-manifest --reviewer external`. Design-review gets a diff from iteration 2 onward, taken against the previous iteration's draft copies; a carried-over draft is listed without a hunk and read whole.

### Removed
- Split dispatch parts (`.part-N` manifests, diffs and review files; the size and interruption split triggers; the union property and part merge). If the same reviewer is interrupted twice in a row, the orchestrator now asks you to retry or abort.
- External Review's in-dispatch file batches and its `partial` outcome. One dispatch makes one wrapped-CLI call, retried once, and returns a verdict or an availability skip.
- The dispatch ceiling (`DISPATCH_CEILING`). Every task in an impl wave now starts at once, so keep plan waves reasonably sized.

## v12.0.0

Codex `terra` model family removed; its users move to `sol` at unchanged `medium` effort.

### Migration (breaking)
- **Custom agents declaring `terra`.** Replace `codex.model: "terra"` (and any `wraps_model: "terra"`) with `"sol"` in every `.asd/agents/*.md` you authored or kept as a local edit, then run `node .asd/sync.js --apply <generated-view-path...>` and `node .asd/sync.js --check`. Until then `/asd-update`'s post-update check and `sync --check` exit 1 with `unknown model family (family "terra", …)`; the already-generated view keeps running. There is no migration script — a release migration never rewrites custom agents.

### Removed
- Codex model family `terra` (`gpt-5.6-terra`) from `release-manifest.json` `model_families`; the Codex model-ID check accepts only the remaining families.

### Changed
- `asd-dev` and `asd-tester` (base, standard tier) and the `asd-external-review` wrapper resolve to `sol / medium` under Codex, up from `terra / medium` — expect higher Codex usage on these agents. Standard vs critical (`sol / high`) is now an effort split. Run `/asd-update` to regenerate the Codex agent views.

## v11.1.0

Codex `sol` and `luna` model families move to GPT-6.

### Changed
- Codex `sol` resolves to `gpt-6-sol` and `luna` to `gpt-6-luna`; `terra` stays `gpt-5.6-terra`. Run `/asd-update` to regenerate the Codex agent views and the External Review wrapper.
- Codex model-ID validation accepts any `gpt-<N>[.<M>]-<family>` ID, so a later family bump is a `release-manifest.json` edit alone, with no sync engine change.

## v11.0.0

Remediates the Glings sprint 003 (subsystem-layout-migration) retrospective. Each reviewer now gets its own scoped file list and, in impl-review, its own `.diff` patch instead of a shared list and rendered diff text; concurrent dispatches are capped and large audits read in batches; scope collection drops the decision-prompt UI for free-form input and no longer clears context at phase boundaries; and a sprint may skip one enabled optional document for itself alone.

### Migration
- **No migration script.** New manifest fields (`--base/--head`, `pureRename` rows, per-reviewer file lists) are optional to `validate-ledger`; a manifest emitted before the upgrade still validates, and `state.json`'s schema is unchanged. An in-flight review iteration started before the upgrade: finish it as emitted, or discard and re-emit it fresh under the new per-reviewer contract — both are safe.

### Added
- **Per-reviewer scope.** `emit-manifest` builds each reviewer's file list from one selector keyed by phase and reviewer (`review-policy.md` "Reviewer responsibility"). In impl-review, Testing narrows to the `isTest` files plus `--test-plan <path...>` (`test-plan.md` and its segments); Correctness, Efficiency and Documentation keep the full scope list.
- **`.diff` patch files.** `emit-manifest --base <sha> --head <sha>` (impl-review only) writes one patch per manifest or part (`<reviewer>[.part-N].diff`) beside it, and grants the compact `pureRename` row (`NA_PREDICATES.pureRename`) to every rename with identical content and mode — only a machine-proven rename qualifies, never a namespace/import-only edit. The reviewer payload carries the manifest and `.diff` paths, never rendered diff text, and no reviewer is ever told to run git.
- **Dispatch ceiling.** `DISPATCH_CEILING` (20) caps concurrent dispatches in one phase step; anything above it runs in sequential sub-waves (review parts, impl task waves), each judged separately for correlated interruption. `surfaceCheck` also returns the implied review-dispatch upper bound. A change-surface cap-override request states the `dispatches` count it implies.
- **Batched audit reads.** `AUDIT_BATCH_THRESHOLD_FILES` (200): when the touched areas exceed it, the architect payload carries a batched-read plan (grep first, then targeted section reads) instead of a flat file dump; `asd-architect`'s `maxTurns` rises to 150 to match (the batched-read plan, not the turn cap, is the real control).
- **Per-sprint document skip** (`sprint-lifecycle.md` "Optional documents"): the user may flip an enabled `prd`, `ux_spec`, `adr` or `c4` to `false` for the active sprint only, at the scope gate or the audit exit, before any draft of that document exists — a hard gate, narrow-only, logged as "<doc> skipped this sprint by user" distinct from config-disabled. `audit` itself is excluded.
- **Free-form scope.** Raw scope arrives as a plain chat message, not a decision prompt; before the scope gate the orchestrator asks about cleanup and quality criteria (legacy removal, warning budget, doc consolidation) unless the raw scope already covers them.
- **BA/UX doc rename/delete** now routes through the orchestrator at `design-promote`: the user approves, then the orchestrator runs `git mv`/`git rm` inline and re-dispatches the creator fresh to update content and inbound links.
- **Design-review draft correctness.** Correctness gains a design-review rubric entry: AC completeness against `sprint.md`, contract soundness, ADR decision soundness — covering every changed draft, not only UI drafts. From iteration 2 every design-review reviewer gets only the drafts changed since the previous iteration: `runtime.js draft-snapshot` persists each iteration's draft hashes in `reviews/design/iter-NN/snapshot.json` and lists what changed.

### Changed
- **Context hygiene** (`core.md`): no instruction ever tells the orchestrator to clear context. A phase boundary continues the chain itself; context compaction is automatic and host-driven. The gate answer is written to disk before any further work, so a mid-gate compaction stays recoverable.
- **Stub-resolution verification** moves from the Testing reviewer's rubric to Documentation's, alongside persistent-doc actuality.

## v10.0.0

Remediates the Glings sprint 002 retrospective. External Review can now return partial coverage from batched reviews instead of silently skipping, a failed dev/tester dispatch is reconstructed from git evidence before it is re-sent, plans declare a change surface capped at 100 files, and `decisions-log.md` / `test-plan.md` rotate into numbered segments so long sprints stay readable.

### Migration (breaking)
- **Merge duplicate `## Defects` sections.** `node .asd/runtime.js defect-stalemate` now fails closed when a `test-plan.md` holds more than one `## Defects` heading (exact or suffixed), naming each heading line. Before resuming an active sprint, merge those sections into the single table. There is no migration script.
- **External Review skip is narrowed.** `APPROVE (skipped: ...)` now applies only to a non-ready preflight or an active negative cache; a failure after invocation is an interrupted dispatch, or `APPROVE (partial: <n>/<m> files; <cause>)` when at least one batch completed with no finding at or above floor (`external-review.md` "Outcome contract"). A partial satisfies only its iteration and never latches; unreviewed files carry into the next iteration.
- **New hard gate `change-surface cap override`.** A plan whose `Change surface: <n> files` exceeds `SURFACE_CAP_FILES` (100) blocks acceptance until split into sequential sprints or overridden with a bound; impl-review re-measures at first entry. Plans without the line are grandfathered.
- **Commit trailer contract.** Every commit a dispatched dev or tester makes carries one `ASD-Task: <id>` line per id it covers (`git-strategy.md` "Commits").

### Added
- **Failed-dispatch reconstruction** (`sprint-lifecycle.md` "State recovery"): the routing line records `dispatch HEAD <sha>`; a dispatch returning no signal is rebuilt from `ASD-Task` trailers and uncommitted leftovers before re-dispatch. An impl-test trailer never marks its entry landed, and a `D-N` lands only once its Defects row reads `fixed`.
- **External Review batching**: scope above `SPLIT_THRESHOLD_FILES` is reviewed in sequential batches inside one dispatch; `t_review-report.md` gains `Reviewed files` and `Unreviewed files`.
- `node .asd/runtime.js surface-check --files <path> [--bound <n>]` and `SURFACE_CAP_FILES`.
- **Standing n/a for Documentation `Framework mode` and `Template adherence`**: `emit-manifest --self-hosting` and a templated-artefact classifier let split parts mark them n/a truthfully.
- **Log rotation** (`artifact-layout.md` "Decisions log", "Test plan"): `decisions-log.NNN.md` at a phase change, `test-plan.entry-NN.md` at impl-test re-entry; cross-span readers read segments in order.

### Changed
- `defect-stalemate` table errors name the offending line (`line <n>: ...`) and validate the separator row.
- `state.json` carries only keys `t_state.json` defines; `gate_decisions` reason/evidence are short refs, narrative goes to the decisions log (`artifact-layout.md` "State file").
- Test coverage grew from 203 to 207 checks.

## v9.0.0

The configuration surface shrinks from 28 settings to 20, and pull requests are always ASD-managed through `gh`. Three workflow guardrails replace an agent's word with deterministic evidence: a repeated `impl`⇄`impl-test` defect set escalates as a stalemate, a fail-first proof must carry raw runner evidence, and the retrospective deduplicates findings before drafting each survivor as a one-line guardrail with a named home. Audit now reads every relevant `docs/` document and lets the canonical ASD document win a contradiction.

### Migration (breaking)
- **Run `/asd-update`.** The new `.asd/migrations/9.0.0.js` rewrites `.asd/project/config.yaml` line by line, keeping your comments and line endings:
  - `documents.c4: enabled` keeps your `project.diagram_tool` (or sets `likec4` when absent); `documents.c4: disabled` sets `diagram_tool: none`.
  - `skip_design_phases: enabled` disables `documents.prd`, `ux_spec` and `adr` and sets `diagram_tool: none`.
  - Legacy `documents.audit: enabled`/`disabled` become `always`/`off`.
  - `documents.c4`, `skip_design_phases`, `git.gh_enabled`, `git.auto_pr`, `system.os`, `system.tools.likec4`, `system.tools.designmd` and `review.scoped_fan_out` are removed.
  - A config shape it does not recognise (flow maps, duplicate keys, tabs, mixed line endings, out-of-range values) is left untouched with a warning naming the re-run command.
  - A sprint already active keeps working from its frozen `state.json`.
- **`gh` is required.** `/asd-init` stops unless `gh --version` and `gh auth status` succeed, and the `pr` phase opens and merges through `gh` only; a `gh` failure is `FAILED` naming `gh auth login` or the install step. There is no manual-PR fallback.
- **Diff-scoped rubric n/a marking is always on.** Projects that omitted `review.scoped_fan_out` previously got full per-section review; the standing n/a predicates now always apply.
- **An unknown `documents.audit` value blocks scope** instead of being normalised.
- **A release migration is a sanctioned config writer.** `/asd-update` may apply release-mandated key renames and removals, plus the value mappings, key insertions and shipped-comment rewrites that carry a renamed or removed key's or value's intent (`core.md`).

### Added
- **Stalemate breaker** (`sprint-lifecycle.md` "Impl-test phase"): two consecutive `impl-test` entries routing the same code-defect set emit `FAILED: stalemate` and ask the user to continue with guidance, accept the defects as debt, or abort. Identity is file path, the runner's first failure line and the failing test name, compared by the new `node .asd/runtime.js defect-stalemate`. A logged answer covers only the next routing of that set. `test-plan.md` Defects gains an `Entry` column, and an interrupted impl-test entry is resumed rather than duplicated.
- **Audit contradictions** (`sprint-lifecycle.md` "Audit phase"): audit reads every `docs/` document bearing on the touched areas; a canonical ASD document wins a contradiction without a gate, and a contradiction precedence cannot settle is a hard user decision. `t_audit.md` gains an optional Contradictions section.
- `external-preflight` reports the host `platform`.

### Changed
- **Fail-first proof** (`code-style.md` §17): the record must name the exact command, its non-zero exit code and the failing test; a bare claim is not proof. The `t_test-plan.md` Regression proof cell takes that shape.
- **Retrospective** (`sprint-lifecycle.md` "Retro phase"): findings are merged by root cause, checked against the rules already in their candidate home, and only then drafted as `Guardrail` + `Home`. Both tables in `t_retrospective.html` replace `Recommendation`/`Target`.
- **Diagram setting**: `project.diagram_tool` takes `none | likec4 | mermaid`; `state.json.documents.c4` stays as the frozen effective-diagram flag. The design block collapses at the audit exit whenever PRD, UX spec and ADR are disabled and the effective diagram tool is `none`.
- **External Review invocation** keys its stdin form on the host shell: Claude Code always uses a heredoc, Codex a here-string on Windows and a heredoc elsewhere.
- Test coverage grew from 197 to 203 checks.

## v8.0.0

The subsystem registry moves. When `project.subsystem_decomposition` is enabled, `docs/architecture/subsystems.md` is now the registry, the only source of truth for which subsystems exist, whatever the diagram tool or the C4 setting. Each registered subsystem gets `docs/architecture/<id>.md`, which holds its purpose and key paths. `docs/architecture/c4/` exists only for likec4 with C4 enabled. In mermaid mode the diagram lives inline in `subsystems.md`, and `subsystems.yaml`/`architecture.html` are retired. The sprint also remediates the sprint 010 and 011 retrospectives: coverage manifests are emitted by `runtime.js` instead of being assembled by hand, a plan can declare a settings change that impl applies through `/asd-init`, and agents refuse payload instructions outside their declared tool policy.

### Migration (breaking)
- **Registry location.** A project decomposed before this release keeps its old registry (`c4/model/*.c4` or `c4/subsystems.yaml`) until its next `audit`. There, Architect proposes `subsystems.md` and one `<id>.md` per subsystem from that registry, and each subsystem needs your explicit confirmation. A mermaid diagram moves into the registry's `## Diagram` block. A legacy `c4/` made redundant (mermaid mode, or C4 disabled) is deleted only after migration, behind a hard gate, together with its `.gitignore` and `c4-build` entries. There is no migration script. A project with `documents.audit: off` gets the registry the next time audit runs.
- **`t_subsystems.yaml` is removed.** `/asd-update` deletes it when unmodified. A mermaid design draft is now `<sprint>/design/c4-full/subsystems.md`.
- A registry seeded empty by `/asd-init` is filled at `design-promote`, not at audit.

### Added
- **`runtime.js emit-manifest`**: builds each internal reviewer's coverage manifest from its rubric, the scope file list, custom rules and the standing n/a predicates. It splits a scope of more than `SPLIT_THRESHOLD_FILES` (25) files into parts before the first dispatch, and `--halve` splits after two interruptions. `validate-ledger --ledger` accepts the reviewer's returned text directly. The manifest also publishes its `n_a` shape (`n_a_shape`).
- **`Settings change: <key>=<value>` plan line** (`sprint-lifecycle.md` "Plan file format"). Plan acceptance approves the declared pairs, and impl applies them through `/asd-init`'s new sprint-mediated mode when the task's wave opens. The mode validates each pair against `t_config.yaml`. A failing pair is a phase blocker, and no manual step is involved.
- **Declared tool policy** (`providers.md`): a dispatch payload stays inside the agent's definition, the self-hosting allowlist and its own memory. An agent handed anything else returns `QUESTION`. Agent memory writes are checked against the agent's definition before they land.
- **`Flagged choices:` in the dev completion report.** A flagged choice blocks the adaptive impl assessment until it is resolved or routed back.
- `t_config.yaml` marks the allowed values of `documents.*` and `backward_compat`.

### Changed
- **Coverage manifests**: a dispatched manifest is immutable. Correcting one means a fresh dispatch, never a re-stamp. `manifest-digest --write` is removed; the command now only verifies. A re-dispatched reviewer receives its own interrupted-attempt record.
- **Reviewer suggested fixes are non-binding** (`review-policy.md` "Verify before applying").
- **Code-style rules**: a test or rule that names the members of a set derives the set from its source (`code-style.md` §17). A per-entry impl-test suite record measures the tree that entry analysed (`sprint-lifecycle.md` "Impacted test set").
- **Agent-memory commits**: a dispatched agent with a commit tool commits its own memory writes (`git-strategy.md`).
- Test coverage grew from 187 to 197 checks.

## v7.3.0

A project can now skip the design block outright. `skip_design_phases: enabled` routes a sprint from `audit` straight to `plan`: `design`, `design-review` and `design-promote` are recorded as skipped and none of their skills or workflows is ever loaded. The existing skip when every design document is disabled stays unchanged; the new setting only makes it explicit and cheaper. Absent from an existing `config.yaml` means `disabled`, so nothing changes until a project opts in; update through `/asd-update`, no migration script.

### Added
- **`skip_design_phases: enabled | disabled`** (`t_config.yaml`, `sprint-lifecycle.md` "Optional documents"): a top-level setting frozen into `state.json` at `scope`, like `user_gates`. When enabled, `documents.prd`/`ux_spec`/`adr`/`c4` freeze `false` for the sprint whatever their configured values, and scope logs the documents it suppressed. `documents.audit` is untouched.
- **The audit exit performs the skip** (`asd-phase-audit.md`): one mechanical write, covering a skipped audit and the design block together, sets `phase="design-promote"` and returns `NEXT: plan`. The return contract is now `NEXT: <design | plan>`.
- **`/asd-init` offers the setting** in fresh mode, and re-init diff mode now lists every template field absent from the current config with its default, so a newly shipped field is editable.

### Changed
- **Resume and the plan precondition key on a frozen collapse test** (`sprint-lifecycle.md` "Design/design-review/design-promote collapse", `asd-sprint`, `asd-phase-plan.md`, `checkpoints.md`): the design block counts as collapsed when `skip_design_phases` is true or every design document is disabled — never from the historical `skipped_phases` list, whose stale entry after a rollback could otherwise skip a real, interrupted promotion.
- **The session-start hook** reports `plan` as the next phase after `audit` when the setting is on.
- Test coverage grew from 184 to 187 checks.

## v7.2.0

Agent-facing text becomes a governed cost surface. ASD now carries an iron rule for it, sited beside the single-source-of-truth rule and enforced through the Documentation reviewer's blocking coverage ledger: a line earns its place only by changing what a reading agent does, with a removal test that is necessary and controlling, and a preserve-list that protects contracts, exhaustive enumerations, case distinctions, stated failure modes, and standalone safety prohibitions. Roughly 18.7 KB of prose was cut from canon under it. The sprint also remediates every problem the sprint 009 retrospective identified. Nothing in consumer state changes shape; update through `/asd-update`, no migration script.

### Added
- **A documentation-economy iron rule** (`artifact-layout.md`): what agent-facing text is cut on sight, the three tests that decide it — removal necessary and controlling, provenance and enforcement corroborating — and what is never cut whatever its length. It binds at authoring time, not only at review, so it reaches every creator that loads the file, including the two that never load `code-style.md`; and it reaches artifact templates, so consumer projects inherit it. The Documentation reviewer carries it as a rubric entry, which is the only path into the blocking coverage ledger.
- **Rubric-ID derivation is stated** (`review-policy.md` "Coverage ledger"): the manifest must enumerate every stable reviewer-rubric id and an omitted item invalidates a verdict, but nothing said where those ids come from. They are the rubric's own entry text, so a rubric edit moves the manifest in the same change.
- **Manifest `row_example`** (`review-policy.md`, `runtime.js`): one filled row travels beside the vocabulary, built from the vocabulary constant so it cannot publish a shape the validator rejects. `validate-ledger` rejects a manifest whose `n_a` is not an object or carries a key outside the row-type labels, instead of silently degrading it into "no predicate authorized" — a shape that accepted the malformed manifest while rejecting every truthful row.
- **Dispatch waves in the plan format** (`sprint-lifecycle.md`, `t_plan.md`, `asd-phase-plan.md`, `asd-phase-impl.md`): the plan's `## Dependencies` section is now required and carries a wave table; a task changing the dispatch or commit contract is ordered ahead of everything dispatched under it, alone in its wave. The impl phase schedules from that table instead of deriving its own topological sort, with a fallback for a plan authored before the rule.
- **Claude `effort` is validated at the emission site** (`sync.js`): against the same vocabulary the Codex counterpart already used, reached whenever the field is emitted rather than when a sibling field happens to be present. An invalid value previously shipped into the generated view, where the host ignored it while canon, the tier matrix and the README all claimed otherwise.
- **A corpus-wide citation sweep** (`tests/run.js`): every canon citation of the form file plus heading or bold label must resolve — 185 pinned relations, up from 20. It immediately found two dangling pointers whose target headings were renamed in an earlier release, both now retargeted.

### Changed
- **Whole-tree git commands are named and banned for a dispatched agent** (`git-strategy.md`, `custom-coding-rules.md`): `git add -A`/`-u`, `git add --renormalize`, `commit -a` and `git stash`, unconditionally — an agent cannot observe whether a sibling dispatch is in flight, so the conditional permission is the orchestrator's alone.
- **Agent-memory commit ownership covers the co-author case** (`git-strategy.md`, `artifact-layout.md`): the carve-out was justified by the author holding no commit tool, which is why it never reached a creator that does. Co-authorship is now defined where memory is — it can arise only between concurrent dispatches of the same agent, which share one directory.
- **A fail-first mutation must be restored before the agent's next tool call** (`code-style.md` §17), and a mutation left on disk is a defect regardless of what the suite reports.
- **The impl completion gate reads the round's diff** (`asd-phase-impl.md`): before committing or advancing, every path the round touched must be one its agents were authorised to touch. The `## Operations used` block grants the git command that gate needs — the obligation previously existed at a site with no tool to perform it.
- **The coverage-ledger enforcement splits its two cases** (`review-policy.md`): an incomplete or unverifiable ledger rejects and re-dispatches, while one whose content resolves every row in the wrong shape is transcribed once by the phase workflow, re-validated, and recorded as a deviation. Distrusting a verdict is warranted by missing evidence, not by a wrong container.
- **An External Review availability skip is a friction entry** (`external-review.md`), so a recurrence is visible to the next retrospective rather than only to the iteration that paid for it.
- **Six false single-source declarations were corrected** across `review-policy.md`, both review workflows and several agent bodies: a "not restated here" or "sole statement" claim that is false converts a self-declared contract into a trap, because reviewers use these declarations as the premise of findings. Where the restatement earns its place at the acting site, the declaration was narrowed instead.
- Reviewer bodies, both review workflows and several rule docs lost restated text that a tool grant, a validator or another file already owned — including thoroughness exhortations the coverage ledger enforces deterministically. `AGENTS.md`'s rule-doc list is a pointer at `core.md` "See also" rather than a second, already-drifted copy.
- Test coverage grew from 171 to 184 checks.

## v7.1.0

Remediation of every problem the sprint 008 retrospective identified. The theme this time is one-sided obligations: a rule that told one party what to do while the party who had to act read a different file, or read nothing at all. Reviews gain an evidence path for a dispatch that returns after its replacement, a correlated-interruption branch so one session-wide failure is recorded once rather than N times, and an outcome contract that forbids External Review returning nothing. The coverage manifest now carries the row vocabulary a reviewer must satisfy, published from the same constant the validator enforces. Nothing in consumer state changes shape; update through `/asd-update`, no migration script.

### Added
- **Manifest `vocabulary`** (`review-policy.md` "Coverage ledger", `runtime.js`): the allowed statuses per row type and the `p`/`f` placement rule now travel inside the manifest a reviewer is handed, instead of living only in prose it had to recall. Values come from one exported constant shared by the emitter and the validator, so published and enforced vocabulary cannot drift. Required in every manifest a phase workflow emits; optional to `validate-ledger`, which validates a manifest predating the field exactly as before and rejects one whose vocabulary diverges.
- **An outcome contract for External Review** (`external-review.md` "Outcome contract"): exactly two permitted returns — a verdict, or an availability skip naming its cause. Any inability to complete returns the skip, so the wrapper awaits the wrapped CLI inside its own dispatch and never backgrounds it; a return that is neither is not permitted and not a verdict, and its disposal is imported whole from the interrupted-dispatch rule. The agent's `FAILED` signal is gone, and `ABORT` is scoped to a precondition missing before any invocation.
- **A late-returning dispatch may now be recorded** (`review-policy.md` "Late duplicate return"): when a replaced dispatch delivers after its replacement's verdict was recorded, and carries an at-or-above-floor finding contradicting it, the phase workflow verifies that finding against source and records the more severe token. It holds for any replaced dispatch, External Review included. Previously the interrupted verdict never counted, which is right for bookkeeping and wrong for evidence.
- **Correlated interruption** (`review-policy.md`): one cause taking every dispatch in flight is recorded once as an iteration-level event, rather than arming the split trigger once per reviewer.
- **Criterion cost surfacing** (`checkpoints.md`): at the gates that already exist, a criterion's running cost is stated with the decision — iterations charged and fix rounds charged, both derived at read time from the review files and the decisions log, with no new state and no stored counter.
- **A conditional `Reachability:` line in the plan format** (`sprint-lifecycle.md`, `t_plan.md`): a task whose value depends on two phases agreeing names which two and on what, checked at plan approval. Absent means the task has no cross-phase dependency — deliberately not `Material risk`'s fail-closed semantics, and never input to routing.
- **Scope-time re-verification** (`sprint-lifecycle.md`, `asd-phase-scope.md`): a retrospective-derived acceptance criterion is checked against current `HEAD` before it becomes an `AC-N`, and the verification is recorded in `decisions-log.md`. A retrospective is written against the HEAD of the sprint that produced it and carries no evidence that its rows are still unresolved when a later sprint picks them up.

### Changed
- **Staging and commit ownership is stated whole** (`git-strategy.md`): a dispatched agent stages only the paths it authored and commits every path it authored before signalling completion. The rule previously stated only the negative half, and `asd-dev` was granted no git command at all — so the agent it governs could not follow it. That grant is now in the agent's tool policy, alongside the tester's.
- **Fix rounds run as one ordered chain, dev chain before tester chain, never concurrently** (`asd-phase-impl.md`): exactly one agent is in flight across a whole round. Parallel fix rounds each cost a review iteration in sprint 008 by introducing cross-file contradictions; initial-mode parallelism is unchanged.
- **A reviewer's proposed fix is verified against source before it is applied** (`review-policy.md` "Autofix vs escalation"). A prescription is a claim about source, not an instruction; an equivalent correct fix stays permitted, an unverified transcription does not.
- **Agent memory is single-homed and in the review surface in both modes** (`artifact-layout.md` "Agent memory"): the property was stated four times inside self-hosting carve-outs and nowhere for consumers. It is now stated once and cited, and the diff-reachability half names who commits a reviewer's memory writes so they reach a reviewed diff at all — a reviewer holds no commit tool.
- **Line-ending guidance is platform-neutral and the pre-commit lint form is named** (`code-style.md` §19): a scripted edit anchors on the file's actual EOL, a whole-file diff for a small edit is the symptom, and the check is `git diff --cached --check` — the bare form exits 0 once the damage is staged, so a stage-then-lint-then-commit sequence passed blind.
- `coverageManifestDigest` digests the manifest exactly as written; `manifest-digest --write` stamps the vocabulary into the file before digesting it. An earlier shape injected the vocabulary at digest time, which moved the identity of every manifest stamped before the field existed.
- Test coverage grew from 160 to 171 checks, and three existing assertions were re-pinned after going red on correct edits — a copy count became a single-owner-plus-citations property, an ordinal became a citation, and a header quotation became the delegation rule it was really about.

## v7.0.0

Remediation of every problem the sprint 007 retrospective identified, plus the fixes that remediation itself turned out to need. Reviews gain a contract for what happens when a dispatch dies mid-flight; routing learns to tell a risky change from a routine edit to a risky file; the `--apply` command stops succeeding silently when it did nothing; and several always-loaded rule docs get shorter. **Breaking:** a bare `node .asd/sync.js --apply` with no target paths now fails instead of reporting success, and the reviewer read-only guarantee is restated in the narrower form that is actually true. Update through `/asd-update`; no migration script is needed, because nothing in consumer state changes shape.

### Added
- **Split and interrupted review dispatch** (`review-policy.md` "Interrupted dispatch and split dispatch"): a contract for a read-only dispatch that dies before returning. The reviewer is re-dispatched fresh in the same iteration — never resumed, so "no dispatched reviewer is ever reused or resumed" stands unchanged — and the interrupted attempt is appended to `decisions-log.md` at the moment it happens, not at the verdict parse an interrupted dispatch never reaches. A reviewer interrupted twice on the same manifest digest is split into two fresh dispatches over disjoint `files` partitions, each carrying a complete digest-bearing manifest and the full rubric, with a union property checked before the two half-verdicts merge into one. An internal reviewer is never recorded as skipped and never satisfies DoD without a completed verdict; `APPROVE (skipped: …)` stays exclusive to an unavailable external provider.
- **Typed material risk in routing.** A plan task's `Material risk:` line now distinguishes risk to the change from risk to the artifact, and `routeTask` reads the distinction: a risky edit still routes to the most expensive tier, while a verifiable edit to a high-stakes file no longer does so by that fact alone. Both input shapes are accepted — a bare string keeps the previous force-critical semantics — so a consumer mid-upgrade is never blocked. Five class names (security, authentication, migration, public contract, workflow gate) are reserved: typing one of them `artifact` is rejected, so a fail-open path cannot be opened by mislabelling.
- **A record of which agent frontmatter fields the host actually honours** (`providers.md`), replacing a code comment that admitted one emitted field was undocumented.
- Test coverage for the new contracts and for content that had none: routing in both input shapes and at its reason-precedence boundaries, the `--apply` empty-target guard, the coverage-manifest partition property, and mirror checks over statements that must agree across files. The suite grew from 136 to 160 checks.

### Changed
- **BREAKING:** `node .asd/sync.js --apply` with no target paths now returns `ok: false` and exits 1, before the apply loop and before the hash-ledger recompute. It previously reported success, wrote nothing, and still refreshed the ledger — so `--check` and the ledger tests stayed green over stale generated views. Any automation invoking `--apply` without arguments must now pass the generated view paths it intends to write.
- **BREAKING:** the reviewer read-only guarantee is corrected, not weakened. Reviewers write no review artifact, code or doc — that is what lets the phase workflow own the review file — while `memory: project` is a separate write channel they do use and the host serves. External Review is a named carve-out: it carries `Bash` because a command-runner is required to invoke the wrapped CLI at all, so its guarantee is enforced on the wrapped subprocess instead. Documentation that asserted an absolute host guarantee was asserting something untrue.
- The documented form of the `--apply` argument now names what the tool actually matches — generated provider-view paths, never `.asd/` canon. The previous wording named the canonical path, so following the documentation produced a silent no-op.
- The external-review negative cache is consulted before the scope manifest is assembled, so a known-unavailable provider costs neither manifest assembly nor a dispatch.
- The over-engineering and structure/cohesion checklists bind at authoring time, not only at review, and the dev role loads them.
- The main orchestrator commits its own bookkeeping at phase exit, and a dispatched agent never commits orchestrator-owned files it did not author — previously unstated, and resolved defensively by agents at every phase boundary.
- Agent memory has a stated home at the provider-view root and never inside a sprint tree, and a sprint folder holds only what the path map names. The self-hosting review surface was narrowed from a blanket `.claude/**` exclusion to the generated subtrees, so hand-authored agent memory is reviewed like any other source.

### Removed
- **BREAKING:** `state.json.derived_handoff`, added and retired within this release. It cached a phase's derived scope list, but the writer and reader computed different diff bases on every cycle re-entry, so the handoff it existed for could not occur. No consumer state carries the field and no migration is required.

## v6.0.0

Sprints now keep a record of their own process friction and act on it. A per-sprint friction log captures workflow problems as they happen — a tool that would not launch, an agent that stalled, a rule that could not be followed — and a new `retro` phase analyses that log before the sprint closes, producing remediation and systemic improvement proposals split into consumer-project and ASD-framework actions. **Breaking:** the phase chain gains an eleventh phase between `impl-review` and `pr`, and the unused `state.json.escalations` field is removed. Update through `/asd-update`; the bundled `6.0.0` migration strips the retired key from an active sprint's state.

### Added
- **Friction log** (`<sprint>/friction-log.md`, `t_friction-log.md`): a per-sprint, append-only record of workflow malfunctions — rules, phases, gates, agents, skills, templates or provider tools that misbehaved or could not be followed. Created lazily on the first entry, archived with the sprint. Its boundary against the adjacent owners is explicit: code defects stay in `test-plan.md`, verdicts in `reviews/`, manual actions in `manual-steps.md`, decisions in `decisions-log.md`; an entry cites those ids and never copies what they hold.
- **`retro` phase**, unconditional and never no-op, running between `impl-review` and `pr`. It reads the friction log and writes `<sprint>/retrospective.html` (`t_retrospective.html`), then posts a short chat summary and advances to `pr`. Output is sprint-scoped and never promoted to a persistent doc.
- Two retrospective output classes, both split consumer-project vs ASD-framework so every row names the side that acts: **remediation**, one root cause and recommendation per friction entry; and **systemic proposals**, derived from how the sprint actually ran rather than from the entries, so an entry-free log still yields a non-empty retrospective.
- Test coverage for content contracts, not only Node sources: the suite now asserts the phase chain across `session-start.js`, the rule docs and README, every workflow's routing tokens and friction-append reference, the skill/workflow file set, the retrospective template's section shape, and that every managed file carries a hash-ledger entry.

### Changed
- **BREAKING:** `impl-review` emits `NEXT: retro` instead of `NEXT: pr` on a green terminal suite, and `pr` requires a completed `retro` — `<sprint>/retrospective.html` is a blocking DoD input. Consumer automation keyed on the ten-phase chain or on `impl-review` handing off directly to `pr` must be updated.
- The friction log's writer is the main orchestrator running each phase workflow, appending from what it observes — including what a dispatched agent's return text, signal or failure reveals. No agent writes the log and none is asked to self-report.

### Removed
- **BREAKING:** `state.json.escalations` — declared but never read by anything, and empty in every sprint that ever ran. The friction log is the single channel for an abnormal workflow event. Run `/asd-update`; the bundled `6.0.0` migration removes the key from an active sprint's state file, warning first if it somehow holds entries.

## v5.0.0

Workflow cost routing and adaptive user decisions. **Breaking:** standalone `asd-pm` removed; the main orchestrator owns its responsibilities. Update through `/asd-update`; migration removes unchanged framework-owned PM views while retaining consumer customizations for reconciliation.

### Added
- Generated Dev/Tester task variants share canonical instructions and permissions: mechanical (Haiku/Luna), critical (Opus/Sol); tier standard has no variant and dispatches the base agent (Sonnet/Terra). Objective risk routing and bounded escalation preserve the main model.
- Compact machine-validated coverage and local external-review preflight with bounded negative caching. The external wrapper uses a cheaper model while its actual review defaults to strong models.
- `user_gates: adaptive|strict`; absent legacy policy remains strict. Adaptive decisions retain actor, revision and evidence. Explicit user approval always gates sprint finalization and archival.
- Audit `auto|always|off`, accepting legacy `enabled|disabled`, with a frozen effective decision per sprint.
- External Review receives a structured scope manifest (`external-review/t_review-scope.json`: changed-file list, excluded paths, base/head refs) and resolves content from the repository itself, instead of being handed a rendered diff. `exclude_paths[]` bounds what the reviewer judges, never what it may read.
- The external-review preflight's negative cache has a canonical location, `.asd/project/external-cache.json`, gitignored as machine-local retry state.

### Changed
- Architect owns the complete audit; BA participates only for material domain ambiguity. Tester reuse and phase-scoped rule reads reduce repeated context.
- PR publication and sprint closure are separate. Confirmed merge and all technical quality checks remain mandatory.
- `impl-review` refuses to start on a dirty worktree, and `impl-test` commits its own tests and `test-plan.md` before handing off. The two compose: the iteration diff is computed from commits, so uncommitted work would otherwise be invisible to every reviewer.

### Removed
- **BREAKING:** standalone `asd-pm` agent — canonical source and generated views (`.claude/agents/asd-pm.md`, `.codex/agents/asd-pm.toml`); the main orchestrator absorbs its responsibilities, no spawned agent replaces it. Run `/asd-update`; the bundled `5.0.0` migration removes a consumer's unmodified generated PM views while leaving any hand-edited copy in place for manual reconciliation.

## v4.0.1

Codex-primary compatibility release for ChatGPT-backed runtimes. Delegate configuration now fails early with actionable diagnostics, generated skills use each provider's native invocation syntax, and cross-provider review behavior stays observable.

### Fixed
- Codex `sol` delegates now resolve to the supported `gpt-5.6-sol` model ID; all Codex agent model, effort, and sandbox combinations are validated before generation.
- Codex-generated skills render `$asd-*` commands without rewriting paths, URLs, or longer identifiers; Claude-generated skills retain `/asd-*` commands.
- Session recovery finds archived pre-merge sprints without reviving completed or malformed archives.
- Design and implementation review routing, incremental External Review scope, and wrapped-CLI availability reporting now match the canonical cross-provider contracts.

## v4.0.0

Review-loop cost revision: fewer reviewer dispatches, fewer test runs, fewer re-asks — without removing a gate — plus a versioned migration mechanism so the consumer-side churn this causes has a supported upgrade path. **Breaking** for any consumer automation keyed on agent names, reviewer verdict tokens, review file names, or `state.json`'s reviewer-keyed shape. Run `/asd-update`; the bundled `4.0.0` migration performs the consumer-side cleanup.

### Added
- **APPROVE latch** for design-review and impl-review (`sprint-lifecycle.md` "APPROVE latch", `state.json.reviews.<phase>.latched`): a reviewer that returned `APPROVE` on iteration N is not re-dispatched on later iterations of the same phase; its inherited `APPROVE` is still written to `verdicts["iter-NN"]` every iteration (the invariant every consumer of the verdict map relies on — DoD aggregation, the pr gate and the session-start hook never read `latched` for satisfaction). Cleared sprint-wide by a red full suite or by the existing rollback reset. External Review's availability-skip verdict never latches.
- **Two-tier test running** (`sprint-lifecycle.md` "Impacted test set"): every run in `impl`, `impl-test` and `impl-review` is scoped to the impacted set — diff test files, tests of changed units by reference search, AC-tagged tests, or the runner's native affected selector when `commands.yaml` names one — with a mandatory shared-infrastructure valve that degrades to the full suite. The full suite runs once per cycle, as impl-review's terminal step after every reviewer approved, dispatched to `asd-tester` and recorded in `test-plan.md` `Suite run`.
- **`commands.yaml` affected-test selector field** (`t_commands.yaml`), detected by `/asd-init` where the runner exposes one; absent → search-derived fallback.
- **Test-authoring bar** in `asd-tester` and `asd-phase-impl-test.md`: a test is written only for a real, material risk on the change surface; "no new test needed" is a recorded outcome. `code-style.md` §17's hypothetical-risk criterion governs both authoring and pruning.
- **Change-surface rule** in `review-policy.md`: a finding about unchanged code is invalid unless the change made it incorrect.
- **`core.md` "Context hygiene"** — seven rules making disk, not the transcript, a sprint's memory: clear at phase boundaries, compact only within a phase with a mandated summary shape, never mid-gate, dispatch by path not excerpt, fresh reviewer context per iteration, ~70% threshold. Replaces the old `## Compaction` 50% rule.
- **Versioned migrations** — `.asd/migrations/<version>.js`, one idempotent zero-dependency script per target version; `/asd-update` runs the pending ones ascending after the managed-path replacement, loaded from the freshly written tree, stops at the first failure and records `asd_version` only as far as the last success. Migration runner and ordering covered by `tests/run.js`.
- **`4.0.0` migration** — deletes the marker-carrying generated views of the nine retired agents (`.claude/agents/`, `.codex/agents/`, `.agents/skills/`), adds the selector field to `commands.yaml` when absent, warns when an active sprint sits in a review phase. Never touches `config.yaml` values, sprints, persistent docs, or custom rules/skills/agents/hooks.
- **`sync.js` orphan handling**: `--check` reports generated views with no canonical source and exits non-zero; `--apply` deletes them only when they carry the ASD ownership marker — an unmarked file is a consumer's own and is reported, never touched.

### Changed
- **Internal code reviewers 5 → 2.** `asd-reviewer-correctness` (bugs, security, best practice, contract drift, AC coverage trace, UI conformance / tokens / accessibility) and `asd-reviewer-efficiency` (over-engineering, structure/cohesion, design principles, performance budgets, complexity, anti-patterns, regressions) carry every predecessor rubric item as a named section with a section-coverage ledger. Verdict tokens `[REVIEW-<phase>-correctness|efficiency]`; review files `correctness.md` / `efficiency.md`; same keys in `state.json`. `review.scoped_fan_out`'s diff-derived predicates now skip a rubric *section* (`n/a: <predicate>` in the ledger), never the agent. impl-review internal roster = correctness + efficiency + documentation + testing; design-review = correctness (UI section, only with a ux-spec/design-system draft) + efficiency + documentation.
- **Dev agents merged** into `asd-dev` (server/CLI/library and UI, consuming `DESIGN.md` tokens where UI applies; production code only). `plan.md` tasks no longer carry a backend/frontend owner split.
- **Renamed** `asd-test-engineer` → `asd-tester`, `asd-ux-designer` → `asd-ux` (scope unchanged). Agent roster 16 → 12.
- **Model/effort tiers**: `asd-dev`, `asd-tester` → `high` effort (sonnet / terra); `asd-pm` and `asd-advisor` → `fable` / `high` and `sol` / `high`.
- **`code-style.md` §7**: no comments inside function bodies (the `// TODO(sprint-…)` marker is the sole exception); "WHY not WHAT" applies to doc comments only; type docs state purpose only, member docs state purpose never implementation. Enforced by `asd-reviewer-documentation` at severity `high`. The rule governs the framework's own Node code too — the former `AGENTS.md` exemption is gone.
- `impl-test`'s suite gate is impacted-only; `impl`'s gate stays build + lint (a dev may run the impacted subset, never authors or prunes tests); the pr gate's "tests pass" check is content-scoped against the recorded `Suite run` `HEAD` and re-runs on any diff — it no longer relies on impl-review being read-only. Pre-4.0.0 `"skipped: <predicate>"` verdict strings still count as satisfied at that gate.
- `sync.js --apply` fails closed: a target matching no plan entry is `not-found`, `ok: false`, exit 1, and the whole batch aborts (previously reported `applied: true`).

### Removed
- Agents `asd-reviewer-quality`, `asd-reviewer-implementation`, `asd-reviewer-ui`, `asd-reviewer-simplification`, `asd-reviewer-performance`, `asd-backend-dev`, `asd-frontend-dev`, and the old names `asd-test-engineer`, `asd-ux-designer` — canonical sources and generated views (the `4.0.0` migration removes a consumer's).
- `core.md` `## Compaction` (absorbed by "Context hygiene").
- Agent-level dispatch skips under `review.scoped_fan_out` (now section-level).

## v3.1.0

Doc-links-and-autonomy revision: gated artifacts are now written to disk first and reviewed in the real file via a path link instead of being dumped into chat, and non-gate agent uncertainty routes to a new read-only advisor agent instead of interrupting the user. No user approval was removed from any gate that decides a phase advance.

### Added
- **`asd-advisor` agent** (`.asd/agents/asd-advisor.md`) — a read-only consultation agent (no `Write`/`Edit`/`Bash`; `sandbox_mode: "read-only"`; `fable`/`sol` model families) that any agent may dispatch when it is uncertain about a non-gate decision. It gives advice only; it cannot write files and it never stands in for a user-facing HARD gate. Agent roster goes 15 → 16.
- **`ADVICE_NEEDED` signal** with a uniform relay branch in all ten `asd-phase-*` workflows: a dispatched agent emitting it gets an advisor consult and execution resumes — it never halts the phase and never becomes a user question. Consults are capped per workflow and the advisor cannot recurse into itself.
- **Write-then-review-accept gate class** defined once in `checkpoints.md`: the creator writes the artifact to its path, posts the absolute path plus a short delta summary in chat, the user reviews the actual file, and an explicit `accept` advances the phase while any other feedback revises the same file in place. Revision is always in place — no `-v2` files, no duplicate drafts — and each `accept` appends a decisions-log entry naming the artifact path.

### Changed
- **Gate table rewritten row by row** in `checkpoints.md` and `asd-pm`'s mirror of it, splitting every gate into two explicit classes (approve-before-write vs write-then-review-accept). Moved to write-then-review-accept: `sprint.md` (scope), `plan.md` (plan), and the design phase's per-artifact rows for `prd.html` / design-system / `ux-spec.html` / `adr.html`, plus `concept.html`, `stack.html`, `DESIGN.md`, `design-system.html`, `accessibility.html` in the standalone setup skills. Unchanged as approve-before-write: `audit` merge approval, `impl` assessment, `impl-test` removal approval, `impl-review` final verdict, `pr` opening confirmation — these gate a decision or phase advance, not an artifact draft.
- **Chat no longer carries artifact bodies.** For every write-then-review-accept gate the chat message is a path link, a brief delta summary, and any open questions. Approval stays explicit and stays recorded in the decisions-log.
- `asd-concept`, `asd-stack`, `asd-design-system` section loops are write-first: each section is written to disk before its lock-in question, and their skeleton writes are now guarded on the target file's own on-disk existence so an edit-mode dispatch can no longer overwrite real content with a placeholder. A revision loop re-runs the affected regeneration/lint passes before re-accepting, so derived artifacts are never accepted stale.
- `language-policy.md` reconciles the accept vocabulary and the chat/docs language split for review messages: the artifact stays in `language.docs`, the link-and-summary message in `language.chat`.

### Removed
- **design-promote's final-mutation gate and its step-8 per-persistent-write gate**, both redundant re-confirmations of draft content the user already accepted at draft time. design-promote's **decomposition** and **new-subsystem** gates are explicitly retained as approve-before-write — they are structural decisions about persistent-doc/C4-registry layout that draft acceptance never showed the user. The phase now writes its own decisions-log entries and `state.json`, then posts a non-blocking post-promotion summary.
- The design phase's `c4-full/` artifact gate — `c4-full/` now carries no approval gate of any kind.

## v3.0.0

Lean-workflow revision: a full audit of the framework's artifacts, phases, and agents, implemented as compressions and conditional dispatch. Sprints produce materially less text per artifact and dispatch fewer agents on unrelated changes; no `checkpoints.md` user approval gate was removed.

### Added
- `state.json` `reviews.impl.iteration_heads["iter-NN"]` field, recording the `git rev-parse HEAD` sha at the start of each impl-review iteration so iteration 2+ diffs scope to commits since the previous iteration, not just the last commit. A sprint already in flight when this field shipped has no entry for earlier iterations — the iteration-2+ diff computation falls back to the iteration-1 base-branch diff instead of resolving an absent key to an empty diff, noting the widened scope in that iteration's decisions-log entry.
- Optional `review.scoped_fan_out` config key (`enabled`/`disabled`, default absent = `disabled` = full fan-out): when `enabled`, the UI and Performance impl-review reviewers are skipped for iterations whose diff contains no UI surface / no executable file and no perf-budgets section, cutting review dispatch cost on unrelated changes. Absent from an existing consumer's `.asd/project/config.yaml` (this repo's own included) — `/asd-update` never touches consumer-owned config, so add `review: { scoped_fan_out: enabled }` manually to opt in; the seeding template for newly-initialized projects already includes it.
- Standing Definition of Done for every sprint declared once in `sprint-lifecycle.md` "Plan file format" (AC coverage, green suite at `impl-test`, reviewers green at `impl-review`). `plan.md`'s own DoD section now carries only sprint-specific additions.
- Explicit rule that an absent optional section in `audit.md` means an empty finding set, not an unperformed check — replacing the mandated placeholder rows that previously carried that distinction.
- `state.json` accepts a `"skipped: <predicate>"` verdict value for a reviewer not dispatched under `review.scoped_fan_out`, distinct from an absent key (dispatch lost) and from `null`. The `pr` DoD check and the SessionStart hook both treat it as satisfied, never as missing.
- `asd-init` seeds a C4 "build to view" command into the generated `commands.yaml`, plus `.gitignore` entries for C4 build output.
- `t_adr.html` gained an optional per-decision "Fold target" line naming the persistent doc that absorbs the decision and the `owns:` clause justifying it.

### Changed
- **BREAKING:** ADRs are now **sprint-scoped only** (`<sprint>/design/adr.html`) with sprint-local numbering (`ADR-1`, `ADR-2`, …). The persistent `docs/architecture/adr/` tree is gone and ADRs are never promoted as a standalone document type; the `superseded`/`deprecated` statuses were dropped as unreachable. At `design-promote`, each approved decision folds into whichever existing persistent doc already declares ownership of its subject in `responsibility.owns` — never via a lookup table. When nothing owns it, that is a Complication Approval, not a licence to invent a document. Migration: existing `docs/architecture/adr/` files are consumer-owned and untouched by `/asd-update`; keep them as historical records or fold their content into the owning subsystem docs at your convenience.
- **BREAKING:** the decisions log is now per-sprint (`<sprint>/decisions-log.md`), created at `scope` and archived with the sprint, instead of a single project-wide `.asd/project/decisions-log.md`. A durability rule requires any decision whose value must outlive the sprint to also be written into an existing persistent home (`docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`) — never a new document type. This repo's own prior history in `.asd/project/decisions-log.md` is untouched and frozen (closed with one final entry), not deleted — it was never in `managed_paths`, so existing consumers are unaffected until they adopt this convention via a future full-profile sprint.
- Review files persist a coverage **summary line** plus the verbatim `n/a` list and every non-passing row, instead of full per-file ledger tables. The gate itself is unchanged: reviewers still return a complete ledger and it is still validated on the returned text before the file is written — only what gets archived shrank.
- When every `documents.*` flag is disabled, `design` / `design-review` / `design-promote` collapse into **one** deterministic no-op check at design entry: a single `state.json` write sets `phase = "design-promote"`, records all three names in `skipped_phases`, and emits one decisions-log line. Phase count stays at ten and `PHASE_CHAIN` is unchanged, so a resumed session mechanically advances to `plan`.
- Audit phase dispatches BA and Architect **in parallel**; both now return their sections as text and the workflow assembles `audit.md` (matching the existing reviewer pattern). `audit.md` was removed from both agents' write allowlists.
- Phase workflows write `state.json` inline for mechanical, non-gate field updates instead of dispatching `asd-pm`. PM is still dispatched wherever a user gate is involved (audit approval, plan approval, impl assessment, PR confirmation, design-promote confirmations) and its write allowlist is unchanged.
- `impl-test` re-entry is incremental: the strategy and prune passes scope to the delta since the previous entry and `test-plan.md` is amended rather than rewritten. The suite gate stays a full, unconditional run.
- The `pr` DoD re-runs tests and lint only when content outside `.asd/sprints/**` and `.asd/project/**` actually changed since the `Suite run` recorded in `test-plan.md`, and reads review verdicts from `state.json` with a review-file parse as explicit fallback.
- `design-system.html` regenerates **once per sprint** at `design-promote`, and only when `DESIGN.md` was actually touched, instead of on every token change. The `checkpoints.md` design-gate file triple is unchanged — the same three files are still required.
- The PRD compression applies to the **sprint draft only** (User stories + Acceptance criteria, optional one-line Problem); Goals and Non-goals remain required for the persistent requirements document. The Documentation reviewer's rubric distinguishes the two so a correctly-reduced draft is not failed.
- C4 sprint drafts are **delta patches** against the persistent registry (full-schema authoring only when no registry exists yet), and C4 build output is no longer committed.
- The shared HTML shell emits the mermaid CDN script only for documents containing a diagram and the auto-TOC only above a section-count threshold. Artifacts remain self-contained single files — no shared stylesheet was introduced.
- The AC→code trace now has exactly one owner (the Implementation reviewer). Manual-steps handling, the tech-reference precondition, and stub handling were deduplicated to their rule-doc SSoT with pointers from the consuming agents.
- Template compressions to `audit.md`, `plan.md`, `test-plan.md`, `prd.html`, `ux-spec.html`, and `accessibility.html` reshape those artifacts for every consumer on `/asd-update`. There is no per-project opt-out dial: content already authored is untouched, but newly generated artifacts follow the reduced structure.

### Removed
- **BREAKING:** the `t_api.html` template is deleted outright. API contracts fold through the same open-set rule as ADRs — into a subsystem doc, `stack.html`, a project-generated OpenAPI/SDL/proto artifact, or, only when nothing owns them, a new document via ordinary Complication Approval with no pre-made template. Migration: existing `api.html` files are consumer-owned and are not deleted or rewritten by `/asd-update`; fold their content into the owning doc when you next touch that surface.
- Dead `state.json` fields `subsystems_touched` and `new_subsystems` (declared and written, read by nothing). Archived sprints keep them; the resume path assumes neither their presence nor their absence.
- `test-plan.md`'s "Change surface" section (recomputable via `git diff --stat`, and the workflow computes it anyway); "Added tests" reduced to the Regression-proof column.
- The Manual-verification section from `t_review.md` — `test-plan.md` is now its single home.
- `ux-spec.html`'s "New components" section (duplicated by `design-md-delta.yaml`, which is what `design-promote` actually applies); "Component usage" is now optional and off by default.
- `accessibility.html`'s per-domain scope paragraphs; the i18n section is now opt-in.
- The terminal decisions-log append in `pr` merge mode — it wrote into an already-archived folder, and `state.json` plus the merged PR already record the fact.
- The decisions-log dispatch from `asd-concept`, `asd-stack`, `asd-design-system` (the authored document is the record) and from `asd-init` (config changes get no durable trail).

### Deprecated
- Project-wide `.asd/project/decisions-log.md`. Frozen with one closing entry, never deleted; new decisions go to `<sprint>/decisions-log.md`.

## v2.0.0

### Changed
- **BREAKING:** the project-wide persistent documentation root moves from `design/` to `docs/` across every canonical ASD source and generated provider view. Migrate an existing consumer as follows:
  1. Move the old root:
     - No existing `docs/` directory: `git mv design docs`.
     - Already have a `docs/` directory (e.g. your own project docs): do NOT run `git mv design docs` (it would nest `design/` inside your existing `docs/`, producing `docs/design/...` and silently splitting the corpus) — instead move the three subtrees individually: `git mv design/product design/architecture design/ux docs/` (only correct if `docs/product`, `docs/architecture`, `docs/ux` don't already exist in your `docs/`; if any of them do, resolve the collision manually file by file before continuing).
  2. Fix the `designmd-lint` / `designmd-export` aliases in your own `.asd/project/commands.yaml` (these are consumer-owned and are never touched by `/asd-update`).
  3. Run `/asd-update`.
  4. Run `/asd-sync` immediately after.

  Between `/asd-update` and `/asd-sync` there is a split-brain window where `.asd/rules` already say `docs/` but your generated `.claude/`, `.codex/`, and `.agents/skills/` views still say `design/` — do not skip or delay the `/asd-sync` step. Nothing auto-migrates and nothing errors: a skipped step produces a silently split documentation corpus (e.g. `DESIGN.md` linted at the old path while agents author/review the new one), not a crash.

## v1.2.0

### Added
- SemVer + `CHANGELOG.md` discipline for self-hosting sprints: `pr` phase bumps `asd_version` and adds a changelog section before PR open, tags and publishes a GitHub Release on merge (`git-strategy.md` "Versioning & Changelog").
- Mandatory `git fetch` + fast-forward check against `origin/<base_branch>` before creating a sprint branch, and an explicit rule against committing or pushing directly to `git.base_branch`.
- PR title now required to follow Conventional Commits (becomes the squash-merge commit subject); PR body template gained Verification, Version, and Related issues sections.

### Changed
- Branch protection enabled on `main` (no force-push, no deletion, required `sync-check` status); squash-merge is now the only allowed merge strategy with auto-delete of merged branches.

## v1.1.0

Baseline — pre-dates this changelog; see git history and `.asd/project/decisions-log.md` for prior changes (self-hosting bootstrap, multi-provider support, impl-test phase).
