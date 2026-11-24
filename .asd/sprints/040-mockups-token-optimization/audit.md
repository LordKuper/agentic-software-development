---
responsibility:
  owns: sprint evidence, gaps, risks and file verdicts
  delegates_to: sprint.md (acceptance), plan.md (tasks)
---

# Audit

## Scope reference

[Sprint 040](./sprint.md) · [Codex baseline and measurement limits](./token-baseline.md)

## Touched areas

- Mockup mode, compatibility and authoring/promotion in both workflows.
- Config validation, update and init handoff.
- Phase/role context, phase bodies, skills, templates, generated views and contract tests. See [tracked inventory](./context-priority.csv).

## Existing docs found

- [README](../../../README.md) mirrors config and runtime behavior.
- [Design system](../../rules/design-system.md), [lifecycle](../../rules/sprint-lifecycle.md) and [artifact layout](../../rules/artifact-layout.md) define mockups, phase prerequisites and artifact ownership.
- [Provider mapping](../../rules/providers.md) defines phase and role grants. [Figma reference](../../../docs/architecture/tech-reference/figma-mcp-remote.md) describes the existing publication path.

## Existing implementation found

- `t_config.yaml` exposes three formats. `runtime.js` and `asd-init` recognize the legacy `project.claude_design` key. Lite scope, Standard design and promotion tie mockups to the UX-spec flag. `t_ux-spec.html` already links to mockups. Searches for inline/embedded mockup references, `iframe` and `srcdoc` found no canonical authoring option in rules, workflows, templates or README.
- `asd-sprint` checks config completeness before entry. `asd-update` points to that check after a real run. `asd-init` already has a path for proposing values for missing keys.
- `runtime.js context` assembles concrete entries from provider grants. `context-check` validates existing per-bundle and per-file ceilings. `tests/contract-workflows.test.js` enforces a 62,351-byte aggregate standalone-skill cap. `tests/runtime-routing.test.js` already exercises config completeness and legacy format resolution.
- Baseline `context-check` and the two impacted test areas passed, 46/46 tests.

## Gaps

- Resolve the legacy document and format settings before rewriting them. The new independent mockup mode needs explicit authoring, review and promotion coverage where the UX spec is disabled, including the Standard design-collapse predicate.
- Move the completeness prompt to the real update completion path using the resulting schema. Check re-entry and partial update behavior while preserving existing user-owned settings.
- Current phase-context samples cover 10 Lite and 12 Standard phases. Historical data covers all 24 timed visits in Lite 039, including its design-promote no-op and repeated implementation/test/review phases. No comparable end-to-end Standard trace was available in the archive.
- Add the existing aggregate standalone-skill cap to early context validation without a second independent limit.

## Implementation constraints

**Дополнение AC-8.** Советник рекомендует сократить повторную загрузку общих правил и выдавать подробности при соответствующей ветке. Кандидаты: `providers.md` — сужение выдачи по фазам, `core.md` — уплотнение общих правил, `agent-protocol.md` и `checkpoints.md` — короткий обычный путь с точечным чтением исключений, `artifact-layout.md` — выбор применимой схемы, `sprint-lifecycle.md` и крупные описания фаз — устранение повторов и адресуемые процедуры. Для AC-8 нужно снять ещё 87 114 входных токенов в Lite и 103 126 в Standard. Экономию засчитывать после замера. Обязательное чтение при запуске учитывается по прежней границе, изменение способа доставки само по себе не считается экономией.

- The previous effective UX flag is true when `documents` is absent. A present group with the UX flag disabled or absent suppresses mockups. An explicit current format takes precedence over the legacy boolean. Read both facts before migrating, preserve unrelated keys and comments, and make the migration idempotent. Existing states and archived documents need compatibility when the new snapshot field is absent.
- An enabled mockup mode needs a lifecycle path even if every optional document is disabled. Scope should freeze the effective mode after scope refinement. Standard must then route through authoring, review and promotion for a mockup-only UI sprint. Lite authors at scope and promotes independently of UX-spec. A non-UI sprint keeps its skip behavior. Local or remote links from an enabled UX spec can remain links.
- For AC-2, reuse `config-check` and the current value-resolution rules in `asd-init`. Run on the installed schema after the real update and migration path, in both update modes. Keep preview and version-only checks read-only. Missing values go through an explicit offer, with consumer-owned writes mediated by `asd-init`.
- For AC-6, derive the check and contract test from one named 62,351-byte bound, with the same LF-normalized canonical standalone-skill file set. Test exact cap, overflow and exclusion of phase shims.

## Risks

- A context grant change can remove a required rule from a phase or role. Validate reference resolution, grant coverage and recovery paths before and after.
- Historical consumption includes task work and cache reuse. Compare controlled probes independently. Keep byte-based per-file attribution separate from observed Codex tokens.
- The file inventory includes generated views and immutable archives. Follow ownership and regeneration contracts when a canonical file is approved for change.

## Вердикты советника по файлам

### `.asd/rules/sprint-lifecycle.md`

**Вердикт — сохранить и сократить.** Файл на первом месте по суммарному объёму загрузки в контекст: 1 056 749 байт.

1. Оставить в `State recovery` короткое описание того, кто ведёт состояние спринта и когда восстанавливается учёт времени. Правила восстановления работы исполнителей и ревью разнести по соответствующим фазам. Сейчас общий контекст получает весь раздел объёмом 7 625 байт после нормализации.
2. Сохранить `Phase table` как справочник. Убрать её из общего контекста после проверки, что `asd-sprint` может обратиться к ней при необходимости. Оценка экономии — 2 917 байт на каждый контекст, которому таблица не нужна.
3. Отделить чек-лист автора плана от синтаксиса задач и общих критериев завершения. В контекст реализации и исполнителей включать только нужные им правила. Сейчас весь раздел `Plan file format` занимает 9 676 байт после нормализации.

Сохранить правила зафиксированного процесса и согласований, обработку вердиктов старого формата, блокировку при отсутствии вердикта обязательного ревьюера, точный формат записей для восстановления запусков и синтаксис задач. Вынести правила в разделы одного уровня или ссылаться на нужные подразделы напрямую: ссылка на родительский раздел загружает также его подразделы. Проверить собранный контекст и контрактные тесты. Связанные правки в `providers.md`, описаниях фаз и тестах требуют отдельных утверждений.

**Решение пользователя — утверждены все три предложения по этому файлу.**

**Проверка перед реализацией.** Правила восстановления и чтения вердиктов нужны также в `design-review` (шаг 9), даже если текущий Lite-спринт эту фазу пропускает. При сужении контекста проверить отдельно Standard, `impl-review` и `pr`, а также контракт `tests/runtime-tools.test.js`, который читает точные формулировки из `State recovery`.

### `.asd/rules/artifact-layout.md`

**Вердикт — сохранить и сократить.** Оркестратор использует файл как справочник путей и журналов, исполнители сверяют с ним права записи, ревьюеры — требования к артефактам. Файл второй по расчётному объёму загрузки: 563 048 байт на 391 вхождение.

1. Уплотнить карту путей. В разделе для отключённой декомпозиции убрать два повторяющихся пути из `.asd/project/` и оставить отличия в `docs/`. В обеих схемах сократить пояснения, уже данные в профильных разделах. Сохранить заголовки, перечень допустимых файлов спринта, исключение для свидетельств покрытия и прежний путь чтения рецензий.
2. Сократить пояснения к HTML-оболочке. Убрать пересказ таблицы перед ней и повторные пояснения о различии между документом ADR и отдельным решением. Сохранить значения подстановок, правила статуса, оглавления и Mermaid, исключение для `t_design-system.html`. Тест `tests/contract-templates.test.js` извлекает порог оглавления из строки `{{TOC_NAV}}`, поэтому сохранить её машиночитаемую форму.
3. Сжать обоснования в разделе памяти агентов. Убрать объяснение стоимости повторной загрузки ошибочной строки и перечень обратных ссылок. Сохранить права на запись, общую память параллельных запусков одного и того же агента, включение изменений памяти в ревью и проверку удалённых терминов по точному тексту изменений.

Сравнить объём затронутых разделов при прежних настройках загрузки, проверить ссылки на заголовки и запустить контрактные тесты. Экономию токенов проверить отдельно на тех же сценариях Lite и Standard в Codex. Изменение состава загружаемых разделов в `providers.md` требует отдельного утверждения.

**Решение пользователя — утверждены все три предложения по этому файлу.**

**Проверка перед реализацией.** Сохранить структуру и порядок элементов дерева `docs/architecture/` при включённой декомпозиции. `tests/contract-workflows.test.js` читает дерево из карты путей и сверяет его с README.

### `.asd/rules/review-policy.md`

**Вердикт — сохранить и сократить.** Файл задаёт общий контракт обеих фаз ревью. Он третий по расчётному объёму загрузки: 414 835 байт на 144 вхождения, из них 271 431 байт приходится на контексты агентов.

1. В `Coverage ledger (mandatory — blocks verdict)` описать проверку полноты и исправление формы одной последовательностью. Сохранить проверку всех строк `files`, `rules`, `sections` и сверку идентификаторов с таблицей Findings. Одна попытка исправления формы использует только уже возвращённые данные. Повторная проверка определяет исход: при успехе записать отклонение, при повторном отказе заново вызвать того же ревьюера в той же итерации. Сохранить форматы `vocabulary`, `row_example`, `n_a_shape`, путь `return.md` и параметры команд.
2. В `Clean-context review iteration` заменить повтор общего списка полей ссылкой на `Dispatch payload` в `agent-protocol.md`. Сохранить правила ревью: свежий запуск в каждой итерации с исключением для зафиксированного `APPROVE`, чтение отчётов только текущей итерации, явную передачу разрешённых сведений из прошлых итераций, источник `interrupted`, пустые поля для консультаций и маршрут вопроса через `question:`.
3. В `DoD per review phase` сохранить таблицу состава ревьюеров и убрать повтор её строк в следующем абзаце. Сохранить зачёт `n/a: outside phase gate` при проверке PR, действие зафиксированного `APPROVE` в пределах волны и один зелёный полный прогон тестов за цикл после последней волны. Для условий проверки интерфейса и производительности сослаться на шаг 5 `asd-phase-impl-review.md`. Здесь сохранить само правило: `n/a` относится к разделу проверки, ревьюер по-прежнему запускается.

Сохранить заголовки, литерал вердикта и формы таблиц. Контрактные тесты должны различать исправимый дубликат строки и отсутствие статуса, требующее нового запуска ревьюера. Сравнить байты тех же секционных контекстов и отдельно повторить измерения Codex. Изменения в `providers.md`, описаниях фаз или тестах требуют отдельных утверждений.

**Решение пользователя — утверждены все три предложения по этому файлу.**

### `.asd/rules/core.md`

**Вердикт — сохранить и сократить.** Файл задаёт общие полномочия и правила восстановления сессии. Он четвёртый по расчётному объёму загрузки: 381 990 байт на 35 вхождений.

1. Сократить вводную до назначения ASD, двух поддерживаемых провайдеров и единого канонического источника. Сохранить обе команды в `Entry points`. Правило одного активного спринта, исключение для уже слитого спринта и запрет правок вне спринта оставить в `Invariants`.
2. Убрать из определения `Main orchestrator` перечень работ по фазам, который уже есть в `sprint-lifecycle.md`. Сохранить определение роли, закрытый перечень делегируемых задач, самостоятельное исправление замечаний за пределами разрешённых Dev путей и ответственность за состояние, решения, ручные проверки, выпуск и архивирование.
3. Сократить описания в `See also`. Оставить заголовок и по одной строке на документ с короткой подсказкой, когда к нему обращаться. Тест `G-12` сверяет список файлов с каталогом правил.

Сохранить проверяемые тестами определение `Workflow` и список фаз Standard, заголовки, границы полномочий и доверия, порядок согласований и поля восстановления сессии. Пробная оценка — около 700 байт экономии на полную загрузку файла. Scout получает только раздел `Untrusted-data boundary`; его контекст эти три правки не затрагивают. Сравнить размер UTF-8 и собранных контекстов, запустить `contract-rules` и `contract-workflows`, отдельно повторить замеры Codex. Для этих трёх правок достаточно `core.md`.

**Решение пользователя — утверждены все три предложения по этому файлу.**

### `.asd/rules/agent-protocol.md`

**Вердикт — сохранить и сократить.** Оркестратор получает весь протокол, агенты — отдельные разделы. Файл пятый по расчётному объёму загрузки: 314 977 байт на 61 вхождение.

1. В `Signals` сократить формулировки об отправителях и обработчиках. Сохранить семь сигналов в текущем порядке, канал `question:` ревьюера, точную первую строку `ABORT`, исключения для `FAILED` и особые случаи под таблицей.
2. В `Dispatch payload` изложить обязанности отправителя и получателя короткими инструкциями. Сохранить обязательный `inputs.context`, остановку при ошибке сборки, условные разрешения, команды, имена файлов и границы чтения. В правиле бюджета сохранить сроки, критерий большой волны и обязанность вернуть все строки покрытия. Тест проверяет, что `LARGE_WAVE_FILES` и формула срока `ledger_by` остаются в одном предложении.
3. В `Return` убрать примеры необязательного пояснения и сократить описания полей `resolved`, `flagged`, `memory_index` и `committed`. Сохранить первую строку, блок JSON, схемы ответов, различие между `[]` и `null`, ссылку на решение, правила общей памяти и остановки фоновых процессов.
4. В `Relay` сократить нумерованные шаги и описать общий повторный запуск в одном месте. Сохранить посредничество оркестратора, состав контекста советника, лимит трёх консультаций на задачу, учёт завершённых консультаций и его восстановление, переход к `QUESTION` при обязательном согласовании и запись ответа до продолжения.

Сохранить пять заголовков, порядок ключей JSON, строку с `findings_header` и алгоритм повтора при квоте. Проверить `contract-agents`, `contract-rules`, `contract-templates`, `contract-workflows` и `context-check`. Сравнить байты целого файла и загружаемых разделов, отдельно повторить замеры Codex.

**Решение оркестратора — приняты все четыре предложения по общему поручению пользователя (AC-7).**

### Файлы 6–21

Вердикты советника приняты по AC-7. Цели сокращения относятся к байтам и проверяются по собранным контекстам. Изменения с общими зависимостями учитываются один раз.

| Файл | Вердикт и предлагаемая правка | Сохранить |
|---|---|---|
| `.asd/rules/checkpoints.md` | Сократить повторы между политикой, перечнем согласований и процедурой утверждения. | Оба адресуемых заголовка процедуры, классы и исключения, замороженную политику, стоимость AC и полномочия пользователя. |
| `.asd/rules/git-strategy.md` | Разделить `Commit before review` на обязанности автора, оркестратора и проверки путей. Уплотнить чек-лист PR. | Точные команды, pathspec, trailer, порядок timing commit, проверку SHA и реального слияния. |
| `.asd/rules/code-style.md` | Убрать пояснения, дублирующие правила, и упорядочить условия выбора и удаления тестов в §17. | Номера и имена разделов, доказательства пробела и воспроизведения, формат временных тестов, staged lint. |
| `.asd/rules/language-policy.md` | Оставить языки в матрице. Сократить правила момента перевода и языков элемента выбора. | Исключения для артефактов, перевод цитат, все поля выбора, машинные сигналы, самодостаточную сводку и `accept`. |
| `.asd/rules/providers.md` | Назначать детали восстановления, авторский чек-лист и `Phase table` только по месту потребления. Разделять обращение к родителю и к дочернему разделу. | Восстановление вердиктов в design-review, impl-review и pr, восстановление работы в impl/impl-test, условную выдачу, ссылки и порядок таблицы. |
| `.asd/agents/asd-tester.md` | Убрать повтор правил выбора тестов и повторного входа, использовать уже загруженные §17 и правила фазы. | Режимы base/runner, проверку HEAD, запись времени и результата, требования к доказательствам, отдельные ограничения тестов и памяти. |
| `.asd/workflows/asd-phase-impl-review.md` | Оставить командам и развилкам место в шаге, требованиям к ревьюерам и тестировщикам — в применимых правилах. | Область и волны, условия `n/a`, записи вердиктов, восстановление, единственный полный прогон и разбор красного результата. |
| `.asd/rules/external-review.md` | Свести классификацию исходов в `Outcome contract`, оставить действия в разделах обнаружения и агрегации. | Границу реального запуска, один повтор, перенос непроверенных файлов, отсутствие latch у skip, stdout и read-only. |
| `.asd/workflows/asd-phase-impl.md` | Свести выбор режима, входа и исполнителя в компактную таблицу. Разделить обязанности оркестратора и агента. | Приоритет режимов, волны, Task routing, Test-only, sync, восстановление, сборку и переход в impl-test. |
| `.asd/rules/design-system.md` | Выделить адресуемые инструкции публикации Figma и Claude Design, выдавать их по выбранному формату. | Подтверждение назначения, intent, readback, восстановление, локальный fallback и предотвращение повторной публикации. |
| `.asd/workflows/asd-phase-impl-test.md` | Сократить повтор условий повторного использования доказательств, разбора и восстановления закрытия. | Impacted suite, повторный вход, split, smoke, removal/close-repair gates и правила эскалации. |
| `.asd/workflows/asd-phase-scope.md` | Один раз описать предъявление ретро и запись решений, оставить отдельные ветви источников. | Полномочия до первой записи, репозитории, пагинацию, re-entry и архивирование. |
| `.asd/rules/design-principles.md` | Уплотнить принципы до проверяемых требований и убрать повторяющие их примеры. | Критерии новых слоёв, обратимости и совместимости, наблюдаемость и исследование вариантов. |
| `.asd/project/custom-common-rules.md` | Убрать шаблонное вступление и повтор маршрутизации. | Метаданные владельца, словарь, file-edit и `MSYS_NO_PATHCONV`. Локальная правка требует допустимого для файла этапа. |
| `.asd/agents/asd-external-review.md` | Использовать уже доступные правила о маппинге серьёзности и оболочке запуска. | Ограничения роли, один вызов CLI, таймаут, передачу stdin, вывод и skip/interrupted. |
| `.asd/project/custom-coding-rules.md` | Уплотнить правила именованных путей и синхронизации канона. | Zero-dependency, fail-closed, точный repo, проверки контекста и отдельное утверждение изменения порога. Локальная правка требует допустимого для файла этапа. |

### Файлы 22–46

Вердикты советника приняты по AC-7. Для фазовых навыков сокращается только описание обнаружения. Тело, права, имена и триггеры сохраняются. Пробная суммарная оценка по 12 описаниям — 5 752 байта исходного текста.

| Файл | Вердикт и предлагаемая правка |
|---|---|
| `.asd/workflows/asd-phase-design-review.md` | Сократить повтор о свежем запуске и отсутствии payload при latch. Сохранить ветки восстановления и область итерации. |
| `.asd/workflows/asd-phase-retro.md` | Свести анализ причины в одно место. Сохранить трассировку по F-N, пустой журнал, дедупликацию и условия публикации. |
| `.asd/workflows/asd-phase-audit.md` | Кратко сослаться из шага 3 на эскалацию 3c. Сохранить доказательства, запись ответа и отдельный маршрут сбоя проверки. |
| `.asd/workflows/asd-phase-pr.md` | В ветке MERGED сослаться на уже существующий режим слияния. Сохранить lookup до записи, номер PR, ветку OPEN и закрытие issues. |
| `.asd/agents/asd-reviewer-quality.md` | Заменить повтор формата ссылкой на Outputs и шаблон. Сохранить поля, дословный отчёт, заголовки и фазовые метки. |
| `.asd/workflows/asd-phase-plan.md` | Сократить первые три шага и ссылку на QODDA и incremental writing. Сохранить порядок, синтаксис задач, сборку и приёмку. |
| `.asd/agents/asd-reviewer-combined.md` | Объединить правила о `manifest.n_a` и причине пропуска. Сохранить предикаты, рубрику и оба токена вердикта. |
| `.asd/workflows/asd-phase-cleanup.md` | Сохранить. Шаги обосновывают restore, путь коммита, проверку отката и запись результата. |
| `.asd/workflows/asd-phase-design.md` | Убрать пересказ порядка, сохранённого в шагах 6–10. Разделить авторинг макетов и UX-spec в AC-1. |
| `.asd/agents/asd-reviewer-efficiency.md` | Описать категории серьёзности один раз. Сохранить литералы, начальную позицию категории и пять perf-разделов. |
| `.asd/workflows/asd-phase-design-promote.md` | Объединить инструкции публикации и копирования макетов под AC-1. Сохранить ссылки, fallback, повтор опубликования и skip. |
| `.asd/rules/ux-principles.md` | Один раз задать порядок «состояние → причина → последствие → действие», убрать повторяющие его примеры. |
| `.asd/project/custom-design-rules.md` | Сохранить. Короткая запись защищает владение и область действия пользовательских правил. |
| `.asd/skills/asd-phase-impl-review/SKILL.md` | Сократить описание до ревью кода и тестов активного спринта. |
| `.asd/skills/asd-phase-retro/SKILL.md` | Сократить описание до ретроспективы по журналу и ходу спринта. |
| `.asd/skills/asd-phase-scope/SKILL.md` | Сократить описание до объёма, исследования и критериев приёмки. |
| `.asd/skills/asd-phase-impl/SKILL.md` | Сократить описание до задач плана и исправлений после ревью или тестов. |
| `.asd/skills/asd-phase-impl-test/SKILL.md` | Сократить описание до запуска и написания затронутых тестов. |
| `.asd/skills/asd-phase-cleanup/SKILL.md` | Сократить описание до удаления подтверждённых остатков спринта. |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | Сократить описание до переноса результатов спринта в постоянные документы. |
| `.asd/skills/asd-phase-plan/SKILL.md` | Сократить описание до плана с привязкой задач к AC. |
| `.asd/skills/asd-phase-pr/SKILL.md` | Сократить описание до открытия и слияния PR спринта. |
| `.asd/skills/asd-phase-audit/SKILL.md` | Сократить описание до аудита затронутого кода и документации. |
| `.asd/skills/asd-phase-design-review/SKILL.md` | Сократить описание до ревью черновиков Standard. Сохранить проверяемое тестом имя `asd-reviewer-combined` и опциональный External Review. |
| `.asd/skills/asd-phase-design/SKILL.md` | Сократить описание до проектных черновиков Standard. |

### Файлы вне карты загрузки

Советник проверил 2 258 уникальных путей с нулём в [карте контекста](./context-priority.csv). Вердикты приняты по AC-7. Правило каждой строки применяется к каждому пути группы, поименованные ниже исключения имеют приоритет. Ноль означает отсутствие измерения в этой карте. Условное чтение, запуск и рендер учитываются отдельно.

| Пути | Число | Вердикт и назначение |
|---|---:|---|
| `.asd/sprints/archived/**` | 1 994 | Сохранить. История 39 закрытых спринтов. Состояния используются для обнаружения незакрытых спринтов прежних версий, записи и файлы ревью — для адресной проверки истории. |
| Сгенерированные навыки, агенты и хуки в деревьях провайдеров | 73 | Сохранить, синхронизировать из канона при изменении. У каждого проверен маркер владения и источник. |
| `.claude/settings.json`, `.codex/hooks.json` | 2 | Сохранить. Хост читает регистрацию хуков из области структурного слияния, остальные поля принадлежат владельцу. |
| `.claude/agent-memory/**` | 69 | Сохранить 64 самостоятельные заметки и пять индексов, с исключением на сокращение индекса Combined ниже. Все ссылки проверены. |
| Остальные канонические агенты | 3 | Сохранить определения Advisor, Dev и Scout. По AC-1 проверить инструкцию Dev о получении самостоятельного макета. |
| Канонический хук запуска | 1 | Сохранить. Модель получает его вывод `summary()`, исходник исполняется в Node. |
| Версионные миграции | 7 | Сохранить. Потребитель может пройти через каждую версию из старой установки. |
| Прочие файлы `.asd/project/` | 6 | Сохранить команды, настройки, потолки, журнал истории, очередь ретро и реестр заглушек. |
| `.asd/{release-manifest.json,runtime.js,sync-state.json,sync.js}` | 4 | Сохранить. Контракты выпуска, владения, генерации и валидации. Изменения AC-2/6 проверяются отдельно. |
| Остальные канонические навыки и `update.js` | 8 | Сохранить точки входа и восемь файлов, кроме предложений по сокращению инструкций ниже. |
| Уже отслеживаемые файлы текущего спринта | 5 | Сохранить документы решений, исследования, объёма, состояния и временных событий для восстановления. |
| `.asd/templates/**` | 40 | Сохранить шаблоны выходных форматов, с исключениями ниже. |
| `.asd/workflows/{lite,standard}.json` | 2 | Сохранить как источник переходов и правил отката. |
| Конфигурация agnix, Git и CI | 4 | Сохранить. Их потребители — инструменты проверки и сборки. |
| Корневые AGENTS, CLAUDE, README, CHANGELOG и LICENSE | 5 | Сохранить. Сократить авторский хвост AGENTS по предложению ниже. README синхронизировать по AC-1/2. |
| Справочники инструментов | 9 | Сохранить для адресной проверки инструментов. |
| `tests/**` | 26 | Сохранить тесты, фикстуры и инфраструктуру. Согласовать утверждения с изменившимися AC. |

**Поимённые сокращения.**

- `.claude/agent-memory/asd-reviewer-combined/MEMORY.md` — владелец оставляет все 44 ссылки и короткие подсказки, методы остаются в заметках. Верхняя граница по пробной упаковке — 5 191 байт за загрузку, фактическая экономия ниже.
- `AGENTS.md` и `.asd/templates/t_AGENTS.md` — сократить дублирующую справку в авторском хвосте и шаблоне соответственно. Сохранить обязательное чтение правил, уникальные исключения self-hosting, команды и проверку зеркал. Сгенерированный блок обновляет sync.
- `.asd/skills/asd-sprint/SKILL.md` — снять проверку на входе по AC-2 и заменить пересказ цепочки проверкой `NEXT` по замороженному определению. Сохранить терминальные исходы, проверки перехода и ошибки.
- `.asd/skills/asd-update/SKILL.md` — проверить установленную конфигурацию после реального обновления и предложить значения недостающих ключей по AC-2. Сохранить preview, version check, partial-update и владение настройками.
- `.asd/skills/asd-init/SKILL.md` — свести правила предложения значений и проверки к одному месту, сохранив обработку старых значений в AC-1.
- `.asd/templates/t_ux-spec.html` — сохранить UX-сценарии и состояния, оформить самостоятельные макеты только ссылками. В `.asd/templates/t_html-shell.html` убрать только селекторы без потребителей после AC-1. В `.asd/templates/t_config.yaml` сохранить источник схемы и обновить перечисление форматов.
