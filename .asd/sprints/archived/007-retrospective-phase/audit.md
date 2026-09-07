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

**Phase-chain enumerations** — every site that orders or counts the chain; `retro` inserts between `impl-review` and `pr`:

- `.asd/hooks/session-start.js:24-36` — `PHASE_CHAIN` array, the only executable chain. Consumed at `:70`, `:95-97` (`PHASE_CHAIN[idx+1]`). Generated mirrors `.claude/hooks/session-start.js` and `.codex/hooks/session-start.js` embed it too (regenerate via `sync.js --apply`, never hand-edit).
- `.asd/rules/sprint-lifecycle.md:14-15` (ASCII chain + loop-back arrow), `:90-102` (phase table; `impl-review` row `:101` ends with `pr`), `:141-146` (no-op table + "never no-op" list), `:24` (`NEXT:`-token routing statement).
- `.asd/rules/core.md:15` — glossary, both the count word "Ten" and the phase list.
- `.asd/rules/checkpoints.md:46` (precondition chain string), `:49` (per-phase precondition sentence; `pr`'s predecessor must be restated).
- `.asd/skills/asd-sprint/SKILL.md:47` — Step 3 chain advancement; `NEXT: pr` becomes `NEXT: retro`, plus a retro-to-pr sentence.
- `.asd/workflows/asd-phase-impl-review.md:59` (`emit NEXT: pr`), `:98` (return contract), `:100` (branch prose).
- `.asd/workflows/asd-phase-pr.md:7` — open-mode DoD input list.
- `README.md:13, 124, 130`, `:131-150` mermaid flowchart (edge `:144`), `:154`, `:156-168` phase table (rows `:166`, `:167`), `:306-307`, `:322`, `:330`.
- `AGENTS.md:70, 92, 107` — repo-specific section (below the asd:end marker, hand-edited, not synced): "ten phases", "Skills — 17" / "The 10 `asd-phase-*` skills", and the cross-file consistency contract itself.
- `CHANGELOG.md:70` — historical release note asserting the `ADVICE_NEEDED` relay branch exists in "all ten" workflows. Do NOT rewrite history; the new workflow must carry that relay branch.

**New-artifact surface**: `.asd/rules/artifact-layout.md:20-42` (sprint-tree ASCII), `:107-117` (HTML shell wrapping, artifact enumeration, placeholder table), `.asd/templates/t_html-shell.html` (`delegates_to:` fragment list), `README.md:298-330` folder map. Two new templates under `.asd/templates/`.

**Confirmed NOT chain sites** (checked, no ordering edit needed): `.asd/runtime.js`, `.asd/templates/t_state.json`, `.claude/settings.json`, `.asd/rules/providers.md`, `.asd/rules/review-policy.md`.

## Existing docs found

- [artifact-layout.md](../../rules/artifact-layout.md) — authoritative sprint path map. Sprint root: `sprint.md`, `state.json`, `decisions-log.md`, `audit.md`, `plan.md`, `test-plan.md`, `manual-steps.md`, plus `design/` and `reviews/`. All sprint HTML currently lives under `design/`; a sprint-root HTML artifact would be the first.
- SSoT iron rule: "Each fact has exactly one home file. Other files link to it, never copy. Violation = `FAIL` from Documentation reviewer."
- Document representation rule: user-facing artifacts are HTML only, no parallel Markdown; exceptions are exactly `DESIGN.md`, `commands.yaml`, `.c4`. Markdown sprint artifacts (`plan.md`, `test-plan.md`, `manual-steps.md`) are workflow/machine artifacts, not "user-facing".
- Document responsibility rule: every template in `.asd/templates/` MUST declare `owns`/`excludes`/`delegates_to` frontmatter; for HTML fragments the block is an HTML comment, and `owns:` fills `{{RESPONSIBILITY}}`.
- [t_decisions-log.md](../../templates/t_decisions-log.md) durability rule: anything that must outlive the sprint is ALSO written into an existing persistent home (`docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`) — "Never invent a new document type for this."
- [providers.md](../../rules/providers.md):39, :41 — the write-a-file operation is blocked entirely for reviewer agents (`sandbox_mode: "read-only"`); "The reviewer returns its report as final text; the main orchestrator (workflow) writes the review file. This is a host guarantee."
- [git-strategy.md](../../rules/git-strategy.md):71 — "Under `backward_compat: migration`, this bump is also the blocking DoD check that `max(.asd/migrations/*.js filename version) <= asd_version`."

## Existing implementation found

**Skill/workflow pair shape** (`asd-phase-impl-review` read end to end). SKILL.md is 9 lines: JSON frontmatter `name` (equals dir name), `description` (dense trigger paragraph closing with the literal "Use when asd-sprint dispatches PHASE, or when the user explicitly asks to run or re-run PHASE for the active sprint."), `claude: {"allowed-tools": ...}`, `codex: {}`; body is one sentence delegating to `.asd/workflows/asd-phase-NAME.md`. Workflow body sections: `# ASD Workflow: TITLE`, operation-mapping pointer, `## Preconditions`, `## Operations used` (semantic verbs), `## Workflow` (numbered), `## Artefacts produced`, `## Agents delegated to`, `## Skills/workflows dispatched`, `## Return contract (single line)` plus per-branch prose, `## References`. Workflows are referenced by path, never generated into provider views.

**Sync mechanics for a new skill** — discovery is source-driven and automatic. `sync.js:1224-1231` walks `.asd/skills/*/SKILL.md` and emits two full-file targets (`.claude/skills/NAME/SKILL.md`, `.agents/skills/NAME/SKILL.md`). `managed_paths` already lists `.asd/skills`, `.asd/templates`, `.asd/workflows` as whole trees — **no `managed_paths` edit needed**. `canon_hashes` is auto-recomputed on every `--apply` (`sync.js:914-931`, `:1006-1019`) — never hand-edit; `--check` does not recompute it, so a hand-written entry stays silently wrong. `.asd/sync-state.json` needs nothing (full-file targets carry their digest inline in the marker line). Templates need an `upstream_hashes` entry but no `canon_hashes` entry (not render sources).

**HTML shell mechanism** — no include, no build step. The creator copies `t_html-shell.html` verbatim and substitutes placeholders at write time, inlining the fragment into `{{CONTENT}}`; output is a self-contained single file. Fragments must NOT contain html/head/body/style/script chrome — reviewers FAIL fragments duplicating it. Placeholders: `{{DOC_TYPE}} {{SUBSYSTEM}} {{SPRINT_ID}} {{STATUS}} {{UPDATED_AT}} {{RESPONSIBILITY}} {{PROVENANCE}} {{SOURCE}} {{SOURCE_SUFFIX}} {{TITLE}} {{STATS}} {{TOC_NAV}} {{MERMAID_SCRIPT}} {{CONTENT}} {{GENERATED_BY}} {{GENERATED_AT}}`. Conditionals are creator-computed, not runtime: `{{TOC_NAV}}` filled only at 3 or more `h2` sections (empty string below; layout derived via `.layout:has(> nav.toc)`); `{{MERMAID_SCRIPT}}` filled only when content carries a `.mermaid` block; provenance badge omitted when provenance is `original`.

**Migration contract** (`.asd/skills/asd-update/update.js:282-300`, runner `:378-401`). File `.asd/migrations/VERSION.js`, filename minus `.js` IS the target `asd_version`. `module.exports = (ctx) => report`, `ctx.repoRoot` is the consumer root; return shape never inspected by the runner. Zero-dependency Node, `'use strict'`, helpers via the consumer's own `.asd/sync.js`; throwing stops the runner. "Already applied" is tracked ONLY by the version gate (`asd_version` in the manifest) — idempotence is the script's own responsibility. Migrations run after managed-path replacement. Current `asd_version` is `5.0.0`. Precedent `.asd/migrations/4.0.0.js:23-26` explicitly declares `.asd/sprints/**` out of migration scope (warn, never rewrite).

**Adjacent SSoT owners** (quoted `owns`): `t_test-plan.md` — "code defects found by tests" (`D-N` rows, handoff channel to impl test-fix mode); `t_review.md` — "single reviewer verdict … for one iteration"; `.asd/project/stubs.md` — "project-global registry of CURRENTLY OPEN todo stubs", the only registry surviving archival; `t_manual-steps.md` — "per-sprint registry of manual operational actions a human MUST perform", appended directly by dev agents; `t_decisions-log.md` — "approved decisions for THIS sprint".

**`state.json.escalations` is dead.** Repo-wide grep yields exactly two non-sprint hits: the declaration in `t_state.json:20` and one writer instruction in `.asd/workflows/asd-phase-impl.md:87`. Zero readers anywhere (runtime, hooks, sync, tests, rules, README). Every sprint state file 001-007 carries `"escalations": []` — including 006, which exercised the manual-steps path. Never written once in practice.

**Write capability**: write-capable — `asd-ba`, `asd-ux`, `asd-architect`, `asd-dev`, `asd-tester`. Read-only (6 of 11) — the four `asd-reviewer-*`, `asd-advisor`, `asd-external-review`. Precedent for "agent returns text, workflow writes": `asd-phase-audit.md:4-5` (a write-capable creator still returns text; orchestrator merges), plus the whole reviewer path (`review-policy.md:130`). Counter-precedent: `manual-steps.md` is appended directly by dev agents.

## Gaps

- **G-1. Greenfield.** Repo-wide grep for `friction`/`retro` returns zero framework hits. No template, no path-map row, no `DOC_TYPE` value, no config flag, no state field.
- **G-2. Retro conditionality is undecided and blocks two designs.** If retro is optional it needs `documents.retro` in `t_config.yaml`, in `t_state.json`'s `documents` map, and in the config-to-state boolean rule (`sprint-lifecycle.md:118-120`); if unconditional it joins the "never no-op" list at `:146`. The migration design and the no-op table both depend on this choice.
- **G-3. Closed enums block conformance.** `{{DOC_TYPE}}` is a closed list (`PRD, ADR, UX-spec, Concept, Stack, Accessibility, Design-system, Architecture`) with no retrospective value; `{{STATUS}}` is the lifecycle enum `draft/in-review/approved/locked`, which has no natural value for a terminal report. `artifact-layout.md`'s artifact enumeration and `t_html-shell.html`'s `delegates_to:` fragment list both omit it.
- **G-4. Markdown classification unstated.** The friction log must be explicitly classified a workflow/machine artifact (class of `plan.md`/`test-plan.md`/`manual-steps.md`), and `retrospective.html` explicitly declared derived analysis — not a parallel HTML rendering of the log — or the representation/SSoT checks fire.
- **G-5. No stated boundary against four adjacent owners.** Needed in the template's `excludes` and once in the rules: code defects reproducible by a test go to `test-plan.md` `D-N` (the log references the id, never restates symptom/fix — acute in this self-hosting repo, where a `sync.js` bug is simultaneously a code defect and a workflow malfunction); artifact-quality judgements go to `reviews/` (the log owns "the review process misbehaved", never the verdict); human operational actions go to `manual-steps.md` `MS-N`; resulting decisions go to `decisions-log.md`.
- **G-6. No persistent home for cross-sprint friction.** The log is sprint-scoped and archived; the durability rule forbids inventing a new document type. Recurring friction and the retro's ASD-side recommendations must land in `CHANGELOG.md`, a `docs/` fold target, or `.asd/project/stubs.md` — or the sprint takes an explicit Complication Approval for a new persistent home. Unresolved, sprint 008 starts with no memory of 007's friction.
- **G-7. `escalations` must be resolved, not left parallel.** Two channels for "an abnormal workflow event occurred" is a direct SSoT violation. Either retire it (delete from `t_state.json`, rewrite `asd-phase-impl.md:87` to append a friction entry, refresh `upstream_hashes`, cover the stale key in the AC-9 migration) or narrow it explicitly to machine halt-bookkeeping with a one-line rule naming the friction log as the human-readable channel.
- **G-8. Writer mechanism is mechanically forced and must be stated once.** AC-2 says "any phase may append", but `design-review`/`impl-review` — the phases most likely to surface friction — dispatch only read-only agents (sole exception: impl-review step 9's one `asd-tester` dispatch). Reviewers cannot append, by host guarantee. The only uniformly working mechanism: agents return friction observations in final text, the dispatching phase workflow appends. The repo currently has both patterns, so the sprint must pick one and state it once.
- **G-9. Migration has no precedent to copy.** Concretely, for a consumer whose in-flight `state.json` predates `retro`: read the active sprint's `phase`; `pr`/`done` means do nothing (past the insertion point); earlier means the sprint reaches `retro` through the new chain with no friction accumulated, so either append `"retro"` to `skipped_phases` plus one decisions-log line, or rely on the retro workflow's own absent-log no-op branch — **which does not exist yet and must be specified**. If the `documents.retro` flag route is chosen, the per-field fail-closed rule (`sprint-lifecycle.md:116`) already makes an untouched in-flight sprint read retro as disabled, which may make sprint-state mutation unnecessary and preserves `4.0.0.js`'s "sprints out of scope" precedent.
- **G-10. `AGENTS.md:107`'s own consistency contract is incomplete.** It names four chain sites; the sweep found four more it omits (`checkpoints.md:46`/`:49`, `asd-sprint/SKILL.md:47`, `asd-phase-impl-review.md:59/:98/:100`). Correct it in the same change or the next chain edit misses them again.
- **G-11. No test coverage for the chain.** `tests/run.js` covers only `sync.js`/`update.js`/`.asd/migrations/**`. Nothing asserts `PHASE_CHAIN` contents or cross-file chain consistency; roughly twenty mirror sites are hand-verified only.
- **G-12. Template-registration hole.** Both new templates need explicit `upstream_hashes` entries. `tests/run.js:1929` only checks the forward direction (every ledger entry matches a file); no test asserts every managed file HAS an entry, so an omission is invisible.
- **G-13. `asd-phase-pr.md` DoD list does not mention retro.** Whether a missing retrospective artifact blocks `pr` is unspecified.

## Risks

- Chain-mirror miss causing silent wrong routing: impact=`retro` skipped with no error, since `NEXT:` is authoritative for routing while `PHASE_CHAIN` only drives display; mitigation=update `asd-phase-impl-review.md`, `asd-sprint/SKILL.md` and `session-start.js` in one commit, and extend `AGENTS.md:107`'s site list (G-10).
- Generated-hook drift: impact=`.claude/` and `.codex/` `session-start.js` keep the stale chain; mitigation=`node .asd/sync.js --apply .asd/hooks/session-start.js` in the same change, `--check` clean before impl-review (whose clean-worktree precondition surfaces uncommitted regenerated views).
- Version-bump/migration mismatch: impact=blocking `pr` DoD failure per `git-strategy.md:71`; mitigation=decide the SemVer level at plan time (a breaking `NEXT:` contract change argues MAJOR) and name the migration file to match.
- `escalations` plus friction log as parallel channels: impact=SSoT violation causing a Documentation `FAIL` at impl-review, plus a permanently confusing state schema; mitigation=decide retire-vs-narrow this sprint (G-7), bundle all four edits together.
- Friction log becomes a second defect tracker: impact=duplicated `D-N` content, drifted status, `test-plan.md` loses its declared SSoT; mitigation=boundary in the template `excludes` plus one rule sentence, entries reference ids only (G-5).
- Retro output evaporates at archival: impact=the cross-sprint memory goal is not met; mitigation=bind durable recommendations to the decisions-log durability rule, or take Complication Approval for one new persistent home (G-6).
- "Reviewers append directly" is unimplementable: impact=an AC that cannot be satisfied on either provider, discovered at impl; mitigation=specify the returns-text/workflow-writes contract up front (G-8).
- Enum/list mirrors missed: impact=`t_retrospective.html` ships non-conformant, drawing an avoidable review `FAIL`; mitigation=treat the placeholder table, artifact enumeration, path map, shell `delegates_to:` and README folder map as one atomic edit set (G-3).
- Missing `upstream_hashes` entries: impact=consumers hit `conflict-foreign` on `/asd-update` and the ledger drifts silently; mitigation=add both entries in the same commit, optionally add the reverse-direction test (G-12).
