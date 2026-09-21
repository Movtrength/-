---
name: jev-harness
description: Clarify a JevHarness task contract, then build the first code-and-Jev pipeline without paid inference until that contract allows it.
---

Use the `jev-harness` skill, then the `jev-pipeline` skill when implementation is authorized.

1. Read the user text after this command and any existing project material.
2. Fill only the contract gaps that would change the implementation or the evaluation.
3. State the task contract: inputs, output, objective, evaluator, permitted actions, data split, runtime, and experiment scope.
4. Locate a writable JevHarness checkout before importing `auto_jev`. This plugin does not contain the runtime.
5. When the contract is sufficient, author and validate the first pipeline. Keep reward, labels, and side effects outside the candidate.
6. Leave evolution and held-out testing for `/jev-evolve` and `/jev-freeze`.
