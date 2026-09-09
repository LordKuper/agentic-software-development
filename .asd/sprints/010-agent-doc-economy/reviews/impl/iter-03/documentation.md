[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review · **Iteration**: 3 · **Severity floor**: high
- **Manifest**: [documentation.manifest.json](./documentation.manifest.json) (digest `cf6a398c88…`)
- **Validated ledger**: [documentation.ledger.json](./documentation.ledger.json) — `validate-ledger` → `{"ok":true}`

## Findings

### DOC-1 — high — SSoT

**Location**: `.asd/workflows/asd-phase-impl-review.md:7`; `.asd/rules/review-policy.md:129`

Two declarations in the three declaration-bearing files are still false — the defect class this round was dispatched to close.

(a) The clean-worktree precondition declares its home the sole SSoT and not restated here, then restates that home's own trigger and timing: the home already states that the phase refuses to start while the worktree is dirty, measured at phase entry before any dispatch, and the workflow repeats the command literal, the non-empty trigger, "before any dispatch" and "at entry". The home delegates only the *mechanic*, which here is just the failure signal naming the dirty paths. This is exactly the shape the new test forbids at the latch bullets in the same file — the round fixed the bullets and left the precondition.

(b) `review-policy.md:129`'s "Sole statement of this claim" is falsified by in-surface text: both review workflows state that the reviewer itself performs no write, the impl-review workflow states that reviewers stay read-only, and out of surface a rule doc states it too, as does the completion-signal line in all five reviewer agents. An owning-side sole-statement claim asserts that the others only link, so surviving second statements make it the same self-declared trap.

**Suggested fix**: apply this round's own remedy — narrow the declaration, keep the acting-site text. Drop the denial at (a), keeping the sole-SSoT citation: the acting site must name the command it runs. Narrow (b) to what that site alone owns, so the rule doc's grant sentence and the acting sites' performance lines no longer contradict it. Do not delete the restated literals.

### DOC-2 — high — persistent actuality

**Location**: `.claude/agent-memory/asd-external-review/reference_scope-manifest-transport.md:19`, and standing at `:14`

Agent-facing memory contradicts canon at HEAD, paid on every dispatch of that agent. The paragraph added this round records approvingly, as the pattern to reuse, that the session's shell redirected the wrapped CLI's output straight to a file inside the sprint's review directory and deleted it afterwards. That agent's own definition forbids precisely this: no file writes at all, review text out through captured stdout, never write the prompt or scope manifest to disk, and no temp file or cleanup step since nothing is created. Same class as EX-5, already fixed once this sprint in another memory file, now re-entering through a new write. A standing instance in the same file claims the cache-path convention is documented nowhere in canon and is not gitignored — false at HEAD on both counts — and its recipe describes an operation canon assigns to phase orchestration rather than to this agent.

**Suggested fix**: owner-only. `asd-external-review` rewrites both passages on its next dispatch — cut the redirect-to-file endorsement, since stdin and stdout are the contract, and replace the cache-path passage with the canonical path plus a note that preflight and failure recording are the orchestrator's calls. No other agent may write that memory.

## Judged and cleared — so the next round does not re-litigate them

The latch-filter deviation in both workflows is correct: the home itself names those two steps as the acting sites, and each bullet adds phase bindings the home does not state. `review-policy.md:175` is true under the same reading — it restates neither the persisted map nor the read, only the DoD-relevant effect. Steps 7a and 8a are true against their home: trigger, partition, union property, merge rule and durable record are not restated, and the three branch reaches match the imported rule. The verdict-write steps state the availability-skip form and correctly stop denying that carve-out.

SSoT after the cuts holds: the nitpick enumeration has one home reachable by all five review agents through their role rows; the buried-verdict prohibition has no residue anywhere in canon or the generated views, with the positive MUST covering it; the advisor citation now resolves. Nothing this round changed a fact `README.md` or `AGENTS.md` states — the latch and red-suite claims still match their now-sole rule-level home, and both step-9 red branches still perform the clearing. Both edited agent bodies are present in both provider views with no residue of the cut text, so the views were regenerated, and the manifest carries entries for every changed path. Nothing on the iron rule's `Never cut` list, `audit.md` R-1 or the considered-and-cleared list was removed: the deleted nitpick copy was the drifted one, the enumeration home is intact and now pinned, and the three new tests carry no in-body comments.

## Verdict

CONCERNS: 2

## Next action

Route to `impl` review-fix mode. DOC-1 is canon text and goes to a dev; DOC-2 is `asd-external-review`'s own memory and can only be written by that agent.
