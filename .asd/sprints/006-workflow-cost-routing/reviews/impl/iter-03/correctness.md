[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor**: high
- **Scope**: incremental, 22 paths (`60a991a…08ea5d1`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F1 | high | `.asd/rules/external-review.md:46` (+`:56`); `.asd/agents/asd-external-review.md:47`, `:105`; `t_prompt-external-impl.md:20` vs `:22-31`; `t_prompt-external-design.md:20` vs `:23-27` | The new `exclude_paths[]` semantics contradict the "project context" contract in the same files, and the contradiction covers **every** reference path in both self-hosting and consumer mode. `external-review.md:46` defines `exclude_paths[]` as paths "never read even if reachable another way", and `asd-external-review.md:47`/`:105` add "never a path outside `files[]`". But `external-review.md:56` and both prompts hand the reviewer reference material *as paths to read*: impl-review passes `{{PRD_PATH}}`, `{{ADR_PATH}}`, `{{STACK_PATH}}`, `{{CUSTOM_RULES_PATH}}`, `{{COMMANDS_PATH}}` — in consumer mode all of these sit under `docs/**` or `.asd/**`, exactly that row's `exclude_paths`; under `self_hosting: enabled` the AC list is `.asd/sprints/<sprint>/sprint.md` and the rules file is `.asd/project/custom-coding-rules.md`, both inside `.asd/sprints/**`/`.asd/project/**`. Result: the entire "project context" block is inert under the literal rule, and the external impl reviewer cannot read the AC list at all — its own rubric item "requirements without coverage (cross-ref PRD acceptance criteria)" becomes unexecutable, in both modes. The design prompt hits the weaker half of the same defect. | Separate "out of review scope" from "unreadable". In `external-review.md` "Phase-scoped payload" (the SSoT), define `exclude_paths[]` as constraining `files[]` scope and finding locations — not as a blanket read prohibition — and state explicitly that the prompt's named project-context reference paths are always readable and are never valid finding locations. Then align the dependents: `asd-external-review.md:47`/`:105` become "never a path outside `files[]` **or the prompt's named project-context paths**", with the same carve-out in both prompt Inputs bullets. If a hard read boundary is genuinely wanted instead, carry the reference paths in an explicit `reference_paths[]` manifest field and populate it from the rule doc's consumer/self-hosting row. |

## Sub-floor residual notes (medium — recorded, not findings, per the iteration-3 floor)

- `.asd/skills/asd-update/SKILL.md:14` and `.asd/skills/asd-init/SKILL.md:23` (plus four generated views) still point at `sync.js`'s `isSelfHostingRepo`, deleted this iteration. No runtime break — `update.js` never called it and the primary instruction still stands — but the fail-closed parsing semantics those skills leaned on now have no named implementation.
- `.asd/migrations/5.0.0.js:60` depends on `sync.removeIfEmptyDir` with no local fallback (unlike `4.0.0.js`). Migrations run after managed-path replacement, so the export normally exists; the narrow exposed case is a consumer whose `.asd/sync.js` was a skipped *conflict* and predates 4.0.0. Fails loud through stop-on-first-failure, so no corruption.
- `.asd/rules/providers.md:101` states variant suffixes are `mechanical` or `critical`, while `sync.js:962` still accepts `standard`. Permissive validator vs narrowed doc.
- `decisions-log.md:194` records that `base_ref`/`head_ref` were scoped to impl-review to avoid "two empty fields carried for symmetry alone", but the shipped design-review path does carry two empty strings. The implementation is internally consistent and test-pinned; only the decision text disagrees.

Dropped as nitpick/low: the impl prompt says the manifest is "below" when it renders above; `asd-external-review.md:15` still says "files/commits" after `commits[]` was removed.

## Checks that passed (notable, given what this wave touched)

- **`SEC-2` / `buildInvocation`**: the D-2 property holds. The direct path returns the command as a literal argv element with `shell: false`, never a command string. The PowerShell path uses a fixed `-Command` script and passes command/args only as a JSON stdin payload, invoking through a variable, so metacharacters can never be parsed as syntax.
- **Behaviour preservation across the extraction**: win32 `.cmd/.bat/.ps1` still goes straight to the PowerShell shape with no null-deref path; non-win32 always stays direct; the `ENOENT` retry still fires only on win32 and only for that error code, so timeouts and non-zero exits do not retry. `runLocal` returning `{ ok }` keeps command and auth stdout out of memory and out of the cache — `SEC-1` clean.
- `renderFullFileItem` using `item.source` unconditionally is safe: every `full-file` item sets `source`, and the dropped `parse:` field has no remaining reader.
- `5.0.0.js`'s delete path stays guarded in the right order: existence → realpath containment → ownership marker → content-digest intactness.
- The `AGENTS.md` dedup is coherent end-to-end: the managed block matches `t_AGENTS.md` byte-for-byte, repo prose lives below the end marker, `providers.md:9` is the stated home, and no stale self-hosting carve-out remains in `sync.js`.
- The `standard`→base mapping agrees at both dispatch sites, in `providers.md`, `README.md`, `CHANGELOG.md` and in canon; no `asd-dev-standard` view lingers as an orphan.
- `asd-tester`'s git authority matches `git-strategy.md` and the impl-review workflow; the canonical cache path is named once and gitignored.
- **AC-3**: all 22 changed paths fall inside the self-hosting write allowlist and trace to plan Tasks 2/3/4/6 or to recorded iter-02 findings.

## Coverage

Manifest: [`correctness.manifest.json`](correctness.manifest.json) (digest `7e201989…c7df2a`). Validated ledger: [`correctness.ledger.json`](correctness.ledger.json). `validate-ledger` → `{"ok":true}`. `UI_CONFORMANCE` and `UI-1`..`UI-7` are `n/a: no-ui-surface-in-scope`.

## Verdict
CONCERNS: 1

## Next action
Route F1 to impl review-fix mode: a contract fix across `external-review.md` (SSoT), `asd-external-review.md` and the two prompt templates. No code change in `runtime.js`/`sync.js` is implied. Worth pairing with an assertion that no prompt-supplied project-context path is described as unreadable, since the manifest key-set test would not catch this class.

## Escalations
None. F1 is a coherence fix inside already-approved scope — no contract break, no new abstraction, no scope expansion.
