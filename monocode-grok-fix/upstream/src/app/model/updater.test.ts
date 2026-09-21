import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  announce: vi.fn(),
  check: vi.fn(),
  downloadAndInstall: vi.fn(),
  getVersion: vi.fn(),
  message: vi.fn(),
  relaunch: vi.fn(),
  remember: vi.fn(),
  resourceDir: vi.fn(),
}));

vi.mock("@tauri-apps/api/app", () => ({ getVersion: mocks.getVersion }));
vi.mock("@tauri-apps/api/path", () => ({ resourceDir: mocks.resourceDir }));
vi.mock("@tauri-apps/plugin-dialog", () => ({
  ask: vi.fn(),
  message: mocks.message,
}));
vi.mock("@tauri-apps/plugin-process", () => ({ relaunch: mocks.relaunch }));
vi.mock("@tauri-apps/plugin-updater", () => ({ check: mocks.check }));
vi.mock("../../features/settings/model/sounds", () => ({ announceUpdateAvailable: mocks.announce }));
vi.mock("./updateNotice", () => ({ rememberInstalledUpdate: mocks.remember }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  mocks.getVersion.mockResolvedValue("0.1.22");
  mocks.relaunch.mockResolvedValue(undefined);
  mocks.message.mockResolvedValue(undefined);
  mocks.resourceDir.mockResolvedValue("/Applications/MonoCode.app/Contents/Resources");
});

async function updaterWithPendingUpdate() {
  const update = {
    version: "0.1.23",
    downloadAndInstall: mocks.downloadAndInstall,
  };
  mocks.check.mockResolvedValue(update);
  const updater = await import("./updater");
  await updater.probeForUpdate();
  return updater;
}

describe("installPendingUpdate", () => {
  it("records a successful installation before relaunching", async () => {
    mocks.downloadAndInstall.mockResolvedValue(undefined);
    const updater = await updaterWithPendingUpdate();

    await updater.installPendingUpdate();

    expect(mocks.remember).toHaveBeenCalledWith("0.1.23");
    expect(mocks.relaunch).toHaveBeenCalledOnce();
    expect(mocks.remember.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.relaunch.mock.invocationCallOrder[0]!,
    );
  });

  it("does not record or relaunch after installation fails", async () => {
    mocks.downloadAndInstall.mockRejectedValue(new Error("install failed"));
    const updater = await updaterWithPendingUpdate();

    const result = await updater.installPendingUpdate();

    expect(result.phase).toBe("error");
    expect(mocks.remember).not.toHaveBeenCalled();
    expect(mocks.relaunch).not.toHaveBeenCalled();
  });

  it("refuses to install from a disk image before downloading", async () => {
    mocks.resourceDir.mockResolvedValue("/Volumes/MonoCode/MonoCode.app/Contents/Resources");
    const updater = await updaterWithPendingUpdate();

    const result = await updater.installPendingUpdate();

    expect(result.phase).toBe("error");
    expect(result.error).toMatch(/Applications folder/);
    expect(mocks.downloadAndInstall).not.toHaveBeenCalled();
    expect(mocks.message).toHaveBeenCalledWith(
      expect.stringContaining("Applications folder"),
      { title: "MonoCode" },
    );
  });

  it("rewrites os error 30 when the install location was not detected first", async () => {
    mocks.resourceDir.mockRejectedValue(new Error("no path"));
    mocks.downloadAndInstall.mockRejectedValue(
      new Error("Read-only file system (os error 30)"),
    );
    const updater = await updaterWithPendingUpdate();

    const result = await updater.installPendingUpdate();

    expect(result.phase).toBe("error");
    expect(result.error).toMatch(/Applications folder/);
    expect(mocks.remember).not.toHaveBeenCalled();
  });

  it("does not record when no update is pending", async () => {
    const updater = await import("./updater");

    expect((await updater.installPendingUpdate()).phase).toBe("idle");
    expect(mocks.remember).not.toHaveBeenCalled();
    expect(mocks.relaunch).not.toHaveBeenCalled();
  });
});
