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
- `.asd/workflows/asd-phase-scope.md`: line 3 says "Owner: inline orchestrator; dispatches none". Step 2 says "ask the user only for ambiguity that prevents a concrete scope". Step 2a does retro intake: closed-without-asking, "the user decides all or some … undecided → `deferred`", per-row presentation. Step 4 is the scope gate and the backlog write. Affected by AC-1, AC-2, AC-3..AC-5.
- `.asd/skills/asd-phase-scope/SKILL.md`: thin trigger; its description may need to name the staged design (AC-3). `allowed-tools` already includes `Task`.
- `.asd/skills/asd-sprint/SKILL.md`: step 3 collects the raw scope before scope runs; stage (a) follows it. No functional change. Under the standalone-skills byte cap (R2).
- `.asd/rules/sprint-lifecycle.md`: "Orchestration and adaptive gates" line 5 ("delegates only artefact creation, testing, review or advice"), line 7 ("an already-satisfied row is closed"), line 9 ("BA is dispatched only for evidenced material product/domain ambiguity"); "Phases (all mandatory)" line 40 (impl-review fix-routing exception); Phase table scope row (line 125) and impl-review row (line 133); "Input sources" and "Independent design docs" (AC-5 reader key); "State recovery" "User-resolved findings" `resolved:` kinds (AC-10).
- `.asd/rules/artifact-layout.md`: path map sprint-folder list and "A sprint folder holds **only** the artifacts named above" (AC-5); "Agent memory" "Leftover-term check" (AC-10); "Test plan" "for a memory `D-N`, by the orchestrator" (AC-10); "Retro backlog".
- `.asd/rules/checkpoints.md`: "Gate policy"/"Gate inventory" rows for scope and retro intake dispositions; gate class of the stage (c) approach choice (AC-3).
- `.asd/rules/providers.md`: "Role-scoped context" orchestrator `scope` row (line 101) and `asd-ba` rows (lines 112-116) (AC-3/AC-5); "Task-class variants and routing" line 163 (AC-7).
- `.asd/rules/review-policy.md`: "Autofix vs escalation" "Memory-fix dispatch" (line 95) and "Where the fix happens" (lines 97-99); "Low-severity test-only findings" (lines 108-112); "Gate Verdict Format" "Findings table." (line 168) — AC-8, AC-10.
- `.asd/rules/code-style.md` §17 content-contract fail-first bullet (AC-9).
- `.asd/rules/agent-protocol.md`: no change; "Relay" already covers a creator dispatched from scope.
- `.asd/rules/git-strategy.md` "Commit before review" "Memory content check" (line 48): "A violating write … returns to its owner's memory-fix dispatch", no phase named (AC-10).
- `.asd/agents/asd-ba.md` (AC-3): description ("dispatched in audit, design, design-promote and asd-concept", 292/300 chars), Inputs/modes, Outputs, Rules, Tools `web` ("user-provided URLs and public standards/regulations a requirement cites"), Escalation "missing audit input → ABORT".
- `.asd/agents/asd-tester.md`: line 43 (leftover-term check), "Failure triage" line 78 (code defect → `D-N`) (AC-10). Description 299/300.
- `.asd/agents/asd-reviewer-combined.md`: no rule text restates the placeholder row; sources are its agent memory and line 44's "return per `t_review.md`" (AC-8).
- `.asd/templates/t_retro-backlog.md`: Disposition comment `deferred | included | rejected | closed` (AC-1).
- `.asd/templates/t_sprint.md`: owns scope/goal/AC, excludes design decisions — relevant only if AC-5 picks sprint.md.
- `.asd/templates/t_review.md` lines 24-25 and `.asd/templates/external-review/t_review-report.md` lines 24-25: "when no findings, leave one row: `| — | — | — | no findings | — |`" (AC-8).
- `.asd/workflows/asd-phase-impl.md` (AC-7, AC-10): Owner line 3 ("a memory finding's owner"); step 3 review-fix/test-fix memory routing; step 5 memory-fix ordering; step 5a restated route-task inputs; step 9 allowed memory paths; `<owner>` Dispatch row.
- `.asd/workflows/asd-phase-impl-test.md` (AC-10): Owner line 3, step 1 leftover-term check, step 9 triage (test or code defect only), Dispatch (tester only).
- `.asd/workflows/asd-phase-impl-review.md` (AC-10): line 17 "fixes no CODE finding itself … Two exceptions"; step 8 low-severity test-only branch then review-fix; step 9 terminal-suite red → code defect → `D-N`; Dispatch.
- `.asd/workflows/asd-phase-design-review.md` step 9: user-resolved findings satisfy DoD; a memory finding costs an extra iteration today (AC-10; `standard` only).
- `.asd/workflows/asd-phase-plan.md`, `asd-phase-design.md`: Inputs gain the research artifact (AC-5).
- `.asd/workflows/lite.json`, `standard.json`: no change; staged design stays inside `scope`.
- `.asd/runtime.js`: `routeTask` (lines 303-323) and `inputJson` (lines 1433-1436) (AC-7); `reviewFindings` JSDoc and `—` filter (lines 519-535) (AC-8); `retroCandidates` (lines 660-673) (AC-2, already holds); `contextRefs` (lines 1377-1387) (AC-3, no change needed).
- `tests/run.js`: `runAll` has no name filter (AC-9); lines 6287-6291 pin "resolved → `closed` without asking" and "undecided → `deferred`" (AC-1); lines 6962-6975 pin the templates' placeholder row, lines 6596-6608 use it as fixture (AC-8); line 8177 workflow/skill byte caps (R1, R2); line 7972 description cap; line 8031 `ADVICE_NEEDED` Dispatch row requires a relay branch; line 8148 grant-table sweep; D13 load test (`LOAD_BASELINES`).
- `README.md`: line 159 flowchart scope node "Orchestrator"; line 184 scope row; line 192 impl-review row; line 228 `asd-ba` roster; line 236 creator web grants; folder map lines 345-347 if a sprint artifact is added.
- `.asd/release-manifest.json`: agent/skill edits move `canon_hashes` via `sync.js --apply`; a new template is covered by `managed_paths` + `upstream_hashes`, no new `canon_hashes` entry.
- `.claude/agent-memory/**` leftover hits (AC-8, AC-10): `asd-reviewer-correctness/reference_persist-review-return-shape.md` lines 3, 11 and its `MEMORY.md` index line; `asd-reviewer-combined/feedback_rereview-no-shell-checks.md` line 24; `asd-tester-critical/project_testability-envelope.md` lines 114-122.

## Existing docs found
- `sprint-lifecycle.md` "Orchestration and adaptive gates": "It delegates only artefact creation, testing, review or advice"; "an already-satisfied row is closed, a partly delivered one narrowed to its remaining half"; "BA is dispatched only for evidenced material product/domain ambiguity its sources can resolve".
- `asd-phase-scope.md` step 2a: "a resolved one is written `closed` without asking. The rest go to the user inside the step 4 gate, a recommendation each; the user decides all or some: include → an `AC-N` in `sprint.md`, reject → never offered again, undecided → `deferred`." Consequences stated only of including and deferring; reject's are not, although `core.md` "User-decision presentation format" requires consequences per option.
- `artifact-layout.md` "Retro backlog": orchestrator-owned, lazy; semantics in scope step 2a.
- `t_retro-backlog.md`: "Disposition: deferred | included | rejected | closed".
- `checkpoints.md` "Gate inventory": "retro intake dispositions (scope gate; written on acceptance) | hard approve-before-write"; hard list covers "new or changed scope, acceptance criteria or user value not already explicitly authorized".
- `providers.md` "Task-class variants and routing": "calls `node .asd/runtime.js route-task --input <json>`"; names `priorTier`, `risks` and some `checks` values, never the full key set.
- `review-policy.md` "Gate Verdict Format": Findings table takes `t_review.md`'s column shape; silent on an empty table.
- `review-policy.md` "Autofix vs escalation": "Memory-fix dispatch … routes to `<owner>` … after the round's dev and tester chains"; "impl-review — fixes NOT applied inside the review phase, save 'Low-severity test-only findings'".
- `artifact-layout.md` "Agent memory": memory is hand-authored source, never excluded from review; leftover-term check runs at the first `impl-test` entry, `.claude/agent-memory/**` included.
- `artifact-layout.md` "Test plan": "for a memory `D-N`, by the orchestrator".
- `git-strategy.md` "Commit before review": "A violating write is unstaged and not committed; it returns to its owner's memory-fix dispatch".
- `code-style.md` §17: fail-first record names command, exit code, failing test name; content-contract proofs bounded per entry; nothing bounds the runner scope.
- `design-principles.md` §11: "Every design decision researches current best practices … document each option with detailed pros/cons, mark the recommended one, and return them as `QUESTION`" — the design-phase home for technical research; scope research must stay conceptual (AC-4).
- `core.md` "Request user decision": "never for free-form input, which is collected as a plain chat message" — interviews are chat messages; the stage (c) choice is a request user decision with Problem / Options / Recommended / Consequences.
- `asd-concept` SKILL: BA dispatched with `--phase concept` (in no grant row), "3 distinct concept directions" — precedent for a BA dispatch outside grant phases and for options. `docs/product/concept.html` is project-wide.
- `asd-ba.md`: Tools `web` scoped to user-provided URLs and cited standards; Escalation "missing audit input → ABORT"; Claude tools include `WebFetch`/`WebSearch`, Codex `web_search: "live"`.
- `providers.md` "Semantic operations": Codex subagent `web_search` not verified at runtime.
- `t_review.md`, `t_review-report.md`: placeholder no-findings row.
- `.asd/project/commands.yaml`: `tests/run.js` has no affected/changed-test flag (a name filter does not falsify it; `.asd/project/**` outside the write allowlist).
- `AGENTS.md` repo-local tail: optional mirror for AC-9's filter.
- `README.md` lines 159, 184, 192, 228, 236, 345-347.
- No `docs/` tree; `subsystem_decomposition: disabled`, `diagram_tool: none`; `.asd/project/stubs.md` has no open stub.

## Contradictions
- **C1: AC-1/AC-2 vs `closed`.** AC-1 "puts each non-upstream candidate row to the user … no row is disposed by default"; AC-2 "until it is included or rejected". Other side: `sprint-lifecycle.md` "Orchestration and adaptive gates" (canonical) "an already-satisfied row is closed"; `asd-phase-scope.md` step 2a "a resolved one is written `closed` without asking"; `tests/run.js` lines 6287-6288. Conflicting criterion, no canonical side → user (step 3b). **Answer (user)**: closed with evidence — a row verified resolved at HEAD leaves the three-way set and is shown at the scope gate with its evidence, no question; AC-2 reads "included, rejected or closed".
- **C2: AC-8 vs placeholder row.** `t_review.md`/`t_review-report.md` lines 24-25, `runtime.js` `reviewFindings` JSDoc ("A `—` id row is the empty table's placeholder"), `tests/run.js` lines 6962-6975 (sprint-021 F-5) — all non-canonical. `review-policy.md` gains the AC-8 sentence. Winner: `review-policy.md` after AC-8; other sites updated, no gate.
- **C3: AC-3 vs scope canon.** `sprint-lifecycle.md` line 5, line 9 (contextually audit, reads global); `asd-phase-scope.md` "dispatches none" and step 2. Winner: AC-3 (accepted at the hard scope gate; the sprint edits this canon). Listed so plan assigns every site.
- **C4: AC-10 vs memory-fix routing.** `review-policy.md` "Autofix vs escalation"; `artifact-layout.md` "Test plan" memory `D-N`; `asd-phase-impl.md` step 3; `git-strategy.md` "Memory content check". Winner: AC-10 (accepted scope); the sprint edits canon.
- **C5: AC-4 vs collapsed `standard` design block.** `sprint-lifecycle.md` "Design/design-review/design-promote collapse" (canonical): an all-`false` documents `standard` sprint never runs design. Winner: canonical collapse rule; AC-4 reads "technical detail goes to design when it runs, else to plan". No gate.

## Existing implementation found
- `runtime.js` `retroCandidates` (lines 660-673) re-offers each backlog `deferred` row, excludes `included`/`rejected`/`closed`, drops `covered by:` rows — AC-2 already holds, tested at `tests/run.js` lines 6221-6309 and 6311-6335. In consumer mode a deferred `asd` row drops by design (upstream).
- `BACKLOG_DISPOSITIONS` (line 84) = `['deferred','included','rejected','closed']`; AC-1 needs no new disposition or backlog format change.
- `routeTask` (lines 303-323) validates exactly AC-7's set: `kind` ∈ `command|mechanical|standard`; `objectiveInputs`, `failedObjectiveCheck` booleans; `checks` string array; `correctionAttempts` integer ≥ 0; `risks` array of names or `{name, target}`; optional `priorTier` ∈ `mechanical|standard|critical`. `--input` takes a file path or `-` (stdin), never inline JSON.
- `reviewFindings` (lines 519-535): header + separator with no rows already parses to `[]`; the `cells[0] !== '—'` filter is legacy tolerance.
- `contextRefs` (lines 1377-1387): a role with only `*` rows gets a bundle for any phase string — an `asd-ba` scope dispatch needs no new grant row unless scope gains a `## Rules` the BA must read.
- `tests/run.js` `runAll` runs every `test(name, fn)` with no argv handling (AC-9 gap).
- impl-review step 8 "Low-severity test-only findings" in-place branch plus `resolved: <ids> — test-fix` lines already fix a finding inside impl-review without another iteration; "User-resolved findings" treats a fully resolved CONCERNS/FAIL as satisfied; design-review step 9 honours the same lines. AC-10 can reuse this with a `memory-fix` kind.
- "Memory-fix dispatch" machinery exists (owner routing, fresh dispatch, orchestrator commit, `memory-check`, ownerless deletion); only where it runs changes.
- `.asd/project/retro-backlog.md` already records 027's dispositions.

## Gaps
- **AC-1**: scope step 2a — required per-row choice include/reject/defer, each option with its consequence (reject's included); step 4 — gate not accepted while a put row lacks a choice; invert `tests/run.js` pin lines 6289-6291; line 6288 `closed` pin and `t_retro-backlog.md` per C1; README scope row (line 184).
- **AC-2**: code already meets it; state it where the choice is presented, plus C1's `closed` outcome.
- **AC-3**: `asd-phase-scope.md` — Owner line names `asd-ba`; Entry ops `context --role asd-ba` and a timing dispatch op; step 2 rewritten into stage (a) chat interview → stage (b) `asd-ba` research → stage (c) hard request user decision on the approach, before `AC-N` are written; Re-entry skip list needs on-disk evidence per stage; `## Dispatch` row plus relay branch for `QUESTION`/`ADVICE_NEEDED` (test line 8031) and `FAILED`/`ABORT`; Exit writes. `asd-ba.md` — `scope` mode not requiring audit input or AC-N (Escalation "missing audit input → ABORT" must not fire); Outputs: findings and sources as return body; Rules: conceptual approaches only, sources cited, options with pros/cons and a recommendation; Tools `web` widened to best-practice research; description reworded within 300 chars. `sprint-lifecycle.md` — line 5 adds research, line 9 scoped to audit, Phase table scope row. Gate class of stage (c): hard; recommended fold under `[GATE hard: scope]`, no new inventory row. README lines 159, 184, 228, 236.
- **AC-4**: boundary sentence in one home (scope rule or BA scope-mode rule); design creators and plan read the research artifact before their own `design-principles.md` §11 research.
- **AC-5**: recommended new `<sprint>/research.md` from new `t_research.md` (responsibility frontmatter), written by the orchestrator from the BA return body plus the stage (c) answer, mirroring audit.md. Edits: `artifact-layout.md` path map plus a section classing it as workflow Markdown; `sprint-lifecycle.md` "Input sources" `research` key (readers: audit architect, design creators, plan); Inputs of `asd-phase-design.md`, `asd-phase-plan.md`, `asd-phase-audit.md`; README folder map; the choice logged as one decisions-log entry citing research.md. Alternatives: a `## Research` section in sprint.md (paid by every lite dispatch reading `requirements`; breaks `t_sprint.md` `excludes: design decisions`); decisions-log entries (wrong owner, rotated, not a design/plan input).
- **AC-6**: `sync.js --check` after agent/skill edits; `canon_hashes` move automatically; self-hosting `asd_version` bump plus CHANGELOG at pr; README rows per AC.
- **AC-7**: home `providers.md` "Task-class variants and routing" — seven keys, types, enums once; fix `--input <json>` to `--input <path|->`; replace `asd-phase-impl.md` step 5a's restated list with a citation.
- **AC-8**: home `review-policy.md` "Gate Verdict Format" "Findings table." — one sentence; update `t_review.md`, `t_review-report.md`, `reviewFindings` JSDoc; rewrite test lines 6962-6975 to assert header-only parses to `[]`; fixtures 6596-6608 drop the placeholder; parser legacy `—` tolerance kept or rejected (plan decision, R8); memory leftovers via owner memory-fixes (asd-reviewer-correctness `reference_persist-review-return-shape.md` lines 3, 11 plus index; asd-reviewer-combined `feedback_rereview-no-shell-checks.md` line 24). `t_stubs.md` line 19 comment row is not a findings table — out of scope.
- **AC-9**: `tests/run.js` argv name filter — fixed substring, not regex; zero matches exit non-zero; print the matched count. `code-style.md` §17: each mutation and control run executes only the asserting test through the filter. Optional mirror: AGENTS.md repo-local tail. Impacted-set subset runs out of scope.
- **AC-10**: home `review-policy.md` "Memory-fix dispatch" — runs inside the phase that found the memory finding or hit, never yields a test-fix `D-N` or review-fix route; `resolved: <ids> — memory-fix` kind in `sprint-lifecycle.md` "User-resolved findings". Acting sites: `asd-phase-impl-test.md` (leftover-term hits, step 9 memory triage class, in-entry owner dispatch before the suite gate, Owner line, Dispatch row); `asd-phase-impl-review.md` step 8 memory branch before the low-severity test-only predicate, step 9 memory-caused red fixed in place and re-run, line 17, Dispatch row; `asd-phase-design-review.md` (in-place with `resolved:` line); `git-strategy.md` "Memory content check"; `artifact-layout.md` "Leftover-term check" and "Test plan"; `sprint-lifecycle.md` "Phases" line 40 and impl-review row; `asd-tester.md` line 43 and "Failure triage"; README line 192. Removals in `asd-phase-impl.md`: Owner line 3 clause, step 3 clauses, step 5 ordering, step 9 memory-path allowances, `<owner>` Dispatch row — a removal, so this sprint's leftover-term check applies. Memory edits (`asd-tester-critical/project_testability-envelope.md` lines 114-122) are orchestrator plan lines (owner memory-fix dispatches) outside every Task.

## Risks
- **R1**: phase-workflow byte cap (`tests/run.js` line 8177, sprint-026 AC-15) 125,501 B vs 125,395 B measured — 106 B headroom; AC-3/AC-10 additions cannot fit as workflow prose. Raising the baseline is a hard user decision. Mitigation: normative text in rule-doc homes, short citing workflow steps, offset by AC-10 deletions in `asd-phase-impl.md`; plan measures before acceptance.
- **R2**: standalone-skills cap 61,051 B, 352 B headroom. Mitigation: avoid `asd-sprint` edits.
- **R3**: D13 load headroom — orchestrator/impl 10,116 B, asd-tester/impl-test 32,029 B, combined/impl-review 31,361 B, asd-dev/impl 48,428 B. Mitigation: terse additions.
- **R4**: description caps — `asd-ba` 292/300, `asd-tester` 299/300. Mitigation: reword; do not touch the tester description.
- **R5**: an in-place impl-review memory fix is never re-reviewed when the wave closes. Bounded (same precedent as the low-severity test-only branch). Mitigation: "Verify before applying" plus `memory-check` at commit.
- **R6**: mandatory stage (b) with web access missing (Codex subagent `web_search` unverified; offline session). Mitigation: BA returns `FAILED` naming the cause; user chooses retry or abort; any skip is a stated user decision.
- **R7**: staged design runs for every sprint, retro-only and mechanical included; what stage (b) researches for a retro-only sprint is undefined. Mitigation: plan states the retro-only case (research covers the sprint's own scope strand only).
- **R8**: AC-8 parser strictness vs `backward_compat: migration`. Mitigation: keep the parser tolerant; change rule and templates only.
- **R9**: a loose AC-9 filter gives false greens. Mitigation: zero matches exit non-zero; matched count printed and recorded with the proof.
- **R10**: this sprint's own leftover-term check (removes "undecided → `deferred`", the placeholder row, memory `D-N` routing; hits in three memory files and one index). Mitigation: plan schedules owner memory-fix dispatches as orchestrator lines after the canon edits.
- **R11**: research twice under `standard` with design running. Mitigation: design creators read research.md first and research only the technical delta (AC-4).
- **R12**: scope BA dispatch inherits the BA `*` bundle (PRD, HTML-shell sections unused). Mitigation: accept; a scope grant row adds bytes (R1).
