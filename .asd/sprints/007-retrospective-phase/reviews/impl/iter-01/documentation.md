[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 1 (severity floor: low)
- **Change surface**: 29 scoped files, `main...bb9b760`

## Findings

| # | Sev | Location | Description | Fix |
|---|---|---|---|---|
| DOC-1 | high | `README.md:155` | Phase-chain mirror not updated. The prose paragraph under the flowchart still reads "`impl-review` runs the sprint's one full-suite check before advancing to `pr`", contradicting the same file's flowchart edge (`:146`), its phase-table row (`:167`), `PHASE_CHAIN` (`session-start.js:34`) and `asd-phase-impl-review.md:60`/`:101`. AC-8 is therefore not met. Failure scenario: a consumer or a future agent reads README's narrative — the only prose explanation of the cycle — concludes impl-review hands off to `pr`, and drops or mis-orders `retro` when editing the chain; the new chain test covers `core.md` and `sprint-lifecycle.md` only and will not catch it. | Change "before advancing to `pr`" to "before advancing to `retro`". |
| DOC-2 | medium | `AGENTS.md:107` | The chain-consistency contract was extended from four sites to nine (closing G-10) but omits the two chain-assertion sites this sprint itself created: `asd-phase-retro.md` (`:40`/`:42` return contract, `:7` precondition) and `asd-phase-retro/SKILL.md:4` (description asserting the phase completes to `pr`). The list's own generalizing sentence describes exactly these files, so the enumeration contradicts its closing clause. Failure scenario: the next chain edit walks the nine named sites, leaves `asd-phase-retro.md` emitting a stale `NEXT: pr`, and — `NEXT:` being authoritative while `PHASE_CHAIN` only drives display — silently routes past the new phase. Same G-10 class the sprint set out to fix. | Add both files, or state the rule generatively ("every `asd-phase-*` workflow return contract and every `asd-phase-*` skill description") and drop the per-file enumeration. |
| DOC-3 | medium | `sprint-lifecycle.md:250` vs `asd-phase-retro.md` | SSoT statement false as written. The writer mechanism declares itself "referenced by every phase workflow", and ten of eleven carry the reference; `asd-phase-retro.md` carries none — it only reads the log. Failure scenario: retro is the one phase with no channel for its own friction (e.g. the empty-log fragment shape cannot be conformed to, or DOC-5's placeholder gap blocks the write). The malfunction is unrecordable, is lost with the transcript, and the next sprint repeats it — defeating AC-2's "any phase may append at any point". | Add the same one-line reference to `asd-phase-retro.md`'s `## Operations used`. Entries appended during retro are read by the next sprint's reader of the archived log, consistent with the log being append-only. |
| DOC-4 | medium | `asd-phase-impl.md:88` | Scope boundary violated against the rule that owns it. The rewritten halt instruction mandates an `F-N` entry unconditionally, but `sprint-lifecycle.md:237` scopes the log to workflow malfunction only, and its boundary table (`:245`) permits only "the step was unexpected or unworkable" — a validated, genuinely necessary `MS-N` is the designed path. Failure scenario: every sprint with one legitimate manual step emits a false `F-N`; retro then produces a root cause and remediation for a non-problem, and the log stops being a signal. The second, looser channel the two-class split exists to prevent, arriving from the opposite direction. | Record `F-N` only when the halt itself was a malfunction (an `MS-N` that should not have been needed, was unworkable, or was raised at the wrong point), citing the id; otherwise append nothing. |
| DOC-5 | medium | `artifact-layout.md:120-121` | New artifact class added without extending two placeholder rows. `{{DOC_TYPE}}` gained `Retrospective` and `{{STATUS}}` gained `final`, but `{{SUBSYSTEM}}` and `{{SPRINT_ID}}` still enumerate only drafts and persistent docs. `retrospective.html` is explicitly neither — `{{STATUS}}`'s own new clause says it has no draft lifecycle — and `asd-phase-retro.md:22` defers to the fill table, so this fact has no home. Failure scenario: the orchestrator follows the table literally, finds no matching clause, writes an empty sprint-id and an arbitrary subsystem; the sprint-scoped retrospective ships without the sprint id it is scoped to, and two sprints' retrospectives become indistinguishable by metadata. | Extend both rows to cover sprint-scoped artifacts generally, not only drafts. |
| DOC-6 | high | `tests/run.js:2506-2507`, `:2565-2566`, `:2568-2569`, `:2628-2629` | Newly added test bodies carry in-body comments, which `code-style.md` §7 bans absolutely, and `AGENTS.md:116` explicitly extends §7 to `tests/run.js` with no exemption for framework code. The comments narrate fixture intent — meaning §7 requires it to live in the name, signature or member doc. The file carries many pre-existing instances of the same pattern; only the lines this diff added are in the change surface. Failure scenario: the rule is verified at impl-review, so an accepted violation in the framework's own test file becomes the precedent a consumer's dev agent cites when a reviewer flags the identical pattern — the rule stops being enforceable. | Fold each narration into the adjacent assertion message (these tests already carry good ones) or into the section-header block comment, which sits outside any function body and is compliant. |
| DOC-7 | low | `t_friction-log.md:11`, `:23` | Self-contradicting comment block: it states lazy creation and append-only, then in the same comment declares the rest "normative there, not restated here" — but those are two facts `sprint-lifecycle.md:235` already owns, and `:23` restates lazy creation a third time. Failure scenario: a later sprint changes creation semantics (e.g. seed the file at `scope`); the rule and `artifact-layout.md:172` are updated, the template comment is not, and every generated friction log ships instructions contradicting its governing rule. | Keep only the pointer line; delete the two restated facts and the `:23` comment. |
| DOC-8 | low | `artifact-layout.md:176` | Partial duplication of the retro contract. The representation classification belongs here (it closes G-4), but the following clause restates the remediation-class definition owned by `sprint-lifecycle.md:260`, in a sentence that then defers to that same section. Failure scenario: the two-class contract evolves and this copy silently disagrees with its declared owner. | Trim to the classification plus the owner pointer. |
| DOC-9 | low | `.asd/skills/asd-phase-retro/SKILL.md:4` | The skill description — the only artifact a provider surfaces for skill selection and implicit description-matching — describes only the remediation class and says an entry-free log "takes the empty-log branch and still completes to pr", with no mention of the systemic-proposals class. AC-10 makes that class unconditional and explicitly not derived from the log, so the sentence reads as "empty log means nothing analysed". Late-added AC-10 reached the rule, the template and the workflow but not the skill trigger. | Add one clause naming the systemic class in both branches. |

### Verified clean, no finding

SSoT holds where it matters most: `sprint-lifecycle.md` "Friction log" and "Retro phase" are the sole normative homes; `artifact-layout.md`, both new templates and `asd-phase-retro.md` link rather than copy, except DOC-7/DOC-8.

The ten friction-append lines across `asd-phase-*.md` are genuine one-line references, not ten copies of the mechanism. Placement varies to match each workflow's existing shape; not a defect.

Template responsibility blocks: both new templates declare `owns`/`excludes`/`delegates_to`, and both `excludes` draw the boundary against all four adjacent owners as G-5 required.

HTML shell wrapping: `t_retrospective.html` is a pure fragment with no shell chrome; `t_html-shell.html:6` gained `t_retrospective`; the artifact enumeration gained it; the empty-log `{{TOC_NAV}}` reasoning is right per the 3-`h2` threshold; no `.mermaid` block, so an empty `{{MERMAID_SCRIPT}}` is compliant. Provenance carries `original` with empty source, matching convention.

`AGENTS.md` managed-block boundary intact: the block is byte-identical to `t_AGENTS.md`, and every sprint edit sits below the end marker.

Count words all match the filesystem: `core.md` "Eleven" with 11 named phases; `AGENTS.md` "Skills — 18" / "The 11 `asd-phase-*` skills"; README "18 skills", "11 phase orchestration files", "eleven".

Chain wiring is otherwise complete and mutually consistent across `session-start.js`, `sprint-lifecycle.md`, `core.md`, `checkpoints.md`, `asd-sprint/SKILL.md`, `asd-phase-impl-review/SKILL.md`, `asd-phase-impl-review.md`, `review-policy.md` and README's flowchart and table.

`escalations` fully retired with no orphan: removed from `t_state.json`, no reader or writer remains in canon, `asd-phase-impl.md:88` rewritten (DOC-4 concerns its scope, not its existence), migration plus two tests cover the consumer path.

Audit gaps resolved or explicitly decided: G-1/G-2/G-7 by the 2026-09-07 decisions, G-3 partially (DOC-5), G-4, G-5, G-6 decided out of scope and recorded, G-8, G-9, G-10 partially (DOC-2), G-11 and G-12 by the new tests, G-13 by `asd-phase-pr.md:9`.

`6.0.0.js` carries no in-body comments; its header contract paragraph follows `5.0.0.js` precedent and its doc comment states purpose, not implementation.

`release-manifest.json`: `upstream_hashes` entries present for both new templates, the new skill, the new workflow and the migration; `canon_hashes` for the new skill only, which is correct. `asd_version` still `5.0.0` is correct at impl-review — `git-strategy.md:71` places the bump in `pr` open mode.

## Verdict

CONCERNS: 9 (2 high, 4 medium, 3 low). Nothing requires escalation: no finding touches approved scope, an AC's meaning, or a public contract, and none introduces an abstraction. DOC-1 is an unmet AC-8 mirror whose fix is a single word.

## Next action

Route to `impl` review-fix mode; the sprint re-enters `impl-review` via `impl-test`.

## Escalations

None.

## Coverage ledger

No dispatcher manifest was present in `reviews/impl/iter-01/` or supplied in the payload — only `scope.json` — so the ledger is keyed by the 29 scope paths and rubric ids with `manifest_digest: null`.

```json
{"manifest_digest":null,"scope_ref":".asd/sprints/007-retrospective-phase/reviews/impl/iter-01/scope.json","head_ref":"bb9b7608f0764dc7b4ddb7c39ae498540c54e0af","findings":["DOC-1","DOC-2","DOC-3","DOC-4","DOC-5","DOC-6","DOC-7","DOC-8","DOC-9"],
"files":[{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/migrations/6.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked","f":["DOC-5","DOC-8"]},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked","f":["DOC-3"]},{"i":".asd/skills/asd-phase-impl-review/SKILL.md","s":"checked"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked","f":["DOC-9"]},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked","f":["DOC-7"]},{"i":".asd/templates/t_html-shell.html","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/templates/t_state.json","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked","f":["DOC-4"]},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked","f":["DOC-3"]},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":"AGENTS.md","s":"checked","f":["DOC-2"]},{"i":"README.md","s":"checked","f":["DOC-1"]},{"i":"tests/run.js","s":"checked","f":["DOC-6"]}],
"rules":[{"i":"R-SSOT","s":"finding","f":["DOC-3","DOC-4","DOC-7","DOC-8"]},{"i":"R-TEMPLATE-RESPONSIBILITY","s":"pass"},{"i":"R-HTML-SHELL","s":"finding","f":["DOC-5"]},{"i":"R-PROVENANCE","s":"pass"},{"i":"R-TRACEABILITY","s":"finding","f":["DOC-1","DOC-2"]},{"i":"R-PERSISTENT-ACTUALITY","s":"n/a","p":"no persistent docs/ tree exists in this repo; prd/ux_spec/adr/c4 disabled and no doc absorbed a folded ADR or API contract this sprint"},{"i":"R-INCODE-DOC-COMMENTS","s":"finding","f":["DOC-6"]},{"i":"R-FRAMEWORK-MODE","s":"finding","f":["DOC-1","DOC-2","DOC-9"]},{"i":"R-CUSTOM-RULES","s":"pass"}],
"sections":[{"i":"S-CHAIN-MIRRORS","s":"reviewed"},{"i":"S-COUNT-WORDS","s":"reviewed"},{"i":"S-AGENTS-MANAGED-BLOCK","s":"reviewed"},{"i":"S-FRICTION-APPEND-REFS","s":"reviewed"},{"i":"S-AC-TRACE","s":"reviewed"},{"i":"S-AUDIT-GAP-TRACE","s":"reviewed"},{"i":"S-PROSE-ECONOMY","s":"reviewed"}]}
```
