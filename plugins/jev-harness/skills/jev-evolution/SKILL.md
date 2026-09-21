---
name: jev-evolution
description: Run optional JevHarness GEPA reflection on complete trajectories and rewards. Use only when the user asked to evolve or optimize a harness and a defensible evaluator, data split, and spend limit are already fixed. Read evaluation rules before search.
---

# Trajectory-and-reward evolution

Use evolution only when the user requested it or agreed to it inside the task contract. Read `skills/jev-harness/references/evaluation.md` before running search. Read `skills/jev-harness/references/integration.md` for `run_evolution`, `make_proposer`, and trace storage. Establish the objective and allowed mutation surface once and keep them fixed for a comparable run.

If there is no reliable label, simulator, or measurable outcome, stay with an unvalidated prototype and an evaluation plan. Do not fabricate an evaluator, use Jev's own confidence as the reward, or claim objective optimization from a few self-judged examples.

## What reflection receives

Use the actual GEPA instance frontier, not a made-up global Pareto chart. Different candidates may lead on different validation instances. Reflection receives complete trajectories and rewards for every selected training episode, including observations, actions, exact Jev states, questions, responses, code outputs, memory, errors, and node timing. A selected mini-batch may be smaller than the training set. No selected episode may be silently truncated or summarized as if it were complete.

Preserve full archived inputs, transmitted prompt bytes and hashes, and candidate ancestry. Lossless encoding is acceptable when it is reconstructable and verified. If the full input exceeds the configured context limit, archive it and stop before dispatch. Choose an explicitly revised batch or context policy without disguising the change. Keep held-out results out of prompts, code generation, candidate selection, and stopping decisions.

## How to run and report

`reflection_batch_size` counts episodes. Omitted, it means the full training set. `evolution_rounds` counts completed reflection proposals. `max_metric_calls` is a different stop. Omitting both currently defaults to 24 metric calls, so pass the agreed stop explicitly. Train and validation lists must be nonempty and use unique ids across both.

Report rounds completed and accepted, actual evaluations, Jev calls and cache hits, reflection model confirmation, wall time, and observed costs. Distinguish missing price data from zero cost. Keep infrastructure failures distinct from candidate failures and preserve partial traces. Resume only against compatible recorded contracts. Do not change a frozen policy or silently start a different experiment in order to resume.

If no candidate improves the agreed validation objective, retaining the initial pipeline is a valid result. Stop at the agreed budget. Do not extend search or loosen the evaluator to manufacture improvement.
