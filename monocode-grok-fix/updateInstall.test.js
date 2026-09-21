import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  READONLY_INSTALL_HELP,
  explainUpdateInstallError,
  installLocationKind,
  isReadOnlyInstallError,
  isReadOnlyInstallLocation,
} from "./updateInstall.js";

describe("update install location", () => {
  it("treats disk images and App Translocation as read-only", () => {
    assert.equal(
      installLocationKind("/Volumes/MonoCode/MonoCode.app"),
      "volumes",
    );
    assert.equal(
      installLocationKind(
        "/private/var/folders/xx/AppTranslocation/A/d/MonoCode.app",
      ),
      "translocated",
    );
    assert.equal(
      isReadOnlyInstallLocation("/Volumes/MonoCode/MonoCode.app/Contents"),
      true,
    );
    assert.equal(
      isReadOnlyInstallLocation("/Applications/MonoCode.app/Contents/Resources"),
      false,
    );
  });

  it("rewrites os error 30 into a move-to-Applications message", () => {
    assert.equal(
      isReadOnlyInstallError(new Error("Read-only file system (os error 30)")),
      true,
    );
    assert.equal(
      explainUpdateInstallError("Read-only file system (os error 30)"),
      READONLY_INSTALL_HELP,
    );
    assert.equal(explainUpdateInstallError("network failed"), "network failed");
  });
});
