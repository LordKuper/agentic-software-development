# Memory index

- [ASD self-hosting test-plan conventions](project_asd-self-hosting-testing.md) — this repo IS the ASD framework; `tests/run.js` covers Node sources plus content contracts (rules, templates, skills, workflows, README, agent memory); sweep exemption shape.
- [Universal-reach sweeps](feedback_universal-reach-sweeps.md) — derive every site of an "every X does Y" rule from gate markers; migration fixtures need sync.js.
- [Observe spawned argv, short fixture paths](feedback_observe-spawned-argv-and-short-fixture-paths.md) — spy on spawnSync via --require to test host-only limits; irregular chunk fixtures; keep paths short on Windows.
- [Canned gh and fake-clock preload](feedback_canned-gh-and-fake-clock-preload.md) — test gh-polling CLIs via a --require stub (spawnSync + Date.now + timers); includes-pins can pass vacuously.
- [Edit tool for regex, mutation script](feedback_edit-tool-for-regex-and-mutation-script.md) — Bash tool halves backslashes in scripts; prove fail-first with a restoring mutation script.
- [Review-found sweep gaps](feedback_review-found-sweep-gaps.md) — extend the leftover-term array with base-branch clauses a review found; skip the sprint's own intermediate wording.
- [Fail-first via pre-fix tree](feedback_failfirst-pre-fix-tree.md) — prove a committed fix red by running the new runner in a git-archive of the pre-fix commit; tar needs cd, not -C C:.
