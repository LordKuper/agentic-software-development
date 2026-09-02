---
name: flag-gate-semantics-before-applying
description: When a user correction to approval gates lumps together gates of different kinds, split them and ask instead of applying literally — user validated this on sprint 003.
metadata:
  type: feedback
---

When a user's correction to the approval-gate set names gates collectively ("drop design-promote's three gates"), check whether the gates actually share the semantics the user's *reasoning* relies on. If they don't, split them into a table and ask — do not apply the instruction literally.

**Why:** On sprint 003 the user asked to drop design-promote's three gates, reasoning "the content was already accepted at draft time". That reasoning covered only the final-mutation gate. The decomposition and new-subsystem gates decide persistent-doc layout and C4-registry structure — content the user never saw at draft acceptance. Flagging this (with a narrow/middle/full option set) got the user to pick the middle option, which also swept in a fourth gate class I found while checking: the per-persistent-write gates duplicated inside `asd-ba`/`asd-architect`/`asd-ux-designer` in the design-promote workflow, which the user's phrasing had missed entirely. Literal application would have both over-shot and under-shot.

**How to apply:** Before restating any gate-table change, read the actual workflow file and enumerate every gate in the affected phase — the count in the user's phrasing is often wrong. Present a per-gate table with an explicit "does the user's stated reasoning cover this one?" column, then offer graded options (narrow / middle / full) with a recommendation. Related: [[approval-gate-without-askuserquestion]].
