# Design Principles

Applied during sprint phases that shape design (design, design-review, design-promote) and verified against during impl-review. Some principles intentionally overlap with `core.md`, `artifact-layout.md`, and `review-policy.md` — duplication is preserved here to surface the design-time perspective explicitly.

## 1. Evidence over Speculation

Do not build systems before the user-facing need is validated. Prefer a vertical slice over horizontal scaffolding. A new system, layer, or module proposed in ADR requires concrete usage evidence: PRD scenario, measured pain, named consumer. Speculation ("we might need it later") does not qualify.

## 2. KISS — Simple Core

Simplest design that solves the validated problem. Three similar lines beat a premature abstraction. See also: `core.md` Simplicity Default + Complication Approval format — any complication needs user approval.

## 3. Separation of Concerns

Identify the natural layers of the system (presentation / domain / data / integration are typical). Each layer gets its own module with explicit contracts captured in the ADR. Cross-layer calls only through those contracts. No domain logic in UI. No persistence concerns in domain code. No business rules in transport adapters.

## 4. Loose Coupling / High Cohesion

A module groups things that change together (cohesion). Modules depend on each other through narrow contracts (coupling). Test: replacing one module must not require editing unrelated ones. The same change touching many unrelated places signals broken cohesion or leaked coupling.

## 5. Single Source of Truth

Each fact has exactly one home file or module. Other places link or import, never copy. Duplicated facts diverge and create wrong answers. See also: `artifact-layout.md` SSoT iron rule for documents; the same rule applies to code — one config source, one schema source, one constant source.

## 6. Fail Fast on Load

Validate content, data, and configuration at load time, not in runtime hot paths. Crash beats corrupt save. Crash beats silent fallback that masks broken state. Load-time errors surface during init; runtime errors leak as user-visible bugs that are far harder to diagnose.

## 7. Observability by Design

Every long-lived component ships from day one: structured logs (with context), metrics counters (rates and totals), traces (cross-component latency), a health or readiness endpoint, and inspectable state at runtime. Add at design time; retrofitting observability is harder and less complete.

## 8. Backward Compatibility

Persisted formats (DB schema, on-disk state, public API, wire protocol) are versioned. A breaking change requires: an ADR, a migration plan, and a version bump. Additive changes are preferred. A release must not invalidate existing user data or integrations without an explicit migration path. Gated by `config.backward_compat` policy (`strict` | `migration` | `none`).

## 9. Evolutionary Architecture

Defer commitment where the cost of reversal is high. Every ADR documents reversibility of the decision (easy / moderate / hard) and the trigger condition for re-evaluation. Architecture is grown, not poured.

## 10. Over-Engineering Smells

Apply the over-engineering checklist from `review-policy.md` PROACTIVELY during design, not only at review. Flag during ADR drafting:

- interface with exactly one implementer
- generic with exactly one concrete type parameter
- factory for fewer than three classes
- plugin system with no plugin
- abstraction with no second use case
- premature config flag (no caller chooses non-default)
- defensive code for impossible-by-contract case
- helper that wraps one stdlib call without added value
- inheritance depth ≥ 3 without polymorphic dispatch
- framework wrapping a framework
- mock of a mock in tests
- comment that restates code
- dead code left "in case we need it"

Each is `critical` and undroppable per `review-policy.md`.

## See also

- `core.md` (Simplicity Default, Complication Approval, QODDA)
- `artifact-layout.md` (SSoT iron rule, document responsibility)
- `review-policy.md` (over-engineering checklist, severity floor)
- `external-review.md` (Codex prompts encode several of these as checks)
