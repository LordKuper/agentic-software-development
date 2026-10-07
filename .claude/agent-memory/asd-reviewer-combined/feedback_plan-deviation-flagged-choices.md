---
name: plan-deviation-flagged-choices
description: before raising "impl deviates from plan decision D-N", grep the sprint decisions-log for "flagged choices accepted" — the orchestrator may already have accepted that deviation
metadata:
  type: feedback
---

An implementation that departs from a plan decision's text (a dropped clause, a moved record site) may already be an
orchestrator-accepted `Flagged choices:` item, logged in the sprint's decisions-log after the wave.

**Why:** raising an accepted deviation as a finding costs a fix round against an authorised choice.

**How to apply:**
- Before a plan-deviation finding, grep `<sprint>/decisions-log*.md` for "flagged choices accepted" and the Task id.
- If accepted, cite the log line in the review basis and raise nothing; raise only a defect the acceptance did not cover.
- Related: [[doc-economy-pinned-clauses]].
