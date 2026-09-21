---
name: jev-freeze
description: Freeze a selected JevHarness pipeline and hand over the runnable artifact. Use after validation selection, and before any held-out test. Use when binding a spec, runtime, and task contract for reuse or deployment.
---

# Freeze and hand over

Read `skills/jev-harness/references/integration.md` for `freeze_run`, `build_task_contract`, `evaluate_frozen`, and `validate_artifact`. Select by the agreed validation rule, freeze the specification plus runtime and task resources, and only then run a held-out test if one exists. For comparisons, freeze every compared policy before revealing the shared test. Once inspected, that test is no longer fresh evidence for further tuning.

`freeze_run` requires a completed run and full successful validation coverage for the selected candidate. Frozen artifacts bind the spec, runtime source, data identities, provider metadata, and the supplied task contract. They record paths and executable identities and are not automatically portable to another machine. Python isolation is platform-specific. Evaluate and freeze in the intended environment, or implement and validate an explicit migration. Never bypass identity checks. A gateway model alias does not pin underlying weights. Distinguish live inference from exact recorded-response replay.

A frozen configuration does not eliminate Jev calls. Production consists of the fixed observation adapter, permitted code, Jev judgments where retained, action validation, and memory policy. Reflection and fresh pipeline generation stay out of the request path. If all Jev nodes are removed, identify the result as code-only and check that this satisfies the user's goal.

## Deliver

Deliver the task contract, runnable adapter and runner, validated specification, relevant checks, baseline and search evidence, frozen artifact, and the exact run or deployment instructions for this task. Report no improvement, missing evaluation evidence, or a failed experiment plainly. Do not promise success on arbitrary tasks or competitive performance from a small pilot.

If a test result motivates another design change, move that result into known development evidence and obtain new independent evidence for a new generalization claim.
