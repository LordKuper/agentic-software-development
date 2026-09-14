---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit: sprint 012-retro-010-011-subsystem-docs

## Scope reference
[sprint.md](./sprint.md)

## Touched areas

### AC-1 — `n_a` shape constant

- `.asd/runtime.js`:
  - 13-16: `LEDGER_VOCABULARY` and `LEDGER_ROW_EXAMPLE`; the new constant goes beside them.
  - 276-283: `manifest-digest --write` stamps both constants and must stamp the new one too.
  - 216-217: validator equality checks; a third optional check is needed.
  - 218-240: the `n_a` shape is enforced here but never published.
  - 309: exports.
- `review-policy.md` "Coverage ledger" 101-107: states the published fields.
- `tests/run.js`:
  - 2461-2487: the stamp test compares both constants by name. The digest sweep at 2479 is generic.
  - 3434-3474: the backward-tolerance `published` array.
  - 3476-3506: the policy-line key check.
  - 3508-3544: the `n_a` keying test.

### AC-2 — Manifest immutability

- `review-policy.md` 115: the only immutability statement is "Persistence … immutable manifest".
- `asd-phase-impl-review.md` steps 7 (43) and 7a (44-47).
- `asd-phase-design-review.md` steps 8 (35) and 8a (36-39).

### AC-3 — Split on scope size

- `review-policy.md`:
  - 154: "No size threshold — one interruption re-dispatches, two split" must be replaced.
  - 156: Partition always produces two halves.
  - 160: the split is never applied recursively.
  - 148: a correlated interruption never arms the trigger.
- Split-branch bindings: both review workflows, steps 7a and 8a.
- `asd-phase-plan.md` step 4 (22-43): has no sizing statement.
- Possibly `t_plan.md` Overview or Risks (22-45).
- Possibly `sprint-lifecycle.md` "Plan file format" 300-316, if sizing becomes a declared plan line.

### AC-4 — Interrupted-attempt record in the payload

- `review-policy.md` 146: the attempt record lives in decisions-log; resume rebuilds the count and cause from it.
- `review-policy.md` 30-36 "Clean-context review iteration": "Reviewer payload carries only: …" is an exhaustive list. It must admit the new item.
- `core.md` "Context hygiene" #6 (84-85).
- Payload bullets: `asd-phase-impl-review.md` 41 and `asd-phase-design-review.md` 33. Both say "Payload carries no … prior-iteration verdicts".

### AC-5 — Tool policy vs payload

- `providers.md` "Role-scoped context" 86-105.
- `core.md` "Autonomy and escalation" 42-47.
- `sprint-lifecycle.md` signal vocabulary 281-290: the contradiction report must use an existing signal (QUESTION or FAILED), not a new one.

### AC-6 — Memory-write check

- `artifact-layout.md` "Agent memory" 85-91.

### AC-7 — Memory writes are authored paths

- `git-strategy.md` "Commit before review" 39: "commits every path it authored" never names memory writes.
- The neighbouring clause assigns the orchestrator memory writes "whose author cannot commit them". `review-policy.md` "Change-surface rule" 42 cites it.

### AC-8 — Non-binding suggested fix

- `review-policy.md` "Autofix vs escalation" 72-87. The "Verify before applying" paragraph (76) already says "An equivalent correct fix stays permitted"; extend it rather than add a second statement.
- Payload restatements: `asd-phase-impl.md` 63 ("suggested fix", review-fix payload) and `asd-phase-design-review.md` 46-48 (creator autofix).
- Not changed: the "Suggested fix" column in `t_review.md` 21 and `external-review/t_review-report.md` 18. `asd-reviewer-correctness.md` 109 and `asd-reviewer-efficiency.md` 109 keep "Suggest concrete fix".

### AC-9 — Derive rather than enumerate

- Rule home: `code-style.md` §17 Tests (111-128) or §1 (5-11).
- Precedents in `tests/run.js`:
  - 3510/3518 derive `rowTypes` from `LEDGER_VOCABULARY`.
  - The citation sweep near 3370 is built on `canonMarkdownFiles`.

### AC-10 — Per-entry suite record

- `t_test-plan.md`: "Entry log" 19-26 (`HEAD analysed`) and "Suite run" 48-59.
- `sprint-lifecycle.md` "Impacted test set" 76-91.

### AC-11 — Dev-flagged choice

- `asd-phase-impl.md`: step 10 (101-108), and the COMPLETED summary contract in step 6 (80).
- `checkpoints.md` "Gate policy" 5: "no unresolved material alternative remains".
- `asd-dev.md` 92: COMPLETED has no field for a flagged choice.

### AC-12 — Manifest emitter

- `.asd/runtime.js`:
  - 273-303: CLI dispatch. The new subcommand goes here, and the usage string at 302 lists the commands.
  - 284-288: `validate-ledger` runs `JSON.parse` on the whole `--ledger` file, so it must learn to accept a fenced block.
- Rubric ids (source: `review-policy.md` 101, the `## Review rubric` section of each reviewer):
  - `asd-reviewer-correctness.md` 71-100: `###` headings.
  - `asd-reviewer-efficiency.md` 62-99: `###` headings.
  - `asd-reviewer-documentation.md` 57-69: bold-label bullets.
  - `asd-reviewer-testing.md` 53-60: bold-label bullets.
- Standing n/a predicates are scattered across five files:
  - `asd-phase-impl-review.md` step 5 (28-33): UI-surface predicate, declared "sole SSoT", and the conjunctive perf predicate.
  - `asd-phase-design-review.md` 31/33: `outside phase gate`.
  - `asd-reviewer-efficiency.md` 24/102: `no budgets defined`.
  - `asd-reviewer-correctness.md` 103: note for a missing target artefact.
  - `review-policy.md` 156: the out-of-half predicate.
- Workflows that switch to the subcommand: impl-review steps 1, 5, 6, 7 and 7a; design-review steps 7, 8 and 8a.
- README 306: runtime.js description.
- Tests at 2248, 2406-2441, 3011 (split) and 3119.

### AC-13 — Settings through `/asd-init`

- `t_AGENTS.md` 46; regenerate the managed block of root `AGENTS.md` (line 47) with `sync.js --apply AGENTS.md`.
- `core.md` Invariants 30 ("Only `/asd-init` may edit settings"). This is the home of the rule.
- `asd-sprint/SKILL.md` "Skills dispatched" 54-55: "No other skill set".
- `asd-phase-impl.md` step 8 (82-93): the MS-N path.
- `asd-init/SKILL.md`:
  - re-init 74-83: interactive dump at step 2, `accept-all` at step 5.
  - "Always first" 21-24: unconditional AGENTS.md/CLAUDE.md sync.
  - "Agents dispatched" 131-133: "no sprint context yet".
- `asd-phase-plan.md` step 4 and `sprint-lifecycle.md` "Plan file format" 300-316.
- `t_plan.md` 10-20 format comment.
- README 181, plus any README mirror of the hard rules.

### AC-14..AC-18 — Subsystem registry move

Every current reference:

- `core.md`
  - 25: Glossary, "Registered in `docs/architecture/c4/`".
- `artifact-layout.md`
  - 5: `c4-full`+`c4/` omitted when the flag is disabled; the registry must be carved out.
  - 36: sprint draft `c4-full/{model/*.c4, views.c4}`. The mermaid draft path is already missing.
  - 54-59: persistent `c4/` path map.
  - 83: "No `c4/` directory" when decomposition is disabled; stays.
  - 93-100: "Subsystem registry"; full rewrite.
  - 112-118: "Document representation rule" must admit the new `.md` files.
  - 124 and 132: shell list "architecture" and `{{DOC_TYPE}}` `Architecture`, which exist only for `architecture.html`.
- `sprint-lifecycle.md`
  - 98: audit row outputs.
  - 123: effective c4.
  - 141: C4 inputs.
  - 157-165: Audit phase.
  - 178 and 180: c4-full.
  - 190: "Architect patches C4 and creates folders".
  - 194: promote applies the c4 delta and names `architecture.html`.
  - 202: decomposition disabled.
- `checkpoints.md`
  - 50: `c4-full/` has no gate.
- `external-review.md`
  - 63 and 77: `c4-full/dist/` (likec4); stays.
  - 67: `docs/architecture/c4/`.
  - 69: `architecture.html` and `subsystems.yaml`; retire.
- `external-review/t_prompt-external-design.md`
  - 20-21 and 80-83: c4-full artifacts list and checklist.
- `asd-phase-audit.md`
  - step 2.
- `asd-phase-design.md`
  - 15 and 45-50: the diff against persistent `docs/architecture/c4/` (46) and the mermaid draft `t_subsystems.yaml` → `c4-full/subsystems.yaml` (49).
  - 63, 72 and 88: template list.
- `asd-phase-design-review.md`
  - 8 and 32.
- `asd-phase-design-promote.md`
  - 3: "update the C4 registry/folders".
  - 4: "Architect promotes ADR/C4/stack".
- `asd-phase-plan.md`
  - 3, 19 and 21.
- `asd-architect.md`
  - 4: description.
  - 16 and 20-23: stop condition "fallback (Mermaid)".
  - 41-43, 50, 57, 66, 68, 73 and 80.
  - 59: write access has no `subsystems.md` or `<id>.md` and no audit-phase write.
  - 97-102: "Diagram tool modes".
- `asd-reviewer-efficiency.md`
  - 38: inputs `c4-full/`.
- `asd-init/SKILL.md`
  - 3: `diagram_tool` is asked whenever decomposition is enabled.
  - 5 and 55: likec4 probe.
  - 13: seeds `c4/` whenever decomposition is enabled, ignoring `documents.c4`. Mermaid seeds `c4/subsystems.yaml` and an empty `c4-build`.
  - 14: `.gitignore` gets `c4/architecture.html`.
  - 126 and 138: artefacts list and the `DIAGRAM` return field.
- `t_config.yaml`
  - 21, 73-77 and 86-89.
- `t_audit.md`
  - 35-36: `{{subsystem id from c4 model}}`.
- `t_subsystems.yaml`
  - Delete. It is the only template without responsibility frontmatter.
- New template(s)
  - `subsystems.md` and `<id>.md`. They need responsibility frontmatter and fall inside the `canonMarkdownFiles` citation sweep.
- `README.md`
  - 18, 42, 257, 264-265 and 280.
  - 342: folder map.
  - 357 and 369-378: `architecture.html`, `c4-build`.
  - 436.
- `.asd/release-manifest.json`
  - 130: `upstream_hashes` entry for `t_subsystems.yaml`; add the new template.
  - Changed `canon_hashes`: `asd-architect.md`, `asd-init`, `asd-sprint`, and any edited reviewer or dev agent.
  - `asd_version`.
- `.gitignore`
  - 18-20: `docs/architecture/c4/architecture.html`.
- `CHANGELOG.md`
  - The migration notice.
- `tests/run.js`
  - No assertion references `c4`, `subsystem`, `mermaid` or `diagram_tool` today, so all coverage is new.
  - Guards that fire:
    - 1092 and 1922-1942: hash freshness.
    - 2940: managed-file registration.
    - ~3370: citation sweep.

No reader of the registry exists in `.asd/runtime.js`, `.asd/hooks/session-start.js`, `.asd/sync.js`, `.asd/skills/asd-update/update.js` or `.asd/migrations/{4,5,6}.0.0.js`.

## Existing docs found
- [review-policy.md](../../rules/review-policy.md)
  - "Coverage ledger" 97-115: manifest contract, rubric-id derivation (101), published `vocabulary`/`row_example` (103-107), rejection partition and transcription branch (109-113).
  - "Interrupted dispatch and split dispatch" 142-162.
  - "Autofix vs escalation" 72-87.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md)
  - "Impacted test set" 76-91.
  - "Plan file format" 300-316: the Material risk, Reachability and Wave grammars.
  - "Optional documents" 121-155.
  - "Design-promote phase" 183-202.
- [artifact-layout.md](../../rules/artifact-layout.md)
  - "Agent memory" 85-91.
  - "Subsystem registry" 93-100.
  - "Document representation rule" 112-120.
  - "Documentation economy" 195-201.
- [git-strategy.md](../../rules/git-strategy.md)
  - "Commit before review" 33-39.
- [providers.md](../../rules/providers.md)
  - "Role-scoped context" 86-105.
- [checkpoints.md](../../rules/checkpoints.md)
  - "Gate policy" 5-9.
  - "Gate inventory" 37-50.
- [decisions-log.md](./decisions-log.md)
  - Retrospective re-verification at HEAD 62464ac.
- Sprint 011 impl-review manifests (`archived/011-explicit-design-skip/reviews/impl/iter-01/*.manifest.json`)
  - Hand-built.
  - `sections` held the `t_review.md` headings `["Findings","Coverage","Verdict","Next action"]`, not rubric sections.
  - `n_a` predicates were free-form.

## Existing implementation found
- **AC-1:** the `n_a` shape is already enforced (`runtime.js` 218-240; test 3508). The digest already covers every stamped field (204-209; sweep 2479). A missing published field is tolerated (216-217), and the same pattern extends to a third constant.
- **AC-3:** partition and union mechanics exist (review-policy 156-162; test 3011). Only the trigger changes.
- **AC-4:** the attempt count and cause are already durable in decisions-log (146).
- **AC-7:** memory commits are already assigned for authors who cannot commit (git-strategy 39).
- **AC-8:** an equivalent fix is already permitted (review-policy 76).
- **AC-11:** `checkpoints.md` 5 already blocks on an unresolved material alternative. Only classifying a dev-flagged choice as one is missing.
- **AC-12:** `manifest-digest --write` stamps byte-idempotently and `validate-ledger` exists. There is no emitter.
- **AC-13:** asd-init diff mode already lists absent template fields (test 2897), and `asd-sprint` has the `Skill` tool.
- **AC-14..AC-18:** the effective-c4 computation and the collapse rules exist. `update.js` already deletes upstream-removed managed files that are unmodified locally (tests 1241 and 1259), so retiring `t_subsystems.yaml` propagates without a script.

## Gaps
- **AC-1:** no field name for the published shape. `n_a` already holds per-dispatch content, so the shape needs a distinct key.
- **AC-3:**
  - The threshold has no value and no home. It could be a runtime constant shared with AC-12, or prose; it must be one of the two, not both.
  - No rule covers a scope above twice the threshold, because Partition always produces two halves and never recurses.
  - Plan can only estimate size. The split keys on the scope list at dispatch time.
- **AC-4:** "Payload carries only" (review-policy 33) and both workflow payload bullets must admit the attempt record. Otherwise AC-4 contradicts the clean-context rule.
- **AC-5:** under self-hosting, the payload widens write scope beyond the agent definition:
  - `asd-phase-impl.md` 46 and `sprint-lifecycle.md` 113 extend it over `asd-dev.md` 65 ("never elsewhere in `.asd/` or `.claude/`").
  - Host memory writes land in `.claude/agent-memory/` against `asd-dev.md` 65 and `asd-tester.md` 76.
  - Without a reconciling statement, a compliant agent reports a contradiction on every self-hosting dispatch.
- **AC-7:** Architect, BA and UX have `memory: project` but no git commit grant. "That agent commits them" must be limited to agents holding a commit tool.
- **AC-11:** the dev COMPLETED report has no structured channel for a flagged choice (`asd-dev.md` 92; `asd-phase-impl.md` 80).
- **AC-12:**
  - `rules` vs `sections` semantics are not canonically defined.
  - Custom-rule ids (`custom-*-rules.md`) are required by review-policy 101 but are not among AC-12's three inputs.
  - Standing predicates have no canonical literal strings.
  - The correctness self-hosting carve-out (99) authorises nested bullets that derivation never enumerates, so those ids do not exist.
  - "Accepts the fenced block directly" leaves the source of `--findings` undefined. The invented/missing-finding check becomes vacuous unless findings come from the findings table.
  - The emitter must also produce split halves with the out-of-half predicate.
- **AC-13:**
  - There is no plan-line grammar for a settings change.
  - asd-init re-init requires an interactive dump and `accept-all` (77, 81). Either plan acceptance substitutes for that, or the user is asked twice.
  - The step 9 authorised-paths gate (`asd-phase-impl.md` 97) must count `config.yaml` and any asd-init side-effect writes.
  - `asd-init` 133 ("no sprint context yet") becomes false.
- **AC-14..AC-17:**
  - Registry bootstrap is undefined when no C4 registry exists (greenfield, or c4 disabled). Audit backfill sources only an existing C4 registry, and design-promote collapses under `skip_design_phases`.
  - Architect write access (59) lacks the new paths.
  - Audit is text-only today; Architect persistent writes at audit are new and happen before the audit gate.
  - Backfill must be framed as migration of subsystems already registered, not as the "new subsystems only via design-promote" route (`core.md` 25; `artifact-layout.md` 100; `asd-architect.md` 73).
- **AC-16:** the mermaid sprint draft form has no path. Sprint-folder purity (`artifact-layout.md` 68) requires it in the path map, and `asd-phase-design.md` 49, the external design prompt (21, 80) and `asd-reviewer-efficiency.md` 38 all name the current path.
- **AC-18:** the Document representation rule (112-118) has no Markdown persistent-doc exception except DESIGN.md. The shell list (124) and `DOC_TYPE` `Architecture` (132) retire together with `architecture.html`.
- **External dependency gaps:** none. The likec4 CLI stays optional.
- **Migration gaps** (no script, per sprint.md):
  - likec4 `docs/architecture/c4/model/*.c4` → `subsystems.md` plus `<id>.md` at the next audit.
  - mermaid `docs/architecture/c4/subsystems.yaml` → `subsystems.md` with an inline diagram. The old `c4/` folder, the `.gitignore` `c4/architecture.html` entry and `commands.yaml` `c4-build: ""` are left orphaned, and their removal is unspecified.
  - Consumers with c4 disabled already hold an asd-init-seeded `c4/`. AC-16 "folder does not exist" implies deleting user files, which is unspecified.
  - `t_subsystems.yaml` is deleted by update.js, so a consumer sprint in flight in the mermaid design step loses its template.
  - Consumers with `documents.audit: off`, or an `auto` skip, get no registry until audit runs.

## Risks

### AC-1 × AC-12 — constants stamped in two places

- **Risk:** the emitter and `manifest-digest --write` stamp constants separately and drift apart.
- **Impact:** high.
- **Mitigation:** one stamping function used by both subcommands; extend tests 2461 and 3434.

### AC-3 × AC-12 × AC-2 — split threshold and half manifests

- **Risk:** a threshold stated in prose keeps the split manual. Stamps of pre-dispatch halves could read as re-stamping.
- **Impact:** medium.
- **Mitigation:** make the threshold a runtime constant the emitter applies. Word AC-2 as "a manifest already dispatched".

### AC-12 — second home for "sole SSoT" predicates

- **Risk:** moving the predicates in impl-review step 5 into code creates a second home.
- **Impact:** medium.
- **Mitigation:** code becomes the home, step 5 cites the subcommand, and correctness keeps citing step 5.

### AC-12 — brittle rubric ids

- **Risk:** rubric ids are verbatim heading text, so any heading edit moves every manifest.
- **Impact:** low.
- **Mitigation:** parser-derived ids plus a test that the parser output equals the headings.

### AC-5 × AC-7 × self-hosting grants

- **Risk:** the refusal rule collides with write scope granted by the payload and with host memory writes.
- **Impact:** high.
- **Mitigation:** define "declared tool policy" to include the phase-granted self-hosting allowlist and the agent-memory carve-out (`artifact-layout.md` 89).

### AC-13 × asd-init "Always first"

- **Risk:** asd-init rewrites the AGENTS.md/CLAUDE.md managed blocks on every call. Run mid-impl here, where AC-13 edits `t_AGENTS.md`, it writes outside authored paths or halts on `modified-foreign`.
- **Impact:** medium.
- **Mitigation:** define the scope of a settings-task invocation, and name its writes for the step 9 gate.

### AC-13 × frozen state

- **Risk:** a settings task never affects the current sprint.
- **Impact:** low.
- **Mitigation:** state this in the grammar.

### AC-13 — settings change never reviewed

- **Risk:** `.asd/project/**` is outside the self-hosting review surface (`sprint-lifecycle.md` 119).
- **Impact:** low.
- **Mitigation:** plan acceptance is the approval of record.

### AC-13 — wave ordering

- **Risk:** a settings task changes what later tasks run under.
- **Impact:** low.
- **Mitigation:** order it first and alone in its wave (`sprint-lifecycle.md` 314).

### AC-8 — duplicate statement

- **Risk:** a new clause restates review-policy 76.
- **Impact:** low.
- **Mitigation:** extend 76 only, and delete the payload restatement at `asd-phase-impl.md` 63.

### AC-9 — retroactive reach

- **Risk:** hardcoded sets in `tests/run.js` become reviewable once touched.
- **Impact:** low.
- **Mitigation:** fix only what the diff touches.

### AC-11 — fix modes skip the gate

- **Risk:** a choice flagged in a fix mode still passes unexamined.
- **Impact:** low.
- **Mitigation:** keep the AC to initial mode, or route those choices back explicitly.

### AC-14..AC-17 — registry never created

- **Risk:** with decomposition enabled but c4 disabled, or with no prior C4, nothing creates the registry.
- **Impact:** high.
- **Mitigation:** plan picks a bootstrap point: audit builds the registry from code, or asd-init seeds an empty one.

### Unreviewed persistent registry writes

- **Risk:** registry writes at audit and promote never reach design-review.
- **Impact:** medium.
- **Mitigation:** record the registry delta in the promote summary, or accept it as a mechanical write.

### Subsystem id collisions

- **Risk:** ids such as `subsystems`, `stack`, `c4` or `tech-reference` collide in flat `docs/architecture/`.
- **Impact:** medium.
- **Mitigation:** a reserved-id list in "Subsystem registry".

### Destructive migration

- **Risk:** deleting a consumer's existing `c4/` to satisfy AC-16.
- **Impact:** high.
- **Mitigation:** never delete; CHANGELOG instructs manual removal. Any automated removal is a hard gate.

### Breaking consumer contract

- **Risk:** the registry location, the template removal and the `diagram_tool` semantics all change.
- **Impact:** medium.
- **Mitigation:** major version bump from 7.3.0, a CHANGELOG migration section, and README in the same change.

### Hash and citation guards

- **Risk:** citation-sweep and hash guards fail (tests ~3370, 1922-1942, 2940).
- **Impact:** low.
- **Mitigation:** recompute hashes last, after `sync.js --apply`.
