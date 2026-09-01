---
name: asd-self-hosting-testing
description: How the ASD test-plan/suite-gate conventions work in this repo, which self-hosts the ASD framework itself
metadata:
  type: project
---

This repo (`D:\Projects\agentic-software-development`) IS the ASD framework's source, not a consumer project. `tests/run.js` (zero-dependency runner, no package.json/build) only covers `.asd/sync.js` and `.asd/skills/asd-update/update.js` engine behaviour — it has no fixture class for rules/templates/agents/skills *content* (e.g. no "no bare `design/`" grep-guard test). Prose/path rename sprints (e.g. sprint 001-rename-design-to-docs) are verified by repo-wide `git grep` sweeps run directly in impl and re-verified independently in impl-test, not by new `tests/run.js` fixtures — adding a content-grep unit test for a one-time rename was explicitly rejected as disproportionate new-infrastructure cost.

Suite gate here = three commands: `node tests/run.js` (test), `git diff main...HEAD --check` (lint), `node .asd/sync.js --check` (build). `sync.js --check` always exits 0 with `ok:true` even on drift — drift only shows as a per-item `status` string, so any assertion trusting bare `ok`/`items` shape is a vacuous-pass risk. This pattern recurred twice in sprint 001: iter-01 fix added a `status === 'current'` per-item assertion; iter-02 Quality review found *that* still passed vacuously if `buildSyncPlan()` silently dropped a whole canon directory from enumeration (shrinking `parsed.items` rather than marking anything stale) — fixed by independently enumerating `.asd/agents/*.md`/`.asd/skills/*/SKILL.md` from disk and asserting each expected target string appears in the plan before filtering for drift.

**How to apply**: when reviewing/extending drift-detection or "everything green" style assertions in this codebase, always ask "can this pass if the checked collection is empty or a subset?" — that's the exact defect class recurring in this repo's own test suite. When asked to verify such an assertion's own logic (not just its pass/fail), independently confirm the field names/string construction it relies on (e.g. `sync.js`'s `target` field at `.asd/sync.js:1229`) actually match what's asserted, rather than trusting a green run alone.
