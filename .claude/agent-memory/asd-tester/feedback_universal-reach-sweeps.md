---
name: universal-reach-sweeps
description: when a rule says every site of a kind does X, derive the sites from markers in the workflows and assert each one; a hand-picked site list hides the missed phase
metadata:
  type: feedback
---

For a rule of universal reach ("before every escalation of kind K, do X"), grep the workflows for the marker each site carries (`[GATE hard: <name>]`), split `## Steps` into top-level step blocks, and assert X appears in every block holding a K-class marker, with a sanity floor on sites and workflows found. Pinning only the phases the diff edited passes while a sibling phase (same gates, same shape) never got the clause.

**Why:** one phase workflow cited the consult at every analogous gate while its review twin cited it nowhere; a per-phase pin would have been green.

**How to apply:** also run the same marker scan before writing a "none" decision for a prose rule. For a migration test, the fixture repo needs a copy of `.asd/sync.js` (`makeMigrationFixtureRepo`), and derive the retired-name list from the migration's own constant.
