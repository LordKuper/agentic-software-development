[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Manifest**: [efficiency.manifest.json](./efficiency.manifest.json) (digest `b1aba40f…`)
- **Validated ledger**: [efficiency.ledger.json](./efficiency.ledger.json) — `validate-ledger` → `{"ok":true}`

## Findings

### EFF-1 — medium — complexity-vs-value

**Location**: `.asd/rules/review-policy.md:175` and `:173`; `.asd/workflows/asd-phase-impl-review.md:35,62`; `.asd/workflows/asd-phase-design-review.md:28`

A half-collapse survived the fix round on the APPROVE-latch annotation — a "not restated here" declaration sitting on top of the restatement it forbids, in all three files the round edited. `review-policy.md:175` denies restating persisted state, the dispatch-skip mechanics and the red-full-suite invalidation, then restates two of those three inside the same sentence and its own subsection. The denial's second clause is also false about the two other files it speaks for: both review workflows say the mechanism is not restated here and then restate it, and the impl-review workflow additionally restates the invalidation. The owning home points *at* those two workflow steps, so the claim is contradicted by the SSoT it cites. This is `audit.md` E-16's exact class: a declaration is only worth its bytes if a later editor can trust it, and archived reviews use these declarations as the premise of SSoT findings.

**Suggested fix**, two parts, no new text: (a) in `review-policy.md`, cut the restated clauses, keeping the DoD fact that file owns; (b) either cut the mechanic from both workflow bullets, keeping only the phase binding, or — if those clauses are wanted at the acting site — delete the "not restated here" declarations so no file declares a contract it breaks. Do not fix by adding compensating prose anywhere.

### EFF-2 — medium — hot path

**Location**: `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md` (~10.3 KB) and `.claude/agent-memory/asd-tester-critical/feedback_fail-first-and-none-honesty.md:16-20`

Agent memory is a per-dispatch read surface the sprint's own evidence unit never measured, and it grew this round with duplication the same rule would have blocked in canon. `audit.md` G-8 prices canon at bytes read per dispatch, but `.claude/agent-memory/**` sat outside the AC-8 corpus; these two files add roughly 12 KB — about 3K tokens — to every `asd-tester-critical` dispatch, and gained about six entries this round. Two concrete redundancies, both in text loaded together in one context: the rule that a `none` decision needs a reason surviving inspection has two homes, with the same proposition, the same examples and the same provenance; and one mutate-restore procedure is spread across three non-adjacent ordinal entries, the last of which supersedes the operational half of the other two and says so — so a reader following the file in order runs the replaced procedure and meets its replacement forty lines later. Ordinal keying is the growth mechanism: appending is always cheaper than merging, so the file can only grow.

**Suggested fix**, decomposition and deletion only, no new file class: keep the `none`-honesty rule in the file whose declared topic it is and cut the duplicate bullets from the other, leaving that file's genuinely distinct half; merge the three procedural halves into one mutation-proof entry stating the current procedure once, keeping the two failure modes the superseded entries contribute; and key entries by topic heading instead of ordinal so the next merge costs nothing.

## Explicitly judged and cleared

The economy rule is still one paragraph plus two lists, about 2.0 KB — the second list is the preserve-list AC-7 mandates, not growth, and the reach enumeration and test ordering are case distinctions a shorter phrasing would collapse. It passes `audit.md` R-2 and is not an essay.

The `.asd/sync.js` diagnostic collapse is a genuine simplification with no information traded away: one closure emits provider label, agent name, family, resolved model and effort for both providers, both call sites pass effort, and a test pins the Claude-side content so it cannot silently thin out. The single-call-site helper sits at the emission site by design.

The `runtime.js` `n_a` shape rejection is not defensive code for an impossible case — the manifest is hand-built per dispatch, and without the guard a mis-keyed `n_a` degrades into "no predicate authorized", rejecting truthful rows instead of the manifest. Row types derive from the vocabulary, so it creates no second home.

Each new assertion in `tests/run.js` pins a distinct branch a reader could not otherwise rely on, and the two fixture-integrity assertions guard the silent-no-op class the tester's own memory records. One triple file read inside an inner loop is real but sub-millisecond — low, dropped under this iteration's floor.

Perf sections resolve `pass` rather than `n/a`: no perf budgets are defined, so none is violated; the three executable files carry no n+1, no unbounded allocation, no blocking hot-path work and no quadratic behaviour on user-sized input, every loop being over a fixed set. No regression baseline exists and none was invalidated.

## Verdict

CONCERNS: 2

## Next action

Route to `impl` review-fix mode. Both fixes are deletions or merges of existing text — no new abstraction, layer, file class or dependency, so neither needs escalation. Verify each premise at HEAD before applying. EFF-1's fix must not add compensating prose anywhere, and EFF-2 belongs to `asd-tester-critical`'s own memory channel — route it to that agent rather than hand-editing another agent's memory.
