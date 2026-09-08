[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 4 (severity floor: high — 6 findings dropped below floor: 4 medium, 2 low)
- **Method note**: no shell. Counts corroborated structurally: `tests/run.js` carries 159 top-level `test(` declarations, matching the reported 159/159, and the diff adds exactly 3 to entry 5's 156.

## Findings

| # | Severity | Location | Description | What must be covered |
|---|---|---|---|---|
| T-1 | high | `tests/run.js:3070-3112`; `test-plan.md` Entry-6 rows; `decisions-log.md:145` | The AC-11 guard was **narrowed while being described as "extended in place"**, and the durable record overstates its reach. (a) The old assertion scanned each **whole workflow file** for `` /`head`\s*=\s*`git[^`]*`/i ``; it was deleted, not extended. The replacement ban applies only to the sentence fragment that literally contains `derived_handoff`. `asd-phase-impl-test.md:52` already carries a literal `git rev-parse HEAD` one semicolon away from that clause, so the D-1 formula reintroduced in an adjacent fragment now ships green where it previously failed. (b) `stepLines` maps only top-level `^\d+\. ` lines, so sub-bullets, `1a`/`1b` lines and the `Artefacts produced` bullets are invisible — and the read deleted this round to establish "one reader" was exactly a step-2 **sub-bullet**. Re-adding it there leaves the assertions unchanged: green. (c) The rule's new headline invariant, "no other phase writes or reads the slot", is never checked against the other nine workflow files. (d) Testing the claimed generality: `head is the newest commit touching pathspec` inserted into impl-review step 1's clause contains no `git` and only lowercase `head` — the `HEAD` ban is case-sensitive — so it **passes**. The record's own narrower example is caught, so the guard is real, but strictly narrower than `test-plan.md`'s and the decisions log's claims. Fail-first against `5ca4d30` is honest but proves only the derivation anchor: the rule sentence did not exist in that shape there, so the test red-lines before reaching any wiring assertion. `Removed tests: none` is therefore inaccurate. | The one-writer/one-reader invariant over the **whole file** (not only numbered step lines, with an explicit allowance for the `Artefacts produced` mention) and across **every** workflow file, so a mention in a third phase or a sub-bullet fails; an **absolute**, not fragment-scoped, ban on a `head`/`base` formula in the two wiring files, restoring what the deleted regex covered; and either the widened guard or a corrected record stating what the ban actually reaches. The dropped assertions belong in `Removed tests` with a reason. |
| T-2 | high | `tests/run.js:3179` | `assert.strictEqual(memory.match(/\bWrite\b/), null, …)` is the wrong check for the D-2 regression class — the class that cost two review re-dispatches. **Under-inclusive**: a re-enumerated grant in any other casing or phrasing ("Read/Glob/Grep/write", "this reviewer can write its own review file") passes while making exactly the false claim the test is named for. **Over-inclusive**: it bans the token itself, so a *correct negative* statement reds the suite. That is live, not hypothetical — the frontmatter this test pins does not match the grant this dispatch actually received, so the memory's "no write tool" sentence needs correcting and the accurate correction is blocked by the token ban. The rest of the test — citation presence, and verifying the cited frontmatter really is read-only — is sound and carries the value. | The assertion must fail on the *claim* (a tool-grant enumeration in that file that disagrees with the cited frontmatter), not on the presence of a token — e.g. by requiring no tool-list enumeration beside the citation, checked case-insensitively against the frontmatter's own names. Do not pin a spelling a correct sentence must use. |

## Answers to the dispatch's named questions

1. **AC-11 guard** — real but narrower than claimed; see T-1. It does hold on the shapes it names, and it correctly derives writer and reader from the rule instead of hardcoding, which is the right design.
2. **The three memory-content tests** — the `computeCanonHashes` tree-scope test is the strongest: it pins a real mechanism, uses the real repo, is deterministic, and its "not fail-first, guards future drift" record is honest. The tool-grant test is half-sound (T-2). The `MEMORY.md` link test is sound as link resolution; its filename-inclusion line over-fits past the stated risk (dropped medium). **On the surface question**: asserting over agent memory is defensible *only* where the assertion pins a mechanism or a cross-checkable fact — memory files are contractually rewritten by their owning agent, so any assertion pinning a phrase or a filename converts routine memory maintenance into a red suite. The `add` rows record no such tradeoff.
3. **The `none` decisions for the memory files** — all three honest. Each names a behavioural claim already pinned by a real test, and the diff confirms the edited sentences assert exactly those contracts. Given four false statements one iteration ago, "no test" is justified here only because these files' claims are anchored elsewhere; the `add`/`none` split lands in the right places.
4. **Entry-log integrity** — accurate. Rows 6 and 7 name commits consistent with the diff and the decisions log; the ranges overlap rather than gap, and the deviation is disclosed in-row.
5. **The three original AC-11 tests** — all still true and load-bearing, none vacuous.
6. **Determinism** — all 23 sprint tests read real repo files, temp dirs or pure functions; no clocks, network, ordering or randomness. Coupling to churning content exists but is not nondeterminism.
7. **Stub-resolution** verified, not accepted: every `TODO(sprint-` hit repo-wide is prose describing the marker format. **Manual verification** correctly `None`.

## Coverage

Validated compact ledger: [`testing.ledger.json`](./testing.ledger.json) against [`testing.manifest.json`](./testing.manifest.json), findings [`testing.findings.json`](./testing.findings.json). `validate-ledger` → `{"ok":true}`. 10/10 files, 14/14 rules, 5/5 sections.

## Verdict

CONCERNS: 2 (both high)

## Next action

Route T-1 and T-2 to impl review-fix. T-1 is primarily a record correction plus a widened scan; T-2 is a one-assertion reformulation. Neither changes sprint scope.

## Escalations

- **Canon/runtime grant mismatch** (flagged for correctness/providers ownership, not a testing finding): the test pins this reviewer's canonical grant as `["Read","Glob","Grep","AskUserQuestion"]`, but this dispatch actually received a file-writing tool and no user-question tool. That makes both the memory statement and its new test factually fragile, and it means the "request user decision for manual verification" authority in this role's contract is not exercisable as dispatched. No manual verification was needed this round, so nothing was blocked.
- **Memory not persisted this round, deliberately**: the file this reviewer would have updated is inside its own review scope and is pinned by a test. A reviewer must not mutate the artifact under review, so the learning is recorded here instead.
