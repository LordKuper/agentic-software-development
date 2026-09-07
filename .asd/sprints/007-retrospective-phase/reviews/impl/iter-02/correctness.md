[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium)
- **Scope**: incremental diff of the iteration-1 review fixes, 12 files

## Findings

None at medium or above. The fix set is correct and complete against what it set out to change, and introduced no new defect.

## Verification evidence

**`.asd/migrations/6.0.0.js`** — parse/delete/re-serialize is sound. Idempotence: a second run hits the `hasOwnProperty` guard, reports `absent`, writes nothing. The `archived/` guard skips the literal `archived` entry and accepts only a direct child holding `state.json`; a non-directory entry falls out via `existsSync`. Unparsable or half-written input throws in `JSON.parse`, leaving the file byte-for-byte and reporting `skipped` with a warning; non-object parses fall through to `absent` and never write. Re-serialization loses nothing a consumer depends on — `JSON.stringify` escapes embedded newlines so the EOL rejoin cannot corrupt string values, member order is preserved by parse (only integer-like keys could reorder, and the map keys here are `iter-NN` and task ids, order-independent), and the only reader of sprint state parses it, so byte layout has no consumer. The atomic write uses a same-directory temp plus rename, replace-atomic on both POSIX and Windows; a rename failure propagates, the runner stops without advancing the recorded version, and idempotence makes the partial application safely re-runnable. The stdout warning is the only data-recovery affordance and it is now asserted.

**Retro skill tools vs its workflow** — `Read Write Edit` covers every declared operation: read config, friction log and run record; create `retrospective.html`; lazily create the friction log from its template on a first `F-N`; append entries plus the decisions-log and the state phase field. Dropping `Task` is correct now that the workflow delegates nothing, which is also why removing the `ADVICE_NEEDED` relay is right — that protocol's only emitter is a dispatched agent. Dropping `AskUserQuestion` is correct: the gate inventory has no retro row and retro's precondition is machine-checkable.

**`asd-phase-impl.md` manual-steps condition** — actionable as written. It fires only on "unexpected, unworkable, or raised at the wrong point", and the trailing clause resolves it against the validation the preceding bullet just performed. Matches the `manual-steps.md` row of the friction-log boundary table.

**`t_retrospective.html`** — AC-4's split survives the table merge via the `Addresses` F-N reference plus the `Acts on` chip and `Target` columns. Fragment purity holds; every class used is defined in the shell. The TOC comment matches reality: four `h2` on the full branch, at or above the threshold so the nav is emitted; two on the empty-log branch, below it so the placeholder is correctly empty.

**Mirrors** — `PHASE_CHAIN`, `core.md`, `sprint-lifecycle.md`, `checkpoints.md`, every workflow `NEXT:` token, README's table, flowchart and count words, the skill/workflow bijection, `artifact-layout.md`'s tree and four placeholder rows, the manifest's ledger entries, and `AGENTS.md`'s counts and generative chain contract are all mutually consistent. Generated retro skill views carry the current source digest, matching the manifest.

**AC trace** — AC-1 through AC-10 all satisfied, with AC-9's version bump correctly owned by the `pr` phase per the plan. No partial implementation and no untraceable change in the diff.

**Noted, out of change surface, no action this iteration**: the `pr` and `scope` phase skills declare no write capability yet their workflows write `state.json`. This predates the sprint — the `pr` skill could not write state before this change either — so it is neither caused by nor fixable within this diff.

## Verdict

APPROVE

## Escalations

None.

## Coverage ledger

No orchestrator manifest existed for iteration 2; ledger ids are keyed to `scope.json`'s `files[]` in its exact order plus this reviewer's rubric sections.

```json
{"manifest_digest":null,"manifest_source":".asd/sprints/007-retrospective-phase/reviews/impl/iter-02/scope.json","findings":[],
"files":[{"i":".asd/migrations/6.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],
"sections":[{"i":"bugs","s":"reviewed"},{"i":"security","s":"reviewed"},{"i":"contracts","s":"reviewed"},{"i":"best-practices","s":"reviewed"},{"i":"ac-coverage-trace","s":"reviewed"},{"i":"ui-conformance","s":"reviewed"}],
"rules":[{"i":"bugs.offbyone-null-race-unhandled-leak-tz","s":"pass"},{"i":"security.secrets-injection-authz-inputval-crypto","s":"pass"},{"i":"contracts.signature-drift","s":"pass"},{"i":"contracts.migration-reversible","s":"pass"},{"i":"contracts.breaking-change-migration","s":"pass"},{"i":"best-practices.idiomatic","s":"pass"},{"i":"ac.every-AC-has-code-path","s":"pass"},{"i":"ac.no-partial-without-followup","s":"pass"},{"i":"ac.no-change-without-AC-or-task","s":"pass"},{"i":"ui.token-usage-ds6","s":"pass"},{"i":"ui.token-comment-ds4","s":"n/a","p":"self-hosting framework-templates carve-out: no DESIGN.md/designmd-lint pipeline"},{"i":"ui.component-fidelity","s":"pass"},{"i":"ui.design-system-completeness","s":"pass"},{"i":"ui.lint-exclusions-ds11","s":"n/a","p":"self-hosting framework-templates carve-out: no DESIGN.md/designmd-lint pipeline"},{"i":"ui.ux-principles","s":"pass"},{"i":"ui.accessibility-wcag-aa","s":"pass"}]}
```
