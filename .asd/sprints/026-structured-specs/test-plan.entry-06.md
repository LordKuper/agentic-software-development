# Test plan entry 06 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 6; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Task 9 `runtime.js` `markdownSection`/`contextRefs`/`contextBundle` cores, `section`/`context` CLI (b800e8c5 delta) | wrong section slice (fence, CRLF, prefix, duplicate heading), grant resolution (tier variant, `*`, dedupe), a partial bundle written for an unresolved ref | existing §27 tests | none | Task 13 (4d76b073) pins each: `markdownSection` cases and fails, `contextRefs` variant/`*`/first-occurrence, `contextBundle` ref comment and unresolved-ref failure, CLI no-file-on-failure and variant-equals-base, and a sweep resolving every role-phase pair of the real grant table. Not re-authored |
| `section` CLI (`sectionCommand`) and the malformed-grant-table errors (`!= 1` json blocks, bad row shape) | a flag typo or a shape error surfaces as a different message | none | none | `sectionCommand` is a two-flag wrapper over the tested `markdownSection`; the real table is parsed by the sweep, so a malformed table fails there; an error-message-only mutation is a hypothetical risk (`code-style.md` §17) |
| Skills' context build, `###` headings, Tasks 10-12 workflow/agent/core.md prose, README | prose drift; role/phase names unresolved | existing checks | none | D14 empty `ops`/`User decisions` shape asserts, AC-15 byte caps and AC-16 D13 load test (fail-first recorded in Task 13) cover; no `## User decisions` remains in a skill |
| Regenerated views, manifest hashes | Mirror drift | build check | none | `node .asd/sync.js --check` and the hash pins cover |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 6 delta removes no test; no test fails the hypothetical-risk criterion | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| none | no new test this entry (see Risk → check decisions); Task 13's §27 tests are the delta's coverage | n/a |
