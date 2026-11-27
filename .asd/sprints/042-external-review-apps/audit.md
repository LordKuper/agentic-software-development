# Audit

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/runtime.js`: named-profile external Codex invocation.
- `tests/runtime-routing.test.js`: route argument contract.
- `.asd/rules/external-review.md` and `README.md`: review routing documentation.

## Existing docs found
- `.asd/rules/external-review.md`: the wrapper passes named-profile route arguments unchanged.
- `README.md`: explains named-profile review and RouterAI setup.
- `docs/architecture/tech-reference/routerai-v1.md`: RouterAI endpoint and compatibility reference.
- `docs/architecture/tech-reference/codex-0.169.md`: Codex CLI configuration reference.
- `docs/architecture/tech-reference/claude-code-2.1.md`: Claude Code CLI reference.

## Existing implementation found
- `.asd/runtime.js` `codexProfileRoute` constructs the profile, provider, model, effort, approval, sandbox and ephemeral arguments.
- `tests/runtime-routing.test.js` checks the full argument list and default Claude route.

## Gaps
- The named-profile invocation does not override `features.apps`, so connected app definitions may substantially enlarge review requests.
- The existing argument assertion does not require apps to be disabled.

## Risks
- Config precedence: a profile or project could enable apps; mitigation: pass the override as a CLI config argument and test the exact list.
- Feature boundary: disabling apps does not disable every MCP tool or plugin; documentation must not promise that.
