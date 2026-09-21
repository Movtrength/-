---
name: jev-pipeline
description: Author and validate a JevHarness PipelineSpec and task callback. Use after the jev-harness task contract is known, when writing the first decision graph, observation adapter, Jev questions, or evaluator. Use before any evolution search.
---

# Build the first Jev pipeline

Read `skills/jev-harness/references/integration.md` in this plugin before writing a pipeline or adapter. Inspect the checkout's current `auto_jev` signatures. The snippets there are the API, not a ready-made task.

## Keep the boundary fixed

Task evaluation and authoritative environment interaction stay outside the candidate. The candidate may construct features and state, generate Jev instructions and criteria, combine answers, choose thresholds and actions, and update memory within the fixed task contract. It cannot rewrite reward, labels, hidden state, action permissions, or the evaluator to win the benchmark. If the task requires Jev in production, enforce that as a candidate constraint before evaluation and freezing. A prompt instruction alone is not enforcement.

## Shape the graph

Use a v3 `PipelineSpec` for functional Python and dynamic questions. Use restricted expression nodes when they suffice. Construct a real dependency DAG: independent judgments may run in parallel; dependent decisions wait for the required outputs. Python nodes require explicit `depends_on`, and their `run(obs, nodes, memory)` can see only those dependencies. Jev's `state` and `questions_expression` are restricted expressions. Use a Python node to prepare more complex dynamic question dictionaries.

Write task-specific instructions and criteria from the agreed outcomes and examples. The user need not supply them. Define choice criteria as meaningful option descriptions, score criteria as ordered descriptions, and noul as a probability of a clear proposition. Avoid treating any returned confidence as a validated likelihood of task success without checking calibration.

A spec requires `version`, `name`, `jev_model`, `nodes`, and `output`. `memory_update` is optional. Version 1 is sequential. Versions 2 and 3 start a node when its own dependencies finish. The current limit is 64 nodes.

| Kind | Field | Dependencies |
| --- | --- | --- |
| `expression` | `expression` | Inferred from literal `nodes['id']` plus optional `depends_on` |
| `jev` | `questions` or `questions_expression`, exactly one | Inferred from `state` and `questions_expression`, plus optional `depends_on` |
| `python` | `source` with `def run(obs, nodes, memory)` | Explicit `depends_on` only. v3 only |

Expression fields stay in the restricted language: literals, conditionals, arithmetic, indexing, and supported functions. Python nodes have no file, network, process, or import access. Check current sandbox support. Never replace an unavailable sandbox with host `exec`. Functional Python currently requires native macOS `sandbox-exec` and fails closed elsewhere. Version 2 expression and Jev flows do not launch those workers.

## Check it before scaling

Run `validate_spec`, compile the graph with `compile_flow`, and verify observation, output, and legal-action contracts before a live inference. Make an authorized, minimal real inference test to validate the selected transport and actual response schema. Mock tests establish plumbing only. Compare the initial pipeline with an appropriate simple or existing baseline and inspect complete decision traces before scaling.

The extension point is an ordinary importable Python callable passed as `evaluator`, not a `TaskAdapter` class. Keep reference labels out of the observation. For a generic run, pass `task_id`, `evaluator`, and `costs={}` explicitly so the default crypto path is not used. Preserve provider failures as infrastructure failures with partial traces. Never fabricate a Jev answer.
