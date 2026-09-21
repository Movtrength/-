---
name: monocode-grok-start
description: Fix MonoCode Grok Build Invalid params, No repo, and updater Read-only file system os error 30. Use when MonoCode cannot start Grok or cannot install an update.
---

# MonoCode start and update failures

## Grok Build did not start. Invalid params

1. Open a real project folder. Do not send from `~`.
2. Pick **Grok 4.6**, not the product slug **Grok Build**.
3. Confirm `grok login`.

`No repo` means cwd is still `~` or the folder is not git. Grok `session/new` requires an absolute cwd.

## Couldn't install the update. Read-only file system (os error 30)

The app is running from a DMG or App Translocation. The updater cannot replace that copy.

1. Quit MonoCode
2. Drag MonoCode.app into Applications
3. Eject the disk image
4. Open it from Applications
5. If it still fails: `xattr -cr /Applications/MonoCode.app`

## Code

Helpers and upstream patches live in `monocode-grok-fix/`.
Reuse `resolveGrokWorkspaceCwd`, `resolveGrokAcpModelId`, and `explainUpdateInstallError`.
