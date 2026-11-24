# Test plan — sprint 039-figma-codex-prompts, entry 2

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1, AC-1/AC-5, `asd-init` prose and generated views | Standalone skills exceed the byte cap or the shorter instructions change mockup format selection or repair | Existing standalone skill cap, config validation, provider sync and release hash contracts, plus a trace of each changed instruction | none | The cap test exposed D-1 on entry 1. The revised prose retains prior-effective and template defaults, the Claude Design proposal when both keys are absent, explicit-key precedence, legacy mapping, validation of both keys and the repair sequence. Existing tests cover the executable validation and artifact integrity. |

## Removed tests

No removals. The affected existing checks cover separate contracts.

## Added tests

No additions. The existing standalone skill cap test already reproduces D-1.
