[REVIEW-impl-testing]: CONCERNS

Manifest: [testing.manifest.json](./testing.manifest.json) · Patch: [testing.diff](./testing.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1 | low | `tests/run.js:5101-5103` (sprint-015 AC-8 assert); `test-plan.entry-01.md` row "per-sprint document skip (AC-8)" | The assert checks only the log line and that `config.yaml` is untouched. A replayed rewording that drops "the frozen `false` plus" from `sprint-lifecycle.md:129` stays green. The frozen `false` is what later phases read, so dropping it means the document still gets produced. | Also assert that the frozen `false` is stated, and add the risk to the entry row. |
| TST-2 | low | `tests/run.js:5016-5019`, `:5025` (AC-4/AC-5); `tests/run.js:3770` | The git that `runtime.js` spawns reads the host's global and system config (e.g. `diff.noprefix=true` breaks the `headers()` match), so the result is not deterministic. Also, the `:3770` message claims to be "the suite's only call to the `git` binary", which is false. | Add a flaky-pattern note. Isolate git config for those `runtimeCli` calls (`GIT_CONFIG_NOSYSTEM`, empty `GIT_CONFIG_GLOBAL`), or pin `--src-prefix/--dst-prefix` in `writePatch`. Rewrite the `:3770` message. |

## Checks passed

- 211 tests, matching the Suite run record.
- D-1 fail-first replayed: bound 25 is the first to fail under `+1`, and bound 25 is tight under `+2`.
- Mutation replays M1, M3, M6, M7, M2, M4b and M8 match the plan.
- The two adjusted tests keep their intent.
- The AC-5 namespace exclusion is backed by audit and plan.
- The custom rules pass.

Pointer, not a finding: `dispatchWaves` is an untested dead export (see Efficiency).

## Verdict
CONCERNS: 2

```json
{"manifest_digest":"26ca38e93337a1111c2f977cccc9192e3e7e8d487f08827924a476f52f1addf1","findings":["TST-1","TST-2"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.md","s":"checked"},{"i":".asd/sprints/015-glings-retro-003-review-scope/test-plan.entry-01.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-2"},{"i":"Coverage","s":"finding","f":"TST-1"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
