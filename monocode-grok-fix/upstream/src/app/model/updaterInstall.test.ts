import { describe, expect, it } from "vitest";
import {
  READONLY_INSTALL_HELP,
  explainUpdateInstallError,
  installLocationKind,
  isReadOnlyInstallError,
  isReadOnlyInstallLocation,
} from "./updaterInstall";

describe("updater install location", () => {
  it("treats disk images and App Translocation as read-only", () => {
    expect(installLocationKind("/Volumes/MonoCode/MonoCode.app")).toBe(
      "volumes",
    );
    expect(
      installLocationKind(
        "/private/var/folders/xx/AppTranslocation/A/d/MonoCode.app",
      ),
    ).toBe("translocated");
    expect(
      isReadOnlyInstallLocation("/Volumes/MonoCode/MonoCode.app/Contents"),
    ).toBe(true);
    expect(
      isReadOnlyInstallLocation(
        "/private/var/folders/xx/AppTranslocation/A/d/MonoCode.app",
      ),
    ).toBe(true);
    expect(
      isReadOnlyInstallLocation("/Applications/MonoCode.app/Contents/Resources"),
    ).toBe(false);
  });

  it("rewrites os error 30 into a move-to-Applications message", () => {
    expect(isReadOnlyInstallError(new Error("Read-only file system (os error 30)"))).toBe(
      true,
    );
    expect(
      explainUpdateInstallError("Read-only file system (os error 30)"),
    ).toBe(READONLY_INSTALL_HELP);
    expect(
      explainUpdateInstallError("install failed", "/Volumes/MonoCode/MonoCode.app"),
    ).toBe(READONLY_INSTALL_HELP);
    expect(explainUpdateInstallError("network failed")).toBe("network failed");
  });
});
