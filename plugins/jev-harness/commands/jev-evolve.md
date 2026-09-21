---
name: jev-evolve
description: Run optional JevHarness reflection search on complete trajectories after the objective, split, and spend limit are fixed.
---

Use the `jev-evolution` skill. Read `skills/jev-harness/references/evaluation.md` and `skills/jev-harness/references/integration.md` first.

1. Confirm the user asked for evolution and that a defensible evaluator already exists.
2. Restate the fixed objective, mutation surface, train/validation split, and stop condition. Keep held-out data out of this run.
3. Reflect on complete selected episodes. Archive an oversized input and stop before dispatch rather than truncating it.
4. Report rounds, evaluations, Jev calls, cache hits, the reflection model, wall time, and observed cost. Keep infrastructure failures separate from candidate failures.
5. If nothing improves the validation objective, keep the initial pipeline and say so.
