[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high)
- **Method note**: no shell grant, so the delta was derived by direct file reads of the 12 scoped paths plus `test-plan.md`, `decisions-log.md` and the assertion sources. The suite result was corroborated arithmetically (171 top-level `test(` declarations ↔ reported 171/171, declaration count flat this entry) and hash freshness structurally, never recomputed.

## Findings

None at or above the high floor. Sub-floor observations dropped entirely per the iteration severity floor.

## Assessment of the four dispatched questions

**AC-15 re-pin — fails loud in both directions; the uniqueness assertion cannot pass vacuously.** The counter side pins `checkpoints.md`'s tail and its mode-agnostic clause, so a reworded counter reddens first. The emitter side derives the literal from `asd-phase-impl.md` by regex, asserts exactly one match, then asserts containment. Replaying the regex by hand over the whole workflow: the other candidate lines carry no quoted string or no `iter-NN`, so only the step-11 line matches. A reworded emitter therefore lands in one of two loud states — still matching but no longer ending with the tail, or no longer matching at all (`0 !== 1`). `strictEqual(matches.length, 1)` is the opposite of vacuous: zero matches fails, which is exactly the hole the old whole-heading equality had. The step binding resolves correctly via the backward step-number scan. Declining the dev's proposed shape was right: a second hardcoded emitter literal plus `endsWith` would have re-created the one-sided literal that this round proved wrong on real data.

**AC-8 / AC-10 / AC-14 locators — keyed on rot-loud tokens, not churnable wording.** AC-8 binds the canonical signal token, the `{{wraps_cli}}` placeholder read through `sync.readNormalized` (so neither rendered view can satisfy it alone), and the "Outcome contract" citation. AC-14's latch locator is the strongest of the set: it selects the line by `clearing route` plus the "Late duplicate return" citation, which disambiguates it from the red-suite paragraph — an ordinal-keyed locator really would have reddened on the correct rename in this same delta, so the citation key is both correct and non-vacuous. The workflow bindings loop over both phases and key on a path token inside the `## Artefacts produced` split. AC-10's two new literals sit on the only two lines the test already isolates, and the parallelism-survival check was split so the phrase's survival and its scoping fail separately.

**Mutation proofs — 17 transcriptions replayed by hand against the named lines; all consistent.** The two called out as subtle check out specifically: the reworded-emitter mutation still matches the extraction regex and passes the uniqueness assertion, so the containment assertion is genuinely the first firing — and it also genuinely breaks the counter's tail match, so it is a real defect rather than an over-strict assertion; the `Artefacts produced` mutation had to target the impl row because the loop iterates design first. One proof's message is template-interpolated from the mutation itself, which a fabricated transcript would not reproduce.

**The `git checkout --` / LF note is a correctly recorded environment fact.** Under `* text=auto eol=lf` git materialises LF on checkout while leaving already-present worktree files untouched, so exactly the mutated-and-restored files flip while neighbours stay CRLF; index blobs are unchanged, which is why the tree is clean and the restore is byte-exact in tracked content. The qualification of "byte-for-byte" is the right scope, and no new assertion is EOL-fragile — every new match is within a single line.

Also verified: no removals, and the single replaced assertion is recorded as a test defect whose replacement pins a strictly stronger property (§17: implementation-coupled checks are rewritten, not dropped); the `none` decisions remain honest, including the `route-task` row whose false premise was independently confirmed against `runtime.js`; determinism holds (pure file reads, no timing or ordering reliance, no new in-body comments); the stub-resolution predicate is true; manual verification correctly `none`.

## Coverage

Validated compact ledger: [`testing.ledger.json`](./testing.ledger.json) against [`testing.manifest.json`](./testing.manifest.json), findings [`testing.findings.json`](./testing.findings.json) (empty). `validate-ledger` → `{"ok":true}`. 12/12 files, 18/18 rules, 5/5 sections resolved.

## Verdict

APPROVE

## Next action

Reviewer done for iteration 3; no test-side fix round required from this reviewer.

## Escalations

None.
