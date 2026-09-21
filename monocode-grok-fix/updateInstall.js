export const READONLY_INSTALL_HELP =
  "MonoCode is running from a read-only copy (a disk image, Downloads quarantine, or App Translocation). The updater cannot replace that file.\n\n1. Quit MonoCode\n2. Drag MonoCode.app into the Applications folder\n3. Eject the disk image if it is still mounted\n4. Open MonoCode from Applications, then update again.";

export function installLocationKind(path) {
  const normalized = String(path ?? "").replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("/apptranslocation/")) return "translocated";
  if (/(^|\/)volumes\//.test(normalized)) return "volumes";
  if (normalized.includes("/downloads/")) return "downloads";
  if (normalized.includes("/applications/")) return "applications";
  return "other";
}

export function isReadOnlyInstallLocation(path) {
  const kind = installLocationKind(path);
  return kind === "volumes" || kind === "translocated";
}

export function isReadOnlyInstallError(error) {
  const text = error instanceof Error ? error.message : String(error ?? "");
  return /read-only file system|os error 30|erofs|readonly filesystem/i.test(
    text,
  );
}

export function explainUpdateInstallError(error, installPath) {
  if (
    (installPath && isReadOnlyInstallLocation(installPath)) ||
    isReadOnlyInstallError(error)
  ) {
    return READONLY_INSTALL_HELP;
  }
  return error instanceof Error ? error.message : String(error);
}
