---
name: seed-time-key-sets
description: A seeded allowlist or ceiling file keyed by the files present at seed time misses lazily created files; check every lazy file the AC names against when the seed runs
metadata:
  type: feedback
---

When a command seeds a key set (ceilings, hashes, baselines) from the files that exist at seed time, and the checker only checks keys in that file, a file created later is never checked. Compare the AC's member list with each member's creation point (`artifact-layout.md` "lazy" entries, `asd-init` "seeds none") and with every site that re-seeds.

**Why:** a reviewer reading the seed and check functions in isolation sees both correct; the gap only shows when the seed's call site (init) predates the file's creation site (a later phase).

**How to apply:** for each "lazy" path an AC names, grep for the seed call sites and ask whether any runs after the file appears, or whether the checker flags a present file with no key. Related: [[feedback_predicates-vs-appended-files]].
