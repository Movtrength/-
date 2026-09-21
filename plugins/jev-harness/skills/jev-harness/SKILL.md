---
name: jev-harness
description: Build, evaluate, and optionally evolve task-specific code and Jev decision pipelines with JevHarness. Use when a user wants a reusable Jev agent, a new task adapter, a PipelineSpec, or trajectory-and-reward optimization; begin by clarifying the task and evaluation contract. Not for ordinary coding without a Jev workflow.
---

# JevHarness

Turn the user's intended outcome into a runnable, measurable decision workflow: ordinary code prepares observations and enforces actions; Jev supplies structured judgments; an optional reflection model proposes improved pipelines offline. This is task-level pipeline optimization, not model-weight training. The deployed pipeline can retain Jev while removing the reflection model.

This skill owns the task contract and the stage order. After the contract is stated, read the stage skill that matches the work:

| Stage | Skill | When |
| --- | --- | --- |
| First pipeline and adapter | `jev-pipeline` | Contract is known and a runnable graph is still needed |
| Trajectory-and-reward search | `jev-evolution` | The user asked for evolution and a defensible evaluator exists |
| Freeze and hand-over | `jev-freeze` | A candidate is selected on validation and should be bound for reuse |

API contracts live in [references/integration.md](references/integration.md). Search and evidence rules live in [references/evaluation.md](references/evaluation.md). Cursor install and discovery live in [references/installation.md](references/installation.md).

## Establish the task before building

Read the user's request and existing authorized project material first. Reuse answers already given. Ask focused questions about missing information that would change the implementation or evaluation. Do not start a new task's implementation, generate its questions/criteria, access credentials, or run a paid experiment until enough of the following contract is known. Read-only inspection that helps identify those gaps can proceed.

- **Outcome and scope:** What should improve, for whom, and what counts as success? Is this one decision per input or a multi-step episode? What is outside scope?
- **Inputs and outputs:** Obtain representative input, desired output/action, available fields, legal actions, and failure behavior. Ask for a concrete example when a verbal goal leaves the semantics ambiguous.
- **Evidence:** Which examples, logs, labels, simulator, or real outcome signals exist? How may they be accessed and sent to providers? Which information is available at decision time?
- **Evaluation:** Who or what can score a result, on what timescale, and with what uncertainty? Fix reward direction, hard constraints, and any trade-off rule. The user may describe outcomes rather than supply a formal evaluator.
- **Environment and permissions:** Where will code run, which tools or external systems may it use, and which actions may actually be executed? Separate simulated actions, read-only integrations, and production writes.
- **Experiment resources:** Clarify a stopping condition and relevant limits: rounds, evaluations, money, time, latency, or concurrency. Keep Jev inference usage separate from reflection usage. An absent limit is unknown, not permission for indefinite spending; preserve an explicit authorization for unrestricted Jev calls within the agreed experiment.
- **Data separation:** Establish training/search feedback, validation for selection, and any final held-out test. Choose random, group, temporal, or environment splits based on the task's leakage risks, not a universal ratio.
- **Models and delivery:** Confirm the Jev transport and credential variable, optional reflector and model, deployment target, runtime latency needs, and whether Jev must remain in the final pipeline.

Adapt the conversation to what is missing; there is no required questionnaire length or number of rounds. Bundle related uncertainties, explain the decision each answer enables, and do not repeat settled questions. If the user delegates routine choices, make reasonable proposals and record the assumptions. If they cannot define a score, help operationalize the outcome using examples; do not require them to author prompts or criteria. A request to design only remains a design task.

Before implementation, state a concise task contract with the known inputs, output, objective, evaluator, permitted actions, data split, runtime, and experiment scope. This is a shared understanding, not an extra approval gate when the work is already authorized. An unresolved evaluator or permission can block the dependent experiment while useful contract or adapter work proceeds.

## Locate the actual integration

Read [references/integration.md](references/integration.md) before writing a pipeline or adapter. Locate the JevHarness checkout from the workspace or a user-supplied path. This Cursor plugin is instructions only. It does not contain `auto_jev/` or `pyproject.toml`.

Verify `auto_jev` imports from the intended checkout and inspect its current signatures. Reuse an existing writable checkout for implementation, or obtain one in the authorized task workspace from `https://github.com/TianyuCodings/JevHarness.git` when needed. Keep dependencies, generated adapters, and experiment artifacts in the task workspace. Resolve missing repository access or runtime credentials before the dependent work.

The repository currently exposes a reusable Python runtime and an evaluator callback for GEPA. Its existing command-line runners are domain examples. Do not invent a universal task CLI or a built-in `TaskAdapter` class. Implement the new domain adapter and a small task runner using the real APIs when needed. Do not silently inherit cryptocurrency objectives, fees, datasets, Pokémon rules, pilot counts, or example model choices.

Follow the `jev-candidate-boundary` and `jev-provider-boundary` rules for the whole task.
