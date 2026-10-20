[REVIEW-impl-external]: CONCERNS

External review (codex), sprint 026, impl-review wave 2, iteration 1, floor `low`.

## Kept findings

| ID | Severity (ASD) | Codex id / source | Location | Finding | Fix |
|---|---|---|---|---|---|
| E1 | high | F1 / codex major | `.asd/agents/asd-dev.md:25` | `decisions` and `contracts` sit in the unconditional `required` list, but `sprint-lifecycle.md` "Input sources" (lines 166-167) resolves them only when a relevant ADR exists or the contract is present. A valid sprint with neither falls into the dev "required design doc missing" ABORT path (line 58). Codex says the review agents have similar required-versus-conditional conflicts; only the dev file and the lifecycle table were checked. | Mark the conditional keys optional in the agent input declarations, as the resolver defines them, and align the missing-input checks. |
| E2 | high | F2 / codex major | `.asd/agents/asd-ux.md:21`, `:51` | `payload.inputs.requirements` and the existing UX baselines are unconditional `required`, and line 51 makes unreadable requirements an ABORT. The standalone `asd-design-system` flow can run before any sprint and its SKILL.md has no `requirements` or `inputs` references. Codex says BA and Architect have the same standalone-versus-sprint mismatch (unchecked). | Declare a standalone design-system mode with its real inputs; limit the requirements precondition to sprint dispatches. |
| E3 | medium | F3 / codex minor | `.asd/agents/asd-ux.md:51` | The precondition mandates "line 1 `FAILED — design-system absent; dispatch /asd-design-system`", but `agent-protocol.md` line 42 defines `FAILED` as the token plus `{"cause","fix","committed":[]}`; a dispatch cannot satisfy both exactly. | Return `FAILED` on line 1; put the diagnostic and the `/asd-design-system` recovery instruction in `cause` and `fix`. |

## Dropped findings

- Below floor: 0
- Nitpick: wording 0, style 0, naming 0, speculative 0

## Verdict

CONCERNS. 3 findings kept: 2 high, 1 medium. No stalemate (iteration 1).

## Next action

Fix E1 to E3 in `.asd/agents/` canon; orchestrator syncs, then iteration 2 (floor medium).
