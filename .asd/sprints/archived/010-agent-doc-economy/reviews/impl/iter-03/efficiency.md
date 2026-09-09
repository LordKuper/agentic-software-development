[REVIEW-impl-efficiency]: APPROVE

# Review — efficiency

- **Phase**: impl-review · **Iteration**: 3 · **Severity floor**: high
- **Manifest**: [efficiency.manifest.json](./efficiency.manifest.json) (digest `ab799303f0…`)
- **Validated ledger**: [efficiency.ledger.json](./efficiency.ledger.json) — `validate-ledger` → `{"ok":true}`

## Findings

None at or above the high floor.

## Judgements

**Dropping the denial rather than the restatement at the two latch-filter bullets was the correct call.** Both now cite the home as sole SSoT and then spell out what the orchestrator does. That text is not rationale — it is the only instruction at the site that performs the skip, and the orchestrator reads the workflow, not the rule doc. A pointer-only bullet would have made the step unexecutable without a second file load, moving cost rather than removing it. The removal test therefore fails for the text, and the denial was the false half. Both sites kept the pointer, which is what a later SSoT finding needs as its premise. Correct direction, applied per site rather than uniformly — the distinction my iteration-2 finding left open.

**The tester's merge did address the mechanism I named.** That mechanism was ordinal keying, where appending is cheaper than merging; the file now states the keying rule itself, and its body is sixteen topic headings with no ordinals left. The byte delta was never the finding. The declined remainder is genuinely preserve-listed — nearly every paragraph is a non-obvious failure mode stated with its symptom — and the tester is right that a byte target is the same defect class as a coverage quota. Not re-raised.

**All three new tests earn their place.** The nitpick test derives the instructed set rather than listing it, checks that each agent's role-row grant actually reaches the only enumeration, then sweeps canon for the surviving token with its scope stated in its own message. The advisor citation test derives the holder section from the agent file, so it reddens only when the rule moves without its citation — the cheapest of the three. The declaration-pair test has the right shape: asserting the restatement survives and the denial is absent, so the positive half stops the negative going vacuous. One assertion inside it keys on a topic phrase rather than the removed instruction phrase and would redden on an unrelated correct edit — below floor and not raised, but noted, because the repo's own tester memory documents exactly that class.

**No third half-collapsed declaration in the change surface.** Every denial reachable in the scoped files was checked against its own line, and each holds.

**The memory tree's two new files earn their cost** — each is one rule plus provenance plus application, both traceable to a recorded iteration-2 event, both changing what the reading agent does, both indexed. Checked and dropped below floor: one existing external-review memory file is still keyed by sprint ordinal and grew a paragraph restating two of its own; each paragraph carries one genuinely new instruction, so the fix is a fold by topic rather than a cut, and raising it while accepting the tester's declined remainder would be inconsistent.

## Verdict

APPROVE

## Next action

Reviewer done. If a later round opens that external-review memory file for any other reason, fold its quota paragraphs into one topic heading while it is open — cheap then, not worth a round of its own now.

## Escalations

Cross-reviewer guard: the write-scope restatements retained in `asd-external-review.md` are correctly retained — that agent holds `Bash`, so the prohibition is not config-enforced and the recorded partial-application reason stands. A reviewer proposing to cut them would be removing a live safety boundary, not duplication.
