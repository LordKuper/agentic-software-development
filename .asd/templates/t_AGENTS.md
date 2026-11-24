### Required reading

- Every agent reads `.asd/rules/core.md`, `.asd/project/custom-common-rules.md` and `.asd/rules/language-policy.md` before any workflow action.
- Read `.asd/project/custom-design-rules.md` in design/design-review and `.asd/project/custom-coding-rules.md` in impl/impl-test/impl-review.

### Entry points

- Initialize or edit settings with `/asd-init` (Claude Code) or `$asd-init` (Codex).
- Start or resume a sprint with `/asd-sprint` (Claude Code) or `$asd-sprint` (Codex). All project work goes through a sprint. A new sprint waits for archival, except that its scope archives a merged sprint.

Host conventions and skill discovery are in `.asd/rules/providers.md`.

### Configuration

Settings are in `.asd/project/config.yaml`. For routing, paths and review, see `.asd/runtime.js`, `.asd/rules/artifact-layout.md` and `.asd/rules/external-review.md`.

### Hard rules

Follow `.asd/rules/core.md` "Invariants" for infrastructure write boundaries and authorized settings writes.
