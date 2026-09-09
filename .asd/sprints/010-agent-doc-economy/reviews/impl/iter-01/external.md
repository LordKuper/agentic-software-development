[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1 (attempt 2 — attempt 1 returned with its wrapped subprocess still running, `friction-log.md` F-3)
- **Severity floor**: low
- **Wrapped provider**: Codex CLI (preflight `local-ready`)
- **Ledger**: External Review is exempt from the coverage-ledger gate (`review-policy.md`) — it self-scopes.

## Kept findings

### EX-1 — critical — `.asd/sync.js:295`

The Claude-agent frontmatter emission passes `{ name: meta.name, effort: c.effort }` into `resolveModelFamily(manifest, 'claude', c.model, ...)`, but every branch reading that fourth argument is gated on `provider === 'codex'`, so for the claude call the object is never read. Dead data flow introduced by this change; matches the undroppable over-engineering item "dead code left in case we need it".

**Fix**: drop the fourth argument from the claude call, or, if diagnostics were intended for Claude too, add a Claude-side use of `agent.name`/`agent.effort` inside `resolveModelFamily`.

### EX-2 — high — `.asd/rules/artifact-layout.md:197`

The documentation-economy rule cuts a line when **any** of its three tests passes — removal, provenance, enforcement — but the `Never cut` list shields only exact-token contracts, completeness-bearing enumerations, case distinctions and non-obvious failure modes. It does not shield a general normative obligation: a gate, safety boundary, ownership rule, precondition or recovery duty stated only in prose. Such a line can pass the provenance test, because no recorded defect or friction entry cites it, or the enforcement test, because a tool grant already imposes the same boundary even though the prose is what a rule change would have to update — and so be cut, changing what a later rule-reader understands as required rather than optional.

**Fix**: make the removal test controlling, with the other two as supporting evidence rather than independently sufficient, and add to `Never cut`: normative text stating a gate, safety boundary, ownership assignment, precondition or recovery obligation that is not otherwise restated as an exact-token contract or enumeration.

### EX-3 — high — `.asd/workflows/asd-phase-impl.md:96`

Step 9's completion gate now requires reading the round's diff, committed plus uncommitted, before advancing, but the file's `## Operations used` block declares no `run command` operation for git — unlike `asd-phase-impl-review.md` and `asd-phase-impl-test.md`, which declare the equivalent explicitly. The orchestrator has no declared tool for the gate it is required to run. (Independently found as CR-1.)

**Fix**: add a `run command` line naming the git status/diff operation step 9 needs, following the sibling workflows' pattern.

### EX-4 — medium — `.asd/sync.js:296`

`if (c.effort)` guards emission with a truthiness check, so an explicit falsy value silently skips both emission and the vocabulary check instead of surfacing as invalid, letting canon and the generated view diverge without `sync.js` erroring. (Independently found as CR-2.)

**Fix**: guard with `c.effort !== undefined`.

### EX-5 — low — `.claude/agent-memory/asd-dev-critical/project_stale-context-snapshots.md:12`

The memory's cheap tell suggests running `git log --oneline -8`, but `asd-dev.md:63` limits an `asd-dev`'s run-command authority to `commands.yaml` entries plus `git add`/`git commit` for its own work. An agent following this memory literally would attempt a command its own tool policy forbids.

**Fix**: replace the suggestion with an in-policy check, or note explicitly that the git-log tell is illustrative and not to be run.

## Dropped findings

- Below severity floor (iteration 1, floor `low`): 0
- Nitpick, by category: none — all five were verified line-accurate against source and none matched an anti-nitpick category.

## Verification

Findings were checked against repo source rather than taken on the wrapped model's word: `.asd/sync.js:168-196,279-330` for EX-1 and EX-4, tracing the provider-gated branches; `artifact-layout.md:191-202` for EX-2; `asd-phase-impl.md` in full cross-checked against both sibling workflows for EX-3; the memory file and `asd-dev.md:63` for EX-5. No stalemate check this dispatch — iteration 1, no prior finding set.

## Verdict

CONCERNS: 5

## Next action

Route to `impl` review-fix mode. All five are autofixable without escalation — no design ambiguity, no user decision. EX-2 changes the rule this sprint landed and should be applied before any further economy pass runs under it.
