---
name: asd-demo
description: "Someone hand-edited this generated agent file directly, without keeping the ASD ownership marker on line 1."
tools: [Read]
model: opus
---

# Role

This file simulates a target that a human modified out-of-band: no
`<!-- ASD generated... -->` marker line, so sync.js must classify it as
modified-foreign and refuse to overwrite it silently.
