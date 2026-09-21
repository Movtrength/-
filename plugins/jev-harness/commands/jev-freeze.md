---
name: jev-freeze
description: Freeze the selected JevHarness policy and hand over the artifact before any held-out test.
---

Use the `jev-freeze` skill and the freeze section of `skills/jev-harness/references/integration.md`.

1. Select with the agreed validation rule.
2. Freeze the spec, runtime, and task resources in the environment where it will run.
3. Run a held-out test only after every compared policy is frozen.
4. Hand over the contract, adapter, validated spec, evidence, frozen artifact, and the exact rerun steps.
5. State whether production still calls Jev. A frozen artifact does not remove those calls by itself.
