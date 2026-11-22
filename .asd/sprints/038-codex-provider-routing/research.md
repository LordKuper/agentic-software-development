---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

## Requirements

- Raw scope: Inventory Codex models, verify fit against OpenAI's Model selection guide, make Claude Design optional, and support a separate provider for external review when both the primary and review harness are Codex. RouterAI with `~anthropic/claude-opus-latest` is the reference configuration.
- Actors: ASD users who configure projects, the primary orchestrator, and the external reviewer.
- Functional requirements: Propose and agree on specific role/model changes where the guide warrants them. Require every supported project setting to be explicit at each `asd-sprint` invocation. When settings are missing, direct the user to `asd-init`; it must write every setting explicitly. Claude Design takes an explicit project choice.
- Constraints: Keep credentials outside tracked project config. The review provider is chosen independently of the primary Codex session. Treat all schema-defined settings as explicit, including empty or disabled values where valid.
- Success criteria: The inventory covers the main session, subagents, and wrapped review model. Both Claude Design and local HTML paths are selectable. Codex external review can use the example provider while primary work keeps its provider. Start and resume detect incomplete config, and `asd-init` completes it while retaining valid existing choices.

## Findings

- In ASD v14.9.0, `sol` resolves to `gpt-6.2-sol` and `luna` to `gpt-6-luna`. The generated Codex agents use Sol/high for dev, escalated dev, tester, advisor, and all three internal reviewers, Sol/medium for the external-review wrapper, Luna/high for mechanical dev and the test runner, and Luna/medium for the scout. The primary model comes from the Codex session. The current wrapper under Codex calls Claude CLI with Sonnet/xhigh. Sources: [release manifest](../../release-manifest.json), [wrapper](../../agents/asd-external-review.md), [README](../../../README.md).
- OpenAI recommends Sol for ordinary Codex work, Luna for scoped repeatable work, and Astra for complex engineering. The escalated developer tier currently uses the same model and effort as standard even when routing explicitly identifies difficult work. OpenAI's recommendations are starting points and distinguish API effort guidance from Codex client guidance. Sources: [Model selection](https://developers.openai.com/api/docs/guides/model-selection), [Codex models](https://learn.chatgpt.com/docs/models).
- Codex supports per-invocation profiles and custom Responses providers. RouterAI documents a Codex-compatible /responses endpoint and publishes the requested rolling model alias. The routing is supported in vendor docs. An authenticated end-to-end review remains to be verified. Sources: [Codex profiles and providers](https://learn.chatgpt.com/docs/config-file/config-advanced), [RouterAI Codex setup](https://routerai.ru/pages/vibe-coding-codex), [RouterAI Claude Opus alias](https://routerai.ru/models/~anthropic/claude-opus-latest).
- Claude Design supports canvas exports. ASD already defines a local HTML mockup path for hosts without the Artifact tool. The new setting can choose that existing path without changing the UX-spec or mockup deliverable. Sources: [Anthropic Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs), [ASD mockup rule](../../rules/design-system.md).
- Required properties and scalar type are distinct validations. Existing ASD init rules already use the shipped template to identify missing keys and validate sprint-mediated writes. A shared completeness check can use the template's settings and preserve the distinction between an omitted value and an explicitly allowed empty string. Sources: [Required Properties](https://json-schema.org/understanding-json-schema/reference/object#required), [ASD init](../../skills/asd-init/SKILL.md).

## Approaches

- **Codex review profile:** ASD selects a named local Codex profile only for the separate review process. The profile owns the provider, model, and credential lookup. This reuses normal Codex setup and keeps project config concise. Each reviewer machine needs the named profile.
- **Provider settings in ASD:** ASD config names the review endpoint, model, and credential reference and passes them to Codex at review time. More of the route is visible in the project, with added validation, auth variants, and responsibility for those settings.
- Both approaches check every setting at sprint entry, have init complete the config, and add an explicit Claude Design choice.
- Recommended: Codex review profile. Codex already owns provider configuration and supports selecting it for a single process.
- Chosen: Codex review profile, approved by the user. See Model selection for the user's Codex role assignments.

## Model comparison

Codex as the primary harness, checked 2026-11-21. The mappings below apply OpenAI's recommendations to ASD role scopes. They are not measured cost or quality results for ASD. Sources: [OpenAI Model selection](https://developers.openai.com/api/docs/guides/model-selection), [Codex models](https://learn.chatgpt.com/docs/models), [Codex credit rates](https://learn.chatgpt.com/docs/pricing#token-rates).

| Role | Current | OpenAI guidance applied to the role | Proposed ASD baseline |
| --- | --- | --- | --- |
| Orchestrator | Session selection | Sol for everyday multiturn work, Astra/medium for complex projects | Recommend Sol/medium and Astra/medium for complex sprints in the README |
| `asd-dev` | Sol/high | Sol/medium for routine engineering, higher effort for multistep work | Keep Sol/high. This standard tier also handles authentication, public contracts and other change risks. |
| `asd-dev-escalated` | Sol/high | Astra/medium for demanding engineering | Astra/medium. Increase effort for particularly hard cases if needed. |
| `asd-dev-mechanical` | Luna/high | Luna for bounded changes. The selection guide gives low effort for tiny edits, and the Codex model docs start Luna at high. | Keep Luna/high initially. Compare medium on verified mechanical work before lowering it. |
| `asd-tester` | Sol/high | Sol for test writing and multistep analysis | Keep Sol/high for design of test coverage and failure diagnosis. |
| `asd-tester-runner` | Luna/high | Luna for repeatable execution and narrow reporting | Keep Luna/high initially. Compare medium first here if further effort savings are needed. |
| `asd-scout` | Luna/medium | Luna for focused retrieval and summarization | Keep Luna/medium for path-cited scans. |
| `asd-advisor` | Sol/high | Sol for ordinary analysis, Astra for complex trade-offs | Keep Sol/high for bounded advice. |
| `asd-reviewer-quality` | Sol/high | Sol for engineering, Astra for demanding cases | Keep Sol/high for correctness, security and test coverage. |
| `asd-reviewer-efficiency` | Sol/high | Sol for code analysis, Astra for demanding cases | Keep Sol/high for complexity, reuse and performance. |
| `asd-reviewer-combined` | Sol/high | Sol for multistep engineering analysis, Astra for demanding cases | Keep Sol/high for joint quality and efficiency review. |
| `asd-external-review` wrapper | Sol/medium | Sol/medium for coordinating tools and interpreting results | Keep Sol/medium. |
| Wrapped reviewer | Claude Sonnet/xhigh | OpenAI guidance does not compare Claude models | Named external Codex profile controls the model. RouterAI Opus is the reference configuration. |

Terra suits tasks driven by screenshots and visual computer use. ASD has no dedicated Codex delegate for that workload. Codex Standard Astra costs 4× Sol per token. Luna costs 1/20 of Sol for uncached input and output and 1/10 for cached input. RouterAI bills independently. The initial Astra/high recommendation is refined to Astra/medium as the starting point for escalated tasks.

## Model selection

The user selected these assignments for the Codex harness on 2026-11-21.

| Role | Selected model and effort |
| --- | --- |
| `asd-dev-escalated` | GPT-6.2 Sol / `xhigh` |
| `asd-tester` | GPT-6.2 Sol / `medium` |
| `asd-tester-runner` | GPT-6 Luna / `medium` |
| `asd-advisor` | GPT-6.2 Astra / `medium` |
| `asd-external-review` wrapper | GPT-6 Luna / `high` |
| External reviewer through the RouterAI example profile | `~anthropic/claude-opus-latest` / `medium` |

For validation, distinguish the wrapper's handling of findings from the external model's review quality. Preserve material findings through severity mapping and verdict formation. Compare complex tester work separately from executing a named suite. RouterAI's catalog advertises reasoning for the rolling Opus alias, which currently resolves to Opus 5.5. The authenticated Codex Responses run with this profile remains to be verified. Sources: [RouterAI catalog](https://routerai.ru/api/v1/models), [RouterAI model alias](https://routerai.ru/models/~anthropic/claude-opus-latest), [Claude effort](https://platform.claude.com/docs/en/build-with-claude/effort).
