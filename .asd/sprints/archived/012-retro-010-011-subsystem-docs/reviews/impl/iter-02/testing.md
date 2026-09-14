[REVIEW-impl-testing]: APPROVE

# Review — impl-review / testing — iteration 2

- **Evidence**: [manifest](./testing.manifest.json) · ledger below

Severity floor: medium. I have no shell, so I built the iteration diff (`64024f8...HEAD`) by reading the 22 manifest files at the current HEAD and cross-checking them against `decisions-log.md` entry "impl review-fix for iter-01: findings resolved".

## Findings

None at or above the floor.

## What the review covered

**Test count and suite run**
- `tests/run.js` has 197 top-level `test(` declarations, which matches the 197/197 run recorded in `test-plan.md`.
- Entry 2 rewrote tests in place and added no new `test(`. Entry 3 changed no tests. So the count staying at 197 is consistent.

**Fail-first proof for the two tests that were red at `686b03e`**
- **`manifest-digest … never rewrites it`** (`tests/run.js:2461-2478`):
  - The old version was red at `686b03e` because EFF-1-1 removed `--write`. The new version needs its own proof, and M1 provides it.
  - One risk: `parseFlagArgs` (`.asd/runtime.js:380-392`) rejects a bare `--write` before `main` ever reads it, so the assert at `tests/run.js:2477` could pass without testing anything.
  - The mutation log says M1 fired the `EFF-1-1:` message. That can only happen if M1 also restored `write` as a boolean flag. So the assert does real work.
- **AC-13 step-order test** (`tests/run.js:4331-4371`):
  - M17 (the old workflow file) fires the order check at `tests/run.js:4357`.
  - That check fails closed: if `delegate to \`asd-dev\`` disappears, `indexOf` returns -1 and the comparison is false.
  - It only searches `sectionOf(impl, 'Workflow')`. That matters because the other mention of the `asd-init` dispatch, in "Operations used", comes earlier in the file.

**Replaying the recorded mutations**
I walked each test body top to bottom and checked which assert each mutation breaks first. All of these matched the recorded messages:
- **M7 / M8 / M8b / M9 / M10** (CLI test, `tests/run.js:4199-4251`): the earlier split, single and halved emits don't use the mutated paths, so they still pass. The `--custom-rules` asserts at 4227/4228 and the `manifest_digest` key check at 4251 fire as recorded.
- **M11–M16** (`tests/run.js:4136-4162`): M12 is caught at `core.html`, M13 at `.asd/rules/notes.html`, M14 at the design-review Markdown-only case, M15 at the HTML file in the last part, and M16 at the prose split parts.
- **M18–M21**: they fire at 4361, 4365, 4363, 4349 and 4440, and every earlier assert survives each one.

**Asserts dropped in entry 2**
Three asserts were removed from the `manifest-digest` test (row 22). No test was removed, so "Removed tests: None" is correct. All three reasons hold:
- **Per-field digest sweep:** redundant. `digest === fingerprint(manifest minus digest)` at 4215 already covers every field.
- **Round-trip check:** redundant. It ran the same function the check at 4208 runs.
- **Idempotence check:** redundant. A key that changes over time would break the exact field-set assert at 4209.

The stamping asserts now apply to every emitted manifest: split, unsplit and halved.

**CLI flags versus workflow invocations**
- Both review workflows run `emit-manifest --reviewer/--phase/--files/--out --custom-rules <a>,<b>`. impl-review adds `--scoped-fan-out`, and both add `--halve` on interruption.
- The CLI test now exercises every one of those flags, fixing the iter-01 gap.
- The flags still left undocumented anywhere are ones the parser rejects, not ones that silently do the wrong thing.

**Coverage (AC-1..AC-19)**
- Rows 22-44 still trace every AC.
- The entry-2 delta adds tests for ORC-1's `noHtml` predicate: granted in both phases, withheld by any `.html` (including framework HTML), carried by every split part, and decided over the whole scope.
- The COR-1-3 "validate before set" order has a check.

**Rows missing from the entry 2 scope (below the floor)**
- The Entry log names only 4 of the dev chain's 12 findings.
- The other 8 are EFF-2-1, DOC-1-1, DOC-1-2, DOC-2-4, COR-1-2, COR-2-3, COR-2-4 and external #2. They are wording, grant, return-contract or procedure changes, and existing rows already cover that kind of change:
  - row 44: `none`, audit-phase procedure the agent applies at runtime (the diagram-migration clause).
  - row 43: `none`, descriptive prose.
  - row 39: the AC-13 test, which pins the modes against the return contract.
- None of the 8 adds a literal that a workflow or the runtime parses.
- One stale assert message at `tests/run.js:3021` still names the removed `manifest-digest --write`. It is wording only.

**Edge cases**
- `SPLIT_THRESHOLD_FILES` at, one above and 2×+1 over the threshold; `--halve` on a 2-file and a 1-file scope (the 1-file case fails closed).
- Unknown file extensions count as executable.
- A renamed rubric entry that a standing predicate targets fails the emit closed.
- Two ledger blocks in returned text are rejected.
- An empty sweep fails its guard.

**Determinism**
The tests use temp directories and no timing, randomness or network. `mkTempDir` fixtures touch the filesystem, as the suite does throughout.

**Stub resolution**
`.asd/project/stubs.md` has no open rows, and `TODO(sprint-` appears nowhere in code (only in rule, agent and CHANGELOG prose). Nothing to reconcile.

**Manual verification**
`test-plan.md` has no manual spec, and none is needed: every check can be automated.

**Custom rules**
- **Sync ran:** I grepped three changed canon sentences:
  - the asd-init return-contract clause is in `.asd/`, `.claude/` and `.agents/`;
  - the architect's migrated-diagram grant is in `.asd/`, `.claude/` and `.codex/`;
  - the `t_plan.md` wave-1 line is a template with no generated view.
- **Hashes:** `canon_hashes` and `upstream_hashes` have identical hex for `asd-architect`, `asd-reviewer-correctness`, `asd-reviewer-efficiency`, `asd-init` and `asd-sprint`. I checked that structurally; I did not recompute the sha256 values.
- **No hand-edited generated views** were found.

## Verdict

APPROVE. No finding reaches the medium floor. Entry 2's tests are meaningful, the mutation record is consistent when replayed, and the dropped asserts have valid reasons.

## Next action

Testing reviewer done for iter-02. The orchestrator validates this ledger and writes `reviews/impl/iter-02/testing.md`.

## Escalations

None.

I wrote one agent-memory note, `D:\Projects\agentic-software-development\.claude\agent-memory\asd-reviewer-testing\feedback_removed-flag-vacuity.md`, and indexed it in `MEMORY.md`. Per `git-strategy.md` "Commit before review", it goes into the commit that carries this review file.

```json
{"manifest_digest": "da8ffca3b2b0738aba88fbbcf6c308ba4948e56e5445e1e4b884c58e4e0a1418", "findings": [], "files": [{"i": ".asd/agents/asd-architect.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-correctness.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-efficiency.md", "s": "checked"}, {"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/runtime.js", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/skills/asd-sprint/SKILL.md", "s": "checked"}, {"i": ".asd/templates/t_plan.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-audit.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-plan.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-tester-critical/project_testability-envelope.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "Rule-set conformance", "s": "pass"}, {"i": "Coverage", "s": "pass"}, {"i": "Edge cases", "s": "pass"}, {"i": "Stub-resolution verification", "s": "pass"}, {"i": "Manual verification (last resort)", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": []}
```
