---
name: monocode-grok-start
description: Fix MonoCode "Grok Build did not start. Invalid params" and "No repo". Use when Grok Build fails to start, session/new returns -32602, cwd is "~", or the user mentions MonoCode plus Grok.
---

# MonoCode Grok Build start failure

The UI line `Grok Build did not start. Invalid params` is MonoCode wrapping Grok ACP JSON-RPC `-32602`.

## What to do first

1. Open a real project folder in MonoCode. Do not send from `~`.
2. Pick **Grok 4.6** (`grok-4.6`), not the product slug **Grok Build** (`grok-build`).
3. Confirm `grok login` (or `XAI_API_KEY`).

`No repo` in the composer means the folder is not a git checkout **or** cwd is still the empty-project sentinel `~`. Home is not a project.

## Why it fails

- Grok `session/new` requires an **absolute** `cwd`. MonoCode's empty project is `"~"`.
- `grok-build` is the CLI product name. Live ACP ids are `grok-4.6` / `grok-4.5`.

## Code

Resolution helpers and the upstream patch live in `monocode-grok-fix/`.
Do not invent a second mapping. Reuse `resolveGrokWorkspaceCwd` and `resolveGrokAcpModelId`.
