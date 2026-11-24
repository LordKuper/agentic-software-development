# Design Principles

Apply in design, design-review and design-promote. Verify in impl-review.

## 1. Evidence over Speculation

Validate the user-facing need first. Prefer vertical slices. An ADR for a new system, layer or module cites concrete usage evidence such as a PRD scenario, measured pain or named consumer.

## 2. KISS — Simple Core

Choose the simplest design that meets the validated need. Classify and approve complications per `core.md` "Simplicity Default".

## 3. Separation of Concerns

Give each natural layer (presentation, domain, data, integration) its own module and explicit ADR contract. Route cross-layer calls through those contracts. Keep domain logic in the domain, persistence in data and transport in adapters.

## 4. Loose Coupling / High Cohesion

Group what changes together. Depend through narrow contracts so replacing a module leaves unrelated modules intact.

## 5. Single Source of Truth

Give each fact one home, including config, schemas and constants. Link or import it elsewhere (`artifact-layout.md` SSoT iron rule).

## 6. Fail Fast on Load

Validate content, data and config at load. Stop on invalid state before any save or silent fallback.

## 7. Observability by Design

Design every long-lived component to ship with structured contextual logs, metric counters, traces, a health/readiness endpoint and inspectable runtime state.

## 8. Backward Compatibility

Version persisted formats, public APIs and wire protocols. Prefer additive changes. Per `config.backward_compat` (`strict` | `migration` | `none`), require an ADR, migration plan and version bump for a breaking change. Provide a migration path for any affected user data and integrations.

## 9. Evolutionary Architecture

Defer costly-to-reverse commitments. Every ADR records reversibility (easy / moderate / hard) and a re-evaluation trigger.

## 10. Over-Engineering & Structure Smells

Apply both `review-policy.md` checklists (over-engineering, structure/cohesion) when drafting ADRs.

## 11. Research Current Best Practices

Verify current best practices via web search and fetch for every design decision. Cite sources. For unresolved alternatives, document each option's tradeoffs and the recommendation, then return `QUESTION` for the user's choice (`core.md` "Request user decision").

## See also

- `core.md` — Simplicity Default, Complication Approval, QODDA
- `artifact-layout.md` — SSoT iron rule, document responsibility
- `review-policy.md` — over-engineering checklist, structure/cohesion checklist, severity floor
- `external-review.md` — Codex prompts encode several of these as checks
